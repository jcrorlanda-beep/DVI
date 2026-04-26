import { protectRoutes } from "../middleware/auth.js";
import { getRequestUser } from "../middleware/auth.js";
import { buildCoreImportCommitResponse } from "../migration/coreCommit.js";
import { buildCoreMigrationPreview } from "../migration/corePreview.js";
import { buildCustomerVehicleImportPreview } from "../migration/customerVehiclePreview.js";
import { buildFullMigrationImportPreview } from "../migration/fullPreview.js";
import { buildBusinessMigrationImportPreview } from "../migration/businessPreview.js";
import { buildPartsInventoryImportPreview } from "../migration/partsInventoryPreview.js";
import { buildWorkflowImportPreview } from "../migration/workflowPreview.js";
import { buildWorkflowExtendedPreview } from "../migration/workflowExtendedPreview.js";
import { sendJson } from "../response.js";
import type { ApiRoute } from "./types.js";

const routes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/migration\/core\/import-preview$/,
    description: "Core customer/vehicle/intake/RO import preview route",
    handler: (_req, res, context) => {
      const previewInput = context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>) : {};
      sendJson(res, 202, {
        success: true,
        data: {
          previewId: `core_preview_${Date.now()}`,
          corePreview: buildCoreMigrationPreview(previewInput),
          canCommit: false,
          warnings: ["Core preview only. No database writes or localStorage deletes were performed."],
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/migration\/core\/import-commit$/,
    description: "Core customer/vehicle/intake/RO import commit route disabled by default",
    handler: async (req, res, context) => {
      const user = await getRequestUser(req);
      const input = context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>) : {};
      const result = buildCoreImportCommitResponse(input, user?.id);
      sendJson(res, result.status, {
        success: result.status < 400,
        ...(result.status >= 400 ? { error: result.body.warning } : {}),
        data: result.body,
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      } as any);
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/migration\/business\/import-preview$/,
    description: "Business modules import preview route",
    handler: (_req, res, context) => {
      const previewInput = context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>) : {};
      sendJson(res, 202, {
        success: true,
        data: {
          previewId: `business_preview_${Date.now()}`,
          businessPreview: buildBusinessMigrationImportPreview(previewInput),
          canCommit: false,
          warnings: ["Business preview only. No database writes or localStorage deletes were performed."],
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/migration\/import-preview$/,
    description: "Future localStorage import preview route",
    handler: (_req, res, context) => {
      const previewInput = context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>) : {};
      const modules =
        context.body && typeof context.body === "object" && Array.isArray((context.body as Record<string, unknown>).modules)
          ? ((context.body as Record<string, unknown>).modules as Array<Record<string, unknown>>)
          : [];
      sendJson(res, 202, {
        success: true,
        data: {
          previewId: `preview_${Date.now()}`,
          customerVehiclePreview: buildCustomerVehicleImportPreview(previewInput),
          workflowPreview: buildWorkflowImportPreview(previewInput),
          workflowExtendedPreview: buildWorkflowExtendedPreview(previewInput),
          businessPreview: buildBusinessMigrationImportPreview(previewInput),
          partsInventoryPreview: buildPartsInventoryImportPreview(previewInput),
          fullPreview: buildFullMigrationImportPreview(previewInput),
          modules: modules.map((module) => ({
            moduleKey: String(module.moduleKey ?? "unknown"),
            tableName: String(module.tableName ?? "unknown"),
            recordCount: Array.isArray(module.records) ? module.records.length : 0,
            warnings: ["Preview only. No data was imported."],
          })),
          canCommit: false,
          warnings: ["Import preview is a contract placeholder. Commit is disabled until migration validation is implemented."],
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/migration\/import-commit$/,
    description: "Future localStorage import commit route",
    handler: (_req, res, context) => {
      const enabled = process.env.MIGRATION_COMMIT_ENABLED === "true";
      const batchId =
        context.body && typeof context.body === "object" && typeof (context.body as Record<string, unknown>).batchId === "string"
          ? (context.body as Record<string, unknown>).batchId
          : `disabled_batch_${Date.now()}`;

      sendJson(res, 202, {
        success: true,
        data: {
          batchId,
          enabled,
          committed: false,
          importedCount: 0,
          localToRemoteMap: {},
          dryRunRequired: true,
          mappingStrategy: {
            localId: "Preserve source localStorage ID for traceability.",
            remoteId: "Generated by database only during a future enabled commit.",
            importedAt: "Recorded per import batch when commit is implemented.",
            importedBy: "Backend authenticated user ID when production auth is enabled.",
          },
          rollbackNotes: [
            "Commit remains disabled unless MIGRATION_COMMIT_ENABLED=true.",
            "Future commits should write an import batch record before record writes.",
            "Rollback should use the import batch mapping and never delete localStorage automatically.",
          ],
          warning: enabled
            ? "Import commit contract is unlocked by env flag, but implementation is still disabled to avoid destructive writes."
            : "Import commit is disabled. Use preview, validate counts, and confirm mapping before enabling this endpoint.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/migration\/workflow\/import-preview$/,
    description: "Workflow inspection/QC/release/backjob/service-history import preview route",
    handler: (_req, res, context) => {
      const previewInput = context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>) : {};
      sendJson(res, 202, {
        success: true,
        data: {
          previewId: `workflow_preview_${Date.now()}`,
          workflowPreview: buildWorkflowExtendedPreview(previewInput),
          canCommit: false,
          warnings: ["Workflow preview only. No database writes or localStorage deletes were performed."],
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];

export const migrationRoutes = protectRoutes(routes, "backup.restore");
