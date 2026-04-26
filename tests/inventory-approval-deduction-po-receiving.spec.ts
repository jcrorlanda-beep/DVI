import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username = "admin", password = "admin123") {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function openParts(page: Page) {
  await page.getByRole("button", { name: "PT Parts" }).click();
}

async function createInventoryItem(page: Page, name = "Phase 68 Filter", qty = "10") {
  await page.getByTestId("inventory-item-name").fill(name);
  await page.getByTestId("inventory-sku").fill("PH68-FLTR");
  await page.getByTestId("inventory-category").fill("Filters");
  await page.getByTestId("inventory-brand").fill("DemoBrand");
  await page.getByTestId("inventory-supplier").fill("Demo Supplier");
  await page.getByTestId("inventory-qty").fill(qty);
  await page.getByTestId("inventory-reorder").fill("5");
  if (await page.getByTestId("inventory-unit-cost").count()) {
    await page.getByTestId("inventory-unit-cost").fill("100");
  }
  await page.getByTestId("inventory-selling-price").fill("180");
  await page.getByTestId("inventory-add-item").click();
  await expect(page.getByTestId("inventory-control-panel")).toContainText(name);
}

test("inventory adjustment approval keeps stock unchanged until applied", async ({ page }) => {
  await loadDemoAs(page);
  await openParts(page);
  await createInventoryItem(page, "Approval Filter", "10");

  await page.getByTestId("inventory-adjust-item").selectOption({ index: 1 });
  await page.getByTestId("inventory-adjust-type").selectOption("Add Stock");
  await page.getByTestId("inventory-adjust-reason").selectOption("New Stock");
  await page.getByTestId("inventory-adjust-qty").fill("3");
  await page.getByTestId("inventory-adjust-submit").click();

  await expect(page.getByTestId("inventory-adjustment-log")).toContainText("Pending Approval");
  await expect(page.getByTestId("inventory-detail-panel")).toContainText("Qty 10");

  const pendingRow = page.locator('[data-testid^="inventory-adjustment-"]').first();
  await expect(pendingRow).toContainText("Pending Approval");
  await pendingRow.getByRole("button", { name: "Approve" }).click();
  await expect(pendingRow).toContainText("Approved");
  await pendingRow.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByTestId("inventory-detail-panel")).toContainText("Qty 13");
  await expect(page.getByTestId("inventory-movement-log")).toContainText("Adjustment Applied");
});

test("rejected inventory adjustment does not change stock", async ({ page }) => {
  await loadDemoAs(page);
  await openParts(page);
  await createInventoryItem(page, "Rejected Filter", "10");

  await page.getByTestId("inventory-adjust-item").selectOption({ index: 1 });
  await page.getByTestId("inventory-adjust-type").selectOption("Deduct Stock");
  await page.getByTestId("inventory-adjust-reason").selectOption("Damaged");
  await page.getByTestId("inventory-adjust-qty").fill("2");
  await page.getByTestId("inventory-adjust-submit").click();

  const pendingRow = page.locator('[data-testid^="inventory-adjustment-"]').first();
  await pendingRow.getByRole("button", { name: "Reject" }).click();
  await expect(pendingRow).toContainText("Rejected");
  await expect(page.getByTestId("inventory-detail-panel")).toContainText("Qty 10");
});

test("non-admin users cannot approve inventory adjustments", async ({ page }) => {
  await loadDemoAs(page, "office", "office123");
  await openParts(page);
  await createInventoryItem(page, "Restricted Filter", "10");

  await page.getByTestId("inventory-adjust-item").selectOption({ index: 1 });
  await page.getByTestId("inventory-adjust-type").selectOption("Add Stock");
  await page.getByTestId("inventory-adjust-reason").selectOption("Other");
  await page.getByTestId("inventory-adjust-qty").fill("1");
  await page.getByTestId("inventory-adjust-submit").click();

  const pendingRow = page.locator('[data-testid^="inventory-adjustment-"]').first();
  await expect(pendingRow.getByRole("button", { name: "Approve" })).toBeDisabled();
  await expect(pendingRow.getByRole("button", { name: "Reject" })).toBeDisabled();
});

test("deduction modes and negative stock protection behave safely", async ({ page }) => {
  await loadDemoAs(page);
  await openParts(page);
  await createInventoryItem(page, "Deduction Filter", "10");

  await page.getByTestId("inventory-adjust-item").selectOption({ index: 1 });

  await page.getByTestId("inventory-deduction-mode").selectOption("Manual only");
  await page.getByTestId("inventory-adjust-type").selectOption("Deduct Stock");
  await page.getByTestId("inventory-adjust-reason").selectOption("Used for RO");
  await page.getByTestId("inventory-adjust-qty").fill("2");
  await page.getByTestId("inventory-adjust-save").click();
  await expect(page.getByTestId("inventory-detail-panel")).toContainText("Qty 10");

  await page.getByTestId("inventory-deduction-mode").selectOption("Prompt before deduction");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTestId("inventory-adjust-save").click();
  await expect(page.getByTestId("inventory-detail-panel")).toContainText("Qty 8");

  await page.getByTestId("inventory-deduction-mode").selectOption("Auto-deduct with log");
  await page.getByTestId("inventory-adjust-qty").fill("1");
  await page.getByTestId("inventory-adjust-save").click();
  await expect(page.getByTestId("inventory-detail-panel")).toContainText("Qty 7");
  await expect(page.getByTestId("inventory-movement-log")).toContainText("Used On RO");

  await page.getByTestId("inventory-adjust-qty").fill("999");
  await page.getByTestId("inventory-adjust-save").click();
  await expect(page.getByTestId("inventory-control-panel")).toContainText(/Negative stock blocked|Override reason required/i);
});

test("partial PO receiving updates inventory and history while preventing over-receive without override", async ({ page }) => {
  await loadDemoAs(page);
  await page.evaluate(() => {
    const partsKey = "dvi_phase8_parts_requests_v1";
    const repairOrdersKey = "dvi_phase3_repair_orders_v1";
    const parts = JSON.parse(localStorage.getItem(partsKey) || "[]");
    const repairOrders = JSON.parse(localStorage.getItem(repairOrdersKey) || "[]");
    const firstRo = repairOrders[0];
    if (firstRo && !parts.some((row: { requestNumber?: string }) => row.requestNumber === "PO-PARTIAL-001")) {
      parts.unshift({
        id: "po-partial-request",
        requestNumber: "PO-PARTIAL-001",
        roId: firstRo.id,
        roNumber: firstRo.roNumber,
        workLineId: "",
        createdAt: "2026-04-24T08:00:00.000Z",
        updatedAt: "2026-04-24T08:00:00.000Z",
        requestedBy: "Admin User",
        status: "Requested",
        partName: "Brake Pad Set",
        partNumber: "BP-200",
        quantity: "2",
        urgency: "High",
        notes: "Partial receiving test request",
        customerSellingPrice: "1800",
        selectedBidId: "po-partial-bid",
        plateNumber: firstRo.plateNumber || "",
        vehicleLabel: firstRo.vehicleLabel || [firstRo.year, firstRo.make, firstRo.model].filter(Boolean).join(" ") || "Vehicle",
        accountLabel: firstRo.accountLabel || firstRo.customerName || "Customer",
        updatedBy: "Admin User",
        workshopPhotos: [],
        bids: [
          {
            id: "po-partial-bid",
            supplierName: "Demo Supplier",
            brand: "DemoBrand",
            quantity: "2",
            unitCost: "500",
            totalCost: "1000",
            deliveryTime: "2 days",
            warrantyNote: "12 months",
            condition: "Brand New",
            notes: "Partial receiving test bid",
            createdAt: "2026-04-24T08:00:00.000Z",
            productPhotos: [],
            invoiceFileName: "",
            shippingLabelFileName: "",
            trackingNumber: "",
            courierName: "",
            shippingNotes: "",
          },
        ],
        returnRecords: [],
      });
      localStorage.setItem(partsKey, JSON.stringify(parts));
    }
  });
  await page.reload();
  await openParts(page);

  await page.getByTestId("po-create").click();
  const firstRow = page.locator('[data-testid^="po-row-"]').first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();
  await expect(page.getByTestId("po-detail-panel")).toBeVisible();

  await page.locator('[data-testid^="po-receive-qty-"]').first().fill("1");
  await page.locator('[data-testid^="po-receive-detail-"]').click();
  await expect(page.getByTestId("po-detail-panel")).toContainText(/Received 1|Partially Received/);
  await expect(page.locator('[data-testid^="po-receiving-history-"]').first()).toContainText("Qty 1");

  await page.locator('[data-testid^="po-receive-qty-"]').first().fill("999");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.locator('[data-testid^="po-receive-detail-"]').click();
  await expect(page.getByTestId("purchase-order-lite-panel")).toContainText(/Cannot receive more than ordered|Override reason required/i);

  await page.locator('[data-testid^="po-receive-"]').first().click();
  await expect(page.getByTestId("po-detail-panel")).toContainText(/Received|Remaining 0/);
});
