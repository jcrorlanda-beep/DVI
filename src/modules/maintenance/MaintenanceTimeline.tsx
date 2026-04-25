import React, { useEffect, useMemo, useState } from "react";
import { type MaintenanceInsight, type TimelineCompletedItem, type TimelineCounts, type TimelineFiltersState, type TimelineGroupMode, type TimelineLatestCompletedItem, type TimelineSortMode, type TimelineUpcomingItem, type TimelineVehicleSummary } from "./maintenanceHelpers";
import { buildMaintenanceTimelineViewModel } from "./timelineHelpers";

export type MaintenanceTimelineProps = {
  vehicle: TimelineVehicleSummary;
  upcomingItems: TimelineUpcomingItem[];
  completedItems: TimelineCompletedItem[];
  filters: TimelineFiltersState;
  counts: TimelineCounts;
  latestCompleted: TimelineLatestCompletedItem[];
  insights: MaintenanceInsight[];
  loading?: boolean;
  emptyStateText?: string;

  onFiltersChange: (next: TimelineFiltersState) => void;
  onAddToRecommendation: (item: TimelineUpcomingItem) => void;
  onAddToWorkLine: (item: TimelineUpcomingItem) => void;
  onDismiss: (item: TimelineUpcomingItem) => void;
  onViewRepairOrder?: (repairOrderNumber: string) => void;
};

export type MaintenanceTimelineHeaderProps = {
  vehicle: TimelineVehicleSummary;
  counts: TimelineCounts;
  helperText?: string;
};

export type MaintenanceTimelineToolbarProps = {
  filters: TimelineFiltersState;
  categoryOptions: string[];
  onChange: (next: TimelineFiltersState) => void;
};

export type MaintenanceTimelineLayoutProps = {
  feed: React.ReactNode;
  sidebar: React.ReactNode;
};

export type MaintenanceTimelineFeedProps = {
  upcomingItems: TimelineUpcomingItem[];
  completedItems: TimelineCompletedItem[];
  onAddToRecommendation: (item: TimelineUpcomingItem) => void;
  onAddToWorkLine: (item: TimelineUpcomingItem) => void;
  onDismiss: (item: TimelineUpcomingItem) => void;
  onViewRepairOrder?: (repairOrderNumber: string) => void;
  emptyStateText?: string;
};

export type TimelineSectionHeaderProps = {
  title: string;
  subtitle?: string;
  count?: number;
};

export type UpcomingMaintenanceListProps = {
  items: TimelineUpcomingItem[];
  onAddToRecommendation: (item: TimelineUpcomingItem) => void;
  onAddToWorkLine: (item: TimelineUpcomingItem) => void;
  onDismiss: (item: TimelineUpcomingItem) => void;
};

export type UpcomingMaintenanceCardProps = {
  item: TimelineUpcomingItem;
  onAddToRecommendation: (item: TimelineUpcomingItem) => void;
  onAddToWorkLine: (item: TimelineUpcomingItem) => void;
  onDismiss: (item: TimelineUpcomingItem) => void;
  defaultWhyExpanded?: boolean;
};

export type CompletedHistoryListProps = {
  items: TimelineCompletedItem[];
  onViewRepairOrder?: (repairOrderNumber: string) => void;
};

export type CompletedHistoryCardProps = {
  item: TimelineCompletedItem;
  onViewRepairOrder?: (repairOrderNumber: string) => void;
};

export type MaintenanceTimelineSidebarProps = {
  counts: TimelineCounts;
  latestCompleted: TimelineLatestCompletedItem[];
  insights: MaintenanceInsight[];
  onViewRepairOrder?: (repairOrderNumber: string) => void;
};

export type DueSummaryCardProps = {
  counts: TimelineCounts;
};

export type LatestCompletedCardProps = {
  items: TimelineLatestCompletedItem[];
  onViewRepairOrder?: (repairOrderNumber: string) => void;
};

export type MaintenanceInsightCardProps = {
  insights: MaintenanceInsight[];
};

export type StatusBadgeProps = {
  status: TimelineUpcomingItem["status"] | TimelineCompletedItem["status"];
  label?: string;
};

export type MetaPill = {
  id: string;
  label: string;
  tone?: "default" | "info" | "success" | "warning" | "danger" | "indigo";
};

export type MetaPillRowProps = {
  pills: MetaPill[];
};

export type DueSummaryRowProps = {
  text: string;
  status: "dueSoon" | "dueNow" | "overdue";
};

export type CompletedDetailsRowProps = {
  completedAt: string;
  odometerAtCompletion?: number | null;
  technicianName?: string;
  sourceLabel?: string;
};

export type TimelineActionRowProps = {
  item: TimelineUpcomingItem;
  onAddToRecommendation: (item: TimelineUpcomingItem) => void;
  onAddToWorkLine: (item: TimelineUpcomingItem) => void;
  onDismiss: (item: TimelineUpcomingItem) => void;
};

export type WhyShowingPanelProps = {
  lines: string[];
  open: boolean;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatMileage(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function getStatusLabel(status: TimelineUpcomingItem["status"] | TimelineCompletedItem["status"]) {
  if (status === "dueSoon") return "Due Soon";
  if (status === "dueNow") return "Due Now";
  if (status === "overdue") return "Overdue";
  return "Completed";
}

function getStatusStyle(status: TimelineUpcomingItem["status"] | TimelineCompletedItem["status"]) {
  if (status === "dueSoon") return styles.statusWarning;
  if (status === "dueNow") return styles.statusInfo;
  if (status === "overdue") return styles.statusDanger;
  return styles.statusOk;
}

function getToneStyle(tone: MetaPill["tone"] = "default") {
  if (tone === "info") return styles.tagInfo;
  if (tone === "success") return styles.tagSuccess;
  if (tone === "warning") return styles.tagWarning;
  if (tone === "danger") return styles.tagDanger;
  if (tone === "indigo") return styles.tagIndigo;
  return styles.tagNeutral;
}

function getChipTestId(value: TimelineFiltersState["mode"]) {
  return value === "dueSoon"
    ? "due-soon"
    : value === "dueNow"
      ? "due-now"
      : value === "all"
        ? "all"
        : value;
}

function getVehicleLabel(vehicle: TimelineVehicleSummary) {
  const year = vehicle.year ? String(vehicle.year) : "";
  return [year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Unknown Vehicle";
}

export function MaintenanceTimeline({
  vehicle,
  upcomingItems,
  completedItems,
  filters,
  counts,
  latestCompleted,
  insights,
  loading = false,
  emptyStateText = "No maintenance timeline items are available for this vehicle.",
  onFiltersChange,
  onAddToRecommendation,
  onAddToWorkLine,
  onDismiss,
  onViewRepairOrder,
}: MaintenanceTimelineProps) {
  const viewModel = useMemo(
    () =>
      buildMaintenanceTimelineViewModel({
        vehicle,
        upcomingItems,
        completedItems,
        filters,
      }),
    [vehicle, upcomingItems, completedItems, filters]
  );

  return (
    <div style={styles.panel} data-testid="vehicle-maintenance-timeline-panel">
      <div style={styles.panelHeaderRow}>
        <div>
          <div style={styles.sectionTitle}>Vehicle Maintenance Timeline</div>
          <div style={styles.formHint}>AutoLeap-style vehicle feed with completed service history and upcoming maintenance suggestions.</div>
        </div>
        <span style={styles.statusInfo}>
          {counts.completed} completed | {counts.totalUpcoming} upcoming
        </span>
      </div>

      {loading ? (
        <div style={styles.emptyState}>{emptyStateText}</div>
      ) : !vehicle.vehicleId ? (
        <div style={styles.emptyState}>{emptyStateText}</div>
      ) : (
        <div style={styles.panelInner}>
          <MaintenanceTimelineHeader
            vehicle={vehicle}
            counts={counts}
            helperText="Combined completed service history and upcoming maintenance items for the selected vehicle."
          />

          <MaintenanceTimelineToolbar filters={filters} categoryOptions={viewModel.categoryOptions} onChange={onFiltersChange} />

          <div style={styles.timelineChipRow}>
            {(["all", "upcoming", "completed", "dueNow", "dueSoon", "overdue"] as TimelineFiltersState["mode"][]).map((chip) => (
              <button
                key={chip}
                type="button"
                style={{
                  ...styles.smallButtonMuted,
                  ...(filters.mode === chip ? styles.smallButtonActive : {}),
                }}
                onClick={() => onFiltersChange({ ...filters, mode: chip })}
                data-testid={`vehicle-maintenance-timeline-chip-${getChipTestId(chip)}`}
              >
                {chip === "all"
                  ? "All"
                  : chip === "upcoming"
                    ? "Upcoming"
                    : chip === "completed"
                      ? "Completed"
                      : chip === "dueNow"
                        ? "Due Now"
                        : chip === "dueSoon"
                          ? "Due Soon"
                          : "Overdue"}
              </button>
            ))}
          </div>

          {viewModel.filteredUpcomingItems.length === 0 && viewModel.filteredCompletedItems.length === 0 ? (
            <div style={styles.emptyState}>{emptyStateText}</div>
          ) : (
            <MaintenanceTimelineLayout
              feed={
                <MaintenanceTimelineFeed
                  upcomingItems={viewModel.filteredUpcomingItems}
                  completedItems={viewModel.filteredCompletedItems}
                  onAddToRecommendation={onAddToRecommendation}
                  onAddToWorkLine={onAddToWorkLine}
                  onDismiss={onDismiss}
                  onViewRepairOrder={onViewRepairOrder}
                  emptyStateText={emptyStateText}
                />
              }
              sidebar={
                <MaintenanceTimelineSidebar
                  counts={counts}
                  latestCompleted={latestCompleted}
                  insights={insights}
                  onViewRepairOrder={onViewRepairOrder}
                />
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

export function MaintenanceTimelineHeader({ vehicle, counts, helperText }: MaintenanceTimelineHeaderProps) {
  const vehicleLabel = getVehicleLabel(vehicle);

  return (
    <div style={styles.timelineHeaderCard} data-testid="maintenance-timeline-header">
      <div style={styles.timelineHeaderTop}>
        <div>
          <div style={styles.sectionTitle}>Vehicle Maintenance Timeline</div>
          <div style={styles.formHint}>{helperText}</div>
        </div>
        <div style={styles.timelineHeaderPills}>
          <span style={styles.statusOk}>{counts.completed} completed history</span>
          <span style={styles.statusInfo}>{counts.dueNow} due now</span>
          <span style={styles.statusWarning}>{counts.dueSoon} due soon</span>
          <span style={styles.statusDanger}>{counts.overdue} overdue</span>
        </div>
      </div>

      <div style={styles.timelineHeaderGrid}>
        <div style={styles.timelineHeaderMetaCard}>
          <div style={styles.reportStatLabel}>Vehicle</div>
          <div style={styles.timelineHeaderMetaValue}>{vehicleLabel}</div>
          <div style={styles.formHint}>{vehicle.plateNumber || vehicle.vehicleId}</div>
        </div>
        <div style={styles.timelineHeaderMetaCard}>
          <div style={styles.reportStatLabel}>Customer</div>
          <div style={styles.timelineHeaderMetaValue}>{vehicle.customerName || "Unknown Customer"}</div>
          <div style={styles.formHint}>{vehicle.vehicleId}</div>
        </div>
        <div style={styles.timelineHeaderMetaCard}>
          <div style={styles.reportStatLabel}>Current KM</div>
          <div style={styles.timelineHeaderMetaValue}>{formatMileage(vehicle.currentMileage)}</div>
          <div style={styles.formHint}>Selected vehicle odometer</div>
        </div>
      </div>
    </div>
  );
}

export function MaintenanceTimelineToolbar({ filters, categoryOptions, onChange }: MaintenanceTimelineToolbarProps) {
  return (
    <div style={styles.timelineToolbar} data-testid="maintenance-timeline-toolbar">
      <div style={styles.formGroup}>
        <label style={styles.label}>Search</label>
        <input
          data-testid="vehicle-maintenance-timeline-search"
          style={styles.input}
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Title, service key, RO, category"
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Category</label>
        <select
          data-testid="vehicle-maintenance-timeline-filter-category"
          style={styles.select}
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Sort</label>
        <select
          data-testid="vehicle-maintenance-timeline-sort"
          style={styles.select}
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as TimelineSortMode })}
        >
          <option value="priorityFirst">Priority First</option>
          <option value="newestActivity">Newest Activity</option>
          <option value="oldestFirst">Oldest First</option>
        </select>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Group by</label>
        <select
          data-testid="vehicle-maintenance-timeline-group-by"
          style={styles.select}
          value={filters.groupBy}
          onChange={(e) => onChange({ ...filters, groupBy: e.target.value as TimelineGroupMode })}
        >
          <option value="none">None</option>
          <option value="status">Status</option>
          <option value="category">Category</option>
        </select>
      </div>
    </div>
  );
}

export function MaintenanceTimelineLayout({ feed, sidebar }: MaintenanceTimelineLayoutProps) {
  const [isCompactLayout, setIsCompactLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 960;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsCompactLayout(window.innerWidth < 960);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        ...styles.timelineLayout,
        gridTemplateColumns: isCompactLayout ? "minmax(0, 1fr)" : "minmax(0, 2fr) minmax(280px, 0.9fr)",
      }}
    >
      {feed}
      {sidebar}
    </div>
  );
}

export function MaintenanceTimelineFeed({
  upcomingItems,
  completedItems,
  onAddToRecommendation,
  onAddToWorkLine,
  onDismiss,
  onViewRepairOrder,
  emptyStateText,
}: MaintenanceTimelineFeedProps) {
  return (
    <div style={styles.timelineFeed} data-testid="maintenance-suggestions-panel">
      {upcomingItems.length > 0 ? (
        <div style={styles.formStack}>
          <TimelineSectionHeader title="Upcoming Maintenance" subtitle="Manual-only maintenance suggestions, sorted by priority first." count={upcomingItems.length} />
          <UpcomingMaintenanceList
            items={upcomingItems}
            onAddToRecommendation={onAddToRecommendation}
            onAddToWorkLine={onAddToWorkLine}
            onDismiss={onDismiss}
          />
        </div>
      ) : null}

      {completedItems.length > 0 ? (
        <div style={styles.formStack}>
          <TimelineSectionHeader title="Completed Service History" subtitle="Newest completed entries appear first." count={completedItems.length} />
          <CompletedHistoryList items={completedItems} onViewRepairOrder={onViewRepairOrder} />
        </div>
      ) : null}

      {upcomingItems.length === 0 && completedItems.length === 0 ? (
        <div style={styles.emptyState}>{emptyStateText || "No maintenance timeline items match the current filters."}</div>
      ) : null}
    </div>
  );
}

export function TimelineSectionHeader({ title, subtitle, count }: TimelineSectionHeaderProps) {
  return (
    <div style={styles.timelineSectionHeader}>
      <div>
        <div style={styles.sectionTitle}>{title}</div>
        {subtitle ? <div style={styles.formHint}>{subtitle}</div> : null}
      </div>
      {typeof count === "number" ? <span style={styles.statusInfo}>{count} item(s)</span> : null}
    </div>
  );
}

export function UpcomingMaintenanceList({ items, onAddToRecommendation, onAddToWorkLine, onDismiss }: UpcomingMaintenanceListProps) {
  return (
    <div style={styles.formStack}>
      {items.map((item) => (
        <UpcomingMaintenanceCard
          key={item.id}
          item={item}
          onAddToRecommendation={onAddToRecommendation}
          onAddToWorkLine={onAddToWorkLine}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

export function UpcomingMaintenanceCard({
  item,
  onAddToRecommendation,
  onAddToWorkLine,
  onDismiss,
  defaultWhyExpanded = false,
}: UpcomingMaintenanceCardProps) {
  const [open, setOpen] = useState(defaultWhyExpanded);
  const statusLabel = getStatusLabel(item.status);

  const pills: MetaPill[] = [
    { id: `${item.id}-category`, label: item.category || "General" },
    { id: `${item.id}-service`, label: item.serviceKey || "service", tone: "info" },
    { id: `${item.id}-source`, label: item.sourceLabel || item.sourceTypeLabel || "Resolver", tone: "indigo" },
  ];

  return (
    <div
      style={styles.timelineCard}
      data-testid={`vehicle-maintenance-timeline-upcoming-${item.id}`}
      data-testid-alt={`maintenance-suggestion-card-${item.id}`}
    >
      <div style={styles.timelineStatusRail} data-status={item.status} />
      <div style={styles.mobileDataCardHeader}>
        <strong>{item.title}</strong>
        <StatusBadge status={item.status} label={statusLabel} />
      </div>
      <div style={styles.metaPillRow}>
        <MetaPillRow
          pills={[
            ...pills,
            { id: `${item.id}-specificity`, label: item.specificityLabel || (item.isVehicleSpecific ? "Vehicle-specific" : "General"), tone: item.isVehicleSpecific ? "success" : "default" },
          ]}
        />
      </div>
      <div style={styles.mobileDataSecondary}>
        RO {item.repairOrderNumber || "-"} | {item.dueBasis || "Interval-based maintenance"}
      </div>
      <div style={styles.timelineMetaGrid}>
        <div style={styles.timelineMetaCard}>
          <span>Last completed</span>
          <strong>{formatDate(item.lastCompletedAt)}</strong>
        </div>
        <div style={styles.timelineMetaCard}>
          <span>Interval</span>
          <strong>{item.intervalKm ? `${formatMileage(item.intervalKm)} km` : item.dueBasis || "-"}</strong>
        </div>
        <div style={styles.timelineMetaCard}>
          <span>Current KM</span>
          <strong>{formatMileage(item.currentMileage)}</strong>
        </div>
        <div style={styles.timelineMetaCard}>
          <span>Due summary</span>
          <strong>{item.dueSummaryText || item.status}</strong>
        </div>
      </div>
      <DueSummaryRow text={item.dueSummaryText || item.status} status={item.status} />
      <TimelineActionRow item={item} onAddToRecommendation={onAddToRecommendation} onAddToWorkLine={onAddToWorkLine} onDismiss={onDismiss} />
      <WhyShowingPanel lines={item.whyShowingLines || []} open={open} />
      <button type="button" style={styles.linkButton} onClick={() => setOpen((value) => !value)}>
        {open ? "Hide" : "Why this is showing"}
      </button>
    </div>
  );
}

export function CompletedHistoryList({ items, onViewRepairOrder }: CompletedHistoryListProps) {
  return (
    <div style={styles.formStack}>
      {items.map((item) => (
        <CompletedHistoryCard key={item.id} item={item} onViewRepairOrder={onViewRepairOrder} />
      ))}
    </div>
  );
}

export function CompletedHistoryCard({ item, onViewRepairOrder }: CompletedHistoryCardProps) {
  const pills: MetaPill[] = [
    { id: `${item.id}-category`, label: item.category || "General" },
    { id: `${item.id}-ro`, label: `RO ${item.repairOrderNumber || "-"}`, tone: "info" },
    { id: `${item.id}-service`, label: item.serviceKey || "service" },
    { id: `${item.id}-source`, label: item.sourceLabel || item.sourceTypeLabel || "Writeback", tone: "indigo" },
  ];

  return (
    <div style={styles.timelineCard} data-testid={`vehicle-maintenance-timeline-completed-${item.id}`}>
      <div style={styles.timelineStatusRail} data-status="completed" />
      <div style={styles.mobileDataCardHeader}>
        <strong>{item.title}</strong>
        <StatusBadge status="completed" label="Completed" />
      </div>
      <MetaPillRow pills={pills} />
      <div style={styles.mobileDataSecondary}>
        {item.vehicleLabel || "Unknown Vehicle"} | {item.plateNumber || "No plate"}
      </div>
      <div style={styles.completedDetailsGrid}>
        <CompletedDetailsRow
          completedAt={item.completedAt}
          odometerAtCompletion={item.odometerAtCompletion}
          sourceLabel={item.sourceLabel || item.sourceTypeLabel}
        />
      </div>
      {onViewRepairOrder && item.repairOrderNumber ? (
        <div style={styles.timelineActionRow}>
          <button type="button" style={styles.smallButtonMuted} onClick={() => onViewRepairOrder(item.repairOrderNumber || "")}>
            View RO
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MaintenanceTimelineSidebar({ counts, latestCompleted, insights, onViewRepairOrder }: MaintenanceTimelineSidebarProps) {
  return (
    <div style={styles.timelineSidebar} data-testid="maintenance-timeline-sidebar">
      <DueSummaryCard counts={counts} />
      <LatestCompletedCard items={latestCompleted} onViewRepairOrder={onViewRepairOrder} />
      <MaintenanceInsightCard insights={insights} />
    </div>
  );
}

export function DueSummaryCard({ counts }: DueSummaryCardProps) {
  return (
    <div style={styles.timelineSidebarCard}>
      <TimelineSectionHeader title="Due Summary" subtitle="High-priority maintenance signals for this vehicle." />
      <div style={styles.timelineSidebarMetrics}>
        <div style={styles.timelineSidebarMetric}>
          <span>Overdue</span>
          <strong>{counts.overdue}</strong>
        </div>
        <div style={styles.timelineSidebarMetric}>
          <span>Due Now</span>
          <strong>{counts.dueNow}</strong>
        </div>
        <div style={styles.timelineSidebarMetric}>
          <span>Due Soon</span>
          <strong>{counts.dueSoon}</strong>
        </div>
        <div style={styles.timelineSidebarMetric}>
          <span>Completed</span>
          <strong>{counts.completed}</strong>
        </div>
      </div>
    </div>
  );
}

export function LatestCompletedCard({ items, onViewRepairOrder }: LatestCompletedCardProps) {
  return (
    <div style={styles.timelineSidebarCard}>
      <TimelineSectionHeader title="Latest Completed" subtitle="Recent completed services for quick review." />
      <div style={styles.timelineSidebarList}>
        {items.length === 0 ? (
          <div style={styles.formHint}>No completed services available yet.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} style={styles.timelineSidebarListItem}>
              <strong>{item.title}</strong>
              <span>{item.repairOrderNumber || "-"}</span>
              <span>{formatDate(item.completedAt)}</span>
              {onViewRepairOrder && item.repairOrderNumber ? (
                <button type="button" style={styles.linkButton} onClick={() => onViewRepairOrder(item.repairOrderNumber || "")}>
                  View RO
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function MaintenanceInsightCard({ insights }: MaintenanceInsightCardProps) {
  return (
    <div style={styles.timelineSidebarCard}>
      <TimelineSectionHeader title="Maintenance Insight" subtitle="Read-only timeline note for the advisor/customer view." />
      <div style={styles.insightStack}>
        {insights.map((insight) => (
          <div key={insight.id} style={styles.insightCard}>
            <div style={styles.timelineSidebarMetricTitle}>{insight.label}</div>
            <div style={styles.formHint}>{insight.value}</div>
            <StatusBadge status={insight.tone === "critical" ? "overdue" : insight.tone === "warning" ? "dueNow" : "dueSoon"} label={insight.tone || "info"} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return <span style={getStatusStyle(status)}>{label || getStatusLabel(status)}</span>;
}

export function MetaPillRow({ pills }: MetaPillRowProps) {
  return (
    <div style={styles.chipWrap}>
      {pills.map((pill) => (
        <span key={pill.id} style={getToneStyle(pill.tone)} data-testid={pill.id}>
          {pill.label}
        </span>
      ))}
    </div>
  );
}

export function DueSummaryRow({ text, status }: DueSummaryRowProps) {
  return (
    <div style={styles.dueSummaryRow}>
      <span style={styles.reportStatLabel}>Due summary</span>
      <span style={getStatusStyle(status)}>{text}</span>
    </div>
  );
}

export function CompletedDetailsRow({ completedAt, odometerAtCompletion, technicianName, sourceLabel }: CompletedDetailsRowProps) {
  return (
    <div style={styles.completedDetailsGrid}>
      <div style={styles.timelineMetaCard}>
        <span>Completed</span>
        <strong>{formatDate(completedAt)}</strong>
      </div>
      <div style={styles.timelineMetaCard}>
        <span>Odometer</span>
        <strong>{formatMileage(odometerAtCompletion)}</strong>
      </div>
      <div style={styles.timelineMetaCard}>
        <span>Technician</span>
        <strong>{technicianName || "-"}</strong>
      </div>
      <div style={styles.timelineMetaCard}>
        <span>Source note</span>
        <strong>{sourceLabel || "-"}</strong>
      </div>
    </div>
  );
}

export function TimelineActionRow({ item, onAddToRecommendation, onAddToWorkLine, onDismiss }: TimelineActionRowProps) {
  return (
    <div style={styles.timelineActionRow}>
      <button type="button" style={styles.smallButtonMuted} data-testid={`maintenance-add-recommendation-${item.id}`} onClick={() => onAddToRecommendation(item)}>
        Add to Recommendation
      </button>
      <button type="button" style={styles.smallButton} data-testid={`maintenance-add-workline-${item.id}`} onClick={() => onAddToWorkLine(item)}>
        Add to Work Line
      </button>
      <button type="button" style={styles.smallButtonMuted} data-testid={`maintenance-dismiss-${item.id}`} onClick={() => onDismiss(item)}>
        Dismiss
      </button>
    </div>
  );
}

export function WhyShowingPanel({ lines, open }: WhyShowingPanelProps) {
  return open ? (
    <div style={styles.timelineWhyContent}>
      {lines.length === 0 ? <div style={styles.formHint}>No additional details available.</div> : lines.map((line, index) => <div key={`${line}-${index}`}>{line}</div>)}
    </div>
  ) : null;
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  panelHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  panelInner: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#10203a",
  },
  formHint: {
    fontSize: 12,
    color: "#67748b",
  },
  statusInfo: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  statusOk: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    background: "#ecfdf5",
    color: "#047857",
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  statusWarning: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    background: "#fff7ed",
    color: "#b45309",
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  statusDanger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  tagNeutral: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    background: "#eef2f7",
    color: "#334155",
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 700,
  },
  tagInfo: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    background: "#e0f2fe",
    color: "#075985",
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 700,
  },
  tagSuccess: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 700,
  },
  tagWarning: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    background: "#ffedd5",
    color: "#9a3412",
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 700,
  },
  tagDanger: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 700,
  },
  tagIndigo: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    background: "#e0e7ff",
    color: "#3730a3",
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 700,
  },
  reportStatLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#6b7280",
    fontWeight: 700,
  },
  timelineHeaderCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#ffffff",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  timelineHeaderTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  timelineHeaderPills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  timelineHeaderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  timelineHeaderMetaCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    background: "#f8fafc",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  timelineHeaderMetaValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#10203a",
  },
  timelineToolbar: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 0.8fr)",
    gap: 12,
    alignItems: "end",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
  },
  input: {
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    background: "#ffffff",
    color: "#0f172a",
  },
  select: {
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    background: "#ffffff",
    color: "#0f172a",
  },
  timelineChipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  smallButtonMuted: {
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "9px 12px",
    background: "#ffffff",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  smallButton: {
    border: "1px solid #1d4ed8",
    borderRadius: 10,
    padding: "9px 12px",
    background: "#1d4ed8",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  smallButtonActive: {
    borderColor: "#1d4ed8",
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  timelineLayout: {
    display: "grid",
    gap: 16,
  },
  timelineFeed: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  timelineSidebar: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  timelineSidebarCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#ffffff",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  timelineSidebarMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  timelineSidebarMetric: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#f8fafc",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  timelineSidebarMetricTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
  },
  timelineSidebarList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  timelineSidebarListItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 10,
  },
  timelineSectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  timelineCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#ffffff",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
  },
  timelineStatusRail: {
    position: "absolute",
    inset: "0 auto 0 0",
    width: 4,
    background: "#cbd5e1",
  },
  mobileDataCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chipWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPillRow: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  mobileDataSecondary: {
    fontSize: 13,
    color: "#475569",
  },
  timelineMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  timelineMetaCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#f8fafc",
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  completedDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  dueSummaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  timelineActionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  linkButton: {
    border: "none",
    background: "transparent",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 700,
    padding: 0,
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  timelineWhyDetails: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#f8fafc",
    padding: 10,
  },
  timelineWhySummary: {
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
  },
  timelineWhyContent: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 8,
    fontSize: 12,
    color: "#475569",
  },
  insightStack: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  insightCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#f8fafc",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  emptyState: {
    border: "1px dashed #cbd5e1",
    borderRadius: 14,
    background: "#f8fafc",
    color: "#475569",
    padding: 18,
    textAlign: "center",
    fontSize: 13,
  },
};
