import { expect, test, type Page } from "@playwright/test";

async function openDemoCustomerPortal(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Demo Customer Portal" }).click();
  await expect(page.getByText("Customer Portal", { exact: true })).toBeVisible();
}

async function seedMissingPortalEvidence(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    const key = "dvi_phase3_inspection_records_v1";
    const records = JSON.parse(localStorage.getItem(key) || "[]");
    const next = records.map((record: Record<string, unknown>) => {
      const clone = { ...record };
      delete clone.evidenceItems;
      return clone;
    });
    localStorage.setItem(key, JSON.stringify(next));
  });
}

test("customer portal opens in demo mode and shows read-only approval status", async ({ page }) => {
  await openDemoCustomerPortal(page);

  await expect(page.getByText(/Demo Mode/i)).toBeVisible();
  await expect(page.getByText(/Read-only customer view/i)).toBeVisible();

  await page.getByRole("button", { name: "Approvals" }).click();
  await expect(page.getByText(/Customer Approval Review/i)).toBeVisible();
  await expect(page.getByTestId("customer-portal-approval-approved")).toBeVisible();
  await expect(page.getByTestId("customer-portal-approval-pending")).toBeVisible();
  await expect(page.getByTestId("customer-portal-approval-declined")).toBeVisible();
});

test("legacy customer portal data does not crash the inspection view", async ({ page }) => {
  await seedMissingPortalEvidence(page);
  await openDemoCustomerPortal(page);

  await page.getByRole("button", { name: "Inspection Report" }).click();
  await expect(page.getByText(/Condition Legend/i)).toBeVisible();
  await expect(page.getByText("Customer Portal", { exact: true })).toBeVisible();
});

test("customer portal renders in mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDemoCustomerPortal(page);

  await expect(page.getByText("Customer Portal", { exact: true })).toBeVisible();
  await expect(page.getByText(/Read-only customer view/i)).toBeVisible();
});
