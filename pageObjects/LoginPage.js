import { expect } from '@playwright/test';

class LoginPage {
    constructor(page) {
        this.page = page;
        this.email = page.getByPlaceholder('you@email.com');
        this.password = page.getByLabel('Password');
        this.loginButton = page.locator('#login-btn');
    }

    async goto(baseUrl) {
        await this.page.goto(`${baseUrl}/login`);
    }

    async validLogin(email, password) {
        await this.email.fill(email);
        await this.password.fill(password);
        await this.loginButton.click();
        await expect(this.page).not.toHaveURL(/\/login/); // redirect away from /login = login success
    }
}
export { LoginPage };
