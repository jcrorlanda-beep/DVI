import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username = "admin", password = "admin123") {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function seedAccountingEdgeCases(page: Page) {
  await page.evaluate(() => {
    const invoiceKey = "dvi_phase10_invoice_records_v1";
    const paymentKey = "dvi_phase10_payment_records_v1";
    const expenseKey = "dvi_phase53_expense_records_v1";

    const invoices = JSON.parse(localStorage.getItem(invoiceKey) || "[]");
    invoices.unshift({
      id: "acct-invoice-overpaid",
      invoiceNumber: "INV-ACCT-OVERPAID",
      roId: invoices[0]?.roId || "",
      roNumber: "",
      createdAt: "2026-04-24T08:00:00.000Z",
      updatedAt: "2026-04-24T08:00:00.000Z",
      createdBy: "Admin User",
      laborSubtotal: "100",
      partsSubtotal: "0",
      discountAmount: "0",
      totalAmount: "100",
      status: "Finalized",
      paymentStatus: "Partial",
      chargeAccountApproved: false,
      notes: "Accounting prep test invoice",
    });
    localStorage.setItem(invoiceKey, JSON.stringify(invoices));

    const payments = JSON.parse(localStorage.getItem(paymentKey) || "[]");
    payments.unshift(
      {
        id: "acct-payment-overpaid-1",
        paymentNumber: "PAY-ACCT-001",
        invoiceId: "acct-invoice-overpaid",
        roId: invoices[0]?.roId || "",
        roNumber: "",
        createdAt: "2026-04-24T09:00:00.000Z",
        receivedBy: "Admin User",
        amount: "75",
        method: "Cash",
        referenceNumber: "ACCT-001",
        notes: "",
      },
      {
        id: "acct-payment-overpaid-2",
        paymentNumber: "PAY-ACCT-002",
        invoiceId: "acct-invoice-overpaid",
        roId: invoices[0]?.roId || "",
        roNumber: "",
        createdAt: "2026-04-24T10:00:00.000Z",
        receivedBy: "Admin User",
        amount: "75",
        method: "Cash",
        referenceNumber: "ACCT-002",
        notes: "",
      },
      {
        id: "acct-payment-orphan",
        paymentNumber: "PAY-ACCT-ORPHAN",
        invoiceId: "",
        roId: "",
        roNumber: "",
        createdAt: "2026-04-24T11:00:00.000Z",
        receivedBy: "Admin User",
        amount: "50",
        method: "Cash",
        referenceNumber: "ACCT-ORPHAN",
        notes: "",
      }
    );
    localStorage.setItem(paymentKey, JSON.stringify(payments));

    const expenses = JSON.parse(localStorage.getItem(expenseKey) || "[]");
    expenses.unshift({
      id: "acct-expense-missing",
      expenseNumber: "EXP-ACCT-MISSING",
      date: "2026-04-24",
      category: "Other",
      vendor: "",
      description: "",
      amount: "0",
      paymentMethod: "Cash",
      referenceNumber: "",
      note: "Broken finance record",
      createdAt: "2026-04-24T12:00:00.000Z",
      createdBy: "Admin User",
    });
    localStorage.setItem(expenseKey, JSON.stringify(expenses));
  });
}

test("accounting prep and profit report render for admin", async ({ page }) => {
  await loadDemoAs(page);
  await seedAccountingEdgeCases(page);
  await page.reload();

  await expect(page.getByTestId("revenue-dashboard-panel")).toBeVisible();
  await expect(page.getByTestId("accounting-prep-panel")).toBeVisible();
  await expect(page.getByTestId("profit-report-panel")).toBeVisible();
  await expect(page.getByTestId("accounting-prep-panel")).toContainText(/Needs Correction|Not Ready|Ready to Review|Ready to Export|Exported/);
  await expect(page.getByTestId("profit-revenue-by-category")).toBeVisible();
  await expect(page.getByTestId("profit-expense-by-category")).toBeVisible();
});

test("reconciliation panel calculates settlement statuses and orphan payments", async ({ page }) => {
  await loadDemoAs(page);
  await seedAccountingEdgeCases(page);
  await page.reload();

  await page.getByRole("button", { name: "Payments", exact: true }).click();
  await expect(page.getByTestId("invoice-reconciliation-panel")).toBeVisible();
  await expect(page.getByTestId("settlement-status-overpaid")).toBeVisible();
  await expect(page.getByText(/Payments without invoice link/i)).toBeVisible();
  await expect(page.getByText("PAY-ACCT-ORPHAN")).toBeVisible();
});

test("accounting prep and profit report are restricted for non-admin roles", async ({ page }) => {
  await loadDemoAs(page, "office", "office123");

  await expect(page.getByTestId("accounting-prep-restricted")).toBeVisible();
  await expect(page.getByTestId("profit-report-restricted")).toBeVisible();
});
