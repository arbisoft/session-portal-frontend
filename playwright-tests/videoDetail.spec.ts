import { test, expect } from "@playwright/test";

test.describe("Video Detail Page", () => {
  test("should display video title after data loads", async ({ page }) => {
    await page.goto("/videos/all-hands-2024");
    await expect(page.getByRole("heading", { level: 4 })).toBeVisible();
  });

  test("should render video player", async ({ page }) => {
    await page.goto("/videos/all-hands-2024");
    await expect(page.locator("video")).toBeVisible();
  });

  test("should show recommendations list in sidebar", async ({ page }) => {
    await page.goto("/videos/all-hands-2024");
    await expect(page.locator("[data-testid='recommendation-card']")).toBeVisible();
  });

  test("should show skeleton loader on initial load", async ({ page }) => {
    await page.goto("/videos/all-hands-2024");
    await expect(page.locator("[data-testid='video-player-skeleton']")).toBeVisible();
  });

  test("should change document title based on video title", async ({ page }) => {
    await page.goto("/videos/all-hands-2024");
    await expect(page).toHaveTitle(/- Sessions Portal/);
  });

  test("should navigate back to videos if error occurs", async ({ page }) => {
    await page.goto("/videos/invalid-event-id");
    await expect(page).toHaveURL(/\/videos$/);
  });
});
