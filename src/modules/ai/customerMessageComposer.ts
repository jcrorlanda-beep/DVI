import React from "react";
import { generateAiDraft } from "./aiHybridService";
import { getAiAccessMessage, isAllowedAiRole, type AiModuleKey, useAiModuleEnabled } from "./aiSafety";
import type { AiProviderName } from "./ollamaProvider";
import type { OpenAiAssistLogEntry, OpenAiAssistProviderMode } from "./openaiAssist";

export type CustomerMessageComposerAction =
  | "Approval Request"
  | "Waiting Parts Update"
  | "Release Ready Notice"
  | "Pull-Out Notice"
  | "Overdue Maintenance Reminder"
  | "Due Soon Maintenance Reminder"
  | "Post-Service Follow-Up"
  | "Backjob / Recheck Update";

export type CustomerMessageSourceContext = "RO" | "inspection" | "maintenance item" | "release" | "backjob";

export const CUSTOMER_MESSAGE_ACTIONS: CustomerMessageComposerAction[] = [
  "Approval Request",
  "Waiting Parts Update",
  "Release Ready Notice",
  "Pull-Out Notice",
  "Overdue Maintenance Reminder",
  "Due Soon Maintenance Reminder",
  "Post-Service Follow-Up",
  "Backjob / Recheck Update",
];

export const CUSTOMER_MESSAGE_SOURCE_CONTEXTS: CustomerMessageSourceContext[] = [
  "RO",
  "inspection",
  "maintenance item",
  "release",
  "backjob",
];

export type CustomerMessageComposerLogEntry = OpenAiAssistLogEntry & {
  messageType?: CustomerMessageComposerAction;
  sourceContext?: CustomerMessageSourceContext;
  reviewed?: boolean;
  copied?: boolean;
  used?: boolean;
  logNote?: string;
};

export type CustomerMessageDraftMeta = {
  actionType: CustomerMessageComposerAction;
  source: "Local AI" | "Cloud AI" | "Template";
  providerName: AiProviderName;
  generatedAt: string;
  note: string;
  model: string;
  warning?: string;
  errorMessage?: string;
  errorReason?: string;
  cached?: boolean;
};

export type CustomerMessageComposerController = {
  action: CustomerMessageComposerAction;
  setAction: React.Dispatch<React.SetStateAction<CustomerMessageComposerAction>>;
  sourceContext: CustomerMessageSourceContext;
  setSourceContext: React.Dispatch<React.SetStateAction<CustomerMessageSourceContext>>;
  sourceText: string;
  draftText: string;
  setDraftText: React.Dispatch<React.SetStateAction<string>>;
  draftMeta: CustomerMessageDraftMeta | null;
  feedback: string;
  setFeedback: React.Dispatch<React.SetStateAction<string>>;
  draftFromCache: boolean;
  isGenerating: boolean;
  canUseAiAssist: boolean;
  accessMessage: string;
  providerMode: OpenAiAssistProviderMode;
  model: string;
  maxTokens: number;
  apiKeyConfigured: boolean;
  logs: OpenAiAssistLogEntry[];
  reviewed: boolean;
  setReviewed: (next: boolean) => void;
  reviewedAt: string;
  logNote: string;
  setLogNote: React.Dispatch<React.SetStateAction<string>>;
  generate: (nextAction: CustomerMessageComposerAction) => Promise<void>;
  copyDraft: () => Promise<void>;
  useDraft: () => void;
  resetToSource: () => void;
  markReviewed: () => void;
};

export type CustomerMessageSourceData = {
  ro?: {
    roNumber?: string;
    accountLabel?: string;
    customerName?: string;
    plateNumber?: string;
    conductionNumber?: string;
    make?: string;
    model?: string;
    year?: string | number;
    status?: string;
    customerConcern?: string;
    pullOutReason?: string;
    workLines?: Array<{
      title?: string;
      notes?: string;
      totalEstimate?: string;
      approvalDecision?: string;
      status?: string;
    }>;
  } | null;
  inspection?: {
    inspectionNumber?: string;
    concern?: string;
    underHoodSummary?: string;
    recommendedWork?: string;
    recommendationLines?: string[];
    enginePerformanceNotes?: string;
    coolingSystemNotes?: string;
    steeringSystemNotes?: string;
    roadTestNotes?: string;
  } | null;
  approvalRecord?: {
    approvalNumber?: string;
    summary?: string;
    communicationHook?: string;
    items?: Array<{ title?: string; note?: string; decision?: string }>;
  } | null;
  approvalLinkToken?: { token?: string } | null;
  partsRequests?: Array<{
    partName?: string;
    quantity?: number | string;
    status?: string;
    requestedAt?: string;
    updatedAt?: string;
  }>;
  releaseRecord?: {
    releaseNumber?: string;
    releaseSummary?: string;
    finalTotalAmount?: string;
    paymentSettled?: boolean;
    documentsReady?: boolean;
    cleanVehicle?: boolean;
    toolsRemoved?: boolean;
  } | null;
  backjobRecord?: {
    backjobNumber?: string;
    complaint?: string;
    findings?: string;
    rootCause?: string;
    actionTaken?: string;
    resolutionNotes?: string;
    responsibility?: string;
    status?: string;
  } | null;
  oilReminder?: {
    dueReason?: string;
    dueDate?: string;
    currentOdometerKm?: number | string;
    dueOdometerKm?: number;
    isDue?: boolean;
  } | null;
  followUpReminder?: {
    dueReason?: string;
    dueDate?: string;
    releaseNumber?: string;
    isDue?: boolean;
  } | null;
  templateBody?: string;
  sourceTextFallback?: string;
  customerName?: string;
  vehicleLabel?: string;
  roNumber?: string;
};

function normalizeText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function pickVehicleLabel(source: CustomerMessageSourceData) {
  return source.vehicleLabel?.trim()
    || [source.ro?.make, source.ro?.model, source.ro?.year].filter(Boolean).join(" ")
    || source.ro?.plateNumber
    || source.ro?.conductionNumber
    || "vehicle";
}

function pickCustomerName(source: CustomerMessageSourceData) {
  return source.customerName?.trim() || source.ro?.accountLabel || source.ro?.customerName || "Customer";
}

function pickRoNumber(source: CustomerMessageSourceData) {
  return source.roNumber?.trim() || source.ro?.roNumber || "RO";
}

function buildInspectionLines(source: CustomerMessageSourceData) {
  const lines: string[] = [];
  const inspection = source.inspection;
  if (!inspection) return ["No inspection data was available."];
  if (inspection.concern?.trim()) lines.push(`Concern: ${inspection.concern.trim()}`);
  if (inspection.underHoodSummary?.trim()) lines.push(`Under hood: ${inspection.underHoodSummary.trim()}`);
  if (inspection.recommendedWork?.trim()) lines.push(`Recommended work: ${inspection.recommendedWork.trim()}`);
  if (inspection.recommendationLines?.length) {
    lines.push(
      "Recommendation lines:",
      ...inspection.recommendationLines.filter(Boolean).slice(0, 5).map((line) => `- ${line}`)
    );
  }
  if (inspection.enginePerformanceNotes?.trim()) lines.push(`Engine: ${inspection.enginePerformanceNotes.trim()}`);
  if (inspection.coolingSystemNotes?.trim()) lines.push(`Cooling: ${inspection.coolingSystemNotes.trim()}`);
  if (inspection.steeringSystemNotes?.trim()) lines.push(`Steering: ${inspection.steeringSystemNotes.trim()}`);
  if (inspection.roadTestNotes?.trim()) lines.push(`Road test: ${inspection.roadTestNotes.trim()}`);
  return lines.length ? lines : ["No inspection data was available."];
}

function buildPartsLines(source: CustomerMessageSourceData) {
  if (!source.partsRequests?.length) return ["No active parts requests were linked."];
  return source.partsRequests
    .filter((item) => (item.status || "").trim())
    .slice(0, 5)
    .map((item) => `- ${item.partName || "Part request"} x${item.quantity ?? 1} | ${item.status || "Open"}`);
}

function buildReleaseLines(source: CustomerMessageSourceData) {
  const release = source.releaseRecord;
  if (!release) return ["No release record was available."];
  return [
    release.releaseNumber ? `Release number: ${release.releaseNumber}` : "",
    release.releaseSummary?.trim() ? `Summary: ${release.releaseSummary.trim()}` : "",
    release.finalTotalAmount?.trim() ? `Final total: ${release.finalTotalAmount.trim()}` : "",
    `Payment settled: ${release.paymentSettled ? "Yes" : "No"}`,
    `Documents ready: ${release.documentsReady ? "Yes" : "No"}`,
    `Vehicle clean: ${release.cleanVehicle ? "Yes" : "No"}`,
    `Tools removed: ${release.toolsRemoved ? "Yes" : "No"}`,
  ].filter(Boolean);
}

function buildBackjobLines(source: CustomerMessageSourceData) {
  const backjob = source.backjobRecord;
  if (!backjob) return ["No backjob record was available."];
  return [
    backjob.backjobNumber ? `Backjob: ${backjob.backjobNumber}` : "",
    backjob.complaint?.trim() ? `Complaint: ${backjob.complaint.trim()}` : "",
    backjob.findings?.trim() ? `Findings: ${backjob.findings.trim()}` : "",
    backjob.rootCause?.trim() ? `Root cause: ${backjob.rootCause.trim()}` : "",
    backjob.actionTaken?.trim() ? `Action taken: ${backjob.actionTaken.trim()}` : "",
    backjob.resolutionNotes?.trim() ? `Resolution notes: ${backjob.resolutionNotes.trim()}` : "",
    backjob.responsibility?.trim() ? `Responsibility: ${backjob.responsibility.trim()}` : "",
    backjob.status?.trim() ? `Status: ${backjob.status.trim()}` : "",
  ].filter(Boolean);
}

function buildReminderLines(source: CustomerMessageSourceData, type: "oil" | "followUp") {
  const reminder = type === "oil" ? source.oilReminder : source.followUpReminder;
  if (!reminder) return ["No reminder details were available."];
  if (type === "oil") {
    const oilReminder = source.oilReminder;
    return [
      oilReminder?.dueReason?.trim() ? `Due reason: ${oilReminder.dueReason.trim()}` : "",
      oilReminder?.dueDate ? `Due date: ${oilReminder.dueDate}` : "",
      typeof oilReminder?.currentOdometerKm !== "undefined" ? `Current odometer: ${oilReminder.currentOdometerKm}` : "",
      typeof oilReminder?.dueOdometerKm !== "undefined" ? `Due odometer: ${oilReminder.dueOdometerKm}` : "",
      `Reminder status: ${oilReminder?.isDue ? "Overdue" : "Due soon"}`,
    ].filter(Boolean);
  }
  const followUpReminder = source.followUpReminder;
  return [
    followUpReminder?.dueReason?.trim() ? `Due reason: ${followUpReminder.dueReason.trim()}` : "",
    followUpReminder?.dueDate ? `Due date: ${followUpReminder.dueDate}` : "",
    followUpReminder?.releaseNumber?.trim() ? `Release number: ${followUpReminder.releaseNumber.trim()}` : "",
    `Reminder status: ${followUpReminder?.isDue ? "Due now" : "Queued"}`,
  ].filter(Boolean);
}

export function buildCustomerMessageSourceText(
  action: CustomerMessageComposerAction,
  sourceContext: CustomerMessageSourceContext,
  source: CustomerMessageSourceData
) {
  const customerName = pickCustomerName(source);
  const vehicleLabel = pickVehicleLabel(source);
  const roNumber = pickRoNumber(source);

  const sections = [
    `Customer: ${customerName}`,
    `Vehicle: ${vehicleLabel}`,
    `RO: ${roNumber}`,
    `Context: ${sourceContext}`,
  ];

  switch (sourceContext) {
    case "inspection":
      sections.push("Live inspection summary:", ...buildInspectionLines(source));
      break;
    case "maintenance item":
      sections.push("Live maintenance reminder:", ...buildReminderLines(source, action === "Post-Service Follow-Up" ? "followUp" : "oil"));
      break;
    case "release":
      sections.push("Live release summary:", ...buildReleaseLines(source));
      break;
    case "backjob":
      sections.push("Live backjob summary:", ...buildBackjobLines(source));
      break;
    case "RO":
    default:
      sections.push(
        "Live RO summary:",
        source.ro?.status?.trim() ? `Status: ${source.ro.status.trim()}` : "",
        source.ro?.customerConcern?.trim() ? `Concern: ${source.ro.customerConcern.trim()}` : "",
        source.ro?.pullOutReason?.trim() ? `Pull-out reason: ${source.ro.pullOutReason.trim()}` : "",
        ...(source.ro?.workLines?.length
          ? [
              "Work lines:",
              ...source.ro.workLines.slice(0, 5).map((line) => `- ${line.title || "Untitled work line"}${line.notes ? ` | ${line.notes}` : ""}${line.totalEstimate ? ` | ${line.totalEstimate}` : ""}`),
            ]
          : [])
      );
      break;
  }

  switch (action) {
    case "Approval Request":
      sections.push(
        "Purpose: Ask the customer to review and approve the recommended work.",
        ...(source.approvalRecord?.summary?.trim()
          ? [`Approval summary: ${source.approvalRecord.summary.trim()}`]
          : []),
        ...(source.approvalRecord?.communicationHook?.trim()
          ? [`Customer note: ${source.approvalRecord.communicationHook.trim()}`]
          : []),
        ...(source.approvalRecord?.items?.length
          ? ["Approval items:", ...source.approvalRecord.items.slice(0, 5).map((item) => `- ${item.title || "Item"}${item.note ? ` | ${item.note}` : ""}${item.decision ? ` | ${item.decision}` : ""}`)]
          : []),
        ...(source.templateBody?.trim() ? [`Template body: ${normalizeText(source.templateBody)}`] : [])
      );
      break;
    case "Waiting Parts Update":
      sections.push("Purpose: Tell the customer the job is waiting for parts.", ...buildPartsLines(source));
      break;
    case "Release Ready Notice":
      sections.push("Purpose: Tell the customer the vehicle is ready for pickup.", ...buildReleaseLines(source));
      break;
    case "Pull-Out Notice":
      sections.push(
        "Purpose: Explain that work has been paused or pulled out.",
        source.ro?.pullOutReason?.trim() ? `Pull-out reason: ${source.ro.pullOutReason.trim()}` : "",
        ...buildBackjobLines(source)
      );
      break;
    case "Overdue Maintenance Reminder":
    case "Due Soon Maintenance Reminder":
      sections.push(
        "Purpose: Send a maintenance reminder that is short, professional, and easy to act on.",
        ...buildReminderLines(source, "oil"),
        ...(source.templateBody?.trim() ? [`Template body: ${normalizeText(source.templateBody)}`] : [])
      );
      break;
    case "Post-Service Follow-Up":
      sections.push(
        "Purpose: Check on the customer after service and ask about their experience.",
        ...buildReminderLines(source, "followUp"),
        ...(source.templateBody?.trim() ? [`Template body: ${normalizeText(source.templateBody)}`] : [])
      );
      break;
    case "Backjob / Recheck Update":
      sections.push(
        "Purpose: Explain the comeback or recheck update in a clear and professional way.",
        ...buildBackjobLines(source)
      );
      break;
  }

  if (source.sourceTextFallback?.trim()) {
    sections.push(`Live note: ${normalizeText(source.sourceTextFallback)}`);
  }

  return sections.filter(Boolean).join("\n");
}

export async function draftApprovalRequestMessage(sourceText: string, options?: { model?: string }) {
  return generateAiDraft("Approval Request" as never, sourceText, { preferLocal: true, model: options?.model });
}

export async function draftWaitingPartsMessage(sourceText: string, options?: { model?: string }) {
  return generateAiDraft("Waiting Parts Update" as never, sourceText, { preferLocal: true, model: options?.model });
}

export async function draftReleaseReadyMessage(sourceText: string, options?: { model?: string }) {
  return generateAiDraft("Release Ready Notice" as never, sourceText, { preferLocal: true, model: options?.model });
}

export async function draftPullOutNoticeMessage(sourceText: string, options?: { model?: string }) {
  return generateAiDraft("Pull-Out Notice" as never, sourceText, { preferLocal: true, model: options?.model });
}

export async function draftOverdueMaintenanceMessage(sourceText: string, options?: { model?: string }) {
  return generateAiDraft("Overdue Maintenance Reminder" as never, sourceText, { preferLocal: true, model: options?.model });
}

export async function draftDueSoonMaintenanceMessage(sourceText: string, options?: { model?: string }) {
  return generateAiDraft("Due Soon Maintenance Reminder" as never, sourceText, { preferLocal: true, model: options?.model });
}

export async function draftPostServiceFollowUpMessage(sourceText: string, options?: { model?: string }) {
  return generateAiDraft("Post-Service Follow-Up" as never, sourceText, { preferLocal: true, model: options?.model });
}

export async function draftBackJobUpdateMessage(sourceText: string, options?: { model?: string }) {
  return generateAiDraft("Backjob / Recheck Update" as never, sourceText, { preferLocal: true, model: options?.model });
}

export function useCustomerMessageComposerController({
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
  defaultAction = "Approval Request",
  defaultSourceContext = "RO",
}: {
  sourceModule: string;
  currentUserRole: string;
  currentUserName?: string;
  moduleKey: AiModuleKey;
  buildSourceText: (action: CustomerMessageComposerAction, sourceContext: CustomerMessageSourceContext) => string;
  logs: OpenAiAssistLogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<OpenAiAssistLogEntry[]>>;
  providerMode: OpenAiAssistProviderMode;
  model: string;
  maxTokens: number;
  apiKeyConfigured: boolean;
  defaultAction?: CustomerMessageComposerAction;
  defaultSourceContext?: CustomerMessageSourceContext;
}) {
  const [action, setAction] = React.useState<CustomerMessageComposerAction>(defaultAction);
  const [sourceContext, setSourceContext] = React.useState<CustomerMessageSourceContext>(defaultSourceContext);
  const [draftText, setDraftText] = React.useState("");
  const [draftMeta, setDraftMeta] = React.useState<CustomerMessageDraftMeta | null>(null);
  const [feedback, setFeedback] = React.useState("");
  const [draftFromCache, setDraftFromCache] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [logNote, setLogNote] = React.useState("");
  const [reviewed, setReviewed] = React.useState(false);
  const [reviewedAt, setReviewedAt] = React.useState("");

  const moduleEnabled = useAiModuleEnabled(moduleKey);
  const canUseAiAssist = isAllowedAiRole(currentUserRole) && moduleEnabled;
  const sourceText = React.useMemo(() => buildSourceText(action, sourceContext), [action, buildSourceText, sourceContext]);

  React.useEffect(() => {
    if (!draftMeta) {
      setDraftText(sourceText);
      setFeedback("Select a message type and generate a draft when ready.");
      setReviewed(false);
      setReviewedAt("");
    }
  }, [draftMeta, sourceText]);

  const setReviewedAndTimestamp = React.useCallback((next: boolean) => {
    setReviewed(next);
    setReviewedAt(next ? new Date().toISOString() : "");
  }, []);

  const appendLog = React.useCallback(
    (
      entry: Partial<CustomerMessageComposerLogEntry> & Pick<CustomerMessageComposerLogEntry, "status" | "note">,
      actionOverride?: CustomerMessageComposerAction,
      sourceContextOverride?: CustomerMessageSourceContext
    ) => {
      const resolvedAction = actionOverride || action;
      const resolvedContext = sourceContextOverride || sourceContext;
      const logEntry: OpenAiAssistLogEntry = {
        id: `cm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        actionType: resolvedAction,
        sourceModule,
        status: entry.status,
        generatedAt: new Date().toISOString(),
        provider: "OpenAI",
        model,
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
        messageType: resolvedAction,
        sourceContext: resolvedContext,
        logNote: logNote.trim() || undefined,
        success: entry.success,
        warningReason: entry.warningReason,
        safetyLabel: entry.safetyLabel,
        moduleEnabled,
      };
      setLogs((prev) => [
        logEntry,
        ...prev,
      ].slice(0, 60));
    },
    [action, currentUserName, currentUserRole, logNote, model, moduleEnabled, reviewed, reviewedAt, setLogs, sourceContext, sourceModule]
  );

  const generate = React.useCallback(
    async (nextAction: CustomerMessageComposerAction) => {
      setAction(nextAction);
      if (!canUseAiAssist) {
        setFeedback(getAiAccessMessage(moduleKey, currentUserRole, moduleEnabled));
        return;
      }

      const nextSourceText = buildSourceText(nextAction, sourceContext);
      if (!nextSourceText.trim()) {
        setFeedback("Select a source context with live data before generating a draft.");
        return;
      }

      setIsGenerating(true);
      try {
        const result = await generateAiDraft(nextAction as never, nextSourceText, {
          preferLocal: true,
          model,
          timeoutMs: 20_000,
        });
        const providerName = result.provider;
        const note =
          result.warning ||
          (providerName === "ollama"
            ? "Local AI draft generated successfully."
            : providerName === "openai"
              ? "Cloud AI draft generated successfully."
              : "AI unavailable. Using template response.");
        const generatedAt = new Date().toISOString();
        const meta: CustomerMessageDraftMeta = {
          actionType: nextAction,
          source: providerName === "ollama" ? "Local AI" : providerName === "openai" ? "Cloud AI" : "Template",
          providerName,
          generatedAt,
          note,
          model,
          warning: result.warning,
          errorMessage: result.errorReason,
          errorReason: result.errorReason,
          cached: result.cached,
        };
        setDraftText(result.text);
        setDraftMeta(meta);
        setDraftFromCache(!!result.cached);
        setReviewedAndTimestamp(false);
        setFeedback(note);
        appendLog({
          status: (providerName === "fallback" ? "Failure" : "Success") as OpenAiAssistLogEntry["status"],
          note,
          errorMessage: result.errorReason,
          providerName,
          reviewed: false,
          reviewedAt: "",
          copied: false,
          copiedAt: "",
          used: false,
          usedAt: "",
          user: currentUserName,
          role: currentUserRole,
          success: providerName !== "fallback",
          warningReason: result.warning || result.errorReason,
          safetyLabel: "AI-generated draft - review before use",
        }, nextAction, sourceContext);
      } finally {
        setIsGenerating(false);
      }
    },
    [appendLog, buildSourceText, canUseAiAssist, currentUserName, currentUserRole, model, moduleEnabled, moduleKey, sourceContext, setReviewedAndTimestamp]
  );

  const copyDraft = React.useCallback(async () => {
    if (!reviewed) {
      const message = "Review confirmation is required before copying this AI draft.";
      setFeedback(message);
      appendLog({
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
      }, action, sourceContext);
      return;
    }
    try {
      await navigator.clipboard.writeText(draftText);
      setFeedback("Draft copied to clipboard.");
      const copiedAt = new Date().toISOString();
      appendLog({
        status: "Success",
        note: "Customer message draft copied to clipboard.",
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
      }, action, sourceContext);
    } catch {
      setFeedback("Clipboard copy failed. Please copy manually.");
      appendLog({
        status: "Failure",
        note: "Customer message draft copy failed.",
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
      }, action, sourceContext);
    }
  }, [action, appendLog, currentUserName, currentUserRole, draftText, reviewed, reviewedAt, sourceContext]);

  const useDraft = React.useCallback(() => {
    if (!reviewed) {
      const message = "Review confirmation is required before using this AI draft.";
      setFeedback(message);
      appendLog({
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
      }, action, sourceContext);
      return;
    }
    const usedAt = new Date().toISOString();
    setFeedback("Draft applied to the SMS preview. Review it before sending.");
    appendLog({
      status: "Success",
      note: logNote.trim() || "Customer message draft applied to SMS preview.",
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
    }, action, sourceContext);
  }, [action, appendLog, currentUserName, currentUserRole, logNote, reviewed, reviewedAt, sourceContext]);

  const markReviewed = React.useCallback(() => {
    const now = new Date().toISOString();
    setReviewedAndTimestamp(true);
    setFeedback("Draft marked as reviewed.");
    appendLog({
      status: "Success",
      note: logNote.trim() || "Customer message draft marked as reviewed.",
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
    }, action, sourceContext);
  }, [action, appendLog, currentUserName, currentUserRole, logNote, setReviewedAndTimestamp, sourceContext]);

  const resetToSource = React.useCallback(() => {
    setDraftText(sourceText);
    setDraftMeta(null);
    setDraftFromCache(false);
    setReviewedAndTimestamp(false);
    setFeedback("Draft reset to the live source text.");
  }, [setReviewedAndTimestamp, sourceText]);

  return {
    action,
    setAction,
    sourceContext,
    setSourceContext,
    sourceText,
    draftText,
    setDraftText,
    draftMeta,
    feedback,
    setFeedback,
    draftFromCache,
    isGenerating,
    canUseAiAssist,
    accessMessage: getAiAccessMessage(moduleKey, currentUserRole, moduleEnabled),
    providerMode,
    model,
    maxTokens,
    apiKeyConfigured,
    logs,
    reviewed,
    setReviewed: setReviewedAndTimestamp,
    reviewedAt,
    logNote,
    setLogNote,
    generate,
    copyDraft,
    useDraft,
    resetToSource,
    markReviewed,
  } as CustomerMessageComposerController;
}



