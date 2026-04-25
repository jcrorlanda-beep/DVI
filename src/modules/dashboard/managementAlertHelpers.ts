import type { BackjobRecord, PartsRequestRecord, RepairOrderRecord } from "../shared/types";
import type { MaintenanceDashboardUpcomingItem } from "../maintenance/dashboardHelpers";
import { buildCustomerAnalyticsViewModel } from "../customers/customerAnalyticsHelpers";

export type ManagementAlert = {
  id: string;
  type: "approval" | "parts" | "backjob" | "margin" | "customer" | "maintenance" | "supplier";
  label: string;
  detail: string;
  count: number;
  severity: "info" | "warning" | "critical";
};

function daysSince(value?: string) {
  const time = new Date(value ?? "").getTime();
  if (Number.isNaN(time)) return 0;
  return Math.floor((Date.now() - time) / 86400000);
}

function parseAmount(value?: string | null) {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildManagementAlerts(args: {
  repairOrders: RepairOrderRecord[];
  partsRequests: PartsRequestRecord[];
  backjobRecords: BackjobRecord[];
  upcomingItems: MaintenanceDashboardUpcomingItem[];
}): ManagementAlert[] {
  const alerts: ManagementAlert[] = [];
  const overdueApprovals = args.repairOrders.filter((ro) => ro.status === "Waiting Approval" && daysSince(ro.updatedAt || ro.createdAt) >= 2);
  const waitingPartsTooLong = args.repairOrders.filter((ro) => ro.status === "Waiting Parts" && daysSince(ro.updatedAt || ro.createdAt) >= 3);
  const repeatedBackjobPlates = new Set(args.backjobRecords.map((row) => row.plateNumber).filter((plate) => args.backjobRecords.filter((item) => item.plateNumber === plate).length > 1));
  const lowMarginRos = args.repairOrders.filter((ro) => {
    const revenue = ro.workLines.reduce((sum, line) => sum + parseAmount(line.totalEstimate), 0);
    const cost = ro.workLines.reduce((sum, line) => sum + parseAmount(line.partsCost), 0);
    return revenue > 0 && revenue - cost < revenue * 0.15;
  });
  const inactiveCustomers = buildCustomerAnalyticsViewModel({ repairOrders: args.repairOrders, currentRole: "Admin" }).inactiveCustomers;
  const overdueMaintenance = args.upcomingItems.filter((item) => item.status === "overdue");
  const supplierDelays = args.partsRequests.filter((request) => ["Ordered", "In Transit", "Shipped"].includes(request.status) && daysSince(request.updatedAt || request.createdAt) >= 5);

  if (overdueApprovals.length) alerts.push({ id: "overdue-approvals", type: "approval", label: "Overdue approvals", detail: "Approval queue has aged repair orders.", count: overdueApprovals.length, severity: "warning" });
  if (waitingPartsTooLong.length) alerts.push({ id: "waiting-parts-too-long", type: "parts", label: "Waiting parts too long", detail: "Parts-blocked repair orders need supplier follow-up.", count: waitingPartsTooLong.length, severity: "warning" });
  if (repeatedBackjobPlates.size) alerts.push({ id: "repeated-backjobs", type: "backjob", label: "Repeated backjobs", detail: "Vehicles with multiple comeback records.", count: repeatedBackjobPlates.size, severity: "critical" });
  if (lowMarginRos.length) alerts.push({ id: "low-margin-ros", type: "margin", label: "Low-margin ROs", detail: "Internal cost is close to selling value.", count: lowMarginRos.length, severity: "warning" });
  if (inactiveCustomers.length) alerts.push({ id: "inactive-customers", type: "customer", label: "Inactive customers", detail: "Customers have no recent visit in the available history.", count: inactiveCustomers.length, severity: "info" });
  if (overdueMaintenance.length) alerts.push({ id: "overdue-maintenance", type: "maintenance", label: "Overdue maintenance", detail: "Maintenance follow-up opportunities are overdue.", count: overdueMaintenance.length, severity: "warning" });
  if (supplierDelays.length) alerts.push({ id: "supplier-delays", type: "supplier", label: "Supplier delays", detail: "Ordered or shipped parts have aged beyond the follow-up threshold.", count: supplierDelays.length, severity: "warning" });
  return alerts;
}
