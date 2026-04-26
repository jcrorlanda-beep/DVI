import React, { useRef, useState } from "react";
import type { AuditLogRecord, SessionUser } from "../shared/types";
import {
  canAccessAdvisorTools,
  canAccessExcelExport,
  canAccessExcelImport,
  canAccessFinancialReports,
  canAccessInventoryManagement,
  canAccessManagementSummary,
} from "../shared/roleAccess";
import {
  type ExcelRow,
  buildBackjobReportRows,
  buildCustomerListReportRows,
  buildExcelDate,
  buildExpenseReportRows,
  buildInventoryReportRows,
  buildPaymentReportRows,
  buildPurchaseOrderReportRows,
  buildRevenueReportRows,
  buildSupplierPerformanceReportRows,
  buildTechnicianPerformanceReportRows,
  downloadCustomerTemplate,
  downloadExpenseTemplate,
  downloadInventoryTemplate,
  downloadServiceHistoryTemplate,
  downloadSupplierTemplate,
  downloadVehicleTemplate,
  triggerExcelDownload,
} from "./excelExport";
import { parseExcelFile } from "./excelImport";
import type { ImportEntityType, ParsedImportRow } from "./excelImport";
import { validateImportRows } from "./importValidation";
import type { ValidationSummary } from "./importValidation";

type Props = {
  currentUser: SessionUser;
  onLogAudit?: (entry: Omit<AuditLogRecord, "id" | "timestamp">) => void;
};

type Tab = "export" | "import" | "templates";
type ImportStep = "idle" | "preview" | "validated" | "done";

const ENTITY_LABELS: Record<ImportEntityType, string> = {
  customers: "Customers",
  vehicles: "Vehicles",
  inventory: "Inventory Items",
  suppliers: "Suppliers",
  expenses: "Expenses",
  serviceHistory: "Service History",
};

const STORAGE_KEYS: Record<ImportEntityType, string> = {
  customers: "dvi_phase15a_customer_accounts_v1",
  vehicles: "dvi_phase2_intake_records_v1",
  inventory: "dvi_inventory_items_v1",
  suppliers: "dvi_supplier_directory_v1",
  expenses: "dvi_phase53_expense_records_v1",
  serviceHistory: "dvi_vehicle_service_history_records_v1",
};

const s: Record<string, React.CSSProperties> = {
  page: { padding: 16, maxWidth: 960, margin: "0 auto" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: "#64748b", marginBottom: 20 },
  tabs: { display: "flex", gap: 4, marginBottom: 20, borderBottom: "2px solid #e2e8f0" },
  tab: { padding: "8px 18px", fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", color: "#64748b", borderBottom: "2px solid transparent", marginBottom: -2 },
  tabActive: { color: "#2563eb", borderBottomColor: "#2563eb", fontWeight: 700 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 },
  sectionNote: { fontSize: 12, color: "#64748b", marginBottom: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 12 },
  card: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 4 },
  cardNote: { fontSize: 12, color: "#64748b", marginBottom: 10 },
  exportBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13, width: "100%" },
  disabledBtn: { background: "#e2e8f0", color: "#94a3b8", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, cursor: "not-allowed", fontSize: 13, width: "100%" },
  templateBtn: { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 16px", fontWeight: 500, cursor: "pointer", fontSize: 13, width: "100%" },
  primaryBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  dangerBtn: { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 6, padding: "9px 18px", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  secondaryBtn: { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 14px", fontWeight: 500, cursor: "pointer", fontSize: 13 },
  uploadArea: { border: "2px dashed #cbd5e1", borderRadius: 8, padding: 32, textAlign: "center" as const, marginBottom: 16 },
  uploadText: { fontSize: 14, color: "#64748b", marginBottom: 12 },
  statusBox: { background: "#dcfce7", color: "#15803d", borderRadius: 6, padding: "10px 14px", fontSize: 13, marginBottom: 12 },
  warningBox: { background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#92400e", marginBottom: 12 },
  errorBox: { background: "#fee2e2", color: "#b91c1c", borderRadius: 6, padding: "10px 14px", fontSize: 13, marginBottom: 12 },
  infoBox: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 6, padding: "10px 14px", fontSize: 13, marginBottom: 12 },
  lockedBox: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 24, textAlign: "center" as const },
  lockedTitle: { fontSize: 15, fontWeight: 700, color: "#94a3b8", marginBottom: 6 },
  lockedNote: { fontSize: 13, color: "#94a3b8" },
  tableWrap: { overflowX: "auto" as const, marginBottom: 16 },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 12 },
  th: { background: "#f1f5f9", padding: "7px 10px", textAlign: "left" as const, fontWeight: 600, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" as const, color: "#475569" },
  td: { padding: "6px 10px", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" as const },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 },
  badgeOk: { background: "#dcfce7", color: "#15803d" },
  badgeWarn: { background: "#fef3c7", color: "#92400e" },
  badgeError: { background: "#fee2e2", color: "#b91c1c" },
  badgeInfo: { background: "#eff6ff", color: "#1d4ed8" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 16 },
  summaryCard: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 14px" },
  summaryLabel: { fontSize: 11, color: "#64748b", marginBottom: 2 },
  summaryValue: { fontSize: 20, fontWeight: 700, color: "#0f172a" },
  selectGroup: { display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" as const },
  select: { padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff" },
  btnRow: { display: "flex", gap: 10, flexWrap: "wrap" as const, marginBottom: 12 },
};

function readFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // non-fatal
  }
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function logAuditEntry(
  onLogAudit: ((entry: Omit<AuditLogRecord, "id" | "timestamp">) => void) | undefined,
  currentUser: SessionUser,
  action: string,
  entityLabel: string,
  detail: string
): void {
  if (!onLogAudit) return;
  onLogAudit({
    module: "Excel",
    action,
    entityId: entityLabel,
    entityLabel,
    userId: currentUser.id,
    userName: currentUser.fullName,
    detail,
  });
}

export function ExcelToolsPage({ currentUser, onLogAudit }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("export");
  const [exportStatus, setExportStatus] = useState("");
  const [importEntityType, setImportEntityType] = useState<ImportEntityType>("customers");
  const [importStep, setImportStep] = useState<ImportStep>("idle");
  const [importFileName, setImportFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parseError, setParseError] = useState("");
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [importResult, setImportResult] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canExport = canAccessExcelExport(currentUser.role);
  const canImport = canAccessExcelImport(currentUser.role);

  // ── Export handlers ──────────────────────────────────────────────────────────

  function handleExport(
    getRows: () => ExcelRow[],
    reportName: string,
    sheetName: string
  ) {
    try {
      const rows = getRows();
      const filename = `${reportName}-${buildExcelDate()}.xlsx`;
      triggerExcelDownload(rows, filename, sheetName);
      logAuditEntry(onLogAudit, currentUser, "export_created", reportName, `Exported ${rows.length} rows to ${filename}`);
      setExportStatus(`Exported ${rows.length} rows to ${filename}`);
      setTimeout(() => setExportStatus(""), 6000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      setExportStatus(`Export error: ${msg}`);
    }
  }

  // ── Import handlers ──────────────────────────────────────────────────────────

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setParseError("");
    setParsedRows([]);
    setParsedHeaders([]);
    setValidationSummary(null);
    setImportFileName(file.name);

    try {
      const result = await parseExcelFile(file);
      if (result.error && !result.rows.length) {
        setParseError(result.error);
        setImportStep("idle");
        return;
      }
      setParsedHeaders(result.headers);
      setParsedRows(result.rows);
      if (result.error) setParseError(result.error);

      // Auto-validate immediately
      const summary = validateImportRows(result.rows, result.headers, importEntityType);
      setValidationSummary(summary);
      logAuditEntry(onLogAudit, currentUser, "import_previewed", ENTITY_LABELS[importEntityType],
        `Import preview: ${result.rows.length} rows parsed from ${file.name}`);
      setImportStep("validated");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to read file");
      setImportStep("idle");
    } finally {
      setIsParsing(false);
    }
  };

  const handleReset = () => {
    setImportStep("idle");
    setParsedRows([]);
    setParsedHeaders([]);
    setParseError("");
    setValidationSummary(null);
    setImportResult("");
    setImportFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmImport = () => {
    if (!validationSummary || !validationSummary.importableRows) return;
    setIsImporting(true);
    try {
      const importableValidated = validationSummary.validatedRows.filter((r) => !r.blocked && !r.issues.some((i) => i.field === "row" && i.severity === "info"));
      const now = new Date().toISOString();
      const batchId = uid("ibatch");
      let imported = 0;
      let skipped = 0;

      if (importEntityType === "customers") {
        const existing = readFromStorage<Record<string, unknown>>(STORAGE_KEYS.customers);
        const existingPhones = new Set(existing.map((c) => String(c.phone ?? "").replace(/\D/g, "").slice(-10)));
        const toAdd = importableValidated
          .filter((r) => {
            const phone = String(r.normalized["Phone"] ?? r.normalized["phone"] ?? "").replace(/\D/g, "").slice(-10);
            if (existingPhones.has(phone)) { skipped++; return false; }
            return true;
          })
          .map((r) => ({
            id: uid("cust"),
            fullName: r.normalized["Full Name"] ?? r.normalized["full name"] ?? r.normalized["Name"] ?? "",
            phone: r.normalized["Phone"] ?? r.normalized["phone"] ?? "",
            email: r.normalized["Email"] ?? r.normalized["email"] ?? "",
            password: "",
            linkedPlateNumbers: [],
            linkedRoIds: [],
            importedAt: now,
            importedBy: currentUser.fullName,
            importBatchId: batchId,
            createdAt: now,
            updatedAt: now,
          }));
        writeToStorage(STORAGE_KEYS.customers, [...existing, ...toAdd]);
        imported = toAdd.length;
      }

      if (importEntityType === "inventory") {
        const existing = readFromStorage<Record<string, unknown>>(STORAGE_KEYS.inventory);
        const existingSKUs = new Set(existing.map((i) => String(i.sku ?? "").toUpperCase().trim()));
        const toAdd = importableValidated
          .filter((r) => {
            const sku = (r.normalized["SKU"] ?? r.normalized["sku"] ?? "").toUpperCase();
            if (sku && existingSKUs.has(sku)) { skipped++; return false; }
            return true;
          })
          .map((r) => ({
            id: uid("inv"),
            itemName: r.normalized["Item Name"] ?? r.normalized["item name"] ?? "",
            sku: (r.normalized["SKU"] ?? r.normalized["sku"] ?? "").toUpperCase(),
            category: r.normalized["Category"] ?? r.normalized["category"] ?? "",
            brand: r.normalized["Brand"] ?? r.normalized["brand"] ?? "",
            quantityOnHand: Number(r.normalized["Qty On Hand"] ?? r.normalized["qty on hand"] ?? "0") || 0,
            reorderLevel: Number(r.normalized["Reorder Level"] ?? r.normalized["reorder level"] ?? "0") || 0,
            unitCost: Number(r.normalized["Unit Cost"] ?? r.normalized["unit cost"] ?? "0") || 0,
            sellingPrice: Number(r.normalized["Selling Price"] ?? r.normalized["selling price"] ?? "0") || 0,
            supplier: r.normalized["Supplier"] ?? r.normalized["supplier"] ?? "",
            active: true,
            importedAt: now,
            importedBy: currentUser.fullName,
            importBatchId: batchId,
            createdAt: now,
            updatedAt: now,
          }));
        writeToStorage(STORAGE_KEYS.inventory, [...existing, ...toAdd]);
        imported = toAdd.length;
      }

      if (importEntityType === "expenses") {
        const existing = readFromStorage<Record<string, unknown>>(STORAGE_KEYS.expenses);
        const countersRaw = localStorage.getItem("dvi_phase2_counters_v1");
        let counters: Record<string, number> = {};
        try { counters = countersRaw ? JSON.parse(countersRaw) : {}; } catch { /**/ }

        const toAdd = importableValidated.map((r) => {
          counters["expense"] = (counters["expense"] ?? 0) + 1;
          const num = String(counters["expense"]).padStart(4, "0");
          return {
            id: uid("exp"),
            expenseNumber: `EXP-${num}`,
            date: r.normalized["Date"] ?? r.normalized["date"] ?? now.slice(0, 10),
            category: r.normalized["Category"] ?? r.normalized["category"] ?? "Other",
            vendor: r.normalized["Vendor"] ?? r.normalized["vendor"] ?? "",
            description: r.normalized["Description"] ?? r.normalized["description"] ?? "",
            amount: String(Number(r.normalized["Amount"] ?? r.normalized["amount"] ?? "0") || 0),
            paymentMethod: r.normalized["Payment Method"] ?? r.normalized["payment method"] ?? "Cash",
            referenceNumber: r.normalized["Reference Number"] ?? r.normalized["reference number"] ?? "",
            note: r.normalized["Note"] ?? r.normalized["note"] ?? "",
            importedAt: now,
            importedBy: currentUser.fullName,
            importBatchId: batchId,
            createdAt: now,
            createdBy: currentUser.fullName,
          };
        });
        writeToStorage(STORAGE_KEYS.expenses, [...existing, ...toAdd]);
        try { localStorage.setItem("dvi_phase2_counters_v1", JSON.stringify(counters)); } catch { /**/ }
        imported = toAdd.length;
      }

      if (importEntityType === "suppliers") {
        const existing = readFromStorage<Record<string, unknown>>(STORAGE_KEYS.suppliers);
        const existingNames = new Set(existing.map((s) => String(s.supplierName ?? "").toLowerCase().trim()));
        const toAdd = importableValidated
          .filter((r) => {
            const name = (r.normalized["Supplier Name"] ?? r.normalized["supplier name"] ?? "").toLowerCase().trim();
            if (existingNames.has(name)) { skipped++; return false; }
            return true;
          })
          .map((r) => ({
            id: uid("sup"),
            supplierName: r.normalized["Supplier Name"] ?? r.normalized["supplier name"] ?? "",
            contactPerson: r.normalized["Contact Person"] ?? r.normalized["contact person"] ?? "",
            phone: r.normalized["Phone"] ?? r.normalized["phone"] ?? "",
            email: r.normalized["Email"] ?? r.normalized["email"] ?? "",
            address: r.normalized["Address"] ?? r.normalized["address"] ?? "",
            importedAt: now,
            importedBy: currentUser.fullName,
            importBatchId: batchId,
            createdAt: now,
            updatedAt: now,
          }));
        writeToStorage(STORAGE_KEYS.suppliers, [...existing, ...toAdd]);
        imported = toAdd.length;
      }

      if (importEntityType === "vehicles") {
        const existing = readFromStorage<Record<string, unknown>>(STORAGE_KEYS.vehicles);
        const existingPlates = new Set([
          ...existing.map((r) => String(r.plateNumber ?? "").toUpperCase()),
          ...existing.map((r) => String(r.conductionNumber ?? "").toUpperCase()),
        ]);
        const toAdd = importableValidated
          .filter((r) => {
            const plate = (r.normalized["Plate Number"] ?? r.normalized["plate number"] ?? "").toUpperCase();
            const conduction = (r.normalized["Conduction Number"] ?? r.normalized["conduction number"] ?? "").toUpperCase();
            const id = plate || conduction;
            if (id && existingPlates.has(id)) { skipped++; return false; }
            return true;
          })
          .map((r) => {
            const countersRaw2 = localStorage.getItem("dvi_phase2_counters_v1");
            let c: Record<string, number> = {};
            try { c = countersRaw2 ? JSON.parse(countersRaw2) : {}; } catch { /**/ }
            c["intake"] = (c["intake"] ?? 0) + 1;
            const num = String(c["intake"]).padStart(4, "0");
            try { localStorage.setItem("dvi_phase2_counters_v1", JSON.stringify(c)); } catch { /**/ }
            return {
              id: uid("int"),
              intakeNumber: `INT-${num}`,
              createdAt: now,
              updatedAt: now,
              customerName: r.normalized["Customer Name"] ?? r.normalized["customer name"] ?? "",
              companyName: "",
              accountType: r.normalized["Account Type"] ?? r.normalized["account type"] ?? "Personal",
              phone: r.normalized["Phone"] ?? r.normalized["phone"] ?? "",
              email: r.normalized["Email"] ?? r.normalized["email"] ?? "",
              plateNumber: (r.normalized["Plate Number"] ?? r.normalized["plate number"] ?? "").toUpperCase(),
              conductionNumber: (r.normalized["Conduction Number"] ?? r.normalized["conduction number"] ?? "").toUpperCase(),
              make: r.normalized["Make"] ?? r.normalized["make"] ?? "",
              model: r.normalized["Model"] ?? r.normalized["model"] ?? "",
              year: r.normalized["Year"] ?? r.normalized["year"] ?? "",
              color: r.normalized["Color"] ?? r.normalized["color"] ?? "",
              odometerKm: "",
              fuelLevel: "",
              assignedAdvisor: "",
              concern: "Imported record",
              notes: `Imported by ${currentUser.fullName} from Excel`,
              status: "Converted to RO",
              encodedBy: currentUser.fullName,
              importedAt: now,
              importedBy: currentUser.fullName,
              importBatchId: batchId,
            };
          });
        writeToStorage(STORAGE_KEYS.vehicles, [...existing, ...toAdd]);
        imported = toAdd.length;
      }

      const resultMsg = `Imported ${imported} record(s). Skipped ${skipped + (validationSummary.blockedRows)} record(s). Refresh to see new records.`;
      logAuditEntry(
        onLogAudit,
        currentUser,
        "import_committed",
        ENTITY_LABELS[importEntityType],
        resultMsg
      );
      if (validationSummary.blockedRows > 0) {
        logAuditEntry(
          onLogAudit,
          currentUser,
          "import_skipped_rows",
          ENTITY_LABELS[importEntityType],
          `${validationSummary.blockedRows} rows blocked by validation errors`
        );
      }

      setImportResult(resultMsg);
      setImportStep("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Import failed";
      setImportResult(`Import failed: ${msg}`);
      logAuditEntry(onLogAudit, currentUser, "import_failed", ENTITY_LABELS[importEntityType], msg);
    } finally {
      setIsImporting(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────────

  const renderExportTab = () => (
    <>
      {exportStatus && <div style={s.statusBox}>{exportStatus}</div>}

      {canAccessFinancialReports(currentUser.role) && (
        <div style={s.section}>
          <div style={s.sectionTitle}>Financial Reports</div>
          <div style={s.sectionNote}>Management and financial data — restricted to authorized roles</div>
          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>Revenue Report</div>
              <div style={s.cardNote}>Released repair orders with invoice and payment totals</div>
              <button style={s.exportBtn} onClick={() => handleExport(buildRevenueReportRows, "revenue-report", "Revenue")}>
                Export Revenue
              </button>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Expense Report</div>
              <div style={s.cardNote}>All expense records with category, vendor, and amount</div>
              <button style={s.exportBtn} onClick={() => handleExport(buildExpenseReportRows, "expense-report", "Expenses")}>
                Export Expenses
              </button>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Payment Report</div>
              <div style={s.cardNote}>Payment records linked to invoices</div>
              <button style={s.exportBtn} onClick={() => handleExport(buildPaymentReportRows, "payment-report", "Payments")}>
                Export Payments
              </button>
            </div>
            {canAccessManagementSummary(currentUser.role) && (
              <div style={s.card}>
                <div style={s.cardTitle}>Technician Performance</div>
                <div style={s.cardNote}>Labor value, completed jobs, and efficiency per technician</div>
                <button style={s.exportBtn} onClick={() => handleExport(buildTechnicianPerformanceReportRows, "technician-performance", "Technicians")}>
                  Export Performance
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {canAccessInventoryManagement(currentUser.role) && (
        <div style={s.section}>
          <div style={s.sectionTitle}>Inventory & Procurement Reports</div>
          <div style={s.sectionNote}>Inventory items, purchase orders, and supplier data</div>
          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>Inventory Items</div>
              <div style={s.cardNote}>All inventory items with stock levels and pricing</div>
              <button style={s.exportBtn} onClick={() => handleExport(buildInventoryReportRows, "inventory-report", "Inventory")}>
                Export Inventory
              </button>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Purchase Orders</div>
              <div style={s.cardNote}>PO records with supplier, item, quantity, and status</div>
              <button style={s.exportBtn} onClick={() => handleExport(buildPurchaseOrderReportRows, "purchase-orders", "PurchaseOrders")}>
                Export POs
              </button>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Supplier Performance</div>
              <div style={s.cardNote}>Supplier bid counts and delivery activity</div>
              <button style={s.exportBtn} onClick={() => handleExport(buildSupplierPerformanceReportRows, "supplier-performance", "Suppliers")}>
                Export Suppliers
              </button>
            </div>
          </div>
        </div>
      )}

      {canAccessAdvisorTools(currentUser.role) && (
        <div style={s.section}>
          <div style={s.sectionTitle}>Operational Reports</div>
          <div style={s.sectionNote}>Customer, vehicle, and service quality data</div>
          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>Customer List</div>
              <div style={s.cardNote}>Customer accounts with visit count and last visit</div>
              <button style={s.exportBtn} onClick={() => handleExport(buildCustomerListReportRows, "customer-list", "Customers")}>
                Export Customers
              </button>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Backjob Report</div>
              <div style={s.cardNote}>All backjob records with root cause and responsibility</div>
              <button style={s.exportBtn} onClick={() => handleExport(buildBackjobReportRows, "backjob-report", "Backjobs")}>
                Export Backjobs
              </button>
            </div>
          </div>
        </div>
      )}

      {!canExport && (
        <div style={s.lockedBox}>
          <div style={s.lockedTitle}>Export Restricted</div>
          <div style={s.lockedNote}>Your role does not have access to Excel export tools. Contact your administrator.</div>
        </div>
      )}
    </>
  );

  const renderImportTab = () => {
    if (!canImport) {
      return (
        <div style={s.lockedBox}>
          <div style={s.lockedTitle}>Import Restricted</div>
          <div style={s.lockedNote}>Excel import is available to Admin and Office Staff only.</div>
        </div>
      );
    }

    if (importStep === "done") {
      return (
        <div>
          <div style={s.statusBox}>{importResult}</div>
          <div style={s.infoBox}>Records have been saved to local storage. Refresh the page to see newly imported records in their respective modules.</div>
          <button style={s.secondaryBtn} onClick={handleReset}>Import Another File</button>
        </div>
      );
    }

    return (
      <div>
        <div style={s.infoBox}>
          Import is preview-first. You will see all rows and validation results before confirming. Only valid rows will be imported. Duplicates are skipped by default.
        </div>

        {importStep === "idle" && (
          <>
            <div style={s.selectGroup}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Import type:</span>
              <select
                style={s.select}
                value={importEntityType}
                onChange={(e) => setImportEntityType(e.target.value as ImportEntityType)}
              >
                {(Object.entries(ENTITY_LABELS) as [ImportEntityType, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div style={s.uploadArea}>
              <div style={s.uploadText}>Select an Excel file (.xlsx or .xls) to import {ENTITY_LABELS[importEntityType]}</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isParsing}
                style={{ fontSize: 13 }}
              />
              {isParsing && <div style={{ marginTop: 10, fontSize: 13, color: "#2563eb" }}>Parsing file...</div>}
            </div>
            {parseError && <div style={s.warningBox}>{parseError}</div>}
          </>
        )}

        {importStep === "validated" && validationSummary && (
          <>
            <div style={{ marginBottom: 12, fontSize: 13, color: "#334155" }}>
              File: <strong>{importFileName}</strong> — {ENTITY_LABELS[importEntityType]}
            </div>

            {parseError && <div style={s.warningBox}>{parseError}</div>}

            <div style={s.summaryGrid}>
              <div style={s.summaryCard}><div style={s.summaryLabel}>Total Rows</div><div style={s.summaryValue}>{validationSummary.totalRows}</div></div>
              <div style={s.summaryCard}><div style={s.summaryLabel}>Ready to Import</div><div style={{ ...s.summaryValue, color: "#15803d" }}>{validationSummary.importableRows}</div></div>
              <div style={s.summaryCard}><div style={s.summaryLabel}>Needs Review</div><div style={{ ...s.summaryValue, color: "#92400e" }}>{validationSummary.rowsNeedingReview}</div></div>
              <div style={s.summaryCard}><div style={s.summaryLabel}>Blocked (Errors)</div><div style={{ ...s.summaryValue, color: "#b91c1c" }}>{validationSummary.blockedRows}</div></div>
            </div>

            {validationSummary.importableRows === 0 && (
              <div style={s.errorBox}>No importable rows found. All rows have blocking errors or are empty. Fix the file and re-upload.</div>
            )}

            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>#</th>
                    {parsedHeaders.slice(0, 6).map((h) => <th key={h} style={s.th}>{h}</th>)}
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {validationSummary.validatedRows.slice(0, 100).map((vr) => {
                    const statusBadge = vr.blocked
                      ? <span style={{ ...s.badge, ...s.badgeError }}>Blocked</span>
                      : vr.issues.some((i) => i.severity === "warning")
                        ? <span style={{ ...s.badge, ...s.badgeWarn }}>Review</span>
                        : vr.issues.some((i) => i.field === "row")
                          ? <span style={{ ...s.badge, ...s.badgeInfo }}>Skip</span>
                          : <span style={{ ...s.badge, ...s.badgeOk }}>OK</span>;

                    const issueText = vr.issues.map((i) => i.message).join(" | ");

                    return (
                      <tr key={vr.rowIndex}>
                        <td style={s.td}>{vr.rowIndex + 1}</td>
                        {parsedHeaders.slice(0, 6).map((h) => (
                          <td key={h} style={s.td}>{String(vr.normalized[h] ?? "")}</td>
                        ))}
                        <td style={s.td}>{statusBadge}</td>
                        <td style={{ ...s.td, fontSize: 11, color: "#64748b" }}>{issueText || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {validationSummary.totalRows > 100 && (
                <div style={{ fontSize: 12, color: "#64748b", padding: "6px 0" }}>
                  Showing first 100 of {validationSummary.totalRows} rows.
                </div>
              )}
            </div>

            <div style={s.btnRow}>
              {validationSummary.importableRows > 0 && (
                <button
                  style={s.primaryBtn}
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                >
                  {isImporting ? "Importing..." : `Confirm — Import ${validationSummary.importableRows} Records`}
                </button>
              )}
              <button style={s.secondaryBtn} onClick={handleReset}>Cancel / Re-upload</button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderTemplatesTab = () => (
    <div>
      <div style={s.infoBox}>
        Download these templates to prepare your data for import. Fill in your records and upload the file in the Import tab.
      </div>
      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardTitle}>Customers Template</div>
          <div style={s.cardNote}>Required: Full Name, Phone. Optional: Email</div>
          <button style={s.templateBtn} onClick={downloadCustomerTemplate}>Download Template</button>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>Vehicles Template</div>
          <div style={s.cardNote}>Required: Customer Name, Make, Model. Optional: Plate, Year, Color</div>
          <button style={s.templateBtn} onClick={downloadVehicleTemplate}>Download Template</button>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>Inventory Items Template</div>
          <div style={s.cardNote}>Required: Item Name. Optional: SKU, Category, Brand, Qty, Cost, Price</div>
          <button style={s.templateBtn} onClick={downloadInventoryTemplate}>Download Template</button>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>Suppliers Template</div>
          <div style={s.cardNote}>Required: Supplier Name. Optional: Contact, Phone, Email, Address</div>
          <button style={s.templateBtn} onClick={downloadSupplierTemplate}>Download Template</button>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>Expenses Template</div>
          <div style={s.cardNote}>Required: Date, Category, Amount. Optional: Vendor, Description, Method</div>
          <button style={s.templateBtn} onClick={downloadExpenseTemplate}>Download Template</button>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>Service History Template</div>
          <div style={s.cardNote}>Required: Plate Number, Service Title, Completed At</div>
          <button style={s.templateBtn} onClick={downloadServiceHistoryTemplate}>Download Template</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Excel Export / Import</div>
      <div style={s.pageSubtitle}>
        Export reports to .xlsx files or import structured data from Excel templates. Exports are role-gated. Import is preview-first and confirmation-based.
      </div>

      <div style={s.tabs}>
        {(["export", "import", "templates"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "export" ? "Export Reports" : tab === "import" ? "Import Data" : "Templates"}
          </button>
        ))}
      </div>

      {activeTab === "export" && renderExportTab()}
      {activeTab === "import" && renderImportTab()}
      {activeTab === "templates" && renderTemplatesTab()}
    </div>
  );
}
