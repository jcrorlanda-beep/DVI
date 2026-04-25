import { generateAiDraft, type AiHybridDraftResult } from "./aiHybridService";
import { getFallbackDraft, type AiAction as HybridAiAction } from "./aiFallback";
import { OPENAI_ASSIST_DRAFT_CACHE_STORAGE_KEY, OPENAI_ASSIST_LOG_STORAGE_KEY } from "./openaiProvider";
import type { AiOutputMode, AiTemplateType } from "./aiSafety";
import type { AiAction as OllamaAiAction, AiProviderName } from "./ollamaProvider";

export type OpenAiAssistAction =
  | "Fix Grammar"
  | "Explain to Customer"
  | "Explain Inspection Finding"
  | "Explain Finding"
  | "Customer Inspection Report"
  | "Summarize Inspection"
  | "Draft Follow-Up Message"
  | "Draft Release Summary"
  | "SMS Update"
  | "QC Summary"
  | "customerInspectionReport"
  | "qcSummary"
  | "backJobExplanation"
  | "smsUpdate"
  | "estimateExplanation"
  | "maintenanceDueReport"
  | "fixGrammar"
  | "explainFinding"
  | "summarizeInspection"
  | "followUpMessage"
  | "releaseSummary"
  | "Approval Request"
  | "Waiting Parts Update"
  | "Release Ready Notice"
  | "Pull-Out Notice"
  | "Overdue Maintenance Reminder"
  | "Due Soon Maintenance Reminder"
  | "Post-Service Follow-Up"
  | "Backjob / Recheck Update";

export type OpenAiAssistDraft = Omit<AiHybridDraftResult, "provider"> & {
  cacheKey: string;
  actionType: OpenAiAssistAction;
  source: "OpenAI" | "Fallback";
  providerName: AiProviderName;
  model: string;
  generatedAt: string;
  note: string;
  errorMessage?: string;
  warning?: string;
  errorReason?: string;
  cached?: boolean;
  outputMode?: AiOutputMode;
  templateType?: AiTemplateType;
  usedFallback?: boolean;
  draftText: string;
  provider: "OpenAI";
};

export type OpenAiAssistLogEntry = {
  id: string;
  actionType: OpenAiAssistAction;
  sourceModule: string;
  status: "Success" | "Failure";
  generatedAt: string;
  provider: "OpenAI";
  model: string;
  note: string;
  errorMessage?: string;
  providerName?: AiProviderName;
  reviewed?: boolean;
  reviewedAt?: string;
  copied?: boolean;
  copiedAt?: string;
  used?: boolean;
  usedAt?: string;
  user?: string;
  role?: string;
  messageType?: string;
  sourceContext?: string;
  logNote?: string;
  success?: boolean;
  warningReason?: string;
  safetyLabel?: string;
  moduleEnabled?: boolean;
  outputMode?: AiOutputMode;
  templateType?: AiTemplateType;
};

export type OpenAiAssistProviderMode = "Disabled" | "OpenAI";
export type OpenAiAssistSettings = {
  provider: OpenAiAssistProviderMode;
  model: string;
  maxTokens: number;
  outputMode: AiOutputMode;
};

function mapAction(actionType: OpenAiAssistAction): HybridAiAction {
  switch (actionType) {
    case "Fix Grammar":
    case "fixGrammar":
      return "fixGrammar";
    case "Explain to Customer":
    case "Explain Inspection Finding":
    case "Explain Finding":
    case "explainFinding":
      return "explainFinding";
    case "Customer Inspection Report":
    case "customerInspectionReport":
      return "customerInspectionReport";
    case "Summarize Inspection":
    case "summarizeInspection":
      return "summarizeInspection";
    case "Draft Follow-Up Message":
    case "followUpMessage":
      return "followUpMessage";
    case "Draft Release Summary":
    case "releaseSummary":
      return "releaseSummary";
    case "SMS Update":
    case "smsUpdate":
      return "smsUpdate";
    case "QC Summary":
    case "qcSummary":
      return "qcSummary";
    case "backJobExplanation":
    case "estimateExplanation":
    case "maintenanceDueReport":
      return actionType;
    case "Approval Request":
    case "Waiting Parts Update":
    case "Release Ready Notice":
    case "Pull-Out Notice":
    case "Overdue Maintenance Reminder":
    case "Due Soon Maintenance Reminder":
    case "Post-Service Follow-Up":
    case "Backjob / Recheck Update":
      return actionType;
  }
  return "fixGrammar";
}

export function getOpenAiAssistActionInstruction(actionType: OpenAiAssistAction) {
  switch (mapAction(actionType)) {
    case "fixGrammar":
      return "Fix grammar only. Keep facts, names, and numbers unchanged. Keep it concise.";
    case "explainFinding":
      return "Explain the finding in simple customer language. Keep it short and clear.";
    case "customerInspectionReport":
      return "Write a concise customer inspection report with Summary, Findings, Recommended Action, and Priority.";
    case "summarizeInspection":
      return "Summarize the inspection in short bullets. Put the most important items first.";
    case "followUpMessage":
      return "Draft a warm follow-up message. Keep it brief and review-ready.";
    case "releaseSummary":
      return "Draft a concise release summary with completed work and status.";
    case "qcSummary":
      return "Write a concise QC summary with Work Completed, QC Result, Remaining Notes, and Release Readiness.";
    case "backJobExplanation":
      return "Explain the backjob clearly with Customer Concern, What Was Checked, Possible Cause, Next Step, and Important Note.";
    case "smsUpdate":
      return "Write a short professional SMS update. Keep it brief and clear.";
    case "estimateExplanation":
      return "Explain why the work is recommended in a customer-friendly way without pressure.";
    case "maintenanceDueReport":
      return "Write a concise maintenance due report with Summary, Findings / Work Done, Recommended Action, and Priority / Next Step.";
    case "Approval Request":
      return "Write a short approval request. Keep it concise, professional, and review-ready.";
    case "Waiting Parts Update":
      return "Write a short waiting-parts update. Keep it concise, professional, and review-ready.";
    case "Release Ready Notice":
      return "Write a short release-ready notice. Keep it concise, professional, and review-ready.";
    case "Pull-Out Notice":
      return "Write a short pull-out notice. Keep it concise, professional, and review-ready.";
    case "Overdue Maintenance Reminder":
      return "Write a short overdue maintenance reminder. Keep it concise, professional, and review-ready.";
    case "Due Soon Maintenance Reminder":
      return "Write a short due-soon maintenance reminder. Keep it concise, professional, and review-ready.";
    case "Post-Service Follow-Up":
      return "Write a short post-service follow-up message. Keep it concise, professional, and review-ready.";
    case "Backjob / Recheck Update":
      return "Write a short backjob or recheck update. Keep it concise, professional, and review-ready.";
  }
}

export async function generateOpenAiAssistDraft({
  actionType,
  sourceText,
  settings,
  cacheKey,
  sourceModule,
}: {
  actionType: OpenAiAssistAction;
  sourceText: string;
  settings: OpenAiAssistSettings;
  apiKey?: string;
  cacheKey: string;
  sourceModule?: string;
  contextLabel?: string;
  customerName?: string;
  vehicleLabel?: string;
  roNumber?: string;
}): Promise<OpenAiAssistDraft> {
  const normalizedAction = mapAction(actionType);
  if (settings.provider === "Disabled") {
    const generatedAt = new Date().toISOString();
    const providerName: AiProviderName = "fallback";
    const outputMode = settings.outputMode || "Standard";
    return {
      cacheKey,
      actionType,
      text: getFallbackDraft(normalizedAction, { sourceText, contextLabel: "Workshop communication", outputMode }),
      draftText: getFallbackDraft(normalizedAction, { sourceText, contextLabel: "Workshop communication", outputMode }),
      source: "Fallback",
      providerName,
      generatedAt,
      note: "AI unavailable. Using template response.",
      model: settings.model.trim() || "gpt-4.1-mini",
      provider: "OpenAI",
      usedFallback: true,
      warning: "AI unavailable. Using template response.",
      errorReason: undefined,
      cached: false,
      errorMessage: undefined,
      outputMode,
      templateType: outputMode === "Short" ? "SMS" : outputMode === "Detailed" ? "Report" : "Standard",
    };
  }
  const result = await generateAiDraft(normalizedAction as unknown as OllamaAiAction, sourceText, {
    preferLocal: true,
    model: settings.model,
    timeoutMs: 20_000,
    outputMode: settings.outputMode,
    moduleLabel: sourceModule,
    contextLabel: sourceModule || "Workshop communication",
  });

  const providerName: AiProviderName = result.provider;
  const source = providerName === "openai" ? "OpenAI" : "Fallback";
  const note = result.warning || (providerName === "ollama" ? "Local AI draft generated successfully." : providerName === "openai" ? "OpenAI draft generated successfully." : "AI unavailable. Using template response.");
  const generatedAt = new Date().toISOString();

  return {
    cacheKey,
    actionType,
    text: result.text,
    draftText: result.text,
    source,
    providerName,
    generatedAt,
    note,
    model: settings.model.trim() || "gpt-4.1-mini",
    provider: "OpenAI",
    usedFallback: result.usedFallback,
    warning: result.warning,
    errorReason: result.errorReason,
    cached: result.cached,
    errorMessage: result.errorReason,
    outputMode: result.outputMode,
    templateType: result.templateType,
  };
}

export { generateAiDraft, type AiHybridDraftResult, OPENAI_ASSIST_DRAFT_CACHE_STORAGE_KEY, OPENAI_ASSIST_LOG_STORAGE_KEY };
export { getOpenAiAssistCacheKey } from "./openaiProvider";
export type { AiProviderName };
