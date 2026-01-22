import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
	test('should render hero section and feature list', async ({ page }) => {
		await page.goto('/');

		// Check title presence
		await expect(page.locator('h1')).toBeVisible();

		// Check features exist (Expect Thai by default)
		await expect(page.getByText('ฟีเจอร์เด่น')).toBeVisible();

		// Check "Get Started" button
		const getStartedBtn = page.getByRole('link', { name: /Get Started|เริ่มต้นใช้งาน/i });
		await expect(getStartedBtn).toBeVisible();
		await expect(getStartedBtn).toHaveAttribute('href', '/login');
	});

	test('should toggle theme correctly and persist', async ({ page }) => {
		await page.goto('/');

		// Initial state might depend on system preference or default, but let's assume default is light or check current.
		// We will force toggle to dark.

		const html = page.locator('html');
		// Ensure we are in a known state or just toggle.
		// Let's assume we want to test switching.

		const themeBtn = page.getByRole('button', { name: /Toggle theme|เปลี่ยนธีม/i }); // Toggle theme (en) or whatever is default
		await expect(themeBtn).toBeVisible();

		// Click to toggle
		await themeBtn.click();

		// Wait for class change
		// If it was light, it becomes dark. If dark, light.
		// Let's get the class attribute.
		const isDark = await html.getAttribute('class').then((c) => c?.includes('dark'));

		if (isDark) {
			await expect(html).toHaveClass(/dark/);
		} else {
			await expect(html).not.toHaveClass(/dark/);
		}

		// RELOAD to check persistence
		await page.reload();
		if (isDark) {
			await expect(html).toHaveClass(/dark/);
		} else {
			await expect(html).not.toHaveClass(/dark/);
		}
	});

	test('should toggle language correctly', async ({ page }) => {
		await page.goto('/');

		// Default is Thai
		await expect(page.getByText('ฟีเจอร์เด่น')).toBeVisible();
		await expect(page.getByText('Features')).not.toBeVisible();

		// Find language toggle
		// The aria-label for TH mode is "ภาษา" (Thai)
		const langBtn = page.getByRole('button', { name: /Language|ภาษา/i });
		await langBtn.click();

		// Should switch to English
		await expect(page.getByText('Features')).toBeVisible();
		await expect(page.getByText('ฟีเจอร์เด่น')).not.toBeVisible();

		// Toggle back
		await langBtn.click();
		await expect(page.getByText('ฟีเจอร์เด่น')).toBeVisible();
	});
});
