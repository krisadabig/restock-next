import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, authenticators } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signSession } from '@/lib/server/session';
import {
	generateRegistrationOptions,
	verifyRegistrationResponse,
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const rpName = process.env.PASSKEY_RP_NAME || 'Restock app';
const rpID = process.env.PASSKEY_RP_ID || 'localhost';
const origin = process.env.PASSKEY_ORIGIN || `http://${rpID}:3000`;

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const type = searchParams.get('type');
	const username = searchParams.get('username');

	if (type === 'register') {
		if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

		// --- REGISTRATION LOGIC ---
		const existingUsers = await db.select().from(users).where(eq(users.username, username));
		if (existingUsers.length > 0) {
			const existingUser = existingUsers[0];

			// Allow claiming if abandoned (no authenticators)
			const userAuths = await db.select().from(authenticators).where(eq(authenticators.userId, existingUser.id));

			if (userAuths.length > 0) {
				return NextResponse.json({ error: 'Username taken' }, { status: 400 });
			}

			// Abandoned account -> Reuse it!
			const options = await generateRegistrationOptions({
				rpName,
				rpID,
				userID: new TextEncoder().encode(existingUser.id),
				userName: existingUser.username,
				attestationType: 'none',
				authenticatorSelection: {
					residentKey: 'preferred',
					userVerification: 'preferred',
					authenticatorAttachment: 'platform',
				},
			});

			const response = NextResponse.json(options);
			response.cookies.set('challenge', options.challenge, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 300, // 5 minutes
			});

			return response;
		}

		// Create New User
		const newUser = await db
			.insert(users)
			.values({
				id: crypto.randomUUID(),
				username,
			})
			.returning();
		const user = newUser[0];

		const options = await generateRegistrationOptions({
			rpName,
			rpID,
			userID: new TextEncoder().encode(user.id),
			userName: user.username,
			attestationType: 'none',
			authenticatorSelection: {
				residentKey: 'preferred',
				userVerification: 'preferred',
				authenticatorAttachment: 'platform',
			},
		});

		const response = NextResponse.json(options);
		response.cookies.set('challenge', options.challenge, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 300,
		});

		return response;
	} else if (type === 'login') {
		// --- LOGIN LOGIC ---
		if (username) {
			const usersFound = await db.select().from(users).where(eq(users.username, username));
			if (usersFound.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const options = await generateAuthenticationOptions({
			rpID,
			userVerification: 'preferred',
		});

		const response = NextResponse.json(options);
		response.cookies.set('challenge', options.challenge, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 300,
		});

		return response;
	}

	return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	const { type, username } = body;
	const cookies = request.cookies;

	const expectedChallenge = cookies.get('challenge')?.value;
	if (!expectedChallenge) return NextResponse.json({ error: 'Challenge expired or missing' }, { status: 400 });

	if (type === 'register') {
		// --- REGISTRATION VERIFICATION ---
		const { registrationResponse } = body;

		const existingUsers = await db.select().from(users).where(eq(users.username, username));
		const user = existingUsers[0];

		if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

		let verification;
		try {
			verification = await verifyRegistrationResponse({
				response: registrationResponse,
				expectedChallenge,
				expectedOrigin: origin,
				expectedRPID: rpID,
			});
		} catch (error) {
			console.error(error);
			return NextResponse.json({ error: (error as Error).message }, { status: 400 });
		}

		const { verified, registrationInfo } = verification;

		if (verified && registrationInfo) {
			const { credential } = registrationInfo;
			await db.insert(authenticators).values({
				userId: user.id,
				credentialID: credential.id,
				credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
				counter: credential.counter,
				transports: credential.transports ? JSON.stringify(credential.transports) : null,
			});

			const token = signSession({ id: user.id, username });

			const response = NextResponse.json({ verified: true });
			response.cookies.delete('challenge');
			response.cookies.set('session', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7,
			});

			return response;
		}
		return NextResponse.json({ verified: false }, { status: 400 });
	} else if (type === 'login') {
		// --- LOGIN VERIFICATION ---
		const { authenticationResponse } = body;

		// 1. Find authenticator
		const auths = await db
			.select()
			.from(authenticators)
			.where(eq(authenticators.credentialID, authenticationResponse.id));
		const authenticator = auths[0];

		if (!authenticator) return NextResponse.json({ error: 'Device not found' }, { status: 400 });

		// 2. Find user
		const userId = authenticator.userId;
		const existingUsers = await db.select().from(users).where(eq(users.id, userId));
		const user = existingUsers[0];

		if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

		const device = {
			id: authenticator.credentialID,
			publicKey: Buffer.from(authenticator.credentialPublicKey, 'base64'),
			counter: authenticator.counter,
			transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined,
		};

		let verification;
		try {
			verification = await verifyAuthenticationResponse({
				response: authenticationResponse,
				expectedChallenge,
				expectedOrigin: origin,
				expectedRPID: rpID,
				credential: device,
			});
		} catch (error) {
			console.error(error);
			return NextResponse.json({ error: (error as Error).message }, { status: 400 });
		}

		const { verified, authenticationInfo } = verification;

		if (verified) {
			await db
				.update(authenticators)
				.set({ counter: authenticationInfo.newCounter })
				.where(eq(authenticators.credentialID, authenticator.credentialID));

			const token = signSession({ id: user.id, username: user.username });

			const response = NextResponse.json({ verified: true, user });
			response.cookies.delete('challenge');
			response.cookies.set('session', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7,
			});

			return response;
		}
		return NextResponse.json({ verified: false }, { status: 400 });
	}

	return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
