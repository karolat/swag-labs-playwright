# Swag Labs Playwright Automation

Playwright test automation framework for the Swag Labs demo site. This repo is designed to be easy to run with **npm** (default) while still supporting **Bun**.

**Quickstart (npm)**
1. `npm install`
2. `npm run pw:install`
3. `npm test`

**Quickstart (Bun, optional)**
1. `bun install`
2. `bun run pw:install`
3. `bun run test`

**Scripts**
- `npm test` / `bun run test`
- `npm run test:headed`
- `npm run test:ui`
- `npm run test:debug`
- `npm run test:a11y`
- `npm run pw:install`
- `npm run report`
- `npm run typecheck`
- `npm run lint`
- `npm run lint:fix`

**Project Notes**
- Uses Playwright + TypeScript with page objects and custom fixtures.
- Auth state is cached per user; see `src/fixtures` and `src/test-data/users.ts`.
- Accessibility checks use axe-core and are tagged with `@a11y`.

If you plan to review quickly, the npm path above is the lowest-friction option.
