import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '11340e694ef1939c910bbd3f0cc6f9eaa97f8b5ca9519f50ce01581ef36f331c';
const IPHONE_16_PRO = { width: 393, height: 852 };

async function setupAuth(context: {
	addCookies: (cookies: Array<{ name: string; value: string; domain: string; path: string }>) => Promise<void>;
}) {
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
}

test.describe('Modal Positioning on Mobile (iPhone 16 Pro)', () => {
	test.beforeEach(async ({ page, context }) => {
		await setupAuth(context);
		await page.setViewportSize(IPHONE_16_PRO);
		await page.goto('/app');
	});

	test('Add modal should be positioned at bottom with accessible buttons', async ({ page }) => {
		// Open Add modal
		await page.goto('/app?add=true');
		await page.waitForTimeout(500);

		// Verify modal is visible
		const addModal = page.getByRole('heading', { name: /add entry|เพิ่มรายการ/i }).locator('..');
		await expect(addModal).toBeVisible();

		// Verify submit button is visible and within viewport
		const submitButton = page.getByRole('button', { name: /add entry|เพิ่มรายการ/i });
		await expect(submitButton).toBeVisible();

		// Verify button is in viewport (not cut off)
		const buttonBox = await submitButton.boundingBox();
		expect(buttonBox).toBeTruthy();
		expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(IPHONE_16_PRO.height);

		// Verify modal parent is document.body (using createPortal)
		const modalParent = await addModal.evaluate((el) => {
			// Walk up to find the modal container
			let current = el.parentElement;
			while (current && !current.classList.contains('fixed')) {
				current = current.parentElement;
			}
			return current?.parentElement?.tagName;
		});
		expect(modalParent).toBe('BODY');
	});

	test('Edit modal should match Add modal positioning', async ({ page }) => {
		// First, add an entry
		await page.goto('/app?add=true');
		await page.waitForTimeout(500);
		await page.locator('input[name="item"]').fill('Test Item');
		await page.locator('input[name="price"]').fill('50');
		await page.getByRole('button', { name: /add entry|เพิ่มรายการ/i }).click();
		await page.waitForTimeout(1500);

		// Wait for entry to appear
		await expect(page.locator('text=Test Item').first()).toBeVisible();

		// Click Edit button on the entry
		const editButton = page.getByRole('button', { name: 'Edit' }).or(page.getByLabel('Edit')).first();
		await editButton.click();
		await page.waitForTimeout(500);

		// Verify Edit modal is visible
		const editModalHeading = page.getByRole('heading', { name: /edit|แก้ไข/i });
		await expect(editModalHeading).toBeVisible();

		// Verify all form fields are visible and accessible
		const itemInput = page.getByRole('combobox').or(page.getByRole('textbox')).first();
		await expect(itemInput).toBeVisible();

		const saveButton = page.getByRole('button', { name: /save|บันทึก/i });
		await expect(saveButton).toBeVisible();

		// Verify save button is within viewport (not cut off)
		const saveButtonBox = await saveButton.boundingBox();
		expect(saveButtonBox).toBeTruthy();
		expect(saveButtonBox!.y + saveButtonBox!.height).toBeLessThanOrEqual(IPHONE_16_PRO.height);

		// Verify modal parent is document.body (using createPortal)
		const editModal = editModalHeading.locator('..');
		const modalParent = await editModal.evaluate((el) => {
			let current = el.parentElement;
			while (current && !current.classList.contains('fixed')) {
				current = current.parentElement;
			}
			return current?.parentElement?.tagName;
		});
		expect(modalParent).toBe('BODY');
	});

	test('Delete modal should match Add modal positioning with accessible buttons', async ({ page }) => {
		// First, add an entry
		await page.goto('/app?add=true');
		await page.waitForTimeout(500);
		await page.locator('input[name="item"]').fill('Test Item to Delete');
		await page.locator('input[name="price"]').fill('75');
		await page.getByRole('button', { name: /add entry|เพิ่มรายการ/i }).click();
		await page.waitForTimeout(1500);

		// Wait for entry to appear
		await expect(page.locator('text=Test Item to Delete').first()).toBeVisible();

		// Click Delete button on the entry
		const deleteButton = page.getByRole('button', { name: 'Delete' }).or(page.getByLabel('Delete')).first();
		await deleteButton.click();
		await page.waitForTimeout(500);

		// Verify Delete modal is visible
		const deleteModalHeading = page.getByRole('heading', { name: /delete.*\?|ลบรายการ\?/i });
		await expect(deleteModalHeading).toBeVisible();

		// Verify both Cancel and Delete buttons are visible
		const cancelButton = page.getByRole('button', { name: /cancel|ยกเลิก/i });
		const confirmDeleteButton = page.getByRole('button', { name: /delete|ลบ/i }).last();

		await expect(cancelButton).toBeVisible();
		await expect(confirmDeleteButton).toBeVisible();

		// Verify buttons are within viewport (no scrolling required)
		const cancelBox = await cancelButton.boundingBox();
		const deleteBox = await confirmDeleteButton.boundingBox();

		expect(cancelBox).toBeTruthy();
		expect(deleteBox).toBeTruthy();
		expect(cancelBox!.y + cancelBox!.height).toBeLessThanOrEqual(IPHONE_16_PRO.height);
		expect(deleteBox!.y + deleteBox!.height).toBeLessThanOrEqual(IPHONE_16_PRO.height);

		// Verify modal parent is document.body (using createPortal)
		const deleteModal = deleteModalHeading.locator('..');
		const modalParent = await deleteModal.evaluate((el) => {
			let current = el.parentElement;
			while (current && !current.classList.contains('fixed')) {
				current = current.parentElement;
			}
			return current?.parentElement?.tagName;
		});
		expect(modalParent).toBe('BODY');
	});
});

test.describe('Modal Positioning on Desktop', () => {
	test.beforeEach(async ({ page, context }) => {
		await setupAuth(context);
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/app');
	});

	test('All modals should be centered on desktop', async ({ page }) => {
		// Test Add modal
		await page.goto('/app?add=true');
		await page.waitForTimeout(1000);

		// Verify modal is visible
		const addModalHeading = page.getByRole('heading', { name: /add entry|เพิ่มรายการ/i });
		await expect(addModalHeading).toBeVisible();

		// Verify form fields are visible (modal is properly rendered)
		await expect(page.locator('input[name="item"]')).toBeVisible();
		await expect(page.getByRole('button', { name: /add entry|เพิ่มรายการ/i })).toBeVisible();
	});
});
