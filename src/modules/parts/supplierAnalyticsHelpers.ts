import type { PartsRequestRecord, RepairOrderRecord, SupplierBid } from "../shared/types";
import { formatCurrency, parseMoneyInput } from "../shared/helpers";

export type SupplierAnalyticsFilters = {
  search: string;
  supplier: string;
  category: string;
  brand: string;
  requestStatus: string;
  awardedOnly: boolean;
  dateFrom: string;
  dateTo: string;
};

export type SupplierAnalyticsBidRow = {
  id: string;
  requestId: string;
  requestNumber: string;
  roNumber: string;
  vehicleLabel: string;
  plateNumber: string;
  accountLabel: string;
  category: string;
  partName: string;
  partNumber: string;
  supplierName: string;
  brand: string;
  condition: string;
  quantity: string;
  unitCost: number;
  totalCost: number;
  deliveryTimeLabel: string;
  deliveryDays: number | null;
  requestStatus: string;
  createdAt: string;
  updatedAt: string;
  selected: boolean;
  awarded: boolean;
  lowestCost: boolean;
  fastestDelivery: boolean;
};

export type SupplierAnalyticsKpis = {
  totalSupplierBids: number;
  totalAwardedBids: number;
  activeSuppliers: number;
  averageDeliveryDays: number | null;
  onTimeDeliveryRatePct: number | null;
  quoteToAwardConversionPct: number | null;
};

export type SupplierLeaderboardRow = {
  supplierName: string;
  bidsSubmitted: number;
  bidsWon: number;
  winRatePct: number | null;
  averageQuotedCost: number | null;
  averageDeliveryDays: number | null;
  onTimeRatePct: number | null;
  lowestCostWins: number;
  fastestWins: number;
  bestCategory: string;
  bestBrand: string;
};

export type SupplierBidComparisonStats = {
  averageBidsPerRequest: number;
  requestsWithMultipleBids: number;
  awardedRequests: number;
  lowestCostNotChosenCount: number;
  fastestDeliveryNotChosenCount: number;
  selectedVsLowestAverageDelta: number | null;
  selectedVsFastestAverageDelta: number | null;
};

export type SupplierDeliveryPerformanceRow = {
  supplierName: string;
  orderedCount: number;
  shippedCount: number;
  arrivedCount: number;
  averageDaysToArrival: number | null;
  delayedDeliveries: number;
  onTimePercentage: number | null;
};

export type SupplierCostTrendRow = {
  label: string;
  count: number;
  averageQuotedCost: number | null;
  averageDeliveryDays: number | null;
};

export type SupplierCategoryBreakdownRow = {
  category: string;
  count: number;
  averageQuotedCost: number | null;
  averageDeliveryDays: number | null;
};

export type SupplierRecentActivityRow = {
  supplierName: string;
  recentRequestNumbers: string[];
  recentStatuses: string[];
  lastActivityAt: string;
  latestVehicleLabel: string;
};

export type PreferredSupplierSuggestion = {
  id: string;
  label: string;
  supplierName: string;
  reason: string;
  tone?: "neutral" | "info" | "success" | "warning";
};

export type SupplierDetailRow = {
  supplierName: string;
  bidsSubmitted: number;
  bidsWon: number;
  averageQuotedCost: number | null;
  averageDeliveryDays: number | null;
  onTimeRatePct: number | null;
  categories: string[];
  brands: string[];
  recentBids: SupplierAnalyticsBidRow[];
  recentWins: SupplierAnalyticsBidRow[];
  recentActivityAt: string;
  recentRequestNumbers: string[];
  recentStatuses: string[];
};

export type BuildSupplierAnalyticsViewModelArgs = {
  partsRequests: PartsRequestRecord[];
  repairOrders: RepairOrderRecord[];
  filters: SupplierAnalyticsFilters;
};

export type BuildSupplierAnalyticsViewModelResult = {
  filteredRequests: PartsRequestRecord[];
  filteredBidRows: SupplierAnalyticsBidRow[];
  kpis: SupplierAnalyticsKpis;
  leaderboard: SupplierLeaderboardRow[];
  bidComparison: SupplierBidComparisonStats;
  deliveryPerformance: SupplierDeliveryPerformanceRow[];
  costTrends: {
    bySupplier: SupplierCostTrendRow[];
    byCategory: SupplierCostTrendRow[];
    byBrand: SupplierCostTrendRow[];
    byPeriod: SupplierCostTrendRow[];
  };
  categoryBreakdown: SupplierCategoryBreakdownRow[];
  recentActivity: SupplierRecentActivityRow[];
  preferredSuggestions: PreferredSupplierSuggestion[];
  supplierDetails: SupplierDetailRow[];
  supplierOptions: string[];
  categoryOptions: string[];
  brandOptions: string[];
  requestStatusOptions: string[];
};

const REQUEST_STATUS_OPTIONS = [
  "Draft",
  "Requested",
  "Sent to Suppliers",
  "Waiting for Bids",
  "Bidding",
  "Supplier Selected",
  "Ordered",
  "In Transit",
  "Shipped",
  "Arrived",
  "Parts Arrived",
  "Return Requested",
  "Return Approved",
  "Return Rejected",
  "Closed",
  "Cancelled",
];

const DELIVERY_STATUSES = new Set([
  "Ordered",
  "In Transit",
  "Shipped",
  "Arrived",
  "Parts Arrived",
  "Return Requested",
  "Return Approved",
  "Return Rejected",
  "Closed",
]);

function normalizeText(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function toIsoDate(value: string) {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toMoney(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return parseMoneyInput(String(value ?? ""));
}

function parseDeliveryDays(label: string) {
  const normalized = normalizeText(label);
  if (!normalized) return null;
  if (normalized.includes("same day")) return 0.5;
  if (normalized.includes("next day") || normalized.includes("tomorrow")) return 1;
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*hour/);
  if (hourMatch) return Math.max(0.1, Number(hourMatch[1]) / 24);
  const dayMatch = normalized.match(/(\d+(?:\.\d+)?)\s*day/);
  if (dayMatch) return Number(dayMatch[1]);
  const weekMatch = normalized.match(/(\d+(?:\.\d+)?)\s*week/);
  if (weekMatch) return Number(weekMatch[1]) * 7;
  const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    const number = Number(numberMatch[1]);
    if (normalized.includes("week")) return number * 7;
    if (normalized.includes("day")) return number;
    if (normalized.includes("hour")) return number / 24;
  }
  return null;
}

function getRequestCategory(request: PartsRequestRecord, repairOrders: RepairOrderRecord[]) {
  const linkedRO = repairOrders.find((row) => row.id === request.roId) ?? null;
  if (!linkedRO) return "General";
  if (request.workLineId) {
    const workLine = linkedRO.workLines.find((line) => line.id === request.workLineId);
    if (workLine?.category?.trim()) return workLine.category.trim();
  }
  const categories = uniqueStrings(linkedRO.workLines.map((line) => line.category || ""));
  if (categories.length > 0) return categories[0];
  return "General";
}

function getVehicleLabel(request: PartsRequestRecord, repairOrders: RepairOrderRecord[]) {
  const linkedRO = repairOrders.find((row) => row.id === request.roId) ?? null;
  return [linkedRO?.make, linkedRO?.model, linkedRO?.year].filter(Boolean).join(" ") || request.vehicleLabel || "Unknown Vehicle";
}

function buildBidRows(partsRequests: PartsRequestRecord[], repairOrders: RepairOrderRecord[]): SupplierAnalyticsBidRow[] {
  const rows: SupplierAnalyticsBidRow[] = [];
  for (const request of partsRequests) {
    const category = getRequestCategory(request, repairOrders);
    const vehicleLabel = getVehicleLabel(request, repairOrders);
    const requestBids = Array.isArray(request.bids) ? request.bids : [];
    const lowestCost = requestBids.length > 0 ? Math.min(...requestBids.map((bid) => toMoney(bid.totalCost))) : null;
    const fastestDays = requestBids.length > 0 ? Math.min(...requestBids.map((bid) => parseDeliveryDays(bid.deliveryTime) ?? Number.POSITIVE_INFINITY)) : Number.POSITIVE_INFINITY;
    const selectedBid = requestBids.find((bid) => bid.id === request.selectedBidId) ?? null;
    const selectedTotal = selectedBid ? toMoney(selectedBid.totalCost) : null;
    const selectedDays = selectedBid ? parseDeliveryDays(selectedBid.deliveryTime) : null;

    for (const bid of requestBids) {
      const bidDays = parseDeliveryDays(bid.deliveryTime);
      rows.push({
        id: bid.id,
        requestId: request.id,
        requestNumber: request.requestNumber,
        roNumber: request.roNumber,
        vehicleLabel,
        plateNumber: request.plateNumber,
        accountLabel: request.accountLabel,
        category,
        partName: request.partName,
        partNumber: request.partNumber,
        supplierName: bid.supplierName,
        brand: bid.brand,
        condition: bid.condition,
        quantity: bid.quantity,
        unitCost: toMoney(bid.unitCost),
        totalCost: toMoney(bid.totalCost),
        deliveryTimeLabel: bid.deliveryTime || "-",
        deliveryDays: bidDays,
        requestStatus: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        selected: bid.id === request.selectedBidId,
        awarded: bid.id === request.selectedBidId && !!request.selectedBidId,
        lowestCost: lowestCost !== null ? toMoney(bid.totalCost) === lowestCost : false,
        fastestDelivery: Number.isFinite(fastestDays) ? bidDays !== null && bidDays === fastestDays : false,
      });
    }
  }

  return rows;
}

function filterRows(
  rows: SupplierAnalyticsBidRow[],
  partsRequests: PartsRequestRecord[],
  filters: SupplierAnalyticsFilters
) {
  const term = normalizeText(filters.search);
  const from = filters.dateFrom ? new Date(filters.dateFrom).getTime() : NaN;
  const to = filters.dateTo ? new Date(filters.dateTo).getTime() : NaN;

  return rows.filter((row) => {
    if (filters.supplier && row.supplierName !== filters.supplier) return false;
    if (filters.category && row.category !== filters.category) return false;
    if (filters.brand && row.brand !== filters.brand) return false;
    if (filters.requestStatus && row.requestStatus !== filters.requestStatus) return false;
    if (filters.awardedOnly && !row.awarded) return false;
    if (!Number.isNaN(from) && toIsoDate(row.createdAt) < from) return false;
    if (!Number.isNaN(to) && toIsoDate(row.createdAt) > to + 86400000 - 1) return false;
    if (term) {
      const searchable = [
        row.requestNumber,
        row.roNumber,
        row.vehicleLabel,
        row.plateNumber,
        row.accountLabel,
        row.category,
        row.partName,
        row.partNumber,
        row.supplierName,
        row.brand,
        row.requestStatus,
        row.deliveryTimeLabel,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(term)) return false;
    }
    return true;
  });
}

function getRequestsFromRows(rows: SupplierAnalyticsBidRow[]) {
  return uniqueStrings(rows.map((row) => row.requestId));
}

export function getSupplierBidStats(rows: SupplierAnalyticsBidRow[], requests: PartsRequestRecord[]): SupplierBidComparisonStats {
  const requestIds = getRequestsFromRows(rows);
  const requestsWithMultipleBids = requestIds.filter((requestId) => rows.filter((row) => row.requestId === requestId).length > 1);
  let lowestCostNotChosenCount = 0;
  let fastestDeliveryNotChosenCount = 0;
  const selectedVsLowest: number[] = [];
  const selectedVsFastest: number[] = [];

  for (const request of requests) {
    const requestRows = rows.filter((row) => row.requestId === request.id);
    if (requestRows.length === 0) continue;
    const selected = requestRows.find((row) => row.selected) ?? null;
    if (!selected) continue;
    const lowest = requestRows.reduce((best, row) => (row.totalCost < best.totalCost ? row : best), requestRows[0]);
    const fastest = requestRows.reduce((best, row) => {
      if (best.deliveryDays === null) return row;
      if (row.deliveryDays === null) return best;
      return row.deliveryDays < best.deliveryDays ? row : best;
    }, requestRows[0]);
    if (selected.id !== lowest.id) {
      lowestCostNotChosenCount += 1;
      selectedVsLowest.push(selected.totalCost - lowest.totalCost);
    }
    if (selected.id !== fastest.id && fastest.deliveryDays !== null && selected.deliveryDays !== null) {
      fastestDeliveryNotChosenCount += 1;
      selectedVsFastest.push(selected.deliveryDays - fastest.deliveryDays);
    }
  }

  const averageBidsPerRequest = requestIds.length
    ? rows.length / requestIds.length
    : 0;

  return {
    averageBidsPerRequest: Number(averageBidsPerRequest.toFixed(1)),
    requestsWithMultipleBids: requestsWithMultipleBids.length,
    awardedRequests: requests.filter((request) => request.selectedBidId && rows.some((row) => row.requestId === request.id && row.selected)).length,
    lowestCostNotChosenCount,
    fastestDeliveryNotChosenCount,
    selectedVsLowestAverageDelta: selectedVsLowest.length ? Number((selectedVsLowest.reduce((sum, value) => sum + value, 0) / selectedVsLowest.length).toFixed(2)) : null,
    selectedVsFastestAverageDelta: selectedVsFastest.length ? Number((selectedVsFastest.reduce((sum, value) => sum + value, 0) / selectedVsFastest.length).toFixed(2)) : null,
  };
}

function aggregateBySupplier(rows: SupplierAnalyticsBidRow[]) {
  const map = new Map<string, SupplierAnalyticsBidRow[]>();
  for (const row of rows) {
    const list = map.get(row.supplierName) ?? [];
    list.push(row);
    map.set(row.supplierName, list);
  }
  return map;
}

export function getSupplierWinRates(rows: SupplierAnalyticsBidRow[]): SupplierLeaderboardRow[] {
  const map = aggregateBySupplier(rows);
  const result: SupplierLeaderboardRow[] = [];
  for (const [supplierName, supplierRows] of map.entries()) {
    const submitted = supplierRows.length;
    const wonRows = supplierRows.filter((row) => row.awarded);
    const wins = wonRows.length;
    const avgQuotedCost = submitted ? supplierRows.reduce((sum, row) => sum + row.totalCost, 0) / submitted : null;
    const withDelivery = supplierRows.filter((row) => row.deliveryDays !== null);
    const avgDeliveryDays = withDelivery.length
      ? Number((withDelivery.reduce((sum, row) => sum + (row.deliveryDays ?? 0), 0) / withDelivery.length).toFixed(1))
      : null;
    const arrivedWins = wonRows.filter((row) => ["Arrived", "Parts Arrived", "Closed"].includes(row.requestStatus));
    const onTimeRows = arrivedWins.filter((row) => row.deliveryDays !== null && ((toIsoDate(row.updatedAt) - toIsoDate(row.createdAt)) / 86400000) <= (row.deliveryDays ?? 0));
    const onTimePct = arrivedWins.length
      ? Number(((onTimeRows.length / arrivedWins.length) * 100).toFixed(1))
      : null;
    const categoryCounts = new Map<string, number>();
    const brandCounts = new Map<string, number>();
    let lowestCostWins = 0;
    let fastestWins = 0;
    for (const row of supplierRows) {
      categoryCounts.set(row.category, (categoryCounts.get(row.category) ?? 0) + 1);
      brandCounts.set(row.brand || "Unknown", (brandCounts.get(row.brand || "Unknown") ?? 0) + 1);
      if (row.awarded && row.lowestCost) lowestCostWins += 1;
      if (row.awarded && row.fastestDelivery) fastestWins += 1;
    }
    const bestCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || "General";
    const bestBrand = Array.from(brandCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || "Unknown";
    result.push({
      supplierName,
      bidsSubmitted: submitted,
      bidsWon: wins,
      winRatePct: submitted ? Number(((wins / submitted) * 100).toFixed(1)) : null,
      averageQuotedCost: avgQuotedCost === null ? null : Number(avgQuotedCost.toFixed(2)),
      averageDeliveryDays: avgDeliveryDays === null || Number.isNaN(avgDeliveryDays) ? null : Number(avgDeliveryDays.toFixed(1)),
      onTimeRatePct: onTimePct,
      lowestCostWins,
      fastestWins,
      bestCategory,
      bestBrand,
    });
  }
  return result.sort((a, b) => (b.bidsWon - a.bidsWon) || (b.winRatePct ?? 0) - (a.winRatePct ?? 0) || a.supplierName.localeCompare(b.supplierName));
}

export function getSupplierLeaderboard(rows: SupplierAnalyticsBidRow[]): SupplierLeaderboardRow[] {
  return getSupplierWinRates(rows);
}

export function getSupplierDeliveryPerformance(rows: SupplierAnalyticsBidRow[]): SupplierDeliveryPerformanceRow[] {
  const map = aggregateBySupplier(rows.filter((row) => row.awarded));
  const result: SupplierDeliveryPerformanceRow[] = [];
  for (const [supplierName, supplierRows] of map.entries()) {
    const orderedCount = supplierRows.filter((row) => DELIVERY_STATUSES.has(row.requestStatus)).length;
    const shippedCount = supplierRows.filter((row) => ["Shipped", "Arrived", "Parts Arrived", "Return Requested", "Return Approved", "Return Rejected", "Closed"].includes(row.requestStatus)).length;
    const arrivedRows = supplierRows.filter((row) => ["Arrived", "Parts Arrived", "Closed"].includes(row.requestStatus));
    const arrivedCount = arrivedRows.length;
    const delayedDeliveries = arrivedRows.filter((row) => row.deliveryDays !== null && ((toIsoDate(row.updatedAt) - toIsoDate(row.createdAt)) / 86400000) > (row.deliveryDays ?? 0)).length;
    const averageDaysToArrival = arrivedRows.length
      ? Number((arrivedRows.reduce((sum, row) => sum + Math.max(0, (toIsoDate(row.updatedAt) - toIsoDate(row.createdAt)) / 86400000), 0) / arrivedRows.length).toFixed(1))
      : null;
    const onTimePercentage = arrivedRows.length
      ? Number((((arrivedRows.length - delayedDeliveries) / arrivedRows.length) * 100).toFixed(1))
      : null;
    result.push({
      supplierName,
      orderedCount,
      shippedCount,
      arrivedCount,
      averageDaysToArrival,
      delayedDeliveries,
      onTimePercentage,
    });
  }
  return result.sort((a, b) => (b.arrivedCount - a.arrivedCount) || (b.onTimePercentage ?? 0) - (a.onTimePercentage ?? 0) || a.supplierName.localeCompare(b.supplierName));
}

export function getSupplierCostTrends(rows: SupplierAnalyticsBidRow[]) {
  const group = (selector: (row: SupplierAnalyticsBidRow) => string): SupplierCostTrendRow[] => {
    const map = new Map<string, SupplierAnalyticsBidRow[]>();
    for (const row of rows) {
      const key = selector(row) || "Unknown";
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .map(([label, list]) => ({
        label,
        count: list.length,
        averageQuotedCost: Number((list.reduce((sum, row) => sum + row.totalCost, 0) / list.length).toFixed(2)),
        averageDeliveryDays: list.some((row) => row.deliveryDays !== null)
          ? Number((list.filter((row) => row.deliveryDays !== null).reduce((sum, row) => sum + (row.deliveryDays ?? 0), 0) / list.filter((row) => row.deliveryDays !== null).length).toFixed(1))
          : null,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  };

  const byPeriodMap = new Map<string, SupplierAnalyticsBidRow[]>();
  for (const row of rows) {
    const date = new Date(row.createdAt);
    const label = Number.isNaN(date.getTime()) ? "Unknown" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const list = byPeriodMap.get(label) ?? [];
    list.push(row);
    byPeriodMap.set(label, list);
  }

  return {
    bySupplier: group((row) => row.supplierName),
    byCategory: group((row) => row.category),
    byBrand: group((row) => row.brand),
    byPeriod: Array.from(byPeriodMap.entries())
      .map(([label, list]) => ({
        label,
        count: list.length,
        averageQuotedCost: Number((list.reduce((sum, row) => sum + row.totalCost, 0) / list.length).toFixed(2)),
        averageDeliveryDays: list.some((row) => row.deliveryDays !== null)
          ? Number((list.filter((row) => row.deliveryDays !== null).reduce((sum, row) => sum + (row.deliveryDays ?? 0), 0) / list.filter((row) => row.deliveryDays !== null).length).toFixed(1))
          : null,
      }))
      .sort((a, b) => b.label.localeCompare(a.label)),
  };
}

export function getSupplierCategoryBreakdown(rows: SupplierAnalyticsBidRow[]): SupplierCategoryBreakdownRow[] {
  const map = new Map<string, SupplierAnalyticsBidRow[]>();
  for (const row of rows) {
    const list = map.get(row.category) ?? [];
    list.push(row);
    map.set(row.category, list);
  }
  return Array.from(map.entries())
    .map(([category, list]) => ({
      category,
      count: list.length,
      averageQuotedCost: Number((list.reduce((sum, row) => sum + row.totalCost, 0) / list.length).toFixed(2)),
      averageDeliveryDays: list.some((row) => row.deliveryDays !== null)
        ? Number((list.filter((row) => row.deliveryDays !== null).reduce((sum, row) => sum + (row.deliveryDays ?? 0), 0) / list.filter((row) => row.deliveryDays !== null).length).toFixed(1))
        : null,
    }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function getRecentSupplierActivity(rows: SupplierAnalyticsBidRow[]): SupplierRecentActivityRow[] {
  const map = new Map<string, SupplierRecentActivityRow>();
  for (const row of rows) {
    const existing = map.get(row.supplierName);
    if (!existing) {
      map.set(row.supplierName, {
        supplierName: row.supplierName,
        recentRequestNumbers: [row.requestNumber],
        recentStatuses: [row.requestStatus],
        lastActivityAt: row.createdAt,
        latestVehicleLabel: row.vehicleLabel,
      });
      continue;
    }
    if (toIsoDate(row.createdAt) > toIsoDate(existing.lastActivityAt)) {
      existing.lastActivityAt = row.createdAt;
      existing.latestVehicleLabel = row.vehicleLabel;
    }
    if (existing.recentRequestNumbers.length < 4 && !existing.recentRequestNumbers.includes(row.requestNumber)) {
      existing.recentRequestNumbers.push(row.requestNumber);
    }
    if (existing.recentStatuses.length < 4 && !existing.recentStatuses.includes(row.requestStatus)) {
      existing.recentStatuses.push(row.requestStatus);
    }
  }
  return Array.from(map.values()).sort((a, b) => toIsoDate(b.lastActivityAt) - toIsoDate(a.lastActivityAt));
}

export function getPreferredSupplierSuggestions(
  leaderboard: SupplierLeaderboardRow[],
  costTrends: ReturnType<typeof getSupplierCostTrends>,
  categoryBreakdown: SupplierCategoryBreakdownRow[],
  rows: SupplierAnalyticsBidRow[]
) {
  const suggestions: PreferredSupplierSuggestion[] = [];
  const topPrice = leaderboard
    .filter((row) => row.averageQuotedCost !== null)
    .sort((a, b) => (a.averageQuotedCost ?? Number.POSITIVE_INFINITY) - (b.averageQuotedCost ?? Number.POSITIVE_INFINITY))[0];
  if (topPrice) {
    suggestions.push({
      id: "best-price",
      label: "Best Price Performer",
      supplierName: topPrice.supplierName,
      reason: `Lowest average quoted cost at ${formatCurrency(topPrice.averageQuotedCost ?? 0)}.`,
      tone: "success",
    });
  }
  const topDelivery = leaderboard
    .filter((row) => row.averageDeliveryDays !== null)
    .sort((a, b) => (a.averageDeliveryDays ?? Number.POSITIVE_INFINITY) - (b.averageDeliveryDays ?? Number.POSITIVE_INFINITY))[0];
  if (topDelivery) {
    suggestions.push({
      id: "best-delivery",
      label: "Best Delivery Performer",
      supplierName: topDelivery.supplierName,
      reason: `Fastest average delivery at ${topDelivery.averageDeliveryDays?.toFixed(1) ?? "-"} days.`,
      tone: "info",
    });
  }
  const topWinRate = leaderboard
    .filter((row) => row.winRatePct !== null)
    .sort((a, b) => (b.winRatePct ?? 0) - (a.winRatePct ?? 0))[0];
  if (topWinRate) {
    suggestions.push({
      id: "best-win-rate",
      label: "Best Win-Rate Performer",
      supplierName: topWinRate.supplierName,
      reason: `${topWinRate.winRatePct?.toFixed(1) ?? "0.0"}% win rate across submitted bids.`,
      tone: "warning",
    });
  }

  for (const categoryRow of categoryBreakdown.slice(0, 3)) {
    const winner = leaderboard
      .filter((row) => row.bestCategory === categoryRow.category)
      .sort((a, b) => (b.bidsWon - a.bidsWon) || (b.onTimeRatePct ?? 0) - (a.onTimeRatePct ?? 0))[0];
    if (winner) {
      suggestions.push({
        id: `category-${categoryRow.category}`,
        label: `Best for ${categoryRow.category}`,
        supplierName: winner.supplierName,
        reason: `Most frequent winning supplier in ${categoryRow.category}.`,
        tone: "neutral",
      });
    }
  }

  const topBrand = costTrends.byBrand.sort((a, b) => b.count - a.count)[0];
  if (topBrand) {
    const winner = leaderboard
      .filter((row) => rows.some((bid) => bid.brand === topBrand.label && bid.supplierName === row.supplierName))
      .sort((a, b) => (b.bidsWon - a.bidsWon) || (a.averageQuotedCost ?? Number.POSITIVE_INFINITY) - (b.averageQuotedCost ?? Number.POSITIVE_INFINITY))[0];
    if (winner) {
      suggestions.push({
        id: `brand-${topBrand.label}`,
        label: `Best for ${topBrand.label}`,
        supplierName: winner.supplierName,
        reason: `Often chosen for ${topBrand.label} bids.`,
        tone: "neutral",
      });
    }
  }

  return suggestions.slice(0, 6);
}

export function computeSupplierKpis(rows: SupplierAnalyticsBidRow[], requests: PartsRequestRecord[]): SupplierAnalyticsKpis {
  const supplierNames = uniqueStrings(rows.map((row) => row.supplierName));
  const awardedRows = rows.filter((row) => row.awarded);
  const arrivalRows = awardedRows.filter((row) => ["Arrived", "Parts Arrived", "Closed"].includes(row.requestStatus));
  const totalDeliveryDays = arrivalRows.reduce((sum, row) => sum + Math.max(0, (toIsoDate(row.updatedAt) - toIsoDate(row.createdAt)) / 86400000), 0);
  const delayedDeliveries = arrivalRows.filter((row) => row.deliveryDays !== null && (toIsoDate(row.updatedAt) - toIsoDate(row.createdAt)) / 86400000 > (row.deliveryDays ?? 0)).length;
  const requestsWithBids = requests.filter((request) => Array.isArray(request.bids) && request.bids.length > 0).length;
  const awardedRequests = requests.filter((request) => request.selectedBidId && rows.some((row) => row.requestId === request.id && row.awarded)).length;
  const quoteToAwardConversionPct = requestsWithBids > 0 ? Number(((awardedRequests / requestsWithBids) * 100).toFixed(1)) : null;

  return {
    totalSupplierBids: rows.length,
    totalAwardedBids: awardedRows.length,
    activeSuppliers: supplierNames.length,
    averageDeliveryDays: arrivalRows.length ? Number((totalDeliveryDays / arrivalRows.length).toFixed(1)) : null,
    onTimeDeliveryRatePct: arrivalRows.length ? Number((((arrivalRows.length - delayedDeliveries) / arrivalRows.length) * 100).toFixed(1)) : null,
    quoteToAwardConversionPct,
  };
}

function getLeaderboard(rows: SupplierAnalyticsBidRow[]) {
  return getSupplierLeaderboard(rows);
}

function getSupplierDetails(rows: SupplierAnalyticsBidRow[]): SupplierDetailRow[] {
  const map = aggregateBySupplier(rows);
  const leaderboard = getLeaderboard(rows);
  const recentBySupplier = getRecentSupplierActivity(rows);
  const result: SupplierDetailRow[] = [];
  for (const [supplierName, supplierRows] of map.entries()) {
    const wins = supplierRows.filter((row) => row.awarded).sort((a, b) => toIsoDate(b.createdAt) - toIsoDate(a.createdAt));
    const recent = [...supplierRows].sort((a, b) => toIsoDate(b.createdAt) - toIsoDate(a.createdAt));
    const avgQuotedCost = supplierRows.length ? supplierRows.reduce((sum, row) => sum + row.totalCost, 0) / supplierRows.length : null;
    const withDelivery = supplierRows.filter((row) => row.deliveryDays !== null);
    const avgDeliveryDays = withDelivery.length ? withDelivery.reduce((sum, row) => sum + (row.deliveryDays ?? 0), 0) / withDelivery.length : null;
    const onTimeRows = wins.filter((row) => row.deliveryDays !== null && ["Arrived", "Parts Arrived", "Closed"].includes(row.requestStatus));
    const delayed = onTimeRows.filter((row) => row.deliveryDays !== null && ((toIsoDate(row.updatedAt) - toIsoDate(row.createdAt)) / 86400000) > (row.deliveryDays ?? 0));
    const categories = uniqueStrings(supplierRows.map((row) => row.category));
    const brands = uniqueStrings(supplierRows.map((row) => row.brand));
    const recentActivity = recentBySupplier.find((row) => row.supplierName === supplierName);

    result.push({
      supplierName,
      bidsSubmitted: supplierRows.length,
      bidsWon: wins.length,
      averageQuotedCost: avgQuotedCost === null ? null : Number(avgQuotedCost.toFixed(2)),
      averageDeliveryDays: avgDeliveryDays === null ? null : Number(avgDeliveryDays.toFixed(1)),
      onTimeRatePct: onTimeRows.length ? Number((((onTimeRows.length - delayed.length) / onTimeRows.length) * 100).toFixed(1)) : null,
      categories,
      brands,
      recentBids: recent.slice(0, 5),
      recentWins: wins.slice(0, 5),
      recentActivityAt: recentActivity?.lastActivityAt || recent[0]?.createdAt || "",
      recentRequestNumbers: recentActivity?.recentRequestNumbers || [],
      recentStatuses: recentActivity?.recentStatuses || [],
    });
  }

  return result.sort((a, b) => (b.bidsWon - a.bidsWon) || a.supplierName.localeCompare(b.supplierName));
}

export function buildSupplierAnalyticsViewModel(args: BuildSupplierAnalyticsViewModelArgs): BuildSupplierAnalyticsViewModelResult {
  const allRows = buildBidRows(args.partsRequests, args.repairOrders);
  const filteredRows = filterRows(allRows, args.partsRequests, args.filters);
  const filteredRequests = args.partsRequests.filter((request) => {
    const requestRows = filteredRows.filter((row) => row.requestId === request.id);
    return requestRows.length > 0;
  });
  const leaderboard = getLeaderboard(filteredRows);
  const costTrends = getSupplierCostTrends(filteredRows);
  return {
    filteredRequests,
    filteredBidRows: filteredRows,
    kpis: computeSupplierKpis(filteredRows, filteredRequests),
    leaderboard,
    bidComparison: getSupplierBidStats(filteredRows, filteredRequests),
    deliveryPerformance: getSupplierDeliveryPerformance(filteredRows),
    costTrends,
    categoryBreakdown: getSupplierCategoryBreakdown(filteredRows),
    recentActivity: getRecentSupplierActivity(filteredRows),
    preferredSuggestions: getPreferredSupplierSuggestions(leaderboard, costTrends, getSupplierCategoryBreakdown(filteredRows), filteredRows),
    supplierDetails: getSupplierDetails(filteredRows),
    supplierOptions: uniqueStrings(allRows.map((row) => row.supplierName)).sort((a, b) => a.localeCompare(b)),
    categoryOptions: uniqueStrings(allRows.map((row) => row.category)).sort((a, b) => a.localeCompare(b)),
    brandOptions: uniqueStrings(allRows.map((row) => row.brand)).sort((a, b) => a.localeCompare(b)),
    requestStatusOptions: REQUEST_STATUS_OPTIONS,
  };
}
