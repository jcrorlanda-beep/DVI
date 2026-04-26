import React, { useMemo } from "react";
import type { PartsRequestRecord, RepairOrderRecord, SessionUser, UserAccount, InvoiceRecord, PaymentRecord, ExpenseRecord } from "../shared/types";
import { buildAccountingPrepViewModel, accountingStatusBackground, accountingStatusBadgeColor, accountingStatusTestId } from "./accountingHelpers";

type Props = {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  users: UserAccount[];
  partsRequests: PartsRequestRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
  expenseRecords: ExpenseRecord[];
};

function Locked() {
  return <div style={styles.locked} data-testid="accounting-prep-restricted">Accounting prep is restricted to Admin users.</div>;
}

export function AccountingPrepPanel({ currentUser, repairOrders, users, partsRequests, invoiceRecords, paymentRecords, expenseRecords }: Props) {
  const model = useMemo(
    () => buildAccountingPrepViewModel({ repairOrders, invoiceRecords, paymentRecords, expenseRecords, partsRequests, users }),
    [expenseRecords, invoiceRecords, paymentRecords, partsRequests, repairOrders, users]
  );

  if (currentUser.role !== "Admin") return <Locked />;

  return (
    <section style={styles.panel} data-testid="accounting-prep-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Accounting Prep Layer</div>
          <h3 style={styles.title}>Records ready for review or export</h3>
          <div style={styles.subtitle}>Reference fields are optional and existing records remain compatible.</div>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        {(Object.entries(model.summary) as Array<[keyof typeof model.summary, number]>).map(([status, count]) => (
          <div key={status} style={styles.statCard}>
            <div style={styles.statLabel}>{status}</div>
            <div style={{ ...styles.statValue, color: accountingStatusBadgeColor(status) }}>{count}</div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Records missing required finance data</div>
        {model.missingItems.length === 0 ? (
          <div style={styles.empty}>No missing finance data found.</div>
        ) : (
          <div style={styles.list}>
            {model.missingItems.slice(0, 12).map((item) => (
              <article key={`${item.source}-${item.id}`} style={styles.row}>
                <div style={styles.rowHeader}>
                  <strong>{item.label}</strong>
                  <span style={{ ...styles.badge, background: accountingStatusBackground(item.status), color: accountingStatusBadgeColor(item.status) }} data-testid={accountingStatusTestId(item.status)}>
                    {item.status}
                  </span>
                </div>
                <div style={styles.meta}>{item.source} / {item.detail}</div>
                <div style={styles.meta}>Customer: {item.customerReference || "-"}</div>
                <div style={styles.meta}>RO: {item.roReference || "-"} | Invoice: {item.invoiceReference || "-"} | Payment: {item.paymentReference || "-"} | Expense: {item.expenseReference || "-"} | PO: {item.poReference || "-"}</div>
                {item.missingFields.length > 0 ? <div style={styles.missing}>Missing: {item.missingFields.join(", ")}</div> : null}
              </article>
            ))}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Latest accounting-prep records</div>
        <div style={styles.list}>
          {model.items.slice(0, 8).map((item) => (
            <article key={`${item.source}-${item.id}`} style={styles.row}>
              <div style={styles.rowHeader}>
                <strong>{item.label}</strong>
                <span style={{ ...styles.badge, background: accountingStatusBackground(item.status), color: accountingStatusBadgeColor(item.status) }}>{item.status}</span>
              </div>
              <div style={styles.meta}>{item.source} / {item.detail}</div>
            </article>
          ))}
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
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 14 },
  statCard: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  statLabel: { fontSize: 12, color: "#64748b" },
  statValue: { fontSize: 22, fontWeight: 800, marginTop: 2 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8 },
  list: { display: "grid", gap: 8 },
  row: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  rowHeader: { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" },
  badge: { borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 800 },
  meta: { fontSize: 12, color: "#64748b", marginTop: 4 },
  missing: { fontSize: 12, color: "#b45309", marginTop: 6, fontWeight: 700 },
  empty: { color: "#64748b", fontSize: 13 },
  locked: { border: "1px dashed #cbd5e1", borderRadius: 8, padding: 14, background: "#f8fafc", color: "#475569", fontSize: 13 },
};

export default AccountingPrepPanel;
