import { test } from '@/fixtures';
import { expect } from '@playwright/test';
import { InventoryPage } from '@/pages';
import { expectNoViolations } from '@/utils/a11y';

test.describe('Inventory Page Accessibility @a11y', () => {
  // WCAG Compliance Tests
  test.describe('WCAG Compliance', () => {
    test('full page should have no accessibility violations', async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      await expectNoViolations(page, {
        knownViolations: [{ id: 'select-name', selector: 'select' }],
      });
    });
  });

  // Focus Management Tests
  test.describe('Focus Management', () => {
    test('focused elements should have visible focus indicators', async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      // Focus on an add to cart button
      const addToCartButton = inventoryPage.addToCartButtons.first();
      await addToCartButton.focus();

      // Check that the button is actually focused
      const isFocused = await addToCartButton.evaluate(
        (el) => document.activeElement === el,
      );
      expect(isFocused).toBe(true);

      // Check for visible focus styles (outline or other visual indicator)
      const outlineStyle = await addToCartButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      });

      // Element should have some form of focus indicator
      const hasFocusIndicator =
        outlineStyle.outline !== 'none' ||
        outlineStyle.outlineWidth !== '0px' ||
        outlineStyle.boxShadow !== 'none';

      expect(hasFocusIndicator).toBe(true);
    });
  });

  // Image Accessibility Tests
  test.describe('Image Accessibility', () => {
    test('product images should have alt text', async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      const productImages = inventoryPage.productImages;

      // Wait for images to be rendered before counting
      await expect(productImages.first()).toBeVisible();

      const imageCount = await productImages.count();

      expect(imageCount).toBeGreaterThan(0);

      for (let i = 0; i < imageCount; i++) {
        const image = productImages.nth(i);
        const altText = await image.getAttribute('alt');

        // Alt text should exist and not be empty
        expect(altText).toBeTruthy();
        expect(altText?.trim().length).toBeGreaterThan(0);
      }
    });
  });
});
