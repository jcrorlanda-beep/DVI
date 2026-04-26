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

  await expect(page.getByRole("button", { name: "Expenses", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Payments", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Audit Log", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Backup & Export", exact: true })).toBeVisible();
  await expect(page.getByText(/Advisor Action Center/i)).toBeVisible();
  await expect(page.getByText(/Owner Executive Dashboard/i)).toBeVisible();
});

test("office staff can access payments but still sees locked admin-only areas", async ({ page }) => {
  await loadDemoAs(page, "office", "office123");

  await expect(page.getByRole("button", { name: "Payments", exact: true })).toBeVisible();
  await expect(page.getByText(/Owner Executive Dashboard/i)).toBeVisible();
  await expect(page.getByText(/Access blocked for the current role/i)).toBeVisible();
});

test("service advisor can use booking and repair order workflow but not audit or backup", async ({ page }) => {
  await loadDemoAs(page, "advisor", "advisor123");

  await expect(page.getByRole("button", { name: "Bookings", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Repair Orders", exact: true })).toBeVisible();
  await expect(page.getByText(/Advisor Action Center/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Audit Log", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Backup & Export", exact: true })).toHaveCount(0);
});

