import React from "react";
import { AiAssistPanel } from "./AiAssistPanel";
import {
  CUSTOMER_MESSAGE_ACTIONS,
  CUSTOMER_MESSAGE_SOURCE_CONTEXTS,
  type CustomerMessageComposerAction,
  type CustomerMessageSourceContext,
  useCustomerMessageComposerController,
} from "./customerMessageComposer";
import type { OpenAiAssistLogEntry, OpenAiAssistProviderMode } from "./openaiAssist";

type CustomerMessageComposerPanelProps = {
  sourceModule: string;
  currentUserRole: string;
  currentUserName?: string;
  moduleKey: "messages";
  buildSourceText: (action: CustomerMessageComposerAction, sourceContext: CustomerMessageSourceContext) => string;
  providerMode: OpenAiAssistProviderMode;
  model: string;
  maxTokens: number;
  apiKeyConfigured: boolean;
  logs: OpenAiAssistLogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<OpenAiAssistLogEntry[]>>;
  customerName?: string;
  vehicleLabel?: string;
  roNumber?: string;
  defaultAction?: CustomerMessageComposerAction;
  defaultSourceContext?: CustomerMessageSourceContext;
  onApplyDraft: (draftText: string) => void;
  testIdPrefix?: string;
};

export function CustomerMessageComposerPanel({
  sourceModule,
  currentUserRole,
  currentUserName,
  moduleKey,
  buildSourceText,
  providerMode,
  model,
  maxTokens,
  apiKeyConfigured,
  logs,
  setLogs,
  customerName,
  vehicleLabel,
  roNumber,
  defaultAction = "Approval Request",
  defaultSourceContext = "RO",
  onApplyDraft,
  testIdPrefix = "customer-message",
}: CustomerMessageComposerPanelProps) {
  const controller = useCustomerMessageComposerController({
    sourceModule,
    currentUserRole,
    currentUserName,
    moduleKey,
    buildSourceText,
    logs,
    setLogs,
    providerMode,
    model,
    maxTokens,
    apiKeyConfigured,
    defaultAction,
    defaultSourceContext,
  });

  const summaryItems = [
    { label: "Customer", value: customerName || "Customer" },
    { label: "Vehicle", value: vehicleLabel || "-" },
    { label: "RO", value: roNumber || "-" },
    { label: "Context", value: controller.sourceContext },
  ];

  return (
    <section data-testid={`${testIdPrefix}-panel`} style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Customer Message Composer</div>
          <div style={styles.subtitle}>
            Draft short, customer-friendly SMS messages from the live RO, inspection, release, maintenance, or backjob context.
          </div>
        </div>
        <span style={styles.roleBadge}>{controller.canUseAiAssist ? "Advisor AI" : "Restricted"}</span>
      </div>

      <div style={styles.summaryGrid}>
        {summaryItems.map((item) => (
          <div key={item.label} style={styles.summaryTile}>
            <div style={styles.summaryLabel}>{item.label}</div>
            <div style={styles.summaryValue}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Source Context</label>
        <select
          data-testid={`${testIdPrefix}-source-context`}
          style={styles.select}
          value={controller.sourceContext}
          onChange={(event) => controller.setSourceContext(event.target.value as CustomerMessageSourceContext)}
        >
          {CUSTOMER_MESSAGE_SOURCE_CONTEXTS.map((item) => (
            <option key={item} value={item}>
              {item === "RO" ? "RO" : item === "inspection" ? "Inspection" : item === "maintenance item" ? "Maintenance Item" : item === "release" ? "Release" : "Backjob"}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.helperNote}>
        The draft is always editable. Use the message buttons to switch between approval, reminder, release, follow-up, and backjob messaging.
      </div>

      <AiAssistPanel
        action={controller.action}
        sourceModule={sourceModule}
        sourceText={controller.sourceText}
        draftText={controller.draftText}
        draftMeta={controller.draftMeta}
        logs={controller.logs}
        feedback={controller.feedback}
        isGenerating={controller.isGenerating}
        canUseAiAssist={controller.canUseAiAssist}
        accessMessage={controller.accessMessage}
        draftFromCache={controller.draftFromCache}
        reviewed={controller.reviewed}
        onReviewedChange={controller.setReviewed}
        actions={CUSTOMER_MESSAGE_ACTIONS as any}
        providerMode={providerMode}
        model={model}
        maxTokens={maxTokens}
        apiKeyConfigured={apiKeyConfigured}
        testIdPrefix={testIdPrefix}
        useDraftLabel="Use in SMS template"
        onActionChange={(nextAction) => controller.setAction(nextAction as CustomerMessageComposerAction)}
        onGenerate={(nextAction) => void controller.generate(nextAction as CustomerMessageComposerAction)}
        onDraftTextChange={controller.setDraftText}
        onUseDraft={() => {
          onApplyDraft(controller.draftText);
          controller.useDraft();
        }}
        onCopyDraft={async () => {
          await controller.copyDraft();
        }}
        onResetSource={controller.resetToSource}
      />

      <div style={styles.reviewGrid}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Optional Log Note</label>
          <textarea
            data-testid={`${testIdPrefix}-log-note`}
            style={styles.textarea}
            value={controller.logNote}
            onChange={(event) => controller.setLogNote(event.target.value)}
            placeholder="Add a short advisor note for this AI draft"
          />
        </div>
        <div style={styles.inlineActions}>
          <button
            type="button"
            data-testid={`${testIdPrefix}-reviewed-button`}
            style={styles.primaryButton}
            onClick={controller.markReviewed}
          >
            Mark as reviewed
          </button>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => controller.setReviewed(false)}
          >
            Clear review flag
          </button>
        </div>
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
  roleBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 800,
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
  reviewGrid: {
    display: "grid",
    gap: 12,
  },
  inlineActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
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
  textarea: {
    minHeight: 96,
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
};
