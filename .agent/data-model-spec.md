# Restock — Data Model Spec

> **Source**: Derived from ux-spec.md and existing schema in src/lib/db/schema.ts.
> **Approach**: Clean start — old schema is prototype, drop and recreate. No migration needed.
> **ORM**: Drizzle ORM (PostgreSQL via Supabase)

---

## 1. Problem with Current Schema

```ts
// Current — item is a raw string, scoped per user
entries   { item: text, price, quantity, unit, type, date, note, userId }
inventory { item: text, quantity, unit, status, alertEnabled, userId }
```

**Three blockers for the new product:**

| Blocker | Impact |
|---|---|
| `item` is a free string — no hierarchy | Can't group "Downy 1L Lavender" and "Comfort 750ml" under "Fabric Softener" |
| No `store` field on entries | Can't do store price comparison (Big C vs CJ) |
| Data scoped to `userId` | Both partners can't see each other's entries |

---

## 2. New Tables

### 2.1 `households`

One household per couple. All shared data hangs off this.

```ts
export const households = pgTable('households', {
  id: text('id').primaryKey(), // uuid
  name: text('name').notNull(), // e.g. "Our Home"
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 2.2 `household_members`

Links users to a household. Both partners are members of the same household.

```ts
export const householdMembers = pgTable('household_members', {
  id: serial('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow(),
});
```

**Unique constraint**: one user can only be a member of one household at a time.
```ts
// unique(['household_id', 'user_id'])
```

### 2.3 `categories`

User-defined groupings. Scoped to household.

```ts
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),       // e.g. "Fabric Softener", "Meat"
  defaultUnit: text('default_unit').notNull().default('pcs'), // suggested unit for new items
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 2.4 `items`

Specific products within a category. Name carries all variant info.

```ts
export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),          // e.g. "Downy 1L Lavender", "Chicken Breast 500g"
  unit: text('unit').notNull().default('pcs'),
  currentStock: real('current_stock').notNull().default(0), // denormalized, updated on every entry
  lowStockThreshold: real('low_stock_threshold'),           // null = no alert
  alertEnabled: integer('alert_enabled').notNull().default(1),
  lastEntryAt: timestamp('last_entry_at'),                  // for "Recent" sort on Stock screen
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Why store `currentStock` instead of computing it:**
- Performance: Stock screen loads all items — summing all entries per item on every load is expensive.
- Offline: IndexedDB snapshot needs a single authoritative value per item, not a derived computation.
- Rule: `currentStock` is always updated atomically with the entry write in the same server action.

---

## 3. Changes to Existing Tables

### 3.1 `entries` — add `itemId`, `store`, `householdId`

```ts
// New columns added to existing entries table
itemId: integer('item_id')
  .references(() => items.id, { onDelete: 'set null' }),  // nullable during migration
store: text('store'),          // "Big C", "CJ", free text — null for consume entries
householdId: text('household_id')
  .references(() => households.id, { onDelete: 'cascade' }),

// Existing columns PRESERVED (not removed):
// item: text — kept for backwards compat, will be legacy after migration
// userId: text — repurposed: was "whose data", now "who logged this" (activity feed)
// price: real — note: price is per unit, not total
```

**Semantic change for `userId` on entries:**
- Before migration: `userId` = data ownership (filter to see your own entries)
- After migration: `userId` = attribution (who in the household logged this entry)
- Query filter shifts from `userId` to `householdId`

### 3.2 `inventory` — add `itemId`

```ts
// New column added to existing inventory table
itemId: integer('item_id')
  .references(() => items.id, { onDelete: 'set null' }),  // nullable during migration

// Existing columns PRESERVED
// item: text — legacy, kept for backwards compat
// quantity, unit, status, alertEnabled, userId — all preserved
```

**Long-term fate of `inventory` table:**
The `items` table now owns stock state (`currentStock`, `lowStockThreshold`, `alertEnabled`). The `inventory` table becomes redundant after migration and can be deprecated in a future release. For now it stays to avoid breaking existing queries.

---

## 4. Full Schema Overview

```
households
  ├── household_members  (userId → households)
  ├── categories         (householdId)
  │     └── items        (categoryId, householdId)
  │           └── entries (itemId, householdId, userId for attribution)
  └── entries            (householdId — direct, for queries before items exist)

users
  ├── household_members  (userId → households)
  ├── entries            (userId — attribution)
  └── authenticators     (unchanged)
```

---

## 5. Clean Start Approach

Old prototype schema is dropped entirely. No migration, no backwards compat.

```sql
-- Drop all old tables (run once on the Supabase project before first deploy)
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS entries CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS authenticators CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run: bun run db:push
-- Drizzle will create all tables fresh from the new schema.ts
```

**What is kept from the prototype:**
- Auth flow (JWT + Passkeys) — logic unchanged, `users` + `authenticators` tables recreated with same structure
- Drizzle ORM pattern — same tooling
- All other prototype data: discarded (it was never real production data)

---

## 6. Stock Count Logic

`items.currentStock` is the single source of truth. All entry mutations must update it atomically.

### On Purchase (addEntry, type = 'purchase')

```ts
// In server action — both writes in one transaction
await db.insert(entries).values({ itemId, type: 'purchase', quantity, price, store, ... });
await db.update(items)
  .set({ currentStock: sql`current_stock + ${quantity}`, lastEntryAt: new Date() })
  .where(eq(items.id, itemId));
```

### On Consume (addEntry, type = 'consume')

```ts
await db.insert(entries).values({ itemId, type: 'consume', quantity, ... });
await db.update(items)
  .set({ currentStock: sql`current_stock - ${quantity}`, lastEntryAt: new Date() })
  .where(eq(items.id, itemId));
// Note: allow negative stock (user may log consume before logging prior purchase)
```

### On Delete Entry

```ts
// Reverse the delta
const delta = entry.type === 'purchase' ? -entry.quantity : +entry.quantity;
await db.delete(entries).where(eq(entries.id, entryId));
await db.update(items)
  .set({ currentStock: sql`current_stock + ${delta}` })
  .where(eq(items.id, entry.itemId));
```

### On Edit Entry

```ts
// Compute old delta and new delta, apply difference
const oldDelta = old.type === 'purchase' ? old.quantity : -old.quantity;
const newDelta = updated.type === 'purchase' ? updated.quantity : -updated.quantity;
const correction = newDelta - oldDelta;

await db.update(entries).set({ ...updated }).where(eq(entries.id, entryId));
await db.update(items)
  .set({ currentStock: sql`current_stock + ${correction}` })
  .where(eq(items.id, itemId));
```

### Stock Status Derivation (computed, not stored)

```ts
function stockStatus(item: Item): 'out' | 'low' | 'ok' {
  if (item.currentStock <= 0) return 'out';
  if (item.lowStockThreshold && item.currentStock <= item.lowStockThreshold) return 'low';
  return 'ok';
}
```

---

## 7. Key Queries

### Stock Screen — all items for a household

```ts
const stockItems = await db
  .select()
  .from(items)
  .leftJoin(categories, eq(items.categoryId, categories.id))
  .where(eq(items.householdId, householdId))
  .orderBy(items.lastEntryAt);

// Then fetch lastEntry per item for "last price + store + date" display
const lastEntries = await db
  .selectDistinctOn([entries.itemId])
  .from(entries)
  .where(and(
    eq(entries.householdId, householdId),
    eq(entries.type, 'purchase')
  ))
  .orderBy(entries.itemId, desc(entries.date));
```

### Item Detail — price intelligence

```ts
// All purchase entries for an item
const purchaseHistory = await db
  .select()
  .from(entries)
  .where(and(
    eq(entries.itemId, itemId),
    eq(entries.type, 'purchase')
  ))
  .orderBy(desc(entries.date));

// Derived in application layer (not SQL):
// avgPrice = mean(purchaseHistory.map(e => e.price))
// bestPrice = min(purchaseHistory.map(e => e.price))
// lastPrice = purchaseHistory[0].price
// dealSignal = lastPrice < avgPrice

// Store comparison
const storeAvgs = purchaseHistory.reduce((acc, e) => {
  if (!e.store) return acc;
  acc[e.store] = acc[e.store] ?? { total: 0, count: 0 };
  acc[e.store].total += e.price;
  acc[e.store].count += 1;
  return acc;
}, {});
```

### Category View — all items + spend

```ts
const categoryItems = await db
  .select()
  .from(items)
  .where(eq(items.categoryId, categoryId));

// Total spend per month
const categorySpend = await db
  .select({
    month: sql<string>`to_char(date::date, 'YYYY-MM')`,
    total: sql<number>`sum(price * quantity)`,
  })
  .from(entries)
  .innerJoin(items, eq(entries.itemId, items.id))
  .where(and(
    eq(items.categoryId, categoryId),
    eq(entries.type, 'purchase')
  ))
  .groupBy(sql`to_char(date::date, 'YYYY-MM')`)
  .orderBy(sql`to_char(date::date, 'YYYY-MM')`);
```

### Price Screen — household spend summary

```ts
// Total spend this month
const monthSpend = await db
  .select({ total: sql<number>`sum(price * quantity)` })
  .from(entries)
  .where(and(
    eq(entries.householdId, householdId),
    eq(entries.type, 'purchase'),
    gte(entries.date, startOfMonth),
    lte(entries.date, endOfMonth)
  ));

// Spend by category
const categorySpend = await db
  .select({
    categoryName: categories.name,
    total: sql<number>`sum(entries.price * entries.quantity)`,
  })
  .from(entries)
  .innerJoin(items, eq(entries.itemId, items.id))
  .innerJoin(categories, eq(items.categoryId, categories.id))
  .where(and(
    eq(entries.householdId, householdId),
    eq(entries.type, 'purchase'),
    gte(entries.date, startOfMonth)
  ))
  .groupBy(categories.name)
  .orderBy(desc(sql`sum(entries.price * entries.quantity)`));
```

### Activity Feed — recent entries with contributor name

```ts
const recentActivity = await db
  .select({
    entry: entries,
    itemName: items.name,
    categoryName: categories.name,
    contributorName: users.username,
  })
  .from(entries)
  .innerJoin(items, eq(entries.itemId, items.id))
  .leftJoin(categories, eq(items.categoryId, categories.id))
  .innerJoin(users, eq(entries.userId, users.id))
  .where(eq(entries.householdId, householdId))
  .orderBy(desc(entries.createdAt))
  .limit(20);
```

---

## 8. Indexes

```sql
-- Hot path: Stock screen loads all items for a household
CREATE INDEX idx_items_household ON items(household_id);

-- Hot path: Item Detail loads all entries for an item
CREATE INDEX idx_entries_item_id ON entries(item_id);

-- Hot path: Price screen queries by household + date range
CREATE INDEX idx_entries_household_date ON entries(household_id, date);

-- Hot path: Category view loads items by category
CREATE INDEX idx_items_category ON items(category_id);

-- Activity feed + last entry per item
CREATE INDEX idx_entries_household_created ON entries(household_id, created_at DESC);
```

---

## 9. Offline / IndexedDB Mapping

The IndexedDB schema mirrors the server schema for offline-first operation. Key stores:

| IDB Store | Mirrors | Notes |
|---|---|---|
| `items` | `items` table | Full item list cached on load |
| `entries` | `entries` table | Cached per item, loaded on Item Detail open |
| `categories` | `categories` table | Cached on app load |
| `pendingMutations` | — | Queue of offline writes to replay on reconnect |

**Sync strategy**: On reconnect, `SyncEngine` replays `pendingMutations` sequentially. Conflicts (e.g. item deleted remotely while offline entry exists) are resolved server-side — server wins, client re-fetches.

---

## 10. What Carries Over From the Prototype

| Thing | Status |
|---|---|
| `users` table structure | Recreated identically |
| `authenticators` table structure | Recreated identically |
| Auth flow (JWT + Passkeys) | Unchanged — same code, same logic |
| Drizzle ORM pattern | Unchanged |
| `feedback` table | Drop — not needed for v1 |
| `inventory` table | Drop — replaced by `items` |
| Old `entries` table | Drop — replaced by new `entries` with `itemId` + `store` + `householdId` |
