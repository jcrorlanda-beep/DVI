import { expect, test, type Page } from "@playwright/test";

async function loadDemoDashboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("backjob list renders and selecting a record opens the detail panel", async ({ page }) => {
  await loadDemoDashboard(page);

  await page.getByRole("button", { name: "BJ Backjobs" }).click();

  await expect(page.getByTestId("backjob-analytics-panel")).toBeVisible();
  const queueItems = page.locator('[data-testid^="backjob-queue-item-"]');
  await expect(queueItems.first()).toBeVisible();

  await queueItems.first().getByRole("button", { name: "Open" }).click();

  const detail = page.getByTestId("backjob-detail-panel");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("Backjob No.");
  await expect(page.getByTestId("backjob-analytics-panel")).toBeVisible();
});
