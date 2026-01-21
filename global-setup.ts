import { test, chromium, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup_(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(baseURL!);
  await page.getByLabel('User Name').fill('user');
  await page.getByLabel('Password').fill('password');
  await page.getByText('Sign in').click();
  await page.context().storageState({ path: storageState as string });
  await browser.close();
}

async function globalSetup(config: FullConfig) {
  const authDir = path.resolve(config.rootDir, 'test-results', '.auth');
  // if it already exists
  if (fs.existsSync(authDir)) {
    // remove the .auth dir so we don't reuse stale auth
    await fs.promises.rm(authDir, { recursive: true });
  }
}

export default globalSetup;
