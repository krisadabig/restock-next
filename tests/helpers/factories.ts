import { v4 as uuid } from 'uuid';
import { createTestDb } from './db';
import * as schema from '@/lib/db/schema';

type Db = ReturnType<typeof createTestDb>['db'];

// Minimal seed helpers — build only what the test needs

export async function makeUser(db: Db, overrides: Partial<schema.User> = {}): Promise<schema.User> {
  const [user] = await db.insert(schema.users).values({
    id: uuid(),
    username: `user_${Math.random().toString(36).slice(2, 8)}`,
    passwordHash: 'hashed',
    ...overrides,
  }).returning();
  return user;
}

export async function makeHousehold(db: Db, userId: string, overrides: Partial<schema.Household> = {}): Promise<schema.Household> {
  const [household] = await db.insert(schema.households).values({
    id: uuid(),
    name: 'Test Household',
    ...overrides,
  }).returning();

  await db.insert(schema.householdMembers).values({
    householdId: household.id,
    userId,
  });

  return household;
}

export async function makeCategory(db: Db, householdId: string, overrides: Partial<schema.Category> = {}): Promise<schema.Category> {
  const [category] = await db.insert(schema.categories).values({
    householdId,
    name: 'Test Category',
    defaultUnit: 'pcs',
    ...overrides,
  }).returning();
  return category;
}

export async function makeItem(db: Db, householdId: string, categoryId: number, overrides: Partial<schema.Item> = {}): Promise<schema.Item> {
  const [item] = await db.insert(schema.items).values({
    householdId,
    categoryId,
    name: 'Test Item',
    unit: 'pcs',
    currentStock: 0,
    ...overrides,
  }).returning();
  return item;
}

export async function makeEntry(db: Db, householdId: string, itemId: number, userId: string, overrides: Partial<schema.Entry> = {}): Promise<schema.Entry> {
  const [entry] = await db.insert(schema.entries).values({
    householdId,
    itemId,
    userId,
    type: 'purchase',
    price: 100,
    quantity: 1,
    unit: 'pcs',
    store: 'Big C',
    date: new Date().toISOString().slice(0, 10),
    ...overrides,
  }).returning();
  return entry;
}
