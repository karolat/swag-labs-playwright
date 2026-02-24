#!/usr/bin/env node

const { execSync } = require('child_process');

if (process.platform !== 'linux') {
  console.error(
    'Visual baseline updates are Linux-only. Run `npm run test:visual:update:linux` to regenerate snapshots.'
  );
  process.exit(1);
}

try {
  execSync('playwright test --project=visual-chromium --update-snapshots', {
    stdio: 'inherit',
  });
} catch {
  process.exit(1);
}
