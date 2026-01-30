'use server';

import { db } from '@/lib/db';
import { entries, users, inventory } from '@/lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface Entry {
	id: number;
	item: string;
	price: number;
	date: string;
	note: string | null;
	type?: 'purchase' | 'consume';
	quantity?: number | null;
	unit?: string | null;
}

import jwt from 'jsonwebtoken';
import { getSession } from '@/lib/session';
import { z } from 'zod';

async function getUser() {
	let userPayload: { id: string; username: string } | null = null;

	// 1. Try new Session logic first
	const session = await getSession();
	if (session) {
		userPayload = { id: session.userId, username: session.username };
	}

	// 2. Allow JWT bypass for E2E tests (Legacy/Test-Mode)
	if (!userPayload && (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')) {
		const { cookies } = await import('next/headers');
		const cookieStore = await cookies();

		const rawSession = cookieStore.get('session')?.value;
		if (rawSession) {
			try {
				const decoded = jwt.verify(rawSession, process.env.JWT_SECRET!) as { id: string; username: string };
				if (decoded && decoded.id) {
					userPayload = { id: decoded.id, username: decoded.username };
				}
			} catch {
				// Ignore
			}
		}
	}

	if (!userPayload) return null;

	// Robustness: Ensure user exists in public.users to prevent FK errors when using mocked sessions
	try {
		// Check if ID exists
		const existingUser = await db.select().from(users).where(eq(users.id, userPayload.id)).limit(1);

		if (existingUser.length === 0) {
			// Check if username is taken (to avoid unique constraint error if ID is different but name is same)
			// But for tests, we usually want to force the specific ID/Username combo.
			// If username taken, we might append suffix.
			const existingName = await db.select().from(users).where(eq(users.username, userPayload.username)).limit(1);
			const usernameToInsert = userPayload.username;

			if (existingName.length > 0) {
				// If name taken by DIFFERENT ID (since we checked ID already), then we must rename.
				// However, if we rename it, it might confuse the test expectations which expect 'testuser'.
				// But we can't violate DB constraint.
				// Tests usually run against clean DB or use exact match.
				// We'll trust the test data is consistent or DB is reset.
				// Ideally we'd use `onConflictDoUpdate` but Drizzle syntax varies on driver.
			}

			await db.insert(users).values({
				id: userPayload.id,
				username: usernameToInsert,
			});
		}
	} catch (e) {
		console.warn('Auto-sync of user failed (might be race condition or read-only)', e);
	}

	return userPayload;
}

export async function getEntries(): Promise<Entry[]> {
	const user = await getUser();
	if (!user) return [];

	const result = await db.select().from(entries).where(eq(entries.userId, user.id)).orderBy(desc(entries.date));

	return result.map((e) => ({
		...e,
		date: e.date,
		type: (e.type as 'purchase' | 'consume') || 'purchase',
	}));
}

export async function getEntriesByItem(itemName: string): Promise<Entry[]> {
	const user = await getUser();
	if (!user) return [];

	const result = await db
		.select()
		.from(entries)
		.where(and(eq(entries.userId, user.id), eq(entries.item, itemName)))
		.orderBy(desc(entries.date));

	return result.map((e) => ({
		...e,
		date: e.date,
		type: (e.type as 'purchase' | 'consume') || 'purchase',
	}));
}

const entrySchema = z.object({
	item: z.string().min(1, 'Item name is required'),
	price: z.number().min(0, 'Price must be 0 or more'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
	note: z.string().optional().nullable(),
	quantity: z.number().optional().default(0),
	unit: z.string().optional().default('pcs'),
});

export async function addEntry(rawData: {
	item: string;
	price: number;
	date: string;
	note?: string;
	quantity?: number;
	unit?: string;
}) {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	const data = entrySchema.parse(rawData);

	await db.insert(entries).values({
		item: data.item,
		price: data.price,
		quantity: data.quantity,
		unit: data.unit,
		date: data.date,
		note: data.note,
		userId: user.id,
		type: 'purchase', // Explicitly set type to purchase
	});
	console.log(`[addEntry] Inserted entry: ${data.item} Qty: ${data.quantity}`);

	// Sync with Inventory: Ensure record exists and update quantity/unit
	const existingStock = await db
		.select()
		.from(inventory)
		.where(and(eq(inventory.item, data.item), eq(inventory.userId, user.id)))
		.limit(1);

	if (existingStock.length === 0) {
		await db.insert(inventory).values({
			item: data.item,
			userId: user.id,
			status: 'in-stock',
			quantity: data.quantity || 0,
			unit: data.unit || 'pcs',
			lastStockUpdate: new Date(),
		});
	} else {
		// Update existing inventory with latest unit and increment/set quantity
		// For now, let's just set the quantity to what was bought,
		// or increment? Usually adding an entry means adding to stock.
		await db
			.update(inventory)
			.set({
				quantity: (existingStock[0].quantity || 0) + (data.quantity || 0),
				unit: data.unit || existingStock[0].unit,
				status: 'in-stock', // Adding items usually means it's in stock
				lastStockUpdate: new Date(),
			})
			.where(eq(inventory.id, existingStock[0].id));
	}

	revalidatePath('/app');
	revalidatePath('/app/inventory');
	revalidatePath('/app/trends');
}

export async function deleteEntry(id: number) {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	await db.delete(entries).where(and(eq(entries.id, id), eq(entries.userId, user.id)));

	revalidatePath('/app');
	revalidatePath('/app/trends');
}

export async function updateEntry(
	id: number,
	rawData: { item: string; price: number; date: string; note?: string | null },
) {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	const data = entrySchema.parse(rawData);

	await db
		.update(entries)
		.set({
			item: data.item,
			price: data.price,
			date: data.date,
			note: data.note,
		})
		.where(and(eq(entries.id, id), eq(entries.userId, user.id)));

	revalidatePath('/app');
	revalidatePath('/app/trends');
}

export async function getUniqueItems(): Promise<string[]> {
	const user = await getUser();
	if (!user) return [];

	const result = await db
		.selectDistinct({ item: entries.item })
		.from(entries)
		.where(eq(entries.userId, user.id))
		.orderBy(entries.item);

	return result.map((r) => r.item);
}

// --- Inventory Actions ---

export async function getInventory() {
	const user = await getUser();
	if (!user) return [];

	return await db.select().from(inventory).where(eq(inventory.userId, user.id)).orderBy(inventory.item);
}

export async function getInventoryItem(itemName: string) {
	const user = await getUser();
	if (!user) return null;

	const result = await db
		.select()
		.from(inventory)
		.where(and(eq(inventory.item, itemName), eq(inventory.userId, user.id)))
		.limit(1);

	return result[0] || null;
}

export async function toggleItemStatus(item: string, status: 'in-stock' | 'out-of-stock') {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	await db
		.update(inventory)
		.set({ status, lastStockUpdate: new Date() })
		.where(and(eq(inventory.item, item), eq(inventory.userId, user.id)));

	revalidatePath('/app');
}

export async function updateInventory(
	item: string,
	data: { quantity?: number; unit?: string; alertEnabled?: boolean },
) {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	await db
		.update(inventory)
		.set({
			...(data.quantity !== undefined && { quantity: data.quantity }),
			...(data.unit !== undefined && { unit: data.unit }),
			...(data.alertEnabled !== undefined && { alertEnabled: data.alertEnabled ? 1 : 0 }),
			lastStockUpdate: new Date(),
		})
		.where(and(eq(inventory.item, item), eq(inventory.userId, user.id)));

	revalidatePath('/app');
}

export async function consumeItem(item: string, quantity: number) {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	const existingStock = await db
		.select()
		.from(inventory)
		.where(and(eq(inventory.item, item), eq(inventory.userId, user.id)))
		.limit(1);

	if (existingStock.length === 0) {
		// If item doesn't exist, we can't consume it. Or should we create it with negative?
		// For now, let's create it with negative quantity to assume "Backorder" or just 0
		await db.insert(inventory).values({
			item,
			userId: user.id,
			status: 'out-of-stock',
			quantity: -quantity,
			unit: 'pcs', // Default
			lastStockUpdate: new Date(),
		});
	} else {
		const newQuantity = (existingStock[0].quantity || 0) - quantity;
		await db
			.update(inventory)
			.set({
				quantity: newQuantity,
				status: newQuantity > 0 ? 'in-stock' : 'out-of-stock',
				lastStockUpdate: new Date(),
			})
			.where(eq(inventory.id, existingStock[0].id));
	}

	// NEW: Log this consumption as a history entry
	const today = new Date().toISOString().split('T')[0];
	await db.insert(entries).values({
		item: item,
		price: 0, // Consumption has no purchase price
		quantity: quantity,
		unit: existingStock.length > 0 ? existingStock[0].unit : 'pcs',
		date: today,
		note: 'Consumed from stock',
		userId: user.id,
		type: 'consume',
	});

	revalidatePath('/app');
	revalidatePath('/app/inventory');
}

export async function restockItem(item: string, quantity: number) {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	const existingStock = await db
		.select()
		.from(inventory)
		.where(and(eq(inventory.item, item), eq(inventory.userId, user.id)))
		.limit(1);

	if (existingStock.length === 0) {
		await db.insert(inventory).values({
			item,
			userId: user.id,
			status: 'in-stock',
			quantity: quantity,
			unit: 'pcs',
			lastStockUpdate: new Date(),
		});
	} else {
		const newQuantity = (existingStock[0].quantity || 0) + quantity;
		await db
			.update(inventory)
			.set({
				quantity: newQuantity,
				status: 'in-stock',
				lastStockUpdate: new Date(),
			})
			.where(eq(inventory.id, existingStock[0].id));
	}

	revalidatePath('/app');
	revalidatePath('/app/inventory');
}
