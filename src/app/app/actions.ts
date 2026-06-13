'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { log } from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import * as queries from '@/lib/queries';
import { ENTRY_TYPE, DEFAULTS } from '@/lib/constants';

export type { Entry, Item, Category, Household } from '@/lib/db/schema';

// ── Auth helper ─────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const householdId = await queries.getHouseholdForUser(db, session.userId);
  if (!householdId) throw new Error('No household found for user');

  return { userId: session.userId, username: session.username, householdId };
}

// ── Category actions ────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1),
  defaultUnit: z.string().min(1).default(DEFAULTS.UNIT),
});

export async function addCategory(raw: { name: string; defaultUnit?: string }) {
  const { householdId } = await requireSession();
  const data = categorySchema.parse(raw);
  const category = await queries.insertCategory(db, { householdId, ...data });
  log.info('category.add', { categoryId: category.id, householdId });
  revalidatePath('/app');
  return category;
}

export async function getCategories() {
  const { householdId } = await requireSession();
  return queries.getCategories(db, householdId);
}

// ── Item actions ────────────────────────────────────────────────────────────

const itemSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1).default(DEFAULTS.UNIT),
  categoryId: z.number().int().nullable().optional(),
});

export async function addItem(raw: { name: string; unit?: string; categoryId?: number | null }) {
  const { householdId, userId } = await requireSession();
  const data = itemSchema.parse(raw);
  const item = await queries.insertItem(db, { householdId, ...data });
  log.info('item.add', { itemId: item.id, categoryId: item.categoryId, householdId, userId });
  revalidatePath('/app');
  return item;
}

export async function updateItem(
  id: number,
  raw: { name?: string; unit?: string; categoryId?: number | null; lowStockThreshold?: number | null; alertEnabled?: number },
) {
  const { householdId } = await requireSession();
  const existing = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, id) });
  if (!existing || existing.householdId !== householdId) throw new Error('Not found');
  const item = await queries.updateItemRecord(db, id, raw);
  revalidatePath('/app');
  revalidatePath(`/app/item/${id}`);
  return item;
}

export async function deleteItem(id: number) {
  const { userId, householdId } = await requireSession();
  const existing = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, id) });
  if (!existing || existing.householdId !== householdId) throw new Error('Not found');
  const entryCount = await queries.getItemAllEntries(db, id).then((e) => e.length);
  await queries.deleteItemRecord(db, id);
  log.warn('item.delete', { itemId: id, entryCount, userId });
  revalidatePath('/app');
}

export async function getHouseholdItems() {
  const { householdId } = await requireSession();
  return queries.getHouseholdItems(db, householdId);
}

export async function getItemsForAutocomplete() {
  const { householdId } = await requireSession();
  return queries.getItemsForAutocomplete(db, householdId);
}

// ── Entry actions ────────────────────────────────────────────────────────────

const entrySchema = z.object({
  itemId: z.number().int(),
  type: z.enum([ENTRY_TYPE.PURCHASE, ENTRY_TYPE.CONSUME]),
  price: z.number().nullable().optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  store: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().nullable().optional(),
});

export async function addEntry(raw: z.input<typeof entrySchema>) {
  const { userId, householdId } = await requireSession();
  const data = entrySchema.parse(raw);

  const price = data.type === ENTRY_TYPE.CONSUME ? null : (data.price ?? null);
  const store = data.type === ENTRY_TYPE.CONSUME ? null : (data.store ?? null);

  try {
    const entry = await queries.insertEntry(db, {
      userId, householdId, ...data,
      price,
      store,
      note: data.note ?? null,
    });
    log.info('entry.add', { entryId: entry.id, itemId: data.itemId, type: data.type, userId, householdId });
    revalidatePath('/app');
    revalidatePath(`/app/item/${data.itemId}`);
    return entry;
  } catch (e) {
    log.error('entry.add.failed', { error: (e as Error).message, itemId: data.itemId, userId });
    throw e;
  }
}

const updateEntrySchema = z.object({
  type: z.enum([ENTRY_TYPE.PURCHASE, ENTRY_TYPE.CONSUME]).optional(),
  price: z.number().nullable().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
  store: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  note: z.string().nullable().optional(),
});

export async function updateEntry(entryId: number, raw: z.input<typeof updateEntrySchema>) {
  const { userId, householdId } = await requireSession();
  const updates = updateEntrySchema.parse(raw);

  const existing = await db.query.entries.findFirst({
    where: (e, { eq }) => eq(e.id, entryId),
  });
  if (!existing || existing.householdId !== householdId) throw new Error('Entry not found');

  try {
    const entry = await queries.updateEntryRecord(db, existing, updates);
    log.info('entry.update', { entryId, changes: Object.keys(updates), userId });
    revalidatePath('/app');
    revalidatePath(`/app/item/${existing.itemId}`);
    return entry;
  } catch (e) {
    log.error('entry.update.failed', { error: (e as Error).message, entryId, userId });
    throw e;
  }
}

export async function deleteEntry(entryId: number) {
  const { userId, householdId } = await requireSession();

  const existing = await db.query.entries.findFirst({
    where: (e, { eq }) => eq(e.id, entryId),
  });
  if (!existing || existing.householdId !== householdId) throw new Error('Entry not found');

  try {
    await queries.deleteEntryRecord(db, existing);
    log.info('entry.delete', { entryId, itemId: existing.itemId, userId });
    revalidatePath('/app');
    revalidatePath(`/app/item/${existing.itemId}`);
  } catch (e) {
    log.error('entry.delete.failed', { error: (e as Error).message, entryId, userId });
    throw e;
  }
}

// ── Query actions ────────────────────────────────────────────────────────────

export async function getItemDetail(itemId: number) {
  const { householdId } = await requireSession();
  const [item, allEntries] = await Promise.all([
    db.query.items.findFirst({ where: (i, { eq, and }) => and(eq(i.id, itemId), eq(i.householdId, householdId)) }),
    queries.getItemAllEntries(db, itemId),
  ]);
  if (!item) return null;
  const purchaseHistory = allEntries.filter((e) => e.type === ENTRY_TYPE.PURCHASE);
  return { item, allEntries, purchaseHistory };
}

export async function getCategoryDetail(categoryId: number) {
  const { householdId } = await requireSession();
  const [category, monthlySpend] = await Promise.all([
    db.query.categories.findFirst({ where: (c, { eq, and }) => and(eq(c.id, categoryId), eq(c.householdId, householdId)) }),
    queries.getCategoryMonthlySpend(db, categoryId),
  ]);
  if (!category) return null;
  const items = await db.query.items.findMany({
    where: (i, { eq }) => eq(i.categoryId, categoryId),
  });
  return { category, items, monthlySpend };
}

export async function getHouseholdSpend(from: string, to: string) {
  const { householdId } = await requireSession();
  return queries.getHouseholdSpend(db, householdId, from, to);
}

export async function getRecentPurchases(limit = 20) {
  const { householdId } = await requireSession();
  return queries.getRecentPurchases(db, householdId, limit);
}

export async function getHouseholdMembers() {
  const { householdId } = await requireSession();
  return queries.getHouseholdMembers(db, householdId);
}

