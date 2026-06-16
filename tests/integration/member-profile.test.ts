import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, resetDb } from '../helpers/db';
import { makeUser, makeSpace, makeSpaceMember } from '../helpers/factories';
import { updateSpaceMember } from '@/lib/queries';
import * as schema from '@/lib/db/schema';

const { db, client } = createTestDb();

beforeEach(async () => { await resetDb(db); });
afterAll(async () => { await client.end(); });

describe('updateSpaceMember', () => {
  it('updates display_name in space_members row', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Old Name');

    await updateSpaceMember(db, member.id, { displayName: 'New Name' });

    const updated = await db.query.spaceMembers.findFirst({ where: eq(schema.spaceMembers.id, member.id) });
    expect(updated?.displayName).toBe('New Name');
  });

  it('updates avatar without touching display_name', async () => {
    const user = await makeUser(db);
    const space = await makeSpace(db);
    const member = await makeSpaceMember(db, space.id, user.id, 'Alice');

    await updateSpaceMember(db, member.id, { avatar: 'https://example.com/avatar.png' });

    const updated = await db.query.spaceMembers.findFirst({ where: eq(schema.spaceMembers.id, member.id) });
    expect(updated?.displayName).toBe('Alice');
    expect(updated?.avatar).toBe('https://example.com/avatar.png');
  });
});
