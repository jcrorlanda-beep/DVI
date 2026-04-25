import React, { useMemo, useState } from "react";
import type { RepairOrderRecord, UserAccount, WorkLinePriority, WorkLog } from "../shared/types";
import { DEFAULT_BAYS, getShopBoardLane, getVehicleLabel, type BayAssignmentRecord } from "./operationsHelpers";

type Props = {
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  workLogs: WorkLog[];
  isCompactLayout: boolean;
};

const LANES = ["Waiting Inspection", "Waiting Approval", "Approved / Ready", "In Progress", "Waiting Parts", "QC", "Ready Release"];
const BAY_STORAGE_KEY = "dvi_bay_assignments_v1";
const PRIORITY_ORDER: Record<WorkLinePriority, number> = { High: 3, Medium: 2, Low: 1 };

function readBayAssignments() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(BAY_STORAGE_KEY) || "[]") as BayAssignmentRecord[];
  } catch {
    return [];
  }
}

function getHighestPriority(ro: RepairOrderRecord): WorkLinePriority {
  return (ro.workLines ?? []).reduce<WorkLinePriority>((highest, line) => (PRIORITY_ORDER[line.priority] > PRIORITY_ORDER[highest] ? line.priority : highest), "Low");
}

function elapsed(value?: string) {
  if (!value) return "Not started";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (!Number.isFinite(minutes)) return "Not started";
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function RealTimeShopBoard({ users, repairOrders, workLogs, isCompactLayout }: Props) {
  const [technician, setTechnician] = useState("");
  const [bay, setBay] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const assignments = useMemo(readBayAssignments, []);
  const bayByRoId = useMemo(() => new Map(assignments.map((row) => [row.roId, row.bayName] as const)), [assignments]);
  const technicians = users.filter((user) => user.active && ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role));

  const visibleRos = useMemo(
    () =>
      repairOrders.filter((ro) => {
        const lane = getShopBoardLane(ro.status);
        if (!lane) return false;
        if (technician && ro.primaryTechnicianId !== technician && !(ro.supportTechnicianIds ?? []).includes(technician)) return false;
        if (bay && (bayByRoId.get(ro.id) || "Unassigned") !== bay) return false;
        if (status && lane !== status) return false;
        if (priority && getHighestPriority(ro) !== priority) return false;
        return true;
      }),
    [bay, bayByRoId, priority, repairOrders, status, technician]
  );

  return (
    <section style={styles.panel} data-testid="shop-command-board">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Real-Time Shop Board</div>
          <h2 style={styles.title}>Operational command board</h2>
          <div style={styles.subtitle}>Live visibility by lane, technician, bay, priority, and elapsed time.</div>
        </div>
      </div>
      <div style={{ ...styles.filters, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(4, minmax(0, 1fr))" }}>
        <select data-testid="shop-board-technician-filter" style={styles.input} value={technician} onChange={(event) => setTechnician(event.target.value)}>
          <option value="">All technicians</option>
          {technicians.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
        </select>
        <select data-testid="shop-board-bay-filter" style={styles.input} value={bay} onChange={(event) => setBay(event.target.value)}>
          <option value="">All bays</option>
          <option value="Unassigned">Unassigned</option>
          {DEFAULT_BAYS.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select data-testid="shop-board-status-filter" style={styles.input} value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {LANES.map((lane) => <option key={lane} value={lane}>{lane}</option>)}
        </select>
        <select data-testid="shop-board-priority-filter" style={styles.input} value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div style={{ ...styles.lanes, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(7, minmax(180px, 1fr))" }}>
        {LANES.map((lane) => {
          const laneRos = visibleRos.filter((ro) => getShopBoardLane(ro.status) === lane);
          return (
            <div key={lane} style={styles.lane} data-testid={`shop-board-lane-${lane.replace(/[^a-z0-9]+/gi, "-")}`}>
              <div style={styles.laneHeader}><strong>{lane}</strong><span style={styles.count}>{laneRos.length}</span></div>
              {laneRos.length ? laneRos.map((ro) => {
                const techName = users.find((user) => user.id === ro.primaryTechnicianId)?.fullName || "Unassigned";
                const priorityLabel = getHighestPriority(ro);
                const activeLog = workLogs.find((log) => log.roId === ro.id && !log.endedAt);
                return (
                  <div key={ro.id} style={styles.card} data-testid={`shop-board-card-${ro.id}`}>
                    <div style={styles.cardTop}><strong>{ro.roNumber}</strong><span style={priorityStyles[priorityLabel]}>{priorityLabel}</span></div>
                    <div style={styles.vehicle}>{getVehicleLabel(ro)}</div>
                    <div style={styles.meta}>Plate: {ro.plateNumber || ro.conductionNumber || "-"}</div>
                    <div style={styles.meta}>Customer: {ro.accountLabel || ro.customerName || ro.companyName || "-"}</div>
                    <div style={styles.meta}>Tech: {techName}</div>
                    <div style={styles.meta}>Bay: {bayByRoId.get(ro.id) || "Unassigned"}</div>
                    <div style={styles.elapsed}>Elapsed: {elapsed(activeLog?.startedAt || ro.workStartedAt || ro.updatedAt || ro.createdAt)}</div>
                  </div>
                );
              }) : <div style={styles.empty}>No jobs in this lane.</div>}
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
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 4 },
  filters: { display: "grid", gap: 8, marginBottom: 12 },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px", background: "#fff", color: "#0f172a" },
  lanes: { display: "grid", gap: 10, overflowX: "auto" },
  lane: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc", minHeight: 140 },
  laneHeader: { display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 },
  count: { borderRadius: 999, padding: "3px 8px", background: "#e2e8f0", color: "#334155", fontSize: 12, fontWeight: 800 },
  card: { display: "grid", gap: 4, border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: 10, marginBottom: 8, color: "#334155", fontSize: 13 },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 8, color: "#0f172a" },
  vehicle: { color: "#0f172a", fontWeight: 800, fontSize: 14 },
  meta: { color: "#64748b", fontSize: 12 },
  elapsed: { marginTop: 6, borderRadius: 6, padding: "6px 8px", background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 800 },
  empty: { color: "#94a3b8", fontSize: 12, padding: "12px 4px" },
};

const priorityStyles: Record<WorkLinePriority, React.CSSProperties> = {
  High: { borderRadius: 999, padding: "3px 8px", background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 800 },
  Medium: { borderRadius: 999, padding: "3px 8px", background: "#ffedd5", color: "#9a3412", fontSize: 11, fontWeight: 800 },
  Low: { borderRadius: 999, padding: "3px 8px", background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 800 },
};
