import React, { useMemo } from "react";
import type { RepairOrderRecord, SessionUser, UserAccount } from "../shared/types";
import { buildProfitReportViewModel } from "./accountingHelpers";
import { canViewMargin } from "./marginHelpers";
import { formatCurrency } from "../shared/helpers";

type Props = {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  users: UserAccount[];
  from?: string;
  to?: string;
};

export function ProfitReportPanel({ currentUser, repairOrders, users, from, to }: Props) {
  const model = useMemo(
    () => buildProfitReportViewModel({ repairOrders, users, from, to, role: currentUser.role }),
    [currentUser.role, from, repairOrders, to, users]
  );

  if (!canViewMargin(currentUser.role)) {
    return <div style={styles.locked} data-testid="profit-report-restricted">Profit and margin reporting is restricted to Admin users.</div>;
  }

  return (
    <section style={styles.panel} data-testid="profit-report-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Expense + Revenue Profit Report</div>
          <h3 style={styles.title}>Management estimate only</h3>
          <div style={styles.subtitle}>This report uses local-first DVI data and is not an official accounting or tax report.</div>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <Stat label="Revenue" value={formatCurrency(model.totalRevenue)} />
        <Stat label="Payments Collected" value={formatCurrency(model.totalPayments)} />
        <Stat label="Expenses" value={formatCurrency(model.totalExpenses)} />
        <Stat label="Gross Profit" value={formatCurrency(model.grossProfitEstimate)} />
        <Stat label="Net Cash" value={formatCurrency(model.netCashStyleSummary)} />
        <Stat label="Fallback Services" value={model.missingPricingCount} />
      </div>

      <div style={styles.columns}>
        <div>
          <div style={styles.sectionTitle}>Revenue by Category</div>
          <div style={styles.list} data-testid="profit-revenue-by-category">
            {model.revenueByCategory.map((row) => (
              <div key={row.category} style={styles.row}>
                <strong>{row.category}</strong>
                <span>{formatCurrency(row.revenue)} · {row.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={styles.sectionTitle}>Expense Breakdown</div>
          <div style={styles.list} data-testid="profit-expense-by-category">
            {model.expenseByCategory.map((row) => (
              <div key={row.category} style={styles.row}>
                <strong>{row.category}</strong>
                <span>{formatCurrency(row.total)} · {row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={styles.sectionTitle}>Monthly Trend</div>
        <div style={styles.list} data-testid="profit-monthly-trend">
          {model.monthlyTrend.map((row) => (
            <div key={row.month} style={styles.row}>
              <strong>{row.month}</strong>
              <span>Revenue {formatCurrency(row.revenue)} · Payments {formatCurrency(row.payments)} · Expenses {formatCurrency(row.expenses)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, color: "#64748b", fontSize: 12 }}>
        {model.notes.map((note) => (
          <div key={note}>{note}</div>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { marginTop: 16, border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", fontWeight: 700, color: "#64748b" },
  title: { margin: "2px 0 0", fontSize: 18, color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 14 },
  statCard: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  statLabel: { fontSize: 12, color: "#64748b" },
  statValue: { fontSize: 20, fontWeight: 800, marginTop: 2, color: "#0f172a" },
  columns: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8 },
  list: { display: "grid", gap: 8 },
  row: { display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", fontSize: 13, color: "#334155" },
  locked: { border: "1px dashed #cbd5e1", borderRadius: 8, padding: 14, background: "#f8fafc", color: "#475569", fontSize: 13 },
};

export default ProfitReportPanel;
