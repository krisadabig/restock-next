import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

describe('Database Connection', () => {
	it('should have a valid db client', () => {
		expect(db).toBeDefined();
	});

	it('should have valid schema definitions', () => {
		expect(users).toBeDefined();
		expect(users).toBeTruthy();
	});
});
