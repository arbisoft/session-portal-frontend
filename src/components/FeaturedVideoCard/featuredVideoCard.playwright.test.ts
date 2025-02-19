import { test, expect } from "@playwright/test";

test.describe("FeaturedVideoCard Component", () => {
  test("should render the component with provided props", async ({ page }) => {
    await page.goto("/videos");
    const title = await page.locator("text='Sample Video Title'");
    const dateTime = await page.locator("[data-testid='featured-card-date-time']");
    const image = await page.locator("img[alt='Sample Video Title']");

    await expect(title).toBeVisible();
    await expect(dateTime).toBeVisible();
    await expect(image).toHaveAttribute("src", "https://example.com/sample.jpg");
  });

  test("should display default image when imgUrl is not provided", async ({ page }) => {
    await page.goto("/videos");
    const image = await page.locator("img[alt='Sample Video Title']");

    await expect(image).toHaveAttribute("src", "/assets/images/temp-youtube-logo.webp");
  });

  test("should render the organizer name", async ({ page }) => {
    await page.goto("/your-page-with-video-card");
    const organizerName = await page.locator("[data-testid='video-card-organizer']");
    await expect(organizerName).toHaveText("Sample Video Organizer");
  });

  test("should not render when isVisible is false", async ({ page }) => {
    await page.goto("/videos");
    const videoCard = await page.locator("[data-testid='video-card']");
    await expect(videoCard).not.toBeVisible();
  });

  test("should render correctly with different width values", async ({ page }) => {
    await page.goto("/videos");
    const videoCard = await page.locator("[data-testid='video-card']");
    await expect(videoCard).toHaveCSS("width", "100%");
  });

  test("should render with empty description", async ({ page }) => {
    await page.goto("/videos");
    const description = await page.locator("[data-testid='video-description']");
    await expect(description).toBeEmpty();
  });

  test("should have the correct alt text for the image", async ({ page }) => {
    await page.goto("/videos");
    const image = await page.locator("img[alt='Sample Video Title']");
    await expect(image).toHaveAttribute("alt", "Sample Video Title");
  });

  test("should render empty date when date is not provided", async ({ page }) => {
    await page.goto("/videos");
    const date = await page.locator("[data-testid='video-card-date-time']");
    await expect(date).toBeEmpty();
  });

  test("should render the default class name", async ({ page }) => {
    await page.goto("/videos");
    const videoCard = await page.locator("[data-testid='video-card']");
    await expect(videoCard).toHaveClass(/custom-class/);
  });
});
