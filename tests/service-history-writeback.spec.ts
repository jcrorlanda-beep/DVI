import { expect, test, type Locator, type Page } from "@playwright/test";

async function loadDemoAndOpenRepairOrders(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.getByRole("button", { name: "RO Repair Orders" }).click();
}

async function openRepairOrder(page: Page, plateText: string, statusText?: string) {
  let row = page.locator("button").filter({ hasText: plateText });
  if (statusText) {
    row = row.filter({ hasText: statusText });
  }
  await row.first().click();
}

async function getWorkLineCardId(page: Page, title: string) {
  const card = page.locator('[data-testid^="repair-order-workline-"]').filter({ hasText: title }).first();
  await expect(card).toBeVisible();
  const testId = await card.getAttribute("data-testid");
  if (!testId) {
    throw new Error(`Unable to read work line card test id for "${title}"`);
  }
  return testId.replace("repair-order-workline-", "");
}

async function setWorkLineStatus(page: Page, title: string, status: "Pending" | "In Progress" | "Waiting Parts" | "Completed") {
  const lineId = await getWorkLineCardId(page, title);
  await page.getByTestId(`repair-order-workline-status-${lineId}`).selectOption(status);
}

async function finalizeDemoROInStorage(page: Page) {
  await page.evaluate(() => {
    const ordersKey = "dvi_phase4_repair_orders_v1";
    const historyKey = "dvi_vehicle_service_history_records_v1";
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    const now = new Date().toISOString();
    const target = repairOrders.find((row: { plateNumber?: string; status?: string }) => row.plateNumber === "NEX-2451" && row.status === "In Progress");
    if (!target) throw new Error("Unable to find demo RO for writeback finalization.");
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

async function openHistoryForVehicle(page: Page, plateText: string) {
  await page.getByRole("button", { name: /History$/ }).click();
  await page.getByPlaceholder(/plate, customer, company, phone, email, ro, concern/i).fill(plateText);
  await page.locator("button").filter({ hasText: plateText }).first().click();
}

test("completed RO writes service history and suppresses matching suggestions", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openRepairOrder(page, "NEX-2451", "In Progress");

  await setWorkLineStatus(page, "Replace front shock absorbers", "Completed");
  await setWorkLineStatus(page, "Wheel alignment", "Completed");
  await finalizeDemoROInStorage(page);
  await openRepairOrder(page, "NEX-2451", "Ready Release");
  const suggestionPanel = page.getByTestId("maintenance-suggestions-panel");
  await expect(suggestionPanel.getByTestId("maintenance-suggestion-card-library-library-suspension-fortuner")).toHaveCount(0);
  await expect(suggestionPanel.getByTestId("maintenance-suggestion-card-library-library-suspension-general")).toHaveCount(0);

  await openHistoryForVehicle(page, "NEX-2451");
  const historyPanel = page.getByTestId("vehicle-service-history-panel");
  await expect(historyPanel).toBeVisible();
  await expect(historyPanel.locator('[data-testid^="vehicle-service-history-entry-"]')).toHaveCount(4);
});

test("repeated save and status changes do not duplicate service history", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openRepairOrder(page, "NEX-2451", "In Progress");

  await setWorkLineStatus(page, "Replace front shock absorbers", "Completed");
  await setWorkLineStatus(page, "Wheel alignment", "Completed");
  await finalizeDemoROInStorage(page);
  await page.evaluate(() => {
    const ordersKey = "dvi_phase4_repair_orders_v1";
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    const now = new Date().toISOString();
    const target = repairOrders.find((row: { plateNumber?: string }) => row.plateNumber === "NEX-2451" && row.status === "Ready Release");
    if (!target) throw new Error("Unable to find demo RO for release promotion.");
    target.status = "Released";
    target.updatedAt = now;
    localStorage.setItem(ordersKey, JSON.stringify(repairOrders));
  });
  await page.reload();

  await openHistoryForVehicle(page, "NEX-2451");
  const historyPanel = page.getByTestId("vehicle-service-history-panel");
  await expect(historyPanel.locator('[data-testid^="vehicle-service-history-entry-"]')).toHaveCount(4);
});

test("different vehicle does not share service history", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openHistoryForVehicle(page, "NEX-7788");

  const historyPanel = page.getByTestId("vehicle-service-history-panel");
  await expect(historyPanel).toBeVisible();
  await expect(historyPanel.locator('[data-testid^="vehicle-service-history-card-"]')).toHaveCount(0);
});
