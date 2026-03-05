import { InventoryPage } from "@/pages";
import { expect } from "@playwright/test";
import { test } from "@/fixtures";

test.describe("Inventory sorting", () => {
  test("should sort by Price (low to high)", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.sortBy("Price (low to high)");

    const prices = await inventoryPage.getItemPrices();
    expect(prices.length).toBeGreaterThan(1);
    expect(prices[0]).toBeLessThanOrEqual(prices[prices.length - 1]);

    // Verify entire list is sorted ascending
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test("should sort by Price (high to low)", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.sortBy("Price (high to low)");

    const prices = await inventoryPage.getItemPrices();
    expect(prices.length).toBeGreaterThan(1);
    expect(prices[0]).toBeGreaterThanOrEqual(prices[prices.length - 1]);

    // Verify entire list is sorted descending
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  test("should sort by Name (Z to A)", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await inventoryPage.sortBy("Name (Z to A)");

    const names = await inventoryPage.getItemNames();
    expect(names.length).toBeGreaterThan(1);

    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });
});
