import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeSpace, makeSpaceMember } from '../helpers/factories';
import { insertSpaceWithMember, createInviteRecord, joinByCode, getUserSpaces, renameSpaceRecord, removeSpaceMember } from '@/lib/queries';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('Space management cross-feature flows', () => {
  it('createInvite → joinByCode → getUserSpaces lists both spaces for new member', async () => {
    const userA = await makeUser(db);
    const userB = await makeUser(db);
    const { spaceId, memberId } = await insertSpaceWithMember(db, userA.id, 'Alice', 'Home');

    const invite = await createInviteRecord(db, spaceId, memberId);
    await joinByCode(db, invite.code, userB.id, 'Bob');

    const spacesForB = await getUserSpaces(db, userB.id);
    expect(spacesForB).toHaveLength(1);
    expect(spacesForB[0].id).toBe(spaceId);
    expect(spacesForB[0].displayName).toBe('Bob');
  });

  it('renameSpace → getUserSpaces returns updated name', async () => {
    const user = await makeUser(db);
    const { spaceId } = await insertSpaceWithMember(db, user.id, 'Alice', 'Old Name');

    await renameSpaceRecord(db, spaceId, 'New Name');

    const spaces = await getUserSpaces(db, user.id);
    expect(spaces[0].name).toBe('New Name');
  });

  it('leaveSpace → getUserSpaces no longer lists that space', async () => {
    const user = await makeUser(db);
    const space1 = await makeSpace(db, { name: 'Space 1' });
    const space2 = await makeSpace(db, { name: 'Space 2' });
    const m1 = await makeSpaceMember(db, space1.id, user.id, 'Alice');
    await makeSpaceMember(db, space2.id, user.id, 'Alice');
    // Add a second member to space1 so leave is permitted
    const other = await makeUser(db);
    await makeSpaceMember(db, space1.id, other.id, 'Bob');

    await removeSpaceMember(db, m1.id, { enforceMinOne: true });

    const spaces = await getUserSpaces(db, user.id);
    expect(spaces).toHaveLength(1);
    expect(spaces[0].name).toBe('Space 2');
  });

  it('joinByCode twice with same code → second join throws Already used', async () => {
    const userA = await makeUser(db);
    const userB = await makeUser(db);
    const userC = await makeUser(db);
    const { spaceId, memberId } = await insertSpaceWithMember(db, userA.id, 'Alice', 'Home');

    const invite = await createInviteRecord(db, spaceId, memberId);
    await joinByCode(db, invite.code, userB.id, 'Bob');

    await expect(joinByCode(db, invite.code, userC.id, 'Carol')).rejects.toThrow('Already used');
  });
});
