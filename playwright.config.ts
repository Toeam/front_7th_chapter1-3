import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: false, // e2e.json 파일 공유로 인한 경합 문제 방지를 위해 직렬 실행
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Sequential execution to avoid file race conditions */
  workers: 1, // 파일 기반 DB를 사용하므로 직렬 실행 필요
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'pnpm run server',
      port: 3000,
      //      reuseExistingServer: !process.env.CI, => 포트 충동 방지 위해 명시적으로 false 설정
      reuseExistingServer: false,
      env: {
        TEST_ENV: 'e2e',
      },
    },
    {
      command: 'pnpm run start',
      port: 5173,
      //      reuseExistingServer: !process.env.CI, => 포트 충동 방지 위해 명시적으로 false 설정
      reuseExistingServer: false,
    },
  ],
});
