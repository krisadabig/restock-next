'use server';

import { db } from '@/lib/db';
import { entries, users } from '@/lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Entry {
	id: number;
	item: string;
	price: number;
	date: string;
	note: string | null;
}

import jwt from 'jsonwebtoken';

async function getUser() {
	// Allow JWT bypass for E2E tests
	if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
		const { cookies } = await import('next/headers');
		const cookieStore = await cookies();
		const sessionToken = cookieStore.get('session')?.value;
		if (sessionToken) {
			try {
				const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!) as { id: string; username: string };
				if (decoded) {
					return { id: decoded.id, username: decoded.username };
				}
			} catch {
				// Continue to Supabase auth if JWT fails
			}
		}
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const finalUser = { id: user.id, username: user.user_metadata.username || user.email };

	// Robustness: Ensure user exists in public.users to prevent FK errors
	try {
		// Check if ID exists
		const existingUser = await db.select().from(users).where(eq(users.id, finalUser.id)).limit(1);

		if (existingUser.length === 0) {
			// Check if username is taken
			const existingName = await db.select().from(users).where(eq(users.username, finalUser.username)).limit(1);

			let usernameToInsert = finalUser.username;
			if (existingName.length > 0) {
				// Append random suffix
				usernameToInsert = `${finalUser.username}_${Math.floor(Math.random() * 10000)}`;
			}

			await db.insert(users).values({
				id: finalUser.id,
				username: usernameToInsert,
			});
		}
	} catch (e) {
		console.warn('Auto-sync of user failed, ignoring (might be race condition)', e);
	}

	// STRICT VERIFICATION
	const verifyUser = await db.select().from(users).where(eq(users.id, finalUser.id)).limit(1);
	if (verifyUser.length === 0) {
		console.error('CRITICAL: User not found in public.users after sync attempt', finalUser);
		throw new Error(
			`User Sync Failed: User ${finalUser.id} (${finalUser.username}) not found in public.users. DB Insert Failed.`,
		);
	}

	return finalUser;
}

export async function getEntries(): Promise<Entry[]> {
	const user = await getUser();
	if (!user) return [];

	const result = await db.select().from(entries).where(eq(entries.userId, user.id)).orderBy(desc(entries.date));

	return result.map((e) => ({
		...e,
		date: e.date, // already string in db schema? schema says text.
	}));
}

import { z } from 'zod';

const entrySchema = z.object({
	item: z.string().min(1, 'Item name is required'),
	price: z.number().min(0, 'Price must be 0 or more'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
	note: z.string().optional().nullable(),
});

export async function addEntry(rawData: { item: string; price: number; date: string; note?: string }) {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	const data = entrySchema.parse(rawData);

	try {
		await db.insert(entries).values({
			item: data.item,
			price: data.price,
			date: data.date,
			note: data.note,
			userId: user.id,
		});
		console.log('✅ addEntry inserted:', data);
	} catch (error) {
		console.error('SERVER ACTION ERROR (addEntry):', error);
		throw error;
	}

	revalidatePath('/app');
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
