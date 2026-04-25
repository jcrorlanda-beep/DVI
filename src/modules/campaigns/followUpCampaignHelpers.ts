import type { MaintenanceDashboardUpcomingItem } from "../maintenance/dashboardHelpers";
import type { RepairOrderRecord } from "../shared/types";

export type FollowUpCampaignType = "overdue maintenance" | "due soon" | "inactive" | "post-service follow-up";
export type FollowUpCampaignStatus = "pending" | "reviewed" | "send-ready" | "skipped";

export type FollowUpCampaignItem = {
  id: string;
  type: FollowUpCampaignType;
  customerName: string;
  vehicleLabel: string;
  plateNumber: string;
  reason: string;
  status: FollowUpCampaignStatus;
  draftText?: string;
};

export type FollowUpCampaignRecord = {
  id: string;
  status: FollowUpCampaignStatus;
  draftText?: string;
  updatedAt: string;
};

export function buildFollowUpCampaignItems(args: {
  upcomingItems: MaintenanceDashboardUpcomingItem[];
  repairOrders: RepairOrderRecord[];
  records: FollowUpCampaignRecord[];
  nowIso?: string;
}): FollowUpCampaignItem[] {
  const recordById = new Map(args.records.map((record) => [record.id, record] as const));
  const items: FollowUpCampaignItem[] = [];

  args.upcomingItems
    .filter((item) => item.status === "overdue" || item.status === "dueSoon")
    .slice(0, 8)
    .forEach((item) => {
      const type: FollowUpCampaignType = item.status === "overdue" ? "overdue maintenance" : "due soon";
      const id = `campaign:${type}:${item.vehicleId}:${item.serviceKey}`;
      const record = recordById.get(id);
      items.push({
        id,
        type,
        customerName: item.customerName || "Customer",
        vehicleLabel: item.vehicleLabel,
        plateNumber: item.plateNumber || "-",
        reason: item.dueSummaryText || item.title,
        status: record?.status ?? "pending",
        draftText: record?.draftText,
      });
    });

  const cutoff = new Date(args.nowIso ?? new Date().toISOString()).getTime() - 180 * 86400000;
  args.repairOrders
    .filter((ro) => new Date(ro.updatedAt || ro.createdAt).getTime() < cutoff)
    .slice(0, 5)
    .forEach((ro) => {
      const id = `campaign:inactive:${ro.plateNumber || ro.id}`;
      const record = recordById.get(id);
      items.push({
        id,
        type: "inactive",
        customerName: ro.accountLabel || ro.customerName || "Customer",
        vehicleLabel: [ro.year, ro.make, ro.model].filter(Boolean).join(" ") || ro.plateNumber || "Vehicle",
        plateNumber: ro.plateNumber || "-",
        reason: "No recent visit recorded in the current data set.",
        status: record?.status ?? "pending",
        draftText: record?.draftText,
      });
    });

  args.repairOrders
    .filter((ro) => ro.status === "Released")
    .slice(0, 5)
    .forEach((ro) => {
      const id = `campaign:post-service:${ro.id}`;
      const record = recordById.get(id);
      items.push({
        id,
        type: "post-service follow-up",
        customerName: ro.accountLabel || ro.customerName || "Customer",
        vehicleLabel: [ro.year, ro.make, ro.model].filter(Boolean).join(" ") || ro.plateNumber || "Vehicle",
        plateNumber: ro.plateNumber || "-",
        reason: `Check customer experience after ${ro.roNumber}.`,
        status: record?.status ?? "pending",
        draftText: record?.draftText,
      });
    });

  return items;
}

export function upsertCampaignRecord(
  records: FollowUpCampaignRecord[],
  id: string,
  patch: Partial<Omit<FollowUpCampaignRecord, "id">>
): FollowUpCampaignRecord[] {
  const now = new Date().toISOString();
  const exists = records.some((record) => record.id === id);
  if (!exists) return [...records, { id, status: patch.status ?? "pending", draftText: patch.draftText, updatedAt: now }];
  return records.map((record) => (record.id === id ? { ...record, ...patch, updatedAt: now } : record));
}
