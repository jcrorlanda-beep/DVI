import { expect, test, type Page } from "@playwright/test";

async function loadDemoAndOpenRepairOrders(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.getByRole("button", { name: "RO Repair Orders" }).click();
}

async function openRepairOrderAndReadNumber(page: Page, plateText: string, statusText?: string) {
  let row = page.locator("button").filter({ hasText: plateText });
  if (statusText) {
    row = row.filter({ hasText: statusText });
  }
  const button = row.first();
  await expect(button).toBeVisible();
  const text = await button.textContent();
  const roNumber = text?.match(/RO\s*([^\s|]+)/i)?.[1] ?? "";
  await button.click();
  if (!roNumber) {
    throw new Error(`Unable to read RO number for ${plateText}`);
  }
  return roNumber;
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

async function completeDemoRO(page: Page) {
  const roNumber = await openRepairOrderAndReadNumber(page, "NEX-2451", "In Progress");
  await setWorkLineStatus(page, "Replace front shock absorbers", "Completed");
  await setWorkLineStatus(page, "Wheel alignment", "Completed");
  await page.evaluate(() => {
    const ordersKey = "dvi_phase4_repair_orders_v1";
    const historyKey = "dvi_vehicle_service_history_records_v1";
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    const now = new Date().toISOString();
    const target = repairOrders.find((row: { plateNumber?: string; status?: string }) => row.plateNumber === "NEX-2451" && row.status === "In Progress");
    if (!target) throw new Error("Unable to find demo RO for history viewer setup.");
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
  return roNumber;
}

async function openHistoryAndSelectVehicle(page: Page, plateText: string) {
  await page.getByRole("button", { name: /History$/ }).click();
  await page.getByPlaceholder(/plate, customer, company, phone, email, ro, concern/i).fill(plateText);
  await page.locator("button").filter({ hasText: plateText }).first().click();
}

test("vehicle history viewer is scoped to one vehicle and sorted newest first", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await completeDemoRO(page);

  await openHistoryAndSelectVehicle(page, "NEX-2451");
  const historyPanel = page.getByTestId("vehicle-service-history-panel");
  const entries = historyPanel.locator('[data-testid^="vehicle-service-history-entry-"]');
  const firstEntryText = await entries.nth(0).textContent();
  const historyRoNumber = firstEntryText?.match(/RO\s+([^\s|]+)/i)?.[1] ?? "";

  await expect(entries).toHaveCount(4);
  await expect(entries.nth(0)).toContainText("Wheel alignment");
  await expect(entries.nth(1)).toContainText("Replace front shock absorbers");

  await page.getByRole("button", { name: /History$/ }).click();
  await page.getByPlaceholder(/plate, customer, company, phone, email, ro, concern/i).fill("NEX-7788");
  await page.locator("button").filter({ hasText: "NEX-7788" }).first().click();
  await expect(entries).toHaveCount(0);
});

test("vehicle history viewer filters by category, RO number, and keyword", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await completeDemoRO(page);

  await openHistoryAndSelectVehicle(page, "NEX-2451");
  const historyPanel = page.getByTestId("vehicle-service-history-panel");
  const entries = historyPanel.locator('[data-testid^="vehicle-service-history-entry-"]');
  const firstEntryText = await entries.nth(0).textContent();
  const historyRoNumber = firstEntryText?.match(/RO\s+([^\s|]+)/i)?.[1] ?? "";

  await expect(entries).toHaveCount(4);

  await historyPanel.getByTestId("vehicle-service-history-filter-category").selectOption("Alignment");
  await expect(entries).toHaveCount(2);
  await expect(entries.nth(0)).toContainText("Alignment");
  await expect(entries.nth(1)).toContainText("Alignment");

  await historyPanel.getByTestId("vehicle-service-history-filter-category").selectOption("All Categories");
  await historyPanel.getByTestId("vehicle-service-history-filter-ro").fill(historyRoNumber);
  await expect(entries).toHaveCount(2);

  await historyPanel.getByTestId("vehicle-service-history-filter-ro").fill("");
  await historyPanel.getByTestId("vehicle-service-history-filter-keyword").fill("shock absorbers");
  await expect(entries).toHaveCount(1);
  await expect(entries.first()).toContainText("shock absorbers");
});
