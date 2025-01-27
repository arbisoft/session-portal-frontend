import { test, expect } from "@playwright/test";

test("should have home title", async ({ page }) => {
  //TODO: will remove this
  await page.goto("/en");
  const title = await page.title();
  expect(title).toBe("Home");
});
