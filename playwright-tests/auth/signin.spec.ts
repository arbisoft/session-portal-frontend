import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ browser }) => {
    await browser.newContext();
  });

  test("should display login page correctly", async ({ page }) => {
    await page.goto("/en/signin");
    await expect(page).toHaveTitle(/Sign In/);
    const favicon = await page.$('link[rel="icon"]');
    expect(await favicon?.getAttribute("href")).toBeTruthy();

    const googleButton = page.locator('button:has-text("Sign in with Google")');
    await expect(googleButton).toBeVisible();
  });

  test("should be able to invoke Google authentication", async ({ page }) => {
    await page.goto("/en/signin");

    const modalBefore = page.locator('div[role="dialog"]');
    await expect(modalBefore).toBeHidden();

    await page.click("text=Sign in with Google");
  });

  test("should handle authentication errors", async ({ page }) => {
    await page.goto("/en/signin");
    await page.click("text=Sign in with Google");

    // Ensure we stay on login page
    await expect(page).toHaveURL(/.*signin/);
  });
});
