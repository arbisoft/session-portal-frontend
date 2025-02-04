import { test, expect } from "@playwright/test";

import useSidebar from "@/hooks/useSidebar";

test("should Sidebar should render all items", async ({ page }) => {
  const { sidebarItems: items } = useSidebar();
  await page.goto("/");

  const sidebarItems = page.locator("[data-testid='sidebar-item']");

  const expectedItemCount = 5;
  expect(await sidebarItems.count()).toBe(expectedItemCount);

  const expectedItems = [...items];
  for (let i = 0; i < expectedItemCount; i++) {
    const itemText = await sidebarItems.nth(i).innerText();
    expect(itemText).toBe(expectedItems[i]);
  }
});

test("should Sidebar items should highlight on click", async ({ page }) => {
  const sidebarItems = page.locator("[data-testid='sidebar-item']");

  for (let i = 0; i < (await sidebarItems.count()); i++) {
    const item = sidebarItems.nth(i);
    const isSelected = await item.getAttribute("isSelected");
    expect(isSelected).toBeNull();
  }

  const firstItem = sidebarItems.nth(0);
  const firstItemText = await firstItem.innerText();
  await firstItem.click();

  for (let i = 0; i < (await sidebarItems.count()); i++) {
    const item = sidebarItems.nth(i);
    const isSelected = await item.getAttribute("isSelected");
    if (i === 0) {
      expect(isSelected).toBe("true");
      const highlightedItemText = await item.innerText();
      expect(highlightedItemText).toBe(firstItemText);
    } else {
      expect(isSelected).toBeNull();
    }
  }

  const secondItem = sidebarItems.nth(1);
  const secondItemText = await secondItem.innerText();
  await secondItem.click();

  for (let i = 0; i < (await sidebarItems.count()); i++) {
    const item = sidebarItems.nth(i);
    const isSelected = await item.getAttribute("isSelected");
    if (i === 1) {
      expect(isSelected).toBe("true");
      const newHighlightedItemText = await item.innerText();
      expect(newHighlightedItemText).toBe(secondItemText);
    } else {
      expect(isSelected).toBeNull();
    }
  }
});
