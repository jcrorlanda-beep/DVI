import { expect, test, type Page } from "@playwright/test";

async function loadDemoDashboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function signIn(page: Page) {
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function seedSupportingRecords(page: Page) {
  await page.evaluate(() => {
    const expenseKey = "dvi_phase53_expense_records_v1";
    const invoiceKey = "dvi_phase10_invoice_records_v1";
    const paymentKey = "dvi_phase10_payment_records_v1";
    const partsKey = "dvi_phase8_parts_requests_v1";
    const attachmentKey = "dvi_document_attachments_v1";
    const repairOrdersKey = "dvi_phase3_repair_orders_v1";

    const repairOrders = JSON.parse(localStorage.getItem(repairOrdersKey) || "[]");
    const firstRo = repairOrders[0];
    if (firstRo) {
      const invoices = JSON.parse(localStorage.getItem(invoiceKey) || "[]");
      if (!invoices.some((row: { roId?: string }) => row.roId === firstRo.id)) {
        invoices.unshift({
          id: "declutter-invoice-001",
          invoiceNumber: "INV-DECLUTTER-001",
          roId: firstRo.id,
          roNumber: firstRo.roNumber,
          createdAt: "2026-04-24T08:00:00.000Z",
          updatedAt: "2026-04-24T08:00:00.000Z",
          createdBy: "admin",
          laborSubtotal: "1500",
          partsSubtotal: "500",
          discountAmount: "0",
          totalAmount: "2000",
          status: "Finalized",
          paymentStatus: "Partial",
          chargeAccountApproved: false,
          notes: "Declutter demo invoice",
        });
        localStorage.setItem(invoiceKey, JSON.stringify(invoices));
      }

      const payments = JSON.parse(localStorage.getItem(paymentKey) || "[]");
      if (!payments.some((row: { roId?: string }) => row.roId === firstRo.id)) {
        payments.unshift({
          id: "declutter-payment-001",
          paymentNumber: "PAY-DECLUTTER-001",
          invoiceId: "declutter-invoice-001",
          roId: firstRo.id,
          roNumber: firstRo.roNumber,
          createdAt: "2026-04-24T10:00:00.000Z",
          receivedBy: "Admin User",
          amount: "500",
          method: "Cash",
          referenceNumber: "RCPT-001",
          notes: "Declutter demo payment",
        });
        localStorage.setItem(paymentKey, JSON.stringify(payments));
      }

      const parts = JSON.parse(localStorage.getItem(partsKey) || "[]");
      if (!parts.some((row: { requestNumber?: string }) => row.requestNumber === "PR-DECLUTTER-001")) {
        parts.unshift({
          id: "declutter-parts-request-001",
          requestNumber: "PR-DECLUTTER-001",
          roId: firstRo.id,
          roNumber: firstRo.roNumber,
          workLineId: "",
          createdAt: "2026-04-24T09:00:00.000Z",
          updatedAt: "2026-04-24T09:00:00.000Z",
          requestedBy: "Admin User",
          status: "Requested",
          partName: "Air Filter",
          partNumber: "AF-100",
          quantity: "2",
          urgency: "Medium",
          notes: "Declutter demo request",
          customerSellingPrice: "600",
          selectedBidId: "declutter-bid-001",
          plateNumber: firstRo.plateNumber || "",
          vehicleLabel: firstRo.vehicleLabel || [firstRo.year, firstRo.make, firstRo.model].filter(Boolean).join(" ") || "Vehicle",
          accountLabel: firstRo.accountLabel || firstRo.customerName || "Customer",
          updatedBy: "Admin User",
          workshopPhotos: [],
          bids: [
            {
              id: "declutter-bid-001",
              supplierName: "Demo Supplier",
              brand: "ACDelco",
              quantity: "2",
              unitCost: "250",
              totalCost: "500",
              deliveryTime: "2 days",
              warrantyNote: "12 months",
              condition: "Brand New",
              notes: "Declutter demo bid",
              createdAt: "2026-04-24T09:00:00.000Z",
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
    }

    const expenses = JSON.parse(localStorage.getItem(expenseKey) || "[]");
    if (!expenses.some((row: { expenseNumber?: string }) => row.expenseNumber === "EXP-DECLUTTER-001")) {
      expenses.unshift({
        id: "declutter-expense-001",
        expenseNumber: "EXP-DECLUTTER-001",
        date: "2026-04-24",
        category: "Other",
        vendor: "Declutter Vendor",
        description: "Workspace supplies",
        amount: "850",
        paymentMethod: "Cash",
        referenceNumber: "OR-001",
        note: "Declutter demo expense",
        createdAt: "2026-04-24T08:30:00.000Z",
        createdBy: "Admin User",
      });
      localStorage.setItem(expenseKey, JSON.stringify(expenses));
    }

    const attachments = JSON.parse(localStorage.getItem(attachmentKey) || "[]");
    if (!attachments.some((row: { fileName?: string }) => row.fileName === "declutter-document.pdf")) {
      attachments.unshift({
        id: "declutter-doc-001",
        roId: firstRo?.id || "declutter-ro",
        roNumber: firstRo?.roNumber || "RO-DECLUTTER-001",
        documentType: "Estimate",
        fileName: "declutter-document.pdf",
        note: "Declutter demo attachment",
        addedAt: "2026-04-24T09:15:00.000Z",
        addedBy: "Admin User",
      });
      localStorage.setItem(attachmentKey, JSON.stringify(attachments));
    }
  });
}

test("customer profile, expense, payment, inventory, PO, and document detail panels render", async ({ page }) => {
  await loadDemoDashboard(page);
  await seedSupportingRecords(page);
  await page.reload();
  await signIn(page);

  await page.getByRole("button", { name: "Dashboard" }).click();
  await expect(page.getByTestId("customer-visit-breakdown-panel")).toBeVisible();
  const customerRow = page.locator('[data-testid^="customer-profile-row-"]').first();
  await expect(customerRow).toBeVisible();
  await customerRow.click();
  await expect(page.getByTestId("customer-profile-detail-panel")).toBeVisible();

  await page.getByRole("button", { name: "Expenses" }).click();
  await expect(page.getByTestId("expense-row-declutter-expense-001")).toBeVisible();
  await page.getByTestId("expense-row-declutter-expense-001").click();
  await expect(page.getByTestId("expense-detail-panel")).toContainText("EXP-DECLUTTER-001");

  await page.getByRole("button", { name: "Payments" }).click();
  const paymentRow = page.locator('[data-testid^="payment-row-"]').first();
  await expect(paymentRow).toBeVisible();
  await paymentRow.click();
  await expect(page.getByTestId("payment-detail-panel")).toBeVisible();

  await page.getByRole("button", { name: "Parts" }).click();
  await page.getByTestId("inventory-item-name").fill("Declutter Filter");
  await page.getByTestId("inventory-sku").fill("DF-001");
  await page.getByTestId("inventory-category").fill("Filters");
  await page.getByTestId("inventory-brand").fill("DemoBrand");
  await page.getByTestId("inventory-supplier").fill("Demo Supplier");
  await page.getByTestId("inventory-qty").fill("5");
  await page.getByTestId("inventory-reorder").fill("2");
  await page.getByTestId("inventory-selling-price").fill("900");
  await page.getByTestId("inventory-add-item").click();
  const inventoryRow = page.locator('[data-testid^="inventory-item-"]').first();
  await expect(inventoryRow).toBeVisible();
  await inventoryRow.click();
  await expect(page.getByTestId("inventory-detail-panel")).toBeVisible();
  await expect(page.getByTestId("inventory-back-to-list")).toBeVisible();
  await page.getByTestId("inventory-back-to-list").click();
  await expect(page.getByTestId("inventory-detail-panel")).toHaveCount(0);
  await page.getByTestId("po-request-select").selectOption("declutter-parts-request-001");
  await page.getByTestId("po-create").click();
  const poRow = page.locator('[data-testid^="po-row-"]').first();
  await expect(poRow).toBeVisible();
  await poRow.click();
  await expect(page.getByTestId("po-detail-panel")).toBeVisible();
  await expect(page.getByTestId("po-back-to-list")).toBeVisible();
  await page.getByTestId("po-back-to-list").click();
  await expect(page.getByTestId("po-detail-panel")).toHaveCount(0);

  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByTestId("document-attachment-center")).toBeVisible();
  await expect(page.getByTestId("document-center-row-declutter-doc-001")).toBeVisible();
  await page.getByTestId("document-center-row-declutter-doc-001").click();
  await expect(page.getByTestId("document-detail-panel")).toContainText("declutter-document.pdf");
  await expect(page.getByTestId("document-back-to-list")).toBeVisible();
  await page.getByTestId("document-back-to-list").click();
  await expect(page.getByTestId("document-detail-panel")).toHaveCount(0);
});
