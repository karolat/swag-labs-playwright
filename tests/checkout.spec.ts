import { InventoryPage } from '@/pages';
import { expect, type Page } from '@playwright/test';
import { test } from '@/fixtures';
import { CHECKOUT_EXPECTED_TOTALS } from '@/test-data/pricing';
import {
  CHECKOUT_CUSTOMER,
  CHECKOUT_VALIDATION_CASES,
} from '@/test-data/checkout';

const BACKPACK_ITEM_NAME: keyof typeof CHECKOUT_EXPECTED_TOTALS =
  'Sauce Labs Backpack';
const BACKPACK_TOTALS = CHECKOUT_EXPECTED_TOTALS[BACKPACK_ITEM_NAME];

const openCheckoutInfoFromEmptyCart = async (page: Page) => {
  const inventoryPage = new InventoryPage(page);
  await inventoryPage.goto();
  const cartPage = await inventoryPage.openCart();
  await cartPage.expectEmpty();
  return cartPage.proceedToCheckout();
};

test.describe('Full checkout flow', () => {
  test('should be able to checkout a product successfully', async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
    const productDetailsPage =
      await inventoryPage.openItemByName(BACKPACK_ITEM_NAME);
    await productDetailsPage.addToCart();

    const cartPage = await productDetailsPage.openCart();
    const checkoutInfoPage = await cartPage.proceedToCheckout();

    await checkoutInfoPage.fillCustomerInfo(CHECKOUT_CUSTOMER);

    const checkoutOverviewPage = await checkoutInfoPage.continue();

    expect(await checkoutOverviewPage.getItemTotal()).toBeCloseTo(
      BACKPACK_TOTALS.itemTotal,
      2
    );
    expect(await checkoutOverviewPage.getTotalWithTax()).toBeCloseTo(
      BACKPACK_TOTALS.totalWithTax,
      2
    );

    const checkoutCompletePage = await checkoutOverviewPage.finish();
    await checkoutCompletePage.expectSuccess();
  });
});

test.describe('Checkout validation', () => {
  for (const validationCase of CHECKOUT_VALIDATION_CASES) {
    test(`should show an error when ${validationCase.name}`, async ({
      page,
    }) => {
      const checkoutInfoPage = await openCheckoutInfoFromEmptyCart(page);

      await checkoutInfoPage.fillCustomerInfo(validationCase.customer);
      await checkoutInfoPage.clickContinue();
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
      await checkoutInfoPage.expectValidationError(
        validationCase.expectedError
      );
    });
  }
});

test.describe('Empty cart checkout', () => {
  test('should checkout with zero totals when cart is empty', async ({
    page,
  }) => {
    const checkoutInfoPage = await openCheckoutInfoFromEmptyCart(page);
    await checkoutInfoPage.fillCustomerInfo(CHECKOUT_CUSTOMER);

    const checkoutOverviewPage = await checkoutInfoPage.continue();
    expect(await checkoutOverviewPage.getItemTotal()).toBeCloseTo(0, 2);
    expect(await checkoutOverviewPage.getTotalWithTax()).toBeCloseTo(0, 2);

    const checkoutCompletePage = await checkoutOverviewPage.finish();
    await checkoutCompletePage.expectSuccess();
  });
});
