import { runMigrations } from '../helpers/db';

// Runs once before all integration tests — applies migrations to test DB
export async function setup() {
  await runMigrations();
}
