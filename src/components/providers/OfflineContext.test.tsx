import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockAddPendingMutation } = vi.hoisted(() => ({
  mockAddPendingMutation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/idb', () => ({
  addPendingMutation: mockAddPendingMutation,
  getPendingMutations: vi.fn().mockResolvedValue([]),
  removePendingMutation: vi.fn().mockResolvedValue(undefined),
  initDB: vi.fn(),
}));

vi.mock('@/lib/sync', () => ({
  SyncEngine: class { sync() { return Promise.resolve(); } },
}));

vi.mock('@/lib/logger', () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { OfflineProvider, useOffline } from './OfflineContext';
import type { OfflineContextType } from './OfflineContext';

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, 'onLine', { value: false, configurable: true, writable: true });
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OfflineProvider>{children}</OfflineProvider>
);

// ── Behavioral tests ──────────────────────────────────────────────────────────

describe('OfflineContext — entry mutations only', () => {
  it('addEntryOffline queues entry.add mutation to IDB when offline', async () => {
    const { result } = renderHook(() => useOffline(), { wrapper });

    await act(async () => {
      await result.current.addEntryOffline({
        itemId: 1,
        type: 'purchase',
        price: 99,
        quantity: 2,
        unit: 'kg',
        store: 'Big C',
        date: '2026-06-21',
        note: null,
      });
    });

    expect(mockAddPendingMutation).toHaveBeenCalledOnce();
    const call = mockAddPendingMutation.mock.calls[0][0];
    expect(call.type).toBe('entry.add');
    expect(call.payload.itemId).toBe(1);
    expect(call.payload.type).toBe('purchase');
  });

  it('updateEntryOffline queues entry.update mutation', async () => {
    const { result } = renderHook(() => useOffline(), { wrapper });

    await act(async () => {
      await result.current.updateEntryOffline(42, { quantity: 5 });
    });

    const call = mockAddPendingMutation.mock.calls[0][0];
    expect(call.type).toBe('entry.update');
    expect(call.payload.id).toBe(42);
  });

  it('deleteEntryOffline queues entry.delete mutation', async () => {
    const { result } = renderHook(() => useOffline(), { wrapper });

    await act(async () => {
      await result.current.deleteEntryOffline(7);
    });

    const call = mockAddPendingMutation.mock.calls[0][0];
    expect(call.type).toBe('entry.delete');
    expect(call.payload.id).toBe(7);
  });
});

// ── Type-level tests (enforced by bun run build / tsc) ────────────────────────

describe('OfflineContextType shape', () => {
  it('has entry mutation methods', () => {
    type T = OfflineContextType;
    const _add: T['addEntryOffline'] = async () => {};
    const _update: T['updateEntryOffline'] = async () => {};
    const _del: T['deleteEntryOffline'] = async () => {};
    expect(_add).toBeDefined();
    expect(_update).toBeDefined();
    expect(_del).toBeDefined();
  });

  it('does NOT have item or category offline methods', () => {
    type T = OfflineContextType;
    type HasAddItem = 'addItemOffline' extends keyof T ? true : false;
    type HasUpdateItem = 'updateItemOffline' extends keyof T ? true : false;
    type HasDeleteItem = 'deleteItemOffline' extends keyof T ? true : false;
    type HasAddCat = 'addCategoryOffline' extends keyof T ? true : false;
    const a: HasAddItem = false;
    const b: HasUpdateItem = false;
    const c: HasDeleteItem = false;
    const d: HasAddCat = false;
    expect([a, b, c, d]).toEqual([false, false, false, false]);
  });
});
