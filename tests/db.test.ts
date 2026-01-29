import { describe, it, expect, vi } from 'vitest';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

// Mock DB
vi.mock('@/lib/db', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('Database Client', () => {
	it('should have a valid db client', () => {
		expect(db).toBeDefined();
	});

	it('should have valid schema definitions', () => {
		expect(users).toBeDefined();
		expect(users).toBeTruthy();
	});
});
