import type { MaintenanceDashboardCompletedItem, MaintenanceDashboardUpcomingItem, MaintenanceDashboardVehicleSummary } from "./dashboardHelpers";

export type FollowUpCustomerAccountLike = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  linkedPlateNumbers: string[];
  linkedRoIds: string[];
};

export type FollowUpSmsLogLike = {
  roId: string;
  messageType: MaintenanceFollowUpMessageType;
  status: "Pending" | "Sent" | "Failed";
  createdAt: string;
  provider: string;
  providerResponse?: string;
  errorMessage?: string;
};

export type MaintenanceFollowUpStatus = "pending" | "ready" | "sent" | "skipped";

export type MaintenanceFollowUpChannel = "SMS" | "Manual";

export type MaintenanceFollowUpSourceType =
  | "overdue-maintenance"
  | "due-soon-maintenance"
  | "recent-service-reminder"
  | "major-service-gap";

export type MaintenanceFollowUpMessageType =
  | "approval-request"
  | "waiting-parts"
  | "ready-release"
  | "pull-out-notice"
  | "oil-reminder"
  | "follow-up";

export type MaintenanceFollowUpQueueRecord = {
  id: string;
  status: MaintenanceFollowUpStatus;
  note: string;
  readyAt: string;
  skippedAt: string;
  sentAt: string;
  channel: MaintenanceFollowUpChannel;
  messageType: MaintenanceFollowUpMessageType;
  provider: string;
  providerResponse: string;
  lastUpdatedAt: string;
};

export type MaintenanceFollowUpQueueItem = {
  id: string;
  vehicleId: string;
  roId: string;
  roNumber: string;
  customerId: string;
  customerName: string;
  vehicleLabel: string;
  plateNumber: string;
  reason: string;
  recommendedMessageType: MaintenanceFollowUpMessageType;
  recommendedMessageLabel: string;
  recommendedChannel: MaintenanceFollowUpChannel;
  currentStatus: MaintenanceFollowUpStatus;
  currentStatusLabel: string;
  sourceType: MaintenanceFollowUpSourceType;
  dueSummaryText: string;
  previewBody: string;
  note: string;
  lastSentAt: string;
  sentAt: string;
  phoneNumber: string;
  isActionable: boolean;
  priority: number;
};

export type BuildMaintenanceFollowUpQueueArgs = {
  vehicles: MaintenanceDashboardVehicleSummary[];
  upcomingItems: MaintenanceDashboardUpcomingItem[];
  completedItems: MaintenanceDashboardCompletedItem[];
  customerAccounts: FollowUpCustomerAccountLike[];
  smsLogs: FollowUpSmsLogLike[];
  queueRecords: MaintenanceFollowUpQueueRecord[];
  nowIso?: string;
};

function normalizeText(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizePhone(value: string) {
  return String(value ?? "").replace(/[^0-9+]/g, "").trim();
}

function buildCustomerBookingUrl() {
  if (typeof window === "undefined") return "?portal=booking";
  return `${window.location.origin}${window.location.pathname}?portal=booking`;
}

function toVehicleLabel(vehicle: MaintenanceDashboardVehicleSummary) {
  return [vehicle.year ? String(vehicle.year) : "", vehicle.make || "", vehicle.model || ""]
    .filter(Boolean)
    .join(" ") || "Unknown Vehicle";
}

function resolveCustomerAccount(
  vehicle: MaintenanceDashboardVehicleSummary,
  customerAccounts: FollowUpCustomerAccountLike[]
) {
  const plate = normalizeText(vehicle.plateNumber || "");
  const roId = vehicle.repairOrderId || "";
  const phone = sanitizePhone(vehicle.phoneNumber || "");

  return (
    customerAccounts.find((account) => account.linkedRoIds.includes(roId)) ||
    customerAccounts.find((account) => account.linkedPlateNumbers.some((plateNumber) => normalizeText(plateNumber) === plate)) ||
    customerAccounts.find((account) => sanitizePhone(account.phone) === phone) ||
    customerAccounts[0] ||
    null
  );
}

function getLatestCompletedForVehicle(completedItems: MaintenanceDashboardCompletedItem[], vehicleId: string) {
  return [...completedItems]
    .filter((item) => item.vehicleId === vehicleId)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt) || b.id.localeCompare(a.id))[0] ?? null;
}

function getUpcomingPriority(status: MaintenanceDashboardUpcomingItem["status"]) {
  if (status === "overdue") return 0;
  if (status === "dueNow") return 1;
  return 2;
}

function getBaseSourceType(
  vehicleUpcoming: MaintenanceDashboardUpcomingItem[],
  vehicleCompleted: MaintenanceDashboardCompletedItem[],
  latestCompleted: MaintenanceDashboardCompletedItem | null,
  nowIso: string
): MaintenanceFollowUpSourceType | null {
  const overdue = vehicleUpcoming
    .filter((item) => item.status === "overdue")
    .sort((a, b) => (b.kmDelta ?? 0) - (a.kmDelta ?? 0) || a.title.localeCompare(b.title))[0];
  if (overdue) return "overdue-maintenance";

  const dueNow = vehicleUpcoming
    .filter((item) => item.status === "dueNow")
    .sort((a, b) => (b.kmDelta ?? 0) - (a.kmDelta ?? 0) || a.title.localeCompare(b.title))[0];
  if (dueNow) return "due-soon-maintenance";

  const dueSoon = vehicleUpcoming
    .filter((item) => item.status === "dueSoon")
    .sort((a, b) => (b.kmDelta ?? 0) - (a.kmDelta ?? 0) || a.title.localeCompare(b.title))[0];
  if (dueSoon) return "due-soon-maintenance";

  if (latestCompleted) {
    const latestCompletedAt = new Date(latestCompleted.completedAt).getTime();
    const now = new Date(nowIso).getTime();
    if (!Number.isNaN(latestCompletedAt) && !Number.isNaN(now) && now - latestCompletedAt <= 7 * 24 * 60 * 60 * 1000) {
      return "recent-service-reminder";
    }
  }

  const completedKeys = completedItemsFromVehicle(vehicleUpcoming, vehicleCompleted);
  if (completedKeys.length >= 2 && !completedKeys.some((key) => key.includes("major service") || key.includes("egr") || key.includes("intake"))) {
    return "major-service-gap";
  }

  return null;
}

function completedItemsFromVehicle(vehicleUpcoming: MaintenanceDashboardUpcomingItem[], vehicleCompleted: MaintenanceDashboardCompletedItem[]) {
  const history = new Set<string>();
  vehicleUpcoming.forEach((item) => history.add(normalizeText(item.serviceKey || item.title)));
  vehicleCompleted.forEach((item) => history.add(normalizeText(item.serviceKey || item.title)));
  return Array.from(history.values());
}

export function computeFollowUpReason(
  sourceType: MaintenanceFollowUpSourceType,
  item: MaintenanceDashboardUpcomingItem | MaintenanceDashboardCompletedItem | null,
  latestCompleted: MaintenanceDashboardCompletedItem | null,
  upcomingCount: number
) {
  const vehicleLabel = item && "vehicleLabel" in item ? item.vehicleLabel : "the vehicle";
  if (sourceType === "overdue-maintenance") {
    return `${vehicleLabel} has ${upcomingCount} overdue maintenance item${upcomingCount === 1 ? "" : "s"} that needs advisor follow-up.`;
  }
  if (sourceType === "due-soon-maintenance") {
    return `${vehicleLabel} has ${upcomingCount} due-soon maintenance item${upcomingCount === 1 ? "" : "s"} and should be contacted before it becomes overdue.`;
  }
  if (sourceType === "recent-service-reminder") {
    return `${vehicleLabel} was recently serviced${latestCompleted?.completedAt ? ` on ${latestCompleted.completedAt.slice(0, 10)}` : ""}. A courtesy follow-up is recommended.`;
  }
  return `${vehicleLabel} has no recent major service record and may need preventive maintenance planning.`;
}

export function getRecommendedFollowUpChannel(phoneNumber: string): MaintenanceFollowUpChannel {
  return sanitizePhone(phoneNumber) ? "SMS" : "Manual";
}

export function getRecommendedMessageTemplate(
  sourceType: MaintenanceFollowUpSourceType,
  item: MaintenanceDashboardUpcomingItem | MaintenanceDashboardCompletedItem | null
): { key: MaintenanceFollowUpMessageType; label: string } {
  const serviceText = normalizeText(item?.serviceKey || item?.title || "");
  if (serviceText.includes("oil")) {
    return { key: "oil-reminder", label: "Oil Change Reminder" };
  }
  if (sourceType === "recent-service-reminder") {
    return { key: "follow-up", label: "Post-Service Follow-up" };
  }
  if (sourceType === "overdue-maintenance" || sourceType === "due-soon-maintenance") {
    return { key: "follow-up", label: "Maintenance Reminder" };
  }
  return { key: "follow-up", label: "Maintenance Follow-up" };
}

function buildPreviewBody({
  customerName,
  vehicleLabel,
  plateNumber,
  roNumber,
  reason,
  templateKey,
  latestCompleted,
}: {
  customerName: string;
  vehicleLabel: string;
  plateNumber: string;
  roNumber: string;
  reason: string;
  templateKey: MaintenanceFollowUpMessageType;
  latestCompleted: MaintenanceDashboardCompletedItem | null;
}) {
  const bookingLink = buildCustomerBookingUrl();
  if (templateKey === "oil-reminder") {
    return [
      `Hi ${customerName},`,
      "",
      `Your vehicle ${vehicleLabel} (${plateNumber || "-"}) has an oil change reminder.`,
      "",
      reason,
      "",
      `Book your next visit here: ${bookingLink}`,
      "DVI Workshop | Please contact your service advisor for assistance.",
    ].join("\n");
  }

  if (templateKey === "follow-up" && latestCompleted) {
    return [
      `Hi ${customerName},`,
      "",
      `We are following up on ${vehicleLabel} (${plateNumber || "-"}) for RO ${roNumber}.`,
      "",
      reason,
      "",
      "Please let us know if you have any questions or if you would like us to prepare the next recommended visit.",
      "",
      `Book your next visit here: ${bookingLink}`,
      "DVI Workshop | Please contact your service advisor for assistance.",
    ].join("\n");
  }

  return [
    `Hi ${customerName},`,
    "",
    `We are reaching out about ${vehicleLabel} (${plateNumber || "-"}) under RO ${roNumber}.`,
    "",
    reason,
    "",
    `Book your next visit here: ${bookingLink}`,
    "DVI Workshop | Please contact your service advisor for assistance.",
  ].join("\n");
}

function getLastSentAtForQueueItem(
  item: MaintenanceFollowUpQueueItem,
  smsLogs: FollowUpSmsLogLike[]
) {
  return (
    [...smsLogs]
      .filter((row) => row.roId === item.roId && row.messageType === item.recommendedMessageType && row.status === "Sent")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt ?? ""
  );
}

function mergeQueueRecord(base: MaintenanceFollowUpQueueItem, records: MaintenanceFollowUpQueueRecord[], smsLogs: FollowUpSmsLogLike[]) {
  const record = records.find((row) => row.id === base.id);
  const lastSentAt = record?.sentAt || getLastSentAtForQueueItem(base, smsLogs);
  const currentStatus: MaintenanceFollowUpStatus = record?.status || (lastSentAt ? "sent" : base.currentStatus);
  return {
    ...base,
    currentStatus,
    currentStatusLabel: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
    note: record?.note || base.note || "",
    lastSentAt,
    sentAt: record?.sentAt || lastSentAt,
    recommendedChannel: record?.channel || base.recommendedChannel,
    recommendedMessageType: record?.messageType || base.recommendedMessageType,
  };
}

export function buildMaintenanceFollowUpQueue({
  vehicles,
  upcomingItems,
  completedItems,
  customerAccounts,
  smsLogs,
  queueRecords,
  nowIso = new Date().toISOString(),
}: BuildMaintenanceFollowUpQueueArgs) {
  const queue: MaintenanceFollowUpQueueItem[] = [];
  const itemsByVehicle = new Map<string, MaintenanceDashboardUpcomingItem[]>();
  upcomingItems.forEach((item) => {
    const current = itemsByVehicle.get(item.vehicleId) || [];
    current.push(item);
    itemsByVehicle.set(item.vehicleId, current);
  });

  const completedByVehicle = new Map<string, MaintenanceDashboardCompletedItem[]>();
  completedItems.forEach((item) => {
    const current = completedByVehicle.get(item.vehicleId) || [];
    current.push(item);
    completedByVehicle.set(item.vehicleId, current);
  });

  vehicles.forEach((vehicle) => {
    const vehicleUpcoming = (itemsByVehicle.get(vehicle.vehicleId) || []).slice().sort((a, b) => getUpcomingPriority(a.status) - getUpcomingPriority(b.status) || (b.kmDelta ?? 0) - (a.kmDelta ?? 0));
    const latestCompleted = getLatestCompletedForVehicle(completedItems, vehicle.vehicleId);
    const vehicleCompleted = completedByVehicle.get(vehicle.vehicleId) || [];
    const sourceType = getBaseSourceType(vehicleUpcoming, vehicleCompleted, latestCompleted, nowIso);
    if (!sourceType) return;

    const supportingItem = vehicleUpcoming[0] ?? latestCompleted;
    const account = resolveCustomerAccount(vehicle, customerAccounts);
    const template = getRecommendedMessageTemplate(sourceType, supportingItem);
    const reason = computeFollowUpReason(sourceType, supportingItem, latestCompleted, vehicleUpcoming.length);
    const phoneNumber = account?.phone || vehicle.phoneNumber || "";
    const currentStatusFromRecord = queueRecords.find((row) => row.id === `follow-up:${vehicle.vehicleId}:${sourceType}`)?.status;
    const defaultStatus: MaintenanceFollowUpStatus = sourceType === "overdue-maintenance" ? "ready" : "pending";
    const currentStatus: MaintenanceFollowUpStatus = currentStatusFromRecord || defaultStatus;
    const roId = vehicle.repairOrderId || latestCompleted?.repairOrderId || "";
    const roNumber = vehicle.repairOrderNumber || latestCompleted?.repairOrderNumber || "";
    const plateNumber = vehicle.plateNumber || "";
    const previewBody = buildPreviewBody({
      customerName: account?.fullName || vehicle.customerName || "Customer",
      vehicleLabel: vehicle.vehicleId ? toVehicleLabel(vehicle) : vehicle.vehicleId,
      plateNumber,
      roNumber,
      reason,
      templateKey: template.key,
      latestCompleted,
    });
    const id = `follow-up:${vehicle.vehicleId}:${sourceType}`;
    queue.push({
      id,
      vehicleId: vehicle.vehicleId,
      roId,
      roNumber,
      customerId: account?.id || "",
      customerName: account?.fullName || vehicle.customerName || "Customer",
      vehicleLabel: toVehicleLabel(vehicle),
      plateNumber,
      reason,
      recommendedMessageType: template.key,
      recommendedMessageLabel: template.label,
      recommendedChannel: getRecommendedFollowUpChannel(phoneNumber),
      currentStatus,
      currentStatusLabel: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
      sourceType,
      dueSummaryText: supportingItem && "dueSummaryText" in supportingItem ? supportingItem.dueSummaryText || reason : reason,
      previewBody,
      note: queueRecords.find((row) => row.id === id)?.note || "",
      lastSentAt: getLastSentAtForQueueItem(
        {
          id,
          vehicleId: vehicle.vehicleId,
          roId,
          roNumber,
          customerId: account?.id || "",
          customerName: account?.fullName || vehicle.customerName || "Customer",
          vehicleLabel: toVehicleLabel(vehicle),
          plateNumber,
          reason,
          recommendedMessageType: template.key,
          recommendedMessageLabel: template.label,
          recommendedChannel: getRecommendedFollowUpChannel(phoneNumber),
          currentStatus,
          currentStatusLabel: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
          sourceType,
          dueSummaryText: "",
          previewBody,
          note: "",
          lastSentAt: "",
          sentAt: "",
          phoneNumber,
          isActionable: true,
          priority: 0,
        },
        smsLogs
      ),
      sentAt: queueRecords.find((row) => row.id === id)?.sentAt || "",
      phoneNumber,
      isActionable: currentStatus !== "sent" && currentStatus !== "skipped",
      priority:
        sourceType === "overdue-maintenance"
          ? 0
          : sourceType === "due-soon-maintenance"
            ? 1
            : sourceType === "recent-service-reminder"
              ? 2
              : 3,
    });
  });

  const merged = queue
    .map((item) => mergeQueueRecord(item, queueRecords, smsLogs))
    .sort((a, b) => a.priority - b.priority || a.vehicleLabel.localeCompare(b.vehicleLabel) || a.reason.localeCompare(b.reason));

  return {
    items: merged,
    counts: {
      pending: merged.filter((item) => item.currentStatus === "pending").length,
      ready: merged.filter((item) => item.currentStatus === "ready").length,
      sent: merged.filter((item) => item.currentStatus === "sent").length,
      skipped: merged.filter((item) => item.currentStatus === "skipped").length,
      total: merged.length,
    },
  };
}

export function markFollowUpReady(records: MaintenanceFollowUpQueueRecord[], id: string, nowIso = new Date().toISOString()) {
  const next = records.filter((row) => row.id !== id);
  const current = records.find((row) => row.id === id);
  next.unshift({
    id,
    status: "ready",
    note: current?.note || "",
    readyAt: nowIso,
    skippedAt: "",
    sentAt: current?.sentAt || "",
    channel: current?.channel || "SMS",
    messageType: current?.messageType || "follow-up",
    provider: current?.provider || "",
    providerResponse: current?.providerResponse || "",
    lastUpdatedAt: nowIso,
  });
  return next;
}

export function markFollowUpSkipped(records: MaintenanceFollowUpQueueRecord[], id: string, nowIso = new Date().toISOString()) {
  const next = records.filter((row) => row.id !== id);
  const current = records.find((row) => row.id === id);
  next.unshift({
    id,
    status: "skipped",
    note: current?.note || "",
    readyAt: current?.readyAt || "",
    skippedAt: nowIso,
    sentAt: current?.sentAt || "",
    channel: current?.channel || "Manual",
    messageType: current?.messageType || "follow-up",
    provider: current?.provider || "",
    providerResponse: current?.providerResponse || "",
    lastUpdatedAt: nowIso,
  });
  return next;
}

export function markFollowUpSent(
  records: MaintenanceFollowUpQueueRecord[],
  id: string,
  payload: {
    sentAt?: string;
    channel?: MaintenanceFollowUpChannel;
    messageType?: MaintenanceFollowUpMessageType;
    provider?: string;
    providerResponse?: string;
    note?: string;
  } = {},
  nowIso = new Date().toISOString()
) {
  const next = records.filter((row) => row.id !== id);
  const current = records.find((row) => row.id === id);
  const sentAt = payload.sentAt || nowIso;
  next.unshift({
    id,
    status: "sent",
    note: payload.note ?? current?.note ?? "",
    readyAt: current?.readyAt || "",
    skippedAt: current?.skippedAt || "",
    sentAt,
    channel: payload.channel || current?.channel || "SMS",
    messageType: payload.messageType || current?.messageType || "follow-up",
    provider: payload.provider || current?.provider || "",
    providerResponse: payload.providerResponse || current?.providerResponse || "",
    lastUpdatedAt: nowIso,
  });
  return next;
}

export function updateFollowUpNote(records: MaintenanceFollowUpQueueRecord[], id: string, note: string, nowIso = new Date().toISOString()) {
  const next = records.filter((row) => row.id !== id);
  const current = records.find((row) => row.id === id);
  next.unshift({
    id,
    status: current?.status || "pending",
    note,
    readyAt: current?.readyAt || "",
    skippedAt: current?.skippedAt || "",
    sentAt: current?.sentAt || "",
    channel: current?.channel || "SMS",
    messageType: current?.messageType || "follow-up",
    provider: current?.provider || "",
    providerResponse: current?.providerResponse || "",
    lastUpdatedAt: nowIso,
  });
  return next;
}

export const MAINTENANCE_FOLLOW_UP_QUEUE_STORAGE_KEY = "dvi_maintenance_follow_up_queue_v1";
