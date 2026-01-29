import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addEntry } from '@/app/app/actions';
import { db } from '@/lib/db';
import { inventory } from '@/lib/db/schema';

const mockValues = vi.fn().mockReturnValue({
	returning: vi.fn().mockResolvedValue([{ id: 1 }]),
});

const mockInsert = vi.fn().mockReturnValue({
	values: mockValues,
});

// Mock DB
vi.mock('@/lib/db', () => ({
	db: {
		insert: (table: unknown) => mockInsert(table),
		select: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}));

// Mock Auth
vi.mock('@/lib/session', () => ({
	getSession: vi.fn().mockResolvedValue({ userId: 'test-user', username: 'testuser' }),
}));

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

describe('Inventory Quantity Management', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockValues.mockClear();
		mockInsert.mockClear();
	});

	it('should update inventory quantity and unit when adding a new entry', async () => {
		const rawData = {
			item: 'Milk',
			price: 50,
			date: '2026-01-29',
			quantity: 2,
			unit: 'liters',
		};

		// Mock create transaction returning the item with quantity and unit
		/* const mockTx = {
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnValue([{ id: 100, item: 'Milk', quantity: 2, unit: 'liters' }]),
	}; */
		// Mock select for existing inventory (not found)
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([]),
				}),
			}),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as unknown as any);

		// This SHOULD fail or ignore quantity/unit since it's not implemented
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await addEntry(rawData as unknown as any);

		// Verify inventory insert
		expect(mockInsert).toHaveBeenCalledWith(inventory);

		// Check values passed to inventory insert
		// Since addEntry calls insert twice (entries then inventory),
		// we need to find the one for inventory
		const inventoryCallIndex = mockInsert.mock.calls.findIndex((call) => call[0] === inventory);
		const inventoryValues = mockValues.mock.calls[inventoryCallIndex][0];

		expect(inventoryValues).toMatchObject({
			item: 'Milk',
			quantity: 2,
			unit: 'liters',
		});
	});
});
