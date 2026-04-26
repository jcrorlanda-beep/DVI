import type { ApiFailure, ApiResult, BackendHealthResponse } from "./apiTypes";

export function createMockApiSuccess<T>(data: T): ApiResult<T> {
  return {
    success: true,
    data,
    meta: {
      source: "mock",
      generatedAt: new Date(0).toISOString(),
    },
  };
}

export function createMockApiFailure(error = "Mock backend unavailable"): ApiFailure {
  return {
    success: false,
    error,
    meta: {
      source: "mock",
      generatedAt: new Date(0).toISOString(),
    },
  };
}

export function createMockBackendHealth(overrides: Partial<BackendHealthResponse> = {}): ApiResult<BackendHealthResponse> {
  return createMockApiSuccess({
    status: "ok",
    service: "dvi-backend",
    mode: "optional",
    environment: "test",
    databaseConfigured: false,
    databaseConnected: false,
    databaseMessage: "Mock health response. No real backend required.",
    generatedAt: new Date(0).toISOString(),
    ...overrides,
  });
}

export const BACKEND_HEALTH_MOCK_NOTE =
  "Use these helpers for frontend tests that need backend-shaped responses without requiring the optional backend server.";
