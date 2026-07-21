import { devices } from '@playwright/test';

const config = {
  testDir: './tests',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'html',

  use: {
    baseURL: 'https://eventhub.rahulshettyacademy.com',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',   // video recording stalls Chromium rendering inside Docker/WSL2
  },

  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'safari',
      timeout: 60 * 1000, // Safari needs more time than Chrome (only relevant if the global timeout is lowered)
      use: {
        browserName: 'webkit',
        headless: true,
      },
    },
  ],
};

export default config;
