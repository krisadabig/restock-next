import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetSession = vi.hoisted(() => vi.fn());
const mockGetActiveSpaceForUser = vi.hoisted(() => vi.fn());
const mockGetSpaceMembers = vi.hoisted(() => vi.fn());
const mockGetCategories = vi.hoisted(() => vi.fn());
const mockGetUserSpaces = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() => vi.fn(() => { throw new Error('REDIRECT'); }));

vi.mock('@/lib/session', () => ({ getSession: mockGetSession }));
vi.mock('@/lib/db', () => ({ db: {} }));
vi.mock('@/lib/queries', () => ({
  getActiveSpaceForUser: mockGetActiveSpaceForUser,
  getSpaceMembers: mockGetSpaceMembers,
  getCategories: mockGetCategories,
  getUserSpaces: mockGetUserSpaces,
}));
vi.mock('./ClientLayout', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ redirect: mockRedirect }));

import DashboardLayout from './layout';

const session = { userId: 'u1', username: 'fallback', activeSpaceId: 'sp1', activeMemberId: 1 };
const membership = { spaceId: 'sp1', memberId: 1 };

describe('DashboardLayout — SpaceContext init', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation(() => { throw new Error('REDIRECT'); });
    mockGetCategories.mockResolvedValue([]);
  });

  it('passes correct spaceValue with member displayName', async () => {
    mockGetSession.mockResolvedValue(session);
    mockGetActiveSpaceForUser.mockResolvedValue(membership);
    mockGetSpaceMembers.mockResolvedValue([
      { memberId: 1, displayName: 'Alex', avatar: null, userId: 'u1' },
      { memberId: 2, displayName: 'Sam', avatar: null, userId: 'u2' },
    ]);
    mockGetUserSpaces.mockResolvedValue([{ id: 'sp1', name: 'My Home' }]);

    const el = await DashboardLayout({ children: null });
    const { spaceValue } = (el as React.ReactElement<{ spaceValue: { spaceId: string; memberId: number; displayName: string; members: unknown[]; mySpaces: unknown[] } }>).props;
    expect(spaceValue.spaceId).toBe('sp1');
    expect(spaceValue.memberId).toBe(1);
    expect(spaceValue.displayName).toBe('Alex');
    expect(spaceValue.members).toHaveLength(2);
    expect(spaceValue.mySpaces).toHaveLength(1);
  });

  it('falls back to session.username when memberId not found in members', async () => {
    mockGetSession.mockResolvedValue(session);
    mockGetActiveSpaceForUser.mockResolvedValue({ spaceId: 'sp1', memberId: 99 });
    mockGetSpaceMembers.mockResolvedValue([]);
    mockGetUserSpaces.mockResolvedValue([]);

    const el = await DashboardLayout({ children: null });
    const { spaceValue } = (el as React.ReactElement<{ spaceValue: { displayName: string } }>).props;
    expect(spaceValue.displayName).toBe('fallback');
  });

  it('redirects to /login when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(DashboardLayout({ children: null })).rejects.toThrow('REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });
});
