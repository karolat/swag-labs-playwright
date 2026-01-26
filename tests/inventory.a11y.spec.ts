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

  // Keyboard Navigation Tests
  test.describe('Keyboard Navigation', () => {
    test('should be able to Tab through interactive elements', async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      // Focus on the body first
      await page.locator('body').focus();

      // Tab through and collect focused elements
      const focusedElements: string[] = [];

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const tagName = await page.evaluate(
          () => document.activeElement?.tagName
        );
        if (tagName) {
          focusedElements.push(tagName);
        }
      }

      // Verify we can tab through multiple elements
      expect(focusedElements.length).toBeGreaterThan(0);
      // Verify we reach interactive elements (buttons, links)
      const interactiveElements = focusedElements.filter(
        (tag) => tag === 'BUTTON' || tag === 'A' || tag === 'SELECT'
      );
      expect(interactiveElements.length).toBeGreaterThan(0);
    });

    test('should be able to Shift+Tab backwards through elements', async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      // Tab forward several times
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }

      // Get current focused element
      const firstElement = await page.evaluate(
        () => document.activeElement?.outerHTML
      );

      // Tab backward
      await page.keyboard.press('Shift+Tab');

      // Get new focused element - should be different
      const secondElement = await page.evaluate(
        () => document.activeElement?.outerHTML
      );

      expect(firstElement).not.toBe(secondElement);
    });

    test('should activate Add to Cart buttons with Enter key', async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      // Find and focus an Add to Cart button
      const addToCartButton = page
        .locator('button[data-test^="add-to-cart"]')
        .first();
      await addToCartButton.focus();

      // Press Enter to activate
      await page.keyboard.press('Enter');

      // Button text should change to "Remove"
      const removeButton = page.locator('button[data-test^="remove"]').first();
      await expect(removeButton).toBeVisible();
    });

    test('should activate Add to Cart buttons with Space key', async ({
      page,
    }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      // Find and focus an Add to Cart button
      const addToCartButton = page
        .locator('button[data-test^="add-to-cart"]')
        .first();
      await addToCartButton.focus();

      // Press Space to activate
      await page.keyboard.press('Space');

      // Button text should change to "Remove"
      const removeButton = page.locator('button[data-test^="remove"]').first();
      await expect(removeButton).toBeVisible();
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
      const addToCartButton = page
        .locator('button[data-test^="add-to-cart"]')
        .first();
      await addToCartButton.focus();

      // Check that the button is actually focused
      const isFocused = await addToCartButton.evaluate(
        (el) => document.activeElement === el
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

      const productImages = page.locator('.inventory_item img');

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

  // Semantic Structure Tests
  test.describe('Semantic Structure', () => {
    test.fixme('page should have proper heading hierarchy', async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      // Get all headings in order
      const headings = await page.evaluate(() => {
        const headingElements = document.querySelectorAll(
          'h1, h2, h3, h4, h5, h6'
        );
        return Array.from(headingElements).map((el) => ({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent?.trim(),
        }));
      });

      // Page should have at least one heading
      expect(headings.length).toBeGreaterThan(0);

      // Headings should not skip levels (e.g., h1 -> h3 without h2)
      for (let i = 1; i < headings.length; i++) {
        const currentLevel = headings[i].level;
        const previousLevel = headings[i - 1].level;

        // Level can go up by at most 1 (e.g., h1 -> h2), or down any amount (e.g., h3 -> h1)
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    });

    test.fixme('page should have main landmark', async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      // Check for main landmark (either <main> element or role="main")
      const mainLandmark = page.locator('main, [role="main"]');
      await expect(mainLandmark).toBeVisible();
    });
  });
});
