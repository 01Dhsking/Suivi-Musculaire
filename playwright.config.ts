import { defineConfig } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
// Read only the application password; do not print local secrets in reports.
const localEnv = existsSync('.env') ? readFileSync('.env','utf8') : '';
const password = process.env.APP_PASSWORD ?? localEnv.match(/^APP_PASSWORD=(.+)$/m)?.[1]?.trim();
export default defineConfig({
  testDir: './tests/e2e', workers: 1, fullyParallel: false,
  reporter: 'list', timeout: 30000,
  use: { baseURL: process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000', httpCredentials: password ? { username: 'admin', password } : undefined, screenshot: 'only-on-failure' },
});
