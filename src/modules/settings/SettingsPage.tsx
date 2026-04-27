import React from "react";
import type { SessionUser, UserRole, RoleDefinition, MaintenanceIntervalRuleRecord, ServicePricingCatalogRecord } from "../shared/types";
import type { ThemeMode } from "../theme/themeHelpers";
import { hasPermission } from "../shared/helpers";
import { OPENAI_ASSIST_LOG_STORAGE_KEY, type OpenAiAssistProviderMode, type OpenAiAssistLogEntry } from "../ai/openaiAssist";
import { DEFAULT_AI_MODULE_TOGGLES, getAiModuleLabel, readAiModuleToggles, saveAiModuleToggles, type AiModuleKey, type AiModuleToggleSettings } from "../ai/aiSafety";
import { cleanupInvalidJsonStorage, validateStoredRecords, type DataQualitySummary } from "../dataQuality/dataQualityHelpers";
import { CURRENT_DATA_MIGRATION_VERSION, getDataMigrationReminder, readDataMigrationVersion } from "../dataQuality/migrationHelpers";
import { BACKEND_DATA_MODE_STORAGE_KEY, DVI_API_BASE_URL, backendEnabledByEnv, checkBackendHealth, apiPost } from "../api/apiClient";
import {
  APP_DATA_MODE_STORAGE_KEY,
  getCurrentDataMode,
  getDataModeLabel,
  isBackendReadEnabled,
  isBackendWriteEnabled,
  type AppDataMode,
} from "../api/backendDataMode";
import { evaluateBackendReadiness, type BackendReadinessResult } from "../api/backendReadinessGuard";
import type { BackendHealthResponse } from "../api/apiTypes";
import {
  buildPilotComparison,
  fetchBackendListCount,
  getRoPilotWarnings,
  readLocalArrayCount,
  readLocalRepairOrders,
  readLocalVehicleCount,
  shouldRunReadOnlyPilot,
  type BackendPilotComparison,
} from "../api/backendReadOnlyPilot";
import {
  detectDuplicateCustomers,
  detectDuplicatePlates,
  detectRoNumberConflicts,
  detectUpdatedAfterImport,
  summarizeConflicts,
} from "../api/syncConflictHelpers";
import type { AiBackendMode, BackendDataMode, SmsBackendMode } from "../api/apiTypes";
import {
  canAccessAdvisorTools,
  canAccessFinancialReports,
  canAccessInventoryManagement,
  canAccessSupplierManagement,
  canAccessTechnicianOperations,
} from "../shared/roleAccess";
import {
  clearPilotAttemptLog,
  getPilotAttemptSummary,
  readPilotAttemptLog,
  syncStatusLabel,
  type WritePilotAttemptEntry,
} from "../api/writePilotAttemptLog";

type MigrationPreviewCoreResult = {
  totalRecords: number;
  recordsReady: number;
  recordsNeedingReview: number;
  totalCustomers?: number;
  totalVehicles?: number;
  totalIntakes?: number;
  totalRepairOrders?: number;
  duplicateCustomers?: string[];
  duplicatePlates?: string[];
  duplicateRoNumbers?: string[];
  missingCustomerLinks?: string[];
  missingVehicleLinks?: string[];
  invalidStatuses?: string[];
  canCommit?: boolean;
  warning?: string;
};

type MigrationPreviewBusinessResult = {
  totalRecords: number;
  recordsReady: number;
  recordsNeedingReview: number;
  warning?: string;
};

type MigrationPreviewState = {
  status: "idle" | "running" | "complete" | "backendUnavailable" | "error";
  corePreview?: MigrationPreviewCoreResult | null;
  businessPreview?: MigrationPreviewBusinessResult | null;
  backendUsed?: boolean;
  completedAt?: string;
  errorMessage?: string;
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  Admin: { bg: "#fee2e2", text: "#991b1b" },
  "Service Advisor": { bg: "#dbeafe", text: "#1d4ed8" },
  "Chief Technician": { bg: "#dcfce7", text: "#166534" },
  "Senior Mechanic": { bg: "#fef3c7", text: "#92400e" },
  "General Mechanic": { bg: "#ede9fe", text: "#6d28d9" },
  "Office Staff": { bg: "#cffafe", text: "#155e75" },
  Reception: { bg: "#fae8ff", text: "#86198f" },
  OJT: { bg: "#e5e7eb", text: "#374151" },
};

const SENSITIVE_ACCESS_MAP = [
  {
    module: "Audit Log",
    permission: "audit.view",
    access: (role: UserRole, defs: RoleDefinition[]) => hasPermission(role, defs, "audit.view"),
  },
  {
    module: "Backup / Restore",
    permission: "backup.view",
    access: (role: UserRole, defs: RoleDefinition[]) => hasPermission(role, defs, "backup.view"),
  },
  {
    module: "Excel Export / Import",
    permission: "export.view",
    access: (role: UserRole, defs: RoleDefinition[]) => hasPermission(role, defs, "export.view"),
  },
  {
    module: "Margin / Profit",
    permission: "finance.summary",
    access: (role: UserRole) => canAccessFinancialReports(role),
  },
  {
    module: "Inventory Cost",
    permission: "inventory.manage",
    access: (role: UserRole) => canAccessInventoryManagement(role),
  },
  {
    module: "PO Cost",
    permission: "inventory.manage",
    access: (role: UserRole) => canAccessInventoryManagement(role),
  },
  {
    module: "Supplier Bids",
    permission: "supplier.manage",
    access: (role: UserRole) => canAccessSupplierManagement(role),
  },
  {
    module: "Settings",
    permission: "roles.manage",
    access: (role: UserRole, defs: RoleDefinition[]) => hasPermission(role, defs, "settings.view"),
  },
  {
    module: "Advisor Tools",
    permission: "advisor.tools",
    access: (role: UserRole) => canAccessAdvisorTools(role),
  },
  {
    module: "Technician Ops",
    permission: "technician.ops",
    access: (role: UserRole) => canAccessTechnicianOperations(role),
  },
];

const CUTOVER_CHECKLIST_STORAGE_KEY = "dvi_backend_cutover_checklist_v1";

const CUTOVER_CHECKLIST_ITEMS = [
  { key: "localBackup", label: "Local backup completed" },
  { key: "databaseBackup", label: "Database backup configured" },
  { key: "fileStorageBackup", label: "File storage backup configured" },
  { key: "migrationPreview", label: "Migration preview completed" },
  { key: "duplicateCustomers", label: "Duplicate customers reviewed" },
  { key: "duplicatePlates", label: "Duplicate plates reviewed" },
  { key: "roNumbers", label: "RO numbers verified" },
  { key: "userRoles", label: "User roles reviewed" },
  { key: "backendAuth", label: "Backend auth tested" },
  { key: "backendHealth", label: "Backend health tested" },
  { key: "customerPortal", label: "Customer portal safety checked" },
  { key: "supplierPrivacy", label: "Supplier privacy checked" },
  { key: "aiSmsProxy", label: "AI/SMS proxy settings checked" },
  { key: "rollbackPlan", label: "Rollback plan documented" },
] as const;

type CutoverChecklistKey = (typeof CUTOVER_CHECKLIST_ITEMS)[number]["key"];
type CutoverChecklistState = Record<CutoverChecklistKey, boolean>;

function createEmptyCutoverChecklist(): CutoverChecklistState {
  return CUTOVER_CHECKLIST_ITEMS.reduce((state, item) => ({ ...state, [item.key]: false }), {} as CutoverChecklistState);
}

function readCutoverChecklist(): CutoverChecklistState {
  const fallback = createEmptyCutoverChecklist();
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CUTOVER_CHECKLIST_STORAGE_KEY) ?? "{}") as Partial<CutoverChecklistState>;
    return CUTOVER_CHECKLIST_ITEMS.reduce(
      (state, item) => ({ ...state, [item.key]: Boolean(parsed[item.key]) }),
      fallback
    );
  } catch {
    return fallback;
  }
}

function pilotStatusLabel(comparison: BackendPilotComparison): string {
  if (comparison.status === "idle") return "Not checked";
  if (comparison.status === "unavailable") return "Backend unavailable";
  if (comparison.status === "skipped") return "Skipped (read mode off)";
  if (comparison.backendCount === null) return "Not checked";
  if (comparison.backendCount === comparison.localCount) return "Counts match";
  if (comparison.warnings.some((w) => w.includes("Mismatch") || w.includes("mismatch") || w.includes("Count mismatch"))) return "Mismatch detected";
  if (comparison.warnings.length > 0) return "Needs review";
  return "Mismatch detected";
}

function getCutoverChecklistStatus(checklist: CutoverChecklistState, readiness: BackendReadinessResult): "incomplete" | "ready for pilot" | "blocked" {
  const complete = CUTOVER_CHECKLIST_ITEMS.every((item) => checklist[item.key]);
  if (!complete) return "incomplete";
  return readiness.status === "blocked" ? "blocked" : "ready for pilot";
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      style={{
        ...styles.roleBadge,
        background: ROLE_COLORS[role].bg,
        color: ROLE_COLORS[role].text,
      }}
    >
      {role}
    </span>
  );
}

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{title}</div>
          {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

function SettingsPage({
  currentUser,
  roleDefinitions,
  maintenanceIntervalRules,
  setMaintenanceIntervalRules,
  servicePricingCatalog,
  setServicePricingCatalog,
  onResetDefaults,
  onResetMaintenanceRules,
  onResetIntakes,
  themeMode,
  onToggleTheme,
}: {
  currentUser: SessionUser;
  roleDefinitions: RoleDefinition[];
  maintenanceIntervalRules: MaintenanceIntervalRuleRecord[];
  setMaintenanceIntervalRules: React.Dispatch<React.SetStateAction<MaintenanceIntervalRuleRecord[]>>;
  servicePricingCatalog: ServicePricingCatalogRecord[];
  setServicePricingCatalog: React.Dispatch<React.SetStateAction<ServicePricingCatalogRecord[]>>;
  onResetDefaults: () => void;
  onResetMaintenanceRules: () => void;
  onResetIntakes: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}) {
  const canManageRoles = hasPermission(currentUser.role, roleDefinitions, "roles.manage");
  const canManageMaintenanceRules = hasPermission(currentUser.role, roleDefinitions, "roles.manage");
  const [newRule, setNewRule] = React.useState<MaintenanceIntervalRuleRecord>(() => createEmptyMaintenanceRuleDraft());
  const [newPrice, setNewPrice] = React.useState<ServicePricingCatalogRecord>(() => createEmptyPricingDraft());
  const [openAiAssistProviderMode, setOpenAiAssistProviderMode] = React.useState<OpenAiAssistProviderMode>(() => {
    if (typeof window === "undefined") return "Disabled";
    return window.localStorage.getItem("dvi_openai_assist_provider_mode_v1") === "OpenAI" ? "OpenAI" : "Disabled";
  });
  const [openAiAssistModel, setOpenAiAssistModel] = React.useState(() => {
    if (typeof window === "undefined") return "gpt-4.1-mini";
    return window.localStorage.getItem("dvi_openai_assist_model_v1")?.trim() || "gpt-4.1-mini";
  });
  const [openAiAssistMaxTokens, setOpenAiAssistMaxTokens] = React.useState(() => {
    if (typeof window === "undefined") return 240;
    const stored = Number(window.localStorage.getItem("dvi_openai_assist_max_tokens_v1") || "240");
    return Number.isFinite(stored) && stored > 0 ? stored : 240;
  });
  const [openAiAssistSettingsFeedback, setOpenAiAssistSettingsFeedback] = React.useState("");
  const [isSavingOpenAiAssistSettings, setIsSavingOpenAiAssistSettings] = React.useState(false);
  const [aiBackendMode, setAiBackendMode] = React.useState<AiBackendMode>(() => {
    if (typeof window === "undefined") return "Local/Frontend Hybrid";
    return window.localStorage.getItem("dvi_ai_backend_mode_v1") === "Backend Proxy Future"
      ? "Backend Proxy Future"
      : "Local/Frontend Hybrid";
  });
  const [smsBackendMode, setSmsBackendMode] = React.useState<SmsBackendMode>(() => {
    if (typeof window === "undefined") return "Frontend configured";
    return window.localStorage.getItem("dvi_sms_backend_mode_v1") === "Backend Proxy Future"
      ? "Backend Proxy Future"
      : "Frontend configured";
  });
  const [backendDataMode, setBackendDataMode] = React.useState<BackendDataMode>(() => {
    if (typeof window === "undefined") return "Off / LocalStorage";
    return window.localStorage.getItem(BACKEND_DATA_MODE_STORAGE_KEY) === "Future Backend Enabled"
      ? "Future Backend Enabled"
      : "Off / LocalStorage";
  });
  const [appDataMode, setAppDataMode] = React.useState<AppDataMode>(() => getCurrentDataMode());
  const [aiBackendModeFeedback, setAiBackendModeFeedback] = React.useState("");
  const [isSavingAiBackendMode, setIsSavingAiBackendMode] = React.useState(false);
  const [backendHealthStatus, setBackendHealthStatus] = React.useState<"idle" | "checking" | "online" | "offline">("idle");
  const [backendHealthMessage, setBackendHealthMessage] = React.useState("Not checked yet. Backend remains optional.");
  const [backendDatabaseStatus, setBackendDatabaseStatus] = React.useState("Database status not checked.");
  const [backendProductionReadiness, setBackendProductionReadiness] = React.useState("Production readiness not checked.");
  const [backendProxyReadiness, setBackendProxyReadiness] = React.useState("AI/SMS proxy readiness not checked.");
  const [backendFileStorageStatus, setBackendFileStorageStatus] = React.useState("File storage status not checked.");
  const [backendHealthPayload, setBackendHealthPayload] = React.useState<BackendHealthResponse | null>(null);
  const [customerPilot, setCustomerPilot] = React.useState<BackendPilotComparison>(() => buildPilotComparison(0, null));
  const [vehiclePilot, setVehiclePilot] = React.useState<BackendPilotComparison>(() => buildPilotComparison(0, null));
  const [repairOrderPilot, setRepairOrderPilot] = React.useState<BackendPilotComparison>(() => buildPilotComparison(0, null));
  const [intakePilot, setIntakePilot] = React.useState<BackendPilotComparison>(() => buildPilotComparison(0, null));
  const [inspectionPilot, setInspectionPilot] = React.useState<BackendPilotComparison>(() => buildPilotComparison(0, null));
  const [partsRequestPilot, setPartsRequestPilot] = React.useState<BackendPilotComparison>(() => buildPilotComparison(0, null));
  const [inventoryPilot, setInventoryPilot] = React.useState<BackendPilotComparison>(() => buildPilotComparison(0, null));
  const [paymentPilot, setPaymentPilot] = React.useState<BackendPilotComparison>(() => buildPilotComparison(0, null));
  const [expensePilot, setExpensePilot] = React.useState<BackendPilotComparison>(() => buildPilotComparison(0, null));
  const [isRunningFullPilot, setIsRunningFullPilot] = React.useState(false);
  const [pilotFeedback, setPilotFeedback] = React.useState("Read-only pilot has not run.");
  const [migrationPreview, setMigrationPreview] = React.useState<MigrationPreviewState>({ status: "idle" });
  const [migrationPreviewCompleted, setMigrationPreviewCompleted] = React.useState(false);
  const [cutoverChecklist, setCutoverChecklist] = React.useState<CutoverChecklistState>(() => readCutoverChecklist());
  const [openAiAssistLogs, setOpenAiAssistLogs] = React.useState<OpenAiAssistLogEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(OPENAI_ASSIST_LOG_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as OpenAiAssistLogEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [aiModuleToggles, setAiModuleToggles] = React.useState<AiModuleToggleSettings>(() => readAiModuleToggles());
  const [aiSafetyFeedback, setAiSafetyFeedback] = React.useState("");
  const [isSavingAiSafety, setIsSavingAiSafety] = React.useState(false);
  const [pilotAttemptLog, setPilotAttemptLog] = React.useState<WritePilotAttemptEntry[]>(() => readPilotAttemptLog());
  const dataQualityKeys = React.useMemo(
    () => [
      "dvi_phase2_intake_records_v1",
      "dvi_phase3_inspection_records_v1",
      "dvi_phase4_repair_orders_v1",
      "dvi_phase6_qc_records_v1",
      "dvi_phase7_release_records_v1",
      "dvi_phase8_parts_requests_v1",
      "dvi_phase9_backjob_records_v1",
      "dvi_vehicle_service_history_records_v1",
      "dvi_service_pricing_catalog_v1",
    ],
    []
  );
  const [dataQualitySummary, setDataQualitySummary] = React.useState<DataQualitySummary>(() => validateStoredRecords(dataQualityKeys));
  const [dataQualityFeedback, setDataQualityFeedback] = React.useState("");
  const openAiApiKeyConfigured = !!String(import.meta.env.VITE_OPENAI_API_KEY ?? "").trim();
  const migrationVersion = React.useMemo(() => readDataMigrationVersion(), []);

  const updateRule = (ruleId: string, patch: Partial<MaintenanceIntervalRuleRecord>) => {
    setMaintenanceIntervalRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : rule
      )
    );
  };

  const addRule = () => {
    const now = new Date().toISOString();
    const rule: MaintenanceIntervalRuleRecord = {
      ...newRule,
      id: `rule_${Math.random().toString(36).slice(2, 10)}`,
      createdAt: now,
      updatedAt: now,
    };
    setMaintenanceIntervalRules((prev) => [...prev, rule]);
    setNewRule(createEmptyMaintenanceRuleDraft());
  };

  const updatePrice = (priceId: string, patch: Partial<ServicePricingCatalogRecord>) => {
    setServicePricingCatalog((prev) =>
      prev.map((price) => (price.id === priceId ? { ...price, ...patch, updatedAt: new Date().toISOString() } : price))
    );
  };

  const addPrice = () => {
    const now = new Date().toISOString();
    setServicePricingCatalog((prev) => [
      ...prev,
      { ...newPrice, id: `price_${Math.random().toString(36).slice(2, 10)}`, createdAt: now, updatedAt: now },
    ]);
    setNewPrice(createEmptyPricingDraft());
  };

  const onSaveOpenAiAssistSettings = () => {
    if (isSavingOpenAiAssistSettings) return;
    setIsSavingOpenAiAssistSettings(true);
    try {
      if (typeof window === "undefined") {
        setOpenAiAssistSettingsFeedback("OpenAI AI Assist settings cannot be saved in this environment.");
        return;
      }
      window.localStorage.setItem("dvi_openai_assist_provider_mode_v1", openAiAssistProviderMode);
      window.localStorage.setItem("dvi_openai_assist_model_v1", openAiAssistModel.trim());
      window.localStorage.setItem("dvi_openai_assist_max_tokens_v1", String(Math.max(32, Math.min(4000, Math.round(openAiAssistMaxTokens || 240)))));
      setOpenAiAssistSettingsFeedback(
        openAiAssistProviderMode === "OpenAI"
          ? "OpenAI AI Assist settings saved."
          : "OpenAI AI Assist disabled."
      );
    } catch {
      setOpenAiAssistSettingsFeedback("OpenAI AI Assist settings could not be saved in this browser.");
    } finally {
      setIsSavingOpenAiAssistSettings(false);
    }
  };

  const onSaveAiSafetyControls = () => {
    if (isSavingAiSafety) return;
    setIsSavingAiSafety(true);
    try {
      saveAiModuleToggles(aiModuleToggles);
      setAiSafetyFeedback("AI safety controls saved.");
    } catch {
      setAiSafetyFeedback("AI safety controls could not be saved in this browser.");
    } finally {
      setIsSavingAiSafety(false);
    }
  };

  const onSaveAiBackendMode = () => {
    if (isSavingAiBackendMode) return;
    setIsSavingAiBackendMode(true);
    try {
      if (typeof window === "undefined") {
        setAiBackendModeFeedback("AI proxy mode cannot be saved in this environment.");
        return;
      }
      window.localStorage.setItem("dvi_ai_backend_mode_v1", aiBackendMode);
      window.localStorage.setItem("dvi_sms_backend_mode_v1", smsBackendMode);
      window.localStorage.setItem(BACKEND_DATA_MODE_STORAGE_KEY, backendDataMode);
      window.localStorage.setItem(APP_DATA_MODE_STORAGE_KEY, appDataMode);
      setAiBackendModeFeedback(
        aiBackendMode === "Backend Proxy Future" || smsBackendMode === "Backend Proxy Future" || backendDataMode === "Future Backend Enabled" || appDataMode !== "localStorage"
          ? "Backend planning mode saved. LocalStorage remains the active source of truth."
          : "Local/frontend hybrid AI mode saved."
      );
    } catch {
      setAiBackendModeFeedback("AI proxy mode could not be saved in this browser.");
    } finally {
      setIsSavingAiBackendMode(false);
    }
  };

  const onCheckBackendHealth = async () => {
    if (backendHealthStatus === "checking") return;
    setBackendHealthStatus("checking");
    setBackendHealthMessage("Checking backend health...");
    const result = await checkBackendHealth();
    if (result.success) {
      setBackendHealthPayload(result.data);
      setBackendHealthStatus("online");
      setBackendHealthMessage(
        `${result.data.service ?? "Backend"} is ${result.data.status}. Mode: ${result.data.mode ?? "unknown"}. Database configured: ${
          result.data.databaseConfigured ? "Yes" : "No"
        }.`
      );
      setBackendDatabaseStatus(
        `Database configured: ${result.data.databaseConfigured ? "Yes" : "No"}. Connected: ${
          result.data.databaseConnected ? "Yes" : "No"
        }. ${result.data.databaseMessage ?? ""}`.trim()
      );
      setBackendProductionReadiness(
        result.data.productionReadiness
          ? `Env: ${result.data.productionReadiness.environment ?? "unknown"}. Ready: ${result.data.productionReadiness.ready ? "yes" : "not yet"}. Errors: ${result.data.productionReadiness.errorCount ?? 0}. Warnings: ${result.data.productionReadiness.warningCount ?? 0}.`
          : "Production readiness data unavailable."
      );
      setBackendProxyReadiness(
        result.data.proxyStatus
          ? `AI proxy: ${result.data.proxyStatus.aiProxyEnabled ? "enabled" : "disabled"}. SMS proxy: ${result.data.proxyStatus.smsProxyEnabled ? "enabled" : "disabled/simulated"}.`
          : "AI/SMS proxy readiness data unavailable."
      );
      setBackendFileStorageStatus(
        result.data.fileStorageConfigured
          ? `Backend file storage configured. Max upload: ${result.data.maxUploadMb ?? "unknown"} MB.`
          : "Backend file storage not configured. Document Center remains local metadata/preview mode."
      );
      return;
    }
    setBackendHealthPayload(null);
    setBackendHealthStatus("offline");
    setBackendHealthMessage(`Backend offline or unavailable. LocalStorage mode is still active. ${result.error}`);
    setBackendDatabaseStatus("Database status unavailable because backend health check failed.");
    setBackendProductionReadiness("Production readiness unavailable because backend health check failed.");
    setBackendProxyReadiness("AI/SMS proxy readiness unavailable because backend health check failed.");
    setBackendFileStorageStatus("File storage status unavailable because backend health check failed.");
  };

  const backendReadiness: BackendReadinessResult = React.useMemo(
    () =>
      evaluateBackendReadiness({
        dataMode: appDataMode,
        health: backendHealthPayload,
        healthOnline: backendHealthStatus === "online",
        migrationPreviewCompleted: migrationPreviewCompleted,
        migrationCommitEnabled: false,
        fileStoragePlanned: appDataMode !== "localStorage",
        aiProxyRelevant: aiBackendMode === "Backend Proxy Future",
        smsProxyRelevant: smsBackendMode === "Backend Proxy Future",
      }),
    [aiBackendMode, appDataMode, backendHealthPayload, backendHealthStatus, migrationPreviewCompleted, smsBackendMode]
  );
  const cutoverChecklistStatus = React.useMemo(
    () => getCutoverChecklistStatus(cutoverChecklist, backendReadiness),
    [backendReadiness, cutoverChecklist]
  );
  const checkedCutoverItems = React.useMemo(
    () => CUTOVER_CHECKLIST_ITEMS.filter((item) => cutoverChecklist[item.key]).length,
    [cutoverChecklist]
  );
  const syncConflictSummary = React.useMemo(() => {
    const customers = (() => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem("dvi_phase15a_customer_accounts_v1") ?? "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();
    const repairOrders = readLocalRepairOrders();
    const conflicts = [
      ...detectDuplicateCustomers(customers),
      ...detectDuplicatePlates([...customers, ...repairOrders]),
      ...detectRoNumberConflicts(repairOrders),
      ...detectUpdatedAfterImport([...customers, ...repairOrders]),
    ];
    return summarizeConflicts(conflicts);
  }, []);

  const onToggleCutoverChecklistItem = (key: CutoverChecklistKey, checked: boolean) => {
    setCutoverChecklist((previous) => {
      const next = { ...previous, [key]: checked };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CUTOVER_CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const runCustomerVehiclePilot = async () => {
    const localCustomers = readLocalArrayCount("dvi_phase15a_customer_accounts_v1");
    const localVehicles = readLocalVehicleCount();
    if (!shouldRunReadOnlyPilot(appDataMode)) {
      setCustomerPilot({ status: "skipped", localCount: localCustomers, backendCount: null, warnings: ["Backend read mode is off."] });
      setVehiclePilot({ status: "skipped", localCount: localVehicles, backendCount: null, warnings: ["Backend read mode is off."] });
      setPilotFeedback("Backend read-only pilot skipped because data mode is localStorage.");
      return;
    }
    const [customers, vehicles] = await Promise.all([fetchBackendListCount("/api/customers"), fetchBackendListCount("/api/vehicles")]);
    setCustomerPilot(buildPilotComparison(localCustomers, customers.count, customers.warning));
    setVehiclePilot(buildPilotComparison(localVehicles, vehicles.count, vehicles.warning));
    setPilotFeedback("Backend customer/vehicle read-only comparison finished. No records were merged or overwritten.");
  };

  const runRepairOrderPilot = async () => {
    const localRepairOrders = readLocalRepairOrders();
    if (!shouldRunReadOnlyPilot(appDataMode)) {
      setRepairOrderPilot({ status: "skipped", localCount: localRepairOrders.length, backendCount: null, warnings: ["Backend read mode is off."] });
      setPilotFeedback("Backend RO read-only pilot skipped because data mode is localStorage.");
      return;
    }
    const backendRepairOrders = await fetchBackendListCount("/api/repair-orders");
    const comparison = buildPilotComparison(localRepairOrders.length, backendRepairOrders.count, backendRepairOrders.warning);
    setRepairOrderPilot({
      ...comparison,
      warnings: [...comparison.warnings, ...getRoPilotWarnings(localRepairOrders)],
    });
    setPilotFeedback("Backend RO read-only comparison finished. No workflow records were merged or overwritten.");
  };

  const runFullReadOnlyPilot = async () => {
    if (isRunningFullPilot) return;
    setIsRunningFullPilot(true);
    setPilotFeedback("Running full read-only comparison…");

    const canRead = shouldRunReadOnlyPilot(appDataMode);
    const skipped: BackendPilotComparison = { status: "skipped", localCount: 0, backendCount: null, warnings: ["Backend read mode is off."] };

    const localCounts = {
      customers: readLocalArrayCount("dvi_phase15a_customer_accounts_v1"),
      vehicles: readLocalVehicleCount(),
      intakes: readLocalArrayCount("dvi_phase2_intake_records_v1"),
      repairOrders: readLocalRepairOrders().length,
      inspections: readLocalArrayCount("dvi_phase3_inspection_records_v1"),
      partsRequests: readLocalArrayCount("dvi_phase8_parts_requests_v1"),
      inventory: readLocalArrayCount("dvi_inventory_items_v1"),
      payments: readLocalArrayCount("dvi_phase10_payment_records_v1"),
      expenses: readLocalArrayCount("dvi_phase53_expense_records_v1"),
    };

    if (!canRead) {
      setCustomerPilot({ ...skipped, localCount: localCounts.customers });
      setVehiclePilot({ ...skipped, localCount: localCounts.vehicles });
      setIntakePilot({ ...skipped, localCount: localCounts.intakes });
      setRepairOrderPilot({ ...skipped, localCount: localCounts.repairOrders });
      setInspectionPilot({ ...skipped, localCount: localCounts.inspections });
      setPartsRequestPilot({ ...skipped, localCount: localCounts.partsRequests });
      setInventoryPilot({ ...skipped, localCount: localCounts.inventory });
      setPaymentPilot({ ...skipped, localCount: localCounts.payments });
      setExpensePilot({ ...skipped, localCount: localCounts.expenses });
      setPilotFeedback("Full pilot skipped — data mode is localStorage. Switch App Data Mode to backendReadOnly to enable comparisons.");
      setIsRunningFullPilot(false);
      return;
    }

    const [
      backendCustomers, backendVehicles, backendIntakes, backendROs,
      backendInspections, backendParts, backendInventory, backendPayments, backendExpenses,
    ] = await Promise.all([
      fetchBackendListCount("/api/customers"),
      fetchBackendListCount("/api/vehicles"),
      fetchBackendListCount("/api/intakes"),
      fetchBackendListCount("/api/repair-orders"),
      fetchBackendListCount("/api/inspections"),
      fetchBackendListCount("/api/parts-requests"),
      fetchBackendListCount("/api/inventory"),
      fetchBackendListCount("/api/payments"),
      fetchBackendListCount("/api/expenses"),
    ]);

    const ros = readLocalRepairOrders();
    setCustomerPilot(buildPilotComparison(localCounts.customers, backendCustomers.count, backendCustomers.warning));
    setVehiclePilot(buildPilotComparison(localCounts.vehicles, backendVehicles.count, backendVehicles.warning));
    setIntakePilot(buildPilotComparison(localCounts.intakes, backendIntakes.count, backendIntakes.warning));
    const roPilot = buildPilotComparison(localCounts.repairOrders, backendROs.count, backendROs.warning);
    setRepairOrderPilot({ ...roPilot, warnings: [...roPilot.warnings, ...getRoPilotWarnings(ros)] });
    setInspectionPilot(buildPilotComparison(localCounts.inspections, backendInspections.count, backendInspections.warning));
    setPartsRequestPilot(buildPilotComparison(localCounts.partsRequests, backendParts.count, backendParts.warning));
    setInventoryPilot(buildPilotComparison(localCounts.inventory, backendInventory.count, backendInventory.warning));
    setPaymentPilot(buildPilotComparison(localCounts.payments, backendPayments.count, backendPayments.warning));
    setExpensePilot(buildPilotComparison(localCounts.expenses, backendExpenses.count, backendExpenses.warning));
    setPilotFeedback("Full read-only comparison finished. No records were merged or overwritten.");
    setIsRunningFullPilot(false);
  };

  const runMigrationPreview = async () => {
    if (migrationPreview.status === "running") return;
    setMigrationPreview({ status: "running" });

    const readArray = (key: string): unknown[] => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    };

    const customers = readArray("dvi_phase15a_customer_accounts_v1");
    const intakes = readArray("dvi_phase2_intake_records_v1");
    const repairOrders = readArray("dvi_phase4_repair_orders_v1");
    const expenses = readArray("dvi_phase53_expense_records_v1");
    const payments = readArray("dvi_phase10_payment_records_v1");
    const invoices = readArray("dvi_phase10_invoice_records_v1");
    const partsRequests = readArray("dvi_phase8_parts_requests_v1");
    const inventory = readArray("dvi_inventory_items_v1");
    const inspections = readArray("dvi_phase3_inspection_records_v1");

    const localCore: MigrationPreviewCoreResult = {
      totalCustomers: customers.length,
      totalVehicles: readLocalVehicleCount(),
      totalIntakes: intakes.length,
      totalRepairOrders: repairOrders.length,
      totalRecords: customers.length + intakes.length + repairOrders.length,
      recordsReady: 0,
      recordsNeedingReview: 0,
      duplicateCustomers: syncConflictSummary.conflicts > 0 ? [`${syncConflictSummary.conflicts} conflict(s) detected locally`] : [],
      duplicatePlates: [],
      duplicateRoNumbers: [],
      missingCustomerLinks: [],
      missingVehicleLinks: [],
      invalidStatuses: [],
      canCommit: false,
      warning: "Local-only preview. Connect to backend for full analysis.",
    };
    localCore.recordsReady = Math.max(localCore.totalRecords - syncConflictSummary.conflicts, 0);
    localCore.recordsNeedingReview = syncConflictSummary.conflicts + syncConflictSummary.needsReview;

    const localBusiness: MigrationPreviewBusinessResult = {
      totalRecords: expenses.length + payments.length + invoices.length + partsRequests.length + inventory.length + inspections.length,
      recordsReady: 0,
      recordsNeedingReview: 0,
      warning: "Local-only preview.",
    };
    localBusiness.recordsReady = localBusiness.totalRecords;

    try {
      const coreResult = await apiPost<{ data?: { corePreview?: MigrationPreviewCoreResult } }>(
        "/api/migration/core/import-preview",
        { body: { customers, intakes, repairOrders } }
      );
      const businessResult = await apiPost<{ data?: { businessPreview?: MigrationPreviewBusinessResult } }>(
        "/api/migration/business/import-preview",
        { body: { expenses, payments, invoices, partsRequests, inventory, inspections } }
      );

      if (coreResult.success) {
        setMigrationPreview({
          status: "complete",
          corePreview: (coreResult.data as Record<string, unknown>)?.corePreview as MigrationPreviewCoreResult ?? localCore,
          businessPreview: businessResult.success ? ((businessResult.data as Record<string, unknown>)?.businessPreview as MigrationPreviewBusinessResult ?? localBusiness) : localBusiness,
          backendUsed: true,
          completedAt: new Date().toISOString(),
        });
        setMigrationPreviewCompleted(true);
        return;
      }
    } catch { /* fall through to local-only */ }

    setMigrationPreview({
      status: "backendUnavailable",
      corePreview: localCore,
      businessPreview: localBusiness,
      backendUsed: false,
      completedAt: new Date().toISOString(),
    });
    setMigrationPreviewCompleted(true);
  };

  const refreshOpenAiAssistLogs = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(OPENAI_ASSIST_LOG_STORAGE_KEY);
      setOpenAiAssistLogs(raw ? (JSON.parse(raw) as OpenAiAssistLogEntry[]) : []);
    } catch {
      setOpenAiAssistLogs([]);
    }
  };

  const refreshDataQuality = () => {
    setDataQualitySummary(validateStoredRecords(dataQualityKeys));
  };

  const cleanupDataQuality = () => {
    const cleaned = cleanupInvalidJsonStorage(dataQualityKeys);
    setDataQualityFeedback(cleaned.length ? `Removed unreadable saved data for ${cleaned.length} key(s).` : "No invalid JSON records needed cleanup.");
    refreshDataQuality();
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 8" }}>
          <Card title="System Settings" subtitle="Phase 8 controls">
            <div style={styles.moduleText}>
              This build persists users, login session, current page, role permissions,
              intake records, inspection records, repair orders, QC records, release records, parts requests, and daily counters in localStorage.
            </div>
            <div style={styles.inlineActions}>
              <button
                type="button"
                style={{ ...styles.primaryButton, ...(canManageRoles ? {} : styles.buttonDisabled) }}
                disabled={!canManageRoles}
                onClick={onResetDefaults}
              >
                Reset Role Permissions to Default
              </button>
              <button
                type="button"
                style={{ ...styles.secondaryButton, ...(canManageMaintenanceRules ? {} : styles.buttonDisabled) }}
                disabled={!canManageMaintenanceRules}
                onClick={onResetMaintenanceRules}
              >
                Reset Maintenance Rules
              </button>
              <button type="button" style={styles.secondaryButton} onClick={onResetIntakes}>
                Clear Operational Records
              </button>
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 4" }}>
          <Card title="Current User" subtitle="Session summary">
            <div style={styles.quickAccessList}>
              <div>
                <strong>Name:</strong> {currentUser.fullName}
              </div>
              <div>
                <strong>Username:</strong> {currentUser.username}
              </div>
              <div>
                <strong>Role:</strong> <RoleBadge role={currentUser.role} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ ...styles.grid, marginTop: 16 }}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Deployment Readiness" subtitle="Local-first production guidance">
            <div style={styles.moduleText} data-testid="deployment-readiness-panel">
              Current Mode: Local-first / single-browser data. Each browser or device keeps its own localStorage, so data does not sync automatically.
            </div>
            <ul style={styles.hintList}>
              <li>For same-Wi-Fi deployment, the main PC can serve the app and tablets or phones can access it through the LAN IP.</li>
              <li>Use one primary encoding device to avoid split data while backend sync is not available.</li>
              <li>Export backups at the end of each day and before major updates or browser resets.</li>
              <li>Future shared data will require a backend database, centralized users, shared files, and shared audit logs.</li>
              <li><strong>Excel Tools:</strong> Admins and Office Staff can export reports and import data from the Excel Tools page. Import is preview-first — no records are written until you confirm. Financial exports are restricted to authorized roles. Technician performance details are Admin-only.</li>
            </ul>
          </Card>
        </div>
      </div>

      <div style={{ ...styles.grid, marginTop: 16 }}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Service Pricing Catalog" subtitle="Admin-managed suggested prices for maintenance suggestions and new work lines">
            <div style={styles.moduleText}>
              Prices are suggestions only. Advisors can still override line estimates before approval.
            </div>
            <div style={styles.ruleForm} data-testid="service-pricing-catalog-panel">
              <div style={styles.ruleFormHeader}>
                <strong>Create Price</strong>
                <button type="button" style={styles.smallPrimaryButton} data-testid="service-pricing-add" onClick={addPrice}>
                  Add Price
                </button>
              </div>
              <div style={styles.ruleFormGrid}>
                <label style={styles.ruleField}>
                  <span>Service Key</span>
                  <input data-testid="service-pricing-new-serviceKey" style={styles.input} value={newPrice.serviceKey} onChange={(event) => setNewPrice((prev) => ({ ...prev, serviceKey: event.target.value }))} />
                </label>
                <label style={styles.ruleField}>
                  <span>Title</span>
                  <input data-testid="service-pricing-new-title" style={styles.input} value={newPrice.title} onChange={(event) => setNewPrice((prev) => ({ ...prev, title: event.target.value }))} />
                </label>
                <label style={styles.ruleField}>
                  <span>Category</span>
                  <input data-testid="service-pricing-new-category" style={styles.input} value={newPrice.category} onChange={(event) => setNewPrice((prev) => ({ ...prev, category: event.target.value }))} />
                </label>
                <label style={styles.ruleField}>
                  <span>Base Price</span>
                  <input data-testid="service-pricing-new-basePrice" style={styles.input} value={newPrice.basePrice} onChange={(event) => setNewPrice((prev) => ({ ...prev, basePrice: event.target.value }))} />
                </label>
                <label style={styles.ruleFieldWide}>
                  <span>Notes</span>
                  <textarea data-testid="service-pricing-new-notes" style={styles.textarea} value={newPrice.notes} onChange={(event) => setNewPrice((prev) => ({ ...prev, notes: event.target.value }))} />
                </label>
              </div>
            </div>

            <div style={styles.ruleList}>
              {servicePricingCatalog.map((price) => (
                <div key={price.id} style={styles.ruleCard} data-testid={`service-pricing-row-${price.id}`}>
                  <div style={styles.ruleCardHeader}>
                    <div>
                      <strong>{price.title || price.serviceKey || "Untitled service"}</strong>
                      <div style={styles.ruleMeta}>{price.category || "General"} / {price.serviceKey || "no-key"}</div>
                    </div>
                    <label style={styles.switchLabel}>
                      <input
                        data-testid={`service-pricing-active-${price.id}`}
                        type="checkbox"
                        checked={price.active}
                        onChange={(event) => updatePrice(price.id, { active: event.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div style={styles.ruleFormGrid}>
                    <input data-testid={`service-pricing-title-${price.id}`} style={styles.input} value={price.title} onChange={(event) => updatePrice(price.id, { title: event.target.value })} />
                    <input data-testid={`service-pricing-category-${price.id}`} style={styles.input} value={price.category} onChange={(event) => updatePrice(price.id, { category: event.target.value })} />
                    <input data-testid={`service-pricing-basePrice-${price.id}`} style={styles.input} value={price.basePrice} onChange={(event) => updatePrice(price.id, { basePrice: event.target.value })} />
                    <input data-testid={`service-pricing-notes-${price.id}`} style={styles.input} value={price.notes} onChange={(event) => updatePrice(price.id, { notes: event.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ ...styles.grid, marginTop: 16 }}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Document / File Backend Pilot Status" subtitle="Document metadata, file storage, and customer-safe sharing remain optional">
            <div style={styles.moduleText} data-testid="document-file-pilot-status-panel">
              Document and file pilots are guarded by backend write mode and document permissions. LocalStorage remains the Document Center source of truth.
            </div>
            <div style={styles.inlineStatusRow}>
              <span style={backendHealthPayload?.fileStorageConfigured ? styles.successPill : styles.neutralPill}>
                File storage: {backendHealthPayload?.fileStorageConfigured ? "configured" : "not confirmed"}
              </span>
              <span style={styles.infoPill}>Max upload: {backendHealthPayload?.maxUploadMb ?? "unknown"} MB</span>
              <span style={styles.neutralPill}>Allowed: images, PDFs, text/doc-like files</span>
              <span style={styles.warningPill}>Raw paths hidden</span>
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }}>
              Metadata pilot: guarded. File upload pilot: guarded. Customer sharing pilot: default-deny and customer-visible only.
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }}>
              Last document attempt: {getPilotAttemptSummary().document ? `${syncStatusLabel(getPilotAttemptSummary().document!.syncStatus)} / ${getPilotAttemptSummary().document!.entityLabel}` : "No attempt"}.
              {" "}Last upload attempt: {getPilotAttemptSummary().fileUpload ? `${syncStatusLabel(getPilotAttemptSummary().fileUpload!.syncStatus)} / ${getPilotAttemptSummary().fileUpload!.entityLabel}` : "No attempt"}.
              {" "}Customer document access: {getPilotAttemptSummary().customerDocument ? syncStatusLabel(getPilotAttemptSummary().customerDocument!.syncStatus) : "No backend attempt logged"}.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Data Quality + Legacy Cleanup"
            subtitle="Manual safeguards for old or incomplete local records"
            right={<span style={dataQualitySummary.issueCount ? styles.warningPill : styles.successPill}>{dataQualitySummary.issueCount} issues</span>}
          >
            <div style={styles.moduleText}>
              This tool checks saved local records and only removes unreadable JSON if you click cleanup. It does not auto-delete operational data.
            </div>
            <div style={styles.inlineActions}>
              <button type="button" style={styles.secondaryButton} data-testid="data-quality-refresh" onClick={refreshDataQuality}>
                Recheck Data
              </button>
              <button type="button" style={styles.secondaryButton} data-testid="data-quality-cleanup" onClick={cleanupDataQuality}>
                Clean Invalid JSON Only
              </button>
            </div>
            <div style={styles.formHint}>{getDataMigrationReminder()}</div>
            {dataQualityFeedback ? <div style={styles.formHint}>{dataQualityFeedback}</div> : null}
            <div style={styles.logList} data-testid="data-quality-panel">
              {dataQualitySummary.issues.length === 0 ? (
                <div style={styles.emptyState}>No blocking legacy-data issues were found.</div>
              ) : (
                dataQualitySummary.issues.slice(0, 8).map((issue) => (
                  <div key={issue.id} style={styles.logCard}>
                    <div style={styles.logHeader}>
                      <strong>{issue.storageKey}</strong>
                      <span style={issue.severity === "Error" ? styles.warningPill : styles.neutralPill}>{issue.severity}</span>
                    </div>
                    <div style={styles.logMeta}>{issue.message}</div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Data Migration" subtitle="Safe, non-destructive normalization tracking">
            <div style={styles.moduleText}>
              The app applies safe localStorage normalizers for legacy bookings, repair orders, payments, audit logs, inventory, and purchase orders.
            </div>
            <div style={styles.moduleMetaRow}>
              <span>Migration version:</span>
              <strong>v{CURRENT_DATA_MIGRATION_VERSION}</strong>
            </div>
            <div style={styles.moduleMetaRow}>
              <span>Stored version:</span>
              <strong>v{migrationVersion || 0}</strong>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ ...styles.grid, marginTop: 16 }}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Maintenance Interval Rules" subtitle="Admin-managed defaults and overrides for the unified suggestion resolver">
            <div style={styles.moduleText}>
              Default rules control standard mileage and time windows by service type. Overrides can narrow behavior by make, model, and year.
            </div>

            <div style={styles.ruleForm} data-testid="maintenance-interval-rules-panel">
              <div style={styles.ruleFormHeader}>
                <strong>Create Rule</strong>
                <button type="button" style={styles.smallPrimaryButton} data-testid="maintenance-interval-rule-add" onClick={addRule}>
                  Add Rule
                </button>
              </div>
              <div style={styles.ruleFormGrid}>
                <label style={styles.ruleField}>
                  <span>Service Key</span>
                  <input
                    data-testid="maintenance-interval-new-serviceKey"
                    style={styles.input}
                    value={newRule.serviceKey}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, serviceKey: e.target.value }))}
                    placeholder="pms-5000"
                  />
                </label>
                <label style={styles.ruleField}>
                  <span>Title</span>
                  <input
                    data-testid="maintenance-interval-new-title"
                    style={styles.input}
                    value={newRule.title}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="5,000 km periodic maintenance package"
                  />
                </label>
                <label style={styles.ruleField}>
                  <span>Category</span>
                  <input
                    data-testid="maintenance-interval-new-category"
                    style={styles.input}
                    value={newRule.category}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="Periodic Maintenance"
                  />
                </label>
                <label style={styles.ruleField}>
                  <span>KM Interval</span>
                  <input
                    data-testid="maintenance-interval-new-kmInterval"
                    style={styles.input}
                    value={newRule.kmInterval}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, kmInterval: e.target.value }))}
                    placeholder="5000"
                  />
                </label>
                <label style={styles.ruleField}>
                  <span>Time Interval</span>
                  <div style={styles.inlineActions}>
                    <input
                      data-testid="maintenance-interval-new-timeValue"
                      style={{ ...styles.input, flex: 1, minWidth: 120 }}
                      value={newRule.timeIntervalValue}
                      onChange={(e) => setNewRule((prev) => ({ ...prev, timeIntervalValue: e.target.value }))}
                      placeholder="6"
                    />
                    <select
                      data-testid="maintenance-interval-new-timeUnit"
                      style={styles.select}
                      value={newRule.timeIntervalUnit}
                      onChange={(e) => setNewRule((prev) => ({ ...prev, timeIntervalUnit: e.target.value as "Days" | "Months" | "" }))}
                    >
                      <option value="">Unit</option>
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                    </select>
                  </div>
                </label>
                <label style={styles.ruleField}>
                  <span>Make</span>
                  <input
                    data-testid="maintenance-interval-new-make"
                    style={styles.input}
                    value={newRule.make}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, make: e.target.value }))}
                    placeholder="Toyota"
                  />
                </label>
                <label style={styles.ruleField}>
                  <span>Model</span>
                  <input
                    data-testid="maintenance-interval-new-model"
                    style={styles.input}
                    value={newRule.model}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, model: e.target.value }))}
                    placeholder="Fortuner"
                  />
                </label>
                <label style={styles.ruleField}>
                  <span>Year From</span>
                  <input
                    data-testid="maintenance-interval-new-yearFrom"
                    style={styles.input}
                    value={newRule.yearFrom}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, yearFrom: e.target.value }))}
                    placeholder="2021"
                  />
                </label>
                <label style={styles.ruleField}>
                  <span>Year To</span>
                  <input
                    data-testid="maintenance-interval-new-yearTo"
                    style={styles.input}
                    value={newRule.yearTo}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, yearTo: e.target.value }))}
                    placeholder="2021"
                  />
                </label>
                <label style={styles.ruleFieldWide}>
                  <span>Admin Note</span>
                  <textarea
                    data-testid="maintenance-interval-new-adminNote"
                    style={styles.textarea}
                    value={newRule.adminNote}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, adminNote: e.target.value }))}
                    placeholder="Optional note for admins"
                  />
                </label>
              </div>
            </div>

            <div style={styles.ruleList}>
              {maintenanceIntervalRules.map((rule) => {
                const scopeLabel = rule.make && rule.model && (rule.yearFrom || rule.yearTo)
                  ? "Year + Make + Model"
                  : rule.make && rule.model
                    ? "Make + Model"
                    : rule.make
                      ? "Make only"
                      : "Default";
                return (
                  <div key={rule.id} style={styles.ruleCard} data-testid={`maintenance-interval-rule-card-${rule.id}`}>
                    <div style={styles.ruleCardHeader}>
                      <div>
                        <div style={styles.cardTitle}>{rule.title || rule.serviceKey}</div>
                        <div style={styles.cardSubtitle}>
                          {scopeLabel} / {rule.active ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div style={styles.inlineActions}>
                        <button
                          type="button"
                          style={styles.smallButtonMuted}
                          data-testid={`maintenance-interval-rule-toggle-${rule.id}`}
                          onClick={() => updateRule(rule.id, { active: !rule.active })}
                        >
                          {rule.active ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          style={styles.smallPrimaryButton}
                          data-testid={`maintenance-interval-rule-save-${rule.id}`}
                          onClick={() => updateRule(rule.id, {})}
                        >
                          Save Rule
                        </button>
                      </div>
                    </div>

                    <div style={styles.ruleFormGrid}>
                      <label style={styles.ruleField}>
                        <span>Service Key</span>
                        <input
                          data-testid={`maintenance-interval-rule-${rule.id}-serviceKey`}
                          style={styles.input}
                          value={rule.serviceKey}
                          onChange={(e) => updateRule(rule.id, { serviceKey: e.target.value })}
                        />
                      </label>
                      <label style={styles.ruleField}>
                        <span>Title</span>
                        <input
                          data-testid={`maintenance-interval-rule-${rule.id}-title`}
                          style={styles.input}
                          value={rule.title}
                          onChange={(e) => updateRule(rule.id, { title: e.target.value })}
                        />
                      </label>
                      <label style={styles.ruleField}>
                        <span>Category</span>
                        <input
                          data-testid={`maintenance-interval-rule-${rule.id}-category`}
                          style={styles.input}
                          value={rule.category}
                          onChange={(e) => updateRule(rule.id, { category: e.target.value })}
                        />
                      </label>
                      <label style={styles.ruleField}>
                        <span>KM Interval</span>
                        <input
                          data-testid={`maintenance-interval-rule-${rule.id}-kmInterval`}
                          style={styles.input}
                          value={rule.kmInterval}
                          onChange={(e) => updateRule(rule.id, { kmInterval: e.target.value })}
                        />
                      </label>
                      <label style={styles.ruleField}>
                        <span>Time Interval</span>
                        <div style={styles.inlineActions}>
                          <input
                            data-testid={`maintenance-interval-rule-${rule.id}-timeValue`}
                            style={{ ...styles.input, flex: 1, minWidth: 120 }}
                            value={rule.timeIntervalValue}
                            onChange={(e) => updateRule(rule.id, { timeIntervalValue: e.target.value })}
                          />
                          <select
                            data-testid={`maintenance-interval-rule-${rule.id}-timeUnit`}
                            style={styles.select}
                            value={rule.timeIntervalUnit}
                            onChange={(e) => updateRule(rule.id, { timeIntervalUnit: e.target.value as "Days" | "Months" | "" })}
                          >
                            <option value="">Unit</option>
                            <option value="Days">Days</option>
                            <option value="Months">Months</option>
                          </select>
                        </div>
                      </label>
                      <label style={styles.ruleField}>
                        <span>Make</span>
                        <input
                          data-testid={`maintenance-interval-rule-${rule.id}-make`}
                          style={styles.input}
                          value={rule.make}
                          onChange={(e) => updateRule(rule.id, { make: e.target.value })}
                        />
                      </label>
                      <label style={styles.ruleField}>
                        <span>Model</span>
                        <input
                          data-testid={`maintenance-interval-rule-${rule.id}-model`}
                          style={styles.input}
                          value={rule.model}
                          onChange={(e) => updateRule(rule.id, { model: e.target.value })}
                        />
                      </label>
                      <label style={styles.ruleField}>
                        <span>Year From</span>
                        <input
                          data-testid={`maintenance-interval-rule-${rule.id}-yearFrom`}
                          style={styles.input}
                          value={rule.yearFrom}
                          onChange={(e) => updateRule(rule.id, { yearFrom: e.target.value })}
                        />
                      </label>
                      <label style={styles.ruleField}>
                        <span>Year To</span>
                        <input
                          data-testid={`maintenance-interval-rule-${rule.id}-yearTo`}
                          style={styles.input}
                          value={rule.yearTo}
                          onChange={(e) => updateRule(rule.id, { yearTo: e.target.value })}
                        />
                      </label>
                      <label style={styles.ruleFieldWide}>
                        <span>Admin Note</span>
                        <textarea
                          data-testid={`maintenance-interval-rule-${rule.id}-adminNote`}
                          style={styles.textarea}
                          value={rule.adminNote}
                          onChange={(e) => updateRule(rule.id, { adminNote: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ ...styles.grid, marginTop: 16 }}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Backend Proxy Planning" subtitle="Future-only routing flags for data, AI, and SMS requests">
            <div style={styles.moduleText}>
              The app still uses localStorage and the current frontend hybrid AI flow today. These flags only document future backend routing and do not switch live data sources.
            </div>
            <div style={styles.formStack}>
              <div style={styles.formGrid3}>
                <label style={styles.formGroup}>
                  <span style={styles.label}>Backend Data Mode</span>
                  <select
                    data-testid="backend-data-mode"
                    style={styles.select}
                    value={backendDataMode}
                    onChange={(e) => setBackendDataMode(e.target.value as BackendDataMode)}
                  >
                    <option value="Off / LocalStorage">Off / LocalStorage</option>
                    <option value="Future Backend Enabled">Future Backend Enabled</option>
                  </select>
                </label>
                <label style={styles.formGroup}>
                  <span style={styles.label}>App Data Mode</span>
                  <select
                    data-testid="app-data-mode"
                    style={styles.select}
                    value={appDataMode}
                    onChange={(e) => setAppDataMode(e.target.value as AppDataMode)}
                  >
                    <option value="localStorage">localStorage</option>
                    <option value="backendReadOnly">backendReadOnly</option>
                    <option value="backendWritePilot">backendWritePilot (locked)</option>
                    <option value="backendFull">backendFull (locked)</option>
                  </select>
                </label>
                <label style={styles.formGroup}>
                  <span style={styles.label}>AI Mode</span>
                  <select
                    data-testid="ai-backend-mode"
                    style={styles.select}
                    value={aiBackendMode}
                    onChange={(e) => setAiBackendMode(e.target.value as AiBackendMode)}
                  >
                    <option value="Local/Frontend Hybrid">Local/Frontend Hybrid</option>
                    <option value="Backend Proxy Future">Backend Proxy Future</option>
                  </select>
                </label>
                <div style={styles.formGroup}>
                  <span style={styles.label}>API URL</span>
                  <div style={styles.concernCard} data-testid="backend-api-url">
                    {DVI_API_BASE_URL || "Not configured. Frontend stays localStorage-first."}
                  </div>
                </div>
                <label style={styles.formGroup}>
                  <span style={styles.label}>SMS Mode</span>
                  <select
                    data-testid="sms-backend-mode"
                    style={styles.select}
                    value={smsBackendMode}
                    onChange={(e) => setSmsBackendMode(e.target.value as SmsBackendMode)}
                  >
                    <option value="Frontend configured">Frontend configured</option>
                    <option value="Backend Proxy Future">Backend Proxy Future</option>
                  </select>
                </label>
              </div>
              <div style={styles.inlineActions}>
                <button type="button" style={styles.smallPrimaryButton} data-testid="ai-backend-mode-save" onClick={onSaveAiBackendMode}>
                  Save Backend Planning Mode
                </button>
              </div>
              {aiBackendModeFeedback ? <div style={styles.concernCard}>{aiBackendModeFeedback}</div> : null}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Backend Health + Diagnostics" subtitle="Optional readiness check; localStorage remains active">
            <div style={styles.moduleText} data-testid="backend-diagnostics-panel">
              Backend is optional in this build. Frontend is still using localStorage. A failed health check does not block the app or switch data sources.
            </div>
            <div style={{ ...styles.concernCard, marginBottom: 12 }} data-testid="backend-localstorage-source-warning">
              Frontend is still using localStorage as the source of truth. Backend diagnostics do not migrate, sync, or overwrite browser data.
            </div>
            <div style={styles.formGrid3}>
              <div style={styles.concernCard}>
                <strong>Mode:</strong> localStorage-first
                <br />
                <span>Backend data flag: {backendDataMode}</span>
                <br />
                <span data-testid="current-app-data-mode">Current Data Mode: {getDataModeLabel(appDataMode)}</span>
              </div>
              <div style={styles.concernCard}>
                <strong>API URL:</strong>
                <br />
                <span data-testid="backend-diagnostics-api-url">{DVI_API_BASE_URL || "Not configured"}</span>
              </div>
              <div style={styles.concernCard}>
                <strong>Env backend flag:</strong>
                <br />
                <span>{backendEnabledByEnv ? "Enabled by VITE_DVI_USE_BACKEND" : "Off by default"}</span>
              </div>
              <div style={styles.concernCard} data-testid="backend-ai-proxy-status">
                <strong>AI proxy:</strong>
                <br />
                <span>{aiBackendMode === "Backend Proxy Future" ? "Future flag saved locally; frontend hybrid AI remains active" : "Future-only; not routing AI through backend"}</span>
              </div>
              <div style={styles.concernCard} data-testid="backend-sms-proxy-status">
                <strong>SMS proxy:</strong>
                <br />
                <span>{smsBackendMode === "Backend Proxy Future" ? "Future flag saved locally; current SMS flow remains active" : "Future-only; frontend SMS settings remain active"}</span>
              </div>
              <div style={styles.concernCard} data-testid="backend-file-storage-status-card">
                <strong>File storage:</strong>
                <br />
                <span>Frontend Document Center remains local metadata/preview mode until backend upload cutover.</span>
              </div>
              <div style={styles.concernCard} data-testid="backend-migration-preview-status">
                <strong>Migration preview:</strong>
                <br />
                <span>Backend preview contract is optional and read-only. Import commit remains disabled by default.</span>
              </div>
              <div style={styles.concernCard} data-testid="backend-auth-status">
                <strong>Backend auth:</strong>
                <br />
                <span>Foundation ready for backend sessions. Frontend login still uses localStorage until a future cutover phase.</span>
              </div>
              <div style={styles.concernCard} data-testid="backend-read-write-mode-status">
                <strong>Backend read/write guard:</strong>
                <br />
                <span>Read Mode: {isBackendReadEnabled(appDataMode) ? "Available for diagnostics only" : "Off"}</span>
                <br />
                <span>Write Mode: {isBackendWriteEnabled(appDataMode) ? "Requested but locked" : "Off / Locked"}</span>
              </div>
              <div style={styles.concernCard} data-testid="backend-readiness-guard-card">
                <strong>Backend readiness guard:</strong>
                <br />
                <span>Status: {backendReadiness.status}</span>
                <ul style={styles.hintList}>
                  {backendReadiness.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
              <div style={styles.concernCard} data-testid="customer-vehicle-readonly-pilot">
                <strong>Customer / Vehicle read-only pilot:</strong>
                <br />
                <span>Customers: local {customerPilot.localCount}, backend {customerPilot.backendCount ?? "not checked"}</span>
                <br />
                <span>Vehicles: local {vehiclePilot.localCount}, backend {vehiclePilot.backendCount ?? "not checked"}</span>
                <ul style={styles.hintList}>
                  {[...customerPilot.warnings, ...vehiclePilot.warnings].map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
              <div style={styles.concernCard} data-testid="repair-order-readonly-pilot">
                <strong>Repair Order read-only pilot:</strong>
                <br />
                <span>ROs: local {repairOrderPilot.localCount}, backend {repairOrderPilot.backendCount ?? "not checked"}</span>
                <ul style={styles.hintList}>
                  {repairOrderPilot.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ ...styles.inlineActions, marginTop: 12 }}>
              <button
                type="button"
                style={styles.smallPrimaryButton}
                data-testid="backend-health-check-button"
                onClick={onCheckBackendHealth}
                disabled={backendHealthStatus === "checking"}
              >
                {backendHealthStatus === "checking" ? "Checking..." : "Check Backend Health"}
              </button>
              <span
                data-testid="backend-health-status"
                style={
                  backendHealthStatus === "online"
                    ? styles.successPill
                    : backendHealthStatus === "offline"
                      ? styles.warningPill
                      : styles.neutralPill
                }
              >
              {backendHealthStatus === "online" ? "Online" : backendHealthStatus === "offline" ? "Offline / unavailable" : "Not checked"}
              </span>
              <button type="button" style={styles.smallButtonMuted} data-testid="backend-customer-vehicle-pilot-button" onClick={() => void runCustomerVehiclePilot()}>
                Compare Customers / Vehicles
              </button>
              <button type="button" style={styles.smallButtonMuted} data-testid="backend-ro-pilot-button" onClick={() => void runRepairOrderPilot()}>
                Compare Repair Orders
              </button>
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="backend-readonly-pilot-feedback">
              {pilotFeedback}
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="production-readiness-cutover-warning">
              Do not enable multi-device backend mode until migration preview, database backup, file storage backup, and role verification are complete.
            </div>
            <div style={{ ...styles.concernCard, marginTop: 12 }} data-testid="backend-health-message">
              {backendHealthMessage}
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="backend-database-status">
              {backendDatabaseStatus}
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="backend-production-readiness-status">
              {backendProductionReadiness}
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="backend-proxy-readiness-status">
              {backendProxyReadiness}
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="backend-file-storage-status">
              {backendFileStorageStatus}
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="production-backup-reminder">
              Backup reminder: export localStorage before updates, and once backend storage is enabled, back up PostgreSQL and the file storage folder together.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Backend Read-Only Pilot Panel" subtitle="Full entity comparison — no writes, no sync, no data-source switch">
            <div style={styles.moduleText} data-testid="full-pilot-panel">
              Compare local (localStorage) record counts against backend counts for all major entities.
              No records are merged, overwritten, or imported. Backend read mode must be enabled for live comparisons.
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ minWidth: 560, width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--table-header-bg, #f8fafc)" }}>
                    <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid var(--table-border, #e2e8f0)", color: "var(--text-secondary, #64748b)", fontWeight: 700 }}>Entity</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid var(--table-border, #e2e8f0)", color: "var(--text-secondary, #64748b)", fontWeight: 700 }}>Local</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid var(--table-border, #e2e8f0)", color: "var(--text-secondary, #64748b)", fontWeight: 700 }}>Backend</th>
                    <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid var(--table-border, #e2e8f0)", color: "var(--text-secondary, #64748b)", fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      { label: "Customers", pilot: customerPilot, testId: "pilot-row-customers" },
                      { label: "Vehicles", pilot: vehiclePilot, testId: "pilot-row-vehicles" },
                      { label: "Intakes", pilot: intakePilot, testId: "pilot-row-intakes" },
                      { label: "Repair Orders", pilot: repairOrderPilot, testId: "pilot-row-ros" },
                      { label: "Inspections", pilot: inspectionPilot, testId: "pilot-row-inspections" },
                      { label: "Parts Requests", pilot: partsRequestPilot, testId: "pilot-row-parts" },
                      { label: "Inventory Items", pilot: inventoryPilot, testId: "pilot-row-inventory" },
                      { label: "Payments", pilot: paymentPilot, testId: "pilot-row-payments" },
                      { label: "Expenses", pilot: expensePilot, testId: "pilot-row-expenses" },
                    ] as { label: string; pilot: BackendPilotComparison; testId: string }[]
                  ).map(({ label, pilot, testId }) => {
                    const statusLabel = pilotStatusLabel(pilot);
                    const statusStyle = statusLabel === "Counts match" ? styles.successPill : statusLabel === "Not checked" || statusLabel === "Skipped (read mode off)" ? styles.neutralPill : styles.warningPill;
                    return (
                      <tr key={testId} data-testid={testId}>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--table-border, #e2e8f0)", color: "var(--text-primary, #0f172a)", fontWeight: 600 }}>{label}</td>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--table-border, #e2e8f0)", textAlign: "right", color: "var(--text-primary, #0f172a)" }}>{pilot.localCount}</td>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--table-border, #e2e8f0)", textAlign: "right", color: "var(--text-secondary, #64748b)" }}>{pilot.backendCount ?? "—"}</td>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--table-border, #e2e8f0)" }}><span style={statusStyle}>{statusLabel}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ ...styles.inlineActions, marginTop: 12 }}>
              <button
                type="button"
                style={styles.smallPrimaryButton}
                data-testid="run-full-pilot-button"
                disabled={isRunningFullPilot}
                onClick={() => void runFullReadOnlyPilot()}
              >
                {isRunningFullPilot ? "Running…" : "Run Full Comparison"}
              </button>
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="full-pilot-feedback">
              {pilotFeedback}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Migration Preview" subtitle="Preview-only analysis — no data will be imported or committed">
            <div style={{ ...styles.concernCard, marginBottom: 12, background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e" }} data-testid="migration-preview-warning">
              Preview only. No data will be imported, synced, or written to the backend or localStorage.
            </div>
            <div style={styles.moduleText} data-testid="migration-preview-panel">
              Run a preview of what a future backend migration would include based on current localStorage data.
              If the backend is offline, a local-only analysis is shown.
            </div>
            {migrationPreview.status !== "idle" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div style={styles.concernCard} data-testid="migration-preview-core">
                  <strong>Core Data</strong>
                  <br />
                  {migrationPreview.corePreview ? (
                    <>
                      <span>Customers: {migrationPreview.corePreview.totalCustomers ?? "—"}</span><br />
                      <span>Vehicles: {migrationPreview.corePreview.totalVehicles ?? "—"}</span><br />
                      <span>Intakes: {migrationPreview.corePreview.totalIntakes ?? "—"}</span><br />
                      <span>Repair Orders: {migrationPreview.corePreview.totalRepairOrders ?? "—"}</span><br />
                      <span>Total records: {migrationPreview.corePreview.totalRecords}</span><br />
                      <span>Ready: {migrationPreview.corePreview.recordsReady}</span><br />
                      <span>Needs review: {migrationPreview.corePreview.recordsNeedingReview}</span>
                      {(migrationPreview.corePreview.duplicateCustomers?.length ?? 0) > 0 && (
                        <div style={{ marginTop: 6, color: "#b45309", fontSize: 12 }}>
                          Duplicate customers: {migrationPreview.corePreview.duplicateCustomers?.length}
                        </div>
                      )}
                      {(migrationPreview.corePreview.duplicatePlates?.length ?? 0) > 0 && (
                        <div style={{ color: "#b45309", fontSize: 12 }}>
                          Duplicate plates: {migrationPreview.corePreview.duplicatePlates?.length}
                        </div>
                      )}
                      {(migrationPreview.corePreview.duplicateRoNumbers?.length ?? 0) > 0 && (
                        <div style={{ color: "#b45309", fontSize: 12 }}>
                          Duplicate RO numbers: {migrationPreview.corePreview.duplicateRoNumbers?.length}
                        </div>
                      )}
                      {(migrationPreview.corePreview.invalidStatuses?.length ?? 0) > 0 && (
                        <div style={{ color: "#b91c1c", fontSize: 12 }}>
                          Invalid statuses: {migrationPreview.corePreview.invalidStatuses?.length}
                        </div>
                      )}
                    </>
                  ) : <span style={{ color: "var(--text-muted, #94a3b8)" }}>No data</span>}
                </div>
                <div style={styles.concernCard} data-testid="migration-preview-business">
                  <strong>Business Modules</strong>
                  <br />
                  {migrationPreview.businessPreview ? (
                    <>
                      <span>Total records: {migrationPreview.businessPreview.totalRecords}</span><br />
                      <span>Ready: {migrationPreview.businessPreview.recordsReady}</span><br />
                      <span>Needs review: {migrationPreview.businessPreview.recordsNeedingReview}</span>
                    </>
                  ) : <span style={{ color: "var(--text-muted, #94a3b8)" }}>No data</span>}
                </div>
                <div style={styles.concernCard} data-testid="migration-preview-meta">
                  <strong>Preview Metadata</strong>
                  <br />
                  <span>Source: {migrationPreview.backendUsed ? "Backend analysis" : "Local-only"}</span><br />
                  <span>Status: {migrationPreview.status === "complete" ? "Complete" : migrationPreview.status === "backendUnavailable" ? "Backend unavailable — local only" : migrationPreview.status}</span><br />
                  {migrationPreview.completedAt && <span>At: {new Date(migrationPreview.completedAt).toLocaleTimeString()}</span>}
                </div>
              </div>
            )}
            <div style={styles.inlineActions}>
              <button
                type="button"
                style={styles.smallPrimaryButton}
                data-testid="run-migration-preview-button"
                disabled={migrationPreview.status === "running"}
                onClick={() => void runMigrationPreview()}
              >
                {migrationPreview.status === "running" ? "Running preview…" : "Run Migration Preview"}
              </button>
              {migrationPreviewCompleted && (
                <span style={styles.successPill} data-testid="migration-preview-completed-badge">Preview completed</span>
              )}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Future Sync Status Planning" subtitle="Display-only labels for later backend sync">
            <div style={styles.moduleText} data-testid="sync-status-planning-panel">
              These statuses are planning labels only. No frontend records are syncing to the backend yet.
            </div>
            <div style={styles.inlineStatusRow}>
              <span style={styles.neutralPill}>Local only</span>
              <span style={styles.infoPill}>Pending sync</span>
              <span style={styles.successPill}>Synced</span>
              <span style={styles.warningPill}>Conflict</span>
              <span style={styles.warningPill}>Needs review</span>
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="sync-conflict-planning-summary">
              Conflict detection planning: {syncConflictSummary.total} issue(s), {syncConflictSummary.conflicts} conflict(s), {syncConflictSummary.needsReview} needing review. No automatic resolution is performed.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Write Pilot Guard" subtitle="Backend write pilot — locked by default; admin-only visibility">
            {canManageRoles ? (
              <>
                <div style={styles.moduleText} data-testid="write-pilot-guard-panel">
                  The backend write pilot allows a controlled, limited number of writes to be sent to the backend alongside localStorage.
                  It is locked until all requirements are met and an admin explicitly enables it. No writes occur by default.
                </div>
                {(() => {
                  const req = [
                    { label: "Backend health online", met: backendHealthStatus === "online" },
                    { label: "Database available", met: backendHealthPayload?.databaseConnected === true },
                    { label: "Migration preview completed", met: migrationPreviewCompleted },
                    { label: "Backup confirmed (cutover checklist)", met: cutoverChecklist.localBackup && cutoverChecklist.databaseBackup },
                    { label: "Cutover checklist complete", met: cutoverChecklistStatus === "ready for pilot" },
                    { label: "Backend readiness guard passed", met: backendReadiness.status !== "blocked" },
                  ];
                  const allMet = req.every((r) => r.met);
                  const writePilotStatus: string = backendReadiness.status === "blocked" ? "Blocked" : allMet ? "Ready for admin testing" : "Locked";
                  const statusStyle = writePilotStatus === "Ready for admin testing" ? styles.successPill : writePilotStatus === "Blocked" ? styles.warningPill : styles.neutralPill;

                  return (
                    <>
                      <div style={styles.inlineStatusRow}>
                        <span style={statusStyle} data-testid="write-pilot-status-badge">Write Pilot: {writePilotStatus}</span>
                        <span style={styles.warningPill}>Backend writes remain off</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8, margin: "12px 0" }}>
                        {req.map((r) => (
                          <div key={r.label} style={{ ...styles.concernCard, display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={r.met ? styles.successPill : styles.neutralPill}>{r.met ? "✓" : "✗"}</span>
                            <span style={{ fontSize: 13, color: r.met ? "var(--text-primary, #0f172a)" : "var(--text-secondary, #64748b)" }}>{r.label}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.inlineActions}>
                        <button
                          type="button"
                          style={{ ...styles.primaryButton, opacity: 0.45, cursor: "not-allowed" }}
                          disabled
                          data-testid="write-pilot-enable-button"
                          title="Write pilot cannot be enabled in this phase. Complete all requirements first."
                        >
                          Enable Write Pilot (locked)
                        </button>
                      </div>
                      <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="write-pilot-locked-note">
                        Backend write pilot is locked. Complete all requirements above, then a future phase will unlock the enable path.
                        No module will write to the backend until this guard is explicitly cleared and the enable path is opened.
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <div style={styles.concernCard} data-testid="write-pilot-access-restricted">
                Write Pilot Guard is visible to Admin only.
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Backend Write Pilot Status"
            subtitle="Last pilot write attempt per entity — informational only; localStorage remains source of truth"
            right={
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  style={styles.smallPrimaryButton}
                  data-testid="pilot-status-refresh-button"
                  onClick={() => setPilotAttemptLog(readPilotAttemptLog())}
                >
                  Refresh
                </button>
                {canManageRoles && (
                  <button
                    type="button"
                    style={{ ...styles.smallPrimaryButton, background: "#fee2e2", color: "#991b1b" }}
                    data-testid="pilot-status-clear-button"
                    onClick={() => { clearPilotAttemptLog(); setPilotAttemptLog([]); }}
                  >
                    Clear Log
                  </button>
                )}
              </div>
            }
          >
            <div style={styles.moduleText} data-testid="pilot-status-panel">
              This panel shows the most recent backend write pilot attempt for each entity type.
              A "Locked / Skipped" result means the write pilot mode is not yet active — no backend write occurred.
              LocalStorage is the source of truth in all cases.
            </div>
            {(() => {
              const summary = getPilotAttemptSummary();
              const ENTITIES: { key: keyof typeof summary; label: string }[] = [
                { key: "customer", label: "Customers" },
                { key: "vehicle", label: "Vehicles" },
                { key: "intake", label: "Intakes" },
                { key: "repairOrder", label: "Repair Orders" },
                { key: "inspection", label: "Inspections" },
                { key: "qcRecord", label: "QC Records" },
                { key: "releaseRecord", label: "Release Records" },
                { key: "backjob", label: "Backjobs" },
                { key: "serviceHistory", label: "Service History" },
                { key: "partsRequest", label: "Parts Requests" },
                { key: "inventoryItem", label: "Inventory Items" },
                { key: "inventoryMovement", label: "Inventory Movements" },
                { key: "purchaseOrder", label: "Purchase Orders" },
                { key: "supplier", label: "Suppliers" },
                { key: "payment", label: "Payments" },
                { key: "expense", label: "Expenses" },
                { key: "invoice", label: "Invoices" },
                { key: "document", label: "Documents" },
                { key: "fileUpload", label: "File Uploads" },
                { key: "customerDocument", label: "Customer Documents" },
              ];
              return (
                <div style={{ overflowX: "auto" as const }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.th, textAlign: "left" }}>Entity</th>
                        <th style={{ ...styles.th, textAlign: "left" }}>Status</th>
                        <th style={{ ...styles.th, textAlign: "left" }}>Last Attempt</th>
                        <th style={{ ...styles.th, textAlign: "left" }}>Local ID</th>
                        <th style={{ ...styles.th, textAlign: "left" }}>Remote ID</th>
                        <th style={{ ...styles.th, textAlign: "left" }}>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ENTITIES.map(({ key, label }) => {
                        const entry = summary[key];
                        const statusStyle = !entry
                          ? styles.neutralPill
                          : entry.syncStatus === "synced"
                            ? styles.successPill
                            : entry.syncStatus === "conflict"
                              ? styles.warningPill
                              : styles.neutralPill;
                        return (
                          <tr key={key} data-testid={`pilot-status-row-${key}`}>
                            <td style={styles.td}><strong>{label}</strong></td>
                            <td style={styles.td}>
                              <span style={statusStyle}>
                                {entry ? syncStatusLabel(entry.syncStatus) : "No attempt"}
                              </span>
                            </td>
                            <td style={styles.td}>{entry ? new Date(entry.attemptedAt).toLocaleString() : "—"}</td>
                            <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 11 }}>{entry?.localId ?? "—"}</td>
                            <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 11 }}>{entry?.remoteId ?? "—"}</td>
                            <td style={styles.td}>{entry?.conflictReason ?? entry?.warning ?? "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            {pilotAttemptLog.length > 0 && (
              <details style={{ marginTop: 14 }}>
                <summary style={{ fontSize: 13, color: "var(--text-secondary, #64748b)", cursor: "pointer" }}>
                  Recent pilot attempts ({pilotAttemptLog.length})
                </summary>
                <div style={{ ...styles.logList, marginTop: 8 }} data-testid="pilot-attempt-log-list">
                  {pilotAttemptLog.slice(0, 20).map((entry, i) => (
                    <div key={i} style={styles.logCard}>
                      <div style={styles.logHeader}>
                        <strong>{entry.entityType}</strong>
                        <span
                          style={
                            entry.syncStatus === "synced"
                              ? styles.successPill
                              : entry.syncStatus === "conflict"
                                ? styles.warningPill
                                : styles.neutralPill
                          }
                        >
                          {syncStatusLabel(entry.syncStatus)}
                        </span>
                      </div>
                      <div style={styles.logMeta}>Label: {entry.entityLabel}</div>
                      <div style={styles.logMeta}>Local ID: {entry.localId}</div>
                      {entry.remoteId && <div style={styles.logMeta}>Remote ID: {entry.remoteId}</div>}
                      {entry.conflictReason && <div style={styles.logMeta}>Conflict: {entry.conflictReason}</div>}
                      {entry.warning && <div style={styles.logMeta}>Warning: {entry.warning}</div>}
                      <div style={styles.logMeta}>{new Date(entry.attemptedAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </details>
            )}
            <div style={{ ...styles.concernCard, marginTop: 12 }} data-testid="pilot-status-footer-note">
              Write pilot is optional and guarded. localStorage remains the default source of truth.
              No automatic sync runs. Conflicts must be reviewed before any future cutover.
              Export a backup before enabling any migration commit.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Cutover Safety Checklist" subtitle="Admin-only readiness tracking; backend write mode stays locked">
            <div style={styles.moduleText} data-testid="cutover-safety-checklist-panel">
              Use this checklist before any future backend pilot. It stores checklist state locally only and does not enable backend reads, writes, imports, or sync.
            </div>
            <div style={styles.inlineStatusRow}>
              <span style={cutoverChecklistStatus === "ready for pilot" ? styles.successPill : cutoverChecklistStatus === "blocked" ? styles.warningPill : styles.neutralPill}>
                Status: {cutoverChecklistStatus}
              </span>
              <span style={styles.infoPill}>
                {checkedCutoverItems} / {CUTOVER_CHECKLIST_ITEMS.length} complete
              </span>
              <span style={styles.warningPill}>Backend write mode locked</span>
            </div>
            <div style={styles.toggleGrid}>
              {CUTOVER_CHECKLIST_ITEMS.map((item) => (
                <label key={item.key} style={styles.toggleCard}>
                  <input
                    type="checkbox"
                    checked={cutoverChecklist[item.key]}
                    onChange={(event) => onToggleCutoverChecklistItem(item.key, event.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <div style={{ ...styles.concernCard, marginTop: 10 }} data-testid="backend-write-mode-locked-note">
              No backend write-mode activation is available in this phase. Complete backups, previews, privacy checks, and rollback planning before a future pilot phase unlocks any write path.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="AI Safety Controls" subtitle="Module-level AI enable / disable switches">
            <div style={styles.moduleText}>
              AI remains advisor-clicked only. These switches only control whether each module can use the shared Hybrid AI system.
            </div>
            <div style={styles.toggleGrid}>
              {(Object.keys(DEFAULT_AI_MODULE_TOGGLES) as AiModuleKey[]).map((key) => (
                <label key={key} style={styles.toggleCard}>
                  <input
                    data-testid={`ai-safety-toggle-${key}`}
                    type="checkbox"
                    checked={aiModuleToggles[key]}
                    onChange={(e) => setAiModuleToggles((prev) => ({ ...prev, [key]: e.target.checked }))}
                  />
                  <span>{getAiModuleLabel(key)}</span>
                </label>
              ))}
            </div>
            <div style={styles.inlineActions}>
              <button type="button" style={styles.smallPrimaryButton} data-testid="ai-safety-save-button" onClick={onSaveAiSafetyControls}>
                Save AI Safety Controls
              </button>
            </div>
            {aiSafetyFeedback ? <div style={styles.concernCard}>{aiSafetyFeedback}</div> : null}
          </Card>
        </div>
      </div>

      <div style={{ ...styles.grid, marginTop: 16 }}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Security Checklist + Role Audit" subtitle="Read-only reminders of current security boundaries">
            <div style={styles.moduleText}>
              This app is still frontend-first. Treat login, portal links, API keys, and supplier data as sensitive until backend auth is implemented.
            </div>
            <ul style={styles.hintList} data-testid="security-checklist-panel">
              <li>Demo passwords must be changed before real deployment.</li>
              <li>Frontend-only login is not production-grade security.</li>
              <li>API keys must not be committed to git.</li>
              <li>The OpenAI key in a frontend build is risky for public deployment.</li>
              <li>Customer portal links should be treated as sensitive.</li>
              <li>Supplier portal access is simulated until backend auth exists.</li>
            </ul>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 12 }}>
              {SENSITIVE_ACCESS_MAP.map((entry) => {
                const adminAllowed = entry.access("Admin", roleDefinitions);
                const advisorAllowed = entry.access("Service Advisor", roleDefinitions);
                const officeAllowed = entry.access("Office Staff", roleDefinitions);
                const techAllowed = entry.access("General Mechanic", roleDefinitions);
                const adminOnly = adminAllowed && !advisorAllowed && !officeAllowed && !techAllowed;
                return (
                  <div key={entry.module} style={styles.concernCard} data-testid={`security-module-${entry.module.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    <div style={styles.logHeader}>
                      <strong>{entry.module}</strong>
                      <span style={adminOnly ? styles.successPill : styles.warningPill}>{adminOnly ? "Admin only" : "Review access"}</span>
                    </div>
                    <div style={styles.logMeta}>Permission: {entry.permission}</div>
                    <div style={styles.logMeta}>Admin: {adminAllowed ? "Yes" : "No"} | Advisor: {advisorAllowed ? "Yes" : "No"} | Office: {officeAllowed ? "Yes" : "No"} | Tech: {techAllowed ? "Yes" : "No"}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ ...styles.grid, marginTop: 16 }}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="OpenAI AI Assist" subtitle="Optional communication drafting support for advisors">
            <div style={styles.moduleText}>
              Local-first hybrid AI is available only when an advisor clicks a draft button. Core DVI workflows still work without AI.
              Provider order: 1) Ollama local AI (free), 2) OpenAI cloud fallback (paid), 3) template fallback (no AI).
              The API key is read from <strong>VITE_OPENAI_API_KEY</strong> at runtime and is never stored here.
            </div>
            <div style={styles.formStack}>
              <div style={styles.formGrid3}>
                <label style={styles.formGroup}>
                  <span style={styles.label}>Provider</span>
                  <select
                    data-testid="openai-ai-provider"
                    style={styles.select}
                    value={openAiAssistProviderMode}
                    onChange={(e) => setOpenAiAssistProviderMode(e.target.value as OpenAiAssistProviderMode)}
                  >
                    <option value="Disabled">Disabled</option>
                    <option value="OpenAI">OpenAI</option>
                  </select>
                </label>
                <label style={styles.formGroup}>
                  <span style={styles.label}>Model</span>
                  <input
                    data-testid="openai-ai-model"
                    style={styles.input}
                    value={openAiAssistModel}
                    onChange={(e) => setOpenAiAssistModel(e.target.value)}
                    placeholder="gpt-4.1-mini"
                  />
                </label>
                <label style={styles.formGroup}>
                  <span style={styles.label}>Max Tokens</span>
                  <input
                    data-testid="openai-ai-max-tokens"
                    type="number"
                    min={32}
                    max={4000}
                    style={styles.input}
                    value={openAiAssistMaxTokens}
                    onChange={(e) => setOpenAiAssistMaxTokens(Number(e.target.value || 0))}
                  />
                </label>
              </div>
              <div style={styles.concernCard}>
                <strong>API key note:</strong> {openAiApiKeyConfigured ? "VITE_OPENAI_API_KEY is available in this build." : "VITE_OPENAI_API_KEY is not configured, so advisor fallback drafts will be used."}
              </div>
              <div style={styles.inlineActions}>
                <button type="button" style={styles.smallPrimaryButton} onClick={onSaveOpenAiAssistSettings}>
                  Save AI Settings
                </button>
              </div>
              {openAiAssistSettingsFeedback ? <div style={styles.concernCard}>{openAiAssistSettingsFeedback}</div> : null}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="AI Log Viewer"
            subtitle="Recent OpenAI Assist activity stored locally for advisor review and troubleshooting"
            right={
              <button type="button" style={styles.smallPrimaryButton} onClick={refreshOpenAiAssistLogs}>
                Refresh Logs
              </button>
            }
          >
            {openAiAssistLogs.length === 0 ? (
              <div style={styles.emptyState}>No AI actions have been logged yet.</div>
            ) : (
              <div style={styles.logList}>
                {openAiAssistLogs.slice(0, 10).map((entry) => (
                  <div key={entry.id} style={styles.logCard}>
                    <div style={styles.logHeader}>
                      <strong>{entry.actionType}</strong>
                      <span style={entry.status === "Success" ? styles.successPill : styles.warningPill}>{entry.status}</span>
                    </div>
                    <div style={styles.logMeta}>Source: {entry.sourceModule}</div>
                    {entry.user ? <div style={styles.logMeta}>User: {entry.user}</div> : null}
                    {entry.role ? <div style={styles.logMeta}>Role: {entry.role}</div> : null}
                    {entry.messageType ? <div style={styles.logMeta}>Message type: {entry.messageType}</div> : null}
                    {entry.sourceContext ? <div style={styles.logMeta}>Source context: {entry.sourceContext}</div> : null}
                    <div style={styles.logMeta}>Model: {entry.model}</div>
                    {entry.outputMode ? <div style={styles.logMeta}>Output mode: {entry.outputMode}</div> : null}
                    {entry.templateType ? <div style={styles.logMeta}>Template type: {entry.templateType}</div> : null}
                    <div style={styles.logMeta}>{new Date(entry.generatedAt).toLocaleString()}</div>
                    {entry.reviewedAt ? <div style={styles.logMeta}>Reviewed at: {new Date(entry.reviewedAt).toLocaleString()}</div> : null}
                    {entry.usedAt ? <div style={styles.logMeta}>Used at: {new Date(entry.usedAt).toLocaleString()}</div> : null}
                    {entry.copiedAt ? <div style={styles.logMeta}>Copied at: {new Date(entry.copiedAt).toLocaleString()}</div> : null}
                    {entry.safetyLabel ? <div style={styles.logMeta}>{entry.safetyLabel}</div> : null}
                    <div style={styles.inlineStatusRow}>
                      {typeof entry.reviewed === "boolean" ? <span style={entry.reviewed ? styles.successPill : styles.neutralPill}>{entry.reviewed ? "Reviewed" : "Not reviewed"}</span> : null}
                      {entry.used ? <span style={styles.successPill}>Used</span> : null}
                      {entry.copied ? <span style={styles.neutralPill}>Copied</span> : null}
                      {entry.providerName ? <span style={entry.providerName === "ollama" ? styles.successPill : entry.providerName === "openai" ? styles.infoPill : styles.neutralPill}>{entry.providerName === "ollama" ? "Local AI" : entry.providerName === "openai" ? "Cloud AI" : "Template"}</span> : null}
                    </div>
                    {typeof entry.success === "boolean" ? <div style={styles.logMeta}>Success: {entry.success ? "Yes" : "No"}</div> : null}
                    {entry.warningReason ? <div style={styles.logMeta}>Warning: {entry.warningReason}</div> : null}
                    {entry.logNote ? <div style={styles.logNote}>{entry.logNote}</div> : null}
                    {entry.errorMessage ? <div style={styles.logError}>{entry.errorMessage}</div> : null}
                    <div style={styles.logNote}>{entry.note}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div style={{ ...styles.grid, marginTop: 16 }}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Appearance" subtitle="UI theme preference — stored per browser">
            <div style={styles.moduleText}>
              Choose between Bright Mode (light) and Dark Mode (dark). Your preference is saved to this browser&apos;s localStorage.
              This setting does not affect print layouts or customer-facing summaries, which always use a light theme.
            </div>
            <div style={styles.inlineActions}>
              <button
                type="button"
                data-testid="settings-theme-toggle"
                style={styles.primaryButton}
                onClick={onToggleTheme}
              >
                {themeMode === "bright" ? "Switch to Dark Mode 🌙" : "Switch to Bright Mode ☀️"}
              </button>
              <span style={{ fontSize: 13, color: "var(--text-secondary, #64748b)" }}>
                Current: <strong>{themeMode === "bright" ? "Bright Mode" : "Dark Mode"}</strong>
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function createEmptyMaintenanceRuleDraft(): MaintenanceIntervalRuleRecord {
  const now = new Date().toISOString();
  return {
    id: "",
    serviceKey: "",
    title: "",
    category: "Periodic Maintenance",
    kmInterval: "",
    timeIntervalValue: "",
    timeIntervalUnit: "",
    active: true,
    adminNote: "",
    make: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    createdAt: now,
    updatedAt: now,
  };
}

function createEmptyPricingDraft(): ServicePricingCatalogRecord {
  const now = new Date().toISOString();
  return {
    id: "",
    serviceKey: "",
    title: "",
    category: "General",
    basePrice: "",
    active: true,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export default SettingsPage;

const styles: Record<string, React.CSSProperties> = {
  pageContent: {
    width: "100%",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 16,
  },

  gridItem: {
    minWidth: 0,
  },

  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
    border: "1px solid rgba(29,78,216,0.16)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 28px rgba(5, 11, 29, 0.12)",
    height: "100%",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.3,
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },

  hintList: {
    margin: "8px 0 0 18px",
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.6,
  },

  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  moduleText: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#475569",
    marginBottom: 14,
  },

  toggleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    marginBottom: 12,
  },

  toggleCard: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 700,
  },

  ruleForm: {
    marginTop: 10,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  ruleFormHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  ruleFormGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },

  ruleList: {
    display: "grid",
    gap: 12,
  },

  ruleCard: {
    border: "1px solid #dbe4f0",
    borderRadius: 16,
    background: "#ffffff",
    padding: 14,
  },

  ruleCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  ruleField: {
    display: "grid",
    gap: 6,
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
  },

  ruleFieldWide: {
    display: "grid",
    gap: 6,
    gridColumn: "1 / -1",
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
  },

  inlineActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  primaryButton: {
    border: "none",
    borderRadius: 12,
    padding: "13px 16px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
  },

  secondaryButton: {
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: 12,
    padding: "13px 16px",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },

  smallPrimaryButton: {
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#1d4ed8",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  buttonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  quickAccessList: {
    display: "grid",
    gap: 10,
  },
  logList: {
    display: "grid",
    gap: 12,
  },
  logCard: {
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#fff",
    padding: 14,
    display: "grid",
    gap: 6,
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  logMeta: {
    fontSize: 13,
    color: "#64748b",
  },
  formHint: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748b",
  },
  emptyState: {
    border: "1px dashed #cbd5e1",
    borderRadius: 12,
    padding: 14,
    color: "#64748b",
    background: "#f8fafc",
  },
  logNote: {
    fontSize: 13,
    color: "#0f172a",
  },
  logError: {
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: 700,
  },
  inlineStatusRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  successPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 800,
    background: "#dcfce7",
    color: "#166534",
  },
  warningPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 800,
    background: "#fee2e2",
    color: "#991b1b",
  },
  neutralPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 800,
    background: "#e2e8f0",
    color: "#334155",
  },
  infoPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 800,
    background: "#dbeafe",
    color: "#1d4ed8",
  },
};
