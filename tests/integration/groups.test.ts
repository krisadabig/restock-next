import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeHousehold, makeCategory, makeItem } from '../helpers/factories';
import {
  insertGroup,
  updateGroupName,
  deleteGroupRecord,
  getGroups,
  insertGroupItem,
  deleteGroupItem,
  getGroupItems,
} from '@/lib/queries';
import * as schema from '@/lib/db/schema';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

// ── Group CRUD ───────────────────────────────────────────────────────────────

describe('insertGroup', () => {
  it('creates a group belonging to the household', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);

    const group = await insertGroup(db, { householdId: household.id, name: 'Pantry' });

    expect(group.id).toBeDefined();
    expect(group.name).toBe('Pantry');
    expect(group.householdId).toBe(household.id);
  });
});

describe('updateGroupName', () => {
  it('changes the name of an existing group', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const group = await insertGroup(db, { householdId: household.id, name: 'Old Name' });

    const updated = await updateGroupName(db, group.id, 'New Name');

    expect(updated.name).toBe('New Name');
    expect(updated.id).toBe(group.id);
  });
});

describe('deleteGroupRecord', () => {
  it('removes the group from the database', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const group = await insertGroup(db, { householdId: household.id, name: 'Freezer' });

    await deleteGroupRecord(db, group.id);

    const found = await db.query.groups.findFirst({ where: eq(schema.groups.id, group.id) });
    expect(found).toBeUndefined();
  });

  it('cascades to group_items on delete', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id);
    const group = await insertGroup(db, { householdId: household.id, name: 'To Delete' });
    await insertGroupItem(db, { groupId: group.id, itemId: item.id });

    await deleteGroupRecord(db, group.id);

    const rows = await db
      .select()
      .from(schema.groupItems)
      .where(eq(schema.groupItems.groupId, group.id));
    expect(rows).toHaveLength(0);
  });
});

describe('getGroups', () => {
  it('returns only groups belonging to the specified household', async () => {
    const user1 = await makeUser(db);
    const hh1 = await makeHousehold(db, user1.id);
    const user2 = await makeUser(db);
    const hh2 = await makeHousehold(db, user2.id);

    await insertGroup(db, { householdId: hh1.id, name: 'Alpha' });
    await insertGroup(db, { householdId: hh1.id, name: 'Beta' });
    await insertGroup(db, { householdId: hh2.id, name: 'Gamma' });

    const groups = await getGroups(db, hh1.id);

    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.name)).toEqual(['Alpha', 'Beta']); // ordered by name
  });

  it('returns empty array when household has no groups', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);

    const groups = await getGroups(db, household.id);

    expect(groups).toHaveLength(0);
  });
});

// ── Group item assignment ────────────────────────────────────────────────────

describe('insertGroupItem', () => {
  it('associates an item with a group', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id, { name: 'Milk' });
    const group = await insertGroup(db, { householdId: household.id, name: 'Fridge' });

    await insertGroupItem(db, { groupId: group.id, itemId: item.id });

    const items = await getGroupItems(db, group.id);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(item.id);
  });

  it('is idempotent — duplicate insert does not throw', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id);
    const group = await insertGroup(db, { householdId: household.id, name: 'Shelf' });

    await insertGroupItem(db, { groupId: group.id, itemId: item.id });
    await expect(insertGroupItem(db, { groupId: group.id, itemId: item.id })).resolves.not.toThrow();

    const items = await getGroupItems(db, group.id);
    expect(items).toHaveLength(1);
  });
});

describe('deleteGroupItem', () => {
  it('removes the item from the group', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item = await makeItem(db, household.id, cat.id);
    const group = await insertGroup(db, { householdId: household.id, name: 'Pantry' });
    await insertGroupItem(db, { groupId: group.id, itemId: item.id });

    await deleteGroupItem(db, group.id, item.id);

    const items = await getGroupItems(db, group.id);
    expect(items).toHaveLength(0);
  });

  it('does not affect other items in the same group', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const itemA = await makeItem(db, household.id, cat.id, { name: 'Apple' });
    const itemB = await makeItem(db, household.id, cat.id, { name: 'Banana' });
    const group = await insertGroup(db, { householdId: household.id, name: 'Fruit' });
    await insertGroupItem(db, { groupId: group.id, itemId: itemA.id });
    await insertGroupItem(db, { groupId: group.id, itemId: itemB.id });

    await deleteGroupItem(db, group.id, itemA.id);

    const items = await getGroupItems(db, group.id);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(itemB.id);
  });
});

describe('getGroupItems', () => {
  it('returns items ordered by name', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const itemZ = await makeItem(db, household.id, cat.id, { name: 'Zucchini' });
    const itemA = await makeItem(db, household.id, cat.id, { name: 'Apple' });
    const group = await insertGroup(db, { householdId: household.id, name: 'Mixed' });
    await insertGroupItem(db, { groupId: group.id, itemId: itemZ.id });
    await insertGroupItem(db, { groupId: group.id, itemId: itemA.id });

    const items = await getGroupItems(db, group.id);

    expect(items.map((i) => i.name)).toEqual(['Apple', 'Zucchini']);
  });

  it('does not return items from other groups', async () => {
    const user = await makeUser(db);
    const household = await makeHousehold(db, user.id);
    const cat = await makeCategory(db, household.id);
    const item1 = await makeItem(db, household.id, cat.id, { name: 'Item 1' });
    const item2 = await makeItem(db, household.id, cat.id, { name: 'Item 2' });
    const group1 = await insertGroup(db, { householdId: household.id, name: 'Group 1' });
    const group2 = await insertGroup(db, { householdId: household.id, name: 'Group 2' });
    await insertGroupItem(db, { groupId: group1.id, itemId: item1.id });
    await insertGroupItem(db, { groupId: group2.id, itemId: item2.id });

    const items = await getGroupItems(db, group1.id);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(item1.id);
  });
});
