import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const AUTH_STATE = path.join(__dirname, '.auth/user.json');

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  reporter: [
    ['list'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: true,
    }],
    ['html', { outputFolder: 'test-results/html', open: 'never' }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Auth setup — runs before e2e tests
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // E2E — Chromium with reused auth state
    {
      name: 'e2e',
      testMatch: '**/e2e/**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE,
      },
    },

    // E2E — Firefox (no auth reuse to validate full login flow)
    {
      name: 'e2e:firefox',
      testMatch: '**/e2e/**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: AUTH_STATE,
      },
    },

    // API tests — no browser needed
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://reqres.in',
      },
    },

    // AI agent tests
    {
      name: 'ai-agents',
      testMatch: '**/agents/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
