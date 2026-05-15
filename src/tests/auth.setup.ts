import { test as setup, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_FILE = path.join(__dirname, '../../.auth/user.json');

setup('authenticate as standard_user', async ({ page }) => {
  const username = process.env.SAUCE_USERNAME ?? 'standard_user';
  const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

  await page.goto('/');
  await page.locator('#user-name').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#login-button').click();

  await expect(page).toHaveURL(/inventory/);

  await page.context().storageState({ path: AUTH_FILE });
});
