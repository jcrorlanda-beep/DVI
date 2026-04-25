import { buildReportSnapshot, getUpcomingMaintenance, toTimelineCompletedItem, toTimelineUpcomingItem, type TimelineCompletedItem, type TimelineUpcomingItem, type TimelineVehicleSummary } from "./maintenanceHelpers";
import type { MaintenanceIntervalRuleRecord, RepairOrderRecord, VehicleServiceHistoryRecord } from "../shared/types";

export type MaintenanceDashboardVehicleSummary = {
  vehicleId: string;
  plateNumber?: string;
  make?: string;
  model?: string;
  year?: number | string;
  customerName?: string;
  phoneNumber?: string;
  currentMileage?: number;
  repairOrderId?: string;
  repairOrderNumber?: string;
};

export type MaintenanceDashboardUpcomingItem = {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  plateNumber?: string;
  customerName?: string;
  serviceKey: string;
  title: string;
  category: string;
  status: "dueSoon" | "dueNow" | "overdue";
  dueSummaryText?: string;
  kmDelta?: number | null;
  timeDeltaDays?: number | null;
};

export type MaintenanceDashboardCompletedItem = {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  plateNumber?: string;
  customerName?: string;
  repairOrderId?: string;
  serviceKey: string;
  title: string;
  category: string;
  completedAt: string;
  repairOrderNumber?: string;
  historyOrigin?: "Writeback" | "Seeded / Demo";
  sourceTypeLabel?: string;
};

export type MaintenanceDashboardKpis = {
  dueNow: number;
  overdue: number;
  dueSoon: number;
  vehiclesWithUpcomingItems: number;
  completedThisMonth: number;
  recentWritebacks: number;
};

export type DashboardCategoryCount = {
  category: string;
  count: number;
};

export type DashboardVehicleFollowUp = {
  vehicleId: string;
  vehicleLabel: string;
  plateNumber?: string;
  customerName?: string;
  overdueCount: number;
  dueNowCount: number;
  nextLikelyService?: string;
};

export type DashboardInsight = {
  id: string;
  label: string;
  value: string;
  tone?: "neutral" | "info" | "warning" | "critical" | "good";
};

export type DashboardFollowUpQueueItem = {
  id: string;
  customerName?: string;
  vehicleLabel: string;
  plateNumber?: string;
  reason: string;
  nextActionSuggestion: string;
  status: "dueSoon" | "dueNow" | "overdue";
};

export type BuildMaintenanceDashboardViewModelArgs = {
  upcomingItems: MaintenanceDashboardUpcomingItem[];
  completedItems: MaintenanceDashboardCompletedItem[];
  nowIso?: string;
};

export type BuildMaintenanceDashboardViewModelResult = {
  kpis: MaintenanceDashboardKpis;
  priorityItems: MaintenanceDashboardUpcomingItem[];
  followUpVehicles: DashboardVehicleFollowUp[];
  upcomingByStatus: {
    overdue: MaintenanceDashboardUpcomingItem[];
    dueNow: MaintenanceDashboardUpcomingItem[];
    dueSoon: MaintenanceDashboardUpcomingItem[];
  };
  categoryCounts: DashboardCategoryCount[];
  recentCompleted: MaintenanceDashboardCompletedItem[];
  insights: DashboardInsight[];
  advisorFollowUpQueue: DashboardFollowUpQueueItem[];
  recentlyUpdatedVehicles: DashboardVehicleFollowUp[];
};

export type BuildMaintenanceDashboardSourceArgs = {
  repairOrders: RepairOrderRecord[];
  serviceHistoryRecords: VehicleServiceHistoryRecord[];
  maintenanceIntervalRules: MaintenanceIntervalRuleRecord[];
};

export type BuildMaintenanceDashboardSourceResult = {
  vehicles: MaintenanceDashboardVehicleSummary[];
  upcomingItems: MaintenanceDashboardUpcomingItem[];
  completedItems: MaintenanceDashboardCompletedItem[];
};

function normalizeText(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeVehicleId(plateNumber?: string, conductionNumber?: string) {
  const normalizedPlate = String(plateNumber ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const normalizedConduction = String(conductionNumber ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return normalizedPlate || normalizedConduction || "";
}

function parseMileage(value?: number | string | null) {
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function toVehicleLabel(vehicle: {
  year?: number | string;
  make?: string;
  model?: string;
}) {
  return [vehicle.year ? String(vehicle.year) : "", vehicle.make || "", vehicle.model || ""]
    .filter(Boolean)
    .join(" ") || "Unknown Vehicle";
}

function getUpcomingPriority(item: MaintenanceDashboardUpcomingItem) {
  if (item.status === "overdue") return 0;
  if (item.status === "dueNow") return 1;
  return 2;
}

function getLeastUrgentPriority(item: MaintenanceDashboardUpcomingItem) {
  if (item.status === "dueSoon") return 0;
  if (item.status === "dueNow") return 1;
  return 2;
}

function getThisMonthKey(nowIso: string) {
  return nowIso.slice(0, 7);
}

function isRecent(nowIso: string, completedAt: string, days = 7) {
  const now = new Date(nowIso).getTime();
  const completed = new Date(completedAt).getTime();
  if (Number.isNaN(now) || Number.isNaN(completed)) return false;
  return now - completed <= days * 24 * 60 * 60 * 1000;
}

function toDashboardUpcomingItem(item: TimelineUpcomingItem, vehicle: MaintenanceDashboardVehicleSummary): MaintenanceDashboardUpcomingItem {
  return {
    id: item.id,
    vehicleId: vehicle.vehicleId,
    vehicleLabel: toVehicleLabel(vehicle),
    plateNumber: vehicle.plateNumber,
    customerName: vehicle.customerName,
    serviceKey: item.serviceKey,
    title: item.title,
    category: item.category || "General",
    status: item.status,
    dueSummaryText: item.dueSummaryText,
    kmDelta: item.kmDelta ?? null,
    timeDeltaDays: item.timeDeltaDays ?? null,
  };
}

function toDashboardCompletedItem(item: TimelineCompletedItem, vehicle: MaintenanceDashboardVehicleSummary): MaintenanceDashboardCompletedItem {
  return {
    id: item.id,
    vehicleId: vehicle.vehicleId,
    vehicleLabel: toVehicleLabel(vehicle),
    plateNumber: vehicle.plateNumber,
    customerName: vehicle.customerName,
    repairOrderId: item.roId,
    serviceKey: item.serviceKey,
    title: item.title,
    category: item.category || "General",
    completedAt: item.completedAt,
    repairOrderNumber: item.repairOrderNumber,
    sourceTypeLabel: item.sourceTypeLabel,
  };
}

export function buildMaintenanceDashboardSourceData({
  repairOrders,
  serviceHistoryRecords,
  maintenanceIntervalRules,
}: BuildMaintenanceDashboardSourceArgs): BuildMaintenanceDashboardSourceResult {
  const reportSnapshot = buildReportSnapshot({
    serviceHistoryRecords,
    repairOrders,
  });

  const latestRepairOrderByVehicle = new Map<string, RepairOrderRecord>();
  repairOrders.forEach((repairOrder) => {
    const vehicleId = normalizeVehicleId(repairOrder.plateNumber, repairOrder.conductionNumber);
    if (!vehicleId) return;
    const current = latestRepairOrderByVehicle.get(vehicleId);
    if (!current || repairOrder.updatedAt > current.updatedAt || repairOrder.createdAt > current.createdAt) {
      latestRepairOrderByVehicle.set(vehicleId, repairOrder);
    }
  });

  const vehicleIds = new Set<string>();
  reportSnapshot.rows.forEach((row) => vehicleIds.add(row.vehicleKey));
  latestRepairOrderByVehicle.forEach((_value, key) => vehicleIds.add(key));

  const vehicles: MaintenanceDashboardVehicleSummary[] = [];
  const upcomingItems: MaintenanceDashboardUpcomingItem[] = [];
  const completedItems: MaintenanceDashboardCompletedItem[] = [];

  Array.from(vehicleIds)
    .sort((a, b) => a.localeCompare(b))
    .forEach((vehicleId) => {
      const latestRepairOrder = latestRepairOrderByVehicle.get(vehicleId);
      const currentMileage = parseMileage(latestRepairOrder?.odometerKm);
      const vehicle: MaintenanceDashboardVehicleSummary = {
        vehicleId,
        plateNumber: latestRepairOrder?.plateNumber || reportSnapshot.rows.find((row) => row.vehicleKey === vehicleId)?.plateNumber || undefined,
        make: latestRepairOrder?.make || undefined,
        model: latestRepairOrder?.model || undefined,
        year: latestRepairOrder?.year || undefined,
        customerName: latestRepairOrder?.accountLabel || latestRepairOrder?.customerName || reportSnapshot.rows.find((row) => row.vehicleKey === vehicleId)?.customerLabel || undefined,
        phoneNumber: latestRepairOrder?.phone || undefined,
        currentMileage: currentMileage ?? undefined,
        repairOrderId: latestRepairOrder?.id,
        repairOrderNumber: latestRepairOrder?.roNumber,
      };

      vehicles.push(vehicle);

      const timeline = getUpcomingMaintenance({
        selectedVehicleKey: vehicleId,
        selectedVehicleLabel: toVehicleLabel(vehicle),
        selectedPlateNumber: vehicle.plateNumber || "",
        selectedCustomerLabel: vehicle.customerName || "Unknown Customer",
        selectedVehicleMake: vehicle.make ? String(vehicle.make) : "",
        selectedVehicleModel: vehicle.model ? String(vehicle.model) : "",
        selectedVehicleYear: vehicle.year ? String(vehicle.year) : "",
        currentOdometer: currentMileage != null ? String(currentMileage) : "",
        serviceHistoryRows: reportSnapshot.rows,
        maintenanceIntervalRules,
      });

      timeline.upcoming
        .map((item) => toDashboardUpcomingItem(toTimelineUpcomingItem(item, vehicle as TimelineVehicleSummary), vehicle))
        .forEach((item) => upcomingItems.push(item));

      reportSnapshot.rows
        .filter((row) => row.vehicleKey === vehicleId)
        .map((row) => {
          const base = toDashboardCompletedItem(toTimelineCompletedItem({ ...row, timelineStatus: "Completed" }), vehicle);
          return {
            ...base,
            historyOrigin: row.historyOrigin,
            sourceTypeLabel: row.sourceTypeLabel,
          };
        })
        .forEach((item) => completedItems.push(item));
    });

  return {
    vehicles,
    upcomingItems,
    completedItems,
  };
}

export function computeMaintenanceDashboardKpis({
  upcomingItems,
  completedItems,
  nowIso = new Date().toISOString(),
}: BuildMaintenanceDashboardViewModelArgs): MaintenanceDashboardKpis {
  const monthKey = getThisMonthKey(nowIso);
  return {
    dueNow: upcomingItems.filter((item) => item.status === "dueNow").length,
    overdue: upcomingItems.filter((item) => item.status === "overdue").length,
    dueSoon: upcomingItems.filter((item) => item.status === "dueSoon").length,
    vehiclesWithUpcomingItems: new Set(upcomingItems.map((item) => item.vehicleId)).size,
    completedThisMonth: completedItems.filter((item) => item.completedAt.startsWith(monthKey)).length,
    recentWritebacks: completedItems.filter((item) => item.historyOrigin === "Writeback" && isRecent(nowIso, item.completedAt, 7)).length,
  };
}

export function getPriorityMaintenanceItems(upcomingItems: MaintenanceDashboardUpcomingItem[], limit = 6) {
  return [...upcomingItems]
    .sort((a, b) => {
      const priorityDiff = getUpcomingPriority(a) - getUpcomingPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      const kmDeltaDiff = (b.kmDelta ?? Number.NEGATIVE_INFINITY) - (a.kmDelta ?? Number.NEGATIVE_INFINITY);
      if (kmDeltaDiff !== 0) return kmDeltaDiff;
      return a.vehicleLabel.localeCompare(b.vehicleLabel) || a.title.localeCompare(b.title);
    })
    .slice(0, limit);
}

export function getVehiclesNeedingFollowUp(upcomingItems: MaintenanceDashboardUpcomingItem[], limit = 6): DashboardVehicleFollowUp[] {
  const byVehicle = new Map<string, DashboardVehicleFollowUp>();
  upcomingItems.forEach((item) => {
    const current = byVehicle.get(item.vehicleId) ?? {
      vehicleId: item.vehicleId,
      vehicleLabel: item.vehicleLabel,
      plateNumber: item.plateNumber,
      customerName: item.customerName,
      overdueCount: 0,
      dueNowCount: 0,
      nextLikelyService: item.title,
    };
    if (item.status === "overdue") current.overdueCount += 1;
    if (item.status === "dueNow") current.dueNowCount += 1;
    if (!current.nextLikelyService || getUpcomingPriority(item) < getUpcomingPriority({ ...item, status: current.overdueCount > 0 ? "overdue" : current.dueNowCount > 0 ? "dueNow" : "dueSoon" })) {
      current.nextLikelyService = item.title;
    }
    byVehicle.set(item.vehicleId, current);
  });

  return Array.from(byVehicle.values())
    .sort((a, b) => {
      if (b.overdueCount !== a.overdueCount) return b.overdueCount - a.overdueCount;
      if (b.dueNowCount !== a.dueNowCount) return b.dueNowCount - a.dueNowCount;
      return a.vehicleLabel.localeCompare(b.vehicleLabel);
    })
    .slice(0, limit);
}

export function getUpcomingItemsByStatus(upcomingItems: MaintenanceDashboardUpcomingItem[]) {
  return {
    overdue: upcomingItems.filter((item) => item.status === "overdue"),
    dueNow: upcomingItems.filter((item) => item.status === "dueNow"),
    dueSoon: upcomingItems.filter((item) => item.status === "dueSoon"),
  };
}

export function getMaintenanceCategoryCounts(upcomingItems: MaintenanceDashboardUpcomingItem[], completedItems: MaintenanceDashboardCompletedItem[], limit = 8): DashboardCategoryCount[] {
  const counts = new Map<string, number>();
  [...upcomingItems, ...completedItems].forEach((item) => {
    const category = item.category || "General";
    counts.set(category, (counts.get(category) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
    .slice(0, limit);
}

export function getRecentCompletedServices(completedItems: MaintenanceDashboardCompletedItem[], limit = 6) {
  return [...completedItems]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt) || a.vehicleLabel.localeCompare(b.vehicleLabel))
    .slice(0, limit);
}

export function buildDashboardInsights({ upcomingItems, completedItems, nowIso = new Date().toISOString() }: BuildMaintenanceDashboardViewModelArgs): DashboardInsight[] {
  const categoryCounts = getMaintenanceCategoryCounts(upcomingItems, completedItems, 1);
  const followUpVehicles = getVehiclesNeedingFollowUp(upcomingItems, 1);
  const recentCompleted = getRecentCompletedServices(completedItems, 1);
  const majorServiceKeys = new Set(
    completedItems
      .map((item) => normalizeText(item.serviceKey || item.title))
      .filter((key) => key.includes("egr") || key.includes("intake") || key.includes("major service"))
  );

  const insights: DashboardInsight[] = [];

  if (categoryCounts[0]) {
    insights.push({
      id: "common-category",
      label: "Most common due category",
      value: `${categoryCounts[0].category} appears most often across current maintenance activity.`,
      tone: "info",
    });
  }

  if (followUpVehicles[0]) {
    insights.push({
      id: "overdue-vehicle",
      label: "Most overdue vehicle",
      value: `${followUpVehicles[0].vehicleLabel}${followUpVehicles[0].plateNumber ? ` (${followUpVehicles[0].plateNumber})` : ""} has the highest follow-up load.`,
      tone: followUpVehicles[0].overdueCount > 0 ? "critical" : "warning",
    });
  }

  if (recentCompleted[0]) {
    insights.push({
      id: "recently-serviced",
      label: "Most recently serviced vehicle",
      value: `${recentCompleted[0].vehicleLabel}${recentCompleted[0].plateNumber ? ` (${recentCompleted[0].plateNumber})` : ""} was updated most recently.`,
      tone: "good",
    });
  }

  insights.push({
    id: "major-service-gap",
    label: "Vehicles with no recent major service",
    value: majorServiceKeys.size === 0
      ? "No recent EGR, intake cleaning, or major service records were found."
      : "Major-service writeback exists for at least one tracked vehicle.",
    tone: majorServiceKeys.size === 0 ? "warning" : "neutral",
  });

  insights.push({
    id: "activity-summary",
    label: "Recent activity summary",
    value: `${completedItems.filter((item) => isRecent(nowIso, item.completedAt, 14)).length} completed services were recorded in the last 14 days.`,
    tone: "neutral",
  });

  return insights;
}

export function getAdvisorFollowUpQueue(upcomingItems: MaintenanceDashboardUpcomingItem[], limit = 6): DashboardFollowUpQueueItem[] {
  return getPriorityMaintenanceItems(upcomingItems, limit).map((item) => ({
    id: item.id,
    customerName: item.customerName,
    vehicleLabel: item.vehicleLabel,
    plateNumber: item.plateNumber,
    reason: item.dueSummaryText || item.title,
    nextActionSuggestion:
      item.status === "overdue"
        ? "Contact customer and offer immediate booking."
        : item.status === "dueNow"
          ? "Call today and review recommended work."
          : "Send reminder and prepare follow-up estimate.",
    status: item.status,
  }));
}

export function getRecentlyUpdatedVehicles(
  upcomingItems: MaintenanceDashboardUpcomingItem[],
  completedItems: MaintenanceDashboardCompletedItem[],
  limit = 6
): DashboardVehicleFollowUp[] {
  const followUpMap = new Map(getVehiclesNeedingFollowUp(upcomingItems, 999).map((item) => [item.vehicleId, item]));
  const latestCompletedByVehicle = new Map<string, MaintenanceDashboardCompletedItem>();

  completedItems.forEach((item) => {
    const current = latestCompletedByVehicle.get(item.vehicleId);
    if (!current || item.completedAt > current.completedAt) {
      latestCompletedByVehicle.set(item.vehicleId, item);
    }
  });

  return Array.from(latestCompletedByVehicle.values())
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, limit)
    .map((item) => ({
      vehicleId: item.vehicleId,
      vehicleLabel: item.vehicleLabel,
      plateNumber: item.plateNumber,
      customerName: item.customerName,
      overdueCount: followUpMap.get(item.vehicleId)?.overdueCount || 0,
      dueNowCount: followUpMap.get(item.vehicleId)?.dueNowCount || 0,
      nextLikelyService: followUpMap.get(item.vehicleId)?.nextLikelyService || item.title,
    }));
}

export function buildMaintenanceDashboardViewModel({
  upcomingItems,
  completedItems,
  nowIso = new Date().toISOString(),
}: BuildMaintenanceDashboardViewModelArgs): BuildMaintenanceDashboardViewModelResult {
  const kpis = computeMaintenanceDashboardKpis({
    upcomingItems,
    completedItems,
    nowIso,
  });

  return {
    kpis,
    priorityItems: getPriorityMaintenanceItems(upcomingItems),
    followUpVehicles: getVehiclesNeedingFollowUp(upcomingItems),
    upcomingByStatus: getUpcomingItemsByStatus(upcomingItems),
    categoryCounts: getMaintenanceCategoryCounts(upcomingItems, completedItems),
    recentCompleted: getRecentCompletedServices(completedItems),
    insights: buildDashboardInsights({
      upcomingItems,
      completedItems,
      nowIso,
    }),
    advisorFollowUpQueue: getAdvisorFollowUpQueue(upcomingItems),
    recentlyUpdatedVehicles: getRecentlyUpdatedVehicles(upcomingItems, completedItems),
  };
}
