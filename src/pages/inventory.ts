import { Locator, Page } from '@playwright/test';



export class InventoryPage {
  page: Page;
  header: Locator;
  inventory: Locator;
  footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('#header_container');
    this.inventory = page.locator('#inventory_container');
    this.footer = page.locator('#footer_container');
  }

  async goto() {
    await this.page.goto("/inventory.html")
  }
}
