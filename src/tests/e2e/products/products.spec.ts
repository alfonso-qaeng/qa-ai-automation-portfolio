import { test, expect } from '@fixtures/index';

test.describe('Products page', () => {
  test.beforeEach(async ({ page, productsPage }) => {
    await page.goto('/inventory.html');
    await productsPage.expectPageLoaded();
  });

  test('displays all 6 products for standard_user', async ({ page }) => {
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
  });

  test('sorts products alphabetically A to Z', async ({ productsPage }) => {
    await productsPage.sortBy('az');

    const names = await productsPage.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));

    expect(names).toEqual(sorted);
  });

  test('sorts products by price from lowest to highest', async ({ productsPage }) => {
    await productsPage.sortBy('lohi');

    const prices = await productsPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sorted);
  });

  test('updates cart badge count when adding multiple products', async ({ productsPage }) => {
    expect(await productsPage.getCartCount()).toBe(0);

    await productsPage.addProductToCart('Sauce Labs Backpack');
    expect(await productsPage.getCartCount()).toBe(1);

    await productsPage.addProductToCart('Sauce Labs Bike Light');
    expect(await productsPage.getCartCount()).toBe(2);

    await productsPage.addProductToCart('Sauce Labs Bolt T-Shirt');
    expect(await productsPage.getCartCount()).toBe(3);
  });
});
