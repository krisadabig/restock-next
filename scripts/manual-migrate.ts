import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function migrate() {
	const sql = postgres(process.env.DATABASE_URL!);

	console.log('Migrating database...');
	try {
		await sql`ALTER TABLE entries ADD COLUMN IF NOT EXISTS quantity real DEFAULT 1`;
		await sql`ALTER TABLE entries ADD COLUMN IF NOT EXISTS unit text DEFAULT 'pcs'`;
		console.log('Migration successful!');
	} catch (err) {
		console.error('Migration failed:', err);
	} finally {
		await sql.end();
	}
}

migrate();
