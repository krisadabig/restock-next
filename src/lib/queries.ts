import { eq, and, desc, sql, gte, lte, isNotNull } from 'drizzle-orm';
import { ENTRY_TYPE } from './constants';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './db/schema';

type Db = PostgresJsDatabase<typeof schema>;

// ── Category ────────────────────────────────────────────────────────────────

export async function insertCategory(
  db: Db,
  data: { householdId: string; name: string; defaultUnit: string },
) {
  const [category] = await db.insert(schema.categories).values(data).returning();
  return category;
}

export async function getCategories(db: Db, householdId: string) {
  return db.select().from(schema.categories).where(eq(schema.categories.householdId, householdId));
}

// ── Item ────────────────────────────────────────────────────────────────────

export async function insertItem(
  db: Db,
  data: { householdId: string; categoryId?: number | null; name: string; unit: string },
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

export async function getItemsForAutocomplete(db: Db, householdId: string) {
  const itemRows = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      unit: schema.items.unit,
      categoryName: schema.categories.name,
    })
    .from(schema.items)
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .where(eq(schema.items.householdId, householdId))
    .orderBy(sql`${schema.items.lastEntryAt} DESC NULLS LAST`);

  const lastPurchaseRows = await db
    .selectDistinctOn([schema.entries.itemId], {
      itemId: schema.entries.itemId,
      lastQty: schema.entries.quantity,
      lastPrice: schema.entries.price,
      lastStore: schema.entries.store,
    })
    .from(schema.entries)
    .where(and(eq(schema.entries.householdId, householdId), eq(schema.entries.type, ENTRY_TYPE.PURCHASE)))
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

// ── Household items (Stock screen) ──────────────────────────────────────────

export async function getHouseholdItems(db: Db, householdId: string) {
  const itemRows = await db
    .select({
      item: schema.items,
      category: schema.categories,
    })
    .from(schema.items)
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .where(eq(schema.items.householdId, householdId))
    .orderBy(desc(schema.items.lastEntryAt));

  // Fetch last purchase entry per item
  const lastEntryRows = await db
    .selectDistinctOn([schema.entries.itemId], {
      entry: schema.entries,
    })
    .from(schema.entries)
    .where(and(eq(schema.entries.householdId, householdId), eq(schema.entries.type, ENTRY_TYPE.PURCHASE)))
    .orderBy(schema.entries.itemId, desc(schema.entries.date));

  const lastEntryMap = new Map(lastEntryRows.map((r) => [r.entry.itemId, r.entry]));

  return itemRows.map((r) => ({
    item: r.item,
    category: r.category,
    lastEntry: lastEntryMap.get(r.item.id) ?? null,
  }));
}

// ── Entry mutations ─────────────────────────────────────────────────────────

type InsertEntryInput = {
  householdId: string;
  itemId: number;
  userId: string;
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

// ── Household spend (Price screen) ──────────────────────────────────────────

export async function getHouseholdSpend(
  db: Db,
  householdId: string,
  from: string,
  to: string,
) {
  const [totalRow] = await db
    .select({ total: sql<number>`coalesce(sum(${schema.entries.price} * ${schema.entries.quantity}), 0)` })
    .from(schema.entries)
    .where(
      and(
        eq(schema.entries.householdId, householdId),
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
        eq(schema.entries.householdId, householdId),
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
  householdId: string,
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
        eq(schema.entries.householdId, householdId),
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

export async function getHouseholdStores(db: Db, householdId: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ store: schema.entries.store })
    .from(schema.entries)
    .where(
      and(
        eq(schema.entries.householdId, householdId),
        eq(schema.entries.type, ENTRY_TYPE.PURCHASE),
        isNotNull(schema.entries.store),
      ),
    )
    .orderBy(schema.entries.store);

  return rows.map((r) => r.store).filter((s): s is string => s != null);
}

export async function getRecentPurchases(db: Db, householdId: string, limit = 20) {
  return db
    .select({
      entry: schema.entries,
      itemName: schema.items.name,
      categoryName: schema.categories.name,
      contributorName: schema.users.username,
    })
    .from(schema.entries)
    .innerJoin(schema.items, eq(schema.entries.itemId, schema.items.id))
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .innerJoin(schema.users, eq(schema.entries.userId, schema.users.id))
    .where(and(eq(schema.entries.householdId, householdId), eq(schema.entries.type, ENTRY_TYPE.PURCHASE)))
    .orderBy(desc(schema.entries.createdAt))
    .limit(limit);
}

// ── Groups ──────────────────────────────────────────────────────────────────

export async function insertGroup(db: Db, data: { householdId: string; name: string }) {
  const [group] = await db.insert(schema.groups).values(data).returning();
  return group;
}

export async function updateGroupName(db: Db, id: number, name: string) {
  const [group] = await db
    .update(schema.groups)
    .set({ name })
    .where(eq(schema.groups.id, id))
    .returning();
  return group;
}

export async function deleteGroupRecord(db: Db, id: number) {
  await db.delete(schema.groups).where(eq(schema.groups.id, id));
}

export async function getGroups(db: Db, householdId: string) {
  return db
    .select()
    .from(schema.groups)
    .where(eq(schema.groups.householdId, householdId))
    .orderBy(schema.groups.name);
}

export async function insertGroupItem(db: Db, data: { groupId: number; itemId: number }) {
  await db.insert(schema.groupItems).values(data).onConflictDoNothing();
}

export async function deleteGroupItem(db: Db, groupId: number, itemId: number) {
  await db
    .delete(schema.groupItems)
    .where(and(eq(schema.groupItems.groupId, groupId), eq(schema.groupItems.itemId, itemId)));
}

export async function getGroupItems(db: Db, groupId: number) {
  return db
    .select({ item: schema.items })
    .from(schema.groupItems)
    .innerJoin(schema.items, eq(schema.groupItems.itemId, schema.items.id))
    .where(eq(schema.groupItems.groupId, groupId))
    .orderBy(schema.items.name)
    .then((rows) => rows.map((r) => r.item));
}

// ── Household ────────────────────────────────────────────────────────────────

export async function getHouseholdForUser(db: Db, userId: string) {
  const [member] = await db
    .select({ householdId: schema.householdMembers.householdId })
    .from(schema.householdMembers)
    .where(eq(schema.householdMembers.userId, userId))
    .limit(1);
  return member?.householdId ?? null;
}

export async function getHouseholdMembers(db: Db, householdId: string) {
  return db
    .select({ userId: schema.users.id, username: schema.users.username })
    .from(schema.householdMembers)
    .innerJoin(schema.users, eq(schema.householdMembers.userId, schema.users.id))
    .where(eq(schema.householdMembers.householdId, householdId));
}
