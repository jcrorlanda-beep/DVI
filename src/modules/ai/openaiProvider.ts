import { getFallbackDraft, normalizeAiAction, type AiAction, type AiInput } from "./aiFallback";
import {
  getAiModulePromptTuning,
  getAiOutputModePrompt,
  getAiOutputTemplateType,
  getAiSafetyPromptRules,
  getAiVoiceProfile,
} from "./aiSafety";

export type OpenAiAssistProviderMode = "Disabled" | "OpenAI";

export type OpenAiAssistSettings = {
  provider: OpenAiAssistProviderMode;
  model: string;
  maxTokens: number;
  outputMode?: "Short" | "Standard" | "Detailed";
};

export type OpenAiAssistDraft = {
  cacheKey: string;
  actionType: AiAction;
  draftText: string;
  source: "OpenAI" | "Fallback";
  providerName?: "ollama" | "openai" | "fallback";
  usedFallback?: boolean;
  generatedAt: string;
  note: string;
  provider: "OpenAI";
  model: string;
  errorMessage?: string;
  warning?: string;
  errorReason?: string;
  cached?: boolean;
  outputMode?: "Short" | "Standard" | "Detailed";
  templateType?: "SMS" | "Standard" | "Report";
};

export type OpenAiAssistLogEntry = {
  id: string;
  actionType: AiAction;
  sourceModule: string;
  status: "Success" | "Failure";
  generatedAt: string;
  provider: "OpenAI";
  model: string;
  note: string;
  errorMessage?: string;
  providerName?: "ollama" | "openai" | "fallback";
  reviewed?: boolean;
  copied?: boolean;
  used?: boolean;
  messageType?: string;
  sourceContext?: string;
  logNote?: string;
};

export type OpenAiAssistRunOptions = {
  settings: OpenAiAssistSettings;
  apiKey?: string;
  cacheKey: string;
  sourceModule?: string;
};

export const OPENAI_ASSIST_LOG_STORAGE_KEY = "dvi_openai_assist_logs_v1";
export const OPENAI_ASSIST_DRAFT_CACHE_STORAGE_KEY = "dvi_openai_assist_draft_cache_v1";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

function normalizeText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function collapseWhitespace(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractResponseText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const data = payload as Record<string, unknown>;
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  if (typeof data.text === "string" && data.text.trim()) {
    return data.text.trim();
  }

  const output = data.output;
  const parts: string[] = [];
  const walk = (value: unknown) => {
    if (!value) return;
    if (typeof value === "string") {
      if (value.trim()) parts.push(value.trim());
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.text === "string" && record.text.trim()) parts.push(record.text.trim());
      if (typeof record.output_text === "string" && record.output_text.trim()) parts.push(record.output_text.trim());
      if (typeof record.value === "string" && record.value.trim()) parts.push(record.value.trim());
      if (Array.isArray(record.content)) walk(record.content);
      if (Array.isArray(record.items)) walk(record.items);
      if (Array.isArray(record.output)) walk(record.output);
    }
  };

  walk(output);
  return collapseWhitespace(parts.join("\n"));
}

function shortInstruction(action: AiAction): string {
  switch (action) {
    case "customerInspectionReport":
      return "Write a concise customer inspection report with Summary, Findings, Recommended Action, and Priority.";
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
    case "fixGrammar":
    case "Fix Grammar":
      return "Fix grammar only. Keep facts, names, and numbers unchanged. Keep it concise.";
    case "explainFinding":
    case "Explain to Customer":
    case "Explain Inspection Finding":
      return "Explain the finding in simple customer language. Keep it short and clear.";
    case "summarizeInspection":
    case "Summarize Inspection":
      return "Summarize the inspection in short bullets. Put the most important items first.";
    case "followUpMessage":
    case "Draft Follow-Up Message":
      return "Draft a warm follow-up message. Keep it brief and review-ready.";
    case "releaseSummary":
    case "Draft Release Summary":
      return "Draft a concise release summary with completed work and status.";
    case "Approval Request":
      return "Draft a short customer approval request. Keep it concise, professional, and review-ready.";
    case "Waiting Parts Update":
      return "Draft a short waiting-parts update. Keep it concise, professional, and review-ready.";
    case "Release Ready Notice":
      return "Draft a short release-ready notice. Keep it concise, professional, and review-ready.";
    case "Pull-Out Notice":
      return "Draft a short pull-out notice. Keep it concise, professional, and review-ready.";
    case "Overdue Maintenance Reminder":
      return "Draft a short overdue maintenance reminder. Keep it concise, professional, and review-ready.";
    case "Due Soon Maintenance Reminder":
      return "Draft a short due-soon maintenance reminder. Keep it concise, professional, and review-ready.";
    case "Post-Service Follow-Up":
      return "Draft a short post-service follow-up message. Keep it concise, professional, and review-ready.";
    case "Backjob / Recheck Update":
      return "Draft a short backjob or recheck update. Keep it concise, professional, and review-ready.";
  }
  return "Keep the draft concise and review-ready.";
}

export function buildPrompt(action: AiAction, input: AiInput) {
  const outputMode = input.outputMode ?? "Standard";
  const parts = [
    getAiVoiceProfile(),
    getAiOutputModePrompt(outputMode),
    getAiSafetyPromptRules(),
    shortInstruction(normalizeAiAction(action)),
  ];
  const tuning = getAiModulePromptTuning(input.moduleLabel || input.contextLabel);
  if (tuning) {
    parts.push(tuning);
  }
  const context = [input.contextLabel, input.customerName, input.vehicleLabel, input.roNumber].filter(Boolean).join(" | ");
  if (context) {
    parts.push(`Context: ${context}`);
  }
  const sourceText = normalizeText(input.sourceText);
  if (sourceText) {
    parts.push("Source:");
    parts.push(sourceText);
  }
  return parts.join("\n");
}

function getOpenAiErrorNote(status: number, detail: string) {
  const lowered = detail.toLowerCase();
  const isQuotaOrBilling =
    status === 402 ||
    status === 429 ||
    lowered.includes("insufficient_quota") ||
    lowered.includes("billing") ||
    lowered.includes("quota") ||
    lowered.includes("rate limit") ||
    lowered.includes("rate_limit") ||
    lowered.includes("hard limit");
  if (isQuotaOrBilling) {
    return "OpenAI quota or billing limit reached. Advisor fallback text was used.";
  }
  return `OpenAI request failed (${status}). Advisor fallback text was used.`;
}

export function getOpenAiAssistCacheKey(actionType: AiAction, contextKey: string, model: string, outputMode?: "Short" | "Standard" | "Detailed") {
  return [actionType, contextKey, model, outputMode || "Standard"].join("::");
}

export async function runOpenAI(
  action: AiAction,
  input: AiInput,
  options: OpenAiAssistRunOptions
): Promise<OpenAiAssistDraft> {
  const normalizedAction = normalizeAiAction(action);
  const generatedAt = new Date().toISOString();
  const fallbackDraft = getFallbackDraft(normalizedAction, input);
  const model = options.settings.model.trim() || "gpt-4.1-mini";
  const maxTokens = Number.isFinite(options.settings.maxTokens) ? Math.max(32, Math.min(4000, Math.round(options.settings.maxTokens))) : 240;
  const outputMode = input.outputMode ?? options.settings.outputMode ?? "Standard";
  const templateType = getAiOutputTemplateType(outputMode);

  if (options.settings.provider === "Disabled") {
    return {
      cacheKey: options.cacheKey,
      actionType: normalizedAction,
      draftText: fallbackDraft,
      source: "Fallback",
      providerName: "fallback",
      usedFallback: true,
      generatedAt,
      note: "OpenAI assist is disabled. Advisor fallback text was used.",
      provider: "OpenAI",
      model,
      warning: "AI unavailable. Using template response.",
      outputMode,
      templateType,
    };
  }

  const apiKey = String(options.apiKey ?? "").trim();
  if (!apiKey) {
    return {
      cacheKey: options.cacheKey,
      actionType: normalizedAction,
      draftText: fallbackDraft,
      source: "Fallback",
      providerName: "fallback",
      usedFallback: true,
      generatedAt,
      note: "VITE_OPENAI_API_KEY is missing. Advisor fallback text was used.",
      provider: "OpenAI",
      model,
      warning: "AI unavailable. Using template response.",
      outputMode,
      templateType,
    };
  }

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions: buildPrompt(normalizedAction, input),
        input: normalizeText(input.sourceText),
        max_output_tokens: maxTokens,
      }),
    });

    const payload = await response.json().catch(() => null);
    const responseText = extractResponseText(payload);

    if (!response.ok) {
      const detail = typeof (payload as any)?.error?.message === "string" ? (payload as any).error.message : response.statusText || `HTTP ${response.status}`;
      return {
        cacheKey: options.cacheKey,
        actionType: normalizedAction,
        draftText: fallbackDraft,
        source: "Fallback",
        providerName: "fallback",
        usedFallback: true,
        generatedAt,
        note: getOpenAiErrorNote(response.status, detail),
        provider: "OpenAI",
        model,
        errorMessage: detail,
        warning: getOpenAiErrorNote(response.status, detail),
        errorReason: detail,
      };
    }

    if (!responseText) {
      return {
        cacheKey: options.cacheKey,
        actionType: normalizedAction,
        draftText: fallbackDraft,
        source: "Fallback",
        providerName: "fallback",
        usedFallback: true,
        generatedAt,
        note: "OpenAI returned no draft text. Advisor fallback text was used.",
        provider: "OpenAI",
        model,
        errorMessage: "Empty response text.",
        warning: "AI unavailable. Using template response.",
        errorReason: "Empty response text.",
        outputMode,
        templateType,
      };
    }

    return {
      cacheKey: options.cacheKey,
      actionType: normalizedAction,
      draftText: collapseWhitespace(responseText),
      source: "OpenAI",
      providerName: "openai",
      usedFallback: true,
      generatedAt,
      note: "OpenAI draft generated successfully.",
      provider: "OpenAI",
      model,
      warning: "Using cloud AI fallback",
      outputMode,
      templateType,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI request failed.";
    return {
      cacheKey: options.cacheKey,
      actionType: normalizedAction,
      draftText: fallbackDraft,
      source: "Fallback",
      providerName: "fallback",
      usedFallback: true,
      generatedAt,
      note: /quota|billing|rate limit|rate_limit|insufficient_quota|hard limit/i.test(message)
        ? "OpenAI quota or billing limit reached. Advisor fallback text was used."
        : "OpenAI request failed. Advisor fallback text was used.",
      provider: "OpenAI",
      model,
      errorMessage: message,
      warning: /quota|billing|rate limit|rate_limit|insufficient_quota|hard limit/i.test(message)
        ? "OpenAI quota or billing limit reached. Advisor fallback text was used."
        : "AI unavailable. Using template response.",
      errorReason: message,
      outputMode,
      templateType,
    };
  }
}
