# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: global.setup.ts >> authenticate once and save session state
- Location: src/tests/global.setup.ts:12:6

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1  | import { Page, Locator, expect } from '@playwright/test';
  2  | 
  3  | export class LoginPage {
  4  |   readonly usernameInput: Locator;
  5  |   readonly passwordInput: Locator;
  6  |   readonly loginButton: Locator;
  7  |   readonly errorMessage: Locator;
  8  | 
  9  |   constructor(private readonly page: Page) {
  10 |     this.usernameInput = page.locator('[data-test="username"]');
  11 |     this.passwordInput = page.locator('[data-test="password"]');
  12 |     this.loginButton   = page.locator('[data-test="login-button"]');
  13 |     this.errorMessage  = page.locator('[data-test="error"]');
  14 |   }
  15 | 
  16 |   async goto() {
> 17 |     await this.page.goto('/');
     |                     ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  18 |     await expect(this.loginButton).toBeVisible();
  19 |   }
  20 | 
  21 |   async login(username: string, password: string) {
  22 |     await this.usernameInput.fill(username);
  23 |     await this.passwordInput.fill(password);
  24 |     await this.loginButton.click();
  25 |   }
  26 | 
  27 |   async expectLoginError(message: string) {
  28 |     await expect(this.errorMessage).toBeVisible();
  29 |     await expect(this.errorMessage).toContainText(message);
  30 |   }
  31 | 
  32 |   async expectRedirectToInventory() {
  33 |     await expect(this.page).toHaveURL(/inventory\.html/);
  34 |     await expect(this.page.locator('[data-test="inventory-container"]')).toBeVisible();
  35 |   }
  36 | }
  37 | 
```