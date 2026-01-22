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
		await expect(page.getByPlaceholder('email address')).toBeVisible();
		await expect(page.getByPlaceholder('password')).toBeVisible();

		// Check default login subtitle
		await expect(page.getByText('Secure passwordless entry')).toBeVisible();
	});

	test('should toggle between password and passkey', async ({ page }) => {
		const passkeyBtn = page.getByRole('button', { name: 'Passkey' });
		await passkeyBtn.click();

		// Check for username input (for webauthn)
		await expect(page.getByPlaceholder('username')).toBeVisible();

		// Check button text changes
		await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();

		// Toggle back
		await page.getByRole('button', { name: 'Password' }).click();
		await expect(page.getByPlaceholder('password')).toBeVisible();
	});

	test('should toggle signup mode', async ({ page }) => {
		// Click "Don't have an account?"
		await page.getByText("Don't have an account? Sign up").click();

		// Check subtitle change
		await expect(page.getByText('Create your account')).toBeVisible();

		// Check username input appears in password mode too for signup
		await expect(page.getByPlaceholder('username')).toBeVisible();

		// Check button text
		await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
	});

	test('should show error for password login', async ({ page }) => {
		// Fill form
		await page.getByPlaceholder('email address').fill('test@test.com');
		await page.getByPlaceholder('password').fill('password');

		// Submit
		await page.getByRole('button', { name: 'Log In' }).click();

		// Should show error message
		await expect(page.getByText('Password login is not enabled')).toBeVisible();
	});

	test('should attempt passkey login', async ({ page }) => {
		// Switch to Passkey
		await page.getByRole('button', { name: 'Passkey' }).click();

		// Fill username
		await page.getByPlaceholder('username').fill('testuser');

		// Mock the API call to avoid actual network/DB issues during this specific test if needed
		// or just let it hit the real API and fail on browser interaction (since we can't click the browser popup)
		// Better: Verify it goes to loading state

		await page.getByRole('button', { name: 'Continue' }).click();

		// Should show authenticating state
		await expect(page.getByText('Authenticating...')).toBeVisible();
	});
});
