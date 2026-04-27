import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username = "admin", password = "admin123") {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function openSettings(page: Page) {
  await page.getByTestId("nav-settings").click();
}

test("revenue, margin, and owner dashboard render with populated values", async ({ page }) => {
  await loadDemoAs(page);

  await expect(page.getByTestId("revenue-dashboard-panel")).toBeVisible();
  await expect(page.getByTestId("revenue-total")).toContainText(/PHP|₱/);
  await expect(page.getByTestId("revenue-by-category")).toBeVisible();
  await expect(page.getByTestId("margin-dashboard-panel")).toBeVisible();
  await expect(page.getByTestId("margin-supplier-breakdown")).toBeVisible();
  await expect(page.getByTestId("owner-executive-dashboard")).toBeVisible();
  await expect(page.getByTestId("owner-dashboard-top-services")).toBeVisible();
});

test("revenue date filter works and pricing fallback indicator remains visible", async ({ page }) => {
  await loadDemoAs(page);

  await page.getByTestId("revenue-date-from").fill("2099-01-01");
  await expect(page.getByTestId("revenue-total")).toContainText(/0\.00/);
  await expect(page.getByTestId("revenue-fallback-count")).toBeVisible();
});

test("pricing catalog supports create, edit, disable, and suggested prices", async ({ page }) => {
  await loadDemoAs(page);
  await openSettings(page);

  await expect(page.getByTestId("service-pricing-catalog-panel")).toBeVisible();
  await page.getByTestId("service-pricing-new-serviceKey").fill("test-safety-check");
  await page.getByTestId("service-pricing-new-title").fill("Test safety inspection");
  await page.getByTestId("service-pricing-new-category").fill("Safety");
  await page.getByTestId("service-pricing-new-basePrice").fill("1234");
  await page.getByTestId("service-pricing-add").click();
  await expect(page.getByText("Test safety inspection")).toBeVisible();

  const row = page.locator('[data-testid^="service-pricing-row-price_"]').last();
  await row.locator('[data-testid^="service-pricing-basePrice-"]').fill("1500");
  await expect(row.locator('[data-testid^="service-pricing-basePrice-"]')).toHaveValue("1500");
  await row.locator('[data-testid^="service-pricing-active-"]').uncheck();
  await expect(row.locator('[data-testid^="service-pricing-active-"]')).not.toBeChecked();

  await page.getByRole("button", { name: /RO Repair Orders/i }).click();
  await expect(page.getByTestId("maintenance-suggestions-panel")).toContainText(/Suggested price/i);
});

test("margin and owner dashboards are restricted outside Admin role", async ({ page }) => {
  await loadDemoAs(page, "office", "office123");

  await expect(page.getByTestId("margin-restricted")).toBeVisible();
  await expect(page.getByTestId("owner-dashboard-restricted")).toBeVisible();
});

test("data quality panel loads and cleanup action is manual", async ({ page }) => {
  await loadDemoAs(page);
  await page.evaluate(() => localStorage.setItem("dvi_phase2_intake_records_v1", "{broken-json"));
  await page.reload();
  await openSettings(page);

  await expect(page.getByTestId("data-quality-panel")).toContainText(/Could not read saved data/i);
  await page.getByTestId("data-quality-cleanup").click();
  await expect(page.getByText(/Removed unreadable saved data|No invalid JSON records/i)).toBeVisible();
});
