import type { ParsedImportRow, ImportEntityType } from "./excelImport";
import { findColumn } from "./excelImport";

export type ValidationSeverity = "error" | "warning" | "info";

export type RowIssue = {
  rowIndex: number;
  field: string;
  message: string;
  severity: ValidationSeverity;
};

export type ValidatedRow = {
  rowIndex: number;
  original: ParsedImportRow;
  normalized: ParsedImportRow;
  issues: RowIssue[];
  blocked: boolean;
};

export type ValidationSummary = {
  totalRows: number;
  validRows: number;
  rowsNeedingReview: number;
  blockedRows: number;
  importableRows: number;
  issues: RowIssue[];
  validatedRows: ValidatedRow[];
};

function readFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0/, "63").slice(-10);
}

function isValidYear(year: string): boolean {
  const n = Number(year);
  return Number.isInteger(n) && n >= 1900 && n <= new Date().getFullYear() + 2;
}

function isValidAmount(amount: string): boolean {
  const n = Number(String(amount).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) && n >= 0;
}

function isValidDate(dateStr: string): boolean {
  if (!dateStr.trim()) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function normalizeRow(row: ParsedImportRow, headers: string[], entityType: ImportEntityType): ParsedImportRow {
  const norm: ParsedImportRow = { ...row };

  if (entityType === "customers" || entityType === "vehicles") {
    const phoneCol = findColumn(headers, "Phone", "Contact", "Mobile");
    if (phoneCol && norm[phoneCol]) {
      const digits = norm[phoneCol].replace(/\D/g, "");
      if (digits.length === 11 && digits.startsWith("0")) {
        norm[phoneCol] = digits;
      }
    }
    const plateCol = findColumn(headers, "Plate Number", "Plate");
    if (plateCol && norm[plateCol]) {
      norm[plateCol] = norm[plateCol].toUpperCase().trim();
    }
    const conductionCol = findColumn(headers, "Conduction Number", "Conduction");
    if (conductionCol && norm[conductionCol]) {
      norm[conductionCol] = norm[conductionCol].toUpperCase().trim();
    }
  }

  if (entityType === "inventory") {
    const skuCol = findColumn(headers, "SKU", "Sku", "Part Number");
    if (skuCol && norm[skuCol]) {
      norm[skuCol] = norm[skuCol].toUpperCase().trim();
    }
  }

  if (entityType === "expenses") {
    const amtCol = findColumn(headers, "Amount");
    if (amtCol && norm[amtCol]) {
      norm[amtCol] = String(Number(norm[amtCol].replace(/[^0-9.-]/g, "")) || 0);
    }
  }

  return norm;
}

export function validateImportRows(
  rows: ParsedImportRow[],
  headers: string[],
  entityType: ImportEntityType
): ValidationSummary {
  const issues: RowIssue[] = [];
  const validatedRows: ValidatedRow[] = [];

  // Pre-load existing data for duplicate detection
  const existingCustomers = readFromStorage<Record<string, unknown>>("dvi_phase15a_customer_accounts_v1");
  const existingIntakes = readFromStorage<Record<string, unknown>>("dvi_phase2_intake_records_v1");
  const existingInventory = readFromStorage<Record<string, unknown>>("dvi_inventory_items_v1");

  const existingPhones = new Set(
    existingCustomers.map((c) => sanitizePhone(String(c.phone ?? "")))
  );
  const existingPlates = new Set([
    ...existingIntakes.map((r) => String(r.plateNumber ?? "").toUpperCase().trim()),
    ...existingIntakes.map((r) => String(r.conductionNumber ?? "").toUpperCase().trim()),
  ]);
  const existingSKUs = new Set(
    existingInventory.map((i) => String(i.sku ?? "").toUpperCase().trim())
  );

  // Track duplicates within the import file itself
  const seenPhones = new Set<string>();
  const seenPlates = new Set<string>();
  const seenSKUs = new Set<string>();

  rows.forEach((row, idx) => {
    const rowIssues: RowIssue[] = [];
    const normalized = normalizeRow(row, headers, entityType);

    // Skip empty rows
    const allEmpty = Object.values(row).every((v) => !v.trim());
    if (allEmpty) {
      rowIssues.push({ rowIndex: idx, field: "row", message: "Empty row — will be skipped", severity: "info" });
      validatedRows.push({ rowIndex: idx, original: row, normalized, issues: rowIssues, blocked: false });
      return;
    }

    if (entityType === "customers") {
      const nameCol = findColumn(headers, "Full Name", "Name", "Customer Name");
      const phoneCol = findColumn(headers, "Phone", "Contact", "Mobile");
      const emailCol = findColumn(headers, "Email");

      if (!nameCol || !normalized[nameCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Full Name", message: "Full Name is required", severity: "error" });
      }

      if (!phoneCol || !normalized[phoneCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Phone", message: "Phone is required", severity: "error" });
      } else {
        const phone = sanitizePhone(normalized[phoneCol]);
        if (phone.length < 10) {
          rowIssues.push({ rowIndex: idx, field: "Phone", message: `Phone number looks invalid: ${normalized[phoneCol]}`, severity: "warning" });
        }
        if (existingPhones.has(phone)) {
          rowIssues.push({ rowIndex: idx, field: "Phone", message: "Phone matches an existing customer — will be skipped (duplicate)", severity: "warning" });
        }
        if (seenPhones.has(phone)) {
          rowIssues.push({ rowIndex: idx, field: "Phone", message: "Duplicate phone within this import file", severity: "warning" });
        }
        seenPhones.add(phone);
      }

      if (emailCol && normalized[emailCol] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized[emailCol])) {
        rowIssues.push({ rowIndex: idx, field: "Email", message: `Email looks invalid: ${normalized[emailCol]}`, severity: "warning" });
      }
    }

    if (entityType === "vehicles") {
      const plateCol = findColumn(headers, "Plate Number", "Plate");
      const conductionCol = findColumn(headers, "Conduction Number", "Conduction");
      const makeCol = findColumn(headers, "Make");
      const modelCol = findColumn(headers, "Model");
      const yearCol = findColumn(headers, "Year");

      const plate = plateCol ? normalized[plateCol] : "";
      const conduction = conductionCol ? normalized[conductionCol] : "";

      if (!plate && !conduction) {
        rowIssues.push({ rowIndex: idx, field: "Plate / Conduction", message: "Plate Number or Conduction Number is required", severity: "error" });
      } else {
        const identifier = plate || conduction;
        if (existingPlates.has(identifier)) {
          rowIssues.push({ rowIndex: idx, field: "Plate / Conduction", message: `${identifier} matches an existing vehicle record — will be skipped`, severity: "warning" });
        }
        if (seenPlates.has(identifier)) {
          rowIssues.push({ rowIndex: idx, field: "Plate / Conduction", message: "Duplicate plate/conduction number within this import file", severity: "warning" });
        }
        seenPlates.add(identifier);
      }

      if (!makeCol || !normalized[makeCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Make", message: "Vehicle Make is required", severity: "error" });
      }
      if (!modelCol || !normalized[modelCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Model", message: "Vehicle Model is required", severity: "error" });
      }
      if (yearCol && normalized[yearCol] && !isValidYear(normalized[yearCol])) {
        rowIssues.push({ rowIndex: idx, field: "Year", message: `Year looks invalid: ${normalized[yearCol]}`, severity: "warning" });
      }
    }

    if (entityType === "inventory") {
      const nameCol = findColumn(headers, "Item Name", "Name");
      const skuCol = findColumn(headers, "SKU", "Sku", "Part Number");
      const costCol = findColumn(headers, "Unit Cost", "Cost");
      const priceCol = findColumn(headers, "Selling Price", "Price");

      if (!nameCol || !normalized[nameCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Item Name", message: "Item Name is required", severity: "error" });
      }

      if (skuCol && normalized[skuCol]) {
        const sku = normalized[skuCol].toUpperCase();
        if (existingSKUs.has(sku)) {
          rowIssues.push({ rowIndex: idx, field: "SKU", message: `SKU "${sku}" already exists — will be skipped`, severity: "warning" });
        }
        if (seenSKUs.has(sku)) {
          rowIssues.push({ rowIndex: idx, field: "SKU", message: "Duplicate SKU within this import file", severity: "warning" });
        }
        seenSKUs.add(sku);
      }

      if (costCol && normalized[costCol] && !isValidAmount(normalized[costCol])) {
        rowIssues.push({ rowIndex: idx, field: "Unit Cost", message: `Unit Cost looks invalid: ${normalized[costCol]}`, severity: "warning" });
      }
      if (priceCol && normalized[priceCol] && !isValidAmount(normalized[priceCol])) {
        rowIssues.push({ rowIndex: idx, field: "Selling Price", message: `Selling Price looks invalid: ${normalized[priceCol]}`, severity: "warning" });
      }
    }

    if (entityType === "suppliers") {
      const nameCol = findColumn(headers, "Supplier Name", "Name");
      if (!nameCol || !normalized[nameCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Supplier Name", message: "Supplier Name is required", severity: "error" });
      }
    }

    if (entityType === "expenses") {
      const dateCol = findColumn(headers, "Date");
      const categoryCol = findColumn(headers, "Category");
      const amountCol = findColumn(headers, "Amount");

      if (!dateCol || !normalized[dateCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Date", message: "Date is required", severity: "error" });
      } else if (!isValidDate(normalized[dateCol])) {
        rowIssues.push({ rowIndex: idx, field: "Date", message: `Date format looks invalid: ${normalized[dateCol]}. Use YYYY-MM-DD.`, severity: "error" });
      }

      if (!categoryCol || !normalized[categoryCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Category", message: "Category is required", severity: "error" });
      }

      if (!amountCol || !normalized[amountCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Amount", message: "Amount is required", severity: "error" });
      } else if (!isValidAmount(normalized[amountCol])) {
        rowIssues.push({ rowIndex: idx, field: "Amount", message: `Amount looks invalid: ${normalized[amountCol]}`, severity: "error" });
      }
    }

    if (entityType === "serviceHistory") {
      const plateCol = findColumn(headers, "Plate Number", "Plate");
      const titleCol = findColumn(headers, "Service Title", "Title", "Service");
      const dateCol = findColumn(headers, "Completed At", "Date", "Completion Date");

      if (!plateCol || !normalized[plateCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Plate Number", message: "Plate Number is required", severity: "error" });
      }
      if (!titleCol || !normalized[titleCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Service Title", message: "Service Title is required", severity: "error" });
      }
      if (!dateCol || !normalized[dateCol]?.trim()) {
        rowIssues.push({ rowIndex: idx, field: "Completed At", message: "Completed At date is required", severity: "error" });
      } else if (!isValidDate(normalized[dateCol])) {
        rowIssues.push({ rowIndex: idx, field: "Completed At", message: `Date format looks invalid: ${normalized[dateCol]}. Use YYYY-MM-DD.`, severity: "warning" });
      }
    }

    const hasBlockingError = rowIssues.some((i) => i.severity === "error");
    validatedRows.push({ rowIndex: idx, original: row, normalized, issues: rowIssues, blocked: hasBlockingError });
    issues.push(...rowIssues);
  });

  const totalRows = validatedRows.length;
  const blockedRows = validatedRows.filter((r) => r.blocked).length;
  const emptyRows = validatedRows.filter((r) => r.issues.some((i) => i.field === "row" && i.severity === "info")).length;
  const rowsWithWarnings = validatedRows.filter(
    (r) => !r.blocked && r.issues.some((i) => i.severity === "warning")
  ).length;
  const importableRows = totalRows - blockedRows - emptyRows;
  const validRows = importableRows - rowsWithWarnings;

  return {
    totalRows,
    validRows,
    rowsNeedingReview: rowsWithWarnings,
    blockedRows,
    importableRows,
    issues,
    validatedRows,
  };
}
