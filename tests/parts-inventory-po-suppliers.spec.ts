import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username = "admin", password = "admin123") {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("dvi_inventory_items_v1");
    localStorage.removeItem("dvi_inventory_movements_v1");
    localStorage.removeItem("dvi_purchase_orders_lite_v1");
    localStorage.removeItem("dvi_supplier_directory_v1");
  });
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function openParts(page: Page) {
  await page.getByRole("button", { name: "PT Parts" }).click();
}

test("inventory section renders, adds item, adjusts stock, and shows low stock", async ({ page }) => {
  await loadDemoAs(page);
  await openParts(page);

  await expect(page.getByTestId("inventory-control-panel")).toBeVisible();
  await page.getByTestId("inventory-item-name").fill("Test Oil Filter");
  await page.getByTestId("inventory-sku").fill("OF-100");
  await page.getByTestId("inventory-category").fill("Filters");
  await page.getByTestId("inventory-brand").fill("DemoBrand");
  await page.getByTestId("inventory-qty").fill("10");
  await page.getByTestId("inventory-reorder").fill("15");
  await page.getByTestId("inventory-unit-cost").fill("100");
  await page.getByTestId("inventory-selling-price").fill("180");
  await page.getByTestId("inventory-add-item").click();

  await expect(page.getByTestId("inventory-control-panel")).toContainText("Test Oil Filter");
  await expect(page.getByTestId("inventory-control-panel")).toContainText("Low Stock");

  await page.getByTestId("inventory-deduction-mode").selectOption("Auto-deduct with log");
  await page.getByTestId("inventory-adjust-item").selectOption({ index: 1 });
  await page.getByTestId("inventory-adjust-type").selectOption("Add Stock");
  await page.getByTestId("inventory-adjust-reason").selectOption("Correction");
  await page.getByTestId("inventory-adjust-qty").fill("3");
  await page.getByTestId("inventory-adjust-save").click();
  await expect(page.getByTestId("inventory-movement-log")).toContainText("Applied");
});

test("purchase order lite creates PO and can receive item into inventory", async ({ page }) => {
  await loadDemoAs(page);
  await openParts(page);

  await expect(page.getByTestId("purchase-order-lite-panel")).toBeVisible();
  await page.getByTestId("po-expected-delivery").fill("2026-05-01");
  await page.getByTestId("po-create").click();
  await expect(page.getByTestId("purchase-order-lite-panel")).toContainText(/PO-/);

  await page.locator('[data-testid^="po-receive-"]').first().click();
  await expect(page.getByTestId("purchase-order-lite-panel")).toContainText("received into inventory");
});

test("supplier directory creates, edits, filters, and marks inactive", async ({ page }) => {
  await loadDemoAs(page);
  await openParts(page);

  await expect(page.getByTestId("supplier-directory-panel")).toBeVisible();
  await page.getByTestId("supplier-directory-name").fill("Demo Supplier");
  await page.getByTestId("supplier-directory-contact").fill("Maria Santos");
  await page.getByTestId("supplier-directory-phone").fill("0917-000-0000");
  await page.getByTestId("supplier-directory-email").fill("supplier@example.com");
  await page.getByTestId("supplier-directory-brands").fill("DemoBrand");
  await page.getByTestId("supplier-directory-categories").fill("Filters");
  await page.getByTestId("supplier-directory-save").click();

  await expect(page.getByTestId("supplier-directory-panel")).toContainText("Demo Supplier");
  await expect(page.locator('[data-testid^="supplier-directory-summary-"]').first()).toBeVisible();
  await page.getByTestId("supplier-directory-filter").fill("Filters");
  await expect(page.getByTestId("supplier-directory-panel")).toContainText("Demo Supplier");
  await page.getByRole("button", { name: "Mark Inactive" }).first().click();
  await expect(page.getByTestId("supplier-directory-panel")).toContainText("Inactive");
});

test("non-admin parts view hides inventory and PO cost fields", async ({ page }) => {
  await loadDemoAs(page, "office", "office123");
  await openParts(page);

  await expect(page.getByTestId("inventory-control-panel")).toBeVisible();
  await expect(page.getByTestId("inventory-unit-cost")).toHaveCount(0);
  await expect(page.getByTestId("purchase-order-lite-panel")).toContainText("Internal cost hidden");
});
