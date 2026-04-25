import { test, expect } from "@playwright/test";

test("app loads and login screen is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Workshop Management App/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Staff Sign In" })).toBeVisible();
});

test("admin can log in and see dashboard", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();

  await expect(page.getByRole("banner").getByText("Dashboard")).toBeVisible();
  await expect(page.getByRole("main").getByText("Welcome, System Admin")).toBeVisible();
});
