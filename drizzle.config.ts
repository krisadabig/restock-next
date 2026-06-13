import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const LOCAL_DB = 'postgres://postgres:postgres@localhost:5432/restock';

export default defineConfig({
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? LOCAL_DB,
	},
	migrations: {
		table: '__drizzle_migrations',
	},
});
