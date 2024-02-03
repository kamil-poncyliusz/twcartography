import { expect } from "@playwright/test";
import { testLoggedInUser } from "./fixtures";

testLoggedInUser("generating a map and deleting it", async ({ loggedInUser }) => {
  await loggedInUser.locator("a[name='new-map-link']").click();
  await loggedInUser.waitForLoadState();
  await Promise.all([
    loggedInUser.waitForResponse((response) => response.url().includes("/api/world")),
    loggedInUser.locator("#world-select").selectOption("1"),
  ]);
  await loggedInUser.locator("#turn-input").fill("5");
  await loggedInUser.locator("#turn-input").press("Enter");
  await loggedInUser.locator("#marks-button").click();
  await loggedInUser.locator("#mark-suggestions select").first().selectOption("-1");
  await loggedInUser.locator("#mark-suggestions select").first().selectOption("-1");
  await loggedInUser.locator("#mark-suggestions select").first().selectOption("-1");
  await loggedInUser.locator("#mark-suggestions select").first().selectOption("-1");
  await loggedInUser.locator("#mark-suggestions select").first().selectOption("-1");
  await loggedInUser.locator("#mark-suggestions select").first().selectOption("1");
  await loggedInUser.locator("#mark-suggestions select").first().selectOption("-1");
  await loggedInUser.locator("#settings-button").click();
  await loggedInUser.locator("#map-title").fill("title");
  await loggedInUser.locator("#map-description").fill("description");
  await loggedInUser.locator("#collection").selectOption("0");
  await Promise.all([
    loggedInUser.waitForResponse((response) => response.url().includes("/api/map")),
    loggedInUser.locator("#publish-button").click(),
  ]);
  expect(loggedInUser.locator("#publish-button")).toHaveClass(/success/);
  await loggedInUser.locator("#profile-button").click();
  await loggedInUser.locator("a[name='my-collections-link']").click();
  await loggedInUser.waitForURL("**/user/**");
  await loggedInUser.waitForLoadState();
  await loggedInUser.locator("#collection-list a").first().click();
  await loggedInUser.waitForURL("**/collection/**");
  await loggedInUser.waitForLoadState();
  loggedInUser.once("dialog", (dialog) => {
    dialog.accept().catch(() => {});
  });
  await Promise.all([
    loggedInUser.waitForResponse((response) => response.url().includes("/api/collection")),
    loggedInUser.locator("#delete-collection").click(),
  ]);
  await loggedInUser.waitForURL("http://localhost:8080/");
  console.log(loggedInUser.url());
});
