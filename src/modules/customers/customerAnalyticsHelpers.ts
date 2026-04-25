import type { RepairOrderRecord, UserRole } from "../shared/types";

export type VisitClassification =
  | "Return Customer / Existing Vehicle"
  | "New Customer / New Vehicle"
  | "Fleet / Company Customer";

export type CustomerVisitRow = {
  key: string;
  customerName: string;
  plateNumber: string;
  visitCount: number;
  lastVisitDate: string;
  classification: VisitClassification;
  totalSpend: number;
  averageSpendPerVisit: number;
  inactive: boolean;
};

export type CustomerAnalyticsFilters = {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export type CustomerAnalyticsViewModel = {
  visitRows: CustomerVisitRow[];
  repeatCustomers: CustomerVisitRow[];
  inactiveCustomers: CustomerVisitRow[];
  classificationCounts: Record<VisitClassification, number>;
  lifetimeValueRows: CustomerVisitRow[];
  clvAllowed: boolean;
};

function parseAmount(value?: string | null) {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function vehicleKey(ro: RepairOrderRecord) {
  return String(ro.plateNumber || ro.conductionNumber || `${ro.customerName}:${ro.make}:${ro.model}`).toLowerCase();
}

function isWithinRange(value: string, filters: CustomerAnalyticsFilters) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return true;
  if (filters.dateFrom) {
    const from = new Date(`${filters.dateFrom}T00:00:00`).getTime();
    if (!Number.isNaN(from) && time < from) return false;
  }
  if (filters.dateTo) {
    const to = new Date(`${filters.dateTo}T23:59:59`).getTime();
    if (!Number.isNaN(to) && time > to) return false;
  }
  return true;
}

function classifyVisit(ro: RepairOrderRecord, previousVisits: number): VisitClassification {
  if (ro.accountType === "Company / Fleet" || /fleet|company/i.test(ro.accountLabel || ro.companyName || "")) {
    return "Fleet / Company Customer";
  }
  return previousVisits > 0 ? "Return Customer / Existing Vehicle" : "New Customer / New Vehicle";
}

export function buildCustomerAnalyticsViewModel(args: {
  repairOrders: RepairOrderRecord[];
  filters?: CustomerAnalyticsFilters;
  currentRole: UserRole;
  nowIso?: string;
}): CustomerAnalyticsViewModel {
  const filters = args.filters ?? {};
  const term = String(filters.search ?? "").trim().toLowerCase();
  const now = new Date(args.nowIso ?? new Date().toISOString()).getTime();
  const visitsByVehicle = new Map<string, RepairOrderRecord[]>();
  const allSorted = args.repairOrders.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  allSorted.forEach((ro) => {
    const key = vehicleKey(ro);
    visitsByVehicle.set(key, [...(visitsByVehicle.get(key) ?? []), ro]);
  });

  const visibleOrders = allSorted.filter((ro) => {
    if (!isWithinRange(ro.createdAt, filters)) return false;
    if (!term) return true;
    return [ro.customerName, ro.accountLabel, ro.plateNumber, ro.make, ro.model, ro.roNumber].join(" ").toLowerCase().includes(term);
  });

  const rowsByVehicle = new Map<string, CustomerVisitRow>();
  const classificationCounts: Record<VisitClassification, number> = {
    "Return Customer / Existing Vehicle": 0,
    "New Customer / New Vehicle": 0,
    "Fleet / Company Customer": 0,
  };

  visibleOrders.forEach((ro) => {
    const key = vehicleKey(ro);
    const previousVisits = (visitsByVehicle.get(key) ?? []).filter((visit) => visit.createdAt < ro.createdAt).length;
    const classification = classifyVisit(ro, previousVisits);
    classificationCounts[classification] += 1;
    const current = rowsByVehicle.get(key) ?? {
      key,
      customerName: ro.accountLabel || ro.customerName || "Unknown Customer",
      plateNumber: ro.plateNumber || ro.conductionNumber || "-",
      visitCount: 0,
      lastVisitDate: "",
      classification,
      totalSpend: 0,
      averageSpendPerVisit: 0,
      inactive: false,
    };
    current.visitCount += 1;
    current.lastVisitDate = !current.lastVisitDate || ro.createdAt > current.lastVisitDate ? ro.createdAt : current.lastVisitDate;
    current.totalSpend += ro.workLines.reduce((sum, line) => sum + parseAmount(line.totalEstimate), 0);
    current.averageSpendPerVisit = current.visitCount ? current.totalSpend / current.visitCount : 0;
    const daysInactive = current.lastVisitDate ? (now - new Date(current.lastVisitDate).getTime()) / 86400000 : 0;
    current.inactive = daysInactive > 180;
    if (classification === "Fleet / Company Customer") current.classification = classification;
    else if (current.visitCount > 1) current.classification = "Return Customer / Existing Vehicle";
    rowsByVehicle.set(key, current);
  });

  const visitRows = Array.from(rowsByVehicle.values()).sort((a, b) => b.visitCount - a.visitCount || b.lastVisitDate.localeCompare(a.lastVisitDate));

  return {
    visitRows,
    repeatCustomers: visitRows.filter((row) => row.visitCount > 1),
    inactiveCustomers: visitRows.filter((row) => row.inactive),
    classificationCounts,
    lifetimeValueRows: visitRows.slice().sort((a, b) => b.totalSpend - a.totalSpend || b.visitCount - a.visitCount),
    clvAllowed: args.currentRole === "Admin" || args.currentRole === "Service Advisor",
  };
}
