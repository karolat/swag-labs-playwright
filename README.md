# Swag Labs Playwright

Playwright test automation framework for the [Swag Labs](https://www.saucedemo.com) demo site.

## Getting Started

```bash
# Install dependencies
bun install

# Install Playwright browsers
bunx playwright install
```

## Running Tests

```bash
# Run all tests
bun test

# Run tests in headed mode
bun run test:headed

# Run with Playwright UI
bun run test:ui

# Run in debug mode
bun run test:debug

# Run accessibility tests
bun run test:a11y

# Run visual regression tests
bun run test:visual

# Update visual regression baselines
bun run test:visual:update

# Run a single test file
bunx playwright test tests/login.spec.ts

# View test report
bun run report
```

## Visual Regression Testing

This project uses Playwright's [built-in screenshot comparison](https://playwright.dev/docs/test-snapshots) for visual regression testing rather than cloud-based services like Chromatic or Percy.

**Why Playwright screenshots over Chromatic/Percy?**

- **No external dependencies** -- visual tests run locally and in CI using the same Playwright infrastructure as the rest of the suite; no additional service accounts, API keys, or billing to manage.
- **Fast feedback loop** -- screenshot comparisons happen inline during the test run, so failures surface immediately rather than requiring a separate approval workflow in an external dashboard.
- **Sufficient for this scope** -- cloud-based visual testing shines when you need cross-browser rendering across dozens of browser/OS combinations, component-level story coverage, or team-wide approval workflows. This project targets a single demo site with a small page surface, so Playwright's pixel diffing with a single pinned browser is a better fit.
- **Deterministic baselines** -- the `visual` project in `playwright.config.ts` is pinned to Desktop Chrome to avoid cross-browser pixel differences that would generate false positives.

### Updating Baselines

When a visual change is intentional, regenerate the baseline screenshots:

```bash
bun run test:visual:update
```

Review the updated screenshots in `tests/visual.spec.ts-snapshots/`, then commit them.
