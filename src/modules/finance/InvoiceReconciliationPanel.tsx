import React, { useMemo, useState } from "react";
import type { AuditLogRecord, InvoiceRecord, PaymentRecord, RepairOrderRecord, SessionUser } from "../shared/types";
import { buildInvoiceReconciliationViewModel, accountingStatusBackground, accountingStatusBadgeColor } from "./accountingHelpers";
import { formatCurrency } from "../shared/helpers";

type Props = {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
  onLogAudit: (entry: Omit<AuditLogRecord, "id" | "timestamp">) => void;
};

function statusColor(status: string) {
  if (status === "Paid") return "#15803d";
  if (status === "Partial") return "#b45309";
  if (status === "Overpaid") return "#2563eb";
  if (status === "Waived") return "#4338ca";
  if (status === "Needs Review") return "#b91c1c";
  return "#64748b";
}

function statusBackground(status: string) {
  if (status === "Paid") return "#dcfce7";
  if (status === "Partial") return "#fef3c7";
  if (status === "Overpaid") return "#dbeafe";
  if (status === "Waived") return "#e0e7ff";
  if (status === "Needs Review") return "#fee2e2";
  return "#e2e8f0";
}

export function InvoiceReconciliationPanel({ currentUser, repairOrders, invoiceRecords, paymentRecords, onLogAudit }: Props) {
  const [manualReviewIds, setManualReviewIds] = useState<string[]>([]);
  const model = useMemo(
    () => buildInvoiceReconciliationViewModel(invoiceRecords, paymentRecords, repairOrders),
    [invoiceRecords, paymentRecords, repairOrders]
  );

  const mergedRows = model.rows.map((row) => ({
    ...row,
    manualReview: row.manualReview || manualReviewIds.includes(row.invoiceId),
    status: row.manualReview || manualReviewIds.includes(row.invoiceId) ? "Needs Review" : row.status,
  }));

  const summary = mergedRows.reduce(
    (acc, row) => {
      acc[row.status as keyof typeof acc] = (acc[row.status as keyof typeof acc] ?? 0) + 1;
      return acc;
    },
    { Unpaid: 0, Partial: 0, Paid: 0, Overpaid: 0, Waived: 0, "Needs Review": 0 } as Record<string, number>
  );

  function markNeedsReview(row: (typeof mergedRows)[number]) {
    setManualReviewIds((current) => current.includes(row.invoiceId) ? current : [row.invoiceId, ...current]);
    onLogAudit({
      module: "Payments",
      action: "invoice_marked_needs_review",
      entityId: row.invoiceId,
      entityLabel: row.invoiceNumber,
      userId: currentUser.id,
      userName: currentUser.fullName,
      detail: `Invoice ${row.invoiceNumber} marked for review`,
    });
  }

  return (
    <section style={styles.panel} data-testid="invoice-reconciliation-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Invoice Settlement / Payment Reconciliation</div>
          <h3 style={styles.title}>Invoice and payment review</h3>
          <div style={styles.subtitle}>Settlement status is derived from invoice totals and linked payments.</div>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        {(["Unpaid", "Partial", "Paid", "Overpaid", "Waived", "Needs Review"] as const).map((status) => (
          <div key={status} style={styles.statCard}>
            <div style={styles.statLabel}>{status}</div>
            <div style={{ ...styles.statValue, color: statusColor(status) }}>{summary[status] ?? 0}</div>
          </div>
        ))}
      </div>

      <div style={styles.columns}>
        <div>
          <div style={styles.sectionTitle}>Invoices needing review</div>
          <div style={styles.list}>
            {mergedRows.map((row) => (
              <article key={row.invoiceId} style={styles.row} data-testid={`settlement-row-${row.invoiceId}`}>
                <div style={styles.rowHeader}>
                  <strong>{row.invoiceNumber}</strong>
                  <span style={{ ...styles.badge, background: statusBackground(row.status), color: statusColor(row.status) }} data-testid={`settlement-status-${row.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    {row.status}
                  </span>
                </div>
                <div style={styles.meta}>{row.roNumber} / {row.customerName}</div>
                <div style={styles.meta}>Invoice {formatCurrency(row.invoiceTotal)} | Paid {formatCurrency(row.paidTotal)} | Balance {formatCurrency(row.balance)}</div>
                <div style={styles.meta}>Payments linked: {row.paymentCount}</div>
                <div style={styles.actions}>
                  <button type="button" style={styles.secondaryButton} onClick={() => markNeedsReview(row)} disabled={row.status === "Needs Review"}>Mark Needs Review</button>
                </div>
              </article>
            ))}
            {mergedRows.length === 0 ? <div style={styles.empty}>No invoices found.</div> : null}
          </div>
        </div>

        <div>
          <div style={styles.sectionTitle}>Payments without invoice link</div>
          <div style={styles.list}>
            {model.orphanPayments.map((payment) => (
              <article key={payment.id} style={styles.row}>
                <div style={styles.rowHeader}>
                  <strong>{payment.paymentNumber}</strong>
                  <span style={{ ...styles.badge, background: accountingStatusBackground("Needs Correction"), color: accountingStatusBadgeColor("Needs Correction") }}>Needs Review</span>
                </div>
                <div style={styles.meta}>{payment.roNumber} / {payment.method}</div>
                <div style={styles.meta}>{formatCurrency(Number(String(payment.amount).replace(/[^\d.]/g, "")) || 0)} / {payment.referenceNumber || "No ref"}</div>
              </article>
            ))}
            {model.orphanPayments.length === 0 ? <div style={styles.empty}>No orphan payments found.</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { marginTop: 16, border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", fontWeight: 700, color: "#64748b" },
  title: { margin: "2px 0 0", fontSize: 18, color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 14 },
  statCard: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  statLabel: { fontSize: 12, color: "#64748b" },
  statValue: { fontSize: 20, fontWeight: 800, marginTop: 2, color: "#0f172a" },
  columns: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8 },
  list: { display: "grid", gap: 8 },
  row: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  rowHeader: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" },
  badge: { borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 800 },
  meta: { fontSize: 12, color: "#64748b", marginTop: 4 },
  actions: { display: "flex", gap: 8, marginTop: 8 },
  secondaryButton: { border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", background: "#fff", color: "#334155", fontWeight: 700, cursor: "pointer" },
  empty: { color: "#64748b", fontSize: 13 },
};

export default InvoiceReconciliationPanel;
