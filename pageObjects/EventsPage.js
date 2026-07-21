import { expect } from '@playwright/test';

class EventsPage {
    constructor(page) {
        this.page = page;
        this.eventCards = page.getByTestId('event-card');
        this.featuredCards = this.eventCards.filter({ hasText: 'Featured' });
    }

    async goto(baseUrl) {
        await this.page.goto(`${baseUrl}/events`);
    }

    // Opens the nth Featured (static) event and returns its title —
    // picked dynamically because live seed titles drift from the docs
    async openFeaturedEvent(index) {
        await this.featuredCards.first().waitFor();
        const card = this.featuredCards.nth(index);
        const title = (await card.getByRole('heading').first().textContent()).trim();
        await card.getByTestId('book-now-btn').click();
        await expect(this.page).toHaveURL(/\/events\/\d+/);
        return title;
    }
}
export { EventsPage };
