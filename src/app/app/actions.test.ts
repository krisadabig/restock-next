import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// ── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockFindItem, mockFindEntry, mockFindCategory, mockFindSpaceMember } = vi.hoisted(() => ({
  mockFindItem:         vi.fn(),
  mockFindEntry:        vi.fn(),
  mockFindCategory:     vi.fn(),
  mockFindSpaceMember:  vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/logger', () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn(), createSession: vi.fn(), requireSession: vi.fn() }));
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      items:        { findFirst: mockFindItem },
      entries:      { findFirst: mockFindEntry },
      categories:   { findFirst: mockFindCategory },
      spaceMembers: { findFirst: mockFindSpaceMember },
    },
  },
}));
vi.mock('@/lib/queries', () => ({
  getActiveSpaceForUser:   vi.fn(),
  insertSpaceWithMember:   vi.fn(),
  insertEntry:             vi.fn(),
  updateItemRecord:        vi.fn(),
  deleteItemRecord:        vi.fn(),
  getItemAllEntries:       vi.fn(),
  updateEntryRecord:       vi.fn(),
  deleteEntryRecord:       vi.fn(),
  getCategoryMonthlySpend: vi.fn(),
  getUserSpaces:           vi.fn(),
  updateSpaceMember:       vi.fn(),
  updateCategoryRecord:    vi.fn(),
  deleteCategoryRecord:    vi.fn(),
  renameSpaceRecord:       vi.fn(),
  removeSpaceMember:       vi.fn(),
  createInviteRecord:      vi.fn(),
  joinByCode:              vi.fn(),
}));

import { getSession, createSession, requireSession } from '@/lib/session';
import * as queries from '@/lib/queries';
import {
  updateItem, deleteItem,
  addEntry, updateEntry, deleteEntry,
  getItemDetail, getCategoryDetail,
  createSpace,
  createInvite, joinByInviteCode,
  switchSpace, getMySpaces,
  renameSpace, leaveSpace,
  updateMemberProfile,
  updateCategory, deleteCategory,
} from './actions';

const SESSION  = { userId: 'u1', username: 'alice', expiresAt: new Date() };
const MY_SPACE    = 'space-mine';
const OTHER_SPACE = 'space-other';
const MEMBERSHIP  = { spaceId: MY_SPACE, memberId: 1 };

describe('server action authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getSession as Mock).mockResolvedValue(SESSION);
    (requireSession as Mock).mockResolvedValue({ userId: SESSION.userId, spaceId: MY_SPACE, memberId: MEMBERSHIP.memberId });
  });

  // ── updateItem ─────────────────────────────────────────────────────────────

  describe('updateItem', () => {
    it('throws when item belongs to a different space', async () => {
      mockFindItem.mockResolvedValue({ id: 1, spaceId: OTHER_SPACE });
      await expect(updateItem(1, { name: 'hacked' })).rejects.toThrow('Not found');
    });

    it('proceeds when item belongs to the callers space', async () => {
      mockFindItem.mockResolvedValue({ id: 1, spaceId: MY_SPACE });
      (queries.updateItemRecord as Mock).mockResolvedValue({ id: 1, name: 'ok' });
      await expect(updateItem(1, { name: 'ok' })).resolves.not.toThrow();
    });
  });

  // ── deleteItem ─────────────────────────────────────────────────────────────

  describe('deleteItem', () => {
    it('throws when item belongs to a different space', async () => {
      mockFindItem.mockResolvedValue({ id: 1, spaceId: OTHER_SPACE });
      await expect(deleteItem(1)).rejects.toThrow('Not found');
    });

    it('proceeds when item belongs to the callers space', async () => {
      mockFindItem.mockResolvedValue({ id: 1, spaceId: MY_SPACE });
      (queries.getItemAllEntries as Mock).mockResolvedValue([]);
      (queries.deleteItemRecord as Mock).mockResolvedValue(undefined);
      await expect(deleteItem(1)).resolves.not.toThrow();
    });
  });

  // ── updateEntry ────────────────────────────────────────────────────────────

  describe('updateEntry', () => {
    it('throws when entry belongs to a different space', async () => {
      mockFindEntry.mockResolvedValue({ id: 7, itemId: 1, spaceId: OTHER_SPACE });
      await expect(updateEntry(7, { quantity: 2 })).rejects.toThrow('Entry not found');
    });

    it('proceeds when entry belongs to the callers space', async () => {
      mockFindEntry.mockResolvedValue({ id: 7, itemId: 1, spaceId: MY_SPACE });
      (queries.updateEntryRecord as Mock).mockResolvedValue({ id: 7 });
      await expect(updateEntry(7, { quantity: 2 })).resolves.not.toThrow();
    });
  });

  // ── deleteEntry ────────────────────────────────────────────────────────────

  describe('deleteEntry', () => {
    it('throws when entry belongs to a different space', async () => {
      mockFindEntry.mockResolvedValue({ id: 7, itemId: 1, spaceId: OTHER_SPACE });
      await expect(deleteEntry(7)).rejects.toThrow('Entry not found');
    });

    it('proceeds when entry belongs to the callers space', async () => {
      mockFindEntry.mockResolvedValue({ id: 7, itemId: 1, spaceId: MY_SPACE });
      (queries.deleteEntryRecord as Mock).mockResolvedValue(undefined);
      await expect(deleteEntry(7)).resolves.not.toThrow();
    });
  });

  // ── addEntry ───────────────────────────────────────────────────────────────

  describe('addEntry', () => {
    const validEntry = { itemId: 1, type: 'purchase' as const, price: 10, quantity: 2, unit: 'pcs', store: null, date: '2025-01-01', note: null };

    it('throws when item belongs to a different space', async () => {
      mockFindItem.mockResolvedValue({ id: 1, spaceId: OTHER_SPACE });
      await expect(addEntry(validEntry)).rejects.toThrow('Not found');
    });

    it('calls insertEntry when item belongs to the callers space', async () => {
      mockFindItem.mockResolvedValue({ id: 1, spaceId: MY_SPACE });
      (queries.insertEntry as Mock).mockResolvedValue({ id: 99 });
      await expect(addEntry(validEntry)).resolves.not.toThrow();
      expect(queries.insertEntry as Mock).toHaveBeenCalled();
    });
  });

  // ── getItemDetail ──────────────────────────────────────────────────────────

  describe('getItemDetail', () => {
    it('returns null when item is not in the callers space', async () => {
      mockFindItem.mockResolvedValue(null);
      (queries.getItemAllEntries as Mock).mockResolvedValue([]);
      await expect(getItemDetail(99)).resolves.toBeNull();
    });

    it('returns item + entries when item belongs to the callers space', async () => {
      const fakeItem = { id: 1, spaceId: MY_SPACE, name: 'Milk' };
      mockFindItem.mockResolvedValue(fakeItem);
      (queries.getItemAllEntries as Mock).mockResolvedValue([]);
      const result = await getItemDetail(1);
      expect(result?.item).toEqual(fakeItem);
    });
  });

  // ── getCategoryDetail ──────────────────────────────────────────────────────

  describe('getCategoryDetail', () => {
    it('returns null when category is not in the callers space', async () => {
      mockFindCategory.mockResolvedValue(null);
      (queries.getCategoryMonthlySpend as Mock).mockResolvedValue([]);
      await expect(getCategoryDetail(99)).resolves.toBeNull();
    });
  });

  // ── createSpace ────────────────────────────────────────────────────────────

  describe('createSpace', () => {
    it('throws Unauthorized when no session', async () => {
      (getSession as Mock).mockResolvedValue(null);
      await expect(createSpace('My Space', 'Alice')).rejects.toThrow('Unauthorized');
    });

    it('returns spaceId and memberId on success', async () => {
      (queries.insertSpaceWithMember as Mock).mockResolvedValue({ spaceId: 'sp-1', memberId: 42 });
      const result = await createSpace('My Space', 'Alice');
      expect(result).toEqual({ spaceId: 'sp-1', memberId: 42 });
    });
  });

  // ── switchSpace ────────────────────────────────────────────────────────────

  describe('switchSpace', () => {
    it('throws Unauthorized when no session', async () => {
      (getSession as Mock).mockResolvedValue(null);
      await expect(switchSpace('space-2')).rejects.toThrow('Unauthorized');
    });

    it('throws Not a member when user has no membership in target space', async () => {
      mockFindSpaceMember.mockResolvedValue(null);
      await expect(switchSpace('space-other')).rejects.toThrow('Not a member');
    });

    it('calls createSession with new spaceId and memberId when member exists', async () => {
      mockFindSpaceMember.mockResolvedValue({ id: 7, spaceId: MY_SPACE, userId: 'u1' });
      await switchSpace(MY_SPACE);
      expect(createSession as Mock).toHaveBeenCalledWith('u1', 'alice', MY_SPACE, 7);
    });
  });

  // ── getMySpaces ────────────────────────────────────────────────────────────

  describe('getMySpaces', () => {
    it('throws Unauthorized when no session', async () => {
      (getSession as Mock).mockResolvedValue(null);
      await expect(getMySpaces()).rejects.toThrow('Unauthorized');
    });

    it('returns spaces from getUserSpaces query', async () => {
      const fakeSpaces = [{ id: MY_SPACE, name: 'Home', displayName: 'Alice', memberId: 1 }];
      (queries.getUserSpaces as Mock).mockResolvedValue(fakeSpaces);
      const result = await getMySpaces();
      expect(result).toEqual(fakeSpaces);
      expect(queries.getUserSpaces as Mock).toHaveBeenCalledWith(expect.anything(), 'u1');
    });
  });

  // ── updateCategory ─────────────────────────────────────────────────────────

  describe('updateCategory', () => {
    it('throws Not found when category belongs to a different space', async () => {
      mockFindCategory.mockResolvedValue({ id: 5, spaceId: OTHER_SPACE });
      await expect(updateCategory(5, { name: 'Hacked' })).rejects.toThrow('Not found');
    });

    it('proceeds when category belongs to the callers space', async () => {
      mockFindCategory.mockResolvedValue({ id: 5, spaceId: MY_SPACE });
      (queries.updateCategoryRecord as Mock).mockResolvedValue({ id: 5, name: 'Updated' });
      await expect(updateCategory(5, { name: 'Updated' })).resolves.not.toThrow();
    });
  });

  // ── deleteCategory ─────────────────────────────────────────────────────────

  describe('deleteCategory', () => {
    it('throws Not found when category belongs to a different space', async () => {
      mockFindCategory.mockResolvedValue({ id: 5, spaceId: OTHER_SPACE });
      await expect(deleteCategory(5)).rejects.toThrow('Not found');
    });

    it('proceeds when category belongs to the callers space', async () => {
      mockFindCategory.mockResolvedValue({ id: 5, spaceId: MY_SPACE });
      (queries.deleteCategoryRecord as Mock).mockResolvedValue(undefined);
      await expect(deleteCategory(5)).resolves.not.toThrow();
    });
  });

  // ── renameSpace ────────────────────────────────────────────────────────────

  describe('renameSpace', () => {
    it('throws Unauthorized when no session', async () => {
      (getSession as Mock).mockResolvedValue(null);
      await expect(renameSpace(MY_SPACE, 'New Name')).rejects.toThrow('Unauthorized');
    });

    it('throws Not a member when user is not in the target space', async () => {
      mockFindSpaceMember.mockResolvedValue(null);
      await expect(renameSpace(OTHER_SPACE, 'New Name')).rejects.toThrow('Not a member');
    });

    it('calls renameSpaceRecord when user is a member', async () => {
      mockFindSpaceMember.mockResolvedValue({ id: 1, spaceId: MY_SPACE, userId: 'u1' });
      (queries.renameSpaceRecord as Mock).mockResolvedValue({ id: MY_SPACE, name: 'New Name' });
      await expect(renameSpace(MY_SPACE, 'New Name')).resolves.not.toThrow();
      expect(queries.renameSpaceRecord as Mock).toHaveBeenCalledWith(expect.anything(), MY_SPACE, 'New Name');
    });
  });

  // ── leaveSpace ─────────────────────────────────────────────────────────────

  describe('leaveSpace', () => {
    it('throws Unauthorized when no session', async () => {
      (getSession as Mock).mockResolvedValue(null);
      await expect(leaveSpace(MY_SPACE)).rejects.toThrow('Unauthorized');
    });

    it('throws Not a member when user is not in the target space', async () => {
      mockFindSpaceMember.mockResolvedValue(null);
      await expect(leaveSpace(OTHER_SPACE)).rejects.toThrow('Not a member');
    });

    it('calls removeSpaceMember with enforceMinOne when user is a member', async () => {
      mockFindSpaceMember.mockResolvedValue({ id: 7, spaceId: MY_SPACE, userId: 'u1' });
      (queries.removeSpaceMember as Mock).mockResolvedValue(undefined);
      await expect(leaveSpace(MY_SPACE)).resolves.not.toThrow();
      expect(queries.removeSpaceMember as Mock).toHaveBeenCalledWith(expect.anything(), 7, { enforceMinOne: true });
    });
  });

  // ── createInvite ───────────────────────────────────────────────────────────

  describe('createInvite', () => {
    it('throws No active space when session has no space', async () => {
      (requireSession as Mock).mockRejectedValue(new Error('No active space'));
      await expect(createInvite()).rejects.toThrow('No active space');
    });

    it('returns code from createInviteRecord on success', async () => {
      (queries.createInviteRecord as Mock).mockResolvedValue({ id: 1, code: 'ABCD1234', spaceId: MY_SPACE });
      const result = await createInvite();
      expect(result).toEqual({ code: 'ABCD1234' });
      expect(queries.createInviteRecord as Mock).toHaveBeenCalledWith(expect.anything(), MY_SPACE, MEMBERSHIP.memberId);
    });
  });

  // ── joinByInviteCode ────────────────────────────────────────────────────────

  describe('joinByInviteCode', () => {
    it('throws Unauthorized when no session', async () => {
      (getSession as Mock).mockResolvedValue(null);
      await expect(joinByInviteCode('ABCD1234')).rejects.toThrow('Unauthorized');
    });

    it('propagates Already used error from joinByCode', async () => {
      (queries.joinByCode as Mock).mockRejectedValue(new Error('Already used'));
      await expect(joinByInviteCode('USEDCODE')).rejects.toThrow('Already used');
    });

    it('returns spaceId on successful join', async () => {
      (queries.joinByCode as Mock).mockResolvedValue({ id: 5, spaceId: 'sp-new', userId: 'u1', displayName: 'alice' });
      const result = await joinByInviteCode('VALIDCOD');
      expect(result).toEqual({ spaceId: 'sp-new' });
    });
  });

  // ── updateMemberProfile ────────────────────────────────────────────────────

  describe('updateMemberProfile', () => {
    it('throws Unauthorized when no session', async () => {
      (requireSession as Mock).mockRejectedValue(new Error('Unauthorized'));
      await expect(updateMemberProfile({ displayName: 'Alice' })).rejects.toThrow('Unauthorized');
    });

    it('throws No active space when session has no activeSpaceId', async () => {
      (requireSession as Mock).mockRejectedValue(new Error('No active space'));
      await expect(updateMemberProfile({ displayName: 'Alice' })).rejects.toThrow('No active space');
    });

    it('calls updateSpaceMember with memberId and patch when valid', async () => {
      (queries.updateSpaceMember as Mock).mockResolvedValue({ id: 1, displayName: 'Alice', avatar: null });
      const result = await updateMemberProfile({ displayName: 'Alice' });
      expect(queries.updateSpaceMember as Mock).toHaveBeenCalledWith(expect.anything(), 1, { displayName: 'Alice' });
      expect(result).toEqual({ id: 1, displayName: 'Alice', avatar: null });
    });
  });
});
