import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username: string, password: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("admin sees the full operational dashboard and critical nav items", async ({ page }) => {
  await loadDemoAs(page, "admin", "admin123");

  await expect(page.getByTestId("nav-expenses")).toBeVisible();
  await expect(page.getByTestId("nav-payments")).toBeVisible();
  await expect(page.getByTestId("nav-audit")).toBeVisible();
  await expect(page.getByTestId("nav-backup")).toBeVisible();
  await expect(page.getByTestId("advisor-action-center-panel")).toBeVisible();
  await expect(page.getByTestId("owner-executive-dashboard")).toBeVisible();
});

test("office staff can access payments but still sees locked admin-only areas", async ({ page }) => {
  await loadDemoAs(page, "office", "office123");

  await expect(page.getByTestId("nav-payments")).toBeVisible();
  await expect(page.getByText(/Owner Executive Dashboard/i)).toBeVisible();
  await expect(page.getByText(/Access blocked for the current role/i).first()).toBeVisible();
});

test("service advisor can use booking and repair order workflow but not audit or backup", async ({ page }) => {
  await loadDemoAs(page, "advisor", "advisor123");

  await expect(page.getByTestId("nav-bookings")).toBeVisible();
  await expect(page.getByTestId("nav-repairOrders")).toBeVisible();
  await expect(page.getByTestId("advisor-action-center-panel")).toBeVisible();
  await expect(page.getByTestId("nav-audit")).toHaveCount(0);
  await expect(page.getByTestId("nav-backup")).toHaveCount(0);
});
