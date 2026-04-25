import React from "react";
import { generateAiDraft } from "./aiHybridService";
import { AI_GENERATED_DRAFT_LABEL, AI_REVIEW_CONFIRMATION_LABEL, AI_REVIEW_REMINDER, getAiAccessMessage, isAllowedAiRole, type AiModuleKey, useAiModuleEnabled } from "./aiSafety";
import { OPENAI_ASSIST_LOG_STORAGE_KEY, type OpenAiAssistLogEntry, type OpenAiAssistProviderMode } from "./openaiAssist";
import type { AiAction as OllamaAiAction, AiProviderName } from "./ollamaProvider";
import {
  buildReportBuilderSourceText,
  getReportBuilderAction,
  REPORT_BUILDER_REPORT_TYPES,
  REPORT_BUILDER_SOURCE_MODULES,
  type ReportBuilderDraftMeta,
  type ReportBuilderReportType,
  type ReportBuilderSourceData,
  type ReportBuilderSourceModule,
} from "./reportBuilder";

type ReportBuilderPanelProps = {
  currentUserRole: string;
  currentUserName?: string;
  moduleKey: AiModuleKey;
  sourceData: ReportBuilderSourceData;
  logs: OpenAiAssistLogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<OpenAiAssistLogEntry[]>>;
  testIdPrefix?: string;
};

type StoredSettings = {
  providerMode: OpenAiAssistProviderMode;
  model: string;
  maxTokens: number;
  apiKeyConfigured: boolean;
};

const SETTINGS_PROVIDER_KEY = "dvi_openai_assist_provider_mode_v1";
const SETTINGS_MODEL_KEY = "dvi_openai_assist_model_v1";
const SETTINGS_MAX_TOKENS_KEY = "dvi_openai_assist_max_tokens_v1";

function readStoredSetting(key: string) {
  try {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function useStoredSettings(): StoredSettings {
  const providerMode = React.useMemo<OpenAiAssistProviderMode>(() => {
    const stored = readStoredSetting(SETTINGS_PROVIDER_KEY);
    return stored === "OpenAI" ? "OpenAI" : "Disabled";
  }, []);
  const model = React.useMemo(() => readStoredSetting(SETTINGS_MODEL_KEY) || "gpt-4.1-mini", []);
  const maxTokens = React.useMemo(() => {
    const stored = Number(readStoredSetting(SETTINGS_MAX_TOKENS_KEY));
    return Number.isFinite(stored) && stored > 0 ? Math.max(32, Math.min(4000, Math.round(stored))) : 240;
  }, []);

  return {
    providerMode,
    model: model.trim() || "gpt-4.1-mini",
    maxTokens,
    apiKeyConfigured: !!String(import.meta.env.VITE_OPENAI_API_KEY ?? "").trim(),
  };
}

function writeLogStorage(nextLogs: OpenAiAssistLogEntry[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(OPENAI_ASSIST_LOG_STORAGE_KEY, JSON.stringify(nextLogs));
  } catch {
    // Advisory only.
  }
}

function providerBadge(providerName?: AiProviderName, providerMode?: OpenAiAssistProviderMode, apiKeyConfigured?: boolean) {
  if (providerName === "ollama") return { label: "Local AI (Free)", style: styles.badgeLocal };
  if (providerName === "openai") return { label: "Cloud AI (Paid fallback)", style: styles.badgeCloud };
  if (providerName === "fallback") return { label: "Template (No AI)", style: styles.badgeFallback };
  if (providerMode === "Disabled") return { label: "Template (No AI)", style: styles.badgeFallback };
  return apiKeyConfigured ? { label: "OpenAI fallback only", style: styles.badgeNeutral } : { label: "Template (No AI)", style: styles.badgeFallback };
}

function createLogId() {
  return `ai_report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ReportBuilderPanel({
  currentUserRole,
  currentUserName,
  moduleKey,
  sourceData,
  logs,
  setLogs,
  testIdPrefix = "ai-report",
}: ReportBuilderPanelProps) {
  const settings = useStoredSettings();
  const moduleEnabled = useAiModuleEnabled(moduleKey);
  const canUseAiAssist = isAllowedAiRole(currentUserRole) && moduleEnabled;
  const [reportType, setReportType] = React.useState<ReportBuilderReportType>("Customer Inspection Report");
  const [sourceModule, setSourceModule] = React.useState<ReportBuilderSourceModule>("inspection");
  const [draftText, setDraftText] = React.useState("");
  const [draftMeta, setDraftMeta] = React.useState<ReportBuilderDraftMeta | null>(null);
  const [feedback, setFeedback] = React.useState("Select a report type and source, then generate a draft.");
  const [draftFromCache, setDraftFromCache] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [reviewed, setReviewed] = React.useState(false);
  const [reviewedAt, setReviewedAt] = React.useState("");
  const [logNote, setLogNote] = React.useState("");
  const [customerSummaryText, setCustomerSummaryText] = React.useState("");
  const [printPreview, setPrintPreview] = React.useState(false);

  const sourceText = React.useMemo(
    () => buildReportBuilderSourceText(reportType, sourceModule, sourceData),
    [reportType, sourceData, sourceModule]
  );

  React.useEffect(() => {
    setDraftText(sourceText);
    setDraftMeta(null);
    setDraftFromCache(false);
    setReviewed(false);
    setReviewedAt("");
    setLogNote("");
    setCustomerSummaryText("");
    setPrintPreview(false);
    setFeedback("Select a report type and source, then generate a draft.");
  }, [sourceText]);

  const appendLog = React.useCallback(
    (
      entry: Partial<OpenAiAssistLogEntry> & Pick<OpenAiAssistLogEntry, "status" | "note">,
      sourceModuleOverride?: ReportBuilderSourceModule
    ) => {
      const logEntry: OpenAiAssistLogEntry = {
        id: createLogId(),
        actionType: getReportBuilderAction(reportType),
        sourceModule: sourceModuleOverride || sourceModule,
        status: entry.status,
        generatedAt: new Date().toISOString(),
        provider: "OpenAI",
        model: settings.model,
        note: entry.note,
        errorMessage: entry.errorMessage,
        providerName: entry.providerName,
        reviewed: entry.reviewed ?? reviewed,
        reviewedAt: entry.reviewedAt ?? reviewedAt,
        copied: entry.copied,
        copiedAt: entry.copiedAt,
        used: entry.used,
        usedAt: entry.usedAt,
        user: currentUserName,
        role: currentUserRole,
        messageType: reportType,
        sourceContext: sourceModuleOverride || sourceModule,
        logNote: logNote.trim() || undefined,
        success: entry.success,
        warningReason: entry.warningReason,
        safetyLabel: entry.safetyLabel,
        moduleEnabled,
      };
      setLogs((prev) => {
        const nextLogs = [logEntry, ...prev].slice(0, 60);
        writeLogStorage(nextLogs);
        return nextLogs;
      });
    },
    [currentUserName, currentUserRole, logNote, moduleEnabled, reportType, reviewed, reviewedAt, setLogs, settings.model, sourceModule]
  );

  const generate = React.useCallback(async () => {
    if (!canUseAiAssist) {
      setFeedback(getAiAccessMessage(moduleKey, currentUserRole, moduleEnabled));
      return;
    }

    setIsGenerating(true);
    try {
      const aiAction = getReportBuilderAction(reportType) as OllamaAiAction;
      const result = await generateAiDraft(aiAction, sourceText, {
        preferLocal: true,
        model: settings.model,
        timeoutMs: 20_000,
      });

      const meta: ReportBuilderDraftMeta = {
        reportType,
        sourceModule,
        providerName: result.provider,
        generatedAt: new Date().toISOString(),
        note:
          result.warning ||
          (result.provider === "ollama"
            ? "Local AI draft generated successfully."
            : result.provider === "openai"
              ? "OpenAI draft generated successfully."
              : "AI unavailable. Using template response."),
        model: settings.model,
        warning: result.warning,
        errorReason: result.errorReason,
        errorMessage: result.errorReason,
        cached: result.cached,
      };

      setDraftText(result.text);
      setDraftMeta(meta);
      setDraftFromCache(!!result.cached);
      setReviewed(false);
      setReviewedAt("");
      setCustomerSummaryText("");
      setFeedback(meta.note);

      appendLog(
        {
          status: (result.provider === "fallback" ? "Failure" : "Success") as OpenAiAssistLogEntry["status"],
          note: meta.note,
          errorMessage: result.errorReason,
          providerName: result.provider,
          reviewed: false,
          reviewedAt: "",
          copied: false,
          copiedAt: "",
          used: false,
          usedAt: "",
          user: currentUserName,
          role: currentUserRole,
          success: result.provider !== "fallback",
          warningReason: result.warning || result.errorReason,
          safetyLabel: "AI-generated draft - review before use",
        },
        sourceModule
      );
    } finally {
      setIsGenerating(false);
    }
  }, [appendLog, canUseAiAssist, currentUserName, currentUserRole, moduleEnabled, moduleKey, reportType, settings.model, sourceModule, sourceText]);

  const copyDraft = React.useCallback(async () => {
    if (!reviewed) {
      const message = "Review confirmation is required before copying this report.";
      setFeedback(message);
      appendLog(
        {
          status: "Failure",
          note: message,
          reviewed: false,
          reviewedAt: reviewedAt || "",
          copied: false,
          copiedAt: "",
          used: false,
          usedAt: "",
          user: currentUserName,
          role: currentUserRole,
          success: false,
          warningReason: message,
          safetyLabel: "AI-generated draft - review before use",
        },
        sourceModule
      );
      return;
    }
    try {
      await navigator.clipboard.writeText(draftText);
      setFeedback("Report copied to clipboard.");
      const copiedAt = new Date().toISOString();
      appendLog(
        {
          status: "Success",
          note: "AI report copied to clipboard.",
          copied: true,
          copiedAt,
          reviewed: true,
          reviewedAt: reviewedAt || copiedAt,
          used: false,
          usedAt: "",
          user: currentUserName,
          role: currentUserRole,
          success: true,
          safetyLabel: "AI-generated draft - review before use",
        },
        sourceModule
      );
    } catch {
      setFeedback("Clipboard copy failed. Please copy manually.");
      appendLog(
        {
          status: "Failure",
          note: "AI report copy failed.",
          reviewed,
          reviewedAt: reviewedAt || "",
          copied: false,
          copiedAt: "",
          used: false,
          usedAt: "",
          user: currentUserName,
          role: currentUserRole,
          success: false,
          warningReason: "Clipboard copy failed.",
          safetyLabel: "AI-generated draft - review before use",
        },
        sourceModule
      );
    }
  }, [appendLog, currentUserName, currentUserRole, draftText, reviewed, reviewedAt, sourceModule]);

  const useDraft = React.useCallback(() => {
    if (!reviewed) {
      const message = "Review confirmation is required before applying this report.";
      setFeedback(message);
      appendLog(
        {
          status: "Failure",
          note: message,
          reviewed: false,
          reviewedAt: reviewedAt || "",
          copied: false,
          copiedAt: "",
          used: false,
          usedAt: "",
          user: currentUserName,
          role: currentUserRole,
          success: false,
          warningReason: message,
          safetyLabel: "AI-generated draft - review before use",
        },
        sourceModule
      );
      return;
    }
    const usedAt = new Date().toISOString();
    setCustomerSummaryText(draftText);
    setFeedback("Report applied to the customer summary preview.");
    appendLog(
      {
        status: "Success",
        note: logNote.trim() || "AI report applied to the customer summary preview.",
        used: true,
        usedAt,
        reviewed,
        reviewedAt: reviewedAt || usedAt,
        copied: false,
        copiedAt: "",
        user: currentUserName,
        role: currentUserRole,
        success: true,
        safetyLabel: "AI-generated draft - review before use",
      },
      sourceModule
    );
  }, [appendLog, currentUserName, currentUserRole, draftText, logNote, reviewed, reviewedAt, sourceModule]);

  const markReviewed = React.useCallback(() => {
    const now = new Date().toISOString();
    setReviewed(true);
    setReviewedAt(now);
    setFeedback("Report marked as reviewed.");
    appendLog(
      {
        status: "Success",
        note: logNote.trim() || "AI report marked as reviewed.",
        reviewed: true,
        reviewedAt: now,
        copied: false,
        copiedAt: "",
        used: false,
        usedAt: "",
        user: currentUserName,
        role: currentUserRole,
        success: true,
        safetyLabel: "AI-generated draft - review before use",
      },
      sourceModule
    );
  }, [appendLog, currentUserName, currentUserRole, logNote, sourceModule]);

  const provider = providerBadge(draftMeta?.providerName, settings.providerMode, settings.apiKeyConfigured);
  const sourceSummary = [
    { label: "Customer", value: sourceData.vehicle.customerName || "Customer" },
    { label: "Vehicle", value: [sourceData.vehicle.year, sourceData.vehicle.make, sourceData.vehicle.model].filter(Boolean).join(" ") || "Vehicle" },
    { label: "Plate", value: sourceData.vehicle.plateNumber || "-" },
    { label: "Current KM", value: typeof sourceData.vehicle.currentMileage === "number" ? sourceData.vehicle.currentMileage.toLocaleString() : "-" },
  ];

  return (
    <section style={styles.card} data-testid={`${testIdPrefix}-panel`}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>AI Report Builder</div>
          <div style={styles.subtitle}>
            Build customer-friendly reports from the live inspection, RO, QC, release, backjob, and maintenance timeline data.
          </div>
        </div>
        <span style={provider.style} data-testid={`${testIdPrefix}-provider-badge`}>
          {provider.label}
        </span>
      </div>

      <div style={styles.metaRow}>
        <span style={styles.metaPill}>Source module: {sourceModule}</span>
        <span style={styles.metaPill}>Report type: {reportType}</span>
        <span style={styles.metaPill}>AI mode: {settings.providerMode}</span>
        <span style={styles.metaPill}>Model: {settings.model}</span>
        <span style={styles.metaPill}>Max tokens: {settings.maxTokens}</span>
        <span style={styles.metaPill}>API key: {settings.apiKeyConfigured ? "Loaded" : "Missing"}</span>
      </div>

      {!canUseAiAssist ? <div style={styles.accessNote}>AI Assist is currently limited to Admin and Service Advisor roles.</div> : null}

      <div style={styles.summaryGrid}>
        {sourceSummary.map((item) => (
          <div key={item.label} style={styles.summaryTile}>
            <div style={styles.summaryLabel}>{item.label}</div>
            <div style={styles.summaryValue}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={styles.formGrid}>
        <label style={styles.fieldGroup}>
          <span style={styles.label}>Report Type</span>
          <select
            data-testid={`${testIdPrefix}-report-type`}
            style={styles.select}
            value={reportType}
            onChange={(event) => setReportType(event.target.value as ReportBuilderReportType)}
          >
            {REPORT_BUILDER_REPORT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.fieldGroup}>
          <span style={styles.label}>Source</span>
          <select
            data-testid={`${testIdPrefix}-source-module`}
            style={styles.select}
            value={sourceModule}
            onChange={(event) => setSourceModule(event.target.value as ReportBuilderSourceModule)}
          >
            {REPORT_BUILDER_SOURCE_MODULES.map((item) => (
              <option key={item} value={item}>
                {item === "repair order" ? "Repair Order" : item === "QC" ? "QC" : item === "maintenance timeline" ? "Maintenance Timeline" : item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={styles.helperNote}>
        The draft is always editable. Use the source selector to frame the report from the live module data before generating.
      </div>
      <div style={styles.aiDraftLabel} data-testid={`${testIdPrefix}-ai-generated-label`}>
        {AI_GENERATED_DRAFT_LABEL}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Source Text</div>
        <textarea data-testid={`${testIdPrefix}-source-textarea`} style={styles.sourceTextarea} value={sourceText} readOnly />
      </div>

      <div style={styles.section}>
        <div style={styles.actionRow}>
          <button
            type="button"
            data-testid={`${testIdPrefix}-generate-button`}
            style={styles.primaryButton}
            disabled={!canUseAiAssist || isGenerating}
            onClick={() => void generate()}
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </button>
          <button type="button" data-testid={`${testIdPrefix}-copy-button`} style={styles.secondaryButton} disabled={!draftText.trim() || !reviewed} onClick={() => void copyDraft()}>
            Copy Report
          </button>
          <button type="button" data-testid={`${testIdPrefix}-use-button`} style={styles.secondaryButton} disabled={!draftText.trim() || !reviewed} onClick={useDraft}>
            Use as Customer Summary
          </button>
          <button type="button" data-testid={`${testIdPrefix}-print-preview-button`} style={styles.secondaryButton} onClick={() => setPrintPreview((prev) => !prev)}>
            {printPreview ? "Close Print View" : "Print-friendly view"}
          </button>
          <button type="button" data-testid={`${testIdPrefix}-reviewed-button`} style={styles.secondaryButton} onClick={markReviewed}>
            Mark as reviewed
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Draft Preview</div>
        {draftFromCache || draftMeta?.cached ? <div style={styles.cacheBadge}>Cached draft</div> : null}
        {draftMeta?.warning ? <div style={draftMeta.providerName === "fallback" ? styles.warningNote : styles.helperNote}>{draftMeta.warning}</div> : null}
        <textarea
          data-testid={`${testIdPrefix}-draft-textarea`}
          style={styles.draftTextarea}
          value={draftText}
          onChange={(event) => {
            setDraftText(event.target.value);
            setReviewed(false);
            setReviewedAt("");
          }}
          placeholder="Generate a report draft, then review and edit it here."
        />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Customer Summary Preview</div>
        <textarea
          data-testid={`${testIdPrefix}-customer-summary-textarea`}
          style={styles.summaryTextarea}
          value={customerSummaryText}
          onChange={(event) => {
            setCustomerSummaryText(event.target.value);
            setReviewed(false);
            setReviewedAt("");
          }}
          placeholder="Click 'Use as Customer Summary' to move the draft here."
        />
      </div>

      <div style={styles.reviewGrid}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Optional Log Note</label>
          <textarea
            data-testid={`${testIdPrefix}-log-note`}
            style={styles.textarea}
            value={logNote}
            onChange={(event) => setLogNote(event.target.value)}
            placeholder="Add a short advisor note for this AI report"
          />
        </div>
        <div style={styles.inlineActions}>
          <div style={styles.feedbackCard}>{feedback}</div>
          <div style={styles.reviewState}>{reviewed ? "Reviewed" : "Not reviewed yet"}</div>
        </div>
      </div>
      <div style={styles.reviewReminder}>{AI_REVIEW_REMINDER}</div>
      <label style={styles.reviewCheckboxRow}>
        <input
          type="checkbox"
          checked={reviewed}
          onChange={(event) => {
            const next = event.target.checked;
            setReviewed(next);
            setReviewedAt(next ? new Date().toISOString() : "");
          }}
          data-testid={`${testIdPrefix}-review-checkbox`}
        />
        <span>{AI_REVIEW_CONFIRMATION_LABEL}</span>
      </label>

      {draftMeta ? (
        <div style={styles.noteCard}>
          <div><strong>Generated:</strong> {new Date(draftMeta.generatedAt).toLocaleString()}</div>
          <div><strong>Source:</strong> {draftMeta.sourceModule}</div>
          <div><strong>Report:</strong> {draftMeta.reportType}</div>
          {draftMeta.note ? <div>{draftMeta.note}</div> : null}
          {draftMeta.errorMessage ? <div><strong>Error:</strong> {draftMeta.errorMessage}</div> : null}
        </div>
      ) : null}

      {printPreview ? (
        <div style={styles.printPreviewCard} data-testid={`${testIdPrefix}-print-view`}>
          <div style={styles.sectionLabel}>Print-Friendly View</div>
          <div style={styles.printPreviewMeta}>
            <span>Customer: {sourceData.vehicle.customerName || "Customer"}</span>
            <span>Vehicle: {[sourceData.vehicle.year, sourceData.vehicle.make, sourceData.vehicle.model].filter(Boolean).join(" ") || "Vehicle"}</span>
            <span>Plate: {sourceData.vehicle.plateNumber || "-"}</span>
          </div>
          <pre style={styles.printPreviewText}>{draftText || sourceText}</pre>
          <button type="button" style={styles.secondaryButton} onClick={() => window.print()}>
            Print
          </button>
        </div>
      ) : null}

      <div style={styles.section}>
        <div style={styles.sectionLabel}>AI Log</div>
        {logs.length === 0 ? (
          <div style={styles.emptyState}>No AI actions logged yet.</div>
        ) : (
          <div style={styles.logList}>
            {logs.slice(0, 5).map((entry) => (
              <div key={entry.id} style={styles.logCard} data-testid={`${testIdPrefix}-log-${entry.id}`}>
                <div style={styles.logHeader}>
                  <strong>{entry.messageType || entry.actionType}</strong>
                  <span style={entry.status === "Success" ? styles.statusSuccess : styles.statusFailure}>{entry.status}</span>
                </div>
                <div style={styles.logMeta}>Source module: {entry.sourceModule || sourceModule}</div>
                <div style={styles.logMeta}>Action: {entry.actionType}</div>
                <div style={styles.logMeta}>Model: {entry.model}</div>
                <div style={styles.logMeta}>{new Date(entry.generatedAt).toLocaleString()}</div>
                {entry.providerName ? <div style={styles.logMeta}>Provider: {entry.providerName}</div> : null}
                {entry.reviewed ? <div style={styles.logMeta}>Reviewed: Yes</div> : null}
                {entry.copied ? <div style={styles.logMeta}>Copied: Yes</div> : null}
                {entry.used ? <div style={styles.logMeta}>Used: Yes</div> : null}
                {entry.logNote ? <div style={styles.logNote}>{entry.logNote}</div> : null}
                {entry.errorMessage ? <div style={styles.logError}>{entry.errorMessage}</div> : null}
                <div style={styles.logNote}>{entry.note}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: 18,
    padding: 18,
    border: "1px solid rgba(148,163,184,0.25)",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
    display: "grid",
    gap: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  badgeNeutral: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
  },
  badgeLocal: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800,
  },
  badgeCloud: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 800,
  },
  badgeFallback: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#e5e7eb",
    color: "#374151",
    fontSize: 12,
    fontWeight: 800,
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    padding: "5px 10px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#3730a3",
    fontSize: 12,
    fontWeight: 700,
  },
  accessNote: {
    padding: 12,
    borderRadius: 12,
    background: "#fef3c7",
    border: "1px solid #fde68a",
    color: "#92400e",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 700,
  },
  summaryGrid: {
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  },
  summaryTile: {
    padding: 12,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
    wordBreak: "break-word",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  fieldGroup: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a",
  },
  select: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    padding: "10px 12px",
    background: "#fff",
    color: "#0f172a",
    fontSize: 14,
  },
  helperNote: {
    padding: 12,
    borderRadius: 12,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 600,
  },
  aiDraftLabel: {
    padding: "8px 12px",
    borderRadius: 12,
    background: "#ecfccb",
    border: "1px solid #bef264",
    color: "#365314",
    fontSize: 13,
    fontWeight: 800,
  },
  warningNote: {
    padding: 12,
    borderRadius: 12,
    background: "#fef3c7",
    border: "1px solid #fde68a",
    color: "#92400e",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 700,
  },
  section: {
    display: "grid",
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a",
  },
  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    border: "1px solid #1d4ed8",
    background: "#1d4ed8",
    color: "#ffffff",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    minHeight: 42,
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 42,
  },
  sourceTextarea: {
    minHeight: 140,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    padding: 12,
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.5,
    resize: "vertical",
    background: "#f8fafc",
    color: "#0f172a",
  },
  draftTextarea: {
    minHeight: 220,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    padding: 12,
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.5,
    resize: "vertical",
    background: "#fff",
    color: "#0f172a",
  },
  summaryTextarea: {
    minHeight: 140,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    padding: 12,
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.5,
    resize: "vertical",
    background: "#fff",
    color: "#0f172a",
  },
  textarea: {
    minHeight: 96,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    padding: 12,
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.5,
    resize: "vertical",
    background: "#fff",
    color: "#0f172a",
  },
  cacheBadge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800,
    width: "fit-content",
  },
  reviewGrid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  },
  reviewReminder: {
    padding: 12,
    borderRadius: 12,
    background: "#fef3c7",
    border: "1px solid #fde68a",
    color: "#92400e",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 700,
  },
  reviewCheckboxRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },
  inlineActions: {
    display: "grid",
    gap: 10,
    alignContent: "start",
  },
  feedbackCard: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "#f8fafc",
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.5,
  },
  reviewState: {
    padding: "8px 10px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#3730a3",
    fontSize: 12,
    fontWeight: 800,
    width: "fit-content",
  },
  noteCard: {
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 14,
    background: "#f8fafc",
    padding: 12,
    display: "grid",
    gap: 6,
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.5,
  },
  printPreviewCard: {
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: 16,
    background: "#ffffff",
    padding: 14,
    display: "grid",
    gap: 10,
  },
  printPreviewMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
  },
  printPreviewText: {
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.6,
    color: "#0f172a",
    background: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 12,
  },
  emptyState: {
    border: "1px dashed rgba(148, 163, 184, 0.55)",
    background: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },
  logList: {
    display: "grid",
    gap: 10,
  },
  logCard: {
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "#ffffff",
    padding: 12,
    display: "grid",
    gap: 4,
  },
  logHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  logMeta: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.4,
  },
  logNote: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 1.5,
  },
  logError: {
    fontSize: 12,
    color: "#991b1b",
    lineHeight: 1.5,
  },
  statusSuccess: {
    padding: "4px 8px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontSize: 11,
    fontWeight: 800,
  },
  statusFailure: {
    padding: "4px 8px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: 11,
    fontWeight: 800,
  },
};



