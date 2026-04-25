import type { PartsRequestRecord, RepairOrderRecord, UserRole } from "../shared/types";

export type MarginViewModel = {
  allowed: boolean;
  totalRevenue: number;
  totalCost: number;
  estimatedMargin: number;
  missingCostCount: number;
  byRo: Array<{ roNumber: string; customerName: string; revenue: number; cost: number; margin: number }>;
  byCategory: Array<{ category: string; revenue: number; cost: number; margin: number; count: number }>;
  bySupplier: Array<{ supplierName: string; revenue: number; cost: number; margin: number; count: number }>;
};

function parseAmount(value?: string | number | null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function canViewMargin(role: UserRole) {
  return role === "Admin";
}

function getSelectedSupplierName(request: PartsRequestRecord) {
  const selected = request.bids.find((bid) => bid.id === request.selectedBidId);
  return selected?.supplierName || "Unassigned";
}

export function buildMarginViewModel(
  repairOrders: RepairOrderRecord[],
  partsRequests: PartsRequestRecord[],
  role: UserRole
): MarginViewModel {
  if (!canViewMargin(role)) {
    return { allowed: false, totalRevenue: 0, totalCost: 0, estimatedMargin: 0, missingCostCount: 0, byRo: [], byCategory: [], bySupplier: [] };
  }

  const byRo = repairOrders
    .filter((ro) => ["Ready Release", "Released", "Closed"].includes(ro.status))
    .map((ro) => {
      const revenue = ro.workLines.reduce((sum, line) => sum + parseAmount(line.totalEstimate), 0);
      const cost = ro.workLines.reduce((sum, line) => sum + parseAmount(line.partsCost), 0);
      return {
        roNumber: ro.roNumber,
        customerName: ro.customerName || ro.accountLabel || "Customer",
        revenue,
        cost,
        margin: revenue - cost,
      };
    })
    .sort((a, b) => b.margin - a.margin);

  const categoryMap = new Map<string, { category: string; revenue: number; cost: number; margin: number; count: number }>();
  repairOrders.forEach((ro) => {
    if (!["Ready Release", "Released", "Closed"].includes(ro.status)) return;
    ro.workLines.forEach((line) => {
      const key = line.category || "General";
      const current = categoryMap.get(key) ?? { category: key, revenue: 0, cost: 0, margin: 0, count: 0 };
      current.revenue += parseAmount(line.totalEstimate);
      current.cost += parseAmount(line.partsCost);
      current.margin = current.revenue - current.cost;
      current.count += 1;
      categoryMap.set(key, current);
    });
  });

  const supplierMap = new Map<string, { supplierName: string; revenue: number; cost: number; margin: number; count: number }>();
  partsRequests.forEach((request) => {
    const supplierName = getSelectedSupplierName(request);
    const selectedBid = request.bids.find((bid) => bid.id === request.selectedBidId);
    const cost = parseAmount(selectedBid?.totalCost);
    const revenue = parseAmount(request.customerSellingPrice);
    const current = supplierMap.get(supplierName) ?? { supplierName, revenue: 0, cost: 0, margin: 0, count: 0 };
    current.revenue += revenue;
    current.cost += cost;
    current.margin = current.revenue - current.cost;
    current.count += 1;
    supplierMap.set(supplierName, current);
  });

  const totalRevenue = byRo.reduce((sum, row) => sum + row.revenue, 0);
  const totalCost = byRo.reduce((sum, row) => sum + row.cost, 0);
  return {
    allowed: true,
    totalRevenue,
    totalCost,
    estimatedMargin: totalRevenue - totalCost,
    missingCostCount: repairOrders.flatMap((ro) => ro.workLines).filter((line) => parseAmount(line.totalEstimate) > 0 && parseAmount(line.partsCost) === 0).length,
    byRo,
    byCategory: Array.from(categoryMap.values()).sort((a, b) => b.margin - a.margin),
    bySupplier: Array.from(supplierMap.values()).sort((a, b) => b.margin - a.margin),
  };
}
