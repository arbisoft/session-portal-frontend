import { test as setup } from "@playwright/test";

setup("Login and save state", async ({ page }) => {
  await page.goto("/login");
  await page.waitForURL("**/videos");
  await page.context().storageState({ path: "playwright-tests/storageState.json" });
});
