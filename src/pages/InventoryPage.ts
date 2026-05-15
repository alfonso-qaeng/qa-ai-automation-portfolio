import { Page, expect } from '@playwright/test';

export class InventoryPage {
  readonly url = '/inventory.html';

  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(this.url);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory/);
    await expect(this.page.locator('.inventory_list')).toBeVisible();
  }

  async getProductCount() {
    return this.page.locator('.inventory_item').count();
  }

  async addToCartByName(name: string) {
    const item = this.page.locator('.inventory_item').filter({ hasText: name });
    await item.getByRole('button', { name: /add to cart/i }).click();
  }

  async getCartCount() {
    const badge = this.page.locator('.shopping_cart_badge');
    const text = await badge.textContent();
    return text ? parseInt(text, 10) : 0;
  }
}
