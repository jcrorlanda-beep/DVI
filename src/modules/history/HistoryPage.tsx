import React, { useEffect, useMemo, useState } from "react";
import type {
  SessionUser,
  IntakeRecord,
  RepairOrderRecord,
  QCRecord,
  ReleaseRecord,
  ApprovalRecord,
  BackjobRecord,
  InvoiceRecord,
  PaymentRecord,
} from "../shared/types";
import { formatDateTime, getResponsiveSpan, formatCurrency, parseMoneyInput } from "../shared/helpers";

type InspectionRecord = {
  plateNumber: string;
  conductionNumber: string;
  make: string;
  model: string;
  year: string;
  odometerKm: string;
  updatedAt: string;
  createdAt: string;
  inspectionNumber: string;
  status: string;
  concern: string;
  inspectionNotes?: string;
  recommendedWork?: string;
};

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
  isCompactLayout: boolean;
}) {
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    if (selectedGroup && selectedVehicleKey !== selectedGroup.vehicleKey) {
      setSelectedVehicleKey(selectedGroup.vehicleKey);
    }
  }, [selectedGroup, selectedVehicleKey]);

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
            title={selectedGroup ? `Vehicle Timeline — ${selectedGroup.plateNumber || selectedGroup.conductionNumber || selectedGroup.vehicleKey}` : "Vehicle Timeline"}
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

  sectionCardMuted: {
    background: "#f8fafc",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
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
};
