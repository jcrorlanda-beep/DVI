/**
 * Pilot Write Routes (Phase 225–228)
 *
 * Controlled backend write routes for the frontend write pilot.
 * All routes check WRITE_PILOT_ENABLED env var at startup.
 *
 * If not enabled: returns { syncStatus: "skipped_locked" } — HTTP 200, not an error.
 * If enabled: runs conflict checks, then writes to Prisma.
 *
 * These differ from /api/write-pilot/* (Phase 223 stubs that always return 423).
 * The /api/pilot/* routes are the real implementation — guarded but functional when enabled.
 *
 * Response shape: always HTTP 200 with:
 *   { success: true, data: PilotWriteData, meta }
 * Network/server failures: HTTP 503 via sendUnavailable.
 *
 * Route identification: PATCH routes identify records by frontend localId (URL param),
 * not the backend Prisma id. Lookup by localId is performed before updating.
 */

import type { ServerResponse } from "node:http";
import { getPrismaClient } from "../db/prisma.js";
import {
  backjobRecordsRepository,
  prepareBackjobRecordInputForPersistence,
  buildInventoryMovementInput,
  customersRepository,
  documentsRepository,
  findCustomerDuplicateCandidates,
  hasCustomerDuplicates,
  expensesRepository,
  findVehicleDuplicateCandidates,
  hasVehicleDuplicates,
  prepareVehicleInputForPersistence,
  inspectionsRepository,
  prepareInspectionInputForPersistence,
  intakesRepository,
  prepareIntakeInputForPersistence,
  inventoryItemsRepository,
  inventoryMovementsRepository,
  invoicesRepository,
  partsRequestsRepository,
  paymentsRepository,
  purchaseOrdersRepository,
  qcRecordsRepository,
  prepareQcRecordInputForPersistence,
  releaseRecordsRepository,
  prepareReleaseRecordInputForPersistence,
  repairOrdersRepository,
  serviceHistoryRepository,
  prepareServiceHistoryInputForPersistence,
  suppliersRepository,
  vehiclesRepository,
} from "../repositories/index.js";
import { sendJson } from "../response.js";
import type { ApiRoute } from "./types.js";

const WRITE_PILOT_ENABLED = process.env.WRITE_PILOT_ENABLED === "true";

type PilotWriteData = {
  localId: string;
  remoteId: string | null;
  syncStatus: "synced" | "conflict" | "skipped_locked" | "failed";
  warning?: string;
  conflictReason?: string;
};

function pilotOk(res: ServerResponse, data: PilotWriteData): void {
  sendJson<PilotWriteData>(res, 200, {
    success: true,
    data,
    meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
  });
}

function lockedData(localId: string): PilotWriteData {
  return {
    localId,
    remoteId: null,
    syncStatus: "skipped_locked",
    warning: "WRITE_PILOT_ENABLED is not set. No backend write was performed. LocalStorage remains the source of truth.",
  };
}

function extractLocalId(body: unknown): string {
  if (typeof body !== "object" || body === null) return "";
  const rec = body as Record<string, unknown>;
  return typeof rec.localId === "string" ? rec.localId.trim() : "";
}

function text(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function validateDocumentPilotPayload(body: Record<string, unknown>): string | null {
  const fileName = text(body, "fileName") || text(body, "title");
  if (!fileName) return "fileName or title is required for document metadata pilot.";
  const sourceModule = text(body, "sourceModule");
  if (!sourceModule) return "sourceModule is required for document metadata pilot.";
  const fileType = text(body, "fileType") || text(body, "mimeType");
  const fileSize = typeof body.fileSize === "number" ? body.fileSize : Number(body.fileSize ?? 0);
  if (fileType && /supplier|bid|quote|margin|profit|audit|credential|secret/i.test(`${sourceModule} ${fileType} ${fileName}`)) {
    return "Sensitive supplier, bid, quote, margin, audit, credential, or secret documents cannot be customer-facing pilot metadata.";
  }
  if (!Number.isFinite(fileSize) || fileSize < 0) return "fileSize must be a non-negative number.";
  if (body.customerVisible === true && body.customerVisibilityReviewed !== true) {
    return "customerVisible documents require customerVisibilityReviewed=true before backend pilot write.";
  }
  if (body.customerVisible !== true && body.internalOnly === false) {
    return "Documents default to internal-only. Explicit review is required before making a document customer-visible.";
  }
  if (text(body, "storageKey").includes("..") || text(body, "fileId").includes("..")) {
    return "Unsafe file reference was rejected.";
  }
  return null;
}

async function findPrismaIdByLocalId(modelName: string, localId: string): Promise<string | null> {
  try {
    const client = await getPrismaClient();
    if (!client) return null;
    const delegate = (client as Record<string, unknown>)[modelName] as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined;
    if (!delegate?.findUnique) return null;
    const record = await delegate.findUnique({ where: { localId }, select: { id: true } } as unknown);
    if (record && typeof record === "object" && "id" in record && typeof (record as Record<string, unknown>).id === "string") {
      return (record as { id: string }).id;
    }
    return null;
  } catch {
    return null;
  }
}

export const pilotWriteRoutes: ApiRoute[] = [
  // ── Customers ──────────────────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/customers$/,
    description: "Write pilot: create customer (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const duplicates = await findCustomerDuplicateCandidates(body);
      if (!duplicates.success) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: duplicates.error ?? "Duplicate check failed." });
        return;
      }
      if (hasCustomerDuplicates(duplicates.data)) {
        pilotOk(res, {
          localId,
          remoteId: null,
          syncStatus: "conflict",
          conflictReason: "Potential duplicate customer detected (name/phone, email, or company match). Review before creating backend record.",
        });
        return;
      }

      const createResult = await customersRepository.create({ ...body, localId });
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/customers\/(?<id>[^/]+)$/,
    description: "Write pilot: update customer by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("customer", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend customer found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const updateResult = await customersRepository.update(remoteId, body);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Vehicles ───────────────────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/vehicles$/,
    description: "Write pilot: create vehicle (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const plateNumber = typeof body.plateNumber === "string" ? body.plateNumber.trim() : "";
      const conductionNumber = typeof body.conductionNumber === "string" ? body.conductionNumber.trim() : "";

      if (!plateNumber && !conductionNumber) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: "Vehicle must have a plateNumber or conductionNumber." });
        return;
      }

      const prepared = await prepareVehicleInputForPersistence({ ...body, localId });

      const duplicates = await findVehicleDuplicateCandidates(prepared);
      if (!duplicates.success) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: duplicates.error ?? "Duplicate check failed." });
        return;
      }
      if (hasVehicleDuplicates(duplicates.data)) {
        pilotOk(res, {
          localId,
          remoteId: null,
          syncStatus: "conflict",
          conflictReason: "Potential duplicate vehicle detected (plate number, conduction number, or customer/make/model/year match). Review before creating.",
        });
        return;
      }

      const createResult = await vehiclesRepository.create(prepared);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/vehicles\/(?<id>[^/]+)$/,
    description: "Write pilot: update vehicle by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("vehicle", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend vehicle found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const prepared = await prepareVehicleInputForPersistence(body);
      const updateResult = await vehiclesRepository.update(remoteId, prepared);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Intakes ────────────────────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/intakes$/,
    description: "Write pilot: create intake (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const intakeNumber = typeof body.intakeNumber === "string" ? body.intakeNumber.trim() : "";
      if (!intakeNumber) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: "intakeNumber is required for intake write pilot." });
        return;
      }

      // Duplicate intake number check
      const client = await getPrismaClient();
      const intakeDelegate = client ? (client as Record<string, unknown>).intake as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
      if (intakeDelegate?.findUnique) {
        const existingByNumber = await intakeDelegate.findUnique({ where: { intakeNumber }, select: { id: true, localId: true } } as unknown).catch(() => null);
        if (existingByNumber && typeof existingByNumber === "object") {
          const existing = existingByNumber as { id: string; localId?: string | null };
          if (existing.localId !== localId) {
            pilotOk(res, {
              localId,
              remoteId: null,
              syncStatus: "conflict",
              conflictReason: `Intake number "${intakeNumber}" already exists in backend for a different local record.`,
            });
            return;
          }
          // Same localId — already synced
          pilotOk(res, { localId, remoteId: existing.id, syncStatus: "synced", warning: "Intake was already synced (idempotency)." });
          return;
        }
      }

      const prepared = await prepareIntakeInputForPersistence({ ...body, localId });
      const createResult = await intakesRepository.create(prepared);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/intakes\/(?<id>[^/]+)$/,
    description: "Write pilot: update intake by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("intake", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend intake found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const prepared = await prepareIntakeInputForPersistence(body);
      const updateResult = await intakesRepository.update(remoteId, prepared);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Repair Orders ──────────────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/repair-orders$/,
    description: "Write pilot: create repair order (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const roNumber = typeof body.roNumber === "string" ? body.roNumber.trim() : "";
      if (!roNumber) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: "roNumber is required for RO write pilot." });
        return;
      }

      // Duplicate RO number check
      const client = await getPrismaClient();
      const roDelegate = client ? (client as Record<string, unknown>).repairOrder as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
      if (roDelegate?.findUnique) {
        const existingByNumber = await roDelegate.findUnique({
          where: { repairOrderNumber: roNumber },
          select: { id: true, localId: true },
        } as unknown).catch(() => null);
        if (existingByNumber && typeof existingByNumber === "object") {
          const existing = existingByNumber as { id: string; localId?: string | null };
          if (existing.localId !== localId) {
            pilotOk(res, {
              localId,
              remoteId: null,
              syncStatus: "conflict",
              conflictReason: `RO number "${roNumber}" already exists in backend for a different local record.`,
            });
            return;
          }
          pilotOk(res, { localId, remoteId: existing.id, syncStatus: "synced", warning: "RO was already synced (idempotency)." });
          return;
        }
      }

      // Map roNumber → repairOrderNumber for Prisma
      const roInput: Record<string, unknown> = {
        ...body,
        localId,
        repairOrderNumber: roNumber,
      };

      const createResult = await repairOrdersRepository.create(roInput);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/repair-orders\/(?<id>[^/]+)$/,
    description: "Write pilot: update repair order by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("repairOrder", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend repair order found with localId=${localId}. Run create pilot first.` });
        return;
      }

      // Do not expose cost/margin fields in update
      const safeBody = { ...body };
      delete safeBody.unitCost;
      delete safeBody.costTotal;
      delete safeBody.margin;
      delete safeBody.profit;

      const updateResult = await repairOrdersRepository.update(remoteId, safeBody);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Inspections ────────────────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/inspections$/,
    description: "Write pilot: create inspection (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const inspectionNumber = typeof body.inspectionNumber === "string" ? body.inspectionNumber.trim() : "";
      if (inspectionNumber) {
        const client = await getPrismaClient();
        const delegate = client ? (client as Record<string, unknown>).inspection as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
        if (delegate?.findUnique) {
          const existing = await delegate.findUnique({ where: { inspectionNumber }, select: { id: true, localId: true } } as unknown).catch(() => null);
          if (existing && typeof existing === "object") {
            const rec = existing as { id: string; localId?: string | null };
            if (rec.localId !== localId) {
              pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: `Inspection number "${inspectionNumber}" already exists for a different local record.` });
              return;
            }
            pilotOk(res, { localId, remoteId: rec.id, syncStatus: "synced", warning: "Inspection already synced (idempotency)." });
            return;
          }
        }
      }

      const prepared = await prepareInspectionInputForPersistence({ ...body, localId });
      const createResult = await inspectionsRepository.create(prepared);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/inspections\/(?<id>[^/]+)$/,
    description: "Write pilot: update inspection by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("inspection", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend inspection found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const prepared = await prepareInspectionInputForPersistence(body);
      const updateResult = await inspectionsRepository.update(remoteId, prepared);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── QC Records ─────────────────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/qc$/,
    description: "Write pilot: create QC record (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const qcNumber = typeof body.qcNumber === "string" ? body.qcNumber.trim() : "";
      if (qcNumber) {
        const client = await getPrismaClient();
        const delegate = client ? (client as Record<string, unknown>).qcRecord as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
        if (delegate?.findUnique) {
          const existing = await delegate.findUnique({ where: { qcNumber }, select: { id: true, localId: true } } as unknown).catch(() => null);
          if (existing && typeof existing === "object") {
            const rec = existing as { id: string; localId?: string | null };
            if (rec.localId !== localId) {
              pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: `QC number "${qcNumber}" already exists for a different local record.` });
              return;
            }
            pilotOk(res, { localId, remoteId: rec.id, syncStatus: "synced", warning: "QC record already synced (idempotency)." });
            return;
          }
        }
      }

      const prepared = await prepareQcRecordInputForPersistence({ ...body, localId });
      const createResult = await qcRecordsRepository.create(prepared);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/qc\/(?<id>[^/]+)$/,
    description: "Write pilot: update QC record by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("qcRecord", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend QC record found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const prepared = await prepareQcRecordInputForPersistence(body);
      const updateResult = await qcRecordsRepository.update(remoteId, prepared);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Release Records ────────────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/releases$/,
    description: "Write pilot: create release record (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const releaseNumber = typeof body.releaseNumber === "string" ? body.releaseNumber.trim() : "";
      if (releaseNumber) {
        const client = await getPrismaClient();
        const delegate = client ? (client as Record<string, unknown>).releaseRecord as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
        if (delegate?.findUnique) {
          const existing = await delegate.findUnique({ where: { releaseNumber }, select: { id: true, localId: true } } as unknown).catch(() => null);
          if (existing && typeof existing === "object") {
            const rec = existing as { id: string; localId?: string | null };
            if (rec.localId !== localId) {
              pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: `Release number "${releaseNumber}" already exists for a different local record.` });
              return;
            }
            pilotOk(res, { localId, remoteId: rec.id, syncStatus: "synced", warning: "Release record already synced (idempotency)." });
            return;
          }
        }
      }

      const prepared = await prepareReleaseRecordInputForPersistence({ ...body, localId });
      const createResult = await releaseRecordsRepository.create(prepared);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/releases\/(?<id>[^/]+)$/,
    description: "Write pilot: update release record by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("releaseRecord", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend release record found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const prepared = await prepareReleaseRecordInputForPersistence(body);
      const updateResult = await releaseRecordsRepository.update(remoteId, prepared);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Backjob Records ────────────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/backjobs$/,
    description: "Write pilot: create backjob record (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const backjobNumber = typeof body.backjobNumber === "string" ? body.backjobNumber.trim() : "";
      if (backjobNumber) {
        const client = await getPrismaClient();
        const delegate = client ? (client as Record<string, unknown>).backjobRecord as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
        if (delegate?.findUnique) {
          const existing = await delegate.findUnique({ where: { backjobNumber }, select: { id: true, localId: true } } as unknown).catch(() => null);
          if (existing && typeof existing === "object") {
            const rec = existing as { id: string; localId?: string | null };
            if (rec.localId !== localId) {
              pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: `Backjob number "${backjobNumber}" already exists for a different local record.` });
              return;
            }
            pilotOk(res, { localId, remoteId: rec.id, syncStatus: "synced", warning: "Backjob record already synced (idempotency)." });
            return;
          }
        }
      }

      const prepared = await prepareBackjobRecordInputForPersistence({ ...body, localId });
      const createResult = await backjobRecordsRepository.create(prepared);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/backjobs\/(?<id>[^/]+)$/,
    description: "Write pilot: update backjob record by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("backjobRecord", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend backjob record found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const prepared = await prepareBackjobRecordInputForPersistence(body);
      const updateResult = await backjobRecordsRepository.update(remoteId, prepared);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Service History ────────────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/service-history$/,
    description: "Write pilot: create service history record (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const prepared = await prepareServiceHistoryInputForPersistence({ ...body, localId });
      const createResult = await serviceHistoryRepository.create(prepared);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/service-history\/(?<id>[^/]+)$/,
    description: "Write pilot: update service history record by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("serviceHistoryRecord", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend service history record found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const prepared = await prepareServiceHistoryInputForPersistence(body);
      const updateResult = await serviceHistoryRepository.update(remoteId, prepared);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Parts Requests (Phase 235) ─────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/parts-requests$/,
    description: "Write pilot: create parts request (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const quantity = typeof body.quantity === "number" ? body.quantity : null;
      if (quantity !== null && quantity <= 0) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: "quantity must be a positive integer." });
        return;
      }

      const requestNumber = typeof body.requestNumber === "string" ? body.requestNumber.trim() : "";
      if (requestNumber) {
        const client = await getPrismaClient();
        const delegate = client ? (client as Record<string, unknown>).partsRequest as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
        if (delegate?.findUnique) {
          const existing = await delegate.findUnique({ where: { requestNumber }, select: { id: true, localId: true } } as unknown).catch(() => null);
          if (existing && typeof existing === "object") {
            const rec = existing as { id: string; localId?: string | null };
            if (rec.localId !== localId) {
              pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: `Parts request number "${requestNumber}" already exists for a different local record.` });
              return;
            }
            pilotOk(res, { localId, remoteId: rec.id, syncStatus: "synced", warning: "Parts request already synced (idempotency)." });
            return;
          }
        }
      }

      // Strip competitor bid data — never write bids to backend
      const safeBody: Record<string, unknown> = { ...body, localId };
      delete safeBody.bids;
      delete safeBody.selectedBidId;

      const createResult = await partsRequestsRepository.create(safeBody);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/parts-requests\/(?<id>[^/]+)$/,
    description: "Write pilot: update parts request by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("partsRequest", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend parts request found with localId=${localId}. Run create pilot first.` });
        return;
      }

      // Strip competitor bid data
      const safeBody = { ...body };
      delete safeBody.bids;
      delete safeBody.selectedBidId;

      const updateResult = await partsRequestsRepository.update(remoteId, safeBody);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Inventory Items (Phase 236) ────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/inventory$/,
    description: "Write pilot: create inventory item (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const quantityOnHand = typeof body.quantityOnHand === "number" ? body.quantityOnHand : null;
      if (quantityOnHand !== null && quantityOnHand < 0) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: "quantityOnHand cannot be negative on create. Use inventory movement route to adjust stock." });
        return;
      }

      // Informational duplicate SKU check (not a hard unique constraint in DB)
      const sku = typeof body.sku === "string" ? body.sku.trim() : "";
      if (sku) {
        const client = await getPrismaClient();
        const delegate = client ? (client as Record<string, unknown>).inventoryItem as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
        if (delegate?.findFirst) {
          const existing = await (delegate.findFirst as (...args: unknown[]) => Promise<unknown>)({ where: { sku, NOT: { localId } }, select: { id: true, localId: true } } as unknown).catch(() => null);
          if (existing && typeof existing === "object") {
            pilotOk(res, {
              localId,
              remoteId: null,
              syncStatus: "conflict",
              conflictReason: `SKU "${sku}" already exists in backend for a different item. Review before creating a duplicate.`,
            });
            return;
          }
        }
      }

      // Strip internal cost fields
      const safeBody: Record<string, unknown> = { ...body, localId };
      delete safeBody.unitCost;
      delete safeBody.sellingPrice;

      const createResult = await inventoryItemsRepository.create(safeBody);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/inventory\/(?<id>[^/]+)$/,
    description: "Write pilot: update inventory item by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("inventoryItem", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend inventory item found with localId=${localId}. Run create pilot first.` });
        return;
      }

      // Strip internal cost fields
      const safeBody = { ...body };
      delete safeBody.unitCost;
      delete safeBody.sellingPrice;

      const updateResult = await inventoryItemsRepository.update(remoteId, safeBody);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  {
    method: "POST",
    pattern: /^\/api\/pilot\/inventory\/(?<id>[^/]+)\/movements$/,
    description: "Write pilot: create inventory movement (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const itemLocalId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;
      const movementLocalId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(movementLocalId));
        return;
      }

      if (!itemLocalId) {
        pilotOk(res, { localId: movementLocalId, remoteId: null, syncStatus: "failed", warning: "Inventory item localId path param is required." });
        return;
      }

      if (!movementLocalId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const movementType = typeof body.movementType === "string" ? body.movementType.trim() : "";
      if (!movementType) {
        pilotOk(res, { localId: movementLocalId, remoteId: null, syncStatus: "failed", warning: "movementType is required." });
        return;
      }

      const quantity = typeof body.quantity === "number" ? body.quantity : 0;
      if (quantity === 0) {
        pilotOk(res, { localId: movementLocalId, remoteId: null, syncStatus: "failed", warning: "Movement quantity cannot be zero." });
        return;
      }

      const itemRemoteId = await findPrismaIdByLocalId("inventoryItem", itemLocalId);
      if (!itemRemoteId) {
        pilotOk(res, { localId: movementLocalId, remoteId: null, syncStatus: "failed", warning: `No backend inventory item found with localId=${itemLocalId}. Run inventory create pilot first.` });
        return;
      }

      const movementInput = buildInventoryMovementInput({ ...body, localId: movementLocalId }, itemRemoteId);
      const createResult = await inventoryMovementsRepository.create(movementInput);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId: movementLocalId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend movement with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId: movementLocalId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId: movementLocalId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  // ── Purchase Orders (Phase 237) ────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/purchase-orders$/,
    description: "Write pilot: create purchase order (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const poNumber = typeof body.poNumber === "string" ? body.poNumber.trim() : "";
      if (poNumber) {
        const client = await getPrismaClient();
        const delegate = client ? (client as Record<string, unknown>).purchaseOrder as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
        if (delegate?.findUnique) {
          const existing = await delegate.findUnique({ where: { poNumber }, select: { id: true, localId: true } } as unknown).catch(() => null);
          if (existing && typeof existing === "object") {
            const rec = existing as { id: string; localId?: string | null };
            if (rec.localId !== localId) {
              pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: `PO number "${poNumber}" already exists for a different local record.` });
              return;
            }
            pilotOk(res, { localId, remoteId: rec.id, syncStatus: "synced", warning: "Purchase order already synced (idempotency)." });
            return;
          }
        }
      }

      // Strip internal cost field
      const safeBody: Record<string, unknown> = { ...body, localId };
      delete safeBody.totalCost;
      delete safeBody.cost;

      const createResult = await purchaseOrdersRepository.create(safeBody);
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/purchase-orders\/(?<id>[^/]+)$/,
    description: "Write pilot: update purchase order by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("purchaseOrder", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend purchase order found with localId=${localId}. Run create pilot first.` });
        return;
      }

      // Strip internal cost field
      const safeBody = { ...body };
      delete safeBody.totalCost;
      delete safeBody.cost;

      const updateResult = await purchaseOrdersRepository.update(remoteId, safeBody);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Suppliers (Phase 237) ──────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/suppliers$/,
    description: "Write pilot: create supplier (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const supplierName = typeof body.supplierName === "string" ? body.supplierName.trim() : "";
      if (!supplierName) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: "supplierName is required for supplier write pilot." });
        return;
      }

      // Informational duplicate name check (supplierName is not @unique in schema)
      const client = await getPrismaClient();
      const delegate = client ? (client as Record<string, unknown>).supplier as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
      if (delegate?.findFirst) {
        const existing = await (delegate.findFirst as (...args: unknown[]) => Promise<unknown>)({
          where: { supplierName: { equals: supplierName, mode: "insensitive" }, NOT: { localId } },
          select: { id: true, localId: true },
        } as unknown).catch(() => null);
        if (existing && typeof existing === "object") {
          pilotOk(res, {
            localId,
            remoteId: null,
            syncStatus: "conflict",
            conflictReason: `Supplier name "${supplierName}" already exists in backend for a different record. Review before creating a duplicate.`,
          });
          return;
        }
      }

      const createResult = await suppliersRepository.create({ ...body, localId });
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/suppliers\/(?<id>[^/]+)$/,
    description: "Write pilot: update supplier by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("supplier", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend supplier found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const updateResult = await suppliersRepository.update(remoteId, body);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Supplier Bids — placeholder (Phase 237) ───────────────────────────────
  // No separate SupplierBid model in Prisma schema. Bids are stored as JSON in
  // PartsRequest.bids. These routes are stubs that return skipped_locked to
  // satisfy the frontend API contract without writing bid data to the backend.

  {
    method: "POST",
    pattern: /^\/api\/pilot\/supplier-bids$/,
    description: "Write pilot: supplier bid stub — no separate model (always skipped)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);
      pilotOk(res, {
        localId,
        remoteId: null,
        syncStatus: "skipped_locked",
        warning: "Supplier bids are stored as JSON in parts requests. No separate backend model exists. Bid data is not written to the backend to protect competitor privacy.",
      });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/supplier-bids\/(?<id>[^/]+)$/,
    description: "Write pilot: supplier bid stub — no separate model (always skipped)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      pilotOk(res, {
        localId,
        remoteId: null,
        syncStatus: "skipped_locked",
        warning: "Supplier bids are stored as JSON in parts requests. No separate backend model exists.",
      });
    },
  },

  // ── Payments (Phase 238) ───────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/payments$/,
    description: "Write pilot: create payment (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: "Payment amount must be a positive number." });
        return;
      }

      const createResult = await paymentsRepository.create({ ...body, localId });
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/payments\/(?<id>[^/]+)$/,
    description: "Write pilot: update payment by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("payment", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend payment found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const updateResult = await paymentsRepository.update(remoteId, body);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Expenses (Phase 238) ───────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/expenses$/,
    description: "Write pilot: create expense (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: "Expense amount must be a positive number." });
        return;
      }

      const createResult = await expensesRepository.create({ ...body, localId });
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/expenses\/(?<id>[^/]+)$/,
    description: "Write pilot: update expense by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("expense", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend expense found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const updateResult = await expensesRepository.update(remoteId, body);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // ── Invoices (Phase 238) ───────────────────────────────────────────────────

  {
    method: "POST",
    pattern: /^\/api\/pilot\/invoices$/,
    description: "Write pilot: create invoice (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for write pilot." });
        return;
      }

      const total = typeof body.total === "number" ? body.total : Number(body.total);
      if (Number.isNaN(total) || total < 0) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: "Invoice total must be a non-negative number." });
        return;
      }

      const invoiceNumber = typeof body.invoiceNumber === "string" ? body.invoiceNumber.trim() : "";
      if (invoiceNumber) {
        const client = await getPrismaClient();
        const delegate = client ? (client as Record<string, unknown>).invoice as Record<string, (...args: unknown[]) => Promise<unknown>> | undefined : undefined;
        if (delegate?.findUnique) {
          const existing = await delegate.findUnique({ where: { invoiceNumber }, select: { id: true, localId: true } } as unknown).catch(() => null);
          if (existing && typeof existing === "object") {
            const rec = existing as { id: string; localId?: string | null };
            if (rec.localId !== localId) {
              pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: `Invoice number "${invoiceNumber}" already exists for a different local record.` });
              return;
            }
            pilotOk(res, { localId, remoteId: rec.id, syncStatus: "synced", warning: "Invoice already synced (idempotency)." });
            return;
          }
        }
      }

      const createResult = await invoicesRepository.create({ ...body, localId });
      if (!createResult.success) {
        const isLocalIdConflict = /unique|localId/i.test(createResult.error ?? "");
        if (isLocalIdConflict) {
          pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "A backend record with this localId already exists (idempotency guard)." });
          return;
        }
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },

  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/invoices\/(?<id>[^/]+)$/,
    description: "Write pilot: update invoice by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("invoice", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend invoice found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const updateResult = await invoicesRepository.update(remoteId, body);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },

  // Documents / file metadata
  {
    method: "POST",
    pattern: /^\/api\/pilot\/documents$/,
    description: "Write pilot: create document metadata (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const body = context.body as Record<string, unknown>;
      const localId = extractLocalId(body);

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId is required for document metadata write pilot." });
        return;
      }

      const validation = validateDocumentPilotPayload(body);
      if (validation) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: validation });
        return;
      }

      const existingRemoteId = await findPrismaIdByLocalId("documentAttachment", localId);
      if (existingRemoteId) {
        pilotOk(res, { localId, remoteId: existingRemoteId, syncStatus: "conflict", conflictReason: "A backend document already exists with this localId. Update instead of creating a duplicate." });
        return;
      }

      const hasFileMetadata = Boolean(text(body, "fileId") || text(body, "storageKey"));
      const hasFileName = Boolean(text(body, "fileName") || text(body, "title"));
      if (hasFileMetadata && !hasFileName) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: "File reference exists but document metadata is incomplete." });
        return;
      }

      const createResult = await documentsRepository.create({
        ...body,
        localId,
        customerVisible: body.customerVisible === true,
        internalOnly: body.customerVisible === true ? false : true,
      });
      if (!createResult.success) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: createResult.error ?? "Backend document metadata create failed." });
        return;
      }

      const dto = createResult.data as { id: string };
      pilotOk(res, { localId, remoteId: dto.id, syncStatus: "synced" });
    },
  },
  {
    method: "PATCH",
    pattern: /^\/api\/pilot\/documents\/(?<id>[^/]+)$/,
    description: "Write pilot: update document metadata by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");
      const body = context.body as Record<string, unknown>;

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      if (!localId) {
        pilotOk(res, { localId: "", remoteId: null, syncStatus: "failed", warning: "localId path param is required." });
        return;
      }

      const validation = validateDocumentPilotPayload({ localId, fileName: "existing-document", sourceModule: "Existing", ...body });
      if (validation) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "conflict", conflictReason: validation });
        return;
      }

      const remoteId = await findPrismaIdByLocalId("documentAttachment", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend document found with localId=${localId}. Run create pilot first.` });
        return;
      }

      const updateResult = await documentsRepository.update(remoteId, body.customerVisible === true ? { ...body, internalOnly: false } : body);
      if (!updateResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: updateResult.error ?? "Backend document update failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced" });
    },
  },
  {
    method: "DELETE",
    pattern: /^\/api\/pilot\/documents\/(?<id>[^/]+)$/,
    description: "Write pilot: delete document metadata by localId (requires WRITE_PILOT_ENABLED=true)",
    handler: async (_req, res, context) => {
      const localId = decodeURIComponent(context.params.id?.trim() ?? "");

      if (!WRITE_PILOT_ENABLED) {
        pilotOk(res, lockedData(localId));
        return;
      }

      const remoteId = await findPrismaIdByLocalId("documentAttachment", localId);
      if (!remoteId) {
        pilotOk(res, { localId, remoteId: null, syncStatus: "failed", warning: `No backend document found with localId=${localId}.` });
        return;
      }

      const deleteResult = await documentsRepository.remove(remoteId);
      if (!deleteResult.success) {
        pilotOk(res, { localId, remoteId, syncStatus: "failed", warning: deleteResult.error ?? "Backend document metadata delete failed." });
        return;
      }

      pilotOk(res, { localId, remoteId, syncStatus: "synced", warning: "Backend document metadata was deleted; localStorage document center remains unchanged." });
    },
  },
];
