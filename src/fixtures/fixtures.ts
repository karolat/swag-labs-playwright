import { test as baseTest } from "@playwright/test";
import { USER_CREDENTIALS, type UserCredentials } from "@/test-data/users";
import { LoginPage } from "@/pages";
import fs from "fs";
import path from "path";

export type LoginOptions = {
  authUser: UserCredentials;
};

export const test = baseTest.extend<LoginOptions>({
  authUser: [USER_CREDENTIALS.standard_user, { option: true }],

  storageState: async ({ browser, authUser, baseURL }, use) => {
    const fileName = path.resolve(
      test.info().project.outputDir,
      `.auth/${authUser.username}.json`,
    );

    if (!fs.existsSync(fileName)) {
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(authUser);
      await page.waitForURL("/inventory.html");

      await fs.promises.mkdir(path.dirname(fileName), { recursive: true });
      await context.storageState({ path: fileName });
      await context.close();
    }

    await use(fileName);
  },
});
