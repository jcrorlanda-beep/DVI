import { expect, test, type Page } from "@playwright/test";

async function loadDemoAsStaff(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("inspection records list stays summary-first and opens detail view", async ({ page }) => {
  await loadDemoAsStaff(page);

  await page.getByRole("button", { name: /^Inspection$/ }).click();

  await expect(page.getByText("Inspection Records")).toBeVisible();
  await expect(page.getByTestId("inspection-detail-panel")).toBeVisible();
  await expect(page.getByText(/Inspection Form/i)).toBeVisible();
  await expect(page.getByText(/Auto Recommendations/i)).toBeVisible();

  const listItems = page.locator('[data-testid^="inspection-list-item-"]');
  await expect(listItems.first()).toBeVisible();

  if ((await listItems.count()) > 1) {
    await listItems.nth(1).locator('button:has-text("Open Inspection")').click();
    await expect(page.getByTestId("inspection-detail-panel")).toBeVisible();
  }
});

test("customer portal inspection still renders", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Demo Customer Portal" }).click();
  await page.getByRole("button", { name: "Inspection Report" }).click();
  await expect(page.getByText(/Condition Legend/i)).toBeVisible();
  await expect(page.getByText("Customer Portal", { exact: true })).toBeVisible();
});
