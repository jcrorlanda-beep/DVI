import { expect, test, type Page } from "@playwright/test";

async function loadDemo(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("release queue renders and opening a job shows release detail actions", async ({ page }) => {
  await loadDemo(page);

  await page.getByRole("button", { name: /^RL Release$/ }).click();
  await expect(page.getByText("Release Queue")).toBeVisible();

  const queueItems = page.locator('[data-testid^="release-queue-item-"]');
  await expect(queueItems.first()).toBeVisible();
  await expect(page.getByTestId("release-detail-panel")).toBeVisible();
  await expect(page.getByRole("button", { name: /Draft Release Summary/i })).toBeVisible();

  if ((await queueItems.count()) > 1) {
    await queueItems.nth(1).click();
    await expect(page.getByTestId("release-detail-panel")).toBeVisible();
  }
});
