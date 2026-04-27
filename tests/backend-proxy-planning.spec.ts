import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/");
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("settings shows the backend proxy planning flag for AI", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByTestId("nav-settings").click();
  await expect(page.getByTestId("deployment-readiness-panel")).toBeVisible();
  await expect(page.getByTestId("backend-data-mode")).toBeVisible();
  await expect(page.getByTestId("backend-api-url")).toBeVisible();
  await expect(page.getByTestId("backend-diagnostics-panel")).toBeVisible();
  await expect(page.getByTestId("backend-diagnostics-api-url")).toBeVisible();
  await expect(page.getByTestId("backend-localstorage-source-warning")).toContainText(/localStorage as the source of truth/i);
  await expect(page.getByTestId("backend-health-status")).toContainText(/not checked/i);
  await expect(page.getByTestId("backend-database-status")).toBeVisible();
  await expect(page.getByTestId("backend-ai-proxy-status")).toContainText(/future-only|frontend hybrid AI/i);
  await expect(page.getByTestId("backend-sms-proxy-status")).toContainText(/future-only|current SMS flow/i);
  await expect(page.getByTestId("backend-migration-preview-status")).toContainText(/read-only/i);
  await expect(page.getByTestId("backend-auth-status")).toContainText(/frontend login still uses localStorage/i);
  await expect(page.getByTestId("sync-status-planning-panel")).toBeVisible();
  await expect(page.getByTestId("ai-backend-mode")).toBeVisible();
  await expect(page.getByTestId("sms-backend-mode")).toBeVisible();
  await page.getByTestId("backend-data-mode").selectOption("Future Backend Enabled");
  await page.getByTestId("ai-backend-mode").selectOption("Backend Proxy Future");
  await page.getByTestId("sms-backend-mode").selectOption("Backend Proxy Future");
  await page.getByTestId("ai-backend-mode-save").click();
  await expect(page.getByText(/Backend planning mode saved/i)).toBeVisible();
});

test("settings backend health check fails safely when backend is offline", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByTestId("nav-settings").click();
  await expect(page.getByTestId("backend-diagnostics-panel")).toBeVisible();
  await page.getByTestId("backend-health-check-button").click();
  await expect(page.getByTestId("backend-health-status")).toContainText(/offline|online/i);
  await expect(page.getByTestId("backend-health-message")).toBeVisible();
});
