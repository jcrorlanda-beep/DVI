import { expect, test, type Page } from "@playwright/test";

async function loadDemoDashboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("repair orders registry renders and selecting another RO updates the detail panel", async ({ page }) => {
  await loadDemoDashboard(page);

  await page.getByRole("button", { name: /^Repair Orders$/ }).click();

  const listItems = page.locator('[data-testid^="repair-order-list-item-"]');
  await expect(listItems.first()).toBeVisible();
  await expect(page.getByTestId("repair-order-detail-panel")).toBeVisible();

  const firstTitle = await page.getByTestId("repair-order-detail-panel").getByText(/RO-/).first().textContent();

  if ((await listItems.count()) > 1) {
    await listItems.nth(1).click();
    await expect(page.getByTestId("repair-order-detail-panel")).toBeVisible();
    const nextTitle = await page.getByTestId("repair-order-detail-panel").getByText(/RO-/).first().textContent();
    expect(nextTitle).not.toBe(firstTitle);
  }
});
