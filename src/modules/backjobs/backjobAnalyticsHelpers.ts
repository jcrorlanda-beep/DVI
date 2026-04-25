import type { BackjobOutcome, BackjobRecord, RepairOrderRecord, UserAccount } from "../shared/types";
import { getBackjobRate as getBackjobRateSummary } from "../shared/helpers";

export type BackjobAnalyticsFilters = {
  search: string;
  technicianId: string;
  category: string;
  costType: string;
  rootCause: string;
  vehicle: string;
  originalRo: string;
  returnRo: string;
  dateFrom: string;
  dateTo: string;
};

export type BackjobAnalyticsKpis = {
  totalBackjobCases: number;
  backjobRatePct: number;
  warrantyCases: number;
  internalCases: number;
  customerPaidCases: number;
  repeatIssueVehicles: number;
};

export type BackjobAnalyticsCase = {
  id: string;
  backjobNumber: string;
  vehicleKey: string;
  vehicleLabel: string;
  plateNumber: string;
  originalRoId: string;
  originalRoNumber: string;
  returnRoId?: string;
  returnRoNumber?: string;
  serviceKey: string;
  serviceTitle: string;
  category: string;
  categoryList: string[];
  technicianIds: string[];
  technicianNames: string[];
  rootCause: string;
  rootCauseBucket: string;
  costType: BackjobOutcome;
  status: BackjobRecord["status"];
  createdAt: string;
  updatedAt: string;
  complaint: string;
  findings: string;
  actionTaken: string;
  resolutionNotes: string;
  searchText: string;
};

export type BackjobCategoryBreakdownRow = {
  category: string;
  count: number;
  percentage: number;
};

export type BackjobCostTypeBreakdownRow = {
  costType: BackjobOutcome;
  count: number;
  percentage: number;
};

export type BackjobRootCauseBreakdownRow = {
  cause: string;
  count: number;
  percentage: number;
  examples: string[];
};

export type BackjobTechnicianRecentActivity = {
  technicianId: string;
  technicianName: string;
  recentActivityAt: string;
  recentCaseNumbers: string[];
};

export type BackjobTechnicianSummary = {
  technicianId: string;
  technicianName: string;
  role: string;
  caseCount: number;
  assignedJobs: number;
  completedJobs: number;
  completionRatePct: number | null;
  backjobRatePct: number | null;
  categories: string[];
  topCategory: string;
  recentActivityAt: string;
  recentCaseNumbers: string[];
};

export type BackjobRepeatIssueVehicle = {
  vehicleKey: string;
  vehicleLabel: string;
  plateNumber: string;
  originalRoNumbers: string[];
  returnRoNumbers: string[];
  backjobCount: number;
  returnCount: number;
  categories: string[];
  latestActivityAt: string;
  primaryRootCause: string;
};

export type BuildBackjobAnalyticsViewModelArgs = {
  backjobRecords: BackjobRecord[];
  repairOrders: RepairOrderRecord[];
  users: UserAccount[];
  filters: BackjobAnalyticsFilters;
};

export type BuildBackjobAnalyticsViewModelResult = {
  filteredCases: BackjobAnalyticsCase[];
  kpis: BackjobAnalyticsKpis;
  categoryBreakdown: BackjobCategoryBreakdownRow[];
  technicianSummaries: BackjobTechnicianSummary[];
  rootCauseBreakdown: BackjobRootCauseBreakdownRow[];
  costTypeBreakdown: BackjobCostTypeBreakdownRow[];
  repeatIssueVehicles: BackjobRepeatIssueVehicle[];
  recentReworkCases: BackjobAnalyticsCase[];
  categoryOptions: string[];
  technicianOptions: { id: string; label: string }[];
  rootCauseOptions: string[];
  costTypeOptions: BackjobOutcome[];
};

const ROOT_CAUSE_BUCKETS = [
  "Workmanship",
  "Parts Failure",
  "Misdiagnosis",
  "Unrelated / New Issue",
  "Customer Decline / Incomplete Scope",
  "Other",
] as const;

const COMPLETED_RO_STATUSES = new Set<RepairOrderRecord["status"]>(["Released", "Closed"]);

function normalizeText(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function toChrono(value: string) {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getVehicleKey(plateNumber: string, conductionNumber: string, customerLabel: string, linkedRoNumber: string) {
  const base = [plateNumber, conductionNumber, customerLabel, linkedRoNumber]
    .map((item) => normalizeText(item).replace(/[^a-z0-9]+/g, ""))
    .find(Boolean);
  return base || "unknown-vehicle";
}

function getRepairOrderServiceTitle(ro: RepairOrderRecord | null) {
  if (!ro) return "Backjob / Rework";
  const titles = uniqueStrings(ro.workLines.map((line) => line.title));
  if (titles.length > 0) {
    return titles.length > 1 ? `${titles[0]} + ${titles.length - 1} more` : titles[0];
  }
  return ro.customerConcern || ro.accountLabel || "Backjob / Rework";
}

function getRepairOrderCategory(ro: RepairOrderRecord | null) {
  if (!ro) return "General";
  const counts = new Map<string, number>();
  for (const line of ro.workLines) {
    const category = line.category?.trim();
    if (!category) continue;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return sorted[0]?.[0] || "General";
}

function getRepairOrderServiceKey(ro: RepairOrderRecord | null) {
  if (!ro) return "backjob-rework";
  const primary = ro.workLines.find((line) => line.serviceKey?.trim());
  if (primary?.serviceKey) return primary.serviceKey;
  const title = getRepairOrderServiceTitle(ro);
  return normalizeText(title).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "backjob-rework";
}

function getRepairOrderTechnicianIds(ro: RepairOrderRecord | null) {
  if (!ro) return [];
  return uniqueStrings([
    ro.primaryTechnicianId || "",
    ...(ro.supportTechnicianIds || []),
    ...ro.workLines.map((line) => line.assignedTechnicianId || ""),
  ]);
}

function getRepairOrderTechnicianNames(ro: RepairOrderRecord | null, users: UserAccount[]) {
  if (!ro) return [];
  const idToName = new Map(users.map((user) => [user.id, user.fullName]));
  return uniqueStrings(getRepairOrderTechnicianIds(ro).map((id) => idToName.get(id) || id));
}

function getReturnRepairOrder(backjob: BackjobRecord, repairOrders: RepairOrderRecord[]) {
  return [...repairOrders]
    .filter((ro) => ro.backjobReferenceRoId === backjob.id)
    .sort((a, b) => toChrono(b.updatedAt || b.createdAt) - toChrono(a.updatedAt || a.createdAt))[0] ?? null;
}

function getRootCauseBucket(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return "Other";
  if (/(workmanship|installation|torque|loose|tighten|assembly|adjust|misaligned)/.test(normalized)) return "Workmanship";
  if (/(part|parts|defect|defective|worn|wear|broken|leak|faulty|failed|failure|contamination)/.test(normalized)) return "Parts Failure";
  if (/(misdiag|mis-diagn|wrong diagnosis|overlook|not diagnosed|missed symptom|misdiagnosed)/.test(normalized)) return "Misdiagnosis";
  if (/(unrelated|new issue|separate issue|additional issue|different issue|another issue)/.test(normalized)) return "Unrelated / New Issue";
  if (/(decline|declined|incomplete|partial scope|customer declined|budget|deferred|hold off)/.test(normalized)) return "Customer Decline / Incomplete Scope";
  return "Other";
}

function createBackjobCase(backjob: BackjobRecord, originalRo: RepairOrderRecord | null, returnRo: RepairOrderRecord | null, users: UserAccount[]): BackjobAnalyticsCase {
  const technicianIds = uniqueStrings([
    backjob.originalPrimaryTechnicianId || "",
    backjob.comebackPrimaryTechnicianId || "",
    ...(backjob.supportingTechnicianIds || []),
    ...(originalRo ? getRepairOrderTechnicianIds(originalRo) : []),
    ...(returnRo ? getRepairOrderTechnicianIds(returnRo) : []),
  ]);
  const technicianNames = uniqueStrings(
    technicianIds.map((id) => users.find((user) => user.id === id)?.fullName || id)
  );
  const vehicleLabel =
    [originalRo?.make || returnRo?.make, originalRo?.model || returnRo?.model, originalRo?.year || returnRo?.year]
      .filter(Boolean)
      .join(" ") ||
    backjob.customerLabel ||
    "Backjob Vehicle";
  const vehicleKey = getVehicleKey(
    backjob.plateNumber || originalRo?.plateNumber || returnRo?.plateNumber || "",
    originalRo?.conductionNumber || returnRo?.conductionNumber || "",
    backjob.customerLabel || originalRo?.accountLabel || returnRo?.accountLabel || vehicleLabel,
    backjob.linkedRoNumber
  );
  const serviceTitle = getRepairOrderServiceTitle(originalRo || returnRo);
  const categoryList = uniqueStrings([
    ...(originalRo ? originalRo.workLines.map((line) => line.category || "") : []),
    ...(returnRo ? returnRo.workLines.map((line) => line.category || "") : []),
  ]);
  const category = getRepairOrderCategory(originalRo || returnRo);
  const serviceKey = getRepairOrderServiceKey(originalRo || returnRo);
  const searchText = [
    backjob.backjobNumber,
    backjob.linkedRoNumber,
    backjob.plateNumber,
    backjob.customerLabel,
    backjob.complaint,
    backjob.findings,
    backjob.rootCause,
    backjob.actionTaken,
    backjob.resolutionNotes,
    vehicleLabel,
    category,
    serviceTitle,
    serviceKey,
    backjob.responsibility,
    backjob.status,
    ...technicianNames,
    originalRo?.roNumber || "",
    returnRo?.roNumber || "",
  ]
    .join(" ")
    .toLowerCase();

  return {
    id: backjob.id,
    backjobNumber: backjob.backjobNumber,
    vehicleKey,
    vehicleLabel,
    plateNumber: backjob.plateNumber || originalRo?.plateNumber || returnRo?.plateNumber || "",
    originalRoId: backjob.linkedRoId,
    originalRoNumber: backjob.linkedRoNumber,
    returnRoId: returnRo?.id,
    returnRoNumber: returnRo?.roNumber,
    serviceKey,
    serviceTitle,
    category,
    categoryList: categoryList.length ? categoryList : [category],
    technicianIds,
    technicianNames,
    rootCause: backjob.rootCause || backjob.findings || backjob.complaint || "Unspecified",
    rootCauseBucket: getRootCauseBucket(backjob.rootCause || backjob.findings || backjob.complaint),
    costType: backjob.responsibility,
    status: backjob.status,
    createdAt: backjob.createdAt,
    updatedAt: backjob.updatedAt || backjob.createdAt,
    complaint: backjob.complaint,
    findings: backjob.findings,
    actionTaken: backjob.actionTaken,
    resolutionNotes: backjob.resolutionNotes,
    searchText,
  };
}

function matchesBackjobCase(item: BackjobAnalyticsCase, filters: BackjobAnalyticsFilters) {
  const term = normalizeText(filters.search);
  const vehicleTerm = normalizeText(filters.vehicle);
  const originalRoTerm = normalizeText(filters.originalRo);
  const returnRoTerm = normalizeText(filters.returnRo);
  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom).getTime() : NaN;
  const dateTo = filters.dateTo ? new Date(filters.dateTo).getTime() : NaN;
  const createdAt = new Date(item.createdAt).getTime();

  if (term && !item.searchText.includes(term)) return false;
  if (vehicleTerm && !normalizeText([item.vehicleLabel, item.plateNumber].join(" ")).includes(vehicleTerm)) return false;
  if (originalRoTerm && !normalizeText(item.originalRoNumber).includes(originalRoTerm)) return false;
  if (returnRoTerm && !normalizeText(item.returnRoNumber || "").includes(returnRoTerm)) return false;
  if (filters.technicianId && !item.technicianIds.includes(filters.technicianId)) return false;
  if (filters.category && item.category !== filters.category) return false;
  if (filters.costType && item.costType !== filters.costType) return false;
  if (filters.rootCause && item.rootCauseBucket !== filters.rootCause) return false;
  if (!Number.isNaN(dateFrom) && createdAt < dateFrom) return false;
  if (!Number.isNaN(dateTo) && createdAt > dateTo + 86400000 - 1) return false;
  return true;
}

function sortRecentCases(items: BackjobAnalyticsCase[]) {
  return [...items].sort((a, b) => toChrono(b.updatedAt) - toChrono(a.updatedAt) || toChrono(b.createdAt) - toChrono(a.createdAt));
}

export function getBackjobCases(
  backjobRecords: BackjobRecord[],
  repairOrders: RepairOrderRecord[],
  users: UserAccount[]
): BackjobAnalyticsCase[] {
  return sortRecentCases(
    backjobRecords.map((backjob) => {
      const originalRo = repairOrders.find((ro) => ro.id === backjob.linkedRoId) ?? null;
      const returnRo = getReturnRepairOrder(backjob, repairOrders);
      return createBackjobCase(backjob, originalRo, returnRo, users);
    })
  );
}

export function getBackjobRate(backjobRecords: BackjobRecord[], repairOrders: RepairOrderRecord[]) {
  return getBackjobRateSummary(repairOrders, backjobRecords);
}

export function getBackjobsByCategory(cases: BackjobAnalyticsCase[]): BackjobCategoryBreakdownRow[] {
  const total = cases.length || 1;
  const counts = new Map<string, number>();
  for (const item of cases) {
    const key = item.category || "General";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count, percentage: Number(((count / total) * 100).toFixed(1)) }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function getBackjobsByCostType(cases: BackjobAnalyticsCase[]): BackjobCostTypeBreakdownRow[] {
  const total = cases.length || 1;
  const counts = new Map<BackjobOutcome, number>();
  for (const item of cases) {
    counts.set(item.costType, (counts.get(item.costType) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([costType, count]) => ({ costType, count, percentage: Number(((count / total) * 100).toFixed(1)) }))
    .sort((a, b) => b.count - a.count || a.costType.localeCompare(b.costType));
}

export function getBackjobsByRootCause(cases: BackjobAnalyticsCase[]): BackjobRootCauseBreakdownRow[] {
  const total = cases.length || 1;
  const counts = new Map<string, { count: number; examples: string[] }>();
  for (const item of cases) {
    const key = item.rootCauseBucket || "Other";
    const entry = counts.get(key) ?? { count: 0, examples: [] };
    entry.count += 1;
    if (entry.examples.length < 3) {
      entry.examples.push(item.backjobNumber);
    }
    counts.set(key, entry);
  }
  const orderedBuckets = [
    ...ROOT_CAUSE_BUCKETS.filter((bucket) => counts.has(bucket)),
    ...Array.from(counts.keys()).filter((bucket) => !ROOT_CAUSE_BUCKETS.includes(bucket as (typeof ROOT_CAUSE_BUCKETS)[number])),
  ];
  return orderedBuckets
    .map((cause) => {
      const row = counts.get(cause)!;
      return {
        cause,
        count: row.count,
        percentage: Number(((row.count / total) * 100).toFixed(1)),
        examples: row.examples,
      };
    })
    .sort((a, b) => b.count - a.count || a.cause.localeCompare(b.cause));
}

export function getTechnicianRecentActivity(
  cases: BackjobAnalyticsCase[],
  users: UserAccount[]
): BackjobTechnicianRecentActivity[] {
  const map = new Map<string, { recentActivityAt: string; recentCaseNumbers: string[] }>();
  for (const item of cases) {
    for (const technicianId of item.technicianIds) {
      const entry = map.get(technicianId) ?? { recentActivityAt: "", recentCaseNumbers: [] };
      if (!entry.recentActivityAt || toChrono(item.updatedAt) > toChrono(entry.recentActivityAt)) {
        entry.recentActivityAt = item.updatedAt;
      }
      if (entry.recentCaseNumbers.length < 3 && !entry.recentCaseNumbers.includes(item.backjobNumber)) {
        entry.recentCaseNumbers.push(item.backjobNumber);
      }
      map.set(technicianId, entry);
    }
  }
  return Array.from(map.entries())
    .map(([technicianId, value]) => ({
      technicianId,
      technicianName: users.find((user) => user.id === technicianId)?.fullName || technicianId,
      recentActivityAt: value.recentActivityAt,
      recentCaseNumbers: value.recentCaseNumbers,
    }))
    .sort((a, b) => toChrono(b.recentActivityAt) - toChrono(a.recentActivityAt));
}

function getAssignedJobCounts(repairOrders: RepairOrderRecord[], technicianId: string) {
  let assignedJobs = 0;
  let completedJobs = 0;
  for (const ro of repairOrders) {
    const participants = uniqueStrings([
      ro.primaryTechnicianId || "",
      ...(ro.supportTechnicianIds || []),
      ...ro.workLines.map((line) => line.assignedTechnicianId || ""),
    ]);
    if (!participants.includes(technicianId)) continue;
    assignedJobs += 1;
    if (COMPLETED_RO_STATUSES.has(ro.status)) {
      completedJobs += 1;
    }
  }
  return { assignedJobs, completedJobs };
}

export function getBackjobsByTechnician(
  cases: BackjobAnalyticsCase[],
  repairOrders: RepairOrderRecord[],
  users: UserAccount[]
): BackjobTechnicianSummary[] {
  const activityByTechnician = new Map(getTechnicianRecentActivity(cases, users).map((row) => [row.technicianId, row] as const));
  const map = new Map<string, BackjobTechnicianSummary & { categoryCounts: Map<string, number> }>();

  for (const item of cases) {
    for (const technicianId of item.technicianIds) {
      if (!map.has(technicianId)) {
        const user = users.find((entry) => entry.id === technicianId);
        map.set(technicianId, {
          technicianId,
          technicianName: user?.fullName || technicianId,
          role: user?.role || "Unknown",
          caseCount: 0,
          assignedJobs: 0,
          completedJobs: 0,
          completionRatePct: null,
          backjobRatePct: null,
          categories: [],
          topCategory: "General",
          recentActivityAt: "",
          recentCaseNumbers: [],
          categoryCounts: new Map<string, number>(),
        });
      }
      const row = map.get(technicianId)!;
      row.caseCount += 1;
      row.categoryCounts.set(item.category, (row.categoryCounts.get(item.category) ?? 0) + 1);
      const activity = activityByTechnician.get(technicianId);
      if (activity) {
        row.recentActivityAt = activity.recentActivityAt;
        row.recentCaseNumbers = activity.recentCaseNumbers;
      } else if (!row.recentActivityAt || toChrono(item.updatedAt) > toChrono(row.recentActivityAt)) {
        row.recentActivityAt = item.updatedAt;
        row.recentCaseNumbers = [item.backjobNumber];
      }
    }
  }

  for (const row of map.values()) {
    const jobCounts = getAssignedJobCounts(repairOrders, row.technicianId);
    row.assignedJobs = jobCounts.assignedJobs;
    row.completedJobs = jobCounts.completedJobs;
    row.completionRatePct = row.assignedJobs > 0 ? Number(((row.completedJobs / row.assignedJobs) * 100).toFixed(1)) : null;
    row.backjobRatePct = row.completedJobs > 0 ? Number(((row.caseCount / row.completedJobs) * 100).toFixed(1)) : null;
    const orderedCategories = Array.from(row.categoryCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    row.categories = orderedCategories.map(([category]) => category);
    row.topCategory = orderedCategories[0]?.[0] || "General";
  }

  return Array.from(map.values())
    .map(({ categoryCounts, ...row }) => row)
    .sort((a, b) => b.caseCount - a.caseCount || a.technicianName.localeCompare(b.technicianName));
}

export function getRepeatIssueVehicles(cases: BackjobAnalyticsCase[]): BackjobRepeatIssueVehicle[] {
  const map = new Map<string, BackjobRepeatIssueVehicle & { rootCauseCounts: Map<string, number> }>();
  for (const item of cases) {
    const entry = map.get(item.vehicleKey) ?? {
      vehicleKey: item.vehicleKey,
      vehicleLabel: item.vehicleLabel,
      plateNumber: item.plateNumber,
      originalRoNumbers: [],
      returnRoNumbers: [],
      backjobCount: 0,
      returnCount: 0,
      categories: [],
      latestActivityAt: "",
      primaryRootCause: "",
      rootCauseCounts: new Map<string, number>(),
    };
    entry.backjobCount += 1;
    if (item.originalRoNumber && !entry.originalRoNumbers.includes(item.originalRoNumber)) {
      entry.originalRoNumbers.push(item.originalRoNumber);
    }
    if (item.returnRoNumber && !entry.returnRoNumbers.includes(item.returnRoNumber)) {
      entry.returnRoNumbers.push(item.returnRoNumber);
      entry.returnCount += 1;
    }
    if (!entry.categories.includes(item.category)) {
      entry.categories.push(item.category);
    }
    entry.rootCauseCounts.set(item.rootCauseBucket, (entry.rootCauseCounts.get(item.rootCauseBucket) ?? 0) + 1);
    if (!entry.latestActivityAt || toChrono(item.updatedAt) > toChrono(entry.latestActivityAt)) {
      entry.latestActivityAt = item.updatedAt;
      entry.vehicleLabel = item.vehicleLabel;
      entry.plateNumber = item.plateNumber;
    }
    map.set(item.vehicleKey, entry);
  }

  return Array.from(map.values())
    .map(({ rootCauseCounts, ...row }) => ({
      ...row,
      primaryRootCause: Array.from(rootCauseCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || "Other",
    }))
    .filter((row) => row.backjobCount > 1 || row.returnCount > 0)
    .sort((a, b) => b.backjobCount - a.backjobCount || toChrono(b.latestActivityAt) - toChrono(a.latestActivityAt));
}

export function getRecentReworkCases(cases: BackjobAnalyticsCase[], limit = 5) {
  return sortRecentCases(cases).slice(0, limit);
}

export function computeBackjobKpis(cases: BackjobAnalyticsCase[], repairOrders: RepairOrderRecord[]): BackjobAnalyticsKpis {
  const rateSummary = getBackjobRateSummary(repairOrders, cases.map((item) => ({
    id: item.id,
    backjobNumber: item.backjobNumber,
    linkedRoId: item.originalRoId,
    linkedRoNumber: item.originalRoNumber,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    plateNumber: item.plateNumber,
    customerLabel: item.vehicleLabel,
    originalInvoiceNumber: "",
    comebackInvoiceNumber: "",
    originalPrimaryTechnicianId: item.technicianIds[0] || "",
    comebackPrimaryTechnicianId: item.technicianIds[0] || "",
    supportingTechnicianIds: item.technicianIds.slice(1),
    complaint: item.complaint,
    findings: item.findings,
    rootCause: item.rootCause,
    responsibility: item.costType,
    actionTaken: item.actionTaken,
    resolutionNotes: item.resolutionNotes,
    status: item.status,
    createdBy: "",
  } satisfies BackjobRecord)));

  return {
    totalBackjobCases: cases.length,
    backjobRatePct: rateSummary.backjobRatePct,
    warrantyCases: cases.filter((item) => item.costType === "Warranty").length,
    internalCases: cases.filter((item) => item.costType === "Internal").length,
    customerPaidCases: cases.filter((item) => item.costType === "Customer Pay").length,
    repeatIssueVehicles: getRepeatIssueVehicles(cases).length,
  };
}

export function extractCategoryOptions(cases: BackjobAnalyticsCase[]) {
  return ["All", ...Array.from(new Set(cases.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b))];
}

export function buildBackjobAnalyticsViewModel(args: BuildBackjobAnalyticsViewModelArgs): BuildBackjobAnalyticsViewModelResult {
  const allCases = getBackjobCases(args.backjobRecords, args.repairOrders, args.users);
  const filteredCases = sortRecentCases(allCases.filter((item) => matchesBackjobCase(item, args.filters)));

  return {
    filteredCases,
    kpis: computeBackjobKpis(filteredCases, args.repairOrders),
    categoryBreakdown: getBackjobsByCategory(filteredCases),
    technicianSummaries: getBackjobsByTechnician(filteredCases, args.repairOrders, args.users),
    rootCauseBreakdown: getBackjobsByRootCause(filteredCases),
    costTypeBreakdown: getBackjobsByCostType(filteredCases),
    repeatIssueVehicles: getRepeatIssueVehicles(filteredCases),
    recentReworkCases: getRecentReworkCases(filteredCases),
    categoryOptions: extractCategoryOptions(allCases),
    technicianOptions: Array.from(
      new Map(
        args.users
          .filter((user) => ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role))
          .map((user) => [user.id, { id: user.id, label: `${user.fullName} · ${user.role}` }] as const)
      ).values()
    ).sort((a, b) => a.label.localeCompare(b.label)),
    rootCauseOptions: [...ROOT_CAUSE_BUCKETS],
    costTypeOptions: ["Warranty", "Internal", "Customer Pay", "Goodwill"],
  };
}
