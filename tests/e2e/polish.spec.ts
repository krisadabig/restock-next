import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '11340e694ef1939c910bbd3f0cc6f9eaa97f8b5ca9519f50ce01581ef36f331c';

test.describe('App Polish & UX', () => {
	test.beforeEach(async ({ context }) => {
		// Auth Setup
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

	test('Theme persists without flash', async ({ page }) => {
		await page.goto('/app/settings');
		const html = page.locator('html');
		// Default might be dark or system. Let's check current state.
		// If it's dark, toggle to light.
		const isDark = await html.getAttribute('class').then((c) => c?.includes('dark'));

		if (isDark) {
			// Toggle to light
			await page.getByRole('button', { name: /Light Mode/i }).click();
			await expect(html).not.toHaveClass(/dark/);
		} else {
			// Toggle to dark
			await page.getByRole('button', { name: /Dark Mode/i }).click();
			await expect(html).toHaveClass(/dark/);
		}

		// Reload
		await page.reload();

		// Check persistence
		if (isDark) {
			await expect(html).not.toHaveClass(/dark/); // Should stay light
		} else {
			await expect(html).toHaveClass(/dark/); // Should stay dark
		}
	});

	test('Edit Modal uses Bottom Sheet on Mobile', async ({ page }) => {
		// iPhone 15 Viewport
		await page.setViewportSize({ width: 393, height: 852 });
		await page.goto('/app');

		// Open Add Modal via link (as in dashboard.spec.ts)
		await page.locator('a[href="/app?add=true"]').click();

		// Check Modal Container
		const modal = page.locator('.fixed.inset-0.z-100');
		await expect(modal).toBeVisible();

		// Check inner modal card for bottom sheet styling
		// It should have 'rounded-b-none' which we added
		const inner = modal.locator('.relative.w-full');
		await expect(inner).toHaveClass(/rounded-t-2xl/);
		await expect(inner).toHaveClass(/rounded-b-none/);
	});

	test('Logout shows loading state', async ({ page }) => {
		await page.goto('/app/settings');

		// Find logout button
		const logoutBtn = page.getByRole('button', { name: /Log Out|Logout/i });

		// Click and check state immediately
		await logoutBtn.click();

		// Expect button to be disabled and show processing text
		await expect(logoutBtn).toBeDisabled();
		await expect(logoutBtn).toHaveText(/Processing|Logging out/i);
	});
});
