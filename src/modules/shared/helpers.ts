// src/modules/shared/helpers.ts
// Shared helper functions extracted from App.tsx

import type {
  UserRole, RoleDefinition, Permission, WorkLog, RepairOrderRecord, RepairOrderWorkLine,
  PartsRequestRecord, PartsRequestStatus, UserAccount, QCRecord, InvoiceRecord, BackjobRecord,
  TechnicianProductivityRow, AdvisorSalesRow, RepeatCustomerRow, QCPassFailSummary,
  WaitingPartsAgingRow, BackjobRateSummary,
} from "./types";
import { NUMBERING_STORAGE_KEY } from "./constants";

function readCounters(): Record<string, number> {
  try {
    const raw = localStorage.getItem(NUMBERING_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeCounters(counters: Record<string, number>): void {
  localStorage.setItem(NUMBERING_STORAGE_KEY, JSON.stringify(counters));
}

// Generate a stable document number in PREFIX-YYYYMMDD-### format.
// Call once at record creation; never call again on edit.
export function generateDocNumber(prefix: string): string {
  const stamp = todayStamp();
  const counters = readCounters();
  const key = `${prefix}_${stamp}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeCounters(counters);
  return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}

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

// --- REPORT HELPERS ---

export function getTechnicianProductivity(
  ros: RepairOrderRecord[],
  workLogs: WorkLog[],
  users: UserAccount[]
): TechnicianProductivityRow[] {
  const map = new Map<string, TechnicianProductivityRow>();

  for (const ro of ros) {
    for (const line of ro.workLines) {
      if (!line.assignedTechnicianId) continue;
      const id = line.assignedTechnicianId;
      if (!map.has(id)) {
        const user = users.find((u) => u.id === id);
        map.set(id, { technicianId: id, technicianName: user?.fullName ?? id, jobCount: 0, laborProduced: 0, loggedMinutes: 0, loggedHours: 0 });
      }
      const row = map.get(id)!;
      row.jobCount += 1;
      row.laborProduced += parseFloat(line.serviceEstimate) || 0;
    }
  }

  for (const log of workLogs) {
    if (!map.has(log.technicianId)) {
      const user = users.find((u) => u.id === log.technicianId);
      map.set(log.technicianId, { technicianId: log.technicianId, technicianName: user?.fullName ?? log.technicianId, jobCount: 0, laborProduced: 0, loggedMinutes: 0, loggedHours: 0 });
    }
    const row = map.get(log.technicianId)!;
    row.loggedMinutes += getWorkLogMinutes(log);
  }

  for (const row of map.values()) {
    row.loggedHours = parseFloat((row.loggedMinutes / 60).toFixed(2));
  }

  return Array.from(map.values()).sort((a, b) => b.laborProduced - a.laborProduced);
}

export function getAdvisorSalesProduced(
  ros: RepairOrderRecord[],
  invoices: InvoiceRecord[]
): AdvisorSalesRow[] {
  const map = new Map<string, AdvisorSalesRow>();

  for (const ro of ros) {
    const advisor = ro.advisorName || "Unassigned";
    if (!map.has(advisor)) {
      map.set(advisor, { advisorName: advisor, roCount: 0, totalInvoiced: 0, laborSubtotal: 0, partsSubtotal: 0 });
    }
    map.get(advisor)!.roCount += 1;
  }

  for (const inv of invoices) {
    const ro = ros.find((r) => r.id === inv.roId);
    if (!ro) continue;
    const advisor = ro.advisorName || "Unassigned";
    if (!map.has(advisor)) {
      map.set(advisor, { advisorName: advisor, roCount: 0, totalInvoiced: 0, laborSubtotal: 0, partsSubtotal: 0 });
    }
    const row = map.get(advisor)!;
    row.totalInvoiced += parseFloat(inv.totalAmount) || 0;
    row.laborSubtotal += parseFloat(inv.laborSubtotal) || 0;
    row.partsSubtotal += parseFloat(inv.partsSubtotal) || 0;
  }

  return Array.from(map.values()).sort((a, b) => b.totalInvoiced - a.totalInvoiced);
}

export function getRepeatCustomerFrequency(ros: RepairOrderRecord[]): RepeatCustomerRow[] {
  const map = new Map<string, RepeatCustomerRow>();

  for (const ro of ros) {
    const key = ro.plateNumber || ro.accountLabel || ro.customerName || ro.id;
    if (!map.has(key)) {
      map.set(key, { key, plateNumber: ro.plateNumber, accountLabel: ro.accountLabel, visitCount: 0, lastVisitDate: "" });
    }
    const row = map.get(key)!;
    row.visitCount += 1;
    if (!row.lastVisitDate || ro.createdAt > row.lastVisitDate) {
      row.lastVisitDate = ro.createdAt;
    }
  }

  return Array.from(map.values())
    .filter((r) => r.visitCount > 1)
    .sort((a, b) => b.visitCount - a.visitCount);
}

export function getQcPassFailSummary(qcRecords: QCRecord[]): QCPassFailSummary {
  const total = qcRecords.length;
  const passed = qcRecords.filter((q) => q.result === "Passed").length;
  const failed = total - passed;
  const passRatePct = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;

  const officerMap = new Map<string, { total: number; passed: number; failed: number }>();
  for (const q of qcRecords) {
    const name = q.qcBy || "Unknown";
    if (!officerMap.has(name)) officerMap.set(name, { total: 0, passed: 0, failed: 0 });
    const row = officerMap.get(name)!;
    row.total += 1;
    if (q.result === "Passed") row.passed += 1;
    else row.failed += 1;
  }

  const byQCOfficer = Array.from(officerMap.entries())
    .map(([qcBy, counts]) => ({ qcBy, ...counts }))
    .sort((a, b) => b.total - a.total);

  return { total, passed, failed, passRatePct, byQCOfficer };
}

export function getWaitingPartsAging(
  ros: RepairOrderRecord[],
  partsRequests: PartsRequestRecord[]
): WaitingPartsAgingRow[] {
  const now = Date.now();
  const result: WaitingPartsAgingRow[] = [];

  for (const ro of ros) {
    if (ro.status !== "Waiting Parts" && ro.status !== "In Progress") continue;
    const blockedLines = ro.workLines.filter((l) => isWorkLineBlockedByParts(l, partsRequests.filter((p) => p.roId === ro.id)));
    if (blockedLines.length === 0) continue;

    const earliest = partsRequests
      .filter((p) => p.roId === ro.id && PARTS_BLOCKING_STATUSES.includes(p.status))
      .map((p) => new Date(p.createdAt).getTime())
      .filter((t) => !Number.isNaN(t));

    const oldestMs = earliest.length > 0 ? Math.min(...earliest) : new Date(ro.createdAt).getTime();
    const daysWaiting = Math.floor((now - oldestMs) / 86400000);

    result.push({
      roId: ro.id,
      roNumber: ro.roNumber,
      plateNumber: ro.plateNumber,
      accountLabel: ro.accountLabel,
      daysWaiting,
      blockedWorkLineTitles: blockedLines.map((l) => l.title),
    });
  }

  return result.sort((a, b) => b.daysWaiting - a.daysWaiting);
}

export function getBackjobRate(
  ros: RepairOrderRecord[],
  backjobs: BackjobRecord[]
): BackjobRateSummary {
  const totalROs = ros.length;
  const backjobCount = backjobs.length;
  const backjobRatePct = totalROs > 0 ? parseFloat(((backjobCount / totalROs) * 100).toFixed(1)) : 0;

  const respMap = new Map<string, number>();
  for (const bj of backjobs) {
    const key = bj.responsibility || "Unknown";
    respMap.set(key, (respMap.get(key) ?? 0) + 1);
  }

  const byResponsibility = Array.from(respMap.entries())
    .map(([responsibility, count]) => ({ responsibility, count }))
    .sort((a, b) => b.count - a.count);

  return { totalROs, backjobCount, backjobRatePct, byResponsibility };
}
