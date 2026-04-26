import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username = "admin", password = "admin123") {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("document attachment upload previews and deletes safely", async ({ page }) => {
  await loadDemoAs(page);
  await page.getByRole("button", { name: "History" }).click();

  await expect(page.getByTestId("document-attachment-center")).toBeVisible();
  await expect(page.getByTestId("document-center-file-input")).toBeVisible();

  await page.getByTestId("document-center-file-input").setInputFiles({
    name: "phase71-proof.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0Z9wAAAABJRU5ErkJggg==",
      "base64"
    ),
  });
  await page.getByTestId("document-center-note").fill("Phase 71 upload test");
  await page.getByRole("button", { name: "Index Attachment" }).click();

  const uploadedRow = page.getByTestId("document-attachment-center").getByText("phase71-proof.png");
  await expect(uploadedRow).toBeVisible();
  await page.getByText("phase71-proof.png").first().click();
  await expect(page.getByTestId("document-detail-panel")).toContainText("phase71-proof.png");
  await expect(page.getByTestId("document-preview-panel")).toBeVisible();
  await expect(page.getByTestId("document-center-sharing-warning")).toBeVisible();
  await page.getByTestId("document-center-customer-visible").check();
  await expect(page.getByTestId("document-detail-panel")).toContainText("Customer visible");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTestId("document-center-delete").click();
  await expect(page.getByTestId("document-attachment-center")).not.toContainText("phase71-proof.png");
});

test("legacy attachment metadata still opens with safe missing-preview state", async ({ page }) => {
  await loadDemoAs(page);

  await page.evaluate(() => {
    const storageKey = "dvi_document_attachments_v1";
    const attachments = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!attachments.some((row: { fileName?: string }) => row.fileName === "legacy-note-only.pdf")) {
      attachments.unshift({
        id: "legacy-doc-001",
        roId: "",
        roNumber: "RO-LEGACY-001",
        documentType: "Other",
        fileName: "legacy-note-only.pdf",
        note: "Legacy metadata only",
        addedAt: "2026-04-24T08:00:00.000Z",
        addedBy: "Admin User",
      });
      localStorage.setItem(storageKey, JSON.stringify(attachments));
    }
  });

  await page.reload();
  await loadDemoAs(page);
  await page.getByRole("button", { name: "History" }).click();

  await expect(page.getByTestId("document-center-row-legacy-doc-001")).toBeVisible();
  await page.getByTestId("document-center-row-legacy-doc-001").click();
  await expect(page.getByTestId("document-detail-panel")).toContainText("legacy-note-only.pdf");
  await expect(page.getByTestId("document-preview-panel")).toContainText(/Preview unavailable|metadata only/i);
});
