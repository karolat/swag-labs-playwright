import { Page, Locator } from '@playwright/test';
import { CheckoutInfoPage } from './checkout';

export class CartPage {
  readonly page: Page;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async proceedToCheckout(): Promise<CheckoutInfoPage> {
    await this.checkoutButton.click();
    return new CheckoutInfoPage(this.page);
  }
}
