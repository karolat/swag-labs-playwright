import { test } from "@/fixtures";
import { expect } from "@playwright/test";
import { InventoryPage } from "@/pages";

test.describe("Network Interception", { tag: "@network" }, () => {
  test("inventory remains functional when images fail to load", async ({
    page,
  }) => {
    const abortedImageUrls: string[] = [];

    // Simulate CDN outage by aborting all image requests.
    await page.route("**/*.{jpg,jpeg,png,gif,svg,webp}", async (route) => {
      abortedImageUrls.push(route.request().url());
      await route.abort("connectionfailed");
    });

    const inventory = new InventoryPage(page);
    await inventory.goto();

    // All products render without images.
    const items = await inventory.getItemNames();
    expect(items).toHaveLength(6);

    // The product image requests were attempted and intercepted.
    const productImageSrcs = await inventory.getItemImageSrcs();
    expect(productImageSrcs).toHaveLength(6);
    for (const src of productImageSrcs) {
      expect(
        abortedImageUrls,
        `Expected product image request to be aborted: ${src}`,
      ).toContain(src);
    }

    // Cart functionality is unaffected.
    await inventory.addItemToCart(items[0]);
    await inventory.expectCartBadge("1");
  });

  test("renders inventory with mocked product images", async ({ page }) => {
    const fulfilledImageUrls: string[] = [];
    const transparentPixel = Buffer.from(
      "R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
      "base64",
    );

    await page.route("**/*.{jpg,jpeg,png,gif,svg,webp}", async (route) => {
      fulfilledImageUrls.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "image/gif",
        body: transparentPixel,
      });
    });

    const inventory = new InventoryPage(page);
    await inventory.goto();

    // All product images are visible and served via our mocked route.
    const images = inventory.inventory.locator("img.inventory_item_img");
    await expect(images).toHaveCount(6);
    const productImageSrcs = await inventory.getItemImageSrcs();
    for (const src of productImageSrcs) {
      expect(
        fulfilledImageUrls,
        `Expected product image request to be fulfilled: ${src}`,
      ).toContain(src);
    }
    for (const img of await images.all()) {
      await expect(img).toBeVisible();
    }
  });

  test("all product images return successful responses", async ({ page }) => {
    const imageStatusByUrl = new Map<string, number>();

    page.on("response", (response) => {
      if (response.request().resourceType() === "image") {
        imageStatusByUrl.set(response.url(), response.status());
      }
    });

    const inventory = new InventoryPage(page);
    await inventory.goto();
    await page.waitForLoadState("networkidle");

    // Product images should all load successfully.
    const productImageSrcs = await inventory.getItemImageSrcs();
    expect(productImageSrcs).toHaveLength(6);
    for (const src of productImageSrcs) {
      expect(
        imageStatusByUrl.has(src),
        `No image response captured for product image: ${src}`,
      ).toBe(true);
      expect(
        imageStatusByUrl.get(src),
        `Product image failed to load: ${src}`,
      ).toBe(200);
    }
  });

  test("site functions without third-party requests", async ({ page }) => {
    const blockedHosts = new Set<string>();

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      // Only filter http(s) requests and block non-first-party hosts.
      if (url.startsWith("http")) {
        const hostname = new URL(url).hostname;
        if (hostname !== "www.saucedemo.com") {
          blockedHosts.add(hostname);
          return route.abort("blockedbyclient");
        }
      }
      await route.continue();
    });

    const inventory = new InventoryPage(page);
    await inventory.goto();

    // Core functionality works with only first-party resources.
    const items = await inventory.getItemNames();
    expect(items).toHaveLength(6);
    await inventory.addItemToCart(items[0]);
    await inventory.expectCartBadge("1");

    // Probe a third-party request to verify the block rule was exercised.
    await page.evaluate(async () => {
      try {
        await fetch("https://example.com/codex-network-probe", {
          method: "GET",
          mode: "no-cors",
        });
      } catch {
        // Swallow because this request is intentionally blocked by routing.
      }
    });

    expect(
      blockedHosts.has("example.com"),
      "Expected example.com to be blocked by network route",
    ).toBe(true);
  });
});
