/**
 * Write Pilot Helpers (Phase 225+)
 *
 * Async helpers for the controlled backend write pilot.
 * Each function:
 *   - Returns immediately with syncStatus:"skipped_locked" if AppDataMode is not "backendWritePilot"
 *   - Posts to /api/pilot/* routes
 *   - Handles conflict, locked, failed, and offline cases
 *   - Never throws — always returns WritePilotWriteResult
 *   - Never modifies localStorage
 *   - Never blocks the existing local write flow
 *
 * Usage: call AFTER the localStorage write completes. If the pilot fails,
 * localStorage remains the source of truth.
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "./apiClient";
import { isBackendWritePilotRequested } from "./backendDataMode";
import type { AuditLogRecord } from "../shared/types";
import type {
  WritePilotCreateBackjobInput,
  WritePilotCreateCustomerInput,
  WritePilotCreateExpenseInput,
  WritePilotCreateInspectionInput,
  WritePilotCreateIntakeInput,
  WritePilotCreateInventoryItemInput,
  WritePilotCreateInventoryMovementInput,
  WritePilotCreateInvoiceInput,
  WritePilotCreateDocumentInput,
  WritePilotCreatePartsRequestInput,
  WritePilotCreatePaymentInput,
  WritePilotCreatePurchaseOrderInput,
  WritePilotCreateQcInput,
  WritePilotCreateReleaseInput,
  WritePilotCreateRoInput,
  WritePilotCreateServiceHistoryInput,
  WritePilotCreateSupplierInput,
  WritePilotCreateVehicleInput,
  WritePilotWriteResult,
} from "./writePilotContracts";
import { appendPilotAttempt } from "./writePilotAttemptLog";

export type WritePilotOptions = {
  onLogAudit?: (entry: Omit<AuditLogRecord, "id" | "timestamp">) => void;
};

type PilotWriteData = {
  localId: string;
  remoteId: string | null;
  syncStatus: "synced" | "conflict" | "skipped_locked" | "failed";
  warning?: string;
  conflictReason?: string;
};

function lockedResult(localId: string): WritePilotWriteResult {
  return {
    success: false,
    localId,
    remoteId: null,
    syncStatus: "skipped_locked",
    warning: "Write pilot not active. Set AppDataMode to backendWritePilot to enable.",
  };
}

function networkFailResult(localId: string, error: string): WritePilotWriteResult {
  return { success: false, localId, remoteId: null, syncStatus: "failed", warning: error };
}

function fromPilotData(data: PilotWriteData): WritePilotWriteResult {
  return {
    success: data.syncStatus === "synced",
    localId: data.localId,
    remoteId: data.remoteId,
    syncStatus: data.syncStatus,
    warning: data.warning,
    conflictReason: data.conflictReason,
  };
}

function appendDocumentPilotAttempt(entityType: "document" | "fileUpload" | "customerDocument", localId: string, entityLabel: string, result: WritePilotWriteResult): void {
  const syncStatus = result.syncStatus === "synced" || result.syncStatus === "conflict" || result.syncStatus === "skipped_locked" || result.syncStatus === "failed"
    ? result.syncStatus
    : "failed";
  appendPilotAttempt({
    entityType,
    localId,
    entityLabel,
    syncStatus,
    remoteId: result.remoteId,
    warning: result.warning,
    conflictReason: result.conflictReason,
  });
}

// ── Customers ─────────────────────────────────────────────────────────────────

export async function createCustomerBackendPilot(
  input: WritePilotCreateCustomerInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.customer_create_attempt",
    entityId: input.localId,
    entityLabel: input.customerName,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for customer "${input.customerName}".`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/customers", { body: input });

  if (!res.success) {
    options.onLogAudit?.({
      module: "BackendPilot",
      action: "backend_pilot.customer_create_failed",
      entityId: input.localId,
      entityLabel: input.customerName,
      userId: "pilot",
      userName: "Write Pilot",
      detail: `Write pilot: backend unavailable — ${res.error ?? "unknown error"}.`,
    });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  const action =
    pilotResult.success
      ? "backend_pilot.customer_create_success"
      : res.data.syncStatus === "conflict"
        ? "backend_pilot.customer_create_conflict"
        : "backend_pilot.customer_create_failed";

  options.onLogAudit?.({
    module: "BackendPilot",
    action,
    entityId: input.localId,
    entityLabel: input.customerName,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend customer created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateCustomerBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateCustomerInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.customer_update_attempt",
    entityId: localId,
    entityLabel: input.customerName ?? localId,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend update attempt for customer localId=${localId}.`,
  });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/customers/${encodeURIComponent(localId)}`, { body: input });

  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);

  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.customer_update_success" : "backend_pilot.customer_update_failed",
    entityId: localId,
    entityLabel: input.customerName ?? localId,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend customer updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Vehicles ──────────────────────────────────────────────────────────────────

export async function createVehicleBackendPilot(
  input: WritePilotCreateVehicleInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.plateNumber ?? input.conductionNumber ?? input.localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.vehicle_create_attempt",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for vehicle plate="${input.plateNumber ?? "N/A"}".`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/vehicles", { body: input });

  if (!res.success) {
    options.onLogAudit?.({
      module: "BackendPilot",
      action: "backend_pilot.vehicle_create_failed",
      entityId: input.localId,
      entityLabel: label,
      userId: "pilot",
      userName: "Write Pilot",
      detail: `Write pilot: backend unavailable — ${res.error ?? "unknown error"}.`,
    });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  const action =
    pilotResult.success
      ? "backend_pilot.vehicle_create_success"
      : res.data.syncStatus === "conflict"
        ? "backend_pilot.vehicle_create_conflict"
        : "backend_pilot.vehicle_create_failed";

  options.onLogAudit?.({
    module: "BackendPilot",
    action,
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend vehicle created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateVehicleBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateVehicleInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.plateNumber ?? input.conductionNumber ?? localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.vehicle_update_attempt",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend update attempt for vehicle localId=${localId}.`,
  });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/vehicles/${encodeURIComponent(localId)}`, { body: input });

  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);

  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.vehicle_update_success" : "backend_pilot.vehicle_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend vehicle updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Intakes ───────────────────────────────────────────────────────────────────

export async function createIntakeBackendPilot(
  input: WritePilotCreateIntakeInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.intake_create_attempt",
    entityId: input.localId,
    entityLabel: input.intakeNumber,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for intake #${input.intakeNumber}.`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/intakes", { body: input });

  if (!res.success) {
    options.onLogAudit?.({
      module: "BackendPilot",
      action: "backend_pilot.intake_create_failed",
      entityId: input.localId,
      entityLabel: input.intakeNumber,
      userId: "pilot",
      userName: "Write Pilot",
      detail: `Write pilot: backend unavailable — ${res.error ?? "unknown error"}.`,
    });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  const action =
    pilotResult.success
      ? "backend_pilot.intake_create_success"
      : res.data.syncStatus === "conflict"
        ? "backend_pilot.intake_create_conflict"
        : "backend_pilot.intake_create_failed";

  options.onLogAudit?.({
    module: "BackendPilot",
    action,
    entityId: input.localId,
    entityLabel: input.intakeNumber,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend intake created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateIntakeBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateIntakeInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.intakeNumber ?? localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.intake_update_attempt",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend update attempt for intake localId=${localId}.`,
  });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/intakes/${encodeURIComponent(localId)}`, { body: input });

  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);

  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.intake_update_success" : "backend_pilot.intake_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend intake updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Repair Orders ─────────────────────────────────────────────────────────────

export async function createRepairOrderBackendPilot(
  input: WritePilotCreateRoInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.ro_create_attempt",
    entityId: input.localId,
    entityLabel: input.roNumber,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for RO #${input.roNumber}.`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/repair-orders", { body: input });

  if (!res.success) {
    options.onLogAudit?.({
      module: "BackendPilot",
      action: "backend_pilot.ro_create_failed",
      entityId: input.localId,
      entityLabel: input.roNumber,
      userId: "pilot",
      userName: "Write Pilot",
      detail: `Write pilot: backend unavailable — ${res.error ?? "unknown error"}.`,
    });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  const action =
    pilotResult.success
      ? "backend_pilot.ro_create_success"
      : res.data.syncStatus === "conflict"
        ? "backend_pilot.ro_create_conflict"
        : "backend_pilot.ro_create_failed";

  options.onLogAudit?.({
    module: "BackendPilot",
    action,
    entityId: input.localId,
    entityLabel: input.roNumber,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend RO created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateRepairOrderBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateRoInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.roNumber ?? localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.ro_update_attempt",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend update attempt for RO localId=${localId}.`,
  });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/repair-orders/${encodeURIComponent(localId)}`, { body: input });

  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);

  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.ro_update_success" : "backend_pilot.ro_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend RO updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Inspections ───────────────────────────────────────────────────────────────

export async function createInspectionBackendPilot(
  input: WritePilotCreateInspectionInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.inspectionNumber ?? input.plateNumber ?? input.localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.inspection_create_attempt",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for inspection "${input.inspectionNumber ?? "N/A"}".`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/inspections", { body: input });

  if (!res.success) {
    options.onLogAudit?.({
      module: "BackendPilot",
      action: "backend_pilot.inspection_create_failed",
      entityId: input.localId,
      entityLabel: label,
      userId: "pilot",
      userName: "Write Pilot",
      detail: `Write pilot: backend unavailable — ${res.error ?? "unknown error"}.`,
    });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action:
      pilotResult.success
        ? "backend_pilot.inspection_create_success"
        : res.data.syncStatus === "conflict"
          ? "backend_pilot.inspection_create_conflict"
          : "backend_pilot.inspection_create_failed",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend inspection created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateInspectionBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateInspectionInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.inspectionNumber ?? localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.inspection_update_attempt",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend update attempt for inspection localId=${localId}.`,
  });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/inspections/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.inspection_update_success" : "backend_pilot.inspection_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend inspection updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── QC Records ────────────────────────────────────────────────────────────────

export async function createQcBackendPilot(
  input: WritePilotCreateQcInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.qcNumber ?? input.repairOrderNumber ?? input.localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.qc_create_attempt",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for QC "${input.qcNumber ?? "N/A"}".`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/qc", { body: input });

  if (!res.success) {
    options.onLogAudit?.({
      module: "BackendPilot",
      action: "backend_pilot.qc_create_failed",
      entityId: input.localId,
      entityLabel: label,
      userId: "pilot",
      userName: "Write Pilot",
      detail: `Write pilot: backend unavailable — ${res.error ?? "unknown error"}.`,
    });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action:
      pilotResult.success
        ? "backend_pilot.qc_create_success"
        : res.data.syncStatus === "conflict"
          ? "backend_pilot.qc_create_conflict"
          : "backend_pilot.qc_create_failed",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend QC created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateQcBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateQcInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.qcNumber ?? localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.qc_update_attempt",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend update attempt for QC localId=${localId}.`,
  });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/qc/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.qc_update_success" : "backend_pilot.qc_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend QC updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Release / Handover ────────────────────────────────────────────────────────

export async function createReleaseBackendPilot(
  input: WritePilotCreateReleaseInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.releaseNumber ?? input.repairOrderNumber ?? input.localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.release_create_attempt",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for release "${input.releaseNumber ?? "N/A"}".`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/releases", { body: input });

  if (!res.success) {
    options.onLogAudit?.({
      module: "BackendPilot",
      action: "backend_pilot.release_create_failed",
      entityId: input.localId,
      entityLabel: label,
      userId: "pilot",
      userName: "Write Pilot",
      detail: `Write pilot: backend unavailable — ${res.error ?? "unknown error"}.`,
    });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action:
      pilotResult.success
        ? "backend_pilot.release_create_success"
        : res.data.syncStatus === "conflict"
          ? "backend_pilot.release_create_conflict"
          : "backend_pilot.release_create_failed",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend release created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateReleaseBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateReleaseInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.releaseNumber ?? localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.release_update_attempt",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend update attempt for release localId=${localId}.`,
  });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/releases/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.release_update_success" : "backend_pilot.release_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend release updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Backjobs ──────────────────────────────────────────────────────────────────

export async function createBackjobBackendPilot(
  input: WritePilotCreateBackjobInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.backjobNumber ?? input.plateNumber ?? input.localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.backjob_create_attempt",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for backjob "${input.backjobNumber ?? "N/A"}".`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/backjobs", { body: input });

  if (!res.success) {
    options.onLogAudit?.({
      module: "BackendPilot",
      action: "backend_pilot.backjob_create_failed",
      entityId: input.localId,
      entityLabel: label,
      userId: "pilot",
      userName: "Write Pilot",
      detail: `Write pilot: backend unavailable — ${res.error ?? "unknown error"}.`,
    });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action:
      pilotResult.success
        ? "backend_pilot.backjob_create_success"
        : res.data.syncStatus === "conflict"
          ? "backend_pilot.backjob_create_conflict"
          : "backend_pilot.backjob_create_failed",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend backjob created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateBackjobBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateBackjobInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.backjobNumber ?? localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.backjob_update_attempt",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend update attempt for backjob localId=${localId}.`,
  });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/backjobs/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.backjob_update_success" : "backend_pilot.backjob_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend backjob updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Service History ───────────────────────────────────────────────────────────

export async function createServiceHistoryBackendPilot(
  input: WritePilotCreateServiceHistoryInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.serviceTitle;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.service_history_create_attempt",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for service history "${input.serviceTitle}".`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/service-history", { body: input });

  if (!res.success) {
    options.onLogAudit?.({
      module: "BackendPilot",
      action: "backend_pilot.service_history_create_failed",
      entityId: input.localId,
      entityLabel: label,
      userId: "pilot",
      userName: "Write Pilot",
      detail: `Write pilot: backend unavailable — ${res.error ?? "unknown error"}.`,
    });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action:
      pilotResult.success
        ? "backend_pilot.service_history_create_success"
        : res.data.syncStatus === "conflict"
          ? "backend_pilot.service_history_create_conflict"
          : "backend_pilot.service_history_create_failed",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend service history created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateServiceHistoryBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateServiceHistoryInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.serviceTitle ?? localId;

  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.service_history_update_attempt",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend update attempt for service history localId=${localId}.`,
  });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/service-history/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.service_history_update_success" : "backend_pilot.service_history_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend service history updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Parts Requests (Phase 235) ────────────────────────────────────────────────

export async function createPartsRequestBackendPilot(
  input: WritePilotCreatePartsRequestInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.partName ?? input.requestNumber ?? input.localId;
  options.onLogAudit?.({
    module: "BackendPilot",
    action: "backend_pilot.parts_request_create_attempt",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: `Write pilot: backend create attempt for parts request localId=${input.localId}.`,
  });

  const res = await apiPost<PilotWriteData>("/api/pilot/parts-requests", { body: input });
  if (!res.success) {
    options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.parts_request_create_failed", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: res.error ?? "Backend unavailable." });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.parts_request_create_success" : "backend_pilot.parts_request_create_conflict",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend parts request created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updatePartsRequestBackendPilot(
  localId: string,
  input: Partial<WritePilotCreatePartsRequestInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.partName ?? input.requestNumber ?? localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.parts_request_update_attempt", entityId: localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend update attempt for parts request localId=${localId}.` });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/parts-requests/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.parts_request_update_success" : "backend_pilot.parts_request_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend parts request updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Inventory Items (Phase 236) ────────────────────────────────────────────────

export async function createInventoryItemBackendPilot(
  input: WritePilotCreateInventoryItemInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.itemName ?? input.sku ?? input.localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.inventory_item_create_attempt", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend create attempt for inventory item localId=${input.localId}.` });

  const res = await apiPost<PilotWriteData>("/api/pilot/inventory", { body: input });
  if (!res.success) {
    options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.inventory_item_create_failed", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: res.error ?? "Backend unavailable." });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.inventory_item_create_success" : "backend_pilot.inventory_item_create_conflict",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend inventory item created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateInventoryItemBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateInventoryItemInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.itemName ?? input.sku ?? localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.inventory_item_update_attempt", entityId: localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend update attempt for inventory item localId=${localId}.` });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/inventory/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.inventory_item_update_success" : "backend_pilot.inventory_item_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend inventory item updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

export async function createInventoryMovementBackendPilot(
  input: WritePilotCreateInventoryMovementInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = `${input.movementType} qty=${input.quantity}`;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.inventory_movement_create_attempt", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend create attempt for inventory movement localId=${input.localId}.` });

  const res = await apiPost<PilotWriteData>(`/api/pilot/inventory/${encodeURIComponent(input.localInventoryItemId)}/movements`, { body: input });
  if (!res.success) {
    options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.inventory_movement_create_failed", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: res.error ?? "Backend unavailable." });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.inventory_movement_create_success" : "backend_pilot.inventory_movement_create_conflict",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend inventory movement created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

// ── Purchase Orders (Phase 237) ────────────────────────────────────────────────

export async function createPurchaseOrderBackendPilot(
  input: WritePilotCreatePurchaseOrderInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.poNumber ?? input.supplierName ?? input.localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.purchase_order_create_attempt", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend create attempt for purchase order localId=${input.localId}.` });

  const res = await apiPost<PilotWriteData>("/api/pilot/purchase-orders", { body: input });
  if (!res.success) {
    options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.purchase_order_create_failed", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: res.error ?? "Backend unavailable." });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.purchase_order_create_success" : "backend_pilot.purchase_order_create_conflict",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend purchase order created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updatePurchaseOrderBackendPilot(
  localId: string,
  input: Partial<WritePilotCreatePurchaseOrderInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.poNumber ?? input.supplierName ?? localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.purchase_order_update_attempt", entityId: localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend update attempt for purchase order localId=${localId}.` });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/purchase-orders/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.purchase_order_update_success" : "backend_pilot.purchase_order_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend purchase order updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Suppliers (Phase 237) ──────────────────────────────────────────────────────

export async function createSupplierBackendPilot(
  input: WritePilotCreateSupplierInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.supplier_create_attempt", entityId: input.localId, entityLabel: input.supplierName, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend create attempt for supplier localId=${input.localId}.` });

  const res = await apiPost<PilotWriteData>("/api/pilot/suppliers", { body: input });
  if (!res.success) {
    options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.supplier_create_failed", entityId: input.localId, entityLabel: input.supplierName, userId: "pilot", userName: "Write Pilot", detail: res.error ?? "Backend unavailable." });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.supplier_create_success" : "backend_pilot.supplier_create_conflict",
    entityId: input.localId,
    entityLabel: input.supplierName,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend supplier created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateSupplierBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateSupplierInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.supplierName ?? localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.supplier_update_attempt", entityId: localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend update attempt for supplier localId=${localId}.` });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/suppliers/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.supplier_update_success" : "backend_pilot.supplier_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend supplier updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

export function createSupplierBidBackendPilot(
  localId: string,
): WritePilotWriteResult {
  // No separate SupplierBid model — bids are embedded in PartsRequest.bids JSON.
  // Competitor bid data is never written to the backend to protect privacy.
  return {
    success: false,
    localId,
    remoteId: null,
    syncStatus: "skipped_locked",
    warning: "Supplier bids are embedded in parts requests. No separate backend model exists. Bid data is not written to the backend.",
  };
}

export function updateSupplierBidBackendPilot(
  localId: string,
): WritePilotWriteResult {
  return {
    success: false,
    localId,
    remoteId: null,
    syncStatus: "skipped_locked",
    warning: "Supplier bids are embedded in parts requests. No separate backend model exists.",
  };
}

// ── Payments (Phase 238) ───────────────────────────────────────────────────────

export async function createPaymentBackendPilot(
  input: WritePilotCreatePaymentInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.paymentNumber ?? `${input.method ?? "payment"} ${input.amount}`;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.payment_create_attempt", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend create attempt for payment localId=${input.localId}.` });

  const res = await apiPost<PilotWriteData>("/api/pilot/payments", { body: input });
  if (!res.success) {
    options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.payment_create_failed", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: res.error ?? "Backend unavailable." });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.payment_create_success" : "backend_pilot.payment_create_conflict",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend payment created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updatePaymentBackendPilot(
  localId: string,
  input: Partial<WritePilotCreatePaymentInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.paymentNumber ?? localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.payment_update_attempt", entityId: localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend update attempt for payment localId=${localId}.` });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/payments/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.payment_update_success" : "backend_pilot.payment_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend payment updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Expenses (Phase 238) ───────────────────────────────────────────────────────

export async function createExpenseBackendPilot(
  input: WritePilotCreateExpenseInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.expenseNumber ?? input.category ?? input.vendorName ?? input.localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.expense_create_attempt", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend create attempt for expense localId=${input.localId}.` });

  const res = await apiPost<PilotWriteData>("/api/pilot/expenses", { body: input });
  if (!res.success) {
    options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.expense_create_failed", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: res.error ?? "Backend unavailable." });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.expense_create_success" : "backend_pilot.expense_create_conflict",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend expense created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateExpenseBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateExpenseInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.expenseNumber ?? input.category ?? localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.expense_update_attempt", entityId: localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend update attempt for expense localId=${localId}.` });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/expenses/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.expense_update_success" : "backend_pilot.expense_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend expense updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// ── Invoices (Phase 238) ───────────────────────────────────────────────────────

export async function createInvoiceBackendPilot(
  input: WritePilotCreateInvoiceInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);

  const label = input.invoiceNumber ?? input.customerName ?? input.localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.invoice_create_attempt", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend create attempt for invoice localId=${input.localId}.` });

  const res = await apiPost<PilotWriteData>("/api/pilot/invoices", { body: input });
  if (!res.success) {
    options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.invoice_create_failed", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: res.error ?? "Backend unavailable." });
    return networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  }

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.invoice_create_success" : "backend_pilot.invoice_create_conflict",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend invoice created. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.conflictReason ?? res.data.warning ?? "Pilot did not complete.",
  });

  return pilotResult;
}

export async function updateInvoiceBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateInvoiceInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);

  const label = input.invoiceNumber ?? input.customerName ?? localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.invoice_update_attempt", entityId: localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: `Write pilot: backend update attempt for invoice localId=${localId}.` });

  const res = await apiPatch<PilotWriteData>(`/api/pilot/invoices/${encodeURIComponent(localId)}`, { body: input });
  if (!res.success) return networkFailResult(localId, res.error ?? "Backend unavailable.");

  const pilotResult = fromPilotData(res.data);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.invoice_update_success" : "backend_pilot.invoice_update_failed",
    entityId: localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success
      ? `Backend invoice updated. remoteId=${res.data.remoteId ?? "?"}.`
      : res.data.warning ?? "Update did not complete.",
  });

  return pilotResult;
}

// Documents / file storage (Phase 240-243)

export async function createDocumentBackendPilot(
  input: WritePilotCreateDocumentInput,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(input.localId);
  const label = input.fileName ?? input.title ?? input.localId;
  options.onLogAudit?.({ module: "BackendPilot", action: "backend_pilot.document_create_attempt", entityId: input.localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: "Write pilot: backend document metadata create attempt." });
  const res = await apiPost<PilotWriteData>("/api/pilot/documents", { body: { ...input, customerVisible: input.customerVisible === true, internalOnly: input.customerVisible === true ? false : true } });
  const pilotResult = res.success ? fromPilotData(res.data) : networkFailResult(input.localId, res.error ?? "Backend unavailable.");
  appendDocumentPilotAttempt("document", input.localId, label, pilotResult);
  options.onLogAudit?.({
    module: "BackendPilot",
    action: pilotResult.success ? "backend_pilot.document_create_success" : pilotResult.syncStatus === "conflict" ? "backend_pilot.document_create_conflict" : "backend_pilot.document_create_failed",
    entityId: input.localId,
    entityLabel: label,
    userId: "pilot",
    userName: "Write Pilot",
    detail: pilotResult.success ? `Backend document metadata created. remoteId=${pilotResult.remoteId ?? "?"}.` : pilotResult.conflictReason ?? pilotResult.warning ?? "Pilot did not complete.",
  });
  return pilotResult;
}

export async function updateDocumentBackendPilot(
  localId: string,
  input: Partial<WritePilotCreateDocumentInput>,
  options: WritePilotOptions = {},
): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);
  const label = input.fileName ?? input.title ?? localId;
  const res = await apiPatch<PilotWriteData>(`/api/pilot/documents/${encodeURIComponent(localId)}`, { body: input });
  const pilotResult = res.success ? fromPilotData(res.data) : networkFailResult(localId, res.error ?? "Backend unavailable.");
  appendDocumentPilotAttempt("document", localId, label, pilotResult);
  options.onLogAudit?.({ module: "BackendPilot", action: pilotResult.success ? "backend_pilot.document_update_success" : "backend_pilot.document_update_failed", entityId: localId, entityLabel: label, userId: "pilot", userName: "Write Pilot", detail: pilotResult.success ? "Backend document metadata updated." : pilotResult.warning ?? "Update failed." });
  return pilotResult;
}

export async function deleteDocumentBackendPilot(localId: string): Promise<WritePilotWriteResult> {
  if (!isBackendWritePilotRequested()) return lockedResult(localId);
  const res = await apiDelete<PilotWriteData>(`/api/pilot/documents/${encodeURIComponent(localId)}`);
  const pilotResult = res.success ? fromPilotData(res.data) : networkFailResult(localId, res.error ?? "Backend unavailable.");
  appendDocumentPilotAttempt("document", localId, localId, pilotResult);
  return pilotResult;
}

export type BackendFileUploadPilotInput = {
  localId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  dataUrl?: string;
  base64?: string;
  sourceModule?: string;
  linkedEntityId?: string;
  linkedEntityLabel?: string;
  note?: string;
};

export type BackendFileUploadPilotResult = {
  success: boolean;
  localId: string;
  fileId?: string;
  storageKey?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  warning?: string;
};

export async function uploadFileBackendPilot(input: BackendFileUploadPilotInput): Promise<BackendFileUploadPilotResult> {
  if (!isBackendWritePilotRequested()) {
    return { success: false, localId: input.localId, warning: "Backend file upload pilot is locked. Local metadata remains intact." };
  }
  const res = await apiPost<{
    file: { fileId: string; storageKey: string; fileName: string; mimeType: string; fileSize: number };
    metadataWarning?: string;
  }>("/api/files/upload", { body: { ...input, createDocumentMetadata: false } });
  if (!res.success) {
    const result = { success: false, localId: input.localId, warning: res.error ?? "Backend file upload failed." };
    appendDocumentPilotAttempt("fileUpload", input.localId, input.fileName, { ...result, remoteId: null, syncStatus: "failed" });
    return result;
  }
  const result = {
    success: true,
    localId: input.localId,
    fileId: res.data.file.fileId,
    storageKey: res.data.file.storageKey,
    fileName: res.data.file.fileName,
    mimeType: res.data.file.mimeType,
    fileSize: res.data.file.fileSize,
    warning: res.data.metadataWarning,
  };
  appendDocumentPilotAttempt("fileUpload", input.localId, input.fileName, { success: true, localId: input.localId, remoteId: result.fileId, syncStatus: "synced", warning: result.warning });
  return result;
}

export async function getFileBackendPilot(fileId: string): Promise<{ success: boolean; warning?: string }> {
  if (!isBackendWritePilotRequested()) return { success: false, warning: "Backend file retrieval pilot is locked." };
  const res = await apiGet<unknown>(`/api/files/${encodeURIComponent(fileId)}`);
  return res.success ? { success: true } : { success: false, warning: res.error ?? "Backend file unavailable." };
}

export async function deleteFileBackendPilot(fileId: string): Promise<{ success: boolean; warning?: string }> {
  if (!isBackendWritePilotRequested()) return { success: false, warning: "Backend file delete pilot is locked." };
  const res = await apiDelete<{ deleted: boolean; fileId: string }>(`/api/files/${encodeURIComponent(fileId)}`);
  return res.success ? { success: true } : { success: false, warning: res.error ?? "Backend file delete failed." };
}

export async function listCustomerVisibleDocuments(query = "") {
  return apiGet<{ items: unknown[]; privacy: string; source: string }>(`/api/customer-portal/documents${query}`);
}

export async function getCustomerVisibleDocument(id: string, query = "") {
  return apiGet<{ document: unknown; privacy: string }>(`/api/customer-portal/documents/${encodeURIComponent(id)}${query}`);
}
