import { test, expect } from "@playwright/test";

import useLanguage from "@/services/i18n/use-language";

test.describe("Sidebar Component", () => {
  const language = useLanguage();

  const mockSidebarItems = ["Item 1", "Item 2", "Item 3"];

  test("should render all sidebar items", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    for (const item of mockSidebarItems) {
      const menuItem = await page.locator(`text=${item}`);
      await expect(menuItem).toBeVisible();
    }
  });

  test("should highlight item as selected when clicked", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    const item1 = await page.locator("text=Item 1");
    await item1.click();

    await expect(item1).toHaveClass(/selected/);
  });

  test("should trigger sidebar toggle when an item is clicked", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    const item1 = await page.locator("text=Item 1");
    await item1.click();

    const sidebarContainer = await page.locator("[data-testid='sidebar-container']");
    await expect(sidebarContainer).toBeVisible();
  });

  test("should render image with correct alt text for each sidebar item", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    for (const item of mockSidebarItems) {
      const image = await page.locator(`img[alt='${item}']`);
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute("alt", item);
    }
  });

  test("should render sidebar items with correct layout", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    const menuStack = await page.locator("[data-testid='menu-stack']");
    const items = await menuStack.locator("li");
    await expect(items).toHaveCount(mockSidebarItems.length);
  });

  test("should match snapshot", async ({ page }) => {
    await page.goto(`/${language}/videos`);
    const sidebar = await page.locator("[data-testid='sidebar-container']");
    expect(await sidebar.screenshot()).toMatchSnapshot();
  });

  test("should handle no sidebar items gracefully", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    await page.evaluate(() => {
      const sidebar = document.querySelector("[data-testid='sidebar-container']")!;
      sidebar.setAttribute("data-sidebar-items", "[]");
    });

    const noItemsMessage = await page.locator("text=No items available");
    await expect(noItemsMessage).toBeVisible();
  });

  test("should render correct item image size", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    const image = await page.locator("img[alt='Item 1']");
    const width = await image.getAttribute("width");
    const height = await image.getAttribute("height");

    await expect(width).toBe("18");
    await expect(height).toBe("12");
  });

  test("should render default class name", async ({ page }) => {
    await page.goto(`/${language}/videos`);

    const sidebarContainer = await page.locator("[data-testid='sidebar-container']");
    await expect(sidebarContainer).toHaveClass("custom-class");
  });
});
