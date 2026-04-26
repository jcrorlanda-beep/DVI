import { buildCustomerVehicleImportPreview, type CustomerVehiclePreviewInput } from "./customerVehiclePreview.js";
import { buildWorkflowImportPreview, type WorkflowPreviewInput } from "./workflowPreview.js";

type CorePreviewInput = CustomerVehiclePreviewInput & WorkflowPreviewInput;

export function buildCoreMigrationPreview(input: CorePreviewInput) {
  const customerVehiclePreview = buildCustomerVehicleImportPreview(input);
  const workflowPreview = buildWorkflowImportPreview(input);
  const totalRecords =
    customerVehiclePreview.totalCustomers +
    customerVehiclePreview.totalVehicles +
    workflowPreview.totalIntakes +
    workflowPreview.totalRepairOrders +
    workflowPreview.totalWorkLines;
  const recordsNeedingReview =
    customerVehiclePreview.recordsNeedingReview +
    workflowPreview.recordsNeedingReview;

  return {
    scope: "core-shop-data",
    totalCustomers: customerVehiclePreview.totalCustomers,
    totalVehicles: customerVehiclePreview.totalVehicles,
    totalIntakes: workflowPreview.totalIntakes,
    totalRepairOrders: workflowPreview.totalRepairOrders,
    totalWorkLines: workflowPreview.totalWorkLines,
    totalRecords,
    recordsReady: Math.max(totalRecords - recordsNeedingReview, 0),
    recordsNeedingReview,
    duplicateCustomers: customerVehiclePreview.duplicateCustomerWarnings,
    duplicatePlates: customerVehiclePreview.duplicatePlateWarnings,
    missingCustomerLinks: workflowPreview.missingCustomerVehicleLinks.filter((warning) => warning.includes("customer")),
    missingVehicleLinks: workflowPreview.missingCustomerVehicleLinks.filter((warning) => warning.includes("vehicle")),
    invalidStatuses: workflowPreview.invalidStatuses,
    duplicateIntakeNumbers: workflowPreview.duplicateIntakeNumbers,
    duplicateRoNumbers: workflowPreview.duplicateRoNumbers,
    canCommit: false,
    warning: "Preview only. No customer, vehicle, intake, repair order, or work line data was written to the database.",
  };
}
