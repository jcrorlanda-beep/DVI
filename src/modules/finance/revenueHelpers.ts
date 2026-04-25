import type { RepairOrderRecord, RepairOrderWorkLine, UserAccount } from "../shared/types";

export type RevenueDateFilter = {
  from?: string;
  to?: string;
};

export type RevenueWorkLine = {
  roId: string;
  roNumber: string;
  advisorName: string;
  technicianId?: string;
  technicianName?: string;
  category: string;
  title: string;
  completedAt: string;
  revenue: number;
  hasPrice: boolean;
};

export type RevenueDashboardViewModel = {
  totalRevenue: number;
  completedRoCount: number;
  completedServiceCount: number;
  fallbackServiceCount: number;
  byRo: Array<{ roId: string; roNumber: string; customerName: string; revenue: number; serviceCount: number }>;
  byCategory: Array<{ category: string; revenue: number; count: number }>;
  byAdvisor: Array<{ advisorName: string; revenue: number; count: number }>;
  byTechnician: Array<{ technicianId: string; technicianName: string; revenue: number; count: number }>;
};

function parseAmount(value?: string | number | null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCompletedRo(ro: RepairOrderRecord) {
  return ro.status === "Ready Release" || ro.status === "Released" || ro.status === "Closed";
}

function isCompletedLine(line: RepairOrderWorkLine, ro: RepairOrderRecord) {
  return line.status === "Completed" || isCompletedRo(ro);
}

function isWithinDate(value: string, filter: RevenueDateFilter) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return true;
  if (filter.from) {
    const from = new Date(`${filter.from}T00:00:00`).getTime();
    if (!Number.isNaN(from) && time < from) return false;
  }
  if (filter.to) {
    const to = new Date(`${filter.to}T23:59:59`).getTime();
    if (!Number.isNaN(to) && time > to) return false;
  }
  return true;
}

export function getRevenueWorkLines(
  repairOrders: RepairOrderRecord[],
  users: UserAccount[],
  filter: RevenueDateFilter = {}
): RevenueWorkLine[] {
  const userById = new Map(users.map((user) => [user.id, user] as const));
  return repairOrders.flatMap((ro) => {
    const completedAt = ro.workLines.find((line) => line.completedAt)?.completedAt || ro.updatedAt || ro.createdAt;
    if (!isCompletedRo(ro) || !isWithinDate(completedAt, filter)) return [];
    return ro.workLines.filter((line) => isCompletedLine(line, ro)).map((line) => {
      const revenue = parseAmount(line.totalEstimate) || parseAmount(line.serviceEstimate) + parseAmount(line.partsEstimate);
      const technician = line.assignedTechnicianId ? userById.get(line.assignedTechnicianId) : undefined;
      return {
        roId: ro.id,
        roNumber: ro.roNumber,
        advisorName: ro.advisorName || "Unassigned",
        technicianId: line.assignedTechnicianId || ro.primaryTechnicianId || "",
        technicianName: technician?.fullName || line.assignedTechnicianId || ro.primaryTechnicianId || "Unassigned",
        category: line.category || "General",
        title: line.title || "Untitled service",
        completedAt,
        revenue,
        hasPrice: revenue > 0,
      };
    });
  });
}

function addGrouped<T extends { revenue: number; count: number }>(
  map: Map<string, T>,
  key: string,
  create: () => T,
  revenue: number
) {
  const current = map.get(key) ?? create();
  current.revenue += revenue;
  current.count += 1;
  map.set(key, current);
}

export function buildRevenueDashboardViewModel(
  repairOrders: RepairOrderRecord[],
  users: UserAccount[],
  filter: RevenueDateFilter = {}
): RevenueDashboardViewModel {
  const lines = getRevenueWorkLines(repairOrders, users, filter);
  const byRoMap = new Map<string, { roId: string; roNumber: string; customerName: string; revenue: number; serviceCount: number }>();
  const byCategoryMap = new Map<string, { category: string; revenue: number; count: number }>();
  const byAdvisorMap = new Map<string, { advisorName: string; revenue: number; count: number }>();
  const byTechnicianMap = new Map<string, { technicianId: string; technicianName: string; revenue: number; count: number }>();

  lines.forEach((line) => {
    const ro = repairOrders.find((row) => row.id === line.roId);
    const currentRo = byRoMap.get(line.roId) ?? {
      roId: line.roId,
      roNumber: line.roNumber,
      customerName: ro?.customerName || ro?.accountLabel || "Customer",
      revenue: 0,
      serviceCount: 0,
    };
    currentRo.revenue += line.revenue;
    currentRo.serviceCount += 1;
    byRoMap.set(line.roId, currentRo);
    addGrouped(byCategoryMap, line.category, () => ({ category: line.category, revenue: 0, count: 0 }), line.revenue);
    addGrouped(byAdvisorMap, line.advisorName, () => ({ advisorName: line.advisorName, revenue: 0, count: 0 }), line.revenue);
    addGrouped(
      byTechnicianMap,
      line.technicianId || "unassigned",
      () => ({ technicianId: line.technicianId || "unassigned", technicianName: line.technicianName || "Unassigned", revenue: 0, count: 0 }),
      line.revenue
    );
  });

  return {
    totalRevenue: lines.reduce((sum, line) => sum + line.revenue, 0),
    completedRoCount: byRoMap.size,
    completedServiceCount: lines.length,
    fallbackServiceCount: lines.filter((line) => !line.hasPrice).length,
    byRo: Array.from(byRoMap.values()).sort((a, b) => b.revenue - a.revenue),
    byCategory: Array.from(byCategoryMap.values()).sort((a, b) => b.revenue - a.revenue || b.count - a.count),
    byAdvisor: Array.from(byAdvisorMap.values()).sort((a, b) => b.revenue - a.revenue || b.count - a.count),
    byTechnician: Array.from(byTechnicianMap.values()).sort((a, b) => b.revenue - a.revenue || b.count - a.count),
  };
}
