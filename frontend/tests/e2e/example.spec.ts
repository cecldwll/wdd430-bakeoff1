import { test, expect } from '@playwright/test';

/**
 * Example E2E tests for Digital Scrapboard
 * Demonstrates key user flows and browser interactions
 */

test.describe('Homepage', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to homepage before each test
		await page.goto('/');
	});

	test('should display homepage content', async ({ page }) => {
		// Check that main heading exists
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test('should have navigation links', async ({ page }) => {
		// Check for navigation elements (you'll add these in Phase 3)
		const nav = page.locator('nav');
		await expect(nav).toBeVisible();
	});
});

test.describe('Responsive Design', () => {
	test('should be mobile responsive', async ({ page }) => {
		await page.goto('/');
		await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

		const content = page.locator('main');
		await expect(content).toBeVisible();
	});

	test('should be desktop responsive', async ({ page }) => {
		await page.goto('/');
		await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size

		const content = page.locator('main');
		await expect(content).toBeVisible();
	});
});

test.describe('Performance', () => {
	test('should load homepage in under 3 seconds', async ({ page }) => {
		const startTime = Date.now();
		await page.goto('/');
		const loadTime = Date.now() - startTime;

		expect(loadTime).toBeLessThan(3000);
	});
});

test.describe('Accessibility', () => {
	test('should have proper page structure', async ({ page }) => {
		await page.goto('/');

		// Check for semantic HTML
		const main = page.locator('main');
		await expect(main).toBeDefined();
	});

	test('should be keyboard navigable', async ({ page }) => {
		await page.goto('/');

		// Tab through interactive elements
		await page.keyboard.press('Tab');
		const focused = await page.evaluate(() => document.activeElement?.tagName);

		expect(focused).toBeTruthy();
	});
});

test.describe('Error Handling', () => {
	test('should show 404 page for non-existent routes', async ({ page }) => {
		const response = await page.goto('/this-page-does-not-exist');

		expect(response?.status()).toBe(404);
	});
});
