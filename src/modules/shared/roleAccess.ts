import type { UserRole } from "./types";

export function canAccessAdvisorTools(role: UserRole) {
  return role === "Admin" || role === "Service Advisor" || role === "Office Staff";
}

export function canAccessFinancialReports(role: UserRole) {
  return role === "Admin" || role === "Office Staff";
}

export function canAccessInventoryManagement(role: UserRole) {
  return role === "Admin" || role === "Office Staff";
}

export function canAccessSupplierManagement(role: UserRole) {
  return role === "Admin" || role === "Office Staff";
}

export function canAccessTechnicianOperations(role: UserRole) {
  return role === "Admin" || role === "Chief Technician" || role === "Senior Mechanic" || role === "General Mechanic" || role === "OJT";
}

export function canAccessManagementSummary(role: UserRole) {
  return role === "Admin";
}

