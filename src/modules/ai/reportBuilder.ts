import type { BackjobRecord, QCRecord, RepairOrderRecord, ReleaseRecord } from "../shared/types";
import { formatCurrency, formatDateTime } from "../shared/helpers";
import type { TimelineVehicleSummary, VehicleMaintenanceTimelineData } from "../maintenance/maintenanceHelpers";
import type { AiAction } from "./aiFallback";

export type ReportBuilderReportType =
  | "Customer Inspection Report"
  | "QC Summary Report"
  | "Release / Handover Report"
  | "Backjob / Recheck Explanation Report"
  | "Maintenance Due Report"
  | "Estimate Explanation Report";

export type ReportBuilderSourceModule = "inspection" | "repair order" | "QC" | "release" | "backjob" | "maintenance timeline";

export const REPORT_BUILDER_REPORT_TYPES: ReportBuilderReportType[] = [
  "Customer Inspection Report",
  "QC Summary Report",
  "Release / Handover Report",
  "Backjob / Recheck Explanation Report",
  "Maintenance Due Report",
  "Estimate Explanation Report",
];

export const REPORT_BUILDER_SOURCE_MODULES: ReportBuilderSourceModule[] = [
  "inspection",
  "repair order",
  "QC",
  "release",
  "backjob",
  "maintenance timeline",
];

export type ReportBuilderDraftMeta = {
  reportType: ReportBuilderReportType;
  sourceModule: ReportBuilderSourceModule;
  providerName?: "ollama" | "openai" | "fallback";
  generatedAt: string;
  note: string;
  model: string;
  warning?: string;
  errorMessage?: string;
  errorReason?: string;
  cached?: boolean;
};

export type ReportBuilderLogEntry = {
  id: string;
  actionType: AiAction;
  sourceModule: string;
  status: "Success" | "Failure";
  generatedAt: string;
  provider: "OpenAI";
  model: string;
  note: string;
  errorMessage?: string;
  providerName?: "ollama" | "openai" | "fallback";
  reviewed?: boolean;
  copied?: boolean;
  used?: boolean;
  messageType?: string;
  sourceContext?: string;
  logNote?: string;
};

export type ReportBuilderSourceData = {
  vehicle: TimelineVehicleSummary;
  repairOrders: RepairOrderRecord[];
  inspectionRecords: Array<{
    id: string;
    intakeId: string;
    inspectionNumber: string;
    plateNumber: string;
    conductionNumber: string;
    make: string;
    model: string;
    year: string;
    concern: string;
    underHoodSummary: string;
    recommendedWork: string;
    recommendationLines: string[];
    enginePerformanceNotes?: string;
    coolingSystemNotes?: string;
    steeringSystemNotes?: string;
    roadTestNotes?: string;
    updatedAt: string;
    createdAt: string;
  }>;
  qcRecords: QCRecord[];
  releaseRecords: ReleaseRecord[];
  backjobRecords: BackjobRecord[];
  maintenanceTimeline: VehicleMaintenanceTimelineData;
};

function normalizeVehicleKey(value?: string) {
  return String(value ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function normalizeText(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function getVehicleKey(vehicle: TimelineVehicleSummary) {
  return normalizeVehicleKey(vehicle.vehicleId || vehicle.plateNumber || "");
}

function matchesVehicle(record: { plateNumber?: string; conductionNumber?: string }, vehicleKey: string) {
  const recordKey = normalizeVehicleKey(record.plateNumber || record.conductionNumber || "");
  return !!recordKey && recordKey === vehicleKey;
}

function getLatestByDate<T>(records: T[], getDate: (record: T) => string) {
  return [...records].sort((a, b) => new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime())[0] ?? null;
}

function getLatestRepairOrderForVehicle(repairOrders: RepairOrderRecord[], vehicleKey: string) {
  return getLatestByDate(
    repairOrders.filter((ro) => matchesVehicle(ro, vehicleKey)),
    (ro) => ro.updatedAt || ro.createdAt
  );
}

function getLatestInspectionForVehicle(inspections: ReportBuilderSourceData["inspectionRecords"], vehicleKey: string) {
  return getLatestByDate(
    inspections.filter((inspection) => matchesVehicle(inspection, vehicleKey)),
    (inspection) => inspection.updatedAt || inspection.createdAt
  );
}

function getLatestQcForRo(qcRecords: QCRecord[], ro: RepairOrderRecord | null) {
  if (!ro) return null;
  return getLatestByDate(
    qcRecords.filter((qc) => qc.roId === ro.id || qc.roNumber === ro.roNumber),
    (qc) => qc.updatedAt || qc.createdAt
  );
}

function getLatestReleaseForRo(releaseRecords: ReleaseRecord[], ro: RepairOrderRecord | null) {
  if (!ro) return null;
  return getLatestByDate(
    releaseRecords.filter((record) => record.roId === ro.id || record.roNumber === ro.roNumber),
    (record) => record.updatedAt || record.createdAt
  );
}

function getLatestBackjobForVehicle(backjobRecords: BackjobRecord[], ro: RepairOrderRecord | null, vehicle: TimelineVehicleSummary) {
  const vehicleKey = getVehicleKey(vehicle);
  return getLatestByDate(
    backjobRecords.filter(
      (record) =>
        record.linkedRoId === ro?.id ||
        record.linkedRoNumber === ro?.roNumber ||
        normalizeVehicleKey(record.plateNumber || "") === vehicleKey
    ),
    (record) => record.updatedAt || record.createdAt
  );
}

function joinSection(title: string, lines: Array<string | null | undefined>) {
  const content = lines.filter((line): line is string => !!line && line.trim().length > 0).map((line) => normalizeText(line));
  return content.length ? [title, ...content].join("\n") : "";
}

function formatVehicleSummary(vehicle: TimelineVehicleSummary) {
  return [
    `Customer: ${vehicle.customerName || "Customer"}`,
    `Vehicle: ${[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || vehicle.plateNumber || "Vehicle"}`,
    `Plate: ${vehicle.plateNumber || "-"}`,
    `Current KM: ${typeof vehicle.currentMileage === "number" ? vehicle.currentMileage.toLocaleString() : "-"}`,
  ].join("\n");
}

function formatRepairOrderSummary(ro: RepairOrderRecord | null) {
  if (!ro) return "";
  return [
    `RO Number: ${ro.roNumber}`,
    `Advisor: ${ro.advisorName || "-"}`,
    `Status: ${ro.status}`,
    `Concern: ${ro.customerConcern || "-"}`,
  ].join("\n");
}

function buildInspectionSections(inspection: ReportBuilderSourceData["inspectionRecords"][number] | null) {
  if (!inspection) {
    return [
      joinSection("Summary", ["No inspection record was available."]),
      joinSection("Findings / Work Done", ["Review the inspection findings and notes."]),
      joinSection("Recommended Action", ["Review the recommended work with the customer."]),
      joinSection("Priority / Next Step", ["Prioritize safety-related findings first."]),
    ].filter(Boolean);
  }

  const findings = [
    inspection.concern ? `Concern: ${inspection.concern}` : "",
    inspection.underHoodSummary ? `Under hood summary: ${inspection.underHoodSummary}` : "",
    inspection.enginePerformanceNotes ? `Engine notes: ${inspection.enginePerformanceNotes}` : "",
    inspection.coolingSystemNotes ? `Cooling notes: ${inspection.coolingSystemNotes}` : "",
    inspection.steeringSystemNotes ? `Steering notes: ${inspection.steeringSystemNotes}` : "",
    inspection.roadTestNotes ? `Road test notes: ${inspection.roadTestNotes}` : "",
  ];

  const recommendations = [
    inspection.recommendedWork ? inspection.recommendedWork : "",
    ...(inspection.recommendationLines?.length ? inspection.recommendationLines.slice(0, 6).map((line) => `- ${line}`) : []),
  ];

  return [
    joinSection("Summary", [inspection.concern || inspection.recommendedWork || "Inspection summary prepared from the latest findings."]),
    joinSection("Findings / Work Done", findings),
    joinSection("Recommended Action", recommendations),
    joinSection("Priority / Next Step", [
      inspection.recommendedWork ? "Review the recommended work with the customer." : "Review findings and confirm next steps.",
      "Keep the explanation concise, honest, and customer-friendly.",
    ]),
  ].filter(Boolean);
}

function buildQcSections(qc: QCRecord | null) {
  if (!qc) {
    return [
      joinSection("Summary", ["No QC record was available."]),
      joinSection("Findings / Work Done", ["Review the completed work and QC checks."]),
      joinSection("Recommended Action", ["Confirm the QC result before release."]),
      joinSection("Priority / Next Step", ["Release only after all checks are complete."]),
    ].filter(Boolean);
  }

  return [
    joinSection("Summary", [`QC result: ${qc.result}`, `QC by: ${qc.qcBy}`]),
    joinSection("Findings / Work Done", [
      `All approved work completed: ${qc.allApprovedWorkCompleted ? "Yes" : "No"}`,
      `No leaks or warning lights: ${qc.noLeaksOrWarningLights ? "Yes" : "No"}`,
      `Road test done: ${qc.roadTestDone ? "Yes" : "No"}`,
      `Cleanliness check: ${qc.cleanlinessCheck ? "Yes" : "No"}`,
      `No new damage: ${qc.noNewDamage ? "Yes" : "No"}`,
      `Tools removed: ${qc.toolsRemoved ? "Yes" : "No"}`,
      qc.notes ? `Notes: ${qc.notes}` : "",
    ]),
    joinSection("Recommended Action", [
      qc.result === "Passed" ? "Proceed with release and handover." : "Review the failed QC item and confirm the next corrective step.",
    ]),
    joinSection("Priority / Next Step", [
      qc.result === "Passed" ? "Release readiness is high." : "Address the failed QC item before release.",
    ]),
  ].filter(Boolean);
}

function buildReleaseSections(release: ReleaseRecord | null, ro: RepairOrderRecord | null) {
  if (!release) {
    return [
      joinSection("Summary", ["No release record was available."]),
      joinSection("Findings / Work Done", ["Review the completed work before handover."]),
      joinSection("Recommended Action", ["Confirm release readiness with the advisor and customer."]),
      joinSection("Priority / Next Step", ["Prepare the vehicle for handover and payment check."]),
    ].filter(Boolean);
  }

  return [
    joinSection("Summary", [
      `Release number: ${release.releaseNumber}`,
      release.releaseSummary ? `Summary: ${release.releaseSummary}` : "",
      ro?.status ? `RO status: ${ro.status}` : "",
    ]),
    joinSection("Findings / Work Done", [
      `Documents ready: ${release.documentsReady ? "Yes" : "No"}`,
      `Payment settled: ${release.paymentSettled ? "Yes" : "No"}`,
      `No new damage: ${release.noNewDamage ? "Yes" : "No"}`,
      `Clean vehicle: ${release.cleanVehicle ? "Yes" : "No"}`,
      `Tools removed: ${release.toolsRemoved ? "Yes" : "No"}`,
      release.finalTotalAmount
        ? (() => {
            const parsed = Number(String(release.finalTotalAmount).replace(/[^\d.]/g, ""));
            return `Final total: ${Number.isFinite(parsed) ? formatCurrency(parsed) : release.finalTotalAmount}`;
          })()
        : "",
    ]),
    joinSection("Recommended Action", [
      release.paymentSettled ? "Proceed with customer handover." : "Confirm payment and paperwork before release.",
    ]),
    joinSection("Priority / Next Step", [
      release.paymentSettled ? "Handover can continue." : "Finish release requirements before handover.",
    ]),
  ].filter(Boolean);
}

function buildBackjobSections(backjob: BackjobRecord | null, ro: RepairOrderRecord | null) {
  if (!backjob) {
    return [
      joinSection("Summary", ["No backjob record was available."]),
      joinSection("Findings / Work Done", ["Review the comeback or recheck notes."]),
      joinSection("Recommended Action", ["Confirm the root cause and next corrective step."]),
      joinSection("Priority / Next Step", ["Keep the explanation clear and factual."]),
    ].filter(Boolean);
  }

  return [
    joinSection("Summary", [
      `Backjob number: ${backjob.backjobNumber}`,
      backjob.complaint ? `Customer concern: ${backjob.complaint}` : "",
      backjob.status ? `Status: ${backjob.status}` : "",
      ro?.roNumber ? `Original RO: ${ro.roNumber}` : "",
    ]),
    joinSection("Findings / Work Done", [
      backjob.findings ? `Findings: ${backjob.findings}` : "",
      backjob.rootCause ? `Root cause: ${backjob.rootCause}` : "",
      backjob.actionTaken ? `Action taken: ${backjob.actionTaken}` : "",
      backjob.resolutionNotes ? `Resolution notes: ${backjob.resolutionNotes}` : "",
      backjob.responsibility ? `Responsibility: ${backjob.responsibility}` : "",
    ]),
    joinSection("Recommended Action", [
      "Explain the comeback or recheck clearly to the customer.",
      "Confirm the next corrective step before continuing.",
    ]),
    joinSection("Priority / Next Step", [
      "Prioritize the same concern and its likely related cause.",
    ]),
  ].filter(Boolean);
}

function buildMaintenanceDueSections(timeline: VehicleMaintenanceTimelineData) {
  const dueItems = timeline.upcoming
    .slice(0, 5)
    .map((item) => `- ${item.title} | ${item.timelineStatus} | ${item.dueReason || item.dueBasis || item.sourceTypeLabel || "Due item"}`);
  const completedItems = timeline.completed
    .slice(0, 3)
    .map((item) => `- ${item.title} | ${formatDateTime(item.completedAt)} | RO ${item.roNumber || "-"}`);

  return [
    joinSection("Summary", [
      `Overdue: ${timeline.upcoming.filter((item) => item.timelineStatus === "Overdue").length}`,
      `Due now: ${timeline.upcoming.filter((item) => item.timelineStatus === "Due Now").length}`,
      `Due soon: ${timeline.upcoming.filter((item) => item.timelineStatus === "Due Soon").length}`,
    ]),
    joinSection("Findings / Work Done", [
      timeline.upcoming.length ? "Upcoming maintenance items:" : "No upcoming maintenance items were available.",
      ...dueItems,
      timeline.completed.length ? "Recent completed services:" : "",
      ...completedItems,
    ]),
    joinSection("Recommended Action", [
      timeline.upcoming.length ? "Review the due items and schedule the next visit." : "No maintenance action is due right now.",
    ]),
    joinSection("Priority / Next Step", [
      timeline.upcoming.some((item) => item.timelineStatus === "Overdue")
        ? "Address overdue items first."
        : timeline.upcoming.some((item) => item.timelineStatus === "Due Now")
          ? "Handle due now items next."
          : "Monitor due soon items and plan ahead.",
    ]),
  ].filter(Boolean);
}

function buildEstimateSections(ro: RepairOrderRecord | null) {
  if (!ro) {
    return [
      joinSection("Summary", ["No repair order was available for estimate explanation."]),
      joinSection("Findings / Work Done", ["Review the repair order findings and recommended work."]),
      joinSection("Recommended Action", ["Explain the estimate and next step to the customer."]),
      joinSection("Priority / Next Step", ["Keep the explanation neutral and clear."]),
    ].filter(Boolean);
  }

  return [
    joinSection("Summary", [
      `RO number: ${ro.roNumber}`,
      ro.customerConcern ? `Customer concern: ${ro.customerConcern}` : "",
      ro.status ? `Status: ${ro.status}` : "",
    ]),
    joinSection("Findings / Work Done", [
      ...ro.workLines.slice(0, 8).map((line) => `- ${line.title}${line.notes ? ` | ${line.notes}` : ""}${line.totalEstimate ? ` | ${line.totalEstimate}` : ""}`),
    ]),
    joinSection("Recommended Action", [
      "Explain why the recommended work is needed.",
      "Keep the pricing explanation neutral and factual.",
    ]),
    joinSection("Priority / Next Step", [
      "Prioritize safety and the customer concern first.",
    ]),
  ].filter(Boolean);
}

export function getReportBuilderAction(reportType: ReportBuilderReportType): AiAction {
  switch (reportType) {
    case "Customer Inspection Report":
      return "customerInspectionReport";
    case "QC Summary Report":
      return "qcSummary";
    case "Release / Handover Report":
      return "releaseSummary";
    case "Backjob / Recheck Explanation Report":
      return "backJobExplanation";
    case "Maintenance Due Report":
      return "maintenanceDueReport";
    case "Estimate Explanation Report":
      return "estimateExplanation";
  }
}

export function getReportBuilderReportTypeLabel(reportType: ReportBuilderReportType) {
  return reportType;
}

export function buildReportBuilderSourceText(
  reportType: ReportBuilderReportType,
  sourceModule: ReportBuilderSourceModule,
  data: ReportBuilderSourceData
) {
  const vehicleKey = getVehicleKey(data.vehicle);
  const latestRo = getLatestRepairOrderForVehicle(data.repairOrders, vehicleKey);
  const latestInspection = getLatestInspectionForVehicle(data.inspectionRecords, vehicleKey);
  const latestQc = getLatestQcForRo(data.qcRecords, latestRo);
  const latestRelease = getLatestReleaseForRo(data.releaseRecords, latestRo);
  const latestBackjob = getLatestBackjobForVehicle(data.backjobRecords, latestRo, data.vehicle);

  const sections = [
    `Report Type: ${reportType}`,
    `Source Module: ${sourceModule}`,
    formatVehicleSummary(data.vehicle),
    latestRo ? formatRepairOrderSummary(latestRo) : "",
  ];

  switch (reportType) {
    case "Customer Inspection Report":
      sections.push(...buildInspectionSections(latestInspection));
      break;
    case "QC Summary Report":
      sections.push(...buildQcSections(latestQc));
      break;
    case "Release / Handover Report":
      sections.push(...buildReleaseSections(latestRelease, latestRo));
      break;
    case "Backjob / Recheck Explanation Report":
      sections.push(...buildBackjobSections(latestBackjob, latestRo));
      break;
    case "Maintenance Due Report":
      sections.push(...buildMaintenanceDueSections(data.maintenanceTimeline));
      break;
    case "Estimate Explanation Report":
      sections.push(...buildEstimateSections(latestRo));
      break;
  }

  const lines = sections.flatMap((section) => (section ? [section, ""] : [])).filter(Boolean);
  return lines.join("\n").trim();
}
