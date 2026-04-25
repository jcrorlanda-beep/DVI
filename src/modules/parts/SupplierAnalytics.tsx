import React, { useEffect, useMemo, useState } from "react";
import type { RepairOrderRecord, PartsRequestRecord } from "../shared/types";
import { formatCurrency, formatDateTime, getResponsiveSpan } from "../shared/helpers";
import {
  buildSupplierAnalyticsViewModel,
  type SupplierAnalyticsFilters,
  type SupplierAnalyticsBidRow,
  type SupplierLeaderboardRow,
  type SupplierDeliveryPerformanceRow,
  type SupplierCostTrendRow,
  type SupplierCategoryBreakdownRow,
  type PreferredSupplierSuggestion,
  type SupplierDetailRow,
} from "./supplierAnalyticsHelpers";

type SupplierAnalyticsProps = {
  partsRequests: PartsRequestRecord[];
  repairOrders: RepairOrderRecord[];
  isCompactLayout: boolean;
};

const DEFAULT_FILTERS: SupplierAnalyticsFilters = {
  search: "",
  supplier: "",
  category: "",
  brand: "",
  requestStatus: "",
  awardedOnly: false,
  dateFrom: "",
  dateTo: "",
};

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

function Pill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "info" | "success" | "warning" | "danger" | "indigo" }) {
  return <span style={{ ...styles.pill, ...styles[`pill_${tone}` as const] }}>{label}</span>;
}

function BarRow({
  label,
  count,
  averageCost,
  averageDeliveryDays,
}: {
  label: string;
  count: number;
  averageCost?: number | null;
  averageDeliveryDays?: number | null;
}) {
  return (
    <div style={styles.barRow}>
      <div style={styles.barRowTop}>
        <strong>{label}</strong>
        <span style={styles.barCount}>{count}</span>
      </div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${Math.max(8, Math.min(100, count * 12))}%` }} />
      </div>
      <div style={styles.barMeta}>
        {averageCost !== undefined ? <span>Avg cost: {formatCurrency(averageCost ?? 0)}</span> : null}
        {averageDeliveryDays !== undefined && averageDeliveryDays !== null ? <span>Avg delivery: {averageDeliveryDays.toFixed(1)}d</span> : null}
      </div>
    </div>
  );
}

function BidRowCard({ row }: { row: SupplierAnalyticsBidRow }) {
  return (
    <div style={styles.bidRow} data-testid={`supplier-analytics-bid-${row.id}`}>
      <div style={styles.bidHeader}>
        <div>
          <div style={styles.bidTitle}>{row.supplierName}</div>
          <div style={styles.bidSubtitle}>{row.requestNumber} · {row.vehicleLabel}</div>
        </div>
        <div style={styles.bidPills}>
          <Pill label={row.awarded ? "Awarded" : "Bid"} tone={row.awarded ? "success" : "neutral"} />
          <Pill label={row.requestStatus} tone="info" />
        </div>
      </div>
      <div style={styles.bidMetaRow}>
        <Pill label={row.category} tone="indigo" />
        <Pill label={row.brand || "Unknown brand"} tone="neutral" />
        <Pill label={row.deliveryTimeLabel} tone="warning" />
      </div>
      <div style={styles.bidGrid}>
        <div><span>Part</span><strong>{row.partName}</strong></div>
        <div><span>Total Cost</span><strong>{formatCurrency(row.totalCost)}</strong></div>
        <div><span>Unit Cost</span><strong>{formatCurrency(row.unitCost)}</strong></div>
        <div><span>Quantity</span><strong>{row.quantity}</strong></div>
      </div>
    </div>
  );
}

function LeaderboardRow({
  row,
  selected,
  onClick,
}: {
  row: SupplierLeaderboardRow;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...styles.leaderRow, ...(selected ? styles.leaderRowSelected : {}) }}
      data-testid={`supplier-analytics-leader-${row.supplierName}`}
    >
      <div style={styles.leaderTop}>
        <div>
          <div style={styles.leaderName}>{row.supplierName}</div>
          <div style={styles.leaderSub}>{row.bestCategory} · {row.bestBrand}</div>
        </div>
        <Pill label={`${row.bidsWon} wins`} tone="success" />
      </div>
      <div style={styles.leaderStats}>
        <span>Bids: <strong>{row.bidsSubmitted}</strong></span>
        <span>Win rate: <strong>{row.winRatePct === null ? "-" : `${row.winRatePct.toFixed(1)}%`}</strong></span>
        <span>Avg cost: <strong>{row.averageQuotedCost === null ? "-" : formatCurrency(row.averageQuotedCost)}</strong></span>
        <span>Avg delivery: <strong>{row.averageDeliveryDays === null ? "-" : `${row.averageDeliveryDays.toFixed(1)}d`}</strong></span>
        <span>On-time: <strong>{row.onTimeRatePct === null ? "-" : `${row.onTimeRatePct.toFixed(1)}%`}</strong></span>
      </div>
    </button>
  );
}

function DetailSupplierCard({
  detail,
}: {
  detail: SupplierDetailRow | null;
}) {
  if (!detail) {
    return <div style={styles.emptyState}>Select a supplier to view detail.</div>;
  }

  return (
    <div style={styles.detailCard} data-testid="supplier-analytics-detail-view">
      <div style={styles.detailHeader}>
        <div>
          <div style={styles.detailTitle}>{detail.supplierName}</div>
          <div style={styles.detailSubtitle}>Recent bids, wins, delivery reliability, categories, and brands.</div>
        </div>
        <Pill label={`${detail.bidsWon} wins`} tone="success" />
      </div>
      <div style={styles.detailStats}>
        <div><span>Bids submitted</span><strong>{detail.bidsSubmitted}</strong></div>
        <div><span>Bids won</span><strong>{detail.bidsWon}</strong></div>
        <div><span>Avg cost</span><strong>{detail.averageQuotedCost === null ? "-" : formatCurrency(detail.averageQuotedCost)}</strong></div>
        <div><span>Avg delivery</span><strong>{detail.averageDeliveryDays === null ? "-" : `${detail.averageDeliveryDays.toFixed(1)}d`}</strong></div>
        <div><span>On-time</span><strong>{detail.onTimeRatePct === null ? "-" : `${detail.onTimeRatePct.toFixed(1)}%`}</strong></div>
      </div>
      <div style={styles.detailPills}>
        {detail.categories.map((category) => <Pill key={category} label={category} tone="indigo" />)}
        {detail.brands.map((brand) => <Pill key={brand} label={brand} tone="neutral" />)}
      </div>
      <div style={styles.detailSplit}>
        <div>
          <div style={styles.detailSectionTitle}>Recent Bids</div>
          <div style={styles.detailList}>
            {detail.recentBids.length === 0 ? <div style={styles.emptyHint}>No recent bids.</div> : detail.recentBids.map((row) => <BidRowCard key={row.id} row={row} />)}
          </div>
        </div>
        <div>
          <div style={styles.detailSectionTitle}>Recent Wins</div>
          <div style={styles.detailList}>
            {detail.recentWins.length === 0 ? <div style={styles.emptyHint}>No recent wins.</div> : detail.recentWins.map((row) => <BidRowCard key={`win-${row.id}`} row={row} />)}
          </div>
        </div>
      </div>
      <div style={styles.detailFooter}>
        <span>Last activity: {formatDateTime(detail.recentActivityAt)}</span>
        <span>Requests: {detail.recentRequestNumbers.join(", ") || "-"}</span>
        <span>Statuses: {detail.recentStatuses.join(", ") || "-"}</span>
      </div>
    </div>
  );
}

function SuggestionCard({ item }: { item: PreferredSupplierSuggestion }) {
  return (
    <div style={styles.suggestionCard} data-testid={`supplier-analytics-suggestion-${item.id}`}>
      <div style={styles.suggestionTop}>
        <div>
          <div style={styles.suggestionLabel}>{item.label}</div>
          <div style={styles.suggestionSupplier}>{item.supplierName}</div>
        </div>
        <Pill label={item.tone === "success" ? "Best Price" : item.tone === "info" ? "Fastest" : item.tone === "warning" ? "Top Win Rate" : "Suggested"} tone={item.tone ?? "neutral"} />
      </div>
      <div style={styles.suggestionReason}>{item.reason}</div>
    </div>
  );
}

export function SupplierAnalytics({ partsRequests, repairOrders, isCompactLayout }: SupplierAnalyticsProps) {
  const [filters, setFilters] = useState<SupplierAnalyticsFilters>(DEFAULT_FILTERS);
  const [selectedSupplierName, setSelectedSupplierName] = useState("");

  const viewModel = useMemo(
    () =>
      buildSupplierAnalyticsViewModel({
        partsRequests,
        repairOrders,
        filters,
      }),
    [filters, partsRequests, repairOrders]
  );

  useEffect(() => {
    const fallback = viewModel.leaderboard[0]?.supplierName ?? "";
    if (!selectedSupplierName || !viewModel.leaderboard.some((row) => row.supplierName === selectedSupplierName)) {
      setSelectedSupplierName(fallback);
    }
  }, [selectedSupplierName, viewModel.leaderboard]);

  const selectedDetail = viewModel.supplierDetails.find((row) => row.supplierName === selectedSupplierName) ?? null;

  const updateFilter = (key: keyof SupplierAnalyticsFilters, value: string | boolean) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div style={styles.container} data-testid="parts-supplier-analytics-panel">
      <AnalyticsCard
        title="Parts & Supplier Analytics"
        subtitle="Management-facing supplier intelligence built from internal bidding, ordering, shipping, and arrival records."
        testId="parts-supplier-analytics-header"
      >
        <div style={styles.headerMeta}>
          <Pill label={`${viewModel.kpis.totalSupplierBids} supplier bids`} tone="indigo" />
          <Pill label={`${viewModel.kpis.totalAwardedBids} awarded`} tone="success" />
          <Pill label={`${viewModel.kpis.activeSuppliers} active suppliers`} tone="neutral" />
        </div>
      </AnalyticsCard>

      <div style={styles.kpiGrid} data-testid="parts-supplier-kpis">
        <MetricCard label="Total Supplier Bids" value={viewModel.kpis.totalSupplierBids} note="All submitted internal bids" testId="parts-supplier-kpi-bids" />
        <MetricCard label="Awarded Bids" value={viewModel.kpis.totalAwardedBids} note="Selected supplier bids" testId="parts-supplier-kpi-awarded" />
        <MetricCard label="Active Suppliers" value={viewModel.kpis.activeSuppliers} note="Distinct suppliers in scope" testId="parts-supplier-kpi-suppliers" />
        <MetricCard label="Average Delivery Time" value={viewModel.kpis.averageDeliveryDays === null ? "-" : `${viewModel.kpis.averageDeliveryDays.toFixed(1)}d`} note="Arrival cycle for awarded deliveries" testId="parts-supplier-kpi-delivery" />
        <MetricCard label="On-Time Delivery Rate" value={viewModel.kpis.onTimeDeliveryRatePct === null ? "-" : `${viewModel.kpis.onTimeDeliveryRatePct.toFixed(1)}%`} note="Delivered on or before quoted lead time" testId="parts-supplier-kpi-ontime" />
        <MetricCard label="Quote-to-Award Conversion" value={viewModel.kpis.quoteToAwardConversionPct === null ? "-" : `${viewModel.kpis.quoteToAwardConversionPct.toFixed(1)}%`} note="How often quoted bids become awards" testId="parts-supplier-kpi-conversion" />
      </div>

      <AnalyticsCard
        title="Analytics Filters"
        subtitle="Filter by supplier, request, category, brand, status, and date range."
        testId="parts-supplier-filters"
        right={<button type="button" style={styles.resetButton} onClick={resetFilters}>Reset Filters</button>}
      >
        <div style={{ ...styles.filterGrid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(4, minmax(0, 1fr))" }}>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Search</span>
            <input data-testid="parts-supplier-filter-search" style={styles.input} value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="Search supplier, request, vehicle, or part" />
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Supplier</span>
            <select data-testid="parts-supplier-filter-supplier" style={styles.select} value={filters.supplier} onChange={(e) => updateFilter("supplier", e.target.value)}>
              <option value="">All suppliers</option>
              {viewModel.supplierOptions.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Category</span>
            <select data-testid="parts-supplier-filter-category" style={styles.select} value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}>
              <option value="">All categories</option>
              {viewModel.categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Brand</span>
            <select data-testid="parts-supplier-filter-brand" style={styles.select} value={filters.brand} onChange={(e) => updateFilter("brand", e.target.value)}>
              <option value="">All brands</option>
              {viewModel.brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Request Status</span>
            <select data-testid="parts-supplier-filter-status" style={styles.select} value={filters.requestStatus} onChange={(e) => updateFilter("requestStatus", e.target.value)}>
              <option value="">All statuses</option>
              {viewModel.requestStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Date From</span>
            <input data-testid="parts-supplier-filter-date-from" type="date" style={styles.input} value={filters.dateFrom} onChange={(e) => updateFilter("dateFrom", e.target.value)} />
          </label>
          <label style={styles.filterField}>
            <span style={styles.filterLabel}>Date To</span>
            <input data-testid="parts-supplier-filter-date-to" type="date" style={styles.input} value={filters.dateTo} onChange={(e) => updateFilter("dateTo", e.target.value)} />
          </label>
          <label style={styles.checkboxField}>
            <input data-testid="parts-supplier-filter-awarded-only" type="checkbox" checked={filters.awardedOnly} onChange={(e) => updateFilter("awardedOnly", e.target.checked)} />
            <span>Awarded only</span>
          </label>
        </div>
      </AnalyticsCard>

      <div style={styles.analyticsGrid}>
        <div style={{ ...styles.column, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
          <AnalyticsCard
            title="Supplier Leaderboard"
            subtitle="Rank suppliers by submitted bids, wins, win rate, cost, and delivery behavior."
            testId="parts-supplier-leaderboard"
          >
            {viewModel.leaderboard.length === 0 ? (
              <div style={styles.emptyState}>No supplier leaderboard rows match the current filters.</div>
            ) : (
              <div style={styles.leaderList}>
                {viewModel.leaderboard.map((row) => (
                  <LeaderboardRow key={row.supplierName} row={row} selected={row.supplierName === selectedSupplierName} onClick={() => setSelectedSupplierName(row.supplierName)} />
                ))}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard
            title="Supplier Detail View"
            subtitle="Inspect recent bids, wins, categories, brands, and delivery performance for one supplier."
            testId="parts-supplier-detail"
            right={
              <select data-testid="parts-supplier-detail-select" style={styles.select} value={selectedSupplierName} onChange={(e) => setSelectedSupplierName(e.target.value)}>
                {viewModel.leaderboard.map((row) => <option key={row.supplierName} value={row.supplierName}>{row.supplierName}</option>)}
              </select>
            }
          >
            <DetailSupplierCard detail={selectedDetail} />
          </AnalyticsCard>
        </div>

        <div style={{ ...styles.column, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
          <AnalyticsCard
            title="Delivery Reliability"
            subtitle="Show ordered, shipped, arrived, delay, and on-time performance for awarded suppliers."
            testId="parts-supplier-delivery"
          >
            {viewModel.deliveryPerformance.length === 0 ? (
              <div style={styles.emptyState}>No delivery reliability data in the current scope.</div>
            ) : (
              <div style={styles.barList}>
                {viewModel.deliveryPerformance.map((row) => (
                  <div key={row.supplierName} style={styles.deliveryRow}>
                    <div style={styles.barRowTop}>
                      <strong>{row.supplierName}</strong>
                      <Pill label={row.onTimePercentage === null ? "-" : `${row.onTimePercentage.toFixed(1)}%`} tone="success" />
                    </div>
                    <div style={styles.smallStats}>
                      <span>Ordered: <strong>{row.orderedCount}</strong></span>
                      <span>Shipped: <strong>{row.shippedCount}</strong></span>
                      <span>Arrived: <strong>{row.arrivedCount}</strong></span>
                      <span>Delayed: <strong>{row.delayedDeliveries}</strong></span>
                      <span>Avg days: <strong>{row.averageDaysToArrival === null ? "-" : row.averageDaysToArrival.toFixed(1)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard
            title="Bid Comparison Analytics"
            subtitle="Compare lowest vs selected and fastest vs selected outcomes."
            testId="parts-supplier-bid-comparison"
          >
            <div style={styles.comparisonGrid}>
              <div style={styles.comparisonCard}><span>Avg bids / request</span><strong>{viewModel.bidComparison.averageBidsPerRequest.toFixed(1)}</strong></div>
              <div style={styles.comparisonCard}><span>Lowest not chosen</span><strong>{viewModel.bidComparison.lowestCostNotChosenCount}</strong></div>
              <div style={styles.comparisonCard}><span>Fastest not chosen</span><strong>{viewModel.bidComparison.fastestDeliveryNotChosenCount}</strong></div>
              <div style={styles.comparisonCard}><span>Selected vs lowest</span><strong>{viewModel.bidComparison.selectedVsLowestAverageDelta === null ? "-" : formatCurrency(viewModel.bidComparison.selectedVsLowestAverageDelta)}</strong></div>
              <div style={styles.comparisonCard}><span>Selected vs fastest</span><strong>{viewModel.bidComparison.selectedVsFastestAverageDelta === null ? "-" : `${viewModel.bidComparison.selectedVsFastestAverageDelta.toFixed(1)}d`}</strong></div>
              <div style={styles.comparisonCard}><span>Awarded requests</span><strong>{viewModel.bidComparison.awardedRequests}</strong></div>
            </div>
          </AnalyticsCard>

          <AnalyticsCard
            title="Cost Trend View"
            subtitle="Track average quoted cost by supplier, category, brand, and request month."
            testId="parts-supplier-cost-trends"
          >
            <div style={styles.trendSplit}>
              <div>
                <div style={styles.detailSectionTitle}>By Supplier</div>
                <div style={styles.barList}>
                  {viewModel.costTrends.bySupplier.slice(0, 5).map((row) => <BarRow key={row.label} label={row.label} count={row.count} averageCost={row.averageQuotedCost} averageDeliveryDays={row.averageDeliveryDays} />)}
                </div>
              </div>
              <div>
                <div style={styles.detailSectionTitle}>By Category</div>
                <div style={styles.barList}>
                  {viewModel.costTrends.byCategory.slice(0, 5).map((row) => <BarRow key={row.label} label={row.label} count={row.count} averageCost={row.averageQuotedCost} averageDeliveryDays={row.averageDeliveryDays} />)}
                </div>
              </div>
              <div>
                <div style={styles.detailSectionTitle}>By Brand</div>
                <div style={styles.barList}>
                  {viewModel.costTrends.byBrand.slice(0, 5).map((row) => <BarRow key={row.label} label={row.label} count={row.count} averageCost={row.averageQuotedCost} averageDeliveryDays={row.averageDeliveryDays} />)}
                </div>
              </div>
              <div>
                <div style={styles.detailSectionTitle}>By Period</div>
                <div style={styles.barList}>
                  {viewModel.costTrends.byPeriod.slice(0, 5).map((row) => <BarRow key={row.label} label={row.label} count={row.count} averageCost={row.averageQuotedCost} averageDeliveryDays={row.averageDeliveryDays} />)}
                </div>
              </div>
            </div>
          </AnalyticsCard>
        </div>
      </div>

      <div style={styles.analyticsGrid}>
        <div style={{ ...styles.column, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <AnalyticsCard
            title="Preferred Supplier Suggestions"
            subtitle="Deterministic guidance for the best price, delivery, and category performers."
            testId="parts-supplier-preferred-suggestions"
          >
            {viewModel.preferredSuggestions.length === 0 ? (
              <div style={styles.emptyState}>No preferred supplier suggestions available in the current filter scope.</div>
            ) : (
              <div style={styles.suggestionList}>
                {viewModel.preferredSuggestions.map((item) => <SuggestionCard key={item.id} item={item} />)}
              </div>
            )}
          </AnalyticsCard>
        </div>
        <div style={{ ...styles.column, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <AnalyticsCard
            title="Category Breakdown"
            subtitle="Count and cost summary by supplier-facing parts category."
            testId="parts-supplier-category-breakdown"
          >
            {viewModel.categoryBreakdown.length === 0 ? (
              <div style={styles.emptyState}>No category breakdown available.</div>
            ) : (
              <div style={styles.barList}>
                {viewModel.categoryBreakdown.map((row: SupplierCategoryBreakdownRow) => (
                  <BarRow key={row.category} label={row.category} count={row.count} averageCost={row.averageQuotedCost} averageDeliveryDays={row.averageDeliveryDays} />
                ))}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard
            title="Recent Supplier Activity"
            subtitle="Latest request and bid activity by supplier."
            testId="parts-supplier-activity"
          >
            {viewModel.recentActivity.length === 0 ? (
              <div style={styles.emptyState}>No supplier activity available.</div>
            ) : (
              <div style={styles.activityList}>
                {viewModel.recentActivity.slice(0, 5).map((row) => (
                  <div key={row.supplierName} style={styles.activityRow}>
                    <div style={styles.activityName}>{row.supplierName}</div>
                    <div style={styles.activityMeta}>{row.latestVehicleLabel}</div>
                    <div style={styles.activityMeta}>Requests: {row.recentRequestNumbers.join(", ")}</div>
                    <div style={styles.activityMeta}>Statuses: {row.recentStatuses.join(", ")}</div>
                    <div style={styles.activityDate}>{formatDateTime(row.lastActivityAt)}</div>
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
  cardTitle: { fontSize: 19, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 },
  cardSubtitle: { marginTop: 4, fontSize: 13, color: "#64748b", lineHeight: 1.5 },
  headerMeta: { display: "flex", flexWrap: "wrap", gap: 8 },
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
  filterField: { display: "flex", flexDirection: "column", gap: 6 },
  checkboxField: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
    alignSelf: "end",
    paddingBottom: 10,
  },
  filterLabel: { fontSize: 12, fontWeight: 700, color: "#374151" },
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
  column: { minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },
  leaderList: { display: "flex", flexDirection: "column", gap: 10 },
  leaderRow: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    background: "#fff",
    padding: 14,
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
  },
  leaderRowSelected: { borderColor: "rgba(29,78,216,0.48)", boxShadow: "0 0 0 2px rgba(29,78,216,0.08)" },
  leaderTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  leaderName: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  leaderSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  leaderStats: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, marginTop: 10, fontSize: 13, color: "#334155" },
  bidRow: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    background: "#fff",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  bidHeader: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  bidTitle: { fontSize: 15, fontWeight: 800, color: "#0f172a" },
  bidSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  bidPills: { display: "flex", gap: 8, flexWrap: "wrap" },
  bidMetaRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  bidGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, fontSize: 13, color: "#334155" },
  bidGridSpan: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
    fontSize: 13,
    color: "#334155",
  },
  detailCard: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 16,
    background: "#fff",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  detailHeader: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  detailTitle: { fontSize: 18, fontWeight: 800, color: "#0f172a" },
  detailSubtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  detailStats: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, fontSize: 13, color: "#334155" },
  detailStatsSmall: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    fontSize: 13,
    color: "#334155",
  },
  detailPills: { display: "flex", gap: 8, flexWrap: "wrap" },
  detailSplit: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 },
  detailSectionTitle: { fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 8 },
  detailList: { display: "flex", flexDirection: "column", gap: 10 },
  detailFooter: { display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12, color: "#64748b" },
  suggestionList: { display: "flex", flexDirection: "column", gap: 10 },
  suggestionCard: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    background: "#fff",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  suggestionTop: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  suggestionLabel: { fontSize: 14, fontWeight: 800, color: "#0f172a" },
  suggestionSupplier: { fontSize: 12, color: "#64748b", marginTop: 2 },
  suggestionReason: { fontSize: 13, color: "#334155", lineHeight: 1.5 },
  barList: { display: "flex", flexDirection: "column", gap: 10 },
  barRow: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    background: "#fff",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  barRowTop: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" },
  barCount: { fontSize: 12, fontWeight: 800, color: "#1d4ed8" },
  barTrack: { height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #1d4ed8 0%, #60a5fa 100%)" },
  barMeta: { display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#64748b" },
  comparisonGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 },
  comparisonCard: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    background: "#fff",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    color: "#64748b",
  },
  trendSplit: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 },
  activityList: { display: "flex", flexDirection: "column", gap: 10 },
  activityRow: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    background: "#fff",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  activityName: { fontSize: 14, fontWeight: 800, color: "#0f172a" },
  activityMeta: { fontSize: 12, color: "#64748b" },
  activityDate: { fontSize: 12, color: "#94a3b8" },
  emptyState: {
    background: "#f8fafc",
    border: "1px dashed rgba(148,163,184,0.45)",
    borderRadius: 14,
    padding: 14,
    color: "#64748b",
    fontSize: 13,
  },
  emptyHint: { fontSize: 12, color: "#94a3b8" },
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
  bidGridSpanTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
    fontSize: 13,
    color: "#334155",
  },
  smallStats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    fontSize: 12,
    color: "#64748b",
  },
  deliveryRow: {
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 14,
    background: "#fff",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};
