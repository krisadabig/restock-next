import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '@/lib/db/schema';

const TEST_DB_URL =
  process.env.DATABASE_URL_TEST ??
  'postgres://postgres:postgres@localhost:5432/restock_test';

export function createTestDb() {
  const client = postgres(TEST_DB_URL, { max: 1 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export async function runMigrations() {
  const client = postgres(TEST_DB_URL, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: './drizzle' });
  await client.end();
}

// Call in beforeEach to start each test with a clean slate
export async function resetDb(db: ReturnType<typeof createTestDb>['db']) {
  await db.delete(schema.entries);
  await db.delete(schema.items);
  await db.delete(schema.categories);
  await db.delete(schema.householdMembers);
  await db.delete(schema.households);
  await db.delete(schema.authenticators);
  await db.delete(schema.users);
}
