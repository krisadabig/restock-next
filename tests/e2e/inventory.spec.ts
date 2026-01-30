import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '11340e694ef1939c910bbd3f0cc6f9eaa97f8b5ca9519f50ce01581ef36f331c';

test.describe('Stock Tracking & Inventory', () => {
	test.beforeEach(async ({ context }) => {
		// Bypass auth
		const secretKey = JWT_SECRET;
		const encodedKey = new TextEncoder().encode(secretKey);

		const session = await new SignJWT({
			userId: 'test-user-id',
			username: 'testuser',
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		})
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt()
			.setExpirationTime('7d')
			.sign(encodedKey);

		await context.addCookies([
			{
				name: 'session',
				value: session,
				domain: 'localhost',
				path: '/',
			},
		]);
	});

	// Reset storage state before tests if needed (or rely on random data)
	const itemName = `Test Item ${Date.now()}`;

	test('should facilitate full inventory lifecycle', async ({ page }) => {
		await page.goto('/app');

		// 1. Add Entry with Smart Inputs
		await page.getByLabel('Add Entry').click(); // Main Add Button on BottomNav

		// Smart Autocomplete
		const itemInput = page.locator('input[name="item"]');
		await expect(itemInput).toBeVisible();
		await itemInput.fill(itemName);

		// Price
		await page.fill('input[name="price"]', '100');

		// Quantity & Unit Pill
		await page.fill('input[name="quantity"]', '5');
		const pill = page.locator('button:has-text("pcs")').first();
		await pill.click({ force: true }); // Force click to bypass animation overlay

		// Submit
		await page.click('button[type="submit"]');
		await expect(page.locator('form')).not.toBeVisible();

		// 2. Navigate to Inventory
		await page.getByRole('link', { name: /Inventory/i }).click();
		await expect(page).toHaveURL(/\/app\/inventory/);

		// 3. Search & Key Hygiene
		const searchInput = page.getByPlaceholder('Search stock...'); // Correct placeholder
		await searchInput.fill(`  ${itemName}  `); // Test trimming
		await searchInput.press('Tab'); // Blur to trigger trim

		// Verify trim happened in value
		await expect(searchInput).toHaveValue(itemName);

		// Verify Card - Use hasText filter on container
		const card = page.locator('.glass-card').filter({ hasText: itemName }).first();
		await expect(card).toBeVisible();
		await expect(card).toContainText('5');
		await expect(card).toContainText('pcs');
		await expect(card).toContainText('In Stock');

		// 4. Detail View & Actions
		await card.click();
		await expect(page).toHaveURL(/\/app\/inventory\/.+/);
		await expect(page.getByText('Stock Details')).toBeVisible();

		// Consume
		await page.click('text=Consume');
		// Expect optimistic update or eventual update
		await expect(page.locator('span.text-6xl')).toHaveText('4'); // 5 - 1 = 4

		// Restock
		await page.click('text=Restock');
		await expect(page.locator('span.text-6xl')).toHaveText('5'); // 4 + 1 = 5

		// Check History Presence
		await expect(page.getByText('Purchase History')).toBeVisible();
		await expect(page.getByText('Test Item').first()).toBeVisible(); // The item name in history list
	});
});
