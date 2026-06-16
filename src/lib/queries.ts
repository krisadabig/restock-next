import { eq, and, desc, sql, gte, lte, isNotNull } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { ENTRY_TYPE } from './constants';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './db/schema';

type Db = PostgresJsDatabase<typeof schema>;

// ── Category ────────────────────────────────────────────────────────────────

export async function insertCategory(
  db: Db,
  data: { spaceId: string; name: string; defaultUnit: string },
) {
  const [category] = await db.insert(schema.categories).values(data).returning();
  return category;
}

export async function getCategories(db: Db, spaceId: string) {
  return db.select().from(schema.categories).where(eq(schema.categories.spaceId, spaceId));
}

// ── Item ────────────────────────────────────────────────────────────────────

export async function insertItem(
  db: Db,
  data: { spaceId: string; categoryId?: number | null; name: string; unit: string },
) {
  const [item] = await db.insert(schema.items).values({ ...data, currentStock: 0 }).returning();
  return item;
}

export async function updateItemRecord(
  db: Db,
  id: number,
  data: Partial<Pick<schema.Item, 'name' | 'categoryId' | 'unit' | 'lowStockThreshold' | 'alertEnabled'>>,
) {
  const [item] = await db
    .update(schema.items)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.items.id, id))
    .returning();
  return item;
}

export async function deleteItemRecord(db: Db, id: number) {
  await db.delete(schema.items).where(eq(schema.items.id, id));
}

export async function getItemsForAutocomplete(db: Db, spaceId: string) {
  const itemRows = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      unit: schema.items.unit,
      categoryName: schema.categories.name,
    })
    .from(schema.items)
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .where(eq(schema.items.spaceId, spaceId))
    .orderBy(sql`${schema.items.lastEntryAt} DESC NULLS LAST`);

  const lastPurchaseRows = await db
    .selectDistinctOn([schema.entries.itemId], {
      itemId: schema.entries.itemId,
      lastQty: schema.entries.quantity,
      lastPrice: schema.entries.price,
      lastStore: schema.entries.store,
    })
    .from(schema.entries)
    .where(and(eq(schema.entries.spaceId, spaceId), eq(schema.entries.type, ENTRY_TYPE.PURCHASE)))
    .orderBy(schema.entries.itemId, desc(schema.entries.date));

  const lastPurchaseMap = new Map(lastPurchaseRows.map((r) => [r.itemId, r]));

  return itemRows.map((r) => {
    const lp = lastPurchaseMap.get(r.id);
    return {
      id: r.id,
      name: r.name,
      unit: r.unit,
      categoryName: r.categoryName ?? null,
      lastQty: lp?.lastQty ?? null,
      lastPrice: lp?.lastPrice ?? null,
      lastStore: lp?.lastStore ?? null,
    };
  });
}

// ── Space items (Stock screen) ───────────────────────────────────────────────

export async function getSpaceItems(db: Db, spaceId: string) {
  const itemRows = await db
    .select({
      item: schema.items,
      category: schema.categories,
    })
    .from(schema.items)
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .where(eq(schema.items.spaceId, spaceId))
    .orderBy(desc(schema.items.lastEntryAt));

  const lastEntryRows = await db
    .selectDistinctOn([schema.entries.itemId], {
      entry: schema.entries,
      memberDisplayName: schema.spaceMembers.displayName,
    })
    .from(schema.entries)
    .innerJoin(schema.spaceMembers, eq(schema.entries.memberId, schema.spaceMembers.id))
    .where(and(eq(schema.entries.spaceId, spaceId), eq(schema.entries.type, ENTRY_TYPE.PURCHASE)))
    .orderBy(schema.entries.itemId, desc(schema.entries.date));

  const lastEntryMap = new Map(lastEntryRows.map((r) => [r.entry.itemId, { ...r.entry, memberDisplayName: r.memberDisplayName }]));

  return itemRows.map((r) => ({
    item: r.item,
    category: r.category,
    lastEntry: lastEntryMap.get(r.item.id) ?? null,
  }));
}

// ── Entry mutations ─────────────────────────────────────────────────────────

type InsertEntryInput = {
  spaceId: string;
  itemId: number;
  memberId: number;
  type: 'purchase' | 'consume';
  price: number | null;
  quantity: number;
  unit: string;
  store: string | null;
  date: string;
  note: string | null;
};

export async function insertEntry(db: Db, data: InsertEntryInput) {
  const stockDelta = data.type === ENTRY_TYPE.PURCHASE ? data.quantity : -data.quantity;

  const [entry] = await db.insert(schema.entries).values(data).returning();

  await db
    .update(schema.items)
    .set({
      currentStock: sql`current_stock + ${stockDelta}`,
      lastEntryAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.items.id, data.itemId));

  return entry;
}

type UpdateEntryInput = Partial<
  Pick<schema.Entry, 'type' | 'price' | 'quantity' | 'unit' | 'store' | 'date' | 'note'>
>;

export async function updateEntryRecord(db: Db, existing: schema.Entry, updates: UpdateEntryInput) {
  const merged = { ...existing, ...updates };

  const oldDelta = existing.type === ENTRY_TYPE.PURCHASE ? existing.quantity : -existing.quantity;
  const newDelta = merged.type === ENTRY_TYPE.PURCHASE ? merged.quantity : -merged.quantity;
  const correction = newDelta - oldDelta;

  const [entry] = await db
    .update(schema.entries)
    .set(updates)
    .where(eq(schema.entries.id, existing.id))
    .returning();

  if (correction !== 0 && existing.itemId !== null) {
    await db
      .update(schema.items)
      .set({ currentStock: sql`current_stock + ${correction}`, updatedAt: new Date() })
      .where(eq(schema.items.id, existing.itemId));
  }

  return entry;
}

export async function deleteEntryRecord(db: Db, entry: schema.Entry) {
  await db.delete(schema.entries).where(eq(schema.entries.id, entry.id));

  if (entry.itemId !== null) {
    const reversal = entry.type === ENTRY_TYPE.PURCHASE ? -entry.quantity : entry.quantity;
    await db
      .update(schema.items)
      .set({ currentStock: sql`current_stock + ${reversal}`, updatedAt: new Date() })
      .where(eq(schema.items.id, entry.itemId));
  }
}

// ── Item purchase history (Item Detail) ─────────────────────────────────────

export async function getItemPurchaseHistory(db: Db, itemId: number) {
  return db
    .select()
    .from(schema.entries)
    .where(and(eq(schema.entries.itemId, itemId), eq(schema.entries.type, ENTRY_TYPE.PURCHASE)))
    .orderBy(desc(schema.entries.date));
}

export async function getItemAllEntries(db: Db, itemId: number) {
  return db
    .select()
    .from(schema.entries)
    .where(eq(schema.entries.itemId, itemId))
    .orderBy(desc(schema.entries.date));
}

export async function getCategoryItems(db: Db, categoryId: number) {
  return db
    .select()
    .from(schema.items)
    .where(eq(schema.items.categoryId, categoryId))
    .orderBy(schema.items.name);
}

export async function getCategoryPurchaseEntries(db: Db, categoryId: number) {
  return db
    .select({ entry: schema.entries })
    .from(schema.entries)
    .innerJoin(schema.items, eq(schema.entries.itemId, schema.items.id))
    .where(
      and(
        eq(schema.items.categoryId, categoryId),
        eq(schema.entries.type, ENTRY_TYPE.PURCHASE),
      ),
    )
    .orderBy(desc(schema.entries.date))
    .then((rows) => rows.map((r) => r.entry));
}

// ── Category analytics ───────────────────────────────────────────────────────

export async function getCategoryMonthlySpend(db: Db, categoryId: number) {
  const rows = await db
    .select({
      month: sql<string>`to_char(${schema.entries.date}::date, 'YYYY-MM')`,
      total: sql<number>`sum(${schema.entries.price} * ${schema.entries.quantity})`,
    })
    .from(schema.entries)
    .innerJoin(schema.items, eq(schema.entries.itemId, schema.items.id))
    .where(
      and(
        eq(schema.items.categoryId, categoryId),
        eq(schema.entries.type, ENTRY_TYPE.PURCHASE),
      ),
    )
    .groupBy(sql`to_char(${schema.entries.date}::date, 'YYYY-MM')`)
    .orderBy(sql`to_char(${schema.entries.date}::date, 'YYYY-MM')`);

  return rows;
}

// ── Space spend (Price screen) ───────────────────────────────────────────────

export async function getSpaceSpend(
  db: Db,
  spaceId: string,
  from: string,
  to: string,
) {
  const [totalRow] = await db
    .select({ total: sql<number>`coalesce(sum(${schema.entries.price} * ${schema.entries.quantity}), 0)` })
    .from(schema.entries)
    .where(
      and(
        eq(schema.entries.spaceId, spaceId),
        eq(schema.entries.type, ENTRY_TYPE.PURCHASE),
        gte(schema.entries.date, from),
        lte(schema.entries.date, to),
      ),
    );

  const byCategory = await db
    .select({
      categoryId: schema.categories.id,
      categoryName: schema.categories.name,
      total: sql<number>`sum(${schema.entries.price} * ${schema.entries.quantity})`,
    })
    .from(schema.entries)
    .innerJoin(schema.items, eq(schema.entries.itemId, schema.items.id))
    .innerJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .where(
      and(
        eq(schema.entries.spaceId, spaceId),
        eq(schema.entries.type, ENTRY_TYPE.PURCHASE),
        gte(schema.entries.date, from),
        lte(schema.entries.date, to),
      ),
    )
    .groupBy(schema.categories.id, schema.categories.name)
    .orderBy(desc(sql`sum(${schema.entries.price} * ${schema.entries.quantity})`));

  return { total: totalRow.total, byCategory };
}

export async function getStoreBreakdown(
  db: Db,
  spaceId: string,
  from: string,
  to: string,
) {
  return db
    .select({
      store: schema.entries.store,
      total: sql<number>`sum(${schema.entries.price} * ${schema.entries.quantity})`,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(schema.entries)
    .where(
      and(
        eq(schema.entries.spaceId, spaceId),
        eq(schema.entries.type, ENTRY_TYPE.PURCHASE),
        isNotNull(schema.entries.store),
        gte(schema.entries.date, from),
        lte(schema.entries.date, to),
      ),
    )
    .groupBy(schema.entries.store)
    .orderBy(desc(sql`sum(${schema.entries.price} * ${schema.entries.quantity})`))
    .then((rows) =>
      rows
        .filter((r) => r.store != null)
        .map((r) => ({ store: r.store as string, total: r.total, count: r.count })),
    );
}

export async function getSpaceStores(db: Db, spaceId: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ store: schema.entries.store })
    .from(schema.entries)
    .where(
      and(
        eq(schema.entries.spaceId, spaceId),
        eq(schema.entries.type, ENTRY_TYPE.PURCHASE),
        isNotNull(schema.entries.store),
      ),
    )
    .orderBy(schema.entries.store);

  return rows.map((r) => r.store).filter((s): s is string => s != null);
}

export async function getRecentPurchases(db: Db, spaceId: string, limit = 20) {
  return db
    .select({
      entry: schema.entries,
      itemName: schema.items.name,
      categoryName: schema.categories.name,
      contributorName: schema.spaceMembers.displayName,
    })
    .from(schema.entries)
    .innerJoin(schema.items, eq(schema.entries.itemId, schema.items.id))
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .innerJoin(schema.spaceMembers, eq(schema.entries.memberId, schema.spaceMembers.id))
    .where(and(eq(schema.entries.spaceId, spaceId), eq(schema.entries.type, ENTRY_TYPE.PURCHASE)))
    .orderBy(desc(schema.entries.createdAt))
    .limit(limit);
}

// ── Space membership ─────────────────────────────────────────────────────────

export async function getActiveSpaceForUser(
  db: Db,
  userId: string,
): Promise<{ spaceId: string; memberId: number } | null> {
  const [row] = await db
    .select({
      spaceId: schema.spaceMembers.spaceId,
      memberId: schema.spaceMembers.id,
    })
    .from(schema.spaceMembers)
    .where(eq(schema.spaceMembers.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function getSpaceMembers(db: Db, spaceId: string) {
  return db
    .select({
      userId: schema.users.id,
      username: schema.users.username,
      memberId: schema.spaceMembers.id,
      displayName: schema.spaceMembers.displayName,
    })
    .from(schema.spaceMembers)
    .innerJoin(schema.users, eq(schema.spaceMembers.userId, schema.users.id))
    .where(eq(schema.spaceMembers.spaceId, spaceId));
}

export async function getUserSpaces(db: Db, userId: string) {
  return db
    .select({
      id: schema.spaces.id,
      name: schema.spaces.name,
      displayName: schema.spaceMembers.displayName,
      memberId: schema.spaceMembers.id,
    })
    .from(schema.spaceMembers)
    .innerJoin(schema.spaces, eq(schema.spaceMembers.spaceId, schema.spaces.id))
    .where(eq(schema.spaceMembers.userId, userId));
}

export async function updateSpaceMember(
  db: Db,
  memberId: number,
  patch: { displayName?: string; avatar?: string | null },
) {
  const [updated] = await db
    .update(schema.spaceMembers)
    .set(patch)
    .where(eq(schema.spaceMembers.id, memberId))
    .returning();
  return updated;
}

export async function insertSpaceWithMember(
  db: Db,
  userId: string,
  displayName: string,
  spaceName: string,
): Promise<{ spaceId: string; memberId: number }> {
  const spaceId = uuid();
  await db.insert(schema.spaces).values({ id: spaceId, name: spaceName });
  const [member] = await db.insert(schema.spaceMembers).values({ spaceId, userId, displayName }).returning();
  return { spaceId, memberId: member.id };
}
