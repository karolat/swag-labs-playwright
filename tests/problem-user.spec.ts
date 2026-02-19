import { InventoryPage } from '@/pages';
import { expect } from '@playwright/test';
import { test } from '@/fixtures';
import { USER_CREDENTIALS } from '@/test-data/users';
import { CHECKOUT_CUSTOMER } from '@/test-data/checkout';

test.describe('Regression: problem_user known defects', () => {
  test.use({ authUser: USER_CREDENTIALS.problem_user });
  test.fail();

  test('product images should be unique per item', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    const imageSrcs = await inventoryPage.getItemImageSrcs();
    expect(imageSrcs.length).toBeGreaterThan(1);

    const uniqueSrcs = new Set(imageSrcs);
    expect(
      uniqueSrcs.size,
      `Expected ${imageSrcs.length} unique product images but found only ${uniqueSrcs.size} — all images point to the same source`
    ).toBe(imageSrcs.length);
  });

  test('sorting should reorder inventory items', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    const defaultNames = await inventoryPage.getItemNames();

    await inventoryPage.sortBy('Name (Z to A)');
    const zToANames = await inventoryPage.getItemNames();

    const expectedOrder = [...defaultNames].sort((a, b) =>
      b.localeCompare(a)
    );
    expect(
      zToANames,
      'Sorting by Name (Z to A) did not reorder the items'
    ).toEqual(expectedOrder);
  });

  test('checkout should accept last name field input', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    const cartPage = await inventoryPage.openCart();
    const checkoutInfoPage = await cartPage.proceedToCheckout();

    await checkoutInfoPage.fillCustomerInfo(CHECKOUT_CUSTOMER);

    const lastNameValue = await checkoutInfoPage.getLastNameValue();
    expect(
      lastNameValue,
      'Last name field did not retain the entered value — input is broken for problem_user'
    ).toBe(CHECKOUT_CUSTOMER.lastName);
  });
});
