import { pgTable, text, integer, serial, timestamp, real, unique, index } from 'drizzle-orm/pg-core';
import { DEFAULTS } from '../constants';

// ── Auth (unchanged from prototype) ────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email'),
  passwordHash: text('password_hash'),
});

export const authenticators = pgTable('authenticators', {
  credentialID: text('credential_id').primaryKey(),
  credentialPublicKey: text('credential_public_key').notNull(),
  counter: integer('counter').notNull(),
  transports: text('transports'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

// ── Household ───────────────────────────────────────────────────────────────

export const households = pgTable('households', {
  id: text('id').primaryKey(), // uuid
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const householdMembers = pgTable('household_members', {
  id: serial('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (t) => [unique().on(t.householdId, t.userId)]);

// ── Catalogue ───────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  defaultUnit: text('default_unit').notNull().default(DEFAULTS.UNIT),
  createdAt: timestamp('created_at').defaultNow(),
});

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  unit: text('unit').notNull().default(DEFAULTS.UNIT),
  currentStock: real('current_stock').notNull().default(0),
  lowStockThreshold: real('low_stock_threshold'),
  alertEnabled: integer('alert_enabled').notNull().default(1),
  lastEntryAt: timestamp('last_entry_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_items_household').on(t.householdId),
  index('idx_items_category').on(t.categoryId),
]);

// ── Entries ─────────────────────────────────────────────────────────────────

export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  itemId: integer('item_id')
    .references(() => items.id, { onDelete: 'set null' }),
  type: text('type').notNull().default('purchase'), // 'purchase' | 'consume'
  price: real('price'),       // null for consume entries
  quantity: real('quantity').notNull().default(1),
  unit: text('unit').notNull().default(DEFAULTS.UNIT),
  store: text('store'),       // "Big C", "CJ", free text — null for consume
  date: text('date').notNull(),
  note: text('note'),
  userId: text('user_id')     // attribution — who in the household logged this
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_entries_item_id').on(t.itemId),
  index('idx_entries_household_date').on(t.householdId, t.date),
  index('idx_entries_household_created').on(t.householdId, t.createdAt),
]);

// ── Groups ──────────────────────────────────────────────────────────────────

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_groups_household').on(t.householdId),
]);

export const groupItems = pgTable('group_items', {
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  itemId: integer('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
}, (t) => [
  unique().on(t.groupId, t.itemId),
]);

// ── Type exports ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Household = typeof households.$inferSelect;
export type HouseholdMember = typeof householdMembers.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupItem = typeof groupItems.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type NewItem = typeof items.$inferInsert;
export type NewCategory = typeof categories.$inferInsert;
export type NewGroup = typeof groups.$inferInsert;
