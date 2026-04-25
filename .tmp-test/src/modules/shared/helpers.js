"use strict";
// src/modules/shared/helpers.ts
// Shared helper functions extracted from App.tsx
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocNumber = generateDocNumber;
exports.getPermissionsForRole = getPermissionsForRole;
exports.hasPermission = hasPermission;
exports.getWorkLogMinutes = getWorkLogMinutes;
exports.formatMinutesAsHours = formatMinutesAsHours;
exports.todayStamp = todayStamp;
exports.parseMoneyInput = parseMoneyInput;
exports.formatCurrency = formatCurrency;
exports.formatDateTime = formatDateTime;
exports.getResponsiveSpan = getResponsiveSpan;
exports.canReleaseRO = canReleaseRO;
exports.canExecuteWorkLine = canExecuteWorkLine;
exports.isWorkLineBlockedByParts = isWorkLineBlockedByParts;
exports.canCompleteWorkLine = canCompleteWorkLine;
exports.canMoveToQualityCheck = canMoveToQualityCheck;
exports.canTransitionROStatus = canTransitionROStatus;
exports.getTechnicianProductivity = getTechnicianProductivity;
exports.getAdvisorSalesProduced = getAdvisorSalesProduced;
exports.getRepeatCustomerFrequency = getRepeatCustomerFrequency;
exports.getQcPassFailSummary = getQcPassFailSummary;
exports.getWaitingPartsAging = getWaitingPartsAging;
exports.getBackjobRate = getBackjobRate;
const constants_1 = require("./constants");
function readCounters() {
    try {
        const raw = localStorage.getItem(constants_1.NUMBERING_STORAGE_KEY);
        if (!raw)
            return {};
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function writeCounters(counters) {
    localStorage.setItem(constants_1.NUMBERING_STORAGE_KEY, JSON.stringify(counters));
}
// Generate a stable document number in PREFIX-YYYYMMDD-### format.
// Call once at record creation; never call again on edit.
function generateDocNumber(prefix) {
    const stamp = todayStamp();
    const counters = readCounters();
    const key = `${prefix}_${stamp}`;
    const next = (counters[key] ?? 0) + 1;
    counters[key] = next;
    writeCounters(counters);
    return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}
function getPermissionsForRole(role, defs) {
    const def = defs.find((d) => d.role === role);
    return def ? def.permissions : [];
}
function hasPermission(role, defs, permission) {
    const perms = getPermissionsForRole(role, defs);
    return perms.includes(permission);
}
function getWorkLogMinutes(log) {
    if (log.endedAt)
        return Math.max(0, log.totalMinutes || 0);
    const started = new Date(log.startedAt).getTime();
    if (Number.isNaN(started))
        return Math.max(0, log.totalMinutes || 0);
    return Math.max(0, Math.floor((Date.now() - started) / 60000));
}
function formatMinutesAsHours(minutes) {
    if (!minutes || minutes <= 0)
        return "0.0h";
    return `${(minutes / 60).toFixed(1)}h`;
}
function todayStamp(date = new Date()) {
    const yyyy = date.getFullYear().toString();
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const dd = `${date.getDate()}`.padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}
function parseMoneyInput(value) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
}
function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "-";
    return date.toLocaleString();
}
function getResponsiveSpan(span, isCompactLayout) {
    return isCompactLayout ? "span 12" : `span ${span}`;
}
function canReleaseRO(ro) {
    return ro.status === "Ready Release";
}
function canExecuteWorkLine(ro, line) {
    if (ro.status !== "In Progress" && ro.status !== "Waiting Parts")
        return false;
    if (line.approvalDecision === "Declined" || line.approvalDecision === "Deferred")
        return false;
    return line.status === "Pending" || line.status === "Waiting Parts";
}
const PARTS_BLOCKING_STATUSES = [
    "Draft",
    "Requested",
    "Sent to Suppliers",
    "Waiting for Bids",
    "Bidding",
    "Supplier Selected",
    "Ordered",
    "In Transit",
    "Shipped",
];
function isWorkLineBlockedByParts(line, partsRequests) {
    if (line.status === "Waiting Parts")
        return true;
    return partsRequests.some((req) => req.workLineId === line.id && PARTS_BLOCKING_STATUSES.includes(req.status));
}
function canCompleteWorkLine(ro, line, partsRequests) {
    if (ro.status !== "In Progress" && ro.status !== "Waiting Parts")
        return false;
    if (line.status !== "In Progress")
        return false;
    if (partsRequests && isWorkLineBlockedByParts(line, partsRequests))
        return false;
    return true;
}
function canMoveToQualityCheck(ro) {
    if (ro.status !== "In Progress" && ro.status !== "Waiting Parts")
        return false;
    const approvedOrUnapproved = ro.workLines.filter((l) => l.approvalDecision !== "Declined" && l.approvalDecision !== "Deferred");
    return approvedOrUnapproved.length > 0 && approvedOrUnapproved.every((l) => l.status === "Completed");
}
function canTransitionROStatus(ro, to) {
    const from = ro.status;
    const allowed = {
        "Draft": ["Waiting Inspection", "Approved / Ready to Work"],
        "Waiting Inspection": ["Waiting Approval", "Approved / Ready to Work"],
        "Waiting Approval": ["Approved / Ready to Work"],
        "Approved / Ready to Work": ["In Progress", "Pulled Out"],
        "In Progress": ["Waiting Parts", "Quality Check", "Pulled Out"],
        "Waiting Parts": ["In Progress", "Pulled Out"],
        "Quality Check": ["Ready Release", "In Progress"],
        "Ready Release": ["Released", "Pulled Out"],
        "Released": ["Closed"],
        "Pulled Out": [],
        "Closed": [],
    };
    return (allowed[from] ?? []).includes(to);
}
// --- REPORT HELPERS ---
function getTechnicianProductivity(ros, workLogs, users) {
    const map = new Map();
    for (const ro of ros) {
        for (const line of ro.workLines) {
            if (!line.assignedTechnicianId)
                continue;
            const id = line.assignedTechnicianId;
            if (!map.has(id)) {
                const user = users.find((u) => u.id === id);
                map.set(id, { technicianId: id, technicianName: user?.fullName ?? id, jobCount: 0, laborProduced: 0, loggedMinutes: 0, loggedHours: 0 });
            }
            const row = map.get(id);
            row.jobCount += 1;
            row.laborProduced += parseFloat(line.serviceEstimate) || 0;
        }
    }
    for (const log of workLogs) {
        if (!map.has(log.technicianId)) {
            const user = users.find((u) => u.id === log.technicianId);
            map.set(log.technicianId, { technicianId: log.technicianId, technicianName: user?.fullName ?? log.technicianId, jobCount: 0, laborProduced: 0, loggedMinutes: 0, loggedHours: 0 });
        }
        const row = map.get(log.technicianId);
        row.loggedMinutes += getWorkLogMinutes(log);
    }
    for (const row of map.values()) {
        row.loggedHours = parseFloat((row.loggedMinutes / 60).toFixed(2));
    }
    return Array.from(map.values()).sort((a, b) => b.laborProduced - a.laborProduced);
}
function getAdvisorSalesProduced(ros, invoices) {
    const map = new Map();
    for (const ro of ros) {
        const advisor = ro.advisorName || "Unassigned";
        if (!map.has(advisor)) {
            map.set(advisor, { advisorName: advisor, roCount: 0, totalInvoiced: 0, laborSubtotal: 0, partsSubtotal: 0 });
        }
        map.get(advisor).roCount += 1;
    }
    for (const inv of invoices) {
        const ro = ros.find((r) => r.id === inv.roId);
        if (!ro)
            continue;
        const advisor = ro.advisorName || "Unassigned";
        if (!map.has(advisor)) {
            map.set(advisor, { advisorName: advisor, roCount: 0, totalInvoiced: 0, laborSubtotal: 0, partsSubtotal: 0 });
        }
        const row = map.get(advisor);
        row.totalInvoiced += parseFloat(inv.totalAmount) || 0;
        row.laborSubtotal += parseFloat(inv.laborSubtotal) || 0;
        row.partsSubtotal += parseFloat(inv.partsSubtotal) || 0;
    }
    return Array.from(map.values()).sort((a, b) => b.totalInvoiced - a.totalInvoiced);
}
function getRepeatCustomerFrequency(ros) {
    const map = new Map();
    for (const ro of ros) {
        const key = ro.plateNumber || ro.accountLabel || ro.customerName || ro.id;
        if (!map.has(key)) {
            map.set(key, { key, plateNumber: ro.plateNumber, accountLabel: ro.accountLabel, visitCount: 0, lastVisitDate: "" });
        }
        const row = map.get(key);
        row.visitCount += 1;
        if (!row.lastVisitDate || ro.createdAt > row.lastVisitDate) {
            row.lastVisitDate = ro.createdAt;
        }
    }
    return Array.from(map.values())
        .filter((r) => r.visitCount > 1)
        .sort((a, b) => b.visitCount - a.visitCount);
}
function getQcPassFailSummary(qcRecords) {
    const total = qcRecords.length;
    const passed = qcRecords.filter((q) => q.result === "Passed").length;
    const failed = total - passed;
    const passRatePct = total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0;
    const officerMap = new Map();
    for (const q of qcRecords) {
        const name = q.qcBy || "Unknown";
        if (!officerMap.has(name))
            officerMap.set(name, { total: 0, passed: 0, failed: 0 });
        const row = officerMap.get(name);
        row.total += 1;
        if (q.result === "Passed")
            row.passed += 1;
        else
            row.failed += 1;
    }
    const byQCOfficer = Array.from(officerMap.entries())
        .map(([qcBy, counts]) => ({ qcBy, ...counts }))
        .sort((a, b) => b.total - a.total);
    return { total, passed, failed, passRatePct, byQCOfficer };
}
function getWaitingPartsAging(ros, partsRequests) {
    const now = Date.now();
    const result = [];
    for (const ro of ros) {
        if (ro.status !== "Waiting Parts" && ro.status !== "In Progress")
            continue;
        const blockedLines = ro.workLines.filter((l) => isWorkLineBlockedByParts(l, partsRequests.filter((p) => p.roId === ro.id)));
        if (blockedLines.length === 0)
            continue;
        const earliest = partsRequests
            .filter((p) => p.roId === ro.id && PARTS_BLOCKING_STATUSES.includes(p.status))
            .map((p) => new Date(p.createdAt).getTime())
            .filter((t) => !Number.isNaN(t));
        const oldestMs = earliest.length > 0 ? Math.min(...earliest) : new Date(ro.createdAt).getTime();
        const daysWaiting = Math.floor((now - oldestMs) / 86400000);
        result.push({
            roId: ro.id,
            roNumber: ro.roNumber,
            plateNumber: ro.plateNumber,
            accountLabel: ro.accountLabel,
            daysWaiting,
            blockedWorkLineTitles: blockedLines.map((l) => l.title),
        });
    }
    return result.sort((a, b) => b.daysWaiting - a.daysWaiting);
}
function getBackjobRate(ros, backjobs) {
    const totalROs = ros.length;
    const backjobCount = backjobs.length;
    const backjobRatePct = totalROs > 0 ? parseFloat(((backjobCount / totalROs) * 100).toFixed(1)) : 0;
    const respMap = new Map();
    for (const bj of backjobs) {
        const key = bj.responsibility || "Unknown";
        respMap.set(key, (respMap.get(key) ?? 0) + 1);
    }
    const byResponsibility = Array.from(respMap.entries())
        .map(([responsibility, count]) => ({ responsibility, count }))
        .sort((a, b) => b.count - a.count);
    return { totalROs, backjobCount, backjobRatePct, byResponsibility };
}
