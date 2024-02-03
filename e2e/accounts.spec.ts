import { test, expect } from "@playwright/test";
import { testLoggedInUser } from "./fixtures";

test("login form access", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await expect(page.locator("#profile")).not.toBeVisible();
  await page.locator("#profile-button").click();
  await expect(page.locator("#profile")).toBeVisible();
  await expect(page.locator("#login")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.locator("#submit")).toBeVisible();
  await page.locator("#profile-button").click();
  await expect(page.locator("#profile")).not.toBeVisible();
  expect(page.url()).toBe("http://localhost:8080/");
});

test("test user login", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.locator("#profile-button").click();
  await page.locator("#login").fill("test");
  await page.locator("#password").fill("test1234");
  await page.locator("#submit").click();
  await expect(page.locator("#profile")).not.toBeVisible();
  await page.locator("#profile-button").click();
  await expect(page.locator("a[name='my-collections-link']")).toBeVisible();
  await expect(page.locator("#logout-button")).toBeVisible();
});

test("user login using incorrect password", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.locator("#profile-button").click();
  await page.locator("#login").fill("test");
  await page.locator("#password").fill("test123");
  await page.locator("#submit").click();
  await expect(page.locator("#profile")).toBeVisible();
  await expect(page.locator("#password")).toHaveClass(/is-invalid/);
});

testLoggedInUser("user logout", async ({ loggedInUser }) => {
  await loggedInUser.locator("#profile-button").click();
  await expect(loggedInUser.locator("#profile")).toBeVisible();
  await loggedInUser.locator("#logout-button").click();
  await expect(loggedInUser.locator("#profile")).not.toBeVisible();
  await loggedInUser.locator("#profile-button").click();
  await expect(loggedInUser.locator("#login")).toBeVisible();
  await expect(loggedInUser.locator("#password")).toBeVisible();
});
