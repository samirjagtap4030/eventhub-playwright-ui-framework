import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
    page: Page;
    email: Locator;
    password: Locator;
    loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.email = page.getByPlaceholder('you@email.com');
        this.password = page.getByLabel('Password');
        this.loginButton = page.locator('#login-btn');
    }

    async goto(baseUrl: string) {
        await this.page.goto(`${baseUrl}/login`);
    }

    async validLogin(email: string, password: string) {
        await this.email.fill(email);
        await this.password.fill(password);
        await this.loginButton.click();
        await expect(this.page).not.toHaveURL(/\/login/); // redirect away from /login = login success
    }
}
