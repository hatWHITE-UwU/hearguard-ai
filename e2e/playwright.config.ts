import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the Angular dev server or a preview URL.
 * Set BASE_URL env var to target Vercel: BASE_URL=https://frontend-tau-tan-95.vercel.app
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '../reports/e2e-html', open: 'never' }],
    ['junit', { outputFile: '../reports/e2e-junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  // Start the Angular dev server automatically (local only — skipped if BASE_URL is set)
  ...(process.env['BASE_URL']
    ? {}
    : {
        webServer: {
          command: 'npm run start',
          cwd: '../frontend',
          url: 'http://localhost:4200',
          reuseExistingServer: !process.env['CI'],
          timeout: 120_000,
        },
      }),
});
