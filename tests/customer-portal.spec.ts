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

async function seedCustomerVisibleDocuments(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();

  const linkedRo = await page.evaluate(() => {
    const repairOrdersKey = "dvi_phase3_repair_orders_v1";
    const repairOrders = JSON.parse(localStorage.getItem(repairOrdersKey) || "[]") as Array<Record<string, unknown>>;
    const firstRo = repairOrders[0] ?? null;
    return {
      roId: String(firstRo?.id ?? ""),
      roNumber: String(firstRo?.roNumber ?? ""),
      vehicleLabel: [firstRo?.year, firstRo?.make, firstRo?.model].filter(Boolean).join(" "),
    };
  });

  await page.evaluate((linkedRo) => {
    const key = "dvi_document_attachments_v1";
    const attachments = JSON.parse(localStorage.getItem(key) || "[]");
    const visibleId = "customer-visible-doc-001";
    const hiddenId = "customer-hidden-doc-001";

    if (!attachments.some((row: { id?: string }) => row.id === visibleId)) {
      attachments.unshift({
        id: visibleId,
        roId: linkedRo.roId,
        roNumber: linkedRo.roNumber,
        documentType: "Estimate",
        fileName: "customer-visible-estimate.pdf",
        note: "Customer-facing copy",
        addedAt: "2026-04-24T08:15:00.000Z",
        addedBy: "Admin User",
        fileType: "application/pdf",
        fileSize: 1200,
        uploadedAt: "2026-04-24T08:15:00.000Z",
        uploadedBy: "Admin User",
        sourceModule: "Repair Orders",
        linkedEntityId: linkedRo.roId,
        linkedEntityLabel: `${linkedRo.roNumber} / ${linkedRo.vehicleLabel}`,
        previewKind: "pdf",
        dataUrl: "data:application/pdf;base64,JVBERi0xLjQK",
        customerVisible: true,
      });
    }

    if (!attachments.some((row: { id?: string }) => row.id === hiddenId)) {
      attachments.unshift({
        id: hiddenId,
        roId: linkedRo.roId,
        roNumber: linkedRo.roNumber,
        documentType: "Invoice",
        fileName: "internal-cost-sheet.pdf",
        note: "Internal only",
        addedAt: "2026-04-24T08:20:00.000Z",
        addedBy: "Admin User",
        fileType: "application/pdf",
        fileSize: 1500,
        uploadedAt: "2026-04-24T08:20:00.000Z",
        uploadedBy: "Admin User",
        sourceModule: "Repair Orders",
        linkedEntityId: linkedRo.roId,
        linkedEntityLabel: `${linkedRo.roNumber} / ${linkedRo.vehicleLabel}`,
        previewKind: "pdf",
        dataUrl: "data:application/pdf;base64,JVBERi0xLjQK",
        customerVisible: false,
      });
    }

    localStorage.setItem(key, JSON.stringify(attachments));
  }, linkedRo);
}

test("customer portal opens in demo mode and shows read-only approval status", async ({ page }) => {
  await openDemoCustomerPortal(page);

  await expect(page.getByText(/Demo Mode/i)).toBeVisible();
  await expect(page.getByText(/Read-only customer view/i)).toBeVisible();
  await expect(page.getByText(/review all findings, prices, promises, and safety notes before approving/i)).toBeVisible();

  await page.getByRole("button", { name: "Approvals" }).click();
  await expect(page.getByText(/Customer Approval Review/i)).toBeVisible();
  await expect(page.getByTestId("customer-portal-approval-approved")).toBeVisible();
  await expect(page.getByTestId("customer-portal-approval-pending")).toBeVisible();
  await expect(page.getByTestId("customer-portal-approval-declined")).toBeVisible();
  await expect(page.getByText(/Deferred/i).first()).toBeVisible();
  await expect(page.getByText(/Ready for Release/i).first()).toBeVisible();
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

test("customer portal shows only customer-visible documents", async ({ page }) => {
  await seedCustomerVisibleDocuments(page);
  await page.getByRole("button", { name: "Open Demo Customer Portal" }).click();

  await page.getByRole("button", { name: "Documents" }).click();
  await expect(page.getByText(/customer-visible documents/i)).toBeVisible();
  await expect(page.getByText("customer-visible-estimate.pdf")).toBeVisible();
  await expect(page.getByText("internal-cost-sheet.pdf")).toHaveCount(0);
});

test("customer portal booking shows selected services in the preview", async ({ page }) => {
  await openDemoCustomerPortal(page);

  await page.getByRole("button", { name: "Book Service" }).click();
  await page.getByTestId("public-booking-chip-pms-oil-change").click();
  await page.getByTestId("public-booking-chip-brake-service").click();
  await expect(page.getByText(/Selected: PMS \/ Oil Change, Brake Service/i)).toBeVisible();
});
