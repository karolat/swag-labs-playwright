import { Locator, Page } from '@playwright/test';

export class MainHeader {
  root: Locator;

  constructor(root: Locator) {
    this.root = root;
  }

  get logo() {
    return this.root.locator(".app_logo")
  }
}

export class InventoryPage {
  page: Page;
  mainHeader: MainHeader;
  inventory: Locator;
  footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainHeader = new MainHeader(page.locator('.primary_header'));
    this.inventory = page.locator('#inventory_container');
    this.footer = page.locator('#footer_container');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }
}
