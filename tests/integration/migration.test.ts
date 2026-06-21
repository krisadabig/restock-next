import { describe, it, expect, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { createTestDb } from '../helpers/db';

// ponytail: probe each table with a no-op SELECT — proves the table exists and columns are reachable
const TABLES = [
  'users',
  'authenticators',
  'spaces',
  'space_members',
  'space_invites',
  'categories',
  'items',
  'entries',
];

const { db, client } = createTestDb();
afterAll(() => client.end());

describe('migration smoke — all tables exist', () => {
  for (const table of TABLES) {
    it(table, async () => {
      await expect(db.execute(sql.raw(`SELECT 1 FROM ${table} LIMIT 0`))).resolves.toBeDefined();
    });
  }
});

describe('migration constraints', () => {
  it('entries.member_id FK rejects unknown space_member', async () => {
    // Insert the minimum required parent rows so only member_id is bad
    await db.execute(sql`
      INSERT INTO users(id, username) VALUES ('u-fk-1', 'fk_user1')
    `);
    await db.execute(sql`
      INSERT INTO spaces(id, name) VALUES ('s-fk-1', 'FK Space')
    `);
    await db.execute(sql`
      INSERT INTO items(space_id, name) VALUES ('s-fk-1', 'FK Item')
    `);
    await expect(
      db.execute(sql`
        INSERT INTO entries(space_id, item_id, member_id, type, quantity, unit, date)
        SELECT 's-fk-1', id, 99999, 'purchase', 1, 'pcs', CURRENT_DATE FROM items WHERE name='FK Item'
      `)
    ).rejects.toThrow();

    // cleanup
    await db.execute(sql`DELETE FROM items WHERE space_id='s-fk-1'`);
    await db.execute(sql`DELETE FROM spaces WHERE id='s-fk-1'`);
    await db.execute(sql`DELETE FROM users WHERE id='u-fk-1'`);
  });

  it('space_members UNIQUE(space_id, user_id) rejects duplicate membership', async () => {
    await db.execute(sql`INSERT INTO users(id, username) VALUES ('u-uniq-1', 'uniq_user1')`);
    await db.execute(sql`INSERT INTO spaces(id, name) VALUES ('s-uniq-1', 'Uniq Space')`);
    await db.execute(sql`
      INSERT INTO space_members(space_id, user_id, display_name) VALUES ('s-uniq-1','u-uniq-1','Alice')
    `);
    await expect(
      db.execute(sql`
        INSERT INTO space_members(space_id, user_id, display_name) VALUES ('s-uniq-1','u-uniq-1','Alice2')
      `)
    ).rejects.toThrow();

    // cleanup
    await db.execute(sql`DELETE FROM space_members WHERE space_id='s-uniq-1'`);
    await db.execute(sql`DELETE FROM spaces WHERE id='s-uniq-1'`);
    await db.execute(sql`DELETE FROM users WHERE id='u-uniq-1'`);
  });

  it('spaces cascade-deletes space_members and items on space delete', async () => {
    await db.execute(sql`INSERT INTO users(id, username) VALUES ('u-cas-1', 'cas_user1')`);
    await db.execute(sql`INSERT INTO spaces(id, name) VALUES ('s-cas-1', 'Cascade Space')`);
    await db.execute(sql`
      INSERT INTO space_members(space_id, user_id, display_name) VALUES ('s-cas-1','u-cas-1','Bob')
    `);
    await db.execute(sql`INSERT INTO items(space_id, name) VALUES ('s-cas-1', 'Cas Item')`);

    await db.execute(sql`DELETE FROM spaces WHERE id='s-cas-1'`);

    const members = await db.execute(sql`SELECT 1 FROM space_members WHERE space_id='s-cas-1'`);
    const items   = await db.execute(sql`SELECT 1 FROM items WHERE space_id='s-cas-1'`);
    expect(members.length).toBe(0);
    expect(items.length).toBe(0);

    // cleanup
    await db.execute(sql`DELETE FROM users WHERE id='u-cas-1'`);
  });

  it('entries.item_id set null on item delete', async () => {
    await db.execute(sql`INSERT INTO users(id, username) VALUES ('u-sn-1', 'sn_user1')`);
    await db.execute(sql`INSERT INTO spaces(id, name) VALUES ('s-sn-1', 'SetNull Space')`);
    await db.execute(sql`
      INSERT INTO space_members(space_id, user_id, display_name) VALUES ('s-sn-1','u-sn-1','Carol')
    `);
    const itemRows = await db.execute(sql`
      INSERT INTO items(space_id, name) VALUES ('s-sn-1', 'SN Item') RETURNING id
    `);
    const itemId = (itemRows[0] as { id: number }).id;
    const memberRows = await db.execute(sql`
      SELECT id FROM space_members WHERE space_id='s-sn-1'
    `);
    const memberId = (memberRows[0] as { id: number }).id;

    await db.execute(sql`
      INSERT INTO entries(space_id, item_id, member_id, type, quantity, unit, date)
      VALUES ('s-sn-1', ${itemId}, ${memberId}, 'purchase', 1, 'pcs', CURRENT_DATE)
    `);

    await db.execute(sql`DELETE FROM items WHERE id=${itemId}`);

    const entry = await db.execute(sql`SELECT item_id FROM entries WHERE space_id='s-sn-1'`);
    expect((entry[0] as { item_id: number | null }).item_id).toBeNull();

    // cleanup
    await db.execute(sql`DELETE FROM spaces WHERE id='s-sn-1'`);
    await db.execute(sql`DELETE FROM users WHERE id='u-sn-1'`);
  });
});
