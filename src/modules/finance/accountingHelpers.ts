import type {
  AccountingPrepStatus,
  ExpenseRecord,
  InvoiceRecord,
  PaymentRecord,
  PartsRequestRecord,
  RepairOrderRecord,
  UserAccount,
  UserRole,
} from "../shared/types";
import { buildRevenueDashboardViewModel, getRevenueWorkLines } from "./revenueHelpers";
import { canViewMargin } from "./marginHelpers";

const EXPENSE_STORAGE_KEY = "dvi_phase53_expense_records_v1";
const INVOICE_STORAGE_KEY = "dvi_phase10_invoice_records_v1";
const PAYMENT_STORAGE_KEY = "dvi_phase10_payment_records_v1";
const PO_STORAGE_KEY = "dvi_purchase_orders_lite_v1";

type PurchaseOrderLiteRecord = {
  id: string;
  poNumber: string;
  status: string;
  supplier: string;
  requestId: string;
  requestNumber: string;
  roNumber: string;
  itemName: string;
  partNumber: string;
  quantity: number;
  cost: number;
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
};

type AccountingSource = "Repair Order" | "Invoice" | "Payment" | "Expense" | "Purchase Order" | "Parts Request";

export type AccountingPrepItem = {
  id: string;
  source: AccountingSource;
  label: string;
  customerReference: string;
  roReference: string;
  invoiceReference: string;
  paymentReference: string;
  expenseReference: string;
  poReference: string;
  accountingReference: string;
  status: AccountingPrepStatus;
  missingFields: string[];
  detail: string;
  createdAt: string;
  exported: boolean;
};

export type AccountingPrepViewModel = {
  summary: Record<AccountingPrepStatus, number>;
  items: AccountingPrepItem[];
  missingItems: AccountingPrepItem[];
};

export type InvoiceSettlementStatus = "Unpaid" | "Partial" | "Paid" | "Overpaid" | "Waived" | "Needs Review";

export type InvoiceSettlementRow = {
  invoiceId: string;
  invoiceNumber: string;
  roNumber: string;
  customerName: string;
  invoiceTotal: number;
  paidTotal: number;
  balance: number;
  status: InvoiceSettlementStatus;
  paymentCount: number;
  manualReview: boolean;
};

export type InvoiceReconciliationViewModel = {
  summary: Record<InvoiceSettlementStatus, number>;
  rows: InvoiceSettlementRow[];
  orphanPayments: PaymentRecord[];
};

export type ProfitReportViewModel = {
  allowed: boolean;
  totalRevenue: number;
  totalPayments: number;
  totalExpenses: number;
  grossProfitEstimate: number;
  netCashStyleSummary: number;
  revenueByCategory: Array<{ category: string; revenue: number; count: number }>;
  expenseByCategory: Array<{ category: string; total: number; count: number }>;
  monthlyTrend: Array<{ month: string; revenue: number; payments: number; expenses: number }>;
  missingPricingCount: number;
  notes: string[];
};

export function readLocalArray<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function parseAmount(value?: string | number | null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCompletedRo(ro: RepairOrderRecord) {
  return ["Ready Release", "Released", "Closed"].includes(ro.status);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function statusForAccounting(
  kind: AccountingSource,
  isReady: boolean,
  hasIssues: boolean,
  exported: boolean
): AccountingPrepStatus {
  if (hasIssues) return "Needs Correction";
  if (exported) return "Exported";
  if (!isReady) return "Not Ready";
  return kind === "Expense" ? "Ready to Review" : "Ready to Export";
}

function buildIssueList(values: Array<[string, boolean]>) {
  return values.filter(([, present]) => !present).map(([label]) => label);
}

function getPurchaseOrders(): PurchaseOrderLiteRecord[] {
  return readLocalArray<PurchaseOrderLiteRecord>(PO_STORAGE_KEY, []);
}

export function buildAccountingPrepViewModel(args: {
  repairOrders: RepairOrderRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
  expenseRecords: ExpenseRecord[];
  partsRequests: PartsRequestRecord[];
  users: UserAccount[];
}): AccountingPrepViewModel {
  const { repairOrders, invoiceRecords, paymentRecords, expenseRecords, partsRequests } = args;
  const purchaseOrders = getPurchaseOrders();

  const items: AccountingPrepItem[] = [];

  repairOrders.forEach((ro) => {
    const missingFields = buildIssueList([
      ["customer", Boolean(ro.accountLabel || ro.customerName)],
      ["RO number", Boolean(ro.roNumber)],
      ["plate number", Boolean(ro.plateNumber || ro.conductionNumber)],
    ]);
    const status = statusForAccounting("Repair Order", isCompletedRo(ro), missingFields.length > 0, Boolean(ro.accountingReference));
    items.push({
      id: ro.id,
      source: "Repair Order",
      label: ro.roNumber,
      customerReference: ro.customerReference || ro.accountLabel || ro.customerName || "-",
      roReference: ro.roReference || ro.roNumber,
      invoiceReference: "",
      paymentReference: "",
      expenseReference: "",
      poReference: "",
      accountingReference: ro.accountingReference || "",
      status,
      missingFields,
      detail: `${ro.status} / ${ro.plateNumber || ro.conductionNumber || "No plate"}`,
      createdAt: ro.updatedAt || ro.createdAt,
      exported: status === "Exported",
    });
  });

  invoiceRecords.forEach((invoice) => {
    const ro = repairOrders.find((row) => row.id === invoice.roId);
    const missingFields = buildIssueList([
      ["RO link", Boolean(invoice.roId)],
      ["invoice number", Boolean(invoice.invoiceNumber)],
      ["total amount", parseAmount(invoice.totalAmount) > 0],
    ]);
    const exported = invoice.paymentStatus === "Paid" || invoice.paymentStatus === "Waived";
    const status = statusForAccounting("Invoice", missingFields.length === 0, missingFields.length > 0, exported);
    items.push({
      id: invoice.id,
      source: "Invoice",
      label: invoice.invoiceNumber,
      customerReference: invoice.customerReference || ro?.accountLabel || ro?.customerName || "-",
      roReference: invoice.roReference || invoice.roNumber || ro?.roNumber || "-",
      invoiceReference: invoice.invoiceReference || invoice.invoiceNumber,
      paymentReference: "",
      expenseReference: "",
      poReference: "",
      accountingReference: invoice.accountingReference || "",
      status,
      missingFields,
      detail: `${invoice.status} / ${invoice.paymentStatus} / ${invoice.totalAmount}`,
      createdAt: invoice.updatedAt || invoice.createdAt,
      exported,
    });
  });

  paymentRecords.forEach((payment) => {
    const ro = repairOrders.find((row) => row.id === payment.roId);
    const missingFields = buildIssueList([
      ["invoice link", Boolean(payment.invoiceId)],
      ["RO link", Boolean(payment.roId)],
      ["amount", parseAmount(payment.amount) > 0],
    ]);
    const status = statusForAccounting("Payment", missingFields.length === 0, missingFields.length > 0, false);
    items.push({
      id: payment.id,
      source: "Payment",
      label: payment.paymentNumber,
      customerReference: payment.customerReference || ro?.accountLabel || ro?.customerName || "-",
      roReference: payment.roReference || payment.roNumber || ro?.roNumber || "-",
      invoiceReference: payment.invoiceReference || payment.invoiceId || "-",
      paymentReference: payment.paymentReference || payment.paymentNumber,
      expenseReference: "",
      poReference: "",
      accountingReference: payment.accountingReference || "",
      status,
      missingFields,
      detail: `${payment.method} / ${payment.amount}`,
      createdAt: payment.createdAt,
      exported: false,
    });
  });

  expenseRecords.forEach((expense) => {
    const missingFields = buildIssueList([
      ["date", Boolean(expense.date)],
      ["vendor", Boolean(expense.vendor)],
      ["description", Boolean(expense.description)],
      ["amount", parseAmount(expense.amount) > 0],
    ]);
    const status = statusForAccounting("Expense", missingFields.length === 0, missingFields.length > 0, Boolean(expense.accountingReference));
    items.push({
      id: expense.id,
      source: "Expense",
      label: expense.expenseNumber,
      customerReference: "-",
      roReference: "-",
      invoiceReference: "-",
      paymentReference: "-",
      expenseReference: expense.expenseReference || expense.referenceNumber || expense.expenseNumber,
      poReference: "",
      accountingReference: expense.accountingReference || "",
      status,
      missingFields,
      detail: `${expense.category} / ${expense.vendor || "No vendor"} / ${expense.amount}`,
      createdAt: expense.updatedAt || expense.createdAt,
      exported: Boolean(expense.accountingReference),
    });
  });

  purchaseOrders.forEach((po) => {
    const missingFields = buildIssueList([
      ["supplier", Boolean(po.supplier)],
      ["PO number", Boolean(po.poNumber)],
      ["item", Boolean(po.itemName)],
      ["cost", Number.isFinite(Number(po.cost)) && Number(po.cost) >= 0],
    ]);
    const status = statusForAccounting("Purchase Order", missingFields.length === 0, missingFields.length > 0, po.status === "Received");
    items.push({
      id: po.id,
      source: "Purchase Order",
      label: po.poNumber,
      customerReference: "-",
      roReference: po.roNumber || "-",
      invoiceReference: "-",
      paymentReference: "-",
      expenseReference: "-",
      poReference: po.poNumber,
      accountingReference: po.poNumber,
      status,
      missingFields,
      detail: `${po.supplier} / ${po.itemName} / Qty ${po.quantity}`,
      createdAt: po.updatedAt || po.createdAt,
      exported: po.status === "Received",
    });
  });

  partsRequests.forEach((request) => {
    const missingFields = buildIssueList([
      ["RO link", Boolean(request.roId)],
      ["request number", Boolean(request.requestNumber)],
      ["part name", Boolean(request.partName)],
    ]);
    const status = statusForAccounting("Parts Request", missingFields.length === 0, missingFields.length > 0, Boolean(request.poReference));
    items.push({
      id: request.id,
      source: "Parts Request",
      label: request.requestNumber,
      customerReference: request.accountLabel || "-",
      roReference: request.roNumber || "-",
      invoiceReference: "-",
      paymentReference: "-",
      expenseReference: "-",
      poReference: request.poReference || "",
      accountingReference: request.accountingReference || "",
      status,
      missingFields,
      detail: `${request.partName} / ${request.status} / ${request.urgency}`,
      createdAt: request.updatedAt || request.createdAt,
      exported: Boolean(request.poReference),
    });
  });

  const summary: Record<AccountingPrepStatus, number> = {
    "Not Ready": 0,
    "Ready to Review": 0,
    "Ready to Export": 0,
    "Exported": 0,
    "Needs Correction": 0,
  };
  items.forEach((item) => {
    summary[item.status] += 1;
  });

  const missingItems = items
    .filter((item) => item.missingFields.length > 0 || item.status === "Not Ready" || item.status === "Needs Correction")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    summary,
    items: items.sort((a, b) => {
      const priority = ["Needs Correction", "Not Ready", "Ready to Review", "Ready to Export", "Exported"];
      return priority.indexOf(a.status) - priority.indexOf(b.status) || b.createdAt.localeCompare(a.createdAt);
    }),
    missingItems,
  };
}

export function buildInvoiceReconciliationViewModel(
  invoiceRecords: InvoiceRecord[],
  paymentRecords: PaymentRecord[],
  repairOrders: RepairOrderRecord[]
): InvoiceReconciliationViewModel {
  const summary: Record<InvoiceSettlementStatus, number> = {
    Unpaid: 0,
    Partial: 0,
    Paid: 0,
    Overpaid: 0,
    Waived: 0,
    "Needs Review": 0,
  };

  const rows: InvoiceSettlementRow[] = invoiceRecords
    .filter((invoice) => invoice.status !== "Voided")
    .map((invoice) => {
      const invoiceTotal = parseAmount(invoice.totalAmount);
      const invoicePayments = paymentRecords.filter((payment) => payment.invoiceId === invoice.id);
      const paidTotal = invoicePayments.reduce((sum, payment) => sum + parseAmount(payment.amount), 0);
      const balance = Math.max(0, invoiceTotal - paidTotal);
      const manualReview = Boolean(invoice.accountingStatus === "Needs Correction");
      let status: InvoiceSettlementStatus = "Unpaid";
      if (manualReview) {
        status = "Needs Review";
      } else if (invoice.paymentStatus === "Waived" || invoiceTotal <= 0) {
        status = "Waived";
      } else if (paidTotal <= 0) {
        status = "Unpaid";
      } else if (paidTotal > invoiceTotal + 0.01) {
        status = "Overpaid";
      } else if (balance > 0.01) {
        status = "Partial";
      } else {
        status = "Paid";
      }
      summary[status] += 1;
      const ro = repairOrders.find((row) => row.id === invoice.roId);
      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        roNumber: invoice.roNumber || ro?.roNumber || "-",
        customerName: ro?.accountLabel || ro?.customerName || invoice.customerReference || "Customer",
        invoiceTotal,
        paidTotal,
        balance: status === "Overpaid" ? Math.max(0, paidTotal - invoiceTotal) : balance,
        status,
        paymentCount: invoicePayments.length,
        manualReview,
      };
    })
    .sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber));

  const orphanPayments = paymentRecords.filter((payment) => !payment.invoiceId || !invoiceRecords.some((invoice) => invoice.id === payment.invoiceId));
  if (orphanPayments.length > 0) {
    summary["Needs Review"] += orphanPayments.length;
  }

  return { summary, rows, orphanPayments };
}

export function buildProfitReportViewModel(args: {
  repairOrders: RepairOrderRecord[];
  users: UserAccount[];
  from?: string;
  to?: string;
  role: UserRole;
}): ProfitReportViewModel {
  const { repairOrders, users, from, to, role } = args;
  if (!canViewMargin(role)) {
    return {
      allowed: false,
      totalRevenue: 0,
      totalPayments: 0,
      totalExpenses: 0,
      grossProfitEstimate: 0,
      netCashStyleSummary: 0,
      revenueByCategory: [],
      expenseByCategory: [],
      monthlyTrend: [],
      missingPricingCount: 0,
      notes: ["Profit report restricted to Admin users."],
    };
  }

  const revenue = buildRevenueDashboardViewModel(repairOrders, users, { from, to });
  const revenueLines = getRevenueWorkLines(repairOrders, users, { from, to });
  const payments = readLocalArray<PaymentRecord>(PAYMENT_STORAGE_KEY, []).filter((payment) => {
    if (!from && !to) return true;
    const created = new Date(payment.createdAt).getTime();
    if (Number.isNaN(created)) return true;
    if (from) {
      const fromTime = new Date(`${from}T00:00:00`).getTime();
      if (!Number.isNaN(fromTime) && created < fromTime) return false;
    }
    if (to) {
      const toTime = new Date(`${to}T23:59:59`).getTime();
      if (!Number.isNaN(toTime) && created > toTime) return false;
    }
    return true;
  });
  const expenses = readLocalArray<ExpenseRecord>(EXPENSE_STORAGE_KEY, []).filter((expense) => {
    if (!from && !to) return true;
    const created = new Date(expense.date || expense.createdAt).getTime();
    if (Number.isNaN(created)) return true;
    if (from) {
      const fromTime = new Date(`${from}T00:00:00`).getTime();
      if (!Number.isNaN(fromTime) && created < fromTime) return false;
    }
    if (to) {
      const toTime = new Date(`${to}T23:59:59`).getTime();
      if (!Number.isNaN(toTime) && created > toTime) return false;
    }
    return true;
  });

  const revenueByCategory = revenue.byCategory.map((row) => ({ category: row.category, revenue: row.revenue, count: row.count }));
  const expenseMap = new Map<string, { category: string; total: number; count: number }>();
  expenses.forEach((expense) => {
    const current = expenseMap.get(expense.category) ?? { category: expense.category, total: 0, count: 0 };
    current.total += parseAmount(expense.amount);
    current.count += 1;
    expenseMap.set(expense.category, current);
  });
  const expenseByCategory = Array.from(expenseMap.values()).sort((a, b) => b.total - a.total || b.count - a.count);

  const monthlyMap = new Map<string, { month: string; revenue: number; payments: number; expenses: number }>();
  const ensureMonth = (value: string) => {
    const month = value.slice(0, 7) || "Unknown";
    return monthlyMap.get(month) ?? { month, revenue: 0, payments: 0, expenses: 0 };
  };
  revenueLines.forEach((line) => {
    const month = (line.completedAt || "").slice(0, 7) || "Unknown";
    const current = ensureMonth(month);
    current.revenue += line.revenue;
    monthlyMap.set(month, current);
  });
  payments.forEach((payment) => {
    const month = payment.createdAt.slice(0, 7) || "Unknown";
    const current = ensureMonth(month);
    current.payments += parseAmount(payment.amount);
    monthlyMap.set(month, current);
  });
  expenses.forEach((expense) => {
    const month = (expense.date || expense.createdAt).slice(0, 7) || "Unknown";
    const current = ensureMonth(month);
    current.expenses += parseAmount(expense.amount);
    monthlyMap.set(month, current);
  });

  return {
    allowed: true,
    totalRevenue: revenue.totalRevenue,
    totalPayments: payments.reduce((sum, payment) => sum + parseAmount(payment.amount), 0),
    totalExpenses: expenses.reduce((sum, expense) => sum + parseAmount(expense.amount), 0),
    grossProfitEstimate: revenue.totalRevenue - expenses.reduce((sum, expense) => sum + parseAmount(expense.amount), 0),
    netCashStyleSummary: payments.reduce((sum, payment) => sum + parseAmount(payment.amount), 0) - expenses.reduce((sum, expense) => sum + parseAmount(expense.amount), 0),
    revenueByCategory,
    expenseByCategory,
    monthlyTrend: Array.from(monthlyMap.values()).sort((a, b) => b.month.localeCompare(a.month)),
    missingPricingCount: revenue.fallbackServiceCount,
    notes: [
      "Management estimate only.",
      `Revenue lines considered: ${revenueLines.length}.`,
      `Purchase orders indexed: ${getPurchaseOrders().length}.`,
    ],
  };
}

export function accountingStatusBadgeColor(status: AccountingPrepStatus) {
  if (status === "Exported") return "#15803d";
  if (status === "Ready to Export") return "#2563eb";
  if (status === "Ready to Review") return "#b45309";
  if (status === "Needs Correction") return "#b91c1c";
  return "#64748b";
}

export function accountingStatusBackground(status: AccountingPrepStatus) {
  if (status === "Exported") return "#dcfce7";
  if (status === "Ready to Export") return "#dbeafe";
  if (status === "Ready to Review") return "#fef3c7";
  if (status === "Needs Correction") return "#fee2e2";
  return "#e2e8f0";
}

export function accountingStatusTestId(status: AccountingPrepStatus) {
  return `accounting-status-${slug(status)}`;
}
