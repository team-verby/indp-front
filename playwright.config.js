import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
  use: {
    baseURL: 'https://dev.indpmusic.co.kr',
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'admin',    testMatch: '**/admin.spec.js' },
    { name: 'dj',      testMatch: '**/dj.spec.js' },
    { name: 'playlist', testMatch: '**/playlist.spec.js' },
    { name: 'user',    testMatch: '**/user.spec.js' },
    { name: 'plan-a',  testMatch: '**/plan-a.spec.js' },
  ],
});
