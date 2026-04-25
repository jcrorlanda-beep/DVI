import React, { useMemo, useState } from "react";
import { buildTechnicianPerformanceViewModel, type TechnicianPerformanceFilters, type TechnicianPerformanceLeaderboardRow } from "./technicianPerformanceHelpers";
import type { RepairOrderRecord, UserAccount, VehicleServiceHistoryRecord, WorkLog } from "../shared/types";

type TechnicianPerformanceProps = {
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  workLogs: WorkLog[];
  serviceHistoryRecords: VehicleServiceHistoryRecord[];
  isCompactLayout: boolean;
  onOpenHistory?: () => void;
};

const DEFAULT_FILTERS: TechnicianPerformanceFilters = {
  technicianId: "",
  role: "",
  category: "All",
  dateFrom: "",
  dateTo: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatMinutes(minutes: number) {
  if (!minutes) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder}m`;
  return `${hours}h ${remainder}m`;
}

function getBadgeStyle(tone?: "neutral" | "info" | "good") {
  if (tone === "good") return styles.goodBadge;
  if (tone === "info") return styles.infoBadge;
  return styles.neutralBadge;
}

function Section({
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
    <section style={styles.card} data-testid={testId}>
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

function LeaderboardRow({
  row,
  active,
  onSelect,
}: {
  row: TechnicianPerformanceLeaderboardRow;
  active: boolean;
  onSelect: (technicianId: string) => void;
}) {
  return (
    <button
      type="button"
      style={{ ...styles.leaderboardRow, ...(active ? styles.leaderboardRowActive : null) }}
      onClick={() => onSelect(row.technicianId)}
      data-testid={`technician-performance-leaderboard-row-${row.technicianId}`}
    >
      <div style={styles.leaderboardRowTop}>
        <strong>{row.technicianName}</strong>
        <span style={styles.rolePill}>{row.role}</span>
      </div>
      <div style={styles.leaderboardRowMeta}>
        <span>{row.completedServices} services</span>
        <span>{row.completedJobs} jobs</span>
        <span>{row.topCategory || "General"}</span>
      </div>
      <div style={styles.leaderboardRowMeta}>
        <span>{row.completionRate}% completion</span>
        <span>{row.loggedMinutes ? formatMinutes(row.loggedMinutes) : "No timers"}</span>
        <span>{row.productionValue > 0 ? formatCurrency(row.productionValue) : "Counts only"}</span>
      </div>
    </button>
  );
}

export function TechnicianPerformance({
  users,
  repairOrders,
  workLogs,
  serviceHistoryRecords,
  isCompactLayout,
  onOpenHistory,
}: TechnicianPerformanceProps) {
  const [filters, setFilters] = useState<TechnicianPerformanceFilters>(DEFAULT_FILTERS);
  const viewModel = useMemo(
    () =>
      buildTechnicianPerformanceViewModel({
        users,
        repairOrders,
        workLogs,
        serviceHistoryRecords,
        filters,
      }),
    [filters, repairOrders, serviceHistoryRecords, users, workLogs]
  );

  const selectedTechnician = viewModel.selectedTechnician;

  const statCards = [
    {
      label: "Total Completed Jobs",
      value: viewModel.kpis.totalCompletedJobs,
      note: "Completed service jobs with technician involvement",
      testId: "technician-performance-kpi-completed-jobs",
    },
    {
      label: "Total Completed Services",
      value: viewModel.kpis.totalCompletedServices,
      note: "Completed labor/service lines assigned to technicians",
      testId: "technician-performance-kpi-completed-services",
    },
    {
      label: "Active Technicians",
      value: viewModel.kpis.activeTechnicians,
      note: "Active, assigned, or recently working technicians",
      testId: "technician-performance-kpi-active-technicians",
    },
    {
      label: "Production Value",
      value: viewModel.kpis.totalProductionValue > 0 ? formatCurrency(viewModel.kpis.totalProductionValue) : "Counts only",
      note: viewModel.productionMode === "Value" ? "Completed work value across current filters" : "No pricing values found in completed work lines",
      testId: "technician-performance-kpi-production-value",
    },
    {
      label: "Average Completion Rate",
      value: `${viewModel.kpis.averageCompletionRate}%`,
      note: "Assigned jobs turned into completed output",
      testId: "technician-performance-kpi-completion-rate",
    },
    {
      label: "Recent Completions This Month",
      value: viewModel.kpis.recentCompletionsThisMonth,
      note: "Completed services recorded this month",
      testId: "technician-performance-kpi-monthly",
    },
  ];

  return (
    <div style={styles.container} data-testid="technician-performance-panel">
      <Section
        title="Technician Performance"
        subtitle="Production output, completion quality, and category mix for workshop management."
        right={
          onOpenHistory ? (
            <button type="button" style={styles.secondaryButton} onClick={onOpenHistory} data-testid="technician-performance-open-history">
              Open Service Records
            </button>
          ) : null
        }
      >
        <div style={styles.headerMeta}>
          <div style={styles.headerNote}>Counts are technician-friendly and based on completed output, not flat-rate pay assumptions.</div>
          <span style={styles.modePill} data-testid="technician-performance-production-mode">{viewModel.productionMode === "Value" ? "Value-backed production" : "Counts only fallback"}</span>
        </div>
      </Section>

      <Section title="Filters" subtitle="Control the view by date, technician, role, and category." testId="technician-performance-filters">
        <div style={isCompactLayout ? styles.filterStack : styles.filterGrid}>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Technician</span>
            <select
              style={styles.input}
              value={filters.technicianId}
              onChange={(e) => setFilters((current) => ({ ...current, technicianId: e.target.value }))}
              data-testid="technician-performance-technician-select"
            >
              <option value="">All Technicians</option>
              {viewModel.technicianOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Role</span>
            <select
              style={styles.input}
              value={filters.role}
              onChange={(e) => setFilters((current) => ({ ...current, role: e.target.value }))}
              data-testid="technician-performance-role-select"
            >
              <option value="">All Roles</option>
              {viewModel.roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Category</span>
            <select
              style={styles.input}
              value={filters.category}
              onChange={(e) => setFilters((current) => ({ ...current, category: e.target.value }))}
              data-testid="technician-performance-category-select"
            >
              {viewModel.categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>From</span>
            <input
              type="date"
              style={styles.input}
              value={filters.dateFrom}
              onChange={(e) => setFilters((current) => ({ ...current, dateFrom: e.target.value }))}
              data-testid="technician-performance-date-from"
            />
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>To</span>
            <input
              type="date"
              style={styles.input}
              value={filters.dateTo}
              onChange={(e) => setFilters((current) => ({ ...current, dateTo: e.target.value }))}
              data-testid="technician-performance-date-to"
            />
          </label>
        </div>
      </Section>

      <div style={styles.kpiGrid} data-testid="technician-performance-kpis">
        {statCards.map((card) => (
          <div key={card.label} style={styles.kpiCard} data-testid={card.testId}>
            <div style={styles.kpiLabel}>{card.label}</div>
            <div style={styles.kpiValue}>{card.value}</div>
            <div style={styles.kpiNote}>{card.note}</div>
          </div>
        ))}
      </div>

      <div style={isCompactLayout ? styles.stackedLayout : styles.twoColumnLayout}>
        <div style={styles.column}>
          <Section
            title="Technician Leaderboard"
            subtitle="Ranked by completed services, then completed jobs, then production value."
            testId="technician-performance-leaderboard"
          >
            {viewModel.leaderboard.length === 0 ? (
              <div style={styles.emptyState}>No technician output matches the current filters.</div>
            ) : (
              <div style={styles.list}>
                {viewModel.leaderboard.map((row) => (
                  <LeaderboardRow
                    key={row.technicianId}
                    row={row}
                    active={selectedTechnician?.technicianId === row.technicianId}
                    onSelect={(technicianId) => setFilters((current) => ({ ...current, technicianId }))}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Category Performance"
            subtitle="Which technicians are carrying the most work in each category."
            testId="technician-performance-category-breakdown"
          >
            {viewModel.categoryBreakdown.length === 0 ? (
              <div style={styles.emptyState}>No category mix data is available for the current filters.</div>
            ) : (
              <div style={styles.categoryGrid}>
                {viewModel.categoryBreakdown.map((row) => (
                  <div key={row.category} style={styles.categoryCard} data-testid={`technician-performance-category-row-${row.category}`}>
                    <div style={styles.categoryLabel}>{row.category}</div>
                    <div style={styles.categoryValue}>{row.count}</div>
                    <div style={styles.categorySubtle}>
                      Top technician: <strong>{row.topTechnicianName}</strong>
                    </div>
                    <div style={styles.categorySubtle}>{row.topTechnicianCount} service(s)</div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Recent Technician Activity" subtitle="Latest completion and work-log activity across the workshop.">
            {viewModel.recentActivity.length === 0 ? (
              <div style={styles.emptyState}>No technician activity matches the current filters.</div>
            ) : (
              <div style={styles.list}>
                {viewModel.recentActivity.map((item) => (
                  <div key={item.id} style={styles.activityRow} data-testid={`technician-performance-activity-${item.id}`}>
                    <div style={styles.activityTop}>
                      <strong>{item.label}</strong>
                      <span style={{ ...styles.activityBadge, ...getBadgeStyle(item.tone) }}>{formatDate(item.completedAt)}</span>
                    </div>
                    <div style={styles.activityMeta}>
                      <span>{item.technicianName || item.roNumber || "Activity"}</span>
                      <span>{item.vehicleLabel || "-"}</span>
                      <span>{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div style={styles.column}>
          <Section
            title="Technician Detail"
            subtitle="Focused output for the currently selected technician."
            testId="technician-performance-detail"
          >
            {!selectedTechnician ? (
              <div style={styles.emptyState}>Select a technician to see their detail view.</div>
            ) : (
              <div style={styles.detailCard}>
                <div style={styles.detailHeader}>
                  <div>
                    <div style={styles.detailName}>{selectedTechnician.technicianName}</div>
                    <div style={styles.detailRole}>{selectedTechnician.role}</div>
                  </div>
                  <span style={styles.modePill}>{selectedTechnician.completionRate}% complete</span>
                </div>

                <div style={styles.detailStats}>
                  <div style={styles.detailStat}>
                    <span>Assigned vs Completed</span>
                    <strong>{selectedTechnician.assignedVsCompletedText}</strong>
                  </div>
                  <div style={styles.detailStat}>
                    <span>Service Mix</span>
                    <strong>{selectedTechnician.topCategory || "General"}</strong>
                  </div>
                  <div style={styles.detailStat}>
                    <span>Production Value</span>
                    <strong>{selectedTechnician.productionValue > 0 ? formatCurrency(selectedTechnician.productionValue) : "Counts only"}</strong>
                  </div>
                  <div style={styles.detailStat}>
                    <span>Service History Contribution</span>
                    <strong>{selectedTechnician.serviceHistoryContribution}</strong>
                  </div>
                </div>

                <div style={styles.detailBlock}>
                  <div style={styles.detailBlockTitle}>Recent Completed Services</div>
                  {selectedTechnician.recentCompletedServices.length === 0 ? (
                    <div style={styles.emptyMini}>No completed services for this technician in the current filters.</div>
                  ) : (
                    <div style={styles.list}>
                      {selectedTechnician.recentCompletedServices.map((item) => (
                        <div key={item.id} style={styles.compactRow}>
                          <div style={styles.compactRowMain}>
                            <strong>{item.label}</strong>
                            <span>{item.roNumber || "-"}</span>
                            <span>{item.vehicleLabel || "-"}</span>
                          </div>
                          <div style={styles.compactRowMeta}>
                            <span>{item.category}</span>
                            <span>{formatDate(item.completedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.detailBlock}>
                  <div style={styles.detailBlockTitle}>Category Breakdown</div>
                  {selectedTechnician.categoryBreakdown.length === 0 ? (
                    <div style={styles.emptyMini}>No category breakdown available for this technician.</div>
                  ) : (
                    <div style={styles.list}>
                      {selectedTechnician.categoryBreakdown.map((row) => (
                        <div key={row.category} style={styles.compactRow}>
                          <div style={styles.compactRowMain}>
                            <strong>{row.category}</strong>
                          </div>
                          <div style={styles.compactRowMeta}>
                            <span>{row.count} service(s)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.detailBlock}>
                  <div style={styles.detailBlockTitle}>Recent Activity</div>
                  {selectedTechnician.recentActivity.length === 0 ? (
                    <div style={styles.emptyMini}>No recent activity recorded for this technician.</div>
                  ) : (
                    <div style={styles.list}>
                      {selectedTechnician.recentActivity.map((item) => (
                        <div key={item.id} style={styles.compactRow}>
                          <div style={styles.compactRowMain}>
                            <strong>{item.label}</strong>
                            <span>{item.vehicleLabel || item.roNumber || "-"}</span>
                          </div>
                          <div style={styles.compactRowMeta}>
                            <span>{formatDate(item.completedAt)}</span>
                            <span>{item.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "grid",
    gap: 16,
  },
  card: {
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
    lineHeight: 1.5,
    color: "#64748b",
  },
  headerMeta: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  headerNote: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.5,
    maxWidth: 780,
  },
  modePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid #bfdbfe",
    whiteSpace: "nowrap",
  },
  secondaryButton: {
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 700,
    padding: "10px 12px",
    cursor: "pointer",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 12,
  },
  filterStack: {
    display: "grid",
    gap: 12,
  },
  filterField: {
    display: "grid",
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  input: {
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    padding: "10px 12px",
    fontSize: 13,
    color: "#0f172a",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  kpiCard: {
    borderRadius: 16,
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
    fontSize: 28,
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
    gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, 0.95fr)",
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
  list: {
    display: "grid",
    gap: 10,
  },
  leaderboardRow: {
    width: "100%",
    textAlign: "left",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: 14,
    cursor: "pointer",
    display: "grid",
    gap: 8,
  },
  leaderboardRowActive: {
    borderColor: "#93c5fd",
    background: "#eff6ff",
  },
  leaderboardRowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  leaderboardRowMeta: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    fontSize: 12,
    color: "#475569",
  },
  rolePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  categoryCard: {
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: 14,
    display: "grid",
    gap: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },
  categoryValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "#1d4ed8",
  },
  categorySubtle: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 1.5,
  },
  activityRow: {
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: 14,
    display: "grid",
    gap: 8,
  },
  activityTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  activityBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  activityMeta: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    fontSize: 12,
    color: "#475569",
  },
  goodBadge: {
    background: "#ecfdf5",
    color: "#15803d",
    border: "1px solid #bbf7d0",
  },
  infoBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
  },
  neutralBadge: {
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #e2e8f0",
  },
  detailCard: {
    display: "grid",
    gap: 16,
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  detailName: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
  },
  detailRole: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  detailStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
  },
  detailStat: {
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: 12,
    display: "grid",
    gap: 6,
    fontSize: 12,
    color: "#64748b",
  },
  detailBlock: {
    display: "grid",
    gap: 10,
  },
  detailBlockTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  compactRow: {
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    padding: 12,
    display: "grid",
    gap: 8,
  },
  compactRowMain: {
    display: "grid",
    gap: 4,
    fontSize: 13,
    color: "#0f172a",
  },
  compactRowMeta: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    fontSize: 12,
    color: "#64748b",
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
};
