import { test, expect, type Browser, type Page } from '@playwright/test';
import { LoginPage, type LoginCredentials } from '@/pages/login';
import { USER_CREDENTIALS } from '@/test-data/users';

const LOGIN_SLA_MS = Number(process.env.LOGIN_GLITCH_SLA_MS ?? 8000);
const GLITCH_RATIO_MAX = Number(process.env.LOGIN_GLITCH_RATIO_MAX ?? 4);

async function timedLogin(
  page: Page,
  credentials: LoginCredentials,
  timeoutMs = 15000,
): Promise<number> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const startedAt = Date.now();
  await loginPage.login(credentials);
  await page.waitForURL('**/inventory.html', { timeout: timeoutMs });

  return Date.now() - startedAt;
}

async function timedLoginInFreshContext(
  browser: Browser,
  baseURL: string | undefined,
  credentials: LoginCredentials,
): Promise<number> {
  if (!baseURL) {
    throw new Error('baseURL is required for performance tests');
  }

  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const elapsedMs = await timedLogin(page, credentials);
  await context.close();
  return elapsedMs;
}

test.describe('Login performance', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Performance budgets are tuned for chromium',
  );

  test('demo: strict timeout can fail for performance_glitch_user', async ({ page }) => {
    test.fail();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USER_CREDENTIALS.performance_glitch_user);
    await expect(page).toHaveURL(/\/inventory\.html$/, { timeout: 500 });
  });

  test('performance_glitch_user login stays under SLA', async ({ page }) => {
    const elapsedMs = await timedLogin(page, USER_CREDENTIALS.performance_glitch_user);
    expect(elapsedMs).toBeLessThan(LOGIN_SLA_MS);
  });

  test('performance_glitch_user is slower than standard_user but bounded', async ({ browser, baseURL }) => {
    const standardMs = await timedLoginInFreshContext(
      browser,
      baseURL,
      USER_CREDENTIALS.standard_user,
    );
    const glitchMs = await timedLoginInFreshContext(
      browser,
      baseURL,
      USER_CREDENTIALS.performance_glitch_user,
    );

    expect(glitchMs).toBeGreaterThan(standardMs);
    expect(glitchMs / standardMs).toBeLessThan(GLITCH_RATIO_MAX);
  });
});
