import React, { useMemo, useState } from "react";
import type { RepairOrderRecord, UserAccount, WorkLog } from "../shared/types";
import { buildTechnicianScheduleRows } from "./operationsHelpers";

type Props = {
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  workLogs: WorkLog[];
  isCompactLayout: boolean;
};

export function TechnicianScheduleBoard({ users, repairOrders, workLogs, isCompactLayout }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const rows = useMemo(() => buildTechnicianScheduleRows({ users, repairOrders, workLogs, date }), [date, repairOrders, users, workLogs]);

  return (
    <section style={styles.panel} data-testid="technician-schedule-board">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Technician Scheduling</div>
          <h2 style={styles.title}>Daily workload board</h2>
        </div>
        <input data-testid="technician-schedule-date" style={styles.input} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </div>
      <div style={{ ...styles.grid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(3, minmax(0, 1fr))" }}>
        {rows.map((row) => (
          <div key={row.technicianId} style={styles.card} data-testid={`technician-schedule-row-${row.technicianId}`}>
            <div style={styles.cardHeader}>
              <strong>{row.technicianName}</strong>
              <span style={row.status === "Busy" ? styles.busy : styles.available}>{row.status}</span>
            </div>
            <div style={styles.meta}>{row.role} / {row.workloadCount} active jobs</div>
            <div style={styles.jobs}>
              {row.assignedJobs.slice(0, 3).map((ro) => (
                <div key={ro.id}>{ro.roNumber} / {ro.plateNumber || ro.conductionNumber || "No plate"} / {ro.status}</div>
              ))}
              {row.assignedJobs.length === 0 ? <div>No assigned jobs.</div> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px" },
  grid: { display: "grid", gap: 10 },
  card: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10 },
  busy: { borderRadius: 999, padding: "4px 8px", background: "#fffbeb", color: "#92400e", fontSize: 12, fontWeight: 800 },
  available: { borderRadius: 999, padding: "4px 8px", background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 800 },
  meta: { marginTop: 5, color: "#64748b", fontSize: 12 },
  jobs: { marginTop: 8, display: "grid", gap: 4, color: "#334155", fontSize: 13 },
};
