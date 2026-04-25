import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username = "admin", password = "admin123") {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("customer visit breakdown, CLV, campaigns, efficiency, and alerts render", async ({ page }) => {
  await loadDemoAs(page);

  await expect(page.getByTestId("customer-visit-breakdown-panel")).toBeVisible();
  await expect(page.getByTestId("customer-visit-count-Return-Customer-Existing-Vehicle")).toBeVisible();
  await expect(page.getByTestId("customer-visit-count-New-Customer-New-Vehicle")).toBeVisible();
  await expect(page.getByTestId("customer-visit-count-Fleet-Company-Customer")).toBeVisible();
  await expect(page.getByTestId("customer-lifetime-value-panel")).toBeVisible();

  await expect(page.getByTestId("follow-up-campaign-center")).toBeVisible();
  await expect(page.locator('[data-testid^="campaign-item-"]').first()).toBeVisible();
  await expect(page.locator('[data-testid^="campaign-draft-action-"]').first()).toBeVisible();

  await expect(page.getByTestId("technician-efficiency-panel")).toBeVisible();
  await expect(page.locator('[data-testid^="technician-efficiency-row-"]').first()).toBeVisible();

  await expect(page.getByTestId("management-alerts-panel")).toBeVisible();
  await expect(page.getByTestId("management-alerts-open-ros")).toBeVisible();
});

test("customer analytics date filter and role restriction behave safely", async ({ page }) => {
  await loadDemoAs(page, "office", "office123");

  await expect(page.getByTestId("customer-visit-breakdown-panel")).toBeVisible();
  await expect(page.getByTestId("clv-restricted")).toBeVisible();
  await page.getByTestId("customer-visit-date-from").fill("2099-01-01");
  await expect(page.getByTestId("customer-visit-count-New-Customer-New-Vehicle")).toContainText("0");
});

test("management alert navigation opens repair orders", async ({ page }) => {
  await loadDemoAs(page);

  await page.getByTestId("management-alerts-open-ros").click();
  await expect(page.getByRole("banner").getByText("Repair Orders")).toBeVisible();
});
