import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '11340e694ef1939c910bbd3f0cc6f9eaa97f8b5ca9519f50ce01581ef36f331c';

test.describe('Dashboard Shell', { tag: '@smoke' }, () => {
	test.beforeEach(async ({ page, context }) => {
		// Bypass login by setting a valid session cookie (JWE)
		// We use the same encryption logic as server
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

		await page.goto('/app');

		const langBtn = page.getByRole('button', { name: /Language|ภาษา/i });
		if ((await langBtn.count()) > 0 && (await langBtn.textContent().then((t) => t?.includes('TH')))) {
			await langBtn.click();
		}
	});

	test('should render dashboard layout correctly', async ({ page }) => {
		await expect(page.locator('h1')).toHaveText(/My Restock|Restock ของฉัน/);
		await expect(page.getByRole('link', { name: /History|ประวัติ/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Trends|แนวโน้ม/ })).toBeVisible();
		const addBtn = page.locator('a[href="/app?add=true"]');
		await expect(addBtn).toBeVisible();
		await expect(page.locator('.btn-premium').first()).toBeVisible();
	});

	test('should navigate to trends', async ({ page }) => {
		await page.getByRole('link', { name: /Trends|แนวโน้ม/ }).click();
		await expect(page).toHaveURL('/app/trends');
	});

	test('should open add entry modal and add entry', async ({ page }) => {
		await page.locator('a[href="/app?add=true"]').click();
		await expect(page).toHaveURL(/\/app\?add=true/);
		await expect(page.getByRole('heading', { name: /Add Entry|เพิ่มรายการ/ })).toBeVisible();
		await page.locator('input[name="item"]').fill('Test Coffee');
		await page.locator('input[name="price"]').fill('500');
		await page.getByRole('button', { name: /Add Entry|เพิ่มรายการ/ }).click();
		await expect(page).toHaveURL(/\/app/);
		await expect(page.getByRole('heading', { name: /Add Entry|เพิ่มรายการ/ })).toBeHidden();
		await expect(page.getByText('Test Coffee').first()).toBeVisible();
		await expect(page.getByText('฿500').first()).toBeVisible();
	});
});
