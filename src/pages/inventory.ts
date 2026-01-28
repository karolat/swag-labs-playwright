import { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class MainHeader {
  root: Locator;
  menuWrap: Locator;

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
    await this.root.getByRole('button', { name: 'Open Menu' }).click();
    await expect(this.menuWrap).toHaveAttribute('aria-hidden', 'true');
  }
}

export class InventoryPage {
  page: Page;
  mainHeader: MainHeader;
  inventory: Locator;
  footer: Locator;
  menu: Locator;

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
}
