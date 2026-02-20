import { test } from '@/fixtures';
import { expect } from '@playwright/test';
import { InventoryPage } from '@/pages';
import { USER_CREDENTIALS } from '@/test-data/users';

const INVENTORY_TIMEOUT_MS = Number(process.env.GLITCH_INVENTORY_TIMEOUT_MS ?? 12000);
const ACTION_BUDGET_MS = Number(process.env.GLITCH_ACTION_BUDGET_MS ?? 3000);

test.describe('performance_glitch_user', () => {
  test.use({ authUser: USER_CREDENTIALS.performance_glitch_user });
  test.describe.configure({ mode: 'serial' });
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Performance budgets are tuned for chromium',
  );

  test('inventory loads with explicit timeout handling', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page.locator('[data-test="inventory-container"]')).toBeVisible({
      timeout: INVENTORY_TIMEOUT_MS,
    });
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6, {
      timeout: INVENTORY_TIMEOUT_MS,
    });
  });

  test('first core action stays responsive after load', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await page.goto('/inventory.html');
    await expect(inventoryPage.inventory).toBeVisible({ timeout: INVENTORY_TIMEOUT_MS });

    const startedAt = Date.now();
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.expectCartBadge('1');

    expect(Date.now() - startedAt).toBeLessThan(ACTION_BUDGET_MS);
  });
});
