import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.title                   = page.locator('[data-test="title"]');
    this.cartItems               = page.locator('.cart_item');
    this.checkoutButton          = page.locator('[data-test="checkout"]');
    this.continueShoppingButton  = page.locator('[data-test="continue-shopping"]');
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.title).toHaveText('Your Cart');
  }

  async expectItemInCart(name: string) {
    const item = this.cartItems.filter({ hasText: name });
    await expect(item).toBeVisible();
  }

  async expectItemNotInCart(name: string) {
    const item = this.cartItems.filter({ hasText: name });
    await expect(item).not.toBeVisible();
  }

  async removeItem(name: string) {
    const item = this.cartItems.filter({ hasText: name });
    await expect(item).toBeVisible();
    await item.getByRole('button', { name: /remove/i }).click();
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }
}
