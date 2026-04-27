import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/");
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.getByRole("banner").getByText("Dashboard")).toBeVisible();
}

async function openStaffBookings(page: Page) {
  await loginAsAdmin(page);
  await page.getByTestId("nav-bookings").click();
  await expect(page.getByTestId("booking-calendar-panel")).toBeVisible();
}

test("internal booking can select multiple services and convert to intake", async ({ page }) => {
  const uniqueName = `Booking QA ${Date.now()}`;
  await openStaffBookings(page);

  await page.getByLabel(/Customer Name/i).fill(uniqueName);
  await page.getByLabel(/Phone/i).fill("09170000001");
  await page.getByLabel(/Plate Number/i).fill("QA-1234");
  await page.getByLabel(/Make/i).fill("Toyota");
  await page.getByLabel(/Model/i).fill("Vios");
  await page.getByLabel(/Year/i).fill("2021");
  await page.getByLabel(/Concern/i).fill("Oil change and alignment request");

  await page.getByTestId("staff-booking-chip-brake-service").click();
  await page.getByTestId("staff-booking-chip-wheel-alignment").click();
  await expect(page.getByTestId("staff-booking-chip-brake-service")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("staff-booking-chip-wheel-alignment")).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Save Booking" }).click();

  await expect(page.getByText(uniqueName)).toBeVisible();
  await expect(page.getByText(/PMS \/ Oil Change, Brake Service, Wheel Alignment/i)).toBeVisible();

  await page.getByRole("button", { name: "Convert to Intake" }).first().click();

  const intakeConcern = await page.evaluate(() => {
    const key = "dvi_phase2_intake_records_v1";
    const rows = JSON.parse(localStorage.getItem(key) || "[]") as Array<{ customerName?: string; concern?: string }>;
    const latest = rows.find((row) => row.customerName?.includes("Booking QA"));
    return latest?.concern || "";
  });
  expect(intakeConcern).toContain("Requested services:");
  expect(intakeConcern).toContain("Brake Service");
  expect(intakeConcern).toContain("Wheel Alignment");
});

test("customer portal booking can select multiple services", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open Demo Customer Portal" }).click();
  await expect(page.getByText("Customer Portal", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Book Service", exact: true }).click();

  await page.getByLabel(/Preferred Date/i).fill("2099-01-15");
  await page.getByLabel(/Preferred Time/i).fill("09:30");
  await page.getByLabel(/Concern \/ Request/i).fill("Need diagnostics and AC service");
  await page.getByTestId("customer-booking-chip-diagnostics").click();
  await page.getByTestId("customer-booking-chip-ac-service").click();

  await expect(page.getByTestId("customer-booking-chip-diagnostics")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("customer-booking-chip-ac-service")).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Submit Booking Request" }).click();

  await expect(page.getByText("My Booking Requests", { exact: true })).toBeVisible();
  await expect(page.getByText(/Diagnostics, AC Service/i)).toBeVisible();
});

test("public booking flow can select multiple services and stores requestedServices", async ({ page }) => {
  const uniqueName = `Public Booking QA ${Date.now()}`;
  await page.goto("/");
  await page.getByRole("button", { name: "Book Service", exact: true }).click();

  await page.getByLabel(/Customer Name/i).fill(uniqueName);
  await page.getByLabel(/Phone/i).fill("09170000002");
  await page.getByLabel(/Email/i).fill("public.booking@example.com");
  await page.getByLabel(/Plate Number/i).fill("PUB-5678");
  await page.getByLabel(/Make/i).fill("Honda");
  await page.getByLabel(/Model/i).fill("Civic");
  await page.getByLabel(/Year/i).fill("2020");
  await page.getByLabel(/Preferred Date/i).fill("2099-02-20");
  await page.getByLabel(/Preferred Time/i).fill("10:00");
  await page.getByLabel(/Concern \/ Requested Service/i).fill("Need PMS and tire service");
  await page.getByTestId("public-booking-chip-pms-oil-change").click();
  await page.getByTestId("public-booking-chip-tire-service").click();

  await expect(page.getByTestId("public-booking-chip-pms-oil-change")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("public-booking-chip-tire-service")).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Submit Public Booking" }).click();

  const bookings = await page.evaluate((bookingName) => {
    const rows = JSON.parse(localStorage.getItem("dvi_phase17d_bookings_v1") || "[]") as Array<{ customerName?: string; requestedServices?: string[] }>;
    return rows.filter((row) => row.customerName === bookingName);
  }, uniqueName);
  const created = bookings[0];
  expect(created?.requestedServices || []).toContain("PMS / Oil Change");
  expect(created?.requestedServices || []).toContain("Tire Service");
});

test("old booking records without requestedServices render safely", async ({ page }) => {
  await page.addInitScript(() => {
    const key = "dvi_phase17d_bookings_v1";
    const now = new Date().toISOString();
    const seed = [
      {
        id: "legacy-booking-1",
        bookingNumber: "BKG-LEGACY-001",
        createdAt: now,
        updatedAt: now,
        requestedDate: "2099-03-01",
        requestedTime: "08:30",
        customerName: "Legacy Booking Customer",
        companyName: "",
        accountType: "Personal",
        phone: "09170000003",
        email: "",
        plateNumber: "LEG-100",
        conductionNumber: "",
        make: "Toyota",
        model: "Corolla",
        year: "2019",
        serviceType: "Brake Service",
        serviceDetail: "Brake inspection",
        concern: "Legacy booking without requestedServices",
        notes: "",
        status: "New",
        source: "Staff",
        createdBy: "admin",
      },
    ];
    localStorage.setItem(key, JSON.stringify(seed));
  });

  await loginAsAdmin(page);
  await page.getByTestId("nav-bookings").click();
  await expect(page.getByText("Legacy Booking Customer")).toBeVisible();
  await expect(page.getByText(/Brake Service/i)).toBeVisible();
});
