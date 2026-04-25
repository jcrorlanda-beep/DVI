import { expect, test, type Page } from "@playwright/test";

async function signInStaff(page: Page, username: string) {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  const loadButton = page.getByRole("button", { name: "Load Simulated Data" });
  if (await loadButton.count()) {
    await loadButton.click();
  }
  await page.evaluate(() => {
    window.localStorage.setItem("dvi_openai_assist_provider_mode_v1", "OpenAI");
  });
  const usernameField = page.getByPlaceholder(/enter username/i);
  const passwordField = page.getByPlaceholder(/enter password/i);
  if (await usernameField.count() && await passwordField.count()) {
    await usernameField.fill(username);
    await passwordField.fill(`${username}123`);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
  }
}

async function openRepairOrders(page: Page, username = "admin") {
  await signInStaff(page, username);
  await page.getByRole("button", { name: /Repair Orders/i }).click();
}

async function openInspection(page: Page, username = "admin") {
  await signInStaff(page, username);
  await page.getByRole("button", { name: "IP Inspection", exact: true }).click();
  await page.getByPlaceholder(/search by plate/i).fill("NEX-2451");
  await expect(page.getByRole("button", { name: /Edit Inspection/i }).first()).toBeVisible();
  await page.getByRole("button", { name: /Edit Inspection/i }).first().click();
  await expect(page.getByTestId("openai-ai-assist-panel")).toBeVisible();
}

async function openRelease(page: Page, username = "admin") {
  await signInStaff(page, username);
  await page.getByRole("button", { name: "RL Release", exact: true }).click();
}

async function openQualityControl(page: Page, username = "admin") {
  await signInStaff(page, username);
  await page.getByRole("button", { name: /Quality Control/i }).click();
}

async function openHistory(page: Page, username = "admin") {
  await signInStaff(page, username);
  await page.getByRole("button", { name: "HI History", exact: true }).click();
}

test.describe("OpenAI assist", () => {
  test("renders the draft panel and produces a template fallback draft when providers are unavailable", async ({ page }) => {
    await openRepairOrders(page);

    const primaryPanel = page.locator('[data-testid="openai-ai-assist-panel"]').first();
    await expect(primaryPanel).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-action-explain-to-customer")).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-output-mode")).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-source-textarea")).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-copy-button")).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-use-button")).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-ai-generated-label")).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-review-checkbox")).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-copy-button")).toBeDisabled();
    await expect(primaryPanel.getByTestId("openai-ai-use-button")).toBeDisabled();
    await expect(primaryPanel.getByText(/API key: (Loaded|Missing)/i)).toBeVisible();
    await expect(primaryPanel.getByText(/Fallback only|OpenAI fallback only|Ready/i).first()).toBeVisible();

    await primaryPanel.getByTestId("openai-ai-output-mode").selectOption("Short");
    await primaryPanel.getByTestId("openai-ai-generate-button").click();

    const draft = primaryPanel.getByTestId("openai-ai-draft-textarea");
    await expect(draft).not.toHaveValue("");
    const shortDraft = await draft.inputValue();
    await expect(primaryPanel.getByText("Template (No AI)", { exact: true })).toBeVisible();
    await expect(primaryPanel.locator('[data-testid^="openai-ai-log-"]').first()).toContainText(/Success|Failure/i);

    await openRepairOrders(page);
    const detailedPanel = page.locator('[data-testid="openai-ai-assist-panel"]').first();
    await detailedPanel.getByTestId("openai-ai-output-mode").selectOption("Detailed");
    await detailedPanel.getByTestId("openai-ai-generate-button").click();
    const detailedDraftField = detailedPanel.getByTestId("openai-ai-draft-textarea");
    await expect(detailedDraftField).toHaveValue(/Summary/i);
    await expect(detailedDraftField).toHaveValue(/Findings/i);
    await expect(detailedDraftField).toHaveValue(/Recommended Action/i);
    await expect(detailedDraftField).toHaveValue(/Priority \/ Next Step/i);
    const detailedDraft = await detailedDraftField.inputValue();
    await expect(detailedDraft.length).toBeGreaterThan(shortDraft.length);

    await detailedPanel.getByTestId("openai-ai-review-checkbox").check();
    await expect(detailedPanel.getByTestId("openai-ai-copy-button")).toBeEnabled();
    await expect(detailedPanel.getByTestId("openai-ai-use-button")).toBeEnabled();
  });

  test("settings page shows the OpenAI assist configuration section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Load Simulated Data" }).click();
    await page.getByPlaceholder(/enter username/i).fill("admin");
    await page.getByPlaceholder(/enter password/i).fill("admin123");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await page.getByRole("button", { name: "ST Settings", exact: true }).click();

    await expect(page.getByText(/OpenAI AI Assist/i)).toBeVisible();
    await expect(page.getByTestId("openai-ai-provider")).toBeVisible();
    await expect(page.getByTestId("openai-ai-model")).toBeVisible();
    await expect(page.getByTestId("openai-ai-max-tokens")).toBeVisible();
  });

  test("repair orders shows the recommendation AI panel for allowed roles", async ({ page }) => {
    await openRepairOrders(page, "admin");

    await expect(page.getByTestId("openai-recommendation-ai-assist-panel")).toBeVisible();
    await expect(page.getByTestId("openai-recommendation-ai-action-explain-to-customer")).toBeVisible();
  });

  test("customer message composer renders and stays editable for allowed roles", async ({ page }) => {
    await openRepairOrders(page, "admin");

    const composer = page.getByTestId("customer-message-panel");
    await expect(composer).toBeVisible();
    await expect(composer.getByTestId("customer-message-source-context")).toBeVisible();
    await expect(composer.getByTestId("customer-message-action-approval-request")).toBeVisible();
    await expect(composer.getByTestId("customer-message-action-waiting-parts-update")).toBeVisible();
    await expect(composer.getByTestId("customer-message-ai-generated-label")).toBeVisible();
    await expect(composer.getByTestId("customer-message-review-checkbox")).toBeVisible();
    await expect(composer.getByTestId("customer-message-copy-button")).toBeVisible();
    await expect(composer.getByTestId("customer-message-use-button")).toBeVisible();

    await composer.getByTestId("customer-message-source-context").selectOption({ label: "Inspection" });
    await composer.getByTestId("customer-message-action-due-soon-maintenance-reminder").click();
    await composer.getByTestId("customer-message-generate-button").click();

    await expect(composer.getByTestId("customer-message-draft-textarea")).toBeVisible();
    await expect(composer.getByText(/Local AI \(Free\)|Cloud AI \(Paid fallback\)|Template \(No AI\)/i)).toBeVisible();
    await composer.getByTestId("customer-message-review-checkbox").check();
    await expect(composer.getByTestId("customer-message-copy-button")).toBeEnabled();
    await expect(composer.getByTestId("customer-message-use-button")).toBeEnabled();

    const draft = composer.getByTestId("customer-message-draft-textarea");
    const generatedValue = await draft.inputValue();
    await expect(generatedValue.length).toBeGreaterThan(0);

    await draft.fill("Edited customer draft");
    await expect(draft).toHaveValue("Edited customer draft");
  });

  test("provider badge shows Local AI when Ollama is available", async ({ page }) => {
    await page.route("http://localhost:11434/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          response: "Local AI draft for testing.",
        }),
      });
    });

    await openRepairOrders(page, "admin");

    const primaryPanel = page.locator('[data-testid="openai-ai-assist-panel"]').first();
    await primaryPanel.getByTestId("openai-ai-generate-button").click();
    await expect(primaryPanel.getByText("Local AI (Free)", { exact: true })).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-draft-textarea")).toHaveValue(/Local AI draft for testing\./);
  });

  test("inspection shows the AI assist panel for allowed roles", async ({ page }) => {
    await openInspection(page, "admin");

    await expect(page.getByTestId("openai-ai-assist-panel")).toBeVisible();
    await expect(page.getByTestId("openai-ai-action-fix-grammar")).toBeVisible();
    await expect(page.getByTestId("openai-ai-action-explain-finding")).toBeVisible();
    await expect(page.getByTestId("openai-ai-action-summarize-inspection")).toBeVisible();
    await expect(page.getByTestId("openai-ai-action-customer-inspection-report")).toBeVisible();
    await page.getByTestId("openai-ai-generate-button").click();
    await expect(page.getByTestId("openai-ai-draft-textarea")).toHaveValue(/Inspection/i);
  });

  test("release shows the AI assist panel for allowed roles", async ({ page }) => {
    await openRelease(page, "admin");

    await expect(page.getByTestId("openai-ai-assist-panel")).toBeVisible();
    await expect(page.getByTestId("openai-ai-action-fix-grammar")).toBeVisible();
    await expect(page.getByTestId("openai-ai-action-draft-release-summary")).toBeVisible();
    await expect(page.getByTestId("openai-ai-action-sms-update")).toBeVisible();
  });

  test("quality control shows the AI assist panel for allowed roles", async ({ page }) => {
    await openQualityControl(page, "admin");

    await expect(page.getByTestId("openai-qc-ai-assist-panel")).toBeVisible();
    await expect(page.getByTestId("openai-qc-ai-action-qc-summary")).toBeVisible();
    await expect(page.getByTestId("openai-qc-ai-action-fix-grammar")).toBeVisible();
  });

  test("locked roles cannot use AI actions", async ({ page }) => {
    await openInspection(page, "mechanic");

    await expect(page.getByTestId("openai-ai-assist-panel")).toBeVisible();
    await expect(page.getByText(/limited to Admin and Service Advisor roles/i)).toBeVisible();
    await expect(page.getByTestId("openai-ai-generate-button")).toBeDisabled();
  });

  test("locked roles cannot generate customer messages", async ({ page }) => {
    await openRepairOrders(page, "office");

    const composer = page.getByTestId("customer-message-panel");
    await expect(composer).toBeVisible();
    await expect(composer.getByText(/limited to Admin and Service Advisor roles/i)).toBeVisible();
    await expect(composer.getByTestId("customer-message-generate-button")).toBeDisabled();
  });

  test("module toggle disables repair orders AI", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      window.localStorage.setItem(
        "dvi_ai_module_toggles_v1",
        JSON.stringify({
          repairOrders: false,
          inspection: true,
          qualityControl: true,
          release: true,
          reports: true,
          messages: true,
        })
      );
    });

    await openRepairOrders(page, "admin");

    const primaryPanel = page.locator('[data-testid="openai-ai-assist-panel"]').first();
    await expect(primaryPanel.getByText(/disabled in Settings/i)).toBeVisible();
    await expect(primaryPanel.getByTestId("openai-ai-generate-button")).toBeDisabled();
  });

  test("use draft leaves the original source text unchanged", async ({ page }) => {
    await openInspection(page, "admin");

    const source = page.getByTestId("openai-ai-source-textarea");
    const originalValue = await source.inputValue();
    await page.getByTestId("openai-ai-generate-button").click();
    await page.getByTestId("openai-ai-review-checkbox").check();
    await page.getByTestId("openai-ai-use-button").click();
    await expect(source).toHaveValue(originalValue);
  });

  test("history report builder renders for allowed roles and keeps the draft editable", async ({ page }) => {
    await openHistory(page, "admin");

    const builder = page.getByTestId("ai-report-panel");
    await expect(builder).toBeVisible();
    await expect(builder.getByTestId("ai-report-report-type")).toBeVisible();
    await expect(builder.getByTestId("ai-report-source-module")).toBeVisible();
    await expect(builder.getByTestId("ai-report-copy-button")).toBeVisible();
    await expect(builder.getByTestId("ai-report-use-button")).toBeVisible();
    await expect(builder.getByTestId("ai-report-reviewed-button")).toBeVisible();

    await builder.getByTestId("ai-report-report-type").selectOption({ label: "Maintenance Due Report" });
    await builder.getByTestId("ai-report-source-module").selectOption({ label: "Maintenance Timeline" });
    await expect(builder.getByTestId("ai-report-report-type")).toHaveValue("Maintenance Due Report");
    await expect(builder.getByTestId("ai-report-source-module")).toHaveValue("maintenance timeline");

    await builder.getByTestId("ai-report-generate-button").click();
    await builder.getByTestId("ai-report-review-checkbox").check();
    const draft = builder.getByTestId("ai-report-draft-textarea");
    await expect(draft).toHaveValue(/Summary|Findings \/ Work Done/i);
    await expect(builder.getByText(/Local AI \(Free\)|Cloud AI \(Paid fallback\)|Template \(No AI\)/i)).toBeVisible();

    await draft.fill("Edited report draft");
    await expect(draft).toHaveValue("Edited report draft");
    await builder.getByTestId("ai-report-review-checkbox").check();
    await builder.getByTestId("ai-report-use-button").click();
    await expect(builder.getByTestId("ai-report-customer-summary-textarea")).toHaveValue("Edited report draft");
  });

  test("locked roles cannot generate AI reports", async ({ page }) => {
    await openHistory(page, "office");

    const builder = page.getByTestId("ai-report-panel");
    await expect(builder).toBeVisible();
    await expect(builder.getByText(/limited to Admin and Service Advisor roles/i)).toBeVisible();
    await expect(builder.getByTestId("ai-report-generate-button")).toBeDisabled();
  });
});
