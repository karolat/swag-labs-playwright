import { InventoryPage } from '@/pages';
import { expect } from '@playwright/test';
import { test } from '@/fixtures';
import {
  CHECKOUT_EXPECTED_TOTALS,
  type CheckoutCustomer,
  USER_CREDENTIALS,
} from '@/test-data';

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
      const itemName = 'Sauce Labs Backpack';
      const customer: CheckoutCustomer = {
        firstName: 'John',
        lastName: 'Doe',
        postalCode: '12345',
      };
      const expectedTotals = CHECKOUT_EXPECTED_TOTALS[itemName];

      const productDetailsPage = await inventoryPage.openItemByName(itemName);
      await productDetailsPage.addToCart();

      const cartPage = await productDetailsPage.openCart();
      const checkoutInfoPage = await cartPage.proceedToCheckout();

      await checkoutInfoPage.fillCustomerInfo(customer);

      const checkoutOverviewPage = await checkoutInfoPage.continue();

      expect(await checkoutOverviewPage.getItemTotal()).toBeCloseTo(
        expectedTotals.itemTotal,
        2
      );
      expect(await checkoutOverviewPage.getTotalWithTax()).toBeCloseTo(
        expectedTotals.totalWithTax,
        2
      );

      const checkoutCompletePage = await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectSuccess();
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
