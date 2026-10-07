import { expect, test } from '../../fixtures';
import { uniqueName } from '../../utils/itemsApi';

test.describe('dashboard', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test('opens already signed in @smoke', async ({ dashboardPage }) => {
    await expect(dashboardPage.heading).toBeVisible();
    await expect(dashboardPage.banner).toBeVisible();
  });

  test('adds an item', async ({ dashboardPage, itemsApi }) => {
    const name = uniqueName();

    await dashboardPage.addItem(name);

    await expect(dashboardPage.item(name)).toBeVisible();
    await expect(dashboardPage.itemName).toBeEmpty();

    const created = (await itemsApi.list()).find((item) => item.name === name);
    await itemsApi.delete(created!.id);
  });

  test('lists an item created through the API', async ({ seededItem, dashboardPage }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.item(seededItem.name)).toBeVisible();
  });
});
