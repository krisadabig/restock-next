import { v4 as uuid } from 'uuid';
import { createTestDb } from './db';
import * as schema from '@/lib/db/schema';

type Db = ReturnType<typeof createTestDb>['db'];

export async function makeUser(db: Db, overrides: Partial<schema.User> = {}): Promise<schema.User> {
  const [user] = await db.insert(schema.users).values({
    id: uuid(),
    username: `user_${Math.random().toString(36).slice(2, 8)}`,
    passwordHash: 'hashed',
    ...overrides,
  }).returning();
  return user;
}

export async function makeSpace(db: Db, overrides: Partial<schema.Space> = {}): Promise<schema.Space> {
  const [space] = await db.insert(schema.spaces).values({
    id: uuid(),
    name: 'Test Space',
    ...overrides,
  }).returning();
  return space;
}

export async function makeSpaceMember(
  db: Db,
  spaceId: string,
  userId: string,
  displayName = 'Test User',
  overrides: Partial<schema.SpaceMember> = {},
): Promise<schema.SpaceMember> {
  const [member] = await db.insert(schema.spaceMembers).values({
    spaceId,
    userId,
    displayName,
    ...overrides,
  }).returning();
  return member;
}

export async function makeCategory(db: Db, spaceId: string, overrides: Partial<schema.Category> = {}): Promise<schema.Category> {
  const [category] = await db.insert(schema.categories).values({
    spaceId,
    name: 'Test Category',
    defaultUnit: 'pcs',
    ...overrides,
  }).returning();
  return category;
}

export async function makeItem(db: Db, spaceId: string, categoryId: number, overrides: Partial<schema.Item> = {}): Promise<schema.Item> {
  const [item] = await db.insert(schema.items).values({
    spaceId,
    categoryId,
    name: 'Test Item',
    unit: 'pcs',
    currentStock: 0,
    ...overrides,
  }).returning();
  return item;
}

export async function makeEntry(db: Db, spaceId: string, itemId: number, memberId: number, overrides: Partial<schema.Entry> = {}): Promise<schema.Entry> {
  const [entry] = await db.insert(schema.entries).values({
    spaceId,
    itemId,
    memberId,
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
