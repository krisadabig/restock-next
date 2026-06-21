import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeSpace, makeSpaceMember } from '../helpers/factories';
import { getUserSpaces, renameSpaceRecord, removeSpaceMember } from '@/lib/queries';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('getUserSpaces', () => {
  it('returns all spaces the user is a member of', async () => {
    const user = await makeUser(db);
    const space1 = await makeSpace(db, { name: 'Home' });
    const space2 = await makeSpace(db, { name: 'Office' });
    await makeSpaceMember(db, space1.id, user.id, 'Alice');
    await makeSpaceMember(db, space2.id, user.id, 'Al');

    const result = await getUserSpaces(db, user.id);

    expect(result).toHaveLength(2);
    expect(result.map((s) => s.name).sort()).toEqual(['Home', 'Office']);
  });

  it('does not return spaces from other users', async () => {
    const userA = await makeUser(db);
    const userB = await makeUser(db);
    const space = await makeSpace(db);
    await makeSpaceMember(db, space.id, userA.id, 'Alice');

    const result = await getUserSpaces(db, userB.id);

    expect(result).toHaveLength(0);
  });
});

describe('renameSpaceRecord', () => {
  it('updates the space name', async () => {
    const space = await makeSpace(db, { name: 'Old Name' });

    await renameSpaceRecord(db, space.id, 'New Name');

    const updated = await db.query.spaces.findFirst({ where: (s, { eq }) => eq(s.id, space.id) });
    expect(updated?.name).toBe('New Name');
  });
});

describe('removeSpaceMember', () => {
  it('removes the membership row', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');

    await removeSpaceMember(db, member.id);

    const remaining = await db.query.spaceMembers.findFirst({ where: (m, { eq }) => eq(m.id, member.id) });
    expect(remaining).toBeUndefined();
  });

  it('throws when trying to remove the last member', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');

    await expect(removeSpaceMember(db, member.id, { enforceMinOne: true })).rejects.toThrow('Last member');
  });
});
