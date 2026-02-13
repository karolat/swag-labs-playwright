import { expect, Locator, Page } from '@playwright/test';
import { CartPage } from './cart';

export class ProductDetailsPage {
  readonly page: Page;
  private readonly itemName: Locator;
  private readonly addToCartButton: Locator;
  private readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.itemName = page.locator('[data-test="inventory-item-name"]');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  async expectLoaded(expectedItemName?: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory-item\.html/);
    await expect(this.addToCartButton).toBeVisible();
    if (expectedItemName) {
      await expect(this.itemName).toHaveText(expectedItemName);
    }
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async openCart(): Promise<CartPage> {
    await this.cartLink.click();
    const cartPage = new CartPage(this.page);
    await cartPage.expectLoaded();
    return cartPage;
  }
}
