import { test, expect } from "@playwright/test";

test.describe("Smoke Test", () => {
  test("should be able to view the login page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Swag Labs");
  });
});
