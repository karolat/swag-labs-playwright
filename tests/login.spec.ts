import { test } from "@playwright/test";
import { USER_CREDENTIALS } from "@/utils/constants"
import { LoginPage } from "@/pages"

const EXPECTED_LOGIN_SUCCESS: Record<keyof typeof USER_CREDENTIALS, boolean> = {
  standard_user: true,
  locked_out_user: false,
  problem_user: true,
  performance_glitch_user: true,
  invalid_user: false,
  error_user: true,
  visual_user: true,
};

test.describe('Login', () => {
  for (const [userType, credentials] of Object.entries(USER_CREDENTIALS)) {
    const shouldSucceed = EXPECTED_LOGIN_SUCCESS[userType as keyof typeof USER_CREDENTIALS];

    test(`should ${shouldSucceed ? '' : 'not'} be able to login with ${userType}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(credentials);

      if (shouldSucceed) {
        await loginPage.expectNoError();
      } else {
        await loginPage.expectError();
      }
    });
  }
});

