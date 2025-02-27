import { test, expect } from "@playwright/test";

import useNavigation from "@/hooks/useNavigation";

test.describe("Sidebar Component", () => {
  const mockSidebarItems = ["Item 1", "Item 2", "Item 3"];
  const { getPageUrl } = useNavigation();

  test("should render all sidebar items", async ({ page }) => {
    await page.goto(getPageUrl("videos"));
    for (const item of mockSidebarItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
  });

  test("should highlight item as selected when clicked", async ({ page }) => {
    await page.goto(getPageUrl("videos"));
    const item1 = await page.locator("text=Item 1");
    await item1.click();
    await expect(item1).toHaveClass(/selected/);
  });

  test("should trigger sidebar toggle when an item is clicked", async ({ page }) => {
    await page.goto(getPageUrl("videos"));
    const toggleButton = await page.locator("[data-testid='sidebar-toggle-button']");
    await toggleButton.click();
    await expect(page.locator("[data-testid='sidebar-container']")).not.toBeVisible();
  });

  test("should render image with correct alt text for each sidebar item", async ({ page }) => {
    await page.goto(getPageUrl("videos"));
    for (const item of mockSidebarItems) {
      const image = await page.locator(`img[alt='${item}']`);
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute("alt", item);
    }
  });

  test("should render sidebar items with correct layout", async ({ page }) => {
    await page.goto(getPageUrl("videos"));
    const menuStack = await page.locator("[data-testid='menu-stack']");
    await expect(menuStack.locator("li")).toHaveCount(mockSidebarItems.length);
  });

  test("should match snapshot", async ({ page }) => {
    await page.goto(getPageUrl("videos"));
    expect(await page.locator("[data-testid='sidebar-container']").screenshot()).toMatchSnapshot();
  });

  test("should handle no sidebar items gracefully", async ({ page }) => {
    await page.goto(getPageUrl("videos"));
    await page.evaluate(() => {
      document?.querySelector("[data-testid='sidebar-container']")?.setAttribute("data-sidebar-items", "[]");
    });
    await expect(page.locator("text=No items available")).toBeVisible();
  });

  test("should render correct item image size", async ({ page }) => {
    await page.goto(getPageUrl("videos"));
    const image = await page.locator("img[alt='Item 1']");
    await expect(image.getAttribute("width")).resolves.toBe("18");
    await expect(image.getAttribute("height")).resolves.toBe("12");
  });

  test("should render default class name", async ({ page }) => {
    await page.goto(getPageUrl("videos"));
    await expect(page.locator("[data-testid='sidebar-container']")).toHaveClass("custom-class");
  });
});
