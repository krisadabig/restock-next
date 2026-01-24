import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '11340e694ef1939c910bbd3f0cc6f9eaa97f8b5ca9519f50ce01581ef36f331c';

test.describe('Settings Page @smoke', () => {
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

	test('should load settings page with correct title', async ({ page }) => {
		await page.goto('/app/settings');
		await expect(page.locator('h1')).toContainText(/Settings|การตั้งค่า/);
	});

	test('should toggle theme and persist', async ({ page }) => {
		await page.goto('/app/settings');

		const html = page.locator('html');
		const initialDark = await html.evaluate((el) => el.classList.contains('dark'));
		const toggleBtn = page.getByRole('button', {
			name: initialDark ? /Light Mode|โหมดสว่าง/i : /Dark Mode|โหมดมืด/i,
		});
		await toggleBtn.click();
		const afterToggleDark = await html.evaluate((el) => el.classList.contains('dark'));
		expect(afterToggleDark).not.toBe(initialDark);

		// Reload
		await page.reload();
		const afterReloadDark = await html.evaluate((el) => el.classList.contains('dark'));
		expect(afterReloadDark).toBe(afterToggleDark);
	});

	test('should toggle language between EN and TH', async ({ page }) => {
		await page.goto('/app/settings');
		await page.getByRole('button', { name: 'English' }).click();
		await expect(page.locator('h1')).toContainText('Settings');
		await page.getByRole('button', { name: /Thai|ไทย/i }).click();
		await expect(page.locator('h1')).toContainText('การตั้งค่า');
	});

	test('should navigate to settings from bottom nav', async ({ page }) => {
		await page.goto('/app');
		await page.getByRole('link', { name: /Settings|การตั้งค่า/i }).click();
		await expect(page).toHaveURL('/app/settings');
		await expect(page.locator('h1')).toContainText(/Settings|การตั้งค่า/);
	});

	test('should show delete account modal', async ({ page }) => {
		await page.goto('/app/settings');
		await page.getByRole('button', { name: /Delete Account|ลบบัญชี/i }).click();
		await expect(page.getByText(/Delete Account\?|ยืนยันการลบบัญชี/i)).toBeVisible();
		const confirmBtn = page.getByRole('button', { name: /^Delete$|^ลบ$/i }).last();
		await expect(confirmBtn).toBeDisabled();
		await page.getByPlaceholder('DELETE').fill('DELETE');
		await expect(confirmBtn).toBeEnabled();
		await page.getByRole('button', { name: /Cancel|ยกเลิก/i }).click();
		await expect(page.getByText(/Delete Account\?|ยืนยันการลบบัญชี/i)).not.toBeVisible();
	});

	test('should logout and redirect to login', async ({ page }) => {
		await page.goto('/app/settings');
		await page.getByRole('button', { name: /Log Out|ออกจากระบบ/i }).click();
		await expect(page).toHaveURL(/\/login/);
	});
});
