import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from "react";
import { formatCurrency, formatDateTime, getResponsiveSpan, parseMoneyInput, } from "../shared/helpers";
// ─── Local helpers ────────────────────────────────────────────────────────────
function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function todayStamp(date = new Date()) {
    const yyyy = date.getFullYear().toString();
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const dd = `${date.getDate()}`.padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}
function readLocalStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw)
            return fallback;
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
function writeLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
const STORAGE_KEY_COUNTERS = "dvi_phase2_counters_v1";
function nextDailyNumber(prefix) {
    const stamp = todayStamp();
    const counters = readLocalStorage(STORAGE_KEY_COUNTERS, {});
    const key = `${prefix}_${stamp}`;
    const next = (counters[key] ?? 0) + 1;
    counters[key] = next;
    writeLocalStorage(STORAGE_KEY_COUNTERS, counters);
    return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}
function downloadTextFile(filename, content) {
    if (typeof document === "undefined")
        return;
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
function printTextDocument(title, content) {
    if (typeof window === "undefined")
        return;
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup)
        return;
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
function calculateInvoiceTotal(laborSubtotal, partsSubtotal, discountAmount) {
    return Math.max(parseMoneyInput(laborSubtotal) + parseMoneyInput(partsSubtotal) - parseMoneyInput(discountAmount), 0);
}
function getPaymentStatusFromAmounts(totalAmount, paymentTotal) {
    const total = parseMoneyInput(totalAmount);
    if (paymentTotal <= 0)
        return "Unpaid";
    if (paymentTotal + 0.0001 >= total && total > 0)
        return "Paid";
    return "Partial";
}
function getROStatusStyle(status) {
    if (status === "Draft")
        return styles.statusNeutral;
    if (status === "Pulled Out")
        return styles.statusLocked;
    if (status === "Waiting Inspection" || status === "Waiting Approval")
        return styles.statusInfo;
    if (status === "Approved / Ready to Work" || status === "Ready Release" || status === "Released" || status === "Closed")
        return styles.statusOk;
    if (status === "Waiting Parts" || status === "Quality Check")
        return styles.statusWarning;
    return styles.statusInfo;
}
function getPaymentStatusStyle(status) {
    if (status === "Paid")
        return styles.statusOk;
    if (status === "Partial")
        return styles.statusWarning;
    return styles.statusLocked;
}
function getInvoiceStatusStyle(status) {
    if (status === "Finalized")
        return styles.statusOk;
    if (status === "Voided")
        return styles.statusLocked;
    return styles.statusNeutral;
}
function buildReleaseExportText(ro, invoice, payments, release, qc, finalTotalAmount) {
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
        payments.map((payment, index) => `${index + 1}. ${payment.paymentNumber} | ${formatCurrency(parseMoneyInput(payment.amount))} | ${payment.method} | ${formatDateTime(payment.createdAt)}`).join("\n") || "No payments yet.",
        "",
        release
            ? `Latest Release: ${release.releaseNumber} | ${formatDateTime(release.createdAt)} | By: ${release.releasedBy}`
            : "Latest Release: No release record yet",
    ].join("\n");
}
// ─── Sub-components ───────────────────────────────────────────────────────────
function Card({ title, subtitle, right, children, }) {
    return (_jsxs("div", { style: styles.card, children: [_jsxs("div", { style: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.cardTitle, children: title }), subtitle ? _jsx("div", { style: styles.cardSubtitle, children: subtitle }) : null] }), right ? _jsx("div", { children: right }) : null] }), children] }));
}
// ─── Component ────────────────────────────────────────────────────────────────
function ReleasePage({ currentUser, repairOrders, setRepairOrders, qcRecords, releaseRecords, setReleaseRecords, invoiceRecords, setInvoiceRecords, paymentRecords, setPaymentRecords, isCompactLayout, }) {
    const queue = useMemo(() => [...repairOrders]
        .filter((row) => row.status === "Ready Release" || row.status === "Released")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [repairOrders]);
    const [selectedRoId, setSelectedRoId] = useState("");
    const [finalServiceAmount, setFinalServiceAmount] = useState("");
    const [finalPartsAmount, setFinalPartsAmount] = useState("");
    const [discountAmount, setDiscountAmount] = useState("0");
    const [invoiceNotes, setInvoiceNotes] = useState("");
    const [invoiceStatus, setInvoiceStatus] = useState("Draft");
    const [chargeAccountApproved, setChargeAccountApproved] = useState(false);
    const [releaseSummary, setReleaseSummary] = useState("");
    const [documentsReady, setDocumentsReady] = useState(true);
    const [noNewDamage, setNoNewDamage] = useState(true);
    const [cleanVehicle, setCleanVehicle] = useState(true);
    const [toolsRemoved, setToolsRemoved] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [paymentReferenceNumber, setPaymentReferenceNumber] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");
    const [pullOutReason, setPullOutReason] = useState("");
    const [error, setError] = useState("");
    useEffect(() => {
        if (!selectedRoId && queue[0])
            setSelectedRoId(queue[0].id);
        if (selectedRoId && !queue.some((row) => row.id === selectedRoId)) {
            setSelectedRoId(queue[0]?.id ?? "");
        }
    }, [queue, selectedRoId]);
    const selectedRO = useMemo(() => queue.find((row) => row.id === selectedRoId) ?? null, [queue, selectedRoId]);
    const latestQcForSelected = useMemo(() => selectedRO
        ? [...qcRecords]
            .filter((row) => row.roId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
        : null, [qcRecords, selectedRO]);
    const latestReleaseForSelected = useMemo(() => selectedRO
        ? [...releaseRecords]
            .filter((row) => row.roId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
        : null, [releaseRecords, selectedRO]);
    const selectedInvoice = useMemo(() => (selectedRO ? invoiceRecords.find((row) => row.roId === selectedRO.id) ?? null : null), [invoiceRecords, selectedRO]);
    const linkedPayments = useMemo(() => (selectedInvoice ? paymentRecords.filter((row) => row.invoiceId === selectedInvoice.id) : []), [paymentRecords, selectedInvoice]);
    const totalPaidAmount = linkedPayments.reduce((sum, row) => sum + parseMoneyInput(row.amount), 0);
    const passedQcRoIds = useMemo(() => new Set(qcRecords.filter((row) => row.result === "Passed").map((row) => row.roId)), [qcRecords]);
    useEffect(() => {
        if (!selectedRO)
            return;
        const service = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.serviceEstimate), 0);
        const parts = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.partsEstimate), 0);
        if (selectedInvoice) {
            setFinalServiceAmount(selectedInvoice.laborSubtotal || String(service || ""));
            setFinalPartsAmount(selectedInvoice.partsSubtotal || String(parts || ""));
            setDiscountAmount(selectedInvoice.discountAmount || "0");
            setInvoiceNotes(selectedInvoice.notes || "");
            setInvoiceStatus(selectedInvoice.status);
            setChargeAccountApproved(selectedInvoice.chargeAccountApproved);
        }
        else {
            setFinalServiceAmount(String(service || ""));
            setFinalPartsAmount(String(parts || ""));
            setDiscountAmount("0");
            setInvoiceNotes("");
            setInvoiceStatus("Draft");
            setChargeAccountApproved(false);
        }
        if (!releaseSummary) {
            setReleaseSummary(selectedRO.workLines.map((line) => `${line.title} (${line.status})`).join(", "));
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
    const releaseSummaryStats = useMemo(() => ({
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
    }), [queue, invoiceRecords]);
    const applySuggestedInvoiceTotals = () => {
        if (!selectedRO)
            return;
        const service = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.serviceEstimate), 0);
        const parts = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.partsEstimate), 0);
        setFinalServiceAmount(service ? service.toFixed(2) : "0.00");
        setFinalPartsAmount(parts ? parts.toFixed(2) : "0.00");
    };
    const fillOutstandingBalance = () => {
        setPaymentAmount(outstandingBalance > 0 ? outstandingBalance.toFixed(2) : "");
    };
    const upsertInvoice = (nextStatus) => {
        if (!selectedRO)
            return null;
        const now = new Date().toISOString();
        const invoiceTotal = calculateInvoiceTotal(finalServiceAmount, finalPartsAmount, discountAmount);
        const invoiceId = selectedInvoice?.id ?? uid("inv");
        const invoiceRecord = {
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
        if (nextStatus)
            setInvoiceStatus(nextStatus);
        return invoiceRecord;
    };
    const addPayment = () => {
        if (!selectedRO)
            return;
        const amount = parseMoneyInput(paymentAmount);
        if (amount <= 0) {
            setError("Enter a valid payment amount.");
            return;
        }
        const invoice = upsertInvoice(invoiceStatus === "Voided" ? "Draft" : "Finalized");
        if (!invoice)
            return;
        const paymentRecord = {
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
        setInvoiceRecords((prev) => prev.map((row) => row.id === invoice.id
            ? { ...row, status: "Finalized", paymentStatus: nextPaymentStatus, updatedAt: new Date().toISOString() }
            : row));
        setPaymentAmount("");
        setPaymentReferenceNumber("");
        setPaymentNotes("");
        setError("");
    };
    const history = useMemo(() => [...releaseRecords]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12), [releaseRecords]);
    const releaseVehicle = () => {
        if (!selectedRO)
            return;
        if (selectedRO.status !== "Ready Release")
            return;
        const invoice = upsertInvoice("Finalized");
        if (!invoice)
            return;
        if (!latestQcPassed) {
            setError("The latest QC result must be Passed before release.");
            return;
        }
        const canReleaseForPayment = effectivePaymentStatus === "Paid" || chargeAccountApproved;
        if (!documentsReady || !canReleaseForPayment || !noNewDamage || !cleanVehicle || !toolsRemoved) {
            setError("Complete the release checklist and settle payment or approve charge account before release.");
            return;
        }
        const releaseRecord = {
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
        setRepairOrders((prev) => prev.map((row) => row.id === selectedRO.id
            ? { ...row, status: "Released", updatedAt: new Date().toISOString() }
            : row));
        setError("");
    };
    const pullOutVehicle = () => {
        if (!selectedRO)
            return;
        if (selectedRO.status !== "Ready Release")
            return;
        if (!pullOutReason.trim()) {
            setError("A pull-out reason is required.");
            return;
        }
        const now = new Date().toISOString();
        setRepairOrders((prev) => prev.map((row) => row.id === selectedRO.id
            ? {
                ...row,
                status: "Pulled Out",
                pullOutReason: pullOutReason.trim(),
                pulledOutAt: now,
                pulledOutBy: currentUser.fullName,
                updatedAt: now,
            }
            : row));
        setPullOutReason("");
        setError("");
    };
    const closeOrder = (roId) => {
        const row = repairOrders.find((item) => item.id === roId);
        if (!row)
            return;
        if (row.status !== "Released") {
            setError("Only released jobs can be closed.");
            return;
        }
        if (outstandingBalance > 0 && !chargeAccountApproved) {
            setError("Outstanding balance must be cleared or charge account must be approved before closing.");
            return;
        }
        setRepairOrders((prev) => prev.map((item) => item.id === roId ? { ...item, status: "Closed", updatedAt: new Date().toISOString() } : item));
        setError("");
    };
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Invoice + Payment Control Center", subtitle: "Finalize billing, collect payments, and release only when QC and payment gates are truly satisfied", right: _jsxs("span", { style: styles.statusInfo, children: [releaseSummaryStats.visible, " visible jobs"] }), children: _jsx("div", { style: styles.heroText, children: "This screen now keeps invoice totals, payment status, open balance, QC gate, charge-account approval, and release readiness in one place so front office handover is cleaner and harder to miss." }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Ready Release" }), _jsx("div", { style: styles.statValue, children: releaseSummaryStats.readyRelease }), _jsx("div", { style: styles.statNote, children: "Waiting to complete final handover" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Released" }), _jsx("div", { style: styles.statValue, children: releaseSummaryStats.released }), _jsx("div", { style: styles.statNote, children: "Already handed over to customer" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Unpaid" }), _jsx("div", { style: styles.statValue, children: releaseSummaryStats.unpaid }), _jsx("div", { style: styles.statNote, children: "Jobs still blocked by payment" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Partial" }), _jsx("div", { style: styles.statValue, children: releaseSummaryStats.partial }), _jsx("div", { style: styles.statNote, children: "Jobs with remaining balance" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }, children: _jsx(Card, { title: "Release Queue", subtitle: "Ready Release and Released jobs", right: _jsxs("span", { style: styles.statusOk, children: [queue.length, " visible"] }), children: !queue.length ? (_jsx("div", { style: styles.emptyState, children: "No repair orders are ready for release yet." })) : (_jsx("div", { style: styles.mobileCardList, children: queue.map((row) => {
                                const active = row.id === selectedRoId;
                                return (_jsxs("button", { type: "button", onClick: () => setSelectedRoId(row.id), style: {
                                        ...styles.mobileCard,
                                        textAlign: "left",
                                        borderColor: active ? "#2563eb" : "#e5e7eb",
                                        background: active ? "#eff6ff" : "#ffffff",
                                    }, children: [_jsxs("div", { style: styles.mobileCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.mobileCardTitle, children: row.roNumber }), _jsx("div", { style: styles.mobileCardSubtitle, children: row.accountLabel })] }), _jsx("span", { style: getROStatusStyle(row.status), children: row.status })] }), _jsx("div", { style: styles.mobileCardMeta, children: row.plateNumber || row.conductionNumber || "No plate" }), _jsxs("div", { style: styles.mobileCardMeta, children: [row.make, " ", row.model, " ", row.year] })] }, row.id));
                            }) })) }) }), _jsxs("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }, children: [_jsx(Card, { title: "Release Form", subtitle: "Final gate before vehicle handover", right: selectedRO ? (_jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => printTextDocument(`Release ${selectedRO.roNumber}`, buildReleaseExportText(selectedRO, selectedInvoice, linkedPayments, latestReleaseForSelected, latestQcForSelected, finalTotalAmount)), children: "Print Release" }), _jsx("button", { type: "button", style: styles.smallButton, onClick: () => downloadTextFile(`${selectedRO.roNumber}_release.txt`, buildReleaseExportText(selectedRO, selectedInvoice, linkedPayments, latestReleaseForSelected, latestQcForSelected, finalTotalAmount)), children: "Export Release" })] })) : undefined, children: !selectedRO ? (_jsx("div", { style: styles.emptyState, children: "Select a repair order from the release queue." })) : (_jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.summaryTile, children: [_jsx("div", { style: styles.summaryLabel, children: "RO Number" }), _jsx("div", { style: styles.summaryValue, children: selectedRO.roNumber })] }), _jsxs("div", { style: styles.summaryTile, children: [_jsx("div", { style: styles.summaryLabel, children: "Vehicle" }), _jsx("div", { style: styles.summaryValue, children: selectedRO.plateNumber || selectedRO.conductionNumber || "-" })] }), _jsxs("div", { style: styles.summaryTile, children: [_jsx("div", { style: styles.summaryLabel, children: "QC Gate" }), _jsx("div", { style: styles.summaryValue, children: passedQcRoIds.has(selectedRO.id) ? "Passed" : "Missing" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.summaryTile, children: [_jsx("div", { style: styles.summaryLabel, children: "RO Created" }), _jsx("div", { style: styles.summaryValue, children: formatDateTime(selectedRO.createdAt) })] }), _jsxs("div", { style: styles.summaryTile, children: [_jsx("div", { style: styles.summaryLabel, children: "Encoded By" }), _jsx("div", { style: styles.summaryValue, children: selectedRO.encodedBy || "-" })] }), selectedRO.updatedBy ? (_jsxs("div", { style: styles.summaryTile, children: [_jsx("div", { style: styles.summaryLabel, children: "Last Updated By" }), _jsx("div", { style: styles.summaryValue, children: selectedRO.updatedBy })] })) : _jsx("div", { style: styles.summaryTile })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Final Service Amount" }), _jsx("input", { style: styles.input, value: finalServiceAmount, onChange: (e) => setFinalServiceAmount(e.target.value) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Final Parts Amount" }), _jsx("input", { style: styles.input, value: finalPartsAmount, onChange: (e) => setFinalPartsAmount(e.target.value) })] })] }), _jsxs("div", { style: styles.summaryBar, children: [_jsxs("div", { children: [_jsx("strong", { children: "Total Amount:" }), " ", formatCurrency(parseMoneyInput(finalTotalAmount))] }), _jsxs("div", { children: [_jsx("strong", { children: "Paid:" }), " ", formatCurrency(totalPaidAmount)] }), _jsxs("div", { children: [_jsx("strong", { children: "Balance:" }), " ", formatCurrency(outstandingBalance)] }), _jsxs("div", { children: [_jsx("strong", { children: "Payment:" }), " ", _jsx("span", { style: getPaymentStatusStyle(effectivePaymentStatus), children: effectivePaymentStatus })] })] }), _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Invoice" }), _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Labor Subtotal" }), _jsx("input", { style: styles.input, value: finalServiceAmount, onChange: (e) => setFinalServiceAmount(e.target.value) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Parts Subtotal" }), _jsx("input", { style: styles.input, value: finalPartsAmount, onChange: (e) => setFinalPartsAmount(e.target.value) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Discount" }), _jsx("input", { style: styles.input, value: discountAmount, onChange: (e) => setDiscountAmount(e.target.value) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Invoice Status" }), _jsxs("select", { style: styles.select, value: invoiceStatus, onChange: (e) => setInvoiceStatus(e.target.value), children: [_jsx("option", { value: "Draft", children: "Draft" }), _jsx("option", { value: "Finalized", children: "Finalized" }), _jsx("option", { value: "Voided", children: "Voided" })] })] }), _jsxs("label", { style: styles.checkboxCard, children: [_jsx("input", { type: "checkbox", checked: chargeAccountApproved, onChange: (e) => setChargeAccountApproved(e.target.checked) }), _jsx("span", { children: "Charge account / fleet approved" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Invoice Notes" }), _jsx("textarea", { style: styles.textarea, value: invoiceNotes, onChange: (e) => setInvoiceNotes(e.target.value), placeholder: "Invoice note, discount reason, or fleet charge details" })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.secondaryButton, onClick: applySuggestedInvoiceTotals, children: "Use RO Suggested Totals" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: () => upsertInvoice("Draft"), children: "Save Draft Invoice" }), _jsx("button", { type: "button", style: styles.primaryButton, onClick: () => upsertInvoice("Finalized"), children: "Finalize Invoice" })] }), _jsxs("div", { style: styles.quickAccessList, children: [_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Invoice" }), _jsx("strong", { children: selectedInvoice?.invoiceNumber || "Not created yet" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Status" }), _jsx("span", { style: getInvoiceStatusStyle(selectedInvoice?.status || invoiceStatus), children: selectedInvoice?.status || invoiceStatus })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Computed Total" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(finalTotalAmount)) })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Open Balance" }), _jsx("strong", { children: formatCurrency(Math.max(parseMoneyInput(finalTotalAmount) - totalPaidAmount, 0)) })] })] })] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Payments" }), _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Amount" }), _jsx("input", { style: styles.input, value: paymentAmount, onChange: (e) => setPaymentAmount(e.target.value), placeholder: "Enter payment amount" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Method" }), _jsxs("select", { style: styles.select, value: paymentMethod, onChange: (e) => setPaymentMethod(e.target.value), children: [_jsx("option", { value: "Cash", children: "Cash" }), _jsx("option", { value: "GCash", children: "GCash" }), _jsx("option", { value: "Bank Transfer", children: "Bank Transfer" }), _jsx("option", { value: "Card", children: "Card" }), _jsx("option", { value: "Charge Account / Fleet", children: "Charge Account / Fleet" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Reference" }), _jsx("input", { style: styles.input, value: paymentReferenceNumber, onChange: (e) => setPaymentReferenceNumber(e.target.value), placeholder: "Optional ref no." })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Payment Notes" }), _jsx("input", { style: styles.input, value: paymentNotes, onChange: (e) => setPaymentNotes(e.target.value), placeholder: "Optional payment notes" })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.secondaryButton, onClick: fillOutstandingBalance, children: "Fill Outstanding Balance" }), _jsx("button", { type: "button", style: styles.primaryButton, onClick: addPayment, children: "Add Payment" })] }), _jsxs("div", { style: styles.quickAccessList, children: [_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Total Paid" }), _jsx("strong", { children: formatCurrency(totalPaidAmount) })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Payment Status" }), _jsx("span", { style: getPaymentStatusStyle(effectivePaymentStatus), children: effectivePaymentStatus })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Release Payment Gate" }), _jsx("strong", { children: effectivePaymentStatus === "Paid" || chargeAccountApproved ? "Cleared" : `Blocked • ${formatCurrency(outstandingBalance)} due` })] })] })] })] }) })] }), linkedPayments.length ? (_jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Payment History" }), _jsx("div", { style: styles.mobileCardList, children: linkedPayments.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((payment) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: payment.paymentNumber }), _jsx("span", { style: styles.statusOk, children: payment.method })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Amount" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(payment.amount)) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Received By" }), _jsx("strong", { children: payment.receivedBy })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Date" }), _jsx("strong", { children: formatDateTime(payment.createdAt) })] }), payment.referenceNumber ? _jsxs("div", { style: styles.formHint, children: ["Ref: ", payment.referenceNumber] }) : null, payment.notes ? _jsx("div", { style: styles.formHint, children: payment.notes }) : null] }, payment.id))) })] })) : null, _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Customer Summary" }), _jsx("textarea", { style: { ...styles.textarea, minHeight: 120 }, value: releaseSummary, onChange: (e) => setReleaseSummary(e.target.value), placeholder: "Describe the completed work in customer-friendly language." })] }), _jsxs("div", { style: styles.formStack, children: [_jsxs("label", { style: styles.checkboxCard, children: [_jsx("input", { type: "checkbox", checked: documentsReady, onChange: (e) => setDocumentsReady(e.target.checked) }), " ", _jsx("span", { children: "Documents and paperwork ready" })] }), _jsxs("label", { style: styles.checkboxCard, children: [_jsx("input", { type: "checkbox", checked: noNewDamage, onChange: (e) => setNoNewDamage(e.target.checked) }), " ", _jsx("span", { children: "No new damage" })] }), _jsxs("label", { style: styles.checkboxCard, children: [_jsx("input", { type: "checkbox", checked: cleanVehicle, onChange: (e) => setCleanVehicle(e.target.checked) }), " ", _jsx("span", { children: "Vehicle clean and ready" })] }), _jsxs("label", { style: styles.checkboxCard, children: [_jsx("input", { type: "checkbox", checked: toolsRemoved, onChange: (e) => setToolsRemoved(e.target.checked) }), " ", _jsx("span", { children: "Tools removed and area checked" })] })] }), selectedRO.status === "Ready Release" ? (_jsxs("div", { style: styles.pullOutSection, children: [_jsx("div", { style: styles.sectionTitle, children: "Pull Out Vehicle" }), _jsx("div", { style: styles.formHint, children: "Use this if the customer is taking the vehicle before repairs are fully settled. A pull-out reason is required and the RO will be marked as Pulled Out." }), _jsx("div", { style: { marginTop: 10 }, children: _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Pull-Out Reason" }), _jsx("textarea", { style: styles.textarea, value: pullOutReason, onChange: (e) => setPullOutReason(e.target.value), placeholder: "State the reason the vehicle is being pulled out without normal release." })] }) }), _jsx("div", { style: { marginTop: 10 }, children: _jsx("button", { type: "button", style: isCompactLayout ? { ...styles.smallButtonDanger, ...styles.actionButtonWide } : styles.smallButtonDanger, onClick: pullOutVehicle, children: "Confirm Pull Out" }) })] })) : null, error ? _jsx("div", { style: styles.errorBox, children: error }) : null, _jsxs("div", { style: isCompactLayout ? styles.stickyActionBar : styles.inlineActions, children: [selectedRO.status !== "Released" ? (_jsx("button", { type: "button", style: { ...styles.primaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }, onClick: releaseVehicle, children: "Release Vehicle" })) : null, _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }, onClick: () => closeOrder(selectedRO.id), children: "Close RO" })] })] })) }), _jsx("div", { style: { marginTop: 16 }, children: _jsx(Card, { title: "Recent Releases", subtitle: "Latest release records", children: !history.length ? (_jsx("div", { style: styles.emptyState, children: "No release records yet." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: history.map((row) => (_jsxs("div", { style: styles.mobileCard, children: [_jsxs("div", { style: styles.mobileCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.mobileCardTitle, children: row.releaseNumber }), _jsx("div", { style: styles.mobileCardSubtitle, children: row.roNumber })] }), _jsx("span", { style: styles.statusOk, children: "Released" })] }), _jsxs("div", { style: styles.mobileCardMeta, children: ["By: ", row.releasedBy] }), _jsx("div", { style: styles.mobileCardMeta, children: formatDateTime(row.createdAt) }), _jsxs("div", { style: styles.mobileCardMeta, children: ["\u20B1 ", row.finalTotalAmount] }), row.releaseSummary ? _jsx("div", { style: styles.mobileCardNote, children: row.releaseSummary }) : null] }, row.id))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Release No." }), _jsx("th", { style: styles.th, children: "RO" }), _jsx("th", { style: styles.th, children: "By" }), _jsx("th", { style: styles.th, children: "Date" }), _jsx("th", { style: styles.th, children: "Final Total" }), _jsx("th", { style: styles.th, children: "Summary" })] }) }), _jsx("tbody", { children: history.map((row) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: row.releaseNumber }), _jsx("td", { style: styles.td, children: row.roNumber }), _jsx("td", { style: styles.td, children: row.releasedBy }), _jsx("td", { style: styles.td, children: formatDateTime(row.createdAt) }), _jsxs("td", { style: styles.td, children: ["\u20B1 ", row.finalTotalAmount] }), _jsx("td", { style: styles.td, children: row.releaseSummary || "-" })] }, row.id))) })] }) })) }) })] })] }) }));
}
export default ReleasePage;
// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
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
