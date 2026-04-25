import React from "react";
import type { SessionUser, UserRole, RoleDefinition, MaintenanceIntervalRuleRecord, ServicePricingCatalogRecord } from "../shared/types";
import { hasPermission } from "../shared/helpers";
import { OPENAI_ASSIST_LOG_STORAGE_KEY, type OpenAiAssistProviderMode, type OpenAiAssistLogEntry } from "../ai/openaiAssist";
import { DEFAULT_AI_MODULE_TOGGLES, getAiModuleLabel, readAiModuleToggles, saveAiModuleToggles, type AiModuleKey, type AiModuleToggleSettings } from "../ai/aiSafety";
import { cleanupInvalidJsonStorage, validateStoredRecords, type DataQualitySummary } from "../dataQuality/dataQualityHelpers";

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
