import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeHousehold, makeCategory, makeItem, makeEntry } from '../helpers/factories';
import {
  insertEntry,
  updateEntryRecord,
  deleteEntryRecord,
  deleteItemRecord,
  getHouseholdItems,
  getItemPurchaseHistory,
  getCategoryMonthlySpend,
  getHouseholdSpend,
  getRecentPurchases,
  getItemsForAutocomplete,
} from '@/lib/queries';
import * as schema from '@/lib/db/schema';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

// ── Entry mutations ─────────────────────────────────────────────────────────

describe('insertEntry — purchase', () => {
  it('increments item currentStock by quantity', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id, { currentStock: 2 });

    await insertEntry(db, {
      householdId: household.id, itemId: item.id, userId: user.id,
      type: 'purchase', price: 89, quantity: 3, unit: 'bottle',
      store: 'Big C', date: '2026-06-01', note: null,
    });

    const updated = await db.query.items.findFirst({ where: eq(schema.items.id, item.id) });
    expect(updated?.currentStock).toBe(5);
  });

  it('updates lastEntryAt on the item', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id);

    await insertEntry(db, {
      householdId: household.id, itemId: item.id, userId: user.id,
      type: 'purchase', price: 50, quantity: 1, unit: 'pcs',
      store: 'CJ', date: '2026-06-01', note: null,
    });

    const updated = await db.query.items.findFirst({ where: eq(schema.items.id, item.id) });
    expect(updated?.lastEntryAt).not.toBeNull();
  });
});

describe('insertEntry — consume', () => {
  it('decrements item currentStock by quantity', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id, { currentStock: 5 });

    await insertEntry(db, {
      householdId: household.id, itemId: item.id, userId: user.id,
      type: 'consume', price: null, quantity: 2, unit: 'bottle',
      store: null, date: '2026-06-01', note: null,
    });

    const updated = await db.query.items.findFirst({ where: eq(schema.items.id, item.id) });
    expect(updated?.currentStock).toBe(3);
  });

  it('allows stock to go negative', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id, { currentStock: 1 });

    await insertEntry(db, {
      householdId: household.id, itemId: item.id, userId: user.id,
      type: 'consume', price: null, quantity: 3, unit: 'pcs',
      store: null, date: '2026-06-01', note: null,
    });

    const updated = await db.query.items.findFirst({ where: eq(schema.items.id, item.id) });
    expect(updated?.currentStock).toBe(-2);
  });
});

describe('updateEntryRecord', () => {
  it('corrects stock when quantity changes on a purchase', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id, { currentStock: 3 });
    const entry = await makeEntry(db, household.id, item.id, user.id, { type: 'purchase', quantity: 3 });

    // Change quantity from 3 → 5 (delta = +2)
    await updateEntryRecord(db, entry, { quantity: 5 });

    const updated = await db.query.items.findFirst({ where: eq(schema.items.id, item.id) });
    expect(updated?.currentStock).toBe(5);
  });

  it('corrects stock when type flips purchase → consume', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id, { currentStock: 3 });
    const entry = await makeEntry(db, household.id, item.id, user.id, { type: 'purchase', quantity: 3 });

    // Flip to consume: remove +3 purchase, apply -3 consume → net -6
    await updateEntryRecord(db, entry, { type: 'consume', price: null });

    const updated = await db.query.items.findFirst({ where: eq(schema.items.id, item.id) });
    expect(updated?.currentStock).toBe(-3);
  });
});

describe('deleteEntryRecord', () => {
  it('reverses stock for a purchase on delete', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id, { currentStock: 5 });
    const entry = await makeEntry(db, household.id, item.id, user.id, { type: 'purchase', quantity: 5 });

    await deleteEntryRecord(db, entry);

    const updated = await db.query.items.findFirst({ where: eq(schema.items.id, item.id) });
    expect(updated?.currentStock).toBe(0);
  });

  it('reverses stock for a consume on delete', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id, { currentStock: 2 });
    const entry = await makeEntry(db, household.id, item.id, user.id, { type: 'consume', quantity: 3, price: null });

    await deleteEntryRecord(db, entry);

    const updated = await db.query.items.findFirst({ where: eq(schema.items.id, item.id) });
    expect(updated?.currentStock).toBe(5);
  });
});

// ── Item mutations ──────────────────────────────────────────────────────────

describe('deleteItemRecord', () => {
  it('deletes item and cascades its entries', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id);
    await makeEntry(db, household.id, item.id, user.id);
    await makeEntry(db, household.id, item.id, user.id);

    await deleteItemRecord(db, item.id);

    const deletedItem = await db.query.items.findFirst({ where: eq(schema.items.id, item.id) });
    const orphanEntries = await db.select().from(schema.entries).where(eq(schema.entries.itemId, item.id));
    expect(deletedItem).toBeUndefined();
    expect(orphanEntries).toHaveLength(0);
  });
});

// ── Queries ─────────────────────────────────────────────────────────────────

describe('getHouseholdItems', () => {
  it('returns items with their category', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id, { name: 'Fabric Softener' });
    await makeItem(db, household.id, cat.id, { name: 'Downy 1L' });

    const result = await getHouseholdItems(db, household.id);
    expect(result).toHaveLength(1);
    expect(result[0].item.name).toBe('Downy 1L');
    expect(result[0].category?.name).toBe('Fabric Softener');
  });

  it('returns last purchase entry per item', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id);
    await makeEntry(db, household.id, item.id, user.id, { date: '2026-01-01', price: 80 });
    await makeEntry(db, household.id, item.id, user.id, { date: '2026-03-01', price: 95 }); // newer

    const result = await getHouseholdItems(db, household.id);
    expect(result[0].lastEntry?.price).toBe(95); // most recent
  });

  it('does not leak items from other households', async () => {
    const user1 = await makeUser(db);
    const user2 = await makeUser(db);
    const h1 = await makeHousehold(db, user1.id);
    const h2 = await makeHousehold(db, user2.id);
    const cat1 = await makeCategory(db, h1.id);
    const cat2 = await makeCategory(db, h2.id);
    await makeItem(db, h1.id, cat1.id, { name: 'H1 Item' });
    await makeItem(db, h2.id, cat2.id, { name: 'H2 Item' });

    const result = await getHouseholdItems(db, h1.id);
    expect(result).toHaveLength(1);
    expect(result[0].item.name).toBe('H1 Item');
  });
});

describe('getItemPurchaseHistory', () => {
  it('returns only purchase entries, newest first', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id);
    await makeEntry(db, household.id, item.id, user.id, { type: 'purchase', date: '2026-01-01', price: 80 });
    await makeEntry(db, household.id, item.id, user.id, { type: 'consume', date: '2026-02-01', price: null });
    await makeEntry(db, household.id, item.id, user.id, { type: 'purchase', date: '2026-03-01', price: 95 });

    const result = await getItemPurchaseHistory(db, item.id);
    expect(result).toHaveLength(2);
    expect(result[0].price).toBe(95); // newest first
    expect(result[1].price).toBe(80);
  });
});

describe('getCategoryMonthlySpend', () => {
  it('aggregates spend by month across items in a category', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item1 = await makeItem(db, household.id, cat.id);
    const item2 = await makeItem(db, household.id, cat.id);
    await makeEntry(db, household.id, item1.id, user.id, { type: 'purchase', date: '2026-01-10', price: 100, quantity: 1 });
    await makeEntry(db, household.id, item2.id, user.id, { type: 'purchase', date: '2026-01-15', price: 50, quantity: 2 });
    await makeEntry(db, household.id, item1.id, user.id, { type: 'consume', date: '2026-01-20', price: null }); // excluded

    const result = await getCategoryMonthlySpend(db, cat.id);
    expect(result).toHaveLength(1);
    expect(result[0].month).toBe('2026-01');
    expect(result[0].total).toBeCloseTo(200); // 100*1 + 50*2
  });
});

describe('getHouseholdSpend', () => {
  it('returns total spend and per-category breakdown for a date range', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id, { name: 'Fabric Softener' });
    const item = await makeItem(db, household.id, cat.id);
    await makeEntry(db, household.id, item.id, user.id, { type: 'purchase', date: '2026-06-10', price: 89, quantity: 2 });
    await makeEntry(db, household.id, item.id, user.id, { type: 'purchase', date: '2026-05-01', price: 80, quantity: 1 }); // outside range

    const result = await getHouseholdSpend(db, household.id, '2026-06-01', '2026-06-30');
    expect(result.total).toBeCloseTo(178); // 89*2
    expect(result.byCategory[0].categoryName).toBe('Fabric Softener');
    expect(result.byCategory[0].total).toBeCloseTo(178);
  });
});

describe('getRecentPurchases', () => {
  it('returns purchase entries with item and category name', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id, { name: 'Meat' });
    const item = await makeItem(db, household.id, cat.id, { name: 'Chicken Breast' });
    await makeEntry(db, household.id, item.id, user.id, { type: 'purchase', price: 52 });

    const result = await getRecentPurchases(db, household.id);
    expect(result[0].itemName).toBe('Chicken Breast');
    expect(result[0].categoryName).toBe('Meat');
    expect(result[0].contributorName).toBeDefined();
  });

  it('excludes consume entries', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id);
    await makeEntry(db, household.id, item.id, user.id, { type: 'consume', price: null });

    const result = await getRecentPurchases(db, household.id);
    expect(result).toHaveLength(0);
  });
});

describe('getItemsForAutocomplete', () => {
  it('returns id, name, and categoryName for all household items', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id, { name: 'Fabric Softener' });
    await makeItem(db, household.id, cat.id, { name: 'Downy 1L' });

    const result = await getItemsForAutocomplete(db, household.id);
    expect(result[0]).toMatchObject({ name: 'Downy 1L', categoryName: 'Fabric Softener' });
    expect(typeof result[0].id).toBe('number');
  });
});
