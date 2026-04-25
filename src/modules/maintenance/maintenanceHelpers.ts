import type {
  MaintenanceIntervalRuleRecord,
  RepairOrderRecord,
  RepairOrderWorkLine,
  VehicleServiceHistoryRecord,
} from "../shared/types";

export type ServiceHistoryReportRow = {
  id: string;
  vehicleKey: string;
  plateNumber: string;
  customerLabel: string;
  vehicleLabel: string;
  roId: string;
  roNumber: string;
  serviceKey: string;
  title: string;
  category: string;
  completedAt: string;
  odometerAtCompletion: string;
  historyOrigin: "Writeback" | "Seeded / Demo";
  sourceTypeLabel: string;
};

export type ServiceHistoryReportFilters = {
  vehicleKey?: string;
  plateNumber?: string;
  customerLabel?: string;
  category?: string;
  serviceTerm?: string;
  roNumber?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type ServiceHistoryVehicleOption = {
  vehicleKey: string;
  plateNumber: string;
  customerLabel: string;
  vehicleLabel: string;
  count: number;
};

export type ServiceHistorySummary = {
  totalServiceHistoryEntries: number;
  totalCompletedVisits: number;
  mostRecentServiceDate: string;
  categoryTotals: Array<{ category: string; count: number }>;
};

export type ServiceHistoryReportSnapshot = {
  rows: ServiceHistoryReportRow[];
  filteredRows: ServiceHistoryReportRow[];
  vehicleOptions: ServiceHistoryVehicleOption[];
  categoryOptions: string[];
  summary: ServiceHistorySummary;
};

export type VehicleMaintenanceTimelineCompletedItem = ServiceHistoryReportRow & {
  timelineStatus: "Completed";
};

export type VehicleMaintenanceTimelineUpcomingItem = {
  id: string;
  vehicleKey: string;
  plateNumber: string;
  customerLabel: string;
  vehicleLabel: string;
  roNumber: string;
  serviceKey: string;
  title: string;
  category: string;
  dueBasis: string;
  timelineStatus: "Due Soon" | "Due Now" | "Overdue";
  dueReason: string;
  nextDueDate: string;
  nextDueOdometer: string;
  lastCompletedAt: string;
  lastCompletedOdometer: string;
  sourceTypeLabel: string;
};

export type VehicleMaintenanceTimelineData = {
  completed: VehicleMaintenanceTimelineCompletedItem[];
  upcoming: VehicleMaintenanceTimelineUpcomingItem[];
};

export type MaintenanceTimelineStatus = "completed" | "dueSoon" | "dueNow" | "overdue";

export type MaintenanceTimelineFilterMode = "all" | "upcoming" | "completed" | "dueSoon" | "dueNow" | "overdue";

export type TimelineGroupMode = "status" | "category" | "none";

export type TimelineSortMode = "priorityFirst" | "newestActivity" | "oldestFirst";

export type TimelineVehicleSummary = {
  vehicleId: string;
  plateNumber?: string;
  make?: string;
  model?: string;
  year?: number | string;
  customerName?: string;
  currentMileage?: number;
};

export type TimelineUpcomingItem = {
  id: string;
  serviceKey: string;
  title: string;
  category: string;
  status: "dueSoon" | "dueNow" | "overdue";
  sourceLabel?: string;
  sourceType?: "rule" | "library" | "resolver";
  specificityLabel?: string;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  lastCompletedAt?: string | null;
  lastCompletedMileage?: number | null;
  currentMileage?: number | null;
  kmDelta?: number | null;
  timeDeltaDays?: number | null;
  dueSummaryText?: string;
  whyShowingLines?: string[];
  isVehicleSpecific?: boolean;
  plateNumber?: string;
  vehicleLabel?: string;
  customerName?: string;
  repairOrderNumber?: string;
  dueBasis?: string;
  nextDueDate?: string | null;
  nextDueOdometer?: string | null;
  sourceTypeLabel?: string;
};

export type TimelineCompletedItem = {
  id: string;
  serviceKey: string;
  title: string;
  category: string;
  status: "completed";
  roId?: string;
  repairOrderNumber?: string;
  completedAt: string;
  odometerAtCompletion?: number | null;
  sourceLabel?: string;
  technicianName?: string;
  vehicleId?: string;
  vehicleLabel?: string;
  plateNumber?: string;
  sourceTypeLabel?: string;
};

export type TimelineCounts = {
  overdue: number;
  dueNow: number;
  dueSoon: number;
  completed: number;
  totalUpcoming: number;
  totalVisible: number;
};

export type TimelineFiltersState = {
  search: string;
  category: string;
  mode: MaintenanceTimelineFilterMode;
  sort: TimelineSortMode;
  groupBy: TimelineGroupMode;
};

export type TimelineLatestCompletedItem = {
  id: string;
  title: string;
  completedAt: string;
  repairOrderNumber?: string;
};

export type MaintenanceInsight = {
  id: string;
  label: string;
  value: string;
  tone?: "neutral" | "info" | "warning" | "critical" | "good";
};

export type VehicleMaintenanceTimelineContext = {
  selectedVehicleKey: string;
  selectedVehicleLabel: string;
  selectedPlateNumber: string;
  selectedCustomerLabel: string;
  selectedVehicleMake: string;
  selectedVehicleModel: string;
  selectedVehicleYear: string;
  currentOdometer: string;
  serviceHistoryRows: ServiceHistoryReportRow[];
  maintenanceIntervalRules: MaintenanceIntervalRuleRecord[];
};

type ServiceIntervalRule = {
  mileageKm?: number;
  days?: number;
  months?: number;
};

function normalizeText(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeVehicleKey(plateNumber: string, conductionNumber: string) {
  const normalizedPlate = (plateNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const normalizedConduction = (conductionNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return normalizedPlate || normalizedConduction || "";
}

function getVehicleAccountLabel(record: { companyName: string; customerName: string }) {
  return record.companyName || record.customerName || "Unknown Customer";
}

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseOdometerValue(value: string) {
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMaintenanceYear(value: string) {
  const normalized = String(value ?? "").replace(/[^0-9]/g, "").trim();
  if (!normalized) return null;
  const parsed = Number(normalized.slice(0, 4));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeMaintenanceText(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getVehicleServiceHistoryServiceKey(line: RepairOrderWorkLine) {
  const directKey = normalizeMaintenanceText(line.serviceKey ?? "");
  if (directKey) return directKey;
  const titleKey = normalizeMaintenanceText(line.title);
  if (titleKey) return titleKey;
  const fallbackKey = normalizeMaintenanceText([line.customerDescription, line.category, line.notes].filter(Boolean).join(" "));
  return fallbackKey;
}

function isCompletedServiceROStatus(status: RepairOrderRecord["status"]) {
  return status === "Ready Release" || status === "Released" || status === "Closed";
}

export function buildVehicleServiceHistoryRecord(ro: RepairOrderRecord, line: RepairOrderWorkLine): VehicleServiceHistoryRecord | null {
  if (!isCompletedServiceROStatus(ro.status)) return null;
  if (line.status !== "Completed") return null;
  if (line.approvalDecision !== "Approved") return null;

  const completedAt = line.completedAt || line.approvalAt || ro.updatedAt || ro.createdAt;
  if (!completedAt || Number.isNaN(new Date(completedAt).getTime())) return null;

  const serviceKey = getVehicleServiceHistoryServiceKey(line);
  const title = line.title.trim() || line.customerDescription.trim() || serviceKey || "Completed Service";
  const category = line.category.trim() || "General";
  const vehicleKey = normalizeVehicleKey(ro.plateNumber, ro.conductionNumber);
  if (!vehicleKey) return null;
  const isRecommendationConverted = !!line.sourceRecommendationId || String(line.recommendationSource ?? "").startsWith("Finding:");
  const isSeededDemoHistory = new Date(ro.createdAt).getFullYear() < new Date().getFullYear();

  return {
    id: `${ro.id}:${line.id}`,
    vehicleKey,
    plateNumber: ro.plateNumber || "",
    roId: ro.id,
    roNumber: ro.roNumber,
    serviceKey: serviceKey || normalizeMaintenanceText(title),
    title,
    category,
    completedAt,
    odometerAtCompletion: ro.odometerKm || "",
    sourceWorkLineId: line.id,
    sourceType: isRecommendationConverted ? "Recommendation" : "WorkLine",
    historyOrigin: isSeededDemoHistory ? "Seeded / Demo" : "Writeback",
    createdAt: completedAt,
    updatedAt: new Date().toISOString(),
  };
}

export function sameVehicleServiceHistoryRecord(a: VehicleServiceHistoryRecord, b: VehicleServiceHistoryRecord) {
  return (
    a.vehicleKey === b.vehicleKey &&
    a.plateNumber === b.plateNumber &&
    a.roId === b.roId &&
    a.roNumber === b.roNumber &&
    a.serviceKey === b.serviceKey &&
    a.title === b.title &&
    a.category === b.category &&
    a.completedAt === b.completedAt &&
    a.odometerAtCompletion === b.odometerAtCompletion &&
    a.sourceWorkLineId === b.sourceWorkLineId &&
    a.sourceType === b.sourceType &&
    a.historyOrigin === b.historyOrigin
  );
}

export function syncVehicleServiceHistoryRecords(existingRecords: VehicleServiceHistoryRecord[], repairOrders: RepairOrderRecord[]) {
  const next = new Map(existingRecords.map((record) => [record.id, record]));
  let changed = false;

  repairOrders.forEach((ro) => {
    ro.workLines.forEach((line) => {
      const historyRecord = buildVehicleServiceHistoryRecord(ro, line);
      if (!historyRecord) return;
      const current = next.get(historyRecord.id);
      if (current && sameVehicleServiceHistoryRecord(current, historyRecord)) return;
      next.set(historyRecord.id, current ? { ...current, ...historyRecord } : historyRecord);
      changed = true;
    });
  });

  if (!changed) return existingRecords;
  return Array.from(next.values()).sort((a, b) => b.completedAt.localeCompare(a.completedAt) || b.updatedAt.localeCompare(a.updatedAt));
}

function buildServiceHistoryReportRows(
  serviceHistoryRecords: VehicleServiceHistoryRecord[],
  repairOrders: RepairOrderRecord[]
): ServiceHistoryReportRow[] {
  const repairOrdersById = new Map(repairOrders.map((row) => [row.id, row] as const));

  return serviceHistoryRecords
    .map((record) => {
      const ro = repairOrdersById.get(record.roId);
      const customerLabel = getVehicleAccountLabel({
        companyName: ro?.companyName ?? "",
        customerName: ro?.customerName ?? "",
      });
      const vehicleLabel = [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || record.vehicleKey || "Unknown Vehicle";

      return {
        id: record.id,
        vehicleKey: record.vehicleKey,
        plateNumber: record.plateNumber || ro?.plateNumber || "",
        customerLabel,
        vehicleLabel,
        roId: record.roId,
        roNumber: record.roNumber,
        serviceKey: record.serviceKey || "",
        title: record.title || "Service History Entry",
        category: record.category || "General",
        completedAt: record.completedAt,
        odometerAtCompletion: record.odometerAtCompletion || "",
        historyOrigin: record.historyOrigin ?? "Writeback",
        sourceTypeLabel: record.sourceType === "Recommendation" ? "Recommendation writeback" : "RO writeback",
      };
    })
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt) || b.title.localeCompare(a.title));
}

function buildServiceHistoryVehicleOptions(rows: ServiceHistoryReportRow[]) {
  const options = new Map<string, ServiceHistoryVehicleOption>();
  rows.forEach((row) => {
    const existing = options.get(row.vehicleKey);
    if (existing) {
      existing.count += 1;
      return;
    }
    options.set(row.vehicleKey, {
      vehicleKey: row.vehicleKey,
      plateNumber: row.plateNumber,
      customerLabel: row.customerLabel,
      vehicleLabel: row.vehicleLabel,
      count: 1,
    });
  });

  return Array.from(options.values()).sort((a, b) => {
    const left = `${a.plateNumber || a.vehicleKey} ${a.customerLabel} ${a.vehicleLabel}`;
    const right = `${b.plateNumber || b.vehicleKey} ${b.customerLabel} ${b.vehicleLabel}`;
    return left.localeCompare(right);
  });
}

function buildServiceHistoryCategoryOptions(rows: ServiceHistoryReportRow[]) {
  const categories = new Set<string>();
  rows.forEach((row) => categories.add(row.category || "General"));
  return ["All Categories", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
}

export function getVehicleServiceHistory(
  vehicleKey: string,
  serviceHistoryRecords: VehicleServiceHistoryRecord[],
  repairOrders: RepairOrderRecord[]
) {
  return buildServiceHistoryReportRows(serviceHistoryRecords, repairOrders).filter((row) => row.vehicleKey === vehicleKey);
}

export function getFilteredServiceHistory(rows: ServiceHistoryReportRow[], filters: ServiceHistoryReportFilters) {
  const plateTerm = normalizeText(filters.plateNumber ?? "");
  const customerTerm = normalizeText(filters.customerLabel ?? "");
  const serviceTerm = normalizeText(filters.serviceTerm ?? "");
  const roTerm = normalizeText(filters.roNumber ?? "");
  const dateFrom = String(filters.dateFrom ?? "").trim();
  const dateTo = String(filters.dateTo ?? "").trim();

  return rows.filter((row) => {
    const completedDate = row.completedAt.slice(0, 10);
    const matchesVehicle = !filters.vehicleKey || row.vehicleKey === filters.vehicleKey;
    const matchesPlate = !plateTerm || [row.plateNumber, row.vehicleKey].join(" ").toLowerCase().includes(plateTerm);
    const matchesCustomer = !customerTerm || row.customerLabel.toLowerCase().includes(customerTerm);
    const category = row.category || "General";
    const matchesCategory = !filters.category || filters.category === "All Categories" || category === filters.category;
    const matchesService = !serviceTerm || [row.serviceKey, row.title].filter(Boolean).join(" ").toLowerCase().includes(serviceTerm);
    const matchesRo = !roTerm || normalizeText(row.roNumber).includes(roTerm);
    const matchesDateFrom = !dateFrom || completedDate >= dateFrom;
    const matchesDateTo = !dateTo || completedDate <= dateTo;
    return (
      matchesVehicle &&
      matchesPlate &&
      matchesCustomer &&
      matchesCategory &&
      matchesService &&
      matchesRo &&
      matchesDateFrom &&
      matchesDateTo
    );
  });
}

export function buildServiceHistorySummary(rows: ServiceHistoryReportRow[]): ServiceHistorySummary {
  const categoryTotals = new Map<string, number>();
  const completedVisits = new Set<string>();
  let mostRecentServiceDate = "";

  rows.forEach((row) => {
    const category = row.category || "General";
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + 1);
    completedVisits.add(row.roId || row.roNumber);
    if (!mostRecentServiceDate || row.completedAt > mostRecentServiceDate) {
      mostRecentServiceDate = row.completedAt;
    }
  });

  return {
    totalServiceHistoryEntries: rows.length,
    totalCompletedVisits: completedVisits.size,
    mostRecentServiceDate,
    categoryTotals: Array.from(categoryTotals.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category)),
  };
}

export function buildServiceHistoryCsv(rows: ServiceHistoryReportRow[]) {
  const headers = [
    "Completed At",
    "RO Number",
    "Plate Number",
    "Customer",
    "Vehicle",
    "Service Key",
    "Title",
    "Category",
    "Odometer",
    "Source",
    "History Origin",
  ];

  const lines = rows.map((row) =>
    [
      row.completedAt,
      row.roNumber,
      row.plateNumber,
      row.customerLabel,
      row.vehicleLabel,
      row.serviceKey,
      row.title,
      row.category,
      row.odometerAtCompletion,
      row.sourceTypeLabel,
      row.historyOrigin,
    ]
      .map((value) => escapeCsvCell(String(value ?? "")))
      .join(",")
  );

  return [headers.map(escapeCsvCell).join(","), ...lines].join("\r\n");
}

export function buildReportSnapshot({
  serviceHistoryRecords,
  repairOrders,
  filters = {},
}: {
  serviceHistoryRecords: VehicleServiceHistoryRecord[];
  repairOrders: RepairOrderRecord[];
  filters?: ServiceHistoryReportFilters;
}): ServiceHistoryReportSnapshot {
  const rows = buildServiceHistoryReportRows(serviceHistoryRecords, repairOrders);
  const filteredRows = getFilteredServiceHistory(rows, filters);

  return {
    rows,
    filteredRows,
    vehicleOptions: buildServiceHistoryVehicleOptions(rows),
    categoryOptions: buildServiceHistoryCategoryOptions(rows),
    summary: buildServiceHistorySummary(filteredRows),
  };
}

function addMonthsToDate(dateValue: string, months: number) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  date.setMonth(date.getMonth() + months);
  return date;
}

function addDaysToDate(dateValue: string, days: number) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date;
}

function getTimelineNormalizedServiceKey(value: string) {
  return normalizeText(value);
}

function parseTimelineIntervalRule(record: MaintenanceIntervalRuleRecord) {
  const mileageKm = Number(String(record.kmInterval ?? "").replace(/,/g, "").trim());
  const timeValue = Number(String(record.timeIntervalValue ?? "").replace(/,/g, "").trim());
  const rule: { mileageKm?: number; days?: number; months?: number } = {};

  if (Number.isFinite(mileageKm) && mileageKm > 0) {
    rule.mileageKm = mileageKm;
  }
  if (Number.isFinite(timeValue) && timeValue > 0) {
    if (record.timeIntervalUnit === "Days") {
      rule.days = timeValue;
    } else {
      rule.months = timeValue;
    }
  }

  return rule;
}

function normalizeTimelineYear(value: string) {
  const parsed = Number(String(value ?? "").replace(/[^0-9]/g, "").slice(0, 4));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getMaintenanceRuleSpecificity(record: MaintenanceIntervalRuleRecord, make: string, model: string, year: string) {
  const normalizedMake = normalizeText(make);
  const normalizedModel = normalizeText(model);
  const normalizedYear = normalizeTimelineYear(year);
  const ruleMake = normalizeText(record.make);
  const ruleModel = normalizeText(record.model);
  const yearFrom = normalizeTimelineYear(record.yearFrom);
  const yearTo = normalizeTimelineYear(record.yearTo);

  if (record.make.trim() && record.model.trim() && (yearFrom != null || yearTo != null)) {
    if (
      normalizedMake === ruleMake &&
      normalizedModel === ruleModel &&
      normalizedYear != null &&
      (yearFrom == null || normalizedYear >= yearFrom) &&
      (yearTo == null || normalizedYear <= yearTo)
    ) {
      return 4;
    }
    return 3;
  }
  if (record.make.trim() && record.model.trim()) {
    return normalizedMake === ruleMake && normalizedModel === ruleModel ? 3 : 2;
  }
  if (record.make.trim()) {
    return normalizedMake === ruleMake ? 2 : 1;
  }
  return 1;
}

function matchesMaintenanceRule(record: MaintenanceIntervalRuleRecord, make: string, model: string, year: string) {
  if (!record.active) return false;
  const normalizedMake = normalizeText(make);
  const normalizedModel = normalizeText(model);
  const normalizedYear = normalizeTimelineYear(year);
  const ruleMake = normalizeText(record.make);
  const ruleModel = normalizeText(record.model);
  const yearFrom = normalizeTimelineYear(record.yearFrom);
  const yearTo = normalizeTimelineYear(record.yearTo);

  if (record.make.trim() && normalizedMake !== ruleMake) return false;
  if (record.model.trim() && normalizedModel !== ruleModel) return false;
  if ((yearFrom != null || yearTo != null) && normalizedYear == null) return false;
  if (normalizedYear != null && yearFrom != null && normalizedYear < yearFrom) return false;
  if (normalizedYear != null && yearTo != null && normalizedYear > yearTo) return false;
  return true;
}

function resolveMaintenanceRuleForVehicle(
  serviceKey: string,
  make: string,
  model: string,
  year: string,
  rules: MaintenanceIntervalRuleRecord[]
) {
  const normalizedServiceKey = getTimelineNormalizedServiceKey(serviceKey);
  return rules
    .filter((rule) => getTimelineNormalizedServiceKey(rule.serviceKey) === normalizedServiceKey && matchesMaintenanceRule(rule, make, model, year))
    .sort((a, b) => {
      const aSpecificity = getMaintenanceRuleSpecificity(a, make, model, year);
      const bSpecificity = getMaintenanceRuleSpecificity(b, make, model, year);
      if (bSpecificity !== aSpecificity) return bSpecificity - aSpecificity;
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    })[0] ?? null;
}

function getTimelineRuleLabel(rule: MaintenanceIntervalRuleRecord) {
  const parts: string[] = [];
  const km = Number(String(rule.kmInterval ?? "").replace(/,/g, "").trim());
  const timeValue = Number(String(rule.timeIntervalValue ?? "").replace(/,/g, "").trim());
  if (Number.isFinite(km) && km > 0) parts.push(`${new Intl.NumberFormat("en-US").format(km)} km`);
  if (Number.isFinite(timeValue) && timeValue > 0) {
    parts.push(`${timeValue} ${rule.timeIntervalUnit === "Days" ? "days" : "months"}`);
  }
  return parts.length ? `Every ${parts.join(" / ")}` : "Interval not set";
}

function getTimelineFallbackRule(serviceKey: string) {
  const normalized = getTimelineNormalizedServiceKey(serviceKey);
  const lookupKey = normalized.replace(/\s+/g, "-");
  const fallback: Record<
    string,
    { title: string; category: string; kmInterval: string; timeIntervalValue: string; timeIntervalUnit: "Days" | "Months" }
  > = {
    "pms-5000": { title: "5,000 km periodic maintenance package", category: "Periodic Maintenance", kmInterval: "5000", timeIntervalValue: "6", timeIntervalUnit: "Months" },
    "pms-10000": { title: "10,000 km air, cabin, brake, and underchassis inspection package", category: "Periodic Maintenance", kmInterval: "10000", timeIntervalValue: "12", timeIntervalUnit: "Months" },
    "pms-20000": { title: "20,000 km intake, brake, battery, and suspension check package", category: "Periodic Maintenance", kmInterval: "20000", timeIntervalValue: "18", timeIntervalUnit: "Months" },
    "suspension-review": { title: "Suspension and steering review", category: "Suspension", kmInterval: "20000", timeIntervalValue: "12", timeIntervalUnit: "Months" },
    "alignment-review": { title: "Wheel alignment", category: "Alignment", kmInterval: "10000", timeIntervalValue: "12", timeIntervalUnit: "Months" },
    "air-intake-review": { title: "EGR and intake manifold cleaning (if applicable)", category: "Engine", kmInterval: "30000", timeIntervalValue: "24", timeIntervalUnit: "Months" },
    "brake-review": { title: "Brake inspection and cleaning", category: "Brakes", kmInterval: "15000", timeIntervalValue: "12", timeIntervalUnit: "Months" },
    "battery-review": { title: "Battery and charging system inspection", category: "Electrical", kmInterval: "25000", timeIntervalValue: "18", timeIntervalUnit: "Months" },
    "ac-review": { title: "Air conditioning performance inspection", category: "Air Conditioning", kmInterval: "25000", timeIntervalValue: "18", timeIntervalUnit: "Months" },
    "cooling-review": { title: "Cooling system inspection", category: "Cooling", kmInterval: "30000", timeIntervalValue: "24", timeIntervalUnit: "Months" },
    "major-service-review": { title: "Major service review with timing belt/chain inspection", category: "Periodic Maintenance", kmInterval: "40000", timeIntervalValue: "24", timeIntervalUnit: "Months" },
  };

  const row = fallback[lookupKey] ?? fallback[normalized];
  if (!row) return null;

  return {
    id: `fallback-${normalized}`,
    serviceKey: normalized,
    title: row.title,
    category: row.category,
    kmInterval: row.kmInterval,
    timeIntervalValue: row.timeIntervalValue,
    timeIntervalUnit: row.timeIntervalUnit,
    active: true,
    adminNote: "Fallback timeline rule",
    make: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    createdAt: "",
    updatedAt: "",
  } satisfies MaintenanceIntervalRuleRecord;
}

function getTimelineDueStatus(
  rule: MaintenanceIntervalRuleRecord,
  currentOdometer: number | null,
  completedAt: string,
  completedOdometer: string
) {
  const parsedCompletedOdometer = Number(String(completedOdometer ?? "").replace(/,/g, "").trim());
  const dueAtKm = Number.isFinite(parsedCompletedOdometer) && parsedCompletedOdometer > 0
    ? (Number(String(rule.kmInterval ?? "").replace(/,/g, "").trim()) || 0) + parsedCompletedOdometer
    : null;
  const dueDate = rule.timeIntervalValue && Number(String(rule.timeIntervalValue).trim()) > 0
    ? rule.timeIntervalUnit === "Days"
      ? addDaysToDate(completedAt, Number(String(rule.timeIntervalValue).trim()))
      : addMonthsToDate(completedAt, Number(String(rule.timeIntervalValue).trim()))
    : null;

  const remainingKm = dueAtKm != null && currentOdometer != null ? dueAtKm - currentOdometer : null;
  const remainingDays = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const kmInterval = Number(String(rule.kmInterval ?? "").replace(/,/g, "").trim()) || null;
  const timeIntervalValue = Number(String(rule.timeIntervalValue ?? "").replace(/,/g, "").trim()) || null;
  const overdue = (remainingKm != null && remainingKm < 0) || (remainingDays != null && remainingDays < 0);
  if (overdue) {
    return {
      status: "Overdue" as const,
      dueReason:
        remainingKm != null && remainingKm < 0
          ? `${Math.abs(remainingKm)} km overdue`
          : remainingDays != null && remainingDays < 0
            ? `${Math.abs(remainingDays)} days overdue`
            : "Overdue",
      nextDueDate: dueDate ? dueDate.toISOString() : "",
      nextDueOdometer: dueAtKm != null ? `${Math.max(0, dueAtKm)}` : "",
    };
  }

  const dueNowKmThreshold = kmInterval != null ? Math.max(500, Math.ceil(kmInterval * 0.2)) : null;
  const dueSoonKmThreshold = kmInterval != null ? Math.max(1000, Math.ceil(kmInterval * 0.5)) : null;
  const dueNowDaysThreshold = timeIntervalValue != null ? Math.max(30, Math.ceil(timeIntervalValue * 0.2)) : null;
  const dueSoonDaysThreshold = timeIntervalValue != null ? Math.max(90, Math.ceil(timeIntervalValue * 0.5)) : null;

  const dueNow = (remainingKm != null && dueNowKmThreshold != null && remainingKm <= dueNowKmThreshold) || (remainingDays != null && dueNowDaysThreshold != null && remainingDays <= dueNowDaysThreshold);
  const dueSoon = !dueNow && ((remainingKm != null && dueSoonKmThreshold != null && remainingKm <= dueSoonKmThreshold) || (remainingDays != null && dueSoonDaysThreshold != null && remainingDays <= dueSoonDaysThreshold));

  if (dueNow) {
    return {
      status: "Due Now" as const,
      dueReason:
        remainingKm != null
          ? `${Math.max(0, remainingKm)} km remaining`
          : remainingDays != null
            ? `${Math.max(0, remainingDays)} days remaining`
            : "Due now",
      nextDueDate: dueDate ? dueDate.toISOString() : "",
      nextDueOdometer: dueAtKm != null ? `${Math.max(0, dueAtKm)}` : "",
    };
  }

  if (dueSoon) {
    return {
      status: "Due Soon" as const,
      dueReason:
        remainingKm != null
          ? `${Math.max(0, remainingKm)} km remaining`
          : remainingDays != null
            ? `${Math.max(0, remainingDays)} days remaining`
            : "Due soon",
      nextDueDate: dueDate ? dueDate.toISOString() : "",
      nextDueOdometer: dueAtKm != null ? `${Math.max(0, dueAtKm)}` : "",
    };
  }

  return null;
}

export function getUpcomingMaintenance(context: VehicleMaintenanceTimelineContext): VehicleMaintenanceTimelineData {
  const completed = context.serviceHistoryRows
    .filter((row) => row.vehicleKey === context.selectedVehicleKey)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt) || b.id.localeCompare(a.id))
    .map((row) => ({
      ...row,
      timelineStatus: "Completed" as const,
    }));

  const currentOdometerValue = parseOdometerValue(context.currentOdometer);
  const upcoming: VehicleMaintenanceTimelineUpcomingItem[] = [];

  const seenServiceKeys = new Set<string>();
  completed.forEach((latestCompleted) => {
    const serviceKey = getTimelineNormalizedServiceKey(latestCompleted.serviceKey || latestCompleted.title);
    if (!serviceKey || seenServiceKeys.has(serviceKey)) return;
    seenServiceKeys.add(serviceKey);

    const resolvedRule =
      resolveMaintenanceRuleForVehicle(serviceKey, context.selectedVehicleMake, context.selectedVehicleModel, context.selectedVehicleYear, context.maintenanceIntervalRules.filter((rule) => rule.active)) ??
      getTimelineFallbackRule(serviceKey);
    if (!resolvedRule) return;

    const dueState = getTimelineDueStatus(
      resolvedRule,
      Number.isFinite(currentOdometerValue ?? NaN) ? currentOdometerValue : null,
      latestCompleted.completedAt,
      latestCompleted.odometerAtCompletion
    );
    if (!dueState) return;

    upcoming.push({
      id: `${latestCompleted.id}:${resolvedRule.id}`,
      vehicleKey: context.selectedVehicleKey,
      plateNumber: context.selectedPlateNumber,
      customerLabel: context.selectedCustomerLabel,
      vehicleLabel: context.selectedVehicleLabel,
      roNumber: latestCompleted.roNumber,
      serviceKey: resolvedRule.serviceKey,
      title: resolvedRule.title || latestCompleted.title,
      category: resolvedRule.category || latestCompleted.category || "General",
      dueBasis: getTimelineRuleLabel(resolvedRule),
      timelineStatus: dueState.status,
      dueReason: dueState.dueReason,
      nextDueDate: dueState.nextDueDate,
      nextDueOdometer: dueState.nextDueOdometer,
      lastCompletedAt: latestCompleted.completedAt,
      lastCompletedOdometer: latestCompleted.odometerAtCompletion,
      sourceTypeLabel: latestCompleted.sourceTypeLabel,
    });
  });

  upcoming.sort((a, b) => {
    const severity = (value: VehicleMaintenanceTimelineUpcomingItem["timelineStatus"]) => {
      if (value === "Overdue") return 0;
      if (value === "Due Now") return 1;
      return 2;
    };
    const severityDiff = severity(a.timelineStatus) - severity(b.timelineStatus);
    if (severityDiff !== 0) return severityDiff;
    return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
  });

  return { completed, upcoming };
}

export function toTimelineUpcomingItem(
  item: VehicleMaintenanceTimelineUpcomingItem,
  vehicle: TimelineVehicleSummary
): TimelineUpcomingItem {
  return {
    id: item.id,
    serviceKey: item.serviceKey,
    title: item.title,
    category: item.category || "General",
    status: (item.timelineStatus === "Due Now" ? "dueNow" : item.timelineStatus === "Overdue" ? "overdue" : "dueSoon") as TimelineUpcomingItem["status"],
    sourceLabel: item.sourceTypeLabel || "Resolver",
    sourceType: "resolver",
    specificityLabel: item.sourceTypeLabel || undefined,
    intervalKm: null,
    intervalMonths: null,
    lastCompletedAt: item.lastCompletedAt || null,
    lastCompletedMileage: parseOdometerValue(item.lastCompletedOdometer),
    currentMileage: vehicle.currentMileage ?? null,
    kmDelta: null,
    timeDeltaDays: null,
    dueSummaryText: item.dueReason,
    whyShowingLines: [
      `Last completed: ${item.lastCompletedAt || "-"}`,
      `Last odometer: ${item.lastCompletedOdometer || "-"}`,
      `Interval: ${item.dueBasis || "-"}`,
      `Current km: ${vehicle.currentMileage ?? "-"}`,
      `Reason: ${item.dueReason || "-"}`,
    ],
    isVehicleSpecific: true,
    plateNumber: item.plateNumber,
    vehicleLabel: item.vehicleLabel,
    customerName: item.customerLabel,
    repairOrderNumber: item.roNumber,
    dueBasis: item.dueBasis,
    nextDueDate: item.nextDueDate || null,
    nextDueOdometer: item.nextDueOdometer || null,
    sourceTypeLabel: item.sourceTypeLabel,
  };
}

export function toTimelineCompletedItem(item: VehicleMaintenanceTimelineCompletedItem): TimelineCompletedItem {
  return {
    id: item.id,
    serviceKey: item.serviceKey,
    title: item.title,
    category: item.category || "General",
    status: "completed",
    roId: item.roId,
    repairOrderNumber: item.roNumber,
    completedAt: item.completedAt,
    odometerAtCompletion: parseOdometerValue(item.odometerAtCompletion),
    sourceLabel: item.sourceTypeLabel || item.historyOrigin,
    vehicleId: item.vehicleKey,
    vehicleLabel: item.vehicleLabel,
    plateNumber: item.plateNumber,
    sourceTypeLabel: item.sourceTypeLabel,
  };
}
