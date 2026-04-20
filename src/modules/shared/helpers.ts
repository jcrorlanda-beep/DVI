// src/modules/shared/helpers.ts
// Shared helper functions extracted from App.tsx

import type { UserRole, RoleDefinition, Permission, WorkLog } from "./types";

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
