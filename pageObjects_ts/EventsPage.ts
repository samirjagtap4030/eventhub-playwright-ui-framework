import { Page, Locator, expect } from '@playwright/test';

export class EventsPage {
    page: Page;
    eventCards: Locator;
    featuredCards: Locator;

    constructor(page: Page) {
        this.page = page;
        this.eventCards = page.getByTestId('event-card');
        this.featuredCards = this.eventCards.filter({ hasText: 'Featured' });
    }

    async goto(baseUrl: string) {
        await this.page.goto(`${baseUrl}/events`);
    }

    // Opens the nth Featured (static) event and returns its title —
    // picked dynamically because live seed titles drift from the docs
    async openFeaturedEvent(index: number): Promise<string> {
        await this.featuredCards.first().waitFor();
        const card = this.featuredCards.nth(index);
        const titleText: any = await card.getByRole('heading').first().textContent(); // textContent() can return string | null
        const title = titleText.trim();
        await card.getByTestId('book-now-btn').click();
        await expect(this.page).toHaveURL(/\/events\/\d+/);
        return title;
    }
}
