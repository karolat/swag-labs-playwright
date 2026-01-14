import { expect, test } from "@playwright/test";
import { USER_CREDENTIALS } from "@/utils/constants"
import { LoginPage } from "@/pages/login"


test.describe('Login', () => {
  test('should be able to login with valid credentials', async ({ page }) => {
    const loginPage  = new LoginPage(page);
    await loginPage.goto();

    expect(await loginPage.checkErrorVisibility()).toBe(false);

    await loginPage.login(USER_CREDENTIALS.standard_user)

  });

  test('should not be able to login with invalid credentials', async ({ page }) => {
    const loginPage  = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(USER_CREDENTIALS.invalid_user);

    expect(await loginPage.checkErrorVisibility()).toBe(true);
  });
});

