import { pgTable, text, integer, serial, timestamp, real, unique, index, boolean, date } from 'drizzle-orm/pg-core';
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

// ── Spaces ──────────────────────────────────────────────────────────────────

export const spaces = pgTable('spaces', {
  id: text('id').primaryKey(), // uuid
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const spaceMembers = pgTable('space_members', {
  id: serial('id').primaryKey(),
  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  avatar: text('avatar'),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (t) => [unique().on(t.spaceId, t.userId)]);

export const spaceInvites = pgTable('space_invites', {
  id: serial('id').primaryKey(),
  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(), // 8-char alphanumeric
  createdBy: integer('created_by')
    .notNull()
    .references(() => spaceMembers.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Catalogue ───────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  defaultUnit: text('default_unit').notNull().default(DEFAULTS.UNIT),
  createdAt: timestamp('created_at').defaultNow(),
});

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  unit: text('unit').notNull().default(DEFAULTS.UNIT),
  currentStock: real('current_stock').notNull().default(0),
  lowStockThreshold: real('low_stock_threshold'),
  alertEnabled: boolean('alert_enabled').notNull().default(true),
  lastEntryAt: timestamp('last_entry_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_items_space').on(t.spaceId),
  index('idx_items_category').on(t.categoryId),
]);

// ── Entries ─────────────────────────────────────────────────────────────────

export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  itemId: integer('item_id')
    .references(() => items.id, { onDelete: 'set null' }),
  memberId: integer('member_id')
    .notNull()
    .references(() => spaceMembers.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('purchase'), // 'purchase' | 'consume'
  price: real('price'),       // null for consume entries
  quantity: real('quantity').notNull().default(1),
  unit: text('unit').notNull().default(DEFAULTS.UNIT),
  store: text('store'),       // free text — null for consume
  date: date('date').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_entries_item_id').on(t.itemId),
  index('idx_entries_space_date').on(t.spaceId, t.date),
  index('idx_entries_space_created').on(t.spaceId, t.createdAt),
]);

// ── Type exports ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Space = typeof spaces.$inferSelect;
export type SpaceMember = typeof spaceMembers.$inferSelect;
export type SpaceInvite = typeof spaceInvites.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type NewItem = typeof items.$inferInsert;
export type NewCategory = typeof categories.$inferInsert;
