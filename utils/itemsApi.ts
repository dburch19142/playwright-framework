import { expect, type APIRequestContext } from '@playwright/test';

export interface Item {
  id: string;
  name: string;
}

export class ItemsApi {
  constructor(private readonly request: APIRequestContext) {}

  async list(): Promise<Item[]> {
    const response = await this.request.get('/api/items');
    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  async create(name: string): Promise<Item> {
    const response = await this.request.post('/api/items', { data: { name } });
    expect(response.status()).toBe(201);
    return response.json();
  }

  async delete(id: string) {
    await this.request.delete(`/api/items/${id}`);
  }
}

export const uniqueName = (prefix = 'item') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
