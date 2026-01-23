import { describe, it, expect, beforeEach } from 'vitest';
import {
	initDB,
	saveEntriesCache,
	getEntriesCache,
	addPendingMutation,
	getPendingMutations,
	clearPendingMutations,
} from './idb';
import 'fake-indexeddb/auto';

describe('IndexedDB Logic', () => {
	beforeEach(async () => {
		// Reset DB state (simulated)
		const db = await initDB();
		await db.clear('entries');
		await db.clear('mutations');
	});

	it('should initialize DB with correct object stores', async () => {
		const db = await initDB();
		expect(db.objectStoreNames.contains('entries')).toBe(true);
		expect(db.objectStoreNames.contains('mutations')).toBe(true);
	});

	it('should save and retrieve entries cache', async () => {
		const mockEntries = [
			{ id: 1, item: 'Milk', price: 2.5, date: '2023-01-01', note: null },
			{ id: 2, item: 'Bread', price: 1.5, date: '2023-01-02', note: 'Whole wheat' },
		];

		await saveEntriesCache(mockEntries);
		const retrieved = await getEntriesCache();

		expect(retrieved).toHaveLength(2);
		expect(retrieved).toEqual(expect.arrayContaining(mockEntries));
	});

	it('should queue and retrieve mutations', async () => {
		const mutation = {
			id: 'uuid-123',
			type: 'add' as const,
			payload: { item: 'Test', price: 10, date: '2023-01-01' },
			timestamp: 1234567890,
		};

		await addPendingMutation(mutation);
		const mutations = await getPendingMutations();

		expect(mutations).toHaveLength(1);
		expect(mutations[0]).toEqual(mutation);
	});

	it('should clear mutations', async () => {
		const mutation = {
			id: 'uuid-123',
			type: 'add' as const,
			payload: { item: 'Test', price: 10, date: '2023-01-01' },
			timestamp: 1234567890,
		};

		await addPendingMutation(mutation);
		await clearPendingMutations();
		const mutations = await getPendingMutations();

		expect(mutations).toHaveLength(0);
	});
});
