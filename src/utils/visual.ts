import { expect, type Locator, type Page } from '@playwright/test';

type StableScreenshotOptions = {
  mask?: Locator[];
  timeout?: number;
};

async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if (document.fonts) {
      await document.fonts.ready;
    }
  });
}

async function waitForImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const imageElements = Array.from(document.images);
    await Promise.all(
      imageElements.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          })
      )
    );
  });
}

async function waitForPaint(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
}

export async function expectStableScreenshot(
  locator: Locator,
  name: string,
  options: StableScreenshotOptions = {}
): Promise<void> {
  const page = locator.page();

  await expect(locator).toBeVisible({ timeout: options.timeout });
  await waitForFonts(page);
  await waitForImages(page);
  await waitForPaint(page);

  await expect(locator).toHaveScreenshot(name, {
    mask: options.mask,
    timeout: options.timeout,
  });
}
