import { test, expect } from '@fixtures/index';

const PRODUCT = 'Sauce Labs Backpack';
const SHIPPING = { firstName: 'John', lastName: 'Doe', postalCode: '10001' };

test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('completes full purchase from product selection to confirmation', async ({
    productsPage,
    cartPage,
    checkoutPage,
  }) => {
    await productsPage.addProductToCart(PRODUCT);
    await productsPage.goToCart();

    await cartPage.expectItemInCart(PRODUCT);
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingInfo(SHIPPING);
    await checkoutPage.expectStepTwoLoaded();

    await checkoutPage.completePurchase();
    await checkoutPage.expectOrderConfirmed();
  });

  test('allows navigating to checkout from an empty cart', async ({ page, cartPage, checkoutPage }) => {
    await page.goto('/cart.html');
    await cartPage.expectPageLoaded();
    await cartPage.proceedToCheckout();

    // SauceDemo permits checkout with no items — documents current app behaviour
    await checkoutPage.expectStepOneLoaded();
  });

  test('shows validation error when shipping form fields are missing', async ({
    productsPage,
    cartPage,
    checkoutPage,
  }) => {
    await productsPage.addProductToCart(PRODUCT);
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();

    // Click Continue without filling any field
    await checkoutPage.continueButton.click();
    await checkoutPage.expectError('First Name is required');
  });

  test('removes an item from the cart and reflects the empty state', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.addProductToCart(PRODUCT);
    expect(await productsPage.getCartCount()).toBe(1);

    await productsPage.goToCart();
    await cartPage.expectItemInCart(PRODUCT);

    await cartPage.removeItem(PRODUCT);
    await cartPage.expectItemNotInCart(PRODUCT);
    expect(await cartPage.getItemCount()).toBe(0);
  });

  test('displays correct price totals on the order overview', async ({
    productsPage,
    cartPage,
    checkoutPage,
  }) => {
    await productsPage.addProductToCart(PRODUCT);
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(SHIPPING);
    await checkoutPage.expectStepTwoLoaded();

    const parseAmount = async (locator: import('@playwright/test').Locator): Promise<number> => {
      const text = (await locator.textContent()) ?? '';
      return parseFloat(text.match(/[\d.]+/)?.[0] ?? '0');
    };

    const itemTotal = await parseAmount(checkoutPage.itemTotal);
    const tax       = await parseAmount(checkoutPage.taxAmount);
    const total     = await parseAmount(checkoutPage.orderTotal);

    expect(total).toBeCloseTo(itemTotal + tax, 2);
  });
});
