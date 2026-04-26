export const BOOKING_MULTI_SERVICE_OPTIONS = [
  "PMS / Oil Change",
  "Brake Service",
  "Wheel Alignment",
  "Tire Service",
  "Diagnostics",
  "AC Service",
  "Cooling System",
  "Transmission",
  "Suspension",
  "Electrical",
  "Other",
] as const;

type BookingLegacyShape = {
  requestedServices?: string[] | null;
  serviceType?: string;
  serviceDetail?: string;
  concern?: string;
  notes?: string;
};

const SERVICE_TYPE_FALLBACKS: Record<string, string> = {
  "Preventive Maintenance": "PMS / Oil Change",
  "Oil Change": "PMS / Oil Change",
  "Brake Service": "Brake Service",
  "Wheel Alignment": "Wheel Alignment",
  "Tire Service": "Tire Service",
  "Engine Performance": "Diagnostics",
  "OBD Scan / Computer Diagnosis": "Diagnostics",
  "Air Conditioning": "AC Service",
  "Cooling System": "Cooling System",
  "Transmission / Drivetrain": "Transmission",
  "Suspension / Steering": "Suspension",
  "Underchassis Check": "Suspension",
  "Electrical / Battery": "Electrical",
};

export function normalizeRequestedServices(value?: string[] | null): string[] {
  return Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

export function mapBookingServiceTypeToRequestedService(serviceType?: string): string {
  if (!serviceType) return "Other";
  return SERVICE_TYPE_FALLBACKS[serviceType] || (BOOKING_MULTI_SERVICE_OPTIONS.includes(serviceType as (typeof BOOKING_MULTI_SERVICE_OPTIONS)[number]) ? serviceType : "Other");
}

export function getBookingRequestedServices(record: BookingLegacyShape): string[] {
  const normalized = normalizeRequestedServices(record.requestedServices);
  if (normalized.length > 0) return normalized;
  const fallback = mapBookingServiceTypeToRequestedService(record.serviceType);
  return fallback ? [fallback] : [];
}

export function getBookingServicesPreview(record: BookingLegacyShape): string {
  const requestedServices = getBookingRequestedServices(record);
  if (requestedServices.length > 0) return requestedServices.join(", ");
  const legacy = [record.serviceType, record.serviceDetail].map((item) => item?.trim()).filter(Boolean).join(" / ");
  if (legacy) return legacy;
  return [record.concern, record.notes].map((item) => item?.trim()).filter(Boolean).join(" | ") || "Booking request";
}

export function buildBookingIntakeConcern(record: BookingLegacyShape): string {
  const requestedServices = getBookingRequestedServices(record);
  const servicePart = requestedServices.length > 0 ? `Requested services: ${requestedServices.join(", ")}` : getBookingServicesPreview(record);
  const concern = record.concern?.trim() || "";
  if (concern) return `${servicePart}. Concern: ${concern}`;
  return servicePart;
}
