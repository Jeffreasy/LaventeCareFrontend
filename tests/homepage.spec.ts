import { expect, test } from '@playwright/test';

test.describe('Public routing', () => {
  test('homepage renders meaningful content', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/LaventeCare/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('mobile homepage has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('unknown routes use the real 404 response', async ({ page }) => {
    const response = await page.goto('/route-that-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('protected admin route rehydrates then fails closed to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login\?returnTo=/);
    await expect(page.getByRole('heading', { name: /Welkom terug/i })).toBeVisible();
  });
});
