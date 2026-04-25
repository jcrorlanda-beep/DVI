import React from "react";

export type AiModuleKey = "repairOrders" | "inspection" | "qualityControl" | "release" | "reports" | "messages";
export type AiOutputMode = "Short" | "Standard" | "Detailed";
export type AiTemplateType = "SMS" | "Standard" | "Report";

export type AiModuleToggleSettings = Record<AiModuleKey, boolean>;

export const AI_MODULE_TOGGLES_STORAGE_KEY = "dvi_ai_module_toggles_v1";
export const AI_OUTPUT_MODE_STORAGE_KEY = "dvi_ai_output_mode_v1";
export const AI_GENERATED_DRAFT_LABEL = "AI-generated draft - review before use";
export const AI_REVIEW_REMINDER = "Verify all findings, prices, promises, and safety notes before sending.";
export const AI_REVIEW_CONFIRMATION_LABEL = "I reviewed and verified this AI-generated content.";
export const DEFAULT_AI_OUTPUT_MODE: AiOutputMode = "Standard";

export const DEFAULT_AI_MODULE_TOGGLES: AiModuleToggleSettings = {
  repairOrders: true,
  inspection: true,
  qualityControl: true,
  release: true,
  reports: true,
  messages: true,
};

const AI_SETTINGS_CHANGED_EVENT = "dvi-ai-module-settings-changed";

const AI_MODULE_LABELS: Record<AiModuleKey, string> = {
  repairOrders: "Repair Orders AI",
  inspection: "Inspection AI",
  qualityControl: "QC AI",
  release: "Release AI",
  reports: "Reports AI",
  messages: "Messages AI",
};

export function getAiModuleLabel(moduleKey: AiModuleKey) {
  return AI_MODULE_LABELS[moduleKey];
}

export function getAiOutputModeLabel(mode: AiOutputMode) {
  switch (mode) {
    case "Short":
      return "Short (SMS)";
    case "Detailed":
      return "Detailed (Report)";
    default:
      return "Standard";
  }
}

export function getAiOutputTemplateType(mode: AiOutputMode): AiTemplateType {
  switch (mode) {
    case "Short":
      return "SMS";
    case "Detailed":
      return "Report";
    default:
      return "Standard";
  }
}

export function getAiVoiceProfile() {
  return [
    "Voice profile:",
    "- English only.",
    "- Professional, calm, and non-pushy.",
    "- Clear and customer-friendly.",
    "- Do not exaggerate or guarantee outcomes.",
    "- Do not invent facts, prices, or promises.",
    "- Keep the shop voice practical and honest.",
  ].join("\n");
}

export function getAiOutputModePrompt(mode: AiOutputMode) {
  switch (mode) {
    case "Short":
      return [
        "Output mode: Short (SMS).",
        "- Keep the response very concise.",
        "- Use plain language and short sentences.",
        "- Avoid long paragraphs.",
        "- Fit the message for a quick customer text.",
      ].join("\n");
    case "Detailed":
      return [
        "Output mode: Detailed (Report).",
        "- Use a report-style layout.",
        "- Include these headings exactly: Summary, Findings, Recommended Action, Priority / Next Step.",
        "- Use concise bullets where helpful.",
        "- Keep it readable for a customer or advisor review.",
      ].join("\n");
    default:
      return [
        "Output mode: Standard.",
        "- Keep the response clear and balanced.",
        "- Use short paragraphs or bullets.",
        "- Include the main points without extra filler.",
      ].join("\n");
  }
}

export function getAiModulePromptTuning(moduleLabel?: string) {
  const normalized = moduleLabel?.trim().toLowerCase() || "";
  if (!normalized) return "";
  if (normalized.includes("inspection")) {
    return [
      "Module tuning: Inspection.",
      "- Focus on findings, customer impact, and next step.",
      "- Explain technical items in simple language.",
    ].join("\n");
  }
  if (normalized.includes("qc") || normalized.includes("quality")) {
    return [
      "Module tuning: QC.",
      "- Focus on completed work, QC result, remaining notes, and release readiness.",
      "- Keep the tone objective and practical.",
    ].join("\n");
  }
  if (normalized.includes("release")) {
    return [
      "Module tuning: Release.",
      "- Focus on completed work, handover, and pickup readiness.",
      "- Keep the summary brief and reassuring.",
    ].join("\n");
  }
  if (normalized.includes("backjob") || normalized.includes("recheck") || normalized.includes("comeback")) {
    return [
      "Module tuning: Backjob / Recheck.",
      "- Focus on the concern, what was checked, possible cause, and next action.",
      "- Keep it honest and neutral.",
    ].join("\n");
  }
  if (normalized.includes("maintenance")) {
    return [
      "Module tuning: Maintenance.",
      "- Focus on due service, interval, and next step.",
      "- Keep it practical and easy to act on.",
    ].join("\n");
  }
  return "";
}

export function isAllowedAiRole(role: string) {
  return role === "Admin" || role === "Service Advisor";
}

export function getAiAccessMessage(moduleKey: AiModuleKey, role: string, enabled: boolean) {
  if (!enabled) {
    return `${getAiModuleLabel(moduleKey)} is disabled in Settings.`;
  }
  if (!isAllowedAiRole(role)) {
    return "AI Assist is currently limited to Admin and Service Advisor roles.";
  }
  return "";
}

export function readAiModuleToggles(): AiModuleToggleSettings {
  try {
    if (typeof window === "undefined") return { ...DEFAULT_AI_MODULE_TOGGLES };
    const raw = window.localStorage.getItem(AI_MODULE_TOGGLES_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_MODULE_TOGGLES };
    const parsed = JSON.parse(raw) as Partial<AiModuleToggleSettings> | null;
    return {
      repairOrders: parsed?.repairOrders ?? DEFAULT_AI_MODULE_TOGGLES.repairOrders,
      inspection: parsed?.inspection ?? DEFAULT_AI_MODULE_TOGGLES.inspection,
      qualityControl: parsed?.qualityControl ?? DEFAULT_AI_MODULE_TOGGLES.qualityControl,
      release: parsed?.release ?? DEFAULT_AI_MODULE_TOGGLES.release,
      reports: parsed?.reports ?? DEFAULT_AI_MODULE_TOGGLES.reports,
      messages: parsed?.messages ?? DEFAULT_AI_MODULE_TOGGLES.messages,
    };
  } catch {
    return { ...DEFAULT_AI_MODULE_TOGGLES };
  }
}

export function readAiOutputMode(): AiOutputMode {
  try {
    if (typeof window === "undefined") return DEFAULT_AI_OUTPUT_MODE;
    const raw = window.localStorage.getItem(AI_OUTPUT_MODE_STORAGE_KEY);
    if (raw === "Short" || raw === "Standard" || raw === "Detailed") return raw;
    return DEFAULT_AI_OUTPUT_MODE;
  } catch {
    return DEFAULT_AI_OUTPUT_MODE;
  }
}

export function saveAiModuleToggles(next: AiModuleToggleSettings) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AI_MODULE_TOGGLES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(AI_SETTINGS_CHANGED_EVENT));
  } catch {
    // Advisory only.
  }
}

export function saveAiOutputMode(next: AiOutputMode) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AI_OUTPUT_MODE_STORAGE_KEY, next);
    window.dispatchEvent(new Event(AI_SETTINGS_CHANGED_EVENT));
  } catch {
    // Advisory only.
  }
}

export function useAiModuleEnabled(moduleKey: AiModuleKey) {
  const [enabled, setEnabled] = React.useState(() => readAiModuleToggles()[moduleKey]);

  React.useEffect(() => {
    const update = () => setEnabled(readAiModuleToggles()[moduleKey]);
    update();
    const onStorage = (event: StorageEvent) => {
      if (event.key === AI_MODULE_TOGGLES_STORAGE_KEY) update();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(AI_SETTINGS_CHANGED_EVENT, update as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AI_SETTINGS_CHANGED_EVENT, update as EventListener);
    };
  }, [moduleKey]);

  return enabled;
}

export function useAiOutputMode() {
  const [mode, setMode] = React.useState<AiOutputMode>(() => readAiOutputMode());

  React.useEffect(() => {
    const update = () => setMode(readAiOutputMode());
    update();
    const onStorage = (event: StorageEvent) => {
      if (event.key === AI_OUTPUT_MODE_STORAGE_KEY) update();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(AI_SETTINGS_CHANGED_EVENT, update as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AI_SETTINGS_CHANGED_EVENT, update as EventListener);
    };
  }, []);

  const setAndSaveMode = React.useCallback((next: AiOutputMode) => {
    setMode(next);
    saveAiOutputMode(next);
  }, []);

  return [mode, setAndSaveMode] as const;
}

export function getAiSafetyPromptRules() {
  return [
    "Language rules:",
    "- English only.",
    "- Keep the wording clear and easy to understand.",
    "- Stay professional, calm, and non-pushy.",
    "- Do not exaggerate or guarantee repair outcomes.",
    "- Do not make unsupported warranty promises.",
    "",
    "Safety rules:",
    "- Use only facts from the source text.",
    "- Do not invent issues, prices, promises, or warranty claims.",
    "- Do not guarantee repair outcomes.",
    "- Do not make unsupported warranty promises.",
    "- Keep the tone professional, customer-friendly, and concise.",
  ].join("\n");
}

export function getAiSafetyReviewReminder() {
  return AI_REVIEW_REMINDER;
}
