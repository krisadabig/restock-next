/**
 * Cross-feature integration: Auth & Spaces (S2.1–S2.4, S3.1)
 * Tests multi-step flows that span the space creation, switching, and profile stories.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeSpace, makeSpaceMember } from '../helpers/factories';
import {
  insertSpaceWithMember,
  getUserSpaces,
  getActiveSpaceForUser,
  updateSpaceMember,
} from '@/lib/queries';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('Auth & Spaces cross-feature flows', () => {
  it('register flow: space and member created → getUserSpaces returns it', async () => {
    const user = await makeUser(db);
    const { spaceId, memberId } = await insertSpaceWithMember(db, user.id, 'Alice', "Alice's Home");

    const spaces = await getUserSpaces(db, user.id);

    expect(spaces).toHaveLength(1);
    expect(spaces[0].id).toBe(spaceId);
    expect(spaces[0].displayName).toBe('Alice');
    expect(spaces[0].memberId).toBe(memberId);
  });

  it('multi-space: two spaces → getUserSpaces returns both with correct displayNames', async () => {
    const user = await makeUser(db);
    await insertSpaceWithMember(db, user.id, 'Alice', 'Home');
    await insertSpaceWithMember(db, user.id, 'Alice at Work', 'Office');

    const spaces = await getUserSpaces(db, user.id);

    expect(spaces).toHaveLength(2);
    const names = spaces.map((s) => s.name).sort();
    expect(names).toEqual(['Home', 'Office']);
  });

  it('getActiveSpaceForUser returns membership matching a known space', async () => {
    const user = await makeUser(db);
    const { spaceId, memberId } = await insertSpaceWithMember(db, user.id, 'Alice', 'Home');

    const active = await getActiveSpaceForUser(db, user.id);

    expect(active?.spaceId).toBe(spaceId);
    expect(active?.memberId).toBe(memberId);
  });

  it('profile update reflected in getUserSpaces: updateSpaceMember → displayName changes', async () => {
    const user = await makeUser(db);
    const { memberId } = await insertSpaceWithMember(db, user.id, 'Old Name', 'Home');

    await updateSpaceMember(db, memberId, { displayName: 'New Name' });

    const spaces = await getUserSpaces(db, user.id);
    expect(spaces[0].displayName).toBe('New Name');
  });

  it('second user joins space → both appear in getActiveSpaceForUser for their own scopes', async () => {
    const alice = await makeUser(db);
    const bob = await makeUser(db);
    const space = await makeSpace(db);
    await makeSpaceMember(db, space.id, alice.id, 'Alice');
    await makeSpaceMember(db, space.id, bob.id, 'Bob');

    const aliceActive = await getActiveSpaceForUser(db, alice.id);
    const bobActive = await getActiveSpaceForUser(db, bob.id);

    expect(aliceActive?.spaceId).toBe(space.id);
    expect(bobActive?.spaceId).toBe(space.id);
    expect(aliceActive?.memberId).not.toBe(bobActive?.memberId);
  });
});
