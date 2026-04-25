import type {
  MaintenanceInsight,
  TimelineCompletedItem,
  TimelineCounts,
  TimelineFiltersState,
  TimelineLatestCompletedItem,
  TimelineSortMode,
  TimelineUpcomingItem,
} from "./maintenanceHelpers";

export type BuildMaintenanceTimelineViewModelArgs = {
  vehicle: {
    vehicleId: string;
    plateNumber?: string;
    make?: string;
    model?: string;
    year?: number | string;
    currentMileage?: number;
  };
  upcomingItems: TimelineUpcomingItem[];
  completedItems: TimelineCompletedItem[];
  filters: TimelineFiltersState;
};

export type BuildMaintenanceTimelineViewModelResult = {
  filteredUpcomingItems: TimelineUpcomingItem[];
  filteredCompletedItems: TimelineCompletedItem[];
  counts: TimelineCounts;
  latestCompleted: TimelineLatestCompletedItem[];
  insights: MaintenanceInsight[];
  categoryOptions: string[];
};

export type FilterTimelineItemsArgs = {
  upcomingItems: TimelineUpcomingItem[];
  completedItems: TimelineCompletedItem[];
  filters: TimelineFiltersState;
};

export type SortTimelineItemsArgs = {
  upcoming: TimelineUpcomingItem[];
  completed: TimelineCompletedItem[];
  sort: TimelineSortMode;
};

export type ComputeTimelineCountsArgs = {
  upcoming: TimelineUpcomingItem[];
  completed: TimelineCompletedItem[];
};

export type GetLatestCompletedItemsArgs = {
  completedItems: TimelineCompletedItem[];
  limit?: number;
};

export type BuildMaintenanceInsightsArgs = {
  upcoming: TimelineUpcomingItem[];
  completed: TimelineCompletedItem[];
};

export type ExtractCategoryOptionsArgs = {
  upcoming: TimelineUpcomingItem[];
  completed: TimelineCompletedItem[];
};

function normalizeTimelineText(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compareText(a: string, b: string) {
  return a.localeCompare(b);
}

function compareDateDesc(a: string, b: string) {
  return b.localeCompare(a);
}

function compareDateAsc(a: string, b: string) {
  return a.localeCompare(b);
}

function getUpcomingPriority(status: TimelineUpcomingItem["status"]) {
  if (status === "overdue") return 0;
  if (status === "dueNow") return 1;
  return 2;
}

function getLeastUrgentPriority(status: TimelineUpcomingItem["status"]) {
  if (status === "dueSoon") return 0;
  if (status === "dueNow") return 1;
  return 2;
}

function getSortTimestamp(item: TimelineUpcomingItem) {
  return item.lastCompletedAt || "";
}

function getLatestCompletedServiceKey(completed: TimelineCompletedItem[]) {
  return new Set(completed.map((item) => normalizeTimelineText(item.serviceKey || item.title)));
}

function buildSearchHaystack(item: {
  title: string;
  serviceKey: string;
  category: string;
  repairOrderNumber?: string;
}) {
  return normalizeTimelineText([item.title, item.serviceKey, item.category, item.repairOrderNumber || ""].join(" "));
}

export function filterTimelineItems({ upcomingItems, completedItems, filters }: FilterTimelineItemsArgs) {
  const searchTerm = normalizeTimelineText(filters.search);
  const categoryFilter = String(filters.category || "All").trim();
  const categoryMatches = (category: string) => categoryFilter === "All" || categoryFilter === "All Categories" || (category || "General") === categoryFilter;

  const upcoming = upcomingItems.filter((item) => {
    const modeMatches =
      filters.mode === "all" ||
      filters.mode === "upcoming" ||
      filters.mode === item.status;

    return categoryMatches(item.category) && modeMatches && (!searchTerm || buildSearchHaystack({
      title: item.title,
      serviceKey: item.serviceKey,
      category: item.category,
      repairOrderNumber: item.repairOrderNumber,
    }).includes(searchTerm));
  });

  const completed = completedItems.filter((item) => {
    const modeMatches = filters.mode === "all" || filters.mode === "completed";

    return categoryMatches(item.category) && modeMatches && (!searchTerm || buildSearchHaystack({
      title: item.title,
      serviceKey: item.serviceKey,
      category: item.category,
      repairOrderNumber: item.repairOrderNumber,
    }).includes(searchTerm));
  });

  return {
    upcoming: [...upcoming],
    completed: [...completed],
  };
}

export function sortTimelineItems({ upcoming, completed, sort }: SortTimelineItemsArgs) {
  const nextUpcoming = [...upcoming];
  const nextCompleted = [...completed];

  if (sort === "priorityFirst") {
    nextUpcoming.sort((a, b) => {
      const priorityDiff = getUpcomingPriority(a.status) - getUpcomingPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;
      const kmDeltaA = a.kmDelta ?? Number.NEGATIVE_INFINITY;
      const kmDeltaB = b.kmDelta ?? Number.NEGATIVE_INFINITY;
      if (kmDeltaA !== kmDeltaB) return kmDeltaB - kmDeltaA;
      return compareText(a.title, b.title) || compareText(a.category, b.category);
    });
    nextCompleted.sort((a, b) => compareDateDesc(a.completedAt, b.completedAt) || compareText(a.title, b.title));
  } else if (sort === "newestActivity") {
    nextUpcoming.sort((a, b) => {
      return compareDateDesc(getSortTimestamp(a), getSortTimestamp(b)) || compareText(a.title, b.title);
    });
    nextCompleted.sort((a, b) => compareDateDesc(a.completedAt, b.completedAt) || compareText(a.title, b.title));
  } else {
    nextUpcoming.sort((a, b) => {
      const priorityDiff = getLeastUrgentPriority(a.status) - getLeastUrgentPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;
      return compareDateAsc(getSortTimestamp(a), getSortTimestamp(b)) || compareText(a.title, b.title);
    });
    nextCompleted.sort((a, b) => compareDateAsc(a.completedAt, b.completedAt) || compareText(a.title, b.title));
  }

  return {
    upcoming: nextUpcoming,
    completed: nextCompleted,
  };
}

export function computeTimelineCounts({ upcoming, completed }: ComputeTimelineCountsArgs): TimelineCounts {
  return {
    overdue: upcoming.filter((item) => item.status === "overdue").length,
    dueNow: upcoming.filter((item) => item.status === "dueNow").length,
    dueSoon: upcoming.filter((item) => item.status === "dueSoon").length,
    completed: completed.length,
    totalUpcoming: upcoming.length,
    totalVisible: upcoming.length + completed.length,
  };
}

export function getLatestCompletedItems({ completedItems, limit = 5 }: GetLatestCompletedItemsArgs): TimelineLatestCompletedItem[] {
  return [...completedItems]
    .sort((a, b) => compareDateDesc(a.completedAt, b.completedAt) || compareText(a.title, b.title))
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      title: item.title,
      completedAt: item.completedAt,
      repairOrderNumber: item.repairOrderNumber,
    }));
}

export function buildMaintenanceInsights({ upcoming, completed }: BuildMaintenanceInsightsArgs): MaintenanceInsight[] {
  const insights: MaintenanceInsight[] = [];
  const sortedUpcoming = sortTimelineItems({ upcoming, completed: [], sort: "priorityFirst" }).upcoming;
  const nextDue = sortedUpcoming[0];
  const mostOverdue = sortedUpcoming.find((item) => item.status === "overdue");
  const completedServiceKeys = getLatestCompletedServiceKey(completed);
  const hasEgrCleaning = Array.from(completedServiceKeys).some((key) => key.includes("egr") || key.includes("intake"));
  const recentCompleted = [...completed].sort((a, b) => compareDateDesc(a.completedAt, b.completedAt))[0];

  if (nextDue) {
    insights.push({
      id: "next-due",
      label: "Next due service",
      value: `${nextDue.title} is ${nextDue.status === "overdue" ? "overdue" : nextDue.status === "dueNow" ? "due now" : "due soon"}.`,
      tone: nextDue.status === "overdue" ? "critical" : nextDue.status === "dueNow" ? "warning" : "info",
    });
  }

  if (mostOverdue) {
    insights.push({
      id: "most-overdue",
      label: "Most overdue service",
      value: mostOverdue.dueSummaryText || `${mostOverdue.title} needs review.`,
      tone: "critical",
    });
  }

  if (!hasEgrCleaning) {
    insights.push({
      id: "missing-egr-cleaning",
      label: "Missing major service",
      value: "No recent EGR or intake cleaning was found in the completed history.",
      tone: "warning",
    });
  }

  insights.push({
    id: "recent-activity",
    label: "Recent activity",
    value: recentCompleted
      ? `${completed.length} completed service record(s), latest on ${recentCompleted.completedAt.slice(0, 10)}.`
      : "No completed service activity recorded yet.",
    tone: recentCompleted ? "good" : "neutral",
  });

  return insights;
}

export function extractCategoryOptions({ upcoming, completed }: ExtractCategoryOptionsArgs): string[] {
  const categories = new Set<string>();
  upcoming.forEach((item) => categories.add(item.category || "General"));
  completed.forEach((item) => categories.add(item.category || "General"));
  return ["All", ...Array.from(categories).sort(compareText)];
}

export function buildMaintenanceTimelineViewModel({
  vehicle,
  upcomingItems,
  completedItems,
  filters,
}: BuildMaintenanceTimelineViewModelArgs): BuildMaintenanceTimelineViewModelResult {
  const filteredItems = filterTimelineItems({
    upcomingItems,
    completedItems,
    filters,
  });
  const sortedItems = sortTimelineItems({
    upcoming: filteredItems.upcoming,
    completed: filteredItems.completed,
    sort: filters.sort,
  });
  const counts = computeTimelineCounts({
    upcoming: sortedItems.upcoming,
    completed: sortedItems.completed,
  });

  const baseInsights = buildMaintenanceInsights({
    upcoming: sortedItems.upcoming,
    completed: sortedItems.completed,
  });

  const contextualInsights = vehicle.vehicleId
    ? [
        {
          id: "vehicle-context",
          label: "Vehicle context",
          value: `${vehicle.plateNumber || vehicle.vehicleId}${vehicle.currentMileage != null ? ` at ${new Intl.NumberFormat("en-US").format(vehicle.currentMileage)} km` : ""}.`,
          tone: "neutral" as const,
        },
      ]
    : [];

  return {
    filteredUpcomingItems: sortedItems.upcoming,
    filteredCompletedItems: sortedItems.completed,
    counts,
    latestCompleted: getLatestCompletedItems({ completedItems: sortedItems.completed }),
    insights: [...contextualInsights, ...baseInsights],
    categoryOptions: extractCategoryOptions({ upcoming: upcomingItems, completed: completedItems }),
  };
}
