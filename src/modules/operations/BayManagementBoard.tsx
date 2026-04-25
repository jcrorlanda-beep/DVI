import React, { useEffect, useMemo, useState } from "react";
import type { RepairOrderRecord } from "../shared/types";
import { DEFAULT_BAYS, getBayStatus, getVehicleLabel, type BayAssignmentRecord } from "./operationsHelpers";

type Props = {
  repairOrders: RepairOrderRecord[];
  isCompactLayout: boolean;
};

const STORAGE_KEY = "dvi_bay_assignments_v1";

function readAssignments() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as BayAssignmentRecord[];
  } catch {
    return [];
  }
}

export function BayManagementBoard({ repairOrders, isCompactLayout }: Props) {
  const [assignments, setAssignments] = useState<BayAssignmentRecord[]>(() => (typeof window === "undefined" ? [] : readAssignments()));
  const [selectedRoByBay, setSelectedRoByBay] = useState<Record<string, string>>({});
  const activeRos = repairOrders.filter((ro) => !["Released", "Closed"].includes(ro.status));
  const assignmentByBay = useMemo(() => new Map(assignments.map((row) => [row.bayId, row] as const)), [assignments]);

  useEffect(() => {
    const activeIds = new Set(activeRos.map((ro) => ro.id));
    setAssignments((current) => current.filter((assignment) => activeIds.has(assignment.roId)));
  }, [repairOrders]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  const assignBay = (bayName: string) => {
    const roId = selectedRoByBay[bayName];
    if (!roId) return;
    setAssignments((current) => [
      ...current.filter((row) => row.bayId !== bayName && row.roId !== roId),
      { bayId: bayName, bayName, roId, assignedAt: new Date().toISOString() },
    ]);
  };

  return (
    <section style={styles.panel} data-testid="bay-management-board">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Bay / Work Area Management</div>
          <h2 style={styles.title}>Bay assignments</h2>
        </div>
      </div>
      <div style={{ ...styles.grid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(3, minmax(0, 1fr))" }}>
        {DEFAULT_BAYS.map((bayName) => {
          const assignment = assignmentByBay.get(bayName);
          const ro = repairOrders.find((row) => row.id === assignment?.roId);
          const status = getBayStatus(ro);
          return (
            <div key={bayName} style={styles.card} data-testid={`bay-card-${bayName.replace(/[^a-z0-9]+/gi, "-")}`}>
              <div style={styles.cardHeader}>
                <strong>{bayName}</strong>
                <span style={status === "Available" ? styles.available : styles.busy}>{status}</span>
              </div>
              <div style={styles.meta}>{ro ? `${ro.roNumber} / ${getVehicleLabel(ro)} / ${ro.plateNumber || "-"}` : "No vehicle assigned."}</div>
              <select
                data-testid={`bay-select-${bayName.replace(/[^a-z0-9]+/gi, "-")}`}
                style={styles.input}
                value={selectedRoByBay[bayName] ?? ""}
                onChange={(event) => setSelectedRoByBay((current) => ({ ...current, [bayName]: event.target.value }))}
              >
                <option value="">Select RO</option>
                {activeRos.map((row) => (
                  <option key={row.id} value={row.id}>{row.roNumber} / {row.plateNumber || row.conductionNumber || "No plate"}</option>
                ))}
              </select>
              <div style={styles.actions}>
                <button type="button" style={styles.button} onClick={() => assignBay(bayName)}>Assign</button>
                <button type="button" style={styles.button} onClick={() => setAssignments((current) => current.filter((row) => row.bayId !== bayName))}>Clear</button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  grid: { display: "grid", gap: 10 },
  card: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10 },
  available: { borderRadius: 999, padding: "4px 8px", background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 800 },
  busy: { borderRadius: 999, padding: "4px 8px", background: "#fffbeb", color: "#92400e", fontSize: 12, fontWeight: 800 },
  meta: { color: "#64748b", fontSize: 13, marginTop: 8 },
  input: { marginTop: 10, width: "100%", border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px" },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  button: { border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", padding: "8px 10px", fontWeight: 700, cursor: "pointer" },
};
