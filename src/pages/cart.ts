import { expect, Page, Locator } from '@playwright/test';
import { CheckoutInfoPage } from './checkout';

export class CartPage {
  readonly page: Page;
  private readonly title: Locator;
  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
  }

  getItemByName(itemName: string): Locator {
    return this.cartItems.filter({
      has: this.page.locator('[data-test="inventory-item-name"]', { hasText: itemName }),
    });
  }

  async removeItem(itemName: string): Promise<void> {
    await this.getItemByName(itemName).getByRole('button', { name: 'Remove' }).click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/cart\.html$/);
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.checkoutButton).toBeVisible();
  }

  async proceedToCheckout(): Promise<CheckoutInfoPage> {
    await this.checkoutButton.click();
    const checkoutInfoPage = new CheckoutInfoPage(this.page);
    await checkoutInfoPage.expectLoaded();
    return checkoutInfoPage;
  }

  async expectEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }
}
