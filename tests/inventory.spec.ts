import { InventoryPage } from '@/pages';
import { expect } from '@playwright/test';
import { test } from '@/fixtures';
import { USER_CREDENTIALS } from '@/utils/constants';

test.describe('Inventory with normal user', () => {
  test('the logo text should be visible', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    const logo = inventoryPage.mainHeader.logo;

    expect(await logo.textContent()).toBe('Swag Labs');
  });

  test.describe('Inventory Menu', () => {
    test('the menu items should be correctly displayed', async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      await expect(inventoryPage.menuItems).toHaveText([
        'All Items',
        'About',
        'Logout',
        'Reset App State',
      ]);
    });
  });
});

test.describe('Inventory with problem_user', () => {
  test.use({ authUser: USER_CREDENTIALS.problem_user });

  test('the logo text should be visible', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    const logo = inventoryPage.mainHeader.logo;

    expect(await logo.textContent()).toBe('Swag Labs');
  });
});
