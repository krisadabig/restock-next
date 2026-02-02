import { test, expect } from '@playwright/test';

test.describe('Light Mode Visual Verification', () => {
	test('should capture consistently themed screenshots across key pages', async ({ page }) => {
		// 1. Initial Load & Theme Setup
		await page.goto('/login');

		// Ensure we are in Light Mode
		const html = page.locator('html');
		const isDark = await html.evaluate((el) => el.classList.contains('dark'));
		if (isDark) {
			// Use the explicit aria-label we verified in ThemeToggle.tsx
			await page.getByLabel('Toggle theme').click();
		}
		await expect(html).not.toHaveClass(/dark/);

		// Screenshot 1: Login Page (Light)
		await expect(page.locator('h1')).toContainText('Restock.');
		await page.waitForTimeout(500); // Wait for transitions
		await page.screenshot({ path: 'test-results/light-mode-login.png', fullPage: true });

		// 2. Signup Flow (Robust)
		const timestamp = Date.now();
		const username = `visual_${timestamp}`;
		const password = 'password123';

		// Switch to Signup Mode
		// The toggle button is initially "Sign up" (switching TO signup)
		// We target the button in the footer specifically to avoid confusion with submit button
		const footerToggle = page.locator('div.pt-4').getByRole('button');
		await footerToggle.click();

		// Verify we are in Signup mode (Confirm Password should appear)
		const confirmPass = page.locator('input[name="confirmPassword"]');
		await expect(confirmPass).toBeVisible();

		// Fill Form
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.fill('input[name="confirmPassword"]', password);

		await page.waitForTimeout(500); // Wait for animations
		await page.screenshot({ path: 'test-results/light-mode-signup.png', fullPage: true });

		// Submit (using robust type selector)
		await page.locator('button[type="submit"]').click();

		// 3. Dashboard Verification
		await expect(page).toHaveURL('/app');

		// Verify Light Mode Persisted
		await expect(html).not.toHaveClass(/dark/);

		// Wait for content
		await expect(page.locator('header')).toBeVisible();
		await page.waitForTimeout(1000); // Allow skeletons to resolve

		// Screenshot 2: Dashboard (Light)
		await page.screenshot({ path: 'test-results/light-mode-dashboard.png', fullPage: true });

		// 4. Trends Page
		await page.goto('/app/trends');
		await page.waitForTimeout(1500); // Wait for charts/animations
		await page.screenshot({ path: 'test-results/light-mode-trends.png', fullPage: true });

		// 5. Inventory Page
		await page.goto('/app/inventory');
		await expect(page).toHaveURL('/app/inventory');
		await page.waitForTimeout(1000);
		await page.screenshot({ path: 'test-results/light-mode-inventory.png', fullPage: true });

		// 6. Settings Page
		await page.goto('/app/settings');
		await expect(page).toHaveURL('/app/settings');
		await page.waitForTimeout(1000);
		await page.screenshot({ path: 'test-results/light-mode-settings.png', fullPage: true });

		// Return to Dashboard for Modal
		await page.goto('/app');

		// 7. Add Entry Modal
		// Click the FAB/Add button (usually bottom right or in nav)
		const addBtn = page.locator('button:has(svg.lucide-plus)').last();
		await addBtn.click();

		// Wait for Modal
		const modal = page.locator('.glass, [role="dialog"]').filter({ has: page.locator('input[name="item"]') });
		await expect(modal).toBeVisible();
		await expect(modal.locator('input[name="item"]')).toBeVisible();
		await page.waitForTimeout(500); // Wait for modal animation

		// Screenshot 6: Add Entry Modal (Light)
		await page.screenshot({ path: 'test-results/light-mode-add-entry-modal.png' });

		// Close modal (click outside or escape) to be clean, or just force navigate
		await page.keyboard.press('Escape');
		await page.waitForTimeout(300);

		// 8. Logout & Landing Page
		// Go to settings to logout
		// Let's logout via settings
		await page.goto('/app/settings');
		// Use icon selector which is language-agnostic
		await page.locator('button:has(svg.lucide-log-out)').click();
		await expect(page).toHaveURL('/login'); // Should redirect to login

		// Now goto Landing
		await page.goto('/');

		// Ensure Light Mode on Landing
		const isDarkLanding = await html.evaluate((el) => el.classList.contains('dark'));
		if (isDarkLanding) {
			// Landing page has a toggle in header usually
			const toggle = page.getByLabel('Toggle theme').first();
			if (await toggle.isVisible()) {
				await toggle.click();
				await page.waitForTimeout(500);
			}
		}

		await page.waitForTimeout(1000);
		await page.screenshot({ path: 'test-results/light-mode-landing.png', fullPage: true });
	});
});
