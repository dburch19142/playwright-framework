import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const DEMO_APP_URL = 'http://localhost:3100';
const baseURL = process.env.BASE_URL ?? DEMO_APP_URL;

export const STORAGE_STATE = '.auth/user.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'results/junit.xml' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    // Run `npx playwright install firefox webkit` before enabling these.
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
    //   dependencies: ['setup'],
    // },
  ],
  // Starts the bundled demo app. Skipped once BASE_URL points at your own app.
  webServer:
    baseURL === DEMO_APP_URL
      ? {
          command: 'node demo-app/server.js',
          url: `${DEMO_APP_URL}/login`,
          reuseExistingServer: !process.env.CI,
        }
      : undefined,
});
