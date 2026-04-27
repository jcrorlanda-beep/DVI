import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/");
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.getByText("Dashboard", { exact: true })).toBeVisible();
}

test("core pages open and legacy booking records do not crash", async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByRole("button", { name: "Bookings", exact: true }).click();
  await expect(page.getByTestId("booking-calendar-panel")).toBeVisible();

  await page.getByRole("button", { name: "Repair Orders", exact: true }).click();
  await expect(page.getByText(/Repair Orders/i)).toBeVisible();

  await page.getByRole("button", { name: "Parts", exact: true }).click();
  await expect(page.getByTestId("inventory-control-panel")).toBeVisible();
  await expect(page.getByTestId("purchase-order-lite-panel")).toBeVisible();

  await page.getByRole("button", { name: "Expenses", exact: true }).click();
  await expect(page.getByText("Expense Tracking")).toBeVisible();

  await page.getByRole("button", { name: "Payments", exact: true }).click();
  await expect(page.getByText("Payment Tracking")).toBeVisible();

  await page.getByRole("button", { name: "Backup & Export", exact: true }).click();
  await expect(page.getByText("Backup & Export Center")).toBeVisible();

  await page.addInitScript(() => {
    const now = new Date().toISOString();
    localStorage.setItem(
      "dvi_phase17d_bookings_v1",
      JSON.stringify([
        {
          id: "legacy-booking-smoke",
          bookingNumber: "BKG-LEGACY-SMOKE",
          createdAt: now,
          updatedAt: now,
          requestedDate: "2099-05-01",
          requestedTime: "08:00",
          customerName: "Legacy Smoke Customer",
          companyName: "",
          accountType: "Personal",
          phone: "09170000010",
          email: "",
          plateNumber: "LEG-999",
          conductionNumber: "",
          make: "Toyota",
          model: "Corolla",
          year: "2020",
          serviceType: "Brake Service",
          serviceDetail: "Brake inspection",
          concern: "Legacy booking without requestedServices",
          notes: "",
          status: "New",
          source: "Staff",
          createdBy: "admin",
        },
      ])
    );
    localStorage.setItem(
      "dvi_phase1_session_v2",
      JSON.stringify({
        id: "usr_admin",
        username: "admin",
        fullName: "System Admin",
        role: "Admin",
        active: true,
        createdAt: now,
      })
    );
    localStorage.setItem("dvi_phase1_current_view_v2", "bookings");
  });
  await page.reload();
  await expect(page.getByTestId("booking-calendar-panel")).toBeVisible();
  await expect(page.getByText("Legacy Smoke Customer")).toBeVisible();
});

test("customer portal and settings restore pages stay readable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Demo Customer Portal" }).click();
  await expect(page.getByText("Customer Portal", { exact: true })).toBeVisible();
  await expect(page.getByText(/Read-only customer view/i)).toBeVisible();

  await page.goto("/");
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.getByTestId("nav-settings").click();
  await expect(page.getByText("Data Quality + Legacy Cleanup")).toBeVisible();
  await expect(page.getByTestId("data-quality-cleanup")).toBeVisible();
});
