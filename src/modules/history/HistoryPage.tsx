import React, { useEffect, useMemo, useState } from "react";
import {
  buildReportSnapshot,
  buildServiceHistoryCsv,
  buildServiceHistorySummary,
  getFilteredServiceHistory,
  getVehicleServiceHistory,
  getUpcomingMaintenance,
  toTimelineCompletedItem,
  toTimelineUpcomingItem,
  type TimelineFiltersState,
  type TimelineGroupMode,
  type TimelineSortMode,
  type TimelineVehicleSummary,
} from "../maintenance/maintenanceHelpers";
import { MaintenanceTimeline } from "../maintenance/MaintenanceTimeline";
import { buildMaintenanceTimelineViewModel } from "../maintenance/timelineHelpers";
import { ReportBuilderPanel } from "../ai/ReportBuilderPanel";
import { OPENAI_ASSIST_LOG_STORAGE_KEY, type OpenAiAssistLogEntry } from "../ai/openaiAssist";
import type {
  SessionUser,
  IntakeRecord,
  InspectionRecord,
  RepairOrderRecord,
  QCRecord,
  ReleaseRecord,
  ApprovalRecord,
  BackjobRecord,
  InvoiceRecord,
  PaymentRecord,
  MaintenanceIntervalRuleRecord,
  VehicleServiceHistoryRecord,
} from "../shared/types";
import { formatDateTime, getResponsiveSpan, formatCurrency, parseMoneyInput } from "../shared/helpers";

type HistoryTimelineRow = {
  id: string;
  vehicleKey: string;
  plateNumber: string;
  conductionNumber: string;
  vehicleLabel: string;
  date: string;
  type: string;
  number: string;
  odometerKm: string;
  status: string;
  summary: string;
};

type VehicleHistoryGroup = {
  vehicleKey: string;
  plateNumber: string;
  conductionNumber: string;
  vehicleLabel: string;
  latestOdometerKm: string;
  lastVisitAt: string;
  totalVisits: number;
  activeJobCount: number;
  rows: HistoryTimelineRow[];
};

function normalizeVehicleKey(plateNumber: string, conductionNumber: string) {
  const normalizedPlate = (plateNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const normalizedConduction = (conductionNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return normalizedPlate || normalizedConduction || "";
}

function getVehicleAccountLabel(record: { companyName: string; customerName: string }) {
  return record.companyName || record.customerName || "Unknown Customer";
}

type ServiceHistoryReportMode = "Per Vehicle" | "Date Range";

type ServiceHistoryReportRow = {
  id: string;
  vehicleKey: string;
  plateNumber: string;
  customerLabel: string;
  vehicleLabel: string;
  roId: string;
  roNumber: string;
  serviceKey: string;
  title: string;
  category: string;
  completedAt: string;
  odometerAtCompletion: string;
  historyOrigin: "Writeback" | "Seeded / Demo";
  sourceTypeLabel: string;
};

type ServiceHistoryVehicleOption = {
  vehicleKey: string;
  plateNumber: string;
  customerLabel: string;
  vehicleLabel: string;
  count: number;
};

type VehicleMaintenanceTimelineCompletedItem = ServiceHistoryReportRow & {
  timelineStatus: "Completed";
};

type VehicleMaintenanceTimelineUpcomingItem = {
  id: string;
  vehicleKey: string;
  plateNumber: string;
  customerLabel: string;
  vehicleLabel: string;
  roNumber: string;
  serviceKey: string;
  title: string;
  category: string;
  dueBasis: string;
  timelineStatus: "Due Soon" | "Due Now" | "Overdue";
  dueReason: string;
  nextDueDate: string;
  nextDueOdometer: string;
  lastCompletedAt: string;
  lastCompletedOdometer: string;
  sourceTypeLabel: string;
};

type VehicleMaintenanceTimelineData = {
  completed: VehicleMaintenanceTimelineCompletedItem[];
  upcoming: VehicleMaintenanceTimelineUpcomingItem[];
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function downloadTextFile(filename: string, content: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function buildVehicleHistoryGroups({
  intakeRecords,
  inspectionRecords,
  repairOrders,
  qcRecords,
  releaseRecords,
  approvalRecords,
  backjobRecords,
  invoiceRecords,
  paymentRecords,
}: {
  intakeRecords: IntakeRecord[];
  inspectionRecords: InspectionRecord[];
  repairOrders: RepairOrderRecord[];
  qcRecords: QCRecord[];
  releaseRecords: ReleaseRecord[];
  approvalRecords: ApprovalRecord[];
  backjobRecords: BackjobRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
}) {
  const groups = new Map<string, VehicleHistoryGroup>();

  const ensureGroup = (input: {
    plateNumber?: string;
    conductionNumber?: string;
    vehicleLabel?: string;
  }) => {
    const vehicleKey = normalizeVehicleKey(input.plateNumber ?? "", input.conductionNumber ?? "");
    if (!vehicleKey) return null;
    const existing = groups.get(vehicleKey);
    if (existing) {
      if (!existing.plateNumber && input.plateNumber) existing.plateNumber = input.plateNumber;
      if (!existing.conductionNumber && input.conductionNumber) existing.conductionNumber = input.conductionNumber;
      if ((!existing.vehicleLabel || existing.vehicleLabel === "Unknown Vehicle") && input.vehicleLabel) {
        existing.vehicleLabel = input.vehicleLabel;
      }
      return existing;
    }
    const created: VehicleHistoryGroup = {
      vehicleKey,
      plateNumber: input.plateNumber ?? "",
      conductionNumber: input.conductionNumber ?? "",
      vehicleLabel: input.vehicleLabel ?? "Unknown Vehicle",
      latestOdometerKm: "",
      lastVisitAt: "",
      totalVisits: 0,
      activeJobCount: 0,
      rows: [],
    };
    groups.set(vehicleKey, created);
    return created;
  };

  const pushRow = (group: VehicleHistoryGroup | null, row: Omit<HistoryTimelineRow, "id" | "vehicleKey" | "plateNumber" | "conductionNumber" | "vehicleLabel">) => {
    if (!group) return;
    group.rows.push({
      id: `${row.type}-${row.number}-${row.date}`,
      vehicleKey: group.vehicleKey,
      plateNumber: group.plateNumber,
      conductionNumber: group.conductionNumber,
      vehicleLabel: group.vehicleLabel,
      ...row,
    });
    group.totalVisits = group.rows.length;
    if (!group.lastVisitAt || row.date > group.lastVisitAt) group.lastVisitAt = row.date;
    if (row.odometerKm && (!group.latestOdometerKm || row.date >= group.lastVisitAt)) {
      group.latestOdometerKm = row.odometerKm;
    }
  };

  intakeRecords.forEach((row) => {
    const group = ensureGroup({
      plateNumber: row.plateNumber,
      conductionNumber: row.conductionNumber,
      vehicleLabel: [row.make, row.model, row.year].filter(Boolean).join(" ") || "Intake Vehicle",
    });
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Intake",
      number: row.intakeNumber,
      odometerKm: row.odometerKm,
      status: row.status,
      summary: row.concern || row.notes || getVehicleAccountLabel({ companyName: row.companyName, customerName: row.customerName }),
    });
  });

  inspectionRecords.forEach((row) => {
    const group = ensureGroup({
      plateNumber: row.plateNumber,
      conductionNumber: row.conductionNumber,
      vehicleLabel: [row.make, row.model, row.year].filter(Boolean).join(" ") || "Inspection Vehicle",
    });
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Inspection",
      number: row.inspectionNumber,
      odometerKm: row.odometerKm,
      status: row.status,
      summary: row.concern || row.inspectionNotes || row.recommendedWork || "Inspection record",
    });
  });

  repairOrders.forEach((row) => {
    const group = ensureGroup({
      plateNumber: row.plateNumber,
      conductionNumber: row.conductionNumber,
      vehicleLabel: [row.make, row.model, row.year].filter(Boolean).join(" ") || "RO Vehicle",
    });
    if (group && !["Released", "Closed"].includes(row.status)) group.activeJobCount += 1;
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Repair Order",
      number: row.roNumber,
      odometerKm: row.odometerKm,
      status: row.status,
      summary: row.customerConcern || row.accountLabel || "Repair order",
    });
  });

  qcRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "QC Vehicle",
    });
    pushRow(group, {
      date: row.createdAt,
      type: "QC",
      number: row.qcNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.result,
      summary: row.notes || row.roNumber,
    });
  });

  releaseRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "Release Vehicle",
    });
    pushRow(group, {
      date: row.createdAt,
      type: "Release",
      number: row.releaseNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.paymentSettled ? "Paid" : "Pending Payment",
      summary: row.releaseSummary || row.roNumber,
    });
  });

  approvalRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "Approval Vehicle",
    });
    pushRow(group, {
      date: row.createdAt,
      type: "Approval",
      number: row.approvalNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.items.some((item) => item.decision === "Approved") ? "Approved Items" : "Review",
      summary: row.summary || row.communicationHook || row.roNumber,
    });
  });

  backjobRecords.forEach((row) => {
    const linkedRo = repairOrders.find((item) => item.id === row.linkedRoId);
    const group = ensureGroup({
      plateNumber: row.plateNumber || linkedRo?.plateNumber || "",
      conductionNumber: linkedRo?.conductionNumber ?? "",
      vehicleLabel: linkedRo ? [linkedRo.make, linkedRo.model, linkedRo.year].filter(Boolean).join(" ") : "Backjob Vehicle",
    });
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Backjob",
      number: row.backjobNumber,
      odometerKm: linkedRo?.odometerKm ?? "",
      status: row.status,
      summary: row.complaint || row.findings || row.rootCause || row.linkedRoNumber,
    });
  });

  invoiceRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "Invoice Vehicle",
    });
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Invoice",
      number: row.invoiceNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.paymentStatus,
      summary: formatCurrency(parseMoneyInput(row.totalAmount)),
    });
  });

  paymentRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "Payment Vehicle",
    });
    pushRow(group, {
      date: row.createdAt,
      type: "Payment",
      number: row.paymentNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.method,
      summary: formatCurrency(parseMoneyInput(row.amount)),
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    rows: group.rows.sort((a, b) => b.date.localeCompare(a.date)),
  })).sort((a, b) => (b.lastVisitAt || "").localeCompare(a.lastVisitAt || ""));
}

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{title}</div>
          {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

function HistoryPage({
  currentUser,
  intakeRecords,
  inspectionRecords,
  repairOrders,
  qcRecords,
  releaseRecords,
  approvalRecords,
  backjobRecords,
  invoiceRecords,
  paymentRecords,
  serviceHistoryRecords,
  maintenanceIntervalRules,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  intakeRecords: IntakeRecord[];
  inspectionRecords: InspectionRecord[];
  repairOrders: RepairOrderRecord[];
  qcRecords: QCRecord[];
  releaseRecords: ReleaseRecord[];
  approvalRecords: ApprovalRecord[];
  backjobRecords: BackjobRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
  serviceHistoryRecords: VehicleServiceHistoryRecord[];
  maintenanceIntervalRules: MaintenanceIntervalRuleRecord[];
  isCompactLayout: boolean;
}) {
  const [search, setSearch] = useState("");
  const [serviceHistoryCategoryFilter, setServiceHistoryCategoryFilter] = useState("All Categories");
  const [serviceHistoryDateFromFilter, setServiceHistoryDateFromFilter] = useState("");
  const [serviceHistoryDateToFilter, setServiceHistoryDateToFilter] = useState("");
  const [serviceHistoryRoFilter, setServiceHistoryRoFilter] = useState("");
  const [serviceHistoryKeywordFilter, setServiceHistoryKeywordFilter] = useState("");
  const [serviceHistoryReportMode, setServiceHistoryReportMode] = useState<ServiceHistoryReportMode>("Per Vehicle");
  const [serviceHistoryReportVehicleKey, setServiceHistoryReportVehicleKey] = useState("");
  const [serviceHistoryReportPlateFilter, setServiceHistoryReportPlateFilter] = useState("");
  const [serviceHistoryReportCustomerFilter, setServiceHistoryReportCustomerFilter] = useState("");
  const [serviceHistoryReportCategoryFilter, setServiceHistoryReportCategoryFilter] = useState("All Categories");
  const [serviceHistoryReportServiceFilter, setServiceHistoryReportServiceFilter] = useState("");
  const [serviceHistoryReportRoFilter, setServiceHistoryReportRoFilter] = useState("");
  const [serviceHistoryReportDateFromFilter, setServiceHistoryReportDateFromFilter] = useState("");
  const [serviceHistoryReportDateToFilter, setServiceHistoryReportDateToFilter] = useState("");
  const [serviceHistoryReportPrintPreview, setServiceHistoryReportPrintPreview] = useState(false);
  const [maintenanceTimelineSearch, setMaintenanceTimelineSearch] = useState("");
  const [maintenanceTimelineStatusFilter, setMaintenanceTimelineStatusFilter] = useState<TimelineFiltersState["mode"]>("all");
  const [maintenanceTimelineSort, setMaintenanceTimelineSort] = useState<TimelineSortMode>("priorityFirst");
  const [maintenanceTimelineCategoryFilter, setMaintenanceTimelineCategoryFilter] = useState("All");
  const [maintenanceTimelineGroupBy, setMaintenanceTimelineGroupBy] = useState<TimelineGroupMode>("none");
  const [openAiAssistLogs, setOpenAiAssistLogs] = useState<OpenAiAssistLogEntry[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = window.localStorage.getItem(OPENAI_ASSIST_LOG_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as OpenAiAssistLogEntry[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(OPENAI_ASSIST_LOG_STORAGE_KEY, JSON.stringify(openAiAssistLogs));
    } catch {
      // Advisory only.
    }
  }, [openAiAssistLogs]);

  const groups = useMemo(
    () =>
      buildVehicleHistoryGroups({
        intakeRecords,
        inspectionRecords,
        repairOrders,
        qcRecords,
        releaseRecords,
        approvalRecords,
        backjobRecords,
        invoiceRecords,
        paymentRecords,
      }),
    [intakeRecords, inspectionRecords, repairOrders, qcRecords, releaseRecords, approvalRecords, backjobRecords, invoiceRecords, paymentRecords]
  );

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups.filter((group) =>
      [
        group.plateNumber,
        group.conductionNumber,
        group.vehicleLabel,
        ...group.rows.flatMap((row) => [row.number, row.summary, row.status, row.type]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [groups, search]);

  const [selectedVehicleKey, setSelectedVehicleKey] = useState("");
  const selectedGroup = filteredGroups.find((group) => group.vehicleKey === selectedVehicleKey) ?? filteredGroups[0] ?? null;
  const selectedVehicleServiceHistory = useMemo(
    () => (selectedGroup ? getVehicleServiceHistory(selectedGroup.vehicleKey, serviceHistoryRecords, repairOrders) : []),
    [selectedGroup, serviceHistoryRecords, repairOrders]
  );

  const serviceHistoryReportSnapshot = useMemo(
    () => buildReportSnapshot({ serviceHistoryRecords, repairOrders }),
    [serviceHistoryRecords, repairOrders]
  );

  const serviceHistoryReportRows = serviceHistoryReportSnapshot.rows;
  const serviceHistoryReportVehicleOptions = serviceHistoryReportSnapshot.vehicleOptions;
  const serviceHistoryReportCategoryOptions = serviceHistoryReportSnapshot.categoryOptions;

  const serviceHistoryCategories = useMemo(() => {
    const categories = new Set<string>();
    selectedVehicleServiceHistory.forEach((row) => {
      categories.add(row.category?.trim() || "General");
    });
    return ["All Categories", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
  }, [selectedVehicleServiceHistory]);

  const filteredServiceHistory = useMemo(() => {
    return getFilteredServiceHistory(selectedVehicleServiceHistory, {
      category: serviceHistoryCategoryFilter,
      roNumber: serviceHistoryRoFilter,
      serviceTerm: serviceHistoryKeywordFilter,
      dateFrom: serviceHistoryDateFromFilter,
      dateTo: serviceHistoryDateToFilter,
    });
  }, [
    selectedVehicleServiceHistory,
    serviceHistoryCategoryFilter,
    serviceHistoryDateFromFilter,
    serviceHistoryDateToFilter,
    serviceHistoryRoFilter,
    serviceHistoryKeywordFilter,
  ]);

  useEffect(() => {
    if (selectedGroup && selectedVehicleKey !== selectedGroup.vehicleKey) {
      setSelectedVehicleKey(selectedGroup.vehicleKey);
    }
  }, [selectedGroup, selectedVehicleKey]);

  const selectedVehicleRepairOrder = useMemo(() => {
    if (!selectedGroup) return null;
    return repairOrders
      .filter((row) => normalizeVehicleKey(row.plateNumber, row.conductionNumber) === selectedGroup.vehicleKey)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  }, [repairOrders, selectedGroup]);

  const timelineCurrentMileage = useMemo(() => {
    const rawValue = selectedVehicleRepairOrder?.odometerKm || selectedGroup?.latestOdometerKm || "";
    const parsed = Number(String(rawValue).replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [selectedGroup?.latestOdometerKm, selectedVehicleRepairOrder?.odometerKm]);

  const maintenanceTimelineVehicle: TimelineVehicleSummary = useMemo(
    () => ({
      vehicleId: selectedGroup?.vehicleKey || "",
      plateNumber: selectedGroup?.plateNumber || selectedGroup?.conductionNumber || undefined,
      make: selectedVehicleRepairOrder?.make || undefined,
      model: selectedVehicleRepairOrder?.model || undefined,
      year: selectedVehicleRepairOrder?.year || undefined,
      customerName: selectedVehicleRepairOrder?.accountLabel || selectedVehicleRepairOrder?.customerName || selectedGroup?.vehicleLabel || "Unknown Customer",
      currentMileage: timelineCurrentMileage,
    }),
    [selectedGroup, selectedVehicleRepairOrder, timelineCurrentMileage]
  );

  const selectedVehicleTimeline = useMemo(
    () =>
      selectedGroup
        ? getUpcomingMaintenance({
            selectedVehicleKey: selectedGroup.vehicleKey,
            selectedVehicleLabel: selectedGroup.vehicleLabel,
            selectedPlateNumber: selectedGroup.plateNumber,
            selectedCustomerLabel: selectedVehicleRepairOrder?.accountLabel || selectedVehicleRepairOrder?.customerName || "Unknown Customer",
            selectedVehicleMake: selectedVehicleRepairOrder?.make || "",
            selectedVehicleModel: selectedVehicleRepairOrder?.model || "",
            selectedVehicleYear: selectedVehicleRepairOrder?.year || "",
            currentOdometer: selectedVehicleRepairOrder?.odometerKm || selectedGroup.latestOdometerKm || "",
            serviceHistoryRows: serviceHistoryReportRows,
            maintenanceIntervalRules,
          })
        : { completed: [], upcoming: [] },
    [
      maintenanceIntervalRules,
      selectedGroup,
      selectedVehicleRepairOrder,
      selectedGroup?.latestOdometerKm,
      serviceHistoryReportRows,
    ]
  );

  const maintenanceTimelineUpcomingItems = useMemo(
    () => selectedVehicleTimeline.upcoming.map((row) => toTimelineUpcomingItem(row, maintenanceTimelineVehicle)),
    [maintenanceTimelineVehicle, selectedVehicleTimeline.upcoming]
  );

  const maintenanceTimelineCompletedItems = useMemo(
    () => selectedVehicleTimeline.completed.map((row) => toTimelineCompletedItem(row)),
    [selectedVehicleTimeline.completed]
  );

  const maintenanceTimelineFilters: TimelineFiltersState = useMemo(
    () => ({
      search: maintenanceTimelineSearch,
      category: maintenanceTimelineCategoryFilter,
      mode: maintenanceTimelineStatusFilter,
      sort: maintenanceTimelineSort,
      groupBy: maintenanceTimelineGroupBy,
    }),
    [maintenanceTimelineCategoryFilter, maintenanceTimelineGroupBy, maintenanceTimelineSearch, maintenanceTimelineSort, maintenanceTimelineStatusFilter]
  );

  const maintenanceTimelineViewModel = useMemo(
    () =>
      buildMaintenanceTimelineViewModel({
        vehicle: maintenanceTimelineVehicle,
        upcomingItems: maintenanceTimelineUpcomingItems,
        completedItems: maintenanceTimelineCompletedItems,
        filters: maintenanceTimelineFilters,
      }),
    [maintenanceTimelineCompletedItems, maintenanceTimelineFilters, maintenanceTimelineUpcomingItems, maintenanceTimelineVehicle]
  );

  const reportBuilderSourceData = useMemo(
    () => ({
      vehicle: maintenanceTimelineVehicle,
      repairOrders,
      inspectionRecords,
      qcRecords,
      releaseRecords,
      backjobRecords,
      maintenanceTimeline: selectedVehicleTimeline,
    }),
    [backjobRecords, inspectionRecords, maintenanceTimelineVehicle, qcRecords, repairOrders, releaseRecords, selectedVehicleTimeline]
  );

  useEffect(() => {
    if (serviceHistoryReportMode === "Per Vehicle" && !serviceHistoryReportVehicleKey && serviceHistoryReportVehicleOptions[0]) {
      setServiceHistoryReportVehicleKey(serviceHistoryReportVehicleOptions[0].vehicleKey);
    }
  }, [serviceHistoryReportMode, serviceHistoryReportVehicleKey, serviceHistoryReportVehicleOptions]);

  const filteredServiceHistoryReportRows = useMemo(() => {
    return getFilteredServiceHistory(serviceHistoryReportRows, {
      vehicleKey: serviceHistoryReportVehicleKey,
      plateNumber: serviceHistoryReportPlateFilter,
      customerLabel: serviceHistoryReportCustomerFilter,
      category: serviceHistoryReportCategoryFilter,
      serviceTerm: serviceHistoryReportServiceFilter,
      roNumber: serviceHistoryReportRoFilter,
      dateFrom: serviceHistoryReportDateFromFilter,
      dateTo: serviceHistoryReportDateToFilter,
    });
  }, [
    serviceHistoryReportRows,
    serviceHistoryReportVehicleKey,
    serviceHistoryReportPlateFilter,
    serviceHistoryReportCustomerFilter,
    serviceHistoryReportCategoryFilter,
    serviceHistoryReportServiceFilter,
    serviceHistoryReportRoFilter,
    serviceHistoryReportDateFromFilter,
    serviceHistoryReportDateToFilter,
  ]);

  const serviceHistoryReportSummary = useMemo(
    () => buildServiceHistorySummary(filteredServiceHistoryReportRows),
    [filteredServiceHistoryReportRows]
  );

  const handleServiceHistoryCsvExport = () => {
    const csv = buildServiceHistoryCsv(filteredServiceHistoryReportRows);
    const filenameDate = new Date().toISOString().slice(0, 10);
    downloadTextFile(`service-history-report-${filenameDate}.csv`, csv, "text/csv;charset=utf-8");
  };

  const handleServiceHistoryPrint = () => {
    window.print();
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
          <Card
            title="History Lookup Center"
            subtitle="Search customer or vehicle history without opening intake"
            right={<span style={styles.statusInfo}>{filteredGroups.length} vehicle(s)</span>}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Search</label>
              <input
                style={styles.input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Plate, customer, company, phone, email, RO, concern"
              />
            </div>

            <div style={styles.mobileCardList}>
              {filteredGroups.length === 0 ? (
                <div style={styles.emptyState}>No matching vehicle history found.</div>
              ) : (
                filteredGroups.map((group) => (
                  <button
                    key={group.vehicleKey}
                    type="button"
                    onClick={() => setSelectedVehicleKey(group.vehicleKey)}
                    style={{
                      ...styles.mobileDataCard,
                      ...(selectedGroup?.vehicleKey === group.vehicleKey ? styles.selectedQueueCard : {}),
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={styles.mobileDataCardHeader}>
                      <strong>{group.plateNumber || group.conductionNumber || group.vehicleKey}</strong>
                      <span style={styles.statusInfo}>{group.totalVisits} visit(s)</span>
                    </div>
                    <div style={styles.mobileDataPrimary}>{group.vehicleLabel}</div>
                    <div style={styles.mobileMetaRow}><span>Last Visit</span><strong>{formatDateTime(group.lastVisitAt)}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Latest Odometer</span><strong>{group.latestOdometerKm || "-"}</strong></div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }}>
          <Card
            title={selectedGroup ? `Vehicle Timeline - ${selectedGroup.plateNumber || selectedGroup.conductionNumber || selectedGroup.vehicleKey}` : "Vehicle Timeline"}
            subtitle="Newest transaction first with odometer and status shown"
            right={selectedGroup ? <span style={styles.statusInfo}>{selectedGroup.vehicleLabel}</span> : undefined}
          >
            {!selectedGroup ? (
              <div style={styles.emptyState}>Select a vehicle to review its history.</div>
            ) : (
              <div style={styles.formStack}>
                <div style={styles.sectionCardMuted}>
                  <div style={styles.quickAccessList}>
                    <div style={styles.quickAccessRow}><span>Plate Number</span><strong>{selectedGroup.plateNumber || "-"}</strong></div>
                    <div style={styles.quickAccessRow}><span>Conduction Number</span><strong>{selectedGroup.conductionNumber || "-"}</strong></div>
                    <div style={styles.quickAccessRow}><span>Latest Odometer</span><strong>{selectedGroup.latestOdometerKm || "-"}</strong></div>
                    <div style={styles.quickAccessRow}><span>Active Jobs</span><strong>{selectedGroup.activeJobCount}</strong></div>
                  </div>
                </div>

                <div style={styles.mobileCardList}>
                  {selectedGroup.rows.map((row, index) => (
                    <div key={`${row.number}_${index}`} style={styles.mobileDataCard}>
                      <div style={styles.mobileDataCardHeader}>
                        <strong>{row.type}</strong>
                        <span style={styles.statusInfo}>{row.status || "-"}</span>
                      </div>
                      <div style={styles.mobileDataPrimary}>{row.number || "-"}</div>
                      <div style={styles.mobileMetaRow}><span>Date</span><strong>{formatDateTime(row.date)}</strong></div>
                      <div style={styles.mobileMetaRow}><span>Odometer</span><strong>{row.odometerKm || "-"}</strong></div>
                      <div style={styles.formHint}>{row.summary || "-"}</div>
                    </div>
                  ))}
                </div>

                <div style={{ ...styles.sectionCardMuted, marginTop: 12 }} data-testid="vehicle-service-history-panel">
                  <div style={styles.mobileDataCardHeader}>
                    <div>
                      <div style={styles.sectionTitle}>Vehicle Service History</div>
                      <div style={styles.formHint}>Read-only completed service history for the selected vehicle. Newest entries show first.</div>
                    </div>
                    <span style={filteredServiceHistory.length ? styles.statusOk : styles.statusInfo}>
                      {filteredServiceHistory.length}/{selectedVehicleServiceHistory.length} record(s)
                    </span>
                  </div>

                  <div style={styles.sectionCardMutedInner}>
                    <div style={styles.formStack}>
                      <div style={styles.formGrid3}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Category</label>
                          <select
                            data-testid="vehicle-service-history-filter-category"
                            style={styles.select}
                            value={serviceHistoryCategoryFilter}
                            onChange={(e) => setServiceHistoryCategoryFilter(e.target.value)}
                          >
                            {serviceHistoryCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>RO Number</label>
                          <input
                            data-testid="vehicle-service-history-filter-ro"
                            style={styles.input}
                            value={serviceHistoryRoFilter}
                            onChange={(e) => setServiceHistoryRoFilter(e.target.value)}
                            placeholder="Search RO no."
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Keyword</label>
                          <input
                            data-testid="vehicle-service-history-filter-keyword"
                            style={styles.input}
                            value={serviceHistoryKeywordFilter}
                            onChange={(e) => setServiceHistoryKeywordFilter(e.target.value)}
                            placeholder="Title, service key, category"
                          />
                        </div>
                      </div>

                      <div style={styles.formGrid2}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Date From</label>
                          <input
                            data-testid="vehicle-service-history-filter-date-from"
                            type="date"
                            style={styles.input}
                            value={serviceHistoryDateFromFilter}
                            onChange={(e) => setServiceHistoryDateFromFilter(e.target.value)}
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Date To</label>
                          <input
                            data-testid="vehicle-service-history-filter-date-to"
                            type="date"
                            style={styles.input}
                            value={serviceHistoryDateToFilter}
                            onChange={(e) => setServiceHistoryDateToFilter(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedVehicleServiceHistory.length === 0 ? (
                    <div style={styles.emptyState}>No completed service history has been written back for this vehicle yet.</div>
                  ) : filteredServiceHistory.length === 0 ? (
                    <div style={styles.emptyState}>No service history entries match the current filters.</div>
                  ) : (
                    <div style={styles.mobileCardList}>
                      {filteredServiceHistory.map((record) => (
                        <div key={record.id} style={styles.mobileDataCard} data-testid={`vehicle-service-history-entry-${record.id}`}>
                          <div style={styles.mobileDataCardHeader}>
                            <strong>{record.title}</strong>
                            <span style={record.historyOrigin === "Seeded / Demo" ? styles.statusWarning : styles.statusInfo}>
                              {record.historyOrigin ?? "Writeback"}
                            </span>
                          </div>
                          <div style={styles.mobileDataSecondary}>
                            RO {record.roNumber} | {record.category || "General"} | {record.serviceKey || "service"}
                          </div>
                          <div style={styles.chipWrap}>
                            <span style={styles.tagNeutral}>{record.sourceTypeLabel}</span>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Completed</span>
                            <strong>{formatDateTime(record.completedAt)}</strong>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Repair Order</span>
                            <strong>{record.roNumber || "-"}</strong>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Odometer</span>
                            <strong>{record.odometerAtCompletion || "-"}</strong>
                          </div>
                          <div style={styles.formHint}>Vehicle key: {record.vehicleKey}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <ReportBuilderPanel
                    currentUserRole={currentUser.role}
                    currentUserName={currentUser.fullName}
                    moduleKey="reports"
                    sourceData={reportBuilderSourceData}
                    logs={openAiAssistLogs}
                    setLogs={setOpenAiAssistLogs}
                    testIdPrefix="ai-report"
                  />
                </div>

                <div style={{ ...styles.sectionCardMuted, marginTop: 12 }} data-testid="service-history-report-panel">
                  <div style={styles.mobileDataCardHeader}>
                    <div>
                      <div style={styles.sectionTitle}>Service History Report</div>
                      <div style={styles.formHint}>
                        Read-only reporting view with filters, summary stats, CSV export, and a print-friendly preview.
                      </div>
                    </div>
                    <span style={filteredServiceHistoryReportRows.length ? styles.statusOk : styles.statusInfo}>
                      {filteredServiceHistoryReportRows.length} filtered record(s)
                    </span>
                  </div>

                  <div style={styles.sectionCardMutedInner}>
                    <div style={styles.reportActionRow}>
                      <div style={styles.chipWrap}>
                        <button
                          type="button"
                          style={{
                            ...styles.smallButton,
                            ...(serviceHistoryReportMode === "Per Vehicle" ? styles.smallButtonActive : {}),
                          }}
                          onClick={() => setServiceHistoryReportMode("Per Vehicle")}
                          data-testid="service-history-report-mode-per-vehicle"
                        >
                          Per Vehicle
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.smallButton,
                            ...(serviceHistoryReportMode === "Date Range" ? styles.smallButtonActive : {}),
                          }}
                          onClick={() => {
                            setServiceHistoryReportMode("Date Range");
                            if (!serviceHistoryReportVehicleKey) {
                              setServiceHistoryReportVehicleKey("");
                            }
                          }}
                          data-testid="service-history-report-mode-date-range"
                        >
                          Date Range
                        </button>
                      </div>

                      <div style={styles.chipWrap}>
                        <button
                          type="button"
                          style={styles.smallButtonMuted}
                          onClick={handleServiceHistoryCsvExport}
                          data-testid="service-history-report-export-csv"
                        >
                          Export CSV
                        </button>
                        <button
                          type="button"
                          style={styles.smallButtonMuted}
                          onClick={handleServiceHistoryPrint}
                          data-testid="service-history-report-print"
                        >
                          Print
                        </button>
                        <button
                          type="button"
                          style={styles.smallButtonMuted}
                          onClick={() => setServiceHistoryReportPrintPreview((prev) => !prev)}
                          data-testid="service-history-report-print-preview"
                        >
                          {serviceHistoryReportPrintPreview ? "Close Preview" : "Print Preview"}
                        </button>
                      </div>
                    </div>

                    <div style={styles.formHint}>
                      {serviceHistoryReportMode === "Per Vehicle"
                        ? "Per vehicle mode focuses the report on one vehicle, while date range mode lets you review wider service activity."
                        : "Date range mode highlights completed services across the fleet while still allowing optional vehicle filtering."}
                    </div>

                    <div style={{ ...styles.formStack, marginTop: 12 }}>
                      <div style={styles.formGrid3}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Report Mode</label>
                          <select
                            data-testid="service-history-report-mode"
                            style={styles.select}
                            value={serviceHistoryReportMode}
                            onChange={(e) => {
                              const nextMode = e.target.value as ServiceHistoryReportMode;
                              setServiceHistoryReportMode(nextMode);
                              if (nextMode === "Date Range") {
                                setServiceHistoryReportVehicleKey("");
                              } else if (!serviceHistoryReportVehicleKey && serviceHistoryReportVehicleOptions[0]) {
                                setServiceHistoryReportVehicleKey(serviceHistoryReportVehicleOptions[0].vehicleKey);
                              }
                            }}
                          >
                            <option value="Per Vehicle">Per Vehicle</option>
                            <option value="Date Range">Date Range</option>
                          </select>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Vehicle</label>
                          <select
                            data-testid="service-history-report-filter-vehicle"
                            style={styles.select}
                            value={serviceHistoryReportVehicleKey}
                            onChange={(e) => setServiceHistoryReportVehicleKey(e.target.value)}
                          >
                            <option value="">All Vehicles</option>
                            {serviceHistoryReportVehicleOptions.map((option) => (
                              <option key={option.vehicleKey} value={option.vehicleKey}>
                                {[option.plateNumber || option.vehicleKey, option.customerLabel].filter(Boolean).join(" | ")}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Plate Number</label>
                          <input
                            data-testid="service-history-report-filter-plate"
                            style={styles.input}
                            value={serviceHistoryReportPlateFilter}
                            onChange={(e) => setServiceHistoryReportPlateFilter(e.target.value)}
                            placeholder="Search plate"
                          />
                        </div>
                      </div>

                      <div style={styles.formGrid3}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Customer</label>
                          <input
                            data-testid="service-history-report-filter-customer"
                            style={styles.input}
                            value={serviceHistoryReportCustomerFilter}
                            onChange={(e) => setServiceHistoryReportCustomerFilter(e.target.value)}
                            placeholder="Search customer"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Category</label>
                          <select
                            data-testid="service-history-report-filter-category"
                            style={styles.select}
                            value={serviceHistoryReportCategoryFilter}
                            onChange={(e) => setServiceHistoryReportCategoryFilter(e.target.value)}
                          >
                            {serviceHistoryReportCategoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Service / Title</label>
                          <input
                            data-testid="service-history-report-filter-service"
                            style={styles.input}
                            value={serviceHistoryReportServiceFilter}
                            onChange={(e) => setServiceHistoryReportServiceFilter(e.target.value)}
                            placeholder="Search service key or title"
                          />
                        </div>
                      </div>

                      <div style={styles.formGrid3}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>RO Number</label>
                          <input
                            data-testid="service-history-report-filter-ro"
                            style={styles.input}
                            value={serviceHistoryReportRoFilter}
                            onChange={(e) => setServiceHistoryReportRoFilter(e.target.value)}
                            placeholder="Search RO no."
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Date From</label>
                          <input
                            data-testid="service-history-report-filter-date-from"
                            type="date"
                            style={styles.input}
                            value={serviceHistoryReportDateFromFilter}
                            onChange={(e) => setServiceHistoryReportDateFromFilter(e.target.value)}
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Date To</label>
                          <input
                            data-testid="service-history-report-filter-date-to"
                            type="date"
                            style={styles.input}
                            value={serviceHistoryReportDateToFilter}
                            onChange={(e) => setServiceHistoryReportDateToFilter(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                    <div style={styles.reportStatGrid}>
                      <div style={styles.reportStatCard}>
                        <div style={styles.reportStatLabel}>Total service history entries</div>
                        <div style={styles.reportStatValue} data-testid="service-history-report-stat-entries">
                          {serviceHistoryReportSummary.totalServiceHistoryEntries}
                        </div>
                      </div>
                      <div style={styles.reportStatCard}>
                        <div style={styles.reportStatLabel}>Total completed visits</div>
                        <div style={styles.reportStatValue} data-testid="service-history-report-stat-visits">
                          {serviceHistoryReportSummary.totalCompletedVisits}
                        </div>
                      </div>
                      <div style={styles.reportStatCard}>
                        <div style={styles.reportStatLabel}>Most recent service date</div>
                        <div style={styles.reportStatValue} data-testid="service-history-report-stat-most-recent">
                          {serviceHistoryReportSummary.mostRecentServiceDate ? formatDateTime(serviceHistoryReportSummary.mostRecentServiceDate) : "-"}
                        </div>
                      </div>
                    </div>

                    <div style={styles.reportCategoryList}>
                      {serviceHistoryReportSummary.categoryTotals.length === 0 ? (
                        <div style={styles.formHint}>No category totals available for the current filters.</div>
                      ) : (
                        serviceHistoryReportSummary.categoryTotals.map((row) => (
                          <span
                            key={row.category}
                            style={styles.reportCategoryChip}
                            data-testid={`service-history-report-category-total-${slugify(row.category)}`}
                          >
                            {row.category}: {row.count}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {serviceHistoryReportPrintPreview ? (
                    <div style={{ ...styles.sectionCardMuted, marginTop: 12 }} data-testid="service-history-report-print-view">
                      <div style={styles.mobileDataCardHeader}>
                        <div>
                          <div style={styles.sectionTitle}>Print-Friendly Preview</div>
                          <div style={styles.formHint}>
                            Simplified read-only layout that mirrors the filtered service history report for printing.
                          </div>
                        </div>
                        <button type="button" style={styles.smallButtonMuted} onClick={() => setServiceHistoryReportPrintPreview(false)}>
                          Back to Report
                        </button>
                      </div>

                      {filteredServiceHistoryReportRows.length === 0 ? (
                        <div style={styles.emptyState}>No service history entries match the current report filters.</div>
                      ) : (
                        <div style={styles.mobileCardList}>
                          {filteredServiceHistoryReportRows.map((row) => (
                            <div key={row.id} style={styles.mobileDataCard} data-testid={`service-history-report-row-${row.id}`}>
                              <div style={styles.mobileDataCardHeader}>
                                <strong>{row.title}</strong>
                                <span style={row.historyOrigin === "Seeded / Demo" ? styles.statusWarning : styles.statusInfo}>
                                  {row.historyOrigin}
                                </span>
                              </div>
                              <div style={styles.mobileDataSecondary}>
                                RO {row.roNumber} | {row.category || "General"} | {row.serviceKey || "service"}
                              </div>
                              <div style={styles.chipWrap}>
                                <span style={styles.tagNeutral}>{row.vehicleLabel}</span>
                                <span style={styles.tagNeutral}>{row.plateNumber || "No plate"}</span>
                                <span style={styles.tagNeutral}>{row.sourceTypeLabel}</span>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Customer</span>
                                <strong>{row.customerLabel}</strong>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Completed</span>
                                <strong>{formatDateTime(row.completedAt)}</strong>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Odometer</span>
                                <strong>{row.odometerAtCompletion || "-"}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                      {filteredServiceHistoryReportRows.length === 0 ? (
                        <div style={styles.emptyState}>No service history entries match the current report filters.</div>
                      ) : (
                        <div style={styles.mobileCardList}>
                          {filteredServiceHistoryReportRows.map((row) => (
                            <div key={row.id} style={styles.mobileDataCard} data-testid={`service-history-report-row-${row.id}`}>
                              <div style={styles.mobileDataCardHeader}>
                                <strong>{row.title}</strong>
                                <span style={row.historyOrigin === "Seeded / Demo" ? styles.statusWarning : styles.statusInfo}>
                                  {row.historyOrigin}
                                </span>
                              </div>
                              <div style={styles.mobileDataSecondary}>
                                RO {row.roNumber} | {row.category || "General"} | {row.serviceKey || "service"}
                              </div>
                              <div style={styles.chipWrap}>
                                <span style={styles.tagNeutral}>{row.vehicleLabel}</span>
                                <span style={styles.tagNeutral}>{row.plateNumber || "No plate"}</span>
                                <span style={styles.tagNeutral}>{row.sourceTypeLabel}</span>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Customer</span>
                                <strong>{row.customerLabel}</strong>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Completed</span>
                                <strong>{formatDateTime(row.completedAt)}</strong>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Odometer</span>
                                <strong>{row.odometerAtCompletion || "-"}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 12 }}>
                    {selectedGroup ? (
                      <MaintenanceTimeline
                        vehicle={maintenanceTimelineVehicle}
                        upcomingItems={maintenanceTimelineUpcomingItems}
                        completedItems={maintenanceTimelineCompletedItems}
                        filters={maintenanceTimelineFilters}
                        counts={maintenanceTimelineViewModel.counts}
                        latestCompleted={maintenanceTimelineViewModel.latestCompleted}
                        insights={maintenanceTimelineViewModel.insights}
                        onFiltersChange={(next) => {
                          setMaintenanceTimelineSearch(next.search);
                          setMaintenanceTimelineCategoryFilter(next.category);
                          setMaintenanceTimelineStatusFilter(next.mode);
                          setMaintenanceTimelineSort(next.sort);
                          setMaintenanceTimelineGroupBy(next.groupBy);
                        }}
                        onAddToRecommendation={(item) => console.log("Add to Recommendation", item.id)}
                        onAddToWorkLine={(item) => console.log("Add to Work Line", item.id)}
                        onDismiss={(item) => console.log("Dismiss", item.id)}
                        onViewRepairOrder={(repairOrderNumber) => setSearch(repairOrderNumber)}
                        emptyStateText="No maintenance timeline items match the current filters."
                      />
                    ) : (
                      <div style={styles.emptyState}>Select a vehicle to view its maintenance timeline.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;

const styles: Record<string, React.CSSProperties> = {
  pageContent: {
    width: "100%",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 16,
  },

  gridItem: {
    minWidth: 0,
  },

  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
    border: "1px solid rgba(29,78,216,0.16)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 28px rgba(5, 11, 29, 0.12)",
    height: "100%",
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

  sectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.3,
  },

  statusInfo: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  statusOk: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  formGroup: {
    display: "grid",
    gap: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
  },

  input: {
    width: "100%",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#ffffff",
    outline: "none",
    color: "#0f172a",
    minHeight: 44,
  },

  select: {
    width: "100%",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#ffffff",
    outline: "none",
    color: "#0f172a",
    minHeight: 44,
  },

  mobileCardList: {
    display: "grid",
    gap: 12,
  },

  emptyState: {
    border: "1px dashed rgba(148, 163, 184, 0.55)",
    background: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },

  mobileDataCard: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "#ffffff",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },

  selectedQueueCard: {},

  mobileDataCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },

  mobileDataPrimary: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
  },

  mobileDataSecondary: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },

  chipWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  tagNeutral: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 10px",
    background: "#eef2ff",
    color: "#3730a3",
    fontSize: 12,
    fontWeight: 700,
  },

  mobileMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 8,
    marginTop: 8,
    borderTop: "1px solid rgba(226, 232, 240, 0.9)",
    fontSize: 13,
    color: "#475569",
  },

  formStack: {
    display: "grid",
    gap: 14,
  },

  formGrid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },

  formGrid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },

  sectionCardMuted: {
    background: "#f8fafc",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
  },

  sectionCardMutedInner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid rgba(226, 232, 240, 0.95)",
  },

  reportActionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  smallButton: {
    border: "1px solid rgba(59, 130, 246, 0.24)",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    minHeight: 40,
  },

  smallButtonMuted: {
    border: "1px solid rgba(148, 163, 184, 0.26)",
    background: "#ffffff",
    color: "#334155",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    minHeight: 40,
  },

  smallButtonActive: {
    background: "#1d4ed8",
    color: "#ffffff",
    borderColor: "#1d4ed8",
  },

  reportStatGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },

  reportStatCard: {
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: 14,
    background: "#f8fafc",
    padding: 14,
  },

  reportStatLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },

  reportStatValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.3,
    wordBreak: "break-word",
  },

  reportCategoryList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  timelineHeaderCard: {
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: 18,
    background: "linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(255,255,255,0.98) 100%)",
    padding: 16,
    display: "grid",
    gap: 14,
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
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },

  timelineHeaderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },

  timelineHeaderMetaCard: {
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: 14,
    background: "#ffffff",
    padding: 12,
    display: "grid",
    gap: 4,
  },

  timelineHeaderMetaValue: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.3,
    wordBreak: "break-word",
  },

  timelineToolbar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginTop: 14,
    alignItems: "end",
  },

  timelineChipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  timelineLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 0.9fr)",
    gap: 16,
    marginTop: 16,
    alignItems: "start",
  },

  timelineFeed: {
    display: "grid",
    gap: 16,
  },

  timelineSidebar: {
    display: "grid",
    gap: 12,
  },

  timelineSidebarCard: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    background: "#f8fafc",
    padding: 14,
    display: "grid",
    gap: 12,
  },

  timelineSidebarMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },

  timelineSidebarMetric: {
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: 12,
    background: "#ffffff",
    padding: 10,
    display: "grid",
    gap: 4,
  },

  timelineSidebarList: {
    display: "grid",
    gap: 8,
  },

  timelineSidebarListItem: {
    display: "grid",
    gap: 2,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.16)",
    background: "#ffffff",
  },

  timelineSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  timelineCard: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    background: "#ffffff",
    padding: 14,
    display: "grid",
    gap: 12,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
  },

  timelineMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 10,
  },

  timelineMetaCard: {
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: 12,
    background: "#f8fafc",
    padding: 10,
    display: "grid",
    gap: 4,
    fontSize: 12,
    color: "#475569",
  },

  timelineActionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  timelineWhyDetails: {
    border: "1px dashed rgba(148, 163, 184, 0.24)",
    borderRadius: 12,
    padding: "8px 10px",
    background: "#f8fafc",
  },

  timelineWhySummary: {
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800,
    color: "#1d4ed8",
    listStyle: "none",
  },

  timelineWhyContent: {
    marginTop: 8,
    display: "grid",
    gap: 4,
    fontSize: 12,
    color: "#334155",
    lineHeight: 1.5,
  },

  reportCategoryChip: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#eef2ff",
    color: "#3730a3",
    fontSize: 12,
    fontWeight: 700,
  },

  quickAccessList: {
    display: "grid",
    gap: 10,
  },

  quickAccessRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 12,
    padding: "10px 12px",
    background: "#f8fafc",
    color: "#334155",
    fontWeight: 600,
  },

  formHint: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.5,
  },

  statusWarning: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  statusDanger: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
};
