import React from "react";
import { normalizeAiAction, type AiAction } from "./aiFallback";
import type { OpenAiAssistLogEntry, OpenAiAssistProviderMode } from "./openaiAssist";
import { AI_GENERATED_DRAFT_LABEL, AI_REVIEW_CONFIRMATION_LABEL, AI_REVIEW_REMINDER, getAiOutputModeLabel, getAiOutputTemplateType, useAiOutputMode, type AiOutputMode } from "./aiSafety";

export type AiAssistDraftLike = {
  actionType: string;
  source: string;
  providerName?: "ollama" | "openai" | "fallback";
  generatedAt: string;
  note: string;
  model: string;
  warning?: string;
  errorMessage?: string;
  errorReason?: string;
  cached?: boolean;
  outputMode?: AiOutputMode;
  templateType?: string;
};

type AiAssistPanelProps = {
  action: AiAction;
  sourceModule: string;
  sourceText: string;
  draftText: string;
  draftMeta: AiAssistDraftLike | null;
  logs: OpenAiAssistLogEntry[];
  feedback: string;
  isGenerating: boolean;
  canUseAiAssist: boolean;
  accessMessage?: string;
  draftFromCache: boolean;
  reviewed: boolean;
  onReviewedChange: (nextReviewed: boolean) => void;
  actions?: AiAction[];
  providerMode: OpenAiAssistProviderMode;
  model: string;
  maxTokens: number;
  apiKeyConfigured: boolean;
  testIdPrefix?: string;
  onActionChange: (action: AiAction) => void;
  onGenerate: (action: AiAction) => void | Promise<void>;
  onDraftTextChange: (nextDraft: string) => void;
  onUseDraft: () => void;
  onCopyDraft: () => Promise<void> | void;
  onResetSource: () => void;
  useDraftLabel?: string;
};

const ACTIONS: AiAction[] = [
  "Fix Grammar",
  "Explain to Customer",
  "Summarize Inspection",
  "Draft Follow-Up Message",
  "Draft Release Summary",
];

export function AiAssistPanel({
  action,
  sourceModule,
  sourceText,
  draftText,
  draftMeta,
  logs,
  feedback,
  isGenerating,
  canUseAiAssist,
  accessMessage,
  draftFromCache,
  reviewed,
  onReviewedChange,
  actions = ACTIONS,
  providerMode,
  model,
  maxTokens,
  apiKeyConfigured,
  testIdPrefix = "openai-ai",
  onActionChange,
  onGenerate,
  onDraftTextChange,
  onUseDraft,
  onCopyDraft,
  onResetSource,
  useDraftLabel = "Use Draft",
}: AiAssistPanelProps) {
  const normalizedAction = normalizeAiAction(action);
  const [outputMode, setOutputMode] = useAiOutputMode();
  const fallbackModeLabel = providerMode === "Disabled" ? "Fallback only" : apiKeyConfigured ? "Ready" : "OpenAI fallback only";
  const sourceLength = sourceText.length;
  const lengthLimit = getActionSourceLimit(normalizedAction);
  const lengthWarning = sourceLength > lengthLimit;
  const providerBadge =
    draftMeta?.providerName === "ollama"
      ? { label: "Local AI (Free)", style: styles.badgeLocal }
      : draftMeta?.providerName === "openai"
        ? { label: "Cloud AI (Paid fallback)", style: styles.badgeCloud }
        : draftMeta?.providerName === "fallback"
          ? { label: "Template (No AI)", style: styles.badgeFallback }
          : { label: providerMode === "Disabled" ? "Template (No AI)" : apiKeyConfigured ? "OpenAI ready" : "OpenAI fallback only", style: providerMode === "Disabled" ? styles.badgeFallback : styles.badgeNeutral };
  return (
    <section style={styles.card} data-testid={`${testIdPrefix}-assist-panel`}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>OpenAI AI Assist</div>
          <div style={styles.subtitle}>Advisor-clicked drafts only. Review and edit before using the draft.</div>
        </div>
        <span style={providerBadge.style}>{providerBadge.label}</span>
      </div>

      <div style={styles.metaRow}>
        <span style={styles.metaPill}>Source: {sourceModule}</span>
        <span style={styles.metaPill}>Model: {model}</span>
        <span style={styles.metaPill}>Max tokens: {maxTokens}</span>
        <span style={styles.metaPill}>API key: {apiKeyConfigured ? "Loaded" : "Missing"}</span>
        <span style={styles.metaPill}>{fallbackModeLabel}</span>
        <span style={styles.metaPill}>Output: {getAiOutputModeLabel(outputMode)}</span>
        <span style={styles.metaPill}>Template: {getAiOutputTemplateType(outputMode)}</span>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Action</div>
        <div style={styles.outputModeRow}>
          <label style={styles.outputModeLabel}>
            <span>Output mode</span>
            <select
              data-testid={`${testIdPrefix}-output-mode`}
              style={styles.outputModeSelect}
              value={outputMode}
              onChange={(event) => {
                const next = event.target.value as AiOutputMode;
                setOutputMode(next);
              }}
            >
              <option value="Short">Short (SMS)</option>
              <option value="Standard">Standard</option>
              <option value="Detailed">Detailed (Report)</option>
            </select>
          </label>
          <div style={styles.outputModeNote}>
            {outputMode === "Short"
              ? "Short mode keeps drafts brief for SMS-style messages."
              : outputMode === "Detailed"
                ? "Detailed mode uses a report-style structure."
                : "Standard mode keeps the default workshop voice and structure."}
          </div>
        </div>
        <div style={styles.actionRow}>
          {actions.map((item) => (
            <button
              key={item}
              type="button"
              data-testid={`${testIdPrefix}-action-${item.replace(/[^\w]+/g, "-").toLowerCase()}`}
              style={normalizeAiAction(item) === normalizedAction ? styles.actionButtonActive : styles.actionButton}
              disabled={isGenerating || !canUseAiAssist}
              onClick={() => onActionChange(item)}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            data-testid={`${testIdPrefix}-generate-button`}
            style={styles.generateButton}
            disabled={!canUseAiAssist || !sourceText.trim() || isGenerating}
            onClick={() => void onGenerate(normalizedAction)}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
        {!canUseAiAssist ? <div style={styles.accessNote}>{accessMessage || "AI Assist is currently limited to Admin and Service Advisor roles."}</div> : null}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Source Text</div>
        {lengthWarning ? (
          <div style={styles.warningNote}>
            This source is long for {normalizedAction}. Consider trimming it to keep drafts shorter and cheaper.
            Recommended limit: {lengthLimit.toLocaleString()} characters. Current: {sourceLength.toLocaleString()}.
          </div>
        ) : (
          <div style={styles.helperNote}>Recommended limit: {lengthLimit.toLocaleString()} characters. Current: {sourceLength.toLocaleString()}.</div>
        )}
        <textarea
          data-testid={`${testIdPrefix}-source-textarea`}
          style={styles.sourceTextarea}
          value={sourceText}
          readOnly
        />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Draft Preview</div>
        <div style={styles.aiDraftLabel} data-testid={`${testIdPrefix}-ai-generated-label`}>
          {AI_GENERATED_DRAFT_LABEL}
        </div>
        {draftMeta?.templateType ? <div style={styles.cacheBadge}>Template: {draftMeta.templateType}</div> : null}
        {draftFromCache || draftMeta?.cached ? <div style={styles.cacheBadge}>Cached draft</div> : null}
        {draftMeta?.warning ? <div style={draftMeta.providerName === "fallback" ? styles.warningNote : styles.helperNote}>{draftMeta.warning}</div> : null}
        <div style={styles.reviewReminder}>{AI_REVIEW_REMINDER}</div>
        <label style={styles.reviewCheckboxRow}>
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(event) => onReviewedChange(event.target.checked)}
            data-testid={`${testIdPrefix}-review-checkbox`}
          />
          <span>{AI_REVIEW_CONFIRMATION_LABEL}</span>
        </label>
        <textarea
          data-testid={`${testIdPrefix}-draft-textarea`}
          style={styles.draftTextarea}
          value={draftText}
          onChange={(event) => {
            onReviewedChange(false);
            onDraftTextChange(event.target.value);
          }}
          placeholder="Click Generate to create a draft, then review and edit it here."
        />
        <div style={styles.actionRow}>
          <button type="button" data-testid={`${testIdPrefix}-use-button`} style={styles.primaryButton} disabled={!draftText.trim() || !reviewed} onClick={onUseDraft}>
            {useDraftLabel}
          </button>
          <button type="button" data-testid={`${testIdPrefix}-copy-button`} style={styles.secondaryButton} disabled={!draftText.trim() || !reviewed} onClick={() => void onCopyDraft()}>
            Copy Draft
          </button>
          <button type="button" style={styles.secondaryButton} disabled={!sourceText.trim()} onClick={onResetSource}>
            Reset to Source
          </button>
        </div>
        {!reviewed ? <div style={styles.reviewGateNote}>Review required before copying or using this draft.</div> : null}
      </div>

      {draftMeta ? (
        <div style={styles.noteCard}>
          <div><strong>Generated:</strong> {new Date(draftMeta.generatedAt).toLocaleString()}</div>
          <div><strong>Source:</strong> {draftMeta.source}</div>
          <div><strong>Action:</strong> {draftMeta.actionType}</div>
          {draftMeta.note ? <div>{draftMeta.note}</div> : null}
          {draftMeta.errorMessage ? <div><strong>Error:</strong> {draftMeta.errorMessage}</div> : null}
        </div>
      ) : null}

      {feedback ? <div style={styles.noteCard}>{feedback}</div> : null}

      <div style={styles.section}>
        <div style={styles.sectionLabel}>AI Log</div>
        {logs.length === 0 ? (
          <div style={styles.emptyState}>No AI actions logged yet.</div>
        ) : (
          <div style={styles.logList}>
            {logs.slice(0, 5).map((entry) => (
              <div key={entry.id} style={styles.logCard} data-testid={`${testIdPrefix}-log-${entry.id}`}>
                <div style={styles.logHeader}>
                  <strong>{entry.actionType}</strong>
                  <span style={entry.status === "Success" ? styles.statusSuccess : styles.statusFailure}>{entry.status}</span>
                </div>
                <div style={styles.logMeta}>Source module: {entry.sourceModule || sourceModule}</div>
                {entry.user ? <div style={styles.logMeta}>User: {entry.user}</div> : null}
                {entry.role ? <div style={styles.logMeta}>Role: {entry.role}</div> : null}
                <div style={styles.logMeta}>Model: {entry.model}</div>
                {entry.outputMode ? <div style={styles.logMeta}>Output mode: {entry.outputMode}</div> : null}
                {entry.templateType ? <div style={styles.logMeta}>Template type: {entry.templateType}</div> : null}
                <div style={styles.logMeta}>{new Date(entry.generatedAt).toLocaleString()}</div>
                {entry.reviewedAt ? <div style={styles.logMeta}>Reviewed at: {new Date(entry.reviewedAt).toLocaleString()}</div> : null}
                {entry.usedAt ? <div style={styles.logMeta}>Used at: {new Date(entry.usedAt).toLocaleString()}</div> : null}
                {entry.copiedAt ? <div style={styles.logMeta}>Copied at: {new Date(entry.copiedAt).toLocaleString()}</div> : null}
                {entry.safetyLabel ? <div style={styles.logMeta}>{entry.safetyLabel}</div> : null}
                {entry.warningReason ? <div style={styles.logMeta}>Warning: {entry.warningReason}</div> : null}
                {entry.errorMessage ? <div style={styles.logError}>{entry.errorMessage}</div> : null}
                {typeof entry.success === "boolean" ? <div style={styles.logMeta}>Success: {entry.success ? "Yes" : "No"}</div> : null}
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
  badgeActive: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800,
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
  outputModeRow: {
    display: "grid",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  outputModeLabel: {
    display: "grid",
    gap: 6,
    fontSize: 12,
    fontWeight: 800,
    color: "#334155",
  },
  outputModeSelect: {
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    padding: "10px 12px",
    background: "#fff",
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 700,
  },
  outputModeNote: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.5,
    fontWeight: 600,
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
  actionButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  actionButtonActive: {
    border: "1px solid #2563eb",
    background: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },
  generateButton: {
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },
  primaryButton: {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  sourceTextarea: {
    minHeight: 180,
    width: "100%",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    padding: 14,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 1.6,
    resize: "vertical",
    background: "#f8fafc",
    color: "#0f172a",
  },
  draftTextarea: {
    minHeight: 240,
    width: "100%",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    padding: 14,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 1.6,
    resize: "vertical",
    background: "#fff",
    color: "#0f172a",
  },
  noteCard: {
    padding: 12,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.6,
    display: "grid",
    gap: 6,
  },
  emptyState: {
    padding: 12,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    color: "#64748b",
    fontSize: 13,
  },
  logList: {
    display: "grid",
    gap: 10,
  },
  logCard: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#fff",
    display: "grid",
    gap: 6,
  },
  logHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statusSuccess: {
    padding: "4px 8px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800,
  },
  statusFailure: {
    padding: "4px 8px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: 12,
    fontWeight: 800,
  },
  logMeta: {
    fontSize: 12,
    color: "#64748b",
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
  accessNote: {
    padding: 12,
    borderRadius: 12,
    background: "#fff7ed",
    border: "1px solid #fdba74",
    color: "#9a3412",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 600,
  },
  warningNote: {
    padding: 12,
    borderRadius: 12,
    background: "#fef3c7",
    border: "1px solid #fbbf24",
    color: "#92400e",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 600,
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
  reviewGateNote: {
    padding: 12,
    borderRadius: 12,
    background: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 700,
  },
  cacheBadge: {
    display: "inline-flex",
    alignSelf: "flex-start",
    padding: "5px 10px",
    borderRadius: 999,
    background: "#ede9fe",
    border: "1px solid #c4b5fd",
    color: "#6d28d9",
    fontSize: 12,
    fontWeight: 800,
  },
};

function getActionSourceLimit(action: AiAction) {
  switch (action) {
    case "Fix Grammar":
    case "fixGrammar":
      return 2000;
    case "Explain Finding":
    case "Explain to Customer":
    case "Explain Inspection Finding":
    case "explainFinding":
      return 1600;
    case "Customer Inspection Report":
      return 2400;
    case "Summarize Inspection":
    case "summarizeInspection":
      return 2400;
    case "Draft Follow-Up Message":
    case "followUpMessage":
      return 1200;
    case "Draft Release Summary":
    case "releaseSummary":
      return 2200;
    case "Approval Request":
      return 2200;
    case "Waiting Parts Update":
      return 1600;
    case "Release Ready Notice":
      return 1800;
    case "Pull-Out Notice":
      return 1800;
    case "Overdue Maintenance Reminder":
      return 1400;
    case "Due Soon Maintenance Reminder":
      return 1400;
    case "Post-Service Follow-Up":
      return 1200;
    case "Backjob / Recheck Update":
      return 2000;
    case "SMS Update":
    case "smsUpdate":
      return 800;
    case "QC Summary":
    case "qcSummary":
      return 2000;
    case "customerInspectionReport":
      return 2400;
    case "backJobExplanation":
      return 2000;
    case "estimateExplanation":
      return 1800;
  }
  return 1600;
}
