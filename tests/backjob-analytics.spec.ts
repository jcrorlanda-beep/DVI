import { expect, test, type Page } from "@playwright/test";

async function loadDemoAndOpenBackjobs(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.getByRole("button", { name: "BJ Backjobs" }).click();
}

async function seedBackjobAnalyticsReturnRo(page: Page) {
  await page.evaluate(() => {
    const ordersKey = "dvi_phase4_repair_orders_v1";
    const backjobsKey = "dvi_phase9_backjob_records_v1";
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    const backjobs = JSON.parse(localStorage.getItem(backjobsKey) || "[]");
    const targetBackjob = backjobs.find((row: { plateNumber?: string }) => row.plateNumber === "ABJ-9087");
    if (!targetBackjob) throw new Error("Unable to find the ABJ-9087 backjob seed.");
    const originalRo = repairOrders.find((row: { id?: string }) => row.id === targetBackjob.linkedRoId);
    if (!originalRo) throw new Error("Unable to find the original repair order seed.");

    const now = new Date().toISOString();
    const returnRo = {
      id: "backjob-analytics-return-ro",
      roNumber: "RO-ANALYTICS-001",
      createdAt: now,
      updatedAt: now,
      workStartedAt: now,
      sourceType: "Manual",
      intakeId: "",
      inspectionId: "",
      intakeNumber: "",
      inspectionNumber: "",
      customerName: originalRo.customerName,
      companyName: originalRo.companyName,
      accountType: originalRo.accountType,
      accountLabel: originalRo.accountLabel,
      phone: originalRo.phone,
      email: originalRo.email,
      plateNumber: originalRo.plateNumber,
      conductionNumber: originalRo.conductionNumber,
      make: originalRo.make,
      model: originalRo.model,
      year: originalRo.year,
      color: originalRo.color,
      odometerKm: String(Number(originalRo.odometerKm || "0") + 120),
      customerConcern: "Return / recheck visit",
      advisorName: originalRo.advisorName,
      status: "Closed",
      primaryTechnicianId: originalRo.primaryTechnicianId,
      supportTechnicianIds: originalRo.supportTechnicianIds || [],
      workLines: [],
      latestApprovalRecordId: "",
      deferredLineTitles: [],
      backjobReferenceRoId: targetBackjob.id,
      findingRecommendationDecisions: [],
      encodedBy: "Automated Test",
    };

    repairOrders.push(returnRo);
    localStorage.setItem(ordersKey, JSON.stringify(repairOrders));
  });

  await page.reload();
}

test("backjob analytics renders KPI cards, case list, and linked original / return RO details", async ({ page }) => {
  await loadDemoAndOpenBackjobs(page);
  await seedBackjobAnalyticsReturnRo(page);
  await page.getByRole("button", { name: "BJ Backjobs" }).click();

  const panel = page.getByTestId("backjob-analytics-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-kpis")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-kpi-total")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-kpi-rate")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-kpi-repeat")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-case-list")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-technician-summary")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-root-cause")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-cost-breakdown")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-repeat-vehicles")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-recent-rework")).toBeVisible();
  await expect(panel.getByTestId("backjob-analytics-case-list")).toContainText("Original RO");
  await expect(panel.getByTestId("backjob-analytics-case-list")).toContainText("Return RO");
  await expect(panel.getByTestId("backjob-analytics-repeat-vehicles")).toContainText("ABJ-9087");
});

test("backjob analytics filters affect the result set", async ({ page }) => {
  await loadDemoAndOpenBackjobs(page);
  await seedBackjobAnalyticsReturnRo(page);
  await page.getByRole("button", { name: "BJ Backjobs" }).click();

  const panel = page.getByTestId("backjob-analytics-panel");
  await expect(panel).toBeVisible();

  await panel.getByTestId("backjob-analytics-filter-vehicle").fill("ABJ-9087");
  await expect(panel.locator('[data-testid^="backjob-analytics-case-"]')).toHaveCount(1);
  await expect(panel.locator('[data-testid^="backjob-analytics-case-"]').first()).toContainText("Goodwill");

  await panel.getByTestId("backjob-analytics-filter-vehicle").fill("");
  await panel.getByTestId("backjob-analytics-filter-root-cause").selectOption("Parts Failure");
  await expect(panel.locator('[data-testid^="backjob-analytics-case-"]')).toHaveCount(1);
  await expect(panel.locator('[data-testid^="backjob-analytics-case-"]').first()).toContainText("Warranty");
});
