import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

test.describe('Settings Page @smoke', () => {
	test.beforeEach(async ({ page }) => {
		// Bypass auth by setting a mock JWT cookie
		const token = jwt.sign(
			{ userId: 'test-user-id', username: 'testuser' },
			process.env.JWT_SECRET || 'dev-secret-key',
			{ expiresIn: '1h' },
		);
		await page.context().addCookies([{ name: 'auth', value: token, domain: 'localhost', path: '/' }]);
	});

	test('should load settings page with correct title', async ({ page }) => {
		await page.goto('/app/settings');
		await expect(page.locator('h1')).toContainText(/Settings|การตั้งค่า/);
	});

	test('should toggle theme and persist', async ({ page }) => {
		await page.goto('/app/settings');

		// Get initial theme state
		const html = page.locator('html');
		const initialDark = await html.evaluate((el) => el.classList.contains('dark'));

		// Check toggles (segmented control)
		const toggleBtn = page.getByRole('button', {
			name: initialDark ? /Light Mode|โหมดสว่าง/i : /Dark Mode|โหมดมืด/i,
		});
		await toggleBtn.click();

		// Verify theme changed
		const afterToggleDark = await html.evaluate((el) => el.classList.contains('dark'));
		expect(afterToggleDark).not.toBe(initialDark);

		// Reload and verify persistence
		await page.reload();
		await page.waitForLoadState('networkidle');
		const afterReloadDark = await html.evaluate((el) => el.classList.contains('dark'));
		expect(afterReloadDark).toBe(afterToggleDark);
	});

	test('should toggle language between EN and TH', async ({ page }) => {
		await page.goto('/app/settings');

		// Click English button
		await page.getByRole('button', { name: 'English' }).click();
		await expect(page.locator('h1')).toContainText('Settings');

		// Click Thai button
		await page.getByRole('button', { name: /Thai|ไทย/i }).click();
		await expect(page.locator('h1')).toContainText('การตั้งค่า');
	});

	test('should navigate to settings from bottom nav', async ({ page }) => {
		await page.goto('/app');

		// Find and click settings link in bottom nav
		await page.getByRole('link', { name: /Settings|การตั้งค่า/i }).click();

		await expect(page).toHaveURL('/app/settings');
		await expect(page.locator('h1')).toContainText(/Settings|การตั้งค่า/);
	});

	test('should show delete account modal and require confirmation', async ({ page }) => {
		await page.goto('/app/settings');

		// Click delete account button
		await page.getByRole('button', { name: /Delete Account|ลบบัญชี/i }).click();

		// Modal should appear
		await expect(page.getByText(/Delete Account\?|ยืนยันการลบบัญชี/i)).toBeVisible();

		// Delete button should be disabled without typing DELETE
		const confirmBtn = page.getByRole('button', { name: /^Delete$|^ลบ$/i }).last();
		await expect(confirmBtn).toBeDisabled();

		// Type DELETE
		await page.getByPlaceholder('DELETE').fill('DELETE');

		// Delete button should now be enabled
		await expect(confirmBtn).toBeEnabled();

		// Cancel modal
		await page.getByRole('button', { name: /Cancel|ยกเลิก/i }).click();
		await expect(page.getByText(/Delete Account\?|ยืนยันการลบบัญชี/i)).not.toBeVisible();
	});

	test('should logout and redirect to home', async ({ page }) => {
		await page.goto('/app/settings');

		// Click logout
		await page.getByRole('button', { name: /Log Out|ออกจากระบบ/i }).click();

		// Should redirect to home
		await expect(page).toHaveURL('/');
	});
});
