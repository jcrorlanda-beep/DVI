import React, { useMemo } from "react";
import type { BackjobRecord, QCRecord, RepairOrderRecord, UserAccount } from "../shared/types";
import { buildTechnicianEfficiencyScores } from "./technicianEfficiencyHelpers";

type Props = {
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  qcRecords: QCRecord[];
  backjobRecords: BackjobRecord[];
};

export function TechnicianEfficiencyPanel({ users, repairOrders, qcRecords, backjobRecords }: Props) {
  const rows = useMemo(
    () => buildTechnicianEfficiencyScores({ users, repairOrders, qcRecords, backjobRecords }),
    [backjobRecords, qcRecords, repairOrders, users]
  );

  return (
    <section style={styles.panel} data-testid="technician-efficiency-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Technician Efficiency Score</div>
          <h2 style={styles.title}>Quality-weighted production score</h2>
        </div>
      </div>
      <div style={styles.rows}>
        {rows.slice(0, 8).map((row) => (
          <div key={row.technicianId} style={styles.row} data-testid={`technician-efficiency-row-${row.technicianId}`}>
            <div>
              <strong>{row.technicianName}</strong>
              <div style={styles.meta}>
                {row.completedWork} completed / {row.qcPassRate}% QC pass / {row.backjobCount} rework
              </div>
            </div>
            <strong style={styles.score}>{row.score}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  rows: { display: "grid", gap: 8 },
  row: { display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #e2e8f0", padding: "8px 0" },
  meta: { color: "#64748b", fontSize: 12, marginTop: 3 },
  score: { color: "#166534", fontSize: 22 },
};
