import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addEntry, toggleItemStatus, getInventory } from '@/app/app/actions';
import { db } from '@/lib/db';

// Mock next/cache
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

// Mock DB
vi.mock('@/lib/db', () => {
	const mockDb = {
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockResolvedValue([{ id: 1 }]),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockResolvedValue([]),
		orderBy: vi.fn().mockResolvedValue([]),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	};
	return { db: mockDb };
});

// Mock getUser to return a test user
vi.mock('@/lib/session', () => ({
	getSession: vi.fn().mockResolvedValue({ userId: 'test-user', username: 'testuser' }),
}));

describe('Inventory Actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create an inventory record when a new entry is added', async () => {
		// This test verifies that addEntry also triggers inventory creation if it doesn't exist
		await addEntry({ item: 'Milk', price: 45, date: '2026-01-29' });

		// We expect db.insert to be called 3 times: User sync, Entry, and Inventory
		expect(db.insert).toHaveBeenCalledTimes(3);
	});

	it('should toggle item status correctly', async () => {
		await toggleItemStatus('Milk', 'out-of-stock');
		expect(db.update).toHaveBeenCalled();
	});

	it('should retrieves inventory for the current user', async () => {
		await getInventory();
		expect(db.select).toHaveBeenCalled();
	});
});
