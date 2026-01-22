import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '11340e694ef1939c910bbd3f0cc6f9eaa97f8b5ca9519f50ce01581ef36f331c'; // Fallback to matched secret from .env for tests

test.describe('Dashboard Shell', { tag: '@smoke' }, () => {
	test.beforeEach(async ({ page, context }) => {
		// Bypass login by setting a valid session cookie
		const token = jwt.sign({ id: 'test-user-id', username: 'testuser' }, JWT_SECRET, {
			expiresIn: '7d',
		});

		await context.addCookies([
			{
				name: 'session',
				value: token,
				domain: 'localhost',
				path: '/',
			},
		]);

		await page.goto('/app');

		// Switch to English if not already (logic depends on if we are already in app)
		// Check if language toggle is present in dashboard
		const langBtn = page.getByRole('button', { name: /Language|ภาษา/i });
		if ((await langBtn.count()) > 0 && (await langBtn.textContent().then((t) => t?.includes('TH')))) {
			await langBtn.click();
		}
	});

	test('should render dashboard layout correctly', async ({ page }) => {
		// Check for Header elements
		await expect(page.locator('h1')).toHaveText(/My Restock|Restock ของฉัน/); // Depends on default locale

		// Check for Bottom Nav
		await expect(page.getByRole('link', { name: /History|ประวัติ/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Trends|แนวโน้ม/ })).toBeVisible();

		// Check for Add button
		const addBtn = page.locator('a[href="/app?add=true"]');
		await expect(addBtn).toBeVisible();

		// Check for item count badge
		await expect(page.locator('.btn-premium').first()).toBeVisible();
	});

	test('should navigate to trends', async ({ page }) => {
		await page.getByRole('link', { name: /Trends|แนวโน้ม/ }).click();
		await expect(page).toHaveURL('/app/trends');

		// Since trends page is not created yet, 404 is expected or 500?
		// Actually next.js 404 page retains layout?
		// If layout is in /app layout, creating /app/trends/page.tsx or letting it 404 inside layout?
		// Wait, if /app/trends doesn't exist, it might 404 standard nextjs page.
		// But we just want to verify link works.
	});

	test('should open add entry modal and add entry', async ({ page }) => {
		// Click Add button
		await page.locator('a[href="/app?add=true"]').click();

		// Check URL
		await expect(page).toHaveURL(/\/app\?add=true/);

		// Check Modal Title
		await expect(page.getByText('Add Entry')).toBeVisible();

		// Fill Form
		await page.locator('input[name="item"]').fill('Test Coffee');
		await page.locator('input[name="price"]').fill('500');
		// Date defaults to today

		// Submit
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Should return to /app (modal closes)
		await expect(page).toHaveURL(/\/app/);
		await expect(page.getByText('Add Entry')).toBeHidden();

		// Check if item appears in list (use first() to handle duplicates from prior runs)
		await expect(page.getByText('Test Coffee').first()).toBeVisible();
		await expect(page.getByText('฿500').first()).toBeVisible();
	});
});
