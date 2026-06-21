import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load .env.local for local dev.
// For prod migrations, the caller (release script or shell) must set DATABASE_URL in the
// environment before invoking drizzle-kit — dotenv will not override an already-set var.
dotenv.config({ path: '.env.local' });

export default defineConfig({
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/restock',
	},
	migrations: {
		table: '__drizzle_migrations',
	},
});
