import { expect, test, type Page } from "@playwright/test";

async function loadDemoData(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
}

async function openSupplierPortal(page: Page, supplierName: string) {
  await page.getByRole("button", { name: "Supplier Sign In" }).click();
  await page.getByPlaceholder(/enter supplier name/i).fill(supplierName);
  await page.getByRole("button", { name: "Open Supplier Portal" }).click();
}

test("supplier portal renders assigned requests and bid lifecycle actions", async ({ page }) => {
  await loadDemoData(page);
  const assignedRequest = await page.evaluate(() => {
    const parts = JSON.parse(localStorage.getItem("dvi_phase8_parts_requests_v1") || "[]") as Array<Record<string, unknown>>;
    return parts.find((row) => Array.isArray(row.supplierRecipients) && row.supplierRecipients.includes("Northeast Parts Supply")) ?? null;
  });

  expect(assignedRequest?.requestNumber).toBeTruthy();

  await openSupplierPortal(page, "Northeast Parts Supply");
  await expect(page.getByText("Supplier Portal", { exact: true })).toBeVisible();
  await expect(page.getByText(/Simulated supplier access/i)).toBeVisible();
  await expect(page.getByText(String(assignedRequest?.requestNumber ?? ""))).toBeVisible();
  await expect(page.getByText("AC Pro Parts")).toHaveCount(0);

  await page.getByLabel("Brand").fill("KYB");
  await page.getByLabel("Quantity").fill("2");
  await page.getByLabel("Unit Cost").fill("3200");
  await page.getByLabel("Delivery Time").fill("Next day");
  await page.getByLabel("Warranty Note").fill("12 months supplier warranty");
  await page.getByLabel("Bid Notes").fill("Supplier portal test bid");
  await page.getByRole("button", { name: "Submit Bid" }).click();

  await page.getByRole("button", { name: "My Submitted Bids" }).click();
  await expect(page.getByText(/Submitted|Revised/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Withdraw Bid" })).toBeVisible();

  await page.getByRole("button", { name: "Withdraw Bid" }).click();
  await expect(page.getByText("Withdrawn")).toBeVisible();
});
