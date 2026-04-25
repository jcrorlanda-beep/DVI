import { expect, test, type Page } from "@playwright/test";

async function loadDemoAndOpenRepairOrders(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.getByRole("button", { name: "RO Repair Orders" }).click();
}

async function openSelectedVehicle(page: Page, plateText: string, statusText?: string) {
  let row = page.getByRole("button").filter({ hasText: plateText });
  if (statusText) {
    row = row.filter({ hasText: statusText });
  }
  await row.first().click();
}

test("specific match beats general match", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openSelectedVehicle(page, "NEX-7788", "Waiting Approval");

  const panel = page.getByTestId("maintenance-suggestions-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Toyota Fortuner 2021 periodic maintenance package")).toBeVisible();
  await expect(panel.getByText("5,000 km periodic maintenance package")).toHaveCount(0);
  await expect(panel.getByTestId("maintenance-suggestion-category-Periodic Maintenance").locator('[data-testid^="maintenance-suggestion-card-"]')).toHaveCount(1);
});

test("duplicate-purpose suggestion appears once only", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openSelectedVehicle(page, "NEX-7788", "Waiting Approval");

  const panel = page.getByTestId("maintenance-suggestions-panel");
  await expect(panel.getByTestId("maintenance-suggestion-category-Periodic Maintenance").locator('[data-testid^="maintenance-suggestion-card-"]')).toHaveCount(1);
});

test("already added work line blocks repeat suggestion", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openSelectedVehicle(page, "NEX-7788", "Waiting Approval");

  const panel = page.getByTestId("maintenance-suggestions-panel");
  await panel.getByTestId("maintenance-add-workline-library-library-pms-fortuner").click();

  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-pms-fortuner")).toHaveCount(0);
});

test("already added recommendation blocks repeat suggestion", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openSelectedVehicle(page, "NEX-7788", "Waiting Approval");

  const panel = page.getByTestId("maintenance-suggestions-panel");
  await panel.getByTestId("maintenance-add-recommendation-library-library-pms-fortuner").click();

  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-pms-fortuner")).toHaveCount(0);
});

test("within interval suppresses same vehicle suggestions", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openSelectedVehicle(page, "NEX-2451", "In Progress");

  const panel = page.getByTestId("maintenance-suggestions-panel");
  await expect(panel.getByText("5,000 km periodic maintenance package")).toHaveCount(0);
  await expect(panel.getByText("Toyota Fortuner 2021 periodic maintenance package")).toHaveCount(0);
  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-pms-fortuner")).toHaveCount(0);
  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-suspension-fortuner")).toHaveCount(0);
  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-brake-general")).toBeVisible();
});

test("library override interval takes priority over default", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openSelectedVehicle(page, "NEX-7788", "Waiting Approval");

  const panel = page.getByTestId("maintenance-suggestions-panel");
  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-pms-fortuner")).toBeVisible();
  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-pms-fortuner").getByText("Every 12 months / 10,000 km")).toBeVisible();
  await expect(panel.getByText("5,000 km periodic maintenance package")).toHaveCount(0);
});

test("same service on different vehicle still shows", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openSelectedVehicle(page, "NEX-7788", "Waiting Approval");

  const panel = page.getByTestId("maintenance-suggestions-panel");
  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-pms-fortuner")).toBeVisible();
});

test("different service interval behaves correctly", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openSelectedVehicle(page, "NEX-2451", "In Progress");

  const panel = page.getByTestId("maintenance-suggestions-panel");
  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-suspension-fortuner")).toHaveCount(0);
  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-brake-general")).toBeVisible();
});

test("dismiss hides the suggestion for the current context", async ({ page }) => {
  await loadDemoAndOpenRepairOrders(page);
  await openSelectedVehicle(page, "NEX-7788", "Waiting Approval");

  const panel = page.getByTestId("maintenance-suggestions-panel");
  await panel.getByTestId("maintenance-dismiss-library-library-pms-fortuner").click();

  await expect(panel.getByTestId("maintenance-suggestion-card-library-library-pms-fortuner")).toHaveCount(0);
});
