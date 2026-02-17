import { test, expect } from '@playwright/test';
import { test as authenticatedTest } from '@/fixtures';
import { USER_CREDENTIALS } from '@/test-data/users';
import { LoginPage, InventoryPage } from '@/pages';

const EXPECTED_LOGIN_RESULTS: Record<
  keyof typeof USER_CREDENTIALS,
  { success: boolean; error?: string }
> = {
  standard_user: { success: true },
  locked_out_user: {
    success: false,
    error: 'Epic sadface: Sorry, this user has been locked out.',
  },
  problem_user: { success: true },
  performance_glitch_user: { success: true },
  invalid_user: {
    success: false,
    error:
      'Epic sadface: Username and password do not match any user in this service',
  },
  error_user: { success: true },
  visual_user: { success: true },
};

test.describe('Login', () => {
  for (const [userType, credentials] of Object.entries(USER_CREDENTIALS)) {
    const expected =
      EXPECTED_LOGIN_RESULTS[userType as keyof typeof USER_CREDENTIALS];

    test(`should ${expected.success ? '' : 'not '}be able to login with ${userType}`, async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(credentials);

      if (expected.success) {
        await loginPage.expectNoError();
        await expect(page).toHaveURL(/\/inventory\.html$/);
      } else {
        await loginPage.expectError(expected.error);
      }
    });
  }
});

test.describe('Login field validation', () => {
  test('should show error when username and password are empty', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login({ username: '', password: '' });

    await loginPage.expectError('Epic sadface: Username is required');
  });

  test('should show error when password is empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login({ username: 'standard_user', password: '' });

    await loginPage.expectError('Epic sadface: Password is required');
  });

  test('should show error when username is empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login({ username: '', password: 'secret_sauce' });

    await loginPage.expectError('Epic sadface: Username is required');
  });
});

test.describe('Login error dismissal', () => {
  test('should be able to dismiss the error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login({ username: '', password: '' });

    await loginPage.expectError();
    await loginPage.dismissError();
  });
});

authenticatedTest.describe('Logout', () => {
  authenticatedTest(
    'should be able to logout and return to the login page',
    async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();

      await inventoryPage.clickMenuItem('Logout');

      const loginPage = new LoginPage(page);
      await loginPage.expectLoaded();
    }
  );
});
