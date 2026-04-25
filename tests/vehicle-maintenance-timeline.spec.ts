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
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    const now = new Date().toISOString();
    const target = repairOrders.find((row: { plateNumber?: string; status?: string }) => row.plateNumber === "NEX-2451" && row.status === "In Progress");
    if (!target) throw new Error("Unable to find demo RO for timeline setup.");
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
  });
  await page.reload();
}

async function seedTimelineHistory(page: Page, dates = buildTimelineSeedDates()) {
  await page.evaluate((seedDates) => {
    const ordersKey = "dvi_phase4_repair_orders_v1";
    const historyKey = "dvi_vehicle_service_history_records_v1";
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    const historyRecords = JSON.parse(localStorage.getItem(historyKey) || "[]");
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
              id: "timeline-seed-nex-overdue",
              vehicleKey: "NEX2451",
              plateNumber: "NEX-2451",
              roId: nex.id,
              roNumber: nex.roNumber,
              serviceKey: "pms-5000",
              title: "5,000 km periodic maintenance package",
              category: "Periodic Maintenance",
              completedAt: seedDates.nexOverdueCompletedAt,
              odometerAtCompletion: "52000",
              sourceWorkLineId: "timeline-seed-nex-overdue",
              sourceType: "WorkLine",
              historyOrigin: "Seeded / Demo",
              createdAt: seedDates.nexOverdueCompletedAt,
              updatedAt: now,
            },
            {
              id: "timeline-seed-nex-due-soon",
              vehicleKey: "NEX2451",
              plateNumber: "NEX-2451",
              roId: nex.id,
              roNumber: nex.roNumber,
              serviceKey: "pms-10000",
              title: "10,000 km air, cabin, brake, and underchassis inspection package",
              category: "Periodic Maintenance",
              completedAt: seedDates.nexDueSoonCompletedAt,
              odometerAtCompletion: "53200",
              sourceWorkLineId: "timeline-seed-nex-due-soon",
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
              id: "timeline-seed-abj-due-soon",
              vehicleKey: "ABJ9087",
              plateNumber: "ABJ-9087",
              roId: abj.id,
              roNumber: abj.roNumber,
              serviceKey: "alignment-review",
              title: "Wheel alignment",
              category: "Alignment",
              completedAt: seedDates.abjDueSoonCompletedAt,
              odometerAtCompletion: "0",
              sourceWorkLineId: "timeline-seed-abj-due-soon",
              sourceType: "WorkLine",
              historyOrigin: "Seeded / Demo",
              createdAt: seedDates.abjDueSoonCompletedAt,
              updatedAt: now,
            },
          ]
        : []),
    ];

    const nextHistoryById = new Map(historyRecords.map((record: { id: string }) => [record.id, record] as const));
    seededRecords.forEach((record) => {
      nextHistoryById.set(record.id, record);
    });

    localStorage.setItem(ordersKey, JSON.stringify(repairOrders));
    localStorage.setItem(historyKey, JSON.stringify(Array.from(nextHistoryById.values())));
  }, dates);
  await page.reload();
}

async function openVehicle(page: Page, plateText: string) {
  await page.getByPlaceholder(/plate, customer, company, phone, email, ro, concern/i).fill(plateText);
  await page.locator("button").filter({ hasText: plateText }).first().click();
}

test("maintenance timeline renders an AutoLeap-style feed and sidebar", async ({ page }) => {
  await loadDemoAndOpenHistory(page);
  await seedTimelineHistory(page);

  await openVehicle(page, "NEX-2451");
  const timelinePanel = page.getByTestId("vehicle-maintenance-timeline-panel");
  await expect(timelinePanel).toBeVisible();
  await expect(timelinePanel.getByTestId("maintenance-timeline-header")).toBeVisible();
  await expect(timelinePanel.getByTestId("maintenance-timeline-toolbar")).toBeVisible();
  await expect(timelinePanel.getByTestId("maintenance-timeline-sidebar")).toBeVisible();
  await expect(timelinePanel.getByTestId("vehicle-maintenance-timeline-search")).toBeVisible();
  await expect(timelinePanel.getByTestId("vehicle-maintenance-timeline-sort")).toBeVisible();
  await expect(timelinePanel.getByText("Due Summary", { exact: true }).first()).toBeVisible();
  await expect(timelinePanel.getByText("Latest Completed", { exact: true }).first()).toBeVisible();
  await expect(timelinePanel.getByText("Maintenance Insight", { exact: true }).first()).toBeVisible();

  const upcomingHeader = timelinePanel.getByText("Upcoming Maintenance").first();
  const completedHeader = timelinePanel.getByText("Completed Service History").first();
  const timelineText = await timelinePanel.evaluate((node) => node.textContent || "");

  await expect(upcomingHeader).toBeVisible();
  await expect(completedHeader).toBeVisible();
  expect(timelineText.indexOf("Upcoming Maintenance")).toBeLessThan(timelineText.indexOf("Completed Service History"));
  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-upcoming-"]').first()).toContainText("5,000 km periodic maintenance package");
  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-upcoming-"]').nth(1)).toContainText("10,000 km air, cabin, brake, and underchassis inspection package");
});

test("maintenance timeline filters by search, category, status chips, and sort", async ({ page }) => {
  await loadDemoAndOpenHistory(page);
  await seedTimelineHistory(page);

  await openVehicle(page, "NEX-2451");
  const timelinePanel = page.getByTestId("vehicle-maintenance-timeline-panel");
  await expect(timelinePanel).toBeVisible();

  await timelinePanel.getByTestId("vehicle-maintenance-timeline-sort").selectOption("Newest Activity");
  const upcomingRows = timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-upcoming-"]');
  await expect(upcomingRows.first()).toContainText("10,000 km air, cabin, brake, and underchassis inspection package");

  const roNumber = "RO-20260423-001";

  await timelinePanel.getByTestId("vehicle-maintenance-timeline-search").fill(roNumber);
  await timelinePanel.getByTestId("vehicle-maintenance-timeline-filter-category").selectOption("Periodic Maintenance");
  await timelinePanel.getByTestId("vehicle-maintenance-timeline-chip-overdue").click();

  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-completed-"]')).toHaveCount(0);
  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-upcoming-"]')).toHaveCount(1);
  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-upcoming-"]').first()).toContainText("5,000 km periodic maintenance package");
  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-upcoming-"]').first()).toContainText("Overdue");
});

test("maintenance timeline shows different content for a different vehicle", async ({ page }) => {
  await loadDemoAndOpenHistory(page);
  await seedTimelineHistory(page);

  await openVehicle(page, "ABJ-9087");
  const timelinePanel = page.getByTestId("vehicle-maintenance-timeline-panel");
  await expect(timelinePanel).toBeVisible();

  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-completed-"]').filter({ hasText: "Wheel alignment" }).first()).toContainText("Wheel alignment");
  await expect(timelinePanel).not.toContainText("5,000 km periodic maintenance package");
});

test("maintenance timeline remains consistent after completed RO writeback", async ({ page }) => {
  await loadDemoAndOpenHistory(page);
  await seedTimelineHistory(page);
  await finalizeDemoROInStorage(page);

  await openVehicle(page, "NEX-2451");
  const timelinePanel = page.getByTestId("vehicle-maintenance-timeline-panel");
  await expect(timelinePanel).toBeVisible();

  expect(await timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-completed-"]').count()).toBeGreaterThan(2);
  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-completed-"]').filter({ hasText: "Replace front shock absorbers" }).first()).toContainText("Replace front shock absorbers");
  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-upcoming-"]').filter({ hasText: "Overdue" }).first()).toContainText("Overdue");
  await expect(timelinePanel.locator('[data-testid^="vehicle-maintenance-timeline-upcoming-"]').filter({ hasText: "Due Soon" }).first()).toContainText("Due Soon");
});
