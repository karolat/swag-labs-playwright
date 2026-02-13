import { Page } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async addToCart(): Promise<void> {
    await this.page.locator('[data-test="add-to-cart"]').click();
  }
}
