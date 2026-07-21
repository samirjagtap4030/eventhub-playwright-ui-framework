import { expect } from '@playwright/test';

class BookingDetailPage {
    constructor(page) {
        this.page = page;
        this.refBadge = page.locator('span.font-mono.font-bold'); // CSS — badge has no role/testid
        this.checkRefundButton = page.locator('#check-refund-btn');
        this.cancelBookingButton = page.getByRole('button', { name: 'Cancel Booking' });
        this.backLink = page.getByRole('link', { name: 'Back to My Bookings' });
        this.cancelDialogTitle = page.getByText('Cancel this booking?');
        this.confirmCancelButton = page.getByRole('button', { name: 'Yes, cancel it' });
        this.cancelledToast = page.getByText('Booking cancelled successfully');
        this.quantityRow = page.locator('div.flex.justify-between').filter({ hasText: 'Tickets' }); // CSS — plain label/value row
        this.totalPaidText = page.getByText('Total Paid');
    }

    async verifyHeader(ref, title) {
        await expect(this.refBadge.filter({ hasText: ref })).toBeVisible();
        await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
    }

    async verifySectionsRendered() {
        for (const section of ['Event Details', 'Customer Details', 'Payment Summary', 'Refund', 'Booking Information']) {
            await expect(this.page.getByRole('heading', { name: section })).toBeVisible();
        }
    }

    async verifyCustomerDetails(customer) {
        await expect(this.page.getByText(customer.name)).toBeVisible();
        await expect(this.page.getByText(customer.email)).toBeVisible();
    }

    async verifyPaymentSummary(quantity) {
        await expect(this.quantityRow).toContainText(String(quantity));
        await expect(this.totalPaidText).toBeVisible();
    }

    async verifyActionsAvailable() {
        await expect(this.checkRefundButton).toBeVisible();
        await expect(this.cancelBookingButton).toBeVisible();
        await expect(this.backLink).toBeVisible();
    }

    async cancelBooking(baseUrl) {
        await this.cancelBookingButton.click();
        await expect(this.cancelDialogTitle).toBeVisible();
        await this.confirmCancelButton.click();
        await expect(this.cancelledToast).toBeVisible();
        await expect(this.page).toHaveURL(`${baseUrl}/bookings`);
    }
}
export { BookingDetailPage };
