import { test, expect } from '@playwright/test';
import { POManager } from '../pageObjects/POManager.js';
import dataset from '../utils/booking-managementTestData.json' with { type: 'json' };

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

// Full booking journey on the nth Featured event; returns { title, ref }
async function createBooking(poManager, featuredIndex, quantity, customer) {
    const eventsPage = poManager.getEventsPage();
    await eventsPage.goto(BASE_URL);
    const title = await eventsPage.openFeaturedEvent(featuredIndex);
    const ref = await poManager.getEventDetailPage().bookTickets(quantity, customer);
    return { title, ref };
}

async function loginAs(poManager, user) {
    const loginPage = poManager.getLoginPage();
    await loginPage.goto(BASE_URL);
    await loginPage.validLogin(user.email, user.password);
}

test.describe('Booking management DDT', () => {

    for (const data of dataset) {

        // TC-003: View the bookings list
        test(`Bookings list view DDT test for ${data.customer.name} @regression`, async ({ page }) => {
            test.setTimeout(90_000);
            const poManager = new POManager(page);

            // -- Step 1: Login and create two bookings (precondition) --
            await loginAs(poManager, data.userA);
            const b1 = await createBooking(poManager, 0, data.listBookingQuantity, data.customer);
            const b2 = await createBooking(poManager, 1, data.listBookingQuantity, data.customer);

            // -- Step 2: Open the bookings list --
            const bookingsListPage = poManager.getBookingsListPage();
            await bookingsListPage.goto(BASE_URL);
            expect(await bookingsListPage.getCardCount()).toBeGreaterThanOrEqual(2);

            // -- Step 3: Each created booking's card shows ref, event name, status, View Details --
            await bookingsListPage.verifyBookingCard(b1.ref, b1.title);
            await bookingsListPage.verifyBookingCard(b2.ref, b2.title);

            // -- Step 4: Clear-all control is available --
            await bookingsListPage.verifyClearAllVisible();
        });

        // TC-004: View booking detail page (covers TC-511 — ref in breadcrumb/header)
        test(`Booking detail view DDT test for ${data.customer.name} @regression`, async ({ page }) => {
            test.setTimeout(90_000);
            const poManager = new POManager(page);

            // -- Step 1: Login and create a booking (precondition) --
            await loginAs(poManager, data.userA);
            const { title, ref } = await createBooking(poManager, 0, data.detailBookingQuantity, data.customer);

            // -- Step 2: Open its detail page via View Details --
            const bookingsListPage = poManager.getBookingsListPage();
            await bookingsListPage.goto(BASE_URL);
            await bookingsListPage.openBookingDetail(ref);

            // -- Steps 3-7: Header, sections, customer details, payment summary, actions --
            const bookingDetailPage = poManager.getBookingDetailPage();
            await bookingDetailPage.verifyHeader(ref, title);
            await bookingDetailPage.verifySectionsRendered();
            await bookingDetailPage.verifyCustomerDetails(data.customer);
            await bookingDetailPage.verifyPaymentSummary(data.detailBookingQuantity);
            await bookingDetailPage.verifyActionsAvailable();
        });

        // TC-005: Cancel a single booking
        test(`Single booking cancellation DDT test for ${data.customer.name} @regression`, async ({ page }) => {
            test.setTimeout(90_000);
            const poManager = new POManager(page);

            // -- Step 1: Login and create a booking to cancel (precondition) --
            await loginAs(poManager, data.userA);
            const { ref } = await createBooking(poManager, 0, data.cancelBookingQuantity, data.customer);

            // -- Step 2: Open the booking's detail page --
            const bookingsListPage = poManager.getBookingsListPage();
            await bookingsListPage.goto(BASE_URL);
            await bookingsListPage.openBookingDetail(ref);

            // -- Steps 3-4: Cancel via the confirmation dialog; toast + redirect verified in the page method --
            await poManager.getBookingDetailPage().cancelBooking(BASE_URL);

            // -- Step 5: Cancelled booking no longer appears in the list --
            await bookingsListPage.verifyBookingAbsent(ref);
        });

        // TC-006: Clear all bookings (covers TC-504 — empty state after clearing)
        test(`Clear all bookings DDT test for ${data.customer.name} @regression`, async ({ page }) => {
            test.setTimeout(120_000);
            const poManager = new POManager(page);

            // -- Step 1: Login and create three bookings (precondition) --
            await loginAs(poManager, data.userA);
            for (const idx of data.clearAllEventIndexes) {
                await createBooking(poManager, idx, data.listBookingQuantity, data.customer);
            }

            // -- Step 2: Bookings list shows at least three cards --
            const bookingsListPage = poManager.getBookingsListPage();
            await bookingsListPage.goto(BASE_URL);
            expect(await bookingsListPage.getCardCount()).toBeGreaterThanOrEqual(data.clearAllEventIndexes.length);

            // -- Step 3: Clear all (native confirm() accepted inside the page method) --
            await bookingsListPage.clearAll();

            // -- Step 4: Empty state is shown and no cards remain --
            await bookingsListPage.verifyEmptyState();
        });

        // TC-104: Static event seat availability is computed per user —
        // User B's view is unaffected by User A's booking (before/after comparison,
        // never a fixed seat number: shared demo accounts carry their own bookings)
        test(`Static event per-user seat isolation DDT test for ${data.customer.name} @regression`, async ({ browser }) => {
            test.setTimeout(120_000);
            const contextA = await browser.newContext();
            const pageA = await contextA.newPage();
            const contextB = await browser.newContext();
            const pageB = await contextB.newPage();
            const poA = new POManager(pageA);
            const poB = new POManager(pageB);

            // -- Step 1: User B records their seat count on the first Featured event --
            await loginAs(poB, data.userB);
            await poB.getEventsPage().goto(BASE_URL);
            const titleB = await poB.getEventsPage().openFeaturedEvent(0);
            const seatsBefore = await poB.getEventDetailPage().readAvailableSeats();

            // -- Step 2: User A books tickets on the SAME event --
            await loginAs(poA, data.userA);
            const { title: titleA } = await createBooking(poA, 0, data.isolationBookingQuantity, data.customer);
            expect(titleA).toBe(titleB); // both users are on the same static event

            // -- Step 3: User B reloads — their seat count is unchanged by A's booking --
            await pageB.reload();
            const seatsAfter = await poB.getEventDetailPage().readAvailableSeats();
            expect(seatsAfter).toBe(seatsBefore);

            await contextA.close();
            await contextB.close();
        });

    }

});
