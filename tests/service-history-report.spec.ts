import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

async function loadDemoAndOpenHistory(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.getByRole("button", { name: /History$/ }).click();
}

async function finalizeDemoROInStorage(page: Page) {
  await page.evaluate(() => {
    const ordersKey = "dvi_phase4_repair_orders_v1";
    const historyKey = "dvi_vehicle_service_history_records_v1";
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    const now = new Date().toISOString();
    const target = repairOrders.find((row: { plateNumber?: string; status?: string }) => row.plateNumber === "NEX-2451" && row.status === "In Progress");
    if (!target) throw new Error("Unable to find demo RO for report setup.");
    target.status = "Ready Release";
    target.updatedAt = now;
    target.workLines = (target.workLines || []).map((line: { title?: string; status?: string; completedAt?: string; approvalDecision?: string; approvalAt?: string }) => {
      if (line.title !== "Replace front shock absorbers" && line.title !== "Wheel alignment") return line;
      return {
        ...line,
        status: "Completed",
        completedAt: line.completedAt || now,
        approvalDecision: "Approved",
        approvalAt: line.approvalAt || now,
      };
    });
    localStorage.setItem(ordersKey, JSON.stringify(repairOrders));
    localStorage.removeItem(historyKey);
  });
  await page.reload();
}

async function openReport(page: Page) {
  const reportPanel = page.getByTestId("service-history-report-panel");
  await expect(reportPanel).toBeVisible();
  return reportPanel;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function isoDateDaysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

test("service history report filters by vehicle, category, and RO number", async ({ page }) => {
  await loadDemoAndOpenHistory(page);
  await finalizeDemoROInStorage(page);
  const reportPanel = await openReport(page);
  const rows = reportPanel.locator('[data-testid^="service-history-report-row-"]');

  await reportPanel.getByTestId("service-history-report-filter-vehicle").selectOption({ label: "ABJ-9087 | Prime Movers Logistics" });
  await expect(rows).toHaveCount(await rows.count());
  const vehicleCount = await rows.count();
  expect(vehicleCount).toBeGreaterThan(0);
  await expect(reportPanel.getByTestId("service-history-report-stat-entries")).toHaveText(String(vehicleCount));

  await reportPanel.getByTestId("service-history-report-filter-vehicle").selectOption({ label: "NEX-2451 | Miguel Santos" });
  const nexCount = await rows.count();
  expect(nexCount).toBeGreaterThan(0);
  await expect(reportPanel.getByTestId("service-history-report-stat-entries")).toHaveText(String(nexCount));

  await reportPanel.getByTestId("service-history-report-filter-category").selectOption("Alignment");
  const categoryCount = await rows.count();
  expect(categoryCount).toBeGreaterThan(0);
  expect(categoryCount).toBeLessThanOrEqual(nexCount);
  await expect(reportPanel.getByTestId("service-history-report-stat-entries")).toHaveText(String(categoryCount));

  const firstRowText = await rows.first().textContent();
  const roNumber = firstRowText?.match(/RO\s+([^\s|]+)/i)?.[1] ?? "";
  expect(roNumber).toBeTruthy();

  await reportPanel.getByTestId("service-history-report-filter-ro").fill(roNumber);
  const roCount = await rows.count();
  expect(roCount).toBeGreaterThan(0);
  await expect(reportPanel.getByTestId("service-history-report-stat-entries")).toHaveText(String(roCount));
  await expect(reportPanel.getByTestId("service-history-report-stat-visits")).toHaveText("1");
});

test("service history report date range filters and print preview render the filtered report", async ({ page }) => {
  await loadDemoAndOpenHistory(page);
  await finalizeDemoROInStorage(page);
  const reportPanel = await openReport(page);
  const rows = reportPanel.locator('[data-testid^="service-history-report-row-"]');

  const baselineCount = await rows.count();
  expect(baselineCount).toBeGreaterThan(0);

  await reportPanel.getByTestId("service-history-report-filter-date-from").fill(isoDateDaysFromNow(-3));
  await reportPanel.getByTestId("service-history-report-filter-date-to").fill(todayIsoDate());
  const withinRangeCount = await rows.count();
  expect(withinRangeCount).toBeGreaterThan(0);
  expect(withinRangeCount).toBeLessThanOrEqual(baselineCount);
  await expect(reportPanel.getByTestId("service-history-report-stat-entries")).toHaveText(String(withinRangeCount));

  await reportPanel.getByTestId("service-history-report-print-preview").click();
  const printView = reportPanel.getByTestId("service-history-report-print-view");
  await expect(printView).toBeVisible();
  await expect(printView.locator('[data-testid^="service-history-report-row-"]')).toHaveCount(withinRangeCount);
  await expect(printView).toContainText("Print-Friendly Preview");

  await reportPanel.getByTestId("service-history-report-filter-date-from").fill(isoDateDaysFromNow(2));
  await reportPanel.getByTestId("service-history-report-filter-date-to").fill(isoDateDaysFromNow(3));
  await expect(rows).toHaveCount(0);
  await expect(reportPanel.getByTestId("service-history-report-stat-entries")).toHaveText("0");
});

test("service history report exports CSV for filtered results", async ({ page }, testInfo: TestInfo) => {
  await loadDemoAndOpenHistory(page);
  await finalizeDemoROInStorage(page);
  const reportPanel = await openReport(page);

  await reportPanel.getByTestId("service-history-report-filter-vehicle").selectOption({ label: "NEX-2451 | Miguel Santos" });
  await reportPanel.getByTestId("service-history-report-filter-category").selectOption("Alignment");

  const downloadPromise = page.waitForEvent("download");
  await reportPanel.getByTestId("service-history-report-export-csv").click();
  const download = await downloadPromise;

  const downloadPath = path.join(testInfo.outputDir, download.suggestedFilename());
  await download.saveAs(downloadPath);
  const csv = fs.readFileSync(downloadPath, "utf-8");

  expect(csv).toContain("Completed At,RO Number,Plate Number,Customer,Vehicle,Service Key,Title,Category,Odometer,Source,History Origin");
  expect(csv).toContain("Alignment");
  expect(csv).toContain("NEX-2451");
});
