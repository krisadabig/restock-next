import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface Entry {
	id: number;
	item: string;
	price: number;
	date: string;
	note: string | null;
}

interface PendingMutation {
	id: string; // UUID
	type: 'add' | 'edit' | 'delete';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload: any;
	timestamp: number;
}

interface RestockDB extends DBSchema {
	entries: {
		key: number;
		value: Entry;
	};
	mutations: {
		key: string;
		value: PendingMutation;
	};
}

let dbPromise: Promise<IDBPDatabase<RestockDB>>;

export const initDB = () => {
	if (!dbPromise) {
		dbPromise = openDB<RestockDB>('restock-db', 2, {
			upgrade(db) {
				if (!db.objectStoreNames.contains('entries')) {
					db.createObjectStore('entries', { keyPath: 'id' });
				}
				if (!db.objectStoreNames.contains('mutations')) {
					db.createObjectStore('mutations', { keyPath: 'id' });
				}
			},
		});
	}
	return dbPromise;
};

// Entries Cache Operations
export const saveEntriesCache = async (entries: Entry[]) => {
	const db = await initDB();
	const tx = db.transaction('entries', 'readwrite');
	// Clear old cache to avoid stale deletions persisting
	await tx.store.clear();
	for (const entry of entries) {
		await tx.store.put(entry);
	}
	await tx.done;
};

export const getEntriesCache = async (): Promise<Entry[]> => {
	const db = await initDB();
	return await db.getAll('entries');
};

// Mutation Queue Operations
export const addPendingMutation = async (mutation: PendingMutation) => {
	const db = await initDB();
	await db.put('mutations', mutation);
};

export const getPendingMutations = async (): Promise<PendingMutation[]> => {
	const db = await initDB();
	return await db.getAll('mutations');
};

export const removePendingMutation = async (id: string) => {
	const db = await initDB();
	await db.delete('mutations', id);
};

export const clearPendingMutations = async () => {
	const db = await initDB();
	await db.clear('mutations');
};
