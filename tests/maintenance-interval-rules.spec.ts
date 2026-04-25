import { expect, test, type Locator, type Page } from "@playwright/test";

async function loadDemoAndOpenSettings(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.getByRole("button", { name: "ST Settings" }).click();
  await expect(page.getByTestId("maintenance-interval-rules-panel")).toBeVisible();
}

async function openRepairOrder(page: Page, plateText: string, statusText?: string) {
  await page.getByRole("button", { name: "RO Repair Orders" }).click();
  let row = page.locator("button").filter({ hasText: plateText });
  if (statusText) {
    row = row.filter({ hasText: statusText });
  }
  await row.first().click();
}

async function fillNewMaintenanceRule(panel: Locator, values: {
  serviceKey: string;
  title: string;
  category: string;
  kmInterval: string;
  timeValue: string;
  timeUnit: "Days" | "Months";
  make: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  adminNote: string;
}) {
  await panel.getByTestId("maintenance-interval-new-serviceKey").fill(values.serviceKey);
  await panel.getByTestId("maintenance-interval-new-title").fill(values.title);
  await panel.getByTestId("maintenance-interval-new-category").fill(values.category);
  await panel.getByTestId("maintenance-interval-new-kmInterval").fill(values.kmInterval);
  await panel.getByTestId("maintenance-interval-new-timeValue").fill(values.timeValue);
  await panel.getByTestId("maintenance-interval-new-timeUnit").selectOption(values.timeUnit);
  await panel.getByTestId("maintenance-interval-new-make").fill(values.make);
  await panel.getByTestId("maintenance-interval-new-model").fill(values.model);
  await panel.getByTestId("maintenance-interval-new-yearFrom").fill(values.yearFrom);
  await panel.getByTestId("maintenance-interval-new-yearTo").fill(values.yearTo);
  await panel.getByTestId("maintenance-interval-new-adminNote").fill(values.adminNote);
  await panel.getByTestId("maintenance-interval-rule-add").click();
}

async function findRuleCardId(page: Page, title: string) {
  const cards = page.locator('[data-testid^="maintenance-interval-rule-card-"]');
  const count = await cards.count();
  if (count === 0) {
    throw new Error(`Unable to find rule card for "${title}"`);
  }
  const card = cards.last();
  await expect(card.locator('input[data-testid$="-title"]')).toHaveValue(title);
  const testId = await card.getAttribute("data-testid");
  if (!testId) {
    throw new Error(`Unable to read rule card test id for "${title}"`);
  }
  return testId.replace("maintenance-interval-rule-card-", "");
}

test("admin-managed maintenance rules can be created, edited, disabled, and override defaults", async ({ page }) => {
  await loadDemoAndOpenSettings(page);

  const settingsPanel = page.getByTestId("maintenance-interval-rules-panel");
  await fillNewMaintenanceRule(settingsPanel, {
    serviceKey: "pms-5000",
    title: "Toyota Fortuner 2021 PMS Override",
    category: "Periodic Maintenance",
    kmInterval: "5000",
    timeValue: "12",
    timeUnit: "Months",
    make: "Toyota",
    model: "Fortuner",
    yearFrom: "2021",
    yearTo: "2021",
    adminNote: "Specific override for the demo Fortuner.",
  });

  const overrideRuleId = await findRuleCardId(page, "Toyota Fortuner 2021 PMS Override");
  const overrideRuleCard = page.getByTestId(`maintenance-interval-rule-card-${overrideRuleId}`);
  await expect(overrideRuleCard).toBeVisible();
  const overrideNoteInput = page.getByTestId(`maintenance-interval-rule-${overrideRuleId}-adminNote`);
  await overrideNoteInput.fill("Updated specific override for the demo Fortuner.");
  await page.getByTestId(`maintenance-interval-rule-save-${overrideRuleId}`).click();
  await expect(overrideNoteInput).toHaveValue("Updated specific override for the demo Fortuner.");

  await page.getByRole("button", { name: "RO Repair Orders" }).click();
  await openRepairOrder(page, "NEX-7788", "Waiting Approval");
  const maintenancePanel = page.getByTestId("maintenance-suggestions-panel");
  await expect(maintenancePanel.getByText("Every 12 months / 5,000 km")).toBeVisible();

  await page.getByRole("button", { name: "ST Settings" }).click();
  await page.getByTestId(`maintenance-interval-rule-toggle-${overrideRuleId}`).click();
  await expect(page.getByTestId(`maintenance-interval-rule-card-${overrideRuleId}`)).toContainText("Inactive");

  await page.getByRole("button", { name: "RO Repair Orders" }).click();
  await openRepairOrder(page, "NEX-7788", "Waiting Approval");
  await expect(maintenancePanel.getByText("Every 12 months / 10,000 km")).toBeVisible();
});
