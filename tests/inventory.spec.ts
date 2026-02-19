import { InventoryPage } from '@/pages';
import { expect } from '@playwright/test';
import { test } from '@/fixtures';

test.describe('Inventory', () => {
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

    test('should be able to open and close the menu', async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();
      const mainHeader = inventoryPage.mainHeader;

      // Initially menu should be closed
      expect(await mainHeader.isMenuOpen()).toBeFalsy();

      // Open the menu
      await mainHeader.openMenu();
      expect(await mainHeader.isMenuOpen()).toBeTruthy();

      // Wait for menu animation to complete
      // await page.waitForTimeout(2000)

      // Close the menu
      await mainHeader.closeMenu();
      expect(await mainHeader.isMenuOpen()).toBeFalsy();
    });
  });
});
