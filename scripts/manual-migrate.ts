import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
	console.log('Migrating database...');
	try {
		await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" text;`;
		console.log('Added email column');
		await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;`;
		console.log('Added password_hash column');
	} catch (e) {
		console.error('Migration failed:', e);
	} finally {
		await sql.end();
	}
}

main();
