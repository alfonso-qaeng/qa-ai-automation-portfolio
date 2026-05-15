# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/checkout/checkout.spec.ts >> Checkout flow >> completes full purchase from product selection to confirmation
- Location: src/tests/e2e/checkout/checkout.spec.ts:11:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-test="cart-item"]').filter({ hasText: 'Sauce Labs Backpack' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-test="cart-item"]').filter({ hasText: 'Sauce Labs Backpack' })

```

```yaml
- button "Open Menu"
- img "Open Menu"
- text: Swag Labs 1 Your Cart QTY Description 1
- link "Sauce Labs Backpack":
  - /url: "#"
- text: carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection. $29.99
- button "Remove"
- button "Go back Continue Shopping":
  - img "Go back"
  - text: Continue Shopping
- button "Checkout"
- contentinfo:
  - list:
    - listitem:
      - link "Twitter":
        - /url: https://twitter.com/saucelabs
    - listitem:
      - link "Facebook":
        - /url: https://www.facebook.com/saucelabs
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/sauce-labs/
  - text: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
  1  | import { Page, Locator, expect } from '@playwright/test';
  2  | 
  3  | export class CartPage {
  4  |   readonly title: Locator;
  5  |   readonly cartItems: Locator;
  6  |   readonly checkoutButton: Locator;
  7  |   readonly continueShoppingButton: Locator;
  8  | 
  9  |   constructor(private readonly page: Page) {
  10 |     this.title                   = page.locator('[data-test="title"]');
  11 |     this.cartItems               = page.locator('[data-test="cart-item"]');
  12 |     this.checkoutButton          = page.locator('[data-test="checkout"]');
  13 |     this.continueShoppingButton  = page.locator('[data-test="continue-shopping"]');
  14 |   }
  15 | 
  16 |   async expectPageLoaded() {
  17 |     await expect(this.page).toHaveURL(/cart\.html/);
  18 |     await expect(this.title).toHaveText('Your Cart');
  19 |   }
  20 | 
  21 |   async expectItemInCart(name: string) {
  22 |     const item = this.cartItems.filter({ hasText: name });
> 23 |     await expect(item).toBeVisible();
     |                        ^ Error: expect(locator).toBeVisible() failed
  24 |   }
  25 | 
  26 |   async expectItemNotInCart(name: string) {
  27 |     const item = this.cartItems.filter({ hasText: name });
  28 |     await expect(item).not.toBeVisible();
  29 |   }
  30 | 
  31 |   async removeItem(name: string) {
  32 |     const item = this.cartItems.filter({ hasText: name });
  33 |     await expect(item).toBeVisible();
  34 |     await item.getByRole('button', { name: /remove/i }).click();
  35 |   }
  36 | 
  37 |   async getItemCount(): Promise<number> {
  38 |     return this.cartItems.count();
  39 |   }
  40 | 
  41 |   async proceedToCheckout() {
  42 |     await this.checkoutButton.click();
  43 |     await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  44 |   }
  45 | 
  46 |   async continueShopping() {
  47 |     await this.continueShoppingButton.click();
  48 |     await expect(this.page).toHaveURL(/inventory\.html/);
  49 |   }
  50 | }
  51 | 
```