import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test('should load successfully', async ({ page }) => {
        await page.goto('/');

        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');

        // Check that page loads without errors
        expect(page).toBeTruthy();
    });

    test('should have correct title', async ({ page }) => {
        await page.goto('/');

        // Adjust this based on your actual homepage title
        await expect(page).toHaveTitle(/LaventeCare|Astro/);
    });
});
