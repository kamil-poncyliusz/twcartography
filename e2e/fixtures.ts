import { test } from "@playwright/test";

export const testLoggedInUser = test.extend({
  loggedInUser: async ({ page }, use) => {
    await page.goto("http://localhost:8080/");
    await page.locator("#profile-button").click();
    await page.locator("#login").fill("test");
    await page.locator("#password").fill("test1234");
    await page.locator("#submit").click();
    await page.waitForResponse(/auth/);
    await use(page);
  },
});

export const testLoggedInAdmin = test.extend({
  loggedInUser: async ({ page }, use) => {
    await page.goto("http://localhost:8080/");
    await page.locator("#profile-button").click();
    await page.locator("#login").fill("Admin");
    await page.locator("#password").fill("password");
    await page.locator("#submit").click();
    await page.waitForResponse(/auth/);
    await use(page);
  },
});
