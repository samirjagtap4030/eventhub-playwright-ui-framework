import { Before, After, AfterStep, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { POManager } from '../../pageObjects/POManager.js';

setDefaultTimeout(120 * 1000); // cucumber's 5s default is too short for login/booking journeys

Before(async function () {
    this.browser = await chromium.launch(); // cucumber gives no page fixture — launch browser manually (headless for CI reliability)
    const context = await this.browser.newContext();
    this.page = await context.newPage();
    this.poManager = new POManager(this.page);
});

AfterStep(async function ({ result }) {
    // take a screenshot when a step fails
    if (result.status === Status.FAILED) {
        await this.page.screenshot({ path: 'screenshot-failed-step.png' });
    }
});

After(async function () {
    if (this.browserB) {
        await this.browserB.close(); // second-user browser from two-context scenarios
    }
    await this.browser.close();
});
