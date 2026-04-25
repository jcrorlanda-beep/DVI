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
    const backjobKey = "dvi_phase9_backjob_records_v1";
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    const historyRecords = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const backjobRecords = JSON.parse(localStorage.getItem(backjobKey) || "[]");
    const now = new Date().toISOString();

    const nex = repairOrders.find((row: { plateNumber?: string }) => row.plateNumber === "NEX-2451");
    const abj = repairOrders.find((row: { plateNumber?: string }) => row.plateNumber === "ABJ-9087");

    if (nex) {
      nex.odometerKm = "1500";
    }
    if (abj) {
      abj.odometerKm = "1200";
    }

    const seededRecords = [
      ...(nex
        ? [
            {
              id: "dashboard-seed-nex-overdue",
              vehicleKey: "NEX2451",
              plateNumber: "NEX-2451",
              roId: nex.id,
              roNumber: nex.roNumber,
              serviceKey: "pms-5000",
              title: "5,000 km periodic maintenance package",
              category: "Periodic Maintenance",
              completedAt: seedDates.nexOverdueCompletedAt,
              odometerAtCompletion: "52000",
              sourceWorkLineId: "dashboard-seed-nex-overdue",
              sourceType: "WorkLine",
              historyOrigin: "Seeded / Demo",
              createdAt: seedDates.nexOverdueCompletedAt,
              updatedAt: now,
            },
            {
              id: "dashboard-seed-nex-due-soon",
              vehicleKey: "NEX2451",
              plateNumber: "NEX-2451",
              roId: nex.id,
              roNumber: nex.roNumber,
              serviceKey: "pms-10000",
              title: "10,000 km air, cabin, brake, and underchassis inspection package",
              category: "Periodic Maintenance",
              completedAt: seedDates.nexDueSoonCompletedAt,
              odometerAtCompletion: "53200",
              sourceWorkLineId: "dashboard-seed-nex-due-soon",
              sourceType: "WorkLine",
              historyOrigin: "Seeded / Demo",
              createdAt: seedDates.nexDueSoonCompletedAt,
              updatedAt: now,
            },
          ]
        : []),
      ...(abj
        ? [
            {
              id: "dashboard-seed-abj-due-soon",
              vehicleKey: "ABJ9087",
              plateNumber: "ABJ-9087",
              roId: abj.id,
              roNumber: abj.roNumber,
              serviceKey: "alignment-review",
              title: "Wheel alignment",
              category: "Alignment",
              completedAt: seedDates.abjDueSoonCompletedAt,
              odometerAtCompletion: "0",
              sourceWorkLineId: "dashboard-seed-abj-due-soon",
              sourceType: "WorkLine",
              historyOrigin: "Seeded / Demo",
              createdAt: seedDates.abjDueSoonCompletedAt,
              updatedAt: now,
            },
          ]
        : []),
    ];

    const nextHistoryById = new Map(historyRecords.map((record: { id: string }) => [record.id, record] as const));
    seededRecords.forEach((record) => nextHistoryById.set(record.id, record));

    const seededBackjobs = [
      ...(nex
        ? [
            {
              id: "dashboard-seed-nex-backjob-a",
              backjobNumber: "BJ-2026-04-001",
              linkedRoId: nex.id,
              linkedRoNumber: nex.roNumber,
              createdAt: seedDates.nexOverdueCompletedAt,
              updatedAt: now,
              plateNumber: "NEX-2451",
              customerLabel: nex.accountLabel || nex.customerName || "Miguel Santos",
              originalInvoiceNumber: "",
              comebackInvoiceNumber: "",
              originalPrimaryTechnicianId: nex.primaryTechnicianId || "",
              comebackPrimaryTechnicianId: nex.primaryTechnicianId || "",
              supportingTechnicianIds: [],
              complaint: "Oil leak returned after previous repair",
              findings: "Repeat leak located on the same area",
              rootCause: "Oil leak repeat issue",
              responsibility: "Internal",
              actionTaken: "Inspected and cleaned area for recheck",
              resolutionNotes: "Monitor repeat leakage closely",
              status: "Open",
              createdBy: "System",
            },
            {
              id: "dashboard-seed-nex-backjob-b",
              backjobNumber: "BJ-2026-04-002",
              linkedRoId: nex.id,
              linkedRoNumber: nex.roNumber,
              createdAt: seedDates.nexOverdueCompletedAt,
              updatedAt: now,
              plateNumber: "NEX-2451",
              customerLabel: nex.accountLabel || nex.customerName || "Miguel Santos",
              originalInvoiceNumber: "",
              comebackInvoiceNumber: "",
              originalPrimaryTechnicianId: nex.primaryTechnicianId || "",
              comebackPrimaryTechnicianId: nex.primaryTechnicianId || "",
              supportingTechnicianIds: [],
              complaint: "Oil leak returned after previous repair",
              findings: "Repeat leak located on the same area",
              rootCause: "Oil leak repeat issue",
              responsibility: "Internal",
              actionTaken: "Reviewed for repeat repair pattern",
              resolutionNotes: "Monitor repeat leakage closely",
              status: "Monitoring",
              createdBy: "System",
            },
          ]
        : []),
    ];

    localStorage.setItem(ordersKey, JSON.stringify(repairOrders));
    localStorage.setItem(historyKey, JSON.stringify(Array.from(nextHistoryById.values())));
    localStorage.setItem(backjobKey, JSON.stringify([...backjobRecords, ...seededBackjobs]));
  }, dates);
  await page.reload();
}

test("maintenance dashboard renders KPI cards and category breakdown", async ({ page }) => {
  await loadDemoDashboard(page);
  await seedMaintenanceHistory(page);

  const panel = page.getByTestId("maintenance-dashboard-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("maintenance-dashboard-kpis")).toBeVisible();
  await expect(panel.getByTestId("maintenance-dashboard-kpi-due-now")).toContainText(/\d+/);
  await expect(panel.getByTestId("maintenance-dashboard-kpi-overdue")).toContainText(/\d+/);
  await expect(panel.getByTestId("maintenance-dashboard-kpi-due-soon")).toContainText(/\d+/);
  await expect(panel.getByTestId("maintenance-dashboard-category-breakdown")).toBeVisible();
});

test("maintenance dashboard priority actions render urgent items first and queue expected vehicles", async ({ page }) => {
  await loadDemoDashboard(page);
  await seedMaintenanceHistory(page);

  const panel = page.getByTestId("maintenance-dashboard-panel");
  const priorityItems = panel.locator('[data-testid^="maintenance-dashboard-priority-item-"]');
  await expect(priorityItems.first()).toContainText("Overdue");
  await expect(priorityItems.first()).toContainText("5,000 km periodic maintenance package");

  const followUpQueue = panel.getByTestId("maintenance-dashboard-follow-up-queue");
  await expect(followUpQueue).toContainText("Miguel Santos");
  await expect(followUpQueue).toContainText(/Contact customer|Call today|Send reminder/);

  await expect(panel.getByTestId("maintenance-dashboard-recent-completed")).toContainText("Wheel alignment");
});

test("maintenance dashboard smart signals show safety, monitor, and repeat issue flags", async ({ page }) => {
  await loadDemoDashboard(page);
  await seedMaintenanceHistory(page);

  const panel = page.getByTestId("maintenance-dashboard-panel");
  const smartSignals = panel.getByTestId("maintenance-dashboard-smart-signals");
  await expect(smartSignals).toBeVisible();
  await expect(smartSignals.getByTestId("smart-signal-tag-Safety").first()).toBeVisible();
  await expect(smartSignals.getByTestId("smart-signal-tag-Monitor").first()).toBeVisible();
  await expect(smartSignals.getByTestId("smart-signal-repeat-flag-smart-signal:NEX2451")).toBeVisible();
  await expect(smartSignals.getByText(/manual review/i)).toBeVisible();
  await expect(smartSignals.getByRole("button", { name: /Open Timeline/i }).first()).toBeVisible();
});

test("maintenance dashboard history link opens the history module", async ({ page }) => {
  await loadDemoDashboard(page);
  await seedMaintenanceHistory(page);

  await page.getByTestId("maintenance-dashboard-open-history").click();
  await expect(page.getByText("History Lookup Center", { exact: true })).toBeVisible();
});
