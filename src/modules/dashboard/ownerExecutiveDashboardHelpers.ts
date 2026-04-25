import type { BackjobRecord, PartsRequestRecord, QCRecord, RepairOrderRecord, ReleaseRecord, UserAccount, WorkLog } from "../shared/types";

export type OwnerExecutiveDashboardViewModel = {
  allowed: boolean;
  kpis: {
    totalRevenue: number;
    completedRos: number;
    activeRos: number;
    waitingApprovals: number;
    waitingParts: number;
    readyForQc: number;
    readyForRelease: number;
    overdueFollowUps: number;
    backjobCount: number;
  };
  topServices: Array<{ title: string; count: number; revenue: number }>;
  technicianProductivity: Array<{ technicianName: string; completedServices: number }>;
  supplierPerformance: Array<{ supplierName: string; awardedCount: number }>;
};

function parseAmount(value?: string | null) {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildOwnerExecutiveDashboardViewModel(args: {
  role: string;
  repairOrders: RepairOrderRecord[];
  releaseRecords: ReleaseRecord[];
  partsRequests: PartsRequestRecord[];
  qcRecords: QCRecord[];
  backjobRecords: BackjobRecord[];
  users: UserAccount[];
  workLogs: WorkLog[];
}): OwnerExecutiveDashboardViewModel {
  const allowed = args.role === "Admin";
  if (!allowed) {
    return {
      allowed,
      kpis: { totalRevenue: 0, completedRos: 0, activeRos: 0, waitingApprovals: 0, waitingParts: 0, readyForQc: 0, readyForRelease: 0, overdueFollowUps: 0, backjobCount: 0 },
      topServices: [],
      technicianProductivity: [],
      supplierPerformance: [],
    };
  }

  const completedStatuses = new Set(["Ready Release", "Released", "Closed"]);
  const serviceMap = new Map<string, { title: string; count: number; revenue: number }>();
  const techMap = new Map<string, { technicianName: string; completedServices: number }>();
  const supplierMap = new Map<string, { supplierName: string; awardedCount: number }>();

  args.repairOrders.forEach((ro) => {
    ro.workLines.forEach((line) => {
      if (!completedStatuses.has(ro.status) && line.status !== "Completed") return;
      const service = serviceMap.get(line.title) ?? { title: line.title || "Untitled service", count: 0, revenue: 0 };
      service.count += 1;
      service.revenue += parseAmount(line.totalEstimate);
      serviceMap.set(service.title, service);

      const technicianId = line.assignedTechnicianId || ro.primaryTechnicianId;
      const technicianName = args.users.find((user) => user.id === technicianId)?.fullName || technicianId || "Unassigned";
      const tech = techMap.get(technicianName) ?? { technicianName, completedServices: 0 };
      tech.completedServices += 1;
      techMap.set(technicianName, tech);
    });
  });

  args.partsRequests.forEach((request) => {
    const selected = request.bids.find((bid) => bid.id === request.selectedBidId);
    if (!selected) return;
    const row = supplierMap.get(selected.supplierName) ?? { supplierName: selected.supplierName, awardedCount: 0 };
    row.awardedCount += 1;
    supplierMap.set(selected.supplierName, row);
  });

  return {
    allowed,
    kpis: {
      totalRevenue: args.releaseRecords.reduce((sum, release) => sum + parseAmount(release.finalTotalAmount), 0),
      completedRos: args.repairOrders.filter((ro) => completedStatuses.has(ro.status)).length,
      activeRos: args.repairOrders.filter((ro) => !completedStatuses.has(ro.status)).length,
      waitingApprovals: args.repairOrders.filter((ro) => ro.status === "Waiting Approval").length,
      waitingParts: args.repairOrders.filter((ro) => ro.status === "Waiting Parts").length,
      readyForQc: args.repairOrders.filter((ro) => ro.status === "Quality Check").length,
      readyForRelease: args.repairOrders.filter((ro) => ro.status === "Ready Release").length,
      overdueFollowUps: args.backjobRecords.filter((row) => row.status !== "Closed").length,
      backjobCount: args.backjobRecords.length,
    },
    topServices: Array.from(serviceMap.values()).sort((a, b) => b.count - a.count || b.revenue - a.revenue).slice(0, 5),
    technicianProductivity: Array.from(techMap.values()).sort((a, b) => b.completedServices - a.completedServices).slice(0, 5),
    supplierPerformance: Array.from(supplierMap.values()).sort((a, b) => b.awardedCount - a.awardedCount).slice(0, 5),
  };
}
