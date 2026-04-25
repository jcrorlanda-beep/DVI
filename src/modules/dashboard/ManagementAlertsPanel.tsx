import React, { useMemo } from "react";
import type { BackjobRecord, PartsRequestRecord, RepairOrderRecord } from "../shared/types";
import type { MaintenanceDashboardUpcomingItem } from "../maintenance/dashboardHelpers";
import { buildManagementAlerts } from "./managementAlertHelpers";

type Props = {
  repairOrders: RepairOrderRecord[];
  partsRequests: PartsRequestRecord[];
  backjobRecords: BackjobRecord[];
  upcomingItems: MaintenanceDashboardUpcomingItem[];
  onOpenRepairOrders?: () => void;
  onOpenHistory?: () => void;
};

function toneStyle(severity: "info" | "warning" | "critical") {
  if (severity === "critical") return styles.critical;
  if (severity === "warning") return styles.warning;
  return styles.info;
}

export function ManagementAlertsPanel({ repairOrders, partsRequests, backjobRecords, upcomingItems, onOpenRepairOrders, onOpenHistory }: Props) {
  const alerts = useMemo(
    () => buildManagementAlerts({ repairOrders, partsRequests, backjobRecords, upcomingItems }),
    [backjobRecords, partsRequests, repairOrders, upcomingItems]
  );

  return (
    <section style={styles.panel} data-testid="management-alerts-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Management Alerts</div>
          <h2 style={styles.title}>Operational risk signals</h2>
        </div>
        <span style={styles.badge}>{alerts.length} active</span>
      </div>
      <div style={styles.grid}>
        {alerts.map((alert) => (
          <div key={alert.id} style={{ ...styles.alert, ...toneStyle(alert.severity) }} data-testid={`management-alert-${alert.id}`}>
            <div style={styles.alertTop}>
              <strong>{alert.label}</strong>
              <span>{alert.count}</span>
            </div>
            <div style={styles.detail}>{alert.detail}</div>
          </div>
        ))}
        {alerts.length === 0 ? <div style={styles.empty}>No management alerts right now.</div> : null}
      </div>
      <div style={styles.actions}>
        {onOpenRepairOrders ? <button type="button" style={styles.button} onClick={onOpenRepairOrders} data-testid="management-alerts-open-ros">Open ROs</button> : null}
        {onOpenHistory ? <button type="button" style={styles.button} onClick={onOpenHistory}>Open History</button> : null}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  badge: { borderRadius: 999, background: "#e2e8f0", color: "#334155", padding: "5px 10px", fontSize: 12, fontWeight: 800 },
  grid: { display: "grid", gap: 10 },
  alert: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 },
  alertTop: { display: "flex", justifyContent: "space-between", gap: 10 },
  detail: { color: "#64748b", fontSize: 13, marginTop: 4 },
  info: { background: "#f8fafc", borderColor: "#cbd5e1" },
  warning: { background: "#fffbeb", borderColor: "#fcd34d" },
  critical: { background: "#fef2f2", borderColor: "#fecaca" },
  empty: { color: "#64748b", fontSize: 13 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  button: { border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", padding: "8px 10px", fontWeight: 700, cursor: "pointer" },
};
