import { expect, Locator, Page } from '@playwright/test';

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

const parseCurrencyFromLabel = (label: string, kind: string): number => {
  const match = label.match(/\$([0-9]+(?:\.[0-9]{2})?)/);
  if (!match) {
    throw new Error(`Unable to parse ${kind} from label: "${label}"`);
  }

  return Number(match[1]);
};

export class CheckoutInfoPage {
  readonly page: Page;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
  }

  async fillCustomerInfo(customer: CheckoutCustomer): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
  }

  async continue(): Promise<CheckoutOverviewPage> {
    await this.continueButton.click();
    return new CheckoutOverviewPage(this.page);
  }
}

export class CheckoutOverviewPage {
  readonly page: Page;
  private readonly subtotalLabel: Locator;
  private readonly totalLabel: Locator;
  private readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
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
    return new CheckoutCompletePage(this.page);
  }
}

export class CheckoutCompletePage {
  readonly page: Page;
  private readonly successHeader: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successHeader = page.locator('[data-test="complete-header"]');
    this.successMessage = page.locator('[data-test="complete-text"]');
  }

  async expectSuccess(): Promise<void> {
    await expect(this.successHeader).toHaveText('Thank you for your order!');
    await expect(this.successMessage).toBeVisible();
  }
}
