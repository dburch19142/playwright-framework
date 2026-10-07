import { expect, test } from '../../fixtures';
import { uniqueName } from '../../utils/itemsApi';

test.describe('items API', () => {
  test('creates and lists an item @smoke', async ({ itemsApi }) => {
    const created = await itemsApi.create(uniqueName('api'));

    expect(await itemsApi.list()).toContainEqual(created);

    await itemsApi.delete(created.id);
  });

  test('deletes an item', async ({ itemsApi, seededItem }) => {
    await itemsApi.delete(seededItem.id);

    expect(await itemsApi.list()).not.toContainEqual(seededItem);
  });

  test('rejects an item without a name', async ({ request }) => {
    const response = await request.post('/api/items', { data: {} });

    expect(response.status()).toBe(400);
  });

  test('requires authentication', async ({ playwright, baseURL }) => {
    // New contexts inherit the saved session from the config, so clear it explicitly.
    const anonymous = await playwright.request.newContext({
      baseURL,
      storageState: { cookies: [], origins: [] },
    });

    const response = await anonymous.get('/api/items');

    expect(response.status()).toBe(401);
    await anonymous.dispose();
  });
});
