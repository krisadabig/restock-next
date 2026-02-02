import { test, expect } from '@playwright/test';

test.describe('Dark Mode Visual Verification', () => {
	test('should capture consistently themed screenshots across key pages', async ({ page }) => {
		// 1. Initial Load & Theme Setup
		await page.goto('/login');

		// Ensure we are in DARK Mode
		const html = page.locator('html');
		// Initial state check
		let isDark = await html.evaluate((el: HTMLElement) => el.classList.contains('dark'));

		if (!isDark) {
			console.log('Page is Light. Toggling to Dark...');
			// Toggle theme
			await page.getByLabel('Toggle theme').click();
			await page.waitForTimeout(500);
			// Verify flip
			isDark = await html.evaluate((el: HTMLElement) => el.classList.contains('dark'));
			expect(isDark).toBeTruthy();
		}

		// Assert class
		await expect(html).toHaveClass(/dark/);

		// Screenshot 1: Login Page (Dark)
		await expect(page.locator('h1')).toContainText('Restock.');
		await page.waitForTimeout(500); // Wait for transitions
		await page.screenshot({ path: 'test-results/dark-mode-login.png', fullPage: true });

		// 2. Smart Auth (Reusable User)
		const username = 'visual_tester';
		const password = 'password123';

		// Attempt Login First
		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', password);
		await page.click('button[type="submit"]');

		const success = await Promise.race([
			page.waitForURL('/app').then(() => true),
			page
				.getByText('Invalid username or password')
				.waitFor()
				.then(() => false),
			page.waitForTimeout(5000).then(() => false), // Fallback timeout
		]);

		if (success) {
			console.log('Logged in successfully as reusable user.');
		} else {
			console.log('Login failed (or timed out), registering...');

			// Reload to ensure clean state
			await page.goto('/login');

			// Reliable Switch to Signup (State Check - PROVEN LOGIC)
			const confirmPass = page.locator('input[name="confirmPassword"]');
			if (!(await confirmPass.isVisible())) {
				await page.locator('div.pt-4 button').click();
			}
			await expect(confirmPass).toBeVisible();

			// Fill Signup Form
			await page.fill('input[name="username"]', username);
			await page.fill('input[name="password"]', password);
			await page.fill('input[name="confirmPassword"]', password);

			await page.waitForTimeout(500);
			await page.screenshot({ path: 'test-results/dark-mode-signup.png', fullPage: true });

			await page.click('button[type="submit"]');
			await expect(page).toHaveURL('/app');
		}

		// 3. Dashboard Verification
		await expect(page).toHaveURL('/app');

		// Verify Dark Mode Persisted
		await expect(html).toHaveClass(/dark/);

		// Wait for content
		await expect(page.locator('header')).toBeVisible();
		await page.waitForTimeout(1000); // Allow skeletons to resolve

		// Screenshot 2: Dashboard (Dark)
		await page.screenshot({ path: 'test-results/dark-mode-dashboard.png', fullPage: true });

		// 4. Trends Page
		await page.goto('/app/trends');
		await page.waitForTimeout(1500); // Wait for charts/animations
		await page.screenshot({ path: 'test-results/dark-mode-trends.png', fullPage: true });

		// 5. Inventory Page
		await page.goto('/app/inventory');
		await expect(page).toHaveURL('/app/inventory');
		await page.waitForTimeout(1000);
		await page.screenshot({ path: 'test-results/dark-mode-inventory.png', fullPage: true });

		// 6. Settings Page
		await page.goto('/app/settings');
		await expect(page).toHaveURL('/app/settings');
		await page.waitForTimeout(1000);
		await page.screenshot({ path: 'test-results/dark-mode-settings.png', fullPage: true });

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

		// Screenshot 6: Add Entry Modal (Dark)
		await page.screenshot({ path: 'test-results/dark-mode-add-entry-modal.png' });

		// Close modal
		await page.keyboard.press('Escape');
		await page.waitForTimeout(300);
	});
});
