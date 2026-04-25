import { expect, test, type Page } from "@playwright/test";

async function loadDemoDashboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

async function seedAdvisorActionCenterState(page: Page) {
  await page.evaluate(() => {
    const ordersKey = "dvi_phase4_repair_orders_v1";
    const aiLogKey = "dvi_openai_assist_logs_v1";
    const repairOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]");

    if (repairOrders[0]) repairOrders[0].status = "Waiting Approval";
    if (repairOrders[1]) repairOrders[1].status = "Waiting Parts";
    if (repairOrders[2]) repairOrders[2].status = "Quality Check";
    if (repairOrders[3]) repairOrders[3].status = "Ready Release";

    const now = new Date().toISOString();
    const aiLogs = [
      {
        id: "advisor-center-ai-1",
        actionType: "Summarize Inspection",
        sourceModule: "inspection",
        status: "Success",
        generatedAt: now,
        provider: "OpenAI",
        model: "gpt-4.1-mini",
        note: "Needs review before use.",
        reviewed: false,
        copied: false,
        used: false,
        outputMode: "Standard",
        templateType: "Standard",
      },
    ];

    localStorage.setItem(ordersKey, JSON.stringify(repairOrders));
    localStorage.setItem(aiLogKey, JSON.stringify(aiLogs));
  });
  await page.reload();
}

test("advisor daily action center renders all operational queues", async ({ page }) => {
  await loadDemoDashboard(page);
  await seedAdvisorActionCenterState(page);

  const panel = page.getByTestId("advisor-action-center-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("advisor-action-center-count-waiting-approvals")).toBeVisible();
  await expect(panel.getByTestId("advisor-action-center-count-waiting-parts")).toBeVisible();
  await expect(panel.getByTestId("advisor-action-center-count-ready-qc")).toBeVisible();
  await expect(panel.getByTestId("advisor-action-center-count-ready-release")).toBeVisible();
  await expect(panel.getByTestId("advisor-action-center-count-overdue-followups")).toBeVisible();
  await expect(panel.getByTestId("advisor-action-center-count-ai-review")).toBeVisible();
  await expect(panel.getByTestId("advisor-action-center-count-due-contacts")).toBeVisible();

  await expect(panel.getByTestId("advisor-action-center-waiting-approvals")).toContainText(/Waiting Approvals/i);
  await expect(panel.getByTestId("advisor-action-center-waiting-parts")).toContainText(/Waiting Parts/i);
  await expect(panel.getByTestId("advisor-action-center-ready-qc")).toContainText(/Ready for QC/i);
  await expect(panel.getByTestId("advisor-action-center-ready-release")).toContainText(/Ready for Release/i);
  await expect(panel.getByTestId("advisor-action-center-ai-review")).toContainText(/AI Drafts Needing Review/i);
});
