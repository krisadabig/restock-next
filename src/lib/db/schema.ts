import { pgTable, text, integer, serial, timestamp, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: text('id').primaryKey(), // Using text to store Supabase UUIDs
	username: text('username').notNull().unique(),
});

export const authenticators = pgTable('authenticators', {
	credentialID: text('credential_id').primaryKey(),
	credentialPublicKey: text('credential_public_key').notNull(),
	counter: integer('counter').notNull(),
	transports: text('transports'), // Stored as JSON string
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
});

export const entries = pgTable('entries', {
	id: serial('id').primaryKey(),
	item: text('item').notNull(),
	price: real('price').notNull(),
	date: text('date').notNull(),
	note: text('note'),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow(),
});

export const feedback = pgTable('feedback', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	message: text('message').notNull(),
	type: text('type').default('feature_request'),
	createdAt: timestamp('created_at').defaultNow(),
});
