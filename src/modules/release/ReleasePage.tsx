import React, { useEffect, useMemo, useState } from "react";
import type {
  SessionUser,
  RepairOrderRecord,
  QCRecord,
  ReleaseRecord,
  InvoiceRecord,
  PaymentRecord,
  ROStatus,
  PaymentStatus,
  PaymentMethod,
  InvoiceStatus,
} from "../shared/types";
import {
  formatCurrency,
  formatDateTime,
  getResponsiveSpan,
  parseMoneyInput,
} from "../shared/helpers";
import { AiAssistPanel } from "../ai/AiAssistPanel";
import { useOpenAiAssistController } from "../ai/useOpenAiAssistController";

// ─── Local helpers ────────────────────────────────────────────────────────────

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function todayStamp(date = new Date()) {
  const yyyy = date.getFullYear().toString();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const STORAGE_KEY_COUNTERS = "dvi_phase2_counters_v1";

function nextDailyNumber(prefix: string) {
  const stamp = todayStamp();
  const counters = readLocalStorage<Record<string, number>>(STORAGE_KEY_COUNTERS, {});
  const key = `${prefix}_${stamp}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeLocalStorage(STORAGE_KEY_COUNTERS, counters);
  return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}

function downloadTextFile(filename: string, content: string) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function printTextDocument(title: string, content: string) {
  if (typeof window === "undefined") return;
  const popup = window.open("", "_blank", "width=900,height=700");
  if (!popup) return;
  const escapedTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedBody = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  popup.document.write(`
    <html>
      <head>
        <title>${escapedTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 24px; margin-bottom: 16px; }
          pre { white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.5; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${escapedTitle}</h1>
        <pre>${escapedBody}</pre>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}

function calculateInvoiceTotal(laborSubtotal: string, partsSubtotal: string, discountAmount: string) {
  return Math.max(parseMoneyInput(laborSubtotal) + parseMoneyInput(partsSubtotal) - parseMoneyInput(discountAmount), 0);
}

function getPaymentStatusFromAmounts(totalAmount: string, paymentTotal: number): PaymentStatus {
  const total = parseMoneyInput(totalAmount);
  if (paymentTotal <= 0) return "Unpaid";
  if (paymentTotal + 0.0001 >= total && total > 0) return "Paid";
  return "Partial";
}

function getROStatusStyle(status: ROStatus): React.CSSProperties {
  if (status === "Draft") return styles.statusNeutral;
  if (status === "Pulled Out") return styles.statusLocked;
  if (status === "Waiting Inspection" || status === "Waiting Approval") return styles.statusInfo;
  if (status === "Approved / Ready to Work" || status === "Ready Release" || status === "Released" || status === "Closed") return styles.statusOk;
  if (status === "Waiting Parts" || status === "Quality Check") return styles.statusWarning;
  return styles.statusInfo;
}

function getPaymentStatusStyle(status: PaymentStatus): React.CSSProperties {
  if (status === "Paid") return styles.statusOk;
  if (status === "Partial") return styles.statusWarning;
  return styles.statusLocked;
}

function getInvoiceStatusStyle(status: InvoiceStatus): React.CSSProperties {
  if (status === "Finalized") return styles.statusOk;
  if (status === "Voided") return styles.statusLocked;
  return styles.statusNeutral;
}

function buildReleaseExportText(
  ro: RepairOrderRecord,
  invoice: InvoiceRecord | null,
  payments: PaymentRecord[],
  release: ReleaseRecord | null,
  qc: QCRecord | null,
  finalTotalAmount: string
) {
  const paid = payments.reduce((sum, row) => sum + parseMoneyInput(row.amount), 0);
  return [
    `Release Summary for ${ro.roNumber}`,
    `RO Status: ${ro.status}`,
    `Customer: ${ro.accountLabel}`,
    `Plate: ${ro.plateNumber || ro.conductionNumber || "-"}`,
    `Vehicle: ${[ro.make, ro.model, ro.year].filter(Boolean).join(" ") || "-"}`,
    `Latest QC: ${qc ? `${qc.qcNumber} | ${qc.result}` : "No QC record"}`,
    `Invoice: ${invoice ? invoice.invoiceNumber : "No invoice"}`,
    `Invoice Status: ${invoice ? invoice.status : "-"}`,
    `Payment Status: ${invoice ? invoice.paymentStatus : "-"}`,
    `Final Total: ${formatCurrency(parseMoneyInput(finalTotalAmount))}`,
    `Total Paid: ${formatCurrency(paid)}`,
    `Balance: ${formatCurrency(Math.max(parseMoneyInput(finalTotalAmount) - paid, 0))}`,
    "",
    "Payments:",
    payments.map((payment, index) =>
      `${index + 1}. ${payment.paymentNumber} | ${formatCurrency(parseMoneyInput(payment.amount))} | ${payment.method} | ${formatDateTime(payment.createdAt)}`
    ).join("\n") || "No payments yet.",
    "",
    release
      ? `Latest Release: ${release.releaseNumber} | ${formatDateTime(release.createdAt)} | By: ${release.releasedBy}`
      : "Latest Release: No release record yet",
  ].join("\n");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

function ReleasePage({
  currentUser,
  repairOrders,
  setRepairOrders,
  qcRecords,
  releaseRecords,
  setReleaseRecords,
  invoiceRecords,
  setInvoiceRecords,
  paymentRecords,
  setPaymentRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  setRepairOrders: React.Dispatch<React.SetStateAction<RepairOrderRecord[]>>;
  qcRecords: QCRecord[];
  releaseRecords: ReleaseRecord[];
  setReleaseRecords: React.Dispatch<React.SetStateAction<ReleaseRecord[]>>;
  invoiceRecords: InvoiceRecord[];
  setInvoiceRecords: React.Dispatch<React.SetStateAction<InvoiceRecord[]>>;
  paymentRecords: PaymentRecord[];
  setPaymentRecords: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
  isCompactLayout: boolean;
}) {
  const queue = useMemo(
    () =>
      [...repairOrders]
        .filter((row) => row.status === "Ready Release" || row.status === "Released")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [repairOrders]
  );

  const [selectedRoId, setSelectedRoId] = useState("");
  const [finalServiceAmount, setFinalServiceAmount] = useState("");
  const [finalPartsAmount, setFinalPartsAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>("Draft");
  const [chargeAccountApproved, setChargeAccountApproved] = useState(false);
  const [releaseSummary, setReleaseSummary] = useState("");
  const [documentsReady, setDocumentsReady] = useState(true);
  const [noNewDamage, setNoNewDamage] = useState(true);
  const [cleanVehicle, setCleanVehicle] = useState(true);
  const [toolsRemoved, setToolsRemoved] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [pullOutReason, setPullOutReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedRoId && queue[0]) setSelectedRoId(queue[0].id);
    if (selectedRoId && !queue.some((row) => row.id === selectedRoId)) {
      setSelectedRoId(queue[0]?.id ?? "");
    }
  }, [queue, selectedRoId]);

  const selectedRO = useMemo(
    () => queue.find((row) => row.id === selectedRoId) ?? null,
    [queue, selectedRoId]
  );

  const latestQcForSelected = useMemo(
    () =>
      selectedRO
        ? [...qcRecords]
            .filter((row) => row.roId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
        : null,
    [qcRecords, selectedRO]
  );

  const latestReleaseForSelected = useMemo(
    () =>
      selectedRO
        ? [...releaseRecords]
            .filter((row) => row.roId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
        : null,
    [releaseRecords, selectedRO]
  );

  const selectedInvoice = useMemo(
    () => (selectedRO ? invoiceRecords.find((row) => row.roId === selectedRO.id) ?? null : null),
    [invoiceRecords, selectedRO]
  );

  const linkedPayments = useMemo(
    () => (selectedInvoice ? paymentRecords.filter((row) => row.invoiceId === selectedInvoice.id) : []),
    [paymentRecords, selectedInvoice]
  );

  const totalPaidAmount = linkedPayments.reduce((sum, row) => sum + parseMoneyInput(row.amount), 0);

  const passedQcRoIds = useMemo(
    () => new Set(qcRecords.filter((row) => row.result === "Passed").map((row) => row.roId)),
    [qcRecords]
  );

  useEffect(() => {
    if (!selectedRO) return;
    const service = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.serviceEstimate), 0);
    const parts = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.partsEstimate), 0);
    if (selectedInvoice) {
      setFinalServiceAmount(selectedInvoice.laborSubtotal || String(service || ""));
      setFinalPartsAmount(selectedInvoice.partsSubtotal || String(parts || ""));
      setDiscountAmount(selectedInvoice.discountAmount || "0");
      setInvoiceNotes(selectedInvoice.notes || "");
      setInvoiceStatus(selectedInvoice.status);
      setChargeAccountApproved(selectedInvoice.chargeAccountApproved);
    } else {
      setFinalServiceAmount(String(service || ""));
      setFinalPartsAmount(String(parts || ""));
      setDiscountAmount("0");
      setInvoiceNotes("");
      setInvoiceStatus("Draft");
      setChargeAccountApproved(false);
    }
    if (!releaseSummary) {
      setReleaseSummary(
        selectedRO.workLines.map((line) => `${line.title} (${line.status})`).join(", ")
      );
    }
    setPaymentAmount("");
    setPaymentMethod("Cash");
    setPaymentReferenceNumber("");
    setPaymentNotes("");
    setPullOutReason("");
  }, [selectedRO, selectedInvoice]);

  const finalTotalAmount = calculateInvoiceTotal(finalServiceAmount, finalPartsAmount, discountAmount).toFixed(2);
  const effectivePaymentStatus = getPaymentStatusFromAmounts(finalTotalAmount, totalPaidAmount);
  const outstandingBalance = Math.max(parseMoneyInput(finalTotalAmount) - totalPaidAmount, 0);
  const latestQcPassed = latestQcForSelected?.result === "Passed";

  const releaseSummaryStats = useMemo(
    () => ({
      visible: queue.length,
      readyRelease: queue.filter((row) => row.status === "Ready Release").length,
      released: queue.filter((row) => row.status === "Released").length,
      unpaid: queue.filter((row) => {
        const invoice = invoiceRecords.find((inv) => inv.roId === row.id);
        return invoice ? invoice.paymentStatus === "Unpaid" && invoice.status !== "Voided" : true;
      }).length,
      partial: queue.filter((row) => {
        const invoice = invoiceRecords.find((inv) => inv.roId === row.id);
        return invoice ? invoice.paymentStatus === "Partial" && invoice.status !== "Voided" : false;
      }).length,
    }),
    [queue, invoiceRecords]
  );

  const releaseAiSourceText = useMemo(
    () =>
      selectedRO
        ? buildReleaseExportText(selectedRO, selectedInvoice, linkedPayments, latestReleaseForSelected, latestQcForSelected, finalTotalAmount)
        : "",
    [finalTotalAmount, latestQcForSelected, latestReleaseForSelected, linkedPayments, selectedInvoice, selectedRO]
  );

  const releaseAi = useOpenAiAssistController({
    sourceModule: "release",
    sourceText: releaseAiSourceText,
    contextKey: selectedRO?.id || "release-draft",
    currentUserRole: currentUser.role,
    currentUserName: currentUser.fullName,
    moduleKey: "release",
    sourceLabel: "release summary",
    customerName: selectedRO?.accountLabel || undefined,
    vehicleLabel: selectedRO ? [selectedRO.make, selectedRO.model, selectedRO.year].filter(Boolean).join(" ") || undefined : undefined,
    roNumber: selectedRO?.roNumber || undefined,
    defaultAction: "Draft Release Summary",
  });

  const applySuggestedInvoiceTotals = () => {
    if (!selectedRO) return;
    const service = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.serviceEstimate), 0);
    const parts = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.partsEstimate), 0);
    setFinalServiceAmount(service ? service.toFixed(2) : "0.00");
    setFinalPartsAmount(parts ? parts.toFixed(2) : "0.00");
  };

  const fillOutstandingBalance = () => {
    setPaymentAmount(outstandingBalance > 0 ? outstandingBalance.toFixed(2) : "");
  };

  const upsertInvoice = (nextStatus?: InvoiceStatus) => {
    if (!selectedRO) return null;
    const now = new Date().toISOString();
    const invoiceTotal = calculateInvoiceTotal(finalServiceAmount, finalPartsAmount, discountAmount);
    const invoiceId = selectedInvoice?.id ?? uid("inv");
    const invoiceRecord: InvoiceRecord = {
      id: invoiceId,
      invoiceNumber: selectedInvoice?.invoiceNumber ?? nextDailyNumber("INV"),
      roId: selectedRO.id,
      roNumber: selectedRO.roNumber,
      createdAt: selectedInvoice?.createdAt ?? now,
      updatedAt: now,
      createdBy: selectedInvoice?.createdBy ?? currentUser.fullName,
      laborSubtotal: finalServiceAmount,
      partsSubtotal: finalPartsAmount,
      discountAmount,
      totalAmount: invoiceTotal.toFixed(2),
      status: nextStatus ?? invoiceStatus,
      paymentStatus: getPaymentStatusFromAmounts(invoiceTotal.toFixed(2), totalPaidAmount),
      chargeAccountApproved,
      notes: invoiceNotes.trim(),
    };
    setInvoiceRecords((prev) => {
      const exists = prev.some((row) => row.id === invoiceRecord.id);
      return exists ? prev.map((row) => (row.id === invoiceRecord.id ? invoiceRecord : row)) : [invoiceRecord, ...prev];
    });
    if (nextStatus) setInvoiceStatus(nextStatus);
    return invoiceRecord;
  };

  const addPayment = () => {
    if (!selectedRO) return;
    const amount = parseMoneyInput(paymentAmount);
    if (amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }
    const invoice = upsertInvoice(invoiceStatus === "Voided" ? "Draft" : "Finalized");
    if (!invoice) return;
    const paymentRecord: PaymentRecord = {
      id: uid("pay"),
      paymentNumber: nextDailyNumber("PAY"),
      invoiceId: invoice.id,
      roId: selectedRO.id,
      roNumber: selectedRO.roNumber,
      createdAt: new Date().toISOString(),
      receivedBy: currentUser.fullName,
      amount: amount.toFixed(2),
      method: paymentMethod,
      referenceNumber: paymentReferenceNumber.trim(),
      notes: paymentNotes.trim(),
    };
    const nextTotalPaid = totalPaidAmount + amount;
    const nextPaymentStatus = getPaymentStatusFromAmounts(invoice.totalAmount, nextTotalPaid);
    setPaymentRecords((prev) => [paymentRecord, ...prev]);
    setInvoiceRecords((prev) =>
      prev.map((row) =>
        row.id === invoice.id
          ? { ...row, status: "Finalized", paymentStatus: nextPaymentStatus, updatedAt: new Date().toISOString() }
          : row
      )
    );
    setPaymentAmount("");
    setPaymentReferenceNumber("");
    setPaymentNotes("");
    setError("");
  };

  const history = useMemo(
    () =>
      [...releaseRecords]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12),
    [releaseRecords]
  );

  const releaseVehicle = () => {
    if (!selectedRO) return;
    if (selectedRO.status !== "Ready Release") return;
    const invoice = upsertInvoice("Finalized");
    if (!invoice) return;
    if (!latestQcPassed) {
      setError("The latest QC result must be Passed before release.");
      return;
    }
    const canReleaseForPayment = effectivePaymentStatus === "Paid" || chargeAccountApproved;
    if (!documentsReady || !canReleaseForPayment || !noNewDamage || !cleanVehicle || !toolsRemoved) {
      setError("Complete the release checklist and settle payment or approve charge account before release.");
      return;
    }

    const releaseRecord: ReleaseRecord = {
      id: uid("rel"),
      releaseNumber: nextDailyNumber("REL"),
      roId: selectedRO.id,
      roNumber: selectedRO.roNumber,
      createdAt: new Date().toISOString(),
      releasedBy: currentUser.fullName,
      finalServiceAmount,
      finalPartsAmount,
      finalTotalAmount,
      releaseSummary: releaseSummary.trim(),
      documentsReady,
      paymentSettled: effectivePaymentStatus === "Paid" || chargeAccountApproved,
      noNewDamage,
      cleanVehicle,
      toolsRemoved,
    };

    setReleaseRecords((prev) => [releaseRecord, ...prev]);
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === selectedRO.id
          ? { ...row, status: "Released", updatedAt: new Date().toISOString() }
          : row
      )
    );
    setError("");
  };

  const pullOutVehicle = () => {
    if (!selectedRO) return;
    if (selectedRO.status !== "Ready Release") return;
    if (!pullOutReason.trim()) {
      setError("A pull-out reason is required.");
      return;
    }
    const now = new Date().toISOString();
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === selectedRO.id
          ? {
              ...row,
              status: "Pulled Out",
              pullOutReason: pullOutReason.trim(),
              pulledOutAt: now,
              pulledOutBy: currentUser.fullName,
              updatedAt: now,
            }
          : row
      )
    );
    setPullOutReason("");
    setError("");
  };

  const closeOrder = (roId: string) => {
    const row = repairOrders.find((item) => item.id === roId);
    if (!row) return;
    if (row.status !== "Released") {
      setError("Only released jobs can be closed.");
      return;
    }
    if (outstandingBalance > 0 && !chargeAccountApproved) {
      setError("Outstanding balance must be cleared or charge account must be approved before closing.");
      return;
    }
    setRepairOrders((prev) =>
      prev.map((item) =>
        item.id === roId ? { ...item, status: "Closed", updatedAt: new Date().toISOString() } : item
      )
    );
    setError("");
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Invoice + Payment Control Center"
            subtitle="Finalize billing, collect payments, and release only when QC and payment gates are truly satisfied"
            right={<span style={styles.statusInfo}>{releaseSummaryStats.visible} visible jobs</span>}
          >
            <div style={styles.heroText}>
              This screen now keeps invoice totals, payment status, open balance, QC gate, charge-account approval, and release readiness in one place so front office handover is cleaner and harder to miss.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Ready Release</div>
            <div style={styles.statValue}>{releaseSummaryStats.readyRelease}</div>
            <div style={styles.statNote}>Waiting to complete final handover</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Released</div>
            <div style={styles.statValue}>{releaseSummaryStats.released}</div>
            <div style={styles.statNote}>Already handed over to customer</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Unpaid</div>
            <div style={styles.statValue}>{releaseSummaryStats.unpaid}</div>
            <div style={styles.statNote}>Jobs still blocked by payment</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Partial</div>
            <div style={styles.statValue}>{releaseSummaryStats.partial}</div>
            <div style={styles.statNote}>Jobs with remaining balance</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
          <Card
            title="Release Queue"
            subtitle="Ready Release and Released jobs"
            right={<span style={styles.statusOk}>{queue.length} visible</span>}
          >
            {!queue.length ? (
              <div style={styles.emptyState}>No repair orders are ready for release yet.</div>
            ) : (
              <div style={styles.mobileCardList}>
                {queue.map((row) => {
                  const active = row.id === selectedRoId;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      data-testid={`release-queue-item-${row.id}`}
                      onClick={() => setSelectedRoId(row.id)}
                      style={{
                        ...styles.mobileCard,
                        textAlign: "left",
                        borderColor: active ? "#2563eb" : "#e5e7eb",
                        background: active ? "#eff6ff" : "#ffffff",
                      }}
                    >
                      <div style={styles.mobileCardHeader}>
                        <div>
                          <div style={styles.mobileCardTitle}>{row.roNumber}</div>
                          <div style={styles.mobileCardSubtitle}>{row.accountLabel}</div>
                        </div>
                        <span style={getROStatusStyle(row.status)}>{row.status}</span>
                      </div>
                      <div style={styles.mobileCardMeta}>
                        {row.plateNumber || row.conductionNumber || "No plate"}
                      </div>
                      <div style={styles.mobileCardMeta}>
                        {row.make} {row.model} {row.year}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }}>
          <div data-testid="release-detail-panel">
          <Card
            title="Release Form"
            subtitle="Final gate before vehicle handover"
            right={
              selectedRO ? (
                <div style={styles.inlineActions}>
                  <button
                    type="button"
                    style={styles.smallButtonMuted}
                    onClick={() =>
                      printTextDocument(
                        `Release ${selectedRO.roNumber}`,
                        buildReleaseExportText(selectedRO, selectedInvoice, linkedPayments, latestReleaseForSelected, latestQcForSelected, finalTotalAmount)
                      )
                    }
                  >
                    Print Release
                  </button>
                  <button
                    type="button"
                    style={styles.smallButton}
                    onClick={() =>
                      downloadTextFile(
                        `${selectedRO.roNumber}_release.txt`,
                        buildReleaseExportText(selectedRO, selectedInvoice, linkedPayments, latestReleaseForSelected, latestQcForSelected, finalTotalAmount)
                      )
                    }
                  >
                    Export Release
                  </button>
                </div>
              ) : undefined
            }
          >
            {!selectedRO ? (
              <div style={styles.emptyState}>Select a repair order from the release queue.</div>
            ) : (
              <div style={styles.formStack}>
                <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>RO Number</div>
                    <div style={styles.summaryValue}>{selectedRO.roNumber}</div>
                  </div>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>Vehicle</div>
                    <div style={styles.summaryValue}>{selectedRO.plateNumber || selectedRO.conductionNumber || "-"}</div>
                  </div>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>QC Gate</div>
                    <div style={styles.summaryValue}>{passedQcRoIds.has(selectedRO.id) ? "Passed" : "Missing"}</div>
                  </div>
                </div>
                <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>RO Created</div>
                    <div style={styles.summaryValue}>{formatDateTime(selectedRO.createdAt)}</div>
                  </div>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>Encoded By</div>
                    <div style={styles.summaryValue}>{selectedRO.encodedBy || "-"}</div>
                  </div>
                  {selectedRO.updatedBy ? (
                    <div style={styles.summaryTile}>
                      <div style={styles.summaryLabel}>Last Updated By</div>
                    <div style={styles.summaryValue}>{selectedRO.updatedBy}</div>
                  </div>
                ) : <div style={styles.summaryTile} />}
                </div>

                <AiAssistPanel
                  action={releaseAi.action}
                  sourceModule="release"
                  sourceText={releaseAiSourceText}
                  draftText={releaseAi.draftText}
                  draftMeta={releaseAi.draftMeta}
                  logs={releaseAi.logs}
                  feedback={releaseAi.feedback}
                  isGenerating={releaseAi.isGenerating}
                  canUseAiAssist={releaseAi.canUseAiAssist}
                  accessMessage={releaseAi.accessMessage}
                  draftFromCache={releaseAi.draftFromCache}
                  reviewed={releaseAi.reviewed}
                  onReviewedChange={releaseAi.setReviewed}
                  actions={["Fix Grammar", "Draft Release Summary", "SMS Update"]}
                  providerMode={releaseAi.providerMode}
                  model={releaseAi.model}
                  maxTokens={releaseAi.maxTokens}
                  apiKeyConfigured={releaseAi.apiKeyConfigured}
                  onActionChange={releaseAi.setAction}
                  onGenerate={(action) => void releaseAi.generate(action)}
                  onDraftTextChange={releaseAi.setDraftText}
                  onUseDraft={releaseAi.useDraft}
                  onCopyDraft={releaseAi.copyDraft}
                  onResetSource={releaseAi.resetToSource}
                />

                <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Final Service Amount</label>
                    <input style={styles.input} value={finalServiceAmount} onChange={(e) => setFinalServiceAmount(e.target.value)} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Final Parts Amount</label>
                    <input style={styles.input} value={finalPartsAmount} onChange={(e) => setFinalPartsAmount(e.target.value)} />
                  </div>
                </div>

                <div style={styles.summaryBar}>
                  <div>
                    <strong>Total Amount:</strong> {formatCurrency(parseMoneyInput(finalTotalAmount))}
                  </div>
                  <div>
                    <strong>Paid:</strong> {formatCurrency(totalPaidAmount)}
                  </div>
                  <div>
                    <strong>Balance:</strong> {formatCurrency(outstandingBalance)}
                  </div>
                  <div>
                    <strong>Payment:</strong> <span style={getPaymentStatusStyle(effectivePaymentStatus)}>{effectivePaymentStatus}</span>
                  </div>
                </div>

                <div style={styles.grid}>
                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Invoice</div>
                      <div style={styles.formStack}>
                        <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Labor Subtotal</label>
                            <input style={styles.input} value={finalServiceAmount} onChange={(e) => setFinalServiceAmount(e.target.value)} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Parts Subtotal</label>
                            <input style={styles.input} value={finalPartsAmount} onChange={(e) => setFinalPartsAmount(e.target.value)} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Discount</label>
                            <input style={styles.input} value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
                          </div>
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Invoice Status</label>
                            <select style={styles.select} value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value as InvoiceStatus)}>
                              <option value="Draft">Draft</option>
                              <option value="Finalized">Finalized</option>
                              <option value="Voided">Voided</option>
                            </select>
                          </div>
                          <label style={styles.checkboxCard}>
                            <input type="checkbox" checked={chargeAccountApproved} onChange={(e) => setChargeAccountApproved(e.target.checked)} />
                            <span>Charge account / fleet approved</span>
                          </label>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Invoice Notes</label>
                          <textarea style={styles.textarea} value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value)} placeholder="Invoice note, discount reason, or fleet charge details" />
                        </div>

                        <div style={styles.inlineActions}>
                          <button type="button" style={styles.secondaryButton} onClick={applySuggestedInvoiceTotals}>Use RO Suggested Totals</button>
                          <button type="button" style={styles.secondaryButton} onClick={() => upsertInvoice("Draft")}>Save Draft Invoice</button>
                          <button type="button" style={styles.primaryButton} onClick={() => upsertInvoice("Finalized")}>Finalize Invoice</button>
                        </div>

                        <div style={styles.quickAccessList}>
                          <div style={styles.quickAccessRow}>
                            <span>Invoice</span>
                            <strong>{selectedInvoice?.invoiceNumber || "Not created yet"}</strong>
                          </div>
                          <div style={styles.quickAccessRow}>
                            <span>Status</span>
                            <span style={getInvoiceStatusStyle(selectedInvoice?.status || invoiceStatus)}>{selectedInvoice?.status || invoiceStatus}</span>
                          </div>
                          <div style={styles.quickAccessRow}>
                            <span>Computed Total</span>
                            <strong>{formatCurrency(parseMoneyInput(finalTotalAmount))}</strong>
                          </div>
                          <div style={styles.quickAccessRow}>
                            <span>Open Balance</span>
                            <strong>{formatCurrency(Math.max(parseMoneyInput(finalTotalAmount) - totalPaidAmount, 0))}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Payments</div>
                      <div style={styles.formStack}>
                        <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Amount</label>
                            <input style={styles.input} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter payment amount" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Method</label>
                            <select style={styles.select} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                              <option value="Cash">Cash</option>
                              <option value="GCash">GCash</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Card">Card</option>
                              <option value="Charge Account / Fleet">Charge Account / Fleet</option>
                            </select>
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Reference</label>
                            <input style={styles.input} value={paymentReferenceNumber} onChange={(e) => setPaymentReferenceNumber(e.target.value)} placeholder="Optional ref no." />
                          </div>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Payment Notes</label>
                          <input style={styles.input} value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Optional payment notes" />
                        </div>

                        <div style={styles.inlineActions}>
                          <button type="button" style={styles.secondaryButton} onClick={fillOutstandingBalance}>Fill Outstanding Balance</button>
                          <button type="button" style={styles.primaryButton} onClick={addPayment}>Add Payment</button>
                        </div>

                        <div style={styles.quickAccessList}>
                          <div style={styles.quickAccessRow}>
                            <span>Total Paid</span>
                            <strong>{formatCurrency(totalPaidAmount)}</strong>
                          </div>
                          <div style={styles.quickAccessRow}>
                            <span>Payment Status</span>
                            <span style={getPaymentStatusStyle(effectivePaymentStatus)}>{effectivePaymentStatus}</span>
                          </div>
                          <div style={styles.quickAccessRow}>
                            <span>Release Payment Gate</span>
                            <strong>{effectivePaymentStatus === "Paid" || chargeAccountApproved ? "Cleared" : `Blocked • ${formatCurrency(outstandingBalance)} due`}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {linkedPayments.length ? (
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionTitle}>Payment History</div>
                    <div style={styles.mobileCardList}>
                      {linkedPayments.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((payment) => (
                        <div key={payment.id} style={styles.mobileDataCard}>
                          <div style={styles.mobileDataCardHeader}>
                            <strong>{payment.paymentNumber}</strong>
                            <span style={styles.statusOk}>{payment.method}</span>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Amount</span>
                            <strong>{formatCurrency(parseMoneyInput(payment.amount))}</strong>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Received By</span>
                            <strong>{payment.receivedBy}</strong>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Date</span>
                            <strong>{formatDateTime(payment.createdAt)}</strong>
                          </div>
                          {payment.referenceNumber ? <div style={styles.formHint}>Ref: {payment.referenceNumber}</div> : null}
                          {payment.notes ? <div style={styles.formHint}>{payment.notes}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Customer Summary</label>
                  <textarea
                    style={{ ...styles.textarea, minHeight: 120 }}
                    value={releaseSummary}
                    onChange={(e) => setReleaseSummary(e.target.value)}
                    placeholder="Describe the completed work in customer-friendly language."
                  />
                </div>

                <div style={styles.formStack}>
                  <label style={styles.checkboxCard}><input type="checkbox" checked={documentsReady} onChange={(e) => setDocumentsReady(e.target.checked)} /> <span>Documents and paperwork ready</span></label>
                  <label style={styles.checkboxCard}><input type="checkbox" checked={noNewDamage} onChange={(e) => setNoNewDamage(e.target.checked)} /> <span>No new damage</span></label>
                  <label style={styles.checkboxCard}><input type="checkbox" checked={cleanVehicle} onChange={(e) => setCleanVehicle(e.target.checked)} /> <span>Vehicle clean and ready</span></label>
                  <label style={styles.checkboxCard}><input type="checkbox" checked={toolsRemoved} onChange={(e) => setToolsRemoved(e.target.checked)} /> <span>Tools removed and area checked</span></label>
                </div>

                {selectedRO.status === "Ready Release" ? (
                  <div style={styles.pullOutSection}>
                    <div style={styles.sectionTitle}>Pull Out Vehicle</div>
                    <div style={styles.formHint}>
                      Use this if the customer is taking the vehicle before repairs are fully settled. A pull-out reason is required and the RO will be marked as Pulled Out.
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Pull-Out Reason</label>
                        <textarea
                          style={styles.textarea}
                          value={pullOutReason}
                          onChange={(e) => setPullOutReason(e.target.value)}
                          placeholder="State the reason the vehicle is being pulled out without normal release."
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        style={isCompactLayout ? { ...styles.smallButtonDanger, ...styles.actionButtonWide } : styles.smallButtonDanger}
                        onClick={pullOutVehicle}
                      >
                        Confirm Pull Out
                      </button>
                    </div>
                  </div>
                ) : null}

                {error ? <div style={styles.errorBox}>{error}</div> : null}

                <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActions}>
                  {selectedRO.status !== "Released" ? (
                    <button type="button" style={{ ...styles.primaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }} onClick={releaseVehicle}>
                      Release Vehicle
                    </button>
                  ) : null}
                  <button type="button" style={{ ...styles.secondaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }} onClick={() => closeOrder(selectedRO.id)}>
                    Close RO
                  </button>
                </div>
              </div>
            )}
          </Card>
          </div>

          <div style={{ marginTop: 16 }}>
            <Card title="Recent Releases" subtitle="Latest release records">
              {!history.length ? (
                <div style={styles.emptyState}>No release records yet.</div>
              ) : isCompactLayout ? (
                <div style={styles.mobileCardList}>
                  {history.map((row) => (
                    <div key={row.id} style={styles.mobileCard}>
                      <div style={styles.mobileCardHeader}>
                        <div>
                          <div style={styles.mobileCardTitle}>{row.releaseNumber}</div>
                          <div style={styles.mobileCardSubtitle}>{row.roNumber}</div>
                        </div>
                        <span style={styles.statusOk}>Released</span>
                      </div>
                      <div style={styles.mobileCardMeta}>By: {row.releasedBy}</div>
                      <div style={styles.mobileCardMeta}>{formatDateTime(row.createdAt)}</div>
                      <div style={styles.mobileCardMeta}>₱ {row.finalTotalAmount}</div>
                      {row.releaseSummary ? <div style={styles.mobileCardNote}>{row.releaseSummary}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Release No.</th>
                        <th style={styles.th}>RO</th>
                        <th style={styles.th}>By</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Final Total</th>
                        <th style={styles.th}>Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row) => (
                        <tr key={row.id}>
                          <td style={styles.td}>{row.releaseNumber}</td>
                          <td style={styles.td}>{row.roNumber}</td>
                          <td style={styles.td}>{row.releasedBy}</td>
                          <td style={styles.td}>{formatDateTime(row.createdAt)}</td>
                          <td style={styles.td}>₱ {row.finalTotalAmount}</td>
                          <td style={styles.td}>{row.releaseSummary || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReleasePage;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  pageContent: { width: "100%" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 16,
  },

  gridItem: { minWidth: 0 },

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

  cardTitle: { fontSize: 19, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 },
  cardSubtitle: { marginTop: 4, fontSize: 13, color: "#64748b", lineHeight: 1.5 },

  heroText: { fontSize: 15, lineHeight: 1.7, color: "#475569" },

  statusOk: {
    display: "inline-flex", alignItems: "center", borderRadius: 999,
    padding: "6px 10px", background: "#dcfce7", color: "#166534",
    fontSize: 12, fontWeight: 800, whiteSpace: "nowrap",
  },
  statusInfo: {
    display: "inline-flex", alignItems: "center", borderRadius: 999,
    padding: "6px 10px", background: "#dbeafe", color: "#1d4ed8",
    fontSize: 12, fontWeight: 800, whiteSpace: "nowrap",
  },
  statusWarning: {
    display: "inline-flex", alignItems: "center", borderRadius: 999,
    padding: "6px 10px", background: "#fef3c7", color: "#92400e",
    fontSize: 12, fontWeight: 800, whiteSpace: "nowrap",
  },
  statusLocked: {
    display: "inline-flex", alignItems: "center", borderRadius: 999,
    padding: "6px 10px", background: "#fee2e2", color: "#991b1b",
    fontSize: 12, fontWeight: 800, whiteSpace: "nowrap",
  },
  statusNeutral: {
    display: "inline-flex", alignItems: "center", borderRadius: 999,
    padding: "6px 10px", background: "#e2e8f0", color: "#475569",
    fontSize: 12, fontWeight: 800, whiteSpace: "nowrap",
  },

  statCard: {
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 18, padding: 18,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)", height: "100%",
  },
  statLabel: { fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 800, color: "#111827", lineHeight: 1.2, wordBreak: "break-word" },
  statNote: { fontSize: 12, color: "#94a3b8", marginTop: 8 },

  emptyState: {
    border: "1px dashed rgba(148, 163, 184, 0.55)", background: "#f8fafc",
    borderRadius: 16, padding: 20, textAlign: "center", color: "#64748b", fontSize: 14,
  },

  mobileCardList: { display: "grid", gap: 12 },

  mobileCard: {
    border: "1px solid #e2e8f0", borderRadius: 16, background: "#ffffff",
    padding: 14, boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },
  mobileCardHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    gap: 10, marginBottom: 8,
  },
  mobileCardTitle: { fontSize: 15, fontWeight: 800, color: "#0f172a" },
  mobileCardSubtitle: { fontSize: 12, color: "#64748b", marginTop: 4 },
  mobileCardMeta: { fontSize: 13, color: "#475569", lineHeight: 1.6 },
  mobileCardNote: { marginTop: 8, fontSize: 13, color: "#475569", lineHeight: 1.6 },

  mobileDataCard: {
    border: "1px solid rgba(148, 163, 184, 0.22)", background: "#ffffff",
    borderRadius: 18, padding: 14, boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },
  mobileDataCardHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    gap: 10, marginBottom: 8, flexWrap: "wrap",
  },
  mobileMetaRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12, paddingTop: 8, marginTop: 8,
    borderTop: "1px solid rgba(226, 232, 240, 0.9)", fontSize: 13, color: "#475569",
  },
  formHint: { fontSize: 12, color: "#64748b", lineHeight: 1.5 },

  formStack: { display: "grid", gap: 14 },
  formGrid2: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12,
  },
  formGrid3: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12,
  },
  formGroup: { display: "grid", gap: 8 },
  label: { fontSize: 13, fontWeight: 700, color: "#334155" },
  input: {
    width: "100%", border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 12, padding: "12px 14px", background: "#ffffff",
    outline: "none", color: "#0f172a", minHeight: 44,
  },
  select: {
    width: "100%", border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 12, padding: "12px 14px", background: "#ffffff",
    outline: "none", color: "#0f172a", minHeight: 44,
  },
  textarea: {
    width: "100%", minHeight: 96, border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 12, padding: "12px 14px", background: "#ffffff",
    outline: "none", color: "#0f172a", lineHeight: 1.5,
  },
  errorBox: {
    background: "#fee2e2", color: "#991b1b", borderRadius: 12,
    padding: "10px 12px", fontSize: 14, fontWeight: 700,
  },

  primaryButton: {
    border: "none", borderRadius: 12, padding: "13px 16px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff", fontWeight: 800, cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
  },
  secondaryButton: {
    border: "1px solid rgba(148, 163, 184, 0.3)", borderRadius: 12, padding: "13px 16px",
    background: "#ffffff", color: "#0f172a", fontWeight: 700, cursor: "pointer",
  },
  smallButton: {
    border: "none", borderRadius: 10, padding: "8px 10px",
    background: "#1d4ed8", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12,
  },
  smallButtonMuted: {
    border: "none", borderRadius: 10, padding: "8px 10px",
    background: "#64748b", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12,
  },
  smallButtonDanger: {
    border: "none", borderRadius: 10, padding: "8px 10px",
    background: "#dc2626", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12,
  },
  inlineActions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },

  stickyActionBar: {
    position: "sticky", bottom: 0, display: "grid", gap: 8, padding: 12,
    background: "rgba(255,255,255,0.96)", borderTop: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: 16, boxShadow: "0 -8px 24px rgba(15, 23, 42, 0.08)",
  },
  actionButtonWide: { width: "100%", justifyContent: "center" },

  sectionCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 18,
    padding: 16, boxShadow: "0 6px 22px rgba(15, 23, 42, 0.06)",
  },
  sectionTitle: { fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 10 },

  pullOutSection: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: 16,
    padding: 14,
  },

  summaryBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12, flexWrap: "wrap", padding: "12px 14px",
    borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0",
  },
  summaryTile: { padding: 12, borderRadius: 14, background: "#ffffff", border: "1px solid #e2e8f0" },
  summaryLabel: { fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 },
  summaryValue: { fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.4 },

  checkboxCard: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 12, background: "#ffffff",
    border: "1px solid #dbe4f0", fontWeight: 600, color: "#334155",
  },

  quickAccessList: { display: "grid", gap: 10 },
  quickAccessRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 10, border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 12, padding: "10px 12px", background: "#f8fafc",
    color: "#334155", fontWeight: 600,
  },

  tableWrap: {
    width: "100%", overflowX: "auto",
    border: "1px solid rgba(148, 163, 184, 0.18)", borderRadius: 16, background: "#ffffff",
  },
  table: { minWidth: 900, width: "100%" },
  th: {
    textAlign: "left", padding: "13px 12px",
    borderBottom: "1px solid rgba(226, 232, 240, 0.95)",
    background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 800,
    letterSpacing: 0.2, whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 12px", borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
    color: "#111827", fontSize: 13, verticalAlign: "top", lineHeight: 1.5,
  },
};
