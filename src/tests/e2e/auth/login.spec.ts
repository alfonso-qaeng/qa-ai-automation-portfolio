import { test } from '@fixtures/index';
import { SAUCE_USERS } from '@data/users';

// Override storageState — login tests must start from a logged-out session
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('logs in with valid credentials and redirects to inventory', async ({ loginPage }) => {
    await loginPage.login(SAUCE_USERS.standard.username, SAUCE_USERS.standard.password);
    await loginPage.expectRedirectToInventory();
  });

  test('shows error for locked_out_user', async ({ loginPage }) => {
    await loginPage.login(SAUCE_USERS.locked.username, SAUCE_USERS.locked.password);
    await loginPage.expectLoginError('Sorry, this user has been locked out');
  });

  test('shows error when password does not match', async ({ loginPage }) => {
    await loginPage.login(SAUCE_USERS.standard.username, 'wrong_password_123');
    await loginPage.expectLoginError('Username and password do not match');
  });

  test('shows error when both username and password are empty', async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.expectLoginError('Username is required');
  });

  test('shows error when username is provided but password is empty', async ({ loginPage }) => {
    await loginPage.login(SAUCE_USERS.standard.username, '');
    await loginPage.expectLoginError('Password is required');
  });
});
