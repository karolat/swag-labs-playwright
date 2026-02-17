import { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { CartPage } from './cart';
import { MainHeader } from './main-header';
import { ProductDetailsPage } from './product-details';

export class InventoryPage {
  readonly page: Page;
  readonly mainHeader: MainHeader;
  readonly inventory: Locator;
  readonly footer: Locator;
  private readonly cartLink: Locator;
  private readonly menu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainHeader = new MainHeader(page.locator('.primary_header'));
    this.inventory = page.locator('[data-test="inventory-container"]');
    this.footer = page.locator('#footer_container');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.menu = page.locator('.bm-menu');
  }

  async goto() {
    await this.page.goto('/inventory.html');
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
    await expect(this.inventory).toBeVisible();
  }

  get addToCartButtons(): Locator {
    return this.inventory.locator('button[data-test^="add-to-cart"]');
  }

  get productImages(): Locator {
    return this.inventory.locator('.inventory_item img');
  }

  get menuItems(): Locator {
    return this.menu.locator('a');
  }

  getMenuItem(name: string): Locator {
    return this.menuItems.filter({ hasText: name });
  }

  async clickMenuItem(name: string) {
    await this.mainHeader.openMenu();
    await this.getMenuItem(name).click();
  }

  async openItemByName(itemName: string): Promise<ProductDetailsPage> {
    const productTitle = this.inventory
      .locator('[data-test="inventory-item-name"]')
      .filter({ hasText: itemName });
    await expect(productTitle).toHaveCount(1);
    await expect(productTitle).toHaveText(itemName);
    await productTitle.click();
    const productDetailsPage = new ProductDetailsPage(this.page);
    await productDetailsPage.expectLoaded(itemName);
    return productDetailsPage;
  }

  async openCart(): Promise<CartPage> {
    await this.cartLink.click();
    const cartPage = new CartPage(this.page);
    await cartPage.expectLoaded();
    return cartPage;
  }
}
