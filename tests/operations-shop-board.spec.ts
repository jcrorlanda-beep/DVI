import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username = "admin", password = "admin123") {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("technician schedule, bay board, capacity panel, and shop command board render", async ({ page }) => {
  await loadDemoAs(page);

  await expect(page.getByTestId("technician-schedule-board")).toBeVisible();
  await expect(page.getByTestId("technician-schedule-date")).toBeVisible();
  await expect(page.locator('[data-testid^="technician-schedule-row-"]').first()).toBeVisible();

  await expect(page.getByTestId("bay-management-board")).toBeVisible();
  await expect(page.locator('[data-testid^="bay-card-"]').first()).toBeVisible();

  await expect(page.getByTestId("capacity-planning-panel")).toBeVisible();
  await expect(page.getByText(/Active Jobs/i)).toBeVisible();
  await expect(page.getByText(/Workload Score/i)).toBeVisible();

  await expect(page.getByTestId("shop-command-board")).toBeVisible();
  await expect(page.getByTestId("shop-board-lane-Waiting-Inspection")).toBeVisible();
  await expect(page.getByTestId("shop-board-lane-Waiting-Approval")).toBeVisible();
  await expect(page.getByTestId("shop-board-lane-In-Progress")).toBeVisible();
});

test("bay assignment and shop board filters can be changed safely", async ({ page }) => {
  await loadDemoAs(page);

  const firstBaySelect = page.locator('[data-testid^="bay-select-"]').first();
  await firstBaySelect.selectOption({ index: 1 });
  await page.locator('[data-testid^="bay-card-"]').first().getByRole("button", { name: "Assign" }).click();
  await expect(page.locator('[data-testid^="bay-card-"]').first()).not.toContainText("No vehicle assigned.");

  await page.getByTestId("shop-board-status-filter").selectOption("Waiting Approval");
  await expect(page.getByTestId("shop-board-lane-Waiting-Approval")).toBeVisible();
  await page.getByTestId("shop-board-priority-filter").selectOption("High");
  await expect(page.getByTestId("shop-command-board")).toBeVisible();
});

test("shop floor timer controls remain available", async ({ page }) => {
  await loadDemoAs(page);

  await page.getByRole("button", { name: /Shop Floor/i }).click();
  await expect(page.getByRole("main")).toContainText(/Start \/ Resume Timer|Pause|Complete Line/i);
});
