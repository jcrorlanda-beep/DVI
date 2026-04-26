export function optionalText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function optionalNumber(data: Record<string, unknown>, key: string): number | string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return value.trim();
  return null;
}

export function optionalInteger(data: Record<string, unknown>, key: string): number | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Math.trunc(Number(value));
  return null;
}

export function optionalBoolean(data: Record<string, unknown>, key: string): boolean | undefined {
  if (!(key in data)) return undefined;
  return typeof data[key] === "boolean" ? data[key] : Boolean(data[key]);
}

export function optionalJson(data: Record<string, unknown>, key: string): unknown {
  return key in data ? data[key] ?? null : undefined;
}

export function optionalDateText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export function dateToIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : null;
}
