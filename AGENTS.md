# AGENTS.md

This file provides guidance to AI coding agents working in this directory.

## Commands

```bash
# Run core cross-browser tests (no visual regression)
bun run test

# Run visual regression tests
bun run test:visual

# Update visual baselines (Linux only)
bun run test:visual:update

# Update visual baselines using Linux container
bun run test:visual:update:linux

# Run tests in headed mode (visible browser)
bun run test:headed

# Run tests with Playwright UI
bun run test:ui

# Run tests in debug mode
bun run test:debug

# Run accessibility tests only
bun run test:a11y

# Run a single test file
bunx playwright test tests/login.spec.ts

# Run a single test by name
bunx playwright test -g "should be able to login"

# View test report
bun run report

# Run linter
bun lint
```

## Architecture

### Path Aliases
The project uses `@/*` path alias mapping to `./src/*` (configured in tsconfig.json). Use this for all imports from the src directory.

### Fixtures
Custom Playwright fixtures are in `src/fixtures/`. The main fixture extends the base test with authentication handling:
- `authUser` option: Specifies which user to authenticate as (defaults to `standard_user`)
- `storageState`: Automatically handles login and caches auth state per user

Tests that need authentication should import `test` from `@/fixtures` instead of `@playwright/test`:
```typescript
import { test } from '@/fixtures';
import { expect } from '@playwright/test';
```

To test with a different user:
```typescript
test.use({ authUser: USER_CREDENTIALS.problem_user });
```

### Page Objects
Page objects are in `src/pages/` and exported from `src/pages/index.ts`. Each page object encapsulates locators and actions for a specific page.

### Accessibility Testing
The project uses axe-core via `@axe-core/playwright` for WCAG 2.1 AA compliance testing. Utilities in `src/utils/a11y.ts`:
- `expectNoViolations(page, options)`: Assert no a11y violations, with optional baseline for known issues
- `runAccessibilityScan(page, options)`: Run scan and return raw results

Tag accessibility tests with Playwright's tag annotation: `{ tag: '@a11y' }` on the describe block.

### User Credentials
Available test users are defined in `src/test-data/users.ts`. The `USER_CREDENTIALS` object contains all valid logins for the Swag Labs demo site.

### Global Setup
`global-setup.ts` clears stale auth state before test runs by removing the `.auth` directory.

## Git

Do not include Co-Authored-By in commit messages.
