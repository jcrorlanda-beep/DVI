type MigrationModuleInput = {
  moduleKey?: string;
  tableName?: string;
  records?: unknown;
};

export type WorkflowExtendedPreviewInput = {
  inspections?: unknown;
  qcRecords?: unknown;
  releaseRecords?: unknown;
  backjobRecords?: unknown;
  serviceHistory?: unknown;
  modules?: MigrationModuleInput[];
};

type PreviewRecord = Record<string, unknown>;

const VALID_STATUSES = new Set(["draft", "open", "pending", "in progress", "failed", "passed", "ready", "released", "completed", "closed", "cancelled"]);

function toRecords(value: unknown): PreviewRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  if (value && typeof value === "object") {
    return Object.values(value).filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  }
  return [];
}

function findRecords(input: WorkflowExtendedPreviewInput, directKey: keyof WorkflowExtendedPreviewInput, tableName: string, aliases: string[] = []) {
  const directRecords = toRecords(input[directKey]);
  if (directRecords.length) return directRecords;
  const accepted = new Set([String(directKey), tableName, ...aliases]);
  return toRecords(input.modules?.find((item) => accepted.has(String(item.tableName ?? "")) || accepted.has(String(item.moduleKey ?? "")))?.records);
}

function text(record: PreviewRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function duplicateWarnings(records: PreviewRecord[], keys: string[], label: string): string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = text(record, keys).toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => `${label} "${key}" appears ${count} times.`);
}

function missingLinkWarnings(records: PreviewRecord[], label: string, keys: string[], linkLabel: string): string[] {
  return records
    .map((record, index) => ({ index, link: text(record, keys) }))
    .filter((item) => !item.link)
    .map((item) => `${label} record ${item.index + 1} is missing ${linkLabel} linkage.`);
}

function invalidStatuses(records: PreviewRecord[], label: string): string[] {
  return records
    .map((record, index) => ({ index, status: text(record, ["status", "result"]) }))
    .filter((item) => item.status && !VALID_STATUSES.has(item.status.toLowerCase()))
    .map((item) => `${label} record ${item.index + 1} has unrecognized status/result "${item.status}".`);
}

function invalidDates(records: PreviewRecord[], label: string, field: string): string[] {
  return records
    .map((record, index) => ({ index, value: record[field] }))
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "" && (typeof item.value !== "string" || Number.isNaN(Date.parse(item.value))))
    .map((item) => `${label} record ${item.index + 1} has invalid ${field}.`);
}

function invalidOdometers(records: PreviewRecord[]): string[] {
  return records
    .map((record, index) => ({ index, value: record.odometer }))
    .filter((item) => item.value !== undefined && item.value !== null && (typeof item.value !== "number" || !Number.isFinite(item.value) || item.value < 0))
    .map((item) => `Service history record ${item.index + 1} has an invalid odometer value.`);
}

export function buildWorkflowExtendedPreview(input: WorkflowExtendedPreviewInput) {
  const inspections = findRecords(input, "inspections", "inspections");
  const qcRecords = findRecords(input, "qcRecords", "qc_records", ["qc"]);
  const releaseRecords = findRecords(input, "releaseRecords", "release_records", ["releases"]);
  const backjobRecords = findRecords(input, "backjobRecords", "backjob_records", ["backjobs"]);
  const serviceHistory = findRecords(input, "serviceHistory", "service_history_records", ["service_history"]);

  const warnings = {
    missingRoLinks: [
      ...missingLinkWarnings(qcRecords, "QC", ["repairOrderId", "localRepairOrderId", "repairOrderNumber"], "RO"),
      ...missingLinkWarnings(releaseRecords, "Release", ["repairOrderId", "localRepairOrderId", "repairOrderNumber"], "RO"),
      ...missingLinkWarnings(backjobRecords, "Backjob", ["originalRepairOrderId", "localOriginalRepairOrderId", "originalRepairOrderNumber"], "original RO"),
    ],
    missingVehicleLinks: [
      ...missingLinkWarnings(inspections, "Inspection", ["vehicleId", "localVehicleId", "plateNumber", "conductionNumber"], "vehicle"),
      ...missingLinkWarnings(serviceHistory, "Service history", ["vehicleId", "localVehicleId", "plateNumber"], "vehicle"),
    ],
    missingCustomerLinks: [
      ...missingLinkWarnings(inspections, "Inspection", ["customerId", "localCustomerId", "customerName"], "customer"),
      ...missingLinkWarnings(serviceHistory, "Service history", ["customerId", "localCustomerId", "customerName"], "customer"),
    ],
    invalidStatuses: [
      ...invalidStatuses(inspections, "Inspection"),
      ...invalidStatuses(qcRecords, "QC"),
      ...invalidStatuses(releaseRecords, "Release"),
      ...invalidStatuses(backjobRecords, "Backjob"),
    ],
    duplicateNumbers: [
      ...duplicateWarnings(inspections, ["inspectionNumber"], "Inspection number"),
      ...duplicateWarnings(qcRecords, ["qcNumber"], "QC number"),
      ...duplicateWarnings(releaseRecords, ["releaseNumber"], "Release number"),
      ...duplicateWarnings(backjobRecords, ["backjobNumber"], "Backjob number"),
    ],
    invalidServiceHistoryDates: invalidDates(serviceHistory, "Service history", "completedAt"),
    invalidOdometerValues: invalidOdometers(serviceHistory),
  };

  const totalRecords = inspections.length + qcRecords.length + releaseRecords.length + backjobRecords.length + serviceHistory.length;
  const recordsNeedingReview = Object.values(warnings).reduce((sum, list) => sum + list.length, 0);

  return {
    totalInspections: inspections.length,
    totalQcRecords: qcRecords.length,
    totalReleaseRecords: releaseRecords.length,
    totalBackjobRecords: backjobRecords.length,
    totalServiceHistoryRecords: serviceHistory.length,
    totalRecords,
    recordsReady: Math.max(totalRecords - recordsNeedingReview, 0),
    recordsNeedingReview,
    ...warnings,
    canCommit: false,
    warning: "Preview only. No inspection, QC, release, backjob, or service history data was written to the database.",
  };
}
