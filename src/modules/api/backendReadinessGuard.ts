import type { BackendHealthResponse } from "./apiTypes";
import type { AppDataMode } from "./backendDataMode";

export type BackendReadinessStatus = "ready" | "warning" | "blocked";

export type BackendReadinessInput = {
  dataMode: AppDataMode;
  health?: BackendHealthResponse | null;
  healthOnline: boolean;
  migrationPreviewCompleted?: boolean;
  migrationCommitEnabled?: boolean;
  fileStoragePlanned?: boolean;
  aiProxyRelevant?: boolean;
  smsProxyRelevant?: boolean;
};

export type BackendReadinessResult = {
  status: BackendReadinessStatus;
  reasons: string[];
};

function add(condition: boolean, reasons: string[], reason: string) {
  if (condition) reasons.push(reason);
}

export function evaluateBackendReadiness(input: BackendReadinessInput): BackendReadinessResult {
  const blocked: string[] = [];
  const warnings: string[] = [];
  const health = input.health;
  const backendModeRequested = input.dataMode !== "localStorage";

  add(backendModeRequested && !input.healthOnline, blocked, "backend offline");
  add(backendModeRequested && health?.databaseConnected !== true, blocked, "database unavailable");
  add(backendModeRequested && (health?.productionReadiness?.errorCount ?? 0) > 0, blocked, "production env validation errors");
  add(backendModeRequested && input.migrationPreviewCompleted !== true, blocked, "migration preview required");
  add(input.migrationCommitEnabled === true, blocked, "migration commit unexpectedly enabled");
  add(input.dataMode === "backendWritePilot" || input.dataMode === "backendFull", blocked, "data source switch locked");

  add(backendModeRequested && (health?.productionReadiness?.warningCount ?? 0) > 0, warnings, "production env warnings");
  add(input.fileStoragePlanned === true && health?.fileStorageConfigured !== true, warnings, "file storage not confirmed");
  add(input.aiProxyRelevant === true && health?.proxyStatus?.aiProxyEnabled !== true, warnings, "AI proxy disabled");
  add(input.smsProxyRelevant === true && health?.proxyStatus?.smsProxyEnabled !== true, warnings, "SMS proxy disabled/simulated");
  add(backendModeRequested && !health?.productionReadiness, warnings, "auth/readiness status not fully reported");

  if (blocked.length) return { status: "blocked", reasons: blocked };
  if (warnings.length) return { status: "warning", reasons: warnings };
  return { status: "ready", reasons: backendModeRequested ? ["backend read-only diagnostics may run"] : ["localStorage default is active"] };
}
