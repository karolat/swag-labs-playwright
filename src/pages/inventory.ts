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
  private readonly menu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainHeader = new MainHeader(page.locator('.primary_header'));
    this.inventory = page.locator('#inventory_container');
    this.footer = page.locator('#footer_container');
    this.menu = page.locator('.bm-menu');
  }

  async goto() {
    await this.page.goto('/inventory.html');
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
    return new ProductDetailsPage(this.page);
  }

  async openCart(): Promise<CartPage> {
    await this.page.locator('[data-test="shopping-cart-link"]').click();
    return new CartPage(this.page);
  }
}
