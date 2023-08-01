import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.getByRole("link", { name: "Kolekcje" }).click();
  await page.getByRole("link", { name: "Stwórz mapę" }).click();
  await page.getByRole("button", { name: "Oznaczenia" }).click();
  await page.getByRole("button", { name: "Ustawienia" }).click();
  await page.getByRole("link", { name: "Strona główna" }).click();
});
