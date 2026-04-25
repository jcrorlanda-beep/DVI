import React, { useMemo } from "react";
import type { RepairOrderRecord, UserAccount, WorkLog } from "../shared/types";
import { buildCapacitySummary } from "./operationsHelpers";

type Props = {
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
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

export function CapacityPlanningPanel({ users, repairOrders, workLogs, isCompactLayout }: Props) {
  const summary = useMemo(() => buildCapacitySummary({ users, repairOrders, workLogs }), [repairOrders, users, workLogs]);

  return (
    <section style={styles.panel} data-testid="capacity-planning-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Capacity Planning</div>
          <h2 style={styles.title}>Today’s shop workload</h2>
        </div>
        {summary.overloaded ? <span style={styles.warning} data-testid="capacity-overload-warning">Overload risk</span> : <span style={styles.ok}>Within capacity</span>}
      </div>
      <div style={{ ...styles.grid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(6, minmax(0, 1fr))" }}>
        <Kpi label="Active Jobs" value={summary.activeJobs} />
        <Kpi label="Tech Capacity" value={summary.availableTechnicianCapacity} />
        <Kpi label="Waiting Parts" value={summary.waitingParts} />
        <Kpi label="Waiting QC" value={summary.waitingQc} />
        <Kpi label="Ready Release" value={summary.readyRelease} />
        <Kpi label="Workload Score" value={summary.estimatedWorkload} />
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  warning: { borderRadius: 999, padding: "5px 10px", background: "#fee2e2", color: "#991b1b", fontWeight: 800, fontSize: 12 },
  ok: { borderRadius: 999, padding: "5px 10px", background: "#dcfce7", color: "#166534", fontWeight: 800, fontSize: 12 },
  grid: { display: "grid", gap: 10 },
  kpi: { display: "grid", gap: 4, border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
};
