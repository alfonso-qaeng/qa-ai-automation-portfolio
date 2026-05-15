import { Page, Locator, expect } from '@playwright/test';

export type SortOption =
  | 'az'   // Name (A to Z)
  | 'za'   // Name (Z to A)
  | 'lohi' // Price (low to high)
  | 'hilo'; // Price (high to low)

export class ProductsPage {
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title         = page.locator('[data-test="title"]');
    this.inventoryList = page.locator('[data-test="inventory-container"]');
    this.cartBadge     = page.locator('[data-test="shopping-cart-badge"]');
    this.sortDropdown  = page.locator('[data-test="product-sort-container"]');
    this.cartLink      = page.locator('[data-test="shopping-cart-link"]');
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
    await expect(this.inventoryList).toBeVisible();
  }

  async addProductToCart(name: string) {
    const item = this.page
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: name });

    await expect(item).toBeVisible();

    // data-test on add button follows pattern: add-to-cart-{slug}
    await item.getByRole('button', { name: /add to cart/i }).click();
  }

  async getCartCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  async goToCart() {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async sortBy(option: SortOption) {
    await this.sortDropdown.selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    const names = this.page.locator('[data-test="inventory-item-name"]');
    return names.allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const prices = this.page.locator('[data-test="inventory-item-price"]');
    const texts = await prices.allTextContents();
    return texts.map(t => parseFloat(t.replace('$', '')));
  }
}
