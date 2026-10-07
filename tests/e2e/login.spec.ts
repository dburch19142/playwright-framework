import { expect, test } from '../../fixtures';
import { testUser } from '../../utils/env';

// These tests exercise the login form itself, so start signed out.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('signs in with valid credentials @smoke', async ({ page, loginPage, dashboardPage }) => {
    await loginPage.login(testUser.email, testUser.password);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(dashboardPage.banner).toContainText(testUser.email);
  });

  test('rejects an incorrect password', async ({ page, loginPage }) => {
    await loginPage.login(testUser.email, 'not-the-password');

    await expect(loginPage.error).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects signed-out visitors away from the dashboard', async ({ page, loginPage }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.submit).toBeVisible();
  });
});
