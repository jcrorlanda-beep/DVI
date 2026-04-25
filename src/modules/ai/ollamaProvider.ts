import {
  getAiModulePromptTuning,
  getAiOutputModePrompt,
  getAiSafetyPromptRules,
  getAiVoiceProfile,
} from "./aiSafety";

export type AiProviderName = "ollama" | "openai" | "fallback";

export type AiAction =
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

export type AiInput = {
  sourceText: string;
  contextLabel?: string;
  moduleLabel?: string;
  outputMode?: "Short" | "Standard" | "Detailed";
};

export type OllamaDraftResult = {
  text: string;
  warning?: string;
  errorReason?: string;
};

const DEFAULT_OLLAMA_MODEL = "llama3.2";
const DEFAULT_OLLAMA_GENERATE_URL = "http://localhost:11434/api/generate";

export function getOllamaGenerateUrl() {
  const envUrl = String(import.meta.env.VITE_OLLAMA_API_URL ?? "").trim();
  return envUrl || DEFAULT_OLLAMA_GENERATE_URL;
}

export function getOllamaDefaultModel() {
  const envModel = String(import.meta.env.VITE_OLLAMA_MODEL ?? "").trim();
  return envModel || DEFAULT_OLLAMA_MODEL;
}

function normalizeText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function shortInstruction(action: AiAction) {
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
      return "Fix grammar only. Keep meaning, facts, names, and numbers unchanged.";
    case "explainFinding":
      return "Explain the finding in customer-friendly language. Be clear and concise.";
    case "summarizeInspection":
      return "Summarize the inspection clearly and briefly.";
    case "followUpMessage":
      return "Draft a professional follow-up message.";
    case "releaseSummary":
      return "Draft a customer release and handover summary.";
    case "Approval Request":
      return "Write a short approval request for a customer. Keep it professional, clear, and concise.";
    case "Waiting Parts Update":
      return "Write a short waiting-parts update for a customer. Keep it professional, clear, and concise.";
    case "Release Ready Notice":
      return "Write a short release-ready notice for a customer. Keep it professional, clear, and concise.";
    case "Pull-Out Notice":
      return "Write a short pull-out or stopped-work notice for a customer. Keep it professional, clear, and concise.";
    case "Overdue Maintenance Reminder":
      return "Write a short overdue maintenance reminder for a customer. Keep it professional, clear, and concise.";
    case "Due Soon Maintenance Reminder":
      return "Write a short due-soon maintenance reminder for a customer. Keep it professional, clear, and concise.";
    case "Post-Service Follow-Up":
      return "Write a short post-service follow-up message for a customer. Keep it professional, clear, and concise.";
    case "Backjob / Recheck Update":
      return "Write a short backjob or recheck update for a customer. Keep it professional, clear, and concise.";
  }
}

export function buildAiPrompt(action: AiAction, input: AiInput) {
  const parts = [
    getAiVoiceProfile(),
    getAiOutputModePrompt(input.outputMode ?? "Standard"),
    getAiSafetyPromptRules(),
    shortInstruction(action),
  ];
  const tuning = getAiModulePromptTuning(input.moduleLabel || input.contextLabel);
  if (tuning) {
    parts.push(tuning);
  }
  if (input.contextLabel?.trim()) {
    parts.push(`Context: ${input.contextLabel.trim()}`);
  }
  const sourceText = normalizeText(input.sourceText);
  if (sourceText) {
    parts.push("Source:");
    parts.push(sourceText);
  }
  return parts.join("\n");
}

export function getOllamaActionWarning(action: AiAction) {
  switch (action) {
    case "customerInspectionReport":
      return "Review the inspection report carefully before sending.";
    case "qcSummary":
      return "Review the QC summary carefully before sending.";
    case "backJobExplanation":
      return "Review the rework explanation carefully before sending.";
    case "smsUpdate":
      return "Review the SMS draft before sending.";
    case "estimateExplanation":
      return "Review the estimate explanation before sending.";
    case "maintenanceDueReport":
      return "Review the maintenance due report before sending.";
    case "fixGrammar":
    case "explainFinding":
    case "summarizeInspection":
    case "followUpMessage":
    case "releaseSummary":
      return "Review the draft before using it.";
  }
}

export async function runOllamaDraft(
  action: AiAction,
  input: AiInput,
  options?: {
    model?: string;
    timeoutMs?: number;
  }
): Promise<OllamaDraftResult> {
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? 20_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const model = options?.model?.trim() || getOllamaDefaultModel();
  const prompt = buildAiPrompt(action, input);
  const url = getOllamaGenerateUrl();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = typeof payload?.error === "string" ? payload.error : response.statusText || `HTTP ${response.status}`;
      const lower = detail.toLowerCase();
      const notRunning =
        response.status === 0 ||
        lower.includes("connection refused") ||
        lower.includes("failed to fetch") ||
        lower.includes("network") ||
        lower.includes("connect");
      return {
        text: "",
        warning: notRunning ? "Local AI is not running. Please open Ollama and try again." : `Local AI failed (${response.status}).`,
        errorReason: detail,
      };
    }

    const text = typeof payload?.response === "string" ? normalizeText(payload.response) : "";
    if (!text) {
      return {
        text: "",
        warning: "Local AI returned no draft text.",
        errorReason: "Empty Ollama response.",
      };
    }

    return { text };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Local AI request failed.";
    const lower = message.toLowerCase();
    const notRunning =
      lower.includes("abort") ||
      lower.includes("timed out") ||
      lower.includes("timeout") ||
      lower.includes("network") ||
      lower.includes("fetch") ||
      lower.includes("connect") ||
      lower.includes("refused");
    return {
      text: "",
      warning: notRunning ? "Local AI is not running. Please open Ollama and try again." : "Local AI failed. Please try again.",
      errorReason: message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
