import { expect, Locator, Page } from '@playwright/test';
import { parseCurrencyFromLabel } from '@/utils/money';

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export class CheckoutInfoPage {
  readonly page: Page;
  private readonly title: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(this.title).toHaveText('Checkout: Your Information');
    await expect(this.firstNameInput).toBeVisible();
  }

  async fillCustomerInfo(customer: CheckoutCustomer): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
  }

  async getLastNameValue(): Promise<string> {
    return this.lastNameInput.inputValue();
  }

  async continue(): Promise<CheckoutOverviewPage> {
    await this.continueButton.click();
    const checkoutOverviewPage = new CheckoutOverviewPage(this.page);
    await checkoutOverviewPage.expectLoaded();
    return checkoutOverviewPage;
  }
}

export class CheckoutOverviewPage {
  readonly page: Page;
  private readonly title: Locator;
  private readonly subtotalLabel: Locator;
  private readonly totalLabel: Locator;
  private readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(this.title).toHaveText('Checkout: Overview');
    await expect(this.finishButton).toBeVisible();
  }

  async getItemTotal(): Promise<number> {
    const subtotalText = await this.subtotalLabel.textContent();
    if (!subtotalText) {
      throw new Error('Subtotal label is empty');
    }

    return parseCurrencyFromLabel(subtotalText, 'subtotal');
  }

  async getTotalWithTax(): Promise<number> {
    const totalText = await this.totalLabel.textContent();
    if (!totalText) {
      throw new Error('Total label is empty');
    }

    return parseCurrencyFromLabel(totalText, 'total');
  }

  async finish(): Promise<CheckoutCompletePage> {
    await this.finishButton.click();
    const checkoutCompletePage = new CheckoutCompletePage(this.page);
    await checkoutCompletePage.expectLoaded();
    return checkoutCompletePage;
  }
}

export class CheckoutCompletePage {
  readonly page: Page;
  private readonly title: Locator;
  private readonly successHeader: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.successHeader = page.locator('[data-test="complete-header"]');
    this.successMessage = page.locator('[data-test="complete-text"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(this.title).toHaveText('Checkout: Complete!');
    await expect(this.successHeader).toBeVisible();
  }

  async expectSuccess(): Promise<void> {
    await this.expectLoaded();
    await expect(this.successHeader).toHaveText('Thank you for your order!');
    await expect(this.successMessage).toBeVisible();
  }
}
