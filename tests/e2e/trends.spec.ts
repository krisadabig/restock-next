import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '11340e694ef1939c910bbd3f0cc6f9eaa97f8b5ca9519f50ce01581ef36f331c';

test.describe('Trends Page', { tag: '@smoke' }, () => {
	test.beforeEach(async ({ page, context }) => {
		// Bypass login using JWE
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

		await page.goto('/app/trends');

		const langBtn = page.getByRole('button', { name: /Language|ภาษา/i });
		if ((await langBtn.count()) > 0 && (await langBtn.textContent().then((t) => t?.includes('TH')))) {
			await langBtn.click();
		}
	});

	test('should render trends page correctly', async ({ page }) => {
		await expect(page.locator('h1')).toHaveText(/Spending Trends|แนวโน้มการใช้จ่าย/i);
		await expect(page.getByText(/Total Spending|ยอดรวมรายเดือน/i)).toBeVisible();
		await expect(page.getByText(/Top Items by Cost|สินค้าที่ใช้จ่ายสูงสุด/i)).toBeVisible();
	});

	test('should show empty state if no entries', async ({ page }) => {
		const bars = page.locator('div[style*="width"]');
		if ((await bars.count()) === 0) {
			await expect(page.getByText(/Add your first item!|บันทึกรายการแรกเลย!/i)).toBeVisible();
		}
	});
});
