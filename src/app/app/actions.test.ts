import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// ── Hoisted mocks (must exist before vi.mock factories run) ──────────────────

const { mockFindItem, mockFindEntry, mockFindCategory } = vi.hoisted(() => ({
  mockFindItem: vi.fn(),
  mockFindEntry: vi.fn(),
  mockFindCategory: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/logger', () => ({ log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      items:      { findFirst: mockFindItem },
      entries:    { findFirst: mockFindEntry },
      categories: { findFirst: mockFindCategory },
    },
  },
}));
vi.mock('@/lib/queries', () => ({
  getHouseholdForUser:     vi.fn(),
  updateItemRecord:        vi.fn(),
  deleteItemRecord:        vi.fn(),
  getItemAllEntries:       vi.fn(),
  updateEntryRecord:       vi.fn(),
  deleteEntryRecord:       vi.fn(),
  getCategoryMonthlySpend: vi.fn(),
}));

import { getSession } from '@/lib/session';
import * as queries from '@/lib/queries';
import {
  updateItem, deleteItem,
  updateEntry, deleteEntry,
  getItemDetail, getCategoryDetail,
} from './actions';

const SESSION  = { userId: 'u1', username: 'alice', expiresAt: new Date() };
const MY_HH    = 'hh-mine';
const OTHER_HH = 'hh-other';

describe('server action authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getSession as Mock).mockResolvedValue(SESSION);
    (queries.getHouseholdForUser as Mock).mockResolvedValue(MY_HH);
  });

  // ── updateItem ─────────────────────────────────────────────────────────────

  describe('updateItem', () => {
    it('throws when item belongs to a different household', async () => {
      mockFindItem.mockResolvedValue({ id: 1, householdId: OTHER_HH });
      await expect(updateItem(1, { name: 'hacked' })).rejects.toThrow('Not found');
    });

    it('proceeds when item belongs to the callers household', async () => {
      mockFindItem.mockResolvedValue({ id: 1, householdId: MY_HH });
      (queries.updateItemRecord as Mock).mockResolvedValue({ id: 1, name: 'ok' });
      await expect(updateItem(1, { name: 'ok' })).resolves.not.toThrow();
    });
  });

  // ── deleteItem ─────────────────────────────────────────────────────────────

  describe('deleteItem', () => {
    it('throws when item belongs to a different household', async () => {
      mockFindItem.mockResolvedValue({ id: 1, householdId: OTHER_HH });
      await expect(deleteItem(1)).rejects.toThrow('Not found');
    });

    it('proceeds when item belongs to the callers household', async () => {
      mockFindItem.mockResolvedValue({ id: 1, householdId: MY_HH });
      (queries.getItemAllEntries as Mock).mockResolvedValue([]);
      (queries.deleteItemRecord as Mock).mockResolvedValue(undefined);
      await expect(deleteItem(1)).resolves.not.toThrow();
    });
  });

  // ── updateEntry ────────────────────────────────────────────────────────────

  describe('updateEntry', () => {
    it('throws when entry belongs to a different household', async () => {
      mockFindEntry.mockResolvedValue({ id: 7, itemId: 1, householdId: OTHER_HH });
      await expect(updateEntry(7, { quantity: 2 })).rejects.toThrow('Entry not found');
    });

    it('proceeds when entry belongs to the callers household', async () => {
      mockFindEntry.mockResolvedValue({ id: 7, itemId: 1, householdId: MY_HH });
      (queries.updateEntryRecord as Mock).mockResolvedValue({ id: 7 });
      await expect(updateEntry(7, { quantity: 2 })).resolves.not.toThrow();
    });
  });

  // ── deleteEntry ────────────────────────────────────────────────────────────

  describe('deleteEntry', () => {
    it('throws when entry belongs to a different household', async () => {
      mockFindEntry.mockResolvedValue({ id: 7, itemId: 1, householdId: OTHER_HH });
      await expect(deleteEntry(7)).rejects.toThrow('Entry not found');
    });

    it('proceeds when entry belongs to the callers household', async () => {
      mockFindEntry.mockResolvedValue({ id: 7, itemId: 1, householdId: MY_HH });
      (queries.deleteEntryRecord as Mock).mockResolvedValue(undefined);
      await expect(deleteEntry(7)).resolves.not.toThrow();
    });
  });

  // ── getItemDetail ──────────────────────────────────────────────────────────

  describe('getItemDetail', () => {
    it('returns null when item is not in the callers household', async () => {
      mockFindItem.mockResolvedValue(null);
      (queries.getItemAllEntries as Mock).mockResolvedValue([]);
      await expect(getItemDetail(99)).resolves.toBeNull();
    });

    it('returns item + entries when item belongs to the callers household', async () => {
      const fakeItem = { id: 1, householdId: MY_HH, name: 'Milk' };
      mockFindItem.mockResolvedValue(fakeItem);
      (queries.getItemAllEntries as Mock).mockResolvedValue([]);
      const result = await getItemDetail(1);
      expect(result?.item).toEqual(fakeItem);
    });
  });

  // ── getCategoryDetail ──────────────────────────────────────────────────────

  describe('getCategoryDetail', () => {
    it('returns null when category is not in the callers household', async () => {
      mockFindCategory.mockResolvedValue(null);
      (queries.getCategoryMonthlySpend as Mock).mockResolvedValue([]);
      await expect(getCategoryDetail(99)).resolves.toBeNull();
    });
  });
});
