import React, { useMemo, useState } from "react";
import type { RepairOrderRecord, SessionUser } from "../shared/types";
import { formatCurrency } from "../shared/helpers";
import { buildCustomerAnalyticsViewModel, type VisitClassification } from "./customerAnalyticsHelpers";

type Props = {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  isCompactLayout: boolean;
};

const CLASSIFICATIONS: VisitClassification[] = [
  "Return Customer / Existing Vehicle",
  "New Customer / New Vehicle",
  "Fleet / Company Customer",
];

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function CustomerAnalyticsDashboard({ currentUser, repairOrders, isCompactLayout }: Props) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const viewModel = useMemo(
    () => buildCustomerAnalyticsViewModel({ repairOrders, currentRole: currentUser.role, filters: { dateFrom, dateTo, search } }),
    [currentUser.role, dateFrom, dateTo, repairOrders, search]
  );
  const totalClassified = CLASSIFICATIONS.reduce((sum, key) => sum + viewModel.classificationCounts[key], 0);

  return (
    <section style={styles.panel} data-testid="customer-visit-breakdown-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Customer Retention</div>
          <h2 style={styles.title}>Customer Visit Breakdown</h2>
        </div>
        <div style={styles.filters}>
          <input data-testid="customer-visit-search" style={styles.input} placeholder="Customer / plate" value={search} onChange={(event) => setSearch(event.target.value)} />
          <input data-testid="customer-visit-date-from" style={styles.input} type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <input data-testid="customer-visit-date-to" style={styles.input} type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </div>
      </div>

      <div style={{ ...styles.kpis, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(3, minmax(0, 1fr))" }}>
        {CLASSIFICATIONS.map((classification) => {
          const count = viewModel.classificationCounts[classification];
          const pct = totalClassified ? Math.round((count / totalClassified) * 100) : 0;
          return (
            <div key={classification} style={styles.kpi} data-testid={`customer-visit-count-${classification.replace(/[^a-z0-9]+/gi, "-")}`}>
              <span>{classification}</span>
              <strong>{count}</strong>
              <small>{pct}% of classified visits</small>
            </div>
          );
        })}
      </div>

      <div style={{ ...styles.columns, gridTemplateColumns: isCompactLayout ? "1fr" : "1fr 1fr" }}>
        <div>
          <h3 style={styles.cardTitle}>Repeat Customer Ranking</h3>
          {viewModel.repeatCustomers.slice(0, 6).map((row) => (
            <div key={row.key} style={styles.row}>
              <span>{row.customerName} / {row.plateNumber}</span>
              <strong>{row.visitCount} visits</strong>
            </div>
          ))}
          {viewModel.repeatCustomers.length === 0 ? <div style={styles.empty}>No repeat customers in this filter.</div> : null}
        </div>
        <div data-testid="customer-lifetime-value-panel">
          <h3 style={styles.cardTitle}>Customer Lifetime Value</h3>
          {!viewModel.clvAllowed ? (
            <div style={styles.empty} data-testid="clv-restricted">Customer value ranking is restricted.</div>
          ) : (
            viewModel.lifetimeValueRows.slice(0, 6).map((row) => (
              <div key={row.key} style={styles.row}>
                <span>
                  {row.customerName} / {row.plateNumber}
                  <small style={styles.rowNote}>
                    {row.visitCount} visits / Avg {row.averageSpendPerVisit > 0 ? formatCurrency(row.averageSpendPerVisit) : "counts only"} / Last {formatDate(row.lastVisitDate)}
                  </small>
                </span>
                <strong>{row.totalSpend > 0 ? formatCurrency(row.totalSpend) : `${row.visitCount} visits`}</strong>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  filters: { display: "flex", gap: 8, flexWrap: "wrap" },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px" },
  kpis: { display: "grid", gap: 10, marginBottom: 14 },
  kpi: { display: "grid", gap: 4, border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  columns: { display: "grid", gap: 14 },
  cardTitle: { margin: "0 0 8px", fontSize: 14, color: "#0f172a" },
  row: { display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: "1px solid #e2e8f0", color: "#334155" },
  rowNote: { display: "block", marginTop: 3, color: "#64748b" },
  empty: { color: "#64748b", fontSize: 13 },
};
