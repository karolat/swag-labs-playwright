import { test } from '@/fixtures';
import { expect } from '@playwright/test';
import { InventoryPage, CheckoutInfoPage } from '@/pages';

test.describe('Checkout form validation', () => {
  let checkoutPage: CheckoutInfoPage;

  test.beforeEach(async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    // Add the first item to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    const cartPage = await inventoryPage.openCart();
    checkoutPage = await cartPage.proceedToCheckout();
  });

  test('should show error when first name is missing', async () => {
    await checkoutPage.fillCustomerInfo({
      firstName: '',
      lastName: 'Doe',
      postalCode: '12345',
    });
    await checkoutPage.clickContinue();

    await checkoutPage.expectError('Error: First Name is required');
  });

  test('should show error when last name is missing', async () => {
    await checkoutPage.fillCustomerInfo({
      firstName: 'John',
      lastName: '',
      postalCode: '12345',
    });
    await checkoutPage.clickContinue();

    await checkoutPage.expectError('Error: Last Name is required');
  });

  test('should show error when postal code is missing', async () => {
    await checkoutPage.fillCustomerInfo({
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '',
    });
    await checkoutPage.clickContinue();

    await checkoutPage.expectError('Error: Postal Code is required');
  });

  test('should show error when all fields are empty', async () => {
    await checkoutPage.clickContinue();

    await checkoutPage.expectError('Error: First Name is required');
  });
});
