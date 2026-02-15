import { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { CartPage } from './cart';
import { ProductDetailsPage } from './product-details';

export class MainHeader {
  private readonly root: Locator;
  private readonly menuWrap: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.menuWrap = root.locator('.bm-menu-wrap');
  }

  get logo() {
    return this.root.locator('.app_logo');
  }

  async isMenuOpen(): Promise<boolean> {
    const ariaHidden = await this.menuWrap.getAttribute('aria-hidden');
    return ariaHidden === 'false';
  }

  async openMenu() {
    if (await this.isMenuOpen()) {
      return; // already open, no need to do anything
    }
    await this.root.getByRole('button', { name: 'Open Menu' }).click();
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'false');
  }

  async closeMenu() {
    if (!(await this.isMenuOpen())) {
      return; // already closed, no need to do anything
    }
    await this.root.getByRole('button', { name: 'Close Menu' }).click();
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'true');
  }
}

export class InventoryPage {
  readonly page: Page;
  readonly mainHeader: MainHeader;
  readonly inventory: Locator;
  readonly footer: Locator;
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;
  private readonly menu: Locator;
  private readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainHeader = new MainHeader(page.locator('.primary_header'));
    this.inventory = page.locator('[data-test="inventory-container"]');
    this.footer = page.locator('#footer_container');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menu = page.locator('.bm-menu');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async goto() {
    await this.page.goto('/inventory.html');
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
    await expect(this.inventory).toBeVisible();
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

  async addItemToCart(itemName: string): Promise<void> {
    const item = this.inventory
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: itemName });
    await item.locator('button', { hasText: 'Add to cart' }).click();
  }

  async removeItem(itemName: string): Promise<void> {
    const item = this.inventory
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: itemName });
    await item.locator('button', { hasText: 'Remove' }).click();
  }

  async expectCartBadge(count: string): Promise<void> {
    await expect(this.cartBadge).toHaveText(count);
  }

  async expectNoCartBadge(): Promise<void> {
    await expect(this.cartBadge).not.toBeVisible();
  }

  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.selectOption({ label: option });
  }

  async getItemNames(): Promise<string[]> {
    return this.inventory
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  async getItemPrices(): Promise<number[]> {
    const priceTexts = await this.inventory
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    return priceTexts.map((text) => parseFloat(text.replace('$', '')));
  }

  async getItemImageSrcs(): Promise<string[]> {
    return this.inventory
      .locator('img.inventory_item_img')
      .evaluateAll((imgs) =>
        (imgs as HTMLImageElement[]).map((img) => img.src)
      );
  }
}
