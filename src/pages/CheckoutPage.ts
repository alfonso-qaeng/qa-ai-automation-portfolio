import { Page, Locator, expect } from '@playwright/test';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage {
  // Step one — shipping form
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly stepOneError: Locator;

  // Step two — order overview
  readonly itemTotal: Locator;
  readonly taxAmount: Locator;
  readonly orderTotal: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  // Confirmation
  readonly confirmationHeader: Locator;
  readonly confirmationText: Locator;
  readonly backHomeButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput   = page.locator('[data-test="firstName"]');
    this.lastNameInput    = page.locator('[data-test="lastName"]');
    this.postalCodeInput  = page.locator('[data-test="postalCode"]');
    this.continueButton   = page.locator('[data-test="continue"]');
    this.stepOneError     = page.locator('[data-test="error"]');

    this.itemTotal        = page.locator('[data-test="subtotal-label"]');
    this.taxAmount        = page.locator('[data-test="tax-label"]');
    this.orderTotal       = page.locator('[data-test="total-label"]');
    this.finishButton     = page.locator('[data-test="finish"]');
    this.cancelButton     = page.locator('[data-test="cancel"]');

    this.confirmationHeader = page.locator('[data-test="complete-header"]');
    this.confirmationText   = page.locator('[data-test="complete-text"]');
    this.backHomeButton     = page.locator('[data-test="back-to-products"]');
  }

  async expectStepOneLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    await expect(this.firstNameInput).toBeVisible();
  }

  async expectStepTwoLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.finishButton).toBeVisible();
  }

  async fillShippingInfo(info: ShippingInfo) {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
    await this.continueButton.click();
  }

  async completePurchase() {
    await this.expectStepTwoLoaded();
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
  }

  async expectTotalPrice(expectedTotal: string) {
    await expect(this.orderTotal).toContainText(expectedTotal);
  }

  async getTotalPrice(): Promise<number> {
    const text = await this.orderTotal.textContent() ?? '';
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async expectOrderConfirmed() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.confirmationHeader).toHaveText('Thank you for your order!');
    await expect(this.confirmationText).toBeVisible();
  }

  async expectError(message: string) {
    await expect(this.stepOneError).toBeVisible();
    await expect(this.stepOneError).toContainText(message);
  }

  async backToProducts() {
    await this.backHomeButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }
}
