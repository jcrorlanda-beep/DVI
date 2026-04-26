import * as XLSX from "xlsx";

export type ExcelRow = Record<string, string | number | boolean | null | undefined>;

function readFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

function fmtMoney(value: string | number | undefined | null): string {
  const n = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export function triggerExcelDownload(rows: ExcelRow[], filename: string, sheetName = "Data"): void {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename);
}

export function buildExcelDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Report builders ────────────────────────────────────────────────────────────

export function buildRevenueReportRows(): ExcelRow[] {
  const ros = readFromStorage<Record<string, unknown>>("dvi_phase4_repair_orders_v1");
  const invoices = readFromStorage<Record<string, unknown>>("dvi_phase10_invoice_records_v1");
  const payments = readFromStorage<Record<string, unknown>>("dvi_phase10_payment_records_v1");

  const invoiceByRo = new Map<string, Record<string, unknown>>();
  invoices.forEach((inv) => {
    invoiceByRo.set(String(inv.roId ?? ""), inv);
  });

  const paidByInvoice = new Map<string, number>();
  payments.forEach((p) => {
    const id = String(p.invoiceId ?? "");
    paidByInvoice.set(id, (paidByInvoice.get(id) ?? 0) + Number(fmtMoney(String(p.amount ?? "0"))));
  });

  return ros
    .filter((ro) => ["Released", "Closed"].includes(String(ro.status ?? "")))
    .map((ro) => {
      const inv = invoiceByRo.get(String(ro.id ?? "")) ?? {};
      const paid = paidByInvoice.get(String(inv.id ?? "")) ?? 0;
      return {
        "RO Number": String(ro.roNumber ?? ""),
        "Date": fmtDate(String(ro.createdAt ?? "")),
        "Customer": String(ro.accountLabel ?? ro.customerName ?? ""),
        "Plate / Conduction": String(ro.plateNumber ?? ro.conductionNumber ?? ""),
        "Vehicle": [ro.make, ro.model, ro.year].filter(Boolean).join(" "),
        "Status": String(ro.status ?? ""),
        "Labor Subtotal": fmtMoney(String(inv.laborSubtotal ?? "")),
        "Parts Subtotal": fmtMoney(String(inv.partsSubtotal ?? "")),
        "Discount": fmtMoney(String(inv.discountAmount ?? "")),
        "Invoice Total": fmtMoney(String(inv.totalAmount ?? "")),
        "Amount Paid": paid.toFixed(2),
        "Balance": (Number(fmtMoney(String(inv.totalAmount ?? ""))) - paid).toFixed(2),
        "Payment Status": String(inv.paymentStatus ?? ""),
        "Invoice Status": String(inv.status ?? ""),
      };
    });
}

export function buildExpenseReportRows(): ExcelRow[] {
  const expenses = readFromStorage<Record<string, unknown>>("dvi_phase53_expense_records_v1");
  return expenses.map((e) => ({
    "Expense Number": String(e.expenseNumber ?? ""),
    "Date": String(e.date ?? ""),
    "Category": String(e.category ?? ""),
    "Vendor": String(e.vendor ?? ""),
    "Description": String(e.description ?? ""),
    "Amount": fmtMoney(String(e.amount ?? "")),
    "Payment Method": String(e.paymentMethod ?? ""),
    "Reference Number": String(e.referenceNumber ?? ""),
    "Note": String(e.note ?? ""),
    "Created At": fmtDate(String(e.createdAt ?? "")),
    "Created By": String(e.createdBy ?? ""),
  }));
}

export function buildPaymentReportRows(): ExcelRow[] {
  const payments = readFromStorage<Record<string, unknown>>("dvi_phase10_payment_records_v1");
  const invoices = readFromStorage<Record<string, unknown>>("dvi_phase10_invoice_records_v1");
  const invMap = new Map(invoices.map((inv) => [String(inv.id ?? ""), inv]));

  return payments.map((p) => {
    const inv = invMap.get(String(p.invoiceId ?? "")) ?? {};
    return {
      "Payment Number": String(p.paymentNumber ?? ""),
      "Date": fmtDate(String(p.createdAt ?? "")),
      "RO Number": String(p.roNumber ?? ""),
      "Invoice Total": fmtMoney(String(inv.totalAmount ?? "")),
      "Amount Paid": fmtMoney(String(p.amount ?? "")),
      "Payment Method": String(p.method ?? ""),
      "Reference Number": String(p.referenceNumber ?? ""),
      "Received By": String(p.receivedBy ?? ""),
      "Notes": String(p.notes ?? ""),
    };
  });
}

export function buildInventoryReportRows(): ExcelRow[] {
  const items = readFromStorage<Record<string, unknown>>("dvi_inventory_items_v1");
  return items.map((item) => ({
    "SKU": String(item.sku ?? ""),
    "Item Name": String(item.itemName ?? ""),
    "Category": String(item.category ?? ""),
    "Brand": String(item.brand ?? ""),
    "Qty On Hand": Number(item.quantityOnHand ?? 0),
    "Reorder Level": Number(item.reorderLevel ?? 0),
    "Unit Cost": fmtMoney(String(item.unitCost ?? "")),
    "Selling Price": fmtMoney(String(item.sellingPrice ?? "")),
    "Supplier": String(item.supplier ?? ""),
    "Active": item.active === true || String(item.active) === "true" ? "Yes" : "No",
    "Last Updated": fmtDate(String(item.updatedAt ?? "")),
  }));
}

export function buildPurchaseOrderReportRows(): ExcelRow[] {
  const pos = readFromStorage<Record<string, unknown>>("dvi_purchase_orders_lite_v1");
  return pos.map((po) => ({
    "PO Number": String(po.poNumber ?? ""),
    "Status": String(po.status ?? ""),
    "Supplier": String(po.supplier ?? ""),
    "Item Name": String(po.itemName ?? ""),
    "Part Number": String(po.partNumber ?? ""),
    "Quantity": Number(po.quantity ?? 0),
    "Ordered Qty": Number(po.orderedQuantity ?? po.quantity ?? 0),
    "Received Qty": Number(po.receivedQuantity ?? 0),
    "Cost (PHP)": fmtMoney(String(po.cost ?? "")),
    "Expected Delivery": String(po.expectedDelivery ?? ""),
    "RO Number": String(po.roNumber ?? ""),
    "Created At": fmtDate(String(po.createdAt ?? "")),
  }));
}

export function buildCustomerListReportRows(): ExcelRow[] {
  const accounts = readFromStorage<Record<string, unknown>>("dvi_phase15a_customer_accounts_v1");
  const intakes = readFromStorage<Record<string, unknown>>("dvi_phase2_intake_records_v1");

  const visitCount = new Map<string, number>();
  const lastVisit = new Map<string, string>();
  intakes.forEach((intake) => {
    const phone = String(intake.phone ?? "").replace(/\D/g, "");
    if (!phone) return;
    visitCount.set(phone, (visitCount.get(phone) ?? 0) + 1);
    const ts = String(intake.createdAt ?? "");
    if (!lastVisit.has(phone) || ts > (lastVisit.get(phone) ?? "")) lastVisit.set(phone, ts);
  });

  if (accounts.length > 0) {
    return accounts.map((acc) => {
      const phone = String(acc.phone ?? "").replace(/\D/g, "");
      const vehicles = Array.isArray(acc.linkedPlateNumbers) ? (acc.linkedPlateNumbers as string[]).join(", ") : "";
      return {
        "Full Name": String(acc.fullName ?? ""),
        "Phone": String(acc.phone ?? ""),
        "Email": String(acc.email ?? ""),
        "Linked Vehicles": vehicles,
        "Visit Count": visitCount.get(phone) ?? 0,
        "Last Visit": lastVisit.has(phone) ? fmtDate(lastVisit.get(phone) ?? "") : "",
        "Account Since": fmtDate(String(acc.createdAt ?? "")),
      };
    });
  }

  // Fallback: derive unique customers from intake records
  const seen = new Map<string, ExcelRow>();
  intakes.forEach((intake) => {
    const phone = String(intake.phone ?? "").replace(/\D/g, "");
    const key = phone || String(intake.customerName ?? "").toLowerCase().trim();
    if (!key) return;
    const existing = seen.get(key);
    seen.set(key, {
      "Customer Name": String(intake.customerName ?? ""),
      "Company": String(intake.companyName ?? ""),
      "Phone": String(intake.phone ?? ""),
      "Email": String(intake.email ?? ""),
      "Account Type": String(intake.accountType ?? ""),
      "Visit Count": (Number(existing?.["Visit Count"] ?? 0)) + 1,
    });
  });
  return Array.from(seen.values());
}

export function buildBackjobReportRows(): ExcelRow[] {
  const backjobs = readFromStorage<Record<string, unknown>>("dvi_phase9_backjob_records_v1");
  return backjobs.map((bj) => ({
    "Backjob Number": String(bj.backjobNumber ?? ""),
    "Linked RO": String(bj.linkedRoNumber ?? ""),
    "Plate Number": String(bj.plateNumber ?? ""),
    "Customer": String(bj.customerLabel ?? ""),
    "Complaint": String(bj.complaint ?? ""),
    "Root Cause": String(bj.rootCause ?? ""),
    "Responsibility": String(bj.responsibility ?? ""),
    "Action Taken": String(bj.actionTaken ?? ""),
    "Status": String(bj.status ?? ""),
    "Created At": fmtDate(String(bj.createdAt ?? "")),
    "Created By": String(bj.createdBy ?? ""),
  }));
}

export function buildTechnicianPerformanceReportRows(): ExcelRow[] {
  const users = readFromStorage<Record<string, unknown>>("dvi_phase1_users_v2");
  const workLogs = readFromStorage<Record<string, unknown>>("dvi_phase16_work_logs_v1");
  const ros = readFromStorage<Record<string, unknown>>("dvi_phase4_repair_orders_v1");

  return users
    .filter((u) =>
      u.active !== false &&
      ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(String(u.role ?? ""))
    )
    .map((user) => {
      const userId = String(user.id ?? "");
      const assignedROs = ros.filter(
        (ro) =>
          String(ro.primaryTechnicianId ?? "") === userId ||
          (Array.isArray(ro.supportTechnicianIds) && (ro.supportTechnicianIds as string[]).includes(userId))
      );
      const completedROs = assignedROs.filter((ro) =>
        ["Released", "Closed", "Ready Release"].includes(String(ro.status ?? ""))
      );
      const techLogs = workLogs.filter((log) => String(log.technicianId ?? "") === userId);
      const totalMinutes = techLogs.reduce((sum, log) => sum + Number(log.totalMinutes ?? 0), 0);
      const laborProduced = assignedROs.reduce((roSum, ro) => {
        const lines = Array.isArray(ro.workLines) ? (ro.workLines as Array<Record<string, unknown>>) : [];
        return roSum + lines.reduce((s, line) => s + Number(String(line.serviceEstimate ?? "0").replace(/[^0-9.-]/g, "")) || 0, 0);
      }, 0);

      return {
        "Technician": String(user.fullName ?? ""),
        "Role": String(user.role ?? ""),
        "Total ROs Assigned": assignedROs.length,
        "Completed ROs": completedROs.length,
        "Hours Logged": (totalMinutes / 60).toFixed(1),
        "Labor Value (PHP)": laborProduced.toFixed(2),
        "Efficiency (PHP/hr)": totalMinutes > 0 ? ((laborProduced / totalMinutes) * 60).toFixed(2) : "0.00",
      };
    });
}

export function buildSupplierPerformanceReportRows(): ExcelRow[] {
  const partsRequests = readFromStorage<Record<string, unknown>>("dvi_phase8_parts_requests_v1");
  const supplierMap = new Map<string, { bids: number; totalValue: number; deliveries: number }>();

  partsRequests.forEach((req) => {
    const bids = Array.isArray(req.bids) ? (req.bids as Array<Record<string, unknown>>) : [];
    bids.forEach((bid) => {
      const name = String(bid.supplierName ?? "").trim();
      if (!name) return;
      const cur = supplierMap.get(name) ?? { bids: 0, totalValue: 0, deliveries: 0 };
      cur.bids++;
      cur.totalValue += Number(String(bid.totalCost ?? "0").replace(/[^0-9.-]/g, "")) || 0;
      if (bid.invoiceFileName || bid.trackingNumber) cur.deliveries++;
      supplierMap.set(name, cur);
    });
  });

  return Array.from(supplierMap.entries()).map(([name, data]) => ({
    "Supplier Name": name,
    "Total Bids": data.bids,
    "Total Value Bid (PHP)": data.totalValue.toFixed(2),
    "Deliveries Logged": data.deliveries,
  }));
}

// ── Template builders (Phase 213) ──────────────────────────────────────────────

export function downloadCustomerTemplate(): void {
  const rows: ExcelRow[] = [
    {
      "Full Name": "Juan dela Cruz",
      "Phone": "09171234567",
      "Email": "juan@example.com",
    },
  ];
  triggerExcelDownload(rows, "template-customers.xlsx", "Customers");
}

export function downloadVehicleTemplate(): void {
  const rows: ExcelRow[] = [
    {
      "Customer Name": "Juan dela Cruz",
      "Phone": "09171234567",
      "Plate Number": "ABC1234",
      "Conduction Number": "",
      "Make": "Toyota",
      "Model": "Vios",
      "Year": "2020",
      "Color": "White",
      "Account Type": "Personal",
    },
  ];
  triggerExcelDownload(rows, "template-vehicles.xlsx", "Vehicles");
}

export function downloadInventoryTemplate(): void {
  const rows: ExcelRow[] = [
    {
      "Item Name": "Engine Oil 10W30",
      "SKU": "OIL-10W30-4L",
      "Category": "Lubricants",
      "Brand": "Motul",
      "Qty On Hand": 10,
      "Reorder Level": 3,
      "Unit Cost": "350.00",
      "Selling Price": "450.00",
      "Supplier": "ABC Supplier",
    },
  ];
  triggerExcelDownload(rows, "template-inventory.xlsx", "Inventory");
}

export function downloadSupplierTemplate(): void {
  const rows: ExcelRow[] = [
    {
      "Supplier Name": "ABC Parts Supplier",
      "Contact Person": "Maria Santos",
      "Phone": "09181234567",
      "Email": "supplier@example.com",
      "Address": "Quezon City",
    },
  ];
  triggerExcelDownload(rows, "template-suppliers.xlsx", "Suppliers");
}

export function downloadExpenseTemplate(): void {
  const rows: ExcelRow[] = [
    {
      "Date": "2026-04-01",
      "Category": "Parts & Supplies",
      "Vendor": "ABC Hardware",
      "Description": "Cleaning supplies",
      "Amount": "500.00",
      "Payment Method": "Cash",
      "Reference Number": "OR-001",
      "Note": "",
    },
  ];
  triggerExcelDownload(rows, "template-expenses.xlsx", "Expenses");
}

export function downloadServiceHistoryTemplate(): void {
  const rows: ExcelRow[] = [
    {
      "Plate Number": "ABC1234",
      "Service Title": "5,000 km periodic maintenance package",
      "Category": "Periodic Maintenance",
      "Completed At": "2026-04-01",
      "Odometer At Completion": "45000",
    },
  ];
  triggerExcelDownload(rows, "template-service-history.xlsx", "ServiceHistory");
}
