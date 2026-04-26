import { expect, test, type Page } from "@playwright/test";

async function loadDemoAs(page: Page, username = "admin", password = "admin123") {
  await page.goto("/");
  await page.getByRole("button", { name: "Load Simulated Data" }).click();
  await page.getByPlaceholder(/enter username/i).fill(username);
  await page.getByPlaceholder(/enter password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("data migration helpers keep legacy bookings and payments readable", async ({ page }) => {
  await loadDemoAs(page);

  await page.evaluate(() => {
    localStorage.setItem(
      "dvi_phase17d_bookings_v1",
      JSON.stringify([
        {
          id: "legacy-booking-1",
          bookingNumber: "BK-LEGACY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          requestedDate: new Date().toISOString().slice(0, 10),
          requestedTime: "08:00",
          customerName: "Legacy Customer",
          companyName: "",
          accountType: "Personal",
          phone: "",
          email: "",
          plateNumber: "LEG-123",
          conductionNumber: "",
          make: "Toyota",
          model: "Vios",
          year: "2018",
          serviceType: "PMS / Oil Change",
          serviceDetail: "5,000 km",
          concern: "Legacy concern",
          notes: "",
          status: "Pending",
          source: "Public",
          createdBy: "Legacy",
        },
      ])
    );
    localStorage.setItem(
      "dvi_phase10_payment_records_v1",
      JSON.stringify([
        {
          id: "pay-legacy-1",
          paymentNumber: "PAY-LEGACY",
          invoiceId: "inv-legacy",
          roId: "ro-legacy",
          roNumber: "RO-LEGACY",
          createdAt: new Date().toISOString(),
          receivedBy: "System",
        },
      ])
    );
  });

  await page.reload();
  await page.getByRole("button", { name: "Bookings", exact: true }).click();
  await expect(page.getByText(/Legacy Customer/i)).toBeVisible();
  await expect(page.getByText(/PMS\/Oil Change|PMS/i)).toBeVisible();

  await page.getByRole("button", { name: "Payments", exact: true }).click();
  await expect(page.getByText(/PAY-LEGACY/i)).toBeVisible();
  await expect(page.getByText(/0\.00|Waived|Unpaid/i)).toBeVisible();

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByText(/Data Migration/i)).toBeVisible();
  await expect(page.getByText(/Always export a fresh backup/i)).toBeVisible();
});

