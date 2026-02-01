import { test, expect } from '@playwright/test';

test.describe('Login Page', { tag: '@smoke' }, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
		// Switch to English if not already
		const langBtn = page.getByRole('button', { name: /Language|ภาษา/i });
		if (await langBtn.textContent().then((t) => t?.includes('TH'))) {
			await langBtn.click();
		}
	});

	test('should render login form correctly', async ({ page }) => {
		// Check for title (Restock.)
		await expect(page.locator('h1')).toHaveText(/Restock/);

		// Check for default password mode
		await expect(page.getByRole('button', { name: 'Password' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Passkey' })).toBeVisible();

		// Check inputs
		// Username and Password
		await expect(page.getByPlaceholder(/Username|ชื่อผู้ใช้/i)).toBeVisible();
		await expect(page.getByPlaceholder(/••••••••/i).first()).toBeVisible();

		// Check default login subtitle
		await expect(page.getByText(/Secure Portal/i)).toBeVisible();
	});

	test('should show signup mode', async ({ page }) => {
		// New styling: "New here?" -> "Sign up" toggle
		// The test relies on "Don't have an account..."
		// Current UI: "New here?" (p) -> "Sign up" (button)
		// We can click the button "Sign up" inside the footer toggle
		const toggleBtn = page.locator('button', { hasText: 'Sign up' }).last();
		await toggleBtn.click();
		await expect(page.getByRole('button', { name: 'Sign Up', exact: true })).toBeVisible();
	});

	test('should show error for invalid login', async ({ page }) => {
		// Fill form
		await page.getByPlaceholder('Username').fill('nonexistentuser');
		await page.getByPlaceholder('••••••••').last().fill('wrongpassword'); // Placeholder is dots

		// Submit
		await page.getByRole('button', { name: 'Log In' }).click();

		// Should show error message
		await expect(page.locator('.text-red-400')).toBeVisible();
	});

	test('should show passkey login option', async ({ page }) => {
		const passkeyBtn = page.getByRole('button', { name: 'Passkey' });
		await passkeyBtn.click();

		await expect(page.getByText('Passkey Ready')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Authenticate' })).toBeVisible();

		const backBtn = page.getByRole('button', { name: 'Password' });
		await backBtn.click();

		// Use consistent placeholder for password
		await expect(page.getByPlaceholder('••••••••').first()).toBeVisible();
	});
});
