import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Set before module loads so encodedKey is consistent
process.env.JWT_SECRET = 'test-secret-for-unit-tests';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));

import { cookies } from 'next/headers';
import { encrypt, decrypt, requireSession } from './session';

describe('session', () => {
  it('roundtrips new fields activeSpaceId + activeMemberId', async () => {
    const payload = {
      userId: 'u1',
      username: 'alice',
      activeSpaceId: 'space-abc',
      activeMemberId: 42,
      expiresAt: new Date(Date.now() + 60_000),
    };
    const token = await encrypt(payload);
    const decoded = await decrypt(token);
    expect(decoded?.activeSpaceId).toBe('space-abc');
    expect(decoded?.activeMemberId).toBe(42);
  });

  it('returns null for invalid token', async () => {
    expect(await decrypt('not-a-real-token')).toBeNull();
  });

  it('returns null for empty token', async () => {
    expect(await decrypt(undefined)).toBeNull();
  });
});

describe('requireSession', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('throws Unauthorized when no session cookie', async () => {
    (cookies as Mock).mockResolvedValue({ get: () => undefined });
    await expect(requireSession()).rejects.toThrow('Unauthorized');
  });

  it('throws No active space when session has no activeSpaceId', async () => {
    const token = await encrypt({ userId: 'u1', username: 'alice', expiresAt: new Date(Date.now() + 60_000) });
    (cookies as Mock).mockResolvedValue({ get: () => ({ value: token }) });
    await expect(requireSession()).rejects.toThrow('No active space');
  });

  it('returns { userId, spaceId, memberId } when session is valid', async () => {
    const token = await encrypt({ userId: 'u1', username: 'alice', activeSpaceId: 'sp1', activeMemberId: 7, expiresAt: new Date(Date.now() + 60_000) });
    (cookies as Mock).mockResolvedValue({ get: () => ({ value: token }) });
    const result = await requireSession();
    expect(result).toEqual({ userId: 'u1', spaceId: 'sp1', memberId: 7 });
  });
});
