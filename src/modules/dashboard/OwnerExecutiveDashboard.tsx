import React, { useMemo } from "react";
import type { BackjobRecord, PartsRequestRecord, QCRecord, RepairOrderRecord, ReleaseRecord, SessionUser, UserAccount, WorkLog } from "../shared/types";
import { formatCurrency } from "../shared/helpers";
import { buildOwnerExecutiveDashboardViewModel } from "./ownerExecutiveDashboardHelpers";

type Props = {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  releaseRecords: ReleaseRecord[];
  partsRequests: PartsRequestRecord[];
  qcRecords: QCRecord[];
  backjobRecords: BackjobRecord[];
  users: UserAccount[];
  workLogs: WorkLog[];
  isCompactLayout: boolean;
};

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={styles.kpi}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function OwnerExecutiveDashboard(props: Props) {
  const vm = useMemo(
    () =>
      buildOwnerExecutiveDashboardViewModel({
        role: props.currentUser.role,
        repairOrders: props.repairOrders,
        releaseRecords: props.releaseRecords,
        partsRequests: props.partsRequests,
        qcRecords: props.qcRecords,
        backjobRecords: props.backjobRecords,
        users: props.users,
        workLogs: props.workLogs,
      }),
    [props.backjobRecords, props.currentUser.role, props.partsRequests, props.qcRecords, props.releaseRecords, props.repairOrders, props.users, props.workLogs]
  );

  if (!vm.allowed) {
    return (
      <section style={styles.panel} data-testid="owner-dashboard-restricted">
        <div style={styles.title}>Owner Executive Dashboard</div>
        <div style={styles.note}>Executive financial and ownership metrics are restricted to Admin users.</div>
      </section>
    );
  }

  return (
    <section style={styles.panel} data-testid="owner-executive-dashboard">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Owner Executive Dashboard</div>
          <h2 style={styles.title}>Business health snapshot</h2>
        </div>
      </div>
      <div style={{ ...styles.kpiGrid, gridTemplateColumns: props.isCompactLayout ? "1fr" : "repeat(5, minmax(0, 1fr))" }}>
        <Kpi label="Total Revenue" value={formatCurrency(vm.kpis.totalRevenue)} />
        <Kpi label="Completed ROs" value={vm.kpis.completedRos} />
        <Kpi label="Active ROs" value={vm.kpis.activeRos} />
        <Kpi label="Waiting Approvals" value={vm.kpis.waitingApprovals} />
        <Kpi label="Backjobs" value={vm.kpis.backjobCount} />
      </div>
      <div style={{ ...styles.columns, gridTemplateColumns: props.isCompactLayout ? "1fr" : "repeat(3, minmax(0, 1fr))" }}>
        <div data-testid="owner-dashboard-top-services">
          <h3 style={styles.cardTitle}>Top Services</h3>
          {vm.topServices.map((row) => <div key={row.title} style={styles.row}><span>{row.title}</span><strong>{row.count}</strong></div>)}
        </div>
        <div>
          <h3 style={styles.cardTitle}>Technician Productivity</h3>
          {vm.technicianProductivity.map((row) => <div key={row.technicianName} style={styles.row}><span>{row.technicianName}</span><strong>{row.completedServices}</strong></div>)}
        </div>
        <div>
          <h3 style={styles.cardTitle}>Supplier Performance</h3>
          {vm.supplierPerformance.map((row) => <div key={row.supplierName} style={styles.row}><span>{row.supplierName}</span><strong>{row.awardedCount}</strong></div>)}
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: 0, fontSize: 20, color: "#0f172a", fontWeight: 800 },
  note: { color: "#64748b", fontSize: 13, marginTop: 6 },
  kpiGrid: { display: "grid", gap: 10, marginBottom: 14 },
  kpi: { display: "grid", gap: 4, border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  columns: { display: "grid", gap: 14 },
  cardTitle: { margin: "0 0 8px", fontSize: 14 },
  row: { display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderBottom: "1px solid #e2e8f0", color: "#334155" },
};
