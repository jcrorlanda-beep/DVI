import { expect, test, type Page } from "@playwright/test";

function buildTimelineSeedDates() {
  const now = new Date();

  const shiftMonths = (months: number) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    return date.toISOString();
  };

  return {
    nexOverdueCompletedAt: shiftMonths(14),
    nexDueSoonCompletedAt: shiftMonths(8),
    abjDueSoonCompletedAt: shiftMonths(6),
  };
}

async function loadDemoDashboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function seedMaintenanceHistory(page: Page, dates = buildTimelineSeedDates()) {
  await page.evaluate((seedDates) => {
    const ordersKey = "dvi_phase4_repair_orders_v1";
    const historyKey = "dvi_vehicle_service_history_records_v1";
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    const historyRecords = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const now = new Date().toISOString();

    repairOrders.forEach((row: { plateNumber?: string; odometerKm?: string; updatedAt?: string }) => {
      if (row.plateNumber === "NEX-2451") {
        row.odometerKm = "60000";
        row.updatedAt = now;
      }
      if (row.plateNumber === "ABJ-9087") {
        row.odometerKm = "8000";
        row.updatedAt = now;
      }
    });

    historyRecords.forEach((record: { plateNumber?: string; completedAt?: string; odometerAtCompletion?: string; serviceKey?: string; title?: string; category?: string; historyOrigin?: string; createdAt?: string; updatedAt?: string }) => {
      if (record.plateNumber === "NEX-2451") {
        record.completedAt = seedDates.nexOverdueCompletedAt;
        record.odometerAtCompletion = "52000";
        record.serviceKey = "pms-5000";
        record.title = "5,000 km periodic maintenance package";
        record.category = "Periodic Maintenance";
        record.historyOrigin = "Seeded / Demo";
        record.createdAt = seedDates.nexOverdueCompletedAt;
        record.updatedAt = now;
      }
      if (record.plateNumber === "ABJ-9087") {
        record.completedAt = seedDates.abjDueSoonCompletedAt;
        record.odometerAtCompletion = "0";
        record.serviceKey = "alignment-review";
        record.title = "Wheel alignment";
        record.category = "Alignment";
        record.historyOrigin = "Seeded / Demo";
        record.createdAt = seedDates.abjDueSoonCompletedAt;
        record.updatedAt = now;
      }
    });

    const nextHistoryById = new Map(historyRecords.map((record: { id: string }) => [record.id, record] as const));

    localStorage.setItem(ordersKey, JSON.stringify(repairOrders));
    localStorage.setItem(historyKey, JSON.stringify(Array.from(nextHistoryById.values())));
  }, dates);
  await page.reload();
}

test("follow-up queue renders available maintenance follow-up opportunities", async ({ page }) => {
  await loadDemoDashboard(page);
  await seedMaintenanceHistory(page);

  const panel = page.getByTestId("maintenance-follow-up-queue-panel");
  await expect(panel).toBeVisible();
  expect(await panel.locator('[data-testid^="maintenance-follow-up-item-"]').count()).toBeGreaterThan(0);
  await expect(panel).toContainText("recently serviced");
  await expect(panel).toContainText("no recent major service record");
  await expect(panel).toContainText("Pending");
});

test("follow-up preview, ready, skipped, and send actions update the queue", async ({ page }) => {
  await loadDemoDashboard(page);
  await seedMaintenanceHistory(page);

  const panel = page.getByTestId("maintenance-follow-up-queue-panel");
  const followUpRow = panel.locator('[data-testid^="maintenance-follow-up-item-"]').first();
  await expect(followUpRow).toBeVisible();

  await followUpRow.locator('[data-testid^="maintenance-follow-up-preview-"]').click();
  await expect(followUpRow).toContainText("Message preview");
  await expect(followUpRow).toContainText("Book your next visit here");

  await followUpRow.locator('[data-testid^="maintenance-follow-up-ready-"]').click();
  await expect(followUpRow.locator('[data-testid^="maintenance-follow-up-status-"]')).toContainText("Ready");

  await followUpRow.locator('[data-testid^="maintenance-follow-up-send-"]').click();
  await expect(followUpRow.locator('[data-testid^="maintenance-follow-up-status-"]')).toContainText("Sent");

  const logs = await page.evaluate(() => JSON.parse(localStorage.getItem("dvi_phase15b_sms_approval_logs_v1") || "[]"));
  expect(logs.some((row: { messageType?: string; status?: string }) => row.messageType === "follow-up" && row.status === "Sent")).toBeTruthy();

  const skippedRow = panel.locator('[data-testid^="maintenance-follow-up-item-"]').nth(1);
  await skippedRow.locator('[data-testid^="maintenance-follow-up-skip-"]').click();
  await expect(skippedRow.locator('[data-testid^="maintenance-follow-up-status-"]')).toContainText("Skipped");
});
