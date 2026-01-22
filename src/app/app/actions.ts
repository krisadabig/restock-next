'use server';

import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Entry {
	id: number;
	item: string;
	price: number;
	date: string;
	note: string | null;
}

async function getUser() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;
	return { id: user.id, username: user.user_metadata.username || user.email };
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

export async function addEntry(data: { item: string; price: number; date: string; note?: string }) {
	const user = await getUser();
	if (!user) throw new Error('Unauthorized');

	await db.insert(entries).values({
		item: data.item,
		price: data.price,
		date: data.date,
		note: data.note,
		userId: user.id,
	});

	revalidatePath('/app');
}
