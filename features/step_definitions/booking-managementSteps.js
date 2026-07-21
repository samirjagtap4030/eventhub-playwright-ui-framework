import { Given, When, Then } from '@cucumber/cucumber';
import { expect, chromium } from '@playwright/test';
import { POManager } from '../../pageObjects/POManager.js';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

Given('a login to EventHub with {string} and {string}', async function (email, password) {
    const loginPage = this.poManager.getLoginPage();
    await loginPage.goto(BASE_URL);
    await loginPage.validLogin(email, password);
});

When('I book {int} tickets on featured event {int} for customer {string} with {string} and {string}', async function (quantity, eventIndex, custName, custEmail, custPhone) {
    const eventsPage = this.poManager.getEventsPage();
    await eventsPage.goto(BASE_URL);
    const title = await eventsPage.openFeaturedEvent(eventIndex);
    const customer = { name: custName, email: custEmail, phone: custPhone };
    const ref = await this.poManager.getEventDetailPage().bookTickets(quantity, customer);
    this.customer = customer;                       // world constructor — later steps need the customer
    this.lastBooking = { title, ref };              // and the created booking's ref/title
    this.bookings = this.bookings ?? [];
    this.bookings.push(this.lastBooking);
});

When('I create one booking on each of the featured events {string} for customer {string} with {string} and {string}', async function (eventIndexes, custName, custEmail, custPhone) {
    const customer = { name: custName, email: custEmail, phone: custPhone };
    this.bookings = this.bookings ?? [];
    for (const idx of eventIndexes.split(',').map(Number)) {
        const eventsPage = this.poManager.getEventsPage();
        await eventsPage.goto(BASE_URL);
        const title = await eventsPage.openFeaturedEvent(idx);
        const ref = await this.poManager.getEventDetailPage().bookTickets(1, customer);
        this.bookings.push({ title, ref });
    }
    this.customer = customer;
});

When('I open the bookings list', async function () {
    await this.poManager.getBookingsListPage().goto(BASE_URL);
});

Then('the bookings list shows all my created bookings with their details', async function () {
    const bookingsListPage = this.poManager.getBookingsListPage();
    expect(await bookingsListPage.getCardCount()).toBeGreaterThanOrEqual(this.bookings.length);
    for (const b of this.bookings) {
        await bookingsListPage.verifyBookingCard(b.ref, b.title);
    }
});

Then('the clear all bookings control is visible', async function () {
    await this.poManager.getBookingsListPage().verifyClearAllVisible();
});

When('I open the booking detail page of my last booking', async function () {
    const bookingsListPage = this.poManager.getBookingsListPage();
    await bookingsListPage.goto(BASE_URL);
    await bookingsListPage.openBookingDetail(this.lastBooking.ref);
});

Then('the booking detail header shows the booking reference and event title', async function () {
    await this.poManager.getBookingDetailPage().verifyHeader(this.lastBooking.ref, this.lastBooking.title);
});

Then('all booking detail sections are rendered', async function () {
    await this.poManager.getBookingDetailPage().verifySectionsRendered();
});

Then('the customer details match the booking customer', async function () {
    await this.poManager.getBookingDetailPage().verifyCustomerDetails(this.customer);
});

Then('the payment summary shows {int} tickets', async function (quantity) {
    await this.poManager.getBookingDetailPage().verifyPaymentSummary(quantity);
});

Then('the refund, cancel and back actions are available', async function () {
    await this.poManager.getBookingDetailPage().verifyActionsAvailable();
});

When('I cancel the booking from its detail page', async function () {
    await this.poManager.getBookingDetailPage().cancelBooking(BASE_URL);
});

Then('the cancelled booking no longer appears in the bookings list', async function () {
    await this.poManager.getBookingsListPage().verifyBookingAbsent(this.lastBooking.ref);
});

Then('the bookings list shows at least {int} bookings', async function (count) {
    expect(await this.poManager.getBookingsListPage().getCardCount()).toBeGreaterThanOrEqual(count);
});

When('I clear all bookings', async function () {
    await this.poManager.getBookingsListPage().clearAll(); // native confirm() accepted inside the page method
});

Then('the bookings list shows the empty state', async function () {
    await this.poManager.getBookingsListPage().verifyEmptyState();
});

Given('a second user {string} with {string} records the seat count of featured event {int}', async function (email, password, eventIndex) {
    // two-context scenario — second browser launched inside the step; closed in the After hook
    this.browserB = await chromium.launch();
    const contextB = await this.browserB.newContext();
    this.pageB = await contextB.newPage();
    this.poManagerB = new POManager(this.pageB);
    const loginPage = this.poManagerB.getLoginPage();
    await loginPage.goto(BASE_URL);
    await loginPage.validLogin(email, password);
    await this.poManagerB.getEventsPage().goto(BASE_URL);
    this.titleB = await this.poManagerB.getEventsPage().openFeaturedEvent(eventIndex);
    this.seatsBefore = await this.poManagerB.getEventDetailPage().readAvailableSeats();
});

Then('both users are viewing the same featured event', async function () {
    expect(this.lastBooking.title).toBe(this.titleB); // both users are on the same static event
});

Then("I clear all my bookings to free the shared demo account's seats", async function () {
    // cleanup — the isolation scenario's bookings otherwise pile up on the shared demo account across runs
    const bookingsListPage = this.poManager.getBookingsListPage();
    await bookingsListPage.goto(BASE_URL);
    await bookingsListPage.clearAll();
    await bookingsListPage.verifyEmptyState();
});

Then('the second user seat count is unchanged after reloading', async function () {
    await this.pageB.reload();
    const seatsAfter = await this.poManagerB.getEventDetailPage().readAvailableSeats();
    expect(seatsAfter).toBe(this.seatsBefore);
});
