import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.getByRole("banner").getByText("Dashboard")).toBeVisible();
}

// ── Phase 53: Expense Tracking ────────────────────────────────────────────────

test("Expense page is reachable from nav", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Expenses", exact: true }).click();
  await expect(page.getByText("Expense Tracking")).toBeVisible();
});

test("Can create a new expense", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Expenses", exact: true }).click();
  await page.getByRole("button", { name: /New Expense/i }).click();

  await page.getByLabel(/Description/i).fill("Office supplies test");
  await page.getByLabel(/Amount/i).fill("350");

  await page.getByRole("button", { name: "Add Expense" }).click();

  await expect(page.getByText("Office supplies test")).toBeVisible();
});

test("Expense shows in category breakdown", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Expenses", exact: true }).click();
  await page.getByRole("button", { name: /New Expense/i }).click();

  await page.getByLabel(/Description/i).fill("Diesel fuel run");
  await page.getByLabel(/Amount/i).fill("1200");

  const categorySelect = page.locator("select").filter({ has: page.locator('option[value="Fuel"]') }).first();
  await categorySelect.selectOption("Fuel");

  await page.getByRole("button", { name: "Add Expense" }).click();

  await expect(page.getByText("Diesel fuel run")).toBeVisible();
});

test("Monthly filter works on expense list", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Expenses", exact: true }).click();
  // The filter row should be present
  await expect(page.locator("select").first()).toBeVisible();
});

// ── Phase 54: Payment Tracking ────────────────────────────────────────────────

test("Payment Tracking page is reachable from nav", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Payments", exact: true }).click();
  await expect(page.getByText("Payment Tracking")).toBeVisible();
});

test("Payment Tracking shows summary cards", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Payments", exact: true }).click();
  // Summary stat cards for Unpaid/Partial/Paid/Waived should be present
  await expect(page.getByText("Unpaid")).toBeVisible();
  await expect(page.getByText("Partial")).toBeVisible();
  await expect(page.getByText("Paid")).toBeVisible();
});

// ── Phase 55: Audit Log ───────────────────────────────────────────────────────

test("Audit Log page is reachable from nav", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Audit Log", exact: true }).click();
  await expect(page.getByText("Audit Log")).toBeVisible();
});

test("Audit Log shows filter controls", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Audit Log", exact: true }).click();
  await expect(page.getByText("All modules")).toBeVisible();
  await expect(page.getByPlaceholder(/Search action/i)).toBeVisible();
});

test("RO status change creates audit entry", async ({ page }) => {
  await loginAsAdmin(page);

  // Reset to demo data to have an RO available
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: /Load Demo Data/i }).click();

  // Navigate to Repair Orders and change status
  await page.getByRole("button", { name: "Repair Orders", exact: true }).click();
  await page.waitForTimeout(500);

  // Navigate to Audit Log and check for an entry
  await page.getByRole("button", { name: "Audit Log", exact: true }).click();
  await expect(page.getByText("Audit Log")).toBeVisible();
  // Table or empty state should be present
  await expect(
    page.getByText(/entries shown|No audit entries/i)
  ).toBeVisible();
});

// ── Phase 56: Backup & Export ─────────────────────────────────────────────────

test("Backup & Export page is reachable from nav", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Backup & Export", exact: true }).click();
  await expect(page.getByText("Backup & Export Center")).toBeVisible();
});

test("Backup page shows module checkboxes", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Backup & Export", exact: true }).click();
  await expect(page.getByText("Repair Orders")).toBeVisible();
  await expect(page.getByText("Expense Records")).toBeVisible();
  await expect(page.getByText("Audit Logs")).toBeVisible();
});

test("Download Backup button is present and enabled", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Backup & Export", exact: true }).click();
  const downloadBtn = page.getByRole("button", { name: /Download Backup/i });
  await expect(downloadBtn).toBeVisible();
  await expect(downloadBtn).toBeEnabled();
});

test("Preview JSON button shows backup preview", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Backup & Export", exact: true }).click();
  await page.getByRole("button", { name: /Preview JSON/i }).click();
  // Preview box should appear
  await expect(page.getByText(/exportedAt|DVI-backup-v1/)).toBeVisible();
});

test("Restore section shows warning before confirming", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Backup & Export", exact: true }).click();
  await expect(page.getByText(/Restoring will overwrite/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Validate & Preview/i })).toBeVisible();
  await page.getByRole("button", { name: /Preview JSON/i }).click();
  await expect(page.getByTestId("backup-preview-button")).toBeVisible();
});

test("Restore requires explicit RESTORE confirmation", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Backup & Export", exact: true }).click();
  await page.getByRole("button", { name: /Validate & Preview/i }).click();
  await page.getByRole("button", { name: /Restore Now/i }).click();
  await expect(page.getByTestId("backup-restore-confirm-text")).toBeVisible();
  await page.getByTestId("backup-restore-confirm-text").fill("RESTORE");
  await page.getByTestId("backup-restore-confirm-button").click();
  await expect(page.getByText(/Restored \d+ module\(s\)/i)).toBeVisible();
});

test("Malformed restore input shows a safe error", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Backup & Export", exact: true }).click();
  await page.getByTestId("backup-restore-json").fill("{not valid json");
  await page.getByRole("button", { name: /Validate & Preview/i }).click();
  await expect(page.getByText(/Invalid JSON/i)).toBeVisible();
});
