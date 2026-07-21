import { LoginPage } from './LoginPage.js';
import { EventsPage } from './EventsPage.js';
import { EventDetailPage } from './EventDetailPage.js';
import { BookingsListPage } from './BookingsListPage.js';
import { BookingDetailPage } from './BookingDetailPage.js';

class POManager {
    constructor(page) {
        this.page = page;
        this.loginPage = new LoginPage(this.page);
        this.eventsPage = new EventsPage(this.page);
        this.eventDetailPage = new EventDetailPage(this.page);
        this.bookingsListPage = new BookingsListPage(this.page);
        this.bookingDetailPage = new BookingDetailPage(this.page);
    }

    getLoginPage() {
        return this.loginPage;
    }

    getEventsPage() {
        return this.eventsPage;
    }

    getEventDetailPage() {
        return this.eventDetailPage;
    }

    getBookingsListPage() {
        return this.bookingsListPage;
    }

    getBookingDetailPage() {
        return this.bookingDetailPage;
    }
}
export { POManager };
