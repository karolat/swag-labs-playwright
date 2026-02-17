import { Locator } from '@playwright/test';
import { expect } from '@playwright/test';

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
