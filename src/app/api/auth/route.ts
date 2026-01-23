import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, authenticators } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, createSession } from '@/lib/session';
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
	const session = await getSession();

	const searchParams = request.nextUrl.searchParams;
	const type = searchParams.get('type');

	if (type === 'register') {
		// Registration/Enrollment requires an authenticated user
		if (!session)
			return NextResponse.json({ error: 'Unauthorized. login first to enroll passkey' }, { status: 401 });

		// We need the user email if available, or confirm username
		// For now we just use session info

		const options = await generateRegistrationOptions({
			rpName,
			rpID,
			userID: new TextEncoder().encode(session.userId),
			userName: session.username,
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
		// Login doesn't require session, but we might want to filter by username if provided
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
	const { type } = body;
	const cookies = request.cookies;

	const expectedChallenge = cookies.get('challenge')?.value;
	if (!expectedChallenge) return NextResponse.json({ error: 'Challenge expired or missing' }, { status: 400 });

	if (type === 'register') {
		// Finalizing Enrollment
		const session = await getSession();
		if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const { registrationResponse } = body;

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

		if (verification.verified && verification.registrationInfo) {
			const { credential } = verification.registrationInfo;
			await db.insert(authenticators).values({
				userId: session.userId,
				credentialID: credential.id,
				credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
				counter: credential.counter,
				transports: credential.transports ? JSON.stringify(credential.transports) : null,
			});

			const response = NextResponse.json({ verified: true });
			response.cookies.delete('challenge');
			return response;
		}
	} else if (type === 'login') {
		const { authenticationResponse } = body;

		// 1. Find authenticator
		const auths = await db
			.select()
			.from(authenticators)
			.where(eq(authenticators.credentialID, authenticationResponse.id));
		const authenticator = auths[0];

		if (!authenticator) return NextResponse.json({ error: 'Device not found' }, { status: 400 });

		// 2. Find user in public table
		const usersFound = await db.select().from(users).where(eq(users.id, authenticator.userId));
		const user = usersFound[0];
		if (!user) return NextResponse.json({ error: 'User profile not found' }, { status: 400 });

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
			return NextResponse.json({ error: (error as Error).message }, { status: 400 });
		}

		if (verification.verified) {
			await db
				.update(authenticators)
				.set({ counter: verification.authenticationInfo.newCounter })
				.where(eq(authenticators.credentialID, authenticator.credentialID));

			// Sign in user using new Session system
			await createSession(user.id, user.username);

			// Return verified
			const response = NextResponse.json({
				verified: true,
				userId: user.id,
				user: { id: user.id, username: user.username },
			});
			response.cookies.delete('challenge');
			return response;
		}
	}

	return NextResponse.json({ error: 'Invalid verification' }, { status: 400 });
}
