import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser } from '../helpers/factories';
import { insertSpaceWithMember } from '@/lib/queries';
import * as schema from '@/lib/db/schema';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('insertSpaceWithMember', () => {
  it('creates space row with given name', async () => {
    const user = await makeUser(db);
    const { spaceId } = await insertSpaceWithMember(db, user.id, 'Alice', "Alice's Home");

    const space = await db.query.spaces.findFirst({ where: eq(schema.spaces.id, spaceId) });
    expect(space?.name).toBe("Alice's Home");
  });

  it('creates space_members row linked to user', async () => {
    const user = await makeUser(db);
    const { spaceId, memberId } = await insertSpaceWithMember(db, user.id, 'Alice', "Alice's Home");

    const member = await db.query.spaceMembers.findFirst({ where: eq(schema.spaceMembers.id, memberId) });
    expect(member?.userId).toBe(user.id);
    expect(member?.spaceId).toBe(spaceId);
    expect(member?.displayName).toBe('Alice');
  });

  it('returns spaceId and memberId', async () => {
    const user = await makeUser(db);
    const result = await insertSpaceWithMember(db, user.id, 'Bob', "Bob's Home");
    expect(result.spaceId).toBeTruthy();
    expect(result.memberId).toBeTypeOf('number');
  });
});
