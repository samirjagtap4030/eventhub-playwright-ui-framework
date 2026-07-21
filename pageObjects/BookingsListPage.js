import { expect } from '@playwright/test';

class BookingsListPage {
    constructor(page) {
        this.page = page;
        this.bookingCards = page.getByTestId('booking-card');
        this.clearAllButton = page.getByRole('button', { name: 'Clear all bookings' });
        this.emptyStateText = page.getByText('No bookings yet');
    }

    async goto(baseUrl) {
        await this.page.goto(`${baseUrl}/bookings`);
    }

    getBookingCard(ref) { // dynamic locator — runtime value, so a method, not a constructor field
        return this.bookingCards.filter({ hasText: ref }).first();
    }

    async getCardCount() {
        await this.bookingCards.first().waitFor();
        return await this.bookingCards.count();
    }

    async verifyBookingCard(ref, title) {
        const card = this.getBookingCard(ref);
        await expect(card).toBeVisible();
        await expect(card.getByText(title)).toBeVisible();
        await expect(card.getByText('confirmed')).toBeVisible();
        await expect(card.getByRole('link', { name: 'View Details' })).toBeVisible();
    }

    async verifyClearAllVisible() {
        await expect(this.clearAllButton).toBeVisible();
    }

    async openBookingDetail(ref) {
        await this.getBookingCard(ref).getByRole('link', { name: 'View Details' }).click();
        await expect(this.page).toHaveURL(/\/bookings\/\d+/);
    }

    async clearAll() {
        this.page.on('dialog', dialog => dialog.accept()); // native confirm() — registered BEFORE the triggering click
        await this.clearAllButton.click();
    }

    async verifyEmptyState() {
        await expect(this.emptyStateText).toBeVisible();
        await expect(this.bookingCards).toHaveCount(0);
    }

    async verifyBookingAbsent(ref) {
        // list is loaded once a card or the empty state is rendered
        await expect(this.bookingCards.first().or(this.emptyStateText)).toBeVisible();
        await expect(this.bookingCards.filter({ hasText: ref })).toHaveCount(0);
    }
}
export { BookingsListPage };
