import * as XLSX from "xlsx";

export type ImportEntityType =
  | "customers"
  | "vehicles"
  | "inventory"
  | "suppliers"
  | "expenses"
  | "serviceHistory";

export type ParsedImportRow = Record<string, string>;

export type ParseResult = {
  headers: string[];
  rows: ParsedImportRow[];
  error?: string;
  tooLarge?: boolean;
  totalRowCount: number;
};

const MAX_ROWS_WARNING = 500;
const MAX_FILE_SIZE_MB = 5;

export async function parseExcelFile(file: File): Promise<ParseResult> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return {
      headers: [],
      rows: [],
      totalRowCount: 0,
      tooLarge: true,
      error: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed is ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  try {
    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab, { type: "array", raw: false });

    if (!wb.SheetNames.length) {
      return { headers: [], rows: [], totalRowCount: 0, error: "File has no sheets." };
    }

    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      raw: false,
      defval: "",
    });

    if (!rawRows.length) {
      return { headers: [], rows: [], totalRowCount: 0, error: "Sheet is empty or has no data rows." };
    }

    const headers = Object.keys(rawRows[0]);

    const rows: ParsedImportRow[] = rawRows.map((row) => {
      const normalized: ParsedImportRow = {};
      headers.forEach((h) => {
        normalized[h] = String(row[h] ?? "").trim();
      });
      return normalized;
    });

    const result: ParseResult = { headers, rows, totalRowCount: rows.length };

    if (rows.length > MAX_ROWS_WARNING) {
      result.error = `Warning: file contains ${rows.length} rows. Large imports may take a moment.`;
    }

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown parse error";
    return {
      headers: [],
      rows: [],
      totalRowCount: 0,
      error: `Could not read file: ${message}. Make sure this is a valid .xlsx or .xls file.`,
    };
  }
}

export function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_\-/]+/g, " ");
}

export function findColumn(headers: string[], ...aliases: string[]): string | null {
  const normalizedHeaders = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalizedHeaders.indexOf(normalizeHeader(alias));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

export function getRequiredColumns(entityType: ImportEntityType): string[] {
  switch (entityType) {
    case "customers":
      return ["Full Name", "Phone"];
    case "vehicles":
      return ["Customer Name", "Make", "Model"];
    case "inventory":
      return ["Item Name"];
    case "suppliers":
      return ["Supplier Name"];
    case "expenses":
      return ["Date", "Category", "Amount"];
    case "serviceHistory":
      return ["Plate Number", "Service Title", "Completed At"];
  }
}

export function getOptionalColumns(entityType: ImportEntityType): string[] {
  switch (entityType) {
    case "customers":
      return ["Email"];
    case "vehicles":
      return ["Plate Number", "Conduction Number", "Year", "Color", "Account Type", "Phone", "Email"];
    case "inventory":
      return ["SKU", "Category", "Brand", "Qty On Hand", "Reorder Level", "Unit Cost", "Selling Price", "Supplier"];
    case "suppliers":
      return ["Contact Person", "Phone", "Email", "Address"];
    case "expenses":
      return ["Vendor", "Description", "Payment Method", "Reference Number", "Note"];
    case "serviceHistory":
      return ["Odometer At Completion", "Category"];
  }
}
