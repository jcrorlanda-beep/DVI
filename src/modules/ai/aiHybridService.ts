import { getFallbackDraft, normalizeAiAction, type AiAction, type AiInput } from "./aiFallback";
import { runOpenAI } from "./openaiProvider";
import {
  getAiOutputTemplateType,
  readAiOutputMode,
} from "./aiSafety";
import {
  getOllamaDefaultModel,
  runOllamaDraft,
  type AiAction as OllamaAiAction,
  type AiProviderName,
} from "./ollamaProvider";

export type AiHybridDraftResult = {
  text: string;
  provider: AiProviderName;
  usedFallback: boolean;
  warning?: string;
  errorReason?: string;
  cached?: boolean;
  outputMode?: "Short" | "Standard" | "Detailed";
  templateType?: "SMS" | "Standard" | "Report";
};

type CacheEntry = AiHybridDraftResult & {
  cacheKey: string;
  generatedAt: string;
};

const HYBRID_CACHE_KEY = "dvi_hybrid_ai_cache_v1";

function readCache(): Record<string, CacheEntry> {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(HYBRID_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CacheEntry>) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(HYBRID_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Cache is advisory only.
  }
}

function getCacheKey(action: OllamaAiAction, input: string, model: string, preferLocal: boolean, outputMode: string) {
  return [action, model, preferLocal ? "local" : "cloud", outputMode, input.trim()].join("::");
}

function buildInput(
  input: string,
  options?: {
    outputMode?: "Short" | "Standard" | "Detailed";
    moduleLabel?: string;
    contextLabel?: string;
  }
): AiInput {
  const outputMode = options?.outputMode ?? readAiOutputMode();
  return {
    sourceText: input,
    contextLabel: options?.contextLabel || "Workshop communication",
    moduleLabel: options?.moduleLabel,
    outputMode,
  };
}

function mapAction(action: OllamaAiAction) {
  return normalizeAiAction(action);
}

function combineWarnings(values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export async function generateAiDraft(
  action: OllamaAiAction,
  input: string,
  options?: {
    preferLocal?: boolean;
    timeoutMs?: number;
    model?: string;
    outputMode?: "Short" | "Standard" | "Detailed";
    moduleLabel?: string;
    contextLabel?: string;
  }
): Promise<AiHybridDraftResult> {
  const preferLocal = options?.preferLocal ?? true;
  const localModel = getOllamaDefaultModel();
  const cloudModel = options?.model?.trim() || "gpt-4.1-mini";
  const resolvedOutputMode = options?.outputMode ?? readAiOutputMode();
  const cacheKey = getCacheKey(action, input, `${localModel}::${cloudModel}`, preferLocal, resolvedOutputMode);
  const cached = readCache()[cacheKey];
  if (cached) {
    return {
      text: cached.text,
      provider: cached.provider,
      usedFallback: cached.usedFallback,
      warning: cached.warning,
      errorReason: cached.errorReason,
      cached: true,
      outputMode: cached.outputMode ?? resolvedOutputMode,
      templateType: cached.templateType ?? getAiOutputTemplateType(cached.outputMode ?? resolvedOutputMode),
    };
  }

  const normalizedAction = mapAction(action);
  const ollamaAction = normalizedAction as OllamaAiAction;
  const aiInput = buildInput(input, {
    outputMode: resolvedOutputMode,
    moduleLabel: options?.moduleLabel,
    contextLabel: options?.contextLabel,
  });
  const warnings: string[] = [];

  const openaiFallback = async () => {
    const openaiResult = await runOpenAI(normalizedAction, aiInput, {
      settings: {
        provider: "OpenAI",
        model: cloudModel,
        maxTokens: 240,
        outputMode: resolvedOutputMode,
      },
      apiKey: String(import.meta.env.VITE_OPENAI_API_KEY ?? "").trim(),
      cacheKey,
      sourceModule: "hybrid",
    });

    if (openaiResult.providerName === "openai") {
      return {
        text: openaiResult.draftText,
        provider: "openai" as const,
        usedFallback: true,
        warning: combineWarnings(["Using cloud AI fallback", openaiResult.warning]),
        errorReason: openaiResult.errorReason || openaiResult.errorMessage,
        outputMode: resolvedOutputMode,
        templateType: getAiOutputTemplateType(resolvedOutputMode),
      };
    }

    warnings.push(openaiResult.warning || openaiResult.note);
    return null;
  };

  const localFirst = async () => {
    const ollamaResult = await runOllamaDraft(ollamaAction, aiInput, {
      model: localModel,
      timeoutMs: options?.timeoutMs ?? 20_000,
    });
    if (ollamaResult.text.trim()) {
      return {
        text: ollamaResult.text,
        provider: "ollama" as const,
        usedFallback: false,
        warning: ollamaResult.warning,
        errorReason: ollamaResult.errorReason,
        outputMode: resolvedOutputMode,
        templateType: getAiOutputTemplateType(resolvedOutputMode),
      };
    }
    warnings.push(ollamaResult.warning ?? "Local AI is not running. Please open Ollama and try again.");
    return null;
  };

  const cloudFirst = async () => {
    const cloud = await openaiFallback();
    if (cloud) return cloud;
    const localResult = await runOllamaDraft(ollamaAction, aiInput, {
      model: localModel,
      timeoutMs: options?.timeoutMs ?? 20_000,
    });
    if (localResult.text.trim()) {
      return {
        text: localResult.text,
        provider: "ollama" as const,
        usedFallback: true,
        warning: localResult.warning,
        errorReason: localResult.errorReason,
        outputMode: resolvedOutputMode,
        templateType: getAiOutputTemplateType(resolvedOutputMode),
      };
    }
    warnings.push(localResult.warning ?? "Local AI is not running. Please open Ollama and try again.");
    return null;
  };

  let result: AiHybridDraftResult | null = null;
  if (preferLocal) {
    result = (await localFirst()) || (await openaiFallback());
  } else {
    result = (await cloudFirst()) || null;
  }

  if (result) {
    const entry: CacheEntry = {
      ...result,
      cacheKey,
      generatedAt: new Date().toISOString(),
    };
    writeCache({ ...readCache(), [cacheKey]: entry });
    return {
      ...result,
      cached: false,
      warning: result.warning || combineWarnings(warnings) || undefined,
    };
  }

  const fallbackText = getFallbackDraft(normalizedAction, {
    sourceText: input,
    contextLabel: options?.contextLabel || "Workshop communication",
    moduleLabel: options?.moduleLabel,
    outputMode: resolvedOutputMode,
  });
  const warning = combineWarnings(warnings) || "AI unavailable. Using template response.";
  const fallbackResult: AiHybridDraftResult = {
    text: fallbackText,
    provider: "fallback",
    usedFallback: true,
    warning,
    errorReason: warnings.filter(Boolean).join(" "),
    cached: false,
    outputMode: resolvedOutputMode,
    templateType: getAiOutputTemplateType(resolvedOutputMode),
  };
  const entry: CacheEntry = {
    ...fallbackResult,
    cacheKey,
    generatedAt: new Date().toISOString(),
  };
  writeCache({ ...readCache(), [cacheKey]: entry });
  return fallbackResult;
}
