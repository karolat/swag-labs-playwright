import { Page, Locator, expect } from '@playwright/test';

export type LoginCredentials = {
  username: string;
  password: string;
};

export class LoginPage {
  page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = this.page.locator('[data-test="username"]');
    this.passwordInput = this.page.locator('[data-test="password"]');
    this.loginButton = this.page.locator('[data-test="login-button"]');
    this.errorMessage = this.page.locator('h3[data-test="error"]')
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(credentials: LoginCredentials) {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }

  async checkError(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async checkErrorVisibility() {
    return await this.errorMessage.isVisible();
  }
}
