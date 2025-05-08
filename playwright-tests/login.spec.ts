import { test, expect } from "@playwright/test";

test("should have login title", async ({ page }) => {
  await page.goto("/login");
  const title = await page.title();
  expect(title).toBe("Login");
});
