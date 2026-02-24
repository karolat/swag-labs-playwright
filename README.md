# Swag Labs Playwright Tests

Playwright end-to-end tests for the [Swag Labs demo site](https://www.saucedemo.com).

## Quick start

```bash
npm install
npm run test
```
`npm run test` runs the core cross-browser suite (chromium/firefox/webkit). Visual regression tests run separately via `npm run test:visual`.

## Common commands

```bash
# Run core cross-browser suite
npm run test

# Run visual regression suite only
npm run test:visual

# Update visual snapshots (Linux only; fails on macOS/Windows)
npm run test:visual:update

# Update visual snapshots using Linux container (authoritative baselines).  This requires Docker.
npm run test:visual:update:linux
```

## Visual regression testing

Visual tests live in `tests/visual/*.visual.spec.ts` and run under the Playwright project `visual-chromium`.

### Linux-only screenshots

Screenshot assertions are intentionally Linux-only for deterministic rendering:

- Visual specs call `test.skip(process.platform !== 'linux', ...)`.
- On macOS/Windows, visual tests are discovered but skipped.
- In CI (GitHub Actions, Ubuntu/Linux container), visual tests execute in a dedicated `visual-regression` job and compare against committed baselines.

This keeps a single authoritative baseline platform and avoids cross-OS rendering diffs.

### Baseline update workflow

When UI changes are expected, regenerate and commit snapshots from Linux:

1. Run:
   ```bash
   npm run test:visual:update:linux
   ```
   `npm run test:visual:update` is a Linux-only guard and exits with an error on non-Linux systems.
2. Review changed images in `tests/visual/*.visual.spec.ts-snapshots/`.
3. Verify the updated suite passes:
   ```bash
   npm run test:visual
   ```
4. Commit both the test/code changes and updated snapshot `.png` files together.

Avoid creating baselines from non-Linux environments for long-term snapshots; use the Linux update command above.
