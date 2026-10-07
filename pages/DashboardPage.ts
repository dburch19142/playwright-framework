import { type Locator, type Page } from '@playwright/test';

export class DashboardPage {
  readonly heading: Locator;
  readonly banner: Locator;
  readonly itemName: Locator;
  readonly addItemButton: Locator;
  readonly items: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.banner = page.getByTestId('welcome-banner');
    this.itemName = page.getByLabel('Item name');
    this.addItemButton = page.getByRole('button', { name: 'Add item' });
    this.items = page.getByRole('list', { name: 'Items' }).getByRole('listitem');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async addItem(name: string) {
    await this.itemName.fill(name);
    await this.addItemButton.click();
  }

  item(name: string) {
    return this.items.filter({ hasText: name });
  }
}
