import { expect } from '@playwright/test';

class EventDetailPage {
    constructor(page) {
        this.page = page;
        // qty-increment data-testid exists in source but is not deployed on live — role fallback
        this.incrementButton = page.getByRole('button', { name: '+', exact: true });
        this.ticketCount = page.locator('#ticket-count');
        this.fullName = page.getByLabel('Full Name');
        this.customerEmail = page.getByTestId('customer-email');
        this.phone = page.getByLabel('Phone Number');
        this.confirmBookingButton = page.locator('.confirm-booking-btn'); // CSS — submit button has dynamic text (Confirm Booking / Sold Out), class is the stable hook
        this.bookingConfirmedText = page.getByText('Booking Confirmed!');
        this.bookingRef = page.locator('.booking-ref'); // CSS — ref span has no role/label/testid
        this.seatsText = page.getByText(/\d+ \/ \d+ seats/);
    }

    // Books tickets on the currently open event detail page; returns the booking ref
    async bookTickets(quantity, customer) {
        for (let i = 1; i < quantity; i++) {
            await this.incrementButton.click();
        }
        await expect(this.ticketCount).toHaveText(String(quantity));
        await this.fullName.fill(customer.name);
        await this.customerEmail.fill(customer.email);
        await this.phone.fill(customer.phone);
        await this.confirmBookingButton.click();
        await expect(this.bookingConfirmedText).toBeVisible();
        const bookingRef = (await this.bookingRef.textContent()).trim();
        expect(bookingRef).toBeTruthy();
        return bookingRef;
    }

    // Reads the per-user available seat count from the detail page ("N / M seats")
    async readAvailableSeats() {
        const seatsText = await this.seatsText.textContent();
        return Number(seatsText.split('/')[0].trim());
    }
}
export { EventDetailPage };
