import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.page.locator('#user-name').fill(username);
    await this.page.locator('#password').fill(password);
    await this.page.locator('#login-button').click();
  }

  async expectError(message: string) {
    await expect(this.page.locator('[data-test="error"]')).toContainText(message);
  }
}
