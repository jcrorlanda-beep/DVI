import { expect, test, type Page } from "@playwright/test";

async function loadDemo(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("qc queue renders and selecting an item opens the detail panel", async ({ page }) => {
  await loadDemo(page);

  await page.getByRole("button", { name: /Quality Control/ }).first().click();
  await expect(page.getByText("QC Queue", { exact: true }).first()).toBeVisible();

  const queueItems = page.locator('[data-testid^="qc-queue-item-"]');
  await expect(queueItems.first()).toBeVisible();
  await expect(page.getByTestId("qc-detail-panel")).toBeVisible();
  await expect(page.getByRole("button", { name: /Pass QC/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Fail QC/i })).toBeVisible();

  if ((await queueItems.count()) > 1) {
    await queueItems.nth(1).click();
    await expect(page.getByTestId("qc-detail-panel")).toBeVisible();
  }
});
