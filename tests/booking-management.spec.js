import { test, expect } from '@playwright/test';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
const USER_A = { email: 'xxxxxxxxxxxxxxxxxxxx', password: 'xxxxxxxxxxx' };
const USER_B = { email: 'xxxxxxxxxxxxxxxxxxxx', password: 'xxxxxxxxxxx' };
const CUSTOMER = { name: 'Samir Tester', email: 'samir.tester@example.com', phone: '+91 9876543210' };

async function login(page, user) {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@email.com').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.locator('#login-btn').click();
    await expect(page).not.toHaveURL(/\/login/); // redirect away from /login = login success
}

// Opens the detail page of the nth Featured (static) event and returns its title.
// Featured events are picked dynamically — live seed titles drift from the docs.
async function openFeaturedEvent(page, index) {
    await page.goto(`${BASE_URL}/events`);
    const featuredCards = page.getByTestId('event-card').filter({ hasText: 'Featured' });
    await featuredCards.first().waitFor();
    const card = featuredCards.nth(index);
    const title = (await card.getByRole('heading').first().textContent()).trim();
    await card.getByTestId('book-now-btn').click();
    await expect(page).toHaveURL(/\/events\/\d+/);
    return title;
}

// Reads the per-user available seat count from an event detail page ("N / M seats")
async function readAvailableSeats(page) {
    const seatsText = await page.getByText(/\d+ \/ \d+ seats/).textContent();
    return Number(seatsText.split('/')[0].trim());
}

// Books tickets on the currently open event detail page; returns the booking ref
async function bookTickets(page, quantity) {
    for (let i = 1; i < quantity; i++) {
        // qty-increment data-testid exists in source but is not deployed on live — role fallback
        await page.getByRole('button', { name: '+', exact: true }).click();
    }
    await expect(page.locator('#ticket-count')).toHaveText(String(quantity));
    await page.getByLabel('Full Name').fill(CUSTOMER.name);
    await page.getByTestId('customer-email').fill(CUSTOMER.email);
    await page.getByLabel('Phone Number').fill(CUSTOMER.phone);
    await page.locator('.confirm-booking-btn').click(); // CSS — submit button has dynamic text (Confirm Booking / Sold Out), class is the stable hook
    await expect(page.getByText('Booking Confirmed!')).toBeVisible();
    const bookingRef = (await page.locator('.booking-ref').textContent()).trim(); // CSS — ref span has no role/label/testid
    expect(bookingRef).toBeTruthy();
    return bookingRef;
}

// Full booking journey on the nth Featured event; returns { title, ref }
async function createBooking(page, featuredIndex, quantity) {
    const title = await openFeaturedEvent(page, featuredIndex);
    const ref = await bookTickets(page, quantity);
    return { title, ref };
}

test.describe('Booking management', () => {

    // TC-003: View the bookings list
    test('Bookings list view standalone test', async ({ page }) => {
        test.setTimeout(90_000);

        // -- Step 1: Login and create two bookings (precondition) --
        await login(page, USER_A);
        const b1 = await createBooking(page, 0, 1);
        const b2 = await createBooking(page, 1, 1);

        // -- Step 2: Open the bookings list --
        await page.goto(`${BASE_URL}/bookings`);
        const cards = page.getByTestId('booking-card');
        await cards.first().waitFor();
        expect(await cards.count()).toBeGreaterThanOrEqual(2);

        // -- Step 3: Each created booking's card shows ref, event name, status, View Details --
        for (const b of [b1, b2]) {
            const card = cards.filter({ hasText: b.ref }).first();
            await expect(card).toBeVisible();
            await expect(card.getByText(b.title)).toBeVisible();
            await expect(card.getByText('confirmed')).toBeVisible();
            await expect(card.getByRole('link', { name: 'View Details' })).toBeVisible();
        }

        // -- Step 4: Clear-all control is available --
        await expect(page.getByRole('button', { name: 'Clear all bookings' })).toBeVisible();
    });

    // TC-004: View booking detail page (covers TC-511 — ref in breadcrumb/header)
    test('Booking detail view standalone test', async ({ page }) => {
        test.setTimeout(90_000);

        // -- Step 1: Login and create a 2-ticket booking (precondition) --
        await login(page, USER_A);
        const { title, ref } = await createBooking(page, 0, 2);

        // -- Step 2: Open its detail page via View Details --
        await page.goto(`${BASE_URL}/bookings`);
        await page.getByTestId('booking-card').filter({ hasText: ref }).first()
            .getByRole('link', { name: 'View Details' }).click();
        await expect(page).toHaveURL(/\/bookings\/\d+/);

        // -- Step 3: Header shows the booking ref (monospace badge) and event title --
        await expect(page.locator('span.font-mono.font-bold').filter({ hasText: ref })).toBeVisible(); // CSS — badge has no role/testid
        await expect(page.getByRole('heading', { name: title })).toBeVisible();

        // -- Step 4: All five sections are rendered --
        for (const section of ['Event Details', 'Customer Details', 'Payment Summary', 'Refund', 'Booking Information']) {
            await expect(page.getByRole('heading', { name: section })).toBeVisible();
        }

        // -- Step 5: Customer details match what was entered --
        await expect(page.getByText(CUSTOMER.name)).toBeVisible();
        await expect(page.getByText(CUSTOMER.email)).toBeVisible();

        // -- Step 6: Payment summary shows the ticket quantity and total --
        const qtyRow = page.locator('div.flex.justify-between').filter({ hasText: 'Tickets' }); // CSS — plain label/value row
        await expect(qtyRow).toContainText('2');
        await expect(page.getByText('Total Paid')).toBeVisible();

        // -- Step 7: Refund check, Cancel Booking and back link are present --
        await expect(page.locator('#check-refund-btn')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cancel Booking' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Back to My Bookings' })).toBeVisible();
    });

    // TC-005: Cancel a single booking
    test('Single booking cancellation standalone test', async ({ page }) => {
        test.setTimeout(90_000);

        // -- Step 1: Login and create a booking to cancel (precondition) --
        await login(page, USER_A);
        const { ref } = await createBooking(page, 0, 1);

        // -- Step 2: Open the booking's detail page --
        await page.goto(`${BASE_URL}/bookings`);
        await page.getByTestId('booking-card').filter({ hasText: ref }).first()
            .getByRole('link', { name: 'View Details' }).click();
        await expect(page).toHaveURL(/\/bookings\/\d+/);

        // -- Step 3: Cancel via the confirmation dialog --
        await page.getByRole('button', { name: 'Cancel Booking' }).click();
        await expect(page.getByText('Cancel this booking?')).toBeVisible();
        await page.getByRole('button', { name: 'Yes, cancel it' }).click();

        // -- Step 4: Toast confirms and user is redirected to the list --
        await expect(page.getByText('Booking cancelled successfully')).toBeVisible();
        await expect(page).toHaveURL(`${BASE_URL}/bookings`);

        // -- Step 5: Cancelled booking no longer appears in the list --
        await expect(page.getByTestId('booking-card').first().or(page.getByText('No bookings yet'))).toBeVisible();
        await expect(page.getByTestId('booking-card').filter({ hasText: ref })).toHaveCount(0);
    });

    // TC-006: Clear all bookings (covers TC-504 — empty state after clearing)
    test('Clear all bookings standalone test', async ({ page }) => {
        test.setTimeout(120_000);

        // -- Step 1: Login and create three bookings (precondition) --
        await login(page, USER_A);
        for (const idx of [0, 1, 2]) {
            await createBooking(page, idx, 1);
        }

        // -- Step 2: Bookings list shows at least three cards --
        await page.goto(`${BASE_URL}/bookings`);
        await page.getByTestId('booking-card').first().waitFor();
        expect(await page.getByTestId('booking-card').count()).toBeGreaterThanOrEqual(3);

        // -- Step 3: Clear all — native confirm() dialog must be accepted --
        page.on('dialog', dialog => dialog.accept()); // registered BEFORE the triggering click
        await page.getByRole('button', { name: 'Clear all bookings' }).click();

        // -- Step 4: Empty state is shown and no cards remain --
        await expect(page.getByText('No bookings yet')).toBeVisible();
        await expect(page.getByTestId('booking-card')).toHaveCount(0);
    });

    // TC-104: Static event seat availability is computed per user —
    // User B's view is unaffected by User A's booking (before/after comparison,
    // never a fixed seat number: shared demo accounts carry their own bookings)
    test('Static event per-user seat isolation standalone test', async ({ browser }) => {
        test.setTimeout(120_000);
        const contextA = await browser.newContext();
        const pageA = await contextA.newPage();
        const contextB = await browser.newContext();
        const pageB = await contextB.newPage();

        // -- Step 1: User B records their seat count on the first Featured event --
        await login(pageB, USER_B);
        const titleB = await openFeaturedEvent(pageB, 0);
        const seatsBefore = await readAvailableSeats(pageB);

        // -- Step 2: User A books 3 tickets on the SAME event --
        await login(pageA, USER_A);
        const { title: titleA } = await createBooking(pageA, 0, 3);
        expect(titleA).toBe(titleB); // both users are on the same static event

        // -- Step 3: User B reloads — their seat count is unchanged by A's booking --
        await pageB.reload();
        const seatsAfter = await readAvailableSeats(pageB);
        expect(seatsAfter).toBe(seatsBefore);

        await contextA.close();
        await contextB.close();
    });

});
