import { expect } from '@playwright/test';
import { test } from '@/fixtures';

test.describe('Visual Regression @visual', () => {
  test('login page matches snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('inventory page matches snapshot', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveScreenshot('inventory-page.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
