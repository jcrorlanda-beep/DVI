import { expect, test, type Page } from "@playwright/test";

async function loadDemoDashboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function seedBackjobRecord(page: Page) {
  await page.evaluate(() => {
    const key = "dvi_phase9_backjob_records_v1";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const seeded = {
      id: "declutter-backjob-001",
      backjobNumber: "BJ-DECLUTTER-001",
      linkedRoId: "declutter-ro-001",
      linkedRoNumber: "RO-DECLUTTER-001",
      createdAt: "2026-04-24T08:00:00.000Z",
      updatedAt: "2026-04-24T10:00:00.000Z",
      plateNumber: "DCL-1001",
      customerLabel: "Declutter Demo Customer",
      originalInvoiceNumber: "INV-DECLUTTER-001",
      comebackInvoiceNumber: "",
      originalPrimaryTechnicianId: "",
      comebackPrimaryTechnicianId: "",
      supportingTechnicianIds: [],
      complaint: "Vehicle returned with the same noise concern.",
      findings: "Noise traced to a loose mount.",
      rootCause: "Installation oversight",
      responsibility: "Internal",
      actionTaken: "Retightened and verified the mount.",
      resolutionNotes: "Monitor on next visit.",
      status: "Open",
      createdBy: "admin",
    };
    localStorage.setItem(key, JSON.stringify([seeded, ...existing]));
  });
}

test("backjob list renders and selecting a record opens the detail panel", async ({ page }) => {
  await loadDemoDashboard(page);
  await seedBackjobRecord(page);
  await page.getByRole("button", { name: "BJ Backjobs" }).click();

  await expect(page.getByTestId("backjob-analytics-panel")).toBeVisible();
  await expect(page.locator('[data-testid^="backjob-queue-item-"]').first()).toBeVisible();

  await page.locator('[data-testid^="backjob-queue-item-"]').first().getByRole("button", { name: "Open" }).click();

  const detail = page.getByTestId("backjob-detail-panel");
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("BJ-DECLUTTER-001");
  await expect(detail).toContainText("Installation oversight");
  await expect(detail).toContainText("Internal");
  await expect(page.getByTestId("backjob-analytics-panel")).toBeVisible();
});
