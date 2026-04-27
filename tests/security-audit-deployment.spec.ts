import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, username: string, password: string) {
  await page.goto("/");
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("settings shows the security checklist and role audit", async ({ page }) => {
  await login(page, "admin", "admin123");
  await page.getByTestId("nav-settings").click();
  await expect(page.getByTestId("security-checklist-panel")).toBeVisible();
  await expect(page.getByTestId("security-module-audit-log")).toBeVisible();
  await expect(page.getByTestId("security-module-backup-restore")).toBeVisible();
});

test("restricted role still cannot access audit and backup", async ({ page }) => {
  await login(page, "advisor", "advisor123");
  await expect(page.getByRole("button", { name: "Audit Log", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Backup & Export", exact: true })).toHaveCount(0);
});

