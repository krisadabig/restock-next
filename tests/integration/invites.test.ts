import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeSpace, makeSpaceMember } from '../helpers/factories';
import { createInviteRecord, joinByCode } from '@/lib/queries';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('createInviteRecord', () => {
  it('inserts a space_invites row with 8-char code', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');

    const invite = await createInviteRecord(db, space.id, member.id);

    expect(invite.code).toHaveLength(8);
    expect(invite.spaceId).toBe(space.id);
    expect(invite.usedAt).toBeNull();
  });
});

describe('joinByCode', () => {
  it('happy path: creates space_members row and marks invite used', async () => {
    const userA = await makeUser(db);
    const userB = await makeUser(db);
    const space = await makeSpace(db);
    const memberA = await makeSpaceMember(db, space.id, userA.id, 'Alice');
    const invite = await createInviteRecord(db, space.id, memberA.id);

    const result = await joinByCode(db, invite.code, userB.id, 'Bob');

    expect(result.spaceId).toBe(space.id);
    const used = await db.query.spaceInvites.findFirst({ where: (i, { eq }) => eq(i.id, invite.id) });
    expect(used?.usedAt).not.toBeNull();
  });

  it('throws Invalid code for unknown code', async () => {
    const user = await makeUser(db);
    await expect(joinByCode(db, 'XXXXXXXX', user.id, 'Bob')).rejects.toThrow('Invalid code');
  });

  it('throws Code expired for an expired invite', async () => {
    const userA = await makeUser(db);
    const userB = await makeUser(db);
    const space = await makeSpace(db);
    const memberA = await makeSpaceMember(db, space.id, userA.id, 'Alice');
    const invite = await createInviteRecord(db, space.id, memberA.id, { expiresAt: new Date(Date.now() - 1000) });

    await expect(joinByCode(db, invite.code, userB.id, 'Bob')).rejects.toThrow('Code expired');
  });

  it('throws Already used for a consumed invite', async () => {
    const userA = await makeUser(db);
    const userB = await makeUser(db);
    const userC = await makeUser(db);
    const space = await makeSpace(db);
    const memberA = await makeSpaceMember(db, space.id, userA.id, 'Alice');
    const invite = await createInviteRecord(db, space.id, memberA.id);

    await joinByCode(db, invite.code, userB.id, 'Bob');

    await expect(joinByCode(db, invite.code, userC.id, 'Carol')).rejects.toThrow('Already used');
  });

  it('throws Already a member when user is already in the space', async () => {
    const userA = await makeUser(db);
    const space = await makeSpace(db);
    const memberA = await makeSpaceMember(db, space.id, userA.id, 'Alice');
    const invite = await createInviteRecord(db, space.id, memberA.id);

    await expect(joinByCode(db, invite.code, userA.id, 'Alice')).rejects.toThrow('Already a member');
  });
});
