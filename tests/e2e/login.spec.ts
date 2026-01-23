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
		await expect(page.getByPlaceholder('username')).toBeVisible();
		await expect(page.getByPlaceholder('password')).toBeVisible();

		// Check default login subtitle
		await expect(page.getByText('Secure passwordless entry')).toBeVisible();
	});

	test('should show signup mode', async ({ page }) => {
		// Click "Don't have an account?"
		await page.getByText("Don't have an account? Sign up").click();

		// Check subtitle change (if we kept that logic)
		// Or check for button text
		await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
	});

	test('should show error for invalid login', async ({ page }) => {
		// Fill form
		await page.getByPlaceholder('username').fill('nonexistentuser');
		await page.getByPlaceholder('password').fill('wrongpassword');

		// Submit
		await page.getByRole('button', { name: 'Log In' }).click();

		// Should show error message
		await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
	});

	test('should show passkey disabled message', async ({ page }) => {
		const passkeyBtn = page.getByRole('button', { name: 'Passkey' });
		await passkeyBtn.click();

		await expect(page.getByText('Passkey login is temporarily disabled')).toBeVisible();

		const backBtn = page.getByRole('button', { name: 'Use Password' });
		await backBtn.click();

		await expect(page.getByPlaceholder('password')).toBeVisible();
	});
});
