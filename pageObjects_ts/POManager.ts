import { Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { EventsPage } from './EventsPage';
import { EventDetailPage } from './EventDetailPage';
import { BookingsListPage } from './BookingsListPage';
import { BookingDetailPage } from './BookingDetailPage';

export class POManager {
    page: Page;
    loginPage: LoginPage;
    eventsPage: EventsPage;
    eventDetailPage: EventDetailPage;
    bookingsListPage: BookingsListPage;
    bookingDetailPage: BookingDetailPage;

    constructor(page: Page) {
        this.page = page;
        this.loginPage = new LoginPage(this.page);
        this.eventsPage = new EventsPage(this.page);
        this.eventDetailPage = new EventDetailPage(this.page);
        this.bookingsListPage = new BookingsListPage(this.page);
        this.bookingDetailPage = new BookingDetailPage(this.page);
    }

    getLoginPage(): LoginPage {
        return this.loginPage;
    }

    getEventsPage(): EventsPage {
        return this.eventsPage;
    }

    getEventDetailPage(): EventDetailPage {
        return this.eventDetailPage;
    }

    getBookingsListPage(): BookingsListPage {
        return this.bookingsListPage;
    }

    getBookingDetailPage(): BookingDetailPage {
        return this.bookingDetailPage;
    }
}
