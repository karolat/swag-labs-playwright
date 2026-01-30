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

  test.describe('Full checkout flow', () => {
    test('should be able to checkout a product successfully', async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      // click on an item

      // pause here so i can debug

      await page.locator('[data-test="item-4-title-link"]').click()

      // add the item to cart

      await page.locator('[data-test="add-to-cart"]').click();

      // click on the cart icon
      await page.locator('[data-test="shopping-cart-link"]').click();
      // click checkout
      await page.locator('[data-test="checkout"]').click();

      // enter first/last/zip
      await page.locator('[data-test="firstName"]').fill('John');
      await page.locator('[data-test="lastName"]').fill('Doe');
      await page.locator('[data-test="postalCode"]').fill('12345');
      // continue

      await page.locator('[data-test="continue"]').click();
      // click finish
      await page.locator('[data-test="finish"]').click();
      // verify price = 29.99 for item, 32.39 with tax

      await page.pause();
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
