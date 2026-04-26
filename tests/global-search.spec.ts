import { expect, test, type Page } from "@playwright/test";

async function seedGlobalSearchData(page: Page) {
  await page.addInitScript(() => {
    const now = new Date().toISOString();
    localStorage.setItem(
      "dvi_phase17d_bookings_v1",
      JSON.stringify([
        {
          id: "booking-1",
          bookingNumber: "BK-1001",
          createdAt: now,
          updatedAt: now,
          requestedDate: now.slice(0, 10),
          requestedTime: "09:00",
          customerName: "Search Customer",
          companyName: "",
          accountType: "Personal",
          phone: "",
          email: "",
          plateNumber: "ABC-123",
          conductionNumber: "",
          make: "Toyota",
          model: "Vios",
          year: "2019",
          serviceType: "PMS / Oil Change",
          serviceDetail: "5,000 km",
          requestedServices: ["PMS / Oil Change", "Brake Service"],
          concern: "Search concern",
          notes: "",
          status: "Pending",
          source: "Public",
          createdBy: "System",
        },
      ])
    );
    localStorage.setItem(
      "dvi_phase2_intake_records_v1",
      JSON.stringify([
        {
          id: "intake-1",
          intakeNumber: "INT-1001",
          createdAt: now,
          updatedAt: now,
          customerName: "Search Customer",
          companyName: "",
          accountType: "Personal",
          phone: "",
          email: "",
          plateNumber: "ABC-123",
          conductionNumber: "",
          make: "Toyota",
          model: "Vios",
          year: "2019",
          color: "White",
          odometerKm: "12000",
          fuelLevel: "Half",
          assignedAdvisor: "Service Advisor",
          concern: "Search concern",
          notes: "Search intake note",
          status: "Draft",
          encodedBy: "System",
        },
      ])
    );
    localStorage.setItem(
      "dvi_phase3_inspection_records_v1",
      JSON.stringify([
        {
          id: "inspection-1",
          inspectionNumber: "IP-1001",
          intakeId: "intake-1",
          intakeNumber: "INT-1001",
          createdAt: now,
          updatedAt: now,
          startedBy: "Tech",
          status: "Completed",
          accountLabel: "Search Customer",
          plateNumber: "ABC-123",
          conductionNumber: "",
          make: "Toyota",
          model: "Vios",
          year: "2019",
          color: "White",
          odometerKm: "12000",
          concern: "Inspection concern",
          evidenceItems: [],
          recommendedWork: "Brake Service",
          inspectionNotes: "Search inspection note",
        },
      ])
    );
    localStorage.setItem(
      "dvi_phase4_repair_orders_v1",
      JSON.stringify([
        {
          id: "ro-1",
          roNumber: "RO-1001",
          createdAt: now,
          updatedAt: now,
          sourceType: "Intake",
          intakeId: "intake-1",
          inspectionId: "inspection-1",
          intakeNumber: "INT-1001",
          inspectionNumber: "IP-1001",
          customerName: "Search Customer",
          companyName: "",
          accountType: "Personal",
          accountLabel: "Search Customer",
          phone: "",
          email: "",
          plateNumber: "ABC-123",
          conductionNumber: "",
          make: "Toyota",
          model: "Vios",
          year: "2019",
          color: "White",
          odometerKm: "12000",
          customerConcern: "RO concern",
          advisorName: "Service Advisor",
          status: "Waiting Approval",
          primaryTechnicianId: "",
          supportTechnicianIds: [],
          workLines: [],
          latestApprovalRecordId: "",
          deferredLineTitles: [],
          backjobReferenceRoId: "",
          findingRecommendationDecisions: [],
          encodedBy: "System",
        },
      ])
    );
    localStorage.setItem(
      "dvi_phase8_parts_requests_v1",
      JSON.stringify([
        {
          id: "pr-1",
          requestNumber: "PR-1001",
          roId: "ro-1",
          roNumber: "RO-1001",
          createdAt: now,
          updatedAt: now,
          requestedBy: "Service Advisor",
          status: "Requested",
          partName: "Brake Pads",
          partNumber: "BP-123",
          quantity: "2",
          urgency: "High",
          notes: "Need fast",
          customerSellingPrice: "0",
          selectedBidId: "",
          plateNumber: "ABC-123",
          vehicleLabel: "Toyota Vios 2019",
          accountLabel: "Search Customer",
          workshopPhotos: [],
          bids: [],
          returnRecords: [],
        },
      ])
    );
    localStorage.setItem(
      "dvi_vehicle_service_history_records_v1",
      JSON.stringify([
        {
          id: "svc-1",
          vehicleKey: "ABC123",
          plateNumber: "ABC-123",
          roId: "ro-1",
          roNumber: "RO-1001",
          serviceKey: "pms-oil-change",
          title: "PMS / Oil Change",
          category: "Maintenance",
          completedAt: now,
          odometerAtCompletion: "12000",
          sourceWorkLineId: "line-1",
          sourceType: "WorkLine",
          historyOrigin: "Seeded / Demo",
          createdAt: now,
          updatedAt: now,
        },
      ])
    );
    localStorage.setItem(
      "dvi_supplier_directory_v1",
      JSON.stringify([
        {
          id: "sup-1",
          supplierName: "Northeast Parts Supply",
          contactPerson: "Mina",
          phone: "",
          email: "",
          address: "",
          brandsCarried: "Toyota",
          categoriesSupplied: "Brakes, Maintenance",
          paymentTermsNote: "",
          deliveryTermsNote: "",
          active: true,
          createdAt: now,
          updatedAt: now,
        },
      ])
    );
  });
}

async function loadAdmin(page: Page) {
  await page.goto("/");
  await page.getByPlaceholder(/enter username/i).fill("admin");
  await page.getByPlaceholder(/enter password/i).fill("admin123");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

test("global search renders and finds records by plate, ro, supplier, and empty state", async ({ page }) => {
  await seedGlobalSearchData(page);
  await loadAdmin(page);

  await expect(page.getByTestId("global-search-panel")).toBeVisible();
  await page.getByTestId("global-search-input").fill("ABC-123");
  await expect(page.getByTestId("global-search-group-repair-order")).toBeVisible();
  await expect(page.getByTestId("global-search-result-repair-order-ro-1")).toBeVisible();
  await page.getByTestId("global-search-result-repair-order-ro-1").click();
  await expect(page.getByText(/Repair Orders/i).first()).toBeVisible();

  await page.getByRole("button", { name: "Dashboard", exact: true }).click();
  await page.getByTestId("global-search-input").fill("Northeast");
  await expect(page.getByTestId("global-search-group-Supplier")).toBeVisible();
  await expect(page.getByText(/Northeast Parts Supply/i)).toBeVisible();

  await page.getByTestId("global-search-input").fill("zzzz-no-match");
  await expect(page.getByTestId("global-search-empty")).toBeVisible();
});
