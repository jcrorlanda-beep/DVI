import React, { useMemo } from "react";
import type { PartsRequestRecord, RepairOrderRecord, UserAccount } from "../shared/types";

type Props = {
  repairOrders: RepairOrderRecord[];
  users: UserAccount[];
  partsRequests: PartsRequestRecord[];
  isCompactLayout: boolean;
};

type PipelineStage = {
  id: string;
  title: string;
  subtitle: string;
  items: RepairOrderRecord[];
};

function vehicleLabel(ro: RepairOrderRecord) {
  return [ro.year, ro.make, ro.model].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Vehicle";
}

function getAdvisorName(ro: RepairOrderRecord, users: UserAccount[]) {
  return ro.advisorName || users.find((user) => user.id === ro.encodedBy)?.fullName || "Unassigned";
}

function hasPartsRequest(ro: RepairOrderRecord, partsRequests: PartsRequestRecord[]) {
  return partsRequests.some((request) => request.roId === ro.id);
}

export function AdvisorPipelinePanel({ repairOrders, users, partsRequests, isCompactLayout }: Props) {
  const stages = useMemo<PipelineStage[]>(() => {
    const activeRos = repairOrders.filter((ro) => !["Released", "Closed"].includes(ro.status));
    return [
      {
        id: "intake-review",
        title: "Intake / Inspection",
        subtitle: "Needs advisor review before estimate or approval",
        items: activeRos.filter((ro) => ["Draft", "Waiting Inspection"].includes(ro.status)),
      },
      {
        id: "estimate-approval",
        title: "Estimate / Approval",
        subtitle: "Customer decision or estimate follow-up needed",
        items: activeRos.filter((ro) => ro.status === "Waiting Approval"),
      },
      {
        id: "parts-watch",
        title: "Parts Watch",
        subtitle: "Waiting parts or supplier movement",
        items: activeRos.filter((ro) => ro.status === "Waiting Parts" || hasPartsRequest(ro, partsRequests)),
      },
      {
        id: "production",
        title: "Production",
        subtitle: "Approved jobs moving through the shop",
        items: activeRos.filter((ro) => ["Approved / Ready to Work", "In Progress", "Quality Check"].includes(ro.status)),
      },
      {
        id: "release-ready",
        title: "Release Ready",
        subtitle: "Ready for customer handover",
        items: activeRos.filter((ro) => ro.status === "Ready Release"),
      },
    ];
  }, [partsRequests, repairOrders]);

  const advisorCounts = useMemo(() => {
    const counts = new Map<string, number>();
    stages.flatMap((stage) => stage.items).forEach((ro) => {
      const advisor = getAdvisorName(ro, users);
      counts.set(advisor, (counts.get(advisor) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [stages, users]);

  return (
    <section style={styles.panel} data-testid="advisor-pipeline-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Service Advisor Pipeline</div>
          <h2 style={styles.title}>Advisor work queue</h2>
          <div style={styles.subtitle}>Read-only pipeline for approvals, parts watch, production, and release readiness.</div>
        </div>
        <span style={styles.badge}>{stages.reduce((sum, stage) => sum + stage.items.length, 0)} active item(s)</span>
      </div>

      <div style={{ ...styles.grid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(5, minmax(180px, 1fr))" }}>
        {stages.map((stage) => (
          <div key={stage.id} style={styles.stage} data-testid={`advisor-pipeline-stage-${stage.id}`}>
            <div style={styles.stageHeader}>
              <strong>{stage.title}</strong>
              <span style={styles.count}>{stage.items.length}</span>
            </div>
            <div style={styles.stageSubtitle}>{stage.subtitle}</div>
            {stage.items.length ? stage.items.slice(0, 5).map((ro) => (
              <article key={ro.id} style={styles.card} data-testid={`advisor-pipeline-card-${ro.id}`}>
                <strong>{ro.roNumber}</strong>
                <div style={styles.meta}>{vehicleLabel(ro)} / {ro.plateNumber || ro.conductionNumber || "-"}</div>
                <div style={styles.meta}>{ro.customerName || ro.companyName || "Customer"}</div>
                <div style={styles.meta}>Advisor: {getAdvisorName(ro, users)}</div>
                <span style={styles.status}>{ro.status}</span>
              </article>
            )) : <div style={styles.empty}>No current items.</div>}
          </div>
        ))}
      </div>

      <div style={styles.footer} data-testid="advisor-pipeline-advisor-load">
        {advisorCounts.length ? advisorCounts.map(([advisor, count]) => (
          <span key={advisor} style={styles.loadPill}>{advisor}: {count}</span>
        )) : <span style={styles.meta}>No advisor workload to display.</span>}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 4 },
  badge: { borderRadius: 999, padding: "6px 10px", background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 800 },
  grid: { display: "grid", gap: 10 },
  stage: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc", minHeight: 170 },
  stageHeader: { display: "flex", justifyContent: "space-between", gap: 8, color: "#0f172a" },
  stageSubtitle: { color: "#64748b", fontSize: 12, lineHeight: 1.4, marginTop: 4, marginBottom: 8 },
  count: { borderRadius: 999, padding: "3px 8px", background: "#e2e8f0", color: "#334155", fontSize: 12, fontWeight: 800 },
  card: { display: "grid", gap: 4, border: "1px solid #dbe4ee", borderRadius: 8, padding: 10, background: "#fff", marginBottom: 8 },
  meta: { color: "#64748b", fontSize: 12, lineHeight: 1.4 },
  status: { justifySelf: "start", borderRadius: 999, padding: "4px 8px", background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 800 },
  empty: { color: "#94a3b8", fontSize: 12, padding: "10px 2px" },
  footer: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  loadPill: { border: "1px solid #e2e8f0", borderRadius: 999, padding: "6px 10px", background: "#fff", color: "#334155", fontSize: 12, fontWeight: 700 },
};
