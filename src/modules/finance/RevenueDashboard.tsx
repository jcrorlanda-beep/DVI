import React, { useMemo, useState } from "react";
import type { ExpenseRecord, InvoiceRecord, PartsRequestRecord, PaymentRecord, RepairOrderRecord, SessionUser, UserAccount } from "../shared/types";
import { formatCurrency } from "../shared/helpers";
import { AccountingPrepPanel } from "./AccountingPrepPanel";
import { ProfitReportPanel } from "./ProfitReportPanel";
import { buildMarginViewModel } from "./marginHelpers";
import { buildRevenueDashboardViewModel } from "./revenueHelpers";

type Props = {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  users: UserAccount[];
  partsRequests: PartsRequestRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
  expenseRecords: ExpenseRecord[];
  isCompactLayout: boolean;
};

function Stat({ label, value, note, testId }: { label: string; value: string | number; note?: string; testId?: string }) {
  return (
    <div style={styles.stat} data-testid={testId}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
      {note ? <div style={styles.note}>{note}</div> : null}
    </div>
  );
}

function Rows({ rows }: { rows: Array<{ label: string; value: string; note?: string }> }) {
  return (
    <div style={styles.rows}>
      {rows.length === 0 ? <div style={styles.empty}>No matching records for this range.</div> : null}
      {rows.slice(0, 6).map((row) => (
        <div key={`${row.label}:${row.note}`} style={styles.row}>
          <div>
            <strong>{row.label}</strong>
            {row.note ? <div style={styles.note}>{row.note}</div> : null}
          </div>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function RevenueDashboard({ currentUser, repairOrders, users, partsRequests, invoiceRecords, paymentRecords, expenseRecords, isCompactLayout }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const revenue = useMemo(
    () => buildRevenueDashboardViewModel(repairOrders, users, { from, to }),
    [from, repairOrders, to, users]
  );
  const margin = useMemo(
    () => buildMarginViewModel(repairOrders, partsRequests, currentUser.role),
    [currentUser.role, partsRequests, repairOrders]
  );

  return (
    <section style={styles.panel} data-testid="revenue-dashboard-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Revenue / Sales Tracking</div>
          <h2 style={styles.title}>Completed service revenue</h2>
        </div>
        <div style={styles.filters}>
          <label style={styles.field}>
            <span>From</span>
            <input data-testid="revenue-date-from" style={styles.input} type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label style={styles.field}>
            <span>To</span>
            <input data-testid="revenue-date-to" style={styles.input} type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
        </div>
      </div>

      <div style={{ ...styles.kpiGrid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(4, minmax(0, 1fr))" }}>
        <Stat testId="revenue-total" label="Total Revenue" value={formatCurrency(revenue.totalRevenue)} note="Completed work only" />
        <Stat label="Completed ROs" value={revenue.completedRoCount} />
        <Stat label="Completed Services" value={revenue.completedServiceCount} />
        <Stat testId="revenue-fallback-count" label="Counts Fallback" value={revenue.fallbackServiceCount} note="Lines without pricing" />
      </div>

      <div style={{ ...styles.columns, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(3, minmax(0, 1fr))" }}>
        <div>
          <h3 style={styles.cardTitle}>Revenue by RO</h3>
          <Rows rows={revenue.byRo.map((row) => ({ label: row.roNumber, value: formatCurrency(row.revenue), note: `${row.customerName} / ${row.serviceCount} services` }))} />
        </div>
        <div data-testid="revenue-by-category">
          <h3 style={styles.cardTitle}>Revenue by Category</h3>
          <Rows rows={revenue.byCategory.map((row) => ({ label: row.category, value: formatCurrency(row.revenue), note: `${row.count} services` }))} />
        </div>
        <div>
          <h3 style={styles.cardTitle}>Revenue by Advisor</h3>
          <Rows rows={revenue.byAdvisor.map((row) => ({ label: row.advisorName, value: formatCurrency(row.revenue), note: `${row.count} services` }))} />
        </div>
      </div>

      <div style={styles.marginBox} data-testid="margin-dashboard-panel">
        <div style={styles.cardTitle}>Profit / Margin Layer</div>
        {!margin.allowed ? (
          <div style={styles.empty} data-testid="margin-restricted">Margin details are restricted to Admin users.</div>
        ) : (
          <>
            <div style={styles.kpiGrid}>
              <Stat label="Estimated Margin" value={formatCurrency(margin.estimatedMargin)} />
              <Stat label="Parts Cost" value={formatCurrency(margin.totalCost)} />
              <Stat label="Missing Cost" value={margin.missingCostCount} note="Fallback to revenue/counts" />
            </div>
            <Rows rows={margin.byCategory.map((row) => ({ label: row.category, value: formatCurrency(row.margin), note: `${row.count} services` }))} />
            <div style={{ marginTop: 12 }} data-testid="margin-supplier-breakdown">
              <div style={styles.cardTitle}>Supplier Margin Signals</div>
              <Rows rows={margin.bySupplier.map((row) => ({ label: row.supplierName, value: formatCurrency(row.margin), note: `${row.count} awarded parts requests` }))} />
            </div>
          </>
        )}
      </div>

      <AccountingPrepPanel
        currentUser={currentUser}
        repairOrders={repairOrders}
        users={users}
        partsRequests={partsRequests}
        invoiceRecords={invoiceRecords}
        paymentRecords={paymentRecords}
        expenseRecords={expenseRecords}
      />

      <ProfitReportPanel
        currentUser={currentUser}
        repairOrders={repairOrders}
        users={users}
        from={from}
        to={to}
      />
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  filters: { display: "flex", gap: 8, flexWrap: "wrap" },
  field: { display: "grid", gap: 4, fontSize: 12, color: "#475569" },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 14 },
  stat: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  label: { fontSize: 12, color: "#64748b" },
  value: { fontSize: 20, fontWeight: 800, color: "#0f172a", marginTop: 3 },
  note: { fontSize: 12, color: "#64748b" },
  columns: { display: "grid", gap: 12 },
  cardTitle: { margin: "0 0 8px", fontSize: 14, color: "#0f172a" },
  rows: { display: "grid", gap: 8 },
  row: { display: "flex", justifyContent: "space-between", gap: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 },
  empty: { color: "#64748b", fontSize: 13 },
  marginBox: { marginTop: 16, borderTop: "1px solid #e2e8f0", paddingTop: 14 },
};
