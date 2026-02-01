'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hash, compare } from 'bcryptjs';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const signupSchema = z
	.object({
		username: z.string().min(3, 'Username must be at least 3 characters'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string().min(6, 'Please confirm your password'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
});

export async function signup(prevState: { error?: string } | null, formData: FormData) {
	const result = signupSchema.safeParse(Object.fromEntries(formData));

	if (!result.success) {
		return {
			error: result.error.issues[0].message,
		};
	}

	const { username, password } = result.data;

	// Check if user exists
	const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);

	if (existingUser.length > 0) {
		return {
			error: 'Username already taken',
		};
	}

	const hashedPassword = await hash(password, 10);
	const userId = uuidv4();

	await db.insert(users).values({
		id: userId,
		username,
		passwordHash: hashedPassword,
	});

	await createSession(userId, username);
	redirect('/app');
}

export async function login(prevState: { error?: string } | null, formData: FormData) {
	const result = loginSchema.safeParse(Object.fromEntries(formData));

	if (!result.success) {
		return {
			error: 'Invalid input',
		};
	}

	const { username, password } = result.data;

	const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

	// Also try to find by email if we add that later, but for now strict username
	if (user.length === 0 || !user[0].passwordHash) {
		return {
			error: 'Invalid credentials',
		};
	}

	const isValid = await compare(password, user[0].passwordHash);

	if (!isValid) {
		return {
			error: 'Invalid credentials',
		};
	}

	await createSession(user[0].id, user[0].username);
	redirect('/app');
}

export async function logout() {
	await deleteSession();
	redirect('/login');
}
