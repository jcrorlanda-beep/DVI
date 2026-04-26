import { buildCoreMigrationPreview } from "./corePreview.js";
import type { CustomerVehiclePreviewInput } from "./customerVehiclePreview.js";
import type { WorkflowPreviewInput } from "./workflowPreview.js";

type CoreCommitInput = CustomerVehiclePreviewInput & WorkflowPreviewInput & {
  batchId?: string;
  dryRun?: boolean;
};

export function buildCoreImportCommitResponse(input: CoreCommitInput, userId?: string) {
  const enabled = process.env.MIGRATION_COMMIT_ENABLED === "true";
  const dryRun = input.dryRun !== false;
  const batchId = typeof input.batchId === "string" && input.batchId.trim() ? input.batchId.trim() : `core_batch_${Date.now()}`;
  const preview = buildCoreMigrationPreview(input);
  const importedAt = new Date().toISOString();

  if (!enabled) {
    return {
      status: 202,
      body: {
        batchId,
        enabled: false,
        committed: false,
        dryRunRequired: true,
        importedAt,
        importedBy: userId ?? null,
        localToRemoteMap: {},
        preview,
        warning: "Core import commit is disabled. Set MIGRATION_COMMIT_ENABLED=true only after backup, preview review, and operator approval.",
      },
    };
  }

  if (dryRun) {
    return {
      status: 202,
      body: {
        batchId,
        enabled: true,
        committed: false,
        dryRunRequired: true,
        importedAt,
        importedBy: userId ?? null,
        localToRemoteMap: {},
        preview,
        warning: "Dry-run requirement is active. Submit dryRun=false only after reviewing this preview.",
      },
    };
  }

  if (preview.recordsNeedingReview > 0) {
    return {
      status: 409,
      body: {
        batchId,
        enabled: true,
        committed: false,
        dryRunRequired: false,
        importedAt,
        importedBy: userId ?? null,
        localToRemoteMap: {},
        preview,
        warning: "Core import was blocked because duplicate, missing-link, or invalid-status warnings require review.",
      },
    };
  }

  return {
    status: 202,
    body: {
      batchId,
      enabled: true,
      committed: false,
      dryRunRequired: false,
      importedAt,
      importedBy: userId ?? null,
      localToRemoteMap: {},
      preview,
      warning: "Core import commit passed preview checks, but record creation remains intentionally disabled until an operator-tested migration writer is added.",
    },
  };
}
