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

  await page.getByRole("button", { name: /Inspection/ }).first().click();

  await expect(page.getByText("Inspection Records", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Inspection Form/i)).toBeVisible();

  const listItems = page.locator('[data-testid^="inspection-list-item-"]');
  await expect(listItems.first()).toBeVisible();

  await listItems.first().locator("button").first().click();
  await expect(page.getByTestId("inspection-detail-panel")).toBeVisible();
  await expect(page.getByText("Auto Recommendations", { exact: true })).toBeVisible();
});

test("customer portal inspection still renders", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Demo Customer Portal" }).click();
  await page.getByRole("button", { name: "Inspection Report" }).click();
  await expect(page.getByText(/Condition Legend/i)).toBeVisible();
  await expect(page.getByText("Customer Portal", { exact: true })).toBeVisible();
});
