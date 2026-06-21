import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Item, Category, Entry } from './db/schema';

export type MutationType =
  | 'entry.add'
  | 'entry.update'
  | 'entry.delete';

export interface PendingMutation {
  id: string;
  type: MutationType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: number;
}

interface RestockDB extends DBSchema {
  items: { key: number; value: Item };
  categories: { key: number; value: Category };
  entries: { key: number; value: Entry };
  mutations: { key: string; value: PendingMutation };
}

let dbPromise: Promise<IDBPDatabase<RestockDB>> | null = null;

/** Only call this in tests to reset the singleton between test runs. */
export function resetDBForTests() {
  dbPromise = null;
}

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<RestockDB>('restock-db', 3, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('items')) {
          db.createObjectStore('items', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
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

// ── Items cache ──────────────────────────────────────────────────────────────

export const saveItemsCache = async (items: Item[]) => {
  const db = await initDB();
  const tx = db.transaction('items', 'readwrite');
  await tx.store.clear();
  for (const item of items) await tx.store.put(item);
  await tx.done;
};

export const getItemsCache = async (): Promise<Item[]> => {
  const db = await initDB();
  return db.getAll('items');
};

// ── Categories cache ─────────────────────────────────────────────────────────

export const saveCategoriesCache = async (categories: Category[]) => {
  const db = await initDB();
  const tx = db.transaction('categories', 'readwrite');
  await tx.store.clear();
  for (const cat of categories) await tx.store.put(cat);
  await tx.done;
};

export const getCategoriesCache = async (): Promise<Category[]> => {
  const db = await initDB();
  return db.getAll('categories');
};

// ── Entries cache ────────────────────────────────────────────────────────────

export const saveEntriesCache = async (entries: Entry[]) => {
  const db = await initDB();
  const tx = db.transaction('entries', 'readwrite');
  await tx.store.clear();
  for (const entry of entries) await tx.store.put(entry);
  await tx.done;
};

export const getEntriesCache = async (): Promise<Entry[]> => {
  const db = await initDB();
  return db.getAll('entries');
};

// ── Mutation queue ───────────────────────────────────────────────────────────

export const addPendingMutation = async (mutation: PendingMutation) => {
  const db = await initDB();
  await db.put('mutations', mutation);
};

export const getPendingMutations = async (): Promise<PendingMutation[]> => {
  const db = await initDB();
  return db.getAll('mutations');
};

export const removePendingMutation = async (id: string) => {
  const db = await initDB();
  await db.delete('mutations', id);
};

export const clearPendingMutations = async () => {
  const db = await initDB();
  await db.clear('mutations');
};
