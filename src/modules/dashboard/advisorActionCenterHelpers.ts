import type { OpenAiAssistLogEntry } from "../ai/openaiAssist";
import type { MaintenanceDashboardUpcomingItem } from "../maintenance/dashboardHelpers";
import type { RepairOrderRecord } from "../shared/types";

export type AdvisorActionCenterRepairOrderItem = {
  id: string;
  roId: string;
  roNumber: string;
  customerName: string;
  vehicleLabel: string;
  plateNumber: string;
  status: RepairOrderRecord["status"];
  reason: string;
};

export type AdvisorActionCenterAiDraftItem = {
  id: string;
  actionType: string;
  sourceModule: string;
  generatedAt: string;
  warningReason?: string;
  providerLabel: string;
};

export type AdvisorActionCenterMaintenanceItem = {
  id: string;
  vehicleLabel: string;
  plateNumber: string;
  customerName?: string;
  serviceTitle: string;
  status: MaintenanceDashboardUpcomingItem["status"];
  reason: string;
};

export type BuildAdvisorActionCenterViewModelArgs = {
  repairOrders: RepairOrderRecord[];
  upcomingItems: MaintenanceDashboardUpcomingItem[];
  openAiAssistLogs: OpenAiAssistLogEntry[];
};

export type BuildAdvisorActionCenterViewModelResult = {
  waitingApprovals: AdvisorActionCenterRepairOrderItem[];
  waitingParts: AdvisorActionCenterRepairOrderItem[];
  readyForQc: AdvisorActionCenterRepairOrderItem[];
  readyForRelease: AdvisorActionCenterRepairOrderItem[];
  overdueFollowUps: AdvisorActionCenterMaintenanceItem[];
  maintenanceDueContacts: AdvisorActionCenterMaintenanceItem[];
  aiDraftsNeedingReview: AdvisorActionCenterAiDraftItem[];
  summary: {
    waitingApprovals: number;
    waitingParts: number;
    readyForQc: number;
    readyForRelease: number;
    overdueFollowUps: number;
    maintenanceDueContacts: number;
    aiDraftsNeedingReview: number;
  };
};

function normalizeText(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getVehicleLabel(ro: RepairOrderRecord) {
  return [ro.year, ro.make, ro.model].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Unknown Vehicle";
}

function getRepairOrderReason(ro: RepairOrderRecord) {
  if (ro.status === "Waiting Approval") return "Customer approval is needed before work can continue.";
  if (ro.status === "Waiting Parts") return "Parts are still outstanding for this repair order.";
  if (ro.status === "Quality Check") return "QC review is needed before release.";
  if (ro.status === "Ready Release") return "The job is ready for release and handover.";
  return "Advisor attention is recommended.";
}

function getProviderLabel(entry: OpenAiAssistLogEntry) {
  if (entry.providerName === "ollama") return "Local AI (Free)";
  if (entry.providerName === "openai") return "Cloud AI (Paid fallback)";
  return "Template (No AI)";
}

function toRepairOrderItem(ro: RepairOrderRecord): AdvisorActionCenterRepairOrderItem {
  return {
    id: ro.id,
    roId: ro.id,
    roNumber: ro.roNumber,
    customerName: ro.accountLabel || ro.customerName || "Unknown Customer",
    vehicleLabel: getVehicleLabel(ro),
    plateNumber: ro.plateNumber || ro.conductionNumber || "-",
    status: ro.status,
    reason: getRepairOrderReason(ro),
  };
}

function toMaintenanceItem(item: MaintenanceDashboardUpcomingItem): AdvisorActionCenterMaintenanceItem {
  return {
    id: item.id,
    vehicleLabel: item.vehicleLabel,
    plateNumber: item.plateNumber || "-",
    customerName: item.customerName,
    serviceTitle: item.title,
    status: item.status,
    reason: item.dueSummaryText || item.title,
  };
}

export function buildAdvisorActionCenterViewModel({
  repairOrders,
  upcomingItems,
  openAiAssistLogs,
}: BuildAdvisorActionCenterViewModelArgs): BuildAdvisorActionCenterViewModelResult {
  const waitingApprovals = repairOrders.filter((row) => row.status === "Waiting Approval").map(toRepairOrderItem);
  const waitingParts = repairOrders.filter((row) => row.status === "Waiting Parts").map(toRepairOrderItem);
  const readyForQc = repairOrders.filter((row) => row.status === "Quality Check").map(toRepairOrderItem);
  const readyForRelease = repairOrders.filter((row) => row.status === "Ready Release").map(toRepairOrderItem);
  const overdueFollowUps = upcomingItems.filter((item) => item.status === "overdue").map(toMaintenanceItem);
  const maintenanceDueContacts = upcomingItems.filter((item) => item.status === "dueNow" || item.status === "dueSoon").map(toMaintenanceItem);
  const aiDraftsNeedingReview = openAiAssistLogs
    .filter((entry) => entry.reviewed !== true)
    .slice()
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
    .slice(0, 6)
    .map((entry) => ({
      id: entry.id,
      actionType: entry.actionType,
      sourceModule: entry.sourceModule,
      generatedAt: entry.generatedAt,
      warningReason: entry.warningReason || entry.errorMessage || undefined,
      providerLabel: getProviderLabel(entry),
    }));

  return {
    waitingApprovals,
    waitingParts,
    readyForQc,
    readyForRelease,
    overdueFollowUps,
    maintenanceDueContacts,
    aiDraftsNeedingReview,
    summary: {
      waitingApprovals: waitingApprovals.length,
      waitingParts: waitingParts.length,
      readyForQc: readyForQc.length,
      readyForRelease: readyForRelease.length,
      overdueFollowUps: overdueFollowUps.length,
      maintenanceDueContacts: maintenanceDueContacts.length,
      aiDraftsNeedingReview: aiDraftsNeedingReview.length,
    },
  };
}

