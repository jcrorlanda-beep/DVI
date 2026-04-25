import { expect, test, type Page } from "@playwright/test";

async function loadDemoDashboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function zeroOutProductionValues(page: Page) {
  await page.evaluate(() => {
    const key = "dvi_phase4_repair_orders_v1";
    const repairOrders = JSON.parse(localStorage.getItem(key) || "[]");

    repairOrders.forEach((ro: { workLines?: Array<{ serviceEstimate?: string; partsEstimate?: string; totalEstimate?: string; laborHours?: string; laborRate?: string; partsCost?: string; partsMarkupPercent?: string }> }) => {
      (ro.workLines || []).forEach((line) => {
        line.serviceEstimate = "0";
        line.partsEstimate = "0";
        line.totalEstimate = "0";
        line.laborHours = "0";
        line.laborRate = "0";
        line.partsCost = "0";
        line.partsMarkupPercent = "0";
      });
    });

    localStorage.setItem(key, JSON.stringify(repairOrders));
  });
  await page.reload();
}

test("technician performance dashboard renders KPI widgets, leaderboard, and detail", async ({ page }) => {
  await loadDemoDashboard(page);

  const panel = page.getByTestId("technician-performance-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("technician-performance-kpis")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-kpi-completed-jobs")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-kpi-completed-services")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-kpi-active-technicians")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-kpi-production-value")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-kpi-completion-rate")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-kpi-monthly")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-leaderboard")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-category-breakdown")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-detail")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-production-mode")).toContainText("Value-backed production");
  await expect(panel.getByTestId("technician-performance-kpi-production-value")).toContainText(/₱/);
});

test("technician performance filters update the selected technician and can reduce results", async ({ page }) => {
  await loadDemoDashboard(page);

  const panel = page.getByTestId("technician-performance-panel");
  const firstRow = panel.locator('[data-testid^="technician-performance-leaderboard-row-"]').first();
  const firstName = (await firstRow.locator("strong").textContent()) ?? "";

  await firstRow.click();
  await expect(panel.getByTestId("technician-performance-detail")).toContainText(firstName);

  await panel.getByTestId("technician-performance-category-select").selectOption({ index: 1 });
  await panel.getByTestId("technician-performance-date-from").fill("2099-01-01");
  await expect(panel.getByText("No technician activity matches the current filters.")).toBeVisible();
  await expect(panel.getByTestId("technician-performance-category-breakdown")).toContainText("No category mix data is available for the current filters.");
});

test("technician performance falls back to counts-only mode when production values are missing", async ({ page }) => {
  await loadDemoDashboard(page);
  await zeroOutProductionValues(page);

  const panel = page.getByTestId("technician-performance-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("technician-performance-production-mode")).toContainText("Counts only fallback");
  await expect(panel.getByTestId("technician-performance-kpi-production-value")).toContainText("Counts only");
  await expect(panel.getByTestId("technician-performance-leaderboard")).toBeVisible();
});
