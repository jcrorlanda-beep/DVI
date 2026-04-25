import { getUnifiedMaintenanceSuggestions, groupSuggestionsByCategory } from "./App";

function expect(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildHistoryRecord(overrides: Record<string, unknown>) {
  return {
    id: "ro-history",
    roNumber: "RO-0001",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sourceType: "Intake",
    intakeId: "intake-history",
    inspectionId: "insp-history",
    intakeNumber: "INT-0001",
    inspectionNumber: "INSP-0001",
    customerName: "History Customer",
    companyName: "",
    accountType: "Individual",
    accountLabel: "History Customer",
    phone: "",
    email: "",
    plateNumber: "ABC-1234",
    conductionNumber: "",
    make: "Toyota",
    model: "Fortuner",
    year: "2021",
    color: "White",
    odometerKm: "5000",
    customerConcern: "",
    advisorName: "Advisor",
    status: "Released",
    primaryTechnicianId: "",
    supportTechnicianIds: [],
    workLines: [],
    latestApprovalRecordId: "",
    deferredLineTitles: [],
    backjobReferenceRoId: "",
    findingRecommendationDecisions: [],
    encodedBy: "system",
    ...overrides,
  } as const;
}

export const maintenanceSuggestionResolverTestCases = [
  {
    name: "suppresses recently completed work on the same vehicle",
    run() {
      const suggestions = getUnifiedMaintenanceSuggestions({
        make: "Toyota",
        model: "Fortuner",
        year: "2021",
        odometerKm: "5000",
        plateNumber: "ABC-1234",
        serviceHistoryRepairOrders: [
          buildHistoryRecord({
            updatedAt: "2026-04-01T00:00:00.000Z",
            workLines: [
              {
                id: "wl-1",
                title: "5,000 km periodic maintenance package",
                category: "Periodic Maintenance",
                status: "Completed",
                approvalDecision: "Approved",
                completedAt: "2026-04-01T00:00:00.000Z",
                priority: "Medium",
                serviceEstimate: "0",
                partsEstimate: "0",
                totalEstimate: "0",
                notes: "",
                customerDescription: "",
                laborHours: "",
                laborRate: "",
                partsCost: "",
                partsMarkupPercent: "",
              },
            ],
          }) as any,
        ],
      });

      expect(
        !suggestions.some((suggestion) => suggestion.serviceKey === "pms-5000"),
        "recent same-vehicle PMS should be suppressed"
      );
    },
  },
  {
    name: "keeps older service history visible again after the suppression window",
    run() {
      const suggestions = getUnifiedMaintenanceSuggestions({
        make: "Toyota",
        model: "Fortuner",
        year: "2021",
        odometerKm: "5000",
        plateNumber: "ABC-1234",
        serviceHistoryRepairOrders: [
          buildHistoryRecord({
            updatedAt: "2025-01-01T00:00:00.000Z",
            workLines: [
              {
                id: "wl-1",
                title: "5,000 km periodic maintenance package",
                category: "Periodic Maintenance",
                status: "Completed",
                approvalDecision: "Approved",
                completedAt: "2025-01-01T00:00:00.000Z",
                priority: "Medium",
                serviceEstimate: "0",
                partsEstimate: "0",
                totalEstimate: "0",
                notes: "",
                customerDescription: "",
                laborHours: "",
                laborRate: "",
                partsCost: "",
                partsMarkupPercent: "",
              },
            ],
          }) as any,
        ],
      });

      expect(
        suggestions.some((suggestion) => suggestion.serviceKey === "pms-5000"),
        "older same-vehicle PMS should become visible again"
      );
    },
  },
  {
    name: "ignores service history from a different vehicle",
    run() {
      const suggestions = getUnifiedMaintenanceSuggestions({
        make: "Toyota",
        model: "Fortuner",
        year: "2021",
        odometerKm: "5000",
        plateNumber: "ABC-1234",
        serviceHistoryRepairOrders: [
          buildHistoryRecord({
            plateNumber: "XYZ-9999",
            workLines: [
              {
                id: "wl-1",
                title: "5,000 km periodic maintenance package",
                category: "Periodic Maintenance",
                status: "Completed",
                approvalDecision: "Approved",
                completedAt: "2026-04-01T00:00:00.000Z",
                priority: "Medium",
                serviceEstimate: "0",
                partsEstimate: "0",
                totalEstimate: "0",
                notes: "",
                customerDescription: "",
                laborHours: "",
                laborRate: "",
                partsCost: "",
                partsMarkupPercent: "",
              },
            ],
          }) as any,
        ],
      });

      expect(
        suggestions.some((suggestion) => suggestion.serviceKey === "pms-5000"),
        "different-vehicle history should not suppress suggestions"
      );
    },
  },
  {
    name: "still prefers the most specific matching suggestion",
    run() {
      const suggestions = getUnifiedMaintenanceSuggestions({
        make: "Toyota",
        model: "Fortuner",
        year: "2021",
        odometerKm: "5000",
        plateNumber: "ABC-1234",
        serviceHistoryRepairOrders: [],
      });

      const pmsSuggestions = suggestions.filter((suggestion) => suggestion.serviceKey === "pms-5000");
      expect(pmsSuggestions.length === 1, "duplicate purpose suggestions should collapse to one row");
      expect(
        pmsSuggestions[0]?.title === "Toyota Fortuner 2021 periodic maintenance package",
        "the most specific matching suggestion should remain"
      );

      const grouped = groupSuggestionsByCategory(suggestions);
      expect(
        grouped.some((group) => group.category === "Periodic Maintenance"),
        "grouping should remain intact"
      );
    },
  },
] as const;

export function runMaintenanceSuggestionResolverTestCases() {
  maintenanceSuggestionResolverTestCases.forEach((testCase) => testCase.run());
}
