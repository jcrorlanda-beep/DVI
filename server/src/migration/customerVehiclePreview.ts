type MigrationModuleInput = {
  moduleKey?: string;
  tableName?: string;
  records?: unknown;
};

export type CustomerVehiclePreviewInput = {
  customers?: unknown;
  vehicles?: unknown;
  modules?: MigrationModuleInput[];
};

type PreviewRecord = Record<string, unknown>;

function toRecords(value: unknown): PreviewRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  if (value && typeof value === "object") {
    return Object.values(value).filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  }
  return [];
}

function findModuleRecords(input: CustomerVehiclePreviewInput, tableName: "customers" | "vehicles"): PreviewRecord[] {
  const direct = tableName === "customers" ? input.customers : input.vehicles;
  const directRecords = toRecords(direct);
  if (directRecords.length) return directRecords;

  const module = input.modules?.find(
    (item) => item.tableName === tableName || item.moduleKey === tableName || (tableName === "customers" && item.moduleKey === "customerAccounts")
  );
  const moduleRecords = toRecords(module?.records);
  if (tableName === "vehicles" && !moduleRecords.length) {
    return findModuleRecords(input, "customers").flatMap((record) => toRecords(record.vehicles));
  }
  return moduleRecords;
}

function text(record: PreviewRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function findDuplicates(records: PreviewRecord[], buildKey: (record: PreviewRecord) => string, label: string): string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = buildKey(record).toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => `${label} "${key}" appears ${count} times.`);
}

export function buildCustomerVehicleImportPreview(input: CustomerVehiclePreviewInput) {
  const customers = findModuleRecords(input, "customers");
  const vehicles = findModuleRecords(input, "vehicles");

  const customerWarnings = [
    ...findDuplicates(customers, (record) => `${text(record, ["customerName", "name"])}|${text(record, ["phone", "mobile"])}`, "Customer name/phone"),
    ...customers
      .map((record, index) => ({ index, name: text(record, ["customerName", "name"]) }))
      .filter((item) => !item.name)
      .map((item) => `Customer record ${item.index + 1} is missing a customer name.`),
  ];

  const duplicatePlateWarnings = findDuplicates(vehicles, (record) => text(record, ["plateNumber", "plate"]), "Plate number");
  const missingVehicleWarnings = vehicles
    .map((record, index) => ({
      index,
      plate: text(record, ["plateNumber", "plate"]),
      conduction: text(record, ["conductionNumber", "conduction"]),
    }))
    .filter((item) => !item.plate && !item.conduction)
    .map((item) => `Vehicle record ${item.index + 1} is missing both plate and conduction number.`);

  const customerReviewCount = customers.filter((record) => !text(record, ["customerName", "name"])).length;
  const vehicleReviewCount = vehicles.filter((record) => !text(record, ["plateNumber", "plate"]) && !text(record, ["conductionNumber", "conduction"])).length;

  return {
    totalCustomers: customers.length,
    totalVehicles: vehicles.length,
    duplicateCustomerWarnings: customerWarnings.filter((warning) => warning.startsWith("Customer name/phone")),
    duplicatePlateWarnings,
    missingPlateOrConductionWarnings: missingVehicleWarnings,
    missingCustomerWarnings: customerWarnings.filter((warning) => !warning.startsWith("Customer name/phone")),
    recordsReady: customers.length + vehicles.length - customerReviewCount - vehicleReviewCount,
    recordsNeedingReview: customerReviewCount + vehicleReviewCount + duplicatePlateWarnings.length,
    canCommit: false,
    warning: "Preview only. No customer or vehicle data was written to the database.",
  };
}
