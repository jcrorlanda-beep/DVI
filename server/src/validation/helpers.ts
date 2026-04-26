import type { ValidationIssue, ValidationResult } from "./types.js";

export function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === "object" && !Array.isArray(input);
}

export function makeResult(issues: ValidationIssue[]): ValidationResult {
  return {
    valid: issues.length === 0,
    issues,
  };
}

export function requiredString(record: Record<string, unknown>, field: string, label = field): ValidationIssue[] {
  const value = record[field];
  if (typeof value !== "string" || !value.trim()) {
    return [{ field, message: `${label} is required.`, code: "required_string" }];
  }
  return [];
}

export function optionalString(record: Record<string, unknown>, field: string, label = field): ValidationIssue[] {
  const value = record[field];
  if (value !== undefined && value !== null && typeof value !== "string") {
    return [{ field, message: `${label} must be text.`, code: "invalid_string" }];
  }
  return [];
}

export function optionalNumber(record: Record<string, unknown>, field: string, label = field): ValidationIssue[] {
  const value = record[field];
  if (value !== undefined && value !== null && (typeof value !== "number" || Number.isNaN(value))) {
    return [{ field, message: `${label} must be a valid number.`, code: "invalid_number" }];
  }
  return [];
}

export function optionalBoolean(record: Record<string, unknown>, field: string, label = field): ValidationIssue[] {
  const value = record[field];
  if (value !== undefined && value !== null && typeof value !== "boolean") {
    return [{ field, message: `${label} must be true or false.`, code: "invalid_boolean" }];
  }
  return [];
}

export function optionalIsoDate(record: Record<string, unknown>, field: string, label = field): ValidationIssue[] {
  const value = record[field];
  if (value === undefined || value === null || value === "") return [];
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return [{ field, message: `${label} must be a valid ISO date string.`, code: "invalid_date" }];
  }
  return [];
}

export function requireRecord(input: unknown, schemaName: string): { record?: Record<string, unknown>; issues: ValidationIssue[] } {
  if (!isRecord(input)) {
    return {
      issues: [{ field: "$root", message: `${schemaName} payload must be an object.`, code: "invalid_payload" }],
    };
  }
  return { record: input, issues: [] };
}
