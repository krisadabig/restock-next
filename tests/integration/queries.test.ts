import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeSpace, makeSpaceMember, makeCategory, makeItem, makeEntry } from '../helpers/factories';
import {
  deleteItemRecord,
  getSpaceItems,
  getItemPurchaseHistory,
  getCategoryMonthlySpend,
  getSpaceSpend,
  getRecentPurchases,
  getItemsForAutocomplete,
} from '@/lib/queries';
import * as schema from '@/lib/db/schema';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('deleteItemRecord', () => {
  it('deletes item and cascades its entries', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id);
    await makeEntry(db, space.id, item.id, member.id);
    await makeEntry(db, space.id, item.id, member.id);

    await deleteItemRecord(db, item.id);

    const deletedItem = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, item.id) });
    const orphanEntries = await db.select().from(schema.entries).where(eq(schema.entries.itemId, item.id));
    expect(deletedItem).toBeUndefined();
    expect(orphanEntries).toHaveLength(0);
  });
});

describe('getSpaceItems', () => {
  it('returns items with their category', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id, { name: 'Fabric Softener' });
    await makeItem(db, space.id, cat.id, { name: 'Downy 1L' });

    const result = await getSpaceItems(db, space.id);
    expect(result).toHaveLength(1);
    expect(result[0].item.name).toBe('Downy 1L');
    expect(result[0].category?.name).toBe('Fabric Softener');
  });

  it('returns lastEntry and lastMember.displayName', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id);
    await makeEntry(db, space.id, item.id, member.id, { price: 95, date: '2026-03-01' });

    const result = await getSpaceItems(db, space.id);
    expect(result[0].lastEntry?.price).toBe(95);
    expect(result[0].lastMember?.displayName).toBe('Alice');
  });

  it('does not leak items from other spaces', async () => {
    const user1 = await makeUser(db);
    const user2 = await makeUser(db);
    const s1 = await makeSpace(db, { name: 'Space 1' });
    const s2 = await makeSpace(db, { name: 'Space 2' });
    const cat1 = await makeCategory(db, s1.id);
    const cat2 = await makeCategory(db, s2.id);
    await makeUser(db);
    await makeSpaceMember(db, s1.id, user1.id, 'Alice');
    await makeSpaceMember(db, s2.id, user2.id, 'Bob');
    await makeItem(db, s1.id, cat1.id, { name: 'S1 Item' });
    await makeItem(db, s2.id, cat2.id, { name: 'S2 Item' });

    const result = await getSpaceItems(db, s1.id);
    expect(result).toHaveLength(1);
    expect(result[0].item.name).toBe('S1 Item');
  });
});

describe('getItemPurchaseHistory', () => {
  it('returns only purchase entries, newest first', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id);
    await makeEntry(db, space.id, item.id, member.id, { type: 'purchase', date: '2026-01-01', price: 80 });
    await makeEntry(db, space.id, item.id, member.id, { type: 'consume', date: '2026-02-01', price: null });
    await makeEntry(db, space.id, item.id, member.id, { type: 'purchase', date: '2026-03-01', price: 95 });

    const result = await getItemPurchaseHistory(db, item.id);
    expect(result).toHaveLength(2);
    expect(result[0].price).toBe(95);
    expect(result[1].price).toBe(80);
  });
});

describe('getCategoryMonthlySpend', () => {
  it('aggregates spend by month across items in a category', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item1 = await makeItem(db, space.id, cat.id);
    const item2 = await makeItem(db, space.id, cat.id);
    await makeEntry(db, space.id, item1.id, member.id, { type: 'purchase', date: '2026-01-10', price: 100, quantity: 1 });
    await makeEntry(db, space.id, item2.id, member.id, { type: 'purchase', date: '2026-01-15', price: 50, quantity: 2 });
    await makeEntry(db, space.id, item1.id, member.id, { type: 'consume', date: '2026-01-20', price: null });

    const result = await getCategoryMonthlySpend(db, cat.id);
    expect(result).toHaveLength(1);
    expect(result[0].month).toBe('2026-01');
    expect(result[0].total).toBeCloseTo(200);
  });
});

describe('getSpaceSpend', () => {
  it('returns total spend and per-category breakdown for a date range', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id, { name: 'Fabric Softener' });
    const item = await makeItem(db, space.id, cat.id);
    await makeEntry(db, space.id, item.id, member.id, { type: 'purchase', date: '2026-06-10', price: 89, quantity: 2 });
    await makeEntry(db, space.id, item.id, member.id, { type: 'purchase', date: '2026-05-01', price: 80, quantity: 1 });

    const result = await getSpaceSpend(db, space.id, '2026-06-01', '2026-06-30');
    expect(result.total).toBeCloseTo(178);
    expect(result.byCategory[0].categoryName).toBe('Fabric Softener');
    expect(result.byCategory[0].total).toBeCloseTo(178);
  });
});

describe('getRecentPurchases', () => {
  it('returns purchase entries with item, category, and contributor name', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id, { name: 'Meat' });
    const item = await makeItem(db, space.id, cat.id, { name: 'Chicken Breast' });
    await makeEntry(db, space.id, item.id, member.id, { type: 'purchase', price: 52 });

    const result = await getRecentPurchases(db, space.id);
    expect(result[0].itemName).toBe('Chicken Breast');
    expect(result[0].categoryName).toBe('Meat');
    expect(result[0].contributorName).toBe('Alice');
  });

  it('excludes consume entries', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id);
    await makeEntry(db, space.id, item.id, member.id, { type: 'consume', price: null });

    const result = await getRecentPurchases(db, space.id);
    expect(result).toHaveLength(0);
  });
});

describe('getItemsForAutocomplete', () => {
  it('returns id, name, unit, and categoryName for all space items', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id, { name: 'Fabric Softener' });
    await makeItem(db, space.id, cat.id, { name: 'Downy 1L', unit: 'bottle' });

    const result = await getItemsForAutocomplete(db, space.id);
    expect(result[0]).toMatchObject({ name: 'Downy 1L', categoryName: 'Fabric Softener', unit: 'bottle' });
    expect(typeof result[0].id).toBe('number');
  });
});
