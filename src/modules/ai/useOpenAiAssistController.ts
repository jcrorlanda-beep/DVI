import React from "react";
import { normalizeAiAction, type AiAction } from "./aiFallback";
import { getAiAccessMessage, isAllowedAiRole, type AiModuleKey, useAiModuleEnabled, useAiOutputMode } from "./aiSafety";
import {
  OPENAI_ASSIST_DRAFT_CACHE_STORAGE_KEY,
  OPENAI_ASSIST_LOG_STORAGE_KEY,
  generateOpenAiAssistDraft,
  type OpenAiAssistAction,
  type OpenAiAssistDraft,
  type OpenAiAssistLogEntry,
  type OpenAiAssistProviderMode,
  type OpenAiAssistSettings,
} from "./openaiAssist";
import { getAiOutputTemplateType } from "./aiSafety";

type UseOpenAiAssistControllerArgs = {
  sourceModule: string;
  sourceText: string;
  contextKey: string;
  currentUserRole: string;
  sourceLabel?: string;
  customerName?: string;
  vehicleLabel?: string;
  roNumber?: string;
  currentUserName?: string;
  moduleKey: AiModuleKey;
  defaultAction?: AiAction;
};

type OpenAiAssistCacheEntry = OpenAiAssistDraft;

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

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStoredJson<T>(key: string, value: T) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage is advisory only for AI Assist.
  }
}

function useStoredOpenAiSettings(): OpenAiAssistSettings {
  const provider = React.useMemo<OpenAiAssistProviderMode>(() => {
    const stored = readStoredSetting(SETTINGS_PROVIDER_KEY);
    return stored === "OpenAI" ? "OpenAI" : "Disabled";
  }, []);
  const model = React.useMemo(() => readStoredSetting(SETTINGS_MODEL_KEY) || "gpt-4.1-mini", []);
  const maxTokens = React.useMemo(() => {
    const stored = Number(readStoredSetting(SETTINGS_MAX_TOKENS_KEY));
    return Number.isFinite(stored) && stored > 0 ? Math.max(32, Math.min(4000, Math.round(stored))) : 240;
  }, []);

  return React.useMemo(
    () => ({
      provider,
      model: model.trim() || "gpt-4.1-mini",
      maxTokens,
      outputMode: "Standard",
    }),
    [maxTokens, model, provider]
  );
}

function createLogId() {
  return `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createLogEntry(entry: OpenAiAssistLogEntry): OpenAiAssistLogEntry {
  return entry;
}

function getSafetyLabel() {
  return "AI-generated draft - review before use";
}

export function useOpenAiAssistController({
  sourceModule,
  sourceText,
  contextKey,
  currentUserRole,
  currentUserName,
  moduleKey,
  sourceLabel,
  customerName,
  vehicleLabel,
  roNumber,
  defaultAction = "Explain to Customer",
}: UseOpenAiAssistControllerArgs) {
  const baseSettings = useStoredOpenAiSettings();
  const [outputMode, setOutputMode] = useAiOutputMode();
  const settings: OpenAiAssistSettings = React.useMemo(
    () => ({
      ...baseSettings,
      outputMode,
    }),
    [baseSettings, outputMode]
  );
  const openAiApiKey = React.useMemo(() => String(import.meta.env.VITE_OPENAI_API_KEY ?? "").trim(), []);
  const moduleEnabled = useAiModuleEnabled(moduleKey);
  const canUseAiAssist = isAllowedAiRole(currentUserRole) && moduleEnabled;

  const [action, setAction] = React.useState<AiAction>(defaultAction);
  const [draftText, setDraftText] = React.useState("");
  const [draftMeta, setDraftMeta] = React.useState<OpenAiAssistDraft | null>(null);
  const [feedback, setFeedback] = React.useState("");
  const [draftFromCache, setDraftFromCache] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [reviewed, setReviewedState] = React.useState(false);
  const [reviewedAt, setReviewedAt] = React.useState("");
  const [logs, setLogs] = React.useState<OpenAiAssistLogEntry[]>(() => readStoredJson<OpenAiAssistLogEntry[]>(OPENAI_ASSIST_LOG_STORAGE_KEY, []));
  const [draftCache, setDraftCache] = React.useState<Record<string, OpenAiAssistCacheEntry>>(() =>
    readStoredJson<Record<string, OpenAiAssistCacheEntry>>(OPENAI_ASSIST_DRAFT_CACHE_STORAGE_KEY, {})
  );

  React.useEffect(() => {
    writeStoredJson(OPENAI_ASSIST_LOG_STORAGE_KEY, logs);
  }, [logs]);

  React.useEffect(() => {
    writeStoredJson(OPENAI_ASSIST_DRAFT_CACHE_STORAGE_KEY, draftCache);
  }, [draftCache]);

  const cacheKey = React.useMemo(() => [action, contextKey, settings.model, outputMode].join("::"), [action, contextKey, outputMode, settings.model]);

  React.useEffect(() => {
    const cached = draftCache[cacheKey];
    if (cached) {
      setDraftText(cached.draftText);
      setDraftMeta(cached);
      setDraftFromCache(true);
      setFeedback(`Loaded cached ${normalizeAiAction(action).toLowerCase()} draft.`);
      setReviewedState(false);
      setReviewedAt("");
      return;
    }
    setDraftText(sourceText);
    setDraftMeta(null);
    setDraftFromCache(false);
    setReviewedState(false);
    setReviewedAt("");
    setFeedback(`Select ${sourceLabel || sourceModule} content and click Generate.`);
  }, [action, cacheKey, draftCache, sourceLabel, sourceModule, sourceText]);

  const setReviewed = React.useCallback((nextReviewed: boolean) => {
    setReviewedState(nextReviewed);
    setReviewedAt(nextReviewed ? new Date().toISOString() : "");
  }, []);

  const generate = React.useCallback(
    async (nextAction: AiAction) => {
      setAction(nextAction);
      if (!canUseAiAssist) {
        setFeedback(getAiAccessMessage(moduleKey, currentUserRole, moduleEnabled));
        return;
      }

      const nextCacheKey = [nextAction, contextKey, settings.model, outputMode].join("::");
      const cached = draftCache[nextCacheKey];
      if (cached) {
        setDraftText(cached.draftText);
        setDraftMeta(cached);
        setDraftFromCache(true);
        setReviewed(false);
        const cachedLog: OpenAiAssistLogEntry = createLogEntry({
          id: createLogId(),
          actionType: cached.actionType,
          sourceModule,
          status: cached.providerName === "fallback" ? "Failure" : "Success",
          generatedAt: new Date().toISOString(),
          provider: "OpenAI",
          model: cached.model,
          note: `Loaded cached ${nextAction.toLowerCase()} draft.`,
          user: currentUserName,
          role: currentUserRole,
          reviewed: false,
          reviewedAt: "",
          copied: false,
          used: false,
          copiedAt: "",
          usedAt: "",
          success: cached.providerName !== "fallback",
          warningReason: cached.warning || cached.errorReason,
          safetyLabel: getSafetyLabel(),
          moduleEnabled,
          outputMode: cached.outputMode ?? outputMode,
          templateType: cached.templateType ?? getAiOutputTemplateType(cached.outputMode ?? outputMode),
        });
        setLogs((prev) => [cachedLog, ...prev].slice(0, 40));
        setFeedback(`Loaded cached ${nextAction.toLowerCase()} draft.`);
        return;
      }

      setIsGenerating(true);
      try {
        const result = await generateOpenAiAssistDraft({
          actionType: nextAction as OpenAiAssistAction,
          sourceText,
          settings,
          apiKey: openAiApiKey,
          cacheKey: nextCacheKey,
          sourceModule,
          contextLabel: sourceLabel || sourceModule,
          customerName,
          vehicleLabel,
          roNumber,
        });

        const logEntry: OpenAiAssistLogEntry = createLogEntry({
          id: createLogId(),
          actionType: result.actionType,
          sourceModule,
          status: result.providerName === "fallback" ? "Failure" : "Success",
          generatedAt: result.generatedAt,
          provider: "OpenAI",
          model: result.model,
          note: result.note,
          errorMessage: result.errorReason || result.errorMessage,
          providerName: result.providerName,
          user: currentUserName,
          role: currentUserRole,
          reviewed: false,
          reviewedAt: "",
          copied: false,
          used: false,
          copiedAt: "",
          usedAt: "",
          success: result.providerName !== "fallback",
          warningReason: result.warning || result.errorReason,
          safetyLabel: getSafetyLabel(),
          moduleEnabled,
          outputMode: result.outputMode,
          templateType: result.templateType,
        });

        setDraftCache((prev) => ({
          ...prev,
          [nextCacheKey]: result,
        }));
        setDraftText(result.draftText);
        setDraftMeta(result);
        setDraftFromCache(false);
        setReviewed(false);
        setReviewedAt("");
        setFeedback(result.note);
        setLogs((prev) => [logEntry, ...prev].slice(0, 40));
      } finally {
        setIsGenerating(false);
      }
    },
    [canUseAiAssist, contextKey, currentUserName, currentUserRole, customerName, draftCache, moduleEnabled, moduleKey, openAiApiKey, outputMode, roNumber, settings, sourceLabel, sourceModule, sourceText, vehicleLabel]
  );

  const useDraft = React.useCallback(() => {
    if (!reviewed) {
      const message = "Review confirmation is required before using this AI draft.";
      setFeedback(message);
      setLogs((prev) => [
        createLogEntry({
          id: createLogId(),
          actionType: action,
          sourceModule,
          status: "Failure",
          generatedAt: new Date().toISOString(),
          provider: "OpenAI",
          model: settings.model,
          note: message,
          user: currentUserName,
          role: currentUserRole,
          reviewed: false,
          reviewedAt: reviewedAt || "",
          used: false,
          usedAt: "",
          copied: false,
          copiedAt: "",
          success: false,
          warningReason: message,
          safetyLabel: getSafetyLabel(),
          moduleEnabled,
          outputMode,
          templateType: getAiOutputTemplateType(outputMode),
        }),
        ...prev,
      ].slice(0, 40));
      return;
    }

    const usedAt = new Date().toISOString();
    setFeedback("Draft is ready to copy into the current notes field.");
    setLogs((prev) => [
      createLogEntry({
        id: createLogId(),
        actionType: action,
        sourceModule,
        status: "Success",
        generatedAt: usedAt,
        provider: "OpenAI",
        model: settings.model,
        note: "Draft marked for use.",
        user: currentUserName,
        role: currentUserRole,
        reviewed: true,
        reviewedAt: reviewedAt || usedAt,
        used: true,
        usedAt,
        copied: false,
        copiedAt: "",
        success: true,
        safetyLabel: getSafetyLabel(),
        moduleEnabled,
        outputMode,
        templateType: getAiOutputTemplateType(outputMode),
      }),
      ...prev,
    ].slice(0, 40));
  }, [action, currentUserName, currentUserRole, moduleEnabled, outputMode, reviewed, reviewedAt, settings.model, sourceModule]);

  const copyDraft = React.useCallback(async () => {
    if (!reviewed) {
      const message = "Review confirmation is required before copying this AI draft.";
      setFeedback(message);
      setLogs((prev) => [
        createLogEntry({
          id: createLogId(),
          actionType: action,
          sourceModule,
          status: "Failure",
          generatedAt: new Date().toISOString(),
          provider: "OpenAI",
          model: settings.model,
          note: message,
          user: currentUserName,
          role: currentUserRole,
          reviewed: false,
          reviewedAt: reviewedAt || "",
          copied: false,
          copiedAt: "",
          used: false,
          usedAt: "",
          success: false,
          warningReason: message,
          safetyLabel: getSafetyLabel(),
          moduleEnabled,
          outputMode,
          templateType: getAiOutputTemplateType(outputMode),
        }),
        ...prev,
      ].slice(0, 40));
      return;
    }
    try {
      await navigator.clipboard.writeText(draftText);
      setFeedback("Draft copied to clipboard.");
      const copiedAt = new Date().toISOString();
      setLogs((prev) => [
        createLogEntry({
          id: createLogId(),
          actionType: action,
          sourceModule,
          status: "Success",
          generatedAt: copiedAt,
          provider: "OpenAI",
          model: settings.model,
          note: "Draft copied to clipboard.",
          user: currentUserName,
          role: currentUserRole,
          reviewed: true,
          reviewedAt: reviewedAt || copiedAt,
          copied: true,
          copiedAt,
          used: false,
          usedAt: "",
          success: true,
          safetyLabel: getSafetyLabel(),
          moduleEnabled,
          outputMode,
          templateType: getAiOutputTemplateType(outputMode),
        }),
        ...prev,
      ].slice(0, 40));
    } catch {
      setFeedback("Clipboard copy failed. Please copy manually.");
      setLogs((prev) => [
        createLogEntry({
          id: createLogId(),
          actionType: action,
          sourceModule,
          status: "Failure",
          generatedAt: new Date().toISOString(),
          provider: "OpenAI",
          model: settings.model,
          note: "Clipboard copy failed.",
          user: currentUserName,
          role: currentUserRole,
          reviewed,
          reviewedAt: reviewedAt || "",
          copied: false,
          copiedAt: "",
          used: false,
          usedAt: "",
          success: false,
          warningReason: "Clipboard copy failed.",
          safetyLabel: getSafetyLabel(),
          moduleEnabled,
          outputMode,
          templateType: getAiOutputTemplateType(outputMode),
        }),
        ...prev,
      ].slice(0, 40));
    }
  }, [action, currentUserName, currentUserRole, draftText, moduleEnabled, outputMode, reviewed, reviewedAt, settings.model, sourceModule]);

  const markReviewed = React.useCallback(() => {
    const now = new Date().toISOString();
    setReviewed(true);
    setFeedback("Draft marked as reviewed.");
    setLogs((prev) => [
      createLogEntry({
        id: createLogId(),
        actionType: action,
        sourceModule,
        status: "Success",
        generatedAt: now,
        provider: "OpenAI",
        model: settings.model,
        note: "Draft marked as reviewed.",
        user: currentUserName,
        role: currentUserRole,
        reviewed: true,
        reviewedAt: now,
        copied: false,
        copiedAt: "",
        used: false,
        usedAt: "",
        success: true,
        safetyLabel: getSafetyLabel(),
        moduleEnabled,
        outputMode,
        templateType: getAiOutputTemplateType(outputMode),
      }),
      ...prev,
    ].slice(0, 40));
  }, [action, currentUserName, currentUserRole, moduleEnabled, outputMode, setLogs, settings.model, sourceModule]);

  const resetToSource = React.useCallback(() => {
    setDraftText(sourceText);
    setDraftMeta(null);
    setDraftFromCache(false);
    setReviewed(false);
    setReviewedAt("");
    setFeedback("Draft reset to the live source text.");
  }, [sourceText]);

  return {
    action,
    setAction,
    draftText,
    setDraftText,
    draftMeta,
    feedback,
    setFeedback,
    draftFromCache,
    isGenerating,
    canUseAiAssist,
    reviewed,
    reviewedAt,
    setReviewed,
    accessMessage: getAiAccessMessage(moduleKey, currentUserRole, moduleEnabled),
    providerMode: settings.provider,
    model: settings.model,
    maxTokens: settings.maxTokens,
    apiKeyConfigured: !!openAiApiKey,
    logs,
    generate,
    useDraft,
    copyDraft,
    markReviewed,
    resetToSource,
    outputMode,
    setOutputMode,
  };
}
