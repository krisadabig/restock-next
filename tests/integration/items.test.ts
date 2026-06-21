import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeSpace, makeSpaceMember, makeCategory, makeItem, makeEntry } from '../helpers/factories';
import { insertItem, getSpaceItems, deleteItemRecord } from '@/lib/queries';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('insertItem', () => {
  it('creates a DB row scoped to the correct spaceId', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    await makeSpaceMember(db, space.id, user.id, 'Alice');

    const item = await insertItem(db, { spaceId: space.id, name: 'Milk', unit: 'L' });

    expect(item.spaceId).toBe(space.id);
    expect(item.name).toBe('Milk');
    expect(item.currentStock).toBe(0);
  });
});

describe('getSpaceItems', () => {
  it('returns empty array when space has no items', async () => {
    const space = await makeSpace(db);
    const result = await getSpaceItems(db, space.id);
    expect(result).toEqual([]);
  });

  it('returns items with null lastEntry and null lastMember when no entries', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    await makeItem(db, space.id, cat.id, { name: 'Sugar' });

    const result = await getSpaceItems(db, space.id);

    expect(result).toHaveLength(1);
    expect(result[0].item.name).toBe('Sugar');
    expect(result[0].lastEntry).toBeNull();
    expect(result[0].lastMember).toBeNull();
  });

  it('returns lastMember.displayName from space_members when an entry exists', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id, { name: 'Rice' });
    await makeEntry(db, space.id, item.id, member.id);

    const result = await getSpaceItems(db, space.id);

    expect(result).toHaveLength(1);
    expect(result[0].lastEntry).not.toBeNull();
    expect(result[0].lastMember).not.toBeNull();
    expect(result[0].lastMember?.displayName).toBe('Alice');
  });

  it('does not return items from other spaces', async () => {
    const user = await makeUser(db);
    const space1 = await makeSpace(db);
    const space2 = await makeSpace(db);
    await makeSpaceMember(db, space1.id, user.id, 'Alice');
    await makeSpaceMember(db, space2.id, user.id, 'Alice');
    const cat1 = await makeCategory(db, space1.id);
    const cat2 = await makeCategory(db, space2.id);
    await makeItem(db, space1.id, cat1.id, { name: 'Space1 Item' });
    await makeItem(db, space2.id, cat2.id, { name: 'Space2 Item' });

    const result = await getSpaceItems(db, space1.id);

    expect(result).toHaveLength(1);
    expect(result[0].item.name).toBe('Space1 Item');
  });
});

describe('deleteItemRecord', () => {
  it('removes the item row', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    await makeSpaceMember(db, space.id, user.id, 'Alice');
    const cat = await makeCategory(db, space.id);
    const item = await makeItem(db, space.id, cat.id);

    await deleteItemRecord(db, item.id);

    const result = await getSpaceItems(db, space.id);
    expect(result).toHaveLength(0);
  });
});
