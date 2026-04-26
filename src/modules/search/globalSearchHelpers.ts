import type { ViewKey } from "../shared/types";

type SearchableBooking = {
  id: string;
  bookingNumber: string;
  customerName: string;
  companyName: string;
  plateNumber: string;
  conductionNumber: string;
  make: string;
  model: string;
  year: string;
  serviceType: string;
  serviceDetail: string;
  concern: string;
  notes: string;
  status: string;
};

type SearchableIntake = {
  id: string;
  intakeNumber: string;
  customerName: string;
  companyName: string;
  plateNumber: string;
  conductionNumber: string;
  make: string;
  model: string;
  year: string;
  concern: string;
  notes: string;
  status: string;
};

type SearchableInspection = {
  id: string;
  inspectionNumber: string;
  accountLabel: string;
  plateNumber: string;
  conductionNumber: string;
  make: string;
  model: string;
  year: string;
  concern: string;
  inspectionNotes: string;
  recommendedWork: string;
  status: string;
};

type SearchableRepairOrder = {
  id: string;
  roNumber: string;
  accountLabel: string;
  plateNumber: string;
  conductionNumber: string;
  make: string;
  model: string;
  year: string;
  customerConcern: string;
  status: string;
  advisorName: string;
  workLines: Array<{ title: string; category: string; notes: string; customerDescription: string }>;
};

type SearchablePartsRequest = {
  id: string;
  requestNumber: string;
  roNumber: string;
  plateNumber: string;
  vehicleLabel: string;
  partName: string;
  partNumber: string;
  status: string;
  notes: string;
};

type SearchableServiceHistory = {
  id: string;
  roNumber: string;
  plateNumber: string;
  vehicleKey: string;
  title: string;
  category: string;
  completedAt: string;
};

type SearchableCustomerAccount = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  linkedPlateNumbers: string[];
};

type SearchableSupplierProfile = {
  supplierName: string;
  contactPerson?: string;
  brandsCarried?: string;
  categoriesSupplied?: string;
  active?: boolean;
};

export type GlobalSearchItem = {
  id: string;
  key: string;
  group: "Booking" | "Intake" | "Inspection" | "Repair Order" | "Parts Request" | "Service History" | "Customer" | "Supplier";
  title: string;
  subtitle: string;
  detail: string;
  view?: ViewKey;
  score: number;
};

export type GlobalSearchGroup = {
  group: GlobalSearchItem["group"];
  items: GlobalSearchItem[];
};

export type GlobalSearchViewModel = {
  query: string;
  totalResults: number;
  groups: GlobalSearchGroup[];
};

function normalize(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function includesAny(text: string, query: string) {
  return normalize(text).includes(query);
}

function makeScore(text: string, query: string) {
  const normalized = normalize(text);
  if (!normalized.includes(query)) return 0;
  if (normalized.startsWith(query)) return 4;
  if (normalized.includes(` ${query}`) || normalized.includes(`${query} `)) return 3;
  return 2;
}

function safeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pushIfMatch(
  results: GlobalSearchItem[],
  group: GlobalSearchItem["group"],
  sourceId: string,
  title: string,
  subtitle: string,
  detail: string,
  searchText: string,
  query: string,
  view?: ViewKey
) {
  if (!query) return;
  if (!includesAny(searchText, query)) return;
  results.push({ id: `${safeKey(group)}-${sourceId}`, key: safeKey(group), group, title, subtitle, detail, view, score: makeScore(searchText, query) });
}

export function buildGlobalSearchViewModel({
  query,
  bookings,
  intakeRecords,
  inspectionRecords,
  repairOrders,
  partsRequests,
  serviceHistoryRecords,
  customerAccounts,
  supplierProfiles,
}: {
  query: string;
  bookings: SearchableBooking[];
  intakeRecords: SearchableIntake[];
  inspectionRecords: SearchableInspection[];
  repairOrders: SearchableRepairOrder[];
  partsRequests: SearchablePartsRequest[];
  serviceHistoryRecords: SearchableServiceHistory[];
  customerAccounts: SearchableCustomerAccount[];
  supplierProfiles: SearchableSupplierProfile[];
}): GlobalSearchViewModel {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return { query: "", totalResults: 0, groups: [] };
  }

  const results: GlobalSearchItem[] = [];

  bookings.forEach((row) => {
    pushIfMatch(
      results,
      "Booking",
      row.id,
      row.bookingNumber,
      [row.customerName || row.companyName || "Unknown customer", row.plateNumber || row.conductionNumber || "No plate"].join(" • "),
      [row.serviceType, row.serviceDetail, row.concern, row.notes, row.status].filter(Boolean).join(" • "),
      [row.bookingNumber, row.customerName, row.companyName, row.plateNumber, row.conductionNumber, row.serviceType, row.serviceDetail, row.concern, row.notes, row.status].join(" "),
      normalizedQuery,
      "bookings"
    );
  });

  intakeRecords.forEach((row) => {
    pushIfMatch(
      results,
      "Intake",
      row.id,
      row.intakeNumber,
      [row.customerName || row.companyName || "Unknown customer", row.plateNumber || row.conductionNumber || "No plate"].join(" • "),
      [row.concern, row.notes, row.status].filter(Boolean).join(" • "),
      [row.intakeNumber, row.customerName, row.companyName, row.plateNumber, row.conductionNumber, row.make, row.model, row.year, row.concern, row.notes, row.status].join(" "),
      normalizedQuery,
      "intake"
    );
  });

  inspectionRecords.forEach((row) => {
    pushIfMatch(
      results,
      "Inspection",
      row.id,
      row.inspectionNumber,
      [row.accountLabel || "Unknown customer", row.plateNumber || row.conductionNumber || "No plate"].join(" • "),
      [row.concern, row.inspectionNotes, row.recommendedWork, row.status].filter(Boolean).join(" • "),
      [row.inspectionNumber, row.accountLabel, row.plateNumber, row.conductionNumber, row.make, row.model, row.year, row.concern, row.inspectionNotes, row.recommendedWork, row.status].join(" "),
      normalizedQuery,
      "inspection"
    );
  });

  repairOrders.forEach((row) => {
    pushIfMatch(
      results,
      "Repair Order",
      row.id,
      row.roNumber,
      [row.accountLabel || "Unknown customer", row.plateNumber || row.conductionNumber || "No plate"].join(" • "),
      [row.customerConcern, row.status, row.advisorName].filter(Boolean).join(" • "),
      [row.roNumber, row.accountLabel, row.plateNumber, row.conductionNumber, row.make, row.model, row.year, row.customerConcern, row.status, row.advisorName, ...row.workLines.flatMap((line) => [line.title, line.category, line.notes, line.customerDescription])].join(" "),
      normalizedQuery,
      "repairOrders"
    );
  });

  partsRequests.forEach((row) => {
    pushIfMatch(
      results,
      "Parts Request",
      row.id,
      row.requestNumber,
      [row.vehicleLabel || "Vehicle", row.plateNumber || "No plate"].join(" • "),
      [row.partName, row.partNumber, row.status, row.notes].filter(Boolean).join(" • "),
      [row.requestNumber, row.roNumber, row.plateNumber, row.vehicleLabel, row.partName, row.partNumber, row.status, row.notes].join(" "),
      normalizedQuery,
      "parts"
    );
  });

  serviceHistoryRecords.forEach((row) => {
    pushIfMatch(
      results,
      "Service History",
      row.id,
      row.title,
      [row.roNumber || "No RO", row.plateNumber || row.vehicleKey || "Vehicle"].join(" • "),
      [row.category, row.completedAt].filter(Boolean).join(" • "),
      [row.roNumber, row.plateNumber, row.vehicleKey, row.title, row.category, row.completedAt].join(" "),
      normalizedQuery,
      "history"
    );
  });

  customerAccounts.forEach((row) => {
    pushIfMatch(
      results,
      "Customer",
      row.id,
      row.fullName,
      [row.phone || "No phone", row.email || "No email"].join(" • "),
      row.linkedPlateNumbers.filter(Boolean).join(" • "),
      [row.fullName, row.phone, row.email, ...row.linkedPlateNumbers].join(" "),
      normalizedQuery,
      "history"
    );
  });

  supplierProfiles.forEach((row) => {
    pushIfMatch(
      results,
      "Supplier",
      row.supplierName,
      row.supplierName,
      [row.contactPerson || "No contact", row.active === false ? "Inactive" : "Active"].join(" • "),
      [row.brandsCarried, row.categoriesSupplied].filter(Boolean).join(" • "),
      [row.supplierName, row.contactPerson, row.brandsCarried, row.categoriesSupplied].join(" "),
      normalizedQuery,
      "parts"
    );
  });

  const groupedMap = new Map<GlobalSearchItem["group"], GlobalSearchItem[]>();
  results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .forEach((item) => {
      const current = groupedMap.get(item.group) ?? [];
      current.push(item);
      groupedMap.set(item.group, current);
    });

  const groups = Array.from(groupedMap.entries())
    .map(([group, items]) => ({ group, items }))
    .filter((group) => group.items.length > 0);

  return {
    query: normalizedQuery,
    totalResults: results.length,
    groups,
  };
}
