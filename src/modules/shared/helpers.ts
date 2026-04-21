// src/modules/shared/helpers.ts
// Shared helper functions extracted from App.tsx

import type { UserRole, RoleDefinition, Permission, WorkLog, RepairOrderRecord, RepairOrderWorkLine, PartsRequestRecord, PartsRequestStatus } from "./types";

export function getPermissionsForRole(role: UserRole, defs: RoleDefinition[]): Permission[] {
  const def = defs.find((d) => d.role === role);
  return def ? def.permissions : [];
}

export function hasPermission(role: UserRole, defs: RoleDefinition[], permission: Permission): boolean {
  const perms = getPermissionsForRole(role, defs);
  return perms.includes(permission);
}

export function getWorkLogMinutes(log: WorkLog): number {
  if (log.endedAt) return Math.max(0, log.totalMinutes || 0);
  const started = new Date(log.startedAt).getTime();
  if (Number.isNaN(started)) return Math.max(0, log.totalMinutes || 0);
  return Math.max(0, Math.floor((Date.now() - started) / 60000));
}

export function formatMinutesAsHours(minutes: number): string {
  if (!minutes || minutes <= 0) return "0.0h";
  return `${(minutes / 60).toFixed(1)}h`;
}

export function todayStamp(date = new Date()) {
  const yyyy = date.getFullYear().toString();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export function parseMoneyInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export function getResponsiveSpan(span: number, isCompactLayout: boolean) {
  return isCompactLayout ? "span 12" : `span ${span}`;
}

export function canReleaseRO(ro: RepairOrderRecord): boolean {
  return ro.status === "Ready Release";
}

export function canExecuteWorkLine(ro: RepairOrderRecord, line: RepairOrderWorkLine): boolean {
  if (ro.status !== "In Progress" && ro.status !== "Waiting Parts") return false;
  if (line.approvalDecision === "Declined" || line.approvalDecision === "Deferred") return false;
  return line.status === "Pending" || line.status === "Waiting Parts";
}

const PARTS_BLOCKING_STATUSES: PartsRequestStatus[] = [
  "Draft",
  "Requested",
  "Sent to Suppliers",
  "Waiting for Bids",
  "Bidding",
  "Supplier Selected",
  "Ordered",
  "In Transit",
  "Shipped",
];

export function isWorkLineBlockedByParts(line: RepairOrderWorkLine, partsRequests: PartsRequestRecord[]): boolean {
  if (line.status === "Waiting Parts") return true;
  return partsRequests.some(
    (req) => req.workLineId === line.id && PARTS_BLOCKING_STATUSES.includes(req.status)
  );
}

export function canCompleteWorkLine(ro: RepairOrderRecord, line: RepairOrderWorkLine, partsRequests?: PartsRequestRecord[]): boolean {
  if (ro.status !== "In Progress" && ro.status !== "Waiting Parts") return false;
  if (line.status !== "In Progress") return false;
  if (partsRequests && isWorkLineBlockedByParts(line, partsRequests)) return false;
  return true;
}

export function canMoveToQualityCheck(ro: RepairOrderRecord): boolean {
  if (ro.status !== "In Progress" && ro.status !== "Waiting Parts") return false;
  const approvedOrUnapproved = ro.workLines.filter(
    (l) => l.approvalDecision !== "Declined" && l.approvalDecision !== "Deferred"
  );
  return approvedOrUnapproved.length > 0 && approvedOrUnapproved.every((l) => l.status === "Completed");
}

export function canTransitionROStatus(ro: RepairOrderRecord, to: RepairOrderRecord["status"]): boolean {
  const from = ro.status;
  const allowed: Partial<Record<RepairOrderRecord["status"], RepairOrderRecord["status"][]>> = {
    "Draft": ["Waiting Inspection", "Approved / Ready to Work"],
    "Waiting Inspection": ["Waiting Approval", "Approved / Ready to Work"],
    "Waiting Approval": ["Approved / Ready to Work"],
    "Approved / Ready to Work": ["In Progress", "Pulled Out"],
    "In Progress": ["Waiting Parts", "Quality Check", "Pulled Out"],
    "Waiting Parts": ["In Progress", "Pulled Out"],
    "Quality Check": ["Ready Release", "In Progress"],
    "Ready Release": ["Released", "Pulled Out"],
    "Released": ["Closed"],
    "Pulled Out": [],
    "Closed": [],
  };
  return (allowed[from] ?? []).includes(to);
}
