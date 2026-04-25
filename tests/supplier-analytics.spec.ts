import { expect, test, type Page } from "@playwright/test";

async function openSupplierAnalytics(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.getByRole("button", { name: "PT Parts" }).click();
}

test.describe("supplier analytics", () => {
  test.beforeEach(async ({ page }) => {
    await openSupplierAnalytics(page);
  });

  test("renders KPI widgets and core analytics sections", async ({ page }) => {
    await expect(page.getByTestId("parts-supplier-kpis")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-kpi-bids")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-kpi-awarded")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-kpi-suppliers")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-kpi-delivery")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-kpi-ontime")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-kpi-conversion")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-leaderboard")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-delivery")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-cost-trends")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-category-breakdown")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-preferred-suggestions")).toBeVisible();
    await expect(page.getByTestId("parts-supplier-detail")).toBeVisible();
  });

  test("leaderboard renders multiple suppliers and filters down cleanly", async ({ page }) => {
    const leaderRows = page.locator('[data-testid^="supplier-analytics-leader-"]');
    await expect(leaderRows).toHaveCount(4);

    await page.getByTestId("parts-supplier-filter-supplier").selectOption({ label: "Metro Auto Supply" });
    await expect(leaderRows).toHaveCount(1);
    await expect(page.getByText("Metro Auto Supply")).toBeVisible();
  });

  test("detail view renders a selected supplier and preferred suggestions are visible", async ({ page }) => {
    await page.getByTestId("parts-supplier-detail-select").selectOption({ label: "AC Pro Parts" });
    await expect(page.getByTestId("supplier-analytics-detail-view")).toContainText("AC Pro Parts");
    await expect(page.getByText(/Best Price Performer/i)).toBeVisible();
    await expect(page.getByText(/Best Delivery Performer/i)).toBeVisible();
  });

  test("delivery reliability and cost trend sections remain populated", async ({ page }) => {
    await expect(page.getByTestId("parts-supplier-delivery")).toContainText("Arrived");
    await expect(page.getByTestId("parts-supplier-cost-trends")).toContainText("By Supplier");
    await expect(page.getByTestId("parts-supplier-cost-trends")).toContainText("By Category");
    await expect(page.getByTestId("parts-supplier-cost-trends")).toContainText("By Brand");
    await expect(page.getByTestId("parts-supplier-cost-trends")).toContainText("By Period");
  });
});
