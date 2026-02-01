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

		// Switch to signup
		// Switch to signup
		// Find the container with "New here?" text and click the button inside it
		const toggleContainer = page.locator('div', { hasText: 'New here?' }).last();
		await toggleContainer.locator('button').click();

		await page.fill('input[name="username"]', username);
		await page.fill('input[name="password"]', 'password123');
		await page.fill('input[name="confirmPassword"]', 'password123'); // Added in previous task

		await page.click('button[type="submit"]');

		// 2. Wait for Dashboard
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
});
