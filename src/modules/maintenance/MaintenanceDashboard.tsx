import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  buildMaintenanceDashboardViewModel,
  type BuildMaintenanceDashboardViewModelResult,
  type MaintenanceDashboardCompletedItem,
  type MaintenanceDashboardUpcomingItem,
  type MaintenanceDashboardVehicleSummary,
} from "./dashboardHelpers";
import { buildSmartSuggestionItems } from "./smartSuggestionHelpers";
import {
  buildMaintenanceFollowUpQueue,
  markFollowUpReady,
  markFollowUpSkipped,
  markFollowUpSent,
  updateFollowUpNote,
  type FollowUpCustomerAccountLike,
  type FollowUpSmsLogLike,
  type MaintenanceFollowUpQueueRecord,
} from "./followUpHelpers";
import type { BackjobRecord } from "../shared/types";

type MaintenanceDashboardProps = {
  vehicles: MaintenanceDashboardVehicleSummary[];
  upcomingItems: MaintenanceDashboardUpcomingItem[];
  completedItems: MaintenanceDashboardCompletedItem[];
  backjobRecords: BackjobRecord[];
  customerAccounts: FollowUpCustomerAccountLike[];
  smsApprovalLogs: FollowUpSmsLogLike[];
  isCompactLayout: boolean;
  onOpenHistory?: () => void;
  onOpenBackjobs?: () => void;
  onSendSmsTemplate?: (payload: {
    roId: string;
    roNumber: string;
    customerId: string;
    customerName: string;
    phoneNumber: string;
    tokenId: string;
    messageType: "approval-request" | "waiting-parts" | "ready-release" | "pull-out-notice" | "oil-reminder" | "follow-up";
    messageBody: string;
  }) => Promise<{ provider: string; status: "Sent" | "Failed"; errorMessage?: string; providerResponse?: string; detail: string }>;
};

function formatMileage(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${new Intl.NumberFormat("en-US").format(value)} km`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function getStatusTone(status: MaintenanceDashboardUpcomingItem["status"]) {
  if (status === "overdue") return styles.badgeDanger;
  if (status === "dueNow") return styles.badgeInfo;
  return styles.badgeWarning;
}

function getStatusLabel(status: MaintenanceDashboardUpcomingItem["status"]) {
  if (status === "overdue") return "Overdue";
  if (status === "dueNow") return "Due Now";
  return "Due Soon";
}

function getInsightToneStyle(tone?: BuildMaintenanceDashboardViewModelResult["insights"][number]["tone"]) {
  if (tone === "critical") return styles.insightCritical;
  if (tone === "warning") return styles.insightWarning;
  if (tone === "good") return styles.insightGood;
  if (tone === "info") return styles.insightInfo;
  return styles.insightNeutral;
}

function toBarWidth(value: number, max: number) {
  if (max <= 0) return "0%";
  return `${Math.max(10, Math.round((value / max) * 100))}%`;
}

function DashboardSection({
  title,
  subtitle,
  children,
  right,
  testId,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  testId?: string;
}) {
  return (
    <section style={styles.sectionCard} data-testid={testId}>
      <div style={styles.sectionHeader}>
        <div>
          <div style={styles.sectionTitle}>{title}</div>
          {subtitle ? <div style={styles.sectionSubtitle}>{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function MaintenanceDashboard({
  vehicles,
  upcomingItems,
  completedItems,
  backjobRecords,
  customerAccounts,
  smsApprovalLogs,
  isCompactLayout,
  onOpenHistory,
  onOpenBackjobs,
  onSendSmsTemplate,
}: MaintenanceDashboardProps) {
  const viewModel = useMemo(
    () =>
      buildMaintenanceDashboardViewModel({
        upcomingItems,
        completedItems,
      }),
    [completedItems, upcomingItems]
  );
  const followUpScrollRef = useRef<HTMLDivElement | null>(null);
  const [followUpQueueRecords, setFollowUpQueueRecords] = useState<MaintenanceFollowUpQueueRecord[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("dvi_maintenance_follow_up_queue_v1") || "[]") as MaintenanceFollowUpQueueRecord[];
    } catch {
      return [];
    }
  });
  const [expandedFollowUpIds, setExpandedFollowUpIds] = useState<string[]>([]);
  const [followUpFeedback, setFollowUpFeedback] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("dvi_maintenance_follow_up_queue_v1", JSON.stringify(followUpQueueRecords));
  }, [followUpQueueRecords]);

  const followUpViewModel = useMemo(
    () =>
      buildMaintenanceFollowUpQueue({
        vehicles,
        upcomingItems,
        completedItems,
        customerAccounts,
        smsLogs: smsApprovalLogs,
        queueRecords: followUpQueueRecords,
      }),
    [completedItems, customerAccounts, followUpQueueRecords, smsApprovalLogs, upcomingItems, vehicles]
  );
  const smartSuggestionItems = useMemo(
    () =>
      buildSmartSuggestionItems({
        vehicles,
        upcomingItems,
        completedItems,
        backjobRecords,
      }),
    [backjobRecords, completedItems, upcomingItems, vehicles]
  );

  const handleQueueFromPriority = (item: MaintenanceDashboardUpcomingItem) => {
    const vehicle = vehicles.find((entry) => entry.vehicleId === item.vehicleId);
    if (!vehicle) return;
    const queueId = `follow-up:${item.vehicleId}:${item.status === "overdue" ? "overdue-maintenance" : item.status === "dueNow" ? "due-soon-maintenance" : "due-soon-maintenance"}`;
    setFollowUpQueueRecords((current) => markFollowUpReady(current, queueId));
    setFollowUpFeedback(`Queued follow-up for ${item.vehicleLabel}.`);
    followUpScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSendFollowUp = async (itemId: string) => {
    const item = followUpViewModel.items.find((row) => row.id === itemId);
    if (!item || !onSendSmsTemplate) return;
    if (!item.phoneNumber) {
      setFollowUpFeedback("No phone number is available for this vehicle.");
      return;
    }
    try {
      setFollowUpFeedback(`Sending ${item.recommendedMessageLabel}...`);
      const result = await onSendSmsTemplate({
        roId: item.roId,
        roNumber: item.roNumber,
        customerId: item.customerId,
        customerName: item.customerName,
        phoneNumber: item.phoneNumber,
        tokenId: "",
        messageType: item.recommendedMessageType,
        messageBody: item.previewBody,
      });
      if (result.status === "Sent") {
        setFollowUpQueueRecords((current) =>
          markFollowUpSent(current, item.id, {
            channel: item.recommendedChannel,
            messageType: item.recommendedMessageType,
            provider: result.provider,
            providerResponse: result.providerResponse || result.detail,
          })
        );
        setFollowUpFeedback(`Sent ${item.recommendedMessageLabel} for ${item.vehicleLabel}.`);
      } else {
        setFollowUpFeedback(result.errorMessage || result.detail || "The follow-up message could not be sent.");
      }
    } catch {
      setFollowUpFeedback("The follow-up message could not be sent.");
    }
  };

  const handleSetFollowUpReady = (itemId: string) => {
    setFollowUpQueueRecords((current) => markFollowUpReady(current, itemId));
  };

  const handleSetFollowUpSkipped = (itemId: string) => {
    setFollowUpQueueRecords((current) => markFollowUpSkipped(current, itemId));
  };

  const handleFollowUpNoteChange = (itemId: string, note: string) => {
    setFollowUpQueueRecords((current) => updateFollowUpNote(current, itemId, note));
  };

  return (
    <div style={styles.container} data-testid="maintenance-dashboard-panel">
      <div style={styles.headerCard}>
        <div>
          <div style={styles.eyebrow}>Maintenance Dashboard</div>
          <h2 style={styles.title}>Actionable maintenance visibility across active vehicles</h2>
          <p style={styles.subtitle}>
            Track what needs attention now, see recent writebacks, and jump straight into follow-up from one operational view.
          </p>
        </div>
        <div style={styles.headerMeta}>
          <div style={styles.headerMetric}>
            <span style={styles.headerMetricLabel}>Tracked Vehicles</span>
            <strong style={styles.headerMetricValue}>{vehicles.length}</strong>
          </div>
          <div style={styles.headerMetric}>
            <span style={styles.headerMetricLabel}>Upcoming Items</span>
            <strong style={styles.headerMetricValue}>{viewModel.kpis.dueNow + viewModel.kpis.dueSoon + viewModel.kpis.overdue}</strong>
          </div>
          <button type="button" style={styles.linkButton} onClick={() => followUpScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            Open Follow-Up Queue
          </button>
        </div>
      </div>

      <div style={styles.kpiGrid} data-testid="maintenance-dashboard-kpis">
        <div style={styles.kpiCard} data-testid="maintenance-dashboard-kpi-due-now">
          <div style={styles.kpiLabel}>Due Now</div>
          <div style={styles.kpiValue}>{viewModel.kpis.dueNow}</div>
          <div style={styles.kpiNote}>Needs same-day advisor attention</div>
        </div>
        <div style={styles.kpiCard} data-testid="maintenance-dashboard-kpi-overdue">
          <div style={styles.kpiLabel}>Overdue</div>
          <div style={styles.kpiValue}>{viewModel.kpis.overdue}</div>
          <div style={styles.kpiNote}>Most urgent across tracked vehicles</div>
        </div>
        <div style={styles.kpiCard} data-testid="maintenance-dashboard-kpi-due-soon">
          <div style={styles.kpiLabel}>Due Soon</div>
          <div style={styles.kpiValue}>{viewModel.kpis.dueSoon}</div>
          <div style={styles.kpiNote}>Reminder opportunities building up</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Vehicles With Active Items</div>
          <div style={styles.kpiValue}>{viewModel.kpis.vehiclesWithUpcomingItems}</div>
          <div style={styles.kpiNote}>Vehicle-scoped upcoming maintenance load</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Completed This Month</div>
          <div style={styles.kpiValue}>{viewModel.kpis.completedThisMonth}</div>
          <div style={styles.kpiNote}>Writebacks and seeded history in current month</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Recent RO Writebacks</div>
          <div style={styles.kpiValue}>{viewModel.kpis.recentWritebacks}</div>
          <div style={styles.kpiNote}>Completed service history captured in the last 7 days</div>
        </div>
      </div>

      <div style={isCompactLayout ? styles.stackedLayout : styles.twoColumnLayout}>
        <div style={styles.column}>
          <DashboardSection
            title="Smart Advisor Signals"
            subtitle="Logic-based flags for safety, soon, and monitor follow-up"
            testId="maintenance-dashboard-smart-signals"
          >
            {smartSuggestionItems.length === 0 ? (
              <div style={styles.emptyState}>No smart signals detected for the current vehicle set.</div>
            ) : (
              <div style={styles.list}>
                {smartSuggestionItems.map((item) => (
                  <div key={item.id} style={styles.listRow} data-testid={`smart-signal-item-${item.id}`}>
                    <div style={styles.listMain}>
                      <div style={styles.listTitleRow}>
                        <strong>{item.vehicleLabel}</strong>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(item.priorityTag === "Safety"
                              ? styles.badgeDanger
                              : item.priorityTag === "Soon"
                                ? styles.badgeWarning
                                : styles.badgeNeutral),
                          }}
                          data-testid={`smart-signal-tag-${item.priorityTag}`}
                        >
                          {item.priorityTag}
                        </span>
                      </div>
                      <div style={styles.listMeta}>
                        <span>{item.plateNumber || "-"}</span>
                        <span>{item.customerName}</span>
                        <span>{item.reason}</span>
                      </div>
                      <div style={styles.chipWrap}>
                        {item.tags.map((tag) => (
                          <span
                            key={`${item.id}-${tag}`}
                            style={{
                              ...styles.metaPill,
                              ...(tag === "Safety" ? styles.badgeDanger : tag === "Soon" ? styles.badgeWarning : styles.badgeNeutral),
                            }}
                            data-testid={`smart-signal-tag-${tag}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {item.repeatIssue ? <span style={{ ...styles.metaPill, ...styles.badgeInfo }} data-testid={`smart-signal-repeat-flag-${item.id}`}>Repeat Issue</span> : null}
                        {item.missedMaintenance ? <span style={{ ...styles.metaPill, ...styles.badgeInfo }} data-testid={`smart-signal-gap-flag-${item.id}`}>Maintenance Gap</span> : null}
                      </div>
                      <div style={styles.listSubtle}>{item.manualActionHint}</div>
                    </div>
                    {onOpenHistory ? (
                      <button type="button" style={styles.linkButton} onClick={onOpenHistory}>
                        {item.manualActionLabel}
                      </button>
                    ) : null}
                    {onOpenBackjobs ? (
                      <button type="button" style={styles.linkButton} onClick={onOpenBackjobs}>
                        Open Backjobs
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Priority Action List"
            subtitle="Urgent maintenance items ranked by severity first"
            testId="maintenance-dashboard-priority-list"
          >
            {viewModel.priorityItems.length === 0 ? (
              <div style={styles.emptyState}>No active maintenance actions are due right now.</div>
            ) : (
              <div style={styles.list}>
                {viewModel.priorityItems.map((item) => (
                  <div key={item.id} style={styles.listRow} data-testid={`maintenance-dashboard-priority-item-${item.id}`}>
                    <div style={styles.listMain}>
                      <div style={styles.listTitleRow}>
                        <strong>{item.title}</strong>
                        <span style={{ ...styles.statusBadge, ...getStatusTone(item.status) }}>{getStatusLabel(item.status)}</span>
                      </div>
                      <div style={styles.listMeta}>
                        <span>{item.vehicleLabel}</span>
                        <span>{item.plateNumber || "-"}</span>
                        <span>{item.category}</span>
                      </div>
                      <div style={styles.listSubtle}>{item.dueSummaryText || "Review interval history and current mileage."}</div>
                    </div>
                    {onOpenHistory ? (
                      <button type="button" style={styles.linkButton} onClick={onOpenHistory}>
                        Open Timeline
                      </button>
                    ) : null}
                    <button type="button" style={styles.linkButton} onClick={() => handleQueueFromPriority(item)} data-testid={`maintenance-dashboard-queue-follow-up-${item.id}`}>
                      Queue Follow-Up
                    </button>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Vehicles Needing Follow-Up"
            subtitle="Ranked by overdue and due-now load"
            testId="maintenance-dashboard-follow-up-vehicles"
          >
            {viewModel.followUpVehicles.length === 0 ? (
              <div style={styles.emptyState}>No vehicles currently need maintenance follow-up.</div>
            ) : (
              <div style={styles.list}>
                {viewModel.followUpVehicles.map((vehicle) => (
                  <div key={vehicle.vehicleId} style={styles.listRow}>
                    <div style={styles.listMain}>
                      <div style={styles.listTitleRow}>
                        <strong>{vehicle.vehicleLabel}</strong>
                        <span style={styles.metaPill}>{vehicle.plateNumber || "-"}</span>
                      </div>
                      <div style={styles.listMeta}>
                        <span>{vehicle.customerName || "Unknown Customer"}</span>
                        <span>{vehicle.overdueCount} overdue</span>
                        <span>{vehicle.dueNowCount} due now</span>
                      </div>
                      <div style={styles.listSubtle}>Next likely service: {vehicle.nextLikelyService || "Review timeline"}</div>
                    </div>
                    {onOpenHistory ? (
                      <button type="button" style={styles.linkButton} onClick={onOpenHistory}>
                        Open Maintenance Timeline
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Upcoming Maintenance by Status"
            subtitle="Quick severity buckets across tracked vehicles"
            testId="maintenance-dashboard-upcoming-status"
          >
            <div style={styles.statusColumns}>
              {(["overdue", "dueNow", "dueSoon"] as const).map((statusKey) => {
                const label = statusKey === "overdue" ? "Overdue" : statusKey === "dueNow" ? "Due Now" : "Due Soon";
                const items = viewModel.upcomingByStatus[statusKey];
                return (
                  <div key={statusKey} style={styles.statusColumn}>
                    <div style={styles.statusColumnHeader}>
                      <span style={{ ...styles.statusBadge, ...getStatusTone(statusKey) }}>{label}</span>
                      <strong>{items.length}</strong>
                    </div>
                    <div style={styles.statusColumnBody}>
                      {items.length === 0 ? (
                        <div style={styles.emptyMini}>No items</div>
                      ) : (
                        items.slice(0, 4).map((item) => (
                          <div key={item.id} style={styles.statusItem}>
                            <strong>{item.title}</strong>
                            <span>{item.vehicleLabel}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardSection>
        </div>

        <div style={styles.column}>
          <DashboardSection
            title="Category Breakdown"
            subtitle="Most common maintenance categories across due and completed activity"
            testId="maintenance-dashboard-category-breakdown"
          >
            {viewModel.categoryCounts.length === 0 ? (
              <div style={styles.emptyState}>No category data is available yet.</div>
            ) : (
              <div style={styles.barList}>
                {viewModel.categoryCounts.map((row) => (
                  <div key={row.category} style={styles.barRow}>
                    <div style={styles.barHeader}>
                      <span>{row.category}</span>
                      <strong>{row.count}</strong>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width: toBarWidth(row.count, viewModel.categoryCounts[0]?.count || row.count) }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Recent Completed Services"
            subtitle="Latest service history activity across vehicles"
            right={onOpenHistory ? <button type="button" style={styles.linkButton} onClick={onOpenHistory}>View History / Reports</button> : null}
            testId="maintenance-dashboard-recent-completed"
          >
            {viewModel.recentCompleted.length === 0 ? (
              <div style={styles.emptyState}>No completed service history has been recorded yet.</div>
            ) : (
              <div style={styles.list}>
                {viewModel.recentCompleted.map((item) => (
                  <div key={item.id} style={styles.listRow}>
                    <div style={styles.listMain}>
                      <div style={styles.listTitleRow}>
                        <strong>{item.title}</strong>
                        <span style={{ ...styles.statusBadge, ...styles.badgeSuccess }}>Completed</span>
                      </div>
                      <div style={styles.listMeta}>
                        <span>{item.vehicleLabel}</span>
                        <span>{item.plateNumber || "-"}</span>
                        <span>{item.repairOrderNumber || "No RO"}</span>
                      </div>
                      <div style={styles.listSubtle}>
                        {formatDate(item.completedAt)}{item.historyOrigin ? ` | ${item.historyOrigin}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Maintenance Insights"
            subtitle="Deterministic highlights pulled from current maintenance activity"
            testId="maintenance-dashboard-insights"
          >
            <div style={styles.insightList}>
              {viewModel.insights.map((insight) => (
                <div key={insight.id} style={{ ...styles.insightRow, ...getInsightToneStyle(insight.tone) }}>
                  <strong>{insight.label}</strong>
                  <span>{insight.value}</span>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>

      <div style={isCompactLayout ? styles.stackedLayout : styles.twoColumnLayout}>
        <div style={styles.column}>
          <DashboardSection
            title="Advisor Follow-Up Queue"
            subtitle="The best outbound contact opportunities today"
            testId="maintenance-dashboard-follow-up-queue"
          >
            {viewModel.advisorFollowUpQueue.length === 0 ? (
              <div style={styles.emptyState}>No follow-up queue items are available yet.</div>
            ) : (
              <div style={styles.list}>
                {viewModel.advisorFollowUpQueue.map((item) => (
                  <div key={item.id} style={styles.listRow}>
                    <div style={styles.listMain}>
                      <div style={styles.listTitleRow}>
                        <strong>{item.customerName || "Unknown Customer"}</strong>
                        <span style={{ ...styles.statusBadge, ...getStatusTone(item.status) }}>{getStatusLabel(item.status)}</span>
                      </div>
                      <div style={styles.listMeta}>
                        <span>{item.vehicleLabel}</span>
                        <span>{item.plateNumber || "-"}</span>
                      </div>
                      <div style={styles.listSubtle}>{item.reason}</div>
                      <div style={styles.listAdvice}>{item.nextActionSuggestion}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        <div style={styles.column}>
          <DashboardSection
            title="Recently Updated Vehicles"
            subtitle="Vehicles with the freshest writeback or service-history activity"
            right={
              onOpenHistory ? (
                <div style={styles.quickLinkRow}>
                  <button type="button" style={styles.linkButton} onClick={onOpenHistory} data-testid="maintenance-dashboard-open-history">
                    Go to Service Center
                  </button>
                  <button type="button" style={styles.linkButton} onClick={onOpenHistory}>
                    Go to Reports
                  </button>
                </div>
              ) : null
            }
            testId="maintenance-dashboard-recently-updated"
          >
            {viewModel.recentlyUpdatedVehicles.length === 0 ? (
              <div style={styles.emptyState}>No recently updated vehicles are available yet.</div>
            ) : (
              <div style={styles.list}>
                {viewModel.recentlyUpdatedVehicles.map((vehicle) => (
                  <div key={vehicle.vehicleId} style={styles.listRow}>
                    <div style={styles.listMain}>
                      <div style={styles.listTitleRow}>
                        <strong>{vehicle.vehicleLabel}</strong>
                        <span style={styles.metaPill}>{vehicle.plateNumber || "-"}</span>
                      </div>
                      <div style={styles.listMeta}>
                        <span>{vehicle.customerName || "Unknown Customer"}</span>
                        <span>{vehicle.overdueCount} overdue</span>
                        <span>{vehicle.dueNowCount} due now</span>
                      </div>
                      <div style={styles.listSubtle}>Next likely service: {vehicle.nextLikelyService || "Review vehicle timeline"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>
      </div>

      <div ref={followUpScrollRef} style={styles.followUpAnchor}>
        <DashboardSection
          title="Advisor Follow-Up Queue"
          subtitle="Prepare and send maintenance outreach without auto-sending by default"
          testId="maintenance-follow-up-queue-panel"
        >
          {followUpFeedback ? <div style={styles.followUpFeedback}>{followUpFeedback}</div> : null}
          {followUpViewModel.items.length === 0 ? (
            <div style={styles.emptyState}>No follow-up opportunities are available right now.</div>
          ) : (
            <div style={styles.followUpTableWrap}>
              <table style={styles.followUpTable}>
                <thead>
                  <tr>
                    <th style={styles.followUpTh}>Customer / Vehicle</th>
                    <th style={styles.followUpTh}>Reason</th>
                    <th style={styles.followUpTh}>Template</th>
                    <th style={styles.followUpTh}>Status</th>
                    <th style={styles.followUpTh}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {followUpViewModel.items.map((item) => {
                    const previewOpen = expandedFollowUpIds.includes(item.id);
                    return (
                      <tr key={item.id} data-testid={`maintenance-follow-up-item-${item.id}`}>
                        <td style={styles.followUpTd}>
                          <div style={styles.tablePrimary}>{item.customerName}</div>
                          <div style={styles.tableSecondary}>{item.vehicleLabel}</div>
                          <div style={styles.tableSecondary}>{item.plateNumber || "-"}</div>
                          <div style={styles.tableSecondary}>RO {item.roNumber || "-"}</div>
                        </td>
                        <td style={styles.followUpTd}>
                          <div style={styles.tablePrimary}>{item.reason}</div>
                          <div style={styles.tableSecondary}>{item.dueSummaryText}</div>
                          <div style={styles.tableSecondary}>{item.recommendedChannel}</div>
                        </td>
                        <td style={styles.followUpTd}>
                          <div style={styles.tablePrimary}>{item.recommendedMessageLabel}</div>
                          <div style={styles.tableSecondary}>{item.recommendedMessageType}</div>
                        </td>
                        <td style={styles.followUpTd}>
                          <span style={{ ...styles.statusBadge, ...(item.currentStatus === "sent" ? styles.badgeSuccess : item.currentStatus === "ready" ? styles.badgeInfo : item.currentStatus === "skipped" ? styles.badgeNeutral : styles.badgeWarning) }} data-testid={`maintenance-follow-up-status-${item.id}`}>
                            {item.currentStatusLabel}
                          </span>
                          <div style={styles.tableSecondary}>{item.lastSentAt ? `Last sent ${item.lastSentAt.slice(0, 10)}` : "Not sent yet"}</div>
                        </td>
                        <td style={styles.followUpTd}>
                          <div style={styles.inlineActions}>
                            <button type="button" style={styles.smallButton} onClick={() => setExpandedFollowUpIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} data-testid={`maintenance-follow-up-preview-${item.id}`}>
                              {previewOpen ? "Hide Preview" : "Preview Message"}
                            </button>
                            <button type="button" style={styles.smallButtonSuccess} onClick={() => handleSetFollowUpReady(item.id)} data-testid={`maintenance-follow-up-ready-${item.id}`}>
                              Mark Ready
                            </button>
                            <button type="button" style={styles.smallButton} disabled={!onSendSmsTemplate} onClick={() => handleSendFollowUp(item.id)} data-testid={`maintenance-follow-up-send-${item.id}`}>
                              Send SMS
                            </button>
                            <button type="button" style={styles.smallButtonDanger} onClick={() => handleSetFollowUpSkipped(item.id)} data-testid={`maintenance-follow-up-skip-${item.id}`}>
                              Skip
                            </button>
                          </div>
                          <textarea
                            style={styles.textarea}
                            value={item.note}
                            onChange={(e) => handleFollowUpNoteChange(item.id, e.target.value)}
                            placeholder="Advisor note"
                            data-testid={`maintenance-follow-up-note-${item.id}`}
                          />
                          {previewOpen ? (
                            <div style={styles.followUpPreview}>
                              <div style={styles.formHint}>Message preview</div>
                              <pre style={styles.followUpPreviewText}>{item.previewBody}</pre>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "grid",
    gap: 16,
  },
  headerCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    borderRadius: 20,
    border: "1px solid #dbe5f1",
    background: "linear-gradient(135deg, #ffffff 0%, #f6f9fc 100%)",
    padding: 20,
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#2563eb",
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  },
  subtitle: {
    margin: "8px 0 0",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#475569",
    maxWidth: 760,
  },
  headerMeta: {
    display: "grid",
    gap: 12,
    minWidth: 220,
    alignContent: "start",
  },
  headerMetric: {
    borderRadius: 16,
    padding: "12px 14px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  },
  headerMetricLabel: {
    display: "block",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#2563eb",
    marginBottom: 6,
  },
  headerMetricValue: {
    fontSize: 24,
    color: "#0f172a",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  kpiCard: {
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    padding: "16px 18px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
  },
  kpiLabel: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 30,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.1,
  },
  kpiNote: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 1.5,
    color: "#64748b",
  },
  twoColumnLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.45fr) minmax(320px, 0.95fr)",
    gap: 16,
    alignItems: "start",
  },
  stackedLayout: {
    display: "grid",
    gap: 16,
  },
  column: {
    display: "grid",
    gap: 16,
  },
  sectionCard: {
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    padding: 18,
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  list: {
    display: "grid",
    gap: 12,
  },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: 14,
    flexWrap: "wrap",
  },
  listMain: {
    display: "grid",
    gap: 8,
    flex: 1,
    minWidth: 220,
  },
  listTitleRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  listMeta: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    fontSize: 12,
    color: "#475569",
  },
  listSubtle: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.5,
  },
  listAdvice: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid transparent",
  },
  badgeDanger: {
    background: "#fef2f2",
    color: "#b91c1c",
    borderColor: "#fecaca",
  },
  badgeInfo: {
    background: "#fff7ed",
    color: "#c2410c",
    borderColor: "#fed7aa",
  },
  badgeWarning: {
    background: "#fefce8",
    color: "#a16207",
    borderColor: "#fde68a",
  },
  badgeNeutral: {
    background: "#f8fafc",
    color: "#475569",
    borderColor: "#e2e8f0",
  },
  badgeSuccess: {
    background: "#ecfdf5",
    color: "#15803d",
    borderColor: "#bbf7d0",
  },
  metaPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
  },
  linkButton: {
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 700,
    padding: "10px 12px",
    cursor: "pointer",
  },
  smallButton: {
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 10px",
    cursor: "pointer",
  },
  smallButtonSuccess: {
    borderRadius: 10,
    border: "1px solid #bbf7d0",
    background: "#ecfdf5",
    color: "#15803d",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 10px",
    cursor: "pointer",
  },
  smallButtonDanger: {
    borderRadius: 10,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 10px",
    cursor: "pointer",
  },
  inlineActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  textarea: {
    width: "100%",
    minHeight: 72,
    resize: "vertical",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    padding: "10px 12px",
    fontSize: 13,
    color: "#0f172a",
    marginTop: 10,
  },
  tablePrimary: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  tableSecondary: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  formHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 1.5,
    color: "#64748b",
  },
  statusColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  statusColumn: {
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: 12,
    display: "grid",
    gap: 10,
  },
  statusColumnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  statusColumnBody: {
    display: "grid",
    gap: 8,
  },
  statusItem: {
    display: "grid",
    gap: 4,
    fontSize: 13,
    color: "#334155",
  },
  barList: {
    display: "grid",
    gap: 10,
  },
  barRow: {
    display: "grid",
    gap: 8,
  },
  barHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 13,
    color: "#334155",
  },
  barTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
  },
  insightList: {
    display: "grid",
    gap: 10,
  },
  insightRow: {
    display: "grid",
    gap: 6,
    borderRadius: 14,
    padding: 14,
    border: "1px solid transparent",
    fontSize: 13,
    lineHeight: 1.6,
  },
  insightNeutral: {
    background: "#f8fafc",
    borderColor: "#e2e8f0",
    color: "#334155",
  },
  insightInfo: {
    background: "#eff6ff",
    borderColor: "#bfdbfe",
    color: "#1d4ed8",
  },
  insightWarning: {
    background: "#fefce8",
    borderColor: "#fde68a",
    color: "#a16207",
  },
  insightCritical: {
    background: "#fef2f2",
    borderColor: "#fecaca",
    color: "#b91c1c",
  },
  insightGood: {
    background: "#ecfdf5",
    borderColor: "#bbf7d0",
    color: "#15803d",
  },
  quickLinkRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  emptyState: {
    borderRadius: 14,
    border: "1px dashed #cbd5e1",
    background: "#f8fafc",
    padding: 16,
    color: "#64748b",
    fontSize: 13,
  },
  emptyMini: {
    color: "#64748b",
    fontSize: 12,
  },
  followUpAnchor: {
    marginTop: 4,
  },
  followUpFeedback: {
    borderRadius: 14,
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "12px 14px",
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 1.5,
  },
  followUpTableWrap: {
    overflowX: "auto",
  },
  followUpTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 920,
  },
  followUpTh: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
  },
  followUpTd: {
    verticalAlign: "top",
    padding: "14px 12px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 13,
  },
  followUpPreview: {
    marginTop: 12,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: 12,
  },
  followUpPreviewText: {
    whiteSpace: "pre-wrap",
    margin: "8px 0 0",
    fontFamily: "inherit",
    fontSize: 12,
    lineHeight: 1.6,
    color: "#334155",
  },
};
