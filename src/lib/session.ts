import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { DEFAULTS } from './constants';

// ponytail: lazy key — avoids empty-key error when JWT_SECRET loads after module init
function getKey() {
	const k = process.env.JWT_SECRET ?? '';
	return new TextEncoder().encode(k);
}

type SessionPayload = {
	userId: string;
	username: string;
	activeSpaceId?: string;
	activeMemberId?: number;
	expiresAt: Date;
};

export async function createSession(userId: string, username: string, activeSpaceId?: string, activeMemberId?: number) {
	const expiresAt = new Date(Date.now() + DEFAULTS.SESSION_DURATION_MS);
	const session = await encrypt({ userId, username, activeSpaceId, activeMemberId, expiresAt });
	const cookieStore = await cookies();

	cookieStore.set('session', session, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		expires: expiresAt,
		sameSite: 'lax',
		path: '/',
	});
}

export async function deleteSession() {
	const cookieStore = await cookies();
	cookieStore.delete('session');
}

export async function encrypt(payload: SessionPayload) {
	return new SignJWT(payload as Record<string, unknown>)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(getKey());
}

export async function decrypt(session: string | undefined = '') {
	try {
		const { payload } = await jwtVerify(session, getKey(), {
			algorithms: ['HS256'],
		});
		return payload as unknown as SessionPayload;
	} catch {
		return null;
	}
}

export async function getSession() {
	const cookieStore = await cookies();
	const session = cookieStore.get('session')?.value;
	const payload = await decrypt(session);

	if (!payload) {
		return null;
	}

	return payload;
}

export async function requireSession(): Promise<{ userId: string; spaceId: string; memberId: number }> {
	const session = await getSession();
	if (!session) throw new Error('Unauthorized');
	if (!session.activeSpaceId) throw new Error('No active space');
	return { userId: session.userId, spaceId: session.activeSpaceId, memberId: session.activeMemberId as number };
}
