import React, { useMemo } from "react";
import { buildAdvisorActionCenterViewModel, type AdvisorActionCenterAiDraftItem, type AdvisorActionCenterMaintenanceItem, type AdvisorActionCenterRepairOrderItem } from "./advisorActionCenterHelpers";
import type { OpenAiAssistLogEntry } from "../ai/openaiAssist";
import type { MaintenanceDashboardUpcomingItem } from "../maintenance/dashboardHelpers";
import type { RepairOrderRecord } from "../shared/types";

type AdvisorActionCenterProps = {
  repairOrders: RepairOrderRecord[];
  upcomingItems: MaintenanceDashboardUpcomingItem[];
  openAiAssistLogs?: OpenAiAssistLogEntry[];
  onOpenRepairOrders: () => void;
  onOpenHistory: () => void;
  onOpenBackjobs?: () => void;
};

function SectionCard({
  title,
  count,
  children,
  testId,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <section style={styles.sectionCard} data-testid={testId}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitleRow}>
          <h3 style={styles.sectionTitle}>{title}</h3>
          <span style={styles.sectionCount}>{count}</span>
        </div>
      </div>
      {children}
    </section>
  );
}

function ItemRow({
  item,
  actionLabel,
  onAction,
  testId,
}: {
  item: AdvisorActionCenterRepairOrderItem | AdvisorActionCenterMaintenanceItem | AdvisorActionCenterAiDraftItem;
  actionLabel: string;
  onAction: () => void;
  testId: string;
}) {
  const isAiDraft = "providerLabel" in item;
  const title = isAiDraft
    ? item.actionType
    : "roNumber" in item
      ? item.roNumber
      : "serviceTitle" in item
        ? item.serviceTitle
        : "Item";
  return (
    <div style={styles.itemRow} data-testid={testId}>
      <div style={styles.itemMain}>
        <strong>{title}</strong>
        <div style={styles.itemMeta}>
          {"customerName" in item ? <span>{item.customerName || "-"}</span> : null}
          {"vehicleLabel" in item ? <span>{item.vehicleLabel}</span> : null}
          {"plateNumber" in item ? <span>{item.plateNumber || "-"}</span> : null}
          {"serviceTitle" in item ? <span>{item.serviceTitle}</span> : null}
          {"status" in item && !isAiDraft ? <span>{item.status}</span> : null}
          {"sourceModule" in item ? <span>{item.sourceModule}</span> : null}
        </div>
        <div style={styles.itemReason}>
          {"reason" in item ? item.reason : "AI draft needs review before use."}
        </div>
        {isAiDraft ? <div style={styles.itemHint}>{item.providerLabel}</div> : null}
        {"warningReason" in item && item.warningReason ? <div style={styles.itemHint}>{item.warningReason}</div> : null}
      </div>
      <button type="button" style={styles.actionButton} onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}

export function AdvisorActionCenter({
  repairOrders,
  upcomingItems,
  openAiAssistLogs,
  onOpenRepairOrders,
  onOpenHistory,
  onOpenBackjobs,
}: AdvisorActionCenterProps) {
  const storedAiLogs = React.useMemo(() => {
    if (openAiAssistLogs) return openAiAssistLogs;
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("dvi_openai_assist_logs_v1") || "[]") as OpenAiAssistLogEntry[];
    } catch {
      return [];
    }
  }, [openAiAssistLogs]);
  const viewModel = useMemo(
    () =>
      buildAdvisorActionCenterViewModel({
        repairOrders,
        upcomingItems,
        openAiAssistLogs: storedAiLogs,
      }),
    [repairOrders, storedAiLogs, upcomingItems]
  );

  return (
    <div style={styles.container} data-testid="advisor-action-center-panel">
      <div style={styles.heroCard}>
        <div>
          <div style={styles.eyebrow}>Advisor Daily Action Center</div>
          <h2 style={styles.heroTitle}>Today&apos;s operational tasks in one place</h2>
          <p style={styles.heroText}>
            Keep approvals, parts, QC, release, follow-ups, and AI drafts visible so advisors can move work forward without hunting through modules.
          </p>
        </div>
        <div style={styles.heroPills}>
          <span style={styles.heroPill} data-testid="advisor-action-center-count-waiting-approvals">Waiting Approvals: {viewModel.summary.waitingApprovals}</span>
          <span style={styles.heroPill} data-testid="advisor-action-center-count-waiting-parts">Waiting Parts: {viewModel.summary.waitingParts}</span>
          <span style={styles.heroPill} data-testid="advisor-action-center-count-ready-qc">Ready for QC: {viewModel.summary.readyForQc}</span>
          <span style={styles.heroPill} data-testid="advisor-action-center-count-ready-release">Ready for Release: {viewModel.summary.readyForRelease}</span>
          <span style={styles.heroPill} data-testid="advisor-action-center-count-overdue-followups">Overdue Follow-Ups: {viewModel.summary.overdueFollowUps}</span>
          <span style={styles.heroPill} data-testid="advisor-action-center-count-ai-review">AI Drafts to Review: {viewModel.summary.aiDraftsNeedingReview}</span>
          <span style={styles.heroPill} data-testid="advisor-action-center-count-due-contacts">Maintenance Due Contacts: {viewModel.summary.maintenanceDueContacts}</span>
        </div>
      </div>

      <div style={styles.grid}>
        <SectionCard title="Waiting Approvals" count={viewModel.summary.waitingApprovals} testId="advisor-action-center-waiting-approvals">
          {viewModel.waitingApprovals.length === 0 ? <div style={styles.emptyState}>No approvals are waiting right now.</div> : viewModel.waitingApprovals.slice(0, 5).map((item) => <ItemRow key={item.id} item={item} testId={`advisor-action-center-approval-${item.id}`} actionLabel="Open RO" onAction={onOpenRepairOrders} />)}
        </SectionCard>

        <SectionCard title="Waiting Parts" count={viewModel.summary.waitingParts} testId="advisor-action-center-waiting-parts">
          {viewModel.waitingParts.length === 0 ? <div style={styles.emptyState}>No jobs are waiting on parts.</div> : viewModel.waitingParts.slice(0, 5).map((item) => <ItemRow key={item.id} item={item} testId={`advisor-action-center-parts-${item.id}`} actionLabel="Open RO" onAction={onOpenRepairOrders} />)}
        </SectionCard>

        <SectionCard title="Ready for QC" count={viewModel.summary.readyForQc} testId="advisor-action-center-ready-qc">
          {viewModel.readyForQc.length === 0 ? <div style={styles.emptyState}>No jobs are queued for QC yet.</div> : viewModel.readyForQc.slice(0, 5).map((item) => <ItemRow key={item.id} item={item} testId={`advisor-action-center-qc-${item.id}`} actionLabel="Open RO" onAction={onOpenRepairOrders} />)}
        </SectionCard>

        <SectionCard title="Ready for Release" count={viewModel.summary.readyForRelease} testId="advisor-action-center-ready-release">
          {viewModel.readyForRelease.length === 0 ? <div style={styles.emptyState}>No jobs are ready for release yet.</div> : viewModel.readyForRelease.slice(0, 5).map((item) => <ItemRow key={item.id} item={item} testId={`advisor-action-center-release-${item.id}`} actionLabel="Open RO" onAction={onOpenRepairOrders} />)}
        </SectionCard>

        <SectionCard title="Overdue Follow-Ups" count={viewModel.summary.overdueFollowUps} testId="advisor-action-center-overdue-followups">
          {viewModel.overdueFollowUps.length === 0 ? <div style={styles.emptyState}>No overdue follow-ups are waiting.</div> : viewModel.overdueFollowUps.slice(0, 5).map((item) => <ItemRow key={item.id} item={item} testId={`advisor-action-center-followup-${item.id}`} actionLabel="Open Timeline" onAction={onOpenHistory} />)}
        </SectionCard>

        <SectionCard title="AI Drafts Needing Review" count={viewModel.summary.aiDraftsNeedingReview} testId="advisor-action-center-ai-review">
          {viewModel.aiDraftsNeedingReview.length === 0 ? <div style={styles.emptyState}>No AI drafts need review right now.</div> : viewModel.aiDraftsNeedingReview.slice(0, 5).map((item) => <ItemRow key={item.id} item={item} testId={`advisor-action-center-ai-${item.id}`} actionLabel="Open Repair Orders" onAction={onOpenRepairOrders} />)}
        </SectionCard>

        <SectionCard title="Maintenance Due Contacts" count={viewModel.summary.maintenanceDueContacts} testId="advisor-action-center-due-contacts">
          {viewModel.maintenanceDueContacts.length === 0 ? <div style={styles.emptyState}>No due contacts are waiting today.</div> : viewModel.maintenanceDueContacts.slice(0, 5).map((item) => <ItemRow key={item.id} item={item} testId={`advisor-action-center-due-${item.id}`} actionLabel="Open Timeline" onAction={onOpenHistory} />)}
        </SectionCard>
      </div>

      {onOpenBackjobs ? (
        <div style={styles.footerActions}>
          <button type="button" style={styles.footerButton} onClick={onOpenBackjobs}>
            Open Backjobs
          </button>
        </div>
      ) : null}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "grid",
    gap: 16,
  },
  heroCard: {
    borderRadius: 18,
    border: "1px solid #dbe5f1",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    padding: 20,
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
    display: "grid",
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#2563eb",
    fontWeight: 800,
    marginBottom: 8,
  },
  heroTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  },
  heroText: {
    margin: "8px 0 0",
    color: "#475569",
    lineHeight: 1.6,
  },
  heroPills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  heroPill: {
    borderRadius: 999,
    padding: "6px 10px",
    background: "#e2e8f0",
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14,
  },
  sectionCard: {
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    background: "#fff",
    padding: 16,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
    display: "grid",
    gap: 12,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
  },
  sectionCount: {
    borderRadius: 999,
    padding: "2px 8px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 800,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: 12,
  },
  itemMain: {
    display: "grid",
    gap: 4,
    minWidth: 0,
  },
  itemMeta: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    color: "#64748b",
    fontSize: 12,
  },
  itemReason: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.5,
  },
  itemHint: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 1.4,
  },
  actionButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 10,
    padding: "8px 10px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  emptyState: {
    borderRadius: 12,
    border: "1px dashed #cbd5e1",
    padding: 14,
    color: "#64748b",
    background: "#f8fafc",
  },
  footerActions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  footerButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
};
