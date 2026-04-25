import { getTechnicianProductivity } from "../shared/helpers";
import type {
  RepairOrderRecord,
  UserAccount,
  VehicleServiceHistoryRecord,
  WorkLog,
} from "../shared/types";

export type TechnicianPerformanceFilters = {
  technicianId: string;
  role: string;
  category: string;
  dateFrom: string;
  dateTo: string;
};

export type TechnicianPerformanceKpis = {
  totalCompletedJobs: number;
  totalCompletedServices: number;
  activeTechnicians: number;
  totalProductionValue: number;
  averageCompletionRate: number;
  recentCompletionsThisMonth: number;
  productionMode: "Value" | "Counts Only";
};

export type TechnicianPerformanceLeaderboardRow = {
  technicianId: string;
  technicianName: string;
  role: string;
  assignedJobs: number;
  completedJobs: number;
  completedServices: number;
  completionRate: number;
  productionValue: number;
  loggedMinutes: number;
  recentActivityAt: string;
  topCategory: string;
  serviceHistoryContribution: number;
  active: boolean;
};

export type TechnicianPerformanceCategoryRow = {
  category: string;
  count: number;
  topTechnicianId: string;
  topTechnicianName: string;
  topTechnicianCount: number;
};

export type TechnicianPerformanceActivityRow = {
  id: string;
  technicianId: string;
  technicianName: string;
  label: string;
  category: string;
  completedAt: string;
  roNumber?: string;
  vehicleLabel?: string;
  tone?: "neutral" | "info" | "good";
};

export type TechnicianPerformanceDetail = TechnicianPerformanceLeaderboardRow & {
  assignedVsCompletedText: string;
  recentCompletedServices: TechnicianPerformanceActivityRow[];
  recentActivity: TechnicianPerformanceActivityRow[];
  categoryBreakdown: TechnicianPerformanceCategoryRow[];
};

export type BuildTechnicianPerformanceViewModelArgs = {
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  workLogs: WorkLog[];
  serviceHistoryRecords: VehicleServiceHistoryRecord[];
  filters: TechnicianPerformanceFilters;
  nowIso?: string;
};

export type BuildTechnicianPerformanceViewModelResult = {
  kpis: TechnicianPerformanceKpis;
  leaderboard: TechnicianPerformanceLeaderboardRow[];
  selectedTechnician: TechnicianPerformanceDetail | null;
  recentActivity: TechnicianPerformanceActivityRow[];
  categoryBreakdown: TechnicianPerformanceCategoryRow[];
  technicianOptions: Array<{ id: string; label: string }>;
  roleOptions: string[];
  categoryOptions: string[];
  productionMode: "Value" | "Counts Only";
  visibleTechnicians: number;
};

type TechnicianServiceEntry = TechnicianPerformanceActivityRow & {
  technicianRole: string;
  productionValue: number;
  roId: string;
  lineId: string;
  serviceHistoryContribution: number;
};

const TECHNICIAN_ROLE_MATCH = /(technician|mechanic|ojt)/i;
const COMPLETED_RO_STATUSES = new Set(["Ready Release", "Released", "Closed"]);

function normalizeText(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategory(category: string) {
  const normalized = normalizeText(category);
  if (!normalized) return "General";
  if (normalized.includes("oil") || normalized.includes("fluid") || normalized.includes("pms")) return "PMS / General Maintenance";
  if (normalized.includes("align") || normalized.includes("tire")) return "Tires";
  if (normalized.includes("ac") || normalized.includes("cool") || normalized.includes("heating")) return "Cooling";
  if (normalized.includes("suspension")) return "Suspension";
  if (normalized.includes("steering")) return "Steering";
  if (normalized.includes("trans")) return "Transmission";
  if (normalized.includes("brake")) return "Brakes";
  if (normalized.includes("electrical") || normalized.includes("battery")) return "Electrical";
  if (normalized.includes("engine")) return "Engine";
  return category || "General";
}

function parseMoney(value?: string | number | null) {
  const parsed = Number(String(value ?? "").replace(/,/g, "").replace(/[^\d.-]/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function isTechnicianRole(role: string) {
  return TECHNICIAN_ROLE_MATCH.test(role);
}

function isCompletedRO(ro: RepairOrderRecord) {
  return COMPLETED_RO_STATUSES.has(ro.status);
}

function filterWorkLogsByDate(workLogs: WorkLog[], filters: TechnicianPerformanceFilters) {
  const dateFrom = String(filters.dateFrom || "").trim();
  const dateTo = String(filters.dateTo || "").trim();

  return workLogs.filter((log) => {
    const completedAt = String(log.endedAt || log.startedAt || "").slice(0, 10);
    const matchesDateFrom = !dateFrom || completedAt >= dateFrom;
    const matchesDateTo = !dateTo || completedAt <= dateTo;
    return matchesDateFrom && matchesDateTo;
  });
}

function getVehicleLabel(ro: RepairOrderRecord) {
  return [ro.year, ro.make, ro.model].filter(Boolean).join(" ") || ro.accountLabel || ro.customerName || "Unknown Vehicle";
}

function getCompletedAt(ro: RepairOrderRecord, lineCompletedAt?: string) {
  return lineCompletedAt || ro.updatedAt || ro.createdAt;
}

function getProductionValue(ro: RepairOrderRecord, line: RepairOrderRecord["workLines"][number]) {
  const totalEstimate = parseMoney(line.totalEstimate);
  if (totalEstimate > 0) return totalEstimate;
  const labor = parseMoney(line.serviceEstimate);
  const parts = parseMoney(line.partsEstimate);
  const fallback = labor + parts;
  if (fallback > 0) return fallback;
  const roTotal = parseMoney(ro.workLines.reduce((sum, row) => sum + parseMoney(row.totalEstimate), 0));
  return roTotal > 0 ? roTotal : 0;
}

function buildServiceEntries(
  users: UserAccount[],
  repairOrders: RepairOrderRecord[],
  serviceHistoryRecords: VehicleServiceHistoryRecord[]
) {
  const technicianById = new Map(users.map((user) => [user.id, user] as const));
  const historyContributionByLine = new Map<string, number>();
  serviceHistoryRecords.forEach((record) => {
    historyContributionByLine.set(record.sourceWorkLineId, (historyContributionByLine.get(record.sourceWorkLineId) ?? 0) + 1);
  });

  const entries: TechnicianServiceEntry[] = [];

  repairOrders.forEach((ro) => {
    if (!isCompletedRO(ro)) return;
    ro.workLines.forEach((line) => {
      const technicianId = line.assignedTechnicianId;
      if (!technicianId) return;
      const technician = technicianById.get(technicianId);
      if (!technician || !isTechnicianRole(technician.role)) return;
      if (line.status !== "Completed" && !line.completedAt) return;

      const completedAt = getCompletedAt(ro, line.completedAt);
      const productionValue = getProductionValue(ro, line);
      entries.push({
        id: `${ro.id}:${line.id}`,
        technicianId,
        technicianName: technician.fullName,
        label: line.title || line.serviceKey || "Completed Service",
        category: normalizeCategory(line.category || "General"),
        completedAt,
        roNumber: ro.roNumber,
        vehicleLabel: getVehicleLabel(ro),
        tone: "good",
        technicianRole: technician.role,
        productionValue,
        roId: ro.id,
        lineId: line.id,
        serviceHistoryContribution: historyContributionByLine.get(line.id) ?? 0,
      });
    });
  });

  return entries.sort((a, b) => b.completedAt.localeCompare(a.completedAt) || a.technicianName.localeCompare(b.technicianName));
}

function filterEntries(entries: TechnicianServiceEntry[], filters: TechnicianPerformanceFilters) {
  const dateFrom = String(filters.dateFrom || "").trim();
  const dateTo = String(filters.dateTo || "").trim();
  const technicianId = String(filters.technicianId || "").trim();
  const roleFilter = String(filters.role || "").trim();
  const categoryFilter = String(filters.category || "").trim();

  return entries.filter((entry) => {
    const matchesTechnician = !technicianId || entry.technicianId === technicianId;
    const matchesRole = !roleFilter || entry.technicianRole === roleFilter;
    const matchesCategory = !categoryFilter || categoryFilter === "All" || categoryFilter === "All Categories" || entry.category === categoryFilter;
    const completedDate = entry.completedAt.slice(0, 10);
    const matchesDateFrom = !dateFrom || completedDate >= dateFrom;
    const matchesDateTo = !dateTo || completedDate <= dateTo;
    return matchesTechnician && matchesRole && matchesCategory && matchesDateFrom && matchesDateTo;
  });
}

function getAssignedJobCount(ro: RepairOrderRecord, technicianId: string) {
  const hasAssignment =
    ro.primaryTechnicianId === technicianId ||
    (ro.supportTechnicianIds || []).includes(technicianId) ||
    ro.workLines.some((line) => line.assignedTechnicianId === technicianId);
  return hasAssignment ? 1 : 0;
}

function getCompletedJobCount(ro: RepairOrderRecord, technicianId: string, serviceEntries: TechnicianServiceEntry[]) {
  if (!isCompletedRO(ro)) return 0;
  const hasCompletedLine = serviceEntries.some((entry) => entry.roId === ro.id && entry.technicianId === technicianId);
  return hasCompletedLine || ro.primaryTechnicianId === technicianId || (ro.supportTechnicianIds || []).includes(technicianId) ? 1 : 0;
}

function buildTechnicianRows(
  users: UserAccount[],
  repairOrders: RepairOrderRecord[],
  serviceEntries: TechnicianServiceEntry[],
  workLogs: WorkLog[]
) {
  const productivityRows = getTechnicianProductivity(repairOrders, workLogs, users);
  const rowsByTechnician = new Map<string, TechnicianPerformanceLeaderboardRow>();
  const completedByTechnician = new Map<string, TechnicianServiceEntry[]>();
  const workLogMinutesByTechnician = new Map<string, number>();

  workLogs.forEach((log) => {
    const current = workLogMinutesByTechnician.get(log.technicianId) ?? 0;
    workLogMinutesByTechnician.set(log.technicianId, current + Math.max(0, log.totalMinutes || 0));
  });

  productivityRows.forEach((row) => {
    const user = users.find((item) => item.id === row.technicianId);
    if (!user || !isTechnicianRole(user.role)) return;
    rowsByTechnician.set(row.technicianId, {
      technicianId: row.technicianId,
      technicianName: row.technicianName,
      role: user.role,
      assignedJobs: 0,
      completedJobs: 0,
      completedServices: 0,
      completionRate: 0,
      productionValue: 0,
      loggedMinutes: Math.max(row.loggedMinutes, workLogMinutesByTechnician.get(row.technicianId) ?? 0),
      recentActivityAt: "",
      topCategory: "",
      serviceHistoryContribution: 0,
      active: user.active,
    });
  });

  users.forEach((user) => {
    if (!isTechnicianRole(user.role)) return;
    if (!rowsByTechnician.has(user.id)) {
      rowsByTechnician.set(user.id, {
        technicianId: user.id,
        technicianName: user.fullName,
        role: user.role,
        assignedJobs: 0,
        completedJobs: 0,
        completedServices: 0,
        completionRate: 0,
        productionValue: 0,
        loggedMinutes: workLogMinutesByTechnician.get(user.id) ?? 0,
        recentActivityAt: "",
        topCategory: "",
        serviceHistoryContribution: 0,
        active: user.active,
      });
    }
  });

  serviceEntries.forEach((entry) => {
    const row = rowsByTechnician.get(entry.technicianId);
    if (!row) return;
    row.completedServices += 1;
    row.productionValue += entry.productionValue;
    row.recentActivityAt = row.recentActivityAt && row.recentActivityAt > entry.completedAt ? row.recentActivityAt : entry.completedAt;
    row.serviceHistoryContribution += entry.serviceHistoryContribution;
    const current = completedByTechnician.get(entry.technicianId) ?? [];
    current.push(entry);
    completedByTechnician.set(entry.technicianId, current);
  });

  repairOrders.forEach((ro) => {
    rowsByTechnician.forEach((row) => {
      row.assignedJobs += getAssignedJobCount(ro, row.technicianId);
      row.completedJobs += getCompletedJobCount(ro, row.technicianId, serviceEntries);
    });
  });

  rowsByTechnician.forEach((row, technicianId) => {
    const completedServices = completedByTechnician.get(technicianId) ?? [];
    const topCategory = [...completedServices]
      .reduce((map, entry) => {
        const current = map.get(entry.category) ?? 0;
        map.set(entry.category, current + 1);
        return map;
      }, new Map<string, number>());
    const sortedTopCategory = Array.from(topCategory.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    row.topCategory = sortedTopCategory?.[0] || "General";
    row.completionRate = row.assignedJobs > 0 ? Math.round((row.completedJobs / row.assignedJobs) * 100) : 0;
  });

  return { rowsByTechnician, completedByTechnician };
}

export function getTechnicianCompletedServices({
  users,
  repairOrders,
  serviceHistoryRecords,
  filters,
}: Pick<BuildTechnicianPerformanceViewModelArgs, "users" | "repairOrders" | "serviceHistoryRecords" | "filters">) {
  return filterEntries(buildServiceEntries(users, repairOrders, serviceHistoryRecords), filters);
}

export function getTechnicianCategoryBreakdown({
  completedServices,
  technicianId,
  limit = 8,
}: {
  completedServices: TechnicianServiceEntry[];
  technicianId?: string;
  limit?: number;
}): TechnicianPerformanceCategoryRow[] {
  const perCategory = new Map<string, Map<string, { technicianName: string; count: number }>>();

  completedServices
    .filter((entry) => !technicianId || entry.technicianId === technicianId)
    .forEach((entry) => {
      const key = entry.category || "General";
      if (!perCategory.has(key)) perCategory.set(key, new Map());
      const techMap = perCategory.get(key)!;
      const current = techMap.get(entry.technicianId) ?? { technicianName: entry.technicianName, count: 0 };
      techMap.set(entry.technicianId, { technicianName: entry.technicianName, count: current.count + 1 });
    });

  return Array.from(perCategory.entries())
    .map(([category, techMap]) => {
      const ranked = Array.from(techMap.entries()).sort((a, b) => b[1].count - a[1].count || a[1].technicianName.localeCompare(b[1].technicianName));
      const top = ranked[0];
      const total = ranked.reduce((sum, [, value]) => sum + value.count, 0);
      return {
        category,
        count: total,
        topTechnicianId: top?.[0] || "",
        topTechnicianName: top?.[1].technicianName || "-",
        topTechnicianCount: top?.[1].count || 0,
      };
    })
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
    .slice(0, limit);
}

export function getTechnicianRecentActivity({
  completedServices,
  workLogs,
  technicianId,
  limit = 6,
}: {
  completedServices: TechnicianServiceEntry[];
  workLogs: WorkLog[];
  technicianId?: string;
  limit?: number;
}): TechnicianPerformanceActivityRow[] {
  const activity: TechnicianPerformanceActivityRow[] = [];

  completedServices
    .filter((entry) => !technicianId || entry.technicianId === technicianId)
    .forEach((entry) => {
      activity.push({
        id: entry.id,
        technicianId: entry.technicianId,
        technicianName: entry.technicianName,
        label: entry.label,
        category: entry.category,
        completedAt: entry.completedAt,
        roNumber: entry.roNumber,
        vehicleLabel: entry.vehicleLabel,
        tone: "good",
      });
    });

  workLogs
    .filter((log) => !technicianId || log.technicianId === technicianId)
    .forEach((log) => {
      const completedAt = log.endedAt || log.startedAt;
      activity.push({
        id: log.id,
        technicianId: log.technicianId,
        technicianName: "",
        label: log.endedAt ? "Completed work log" : "Active timer",
        category: "Labor",
        completedAt,
        tone: log.endedAt ? "info" : "neutral",
      });
    });

  return activity
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt) || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function getTechnicianProductionValue(completedServices: TechnicianServiceEntry[]) {
  return completedServices.reduce((sum, entry) => sum + entry.productionValue, 0);
}

export function getTechnicianCompletionRate(completedJobs: number, assignedJobs: number) {
  if (!assignedJobs) return 0;
  return Math.round((completedJobs / assignedJobs) * 100);
}

export function getTechnicianLeaderboard({
  users,
  repairOrders,
  workLogs,
  serviceHistoryRecords,
  filters,
}: Pick<BuildTechnicianPerformanceViewModelArgs, "users" | "repairOrders" | "workLogs" | "serviceHistoryRecords" | "filters">) {
  const serviceEntries = getTechnicianCompletedServices({ users, repairOrders, serviceHistoryRecords, filters });
  const filteredWorkLogs = filterWorkLogsByDate(workLogs, filters);
  const { rowsByTechnician } = buildTechnicianRows(users, repairOrders, serviceEntries, filteredWorkLogs);
  const selectedTechnicians = new Set(
    Array.from(rowsByTechnician.values())
      .filter((row) => row.active || row.assignedJobs > 0 || row.completedServices > 0 || row.loggedMinutes > 0)
      .map((row) => row.technicianId)
  );

  const leaderboard = Array.from(rowsByTechnician.values())
    .filter((row) => selectedTechnicians.has(row.technicianId))
    .map((row) => ({
      ...row,
      completionRate: getTechnicianCompletionRate(row.completedJobs, row.assignedJobs),
    }))
    .sort((a, b) => {
      if (b.completedServices !== a.completedServices) return b.completedServices - a.completedServices;
      if (b.completedJobs !== a.completedJobs) return b.completedJobs - a.completedJobs;
      if (b.productionValue !== a.productionValue) return b.productionValue - a.productionValue;
      return a.technicianName.localeCompare(b.technicianName);
    });

  return { leaderboard, serviceEntries };
}

export function computeTechnicianKpis({
  leaderboard,
  serviceEntries,
  nowIso = new Date().toISOString(),
}: {
  leaderboard: TechnicianPerformanceLeaderboardRow[];
  serviceEntries: TechnicianServiceEntry[];
  nowIso?: string;
}): TechnicianPerformanceKpis {
  const monthKey = nowIso.slice(0, 7);
  const totalProductionValue = getTechnicianProductionValue(serviceEntries);
  const averageCompletionRate = leaderboard.length
    ? Math.round(leaderboard.reduce((sum, row) => sum + row.completionRate, 0) / leaderboard.length)
    : 0;

  return {
    totalCompletedJobs: leaderboard.reduce((sum, row) => sum + row.completedJobs, 0),
    totalCompletedServices: serviceEntries.length,
    activeTechnicians: leaderboard.filter((row) => row.active && (row.assignedJobs > 0 || row.completedServices > 0 || row.loggedMinutes > 0)).length,
    totalProductionValue,
    averageCompletionRate,
    recentCompletionsThisMonth: serviceEntries.filter((row) => row.completedAt.startsWith(monthKey)).length,
    productionMode: totalProductionValue > 0 ? "Value" : "Counts Only",
  };
}

function buildTechnicianOptions(users: UserAccount[]) {
  return users
    .filter((user) => isTechnicianRole(user.role))
    .map((user) => ({ id: user.id, label: `${user.fullName} (${user.role})` }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildRoleOptions(users: UserAccount[]) {
  return Array.from(new Set(users.filter((user) => isTechnicianRole(user.role)).map((user) => user.role))).sort((a, b) => a.localeCompare(b));
}

function buildCategoryOptions(completedServices: TechnicianServiceEntry[]) {
  return ["All", ...Array.from(new Set(completedServices.map((entry) => entry.category || "General"))).sort((a, b) => a.localeCompare(b))];
}

export function buildTechnicianPerformanceViewModel({
  users,
  repairOrders,
  workLogs,
  serviceHistoryRecords,
  filters,
  nowIso = new Date().toISOString(),
}: BuildTechnicianPerformanceViewModelArgs): BuildTechnicianPerformanceViewModelResult {
  const filteredWorkLogs = filterWorkLogsByDate(workLogs, filters);
  const { leaderboard, serviceEntries } = getTechnicianLeaderboard({
    users,
    repairOrders,
    workLogs,
    serviceHistoryRecords,
    filters,
  });

  const categoryBreakdown = getTechnicianCategoryBreakdown({
    completedServices: serviceEntries,
  });

  const sortedLeaderboard = leaderboard.filter((row) => {
    const roleMatches = !filters.role || row.role === filters.role;
    const technicianMatches = !filters.technicianId || row.technicianId === filters.technicianId;
    return roleMatches && technicianMatches;
  });

  const filteredServiceEntries = serviceEntries.filter((entry) => {
    const technicianMatches = !filters.technicianId || entry.technicianId === filters.technicianId;
    const roleMatches = !filters.role || entry.technicianRole === filters.role;
    const categoryMatches = !filters.category || filters.category === "All" || entry.category === filters.category;
    const completedDate = entry.completedAt.slice(0, 10);
    const dateFromMatches = !filters.dateFrom || completedDate >= filters.dateFrom;
    const dateToMatches = !filters.dateTo || completedDate <= filters.dateTo;
    return technicianMatches && roleMatches && categoryMatches && dateFromMatches && dateToMatches;
  });

  const filteredLeaderboard = sortedLeaderboard.map((row) => {
    const completedServices = filteredServiceEntries.filter((entry) => entry.technicianId === row.technicianId);
    const assignedJobs = repairOrders.reduce((sum, ro) => sum + getAssignedJobCount(ro, row.technicianId), 0);
    const completedJobs = repairOrders.reduce((sum, ro) => sum + getCompletedJobCount(ro, row.technicianId, filteredServiceEntries), 0);
    const recentActivityAt = completedServices[0]?.completedAt || row.recentActivityAt;
    const topCategory = getTechnicianCategoryBreakdown({ completedServices, technicianId: row.technicianId, limit: 1 })[0]?.category || row.topCategory;
    const productionValue = getTechnicianProductionValue(completedServices);
    const serviceHistoryContribution = completedServices.reduce((sum, entry) => sum + entry.serviceHistoryContribution, 0);
    return {
      ...row,
      assignedJobs,
      completedJobs,
      completedServices: completedServices.length,
      completionRate: getTechnicianCompletionRate(completedJobs, assignedJobs),
      productionValue,
      recentActivityAt,
      topCategory,
      serviceHistoryContribution,
    };
  }).filter((row) => row.assignedJobs > 0 || row.completedJobs > 0 || row.completedServices > 0 || row.loggedMinutes > 0);

  filteredLeaderboard.sort((a, b) => {
    if (b.completedServices !== a.completedServices) return b.completedServices - a.completedServices;
    if (b.completedJobs !== a.completedJobs) return b.completedJobs - a.completedJobs;
    if (b.productionValue !== a.productionValue) return b.productionValue - a.productionValue;
    return a.technicianName.localeCompare(b.technicianName);
  });

  const selectedTechnicianId = filters.technicianId || filteredLeaderboard[0]?.technicianId || "";
  const selectedTechnicianBase = filteredLeaderboard.find((row) => row.technicianId === selectedTechnicianId) || null;
  const selectedTechnician = selectedTechnicianBase
    ? {
        ...selectedTechnicianBase,
        assignedVsCompletedText: `${formatNumber(selectedTechnicianBase.assignedJobs)} assigned / ${formatNumber(selectedTechnicianBase.completedJobs)} completed`,
        recentCompletedServices: filteredServiceEntries.filter((entry) => entry.technicianId === selectedTechnicianBase.technicianId).slice(0, 5),
        recentActivity: getTechnicianRecentActivity({
          completedServices: filteredServiceEntries,
          workLogs: filteredWorkLogs,
          technicianId: selectedTechnicianBase.technicianId,
          limit: 5,
        }),
        categoryBreakdown: getTechnicianCategoryBreakdown({
          completedServices: filteredServiceEntries,
          technicianId: selectedTechnicianBase.technicianId,
        }),
      }
    : null;

  const kpis = computeTechnicianKpis({
    leaderboard: filteredLeaderboard,
    serviceEntries: filteredServiceEntries,
    nowIso,
  });

  const recentActivity = getTechnicianRecentActivity({
    completedServices: filteredServiceEntries,
    workLogs: filteredWorkLogs,
    limit: 8,
  });

  return {
    kpis,
    leaderboard: filteredLeaderboard,
    selectedTechnician,
    recentActivity,
    categoryBreakdown,
    technicianOptions: buildTechnicianOptions(users),
    roleOptions: buildRoleOptions(users),
    categoryOptions: buildCategoryOptions(filteredServiceEntries),
    productionMode: kpis.productionMode,
    visibleTechnicians: filteredLeaderboard.length,
  };
}
