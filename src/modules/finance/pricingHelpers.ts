import type { RepairOrderWorkLine, ServicePricingCatalogRecord } from "../shared/types";

function normalize(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

export function createDefaultPricingCatalog(now = new Date().toISOString()): ServicePricingCatalogRecord[] {
  return [
    { id: "price-pms-5000", serviceKey: "pms-5000", title: "5,000 km periodic maintenance package", category: "Periodic Maintenance", basePrice: "3500", active: true, notes: "Suggested labor and basic service price only.", createdAt: now, updatedAt: now },
    { id: "price-pms-10000", serviceKey: "pms-10000", title: "10,000 km inspection package", category: "Periodic Maintenance", basePrice: "5200", active: true, notes: "Suggested preventive maintenance package.", createdAt: now, updatedAt: now },
    { id: "price-alignment-review", serviceKey: "alignment-review", title: "Wheel alignment", category: "Alignment", basePrice: "1800", active: true, notes: "Suggested alignment service price.", createdAt: now, updatedAt: now },
    { id: "price-brake-review", serviceKey: "brake-review", title: "Brake system inspection", category: "Brakes", basePrice: "1500", active: true, notes: "Suggested inspection price before parts.", createdAt: now, updatedAt: now },
  ];
}

export function findSuggestedPricing(
  catalog: ServicePricingCatalogRecord[],
  serviceKey?: string,
  title?: string
): ServicePricingCatalogRecord | undefined {
  const active = catalog.filter((row) => row.active);
  const key = normalize(serviceKey);
  if (key) {
    const byKey = active.find((row) => normalize(row.serviceKey) === key);
    if (byKey) return byKey;
  }
  const normalizedTitle = normalize(title);
  if (!normalizedTitle) return undefined;
  return active.find((row) => normalize(row.title) === normalizedTitle || normalizedTitle.includes(normalize(row.title)));
}

export function applySuggestedPricingToWorkLine(
  line: RepairOrderWorkLine,
  catalog: ServicePricingCatalogRecord[]
): RepairOrderWorkLine {
  const match = findSuggestedPricing(catalog, line.serviceKey, line.title);
  if (!match) return line;
  const existingServicePrice = Number(String(line.serviceEstimate ?? "").replace(/[^\d.]/g, ""));
  if (Number.isFinite(existingServicePrice) && existingServicePrice > 0) return line;
  return {
    ...line,
    serviceEstimate: match.basePrice,
    totalEstimate: match.basePrice,
    notes: line.notes?.trim() ? line.notes : `Suggested price from catalog: ${match.title}`,
  };
}
