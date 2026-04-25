import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from "react";
import { formatDateTime, getResponsiveSpan, todayStamp } from "../shared/helpers";
// --- local helpers ---
function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
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
function buildBackjobExportText(backjob, users) {
    const comebackTech = users.find((user) => user.id === backjob.comebackPrimaryTechnicianId)?.fullName || "Unassigned";
    const originalTech = users.find((user) => user.id === backjob.originalPrimaryTechnicianId)?.fullName || "Unassigned";
    return [
        `Backjob: ${backjob.backjobNumber}`,
        `Status: ${backjob.status}`,
        `Linked RO: ${backjob.linkedRoNumber}`,
        `Customer: ${backjob.customerLabel}`,
        `Plate: ${backjob.plateNumber || "-"}`,
        `Responsibility: ${backjob.responsibility}`,
        `Original Invoice: ${backjob.originalInvoiceNumber || "-"}`,
        `Comeback Invoice: ${backjob.comebackInvoiceNumber || "-"}`,
        `Original Technician: ${originalTech}`,
        `Comeback Technician: ${comebackTech}`,
        `Complaint: ${backjob.complaint || "-"}`,
        `Findings: ${backjob.findings || "-"}`,
        `Root Cause: ${backjob.rootCause || "-"}`,
        `Action Taken: ${backjob.actionTaken || "-"}`,
        `Resolution Notes: ${backjob.resolutionNotes || "-"}`,
        `Created: ${formatDateTime(backjob.createdAt)}`,
        `Updated: ${formatDateTime(backjob.updatedAt)}`,
    ].join("\n");
}
// --- local component ---
function Card({ title, subtitle, right, children, }) {
    return (_jsxs("div", { style: styles.card, children: [_jsxs("div", { style: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.cardTitle, children: title }), subtitle ? _jsx("div", { style: styles.cardSubtitle, children: subtitle }) : null] }), right ? _jsx("div", { children: right }) : null] }), children] }));
}
// --- component ---
function BackjobPage({ currentUser, users, repairOrders, invoiceRecords, backjobRecords, setBackjobRecords, isCompactLayout, }) {
    const [selectedRoId, setSelectedRoId] = useState("");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [complaint, setComplaint] = useState("");
    const [findings, setFindings] = useState("");
    const [rootCause, setRootCause] = useState("");
    const [responsibility, setResponsibility] = useState("Internal");
    const [actionTaken, setActionTaken] = useState("");
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [status, setStatus] = useState("Open");
    const [comebackPrimaryTechnicianId, setComebackPrimaryTechnicianId] = useState("");
    const [supportingTechnicianIds, setSupportingTechnicianIds] = useState([]);
    const [comebackInvoiceNumber, setComebackInvoiceNumber] = useState("");
    const eligibleRos = useMemo(() => repairOrders.filter((row) => ["Released", "Closed", "Ready Release", "In Progress", "Quality Check"].includes(row.status)), [repairOrders]);
    const selectedRO = useMemo(() => eligibleRos.find((row) => row.id === selectedRoId) ?? null, [eligibleRos, selectedRoId]);
    const selectedOriginalInvoice = useMemo(() => (selectedRO ? invoiceRecords.find((row) => row.roId === selectedRO.id) ?? null : null), [invoiceRecords, selectedRO]);
    useEffect(() => {
        if (!selectedRO)
            return;
        setComebackPrimaryTechnicianId((prev) => prev || selectedRO.primaryTechnicianId || "");
        setSupportingTechnicianIds((prev) => (prev.length ? prev : selectedRO.supportTechnicianIds || []));
    }, [selectedRO]);
    const techNameById = useMemo(() => new Map(users.map((user) => [user.id, user.fullName])), [users]);
    const summary = useMemo(() => ({
        total: backjobRecords.length,
        open: backjobRecords.filter((row) => row.status === "Open").length,
        inProgress: backjobRecords.filter((row) => row.status === "In Progress").length,
        monitoring: backjobRecords.filter((row) => row.status === "Monitoring").length,
        closed: backjobRecords.filter((row) => row.status === "Closed").length,
        warranty: backjobRecords.filter((row) => row.responsibility === "Warranty").length,
    }), [backjobRecords]);
    const visibleRecords = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term)
            return backjobRecords;
        return backjobRecords.filter((row) => [
            row.backjobNumber,
            row.linkedRoNumber,
            row.plateNumber,
            row.customerLabel,
            row.complaint,
            row.rootCause,
            row.findings,
            row.actionTaken,
            row.responsibility,
            row.status,
        ]
            .join(" ")
            .toLowerCase()
            .includes(term));
    }, [backjobRecords, search]);
    const resetForm = () => {
        setSelectedRoId("");
        setComplaint("");
        setFindings("");
        setRootCause("");
        setResponsibility("Internal");
        setActionTaken("");
        setResolutionNotes("");
        setStatus("Open");
        setComebackPrimaryTechnicianId("");
        setSupportingTechnicianIds([]);
        setComebackInvoiceNumber("");
        setError("");
    };
    const saveBackjob = () => {
        if (!selectedRoId) {
            setError("A linked repair order is required. Select the original RO before saving a backjob.");
            return;
        }
        if (!selectedRO) {
            setError("The selected repair order could not be found. Please select a valid existing RO.");
            return;
        }
        if (!complaint.trim()) {
            setError("Complaint is required.");
            return;
        }
        if (!rootCause.trim()) {
            setError("Root cause is required.");
            return;
        }
        const now = new Date().toISOString();
        const record = {
            id: uid("bj"),
            backjobNumber: nextDailyNumber("BJ"),
            linkedRoId: selectedRO.id,
            linkedRoNumber: selectedRO.roNumber,
            createdAt: now,
            updatedAt: now,
            plateNumber: selectedRO.plateNumber || selectedRO.conductionNumber || "",
            customerLabel: selectedRO.accountLabel,
            originalInvoiceNumber: selectedOriginalInvoice?.invoiceNumber || "",
            comebackInvoiceNumber: comebackInvoiceNumber.trim(),
            originalPrimaryTechnicianId: selectedRO.primaryTechnicianId || "",
            comebackPrimaryTechnicianId,
            supportingTechnicianIds,
            complaint: complaint.trim(),
            findings: findings.trim(),
            rootCause: rootCause.trim(),
            responsibility,
            actionTaken: actionTaken.trim(),
            resolutionNotes: resolutionNotes.trim(),
            status,
            createdBy: currentUser.fullName,
        };
        setBackjobRecords((prev) => [record, ...prev]);
        resetForm();
    };
    const updateBackjobStatus = (id, nextStatus) => {
        setBackjobRecords((prev) => prev.map((row) => row.id === id ? { ...row, status: nextStatus, updatedAt: new Date().toISOString() } : row));
    };
    const technicians = users.filter((user) => ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role));
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Backjob / Comeback Control Center", subtitle: "Track returned jobs, root cause, responsibility, technician linkage, and comeback resolution in one place", right: _jsxs("span", { style: styles.statusInfo, children: [summary.total, " tracked comebacks"] }), children: _jsx("div", { style: styles.heroText, children: "Use this area for customer returns, warranty comebacks, internal backjobs, and follow-up monitoring so the original RO, invoice, and technician accountability stay visible." }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Open" }), _jsx("div", { style: styles.statValue, children: summary.open }), _jsx("div", { style: styles.statNote, children: "New comeback cases" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "In Progress" }), _jsx("div", { style: styles.statValue, children: summary.inProgress }), _jsx("div", { style: styles.statNote, children: "Actively being resolved" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Monitoring" }), _jsx("div", { style: styles.statValue, children: summary.monitoring }), _jsx("div", { style: styles.statNote, children: "Watching after repair" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Closed" }), _jsx("div", { style: styles.statValue, children: summary.closed }), _jsx("div", { style: styles.statNote, children: "Resolved cases" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Warranty" }), _jsx("div", { style: styles.statValue, children: summary.warranty }), _jsx("div", { style: styles.statNote, children: "Warranty-tagged comebacks" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsx(Card, { title: "New Backjob Record", subtitle: "Link a comeback to the original RO and keep the cause and resolution visible", children: _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Linked Repair Order" }), _jsxs("select", { style: styles.select, value: selectedRoId, onChange: (e) => setSelectedRoId(e.target.value), children: [_jsx("option", { value: "", children: "Select released or active RO" }), eligibleRos.map((row) => (_jsxs("option", { value: row.id, children: [row.roNumber, " \u2022 ", row.plateNumber || row.conductionNumber || "-", " \u2022 ", row.accountLabel] }, row.id)))] })] }), selectedRO ? (_jsx("div", { style: styles.sectionCardMuted, children: _jsxs("div", { style: styles.quickAccessList, children: [_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Customer" }), _jsx("strong", { children: selectedRO.accountLabel })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Plate" }), _jsx("strong", { children: selectedRO.plateNumber || selectedRO.conductionNumber || "-" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Original Invoice" }), _jsx("strong", { children: selectedOriginalInvoice?.invoiceNumber || "None yet" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Original Primary Tech" }), _jsx("strong", { children: techNameById.get(selectedRO.primaryTechnicianId) || "-" })] })] }) })) : null, _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Complaint" }), _jsx("textarea", { style: styles.textarea, value: complaint, onChange: (e) => setComplaint(e.target.value), placeholder: "Customer comeback complaint or follow-up concern" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Findings" }), _jsx("textarea", { style: styles.textarea, value: findings, onChange: (e) => setFindings(e.target.value), placeholder: "Inspection findings for the comeback" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Root Cause" }), _jsx("textarea", { style: styles.textarea, value: rootCause, onChange: (e) => setRootCause(e.target.value), placeholder: "Underlying cause of the return or repeat issue" })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Responsibility" }), _jsxs("select", { style: styles.select, value: responsibility, onChange: (e) => setResponsibility(e.target.value), children: [_jsx("option", { value: "Customer Pay", children: "Customer Pay" }), _jsx("option", { value: "Internal", children: "Internal" }), _jsx("option", { value: "Warranty", children: "Warranty" }), _jsx("option", { value: "Goodwill", children: "Goodwill" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Case Status" }), _jsxs("select", { style: styles.select, value: status, onChange: (e) => setStatus(e.target.value), children: [_jsx("option", { value: "Open", children: "Open" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Monitoring", children: "Monitoring" }), _jsx("option", { value: "Closed", children: "Closed" })] })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Comeback Primary Technician" }), _jsxs("select", { style: styles.select, value: comebackPrimaryTechnicianId, onChange: (e) => setComebackPrimaryTechnicianId(e.target.value), children: [_jsx("option", { value: "", children: "Select technician" }), technicians.map((user) => (_jsxs("option", { value: user.id, children: [user.fullName, " \u2022 ", user.role] }, user.id)))] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Comeback Invoice Number" }), _jsx("input", { style: styles.input, value: comebackInvoiceNumber, onChange: (e) => setComebackInvoiceNumber(e.target.value), placeholder: "Optional invoice for comeback work" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Action Taken" }), _jsx("textarea", { style: styles.textarea, value: actionTaken, onChange: (e) => setActionTaken(e.target.value), placeholder: "Repair or corrective action performed during comeback" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Resolution Notes" }), _jsx("textarea", { style: styles.textarea, value: resolutionNotes, onChange: (e) => setResolutionNotes(e.target.value), placeholder: "Final notes, customer communication, monitoring note, or closure summary" })] }), error ? _jsx("div", { style: styles.errorBox, children: error }) : null, _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.primaryButton, onClick: saveBackjob, children: "Save Backjob" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: resetForm, children: "Reset" })] })] }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsxs(Card, { title: "Backjob Registry", subtitle: "Search returned jobs by backjob number, RO, plate, complaint, cause, or status", right: _jsxs("span", { style: styles.statusNeutral, children: [visibleRecords.length, " shown"] }), children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Search" }), _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search backjob no., RO, plate, complaint, root cause, responsibility" })] }), visibleRecords.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No backjob records yet." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: visibleRecords.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.backjobNumber }), _jsx("span", { style: styles.statusInfo, children: row.status })] }), _jsxs("div", { style: styles.mobileDataPrimary, children: [row.linkedRoNumber, " \u2022 ", row.plateNumber || "-"] }), _jsx("div", { style: styles.mobileDataSecondary, children: row.customerLabel }), _jsx("div", { style: styles.concernCard, children: row.complaint }), _jsxs("div", { style: styles.formHint, children: ["Root cause: ", row.rootCause || "-"] }), _jsxs("div", { style: styles.formHint, children: ["Responsibility: ", row.responsibility] }), _jsxs("div", { style: styles.mobileActionStack, children: [_jsx("button", { type: "button", style: styles.smallButton, onClick: () => updateBackjobStatus(row.id, "In Progress"), children: "Set In Progress" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => updateBackjobStatus(row.id, "Monitoring"), children: "Monitoring" }), _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => updateBackjobStatus(row.id, "Closed"), children: "Close" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => printTextDocument(`Backjob ${row.backjobNumber}`, buildBackjobExportText(row, users)), children: "Print" })] })] }, row.id))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Backjob No." }), _jsx("th", { style: styles.th, children: "Linked RO / Plate" }), _jsx("th", { style: styles.th, children: "Customer" }), _jsx("th", { style: styles.th, children: "Complaint / Root Cause" }), _jsx("th", { style: styles.th, children: "Responsibility" }), _jsx("th", { style: styles.th, children: "Tech Link" }), _jsx("th", { style: styles.th, children: "Status" }), _jsx("th", { style: styles.th, children: "Action" })] }) }), _jsx("tbody", { children: visibleRecords.map((row) => (_jsxs("tr", { children: [_jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: row.backjobNumber }), _jsx("div", { style: styles.tableSecondary, children: formatDateTime(row.createdAt) })] }), _jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: row.linkedRoNumber }), _jsx("div", { style: styles.tableSecondary, children: row.plateNumber || "-" })] }), _jsx("td", { style: styles.td, children: row.customerLabel }), _jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.concernCell, children: row.complaint }), _jsxs("div", { style: styles.tableSecondary, children: ["Cause: ", row.rootCause || "-"] })] }), _jsx("td", { style: styles.td, children: _jsx("span", { style: styles.statusWarning, children: row.responsibility }) }), _jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: techNameById.get(row.comebackPrimaryTechnicianId) || techNameById.get(row.originalPrimaryTechnicianId) || "-" }), _jsxs("div", { style: styles.tableSecondary, children: ["Orig Inv: ", row.originalInvoiceNumber || "-", " \u2022 Comeback Inv: ", row.comebackInvoiceNumber || "-"] })] }), _jsx("td", { style: styles.td, children: _jsx("span", { style: styles.statusInfo, children: row.status }) }), _jsx("td", { style: styles.td, children: _jsxs("div", { style: styles.inlineActionsColumn, children: [_jsx("button", { type: "button", style: styles.smallButton, onClick: () => updateBackjobStatus(row.id, "In Progress"), children: "In Progress" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => updateBackjobStatus(row.id, "Monitoring"), children: "Monitoring" }), _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => updateBackjobStatus(row.id, "Closed"), children: "Close" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => downloadTextFile(`${row.backjobNumber}_backjob.txt`, buildBackjobExportText(row, users)), children: "Export" })] }) })] }, row.id))) })] }) }))] }) })] }) }));
}
export default BackjobPage;
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
    heroText: {
        fontSize: 14,
        color: "#475569",
        lineHeight: 1.7,
        marginBottom: 4,
    },
    statCard: {
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
        border: "1px solid rgba(29,78,216,0.16)",
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 4px 14px rgba(5,11,29,0.08)",
        textAlign: "center",
    },
    statLabel: { fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
    statValue: { fontSize: 28, fontWeight: 900, color: "#1d4ed8", margin: "4px 0" },
    statNote: { fontSize: 11, color: "#94a3b8" },
    formStack: { display: "flex", flexDirection: "column", gap: 12 },
    formGroup: { display: "flex", flexDirection: "column", gap: 4 },
    formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    label: { fontSize: 13, fontWeight: 700, color: "#374151" },
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
    textarea: {
        border: "1px solid rgba(148,163,184,0.4)",
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 14,
        color: "#0f172a",
        background: "#fff",
        outline: "none",
        width: "100%",
        minHeight: 72,
        resize: "vertical",
        boxSizing: "border-box",
    },
    sectionCardMuted: {
        background: "rgba(241,245,249,0.8)",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 10,
        padding: 12,
    },
    quickAccessList: { display: "grid", gap: 6 },
    quickAccessRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 13,
        color: "#475569",
        gap: 8,
    },
    errorBox: {
        background: "#fee2e2",
        border: "1px solid #fca5a5",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        color: "#991b1b",
    },
    inlineActions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    inlineActionsColumn: { display: "flex", flexDirection: "column", gap: 6 },
    primaryButton: {
        border: "none",
        borderRadius: 12,
        padding: "13px 16px",
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        color: "#fff",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(37,99,235,0.22)",
    },
    secondaryButton: {
        border: "1px solid rgba(148,163,184,0.3)",
        borderRadius: 12,
        padding: "13px 16px",
        background: "#ffffff",
        color: "#0f172a",
        fontWeight: 700,
        cursor: "pointer",
    },
    smallButton: {
        border: "none",
        borderRadius: 8,
        padding: "6px 12px",
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 12,
    },
    smallButtonMuted: {
        border: "1px solid rgba(148,163,184,0.3)",
        borderRadius: 8,
        padding: "6px 12px",
        background: "#f8fafc",
        color: "#374151",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 12,
    },
    smallButtonSuccess: {
        border: "none",
        borderRadius: 8,
        padding: "6px 12px",
        background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 12,
    },
    formHint: { fontSize: 12, color: "#94a3b8" },
    emptyState: {
        textAlign: "center",
        color: "#94a3b8",
        fontSize: 14,
        padding: "32px 0",
    },
    mobileCardList: { display: "flex", flexDirection: "column", gap: 12 },
    mobileDataCard: {
        background: "#f8fafc",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    mobileDataCardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 14,
    },
    mobileDataPrimary: { fontSize: 14, fontWeight: 700, color: "#0f172a" },
    mobileDataSecondary: { fontSize: 13, color: "#64748b" },
    mobileActionStack: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 },
    concernCard: {
        background: "#fff",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 13,
        color: "#374151",
    },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: {
        padding: "10px 12px",
        textAlign: "left",
        fontWeight: 700,
        color: "#374151",
        borderBottom: "2px solid rgba(148,163,184,0.2)",
        whiteSpace: "nowrap",
        background: "#f8fafc",
    },
    td: {
        padding: "10px 12px",
        borderBottom: "1px solid rgba(148,163,184,0.12)",
        verticalAlign: "top",
    },
    tablePrimary: { fontWeight: 700, color: "#0f172a", fontSize: 13 },
    tableSecondary: { fontSize: 12, color: "#64748b", marginTop: 2 },
    concernCell: {
        fontSize: 13,
        color: "#374151",
        maxWidth: 200,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    statusInfo: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 700,
        background: "#dbeafe",
        color: "#1d4ed8",
        whiteSpace: "nowrap",
    },
    statusWarning: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 700,
        background: "#fef3c7",
        color: "#92400e",
        whiteSpace: "nowrap",
    },
    statusNeutral: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 700,
        background: "#f1f5f9",
        color: "#475569",
        whiteSpace: "nowrap",
    },
};
