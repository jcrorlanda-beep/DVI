import type { ApiResult, BackendDataMode, BackendHealthResponse } from "./apiTypes";

export const BACKEND_DATA_MODE_STORAGE_KEY = "dvi_backend_data_mode_v1";

export const DVI_API_BASE_URL = String(import.meta.env.VITE_DVI_API_URL ?? "").trim().replace(/\/+$/, "");

export const backendEnabledByEnv = String(import.meta.env.VITE_DVI_USE_BACKEND ?? "").toLowerCase() === "true";

type RequestOptions = {
  headers?: HeadersInit;
  signal?: AbortSignal;
};

type BodyRequestOptions<TBody> = RequestOptions & {
  body?: TBody;
};

function getStoredBackendDataMode(): BackendDataMode {
  if (typeof window === "undefined") return "Off / LocalStorage";
  return window.localStorage.getItem(BACKEND_DATA_MODE_STORAGE_KEY) === "Future Backend Enabled"
    ? "Future Backend Enabled"
    : "Off / LocalStorage";
}

export function getBackendDataMode(): BackendDataMode {
  return backendEnabledByEnv ? "Future Backend Enabled" : getStoredBackendDataMode();
}

export function isBackendDataModeEnabled(): boolean {
  return getBackendDataMode() === "Future Backend Enabled";
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${DVI_API_BASE_URL}${normalizedPath}`;
}

function buildHeaders(headers?: HeadersInit, hasBody = false): Headers {
  const next = new Headers(headers);
  if (hasBody && !next.has("Content-Type")) {
    next.set("Content-Type", "application/json");
  }
  return next;
}

async function parseResponse<T>(response: Response): Promise<ApiResult<T>> {
  const parsed = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      error: typeof parsed?.error === "string" ? parsed.error : `Request failed with status ${response.status}`,
    };
  }

  if (parsed && typeof parsed === "object" && "success" in parsed) {
    return parsed as ApiResult<T>;
  }

  return {
    success: true,
    data: parsed as T,
  };
}

export async function apiGet<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(buildUrl(path), {
      method: "GET",
      headers: buildHeaders(options.headers),
      signal: options.signal,
    });
    return parseResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Backend request failed",
    };
  }
}

export async function apiPost<T, TBody = unknown>(path: string, options: BodyRequestOptions<TBody> = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(buildUrl(path), {
      method: "POST",
      headers: buildHeaders(options.headers, options.body !== undefined),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
    return parseResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Backend request failed",
    };
  }
}

export async function apiPatch<T, TBody = unknown>(path: string, options: BodyRequestOptions<TBody> = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(buildUrl(path), {
      method: "PATCH",
      headers: buildHeaders(options.headers, options.body !== undefined),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
    return parseResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Backend request failed",
    };
  }
}

export async function apiDelete<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(buildUrl(path), {
      method: "DELETE",
      headers: buildHeaders(options.headers),
      signal: options.signal,
    });
    return parseResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Backend request failed",
    };
  }
}

export async function checkBackendHealth(): Promise<ApiResult<BackendHealthResponse>> {
  return apiGet<BackendHealthResponse>("/api/health");
}
