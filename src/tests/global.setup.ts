import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { LoginPage } from '@pages/LoginPage';
import { SAUCE_USERS } from '@data/users';

dotenv.config();

const AUTH_FILE = path.join(__dirname, '../../.auth/user.json');

setup('authenticate once and save session state', async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(SAUCE_USERS.standard.username, SAUCE_USERS.standard.password);
  await loginPage.expectRedirectToInventory();

  await page.context().storageState({ path: AUTH_FILE });
});
