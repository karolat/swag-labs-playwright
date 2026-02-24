import { expect, test as base } from '@playwright/test';
import { test as authTest } from '@/fixtures';
import { CHECKOUT_CUSTOMER } from '@/test-data/checkout';
import { InventoryPage, LoginPage } from '@/pages';
import { expectStableScreenshot } from '@/utils/visual';

const BACKPACK_ITEM_NAME = 'Sauce Labs Backpack';
const LINUX_ONLY_REASON =
  'Visual baselines are Linux-authoritative to match CI snapshot rendering.';

base.describe('Visual regression: public critical pages', () => {
  base.skip(process.platform !== 'linux', LINUX_ONLY_REASON);

  base('login page shell', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const loginShell = page.locator('#root');
    await expect(loginShell).toBeVisible();
    await expectStableScreenshot(loginShell, 'login-page-shell.png');
  });
});

authTest.describe('Visual regression: authenticated critical pages', () => {
  authTest.skip(process.platform !== 'linux', LINUX_ONLY_REASON);

  authTest('inventory page', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    const inventoryShell = page.locator('#contents_wrapper');
    await expect(inventoryShell).toBeVisible();
    await expectStableScreenshot(inventoryShell, 'inventory-page.png');
  });

  authTest('cart page with one item', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
    await inventoryPage.addItemToCart(BACKPACK_ITEM_NAME);
    await inventoryPage.openCart();

    const cartShell = page.locator('#contents_wrapper');
    await expect(cartShell).toBeVisible();
    await expectStableScreenshot(cartShell, 'cart-page-one-item.png');
  });

  authTest('checkout overview page with one item', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
    await inventoryPage.addItemToCart(BACKPACK_ITEM_NAME);

    const cartPage = await inventoryPage.openCart();
    const checkoutInfoPage = await cartPage.proceedToCheckout();
    await checkoutInfoPage.fillCustomerInfo(CHECKOUT_CUSTOMER);
    await checkoutInfoPage.continue();

    const checkoutOverviewShell = page.locator('#contents_wrapper');
    await expect(checkoutOverviewShell).toBeVisible();
    await expectStableScreenshot(
      checkoutOverviewShell,
      'checkout-overview-one-item.png',
    );
  });
});
