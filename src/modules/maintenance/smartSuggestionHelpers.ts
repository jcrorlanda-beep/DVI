import type { BackjobRecord } from "../shared/types";
import type { MaintenanceDashboardCompletedItem, MaintenanceDashboardUpcomingItem, MaintenanceDashboardVehicleSummary } from "./dashboardHelpers";

export type SmartSuggestionTag = "Safety" | "Soon" | "Monitor";

export type SmartSuggestionItem = {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  plateNumber: string;
  customerName: string;
  priorityTag: SmartSuggestionTag;
  tags: SmartSuggestionTag[];
  repeatIssue: boolean;
  missedMaintenance: boolean;
  reason: string;
  manualActionLabel: string;
  manualActionHint: string;
};

export type BuildSmartSuggestionItemsArgs = {
  vehicles: MaintenanceDashboardVehicleSummary[];
  upcomingItems: MaintenanceDashboardUpcomingItem[];
  completedItems: MaintenanceDashboardCompletedItem[];
  backjobRecords: BackjobRecord[];
};

function normalizeText(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeVehiclePlate(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function getVehicleLabel(vehicle: MaintenanceDashboardVehicleSummary) {
  return [vehicle.year ? String(vehicle.year) : "", vehicle.make || "", vehicle.model || ""].filter(Boolean).join(" ") || "Unknown Vehicle";
}

function getVehicleKey(vehicle: MaintenanceDashboardVehicleSummary) {
  return normalizeVehiclePlate(vehicle.plateNumber || "");
}

function getVehicleBackjobs(backjobRecords: BackjobRecord[], vehicle: MaintenanceDashboardVehicleSummary) {
  const plateKey = getVehicleKey(vehicle);
  return backjobRecords.filter((record) => normalizeVehiclePlate(record.plateNumber || "") === plateKey);
}

function getVehicleUpcoming(upcomingItems: MaintenanceDashboardUpcomingItem[], vehicleId: string) {
  return upcomingItems.filter((item) => item.vehicleId === vehicleId);
}

function getVehicleCompleted(completedItems: MaintenanceDashboardCompletedItem[], vehicleId: string) {
  return completedItems.filter((item) => item.vehicleId === vehicleId);
}

function hasRepeatedBackjob(backjobs: BackjobRecord[]) {
  if (backjobs.length >= 2) return true;
  const causeCounts = new Map<string, number>();
  backjobs.forEach((record) => {
    const key = normalizeText(record.rootCause || record.complaint || record.findings || "");
    if (!key) return;
    causeCounts.set(key, (causeCounts.get(key) ?? 0) + 1);
  });
  return Array.from(causeCounts.values()).some((count) => count >= 2);
}

function hasMaintenanceGap(completedItems: MaintenanceDashboardCompletedItem[]) {
  if (completedItems.length < 2) return false;
  const serviceKeys = completedItems.map((item) => normalizeText(item.serviceKey || item.title));
  return !serviceKeys.some((key) => key.includes("pms") || key.includes("major service") || key.includes("maintenance"));
}

function getPriorityTag({
  overdueCount,
  dueNowCount,
  dueSoonCount,
  repeatedBackjob,
}: {
  overdueCount: number;
  dueNowCount: number;
  dueSoonCount: number;
  repeatedBackjob: boolean;
}): SmartSuggestionTag {
  if (overdueCount > 0 || repeatedBackjob) return "Safety";
  if (dueNowCount > 0) return "Soon";
  if (dueSoonCount > 0) return "Soon";
  return "Monitor";
}

export function buildSmartSuggestionItems({
  vehicles,
  upcomingItems,
  completedItems,
  backjobRecords,
}: BuildSmartSuggestionItemsArgs): SmartSuggestionItem[] {
  const items: SmartSuggestionItem[] = [];

  vehicles.forEach((vehicle) => {
    const vehicleUpcoming = getVehicleUpcoming(upcomingItems, vehicle.vehicleId);
    const vehicleCompleted = getVehicleCompleted(completedItems, vehicle.vehicleId);
    const vehicleBackjobs = getVehicleBackjobs(backjobRecords, vehicle);
    const overdueCount = vehicleUpcoming.filter((item) => item.status === "overdue").length;
    const dueNowCount = vehicleUpcoming.filter((item) => item.status === "dueNow").length;
    const dueSoonCount = vehicleUpcoming.filter((item) => item.status === "dueSoon").length;
    const repeatedBackjob = hasRepeatedBackjob(vehicleBackjobs);
    const missedMaintenance = hasMaintenanceGap(vehicleCompleted);
    const hasSignals = overdueCount > 0 || dueNowCount > 0 || dueSoonCount > 0 || repeatedBackjob || missedMaintenance;
    if (!hasSignals) return;

    const priorityTag = getPriorityTag({ overdueCount, dueNowCount, dueSoonCount, repeatedBackjob });
    const tags: SmartSuggestionTag[] = [priorityTag];
    if (repeatedBackjob) tags.push("Monitor");
    if (missedMaintenance) tags.push("Monitor");
    if (dueSoonCount > 0 && !tags.includes("Soon")) tags.push("Soon");

    const topUpcoming = [...vehicleUpcoming].sort((a, b) => {
      const statusRank = (item: MaintenanceDashboardUpcomingItem) => (item.status === "overdue" ? 0 : item.status === "dueNow" ? 1 : 2);
      return statusRank(a) - statusRank(b) || (b.kmDelta ?? 0) - (a.kmDelta ?? 0) || a.title.localeCompare(b.title);
    })[0];

    const reasonParts = [];
    if (overdueCount > 0) reasonParts.push(`${overdueCount} overdue item${overdueCount === 1 ? "" : "s"}`);
    if (dueNowCount > 0) reasonParts.push(`${dueNowCount} due now`);
    if (dueSoonCount > 0) reasonParts.push(`${dueSoonCount} due soon`);
    if (repeatedBackjob) reasonParts.push("repeat backjob pattern");
    if (missedMaintenance) reasonParts.push("maintenance gap");

    const reason = reasonParts.length
      ? `${vehicle.vehicleId ? getVehicleLabel(vehicle) : "This vehicle"} needs manual review because it has ${reasonParts.join(", ")}.`
      : `${getVehicleLabel(vehicle)} should be reviewed manually.`;

    items.push({
      id: `smart-signal:${vehicle.vehicleId}`,
      vehicleId: vehicle.vehicleId,
      vehicleLabel: getVehicleLabel(vehicle),
      plateNumber: vehicle.plateNumber || "-",
      customerName: vehicle.customerName || "Unknown Customer",
      priorityTag,
      tags: Array.from(new Set(tags)),
      repeatIssue: repeatedBackjob,
      missedMaintenance,
      reason: topUpcoming?.dueSummaryText || reason,
      manualActionLabel: "Open Timeline",
      manualActionHint: "Manual review required before adding work or contacting the customer.",
    });
  });

  return items.sort((a, b) => {
    const rank = (tag: SmartSuggestionTag) => (tag === "Safety" ? 0 : tag === "Soon" ? 1 : 2);
    return rank(a.priorityTag) - rank(b.priorityTag) || a.vehicleLabel.localeCompare(b.vehicleLabel);
  });
}
