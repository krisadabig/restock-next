import { test, expect } from '@playwright/test';

test.describe('Deep Glass Contrast Verification @smoke', () => {
	test('Login page should have accessible premium inputs', async ({ page }) => {
		await page.goto('/login');

		// Check for title accessibility and contrast
		const title = page.locator('h1');
		await expect(title).toContainText('Restock.');
		await expect(title).toHaveClass(/text-foreground/);

		// Check inputs for 'input-premium' class which enforces contrast
		const inputs = page.locator('input.input-premium');
		await expect(inputs).toHaveCount(2); // Username and Password

		// Check labels are muted-foreground (the new accessible color)
		const labels = page.locator('label');
		for (const label of await labels.all()) {
			await expect(label).toHaveClass(/text-muted-foreground/);
		}
	});

	test('Dashboard and Modals should have consistent high-contrast styling', async ({ page }) => {
		// 1. Register/Login Flow (using a unique user to avoid conflicts)
		await page.goto('/login');
		const timestamp = Date.now();
		const username = `testuser_${timestamp}`;

		// Ensure Signup Mode using state check
		const confirmPass = page.locator('input[name="confirmPassword"]');
		if (!(await confirmPass.isVisible())) {
			await page.locator('div.pt-4 button').click();
		}
		await expect(confirmPass).toBeVisible();

		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', 'password123');
		await page.fill('input[name="confirmPassword"]', 'password123');

		// Use robust submit button selector
		await page.locator('button[type="submit"]').click();
		await expect(page).toHaveURL('/app');

		// 3. Open Add Entry Modal
		// Fallback to structure-based selector if aria-label is tricky/loading
		const addBtn = page.locator('button:has(svg.lucide-plus)');
		await addBtn.waitFor();
		await addBtn.click();

		// 4. Verify Modal Contrast
		// Use input verification which is more robust than localized heading
		const modal = page.locator('.glass').filter({ has: page.locator('input[name="item"]') });
		await expect(modal).toBeVisible();

		// Verify Modal Labels are muted-foreground
		const modalLabels = modal.locator('label');
		const count = await modalLabels.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			await expect(modalLabels.nth(i)).toHaveClass(/text-muted-foreground/);
		}

		// Verify Inputs are premium
		const modalInputs = modal.locator('.input-premium');
		await expect(modalInputs).toHaveCount(5); // Name, Price, Qty, Date, Note
	});

	test('Light Mode should have accessible contrast', async ({ page }) => {
		// 1. Login first (Sign up as new user to ensure access)
		await page.goto('/login');
		const timestamp = Date.now();
		const username = `light_user_${timestamp}`;

		// 2. Register New User (Unique per run)
		// Ensure Signup Mode
		const confirmPass = page.locator('input[name="confirmPassword"]');
		if (!(await confirmPass.isVisible())) {
			await page.locator('div.pt-4 button').click();
		}
		await expect(confirmPass).toBeVisible();

		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', 'password123');
		await page.fill('input[name="confirmPassword"]', 'password123');
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL('/app');

		// 2. Go to settings and switch to Light Mode
		await page.goto('/app/settings');

		// Ensure we are in Light Mode (toggle if currently dark)
		const html = page.locator('html');
		const isDark = await html.evaluate((el) => el.classList.contains('dark'));
		if (isDark) {
			await page.getByRole('button', { name: /Dark Mode|โหมดมืด/i }).click();
		}

		// 2. Verify Light Mode Tokens applied
		await expect(html).not.toHaveClass(/dark/);
		// Background should be slate-50 (#f8fafc) or close to white, not dark
		// Note: Playwright getComputedStyle returns rgb
		await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 250, 252)');

		// 3. Verify Inputs in Light Mode
		// Go to Dashboard -> Add Entry
		await page.goto('/app');
		// Ensure we are on dashboard
		await expect(page).toHaveURL('/app');
		await expect(page.locator('header')).toBeVisible();

		const addBtn = page.locator('button:has(svg.lucide-plus)').last();
		// click auto-waits for visibility and actionability
		await addBtn.click();

		const modal = page.locator('.glass').filter({ has: page.locator('input[name="item"]') });
		await expect(modal).toBeVisible();

		// Check input background (should be light slate, not dark glass)
		const input = modal.locator('input[name="item"]');
		// We expect the variable --input-bg to resolve to something light.
		// In globals.css: --input-bg: rgba(241, 245, 249, 0.6) -> rgb(241, 245, 249) roughly
		const bg = await input.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		// Just ensure it's NOT the dark mode color 'rgb(26, 26, 37)'
		expect(bg).not.toBe('rgb(26, 26, 37)');
	});
});
