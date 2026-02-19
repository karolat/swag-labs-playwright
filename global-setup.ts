import type { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  const authDir = path.resolve(config.rootDir, 'test-results', '.auth');
  // if it already exists
  if (fs.existsSync(authDir)) {
    // remove the .auth dir so we don't reuse stale auth
    await fs.promises.rm(authDir, { recursive: true });
  }
}

export default globalSetup;
