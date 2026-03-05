import { test as baseTest, expect } from "@playwright/test";
import { test } from "@/fixtures";
import { LoginPage, InventoryPage } from "@/pages";
import { USER_CREDENTIALS } from "@/test-data/users";
import { CHECKOUT_CUSTOMER } from "@/test-data/checkout";

baseTest.describe("Smoke", { tag: "@smoke" }, () => {
  baseTest("login page should load", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Swag Labs");
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  baseTest("user should be able to log in", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USER_CREDENTIALS.standard_user);

    await expect(page).toHaveURL(/\/inventory\.html$/);
  });
});

test.describe("Smoke (authenticated)", { tag: "@smoke" }, () => {
  test("inventory should display products", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    const items = inventoryPage.inventory.locator('[data-test="inventory-item"]');
    await expect(items).toHaveCount(6);
  });

  test("should complete a purchase end-to-end", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    const cartPage = await inventoryPage.openCart();
    const checkoutInfoPage = await cartPage.proceedToCheckout();

    await checkoutInfoPage.fillCustomerInfo(CHECKOUT_CUSTOMER);
    const checkoutOverviewPage = await checkoutInfoPage.continue();
    const checkoutCompletePage = await checkoutOverviewPage.finish();

    await checkoutCompletePage.expectSuccess();
  });

  test("should be able to log out", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.clickMenuItem("Logout");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
