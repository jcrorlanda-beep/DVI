// src/modules/shared/constants.ts
// Shared role and permission constants extracted from App.tsx

import type { UserRole, Permission } from "./types";

export const ALL_ROLES: UserRole[] = [
  "Admin",
  "Service Advisor",
  "Chief Technician",
  "Senior Mechanic",
  "General Mechanic",
  "Office Staff",
  "Reception",
  "OJT",
];

export const ALL_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "bookings.view",
  "intake.view",
  "inspection.view",
  "repairOrders.view",
  "shopFloor.view",
  "qualityControl.view",
  "release.view",
  "parts.view",
  "backjobs.view",
  "history.view",
  "users.view",
  "users.manage",
  "roles.view",
  "roles.manage",
  "settings.view",
];
