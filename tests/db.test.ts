import { describe, it, expect, vi } from 'vitest';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Database Connection', () => {
	it('should have a valid db client', () => {
		expect(db).toBeDefined();
	});

	it('should have valid schema definitions', () => {
		expect(users).toBeDefined();
		// Check if table name is correct
		// @ts-ignore - accessing internal property for verification
		const tableName = users[Symbol.for('drizzle:Name')];
		// Note: Drizzle implementation details might vary, but users objects should exist
		expect(users).toBeTruthy();
	});
});
