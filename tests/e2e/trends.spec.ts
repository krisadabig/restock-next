import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '11340e694ef1939c910bbd3f0cc6f9eaa97f8b5ca9519f50ce01581ef36f331c';

test.describe('Trends Page', { tag: '@smoke' }, () => {
	test.beforeEach(async ({ page, context }) => {
		// Bypass login
		const token = jwt.sign({ id: 'test-user-id', username: 'testuser' }, JWT_SECRET, {
			expiresIn: '7d',
		});

		await context.addCookies([
			{
				name: 'session',
				value: token,
				domain: 'localhost',
				path: '/',
			},
		]);

		await page.goto('/app/trends');

		// Switch to English if needed for basic check
		const langBtn = page.getByRole('button', { name: /Language|ภาษา/i });
		if ((await langBtn.count()) > 0 && (await langBtn.textContent().then((t) => t?.includes('TH')))) {
			await langBtn.click();
		}
	});

	test('should render trends page correctly', async ({ page }) => {
		// Check for Header (Handles both EN and TH)
		await expect(page.locator('h1')).toHaveText(/Spending Trends|แนวโน้มการใช้จ่าย/i);

		// Check for Total Spending card
		await expect(page.getByText(/Total Spending|ยอดรวมรายเดือน/i)).toBeVisible();

		// Check for Top Items section
		await expect(page.getByText(/Top Items by Cost|สินค้าที่ใช้จ่ายสูงสุด/i)).toBeVisible();
	});

	test('should show empty state if no entries', async ({ page }) => {
		// If no progress bars are found
		const bars = page.locator('div[style*="width"]');
		if ((await bars.count()) === 0) {
			await expect(page.getByText(/Add your first item!|บันทึกรายการแรกเลย!/i)).toBeVisible();
		}
	});
});
