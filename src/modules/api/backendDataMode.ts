export type AppDataMode = "localStorage" | "backendReadOnly" | "backendWritePilot" | "backendFull";

export const APP_DATA_MODE_STORAGE_KEY = "dvi_app_data_mode_v1";

const VALID_DATA_MODES = new Set<AppDataMode>(["localStorage", "backendReadOnly", "backendWritePilot", "backendFull"]);

function normalizeDataMode(value: unknown): AppDataMode {
  return typeof value === "string" && VALID_DATA_MODES.has(value as AppDataMode) ? (value as AppDataMode) : "localStorage";
}

export function getCurrentDataMode(storage: Storage | undefined = typeof window !== "undefined" ? window.localStorage : undefined): AppDataMode {
  const envMode = normalizeDataMode(String(import.meta.env.VITE_DVI_DATA_MODE ?? ""));
  if (envMode !== "localStorage") return envMode;
  return normalizeDataMode(storage?.getItem(APP_DATA_MODE_STORAGE_KEY));
}

export function isBackendReadEnabled(mode: AppDataMode = getCurrentDataMode()): boolean {
  return mode === "backendReadOnly" || mode === "backendWritePilot" || mode === "backendFull";
}

export function isBackendWriteEnabled(mode: AppDataMode = getCurrentDataMode()): boolean {
  return mode === "backendFull";
}

export function isBackendWritePilotRequested(mode: AppDataMode = getCurrentDataMode()): boolean {
  return mode === "backendWritePilot";
}

export function assertLocalStorageDefault(mode: AppDataMode = getCurrentDataMode()): true {
  if (mode !== "localStorage") {
    throw new Error("Backend data modes are guarded. LocalStorage must remain the default until cutover.");
  }
  return true;
}

export function getDataModeLabel(mode: AppDataMode) {
  switch (mode) {
    case "backendReadOnly":
      return "Backend read-only pilot";
    case "backendWritePilot":
      return "Backend write pilot requested (locked)";
    case "backendFull":
      return "Backend full mode requested (locked)";
    case "localStorage":
    default:
      return "LocalStorage-first";
  }
}
