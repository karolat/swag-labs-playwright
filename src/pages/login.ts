import { Page, Locator, expect } from '@playwright/test';

export type LoginCredentials = {
  username: string;
  password: string;
};

export class LoginPage {
  readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly errorCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = this.page.locator('[data-test="username"]');
    this.passwordInput = this.page.locator('[data-test="password"]');
    this.loginButton = this.page.locator('[data-test="login-button"]');
    this.errorMessage = this.page.locator('h3[data-test="error"]');
    this.errorCloseButton = this.page.locator('[data-test="error-button"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(credentials: LoginCredentials) {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }

  async expectError(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toHaveText(message);
    }
  }

  async expectNoError() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectLoaded() {
    await expect(this.loginButton).toBeVisible();
  }

  async dismissError() {
    await this.errorCloseButton.click();
    await expect(this.errorMessage).not.toBeVisible();
  }
}
