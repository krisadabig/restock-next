import { describe, it, expect, beforeEach } from 'vitest';
import {
  initDB,
  resetDBForTests,
  saveItemsCache,
  getItemsCache,
  saveCategoriesCache,
  getCategoriesCache,
  saveEntriesCache,
  getEntriesCache,
  addPendingMutation,
  getPendingMutations,
  clearPendingMutations,
} from './idb';
import type { MutationType } from './idb';
import 'fake-indexeddb/auto';

beforeEach(async () => {
  resetDBForTests();
  const db = await initDB();
  await db.clear('entries');
  await db.clear('items');
  await db.clear('categories');
  await db.clear('mutations');
});

describe('initDB', () => {
  it('has all required object stores', async () => {
    const db = await initDB();
    expect(db.objectStoreNames.contains('entries')).toBe(true);
    expect(db.objectStoreNames.contains('items')).toBe(true);
    expect(db.objectStoreNames.contains('categories')).toBe(true);
    expect(db.objectStoreNames.contains('mutations')).toBe(true);
  });
});

describe('items cache', () => {
  it('saves and retrieves items', async () => {
    const items = [
      { id: 1, name: 'Downy 1L', householdId: 'h1', categoryId: 1, unit: 'bottle',
        currentStock: 2, lowStockThreshold: null, alertEnabled: 1,
        lastEntryAt: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    await saveItemsCache(items);
    const result = await getItemsCache();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Downy 1L');
  });

  it('replaces cache on each save', async () => {
    await saveItemsCache([
      { id: 1, name: 'Old Item', householdId: 'h1', categoryId: null, unit: 'pcs',
        currentStock: 0, lowStockThreshold: null, alertEnabled: 1,
        lastEntryAt: null, createdAt: new Date(), updatedAt: new Date() },
    ]);
    await saveItemsCache([]);
    expect(await getItemsCache()).toHaveLength(0);
  });
});

describe('categories cache', () => {
  it('saves and retrieves categories', async () => {
    const cats = [{ id: 1, name: 'Fabric Softener', householdId: 'h1', defaultUnit: 'bottle', createdAt: new Date() }];
    await saveCategoriesCache(cats);
    const result = await getCategoriesCache();
    expect(result[0].name).toBe('Fabric Softener');
  });
});

describe('entries cache', () => {
  it('saves and retrieves entries with new schema shape', async () => {
    const entries = [
      { id: 1, householdId: 'h1', itemId: 1, type: 'purchase' as const,
        price: 89, quantity: 2, unit: 'bottle', store: 'Big C',
        date: '2026-06-01', note: null, userId: 'u1', createdAt: new Date() },
    ];
    await saveEntriesCache(entries);
    const result = await getEntriesCache();
    expect(result[0].price).toBe(89);
    expect(result[0].store).toBe('Big C');
  });
});

describe('mutation queue', () => {
  it('queues and retrieves mutations with new type strings', async () => {
    const mutation = {
      id: 'uuid-1',
      type: 'entry.add' as MutationType,
      payload: { itemId: 1, type: 'purchase', price: 89, quantity: 2 },
      timestamp: Date.now(),
    };
    await addPendingMutation(mutation);
    const result = await getPendingMutations();
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('entry.add');
  });

  it('clears all mutations', async () => {
    await addPendingMutation({ id: 'x', type: 'entry.delete' as MutationType, payload: { id: 1 }, timestamp: 1 });
    await clearPendingMutations();
    expect(await getPendingMutations()).toHaveLength(0);
  });
});
