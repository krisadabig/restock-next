import { describe, it, expect } from 'vitest';
import { signSession, verifySession } from '@/lib/server/session';

describe('Auth Session', () => {
	it('should sign and verify a session token', () => {
		const user = { id: 'user-123', username: 'testuser' };
		const token = signSession(user);

		expect(token).toBeDefined();
		expect(typeof token).toBe('string');

		const decoded = verifySession(token);
		expect(decoded).toEqual(user);
	});

	it('should return null for invalid token', () => {
		const result = verifySession('invalid.token.here');
		expect(result).toBeNull();
	});
});
