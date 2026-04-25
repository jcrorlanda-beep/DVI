"use strict";
// src/modules/shared/constants.ts
// Shared role and permission constants extracted from App.tsx
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOC_NUMBER_PREFIXES = exports.NUMBERING_STORAGE_KEY = exports.ALL_PERMISSIONS = exports.ALL_ROLES = void 0;
exports.ALL_ROLES = [
    "Admin",
    "Service Advisor",
    "Chief Technician",
    "Senior Mechanic",
    "General Mechanic",
    "Office Staff",
    "Reception",
    "OJT",
];
exports.ALL_PERMISSIONS = [
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
// Shared storage key for document number counters (must match all modules)
exports.NUMBERING_STORAGE_KEY = "dvi_phase2_counters_v1";
// Document number prefixes — format: PREFIX-YYYYMMDD-###
exports.DOC_NUMBER_PREFIXES = {
    INTAKE: "INT",
    REPAIR_ORDER: "RO",
    PARTS_REQUEST: "PR",
    QUALITY_CHECK: "QC",
    RELEASE: "REL",
};
