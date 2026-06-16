'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { log } from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import * as queries from '@/lib/queries';
import { ENTRY_TYPE, DEFAULTS } from '@/lib/constants';

export type { Entry, Item, Category } from '@/lib/db/schema';

// ── Auth helper ─────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const membership = await queries.getActiveSpaceForUser(db, session.userId);
  if (!membership) throw new Error('No space found for user');

  return { userId: session.userId, username: session.username, spaceId: membership.spaceId, memberId: membership.memberId };
}

// ── Category actions ────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1),
  defaultUnit: z.string().min(1).default(DEFAULTS.UNIT),
});

export async function addCategory(raw: { name: string; defaultUnit?: string }) {
  const { spaceId } = await requireSession();
  const data = categorySchema.parse(raw);
  const category = await queries.insertCategory(db, { spaceId, ...data });
  log.info('category.add', { categoryId: category.id, spaceId });
  revalidatePath('/app');
  return category;
}

export async function getCategories() {
  const { spaceId } = await requireSession();
  return queries.getCategories(db, spaceId);
}

// ── Item actions ────────────────────────────────────────────────────────────

const itemSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1).default(DEFAULTS.UNIT),
  categoryId: z.number().int().nullable().optional(),
});

export async function addItem(raw: { name: string; unit?: string; categoryId?: number | null }) {
  const { spaceId, userId } = await requireSession();
  const data = itemSchema.parse(raw);
  const item = await queries.insertItem(db, { spaceId, ...data });
  log.info('item.add', { itemId: item.id, categoryId: item.categoryId, spaceId, userId });
  revalidatePath('/app');
  return item;
}

export async function updateItem(
  id: number,
  raw: { name?: string; unit?: string; categoryId?: number | null; lowStockThreshold?: number | null; alertEnabled?: boolean },
) {
  const { spaceId } = await requireSession();
  const existing = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, id) });
  if (!existing || existing.spaceId !== spaceId) throw new Error('Not found');
  const item = await queries.updateItemRecord(db, id, raw);
  revalidatePath('/app');
  revalidatePath(`/app/item/${id}`);
  return item;
}

export async function deleteItem(id: number) {
  const { userId, spaceId } = await requireSession();
  const existing = await db.query.items.findFirst({ where: (i, { eq }) => eq(i.id, id) });
  if (!existing || existing.spaceId !== spaceId) throw new Error('Not found');
  const entryCount = await queries.getItemAllEntries(db, id).then((e) => e.length);
  await queries.deleteItemRecord(db, id);
  log.warn('item.delete', { itemId: id, entryCount, userId });
  revalidatePath('/app');
}

export async function getSpaceItems() {
  const { spaceId } = await requireSession();
  return queries.getSpaceItems(db, spaceId);
}

export async function getItemsForAutocomplete() {
  const { spaceId } = await requireSession();
  return queries.getItemsForAutocomplete(db, spaceId);
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
  const { userId, spaceId, memberId } = await requireSession();
  const data = entrySchema.parse(raw);

  const price = data.type === ENTRY_TYPE.CONSUME ? null : (data.price ?? null);
  const store = data.type === ENTRY_TYPE.CONSUME ? null : (data.store ?? null);

  try {
    const entry = await queries.insertEntry(db, {
      memberId, spaceId, ...data,
      price,
      store,
      note: data.note ?? null,
    });
    log.info('entry.add', { entryId: entry.id, itemId: data.itemId, type: data.type, memberId, spaceId });
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
  const { userId, spaceId } = await requireSession();
  const updates = updateEntrySchema.parse(raw);

  const existing = await db.query.entries.findFirst({
    where: (e, { eq }) => eq(e.id, entryId),
  });
  if (!existing || existing.spaceId !== spaceId) throw new Error('Entry not found');

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
  const { userId, spaceId } = await requireSession();

  const existing = await db.query.entries.findFirst({
    where: (e, { eq }) => eq(e.id, entryId),
  });
  if (!existing || existing.spaceId !== spaceId) throw new Error('Entry not found');

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
  const { spaceId } = await requireSession();
  const [item, allEntries] = await Promise.all([
    db.query.items.findFirst({ where: (i, { eq, and }) => and(eq(i.id, itemId), eq(i.spaceId, spaceId)) }),
    queries.getItemAllEntries(db, itemId),
  ]);
  if (!item) return null;
  const purchaseHistory = allEntries.filter((e) => e.type === ENTRY_TYPE.PURCHASE);
  return { item, allEntries, purchaseHistory };
}

export async function getCategoryDetail(categoryId: number) {
  const { spaceId } = await requireSession();
  const [category, monthlySpend] = await Promise.all([
    db.query.categories.findFirst({ where: (c, { eq, and }) => and(eq(c.id, categoryId), eq(c.spaceId, spaceId)) }),
    queries.getCategoryMonthlySpend(db, categoryId),
  ]);
  if (!category) return null;
  const items = await db.query.items.findMany({
    where: (i, { eq }) => eq(i.categoryId, categoryId),
  });
  return { category, items, monthlySpend };
}

export async function getSpaceSpend(from: string, to: string) {
  const { spaceId } = await requireSession();
  return queries.getSpaceSpend(db, spaceId, from, to);
}

export async function getRecentPurchases(limit = 20) {
  const { spaceId } = await requireSession();
  return queries.getRecentPurchases(db, spaceId, limit);
}

export async function getSpaceMembers() {
  const { spaceId } = await requireSession();
  return queries.getSpaceMembers(db, spaceId);
}

// ── Space management ────────────────────────────────────────────────────────

export async function createSpace(name: string, displayName: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const result = await queries.insertSpaceWithMember(db, session.userId, displayName, name);
  log.info('space.create', { spaceId: result.spaceId, userId: session.userId });
  return result;
}
