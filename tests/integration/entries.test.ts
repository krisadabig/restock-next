import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeSpace, makeSpaceMember, makeCategory, makeItem, makeEntry } from '../helpers/factories';
import { insertEntry, updateEntryRecord, deleteEntryRecord } from '@/lib/queries';
import { items } from '@/lib/db/schema';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

async function getStock(itemId: number) {
  const row = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, itemId) });
  return row?.currentStock ?? null;
}

describe('insertEntry — purchase', () => {
  it('increments item currentStock by quantity', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id, { currentStock: 2 });

    await insertEntry(db, { spaceId: space.id, itemId: item.id, memberId: member.id, type: 'purchase', price: 10, quantity: 3, unit: 'pcs', store: null, date: '2025-01-01', note: null });

    expect(await getStock(item.id)).toBe(5);
  });

  it('sets lastEntryAt on the item', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id);

    const before = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, item.id) });
    expect(before?.lastEntryAt).toBeNull();

    await insertEntry(db, { spaceId: space.id, itemId: item.id, memberId: member.id, type: 'purchase', price: 5, quantity: 1, unit: 'pcs', store: null, date: '2025-01-01', note: null });

    const after = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, item.id) });
    expect(after?.lastEntryAt).not.toBeNull();
  });
});

describe('insertEntry — consume', () => {
  it('decrements item currentStock by quantity', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id, { currentStock: 5 });

    await insertEntry(db, { spaceId: space.id, itemId: item.id, memberId: member.id, type: 'consume', price: null, quantity: 2, unit: 'pcs', store: null, date: '2025-01-01', note: null });

    expect(await getStock(item.id)).toBe(3);
  });

  it('allows stock to go negative', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id, { currentStock: 0 });

    await insertEntry(db, { spaceId: space.id, itemId: item.id, memberId: member.id, type: 'consume', price: null, quantity: 1, unit: 'pcs', store: null, date: '2025-01-01', note: null });

    expect(await getStock(item.id)).toBe(-1);
  });
});

describe('updateEntryRecord', () => {
  it('corrects stock when quantity changes on a purchase', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id, { currentStock: 3 });
    const entry = await makeEntry(db, space.id, item.id, member.id, { quantity: 3, type: 'purchase' });

    await updateEntryRecord(db, entry, { quantity: 5 });

    expect(await getStock(item.id)).toBe(5);
  });

  it('corrects stock when type flips purchase → consume', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id, { currentStock: 3 });
    const entry = await makeEntry(db, space.id, item.id, member.id, { quantity: 3, type: 'purchase' });

    await updateEntryRecord(db, entry, { type: 'consume' });

    expect(await getStock(item.id)).toBe(-3);
  });
});

describe('deleteEntryRecord', () => {
  it('reverses stock for a purchase on delete', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id, { currentStock: 3 });
    const entry = await makeEntry(db, space.id, item.id, member.id, { quantity: 3, type: 'purchase' });

    await deleteEntryRecord(db, entry);

    expect(await getStock(item.id)).toBe(0);
  });

  it('reverses stock for a consume on delete', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id, { currentStock: 2 });
    const entry = await makeEntry(db, space.id, item.id, member.id, { quantity: 2, type: 'consume' });

    await deleteEntryRecord(db, entry);

    expect(await getStock(item.id)).toBe(4);
  });
});
