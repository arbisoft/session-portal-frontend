import { test, expect } from "@playwright/test";

import useLanguage from "@/services/i18n/use-language";

test.describe("Sidebar Component", () => {
  const language = useLanguage();
  test("should render all sidebar items", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    const sidebarItems = await page.locator("text=Sample Item 1, Sample Item 2, Sample Item 3");
    await expect(sidebarItems).toBeVisible();
  });

  test("should highlight item as selected when clicked", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    const item = await page.locator("text=Sample Item 1");
    await item.click();

    const selectedItem = await page.locator("text=Sample Item 1");
    await expect(selectedItem).toHaveClass(/selected/);
  });

  test("should trigger sidebar toggle when an item is clicked", async ({ page }) => {
    const toggleButton = await page.locator("[data-testid='sidebar-toggle-button']");
    await toggleButton.click();

    const sidebar = await page.locator("[data-testid='sidebar-container']");
    await expect(sidebar).not.toBeVisible();
  });

  test("should render image with correct alt text for each sidebar item", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    const image = await page.locator("img[alt='Sample Item 1']");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("alt", "Sample Item 1");
  });

  test("should render sidebar items with correct layout", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    const menuStack = await page.locator("div[role='menu']");
    const items = await menuStack.locator("li");
    await expect(items).toHaveCount(3);
  });
});
