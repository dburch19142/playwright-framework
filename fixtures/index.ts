import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { ItemsApi, uniqueName, type Item } from '../utils/itemsApi';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  itemsApi: ItemsApi;
  /** An item created through the API before the test and deleted after it. */
  seededItem: Item;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  itemsApi: async ({ request }, use) => {
    await use(new ItemsApi(request));
  },
  seededItem: async ({ itemsApi }, use) => {
    const item = await itemsApi.create(uniqueName('seeded'));
    await use(item);
    await itemsApi.delete(item.id);
  },
});

export { expect } from '@playwright/test';
