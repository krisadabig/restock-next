import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

export function signSession(user: { id: string; username: string }): string {
	return jwt.sign({ id: user.id, username: user.username }, SECRET, {
		expiresIn: '7d',
	});
}

export function verifySession(token: string): { id: string; username: string } | null {
	try {
		const decoded = jwt.verify(token, SECRET) as { id: string; username: string };
		return { id: decoded.id, username: decoded.username };
	} catch {
		return null;
	}
}
