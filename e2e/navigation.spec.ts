import { test, expect } from "@playwright/test";

test("navigation", async ({ page }) => {
  const testWindowsVisibility = function (visibleWindows: string[]) {
    const windows = ["#settings", "#mark-suggestions", "#mark-groups", "#captions"];
    for (let windowId of windows) {
      if (visibleWindows.includes(windowId)) expect(page.locator(windowId)).toBeVisible();
      else expect(page.locator(windowId)).not.toBeVisible();
    }
  };
  await page.goto("http://localhost:8080/");
  await page.locator("a[name='collections-link']").click();
  expect(page.url()).toBe("http://localhost:8080/collections");
  await page.locator("a[name='new-map-link']").click();
  expect(page.url()).toBe("http://localhost:8080/new");
  testWindowsVisibility(["#settings"]);
  await page.locator("#marks-button").click();
  testWindowsVisibility(["#mark-suggestions", "#mark-groups"]);
  await page.locator("#captions-button").click();
  testWindowsVisibility(["#captions"]);
  await page.locator("#settings-button").click();
  testWindowsVisibility(["#settings"]);
  await page.locator("#settings-button").click();
  testWindowsVisibility([]);
  await page.locator("a[name='homepage-link']").click();
  expect(page.url()).toBe("http://localhost:8080/");
});
