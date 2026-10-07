import { expect, test as setup } from '../fixtures';
import { STORAGE_STATE } from '../playwright.config';
import { testUser } from '../utils/env';

// Logs in once; every other project starts from the saved session.
setup('authenticate', async ({ page, loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.login(testUser.email, testUser.password);
  await expect(dashboardPage.heading).toBeVisible();
  await page.context().storageState({ path: STORAGE_STATE });
});
