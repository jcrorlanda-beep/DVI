import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: Parameters<typeof test>[1] extends { page: infer P } ? P : never) {
  await page.goto("/");
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForLoadState("networkidle");
}

test("theme toggle button is visible in topbar after login", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByTestId("theme-toggle")).toBeVisible();
});

test("default theme is bright mode", async ({ page }) => {
  await loginAsAdmin(page);
  const toggle = page.getByTestId("theme-toggle");
  await expect(toggle).toHaveAttribute("aria-label", /dark mode/i);
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "bright");
});

test("clicking theme toggle switches to dark mode", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByTestId("theme-toggle").click();
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");
});

test("theme preference persists after toggle", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("settings page shows Appearance section with theme toggle button", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "ST Settings" }).click();
  await expect(page.getByText(/Appearance/i)).toBeVisible();
  await expect(page.getByTestId("settings-theme-toggle")).toBeVisible();
});

test("settings theme toggle changes mode", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "ST Settings" }).click();
  const settingsToggle = page.getByTestId("settings-theme-toggle");
  const html = page.locator("html");
  const initialTheme = await html.getAttribute("data-theme");
  await settingsToggle.click();
  const newTheme = await html.getAttribute("data-theme");
  expect(newTheme).not.toBe(initialTheme);
});

test("clicking toggle twice returns to original theme", async ({ page }) => {
  await loginAsAdmin(page);
  const html = page.locator("html");
  const startTheme = await html.getAttribute("data-theme");
  await page.getByTestId("theme-toggle").click();
  await page.getByTestId("theme-toggle").click();
  await expect(html).toHaveAttribute("data-theme", startTheme ?? "bright");
});
