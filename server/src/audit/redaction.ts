const SENSITIVE_KEY_PATTERN = /(api[_-]?key|password|secret|token|credential|openai|sms[_-]?credential|database[_-]?url)/i;

export function redactSensitiveAuditDetails(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveAuditDetails(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : redactSensitiveAuditDetails(item),
    ]),
  );
}

export function redactAuditPayload<T extends Record<string, unknown>>(payload: T): T {
  return {
    ...payload,
    details: redactSensitiveAuditDetails(payload.details ?? {}),
  };
}
