type MigrationModuleInput = {
  moduleKey?: string;
  tableName?: string;
  records?: unknown;
};

export type WorkflowPreviewInput = {
  intakes?: unknown;
  inspections?: unknown;
  repairOrders?: unknown;
  modules?: MigrationModuleInput[];
};

type PreviewRecord = Record<string, unknown>;

const VALID_STATUSES = new Set([
  "draft",
  "open",
  "pending",
  "waiting inspection",
  "waiting approval",
  "approved",
  "ready",
  "in progress",
  "waiting parts",
  "qc",
  "ready release",
  "released",
  "completed",
  "cancelled",
  "closed",
]);

function toRecords(value: unknown): PreviewRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  if (value && typeof value === "object") {
    return Object.values(value).filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  }
  return [];
}

function findModuleRecords(input: WorkflowPreviewInput, tableName: "intakes" | "inspections" | "repair_orders"): PreviewRecord[] {
  const direct = tableName === "intakes" ? input.intakes : tableName === "inspections" ? input.inspections : input.repairOrders;
  const directRecords = toRecords(direct);
  if (directRecords.length) return directRecords;
  const module = input.modules?.find((item) => item.tableName === tableName);
  return toRecords(module?.records);
}

function text(record: PreviewRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function statusWarnings(records: PreviewRecord[], label: string): string[] {
  return records
    .map((record, index) => ({ index, status: text(record, ["status"]) }))
    .filter((item) => item.status && !VALID_STATUSES.has(item.status.toLowerCase()))
    .map((item) => `${label} record ${item.index + 1} has unrecognized status "${item.status}".`);
}

function missingLinkWarnings(records: PreviewRecord[], label: string): string[] {
  return records
    .map((record, index) => ({
      index,
      customer: text(record, ["customerId", "localCustomerId", "customerName"]),
      vehicle: text(record, ["vehicleId", "localVehicleId", "plateNumber", "conductionNumber"]),
    }))
    .filter((item) => !item.customer || !item.vehicle)
    .map((item) => `${label} record ${item.index + 1} is missing ${!item.customer && !item.vehicle ? "customer and vehicle" : !item.customer ? "customer" : "vehicle"} linkage.`);
}

function duplicateRoWarnings(repairOrders: PreviewRecord[]): string[] {
  const counts = new Map<string, number>();
  for (const record of repairOrders) {
    const roNumber = text(record, ["repairOrderNumber", "roNumber", "number"]).toLowerCase();
    if (!roNumber) continue;
    counts.set(roNumber, (counts.get(roNumber) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([roNumber, count]) => `RO number "${roNumber}" appears ${count} times.`);
}

function duplicateIntakeWarnings(intakes: PreviewRecord[]): string[] {
  const counts = new Map<string, number>();
  for (const record of intakes) {
    const intakeNumber = text(record, ["intakeNumber", "number"]).toLowerCase();
    if (!intakeNumber) continue;
    counts.set(intakeNumber, (counts.get(intakeNumber) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([intakeNumber, count]) => `Intake number "${intakeNumber}" appears ${count} times.`);
}

export function buildWorkflowImportPreview(input: WorkflowPreviewInput) {
  const intakes = findModuleRecords(input, "intakes");
  const inspections = findModuleRecords(input, "inspections");
  const repairOrders = findModuleRecords(input, "repair_orders");
  const workLines = repairOrders.flatMap((record) => toRecords(record.workLines));
  const approvalMetadata = workLines.filter((line) => "approved" in line || "approvalStatus" in line);

  const missingCustomerVehicleLinks = [
    ...missingLinkWarnings(intakes, "Intake"),
    ...missingLinkWarnings(inspections, "Inspection"),
    ...missingLinkWarnings(repairOrders, "Repair order"),
  ];
  const invalidStatuses = [
    ...statusWarnings(intakes, "Intake"),
    ...statusWarnings(inspections, "Inspection"),
    ...statusWarnings(repairOrders, "Repair order"),
  ];
  const duplicateRoNumbers = duplicateRoWarnings(repairOrders);
  const duplicateIntakeNumbers = duplicateIntakeWarnings(intakes);

  const recordsNeedingReview = missingCustomerVehicleLinks.length + invalidStatuses.length + duplicateRoNumbers.length + duplicateIntakeNumbers.length;
  const totalRecords = intakes.length + inspections.length + repairOrders.length + workLines.length + approvalMetadata.length;

  return {
    totalIntakes: intakes.length,
    totalInspections: inspections.length,
    totalRepairOrders: repairOrders.length,
    totalWorkLines: workLines.length,
    totalApprovalMetadata: approvalMetadata.length,
    missingCustomerVehicleLinks,
    duplicateIntakeNumbers,
    duplicateRoNumbers,
    invalidStatuses,
    recordsReady: Math.max(totalRecords - recordsNeedingReview, 0),
    recordsNeedingReview,
    canCommit: false,
    warning: "Preview only. No intake, inspection, repair order, work line, or approval data was written to the database.",
  };
}
