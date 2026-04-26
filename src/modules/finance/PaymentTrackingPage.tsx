import React, { useMemo, useState } from "react";
import type {
  SessionUser,
  RepairOrderRecord,
  InvoiceRecord,
  PaymentRecord,
  PaymentMethod,
  ROPaymentStatus,
  AuditLogRecord,
} from "../shared/types";
import { formatCurrency, parseMoneyInput, formatDateTime } from "../shared/helpers";
import { InvoiceReconciliationPanel } from "./InvoiceReconciliationPanel";

export function computeROPaymentStatus(
  roId: string,
  invoices: InvoiceRecord[],
  payments: PaymentRecord[]
): { status: ROPaymentStatus; invoiced: number; paid: number; balance: number } {
  const roInvoices = invoices.filter((inv) => inv.roId === roId);
  const roPayments = payments.filter((p) => p.roId === roId);

  if (roInvoices.length === 0) {
    return { status: "Unpaid", invoiced: 0, paid: 0, balance: 0 };
  }

  const invoiced = roInvoices.reduce((s, inv) => s + parseMoneyInput(inv.totalAmount), 0);
  const paid = roPayments.reduce((s, p) => s + parseMoneyInput(p.amount), 0);
  const balance = Math.max(0, invoiced - paid);

  const waivedInvoice = roInvoices.find((inv) => inv.paymentStatus === "Waived");
  if (waivedInvoice) return { status: "Waived", invoiced, paid, balance: 0 };
  if (paid <= 0) return { status: "Unpaid", invoiced, paid, balance };
  if (balance <= 0.005) return { status: "Paid", invoiced, paid, balance: 0 };
  return { status: "Partial", invoiced, paid, balance };
}

const STATUS_STYLES: Record<ROPaymentStatus, React.CSSProperties> = {
  Unpaid: { background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 },
  Partial: { background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 },
  Paid: { background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 },
  Waived: { background: "#e0e7ff", color: "#4338ca", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 },
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 16, maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  title: { fontSize: 20, fontWeight: 700, color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 12 },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "8px 10px", background: "#f8fafc", textAlign: "left" as const, fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "8px 10px", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" as const },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12, marginBottom: 16 },
  statCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px", textAlign: "center" as const },
  statLabel: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 700, color: "#0f172a" },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 },
  select: { padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, color: "#0f172a", background: "#fff" },
  input: { padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, color: "#0f172a", background: "#fff" },
  primaryBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  secondaryBtn: { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 12px", fontWeight: 500, cursor: "pointer", fontSize: 13 },
  emptyState: { textAlign: "center" as const, padding: "32px 0", color: "#94a3b8", fontSize: 14 },
  errorBox: { background: "#fee2e2", color: "#b91c1c", borderRadius: 6, padding: "8px 12px", fontSize: 13, marginBottom: 8 },
  subCard: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 12, marginTop: 8 },
};

const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "GCash",
  "Maya",
  "Bank Transfer",
  "Check",
  "Card",
  "Credit Card",
  "Charge Account / Fleet",
  "Other",
];

export function PaymentTrackingPage({
  currentUser,
  repairOrders,
  invoiceRecords,
  paymentRecords,
  setPaymentRecords,
  onLogAudit,
}: {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
  setPaymentRecords: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
  onLogAudit: (entry: Omit<AuditLogRecord, "id" | "timestamp">) => void;
}) {
  const [filterStatus, setFilterStatus] = useState<ROPaymentStatus | "">("");
  const [search, setSearch] = useState("");
  const [selectedRoId, setSelectedRoId] = useState<string | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payForm, setPayForm] = useState<{ amount: string; method: PaymentMethod; referenceNumber: string; note: string }>({ amount: "", method: "Cash", referenceNumber: "", note: "" });
  const [payError, setPayError] = useState("");

  const rows = useMemo(() => {
    const invoicedRoIds = new Set(invoiceRecords.map((inv) => inv.roId));
    const rosWithInvoice = repairOrders.filter((ro) => invoicedRoIds.has(ro.id));
    return rosWithInvoice.map((ro) => ({
      ro,
      ...computeROPaymentStatus(ro.id, invoiceRecords, paymentRecords),
    }));
  }, [repairOrders, invoiceRecords, paymentRecords]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchStatus = !filterStatus || row.status === filterStatus;
      const matchSearch = !term || row.ro.roNumber.toLowerCase().includes(term) || (row.ro.accountLabel || row.ro.customerName || "").toLowerCase().includes(term) || row.ro.plateNumber.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [rows, filterStatus, search]);

  const summary = useMemo(() => ({
    unpaid: rows.filter((r) => r.status === "Unpaid").length,
    partial: rows.filter((r) => r.status === "Partial").length,
    paid: rows.filter((r) => r.status === "Paid").length,
    waived: rows.filter((r) => r.status === "Waived").length,
    totalBalance: rows.reduce((s, r) => s + r.balance, 0),
  }), [rows]);

  const selectedRow = selectedRoId ? rows.find((r) => r.ro.id === selectedRoId) ?? null : null;
  const selectedPayments = selectedRoId ? paymentRecords.filter((p) => p.roId === selectedRoId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];

  function handleAddPayment() {
    if (!selectedRoId || !selectedRow) return;
    const amt = parseMoneyInput(payForm.amount);
    if (amt <= 0) { setPayError("Enter a valid amount."); return; }
    if (!payForm.method) { setPayError("Select a payment method."); return; }
    setPayError("");
    const now = new Date().toISOString();
    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      paymentNumber: `PAY-${now.slice(0, 10).replace(/-/g, "")}-${String(paymentRecords.length + 1).padStart(3, "0")}`,
      invoiceId: invoiceRecords.find((inv) => inv.roId === selectedRoId)?.id ?? "",
      roId: selectedRoId,
      roNumber: selectedRow.ro.roNumber,
      createdAt: now,
      receivedBy: currentUser.fullName,
      amount: String(amt),
      method: payForm.method,
      referenceNumber: payForm.referenceNumber.trim(),
      notes: payForm.note.trim(),
    };
    setPaymentRecords((prev) => [newPayment, ...prev]);
    onLogAudit({ module: "Payments", action: "payment_recorded", entityId: selectedRoId, entityLabel: selectedRow.ro.roNumber, userId: currentUser.id, userName: currentUser.fullName, detail: `Payment of ${formatCurrency(amt)} recorded via ${payForm.method} for RO ${selectedRow.ro.roNumber}` });
    setPayForm({ amount: "", method: "Cash", referenceNumber: "", note: "" });
    setShowAddPayment(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Payment Tracking</div>
          <div style={styles.subtitle}>Monitor RO payment status and record collections</div>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        {(["Unpaid", "Partial", "Paid", "Waived"] as ROPaymentStatus[]).map((s) => (
          <div key={s} style={{ ...styles.statCard, cursor: "pointer", border: filterStatus === s ? "2px solid #2563eb" : "1px solid #e2e8f0" }} onClick={() => setFilterStatus(filterStatus === s ? "" : s)}>
            <div style={styles.statLabel}>{s}</div>
            <div style={{ ...styles.statValue, color: s === "Unpaid" ? "#b91c1c" : s === "Partial" ? "#b45309" : s === "Paid" ? "#15803d" : "#4338ca" }}>
              {summary[s.toLowerCase() as keyof typeof summary]}
            </div>
          </div>
        ))}
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Outstanding</div>
          <div style={{ ...styles.statValue, fontSize: 16, color: "#b91c1c" }}>{formatCurrency(summary.totalBalance)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedRow ? "1fr 360px" : "1fr", gap: 16 }}>
        <div style={styles.card}>
          <div style={styles.filterRow}>
            <input style={{ ...styles.input, minWidth: 180 }} placeholder="Search RO, customer, plate…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select style={styles.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ROPaymentStatus | "")}>
              <option value="">All statuses</option>
              {(["Unpaid", "Partial", "Paid", "Waived"] as ROPaymentStatus[]).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div style={styles.emptyState}>No records match the current filter.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>RO #</th>
                  <th style={styles.th}>Customer / Vehicle</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: "right" as const }}>Invoiced</th>
                  <th style={{ ...styles.th, textAlign: "right" as const }}>Paid</th>
                  <th style={{ ...styles.th, textAlign: "right" as const }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ ro, status, invoiced, paid, balance }) => (
                  <tr
                    key={ro.id}
                    data-testid={`payment-row-${ro.id}`}
                    style={{ cursor: "pointer", background: selectedRoId === ro.id ? "#eff6ff" : "transparent" }}
                    onClick={() => { setSelectedRoId(selectedRoId === ro.id ? null : ro.id); setShowAddPayment(false); }}
                  >
                    <td style={styles.td}><strong>{ro.roNumber}</strong></td>
                    <td style={styles.td}>
                      <div>{ro.accountLabel || ro.customerName || "—"}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{ro.plateNumber || ro.conductionNumber || "—"}</div>
                    </td>
                    <td style={styles.td}><span style={STATUS_STYLES[status]}>{status}</span></td>
                    <td style={{ ...styles.td, textAlign: "right" as const }}>{formatCurrency(invoiced)}</td>
                    <td style={{ ...styles.td, textAlign: "right" as const }}>{formatCurrency(paid)}</td>
                    <td style={{ ...styles.td, textAlign: "right" as const, fontWeight: balance > 0 ? 700 : 400, color: balance > 0 ? "#b91c1c" : "#15803d" }}>{formatCurrency(balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedRow && (
          <div style={styles.card} data-testid="payment-detail-panel">
            <div style={styles.cardTitle}>
              {selectedRow.ro.roNumber}
              <span style={{ ...STATUS_STYLES[selectedRow.status], marginLeft: 8 }}>{selectedRow.status}</span>
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>
              <div>{selectedRow.ro.accountLabel || selectedRow.ro.customerName || "—"}</div>
              <div>{selectedRow.ro.plateNumber || selectedRow.ro.conductionNumber || "—"}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={styles.subCard}><div style={{ fontSize: 11, color: "#64748b" }}>Invoiced</div><div style={{ fontWeight: 700 }}>{formatCurrency(selectedRow.invoiced)}</div></div>
              <div style={styles.subCard}><div style={{ fontSize: 11, color: "#64748b" }}>Paid</div><div style={{ fontWeight: 700, color: "#15803d" }}>{formatCurrency(selectedRow.paid)}</div></div>
              <div style={{ ...styles.subCard, gridColumn: "1 / -1" }}><div style={{ fontSize: 11, color: "#64748b" }}>Balance</div><div style={{ fontWeight: 700, fontSize: 18, color: selectedRow.balance > 0 ? "#b91c1c" : "#15803d" }}>{formatCurrency(selectedRow.balance)}</div></div>
            </div>

            {!showAddPayment && (
              <button style={{ ...styles.primaryBtn, width: "100%", marginBottom: 12 }} onClick={() => setShowAddPayment(true)}>+ Record Payment</button>
            )}

            {showAddPayment && (
              <div style={{ ...styles.subCard, marginBottom: 12 }}>
                {payError && <div style={styles.errorBox}>{payError}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input style={styles.input} type="number" min="0" step="0.01" placeholder="Amount (₱)" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} />
                  <select style={styles.select} value={payForm.method} onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))}>
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <input style={styles.input} placeholder="Reference #" value={payForm.referenceNumber} onChange={(e) => setPayForm((f) => ({ ...f, referenceNumber: e.target.value }))} />
                  <input style={styles.input} placeholder="Note (optional)" value={payForm.note} onChange={(e) => setPayForm((f) => ({ ...f, note: e.target.value }))} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={styles.primaryBtn} onClick={handleAddPayment}>Save</button>
                    <button style={styles.secondaryBtn} onClick={() => setShowAddPayment(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Payment History</div>
            {selectedPayments.length === 0 ? (
              <div style={{ fontSize: 13, color: "#94a3b8" }}>No payments recorded yet.</div>
            ) : (
              selectedPayments.map((p) => (
                <div key={p.id} style={{ ...styles.subCard, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{formatCurrency(parseMoneyInput(p.amount))}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{p.method}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{formatDateTime(p.createdAt)} — {p.receivedBy}</div>
                  {p.referenceNumber && <div style={{ fontSize: 11, color: "#64748b" }}>Ref: {p.referenceNumber}</div>}
                  {p.notes && <div style={{ fontSize: 11, color: "#64748b" }}>{p.notes}</div>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <InvoiceReconciliationPanel
        currentUser={currentUser}
        repairOrders={repairOrders}
        invoiceRecords={invoiceRecords}
        paymentRecords={paymentRecords}
        onLogAudit={onLogAudit}
      />
    </div>
  );
}

export default PaymentTrackingPage;
