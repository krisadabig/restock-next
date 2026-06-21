import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeSpace, makeSpaceMember, makeCategory, makeItem } from '../helpers/factories';
import { insertCategory, insertItem, insertEntry, deleteEntryRecord, getSpaceItems } from '@/lib/queries';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('Inventory actions cross-feature flows', () => {
  it('addItem → addEntry → getSpaceItems returns lastMember.displayName', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await insertCategory(db, { spaceId: space.id, name: 'Dairy', defaultUnit: 'L' });
    const item = await insertItem(db, { spaceId: space.id, name: 'Milk', unit: 'L', categoryId: cat.id });
    await insertEntry(db, { spaceId: space.id, itemId: item.id, memberId: member.id, type: 'purchase', price: 30, quantity: 2, unit: 'L', store: 'Big C', date: '2025-01-01', note: null });

    const result = await getSpaceItems(db, space.id);

    expect(result).toHaveLength(1);
    expect(result[0].item.name).toBe('Milk');
    expect(result[0].lastMember?.displayName).toBe('Alice');
    expect(result[0].lastEntry?.quantity).toBe(2);
  });

  it('addEntry purchase → deleteEntry → item.currentStock is back to original', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id, { currentStock: 0 });

    const entry = await insertEntry(db, { spaceId: space.id, itemId: item.id, memberId: member.id, type: 'purchase', price: 10, quantity: 5, unit: 'pcs', store: null, date: '2025-01-01', note: null });

    const afterAdd = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, item.id) });
    expect(afterAdd?.currentStock).toBe(5);

    await deleteEntryRecord(db, entry);

    const afterDelete = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, item.id) });
    expect(afterDelete?.currentStock).toBe(0);
  });

  it('two members log entries — getSpaceItems shows last entry member correctly', async () => {
    const userA = await makeUser(db);
    const userB = await makeUser(db);
    const space = await makeSpace(db);
    const memberA = await makeSpaceMember(db, space.id, userA.id, 'Alice');
    const memberB = await makeSpaceMember(db, space.id, userB.id, 'Bob');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id);

    await insertEntry(db, { spaceId: space.id, itemId: item.id, memberId: memberA.id, type: 'purchase', price: 10, quantity: 1, unit: 'pcs', store: null, date: '2025-01-01', note: null });
    await insertEntry(db, { spaceId: space.id, itemId: item.id, memberId: memberB.id, type: 'purchase', price: 15, quantity: 2, unit: 'pcs', store: null, date: '2025-01-02', note: null });

    const result = await getSpaceItems(db, space.id);

    expect(result[0].lastMember?.displayName).toBe('Bob');
    expect(result[0].lastEntry?.quantity).toBe(2);
  });

  it('category space isolation — categories from other space not returned', async () => {
    const user = await makeUser(db);
    const space1 = await makeSpace(db);
    const space2 = await makeSpace(db);
    await makeSpaceMember(db, space1.id, user.id, 'Alice');
    await makeSpaceMember(db, space2.id, user.id, 'Alice');

    await insertCategory(db, { spaceId: space1.id, name: 'Space1 Cat', defaultUnit: 'pcs' });
    await insertCategory(db, { spaceId: space2.id, name: 'Space2 Cat', defaultUnit: 'pcs' });

    const { getCategories } = await import('@/lib/queries');
    const result = await getCategories(db, space1.id);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Space1 Cat');
  });
});
