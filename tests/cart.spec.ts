import { InventoryPage } from "@/pages";
import { expect } from "@playwright/test";
import { test } from "@/fixtures";

test.describe("Cart", () => {
  test('should show cart badge "1" after adding an item', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.addItemToCart("Sauce Labs Backpack");

    await inventoryPage.expectCartBadge("1");
  });

  test('should show cart badge "2" after adding two items', async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.addItemToCart("Sauce Labs Bike Light");

    await inventoryPage.expectCartBadge("2");
  });

  test("should update badge and remove item when removing from cart", async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.addItemToCart("Sauce Labs Bike Light");
    await inventoryPage.expectCartBadge("2");

    const cartPage = await inventoryPage.openCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    await cartPage.removeItem("Sauce Labs Backpack");

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(
      cartPage.getItemByName("Sauce Labs Backpack"),
    ).not.toBeVisible();

    // Badge should now show "1"
    await expect(cartPage.cartBadge).toHaveText("1");
  });

  test("should persist cart across page navigation", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.expectCartBadge("1");

    // Navigate to the cart page and back
    const cartPage = await inventoryPage.openCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    // Navigate back to inventory via "Continue Shopping"
    await cartPage.clickContinueShopping();
    await inventoryPage.expectLoaded();

    // Cart badge should still show "1"
    await inventoryPage.expectCartBadge("1");
  });
});
