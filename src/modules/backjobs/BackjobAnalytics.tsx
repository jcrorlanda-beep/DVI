import React, { useMemo, useState } from "react";
import type { BackjobRecord, RepairOrderRecord, UserAccount } from "../shared/types";
import { formatDateTime, getResponsiveSpan } from "../shared/helpers";
import {
  buildBackjobAnalyticsViewModel,
  type BackjobAnalyticsFilters,
  type BackjobAnalyticsCase,
  type BackjobTechnicianSummary,
  type BackjobCategoryBreakdownRow,
  type BackjobCostTypeBreakdownRow,
  type BackjobRootCauseBreakdownRow,
  type BackjobRepeatIssueVehicle,
} from "./backjobAnalyticsHelpers";

type BackjobAnalyticsProps = {
  backjobRecords: BackjobRecord[];
  repairOrders: RepairOrderRecord[];
  users: UserAccount[];
  isCompactLayout: boolean;
};

const DEFAULT_FILTERS: BackjobAnalyticsFilters = {
  search: "",
  technicianId: "",
  category: "",
  costType: "",
  rootCause: "",
  vehicle: "",
  originalRo: "",
  returnRo: "",
  dateFrom: "",
  dateTo: "",
};

function formatPct(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)}%`;
}

function formatCount(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function AnalyticsCard({
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
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{title}</div>
          {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
  testId,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
  testId?: string;
}) {
  return (
    <div style={styles.metricCard} data-testid={testId}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={styles.metricValue}>{value}</div>
      <div style={styles.metricNote}>{note}</div>
    </div>
  );
}

function MetaPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "indigo";
}) {
  return <span style={{ ...styles.pill, ...styles[`pill_${tone}` as const] }}>{label}</span>;
}

function BreakdownBar({
  label,
  count,
  percentage,
  examples,
}: {
  label: string;
  count: number;
  percentage: number;
  examples?: string[];
}) {
  return (
    <div style={styles.breakdownRow}>
      <div style={styles.breakdownTopRow}>
        <strong>{label}</strong>
        <span style={styles.breakdownCount}>{count}</span>
      </div>
      <div style={styles.breakdownBarTrack}>
        <div style={{ ...styles.breakdownBarFill, width: `${Math.max(8, percentage)}%` }} />
      </div>
      <div style={styles.breakdownNote}>{percentage.toFixed(1)}%</div>
      {examples?.length ? <div style={styles.breakdownExamples}>{examples.join(" • ")}</div> : null}
    </div>
  );
}

function CaseCard({
  item,
}: {
  item: BackjobAnalyticsCase;
}) {
  return (
    <div style={styles.caseCard} data-testid={`backjob-analytics-case-${item.id}`}>
      <div style={styles.caseHeader}>
        <div>
          <div style={styles.caseTitle}>{item.backjobNumber}</div>
          <div style={styles.caseSubtitle}>{item.vehicleLabel}</div>
        </div>
        <div style={styles.caseStatusWrap}>
          <MetaPill label={item.status} tone={item.status === "Closed" ? "success" : item.status === "In Progress" ? "warning" : "indigo"} />
          <MetaPill label={item.costType} tone={item.costType === "Warranty" ? "danger" : item.costType === "Internal" ? "warning" : item.costType === "Customer Pay" ? "info" : "indigo"} />
        </div>
      </div>

      <div style={styles.caseMetaRow}>
        <MetaPill label={`Plate ${item.plateNumber || "-"}`} tone="neutral" />
        <MetaPill label={`Original RO ${item.originalRoNumber || "-"}`} tone="info" />
        <MetaPill label={`Return RO ${item.returnRoNumber || "-"}`} tone={item.returnRoNumber ? "success" : "neutral"} />
        <MetaPill label={item.category} tone="indigo" />
        <MetaPill label={item.serviceKey} tone="neutral" />
      </div>

      <div style={styles.caseBody}>
        <div style={styles.caseLine}>
          <span style={styles.caseLineLabel}>Service</span>
          <span style={styles.caseLineValue}>{item.serviceTitle}</span>
        </div>
        <div style={styles.caseLine}>
          <span style={styles.caseLineLabel}>Technicians</span>
          <span style={styles.caseLineValue}>{item.technicianNames.length ? item.technicianNames.join(", ") : "-"}</span>
        </div>
        <div style={styles.caseLine}>
          <span style={styles.caseLineLabel}>Root Cause</span>
          <span style={styles.caseLineValue}>{item.rootCause}</span>
        </div>
        <div style={styles.caseLine}>
          <span style={styles.caseLineLabel}>Complaint</span>
          <span style={styles.caseLineValue}>{item.complaint || "-"}</span>
        </div>
        <div style={styles.caseLine}>
          <span style={styles.caseLineLabel}>Findings</span>
          <span style={styles.caseLineValue}>{item.findings || "-"}</span>
        </div>
        <div style={styles.caseLine}>
          <span style={styles.caseLineLabel}>Action</span>
          <span style={styles.caseLineValue}>{item.actionTaken || "-"}</span>
        </div>
      </div>

      <div style={styles.caseFooter}>
        <span style={styles.caseFooterItem}>Created {formatDateTime(item.createdAt)}</span>
        <span style={styles.caseFooterItem}>Updated {formatDateTime(item.updatedAt)}</span>
        <span style={styles.caseFooterItem}>Category mix: {item.categoryList.join(", ") || "-"}</span>
      </div>
    </div>
  );
}

function TechnicianRow({ item }: { item: BackjobTechnicianSummary }) {
  return (
    <div style={styles.techRow} data-testid={`backjob-analytics-technician-${item.technicianId}`}>
      <div style={styles.techRowTop}>
        <div>
          <div style={styles.techName}>{item.technicianName}</div>
          <div style={styles.techRole}>{item.role}</div>
        </div>
        <MetaPill label={item.topCategory} tone="indigo" />
      </div>
      <div style={styles.techStats}>
        <div><strong>{item.caseCount}</strong> linked cases</div>
        <div><strong>{item.completedJobs}</strong> completed jobs</div>
        <div><strong>{formatPct(item.backjobRatePct)}</strong> backjob rate</div>
        <div><strong>{formatPct(item.completionRatePct)}</strong> completion rate</div>
      </div>
      <div style={styles.techCategories}>
        {item.categories.length ? item.categories.slice(0, 4).map((category) => <MetaPill key={category} label={category} tone="neutral" />) : <span style={styles.emptyHint}>No category mix recorded.</span>}
      </div>
      <div style={styles.techFooter}>
        <span>Recent activity: {formatDateTime(item.recentActivityAt)}</span>
        <span>{item.recentCaseNumbers.length ? `Recent cases: ${item.recentCaseNumbers.join(", ")}` : "No recent cases"}</span>
      </div>
    </div>
  );
}

function RepeatVehicleCard({ item }: { item: BackjobRepeatIssueVehicle }) {
  return (
    <div style={styles.repeatVehicleCard} data-testid={`backjob-analytics-repeat-${item.vehicleKey}`}>
      <div style={styles.caseHeader}>
        <div>
          <div style={styles.caseTitle}>{item.vehicleLabel}</div>
          <div style={styles.caseSubtitle}>{item.plateNumber || "-"}</div>
        </div>
        <MetaPill label={`${item.backjobCount} backjob${item.backjobCount === 1 ? "" : "s"}${item.returnCount ? ` / ${item.returnCount} return` : ""}`} tone="warning" />
      </div>
      <div style={styles.caseMetaRow}>
        <MetaPill label={`Original: ${item.originalRoNumbers.join(", ") || "-"}`} tone="info" />
        <MetaPill label={`Return: ${item.returnRoNumbers.join(", ") || "-"}`} tone={item.returnRoNumbers.length ? "success" : "neutral"} />
      </div>
      <div style={styles.caseLine}>
        <span style={styles.caseLineLabel}>Primary reason</span>
        <span style={styles.caseLineValue}>{item.primaryRootCause}</span>
      </div>
      <div style={styles.caseLine}>
        <span style={styles.caseLineLabel}>Latest activity</span>
        <span style={styles.caseLineValue}>{formatDateTime(item.latestActivityAt)}</span>
      </div>
      <div style={styles.techCategories}>
        {item.categories.slice(0, 4).map((category) => <MetaPill key={category} label={category} tone="neutral" />)}
      </div>
    </div>
  );
}

export function BackjobAnalytics({
  backjobRecords,
  repairOrders,
  users,
  isCompactLayout,
}: BackjobAnalyticsProps) {
  const [filters, setFilters] = useState<BackjobAnalyticsFilters>(DEFAULT_FILTERS);

  const viewModel = useMemo(
    () =>
      buildBackjobAnalyticsViewModel({
        backjobRecords,
        repairOrders,
        users,
        filters,
      }),
    [backjobRecords, filters, repairOrders, users]
  );

  const updateFilter = (key: keyof BackjobAnalyticsFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div style={styles.container} data-testid="backjob-analytics-panel">
      <AnalyticsCard
        title="Backjob / Rework Analytics"
        subtitle="Track repeat work, responsibility, technician quality signals, and return-visit patterns without changing the existing comeback workflow."
        testId="backjob-analytics-header"
      >
        <div style={styles.headerMeta}>
          <MetaPill label={`${viewModel.kpis.totalBackjobCases} cases analyzed`} tone="indigo" />
          <MetaPill label={`${viewModel.kpis.repeatIssueVehicles} repeat-issue vehicle${viewModel.kpis.repeatIssueVehicles === 1 ? "" : "s"}`} tone="warning" />
          <MetaPill label={`${viewModel.technicianSummaries.length} technician${viewModel.technicianSummaries.length === 1 ? "" : "s"}`} tone="neutral" />
        </div>
      </AnalyticsCard>

      <div
        style={{
          ...styles.kpiGrid,
          gridTemplateColumns: isCompactLayout ? "repeat(2, minmax(0, 1fr))" : styles.kpiGrid.gridTemplateColumns,
        }}
        data-testid="backjob-analytics-kpis"
      >
        <MetricCard label="Total Backjob Cases" value={viewModel.kpis.totalBackjobCases} note="Total comeback records in scope" testId="backjob-analytics-kpi-total" />
        <MetricCard label="Backjob Rate" value={formatPct(viewModel.kpis.backjobRatePct)} note="Cases versus tracked repair orders" testId="backjob-analytics-kpi-rate" />
        <MetricCard label="Warranty Cases" value={viewModel.kpis.warrantyCases} note="Warranty responsibility cases" testId="backjob-analytics-kpi-warranty" />
        <MetricCard label="Internal Cases" value={viewModel.kpis.internalCases} note="Internal responsibility cases" testId="backjob-analytics-kpi-internal" />
        <MetricCard label="Customer-Paid Cases" value={viewModel.kpis.customerPaidCases} note="Customer-paid rework cases" testId="backjob-analytics-kpi-customer" />
        <MetricCard label="Repeat-Issue Vehicles" value={viewModel.kpis.repeatIssueVehicles} note="Vehicles with repeat or return activity" testId="backjob-analytics-kpi-repeat" />
      </div>

      <AnalyticsCard
        title="Analytics Filters"
        subtitle="Use the filters to narrow the analysis by technician, vehicle, RO reference, cause, or date range."
        testId="backjob-analytics-filters"
        right={<button type="button" style={styles.resetButton} onClick={resetFilters}>Reset Filters</button>}
      >
        <div
          style={{
            ...styles.filterGrid,
            gridTemplateColumns: isCompactLayout ? "1fr" : styles.filterGrid.gridTemplateColumns,
          }}
        >
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Search</span>
            <input
              data-testid="backjob-analytics-filter-search"
              style={styles.input}
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search title, RO, plate, technician, or note"
            />
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Technician</span>
            <select
              data-testid="backjob-analytics-filter-technician"
              style={styles.select}
              value={filters.technicianId}
              onChange={(e) => updateFilter("technicianId", e.target.value)}
            >
              <option value="">All technicians</option>
              {viewModel.technicianOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Category</span>
            <select
              data-testid="backjob-analytics-filter-category"
              style={styles.select}
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              {viewModel.categoryOptions.map((option) => (
                <option key={option} value={option === "All" ? "" : option}>{option}</option>
              ))}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Cost Type</span>
            <select
              data-testid="backjob-analytics-filter-cost-type"
              style={styles.select}
              value={filters.costType}
              onChange={(e) => updateFilter("costType", e.target.value)}
            >
              <option value="">All cost types</option>
              {viewModel.costTypeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Root Cause</span>
            <select
              data-testid="backjob-analytics-filter-root-cause"
              style={styles.select}
              value={filters.rootCause}
              onChange={(e) => updateFilter("rootCause", e.target.value)}
            >
              <option value="">All root causes</option>
              {viewModel.rootCauseOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Vehicle</span>
            <input
              data-testid="backjob-analytics-filter-vehicle"
              style={styles.input}
              value={filters.vehicle}
              onChange={(e) => updateFilter("vehicle", e.target.value)}
              placeholder="Vehicle label or plate"
            />
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Original RO</span>
            <input
              data-testid="backjob-analytics-filter-original-ro"
              style={styles.input}
              value={filters.originalRo}
              onChange={(e) => updateFilter("originalRo", e.target.value)}
              placeholder="Original RO number"
            />
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Return RO</span>
            <input
              data-testid="backjob-analytics-filter-return-ro"
              style={styles.input}
              value={filters.returnRo}
              onChange={(e) => updateFilter("returnRo", e.target.value)}
              placeholder="Return RO number"
            />
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Date From</span>
            <input
              data-testid="backjob-analytics-filter-date-from"
              type="date"
              style={styles.input}
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
            />
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Date To</span>
            <input
              data-testid="backjob-analytics-filter-date-to"
              type="date"
              style={styles.input}
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
            />
          </label>
        </div>
      </AnalyticsCard>

      <div style={styles.analyticsGrid}>
        <div style={{ ...styles.column, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <AnalyticsCard
            title="Rework Case List"
            subtitle={`Showing ${viewModel.filteredCases.length} backjob case${viewModel.filteredCases.length === 1 ? "" : "s"} in the current filter scope.`}
            testId="backjob-analytics-case-list"
          >
            {viewModel.filteredCases.length === 0 ? (
              <div style={styles.emptyState}>No backjob cases match the current filters.</div>
            ) : (
              <div style={styles.caseList}>
                {viewModel.filteredCases.map((item) => <CaseCard key={item.id} item={item} />)}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard
            title="Technician Rework Summary"
            subtitle="See which technicians are linked to comeback cases, how often they reappear, and what categories they touch most."
            testId="backjob-analytics-technician-summary"
          >
            {viewModel.technicianSummaries.length === 0 ? (
              <div style={styles.emptyState}>No technician summary available for the selected filters.</div>
            ) : (
              <div style={styles.techList}>
                {viewModel.technicianSummaries.map((item) => <TechnicianRow key={item.technicianId} item={item} />)}
              </div>
            )}
          </AnalyticsCard>
        </div>

        <div style={{ ...styles.column, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <AnalyticsCard
            title="Category Breakdown"
            subtitle="Backjob cases grouped by primary service category."
            testId="backjob-analytics-category-breakdown"
          >
            {viewModel.categoryBreakdown.length === 0 ? (
              <div style={styles.emptyState}>No category breakdown available.</div>
            ) : (
              <div style={styles.breakdownList}>
                {viewModel.categoryBreakdown.map((row) => (
                  <BreakdownBar key={row.category} label={row.category} count={row.count} percentage={row.percentage} />
                ))}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard
            title="Root Cause Breakdown"
            subtitle="Deterministic buckets help spot workmanship, parts, and diagnosis patterns."
            testId="backjob-analytics-root-cause"
          >
            {viewModel.rootCauseBreakdown.length === 0 ? (
              <div style={styles.emptyState}>No root cause breakdown available.</div>
            ) : (
              <div style={styles.breakdownList}>
                {viewModel.rootCauseBreakdown.map((row) => (
                  <BreakdownBar key={row.cause} label={row.cause} count={row.count} percentage={row.percentage} examples={row.examples} />
                ))}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard
            title="Cost Type Breakdown"
            subtitle="Track how responsibility is distributed across warranty, internal, and customer-paid rework."
            testId="backjob-analytics-cost-breakdown"
          >
            {viewModel.costTypeBreakdown.length === 0 ? (
              <div style={styles.emptyState}>No cost type breakdown available.</div>
            ) : (
              <div style={styles.breakdownList}>
                {viewModel.costTypeBreakdown.map((row) => (
                  <BreakdownBar key={row.costType} label={row.costType} count={row.count} percentage={row.percentage} />
                ))}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard
            title="Repeat-Issue Vehicles"
            subtitle="Vehicles with more than one backjob or a recheck return to the same job."
            testId="backjob-analytics-repeat-vehicles"
          >
            {viewModel.repeatIssueVehicles.length === 0 ? (
              <div style={styles.emptyState}>No repeat-issue vehicles are present in the current scope.</div>
            ) : (
              <div style={styles.repeatList}>
                {viewModel.repeatIssueVehicles.map((item) => <RepeatVehicleCard key={item.vehicleKey} item={item} />)}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard
            title="Recent Rework Cases"
            subtitle="Latest comeback activity in the current filter scope."
            testId="backjob-analytics-recent-rework"
          >
            {viewModel.recentReworkCases.length === 0 ? (
              <div style={styles.emptyState}>No recent rework cases available.</div>
            ) : (
              <div style={styles.recentCaseList}>
                {viewModel.recentReworkCases.map((item) => (
                  <div key={item.id} style={styles.recentCaseRow}>
                    <div>
                      <div style={styles.recentCaseTitle}>{item.backjobNumber} · {item.vehicleLabel}</div>
                      <div style={styles.recentCaseSubtitle}>{item.originalRoNumber} {item.returnRoNumber ? `→ ${item.returnRoNumber}` : ""}</div>
                    </div>
                    <div style={styles.recentCaseMeta}>
                      <MetaPill label={item.costType} tone={item.costType === "Warranty" ? "danger" : item.costType === "Internal" ? "warning" : "neutral"} />
                      <span style={styles.recentCaseDate}>{formatDateTime(item.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsCard>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
    border: "1px solid rgba(29,78,216,0.16)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 28px rgba(5, 11, 29, 0.12)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.3,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  headerMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
    border: "1px solid rgba(29,78,216,0.16)",
    borderRadius: 14,
    padding: "14px 16px",
    boxShadow: "0 4px 14px rgba(5,11,29,0.08)",
  },
  metricLabel: { fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  metricValue: { fontSize: 28, fontWeight: 900, color: "#1d4ed8", margin: "4px 0" },
  metricNote: { fontSize: 11, color: "#94a3b8" },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: 12,
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#374151",
  },
  input: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  resetButton: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 14px",
    background: "#fff",
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 16,
  },
  column: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  caseList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  caseCard: {
    background: "#fff",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  caseHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  caseTitle: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  caseSubtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  caseStatusWrap: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  caseMetaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  caseBody: {
    display: "grid",
    gap: 8,
  },
  caseLine: {
    display: "grid",
    gridTemplateColumns: "120px minmax(0, 1fr)",
    gap: 12,
    alignItems: "start",
  },
  caseLineLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  caseLineValue: {
    fontSize: 13,
    color: "#0f172a",
    lineHeight: 1.5,
  },
  caseFooter: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 12,
    color: "#64748b",
  },
  caseFooterItem: {
    background: "#f8fafc",
    borderRadius: 999,
    padding: "6px 10px",
  },
  techList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  techRow: {
    background: "#fff",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  techRowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  techName: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  techRole: { fontSize: 12, color: "#64748b", marginTop: 2 },
  techStats: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
    fontSize: 13,
    color: "#334155",
  },
  techCategories: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  techFooter: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 12,
    color: "#64748b",
  },
  breakdownList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  breakdownRow: {
    background: "#fff",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  breakdownTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  breakdownCount: {
    fontSize: 12,
    fontWeight: 800,
    color: "#1d4ed8",
  },
  breakdownBarTrack: {
    height: 10,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  breakdownBarFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #1d4ed8 0%, #60a5fa 100%)",
  },
  breakdownNote: {
    fontSize: 12,
    color: "#64748b",
  },
  breakdownExamples: {
    fontSize: 12,
    color: "#94a3b8",
  },
  repeatList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  repeatVehicleCard: {
    background: "#fff",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  recentCaseList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  recentCaseRow: {
    background: "#fff",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  recentCaseTitle: { fontSize: 14, fontWeight: 800, color: "#0f172a" },
  recentCaseSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  recentCaseMeta: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  recentCaseDate: {
    fontSize: 12,
    color: "#64748b",
  },
  emptyState: {
    background: "#f8fafc",
    border: "1px dashed rgba(148,163,184,0.45)",
    borderRadius: 14,
    padding: 14,
    color: "#64748b",
    fontSize: 13,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.2,
    whiteSpace: "nowrap",
  },
  pill_neutral: { background: "#e2e8f0", color: "#334155" },
  pill_info: { background: "#dbeafe", color: "#1d4ed8" },
  pill_success: { background: "#dcfce7", color: "#166534" },
  pill_warning: { background: "#fef3c7", color: "#92400e" },
  pill_danger: { background: "#fee2e2", color: "#b91c1c" },
  pill_indigo: { background: "#e0e7ff", color: "#4338ca" },
  emptyHint: {
    fontSize: 12,
    color: "#94a3b8",
  },
};
