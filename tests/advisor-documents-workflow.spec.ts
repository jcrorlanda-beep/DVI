import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username = "admin", password = "admin123") {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("booking calendar renders and date selector works", async ({ page }) => {
  await loadDemoAs(page);
  await page.getByRole("button", { name: /Bookings/i }).click();

  await expect(page.getByTestId("booking-calendar-panel")).toBeVisible();
  await page.getByTestId("booking-calendar-date").fill("2099-01-01");
  await expect(page.getByTestId("booking-calendar-panel")).toContainText(/No appointments scheduled|appointment/i);
});

test("advisor pipeline and estimate builder render on dashboard", async ({ page }) => {
  await loadDemoAs(page);

  await expect(page.getByTestId("advisor-pipeline-panel")).toBeVisible();
  await expect(page.getByTestId("advisor-pipeline-stage-estimate-approval")).toBeVisible();
  await expect(page.getByTestId("advisor-pipeline-advisor-load")).toBeVisible();

  await expect(page.getByTestId("estimate-builder-panel")).toBeVisible();
  await expect(page.getByTestId("estimate-builder-ro-select")).toBeVisible();
});

test("approval evidence and document center controls render and accept metadata", async ({ page }) => {
  await loadDemoAs(page);

  await expect(page.getByTestId("approval-evidence-panel")).toBeVisible();
  await expect(page.getByTestId("approval-evidence-select")).toBeVisible();
  await page.getByTestId("approval-evidence-signer").fill("Demo Customer");
  await page.getByTestId("approval-evidence-reference").fill("SMS approval reference");
  await page.getByRole("button", { name: "Capture Evidence" }).click();
  await expect(page.getByTestId("approval-evidence-panel")).toContainText(/Evidence Captured|evidence record/i);

  await expect(page.getByTestId("document-attachment-center")).toBeVisible();
  await page.getByTestId("document-center-file-name").fill("demo-estimate.pdf");
  await page.getByTestId("document-center-note").fill("Advisor uploaded estimate copy");
  await page.getByRole("button", { name: "Index Attachment" }).click();
  await expect(page.getByTestId("document-attachment-center")).toContainText("demo-estimate.pdf");
});
