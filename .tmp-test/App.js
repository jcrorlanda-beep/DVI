import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useMemo, useRef, useState } from "react";
import RolesPage from "./modules/roles/RolesPage";
import HistoryPage from "./modules/history/HistoryPage";
import SettingsPage from "./modules/settings/SettingsPage";
import BookingsPage from "./modules/bookings/BookingsPage";
import ReleasePage from "./modules/release/ReleasePage";
import BackjobPage from "./modules/backjobs/BackjobsPage";
import PartsPage from "./modules/parts/PartsPage";
import IntakePage from "./modules/intake/IntakePage";
import QualityControlPage from "./modules/qualityControl/QualityControlPage";
import { getTechnicianProductivity, getAdvisorSalesProduced, getRepeatCustomerFrequency, getQcPassFailSummary, getWaitingPartsAging, getBackjobRate } from "./modules/shared/helpers";
const BOOKING_SERVICE_OPTIONS = [
    "Preventive Maintenance",
    "Oil Change",
    "Brake Service",
    "Suspension / Steering",
    "Wheel Alignment",
    "Tire Service",
    "Air Conditioning",
    "Cooling System",
    "Electrical / Battery",
    "Transmission / Drivetrain",
    "Engine Performance",
    "Underchassis Check",
    "OBD Scan / Computer Diagnosis",
    "Backjob / Comeback",
    "Follow-up",
];
const BOOKING_SERVICE_DETAIL_OPTIONS = {
    "Preventive Maintenance": [
        "5,000 km maintenance",
        "10,000 km maintenance",
        "20,000 km maintenance",
        "General maintenance check",
        "Periodic maintenance service",
        "Other / Describe in notes",
    ],
    "Oil Change": [
        "Oil only",
        "Oil and filter",
        "Fully synthetic",
        "Semi-synthetic",
        "Mineral oil",
        "Other / Describe in notes",
    ],
    "Brake Service": [
        "Brake inspection",
        "Brake cleaning",
        "Brake pad replacement",
        "Brake shoe replacement",
        "Rotor resurfacing",
        "Other / Describe in notes",
    ],
    "Suspension / Steering": [
        "Underchassis noise check",
        "Shock absorber check",
        "Ball joint check",
        "Tie rod end check",
        "Steering rack inspection",
        "Other / Describe in notes",
    ],
    "Wheel Alignment": [
        "Front wheel alignment",
        "Four-wheel alignment",
        "Steering pull correction",
        "Uneven tire wear check",
        "Post-suspension alignment",
        "Other / Describe in notes",
    ],
    "Tire Service": [
        "Tire replacement",
        "Tire rotation",
        "Tire balancing",
        "Flat tire repair",
        "Nitrogen refill",
        "Other / Describe in notes",
    ],
    "Air Conditioning": [
        "A/C check-up",
        "Not cold",
        "A/C cleaning",
        "Compressor inspection",
        "Blower issue",
        "Other / Describe in notes",
    ],
    "Cooling System": [
        "Overheating check",
        "Coolant leak check",
        "Radiator cleaning",
        "Water pump inspection",
        "Thermostat inspection",
        "Other / Describe in notes",
    ],
    "Electrical / Battery": [
        "Battery replacement",
        "Charging system check",
        "Starter issue",
        "Alternator check",
        "Lights / wiring issue",
        "Other / Describe in notes",
    ],
    "Transmission / Drivetrain": [
        "Hard shifting",
        "Transmission fluid service",
        "Clutch concern",
        "Vibration check",
        "Drive axle / CV joint check",
        "Other / Describe in notes",
    ],
    "Engine Performance": [
        "Rough idle",
        "Loss of power",
        "Misfire concern",
        "Smoke check",
        "Engine performance diagnosis",
        "Other / Describe in notes",
    ],
    "Underchassis Check": [
        "Full underchassis inspection",
        "Noise underchassis",
        "Suspension play check",
        "Leak inspection underneath",
        "Visual underchassis check",
        "Other / Describe in notes",
    ],
    "OBD Scan / Computer Diagnosis": [
        "Check engine light",
        "Warning light diagnosis",
        "Pre-repair scan",
        "Full system scan",
        "Computer diagnostic test",
        "Other / Describe in notes",
    ],
    "Backjob / Comeback": [
        "Return visit",
        "Same issue unresolved",
        "New issue after repair",
        "Warranty claim",
        "Backjob verification",
        "Other / Describe in notes",
    ],
    "Follow-up": [
        "Post-repair follow-up",
        "Maintenance follow-up",
        "Recheck after recommendation",
        "Monitoring visit",
        "Customer requested follow-up",
        "Other / Describe in notes",
    ],
};
function getBookingServiceDetailOptions(serviceType) {
    return BOOKING_SERVICE_DETAIL_OPTIONS[serviceType] ?? ["Other / Describe in notes"];
}
const BUILD_VERSION = "Phase 17K.1  -  Inspection UI Cleanup + Faster Encoding";
const STORAGE_KEYS = {
    users: "dvi_phase1_users_v2",
    session: "dvi_phase1_session_v2",
    bookings: "dvi_phase17d_bookings_v1",
    intakeDraft: "dvi_phase17i_intake_draft_v1",
    inspectionDraft: "dvi_phase17i_inspection_draft_v1",
    bookingDraft: "dvi_phase17i_booking_draft_v1",
    currentView: "dvi_phase1_current_view_v2",
    rolePermissions: "dvi_phase1_role_permissions_v2",
    intakeRecords: "dvi_phase2_intake_records_v1",
    inspectionRecords: "dvi_phase3_inspection_records_v1",
    repairOrders: "dvi_phase4_repair_orders_v1",
    qcRecords: "dvi_phase6_qc_records_v1",
    releaseRecords: "dvi_phase7_release_records_v1",
    partsRequests: "dvi_phase8_parts_requests_v1",
    approvalRecords: "dvi_phase9_approval_records_v1",
    backjobRecords: "dvi_phase9_backjob_records_v1",
    invoiceRecords: "dvi_phase10_invoice_records_v1",
    paymentRecords: "dvi_phase10_payment_records_v1",
    workLogs: "dvi_phase16_work_logs_v1",
    customerAccounts: "dvi_phase15a_customer_accounts_v1",
    customerSession: "dvi_phase15a_customer_session_v1",
    approvalLinkTokens: "dvi_phase15b_approval_link_tokens_v1",
    smsApprovalLogs: "dvi_phase15b_sms_approval_logs_v1",
    smsProviderMode: "dvi_sms_provider_mode_v1",
    smsAndroidGatewayUrl: "dvi_sms_android_gateway_url_v1",
    smsAndroidGatewayApiKey: "dvi_sms_android_gateway_api_key_v1",
    smsAndroidSenderDeviceLabel: "dvi_sms_android_sender_label_v1",
    smsTwilioAccountSid: "dvi_sms_twilio_account_sid_v1",
    smsTwilioFromNumber: "dvi_sms_twilio_from_number_v1",
    counters: "dvi_phase2_counters_v1",
};
const ALL_ROLES = [
    "Admin",
    "Service Advisor",
    "Chief Technician",
    "Senior Mechanic",
    "General Mechanic",
    "Office Staff",
    "Reception",
    "OJT",
];
const ALL_PERMISSIONS = [
    "dashboard.view",
    "bookings.view",
    "intake.view",
    "inspection.view",
    "repairOrders.view",
    "shopFloor.view",
    "qualityControl.view",
    "release.view",
    "parts.view",
    "backjobs.view",
    "history.view",
    "users.view",
    "users.manage",
    "roles.view",
    "roles.manage",
    "settings.view",
];
const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", icon: "DB", permission: "dashboard.view" },
    { key: "bookings", label: "Bookings", icon: "BK", permission: "bookings.view" },
    { key: "intake", label: "Intake", icon: "IN", permission: "intake.view" },
    { key: "inspection", label: "Inspection", icon: "IP", permission: "inspection.view" },
    {
        key: "repairOrders",
        label: "Repair Orders",
        icon: "RO",
        permission: "repairOrders.view",
    },
    { key: "shopFloor", label: "Shop Floor", icon: "SF", permission: "shopFloor.view" },
    {
        key: "qualityControl",
        label: "Quality Control",
        icon: "QC",
        permission: "qualityControl.view",
    },
    { key: "release", label: "Release", icon: "RL", permission: "release.view" },
    { key: "parts", label: "Parts", icon: "PT", permission: "parts.view" },
    { key: "backjobs", label: "Backjobs", icon: "BJ", permission: "backjobs.view" },
    { key: "history", label: "History", icon: "HI", permission: "history.view" },
    { key: "users", label: "Users", icon: "US", permission: "users.view" },
    { key: "roles", label: "Roles & Permissions", icon: "RP", permission: "roles.view" },
    { key: "settings", label: "Settings", icon: "ST", permission: "settings.view" },
];
const ROLE_COLORS = {
    Admin: { bg: "#fee2e2", text: "#991b1b" },
    "Service Advisor": { bg: "#dbeafe", text: "#1d4ed8" },
    "Chief Technician": { bg: "#dcfce7", text: "#166534" },
    "Senior Mechanic": { bg: "#fef3c7", text: "#92400e" },
    "General Mechanic": { bg: "#ede9fe", text: "#6d28d9" },
    "Office Staff": { bg: "#cffafe", text: "#155e75" },
    Reception: { bg: "#fae8ff", text: "#86198f" },
    OJT: { bg: "#e5e7eb", text: "#374151" },
};
function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function createSecurePortalToken() {
    return `tok_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
function getPortalTokenExpiry(hours = 72) {
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
function getApprovalLinkExpiryMs(token) {
    const expiry = new Date(token.expiresAt).getTime();
    return Number.isNaN(expiry) ? 0 : expiry;
}
function isApprovalLinkActive(token) {
    return !token.revokedAt && getApprovalLinkExpiryMs(token) > Date.now();
}
function getLatestActiveApprovalLinkForRo(tokens, roId) {
    return tokens
        .filter((token) => token.roId === roId && isApprovalLinkActive(token))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
}
function readStoredSetting(key) {
    if (typeof window === "undefined")
        return "";
    try {
        return window.localStorage.getItem(key)?.trim() || "";
    }
    catch {
        return "";
    }
}
function getSmsProviderConfig() {
    if (typeof window === "undefined") {
        return {
            provider: "Simulated",
            mode: "simulated",
            endpointLabel: "Frontend simulation",
            gatewayUrl: "",
            authToken: "",
            senderDeviceLabel: "",
            twilioAccountSid: "",
            twilioFromNumber: "",
            isConfigured: false,
        };
    }
    const storedProvider = readStoredSetting(STORAGE_KEYS.smsProviderMode);
    const normalized = storedProvider === "android" || storedProvider === "twilio" ? storedProvider : "simulated";
    const gatewayUrl = readStoredSetting(STORAGE_KEYS.smsAndroidGatewayUrl);
    const authToken = readStoredSetting(STORAGE_KEYS.smsAndroidGatewayApiKey);
    const senderDeviceLabel = readStoredSetting(STORAGE_KEYS.smsAndroidSenderDeviceLabel);
    const twilioAccountSid = readStoredSetting(STORAGE_KEYS.smsTwilioAccountSid);
    const twilioFromNumber = readStoredSetting(STORAGE_KEYS.smsTwilioFromNumber);
    if (normalized === "android") {
        return {
            provider: "Android SMS Gateway",
            mode: normalized,
            endpointLabel: gatewayUrl || "Android gateway placeholder",
            gatewayUrl,
            authToken,
            senderDeviceLabel,
            twilioAccountSid,
            twilioFromNumber,
            isConfigured: !!gatewayUrl,
        };
    }
    if (normalized === "twilio") {
        return {
            provider: "Twilio",
            mode: normalized,
            endpointLabel: twilioFromNumber || twilioAccountSid || "Twilio placeholder",
            gatewayUrl,
            authToken,
            senderDeviceLabel,
            twilioAccountSid,
            twilioFromNumber,
            isConfigured: !!twilioAccountSid && !!twilioFromNumber,
        };
    }
    return {
        provider: "Simulated",
        mode: normalized,
        endpointLabel: "No provider configured",
        gatewayUrl,
        authToken,
        senderDeviceLabel,
        twilioAccountSid,
        twilioFromNumber,
        isConfigured: false,
    };
}
function formatProviderResponse(rawResponse) {
    const trimmed = rawResponse.trim();
    if (!trimmed)
        return "";
    try {
        const parsed = JSON.parse(trimmed);
        const pretty = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
        return pretty.length > 280 ? `${pretty.slice(0, 277)}...` : pretty;
    }
    catch {
        return trimmed.length > 280 ? `${trimmed.slice(0, 277)}...` : trimmed;
    }
}
async function sendViaAndroidSmsGateway(config, payload) {
    if (!config.gatewayUrl) {
        return {
            provider: config.provider,
            status: "Failed",
            errorMessage: "Android SMS gateway URL is not configured.",
            detail: "Android SMS gateway is not configured. Saved message was not sent.",
        };
    }
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = typeof window !== "undefined"
        ? window.setTimeout(() => {
            controller?.abort();
        }, 10000)
        : undefined;
    try {
        const response = await fetch(config.gatewayUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {}),
                ...(config.authToken ? { "X-API-Key": config.authToken } : {}),
                ...(config.senderDeviceLabel ? { "X-Sender-Device": config.senderDeviceLabel } : {}),
            },
            body: JSON.stringify({
                app: "DVI",
                channel: "android-sms",
                customerId: payload.customerId,
                customerName: payload.customerName,
                message: payload.messageBody,
                messageType: payload.messageType,
                roId: payload.roId,
                roNumber: payload.roNumber,
                senderDeviceLabel: config.senderDeviceLabel,
                templateKey: payload.messageType,
                tokenId: payload.tokenId,
                to: payload.phoneNumber,
                timestamp: new Date().toISOString(),
            }),
            signal: controller?.signal,
        });
        const responseText = await response.text();
        const providerResponse = formatProviderResponse(responseText);
        let responseIndicatesFailure = false;
        try {
            const parsed = JSON.parse(responseText);
            if (parsed && typeof parsed === "object") {
                const responseObject = parsed;
                const statusValue = String(responseObject.status ?? responseObject.state ?? "").toLowerCase();
                responseIndicatesFailure =
                    responseObject.success === false ||
                        responseObject.ok === false ||
                        statusValue === "error" ||
                        statusValue === "failed";
            }
        }
        catch {
            responseIndicatesFailure = false;
        }
        if (!response.ok || responseIndicatesFailure) {
            return {
                provider: config.provider,
                status: "Failed",
                errorMessage: response.ok ? "Gateway response indicated a failure." : `Gateway returned HTTP ${response.status}.`,
                providerResponse: providerResponse || `HTTP ${response.status}`,
                detail: response.ok
                    ? "Android SMS gateway returned a failure response."
                    : `Android SMS gateway returned HTTP ${response.status}.`,
            };
        }
        return {
            provider: config.provider,
            status: "Sent",
            providerResponse: providerResponse || `HTTP ${response.status}`,
            detail: `Android SMS gateway accepted the message for ${config.senderDeviceLabel || config.endpointLabel}.`,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown gateway error.";
        return {
            provider: config.provider,
            status: "Failed",
            errorMessage: message,
            detail: "Android SMS gateway send failed.",
            providerResponse: message,
        };
    }
    finally {
        if (typeof window !== "undefined" && timeoutId !== undefined) {
            window.clearTimeout(timeoutId);
        }
    }
}
async function dispatchSmsTemplateMessage(payload) {
    const config = getSmsProviderConfig();
    const hasMessage = payload.messageBody.trim().length > 0;
    const hasPhone = sanitizePhone(payload.phoneNumber).length > 0;
    if (!hasMessage) {
        return {
            provider: config.provider,
            status: "Failed",
            errorMessage: "Message body is empty.",
            detail: "Failed: empty message body.",
        };
    }
    if (!hasPhone) {
        return {
            provider: config.provider,
            status: "Failed",
            errorMessage: "Customer phone number is missing.",
            detail: "Failed: missing customer phone number.",
        };
    }
    if (config.provider === "Simulated") {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        return {
            provider: config.provider,
            status: "Sent",
            providerResponse: "Simulated local dispatch completed.",
            detail: "Simulated SMS send completed locally.",
        };
    }
    if (config.provider === "Android SMS Gateway") {
        if (!config.isConfigured) {
            return {
                provider: config.provider,
                status: "Failed",
                errorMessage: "Android SMS gateway settings are missing.",
                providerResponse: "Android SMS gateway is not configured.",
                detail: "Android SMS gateway is not configured. Saved message was not sent.",
            };
        }
        return sendViaAndroidSmsGateway(config, payload);
    }
    if (!config.isConfigured) {
        return {
            provider: config.provider,
            status: "Failed",
            errorMessage: `${config.provider} settings are missing.`,
            providerResponse: `${config.provider} is not configured.`,
            detail: `${config.provider} is not configured. Saved message was not sent.`,
        };
    }
    return {
        provider: config.provider,
        status: "Sent",
        providerResponse: `${config.provider} placeholder queue accepted.`,
        detail: `${config.provider} ready. Message queued to ${config.endpointLabel}.`,
    };
}
function getEffectiveTokenExpiry(token, ro) {
    if (!ro || !["Released", "Closed"].includes(ro.status)) {
        return Infinity;
    }
    const releaseTime = new Date(ro.updatedAt).getTime();
    return Number.isNaN(releaseTime) ? Infinity : releaseTime + 30 * 24 * 60 * 60 * 1000;
}
function buildCustomerApprovalLinkUrl(token) {
    if (typeof window === "undefined")
        return `/customer-view?token=${token}`;
    return `${window.location.origin}/customer-view?token=${token}`;
}
function buildCustomerSmsLinkLabel(token) {
    return buildCustomerApprovalLinkUrl(token);
}
function buildCustomerPortalUrl(token) {
    return buildCustomerApprovalLinkUrl(token);
}
function buildCustomerBookingUrl() {
    if (typeof window === "undefined")
        return "?portal=booking";
    return `${window.location.origin}${window.location.pathname}?portal=booking`;
}
function addMonthsToDate(dateValue, months) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime()))
        return new Date();
    date.setMonth(date.getMonth() + months);
    return date;
}
function addDaysToDate(dateValue, days) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime()))
        return new Date();
    date.setDate(date.getDate() + days);
    return date;
}
function parseOdometerValue(value) {
    const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
}
function hasMaintenanceTitleMatch(existing, title) {
    const normalizedTitle = title.trim().toLowerCase();
    return existing.some((entry) => {
        if (typeof entry === "string") {
            return entry.trim().toLowerCase() === normalizedTitle;
        }
        return String(entry?.title ?? "").trim().toLowerCase() === normalizedTitle;
    });
}
function normalizeMaintenanceText(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function parseMaintenanceYear(value) {
    const normalized = String(value ?? "").replace(/[^0-9]/g, "").trim();
    if (!normalized)
        return null;
    const parsed = Number(normalized.slice(0, 4));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
function parseMaintenanceOdometer(value) {
    const parsed = parseOdometerValue(value);
    return parsed && parsed > 0 ? parsed : null;
}
function getMaintenanceServiceKey(suggestion) {
    return normalizeMaintenanceText(suggestion.serviceKey || suggestion.title);
}
function getMaintenanceVehicleKey(context) {
    return normalizeVehicleKey(context.plateNumber ?? "", context.conductionNumber ?? "");
}
function getMaintenanceSpecificityRank(suggestion) {
    if (suggestion.specificityTag === "Interval-based")
        return 2;
    if (suggestion.specificityTag === "Make-specific")
        return 3;
    if (suggestion.specificityTag === "Model-specific")
        return 4;
    if (suggestion.specificityTag === "Year range")
        return 4;
    return suggestion.source === "Mileage" ? 2 : 1;
}
function getLibrarySpecificityTag(entry, vehicleYear) {
    if (entry.yearFrom != null || entry.yearTo != null) {
        if (entry.yearFrom != null && entry.yearTo != null && entry.yearFrom === entry.yearTo && vehicleYear === entry.yearFrom) {
            return "Model-specific";
        }
        return "Year range";
    }
    if (entry.make && entry.model)
        return "Model-specific";
    if (entry.make)
        return "Make-specific";
    return "General";
}
function matchesMaintenanceLibraryEntry(entry, context) {
    const make = normalizeMaintenanceText(context.make);
    const model = normalizeMaintenanceText(context.model);
    const year = parseMaintenanceYear(context.year);
    const odometerKm = parseMaintenanceOdometer(context.odometerKm);
    const entryMake = normalizeMaintenanceText(entry.make ?? "");
    const entryModel = normalizeMaintenanceText(entry.model ?? "");
    if (entry.make && make !== entryMake)
        return false;
    if (entry.model && model !== entryModel)
        return false;
    if ((entry.yearFrom != null || entry.yearTo != null) && year == null)
        return false;
    if (year != null && entry.yearFrom != null && year < entry.yearFrom)
        return false;
    if (year != null && entry.yearTo != null && year > entry.yearTo)
        return false;
    if ((entry.odometerMinKm != null || entry.odometerMaxKm != null) && odometerKm == null)
        return false;
    if (odometerKm != null && entry.odometerMinKm != null && odometerKm < entry.odometerMinKm)
        return false;
    if (odometerKm != null && entry.odometerMaxKm != null && odometerKm > entry.odometerMaxKm)
        return false;
    return true;
}
function getRecommendationLibrarySuggestions(context) {
    return MAINTENANCE_LIBRARY_ENTRIES.filter((entry) => matchesMaintenanceLibraryEntry(entry, context)).map((entry) => {
        const vehicleYear = parseMaintenanceYear(context.year);
        const specificityTag = entry.specificityTag ?? getLibrarySpecificityTag(entry, vehicleYear);
        const specificityRank = entry.yearFrom != null &&
            entry.yearTo != null &&
            entry.yearFrom === entry.yearTo &&
            vehicleYear === entry.yearFrom
            ? 5
            : getMaintenanceSpecificityRank({ specificityTag, source: "Library" });
        return {
            id: `library-${entry.id}`,
            title: entry.title,
            reason: entry.reason,
            intervalTag: entry.yearFrom != null || entry.yearTo != null
                ? entry.yearFrom === entry.yearTo
                    ? `${entry.yearFrom}`
                    : `${entry.yearFrom ?? "?"}–${entry.yearTo ?? "?"}`
                : specificityTag,
            category: entry.category,
            source: "Library",
            serviceKey: entry.serviceKey,
            specificityTag,
            specificityRank,
            isConditional: entry.isConditional,
        };
    });
}
function dedupeMaintenanceSuggestions(suggestions) {
    const byServiceKey = new Map();
    suggestions.forEach((suggestion) => {
        const key = getMaintenanceServiceKey(suggestion);
        const current = byServiceKey.get(key);
        if (!current) {
            byServiceKey.set(key, suggestion);
            return;
        }
        const currentRank = current.specificityRank ?? 0;
        const nextRank = suggestion.specificityRank ?? 0;
        if (nextRank > currentRank) {
            byServiceKey.set(key, suggestion);
            return;
        }
        if (nextRank === currentRank && suggestion.source === "Library" && current.source === "Mileage") {
            byServiceKey.set(key, suggestion);
        }
    });
    return Array.from(byServiceKey.values()).sort((a, b) => {
        const rankDiff = (b.specificityRank ?? 0) - (a.specificityRank ?? 0);
        if (rankDiff !== 0)
            return rankDiff;
        const categoryDiff = (a.category ?? "General").localeCompare(b.category ?? "General");
        if (categoryDiff !== 0)
            return categoryDiff;
        return a.title.localeCompare(b.title);
    });
}
function getMaintenanceSuggestionPurposeKeys(text) {
    const normalized = normalizeMaintenanceText(text);
    if (!normalized)
        return [];
    const keys = new Set();
    const cleaned = normalized.replace(/\s+/g, " ");
    const addKey = (key) => keys.add(normalizeMaintenanceText(key));
    if (/(?:^|\s)(?:5\s?000|5000|5k)(?:\s|$)/.test(cleaned) ||
        cleaned.includes("periodic maintenance") ||
        cleaned.includes("oil change") ||
        cleaned.includes("oil service") ||
        cleaned.includes("oil and filter") ||
        cleaned.includes("engine oil") ||
        cleaned.includes("pms")) {
        addKey("pms-5000");
    }
    if (/(?:^|\s)(?:10\s?000|10000|10k)(?:\s|$)/.test(cleaned) ||
        cleaned.includes("air cabin brake underchassis") ||
        cleaned.includes("underchassis inspection")) {
        addKey("pms-10000");
    }
    if (/(?:^|\s)(?:20\s?000|20000|20k)(?:\s|$)/.test(cleaned)) {
        addKey("pms-20000");
    }
    if (/(?:^|\s)(?:40\s?000|40000|40k)(?:\s|$)/.test(cleaned)) {
        addKey("pms-40000");
    }
    if (cleaned.includes("egr") || cleaned.includes("intake manifold") || cleaned.includes("air intake")) {
        addKey("air-intake-review");
    }
    if (cleaned.includes("suspension") || cleaned.includes("steering") || cleaned.includes("alignment") || cleaned.includes("underchassis") || cleaned.includes("chassis")) {
        addKey("suspension-review");
    }
    if (cleaned.includes("major service") || cleaned.includes("timing belt") || cleaned.includes("timing chain") || cleaned.includes("major review")) {
        addKey("major-service-review");
    }
    if (cleaned.includes("brake") || cleaned.includes("brakes") || cleaned.includes("rotor") || cleaned.includes("pad")) {
        addKey("brake-review");
    }
    if (cleaned.includes("battery") || cleaned.includes("charging system") || cleaned.includes("alternator") || cleaned.includes("starter") || cleaned.includes("electrical")) {
        addKey("battery-review");
    }
    if (cleaned.includes("air conditioning") || cleaned.includes(" a/c") || cleaned.startsWith("ac ") || cleaned.includes(" cabin filter") || cleaned.includes("cooling performance")) {
        addKey("ac-review");
    }
    if (cleaned.includes("cooling") || cleaned.includes("coolant") || cleaned.includes("radiator") || cleaned.includes("thermostat") || cleaned.includes("water pump") || cleaned.includes("overheat")) {
        addKey("cooling-review");
    }
    keys.add(cleaned);
    return Array.from(keys);
}
function getRecentMaintenanceHistorySuppression(context, lookbackDays = 180) {
    const vehicleKey = getMaintenanceVehicleKey(context);
    const suppressedServiceKeys = new Set();
    const suppressedTitles = new Set();
    if (!vehicleKey)
        return { suppressedServiceKeys, suppressedTitles };
    const cutoffTime = Date.now() - Math.max(0, lookbackDays) * 24 * 60 * 60 * 1000;
    (context.serviceHistoryRepairOrders ?? []).forEach((ro) => {
        if (getMaintenanceVehicleKey(ro) !== vehicleKey)
            return;
        ro.workLines.forEach((line) => {
            const completionValue = line.completedAt ||
                ((ro.status === "Released" || ro.status === "Closed") ? ro.updatedAt || ro.createdAt : "");
            if (!completionValue)
                return;
            const completedAt = new Date(completionValue).getTime();
            if (Number.isNaN(completedAt) || completedAt < cutoffTime)
                return;
            if (line.approvalDecision === "Declined")
                return;
            const searchableText = [line.title, line.customerDescription, line.category, line.notes].filter(Boolean).join(" ");
            getMaintenanceSuggestionPurposeKeys(searchableText).forEach((key) => suppressedServiceKeys.add(key));
            const normalizedTitle = normalizeMaintenanceText(line.title);
            if (normalizedTitle)
                suppressedTitles.add(normalizedTitle);
        });
    });
    return { suppressedServiceKeys, suppressedTitles };
}
function filterRecentlyCompletedSuggestions(suggestions, context) {
    const suppression = getRecentMaintenanceHistorySuppression(context);
    if (!suppression.suppressedServiceKeys.size && !suppression.suppressedTitles.size) {
        return suggestions;
    }
    return suggestions.filter((suggestion) => {
        const suggestionServiceKey = getMaintenanceServiceKey(suggestion);
        if (suggestionServiceKey && suppression.suppressedServiceKeys.has(suggestionServiceKey))
            return false;
        if (suppression.suppressedTitles.has(normalizeMaintenanceText(suggestion.title)))
            return false;
        return true;
    });
}
function buildUnifiedMaintenanceSuggestions(context) {
    return getUnifiedMaintenanceSuggestions({
        make: context.make,
        model: context.model,
        year: context.year,
        odometerKm: context.odometerKm,
        plateNumber: context.plateNumber,
        conductionNumber: context.conductionNumber,
        serviceHistoryRepairOrders: context.serviceHistoryRepairOrders,
    });
}
function groupMaintenanceSuggestionsByCategory(suggestions) {
    const grouped = new Map();
    suggestions.forEach((suggestion) => {
        const category = suggestion.category?.trim() || "General";
        grouped.set(category, [...(grouped.get(category) ?? []), suggestion]);
    });
    return Array.from(grouped.entries())
        .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => (b.specificityRank ?? 0) - (a.specificityRank ?? 0) || a.title.localeCompare(b.title)),
    }))
        .sort((a, b) => a.category.localeCompare(b.category));
}
export function normalizeMileageSuggestions(context) {
    return getMileageMaintenanceSuggestions(context.odometerKm);
}
export function normalizeLibrarySuggestions(context) {
    return getRecommendationLibrarySuggestions(context);
}
export function getSuggestionSpecificityScore(suggestion) {
    return getMaintenanceSpecificityRank(suggestion);
}
export function dedupeSuggestionsByPurpose(suggestions) {
    return dedupeMaintenanceSuggestions(suggestions);
}
export function filterAlreadyAddedSuggestions(suggestions, existingRecommendationTitles, existingWorkLineTitles, dismissedSuggestionIds = []) {
    return suggestions.filter((suggestion) => {
        if (dismissedSuggestionIds.includes(suggestion.id))
            return false;
        if (hasMaintenanceTitleMatch(existingWorkLineTitles, suggestion.title))
            return false;
        if (hasMaintenanceTitleMatch(existingRecommendationTitles, suggestion.title))
            return false;
        return true;
    });
}
export function groupSuggestionsByCategory(suggestions) {
    return groupMaintenanceSuggestionsByCategory(suggestions);
}
export function getUnifiedMaintenanceSuggestions(context) {
    const normalized = [
        ...normalizeMileageSuggestions(context),
        ...normalizeLibrarySuggestions(context),
    ].map((suggestion) => ({
        ...suggestion,
        specificityRank: suggestion.specificityRank ?? getSuggestionSpecificityScore(suggestion),
    }));
    const deduped = dedupeSuggestionsByPurpose(normalized);
    const historySuppressed = filterRecentlyCompletedSuggestions(deduped, context);
    return filterAlreadyAddedSuggestions(historySuppressed, context.existingRecommendationTitles ?? [], context.existingWorkLineTitles ?? [], context.dismissedSuggestionIds ?? []);
}
const MAINTENANCE_LIBRARY_ENTRIES = [
    {
        id: "library-pms-general",
        serviceKey: "pms-5000",
        title: "5,000 km periodic maintenance package",
        reason: "General preventive maintenance checklist for lubrication, filters, and basic safety checks.",
        category: "Periodic Maintenance",
        specificityTag: "General",
    },
    {
        id: "library-pms-fortuner",
        serviceKey: "pms-5000",
        title: "Toyota Fortuner 2021 periodic maintenance package",
        reason: "Fortuner-specific periodic maintenance review for the current demo vehicle profile.",
        category: "Periodic Maintenance",
        make: "Toyota",
        model: "Fortuner",
        yearFrom: 2021,
        yearTo: 2021,
        specificityTag: "Model-specific",
    },
    {
        id: "library-pms-montero",
        serviceKey: "pms-10000",
        title: "Mitsubishi Montero Sport periodic maintenance package",
        reason: "Model-specific periodic maintenance package for Montero Sport units with active mileage review.",
        category: "Periodic Maintenance",
        make: "Mitsubishi",
        model: "Montero Sport",
        yearFrom: 2023,
        yearTo: 2023,
        specificityTag: "Model-specific",
    },
    {
        id: "library-suspension-general",
        serviceKey: "suspension-review",
        title: "Suspension and steering review",
        reason: "General suspension service recommendation for ride quality, steering feel, and tire wear concerns.",
        category: "Suspension",
        specificityTag: "General",
    },
    {
        id: "library-suspension-fortuner",
        serviceKey: "suspension-review",
        title: "Toyota Fortuner front suspension and steering review",
        reason: "More specific front-end suspension service for Fortuner units with noise, pull, or uneven tire wear.",
        category: "Suspension",
        make: "Toyota",
        model: "Fortuner",
        yearFrom: 2021,
        yearTo: 2021,
        specificityTag: "Model-specific",
    },
    {
        id: "library-ac-general",
        serviceKey: "ac-review",
        title: "Air conditioning performance inspection",
        reason: "General A/C service for weak cooling, airflow, or cabin comfort concerns.",
        category: "Air Conditioning",
        specificityTag: "General",
    },
    {
        id: "library-ac-montero",
        serviceKey: "ac-review",
        title: "Mitsubishi Montero Sport A/C and cabin filter review",
        reason: "Vehicle-specific A/C and cabin filter review for Montero Sport units with cooling concerns.",
        category: "Air Conditioning",
        make: "Mitsubishi",
        model: "Montero Sport",
        yearFrom: 2023,
        yearTo: 2023,
        specificityTag: "Model-specific",
    },
    {
        id: "library-brake-general",
        serviceKey: "brake-review",
        title: "Brake inspection and cleaning",
        reason: "General brake service recommendation for pad wear, rotor condition, and brake feel.",
        category: "Brakes",
        specificityTag: "General",
    },
    {
        id: "library-brake-civic",
        serviceKey: "brake-review",
        title: "Honda Civic brake and alignment review",
        reason: "Year-specific brake and alignment service for Civic units with stopping or tire wear concerns.",
        category: "Brakes",
        make: "Honda",
        model: "Civic",
        yearFrom: 2018,
        yearTo: 2021,
        specificityTag: "Year range",
    },
    {
        id: "library-electrical-general",
        serviceKey: "battery-review",
        title: "Battery and charging system inspection",
        reason: "General electrical service recommendation for starting, charging, and warning light concerns.",
        category: "Electrical",
        specificityTag: "General",
    },
    {
        id: "library-electrical-toyota",
        serviceKey: "battery-review",
        title: "Toyota battery and charging system review",
        reason: "Make-specific electrical inspection for Toyota vehicles with battery or charging concerns.",
        category: "Electrical",
        make: "Toyota",
        specificityTag: "Make-specific",
    },
    {
        id: "library-cooling-general",
        serviceKey: "cooling-review",
        title: "Cooling system inspection",
        reason: "General cooling system service for overheating, leaks, or coolant condition concerns.",
        category: "Cooling",
        specificityTag: "General",
    },
];
const MILEAGE_SUGGESTION_TOLERANCE_KM = 500;
function shouldTriggerMileageInterval(odometerKm, intervalKm, toleranceKm = MILEAGE_SUGGESTION_TOLERANCE_KM) {
    if (odometerKm < Math.max(0, intervalKm - toleranceKm))
        return false;
    const nearestTarget = Math.round(odometerKm / intervalKm) * intervalKm;
    if (nearestTarget < intervalKm)
        return false;
    return Math.abs(odometerKm - nearestTarget) <= toleranceKm;
}
function getMileageMaintenanceSuggestions(odometerKmRaw) {
    const odometerKm = parseOdometerValue(odometerKmRaw);
    if (odometerKm == null || odometerKm <= 0)
        return [];
    const suggestions = [];
    const push = (condition, suggestion) => {
        if (!condition)
            return;
        if (suggestions.some((row) => row.id === suggestion.id))
            return;
        suggestions.push(suggestion);
    };
    push(shouldTriggerMileageInterval(odometerKm, 5000), {
        id: 'mileage-5000-core',
        title: '5,000 km periodic maintenance package',
        reason: 'Helps keep lubrication, tire wear, and safety checks on schedule.',
        intervalTag: 'Every 5,000 km',
        category: 'Periodic Maintenance',
        source: 'Mileage',
        serviceKey: 'pms-5000',
        specificityTag: 'Interval-based',
        specificityRank: 2,
    });
    push(shouldTriggerMileageInterval(odometerKm, 10000), {
        id: 'mileage-10000-core',
        title: '10,000 km air, cabin, brake, and underchassis inspection package',
        reason: 'Targets filtration, braking, and chassis condition checks at 10,000 km intervals.',
        intervalTag: 'Every 10,000 km',
        category: 'Periodic Maintenance',
        source: 'Mileage',
        serviceKey: 'pms-10000',
        specificityTag: 'Interval-based',
        specificityRank: 2,
    });
    push(shouldTriggerMileageInterval(odometerKm, 20000), {
        id: 'mileage-20000-core',
        title: '20,000 km intake, brake, battery, and suspension check package',
        reason: 'Covers drivetrain airflow, braking service, and chassis health milestones.',
        intervalTag: 'Every 20,000 km',
        category: 'Periodic Maintenance',
        source: 'Mileage',
        serviceKey: 'pms-20000',
        specificityTag: 'Interval-based',
        specificityRank: 2,
    });
    push(shouldTriggerMileageInterval(odometerKm, 30000), {
        id: 'mileage-30000-egr-intake',
        title: 'EGR and intake manifold cleaning (if applicable)',
        reason: 'Carbon build-up cleaning may be needed at major 30,000 km intervals.',
        intervalTag: 'Every 30,000 km',
        category: 'Engine',
        source: 'Mileage',
        serviceKey: 'air-intake-review',
        specificityTag: 'Interval-based',
        specificityRank: 2,
        isConditional: true,
    });
    push(shouldTriggerMileageInterval(odometerKm, 40000), {
        id: 'mileage-40000-core',
        title: '40,000 km transmission, coolant, fuel, and ignition inspection package',
        reason: 'Checks critical fluid systems and combustion support components.',
        intervalTag: 'Every 40,000 km',
        category: 'Periodic Maintenance',
        source: 'Mileage',
        serviceKey: 'pms-40000',
        specificityTag: 'Interval-based',
        specificityRank: 2,
    });
    push(odometerKm >= 50000 - MILEAGE_SUGGESTION_TOLERANCE_KM && odometerKm <= 60000 + MILEAGE_SUGGESTION_TOLERANCE_KM, {
        id: 'mileage-50000-60000-major-checks',
        title: '50,000–60,000 km full suspension and brake system check',
        reason: 'Mid-life range where full chassis and braking system review is recommended.',
        category: 'Suspension',
        source: 'Mileage',
        serviceKey: 'suspension-review',
        specificityTag: 'Interval-based',
        specificityRank: 2,
        intervalTag: '50,000–60,000 km',
    });
    push(odometerKm >= 80000 - MILEAGE_SUGGESTION_TOLERANCE_KM, {
        id: 'mileage-80000-plus-major-review',
        title: 'Major service review with timing belt/chain inspection',
        reason: 'High-mileage vehicles need a broader preventive maintenance review.',
        category: 'Periodic Maintenance',
        source: 'Mileage',
        serviceKey: 'major-service-review',
        specificityTag: 'Interval-based',
        specificityRank: 2,
        intervalTag: '80,000 km+',
    });
    return suggestions;
}
function getMaintenanceSuggestionWorkLine(suggestion) {
    return recalculateWorkLine({
        ...getEmptyWorkLine(),
        title: suggestion.title,
        category: suggestion.category || 'Periodic Maintenance',
        notes: suggestion.reason,
        customerDescription: `${suggestion.intervalTag}: ${suggestion.reason}`,
        recommendationSource: suggestion.source === "Library" ? 'RecommendationLibrary' : 'MileageSuggestion',
    });
}
function getOilChangePolicy(oilType) {
    return oilType === "Fully Synthetic"
        ? { months: 12, kilometers: 10000 }
        : { months: 6, kilometers: 5000 };
}
function isOilChangeServiceLine(line) {
    const text = [line.title, line.customerDescription, line.category, line.notes, line.recommendationSource]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");
    return (text.includes("oil change") ||
        text.includes("oil service") ||
        text.includes("engine oil") ||
        text.includes("oil and filter") ||
        text.includes("oil only"));
}
function inferOilChangeTypeFromText(...texts) {
    const combined = texts.map((value) => String(value ?? "").toLowerCase()).join(" ");
    if (combined.includes("fully synthetic") || combined.includes("full synthetic") || combined.includes("synthetic")) {
        return "Fully Synthetic";
    }
    return "Conventional";
}
function buildOilChangeReminderMessage(reminder) {
    return [
        `Hi ${reminder.customerName},`,
        "",
        `Your vehicle ${reminder.vehicleLabel} (${reminder.plateNumber || reminder.conductionNumber || "-"}) has an oil change reminder.`,
        "",
        `Last service: ${formatDateTime(reminder.serviceDate)} | Odometer: ${reminder.serviceOdometerKm || "-"}`,
        `Current odometer: ${reminder.currentOdometerKm || "-"}`,
        `Reminder rule: ${reminder.oilType === "Fully Synthetic" ? "12 months or 10,000 km" : "6 months or 5,000 km"}`,
        `Due status: ${reminder.dueReason}`,
        "",
        `Book your next visit here: ${buildCustomerBookingUrl()}`,
        "DVI Workshop | Please contact your service advisor for assistance.",
    ].join("\n");
}
function buildReleaseFollowUpMessage(reminder) {
    return [
        `Hi ${reminder.customerName},`,
        "",
        `We hope your vehicle ${reminder.vehicleLabel} (${reminder.plateNumber || reminder.conductionNumber || "-"}) is doing well after your recent release.`,
        "",
        `This is a follow-up for RO ${reminder.roNumber}${reminder.releaseNumber ? ` / Release ${reminder.releaseNumber}` : ""}.`,
        `Released on: ${formatDateTime(reminder.releaseDate)}`,
        "",
        "How has your experience been since the service? Please let us know if everything is working as expected or if there is anything we can help with.",
        "",
        "DVI Workshop | Please contact your service advisor if you need assistance.",
    ].join("\n");
}
function todayStamp(date = new Date()) {
    const yyyy = date.getFullYear().toString();
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const dd = `${date.getDate()}`.padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}
const MOBILE_EVIDENCE_MAX_WIDTH = 1280;
const MOBILE_EVIDENCE_VIDEO_MAX_MB = 15;
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => reject(new Error("Unable to read file."));
        reader.readAsDataURL(file);
    });
}
function loadImage(source) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Unable to load image."));
        img.src = source;
    });
}
async function optimizeImageForMobile(file) {
    const dataUrl = await fileToDataUrl(file);
    const image = await loadImage(dataUrl);
    const scale = Math.min(1, MOBILE_EVIDENCE_MAX_WIDTH / Math.max(image.width, 1));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return dataUrl;
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.78);
}
async function buildPartsMediaRecords(files, owner, kind, uploadedBy, note = "") {
    if (!files || files.length === 0)
        return [];
    const items = [];
    for (const file of Array.from(files)) {
        const previewDataUrl = await optimizeImageForMobile(file);
        items.push({
            id: uid("pmedia"),
            owner,
            kind,
            fileName: file.name,
            previewDataUrl,
            addedAt: new Date().toISOString(),
            note,
            uploadedBy,
        });
    }
    return items;
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
function normalizeVehicleKey(plateNumber, conductionNumber) {
    const normalizedPlate = (plateNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const normalizedConduction = (conductionNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return normalizedPlate || normalizedConduction || "";
}
function hasNonEmptyValues(value) {
    if (value == null)
        return false;
    if (typeof value === "string")
        return value.trim().length > 0;
    if (typeof value === "number" || typeof value === "boolean")
        return true;
    if (Array.isArray(value))
        return value.some((item) => hasNonEmptyValues(item));
    if (typeof value === "object")
        return Object.values(value).some((item) => hasNonEmptyValues(item));
    return false;
}
function useDraftAutosave(key, value, enabled = true) {
    const [draftState, setDraftState] = useState("Saved");
    useEffect(() => {
        if (!enabled)
            return;
        setDraftState("Saving...");
        const timeout = window.setTimeout(() => {
            writeLocalStorage(key, value);
            setDraftState("Saved");
        }, 400);
        return () => window.clearTimeout(timeout);
    }, [key, value, enabled]);
    const clearDraft = () => {
        localStorage.removeItem(key);
        setDraftState("Saved");
    };
    const markUnsaved = () => setDraftState("Unsaved changes");
    return { draftState, clearDraft, markUnsaved };
}
function buildVehicleHistoryGroups({ intakeRecords, inspectionRecords, repairOrders, qcRecords, releaseRecords, approvalRecords, backjobRecords, invoiceRecords, paymentRecords, }) {
    const groups = new Map();
    const ensureGroup = (input) => {
        const vehicleKey = normalizeVehicleKey(input.plateNumber ?? "", input.conductionNumber ?? "");
        if (!vehicleKey)
            return null;
        const existing = groups.get(vehicleKey);
        if (existing) {
            if (!existing.plateNumber && input.plateNumber)
                existing.plateNumber = input.plateNumber;
            if (!existing.conductionNumber && input.conductionNumber)
                existing.conductionNumber = input.conductionNumber;
            if ((!existing.vehicleLabel || existing.vehicleLabel === "Unknown Vehicle") && input.vehicleLabel) {
                existing.vehicleLabel = input.vehicleLabel;
            }
            return existing;
        }
        const created = {
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
    const pushRow = (group, row) => {
        if (!group)
            return;
        group.rows.push({
            id: `${row.type}-${row.number}-${row.date}`,
            vehicleKey: group.vehicleKey,
            plateNumber: group.plateNumber,
            conductionNumber: group.conductionNumber,
            vehicleLabel: group.vehicleLabel,
            ...row,
        });
        group.totalVisits = group.rows.length;
        if (!group.lastVisitAt || row.date > group.lastVisitAt)
            group.lastVisitAt = row.date;
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
        if (group && !["Released", "Closed"].includes(row.status))
            group.activeJobCount += 1;
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
function sanitizePhone(value) {
    return value.replace(/\D/g, "");
}
function getDefaultCustomerPassword(phone) {
    const digits = sanitizePhone(phone);
    return digits.length >= 4 ? digits.slice(-4) : "1234";
}
function getCustomerIdentityKey(input) {
    const phone = sanitizePhone(input.phone ?? "");
    if (phone)
        return `phone:${phone}`;
    const email = (input.email ?? "").trim().toLowerCase();
    if (email)
        return `email:${email}`;
    const fallback = (input.companyName || input.customerName || "").trim().toLowerCase();
    return fallback ? `label:${fallback}` : "";
}
function mergeUniqueStrings(values) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
function buildCustomerAccountsFromRecords(existingAccounts, intakeRecords, repairOrders) {
    const identityMap = new Map();
    existingAccounts.forEach((account) => {
        const identityKey = getCustomerIdentityKey(account);
        if (!identityKey)
            return;
        identityMap.set(identityKey, {
            ...account,
            phone: sanitizePhone(account.phone),
            email: (account.email || "").trim().toLowerCase(),
            linkedPlateNumbers: mergeUniqueStrings(account.linkedPlateNumbers || []),
            linkedRoIds: mergeUniqueStrings(account.linkedRoIds || []),
        });
    });
    const upsert = (entry) => {
        const identityKey = getCustomerIdentityKey(entry);
        if (!identityKey)
            return;
        const now = new Date().toISOString();
        const existing = identityMap.get(identityKey);
        const phone = sanitizePhone(entry.phone ?? existing?.phone ?? "");
        const email = (entry.email ?? existing?.email ?? "").trim().toLowerCase();
        const fullName = (entry.customerName || entry.companyName || existing?.fullName || "").trim() || "Customer";
        identityMap.set(identityKey, {
            id: existing?.id ?? uid("cust"),
            fullName,
            phone,
            email,
            password: existing?.password || getDefaultCustomerPassword(phone),
            linkedPlateNumbers: mergeUniqueStrings([...(existing?.linkedPlateNumbers ?? []), entry.plateNumber ?? ""]),
            linkedRoIds: mergeUniqueStrings([...(existing?.linkedRoIds ?? []), entry.roId ?? ""]),
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        });
    };
    intakeRecords.forEach((record) => upsert({
        phone: record.phone,
        email: record.email,
        customerName: record.customerName,
        companyName: record.companyName,
        plateNumber: record.plateNumber || record.conductionNumber,
    }));
    repairOrders.forEach((record) => upsert({
        phone: record.phone,
        email: record.email,
        customerName: record.customerName,
        companyName: record.companyName,
        plateNumber: record.plateNumber || record.conductionNumber,
        roId: record.id,
    }));
    return Array.from(identityMap.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
function nextDailyNumber(prefix) {
    const stamp = todayStamp();
    const counters = readLocalStorage(STORAGE_KEYS.counters, {});
    const key = `${prefix}_${stamp}`;
    const next = (counters[key] ?? 0) + 1;
    counters[key] = next;
    writeLocalStorage(STORAGE_KEYS.counters, counters);
    return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}
function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "-";
    return date.toLocaleString();
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
function printCustomerSummary(ro) {
    if (typeof window === "undefined")
        return;
    const popup = window.open("", "_blank", "width=860,height=700");
    if (!popup)
        return;
    const approvedLines = ro.workLines.filter((l) => l.approvalDecision === "Approved");
    const deferredLines = ro.workLines.filter((l) => l.approvalDecision === "Deferred");
    const declinedLines = ro.workLines.filter((l) => l.approvalDecision === "Declined");
    const approvedTotal = approvedLines.reduce((s, l) => s + parseMoneyInput(l.totalEstimate), 0);
    const deferredTotal = deferredLines.reduce((s, l) => s + parseMoneyInput(l.totalEstimate), 0);
    const declinedTotal = declinedLines.reduce((s, l) => s + parseMoneyInput(l.totalEstimate), 0);
    const esc = (v) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const lineRows = (lines) => lines.length === 0
        ? `<tr><td colspan="3" style="color:#64748b;padding:8px 0;">None</td></tr>`
        : lines.map((l) => `
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">${esc(l.title || "Untitled")}</td>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(l.category || "-")}</td>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${formatCurrency(parseMoneyInput(l.totalEstimate))}</td>
          </tr>
          ${l.customerDescription ? `<tr><td colspan="3" style="padding:0 0 6px;font-size:12px;color:#64748b;border-bottom:1px solid #e2e8f0;">${esc(l.customerDescription)}</td></tr>` : ""}
        `).join("");
    const table = (title, color, lines, total) => `
    <h3 style="margin:20px 0 6px;color:${color};font-size:14px;">${esc(title)}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="text-align:left;padding:6px 0;border-bottom:2px solid #e2e8f0;font-size:12px;color:#64748b;">Work Item</th>
          <th style="text-align:left;padding:6px 0;border-bottom:2px solid #e2e8f0;font-size:12px;color:#64748b;">Category</th>
          <th style="text-align:right;padding:6px 0;border-bottom:2px solid #e2e8f0;font-size:12px;color:#64748b;">Estimate</th>
        </tr>
      </thead>
      <tbody>${lineRows(lines)}</tbody>
      ${lines.length > 0 ? `<tfoot><tr><td colspan="2" style="padding:6px 0;font-weight:600;">Subtotal</td><td style="text-align:right;padding:6px 0;font-weight:600;">${formatCurrency(total)}</td></tr></tfoot>` : ""}
    </table>`;
    const html = `
    <html>
      <head>
        <title>Customer Summary  -  ${esc(ro.roNumber)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; max-width: 760px; margin: 0 auto; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          h2 { font-size: 15px; font-weight: 600; margin: 20px 0 6px; border-bottom: 2px solid #0f172a; padding-bottom: 4px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 13px; margin-bottom: 8px; }
          .meta span { color: #64748b; }
          .totals { margin-top: 20px; border-top: 2px solid #0f172a; padding-top: 12px; font-size: 14px; }
          .totals table { width: 100%; border-collapse: collapse; }
          .totals td { padding: 4px 0; }
          .totals .grand { font-size: 16px; font-weight: 700; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px; }
          .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <h1>Customer Work Summary</h1>
        <div style="font-size:13px;color:#64748b;margin-bottom:16px;">Repair Order ${esc(ro.roNumber)} &bull; ${esc(ro.status)}</div>

        <h2>Customer &amp; Vehicle</h2>
        <div class="meta">
          <div><span>Name / Account</span><br/><strong>${esc(ro.accountLabel)}</strong></div>
          <div><span>Phone</span><br/><strong>${esc(ro.phone || "-")}</strong></div>
          <div><span>Plate / Conduction</span><br/><strong>${esc(ro.plateNumber || ro.conductionNumber || "-")}</strong></div>
          <div><span>Vehicle</span><br/><strong>${esc([ro.make, ro.model, ro.year, ro.color].filter(Boolean).join(" ") || "-")}</strong></div>
          <div><span>Odometer</span><br/><strong>${esc(ro.odometerKm ? ro.odometerKm + " km" : "-")}</strong></div>
          <div><span>Service Advisor</span><br/><strong>${esc(ro.advisorName || "-")}</strong></div>
        </div>
        <div style="background:#f1f5f9;border-radius:4px;padding:10px 12px;font-size:13px;margin-top:6px;">
          <strong>Customer Concern:</strong> ${esc(ro.customerConcern || "-")}
        </div>

        ${table("Approved Work", "#15803d", approvedLines, approvedTotal)}
        ${deferredLines.length > 0 ? table("Deferred  -  Decide Later", "#b45309", deferredLines, deferredTotal) : ""}
        ${declinedLines.length > 0 ? table("Declined  -  Not Proceeding", "#b91c1c", declinedLines, declinedTotal) : ""}

        <div class="totals">
          <table>
            <tr><td>Approved Work Total</td><td style="text-align:right;font-weight:600;">${formatCurrency(approvedTotal)}</td></tr>
            ${deferredLines.length > 0 ? `<tr><td style="color:#b45309;">Deferred (excluded)</td><td style="text-align:right;color:#b45309;">${formatCurrency(deferredTotal)}</td></tr>` : ""}
            ${declinedLines.length > 0 ? `<tr><td style="color:#b91c1c;">Declined (excluded)</td><td style="text-align:right;color:#b91c1c;">${formatCurrency(declinedTotal)}</td></tr>` : ""}
          </table>
          <div class="grand" style="display:flex;justify-content:space-between;">
            <span>Estimated Amount Due</span>
            <span>${formatCurrency(approvedTotal)}</span>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-top:4px;">This is an estimate only. Final amount may vary after inspection and parts sourcing.</div>
        </div>

        <div class="footer">Generated ${new Date().toLocaleString()} &bull; ${esc(ro.roNumber)}</div>
      </body>
    </html>`;
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
}
function buildRepairOrderExportText(ro, users) {
    const primary = users.find((user) => user.id === ro.primaryTechnicianId)?.fullName || "Unassigned";
    const support = ro.supportTechnicianIds.map((id) => users.find((user) => user.id === id)?.fullName || id).join(", ") || "None";
    const workLines = ro.workLines.map((line, index) => `${index + 1}. ${line.title || "Untitled"} | ${line.category} | ${line.status} | ${line.approvalDecision ?? "Pending"} | ${formatCurrency(parseMoneyInput(line.totalEstimate))}`).join("\n");
    return [
        `Repair Order: ${ro.roNumber}`,
        `Status: ${ro.status}`,
        `Customer: ${ro.accountLabel}`,
        `Plate: ${ro.plateNumber || ro.conductionNumber || "-"}`,
        `Vehicle: ${[ro.make, ro.model, ro.year, ro.color].filter(Boolean).join(" ") || "-"}`,
        `Concern: ${ro.customerConcern || "-"}`,
        `Advisor: ${ro.advisorName || "-"}`,
        `Primary Technician: ${primary}`,
        `Support Technicians: ${support}`,
        `Created: ${formatDateTime(ro.createdAt)}`,
        `Updated: ${formatDateTime(ro.updatedAt)}`,
        "",
        "Work Lines:",
        workLines || "No work lines yet.",
    ].join("\n");
}
function buildQcExportText(ro, qc) {
    return [
        `QC Record for ${ro.roNumber}`,
        `RO Status: ${ro.status}`,
        `Customer: ${ro.accountLabel}`,
        `Plate: ${ro.plateNumber || ro.conductionNumber || "-"}`,
        `Vehicle: ${[ro.make, ro.model, ro.year].filter(Boolean).join(" ") || "-"}`,
        "",
        qc
            ? `Latest QC: ${qc.qcNumber} | ${qc.result} | ${formatDateTime(qc.createdAt)} | By: ${qc.qcBy}`
            : "Latest QC: No QC record yet",
        qc ? `Notes: ${qc.notes || "-"}` : "",
        "",
        "Approved Work Lines:",
        ro.workLines
            .filter((line) => line.approvalDecision === "Approved")
            .map((line, index) => `${index + 1}. ${line.title} | ${line.status} | ${formatCurrency(parseMoneyInput(line.totalEstimate))}`)
            .join("\n") || "No approved work lines.",
    ].join("\n");
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
function getResponsiveSpan(span, isCompactLayout) {
    return isCompactLayout ? "span 12" : `span ${span}`;
}
function getDefaultRoleDefinitions() {
    return [
        { role: "Admin", permissions: [...ALL_PERMISSIONS] },
        {
            role: "Service Advisor",
            permissions: [
                "dashboard.view",
                "bookings.view",
                "intake.view",
                "inspection.view",
                "repairOrders.view",
                "shopFloor.view",
                "release.view",
                "parts.view",
                "backjobs.view",
                "history.view",
            ],
        },
        {
            role: "Chief Technician",
            permissions: [
                "dashboard.view",
                "inspection.view",
                "repairOrders.view",
                "shopFloor.view",
                "qualityControl.view",
                "backjobs.view",
                "history.view",
            ],
        },
        {
            role: "Senior Mechanic",
            permissions: [
                "dashboard.view",
                "inspection.view",
                "shopFloor.view",
                "qualityControl.view",
            ],
        },
        {
            role: "General Mechanic",
            permissions: ["dashboard.view", "inspection.view", "shopFloor.view"],
        },
        {
            role: "Office Staff",
            permissions: [
                "dashboard.view",
                "bookings.view",
                "intake.view",
                "repairOrders.view",
                "release.view",
                "parts.view",
                "backjobs.view",
                "history.view",
            ],
        },
        {
            role: "Reception",
            permissions: ["dashboard.view", "bookings.view", "intake.view", "release.view", "history.view"],
        },
        {
            role: "OJT",
            permissions: ["dashboard.view", "inspection.view", "shopFloor.view"],
        },
    ];
}
function getDefaultUsers() {
    const now = new Date().toISOString();
    return [
        {
            id: uid("usr"),
            username: "admin",
            password: "admin123",
            fullName: "System Admin",
            role: "Admin",
            active: true,
            createdAt: now,
        },
        {
            id: uid("usr"),
            username: "advisor",
            password: "advisor123",
            fullName: "Service Advisor",
            role: "Service Advisor",
            active: true,
            createdAt: now,
        },
        {
            id: uid("usr"),
            username: "chieftech",
            password: "chief123",
            fullName: "Chief Technician",
            role: "Chief Technician",
            active: true,
            createdAt: now,
        },
        {
            id: uid("usr"),
            username: "senior",
            password: "senior123",
            fullName: "Senior Mechanic",
            role: "Senior Mechanic",
            active: true,
            createdAt: now,
        },
        {
            id: uid("usr"),
            username: "mechanic",
            password: "mechanic123",
            fullName: "General Mechanic",
            role: "General Mechanic",
            active: true,
            createdAt: now,
        },
        {
            id: uid("usr"),
            username: "office",
            password: "office123",
            fullName: "Office Staff",
            role: "Office Staff",
            active: true,
            createdAt: now,
        },
        {
            id: uid("usr"),
            username: "reception",
            password: "reception123",
            fullName: "Reception Staff",
            role: "Reception",
            active: true,
            createdAt: now,
        },
        {
            id: uid("usr"),
            username: "ojt",
            password: "ojt123",
            fullName: "OJT Trainee",
            role: "OJT",
            active: true,
            createdAt: now,
        },
    ];
}
function getDefaultBookingForm(currentUserName) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return {
        requestedDate: `${yyyy}-${mm}-${dd}`,
        requestedTime: "09:00",
        customerName: "",
        companyName: "",
        accountType: "Personal",
        phone: "",
        email: "",
        plateNumber: "",
        conductionNumber: "",
        make: "",
        model: "",
        year: "",
        serviceType: "Preventive Maintenance",
        serviceDetail: "5,000 km maintenance",
        concern: "",
        notes: "",
        status: "New",
    };
}
function getDefaultIntakeForm(currentUserName) {
    return {
        customerName: "",
        companyName: "",
        accountType: "Personal",
        phone: "",
        email: "",
        plateNumber: "",
        conductionNumber: "",
        make: "",
        model: "",
        year: "",
        color: "",
        odometerKm: "",
        fuelLevel: "",
        assignedAdvisor: currentUserName,
        concern: "",
        notes: "",
        status: "Waiting Inspection",
    };
}
function getDefaultInspectionForm() {
    return {
        status: "In Progress",
        underHoodState: "Good",
        engineOilLevel: "Not Checked",
        engineOilCondition: "Not Checked",
        engineOilLeaks: "Not Checked",
        coolantLevel: "Not Checked",
        coolantCondition: "Not Checked",
        radiatorHoseCondition: "Not Checked",
        coolingLeaks: "Not Checked",
        brakeFluidLevel: "Not Checked",
        brakeFluidCondition: "Not Checked",
        powerSteeringLevel: "Not Checked",
        powerSteeringCondition: "Not Checked",
        batteryCondition: "Not Checked",
        batteryTerminalCondition: "Not Checked",
        batteryHoldDownCondition: "Not Checked",
        driveBeltCondition: "Not Checked",
        airFilterCondition: "Not Checked",
        intakeHoseCondition: "Not Checked",
        engineMountCondition: "Not Checked",
        wiringCondition: "Not Checked",
        unusualSmellState: "Not Checked",
        unusualSoundState: "Not Checked",
        visibleEngineLeakState: "Not Checked",
        engineOilNotes: "",
        coolantNotes: "",
        brakeFluidNotes: "",
        powerSteeringNotes: "",
        batteryNotes: "",
        beltNotes: "",
        intakeNotes: "",
        leakNotes: "",
        underHoodSummary: "",
        recommendedWork: "",
        recommendationLines: [],
        inspectionPhotoNotes: "",
        arrivalFrontPhotoNote: "",
        arrivalDriverSidePhotoNote: "",
        arrivalRearPhotoNote: "",
        arrivalPassengerSidePhotoNote: "",
        additionalFindingPhotoNotes: [],
        enableSafetyChecks: true,
        enableTires: true,
        enableUnderHood: true,
        enableBrakes: false,
        enableSuspensionCheck: false,
        enableAlignmentCheck: false,
        enableAcCheck: false,
        enableCoolingCheck: false,
        coolingFanOperationState: "Not Checked",
        radiatorConditionState: "Not Checked",
        waterPumpConditionState: "Not Checked",
        thermostatConditionState: "Not Checked",
        overflowReservoirConditionState: "Not Checked",
        coolingSystemPressureState: "Not Checked",
        coolingSystemNotes: "",
        coolingAdditionalFindings: [],
        enableSteeringCheck: false,
        steeringWheelPlayState: "Not Checked",
        steeringPumpMotorState: "Not Checked",
        steeringFluidConditionState: "Not Checked",
        steeringHoseConditionState: "Not Checked",
        steeringColumnConditionState: "Not Checked",
        steeringRoadFeelState: "Not Checked",
        steeringSystemNotes: "",
        steeringAdditionalFindings: [],
        enableEnginePerformanceCheck: false,
        engineStartingState: "Not Checked",
        idleQualityState: "Not Checked",
        accelerationResponseState: "Not Checked",
        engineMisfireState: "Not Checked",
        engineSmokeState: "Not Checked",
        fuelEfficiencyConcernState: "Not Checked",
        enginePerformanceNotes: "",
        enginePerformanceAdditionalFindings: [],
        enableRoadTestCheck: false,
        roadTestNoiseState: "Not Checked",
        roadTestBrakeFeelState: "Not Checked",
        roadTestSteeringTrackingState: "Not Checked",
        roadTestRideQualityState: "Not Checked",
        roadTestAccelerationState: "Not Checked",
        roadTestTransmissionShiftState: "Not Checked",
        roadTestNotes: "",
        roadTestAdditionalFindings: [],
        acVentTemperature: "",
        acCoolingPerformanceState: "Not Checked",
        acCompressorState: "Not Checked",
        acCondenserFanState: "Not Checked",
        acCabinFilterState: "Not Checked",
        acAirflowState: "Not Checked",
        acOdorState: "Not Checked",
        acNotes: "",
        enableElectricalCheck: false,
        electricalBatteryVoltage: "",
        electricalChargingVoltage: "",
        electricalStarterState: "Not Checked",
        electricalAlternatorState: "Not Checked",
        electricalFuseRelayState: "Not Checked",
        electricalWiringState: "Not Checked",
        electricalWarningLightState: "Not Checked",
        electricalNotes: "",
        enableTransmissionCheck: false,
        enableScanCheck: false,
        scanPerformed: false,
        scanToolUsed: "",
        scanNotes: "",
        scanUploadNames: [],
        transmissionFluidState: "Not Checked",
        transmissionFluidConditionState: "Not Checked",
        transmissionLeakState: "Not Checked",
        shiftingPerformanceState: "Not Checked",
        clutchOperationState: "Not Checked",
        drivetrainVibrationState: "Not Checked",
        cvJointDriveAxleState: "Not Checked",
        transmissionMountState: "Not Checked",
        transmissionNotes: "",
        alignmentConcernNotes: "",
        alignmentRecommended: false,
        alignmentBeforePrintoutName: "",
        alignmentAfterPrintoutName: "",
        arrivalLights: "Not Checked",
        arrivalBrokenGlass: "Not Checked",
        arrivalWipers: "Not Checked",
        arrivalHorn: "Not Checked",
        arrivalCheckEngineLight: "Not Checked",
        arrivalAbsLight: "Not Checked",
        arrivalAirbagLight: "Not Checked",
        arrivalBatteryLight: "Not Checked",
        arrivalOilPressureLight: "Not Checked",
        arrivalTempLight: "Not Checked",
        arrivalTransmissionLight: "Not Checked",
        arrivalOtherWarningLight: "Not Checked",
        arrivalOtherWarningNote: "",
        frontLeftTreadMm: "",
        frontRightTreadMm: "",
        rearLeftTreadMm: "",
        rearRightTreadMm: "",
        frontLeftWearPattern: "Even Wear",
        frontRightWearPattern: "Even Wear",
        rearLeftWearPattern: "Even Wear",
        rearRightWearPattern: "Even Wear",
        frontLeftTireState: "Not Checked",
        frontRightTireState: "Not Checked",
        rearLeftTireState: "Not Checked",
        rearRightTireState: "Not Checked",
        frontBrakeCondition: "",
        rearBrakeCondition: "",
        frontBrakeState: "Not Checked",
        rearBrakeState: "Not Checked",
        frontShockState: "Not Checked",
        frontBallJointState: "Not Checked",
        frontTieRodEndState: "Not Checked",
        frontRackEndState: "Not Checked",
        frontStabilizerLinkState: "Not Checked",
        frontControlArmBushingState: "Not Checked",
        frontUpperControlArmState: "Not Checked",
        frontLowerControlArmState: "Not Checked",
        frontStrutMountState: "Not Checked",
        steeringRackConditionState: "Not Checked",
        frontCvBootState: "Not Checked",
        frontWheelBearingState: "Not Checked",
        rearSuspensionType: "Coil Spring",
        rearShockState: "Not Checked",
        rearStabilizerLinkState: "Not Checked",
        rearBushingState: "Not Checked",
        rearSpringState: "Not Checked",
        rearControlArmState: "Not Checked",
        rearCoilSpringState: "Not Checked",
        rearLeafSpringState: "Not Checked",
        rearLeafSpringBushingState: "Not Checked",
        rearUBoltMountState: "Not Checked",
        rearAxleMountState: "Not Checked",
        rearWheelBearingState: "Not Checked",
        frontSuspensionNotes: "",
        rearSuspensionNotes: "",
        steeringFeelNotes: "",
        suspensionRoadTestNotes: "",
        inspectionNotes: "",
        evidenceItems: [],
    };
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
function formatElapsedTime(startValue) {
    if (!startValue)
        return "Not started";
    const start = new Date(startValue);
    if (Number.isNaN(start.getTime()))
        return "Not started";
    const diffMs = Math.max(0, Date.now() - start.getTime());
    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0)
        return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0)
        return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
function formatMinutesAsHours(minutes) {
    if (!minutes || minutes <= 0)
        return "0.0h";
    return `${(minutes / 60).toFixed(1)}h`;
}
function getWorkLogMinutes(log) {
    if (log.endedAt)
        return Math.max(0, log.totalMinutes || 0);
    const started = new Date(log.startedAt).getTime();
    if (Number.isNaN(started))
        return Math.max(0, log.totalMinutes || 0);
    return Math.max(0, Math.floor((Date.now() - started) / 60000));
}
function toApprovalDecision(value) {
    if (value === "Approved" || value === "Declined" || value === "Deferred")
        return value;
    return "Pending";
}
function getEmptyAdditionalFinding() {
    return {
        id: uid("af"),
        title: "",
        note: "",
        status: "Monitor",
        photoNotes: [],
    };
}
function normalizeAdditionalFindings(value) {
    if (!Array.isArray(value))
        return [];
    return value.map((item, index) => {
        const row = item;
        return {
            id: row?.id || uid(`af_${index}`),
            title: row?.title ?? "",
            note: row?.note ?? "",
            status: row?.status === "OK" || row?.status === "Monitor" || row?.status === "Replace" ? row.status : "Monitor",
            photoNotes: Array.isArray(row?.photoNotes) ? row.photoNotes.map((note) => String(note ?? "")) : [],
        };
    });
}
function buildFindingRecommendations(findings, categoryLabel) {
    const recommendations = [];
    findings.forEach((finding) => {
        const title = finding.title.trim();
        if (!title)
            return;
        if (finding.status === "OK")
            return;
        const prefix = finding.status === "Replace" ? "Replace" : "Inspect / Monitor";
        recommendations.push(`${prefix}: ${categoryLabel} - ${title}`);
    });
    return recommendations;
}
function getEmptyWorkLine() {
    return {
        id: uid("wl"),
        title: "",
        category: "General",
        priority: "Medium",
        status: "Pending",
        serviceEstimate: "",
        partsEstimate: "",
        totalEstimate: "0.00",
        notes: "",
        customerDescription: "",
        laborHours: "",
        laborRate: "",
        partsCost: "",
        partsMarkupPercent: "",
        estimateUploadName: "",
        recommendationSource: "",
        approvalDecision: "Pending",
        approvalAt: "",
    };
}
function recalculateWorkLine(line) {
    const pricing = getWorkLinePricing(line);
    const nextServiceEstimate = pricing.laborAmount > 0 ? pricing.laborAmount.toFixed(2) : line.serviceEstimate;
    const nextPartsEstimate = pricing.partsAmount > 0 ? pricing.partsAmount.toFixed(2) : line.partsEstimate;
    return {
        ...line,
        serviceEstimate: nextServiceEstimate,
        partsEstimate: nextPartsEstimate,
        customerDescription: line.customerDescription?.trim() ? line.customerDescription : buildDefaultCustomerDescription(line),
        totalEstimate: pricing.totalAmount.toFixed(2),
    };
}
function getDefaultRepairOrderForm(currentUserName) {
    return {
        customerName: "",
        companyName: "",
        accountType: "Personal",
        phone: "",
        email: "",
        plateNumber: "",
        conductionNumber: "",
        make: "",
        model: "",
        year: "",
        color: "",
        odometerKm: "",
        customerConcern: "",
        advisorName: currentUserName,
        status: "Draft",
        primaryTechnicianId: "",
        supportTechnicianIds: [],
        workLines: [getEmptyWorkLine()],
    };
}
function getBookingStatusStyle(status) {
    if (status === "Converted to Intake")
        return styles.statusOk;
    if (status === "Cancelled" || status === "No Show")
        return styles.statusLocked;
    if (status === "Arrived" || status === "Confirmed" || status === "Rescheduled")
        return styles.statusWarning;
    return styles.statusInfo;
}
function getPartsRequestStatusStyle(status) {
    if (["Closed", "Parts Arrived", "Arrived", "Return Approved"].includes(status))
        return styles.statusOk;
    if (["Cancelled", "Return Rejected"].includes(status))
        return styles.statusLocked;
    if (["Ordered", "In Transit", "Shipped", "Waiting for Bids", "Sent to Suppliers", "Bidding", "Supplier Selected", "Return Requested"].includes(status))
        return styles.statusWarning;
    return styles.statusInfo;
}
function getApprovalDecisionStyle(decision) {
    if (decision === "Approved")
        return styles.statusOk;
    if (decision === "Declined")
        return styles.statusLocked;
    if (decision === "Deferred")
        return styles.statusWarning;
    return styles.statusNeutral;
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
function getVehicleAccountLabel(record) {
    return record.companyName || record.customerName || "Unknown Customer";
}
function normalizeLegacyPartsStatus(status) {
    if (status === "Bidding")
        return "Waiting for Bids";
    if (status === "Arrived")
        return "Parts Arrived";
    if (status === "Shipped")
        return "In Transit";
    return status;
}
function parseRecommendationLines(input) {
    return input
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}
function buildFindingToRORecommendations(record) {
    const categories = [
        { key: "coolingAdditionalFindings", label: "Cooling System", items: record.coolingAdditionalFindings ?? [] },
        { key: "steeringAdditionalFindings", label: "Steering", items: record.steeringAdditionalFindings ?? [] },
        { key: "enginePerformanceAdditionalFindings", label: "Engine Performance", items: record.enginePerformanceAdditionalFindings ?? [] },
        { key: "roadTestAdditionalFindings", label: "Road Test", items: record.roadTestAdditionalFindings ?? [] },
    ];
    return categories.flatMap(({ label, items }) => items
        .filter((finding) => finding.status !== "OK" && (!!finding.title.trim() || !!finding.note.trim()))
        .map((finding) => ({
        id: finding.id,
        category: label,
        title: finding.title.trim() || `${label} Finding`,
        note: finding.note.trim(),
        status: finding.status,
        photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean),
        workLineTitle: finding.title.trim() || `${label} Finding`,
    })));
}
function getCustomerInspectionStatus(value) {
    const normalized = String(value ?? "").trim();
    if (normalized === "Good" || normalized === "OK")
        return "Good";
    if (normalized === "Monitor" || normalized === "Needs Attention")
        return "Needs Attention";
    if (normalized === "Replace" || normalized === "Needs Replacement")
        return "Critical";
    return null;
}
function getCustomerInspectionStatusStyle(status) {
    if (status === "Good")
        return styles.statusOk;
    if (status === "Needs Attention")
        return styles.statusWarning;
    return styles.statusLocked;
}
function joinInspectionNotes(...notes) {
    return notes
        .map((note) => String(note ?? "").trim())
        .filter(Boolean)
        .join("  |  ");
}
function buildCustomerInspectionSections(record) {
    const sections = [];
    const coolingAdditionalFindings = Array.isArray(record.coolingAdditionalFindings) ? record.coolingAdditionalFindings : [];
    const steeringAdditionalFindings = Array.isArray(record.steeringAdditionalFindings) ? record.steeringAdditionalFindings : [];
    const enginePerformanceAdditionalFindings = Array.isArray(record.enginePerformanceAdditionalFindings) ? record.enginePerformanceAdditionalFindings : [];
    const roadTestAdditionalFindings = Array.isArray(record.roadTestAdditionalFindings) ? record.roadTestAdditionalFindings : [];
    const scanUploadNames = Array.isArray(record.scanUploadNames) ? record.scanUploadNames : [];
    const electricalBatteryVoltage = String(record.electricalBatteryVoltage ?? "");
    const electricalChargingVoltage = String(record.electricalChargingVoltage ?? "");
    const scanNotes = String(record.scanNotes ?? "");
    const scanToolUsed = String(record.scanToolUsed ?? "");
    const alignmentConcernNotes = String(record.alignmentConcernNotes ?? "");
    const alignmentBeforePrintoutName = String(record.alignmentBeforePrintoutName ?? "");
    const alignmentAfterPrintoutName = String(record.alignmentAfterPrintoutName ?? "");
    const inspectionNotes = String(record.inspectionNotes ?? "");
    const pushSection = (label, findings, note) => {
        const safeNote = String(note ?? "").trim();
        if (!findings.length && !safeNote)
            return;
        sections.push({ label, note: safeNote, findings });
    };
    const pushFinding = (findings, title, value, note) => {
        const status = getCustomerInspectionStatus(value);
        if (!status)
            return;
        findings.push({ title, status, note: String(note ?? "").trim() });
    };
    const arrivalFindings = [];
    pushFinding(arrivalFindings, "Exterior lights", record.arrivalLights);
    pushFinding(arrivalFindings, "Broken glass", record.arrivalBrokenGlass);
    pushFinding(arrivalFindings, "Wipers", record.arrivalWipers);
    pushFinding(arrivalFindings, "Horn", record.arrivalHorn);
    pushFinding(arrivalFindings, "Check engine light", record.arrivalCheckEngineLight);
    pushFinding(arrivalFindings, "ABS light", record.arrivalAbsLight);
    pushFinding(arrivalFindings, "Airbag light", record.arrivalAirbagLight);
    pushFinding(arrivalFindings, "Battery light", record.arrivalBatteryLight);
    pushFinding(arrivalFindings, "Oil pressure light", record.arrivalOilPressureLight);
    pushFinding(arrivalFindings, "Temperature light", record.arrivalTempLight);
    pushFinding(arrivalFindings, "Transmission light", record.arrivalTransmissionLight);
    pushFinding(arrivalFindings, "Other warning light", record.arrivalOtherWarningLight, record.arrivalOtherWarningNote);
    pushSection("Arrival / Safety", arrivalFindings, joinInspectionNotes(record.inspectionPhotoNotes, record.arrivalOtherWarningNote));
    const tireFindings = [];
    pushFinding(tireFindings, "Front left tire", record.frontLeftTireState, joinInspectionNotes(record.frontLeftTreadMm ? `Tread ${record.frontLeftTreadMm} mm` : "", record.frontLeftWearPattern ? `Wear ${record.frontLeftWearPattern}` : ""));
    pushFinding(tireFindings, "Front right tire", record.frontRightTireState, joinInspectionNotes(record.frontRightTreadMm ? `Tread ${record.frontRightTreadMm} mm` : "", record.frontRightWearPattern ? `Wear ${record.frontRightWearPattern}` : ""));
    pushFinding(tireFindings, "Rear left tire", record.rearLeftTireState, joinInspectionNotes(record.rearLeftTreadMm ? `Tread ${record.rearLeftTreadMm} mm` : "", record.rearLeftWearPattern ? `Wear ${record.rearLeftWearPattern}` : ""));
    pushFinding(tireFindings, "Rear right tire", record.rearRightTireState, joinInspectionNotes(record.rearRightTreadMm ? `Tread ${record.rearRightTreadMm} mm` : "", record.rearRightWearPattern ? `Wear ${record.rearRightWearPattern}` : ""));
    pushSection("Tires", tireFindings);
    const underHoodFindings = [];
    pushFinding(underHoodFindings, "Under hood overall", record.underHoodState, record.underHoodSummary);
    pushFinding(underHoodFindings, "Engine oil level", record.engineOilLevel, record.engineOilNotes);
    pushFinding(underHoodFindings, "Engine oil condition", record.engineOilCondition, record.engineOilNotes);
    pushFinding(underHoodFindings, "Engine oil leaks", record.engineOilLeaks, joinInspectionNotes(record.engineOilNotes, record.leakNotes));
    pushFinding(underHoodFindings, "Coolant level", record.coolantLevel, record.coolantNotes);
    pushFinding(underHoodFindings, "Coolant condition", record.coolantCondition, record.coolantNotes);
    pushFinding(underHoodFindings, "Radiator hose condition", record.radiatorHoseCondition, record.coolantNotes);
    pushFinding(underHoodFindings, "Cooling leaks", record.coolingLeaks, record.coolantNotes);
    pushFinding(underHoodFindings, "Brake fluid level", record.brakeFluidLevel, record.brakeFluidNotes);
    pushFinding(underHoodFindings, "Brake fluid condition", record.brakeFluidCondition, record.brakeFluidNotes);
    pushFinding(underHoodFindings, "Power steering level", record.powerSteeringLevel, record.powerSteeringNotes);
    pushFinding(underHoodFindings, "Power steering condition", record.powerSteeringCondition, record.powerSteeringNotes);
    pushFinding(underHoodFindings, "Battery condition", record.batteryCondition, record.batteryNotes);
    pushFinding(underHoodFindings, "Battery terminal condition", record.batteryTerminalCondition, record.batteryNotes);
    pushFinding(underHoodFindings, "Battery hold-down condition", record.batteryHoldDownCondition, record.batteryNotes);
    pushFinding(underHoodFindings, "Drive belt condition", record.driveBeltCondition, record.beltNotes);
    pushFinding(underHoodFindings, "Air filter condition", record.airFilterCondition, record.intakeNotes);
    pushFinding(underHoodFindings, "Intake hose condition", record.intakeHoseCondition, record.intakeNotes);
    pushFinding(underHoodFindings, "Engine mount condition", record.engineMountCondition);
    pushFinding(underHoodFindings, "Wiring condition", record.wiringCondition);
    pushFinding(underHoodFindings, "Unusual smell", record.unusualSmellState);
    pushFinding(underHoodFindings, "Unusual sound", record.unusualSoundState);
    pushFinding(underHoodFindings, "Visible engine leak", record.visibleEngineLeakState, record.leakNotes);
    pushSection("Under Hood", underHoodFindings, record.underHoodSummary);
    const brakeFindings = [];
    pushFinding(brakeFindings, "Front brake condition", record.frontBrakeState, joinInspectionNotes(record.frontBrakeCondition, record.brakeFluidNotes));
    pushFinding(brakeFindings, "Rear brake condition", record.rearBrakeState, joinInspectionNotes(record.rearBrakeCondition, record.brakeFluidNotes));
    pushSection("Brakes", brakeFindings, joinInspectionNotes(record.brakeFluidNotes));
    const coolingFindings = [];
    pushFinding(coolingFindings, "Cooling fan operation", record.coolingFanOperationState, record.coolingSystemNotes);
    pushFinding(coolingFindings, "Radiator condition", record.radiatorConditionState, record.coolingSystemNotes);
    pushFinding(coolingFindings, "Water pump condition", record.waterPumpConditionState, record.coolingSystemNotes);
    pushFinding(coolingFindings, "Thermostat condition", record.thermostatConditionState, record.coolingSystemNotes);
    pushFinding(coolingFindings, "Overflow reservoir condition", record.overflowReservoirConditionState, record.coolingSystemNotes);
    pushFinding(coolingFindings, "Cooling system pressure", record.coolingSystemPressureState, record.coolingSystemNotes);
    coolingAdditionalFindings.forEach((finding) => {
        const status = getCustomerInspectionStatus(finding.status);
        if (!status)
            return;
        coolingFindings.push({
            title: finding.title.trim() || "Cooling finding",
            status,
            note: joinInspectionNotes(finding.note, finding.photoNotes.join("  |  ")),
        });
    });
    pushSection("Cooling System", coolingFindings, record.coolingSystemNotes);
    const steeringFindings = [];
    pushFinding(steeringFindings, "Steering wheel play", record.steeringWheelPlayState, record.steeringSystemNotes);
    pushFinding(steeringFindings, "Steering pump / EPS motor", record.steeringPumpMotorState, record.steeringSystemNotes);
    pushFinding(steeringFindings, "Steering fluid condition", record.steeringFluidConditionState, record.steeringSystemNotes);
    pushFinding(steeringFindings, "Steering hose condition", record.steeringHoseConditionState, record.steeringSystemNotes);
    pushFinding(steeringFindings, "Steering column condition", record.steeringColumnConditionState, record.steeringSystemNotes);
    pushFinding(steeringFindings, "Road feel", record.steeringRoadFeelState, record.steeringSystemNotes);
    steeringAdditionalFindings.forEach((finding) => {
        const status = getCustomerInspectionStatus(finding.status);
        if (!status)
            return;
        steeringFindings.push({
            title: finding.title.trim() || "Steering finding",
            status,
            note: joinInspectionNotes(finding.note, finding.photoNotes.join("  |  ")),
        });
    });
    pushSection("Steering", steeringFindings, record.steeringSystemNotes);
    const engineFindings = [];
    pushFinding(engineFindings, "Starting performance", record.engineStartingState, record.enginePerformanceNotes);
    pushFinding(engineFindings, "Idle quality", record.idleQualityState, record.enginePerformanceNotes);
    pushFinding(engineFindings, "Acceleration response", record.accelerationResponseState, record.enginePerformanceNotes);
    pushFinding(engineFindings, "Misfire", record.engineMisfireState, record.enginePerformanceNotes);
    pushFinding(engineFindings, "Smoke", record.engineSmokeState, record.enginePerformanceNotes);
    pushFinding(engineFindings, "Fuel efficiency concern", record.fuelEfficiencyConcernState, record.enginePerformanceNotes);
    enginePerformanceAdditionalFindings.forEach((finding) => {
        const status = getCustomerInspectionStatus(finding.status);
        if (!status)
            return;
        engineFindings.push({
            title: finding.title.trim() || "Engine performance finding",
            status,
            note: joinInspectionNotes(finding.note, finding.photoNotes.join("  |  ")),
        });
    });
    pushSection("Engine Performance", engineFindings, record.enginePerformanceNotes);
    const roadTestFindings = [];
    pushFinding(roadTestFindings, "Noise during road test", record.roadTestNoiseState, record.roadTestNotes);
    pushFinding(roadTestFindings, "Brake feel", record.roadTestBrakeFeelState, record.roadTestNotes);
    pushFinding(roadTestFindings, "Steering tracking", record.roadTestSteeringTrackingState, record.roadTestNotes);
    pushFinding(roadTestFindings, "Ride quality", record.roadTestRideQualityState, record.roadTestNotes);
    pushFinding(roadTestFindings, "Acceleration", record.roadTestAccelerationState, record.roadTestNotes);
    pushFinding(roadTestFindings, "Transmission shift quality", record.roadTestTransmissionShiftState, record.roadTestNotes);
    roadTestAdditionalFindings.forEach((finding) => {
        const status = getCustomerInspectionStatus(finding.status);
        if (!status)
            return;
        roadTestFindings.push({
            title: finding.title.trim() || "Road test finding",
            status,
            note: joinInspectionNotes(finding.note, finding.photoNotes.join("  |  ")),
        });
    });
    pushSection("Road Test", roadTestFindings, record.roadTestNotes);
    const acFindings = [];
    pushFinding(acFindings, "Cooling performance", record.acCoolingPerformanceState, joinInspectionNotes(record.acVentTemperature ? `Vent temperature ${record.acVentTemperature}` : "", record.acNotes));
    pushFinding(acFindings, "Compressor condition", record.acCompressorState, record.acNotes);
    pushFinding(acFindings, "Condenser fan condition", record.acCondenserFanState, record.acNotes);
    pushFinding(acFindings, "Cabin filter condition", record.acCabinFilterState, record.acNotes);
    pushFinding(acFindings, "Airflow condition", record.acAirflowState, record.acNotes);
    pushFinding(acFindings, "Odor condition", record.acOdorState, record.acNotes);
    pushSection("A/C", acFindings, joinInspectionNotes(record.acVentTemperature ? `Vent temperature ${record.acVentTemperature}` : "", record.acNotes));
    const electricalFindings = [];
    pushFinding(electricalFindings, "Starter", record.electricalStarterState, record.electricalNotes);
    pushFinding(electricalFindings, "Alternator", record.electricalAlternatorState, record.electricalNotes);
    pushFinding(electricalFindings, "Fuse / relay", record.electricalFuseRelayState, record.electricalNotes);
    pushFinding(electricalFindings, "Wiring", record.electricalWiringState, record.electricalNotes);
    pushFinding(electricalFindings, "Warning light", record.electricalWarningLightState, record.electricalNotes);
    if (electricalBatteryVoltage.trim()) {
        electricalFindings.push({ title: "Battery voltage", status: "Good", note: electricalBatteryVoltage.trim() });
    }
    if (electricalChargingVoltage.trim()) {
        electricalFindings.push({ title: "Charging voltage", status: "Good", note: electricalChargingVoltage.trim() });
    }
    pushSection("Electrical", electricalFindings, record.electricalNotes);
    const transmissionFindings = [];
    pushFinding(transmissionFindings, "Transmission fluid", record.transmissionFluidState, record.transmissionNotes);
    pushFinding(transmissionFindings, "Transmission fluid condition", record.transmissionFluidConditionState, record.transmissionNotes);
    pushFinding(transmissionFindings, "Transmission leak", record.transmissionLeakState, record.transmissionNotes);
    pushFinding(transmissionFindings, "Shifting performance", record.shiftingPerformanceState, record.transmissionNotes);
    pushFinding(transmissionFindings, "Clutch operation", record.clutchOperationState, record.transmissionNotes);
    pushFinding(transmissionFindings, "Drivetrain vibration", record.drivetrainVibrationState, record.transmissionNotes);
    pushFinding(transmissionFindings, "CV joint / drive axle", record.cvJointDriveAxleState, record.transmissionNotes);
    pushFinding(transmissionFindings, "Transmission mount", record.transmissionMountState, record.transmissionNotes);
    pushSection("Transmission", transmissionFindings, record.transmissionNotes);
    const suspensionFindings = [];
    pushFinding(suspensionFindings, "Front shock", record.frontShockState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Front ball joint", record.frontBallJointState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Front tie rod end", record.frontTieRodEndState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Front rack end", record.frontRackEndState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Front stabilizer link", record.frontStabilizerLinkState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Front control arm bushing", record.frontControlArmBushingState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Front upper control arm", record.frontUpperControlArmState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Front lower control arm", record.frontLowerControlArmState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Front strut mount", record.frontStrutMountState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Steering rack", record.steeringRackConditionState, record.steeringFeelNotes);
    pushFinding(suspensionFindings, "Front CV boot", record.frontCvBootState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Front wheel bearing", record.frontWheelBearingState, record.frontSuspensionNotes);
    pushFinding(suspensionFindings, "Rear shock", record.rearShockState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear stabilizer link", record.rearStabilizerLinkState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear bushing", record.rearBushingState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear spring", record.rearSpringState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear control arm", record.rearControlArmState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear coil spring", record.rearCoilSpringState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear leaf spring", record.rearLeafSpringState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear leaf spring bushing", record.rearLeafSpringBushingState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear U-bolt mount", record.rearUBoltMountState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear axle mount", record.rearAxleMountState, record.rearSuspensionNotes);
    pushFinding(suspensionFindings, "Rear wheel bearing", record.rearWheelBearingState, record.rearSuspensionNotes);
    pushSection("Suspension", suspensionFindings, joinInspectionNotes(record.rearSuspensionType, record.frontSuspensionNotes, record.rearSuspensionNotes, record.steeringFeelNotes, record.suspensionRoadTestNotes));
    const scanFindings = [];
    if (record.scanPerformed || scanNotes.trim() || scanUploadNames.length > 0) {
        scanFindings.push({
            title: "Scan performed",
            status: record.scanPerformed ? "Good" : "Needs Attention",
            note: joinInspectionNotes(record.scanToolUsed, record.scanNotes),
        });
    }
    if (scanUploadNames.length > 0) {
        scanFindings.push({
            title: "Scan file uploads",
            status: "Good",
            note: scanUploadNames.join("  |  "),
        });
    }
    pushSection("Scan / Diagnostics", scanFindings, joinInspectionNotes(scanToolUsed, scanNotes));
    const alignmentFindings = [];
    if (record.alignmentRecommended || alignmentConcernNotes.trim() || alignmentBeforePrintoutName.trim() || alignmentAfterPrintoutName.trim()) {
        alignmentFindings.push({
            title: "Alignment check",
            status: record.alignmentRecommended ? "Needs Attention" : "Good",
            note: joinInspectionNotes(alignmentConcernNotes, alignmentBeforePrintoutName ? `Before printout: ${alignmentBeforePrintoutName}` : "", alignmentAfterPrintoutName ? `After printout: ${alignmentAfterPrintoutName}` : ""),
        });
    }
    pushSection("Alignment", alignmentFindings, alignmentConcernNotes);
    if (inspectionNotes.trim()) {
        pushSection("Inspection Notes", [{
                title: "Overall notes",
                status: "Good",
                note: inspectionNotes.trim(),
            }], "");
    }
    return sections;
}
function groupInspectionMediaBySection(items) {
    const grouped = new Map();
    (items ?? []).forEach((item) => {
        if (!item || typeof item !== "object")
            return;
        const key = String(item?.section ?? "").trim() || "General";
        const current = grouped.get(key) ?? [];
        current.push(item);
        grouped.set(key, current);
    });
    return Array.from(grouped.entries()).map(([section, media]) => ({ section, media }));
}
class CustomerPortalErrorBoundary extends React.Component {
    state = {
        hasError: false,
        errorMessage: "",
    };
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            errorMessage: error.message || "Customer portal could not be rendered.",
        };
    }
    componentDidCatch(error, _errorInfo) {
        console.error("Customer portal render error:", error);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs(_Fragment, { children: [_jsx("style", { children: globalCss }), _jsx("div", { style: styles.appShell, children: _jsx("div", { style: styles.mainArea, children: _jsx("div", { style: styles.pageContent, children: _jsx("div", { style: styles.grid, children: _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsxs(Card, { title: "Customer Portal", subtitle: "Recovery view", children: [_jsx("div", { style: styles.errorBox, children: "Customer portal failed to load." }), _jsx("div", { style: styles.formHint, children: this.state.errorMessage || "A legacy record or inspection item caused the customer portal to crash. The rest of the app is still available." }), _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: this.props.onReset, children: "Return to Staff Login" }) })] }) }) }) }) }) })] }));
        }
        return this.props.children;
    }
}
class AppErrorBoundary extends React.Component {
    state = {
        hasError: false,
        errorMessage: "",
    };
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            errorMessage: error.message || "The app could not be rendered.",
        };
    }
    componentDidCatch(error, _errorInfo) {
        console.error("App render error:", error);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs(_Fragment, { children: [_jsx("style", { children: globalCss }), _jsx("div", { style: styles.appShell, children: _jsx("div", { style: styles.mainArea, children: _jsx("div", { style: styles.pageContent, children: _jsx("div", { style: styles.grid, children: _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsxs(Card, { title: "App Recovery", subtitle: "Safe fallback", children: [_jsx("div", { style: styles.errorBox, children: "Something in the app failed to render." }), _jsx("div", { style: styles.formHint, children: this.state.errorMessage || "A record or screen state triggered a runtime error. Reload the app to continue." }), _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => window.location.reload(), children: "Reload App" }) })] }) }) }) }) }) })] }));
        }
        return this.props.children;
    }
}
function isAttentionOrReplacement(value) {
    return value === "Needs Attention" || value === "Needs Replacement";
}
function isWarningLightOn(value) {
    return value === "On";
}
function getWarningLightStyle(value) {
    if (value === "On")
        return styles.statusLocked;
    if (value === "Off")
        return styles.statusOk;
    return styles.statusNeutral;
}
function getCustomerConditionLabelFromWorkLine(line) {
    if (line.status === "Completed")
        return "Good";
    if (line.status === "Waiting Parts")
        return "Needs Attention";
    if (line.priority === "High")
        return "Needs Replacement";
    if (line.priority === "Medium")
        return "Needs Attention";
    return "Monitor";
}
function getCustomerConditionStyle(label) {
    if (label === "Good")
        return styles.statusOk;
    if (label === "Monitor")
        return styles.statusNeutral;
    if (label === "Needs Attention")
        return styles.statusWarning;
    return styles.statusLocked;
}
function buildScanRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    const anyArrivalWarningOn = [
        form.arrivalCheckEngineLight,
        form.arrivalAbsLight,
        form.arrivalAirbagLight,
        form.arrivalBatteryLight,
        form.arrivalOilPressureLight,
        form.arrivalTempLight,
        form.arrivalTransmissionLight,
        form.arrivalOtherWarningLight,
    ].some(isWarningLightOn);
    push(anyArrivalWarningOn, "OBD2 scan / warning light diagnostic");
    push(form.scanPerformed || form.scanUploadNames.length > 0, "Diagnostic review of scan results");
    push(anyArrivalWarningOn && (form.scanPerformed || form.scanUploadNames.length > 0), "Full system diagnostic review");
    push(!!form.scanNotes.trim(), "Diagnostic note review");
    return recommendations;
}
function buildDetailedUnderHoodRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    push(isAttentionOrReplacement(form.engineOilLevel) || isAttentionOrReplacement(form.engineOilCondition), "Engine oil service / oil change");
    push(isAttentionOrReplacement(form.engineOilLeaks) || isAttentionOrReplacement(form.visibleEngineLeakState), "Engine oil leak inspection");
    push(isAttentionOrReplacement(form.coolantLevel) || isAttentionOrReplacement(form.coolantCondition), "Coolant service / coolant top-up and system check");
    push(isAttentionOrReplacement(form.radiatorHoseCondition) || isAttentionOrReplacement(form.coolingLeaks), "Cooling system leak and hose inspection");
    push(isAttentionOrReplacement(form.brakeFluidLevel) || isAttentionOrReplacement(form.brakeFluidCondition), "Brake fluid inspection / flush recommendation");
    push(isAttentionOrReplacement(form.powerSteeringLevel) || isAttentionOrReplacement(form.powerSteeringCondition), "Power steering fluid and hose inspection");
    push(isAttentionOrReplacement(form.batteryCondition) || isAttentionOrReplacement(form.batteryTerminalCondition), "Battery and terminal service");
    push(isAttentionOrReplacement(form.batteryHoldDownCondition), "Battery hold-down correction");
    push(isAttentionOrReplacement(form.driveBeltCondition), "Drive belt inspection / replacement");
    push(isAttentionOrReplacement(form.airFilterCondition) || isAttentionOrReplacement(form.intakeHoseCondition), "Air intake / air filter service");
    push(isAttentionOrReplacement(form.engineMountCondition), "Engine mounting inspection");
    push(isAttentionOrReplacement(form.wiringCondition), "Visible wiring / connector inspection");
    push(isAttentionOrReplacement(form.unusualSmellState) || isAttentionOrReplacement(form.unusualSoundState), "Engine noise / smell diagnosis");
    return recommendations;
}
function buildSuspensionRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    push(isAttentionOrReplacement(form.frontShockState), "Front shock / strut inspection or replacement");
    push(isAttentionOrReplacement(form.frontStrutMountState), "Front strut mount inspection / replacement");
    push(isAttentionOrReplacement(form.frontBallJointState), "Front ball joint inspection / replacement");
    push(isAttentionOrReplacement(form.frontTieRodEndState), "Front tie rod end inspection / replacement");
    push(isAttentionOrReplacement(form.frontRackEndState), "Front rack end inspection / replacement");
    push(isAttentionOrReplacement(form.steeringRackConditionState), "Steering rack inspection / replacement");
    push(isAttentionOrReplacement(form.frontStabilizerLinkState), "Front stabilizer link inspection / replacement");
    push(isAttentionOrReplacement(form.frontControlArmBushingState), "Front control arm bushing inspection / replacement");
    push(isAttentionOrReplacement(form.frontUpperControlArmState), "Front upper control arm inspection / replacement");
    push(isAttentionOrReplacement(form.frontLowerControlArmState), "Front lower control arm inspection / replacement");
    push(isAttentionOrReplacement(form.frontCvBootState), "CV boot inspection / service");
    push(isAttentionOrReplacement(form.frontWheelBearingState), "Front wheel bearing inspection");
    push(isAttentionOrReplacement(form.rearShockState), "Rear shock absorber inspection / replacement");
    push(isAttentionOrReplacement(form.rearStabilizerLinkState), "Rear stabilizer link inspection / replacement");
    push(isAttentionOrReplacement(form.rearBushingState), "Rear suspension bushing inspection / replacement");
    push(isAttentionOrReplacement(form.rearSpringState), "Rear spring inspection / replacement");
    push(isAttentionOrReplacement(form.rearControlArmState), "Rear control arm inspection / replacement");
    push(isAttentionOrReplacement(form.rearCoilSpringState), "Rear coil spring inspection / replacement");
    push(isAttentionOrReplacement(form.rearLeafSpringState), "Rear leaf spring inspection / replacement");
    push(isAttentionOrReplacement(form.rearLeafSpringBushingState), "Rear leaf spring bushing inspection / replacement");
    push(isAttentionOrReplacement(form.rearUBoltMountState), "Rear U-bolt / mounting inspection");
    push(isAttentionOrReplacement(form.rearAxleMountState), "Rear axle mount inspection");
    push(isAttentionOrReplacement(form.rearWheelBearingState), "Rear wheel bearing inspection");
    const suspensionCritical = [
        form.frontShockState, form.frontStrutMountState, form.frontBallJointState, form.frontTieRodEndState,
        form.frontRackEndState, form.steeringRackConditionState, form.frontStabilizerLinkState,
        form.frontControlArmBushingState, form.frontUpperControlArmState, form.frontLowerControlArmState,
        form.frontCvBootState, form.frontWheelBearingState, form.rearShockState, form.rearStabilizerLinkState,
        form.rearBushingState, form.rearSpringState, form.rearControlArmState, form.rearCoilSpringState,
        form.rearLeafSpringState, form.rearLeafSpringBushingState, form.rearUBoltMountState,
        form.rearAxleMountState, form.rearWheelBearingState,
    ].some(isAttentionOrReplacement);
    push(suspensionCritical, "Suspension check / repair");
    push(suspensionCritical || !!form.steeringFeelNotes.trim() || !!form.suspensionRoadTestNotes.trim(), "Alignment check after suspension / steering findings");
    return recommendations;
}
function buildCoolingRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    push(isAttentionOrReplacement(form.coolingFanOperationState), "Cooling fan inspection / service");
    push(isAttentionOrReplacement(form.radiatorConditionState), "Radiator inspection / service");
    push(isAttentionOrReplacement(form.waterPumpConditionState), "Water pump inspection / replacement");
    push(isAttentionOrReplacement(form.thermostatConditionState), "Thermostat inspection / replacement");
    push(isAttentionOrReplacement(form.overflowReservoirConditionState), "Overflow reservoir inspection");
    push(isAttentionOrReplacement(form.coolingSystemPressureState), "Cooling system pressure test");
    push([
        form.coolingFanOperationState,
        form.radiatorConditionState,
        form.waterPumpConditionState,
        form.thermostatConditionState,
        form.overflowReservoirConditionState,
        form.coolingSystemPressureState,
    ].some(isAttentionOrReplacement) || !!form.coolingSystemNotes.trim(), "Cooling system diagnosis");
    return recommendations;
}
function buildSteeringRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    push(isAttentionOrReplacement(form.steeringWheelPlayState), "Steering play inspection");
    push(isAttentionOrReplacement(form.steeringPumpMotorState), "Steering pump / EPS motor inspection");
    push(isAttentionOrReplacement(form.steeringFluidConditionState), "Steering fluid inspection / service");
    push(isAttentionOrReplacement(form.steeringHoseConditionState), "Steering hose / line inspection");
    push(isAttentionOrReplacement(form.steeringColumnConditionState), "Steering column inspection");
    push(isAttentionOrReplacement(form.steeringRoadFeelState), "Steering road feel diagnosis");
    push([
        form.steeringWheelPlayState,
        form.steeringPumpMotorState,
        form.steeringFluidConditionState,
        form.steeringHoseConditionState,
        form.steeringColumnConditionState,
        form.steeringRoadFeelState,
    ].some(isAttentionOrReplacement) || !!form.steeringSystemNotes.trim(), "Steering system diagnosis");
    return recommendations;
}
function buildEnginePerformanceRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    push(isAttentionOrReplacement(form.engineStartingState), "Starting performance diagnosis");
    push(isAttentionOrReplacement(form.idleQualityState), "Idle quality diagnosis");
    push(isAttentionOrReplacement(form.accelerationResponseState), "Acceleration response diagnosis");
    push(isAttentionOrReplacement(form.engineMisfireState), "Misfire diagnosis");
    push(isAttentionOrReplacement(form.engineSmokeState), "Engine smoke / combustion diagnosis");
    push(isAttentionOrReplacement(form.fuelEfficiencyConcernState), "Fuel efficiency performance check");
    push([
        form.engineStartingState,
        form.idleQualityState,
        form.accelerationResponseState,
        form.engineMisfireState,
        form.engineSmokeState,
        form.fuelEfficiencyConcernState,
    ].some(isAttentionOrReplacement) || !!form.enginePerformanceNotes.trim(), "Engine performance diagnosis");
    return recommendations;
}
function buildRoadTestRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    push(isAttentionOrReplacement(form.roadTestNoiseState), "Road-test noise diagnosis");
    push(isAttentionOrReplacement(form.roadTestBrakeFeelState), "Brake feel road-test diagnosis");
    push(isAttentionOrReplacement(form.roadTestSteeringTrackingState), "Steering tracking road-test diagnosis");
    push(isAttentionOrReplacement(form.roadTestRideQualityState), "Ride quality road-test diagnosis");
    push(isAttentionOrReplacement(form.roadTestAccelerationState), "Acceleration road-test diagnosis");
    push(isAttentionOrReplacement(form.roadTestTransmissionShiftState), "Shift quality road-test diagnosis");
    push([
        form.roadTestNoiseState,
        form.roadTestBrakeFeelState,
        form.roadTestSteeringTrackingState,
        form.roadTestRideQualityState,
        form.roadTestAccelerationState,
        form.roadTestTransmissionShiftState,
    ].some(isAttentionOrReplacement) || !!form.roadTestNotes.trim(), "Extended road test and drivability review");
    return recommendations;
}
function buildAcRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    push(isAttentionOrReplacement(form.acCoolingPerformanceState) || !!form.acVentTemperature.trim(), "Air conditioning cooling performance inspection");
    push(isAttentionOrReplacement(form.acCompressorState) || isAttentionOrReplacement(form.acCondenserFanState), "A/C compressor and condenser fan inspection");
    push(isAttentionOrReplacement(form.acCabinFilterState) || isAttentionOrReplacement(form.acAirflowState), "Cabin filter / A/C airflow inspection");
    push(isAttentionOrReplacement(form.acOdorState), "A/C odor / evaporator cleaning inspection");
    push([
        form.acCoolingPerformanceState,
        form.acCompressorState,
        form.acCondenserFanState,
        form.acCabinFilterState,
        form.acAirflowState,
        form.acOdorState,
    ].some(isAttentionOrReplacement) || !!form.acNotes.trim(), "Air conditioning system diagnosis");
    return recommendations;
}
function buildElectricalRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    push(!!form.electricalBatteryVoltage.trim() || isAttentionOrReplacement(form.electricalStarterState), "Battery starting system check");
    push(!!form.electricalChargingVoltage.trim() || isAttentionOrReplacement(form.electricalAlternatorState), "Charging system / alternator inspection");
    push(isAttentionOrReplacement(form.electricalFuseRelayState), "Fuse and relay inspection");
    push(isAttentionOrReplacement(form.electricalWiringState), "Electrical wiring / connector inspection");
    push(isAttentionOrReplacement(form.electricalWarningLightState), "Warning light scan and diagnosis");
    push([
        form.electricalStarterState,
        form.electricalAlternatorState,
        form.electricalFuseRelayState,
        form.electricalWiringState,
        form.electricalWarningLightState,
    ].some(isAttentionOrReplacement) || !!form.electricalNotes.trim(), "Electrical system diagnosis");
    return recommendations;
}
function buildTransmissionRecommendations(form) {
    const recommendations = [];
    const push = (condition, rec) => {
        if (condition && !recommendations.includes(rec))
            recommendations.push(rec);
    };
    push(isAttentionOrReplacement(form.transmissionFluidState) || isAttentionOrReplacement(form.transmissionFluidConditionState), "Transmission fluid inspection / service");
    push(isAttentionOrReplacement(form.transmissionLeakState), "Transmission leak inspection");
    push(isAttentionOrReplacement(form.shiftingPerformanceState), "Transmission shifting diagnosis");
    push(isAttentionOrReplacement(form.clutchOperationState), "Clutch operation inspection");
    push(isAttentionOrReplacement(form.drivetrainVibrationState), "Drivetrain vibration diagnosis");
    push(isAttentionOrReplacement(form.cvJointDriveAxleState), "CV joint / drive axle inspection");
    push(isAttentionOrReplacement(form.transmissionMountState), "Transmission mount inspection");
    push([
        form.transmissionFluidState,
        form.transmissionFluidConditionState,
        form.transmissionLeakState,
        form.shiftingPerformanceState,
        form.clutchOperationState,
        form.drivetrainVibrationState,
        form.cvJointDriveAxleState,
        form.transmissionMountState,
    ].some(isAttentionOrReplacement) || !!form.transmissionNotes.trim(), "Transmission / drivetrain diagnosis");
    return recommendations;
}
function getCustomerFriendlyLineDescription(line) {
    const category = line.category?.trim() || "General Service";
    const title = line.title?.trim() || "Recommended Work";
    const lower = `${category} ${title}`.toLowerCase();
    if (lower.includes("brake"))
        return "Brake-related work recommended for safety and braking performance.";
    if (lower.includes("suspension"))
        return "Suspension work recommended to improve ride quality, stability, and safety.";
    if (lower.includes("alignment"))
        return "Wheel alignment is recommended to correct pull, steering angle, or uneven tire wear.";
    if (lower.includes("tire"))
        return "Tire-related service recommended due to tread, wear pattern, or safety condition.";
    if (lower.includes("battery") || lower.includes("electrical"))
        return "Electrical work recommended to address charging, starting, or warning-light concerns.";
    if (lower.includes("air") || lower.includes("a/c"))
        return "Air conditioning service recommended to improve cabin cooling and comfort.";
    if (lower.includes("transmission") || lower.includes("drivetrain") || lower.includes("clutch"))
        return "Drivetrain or transmission service recommended to address shifting, vibration, or drivability concerns.";
    if (lower.includes("cooling") || lower.includes("radiator") || lower.includes("coolant"))
        return "Cooling system work recommended to prevent overheating and coolant-related issues.";
    if (lower.includes("oil") || lower.includes("fluid"))
        return "Fluid-related service recommended to protect components and maintain vehicle reliability.";
    return `${category} service recommended based on inspection findings.`;
}
function buildCustomerApprovalMessage(ro) {
    if (!ro)
        return "";
    const lines = ro.workLines;
    const approved = lines.filter((line) => line.approvalDecision === "Approved");
    const deferred = lines.filter((line) => line.approvalDecision === "Deferred");
    const declined = lines.filter((line) => line.approvalDecision === "Declined");
    const pending = lines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending");
    const summaryLines = lines.map((line, index) => {
        const decision = line.approvalDecision ?? "Pending";
        const amount = formatCurrency(parseMoneyInput(line.totalEstimate));
        return `${index + 1}. ${line.title || "Untitled Work Line"}  -  ${amount}  -  ${decision}`;
    });
    return [
        `Repair Order: ${ro.roNumber}`,
        `Vehicle: ${[ro.make, ro.model, ro.year].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "-"}`,
        `Plate: ${ro.plateNumber || ro.conductionNumber || "-"}`,
        `Customer: ${ro.accountLabel}`,
        "",
        "Recommended work items:",
        ...summaryLines,
        "",
        `Approved: ${approved.length}`,
        `Deferred: ${deferred.length}`,
        `Declined: ${declined.length}`,
        `Pending: ${pending.length}`,
    ].join("\n");
}
function buildCustomerNotificationTemplates({ ro, inspection, approvalRecord, approvalLinkToken, oilReminder, followUpReminder, partsRequests, releaseRecord, backjobRecord, }) {
    if (!ro)
        return [];
    const customerName = ro.accountLabel || ro.customerName || "Customer";
    const vehicleLabel = [ro.make, ro.model, ro.year].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "your vehicle";
    const plateLabel = ro.plateNumber || ro.conductionNumber || "-";
    const portalLink = approvalLinkToken ? `${buildCustomerPortalUrl(approvalLinkToken.token)}` : "";
    const estimateTotal = ro.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);
    const inspectionSections = inspection ? buildCustomerInspectionSections(inspection) : [];
    const inspectionFindings = inspectionSections.flatMap((section) => section.findings.map((finding) => ({
        section: section.label,
        title: finding.title,
        status: finding.status,
        note: finding.note,
    })));
    const notableFindings = inspectionFindings.filter((finding) => finding.status !== "Good").slice(0, 4);
    const findingLines = notableFindings.length
        ? notableFindings.map((finding) => `- ${finding.section}: ${finding.title} - ${finding.status}${finding.note ? ` - ${finding.note}` : ""}`)
        : inspectionFindings.slice(0, 3).map((finding) => `- ${finding.section}: ${finding.title} - ${finding.status}${finding.note ? ` - ${finding.note}` : ""}`);
    const approvalLines = ro.workLines
        .filter((line) => (line.approvalDecision ?? "Pending") === "Pending" || line.approvalDecision === "Deferred")
        .slice(0, 4)
        .map((line) => {
        const amount = formatCurrency(parseMoneyInput(line.totalEstimate));
        const note = line.notes || getCustomerFriendlyLineDescription(line);
        return `- ${line.title || "Untitled Work Item"} (${amount}) - ${note}`;
    });
    const partsLines = partsRequests
        .filter((request) => request.roId === ro.id && !["Closed", "Cancelled"].includes(request.status))
        .slice(0, 4)
        .map((request) => `- ${request.partName || "Part request"} x${request.quantity || "1"} - ${request.status}`);
    const releaseChecklist = releaseRecord
        ? [
            `- Final total: ${formatCurrency(parseMoneyInput(releaseRecord.finalTotalAmount))}`,
            `- Payment settled: ${releaseRecord.paymentSettled ? "Yes" : "No"}`,
            `- Documents ready: ${releaseRecord.documentsReady ? "Yes" : "No"}`,
            `- Vehicle clean: ${releaseRecord.cleanVehicle ? "Yes" : "No"}`,
        ]
        : [
            `- Final total: ${formatCurrency(estimateTotal)}`,
            `- Payment settled: Pending`,
            `- Documents ready: Pending`,
            `- Vehicle clean: Pending`,
        ];
    const pullOutReason = ro.pullOutReason || backjobRecord?.findings || backjobRecord?.complaint || ro.customerConcern || "Work has been stopped for review.";
    const backjobLine = backjobRecord
        ? `- Backjob ${backjobRecord.backjobNumber}: ${backjobRecord.responsibility} | ${backjobRecord.status}`
        : "- No backjob record has been logged yet.";
    const bookingLink = buildCustomerBookingUrl();
    return [
        {
            key: "approval-request",
            title: "Approval Request",
            subtitle: "Send when the RO is ready for customer decision",
            body: [
                `Hi ${customerName},`,
                "",
                `Your repair order ${ro.roNumber} for ${vehicleLabel} (${plateLabel}) is ready for your approval.`,
                "",
                "Inspection highlights:",
                ...(findingLines.length ? findingLines : ["- No major inspection concerns recorded."]),
                "",
                "Recommended work items:",
                ...(approvalLines.length ? approvalLines : ["- Review the current estimate in the customer portal."]),
                "",
                portalLink ? `Open customer portal: ${portalLink}` : "Open customer portal from the SMS approval link system.",
                approvalRecord ? `Approval record: ${approvalRecord.approvalNumber} | ${approvalRecord.items.length} item(s)` : "Approval record: Not yet generated",
                "",
                "Reply if you want us to explain any item before you decide.",
            ].join("\n"),
        },
        {
            key: "waiting-parts",
            title: "Waiting Parts Update",
            subtitle: "Send when work is blocked by parts availability",
            body: [
                `Hi ${customerName},`,
                "",
                `Your repair order ${ro.roNumber} for ${vehicleLabel} is currently waiting for parts before work can continue.`,
                "",
                "Current parts update:",
                ...(partsLines.length ? partsLines : ["- No active parts request is currently linked to this RO."]),
                "",
                `RO status: ${ro.status}`,
                "We will update you again once the needed parts arrive and the job can resume.",
            ].join("\n"),
        },
        {
            key: "ready-release",
            title: "Ready for Release",
            subtitle: "Send when the vehicle is cleared for handover",
            body: [
                `Hi ${customerName},`,
                "",
                `Your vehicle ${vehicleLabel} (${plateLabel}) under RO ${ro.roNumber} is ready for release.`,
                "",
                ...releaseChecklist,
                "",
                releaseRecord?.releaseSummary || "Release checklist is complete and the vehicle is ready for pickup.",
                "",
                "Please visit the workshop for handover and final release.",
            ].join("\n"),
        },
        {
            key: "pull-out-notice",
            title: "Pull-Out or Stopped Work Notice",
            subtitle: "Send when a job is stopped or pulled out",
            body: [
                `Hi ${customerName},`,
                "",
                `Work on RO ${ro.roNumber} for ${vehicleLabel} has been stopped.`,
                "",
                `Reason: ${pullOutReason}`,
                `Current status: ${ro.status}`,
                backjobLine,
                "",
                "Please contact your service advisor if you want to review the next steps or resume the job later.",
            ].join("\n"),
        },
        {
            key: "oil-reminder",
            title: "Oil Change Reminder",
            subtitle: "Send when the next oil change is due or due soon",
            body: oilReminder
                ? buildOilChangeReminderMessage(oilReminder)
                : [
                    `Hi ${customerName},`,
                    "",
                    `This is a friendly oil change reminder for ${vehicleLabel} (${plateLabel}).`,
                    "",
                    "We review the latest oil change record and trigger reminders based on the service date and odometer interval.",
                    "",
                    `Book your next visit here: ${bookingLink}`,
                    "DVI Workshop | Please contact your service advisor for assistance.",
                ].join("\n"),
        },
        {
            key: "follow-up",
            title: "Follow-up (3 days after release)",
            subtitle: "Send three days after the vehicle is marked as Released",
            body: followUpReminder && followUpReminder.isDue
                ? buildReleaseFollowUpMessage(followUpReminder)
                : [
                    `Hi ${customerName},`,
                    "",
                    "A post-release follow-up becomes available 3 days after the vehicle is marked as Released.",
                    "",
                    `RO: ${ro.roNumber}`,
                    `Vehicle: ${vehicleLabel} (${plateLabel})`,
                    `Release: ${releaseRecord?.releaseNumber || "-"}`,
                    "",
                    "Once the follow-up is due, you can copy the ready-to-send message from this panel.",
                ].join("\n"),
        },
    ];
}
function hasInspectionCriticalState(record) {
    return [
        record.underHoodState,
        record.engineOilLevel,
        record.engineOilCondition,
        record.engineOilLeaks,
        record.coolantLevel,
        record.coolantCondition,
        record.radiatorHoseCondition,
        record.coolingLeaks,
        record.brakeFluidLevel,
        record.brakeFluidCondition,
        record.powerSteeringLevel,
        record.powerSteeringCondition,
        record.batteryCondition,
        record.batteryTerminalCondition,
        record.batteryHoldDownCondition,
        record.driveBeltCondition,
        record.airFilterCondition,
        record.intakeHoseCondition,
        record.engineMountCondition,
        record.wiringCondition,
        record.unusualSmellState,
        record.unusualSoundState,
        record.visibleEngineLeakState,
        record.frontShockState,
        record.frontBallJointState,
        record.frontTieRodEndState,
        record.frontRackEndState,
        record.frontStabilizerLinkState,
        record.frontControlArmBushingState,
        record.frontCvBootState,
        record.frontWheelBearingState,
        record.rearShockState,
        record.rearStabilizerLinkState,
        record.rearBushingState,
        record.rearSpringState,
        record.rearWheelBearingState,
        record.coolingFanOperationState ?? "Not Checked",
        record.radiatorConditionState ?? "Not Checked",
        record.waterPumpConditionState ?? "Not Checked",
        record.thermostatConditionState ?? "Not Checked",
        record.overflowReservoirConditionState ?? "Not Checked",
        record.coolingSystemPressureState ?? "Not Checked",
        record.steeringWheelPlayState ?? "Not Checked",
        record.steeringPumpMotorState ?? "Not Checked",
        record.steeringFluidConditionState ?? "Not Checked",
        record.steeringHoseConditionState ?? "Not Checked",
        record.steeringColumnConditionState ?? "Not Checked",
        record.steeringRoadFeelState ?? "Not Checked",
        record.engineStartingState ?? "Not Checked",
        record.idleQualityState ?? "Not Checked",
        record.accelerationResponseState ?? "Not Checked",
        record.engineMisfireState ?? "Not Checked",
        record.engineSmokeState ?? "Not Checked",
        record.fuelEfficiencyConcernState ?? "Not Checked",
        record.roadTestNoiseState ?? "Not Checked",
        record.roadTestBrakeFeelState ?? "Not Checked",
        record.roadTestSteeringTrackingState ?? "Not Checked",
        record.roadTestRideQualityState ?? "Not Checked",
        record.roadTestAccelerationState ?? "Not Checked",
        record.roadTestTransmissionShiftState ?? "Not Checked",
        record.acCoolingPerformanceState,
        record.acCompressorState,
        record.acCondenserFanState,
        record.acCabinFilterState,
        record.acAirflowState,
        record.acOdorState,
        record.arrivalLights,
        record.arrivalBrokenGlass,
        record.arrivalWipers,
        record.arrivalHorn,
        record.frontLeftTireState,
        record.frontRightTireState,
        record.rearLeftTireState,
        record.rearRightTireState,
        record.frontBrakeState,
        record.rearBrakeState,
        record.electricalStarterState,
        record.electricalAlternatorState,
        record.electricalFuseRelayState,
        record.electricalWiringState,
        record.electricalWarningLightState,
        record.transmissionFluidState ?? "Not Checked",
        record.transmissionFluidConditionState ?? "Not Checked",
        record.transmissionLeakState ?? "Not Checked",
        record.shiftingPerformanceState ?? "Not Checked",
        record.clutchOperationState ?? "Not Checked",
        record.drivetrainVibrationState ?? "Not Checked",
        record.cvJointDriveAxleState ?? "Not Checked",
        record.transmissionMountState ?? "Not Checked",
    ].some((value) => value === "Needs Attention" || value === "Needs Replacement");
}
function getROStatusStyle(status) {
    if (status === "Draft")
        return styles.statusNeutral;
    if (status === "Waiting Inspection" || status === "Waiting Approval")
        return styles.statusInfo;
    if (status === "Approved / Ready to Work" || status === "Ready Release" || status === "Released" || status === "Closed")
        return styles.statusOk;
    if (status === "Waiting Parts" || status === "Quality Check")
        return styles.statusWarning;
    return styles.statusInfo;
}
function getWorkLineStatusStyle(status) {
    if (status === "Completed")
        return styles.statusOk;
    if (status === "Waiting Parts")
        return styles.statusWarning;
    if (status === "In Progress")
        return styles.statusInfo;
    return styles.statusNeutral;
}
function getInspectionStatusStyle(status) {
    return status === "Completed" ? styles.statusOk : styles.statusInfo;
}
function getCheckValueStyle(value) {
    if (value === "Good")
        return styles.statusOk;
    if (value === "Needs Replacement")
        return styles.statusLocked;
    if (value === "Needs Attention")
        return styles.statusWarning;
    return styles.statusNeutral;
}
function buildDefaultCustomerDescription(line) {
    const title = line.title.trim() || "Recommended work";
    const category = line.category.trim() || "General";
    const notes = line.notes.trim();
    return notes
        ? `${category}: ${title}. ${notes}`
        : `${category}: ${title}.`;
}
function getWorkLinePricing(line) {
    const laborHours = parseMoneyInput(line.laborHours);
    const laborRate = parseMoneyInput(line.laborRate);
    const partsCost = parseMoneyInput(line.partsCost);
    const markupPercent = parseMoneyInput(line.partsMarkupPercent);
    const laborFromInputs = laborHours > 0 && laborRate > 0 ? laborHours * laborRate : parseMoneyInput(line.serviceEstimate);
    const partsFromInputs = partsCost > 0 ? partsCost * (1 + markupPercent / 100) : parseMoneyInput(line.partsEstimate);
    return {
        laborAmount: laborFromInputs,
        partsAmount: partsFromInputs,
        totalAmount: laborFromInputs + partsFromInputs,
    };
}
function buildApprovalCategorySummary(lines) {
    const grouped = new Map();
    lines.forEach((line) => {
        const key = line.category.trim() || "General";
        const current = grouped.get(key) ?? { count: 0, total: 0 };
        grouped.set(key, {
            count: current.count + 1,
            total: current.total + parseMoneyInput(line.totalEstimate),
        });
    });
    return Array.from(grouped.entries())
        .map(([category, value]) => ({ category, ...value }))
        .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
}
function getPermissionsForRole(role, defs) {
    return defs.find((d) => d.role === role)?.permissions ?? [];
}
function hasPermission(role, defs, permission) {
    if (role === "Admin")
        return true;
    return getPermissionsForRole(role, defs).includes(permission);
}
function getAllowedNav(role, defs) {
    return NAV_ITEMS.filter((item) => hasPermission(role, defs, item.permission));
}
function getDefaultViewForRole(role, defs) {
    return getAllowedNav(role, defs)[0]?.key ?? "dashboard";
}
function canAccessView(role, defs, view) {
    const nav = NAV_ITEMS.find((n) => n.key === view);
    if (!nav)
        return false;
    return hasPermission(role, defs, nav.permission);
}
function migrateInspectionRecord(record) {
    return {
        ...record,
        underHoodState: record.underHoodState ?? "Good",
        engineOilLevel: record.engineOilLevel ?? "Not Checked",
        engineOilCondition: record.engineOilCondition ?? "Not Checked",
        engineOilLeaks: record.engineOilLeaks ?? "Not Checked",
        coolantLevel: record.coolantLevel ?? "Not Checked",
        coolantCondition: record.coolantCondition ?? "Not Checked",
        radiatorHoseCondition: record.radiatorHoseCondition ?? "Not Checked",
        coolingLeaks: record.coolingLeaks ?? "Not Checked",
        brakeFluidLevel: record.brakeFluidLevel ?? "Not Checked",
        brakeFluidCondition: record.brakeFluidCondition ?? "Not Checked",
        powerSteeringLevel: record.powerSteeringLevel ?? "Not Checked",
        powerSteeringCondition: record.powerSteeringCondition ?? "Not Checked",
        batteryCondition: record.batteryCondition ?? "Not Checked",
        batteryTerminalCondition: record.batteryTerminalCondition ?? "Not Checked",
        batteryHoldDownCondition: record.batteryHoldDownCondition ?? "Not Checked",
        driveBeltCondition: record.driveBeltCondition ?? "Not Checked",
        airFilterCondition: record.airFilterCondition ?? "Not Checked",
        intakeHoseCondition: record.intakeHoseCondition ?? "Not Checked",
        engineMountCondition: record.engineMountCondition ?? "Not Checked",
        wiringCondition: record.wiringCondition ?? "Not Checked",
        unusualSmellState: record.unusualSmellState ?? "Not Checked",
        unusualSoundState: record.unusualSoundState ?? "Not Checked",
        visibleEngineLeakState: record.visibleEngineLeakState ?? "Not Checked",
        engineOilNotes: record.engineOilNotes ?? "",
        coolantNotes: record.coolantNotes ?? "",
        brakeFluidNotes: record.brakeFluidNotes ?? "",
        powerSteeringNotes: record.powerSteeringNotes ?? "",
        batteryNotes: record.batteryNotes ?? "",
        beltNotes: record.beltNotes ?? "",
        intakeNotes: record.intakeNotes ?? "",
        leakNotes: record.leakNotes ?? "",
        recommendationLines: record.recommendationLines ?? parseRecommendationLines(record.recommendedWork || ""),
        inspectionPhotoNotes: record.inspectionPhotoNotes ?? "",
        arrivalFrontPhotoNote: record.arrivalFrontPhotoNote ?? "",
        arrivalDriverSidePhotoNote: record.arrivalDriverSidePhotoNote ?? "",
        arrivalRearPhotoNote: record.arrivalRearPhotoNote ?? "",
        arrivalPassengerSidePhotoNote: record.arrivalPassengerSidePhotoNote ?? "",
        additionalFindingPhotoNotes: record.additionalFindingPhotoNotes ?? [],
        enableUnderHood: record.enableUnderHood ?? true,
        enableAlignmentCheck: record.enableAlignmentCheck ?? false,
        enableAcCheck: record.enableAcCheck ?? false,
        enableCoolingCheck: record.enableCoolingCheck ?? false,
        coolingFanOperationState: record.coolingFanOperationState ?? "Not Checked",
        radiatorConditionState: record.radiatorConditionState ?? "Not Checked",
        waterPumpConditionState: record.waterPumpConditionState ?? "Not Checked",
        thermostatConditionState: record.thermostatConditionState ?? "Not Checked",
        overflowReservoirConditionState: record.overflowReservoirConditionState ?? "Not Checked",
        coolingSystemPressureState: record.coolingSystemPressureState ?? "Not Checked",
        coolingSystemNotes: record.coolingSystemNotes ?? "",
        coolingAdditionalFindings: normalizeAdditionalFindings(record.coolingAdditionalFindings),
        enableSteeringCheck: record.enableSteeringCheck ?? false,
        steeringWheelPlayState: record.steeringWheelPlayState ?? "Not Checked",
        steeringPumpMotorState: record.steeringPumpMotorState ?? "Not Checked",
        steeringFluidConditionState: record.steeringFluidConditionState ?? "Not Checked",
        steeringHoseConditionState: record.steeringHoseConditionState ?? "Not Checked",
        steeringColumnConditionState: record.steeringColumnConditionState ?? "Not Checked",
        steeringRoadFeelState: record.steeringRoadFeelState ?? "Not Checked",
        steeringSystemNotes: record.steeringSystemNotes ?? "",
        steeringAdditionalFindings: normalizeAdditionalFindings(record.steeringAdditionalFindings),
        enableEnginePerformanceCheck: record.enableEnginePerformanceCheck ?? false,
        engineStartingState: record.engineStartingState ?? "Not Checked",
        idleQualityState: record.idleQualityState ?? "Not Checked",
        accelerationResponseState: record.accelerationResponseState ?? "Not Checked",
        engineMisfireState: record.engineMisfireState ?? "Not Checked",
        engineSmokeState: record.engineSmokeState ?? "Not Checked",
        fuelEfficiencyConcernState: record.fuelEfficiencyConcernState ?? "Not Checked",
        enginePerformanceNotes: record.enginePerformanceNotes ?? "",
        enginePerformanceAdditionalFindings: normalizeAdditionalFindings(record.enginePerformanceAdditionalFindings),
        enableRoadTestCheck: record.enableRoadTestCheck ?? false,
        roadTestNoiseState: record.roadTestNoiseState ?? "Not Checked",
        roadTestBrakeFeelState: record.roadTestBrakeFeelState ?? "Not Checked",
        roadTestSteeringTrackingState: record.roadTestSteeringTrackingState ?? "Not Checked",
        roadTestRideQualityState: record.roadTestRideQualityState ?? "Not Checked",
        roadTestAccelerationState: record.roadTestAccelerationState ?? "Not Checked",
        roadTestTransmissionShiftState: record.roadTestTransmissionShiftState ?? "Not Checked",
        roadTestNotes: record.roadTestNotes ?? "",
        roadTestAdditionalFindings: normalizeAdditionalFindings(record.roadTestAdditionalFindings),
        acVentTemperature: record.acVentTemperature ?? "",
        acCoolingPerformanceState: record.acCoolingPerformanceState ?? "Not Checked",
        acCompressorState: record.acCompressorState ?? "Not Checked",
        acCondenserFanState: record.acCondenserFanState ?? "Not Checked",
        acCabinFilterState: record.acCabinFilterState ?? "Not Checked",
        acAirflowState: record.acAirflowState ?? "Not Checked",
        acOdorState: record.acOdorState ?? "Not Checked",
        acNotes: record.acNotes ?? "",
        enableElectricalCheck: record.enableElectricalCheck ?? false,
        electricalBatteryVoltage: record.electricalBatteryVoltage ?? "",
        electricalChargingVoltage: record.electricalChargingVoltage ?? "",
        electricalStarterState: record.electricalStarterState ?? "Not Checked",
        electricalAlternatorState: record.electricalAlternatorState ?? "Not Checked",
        electricalFuseRelayState: record.electricalFuseRelayState ?? "Not Checked",
        electricalWiringState: record.electricalWiringState ?? "Not Checked",
        electricalWarningLightState: record.electricalWarningLightState ?? "Not Checked",
        electricalNotes: record.electricalNotes ?? "",
        enableTransmissionCheck: record.enableTransmissionCheck ?? false,
        enableScanCheck: record.enableScanCheck ?? false,
        scanPerformed: record.scanPerformed ?? false,
        scanToolUsed: record.scanToolUsed ?? "",
        scanNotes: record.scanNotes ?? "",
        scanUploadNames: record.scanUploadNames ?? [],
        transmissionFluidState: record.transmissionFluidState ?? "Not Checked",
        transmissionFluidConditionState: record.transmissionFluidConditionState ?? "Not Checked",
        transmissionLeakState: record.transmissionLeakState ?? "Not Checked",
        shiftingPerformanceState: record.shiftingPerformanceState ?? "Not Checked",
        clutchOperationState: record.clutchOperationState ?? "Not Checked",
        drivetrainVibrationState: record.drivetrainVibrationState ?? "Not Checked",
        cvJointDriveAxleState: record.cvJointDriveAxleState ?? "Not Checked",
        transmissionMountState: record.transmissionMountState ?? "Not Checked",
        transmissionNotes: record.transmissionNotes ?? "",
        alignmentConcernNotes: record.alignmentConcernNotes ?? "",
        alignmentRecommended: record.alignmentRecommended ?? false,
        alignmentBeforePrintoutName: record.alignmentBeforePrintoutName ?? "",
        alignmentAfterPrintoutName: record.alignmentAfterPrintoutName ?? "",
        arrivalCheckEngineLight: record.arrivalCheckEngineLight ?? "Not Checked",
        arrivalAbsLight: record.arrivalAbsLight ?? "Not Checked",
        arrivalAirbagLight: record.arrivalAirbagLight ?? "Not Checked",
        arrivalBatteryLight: record.arrivalBatteryLight ?? "Not Checked",
        arrivalOilPressureLight: record.arrivalOilPressureLight ?? "Not Checked",
        arrivalTempLight: record.arrivalTempLight ?? "Not Checked",
        arrivalTransmissionLight: record.arrivalTransmissionLight ?? "Not Checked",
        arrivalOtherWarningLight: record.arrivalOtherWarningLight ?? "Not Checked",
        arrivalOtherWarningNote: record.arrivalOtherWarningNote ?? "",
        frontLeftWearPattern: record.frontLeftWearPattern ?? "Even Wear",
        frontRightWearPattern: record.frontRightWearPattern ?? "Even Wear",
        rearLeftWearPattern: record.rearLeftWearPattern ?? "Even Wear",
        rearRightWearPattern: record.rearRightWearPattern ?? "Even Wear",
        frontLeftTireState: record.frontLeftTireState ?? "Not Checked",
        frontRightTireState: record.frontRightTireState ?? "Not Checked",
        rearLeftTireState: record.rearLeftTireState ?? "Not Checked",
        rearRightTireState: record.rearRightTireState ?? "Not Checked",
        frontBrakeState: record.frontBrakeState ?? "Not Checked",
        rearBrakeState: record.rearBrakeState ?? "Not Checked",
        arrivalLights: record.arrivalLights ?? "Not Checked",
        arrivalBrokenGlass: record.arrivalBrokenGlass ?? "Not Checked",
        arrivalWipers: record.arrivalWipers ?? "Not Checked",
        arrivalHorn: record.arrivalHorn ?? "Not Checked",
        evidenceItems: record.evidenceItems ?? [],
    };
}
function migrateRepairOrderRecord(record) {
    return {
        ...record,
        workLines: (record.workLines ?? []).map((line) => ({
            ...line,
            customerDescription: line.customerDescription ?? "",
            laborHours: line.laborHours ?? "",
            laborRate: line.laborRate ?? "",
            partsCost: line.partsCost ?? "",
            partsMarkupPercent: line.partsMarkupPercent ?? "",
            estimateUploadName: line.estimateUploadName ?? "",
            recommendationSource: line.recommendationSource ?? "",
            approvalDecision: line.approvalDecision ?? "Pending",
            approvalAt: line.approvalAt ?? "",
            totalEstimate: recalculateWorkLine({
                ...line,
                customerDescription: line.customerDescription ?? "",
                laborHours: line.laborHours ?? "",
                laborRate: line.laborRate ?? "",
                partsCost: line.partsCost ?? "",
                partsMarkupPercent: line.partsMarkupPercent ?? "",
                estimateUploadName: line.estimateUploadName ?? "",
                recommendationSource: line.recommendationSource ?? "",
                approvalDecision: line.approvalDecision ?? "Pending",
                approvalAt: line.approvalAt ?? "",
            }).totalEstimate,
        })),
        latestApprovalRecordId: record.latestApprovalRecordId ?? "",
        deferredLineTitles: record.deferredLineTitles ?? [],
        backjobReferenceRoId: record.backjobReferenceRoId ?? "",
        findingRecommendationDecisions: Array.isArray(record.findingRecommendationDecisions)
            ? record.findingRecommendationDecisions.map((item, index) => ({
                recommendationId: String(item?.recommendationId ?? `finding_rec_${index}`),
                title: String(item?.title ?? ""),
                category: String(item?.category ?? "General"),
                decision: item?.decision === "Approved" ? "Approved" : "Declined",
                decidedAt: String(item?.decidedAt ?? ""),
                note: String(item?.note ?? ""),
            }))
            : [],
    };
}
function migratePartsRequestRecord(record) {
    return {
        ...record,
        status: normalizeLegacyPartsStatus(record.status),
        workshopPhotos: Array.isArray(record.workshopPhotos)
            ? record.workshopPhotos.map((item) => ({
                id: String(item?.id ?? uid("pmedia")),
                owner: (item?.owner === "Supplier" || item?.owner === "Return") ? item.owner : "Workshop",
                kind: String(item?.kind ?? "Reference"),
                fileName: String(item?.fileName ?? "image.jpg"),
                previewDataUrl: String(item?.previewDataUrl ?? ""),
                addedAt: String(item?.addedAt ?? new Date().toISOString()),
                note: String(item?.note ?? ""),
                uploadedBy: String(item?.uploadedBy ?? record.requestedBy ?? "Workshop"),
            }))
            : [],
        bids: Array.isArray(record.bids)
            ? record.bids.map((bid) => ({
                ...bid,
                productPhotos: Array.isArray(bid?.productPhotos)
                    ? bid.productPhotos.map((item) => ({
                        id: String(item?.id ?? uid("pmedia")),
                        owner: "Supplier",
                        kind: String(item?.kind ?? "Supplier Item"),
                        fileName: String(item?.fileName ?? "image.jpg"),
                        previewDataUrl: String(item?.previewDataUrl ?? ""),
                        addedAt: String(item?.addedAt ?? bid?.createdAt ?? new Date().toISOString()),
                        note: String(item?.note ?? ""),
                        uploadedBy: String(item?.uploadedBy ?? bid?.supplierName ?? "Supplier"),
                    }))
                    : [],
                invoiceFileName: String(bid?.invoiceFileName ?? ""),
                shippingLabelFileName: String(bid?.shippingLabelFileName ?? ""),
                trackingNumber: String(bid?.trackingNumber ?? ""),
                courierName: String(bid?.courierName ?? ""),
                shippingNotes: String(bid?.shippingNotes ?? ""),
            }))
            : [],
        returnRecords: Array.isArray(record.returnRecords)
            ? record.returnRecords.map((entry) => ({
                id: String(entry?.id ?? uid("pret")),
                reason: String(entry?.reason ?? ""),
                notes: String(entry?.notes ?? ""),
                pictures: Array.isArray(entry?.pictures) ? entry.pictures.map((item) => ({
                    id: String(item?.id ?? uid("pmedia")),
                    owner: "Return",
                    kind: String(item?.kind ?? "Return"),
                    fileName: String(item?.fileName ?? "image.jpg"),
                    previewDataUrl: String(item?.previewDataUrl ?? ""),
                    addedAt: String(item?.addedAt ?? entry?.createdAt ?? new Date().toISOString()),
                    note: String(item?.note ?? ""),
                    uploadedBy: String(item?.uploadedBy ?? entry?.createdBy ?? "Workshop"),
                })) : [],
                createdAt: String(entry?.createdAt ?? new Date().toISOString()),
                createdBy: String(entry?.createdBy ?? record.requestedBy ?? "Workshop"),
                responseStatus: entry?.responseStatus === "Approved" || entry?.responseStatus === "Rejected" || entry?.responseStatus === "Replacement in Process" || entry?.responseStatus === "Refund in Process" ? entry.responseStatus : "Requested",
                responseNotes: String(entry?.responseNotes ?? ""),
                responsePictures: Array.isArray(entry?.responsePictures) ? entry.responsePictures.map((item) => ({
                    id: String(item?.id ?? uid("pmedia")),
                    owner: "Return",
                    kind: String(item?.kind ?? "Supplier Return Response"),
                    fileName: String(item?.fileName ?? "image.jpg"),
                    previewDataUrl: String(item?.previewDataUrl ?? ""),
                    addedAt: String(item?.addedAt ?? entry?.respondedAt ?? new Date().toISOString()),
                    note: String(item?.note ?? ""),
                    uploadedBy: String(item?.uploadedBy ?? entry?.respondedBy ?? "Supplier"),
                })) : [],
                respondedAt: entry?.respondedAt ? String(entry.respondedAt) : undefined,
                respondedBy: entry?.respondedBy ? String(entry.respondedBy) : undefined,
            }))
            : [],
    };
}
function migrateInvoiceRecord(record) {
    const totalAmount = (record.totalAmount ?? calculateInvoiceTotal(record.laborSubtotal ?? "", record.partsSubtotal ?? "", record.discountAmount ?? "")).toString();
    return {
        ...record,
        laborSubtotal: record.laborSubtotal ?? "",
        partsSubtotal: record.partsSubtotal ?? "",
        discountAmount: record.discountAmount ?? "",
        totalAmount,
        status: record.status ?? "Draft",
        paymentStatus: record.paymentStatus ?? "Unpaid",
        chargeAccountApproved: record.chargeAccountApproved ?? false,
        notes: record.notes ?? "",
        updatedAt: record.updatedAt ?? record.createdAt ?? new Date().toISOString(),
    };
}
function migratePaymentRecord(record) {
    return {
        ...record,
        amount: record.amount ?? "0",
        method: record.method ?? "Cash",
        referenceNumber: record.referenceNumber ?? "",
        notes: record.notes ?? "",
    };
}
function migrateBackjobRecord(record) {
    return {
        ...record,
        updatedAt: record.updatedAt ?? record.createdAt ?? new Date().toISOString(),
        originalInvoiceNumber: record.originalInvoiceNumber ?? "",
        comebackInvoiceNumber: record.comebackInvoiceNumber ?? "",
        originalPrimaryTechnicianId: record.originalPrimaryTechnicianId ?? "",
        comebackPrimaryTechnicianId: record.comebackPrimaryTechnicianId ?? "",
        supportingTechnicianIds: Array.isArray(record.supportingTechnicianIds)
            ? record.supportingTechnicianIds.map((item) => String(item))
            : [],
        findings: record.findings ?? "",
        actionTaken: record.actionTaken ?? "",
        status: record.status ?? "Open",
    };
}
function Card({ title, subtitle, right, children, }) {
    return (_jsxs("div", { style: styles.card, children: [_jsxs("div", { style: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.cardTitle, children: title }), subtitle ? _jsx("div", { style: styles.cardSubtitle, children: subtitle }) : null] }), right ? _jsx("div", { children: right }) : null] }), children] }));
}
function RoleBadge({ role }) {
    return (_jsx("span", { style: {
            ...styles.roleBadge,
            background: ROLE_COLORS[role].bg,
            color: ROLE_COLORS[role].text,
        }, children: role }));
}
function StatusBadge({ status }) {
    const map = {
        Draft: styles.statusNeutral,
        "Waiting Inspection": styles.statusInfo,
        "Converted to RO": styles.statusOk,
        Cancelled: styles.statusLocked,
    };
    return _jsx("span", { style: map[status], children: status });
}
function InspectionStatusBadge({ status }) {
    return _jsx("span", { style: getInspectionStatusStyle(status), children: status });
}
function ROStatusBadge({ status }) {
    return _jsx("span", { style: getROStatusStyle(status), children: status });
}
function WorkLineStatusBadge({ status }) {
    return _jsx("span", { style: getWorkLineStatusStyle(status), children: status });
}
function PermissionPill({ permission, checked, onToggle, disabled, }) {
    return (_jsxs("button", { type: "button", onClick: onToggle, disabled: disabled, style: {
            ...styles.permissionPill,
            ...(checked ? styles.permissionPillOn : styles.permissionPillOff),
            ...(disabled ? styles.permissionPillDisabled : {}),
        }, children: [checked ? "✓ " : "", permission] }));
}
function getUpcomingBookingDates(days = 14) {
    return Array.from({ length: days }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + index);
        return {
            value: date.toISOString().slice(0, 10),
            label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
        };
    });
}
function BookingCalendarPicker({ value, onChange, }) {
    const dates = useMemo(() => getUpcomingBookingDates(14), []);
    return (_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Calendar" }), _jsx("div", { style: styles.calendarStrip, children: dates.map((item) => (_jsxs("button", { type: "button", style: {
                        ...styles.calendarDateButton,
                        ...(value === item.value ? styles.calendarDateButtonActive : {}),
                    }, onClick: () => onChange(item.value), children: [_jsx("span", { style: styles.calendarWeekday, children: item.weekday }), _jsx("strong", { children: item.label })] }, item.value))) })] }));
}
function LoginScreen({ audience, setAudience, staffForm, setStaffForm, staffError, onStaffSubmit, customerForm, setCustomerForm, customerError, onCustomerSubmit, supplierForm, setSupplierForm, supplierError, onSupplierSubmit, publicBookingForm, setPublicBookingForm, publicBookingError, onPublicBookingSubmit, isPublicBookingSubmitting, onQuickStaffLogin, onLoadDemoData, onOpenDemoCustomerPortal, }) {
    const isStaff = audience === "staff";
    const isCustomer = audience === "customer";
    const isBooking = audience === "booking";
    return (_jsx("div", { style: styles.loginShell, children: _jsxs("div", { style: styles.loginPanel, children: [_jsxs("div", { style: styles.loginBrand, children: [_jsx("div", { style: styles.brandLogo, children: "DVI" }), _jsxs("div", { children: [_jsx("div", { style: styles.loginTitle, children: "Workshop Management App" }), _jsx("div", { style: styles.loginSubtitle, children: BUILD_VERSION })] })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: {
                                ...styles.secondaryButton,
                                ...(isStaff ? styles.portalTabActive : {}),
                            }, onClick: () => setAudience("staff"), children: "Staff Sign In" }), _jsx("button", { type: "button", style: {
                                ...styles.secondaryButton,
                                ...(isCustomer ? styles.portalTabActive : {}),
                            }, onClick: () => setAudience("customer"), children: "Customer Portal" }), _jsx("button", { type: "button", style: {
                                ...styles.secondaryButton,
                                ...(isBooking ? styles.portalTabActive : {}),
                            }, onClick: () => setAudience("booking"), children: "Book Service" }), _jsx("button", { type: "button", style: {
                                ...styles.secondaryButton,
                                ...(!isStaff && !isCustomer && !isBooking ? styles.portalTabActive : {}),
                            }, onClick: () => setAudience("supplier"), children: "Supplier Portal" })] }), _jsxs("div", { style: styles.buildNoteBox, children: [_jsx("div", { style: styles.buildNoteTitle, children: isStaff ? "Staff Access" : isCustomer ? "Customer Portal Access" : isBooking ? "Book Service" : "Supplier Portal Access" }), _jsx("div", { style: styles.buildNoteText, children: isStaff
                                ? "Continue using your staff account to manage intake, inspections, repair orders, parts, QC, release, and reporting."
                                : isCustomer
                                    ? "Customers can sign in using their phone number or email plus password to review jobs, track progress, approve work, and browse their vehicles."
                                    : isBooking
                                        ? "Use this public-facing service request page as a landing page so anyone can request an appointment without signing in first."
                                        : "Suppliers can enter their supplier name and submit bids into open parts requests without opening the staff dashboard." })] }), isStaff ? (_jsxs(_Fragment, { children: [_jsxs("form", { onSubmit: onStaffSubmit, style: styles.loginForm, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Username" }), _jsx("input", { style: styles.input, value: staffForm.username, onChange: (e) => setStaffForm((prev) => ({ ...prev, username: e.target.value })), autoComplete: "username", placeholder: "Enter username" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Password" }), _jsx("input", { style: styles.input, type: "password", value: staffForm.password, onChange: (e) => setStaffForm((prev) => ({ ...prev, password: e.target.value })), autoComplete: "current-password", placeholder: "Enter password" })] }), staffError ? _jsx("div", { style: styles.errorBox, children: staffError }) : null, _jsx("button", { type: "submit", style: styles.primaryButton, children: "Sign In" })] }), _jsxs("div", { style: styles.updateNoteBox, children: [_jsx("div", { style: styles.updateNoteTitle, children: "Latest Build Update" }), _jsx("div", { style: styles.updateNoteText, children: "Phase 17K.1 refines the Inspection module with cleaner navigation, faster encoding cues, stronger edit visibility, and a clearer action layout while preserving the current full system branch." })] }), _jsxs("div", { style: styles.demoBox, children: [_jsx("div", { style: styles.demoTitle, children: "Quick Demo Access" }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: onOpenDemoCustomerPortal, children: "Open Demo Customer Portal" }), _jsx("button", { type: "button", style: styles.smallButton, onClick: onLoadDemoData, children: "Load Simulated Data" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => onQuickStaffLogin("admin"), children: "Admin" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => onQuickStaffLogin("advisor"), children: "Advisor" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => onQuickStaffLogin("chieftech"), children: "Chief Tech" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => onQuickStaffLogin("senior"), children: "Senior" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => onQuickStaffLogin("mechanic"), children: "Mechanic" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => onQuickStaffLogin("office"), children: "Office" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => onQuickStaffLogin("reception"), children: "Reception" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => onQuickStaffLogin("ojt"), children: "OJT" })] }), _jsxs("div", { style: styles.demoGrid, children: [_jsx("div", { children: "Admin instantly opens full access for testing." }), _jsx("div", { children: "Load Simulated Data seeds intake, inspection, RO, approval, parts, invoice, payment, QC, release, and work-log records." }), _jsx("div", { children: "Quick buttons still use your real in-app roles and permissions." })] })] })] })) : isCustomer ? (_jsxs(_Fragment, { children: [_jsxs("form", { onSubmit: onCustomerSubmit, style: styles.loginForm, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Phone or Email" }), _jsx("input", { style: styles.input, value: customerForm.identifier, onChange: (e) => setCustomerForm((prev) => ({ ...prev, identifier: e.target.value })), autoComplete: "username", placeholder: "Enter phone number or email" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Password" }), _jsx("input", { style: styles.input, type: "password", value: customerForm.password, onChange: (e) => setCustomerForm((prev) => ({ ...prev, password: e.target.value })), autoComplete: "current-password", placeholder: "Enter portal password" })] }), customerError ? _jsx("div", { style: styles.errorBox, children: customerError }) : null, _jsx("button", { type: "submit", style: styles.primaryButton, children: "Open Portal" })] }), _jsxs("div", { style: styles.demoBox, children: [_jsx("div", { style: styles.demoTitle, children: "Portal Starter Note" }), _jsxs("div", { style: styles.demoGrid, children: [_jsx("div", { children: "Customer accounts are generated from intake and repair-order records." }), _jsx("div", { children: "Default portal password uses the last 4 digits of the customer phone number." }), _jsx("div", { children: "Sample portal login: Miguel Santos  -  09171234567 / 4567" }), _jsx("div", { children: "Sample portal login: Andrea Lim  -  fleet@primemovers.example.com / 6543" }), _jsx("div", { children: "Customers can review active jobs, see approval items, track progress, and browse their vehicles." })] })] })] })) : isBooking ? (_jsxs(_Fragment, { children: [_jsxs("form", { onSubmit: onPublicBookingSubmit, style: styles.loginForm, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Customer Name" }), _jsx("input", { style: styles.input, value: publicBookingForm.customerName, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, customerName: e.target.value })), placeholder: "Enter full name" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Phone" }), _jsx("input", { style: styles.input, value: publicBookingForm.phone, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, phone: e.target.value })), placeholder: "Enter phone number" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Email" }), _jsx("input", { style: styles.input, value: publicBookingForm.email, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, email: e.target.value })), placeholder: "Enter email" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Plate Number" }), _jsx("input", { style: styles.input, value: publicBookingForm.plateNumber, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, plateNumber: e.target.value.toUpperCase() })), placeholder: "ABC-1234" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Make" }), _jsx("input", { style: styles.input, value: publicBookingForm.make, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, make: e.target.value })), placeholder: "Toyota" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Model" }), _jsx("input", { style: styles.input, value: publicBookingForm.model, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, model: e.target.value })), placeholder: "Fortuner" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Year" }), _jsx("input", { style: styles.input, value: publicBookingForm.year, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, year: e.target.value })), placeholder: "2021" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Preferred Date" }), _jsx("input", { type: "date", style: styles.input, value: publicBookingForm.requestedDate, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, requestedDate: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Preferred Time" }), _jsx("input", { type: "time", style: styles.input, value: publicBookingForm.requestedTime, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, requestedTime: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Service Type" }), _jsx("select", { style: styles.select, value: publicBookingForm.serviceType, onChange: (e) => setPublicBookingForm((prev) => {
                                                const nextType = e.target.value;
                                                return {
                                                    ...prev,
                                                    serviceType: nextType,
                                                    serviceDetail: getBookingServiceDetailOptions(nextType)[0],
                                                };
                                            }), children: BOOKING_SERVICE_OPTIONS.map((type) => (_jsx("option", { value: type, children: type }, type))) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Service Detail" }), _jsx("select", { style: styles.select, value: publicBookingForm.serviceDetail, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, serviceDetail: e.target.value })), children: getBookingServiceDetailOptions(publicBookingForm.serviceType).map((detail) => (_jsx("option", { value: detail, children: detail }, detail))) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Concern / Requested Service" }), _jsx("textarea", { style: styles.textarea, value: publicBookingForm.concern, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, concern: e.target.value })), placeholder: "Describe the service request" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Notes" }), _jsx("textarea", { style: styles.textarea, value: publicBookingForm.notes, onChange: (e) => setPublicBookingForm((prev) => ({ ...prev, notes: e.target.value })), placeholder: "Optional notes" })] }), publicBookingError ? _jsx("div", { style: styles.errorBox, children: publicBookingError }) : null, _jsx("button", { type: "submit", style: styles.primaryButton, disabled: isPublicBookingSubmitting, children: "Submit Public Booking" })] }), _jsxs("div", { style: styles.demoBox, children: [_jsx("div", { style: styles.demoTitle, children: "Public Booking Landing Page" }), _jsxs("div", { style: styles.demoGrid, children: [_jsx("div", { children: "This tab works without customer login and can be used as a public-facing landing page." }), _jsx("div", { children: "Each submission creates a booking record inside the Bookings module for staff follow-up." }), _jsx("div", { children: "The calendar strip helps customers pick an upcoming date faster on mobile." })] })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("form", { onSubmit: onSupplierSubmit, style: styles.loginForm, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Supplier Name" }), _jsx("input", { style: styles.input, value: supplierForm.supplierName, onChange: (e) => setSupplierForm({ supplierName: e.target.value }), placeholder: "Enter supplier name" })] }), supplierError ? _jsx("div", { style: styles.errorBox, children: supplierError }) : null, _jsx("button", { type: "submit", style: styles.primaryButton, children: "Open Supplier Portal" })] }), _jsxs("div", { style: styles.demoBox, children: [_jsx("div", { style: styles.demoTitle, children: "Supplier Portal Note" }), _jsxs("div", { style: styles.demoGrid, children: [_jsx("div", { children: "Open requests come from the same internal Parts module." }), _jsx("div", { children: "Bids submitted here are added directly to the matching request record." }), _jsx("div", { children: "Staff can still privately compare bids and choose the winning supplier internally." })] })] })] }))] }) }));
}
function CustomerPortalPage({ customer, repairOrders, setRepairOrders, approvalLinkTokens, intakeRecords, inspectionRecords, qcRecords, releaseRecords, approvalRecords, backjobRecords, invoiceRecords, paymentRecords, bookings, setBookings, customerAccounts, setCustomerAccounts, setCustomerSession, onLogout, isCompactLayout, isDemoMode, portalLaunchView, sharedLinkRoId, sharedLinkMode, }) {
    const [portalView, setPortalView] = useState(portalLaunchView ?? "dashboard");
    const [selectedVehicleKey, setSelectedVehicleKey] = useState("");
    const customerLinkedPlateNumbers = Array.isArray(customer.linkedPlateNumbers) ? customer.linkedPlateNumbers : [];
    const customerLinkedRoIds = Array.isArray(customer.linkedRoIds) ? customer.linkedRoIds : [];
    const customerPhone = sanitizePhone(customer.phone || "");
    const customerEmail = (customer.email || "").trim().toLowerCase();
    const linkedRepairOrders = useMemo(() => {
        const linkedPlates = new Set(customerLinkedPlateNumbers);
        const linkedRoIds = new Set(customerLinkedRoIds);
        return repairOrders.filter((row) => {
            const rowPhone = sanitizePhone(row.phone || "");
            const rowEmail = (row.email || "").trim().toLowerCase();
            const rowPlate = row.plateNumber || row.conductionNumber || "";
            return (linkedRoIds.has(row.id) ||
                linkedPlates.has(rowPlate) ||
                (!!customerPhone && rowPhone === customerPhone) ||
                (!!customerEmail && rowEmail === customerEmail));
        });
    }, [customerLinkedPlateNumbers, customerLinkedRoIds, repairOrders, customerPhone, customerEmail]);
    const linkedVehicleKeys = useMemo(() => {
        const keys = new Set();
        customerLinkedPlateNumbers.forEach((plate) => {
            keys.add(normalizeVehicleKey(plate, ""));
        });
        intakeRecords.forEach((row) => {
            const rowPhone = sanitizePhone(row.phone || "");
            const rowEmail = (row.email || "").trim().toLowerCase();
            if ((!!customerPhone && rowPhone === customerPhone) ||
                (!!customerEmail && rowEmail === customerEmail)) {
                keys.add(normalizeVehicleKey(row.plateNumber, row.conductionNumber));
            }
        });
        linkedRepairOrders.forEach((row) => {
            keys.add(normalizeVehicleKey(row.plateNumber, row.conductionNumber));
        });
        return keys;
    }, [customerLinkedPlateNumbers, intakeRecords, linkedRepairOrders, customerPhone, customerEmail]);
    const portalVehicleGroups = useMemo(() => {
        const groups = buildVehicleHistoryGroups({
            intakeRecords,
            inspectionRecords,
            repairOrders,
            qcRecords,
            releaseRecords,
            approvalRecords,
            backjobRecords,
            invoiceRecords,
            paymentRecords,
        });
        const filtered = groups.filter((group) => linkedVehicleKeys.has(group.vehicleKey));
        const existingKeys = new Set(filtered.map((group) => group.vehicleKey));
        Array.from(linkedVehicleKeys).forEach((key) => {
            if (existingKeys.has(key))
                return;
            filtered.push({
                vehicleKey: key,
                plateNumber: customerLinkedPlateNumbers.find((item) => normalizeVehicleKey(item, "") === key) || "",
                conductionNumber: "",
                vehicleLabel: "Customer-added vehicle",
                latestOdometerKm: "",
                lastVisitAt: "",
                totalVisits: 0,
                activeJobCount: 0,
                rows: [],
            });
        });
        return filtered.sort((a, b) => (b.lastVisitAt || "").localeCompare(a.lastVisitAt || ""));
    }, [
        intakeRecords,
        inspectionRecords,
        repairOrders,
        qcRecords,
        releaseRecords,
        approvalRecords,
        backjobRecords,
        invoiceRecords,
        paymentRecords,
        linkedVehicleKeys,
    ]);
    const selectedVehicleGroup = portalVehicleGroups.find((group) => group.vehicleKey === selectedVehicleKey) ??
        portalVehicleGroups[0] ??
        null;
    useEffect(() => {
        if (!selectedVehicleGroup)
            return;
        if (selectedVehicleKey !== selectedVehicleGroup.vehicleKey) {
            setSelectedVehicleKey(selectedVehicleGroup.vehicleKey);
        }
    }, [selectedVehicleGroup, selectedVehicleKey]);
    useEffect(() => {
        if (portalLaunchView) {
            setPortalView(portalLaunchView);
        }
    }, [portalLaunchView]);
    const pendingApprovalCount = linkedRepairOrders.reduce((sum, row) => sum + row.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending").length, 0);
    const activeJobCount = linkedRepairOrders.filter((row) => !["Released", "Closed"].includes(row.status)).length;
    const releasedJobCount = linkedRepairOrders.filter((row) => ["Released", "Closed"].includes(row.status)).length;
    const portalInspectionRows = useMemo(() => {
        const seenInspectionIds = new Set();
        const rows = [];
        linkedRepairOrders.forEach((row) => {
            const inspection = inspectionRecords.find((r) => r.id === row.inspectionId || r.intakeId === row.intakeId) ?? null;
            if (!inspection || seenInspectionIds.has(inspection.id))
                return;
            seenInspectionIds.add(inspection.id);
            rows.push({ row, inspection });
        });
        return rows;
    }, [inspectionRecords, linkedRepairOrders]);
    const approvalReviewRows = useMemo(() => portalInspectionRows.map(({ row, inspection }) => ({
        row,
        inspection,
        sections: buildCustomerInspectionSections(inspection),
        mediaGroups: groupInspectionMediaBySection(inspection.evidenceItems ?? []),
    })), [portalInspectionRows]);
    const displayedApprovalReviewRows = useMemo(() => {
        if (!sharedLinkRoId)
            return approvalReviewRows;
        return [...approvalReviewRows].sort((a, b) => {
            if (a.row.id === sharedLinkRoId)
                return -1;
            if (b.row.id === sharedLinkRoId)
                return 1;
            return a.row.roNumber.localeCompare(b.row.roNumber);
        });
    }, [approvalReviewRows, sharedLinkRoId]);
    const activePortalLinks = approvalLinkTokens.filter((row) => row.customerId === customer.id && isApprovalLinkActive(row)).length;
    const [bookingForm, setBookingForm] = useState(() => getDefaultBookingForm(customer.fullName));
    const [bookingError, setBookingError] = useState("");
    const [portalVehicleForm, setPortalVehicleForm] = useState({
        plateNumber: "",
        conductionNumber: "",
        make: "",
        model: "",
        year: "",
    });
    const [portalVehicleError, setPortalVehicleError] = useState("");
    const [isSubmittingPortalBooking, setIsSubmittingPortalBooking] = useState(false);
    const [isSavingPortalVehicle, setIsSavingPortalVehicle] = useState(false);
    const customerBookings = useMemo(() => {
        return bookings
            .filter((row) => {
            const rowPhone = sanitizePhone(row.phone || "");
            const rowEmail = (row.email || "").trim().toLowerCase();
            const rowVehicleKey = normalizeVehicleKey(row.plateNumber, row.conductionNumber);
            return (row.linkedCustomerId === customer.id ||
                (!!customerPhone && rowPhone === customerPhone) ||
                (!!customerEmail && rowEmail === customerEmail) ||
                linkedVehicleKeys.has(rowVehicleKey));
        })
            .sort((a, b) => (b.requestedDate + b.requestedTime).localeCompare(a.requestedDate + a.requestedTime));
    }, [bookings, customer.id, customerPhone, customerEmail, linkedVehicleKeys]);
    const submitPortalBooking = (e) => {
        e.preventDefault();
        if (isSubmittingPortalBooking)
            return;
        setIsSubmittingPortalBooking(true);
        try {
            const isNewVehicle = selectedVehicleKey === "__new__";
            const vehicleGroup = !isNewVehicle
                ? portalVehicleGroups.find((group) => group.vehicleKey === selectedVehicleKey) ?? portalVehicleGroups[0] ?? null
                : null;
            const concern = bookingForm.concern.trim();
            const plateNumber = isNewVehicle ? bookingForm.plateNumber.trim() : vehicleGroup?.plateNumber || "";
            const conductionNumber = isNewVehicle ? bookingForm.conductionNumber.trim() : vehicleGroup?.conductionNumber || "";
            const make = isNewVehicle ? bookingForm.make.trim() : (vehicleGroup?.vehicleLabel.split(" ")[0] || "");
            const model = isNewVehicle ? bookingForm.model.trim() : (vehicleGroup?.vehicleLabel.split(" ").slice(1).join(" ") || "");
            const year = isNewVehicle ? bookingForm.year.trim() : "";
            if (!vehicleGroup && !isNewVehicle) {
                setBookingError("No linked vehicle available for booking.");
                return;
            }
            if (isNewVehicle && !plateNumber && !conductionNumber) {
                setBookingError("Enter plate number or conduction number for the new vehicle.");
                return;
            }
            if (isNewVehicle && (!make || !model)) {
                setBookingError("Enter make and model for the new vehicle.");
                return;
            }
            if (!bookingForm.requestedDate || !bookingForm.requestedTime || !concern) {
                setBookingError("Preferred date, time, and service request are required.");
                return;
            }
            const newBooking = {
                id: uid("book"),
                bookingNumber: nextDailyNumber("BKG"),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                requestedDate: bookingForm.requestedDate,
                requestedTime: bookingForm.requestedTime,
                customerName: customer.fullName,
                companyName: "",
                accountType: "Personal",
                phone: customer.phone,
                email: customer.email,
                plateNumber,
                conductionNumber,
                make,
                model,
                year,
                serviceType: bookingForm.serviceType,
                serviceDetail: bookingForm.serviceDetail,
                concern,
                notes: bookingForm.notes.trim(),
                status: "New",
                source: "Customer Portal",
                createdBy: customer.fullName,
                linkedCustomerId: customer.id,
            };
            setBookings((prev) => [newBooking, ...prev]);
            if (isNewVehicle) {
                const identifierValue = plateNumber || conductionNumber;
                const now = new Date().toISOString();
                const updateAccount = (account) => ({
                    ...account,
                    linkedPlateNumbers: mergeUniqueStrings([...(account.linkedPlateNumbers || []), identifierValue]),
                    updatedAt: now,
                });
                setCustomerAccounts((prev) => prev.map((account) => (account.id === customer.id ? updateAccount(account) : account)));
                setCustomerSession((prev) => (prev && prev.id === customer.id ? updateAccount(prev) : prev));
                setSelectedVehicleKey(normalizeVehicleKey(plateNumber, conductionNumber));
            }
            setBookingForm((prev) => ({ ...getDefaultBookingForm(customer.fullName), requestedDate: prev.requestedDate, requestedTime: prev.requestedTime }));
            setBookingError("");
            setPortalView("bookings");
        }
        finally {
            setIsSubmittingPortalBooking(false);
        }
    };
    const handleAddPortalVehicle = (e) => {
        e.preventDefault();
        if (isSavingPortalVehicle)
            return;
        setIsSavingPortalVehicle(true);
        try {
            const identifier = portalVehicleForm.plateNumber.trim() || portalVehicleForm.conductionNumber.trim();
            if (!identifier) {
                setPortalVehicleError("Plate number or conduction number is required.");
                return;
            }
            if (!portalVehicleForm.make.trim() || !portalVehicleForm.model.trim()) {
                setPortalVehicleError("Make and model are required.");
                return;
            }
            const vehicleKey = normalizeVehicleKey(portalVehicleForm.plateNumber, portalVehicleForm.conductionNumber);
            const identifierValue = portalVehicleForm.plateNumber.trim() || portalVehicleForm.conductionNumber.trim();
            const now = new Date().toISOString();
            const updateAccount = (account) => ({
                ...account,
                linkedPlateNumbers: mergeUniqueStrings([...(account.linkedPlateNumbers || []), identifierValue]),
                updatedAt: now,
            });
            setCustomerAccounts((prev) => prev.map((account) => (account.id === customer.id ? updateAccount(account) : account)));
            setCustomerSession((prev) => (prev && prev.id === customer.id ? updateAccount(prev) : prev));
            setPortalVehicleForm({
                plateNumber: "",
                conductionNumber: "",
                make: "",
                model: "",
                year: "",
            });
            setPortalVehicleError("");
            setSelectedVehicleKey(vehicleKey);
        }
        finally {
            setIsSavingPortalVehicle(false);
        }
    };
    const setCustomerDecision = (roId, lineId, decision) => {
        const now = new Date().toISOString();
        setRepairOrders((prev) => prev.map((row) => {
            if (row.id !== roId)
                return row;
            const nextWorkLines = row.workLines.map((line) => line.id === lineId ? { ...line, approvalDecision: decision, approvalAt: now } : line);
            const hasPending = nextWorkLines.some((line) => (line.approvalDecision ?? "Pending") === "Pending");
            const hasApproved = nextWorkLines.some((line) => line.approvalDecision === "Approved");
            const nextStatus = row.status === "Waiting Approval" || row.status === "Approved / Ready to Work"
                ? hasPending
                    ? "Waiting Approval"
                    : hasApproved
                        ? "Approved / Ready to Work"
                        : "Waiting Approval"
                : row.status;
            return {
                ...row,
                workLines: nextWorkLines,
                status: nextStatus,
                updatedAt: now,
            };
        }));
    };
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: globalCss }), _jsx("div", { style: styles.appShell, children: _jsxs("div", { style: styles.mainArea, children: [_jsxs("header", { style: styles.topBar, children: [_jsx("div", { style: styles.topBarLeft, children: _jsxs("div", { children: [_jsx("div", { style: styles.pageTitle, children: "Customer Portal" }), _jsx("div", { style: styles.pageSubtitle, children: BUILD_VERSION })] }) }), _jsxs("div", { style: styles.topBarRight, children: [isDemoMode ? _jsx("span", { style: styles.statusWarning, children: "Demo Mode" }) : null, sharedLinkMode ? _jsx("span", { style: styles.statusInfo, children: "Customer View" }) : null, _jsxs("span", { style: styles.statusInfo, children: ["Pending approvals: ", pendingApprovalCount, "  |  Active links: ", activePortalLinks] }), _jsx("div", { style: styles.topBarName, children: customer.fullName }), _jsx("button", { type: "button", onClick: onLogout, style: styles.logoutButtonCompact, children: "Sign Out" })] })] }), _jsxs("main", { style: styles.mainContent, children: [_jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(portalView === "dashboard" ? styles.portalTabActive : {}) }, onClick: () => setPortalView("dashboard"), children: "Dashboard" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(portalView === "jobs" ? styles.portalTabActive : {}) }, onClick: () => setPortalView("jobs"), children: "Jobs" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(portalView === "approvals" ? styles.portalTabActive : {}) }, onClick: () => setPortalView("approvals"), children: "Approvals" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(portalView === "inspection" ? styles.portalTabActive : {}) }, onClick: () => setPortalView("inspection"), children: "Inspection Report" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(portalView === "myVehicles" ? styles.portalTabActive : {}) }, onClick: () => setPortalView("myVehicles"), children: "My Vehicles" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(portalView === "bookings" ? styles.portalTabActive : {}) }, onClick: () => setPortalView("bookings"), children: "Book Service" })] }), _jsxs("div", { style: styles.portalHeroCard, children: [_jsxs("div", { style: styles.portalHeroTitle, children: ["Welcome back, ", customer.fullName] }), _jsx("div", { style: styles.portalHeroText, children: "Review current repair orders, inspect approval items, and browse the full history of every linked vehicle from one customer portal." })] }), portalView === "dashboard" ? (_jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: isCompactLayout ? "span 12" : "span 3" }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Active Jobs" }), _jsx("div", { style: styles.statValue, children: activeJobCount }), _jsx("div", { style: styles.statNote, children: "Jobs still being worked on or awaiting next action" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: isCompactLayout ? "span 12" : "span 3" }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Pending Approvals" }), _jsx("div", { style: styles.statValue, children: pendingApprovalCount }), _jsx("div", { style: styles.statNote, children: "Recommended items that still need your decision" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: isCompactLayout ? "span 12" : "span 3" }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Completed Jobs" }), _jsx("div", { style: styles.statValue, children: releasedJobCount }), _jsx("div", { style: styles.statNote, children: "Finished jobs already handed over or closed" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: isCompactLayout ? "span 12" : "span 3" }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "My Vehicles" }), _jsx("div", { style: styles.statValue, children: portalVehicleGroups.length }), _jsx("div", { style: styles.statNote, children: "Vehicles linked to this customer account" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Your Account", subtitle: "Cleaner customer-facing view of linked vehicles, open jobs, approvals, and portal access", children: _jsxs("div", { style: styles.quickAccessList, children: [_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Name" }), _jsx("strong", { children: customer.fullName })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Phone" }), _jsx("strong", { children: customer.phone || "-" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Email" }), _jsx("strong", { children: customer.email || "-" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Vehicles" }), _jsx("strong", { children: customerLinkedPlateNumbers.join(", ") || portalVehicleGroups.map((group) => group.plateNumber || group.conductionNumber).filter(Boolean).join(", ") || "-" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Open Jobs" }), _jsx("strong", { children: activeJobCount })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Pending Decisions" }), _jsx("strong", { children: pendingApprovalCount })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "SMS Approval Links" }), _jsx("strong", { children: activePortalLinks })] })] }) }) })] })) : portalView === "jobs" ? (_jsx("div", { style: styles.mobileCardList, children: linkedRepairOrders.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No repair orders linked to this portal account yet." })) : (linkedRepairOrders.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.roNumber }), _jsx(ROStatusBadge, { status: row.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: [row.make, row.model, row.year].filter(Boolean).join(" ") || "-" }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["Advisor: ", row.advisorName || "-"] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Approval Snapshot" }), _jsxs("strong", { children: [row.workLines.filter((line) => line.approvalDecision === "Approved").length, " approved  |  ", row.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending").length, " pending"] })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Concern" }), _jsx("strong", { children: row.customerConcern || "-" })] }), _jsx("div", { style: styles.quickAccessList, children: row.workLines.map((line) => (_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: line.customerDescription || line.title || "Work Item" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(line.totalEstimate)) })] }, line.id))) })] }, row.id)))) })) : portalView === "inspection" ? (_jsxs("div", { style: styles.mobileCardList, children: [_jsxs("div", { style: { ...styles.sectionCardMuted, marginBottom: 8 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Condition Legend" }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }, children: [_jsx("span", { style: { background: "#dcfce7", color: "#15803d", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }, children: "Good" }), _jsx("span", { style: { background: "#fef3c7", color: "#b45309", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }, children: "Needs Attention" }), _jsx("span", { style: { background: "#fee2e2", color: "#b91c1c", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }, children: "Critical" })] })] }), portalInspectionRows.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No inspection records available." })) : (portalInspectionRows.map(({ row, inspection }) => {
                                            const sections = buildCustomerInspectionSections(inspection);
                                            const totals = sections.flatMap((section) => section.findings).reduce((acc, finding) => {
                                                acc[finding.status] += 1;
                                                return acc;
                                            }, { Good: 0, "Needs Attention": 0, Critical: 0 });
                                            const mediaGroups = groupInspectionMediaBySection(inspection.evidenceItems ?? []);
                                            const mediaCount = mediaGroups.reduce((sum, group) => sum + group.media.length, 0);
                                            return (_jsxs("div", { style: { ...styles.mobileDataCard, padding: 0, overflow: "hidden" }, children: [_jsxs("div", { style: { background: "#1e293b", padding: "12px 14px" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }, children: [_jsx("strong", { style: { color: "#f8fafc", fontSize: 15 }, children: inspection.inspectionNumber }), _jsx("span", { style: getInspectionStatusStyle(inspection.status), children: inspection.status })] }), _jsxs("div", { style: { color: "#94a3b8", fontSize: 13, marginTop: 2 }, children: [row.roNumber, "  |  ", inspection.accountLabel] }), _jsxs("div", { style: { color: "#64748b", fontSize: 12 }, children: [inspection.plateNumber || inspection.conductionNumber || "-", "  |  ", [inspection.make, inspection.model, inspection.year].filter(Boolean).join(" ") || "-"] }), _jsxs("div", { style: { color: "#94a3b8", fontSize: 12 }, children: ["Created ", formatDateTime(inspection.createdAt), "  |  Updated ", formatDateTime(inspection.updatedAt)] })] }), _jsxs("div", { style: { padding: "12px 14px" }, children: [_jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }, children: [_jsxs("div", { style: { background: "#dcfce7", borderRadius: 6, padding: "8px 10px", textAlign: "center" }, children: [_jsx("div", { style: { fontSize: 20, fontWeight: 700, color: "#15803d" }, children: totals.Good }), _jsx("div", { style: { fontSize: 11, color: "#15803d" }, children: "Good" })] }), _jsxs("div", { style: { background: "#fef3c7", borderRadius: 6, padding: "8px 10px", textAlign: "center" }, children: [_jsx("div", { style: { fontSize: 20, fontWeight: 700, color: "#b45309" }, children: totals["Needs Attention"] }), _jsx("div", { style: { fontSize: 11, color: "#b45309" }, children: "Needs Attention" })] }), _jsxs("div", { style: { background: "#fee2e2", borderRadius: 6, padding: "8px 10px", textAlign: "center" }, children: [_jsx("div", { style: { fontSize: 20, fontWeight: 700, color: "#b91c1c" }, children: totals.Critical }), _jsx("div", { style: { fontSize: 11, color: "#b91c1c" }, children: "Critical" })] }), _jsxs("div", { style: { background: "#e2e8f0", borderRadius: 6, padding: "8px 10px", textAlign: "center" }, children: [_jsx("div", { style: { fontSize: 20, fontWeight: 700, color: "#334155" }, children: mediaCount }), _jsx("div", { style: { fontSize: 11, color: "#334155" }, children: "Media" })] })] }), sections.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No inspection findings recorded." })) : (sections.map((section) => (_jsxs("div", { style: { marginBottom: 14 }, children: [_jsxs("div", { style: { fontWeight: 600, fontSize: 13, color: "#334155", borderBottom: "1px solid #e2e8f0", paddingBottom: 4, marginBottom: 8 }, children: [section.label, " ", _jsxs("span", { style: { fontWeight: 400, color: "#94a3b8", fontSize: 12 }, children: ["(", section.findings.length, ")"] })] }), section.note ? _jsx("div", { style: styles.concernCard, children: section.note }) : null, _jsx("div", { style: styles.formStack, children: section.findings.map((finding, findingIndex) => (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }, children: [_jsx("strong", { style: { fontSize: 14 }, children: finding.title }), _jsx("span", { style: getCustomerInspectionStatusStyle(finding.status), children: finding.status })] }), finding.note ? _jsx("div", { style: { fontSize: 13, color: "#475569", marginTop: 4 }, children: finding.note }) : null] }, `${section.label}_${finding.title}_${findingIndex}`))) })] }, section.label)))), mediaGroups.length > 0 ? (_jsxs("div", { style: { marginTop: 12 }, children: [_jsxs("div", { style: { fontWeight: 600, fontSize: 13, color: "#334155", borderBottom: "1px solid #e2e8f0", paddingBottom: 4, marginBottom: 8 }, children: ["Photos / Videos (", mediaCount, ")"] }), _jsx("div", { style: styles.formStack, children: mediaGroups.map(({ section, media }) => (_jsxs("div", { children: [_jsxs("div", { style: { fontWeight: 600, fontSize: 13, color: "#334155", marginBottom: 6 }, children: [section, " (", media.length, ")"] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }, children: media.map((item) => (_jsxs("div", { style: { borderRadius: 6, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff" }, children: [item.previewDataUrl && item.type === "Photo" ? (_jsx("img", { src: item.previewDataUrl, alt: item.itemLabel || item.section || "Inspection photo", style: { width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" } })) : item.previewDataUrl && item.type === "Video" ? (_jsx("video", { src: item.previewDataUrl, controls: true, style: { width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", background: "#0f172a" } })) : (_jsxs("div", { style: { minHeight: 92, padding: "10px 8px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, background: "#f8fafc" }, children: [_jsx("strong", { style: { fontSize: 12, color: "#0f172a" }, children: item.type }), _jsx("span", { style: { fontSize: 11, color: "#64748b" }, children: item.fileName })] })), _jsx("div", { style: { padding: "4px 6px", fontSize: 10, color: "#64748b", background: "#f8fafc" }, children: item.itemLabel || item.section || item.fileName })] }, item.id))) })] }, section))) })] })) : null] })] }, inspection.id));
                                        }))] })) : portalView === "bookings" ? (_jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsx(Card, { title: "My Booking Requests", subtitle: "Track customer-submitted service requests and appointment status", children: customerBookings.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No booking requests yet." })) : (_jsx("div", { style: styles.mobileCardList, children: customerBookings.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.bookingNumber }), _jsx("span", { style: getBookingStatusStyle(row.status), children: row.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsxs("div", { style: styles.mobileDataSecondary, children: [row.serviceType, "  |  ", row.serviceDetail || "-", "  |  ", row.requestedDate, " ", row.requestedTime] }), _jsx("div", { style: styles.formHint, children: row.concern || row.notes || "Booking request" })] }, row.id))) })) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsx(Card, { title: "Request New Appointment", subtitle: "Choose one of your vehicles and send a booking request to the shop", children: _jsxs("form", { onSubmit: submitPortalBooking, style: styles.formStack, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Vehicle" }), _jsxs("select", { style: styles.select, value: selectedVehicleKey, onChange: (e) => setSelectedVehicleKey(e.target.value), children: [portalVehicleGroups.map((group) => (_jsxs("option", { value: group.vehicleKey, children: [group.plateNumber || group.conductionNumber || "No plate", "  |  ", group.vehicleLabel] }, group.vehicleKey))), _jsx("option", { value: "__new__", children: "+ Add New Vehicle for This Booking" })] })] }), selectedVehicleKey === "__new__" ? (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "New Vehicle Details" }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Plate Number" }), _jsx("input", { style: styles.input, value: bookingForm.plateNumber, onChange: (e) => setBookingForm((prev) => ({ ...prev, plateNumber: e.target.value })), placeholder: "ABC-1234" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Conduction Number" }), _jsx("input", { style: styles.input, value: bookingForm.conductionNumber, onChange: (e) => setBookingForm((prev) => ({ ...prev, conductionNumber: e.target.value })), placeholder: "Use if no plate yet" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Make" }), _jsx("input", { style: styles.input, value: bookingForm.make, onChange: (e) => setBookingForm((prev) => ({ ...prev, make: e.target.value })), placeholder: "Toyota" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Model" }), _jsx("input", { style: styles.input, value: bookingForm.model, onChange: (e) => setBookingForm((prev) => ({ ...prev, model: e.target.value })), placeholder: "Fortuner" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Year" }), _jsx("input", { style: styles.input, value: bookingForm.year, onChange: (e) => setBookingForm((prev) => ({ ...prev, year: e.target.value })), placeholder: "2021" })] })] })] })) : null, _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Preferred Date" }), _jsx("input", { type: "date", style: styles.input, value: bookingForm.requestedDate, onChange: (e) => setBookingForm((prev) => ({ ...prev, requestedDate: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Preferred Time" }), _jsx("input", { type: "time", style: styles.input, value: bookingForm.requestedTime, onChange: (e) => setBookingForm((prev) => ({ ...prev, requestedTime: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Service Type" }), _jsx("select", { style: styles.select, value: bookingForm.serviceType, onChange: (e) => setBookingForm((prev) => {
                                                                                const nextType = e.target.value;
                                                                                return {
                                                                                    ...prev,
                                                                                    serviceType: nextType,
                                                                                    serviceDetail: getBookingServiceDetailOptions(nextType)[0],
                                                                                };
                                                                            }), children: BOOKING_SERVICE_OPTIONS.map((type) => (_jsx("option", { value: type, children: type }, type))) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Service Detail" }), _jsx("select", { style: styles.select, value: bookingForm.serviceDetail, onChange: (e) => setBookingForm((prev) => ({ ...prev, serviceDetail: e.target.value })), children: getBookingServiceDetailOptions(bookingForm.serviceType).map((detail) => (_jsx("option", { value: detail, children: detail }, detail))) })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Concern / Request" }), _jsx("textarea", { style: styles.textarea, value: bookingForm.concern, onChange: (e) => setBookingForm((prev) => ({ ...prev, concern: e.target.value })), placeholder: "Describe the service request" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Notes" }), _jsx("textarea", { style: styles.textarea, value: bookingForm.notes, onChange: (e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value })), placeholder: "Optional notes" })] }), bookingError ? _jsx("div", { style: styles.errorBox, children: bookingError }) : null, _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "submit", style: styles.primaryButton, disabled: isSubmittingPortalBooking, children: "Submit Booking Request" }) })] }) }) })] })) : portalView === "approvals" ? (_jsxs("div", { style: styles.mobileCardList, children: [_jsxs("div", { style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "Customer Approval Review" }), _jsx("div", { style: styles.formHint, children: "Review the inspection findings by category, then approve, defer, or decline the linked recommendations for each repair order." }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }, children: [_jsx("span", { style: { background: "#dcfce7", color: "#15803d", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }, children: "Good" }), _jsx("span", { style: { background: "#fef3c7", color: "#b45309", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }, children: "Needs Attention" }), _jsx("span", { style: { background: "#fee2e2", color: "#b91c1c", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }, children: "Critical" })] })] }), sharedLinkRoId ? (_jsxs("div", { style: { ...styles.sectionCardMuted, marginBottom: 8 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Shared Approval Link" }), _jsx("div", { style: styles.formHint, children: "This is a simulated customer-facing approval link opened from the staff app for internal demo testing." }), _jsxs("div", { style: styles.quickAccessList, children: [_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Mode" }), _jsx("strong", { children: "Customer-facing demo link" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Focus RO" }), _jsx("strong", { children: sharedLinkRoId })] })] })] })) : null, displayedApprovalReviewRows.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No inspection-linked recommendations available for approval review." })) : (displayedApprovalReviewRows.map(({ row, inspection, sections, mediaGroups }) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.roNumber }), _jsx(ROStatusBadge, { status: row.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: row.accountLabel }), _jsx("div", { style: styles.mobileDataSecondary, children: [row.make, row.model, row.year].filter(Boolean).join(" ") || "-" }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Inspection" }), _jsx("strong", { children: inspection.inspectionNumber })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Pending decisions" }), _jsx("strong", { children: row.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending").length })] }), _jsxs("div", { style: { marginTop: 12 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Inspection Findings" }), sections.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No inspection findings recorded." })) : (_jsx("div", { style: styles.formStack, children: sections.map((section) => {
                                                                const sectionMedia = mediaGroups.find((group) => group.section === section.label)?.media ?? [];
                                                                return (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: section.label }), _jsxs("span", { style: styles.statusInfo, children: [section.findings.length, " items"] })] }), section.note ? _jsx("div", { style: styles.formHint, children: section.note }) : null, _jsx("div", { style: styles.formStack, children: section.findings.map((finding, findingIndex) => (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }, children: [_jsx("strong", { style: { fontSize: 14 }, children: finding.title }), _jsx("span", { style: getCustomerInspectionStatusStyle(finding.status), children: finding.status })] }), finding.note ? _jsx("div", { style: { fontSize: 13, color: "#475569", marginTop: 4 }, children: finding.note }) : null] }, `${section.label}_${finding.title}_${findingIndex}`))) }), sectionMedia.length > 0 ? (_jsxs("div", { style: { marginTop: 10 }, children: [_jsxs("div", { style: { fontWeight: 600, fontSize: 13, color: "#334155", marginBottom: 8 }, children: ["Media (", sectionMedia.length, ")"] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }, children: sectionMedia.map((item) => (_jsxs("div", { style: { borderRadius: 6, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff" }, children: [item.previewDataUrl && item.type === "Photo" ? (_jsx("img", { src: item.previewDataUrl, alt: item.itemLabel || item.section || "Inspection photo", style: { width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" } })) : item.previewDataUrl && item.type === "Video" ? (_jsx("video", { src: item.previewDataUrl, controls: true, style: { width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", background: "#0f172a" } })) : (_jsxs("div", { style: { minHeight: 92, padding: "10px 8px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, background: "#f8fafc" }, children: [_jsx("strong", { style: { fontSize: 12, color: "#0f172a" }, children: item.type }), _jsx("span", { style: { fontSize: 11, color: "#64748b" }, children: item.fileName })] })), _jsx("div", { style: { padding: "4px 6px", fontSize: 10, color: "#64748b", background: "#f8fafc" }, children: item.itemLabel || item.section || item.fileName })] }, item.id))) })] })) : null] }, section.label));
                                                            }) }))] }), _jsxs("div", { style: { marginTop: 12 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Recommendations" }), row.workLines.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No recommendations linked to this repair order." })) : (_jsx("div", { style: styles.formStack, children: row.workLines.map((line) => (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: line.customerDescription || line.title || "Work Item" }), _jsx("span", { style: getApprovalDecisionStyle(line.approvalDecision ?? "Pending"), children: line.approvalDecision ?? "Pending" })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [line.category || "General", "  |  ", line.priority, " priority"] }), _jsx("div", { style: styles.formHint, children: line.notes || getCustomerFriendlyLineDescription(line) }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Total" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(line.totalEstimate)) })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => setCustomerDecision(row.id, line.id, "Approved"), children: "Approve" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => setCustomerDecision(row.id, line.id, "Deferred"), children: "Defer" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => setCustomerDecision(row.id, line.id, "Declined"), children: "Decline" })] })] }, line.id))) }))] })] }, row.id))))] })) : portalView === "myVehicles" ? (_jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }, children: _jsxs(Card, { title: "My Vehicles", subtitle: "Each vehicle is grouped separately with latest visit first", children: [_jsxs("form", { onSubmit: handleAddPortalVehicle, style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "Add Vehicle" }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Plate Number" }), _jsx("input", { style: styles.input, value: portalVehicleForm.plateNumber, onChange: (e) => setPortalVehicleForm((prev) => ({ ...prev, plateNumber: e.target.value })), placeholder: "ABC-1234" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Conduction Number" }), _jsx("input", { style: styles.input, value: portalVehicleForm.conductionNumber, onChange: (e) => setPortalVehicleForm((prev) => ({ ...prev, conductionNumber: e.target.value })), placeholder: "Optional if no plate yet" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Make" }), _jsx("input", { style: styles.input, value: portalVehicleForm.make, onChange: (e) => setPortalVehicleForm((prev) => ({ ...prev, make: e.target.value })), placeholder: "Toyota" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Model" }), _jsx("input", { style: styles.input, value: portalVehicleForm.model, onChange: (e) => setPortalVehicleForm((prev) => ({ ...prev, model: e.target.value })), placeholder: "Fortuner" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Year" }), _jsx("input", { style: styles.input, value: portalVehicleForm.year, onChange: (e) => setPortalVehicleForm((prev) => ({ ...prev, year: e.target.value })), placeholder: "2021" })] })] }), portalVehicleError ? _jsx("div", { style: styles.errorBox, children: portalVehicleError }) : null, _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "submit", style: styles.smallButton, disabled: isSavingPortalVehicle, children: "Add Vehicle" }) })] }), portalVehicleGroups.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No vehicles are linked to this customer portal yet." })) : (_jsx("div", { style: styles.mobileCardList, children: portalVehicleGroups.map((group) => (_jsxs("button", { type: "button", onClick: () => setSelectedVehicleKey(group.vehicleKey), style: {
                                                                ...styles.mobileDataCard,
                                                                ...(selectedVehicleKey === group.vehicleKey ? styles.selectedQueueCard : {}),
                                                                textAlign: "left",
                                                                cursor: "pointer",
                                                            }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: group.plateNumber || group.conductionNumber || group.vehicleKey }), group.activeJobCount > 0 ? _jsxs("span", { style: styles.statusWarning, children: [group.activeJobCount, " Active"] }) : _jsx("span", { style: styles.statusOk, children: "No Open Job" })] }), _jsx("div", { style: styles.mobileDataPrimary, children: group.vehicleLabel }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["Latest Odometer: ", group.latestOdometerKm || "-"] }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["Last Visit: ", formatDateTime(group.lastVisitAt)] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Total Visits" }), _jsx("strong", { children: group.totalVisits })] })] }, group.vehicleKey))) }))] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }, children: _jsx(Card, { title: selectedVehicleGroup ? `Vehicle Timeline  -  ${selectedVehicleGroup.plateNumber || selectedVehicleGroup.conductionNumber || selectedVehicleGroup.vehicleKey}` : "Vehicle Timeline", subtitle: "Newest transaction first with odometer and status shown", right: selectedVehicleGroup ? _jsx("span", { style: styles.statusInfo, children: selectedVehicleGroup.vehicleLabel }) : undefined, children: !selectedVehicleGroup ? (_jsx("div", { style: styles.emptyState, children: "Select a vehicle to review its history." })) : (_jsxs("div", { style: styles.formStack, children: [_jsx("div", { style: styles.sectionCardMuted, children: _jsxs("div", { style: styles.quickAccessList, children: [_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Plate Number" }), _jsx("strong", { children: selectedVehicleGroup.plateNumber || "-" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Conduction Number" }), _jsx("strong", { children: selectedVehicleGroup.conductionNumber || "-" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Vehicle" }), _jsx("strong", { children: selectedVehicleGroup.vehicleLabel })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Latest Odometer" }), _jsx("strong", { children: selectedVehicleGroup.latestOdometerKm || "-" })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Last Visit" }), _jsx("strong", { children: formatDateTime(selectedVehicleGroup.lastVisitAt) })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Total Visits" }), _jsx("strong", { children: selectedVehicleGroup.totalVisits })] })] }) }), _jsx("div", { style: styles.mobileCardList, children: selectedVehicleGroup.rows.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.type }), _jsx("span", { style: styles.statusInfo, children: row.status || "-" })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.number }), _jsx("div", { style: styles.mobileDataSecondary, children: formatDateTime(row.date) }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Odometer" }), _jsx("strong", { children: row.odometerKm || "-" })] }), _jsx("div", { style: styles.formHint, children: row.summary || "-" })] }, row.id))) })] })) }) })] })) : null] })] }) })] }));
}
function SupplierPortalPage({ supplier, partsRequests, setPartsRequests, onLogout, isCompactLayout, }) {
    const [portalView, setPortalView] = useState("openRequests");
    const [search, setSearch] = useState("");
    const [selectedRequestId, setSelectedRequestId] = useState("");
    const [brand, setBrand] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [unitCost, setUnitCost] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [warrantyNote, setWarrantyNote] = useState("");
    const [condition, setCondition] = useState("Brand New");
    const [notes, setNotes] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [courierName, setCourierName] = useState("");
    const [shippingNotes, setShippingNotes] = useState("");
    const [invoiceFileName, setInvoiceFileName] = useState("");
    const [shippingLabelFileName, setShippingLabelFileName] = useState("");
    const [error, setError] = useState("");
    const [isSubmittingBid, setIsSubmittingBid] = useState(false);
    const [returnResponseStatus, setReturnResponseStatus] = useState("Approved");
    const [returnResponseNotes, setReturnResponseNotes] = useState("");
    const openRequests = useMemo(() => {
        const term = search.trim().toLowerCase();
        return partsRequests
            .filter((row) => !["Closed", "Cancelled", "Return Approved", "Return Rejected"].includes(row.status))
            .filter((row) => !term
            ? true
            : [row.requestNumber, row.roNumber, row.partName, row.partNumber, row.plateNumber, row.accountLabel, row.vehicleLabel, row.notes]
                .join(" ")
                .toLowerCase()
                .includes(term))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [partsRequests, search]);
    const myBids = useMemo(() => partsRequests.flatMap((request) => request.bids
        .filter((bid) => bid.supplierName.trim().toLowerCase() === supplier.supplierName.trim().toLowerCase())
        .map((bid) => ({ request, bid }))), [partsRequests, supplier.supplierName]);
    const selectedRequest = openRequests.find((row) => row.id === selectedRequestId) ?? openRequests[0] ?? null;
    useEffect(() => {
        if (!selectedRequestId && openRequests.length > 0) {
            setSelectedRequestId(openRequests[0].id);
            return;
        }
        if (selectedRequestId && !openRequests.some((row) => row.id === selectedRequestId)) {
            setSelectedRequestId(openRequests[0]?.id ?? "");
        }
    }, [selectedRequestId, openRequests]);
    const updateRequest = (requestId, updater) => {
        setPartsRequests((prev) => prev.map((request) => (request.id === requestId ? updater(request) : request)));
    };
    const submitBid = async (e) => {
        e.preventDefault();
        if (isSubmittingBid)
            return;
        setIsSubmittingBid(true);
        try {
            if (!selectedRequest) {
                setError("Select a parts request first.");
                return;
            }
            if (!brand.trim() || !quantity.trim() || !unitCost.trim() || !deliveryTime.trim()) {
                setError("Brand, quantity, unit cost, and delivery time are required.");
                return;
            }
            const quantityValue = Math.max(1, parseMoneyInput(quantity));
            const unitCostValue = parseMoneyInput(unitCost);
            const totalCostValue = quantityValue * unitCostValue;
            const productPhotoInput = document.getElementById("supplier-product-photos");
            const productPhotos = await buildPartsMediaRecords(productPhotoInput?.files ?? null, "Supplier", "Supplier Item Photo", supplier.supplierName);
            const newBid = {
                id: uid("bid"),
                supplierName: supplier.supplierName,
                brand: brand.trim(),
                quantity: quantityValue.toString(),
                unitCost: unitCostValue.toFixed(2),
                totalCost: totalCostValue.toFixed(2),
                deliveryTime: deliveryTime.trim(),
                warrantyNote: warrantyNote.trim(),
                condition,
                notes: notes.trim(),
                createdAt: new Date().toISOString(),
                productPhotos,
                invoiceFileName: invoiceFileName.trim(),
                shippingLabelFileName: shippingLabelFileName.trim(),
                trackingNumber: trackingNumber.trim(),
                courierName: courierName.trim(),
                shippingNotes: shippingNotes.trim(),
            };
            updateRequest(selectedRequest.id, (request) => ({
                ...request,
                bids: [newBid, ...request.bids],
                status: newBid.invoiceFileName || newBid.shippingLabelFileName || newBid.trackingNumber
                    ? "In Transit"
                    : request.status === "Draft" || request.status === "Requested" || request.status === "Sent to Suppliers"
                        ? "Waiting for Bids"
                        : "Bidding",
                updatedAt: new Date().toISOString(),
            }));
            setBrand("");
            setQuantity("1");
            setUnitCost("");
            setDeliveryTime("");
            setWarrantyNote("");
            setCondition("Brand New");
            setNotes("");
            setTrackingNumber("");
            setCourierName("");
            setShippingNotes("");
            setInvoiceFileName("");
            setShippingLabelFileName("");
            setError("");
            if (productPhotoInput)
                productPhotoInput.value = "";
            setPortalView("myBids");
        }
        finally {
            setIsSubmittingBid(false);
        }
    };
    const updateShippingForBid = (requestId, bidId) => {
        updateRequest(requestId, (request) => ({
            ...request,
            bids: request.bids.map((bid) => bid.id === bidId
                ? {
                    ...bid,
                    invoiceFileName: invoiceFileName.trim() || bid.invoiceFileName,
                    shippingLabelFileName: shippingLabelFileName.trim() || bid.shippingLabelFileName,
                    trackingNumber: trackingNumber.trim() || bid.trackingNumber,
                    courierName: courierName.trim() || bid.courierName,
                    shippingNotes: shippingNotes.trim() || bid.shippingNotes,
                }
                : bid),
            status: invoiceFileName.trim() || shippingLabelFileName.trim() || trackingNumber.trim()
                ? "In Transit"
                : request.status,
            updatedAt: new Date().toISOString(),
        }));
        setInvoiceFileName("");
        setShippingLabelFileName("");
        setTrackingNumber("");
        setCourierName("");
        setShippingNotes("");
    };
    const respondToReturn = async (requestId) => {
        const responseInput = document.getElementById(`supplier-return-response-${requestId}`);
        const responsePictures = await buildPartsMediaRecords(responseInput?.files ?? null, "Return", "Supplier Return Response", supplier.supplierName);
        updateRequest(requestId, (request) => ({
            ...request,
            returnRecords: request.returnRecords.map((entry, index) => index === 0
                ? {
                    ...entry,
                    responseStatus: returnResponseStatus,
                    responseNotes: returnResponseNotes.trim(),
                    responsePictures: [...entry.responsePictures, ...responsePictures],
                    respondedAt: new Date().toISOString(),
                    respondedBy: supplier.supplierName,
                }
                : entry),
            status: returnResponseStatus === "Approved" || returnResponseStatus === "Replacement in Process" || returnResponseStatus === "Refund in Process"
                ? "Return Approved"
                : "Return Rejected",
            updatedAt: new Date().toISOString(),
        }));
        if (responseInput)
            responseInput.value = "";
        setReturnResponseNotes("");
    };
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: globalCss }), _jsx("div", { style: styles.appShell, children: _jsxs("div", { style: styles.mainArea, children: [_jsxs("header", { style: styles.topBar, children: [_jsx("div", { style: styles.topBarLeft, children: _jsxs("div", { children: [_jsx("div", { style: styles.pageTitle, children: "Supplier Portal" }), _jsx("div", { style: styles.pageSubtitle, children: BUILD_VERSION })] }) }), _jsxs("div", { style: styles.topBarRight, children: [_jsxs("span", { style: styles.statusInfo, children: ["Open requests: ", openRequests.length, "  |  My bids: ", myBids.length] }), _jsx("div", { style: styles.topBarName, children: supplier.supplierName }), _jsx("button", { type: "button", onClick: onLogout, style: styles.logoutButtonCompact, children: "Sign Out" })] })] }), _jsxs("main", { style: styles.mainContent, children: [_jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(portalView === "openRequests" ? styles.portalTabActive : {}) }, onClick: () => setPortalView("openRequests"), children: "Open Requests" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(portalView === "myBids" ? styles.portalTabActive : {}) }, onClick: () => setPortalView("myBids"), children: "My Submitted Bids" })] }), _jsxs("div", { style: styles.portalHeroCard, children: [_jsx("div", { style: styles.portalHeroTitle, children: "Media, shipping, and return response center" }), _jsx("div", { style: styles.portalHeroText, children: "Review workshop reference pictures, submit bid photos, upload invoice and shipping label details, and respond to return requests with reasons and pictures." })] }), portalView === "openRequests" ? (_jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsxs(Card, { title: "Open Parts Requests", subtitle: "Requests ready for supplier review and quotation", children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Search Requests" }), _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search request no., RO, plate, part, vehicle" })] }), openRequests.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No open requests available right now." })) : (_jsx("div", { style: styles.mobileCardList, children: openRequests.map((request) => (_jsxs("button", { type: "button", onClick: () => setSelectedRequestId(request.id), style: {
                                                                ...styles.mobileDataCard,
                                                                ...(selectedRequestId === request.id ? styles.selectedQueueCard : {}),
                                                                textAlign: "left",
                                                                cursor: "pointer",
                                                            }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: request.requestNumber }), _jsx("span", { style: getPartsRequestStatusStyle(request.status), children: request.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: request.partName }), _jsx("div", { style: styles.mobileDataSecondary, children: request.partNumber || "No part number" }), _jsxs("div", { style: styles.mobileDataSecondary, children: [request.vehicleLabel, "  |  ", request.plateNumber || "-"] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Workshop Photos" }), _jsx("strong", { children: request.workshopPhotos.length })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Bids" }), _jsx("strong", { children: request.bids.length })] })] }, request.id))) }))] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsx(Card, { title: "Submit Supplier Bid", subtitle: "Use workshop media as reference, then send pricing, pictures, and shipping-ready details", children: !selectedRequest ? (_jsx("div", { style: styles.emptyState, children: "Select a request from the left to submit a bid." })) : (_jsxs("form", { onSubmit: submitBid, style: styles.formStack, children: [_jsx("div", { style: styles.sectionCardMuted, children: _jsxs("div", { style: styles.quickAccessList, children: [_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Request" }), _jsx("strong", { children: selectedRequest.requestNumber })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "RO" }), _jsx("strong", { children: selectedRequest.roNumber })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Part" }), _jsx("strong", { children: selectedRequest.partName })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Required Qty" }), _jsx("strong", { children: selectedRequest.quantity })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Vehicle" }), _jsx("strong", { children: selectedRequest.vehicleLabel })] })] }) }), _jsxs("div", { style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "Workshop Reference Pictures" }), selectedRequest.workshopPhotos.length === 0 ? (_jsx("div", { style: styles.formHint, children: "No workshop pictures uploaded yet." })) : (_jsx("div", { style: styles.partsMediaGrid, children: selectedRequest.workshopPhotos.map((photo) => (_jsxs("div", { style: styles.partsMediaCard, children: [_jsx("img", { src: photo.previewDataUrl, alt: photo.fileName, style: styles.partsMediaImage }), _jsx("div", { style: styles.formHint, children: photo.fileName })] }, photo.id))) }))] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Supplier" }), _jsx("input", { style: styles.input, value: supplier.supplierName, disabled: true })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Brand" }), _jsx("input", { style: styles.input, value: brand, onChange: (e) => setBrand(e.target.value), placeholder: "Brand or line" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Quantity" }), _jsx("input", { style: styles.input, value: quantity, onChange: (e) => setQuantity(e.target.value) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Unit Cost" }), _jsx("input", { style: styles.input, value: unitCost, onChange: (e) => setUnitCost(e.target.value), placeholder: "PHP" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Condition" }), _jsxs("select", { style: styles.select, value: condition, onChange: (e) => setCondition(e.target.value), children: [_jsx("option", { value: "Brand New", children: "Brand New" }), _jsx("option", { value: "OEM", children: "OEM" }), _jsx("option", { value: "Replacement", children: "Replacement" }), _jsx("option", { value: "Surplus", children: "Surplus" })] })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Delivery Time" }), _jsx("input", { style: styles.input, value: deliveryTime, onChange: (e) => setDeliveryTime(e.target.value), placeholder: "Same day / 2 days / 1 week" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Warranty Note" }), _jsx("input", { style: styles.input, value: warrantyNote, onChange: (e) => setWarrantyNote(e.target.value), placeholder: "Optional warranty note" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Add Product Photos" }), _jsx("input", { id: "supplier-product-photos", style: styles.input, type: "file", accept: "image/*", multiple: true }), _jsx("div", { style: styles.formHint, children: "You can select multiple photos in one upload and add more in future updates." }), _jsx("div", { style: styles.formHint, children: "Add one or many product photos now, then add more later if needed." })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Invoice File Name" }), _jsx("input", { style: styles.input, value: invoiceFileName, onChange: (e) => setInvoiceFileName(e.target.value), placeholder: "Invoice file or number" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Shipping Label File Name" }), _jsx("input", { style: styles.input, value: shippingLabelFileName, onChange: (e) => setShippingLabelFileName(e.target.value), placeholder: "Label file name" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Tracking Number" }), _jsx("input", { style: styles.input, value: trackingNumber, onChange: (e) => setTrackingNumber(e.target.value), placeholder: "Tracking number" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Courier" }), _jsx("input", { style: styles.input, value: courierName, onChange: (e) => setCourierName(e.target.value), placeholder: "Courier / shipper" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Shipping Notes" }), _jsx("input", { style: styles.input, value: shippingNotes, onChange: (e) => setShippingNotes(e.target.value), placeholder: "Optional shipping note" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Notes" }), _jsx("textarea", { style: styles.textarea, value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Optional fitment, stock, or delivery notes" })] }), error ? _jsx("div", { style: styles.errorBox, children: error }) : null, _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "submit", style: styles.primaryButton, disabled: isSubmittingBid, children: "Submit Bid" }) })] })) }) })] })) : (_jsx("div", { style: styles.mobileCardList, children: myBids.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No bids submitted from this supplier portal session yet." })) : (myBids.map(({ request, bid }) => {
                                        const latestReturn = request.returnRecords[0] ?? null;
                                        return (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: request.requestNumber }), _jsx("span", { style: getPartsRequestStatusStyle(request.status), children: request.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: request.partName }), _jsxs("div", { style: styles.mobileDataSecondary, children: [bid.brand || "No brand", "  |  ", bid.condition] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Total Bid" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(bid.totalCost)) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Delivery" }), _jsx("strong", { children: bid.deliveryTime || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Tracking" }), _jsx("strong", { children: bid.trackingNumber || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Invoice" }), _jsx("strong", { children: bid.invoiceFileName || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Label" }), _jsx("strong", { children: bid.shippingLabelFileName || "-" })] }), bid.productPhotos.length > 0 ? (_jsx("div", { style: styles.partsMediaGrid, children: bid.productPhotos.map((photo) => (_jsxs("div", { style: styles.partsMediaCard, children: [_jsx("img", { src: photo.previewDataUrl, alt: photo.fileName, style: styles.partsMediaImage }), _jsx("div", { style: styles.formHint, children: photo.fileName })] }, photo.id))) })) : null, _jsxs("div", { style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "Update Shipping" }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Invoice File Name" }), _jsx("input", { style: styles.input, value: invoiceFileName, onChange: (e) => setInvoiceFileName(e.target.value), placeholder: bid.invoiceFileName || "Invoice file or number" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Shipping Label File Name" }), _jsx("input", { style: styles.input, value: shippingLabelFileName, onChange: (e) => setShippingLabelFileName(e.target.value), placeholder: bid.shippingLabelFileName || "Shipping label file" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Tracking Number" }), _jsx("input", { style: styles.input, value: trackingNumber, onChange: (e) => setTrackingNumber(e.target.value), placeholder: bid.trackingNumber || "Tracking number" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Courier" }), _jsx("input", { style: styles.input, value: courierName, onChange: (e) => setCourierName(e.target.value), placeholder: bid.courierName || "Courier" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Shipping Notes" }), _jsx("input", { style: styles.input, value: shippingNotes, onChange: (e) => setShippingNotes(e.target.value), placeholder: bid.shippingNotes || "Optional note" })] })] }), _jsx("button", { type: "button", style: styles.smallButton, onClick: () => updateShippingForBid(request.id, bid.id), children: "Save Shipping Update" })] }), latestReturn ? (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "Return Notification" }), _jsxs("div", { style: styles.formHint, children: ["Reason: ", latestReturn.reason || "-"] }), _jsxs("div", { style: styles.formHint, children: ["Notes: ", latestReturn.notes || "-"] }), latestReturn.pictures.length > 0 ? (_jsx("div", { style: styles.partsMediaGrid, children: latestReturn.pictures.map((photo) => (_jsxs("div", { style: styles.partsMediaCard, children: [_jsx("img", { src: photo.previewDataUrl, alt: photo.fileName, style: styles.partsMediaImage }), _jsx("div", { style: styles.formHint, children: photo.fileName })] }, photo.id))) })) : null, _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Return Response" }), _jsxs("select", { style: styles.select, value: returnResponseStatus, onChange: (e) => setReturnResponseStatus(e.target.value), children: [_jsx("option", { value: "Approved", children: "Approved" }), _jsx("option", { value: "Rejected", children: "Rejected" }), _jsx("option", { value: "Replacement in Process", children: "Replacement in Process" }), _jsx("option", { value: "Refund in Process", children: "Refund in Process" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Response Notes" }), _jsx("textarea", { style: styles.textarea, value: returnResponseNotes, onChange: (e) => setReturnResponseNotes(e.target.value), placeholder: "Explain the return response" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Add Response Photos" }), _jsx("input", { id: `supplier-return-response-${request.id}`, style: styles.input, type: "file", accept: "image/*", multiple: true }), _jsx("div", { style: styles.formHint, children: "Add one or many response photos. New uploads are appended." })] }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => respondToReturn(request.id), children: "Send Return Response" })] })) : null] }, bid.id));
                                    })) }))] })] }) })] }));
}
function DashboardPage({ currentUser, users, roleDefinitions, allowedNav, intakeRecords, repairOrders, qcRecords, releaseRecords, approvalRecords, backjobRecords, invoiceRecords, paymentRecords, workLogs, partsRequests, isCompactLayout, }) {
    const activeUsers = users.filter((u) => u.active);
    const userRoleCounts = ALL_ROLES.map((role) => ({
        role,
        count: activeUsers.filter((u) => u.role === role).length,
    }));
    const currentPermissions = getPermissionsForRole(currentUser.role, roleDefinitions);
    const waitingInspection = intakeRecords.filter((row) => row.status === "Waiting Inspection").length;
    const fleetCount = intakeRecords.filter((row) => row.accountType === "Company / Fleet").length;
    const latestIntakes = intakeRecords.slice(0, 5);
    const todayKey = todayStamp();
    const releasedToday = releaseRecords.filter((row) => row.releaseNumber.includes(todayKey));
    const dailySales = releasedToday.reduce((sum, row) => sum + parseMoneyInput(row.finalTotalAmount), 0);
    const currentMonthKey = todayKey.slice(0, 6);
    const monthReleases = releaseRecords.filter((row) => row.releaseNumber.includes(currentMonthKey));
    const monthlySales = monthReleases.reduce((sum, row) => sum + parseMoneyInput(row.finalTotalAmount), 0);
    const daysWorked = Math.max(new Set(monthReleases.map((row) => row.createdAt.slice(0, 10))).size, 1);
    const daysInMonth = new Date().getDate() <= 28 ? 30 : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const monthlyProjection = (monthlySales / daysWorked) * daysInMonth;
    const qcFailures = qcRecords.filter((row) => row.result === "Failed").length;
    const approvalsDone = approvalRecords.length;
    const approvalItems = approvalRecords.flatMap((row) => row.items);
    const approvedItems = approvalItems.filter((row) => row.decision === "Approved").length;
    const approvalRate = approvalItems.length ? Math.round((approvedItems / approvalItems.length) * 100) : 0;
    const bottleneckWaitingApproval = repairOrders.filter((row) => row.status === "Waiting Approval").length;
    const bottleneckWaitingParts = repairOrders.filter((row) => row.status === "Waiting Parts").length;
    const unpaidInvoices = invoiceRecords.filter((row) => row.paymentStatus === "Unpaid" && row.status !== "Voided").length;
    const partialInvoices = invoiceRecords.filter((row) => row.paymentStatus === "Partial" && row.status !== "Voided").length;
    const receivables = invoiceRecords
        .filter((row) => row.status !== "Voided")
        .reduce((sum, row) => {
        const paid = paymentRecords.filter((payment) => payment.invoiceId === row.id).reduce((paymentSum, payment) => paymentSum + parseMoneyInput(payment.amount), 0);
        return sum + Math.max(parseMoneyInput(row.totalAmount) - paid, 0);
    }, 0);
    const paymentsToday = paymentRecords.filter((row) => row.paymentNumber.includes(todayKey)).reduce((sum, row) => sum + parseMoneyInput(row.amount), 0);
    const paymentsThisMonth = paymentRecords
        .filter((row) => row.paymentNumber.includes(currentMonthKey))
        .reduce((sum, row) => sum + parseMoneyInput(row.amount), 0);
    const openROs = repairOrders.filter((row) => !["Released", "Closed"].includes(row.status)).length;
    const inProgressCount = repairOrders.filter((row) => row.status === "In Progress").length;
    const qcQueueCount = repairOrders.filter((row) => row.status === "Quality Check").length;
    const readyReleaseCount = repairOrders.filter((row) => row.status === "Ready Release").length;
    const releasedCount = repairOrders.filter((row) => row.status === "Released").length;
    const avgReleaseValue = monthReleases.length ? monthlySales / monthReleases.length : 0;
    const fleetShare = intakeRecords.length ? Math.round((fleetCount / intakeRecords.length) * 100) : 0;
    const laborRevenueTotal = repairOrders.reduce((sum, ro) => sum + ro.workLines.reduce((lineSum, line) => lineSum + parseMoneyInput(line.serviceEstimate), 0), 0);
    const partsRevenueTotal = repairOrders.reduce((sum, ro) => sum + ro.workLines.reduce((lineSum, line) => lineSum + parseMoneyInput(line.partsEstimate), 0), 0);
    const partsInternalCostTotal = repairOrders.reduce((sum, ro) => sum +
        ro.workLines.reduce((lineSum, line) => {
            const baseCost = parseMoneyInput(line.partsCost);
            return lineSum + baseCost;
        }, 0), 0);
    const estimatedGrossProfit = laborRevenueTotal + partsRevenueTotal - partsInternalCostTotal;
    const estimatedGrossMargin = laborRevenueTotal + partsRevenueTotal > 0
        ? Math.round((estimatedGrossProfit / (laborRevenueTotal + partsRevenueTotal)) * 100)
        : 0;
    const releasedRevenue = releaseRecords.reduce((sum, row) => sum + parseMoneyInput(row.finalTotalAmount), 0);
    const releasedJobsCount = releaseRecords.length;
    const averageReleasedTicket = releasedJobsCount ? releasedRevenue / releasedJobsCount : 0;
    const reportTechProductivity = getTechnicianProductivity(repairOrders, workLogs, users);
    const reportAdvisorSales = getAdvisorSalesProduced(repairOrders, invoiceRecords);
    const reportRepeatCustomers = getRepeatCustomerFrequency(repairOrders);
    const reportQcSummary = getQcPassFailSummary(qcRecords);
    const reportWaitingPartsAging = getWaitingPartsAging(repairOrders, partsRequests);
    const reportBackjobRate = getBackjobRate(repairOrders, backjobRecords);
    const roProfitMap = repairOrders
        .map((ro) => {
        const laborRevenue = ro.workLines.reduce((sum, line) => sum + parseMoneyInput(line.serviceEstimate), 0);
        const partsRevenue = ro.workLines.reduce((sum, line) => sum + parseMoneyInput(line.partsEstimate), 0);
        const partsCost = ro.workLines.reduce((sum, line) => sum + parseMoneyInput(line.partsCost), 0);
        const grossProfit = laborRevenue + partsRevenue - partsCost;
        return {
            ro,
            laborRevenue,
            partsRevenue,
            partsCost,
            grossProfit,
            margin: laborRevenue + partsRevenue > 0
                ? Math.round((grossProfit / (laborRevenue + partsRevenue)) * 100)
                : 0,
        };
    })
        .sort((a, b) => b.grossProfit - a.grossProfit)
        .slice(0, 6);
    const techRevenueMap = users.filter((u) => u.active).map((user) => {
        const assigned = repairOrders.filter((ro) => ro.primaryTechnicianId === user.id).length;
        const active = repairOrders.filter((ro) => ro.primaryTechnicianId === user.id && ["Approved / Ready to Work", "In Progress", "Waiting Parts", "Quality Check"].includes(ro.status)).length;
        const total = repairOrders
            .filter((ro) => ro.primaryTechnicianId === user.id)
            .reduce((sum, ro) => sum + ro.workLines.reduce((lineSum, line) => lineSum + parseMoneyInput(line.serviceEstimate), 0), 0);
        const completed = repairOrders.filter((ro) => ro.primaryTechnicianId === user.id && ["Ready Release", "Released", "Closed"].includes(ro.status)).length;
        const qcFailed = qcRecords.filter((qc) => qc.result === "Failed" && repairOrders.find((ro) => ro.id === qc.roId)?.primaryTechnicianId === user.id).length;
        const userLogs = workLogs.filter((log) => log.technicianId === user.id);
        const bookedMinutes = userLogs.reduce((sum, log) => sum + getWorkLogMinutes(log), 0);
        const activeTimers = userLogs.filter((log) => !log.endedAt).length;
        const laborProduced = userLogs.reduce((sum, log) => {
            const ro = repairOrders.find((row) => row.id === log.roId);
            const line = ro?.workLines.find((row) => row.id === log.workLineId);
            return sum + parseMoneyInput(line?.serviceEstimate ?? "0");
        }, 0);
        const efficiency = bookedMinutes > 0 ? Math.round((laborProduced / bookedMinutes) * 60) : 0;
        return { user, assigned, active, total, completed, qcFailed, bookedMinutes, activeTimers, laborProduced, efficiency };
    }).sort((a, b) => b.laborProduced - a.laborProduced).slice(0, 8);
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: `Welcome, ${currentUser.fullName}`, subtitle: "Owner dashboard with workflow, financial, and technician reporting", right: _jsx(RoleBadge, { role: currentUser.role }), children: _jsx("div", { style: styles.heroText, children: "The app now includes live workflow reporting, payment and invoice metrics, technician performance, bottleneck visibility, and QC / comeback signals tied to your real repair-order pipeline." }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Active Users" }), _jsx("div", { style: styles.statValue, children: activeUsers.length }), _jsx("div", { style: styles.statNote, children: "Loaded from localStorage" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Total Intakes" }), _jsx("div", { style: styles.statValue, children: intakeRecords.length }), _jsx("div", { style: styles.statNote, children: "Phase 2 intake records" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Waiting Inspection" }), _jsx("div", { style: styles.statValue, children: waitingInspection }), _jsx("div", { style: styles.statNote, children: "Ready for the next step" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Company / Fleet" }), _jsx("div", { style: styles.statValue, children: fleetCount }), _jsx("div", { style: styles.statNote, children: "Shared company and fleet account count" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Daily Sales" }), _jsx("div", { style: styles.statValue, children: formatCurrency(dailySales) }), _jsx("div", { style: styles.statNote, children: "Released jobs for today" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Monthly Projection" }), _jsx("div", { style: styles.statValue, children: formatCurrency(monthlyProjection) }), _jsx("div", { style: styles.statNote, children: "Based on current month releases" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Approval Rate" }), _jsxs("div", { style: styles.statValue, children: [approvalRate, "%"] }), _jsx("div", { style: styles.statNote, children: "Approved recommendation items" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Receivables" }), _jsx("div", { style: styles.statValue, children: formatCurrency(receivables) }), _jsx("div", { style: styles.statNote, children: "Open invoice balance" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Payments Today" }), _jsx("div", { style: styles.statValue, children: formatCurrency(paymentsToday) }), _jsxs("div", { style: styles.statNote, children: [unpaidInvoices, " unpaid  |  ", partialInvoices, " partial"] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Open ROs" }), _jsx("div", { style: styles.statValue, children: openROs }), _jsxs("div", { style: styles.statNote, children: [inProgressCount, " in progress  |  ", qcQueueCount, " in QC"] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Ready Release" }), _jsx("div", { style: styles.statValue, children: readyReleaseCount }), _jsxs("div", { style: styles.statNote, children: [releasedCount, " already released"] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Payments This Month" }), _jsx("div", { style: styles.statValue, children: formatCurrency(paymentsThisMonth) }), _jsxs("div", { style: styles.statNote, children: ["Average release ", formatCurrency(avgReleaseValue)] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Fleet Mix" }), _jsxs("div", { style: styles.statValue, children: [fleetShare, "%"] }), _jsx("div", { style: styles.statNote, children: "Company / fleet share of intake volume" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Estimated Gross Profit" }), _jsx("div", { style: styles.statValueSmall, children: formatCurrency(estimatedGrossProfit) }), _jsx("div", { style: styles.statNote, children: "Labor + parts revenue minus internal parts cost" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Gross Margin" }), _jsxs("div", { style: styles.statValue, children: [estimatedGrossMargin, "%"] }), _jsx("div", { style: styles.statNote, children: "Estimated margin across all repair orders" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Average Released Ticket" }), _jsx("div", { style: styles.statValueSmall, children: formatCurrency(averageReleasedTicket) }), _jsx("div", { style: styles.statNote, children: "Average final released amount per job" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "QC Pass Rate" }), _jsxs("div", { style: styles.statValue, children: [reportQcSummary.passRatePct, "%"] }), _jsxs("div", { style: styles.statNote, children: [reportQcSummary.passed, " passed  |  ", reportQcSummary.failed, " failed of ", reportQcSummary.total] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Backjob Rate" }), _jsxs("div", { style: styles.statValue, children: [reportBackjobRate.backjobRatePct, "%"] }), _jsxs("div", { style: styles.statNote, children: [reportBackjobRate.backjobCount, " backjobs of ", reportBackjobRate.totalROs, " ROs"] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Repeat Customers" }), _jsx("div", { style: styles.statValue, children: reportRepeatCustomers.length }), _jsx("div", { style: styles.statNote, children: "Vehicles / accounts with 2+ visits" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Parts-Blocked ROs" }), _jsx("div", { style: styles.statValue, children: reportWaitingPartsAging.length }), _jsx("div", { style: styles.statNote, children: reportWaitingPartsAging[0] ? `Longest: ${reportWaitingPartsAging[0].daysWaiting}d` : "No blocked ROs" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsx(Card, { title: "User Distribution", subtitle: "Active users by position", children: _jsx("div", { style: styles.roleGrid, children: userRoleCounts.map((item) => (_jsxs("div", { style: styles.roleTile, children: [_jsx(RoleBadge, { role: item.role }), _jsx("strong", { style: styles.roleTileCount, children: item.count })] }, item.role))) }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsx(Card, { title: "Current Access", subtitle: "Pages available to your role", children: _jsx("div", { style: styles.quickAccessList, children: allowedNav.map((item) => (_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { style: styles.quickAccessIcon, children: item.icon }), _jsx("span", { children: item.label })] }, item.key))) }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsx(Card, { title: "Workflow Bottlenecks", subtitle: "ROs waiting on next action", children: _jsxs("div", { style: styles.quickAccessList, children: [_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Waiting Approval" }), _jsx("strong", { children: bottleneckWaitingApproval })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Waiting Parts" }), _jsx("strong", { children: bottleneckWaitingParts })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "QC Failures" }), _jsx("strong", { children: qcFailures })] }), _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Backjobs Logged" }), _jsx("strong", { children: backjobRecords.length })] })] }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsx(Card, { title: "Technician Productivity", subtitle: "Primary technician labor value, completed jobs, active workload, and QC fails", children: _jsx("div", { style: styles.quickAccessList, children: techRevenueMap.map(({ user, total, completed, active, qcFailed, bookedMinutes, activeTimers, laborProduced, efficiency }) => (_jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: user.fullName }), _jsxs("strong", { children: [formatCurrency(laborProduced || total), "  |  ", formatMinutesAsHours(bookedMinutes), "  |  ", completed, " done  |  ", active, " active  |  ", activeTimers, " live  |  ", qcFailed, " QC fail  |  ", efficiency, "% eff."] })] }, user.id))) }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsx(Card, { title: "Top Repair Orders by Profit", subtitle: "Estimated gross profit based on labor + parts revenue less internal parts cost", children: _jsx("div", { style: styles.quickAccessList, children: roProfitMap.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No repair orders available yet." })) : (roProfitMap.map(({ ro, grossProfit, margin, laborRevenue, partsRevenue, partsCost }) => (_jsxs("div", { style: styles.quickAccessRow, children: [_jsxs("span", { children: [ro.roNumber, "  |  ", ro.plateNumber || ro.conductionNumber || "-"] }), _jsxs("strong", { children: [formatCurrency(grossProfit), "  |  ", margin, "% margin  |  L ", formatCurrency(laborRevenue), "  |  P ", formatCurrency(partsRevenue), "  |  Cost ", formatCurrency(partsCost)] })] }, ro.id)))) }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Recent Intake Activity", subtitle: "Newest encoded vehicles first", children: latestIntakes.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No intake records yet." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: latestIntakes.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.intakeNumber }), _jsx(StatusBadge, { status: row.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: row.companyName || row.customerName || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: [row.make, row.model, row.year].filter(Boolean).join(" ") || "-" }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Encoded" }), _jsx("strong", { children: formatDateTime(row.createdAt) })] })] }, row.id))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Intake No." }), _jsx("th", { style: styles.th, children: "Plate" }), _jsx("th", { style: styles.th, children: "Customer / Company" }), _jsx("th", { style: styles.th, children: "Vehicle" }), _jsx("th", { style: styles.th, children: "Status" }), _jsx("th", { style: styles.th, children: "Encoded" })] }) }), _jsx("tbody", { children: latestIntakes.map((row) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: row.intakeNumber }), _jsx("td", { style: styles.td, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("td", { style: styles.td, children: row.companyName || row.customerName || "-" }), _jsx("td", { style: styles.td, children: `${row.make} ${row.model} ${row.year}`.trim() || "-" }), _jsx("td", { style: styles.td, children: _jsx(StatusBadge, { status: row.status }) }), _jsx("td", { style: styles.td, children: formatDateTime(row.createdAt) })] }, row.id))) })] }) })) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Your Effective Permissions", subtitle: "Action restrictions use these permissions", children: _jsx("div", { style: styles.permissionWrap, children: ALL_PERMISSIONS.map((perm) => (_jsx(PermissionPill, { permission: perm, checked: hasPermission(currentUser.role, roleDefinitions, perm), disabled: true }, perm))) }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Technician Productivity", subtitle: "Labor produced and logged hours per technician", children: reportTechProductivity.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No technician data yet." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: reportTechProductivity.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsx("div", { style: styles.mobileDataCardHeader, children: _jsx("strong", { children: row.technicianName }) }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Jobs" }), _jsx("strong", { children: row.jobCount })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Labor Produced" }), _jsx("strong", { children: formatCurrency(row.laborProduced) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Logged" }), _jsx("strong", { children: formatMinutesAsHours(row.loggedMinutes) })] })] }, row.technicianId))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Technician" }), _jsx("th", { style: styles.th, children: "Jobs" }), _jsx("th", { style: styles.th, children: "Labor Produced" }), _jsx("th", { style: styles.th, children: "Logged" })] }) }), _jsx("tbody", { children: reportTechProductivity.map((row) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: row.technicianName }), _jsx("td", { style: styles.td, children: row.jobCount }), _jsx("td", { style: styles.td, children: formatCurrency(row.laborProduced) }), _jsx("td", { style: styles.td, children: formatMinutesAsHours(row.loggedMinutes) })] }, row.technicianId))) })] }) })) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsx(Card, { title: "Advisor Sales Produced", subtitle: "RO volume and invoiced amounts per service advisor", children: reportAdvisorSales.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No invoice data yet." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: reportAdvisorSales.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsx("div", { style: styles.mobileDataCardHeader, children: _jsx("strong", { children: row.advisorName }) }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "ROs" }), _jsx("strong", { children: row.roCount })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Total Invoiced" }), _jsx("strong", { children: formatCurrency(row.totalInvoiced) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Labor" }), _jsx("strong", { children: formatCurrency(row.laborSubtotal) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Parts" }), _jsx("strong", { children: formatCurrency(row.partsSubtotal) })] })] }, row.advisorName))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Advisor" }), _jsx("th", { style: styles.th, children: "ROs" }), _jsx("th", { style: styles.th, children: "Total Invoiced" }), _jsx("th", { style: styles.th, children: "Labor" }), _jsx("th", { style: styles.th, children: "Parts" })] }) }), _jsx("tbody", { children: reportAdvisorSales.map((row) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: row.advisorName }), _jsx("td", { style: styles.td, children: row.roCount }), _jsx("td", { style: styles.td, children: formatCurrency(row.totalInvoiced) }), _jsx("td", { style: styles.td, children: formatCurrency(row.laborSubtotal) }), _jsx("td", { style: styles.td, children: formatCurrency(row.partsSubtotal) })] }, row.advisorName))) })] }) })) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsx(Card, { title: "QC Pass / Fail by Officer", subtitle: "Quality check outcomes per QC officer", children: reportQcSummary.byQCOfficer.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No QC records yet." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: reportQcSummary.byQCOfficer.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsx("div", { style: styles.mobileDataCardHeader, children: _jsx("strong", { children: row.qcBy }) }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Total" }), _jsx("strong", { children: row.total })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Passed" }), _jsx("strong", { style: { color: "#15803d" }, children: row.passed })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Failed" }), _jsx("strong", { style: { color: "#b91c1c" }, children: row.failed })] })] }, row.qcBy))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "QC Officer" }), _jsx("th", { style: styles.th, children: "Total" }), _jsx("th", { style: styles.th, children: "Passed" }), _jsx("th", { style: styles.th, children: "Failed" })] }) }), _jsx("tbody", { children: reportQcSummary.byQCOfficer.map((row) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: row.qcBy }), _jsx("td", { style: styles.td, children: row.total }), _jsx("td", { style: { ...styles.td, color: "#15803d" }, children: row.passed }), _jsx("td", { style: { ...styles.td, color: row.failed > 0 ? "#b91c1c" : undefined }, children: row.failed })] }, row.qcBy))) })] }) })) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }, children: _jsx(Card, { title: "Waiting Parts Aging", subtitle: "ROs blocked by parts requests, sorted by days waiting", children: reportWaitingPartsAging.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No parts-blocked ROs." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: reportWaitingPartsAging.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.roNumber }), _jsxs("span", { style: { color: row.daysWaiting >= 3 ? "#b45309" : undefined }, children: [row.daysWaiting, "d waiting"] })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.accountLabel || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: row.blockedWorkLineTitles.join(", ") || "-" })] }, row.roId))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "RO No." }), _jsx("th", { style: styles.th, children: "Plate" }), _jsx("th", { style: styles.th, children: "Account" }), _jsx("th", { style: styles.th, children: "Days Waiting" }), _jsx("th", { style: styles.th, children: "Blocked Work Lines" })] }) }), _jsx("tbody", { children: reportWaitingPartsAging.map((row) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: row.roNumber }), _jsx("td", { style: styles.td, children: row.plateNumber || "-" }), _jsx("td", { style: styles.td, children: row.accountLabel || "-" }), _jsxs("td", { style: { ...styles.td, color: row.daysWaiting >= 3 ? "#b45309" : undefined, fontWeight: row.daysWaiting >= 3 ? 700 : undefined }, children: [row.daysWaiting, "d"] }), _jsx("td", { style: styles.td, children: row.blockedWorkLineTitles.join(", ") || "-" })] }, row.roId))) })] }) })) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }, children: _jsx(Card, { title: "Backjob Breakdown", subtitle: "Comeback rate by responsibility", children: reportBackjobRate.byResponsibility.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No backjob records yet." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: reportBackjobRate.byResponsibility.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsx("div", { style: styles.mobileDataCardHeader, children: _jsx("strong", { children: row.responsibility }) }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Count" }), _jsx("strong", { children: row.count })] })] }, row.responsibility))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Responsibility" }), _jsx("th", { style: styles.th, children: "Count" })] }) }), _jsx("tbody", { children: reportBackjobRate.byResponsibility.map((row) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: row.responsibility }), _jsx("td", { style: styles.td, children: row.count })] }, row.responsibility))) })] }) })) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Repeat Customers / Vehicles", subtitle: "Vehicles or accounts with more than one repair order", children: reportRepeatCustomers.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No repeat visits recorded yet." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: reportRepeatCustomers.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsx("div", { style: styles.mobileDataCardHeader, children: _jsx("strong", { children: row.plateNumber || row.accountLabel || row.key }) }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Visits" }), _jsx("strong", { children: row.visitCount })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Last Visit" }), _jsx("strong", { children: row.lastVisitDate ? new Date(row.lastVisitDate).toLocaleDateString() : "-" })] })] }, row.key))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Plate / Account" }), _jsx("th", { style: styles.th, children: "Visits" }), _jsx("th", { style: styles.th, children: "Last Visit" })] }) }), _jsx("tbody", { children: reportRepeatCustomers.map((row) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: row.plateNumber || row.accountLabel || row.key }), _jsx("td", { style: styles.td, children: row.visitCount }), _jsx("td", { style: styles.td, children: row.lastVisitDate ? new Date(row.lastVisitDate).toLocaleDateString() : "-" })] }, row.key))) })] }) })) }) })] }) }));
}
function InspectionPage({ currentUser, intakeRecords, inspectionRecords, setInspectionRecords, setIntakeRecords, isCompactLayout, }) {
    const inspectionDraftValue = readLocalStorage(STORAGE_KEYS.inspectionDraft, null);
    const [selectedIntakeId, setSelectedIntakeId] = useState(inspectionDraftValue?.selectedIntakeId ?? "");
    const [form, setForm] = useState(() => inspectionDraftValue?.form ? { ...getDefaultInspectionForm(), ...inspectionDraftValue.form } : getDefaultInspectionForm());
    const [error, setError] = useState("");
    const [showDraftRestore, setShowDraftRestore] = useState(() => !!inspectionDraftValue);
    const inspectionDraft = useDraftAutosave(STORAGE_KEYS.inspectionDraft, { selectedIntakeId, form }, !!selectedIntakeId || hasNonEmptyValues(form));
    const [search, setSearch] = useState("");
    const [evidenceSection, setEvidenceSection] = useState("Under the Hood");
    const [evidenceItemLabel, setEvidenceItemLabel] = useState("");
    const addEvidenceFiles = async (files) => {
        if (!files || files.length === 0)
            return;
        const nextItems = [];
        for (const file of Array.from(files)) {
            const isVideo = file.type.startsWith("video/");
            if (isVideo && file.size > MOBILE_EVIDENCE_VIDEO_MAX_MB * 1024 * 1024) {
                setError(`Video evidence must be ${MOBILE_EVIDENCE_VIDEO_MAX_MB}MB or less for mobile-friendly viewing.`);
                return;
            }
            let previewDataUrl = "";
            let mobileOptimized = false;
            if (!isVideo && file.type.startsWith("image/")) {
                previewDataUrl = await optimizeImageForMobile(file);
                mobileOptimized = true;
            }
            nextItems.push({
                id: uid("evd"),
                type: isVideo ? "Video" : "Photo",
                section: evidenceSection || "General",
                itemLabel: evidenceItemLabel.trim() || evidenceSection || "General",
                fileName: file.name,
                previewDataUrl,
                addedAt: new Date().toISOString(),
                mobileOptimized,
            });
        }
        setForm((prev) => ({
            ...prev,
            evidenceItems: [...prev.evidenceItems, ...nextItems],
        }));
        setError("");
    };
    const removeEvidenceItem = (evidenceId) => {
        setForm((prev) => ({
            ...prev,
            evidenceItems: prev.evidenceItems.filter((item) => item.id !== evidenceId),
        }));
    };
    const addAdditionalFindingPhotoNote = () => {
        setForm((prev) => ({
            ...prev,
            additionalFindingPhotoNotes: [...prev.additionalFindingPhotoNotes, ""],
        }));
    };
    const updateAdditionalFindingPhotoNote = (index, value) => {
        setForm((prev) => ({
            ...prev,
            additionalFindingPhotoNotes: prev.additionalFindingPhotoNotes.map((item, itemIndex) => itemIndex === index ? value : item),
        }));
    };
    const removeAdditionalFindingPhotoNote = (index) => {
        setForm((prev) => ({
            ...prev,
            additionalFindingPhotoNotes: prev.additionalFindingPhotoNotes.filter((_, itemIndex) => itemIndex !== index),
        }));
    };
    const addScanUploadNames = (files) => {
        if (!files?.length)
            return;
        const nextNames = Array.from(files)
            .map((file) => file.name)
            .filter(Boolean);
        setForm((prev) => ({
            ...prev,
            scanUploadNames: [...prev.scanUploadNames, ...nextNames],
            scanPerformed: true,
        }));
    };
    const removeScanUploadName = (index) => {
        setForm((prev) => ({
            ...prev,
            scanUploadNames: prev.scanUploadNames.filter((_, itemIndex) => itemIndex !== index),
        }));
    };
    const addCategoryFinding = (category) => {
        setForm((prev) => ({
            ...prev,
            [category]: [...prev[category], getEmptyAdditionalFinding()],
        }));
    };
    const updateCategoryFinding = (category, findingId, field, value) => {
        setForm((prev) => ({
            ...prev,
            [category]: prev[category].map((finding) => finding.id === findingId ? { ...finding, [field]: field === "status" ? value : value } : finding),
        }));
    };
    const removeCategoryFinding = (category, findingId) => {
        setForm((prev) => ({
            ...prev,
            [category]: prev[category].filter((finding) => finding.id !== findingId),
        }));
    };
    const addCategoryFindingPhotoNote = (category, findingId) => {
        setForm((prev) => ({
            ...prev,
            [category]: prev[category].map((finding) => finding.id === findingId ? { ...finding, photoNotes: [...finding.photoNotes, ""] } : finding),
        }));
    };
    const updateCategoryFindingPhotoNote = (category, findingId, photoIndex, value) => {
        setForm((prev) => ({
            ...prev,
            [category]: prev[category].map((finding) => finding.id === findingId
                ? {
                    ...finding,
                    photoNotes: finding.photoNotes.map((note, index) => (index === photoIndex ? value : note)),
                }
                : finding),
        }));
    };
    const removeCategoryFindingPhotoNote = (category, findingId, photoIndex) => {
        setForm((prev) => ({
            ...prev,
            [category]: prev[category].map((finding) => finding.id === findingId
                ? {
                    ...finding,
                    photoNotes: finding.photoNotes.filter((_, index) => index !== photoIndex),
                }
                : finding),
        }));
    };
    const eligibleIntakes = useMemo(() => intakeRecords.filter((row) => row.status === "Waiting Inspection" || row.status === "Draft"), [intakeRecords]);
    const selectedIntake = useMemo(() => intakeRecords.find((row) => row.id === selectedIntakeId) ?? null, [intakeRecords, selectedIntakeId]);
    const selectedInspection = useMemo(() => (selectedIntake ? inspectionRecords.find((row) => row.intakeId === selectedIntake.id) ?? null : null), [inspectionRecords, selectedIntake]);
    useEffect(() => {
        if (selectedIntakeId && !intakeRecords.some((row) => row.id === selectedIntakeId)) {
            setSelectedIntakeId("");
        }
    }, [intakeRecords, selectedIntakeId]);
    useEffect(() => {
        if (selectedInspection) {
            setForm({
                status: selectedInspection.status,
                underHoodState: selectedInspection.underHoodState,
                underHoodSummary: selectedInspection.underHoodSummary,
                recommendedWork: selectedInspection.recommendedWork,
                recommendationLines: selectedInspection.recommendationLines,
                inspectionPhotoNotes: selectedInspection.inspectionPhotoNotes,
                arrivalFrontPhotoNote: selectedInspection.arrivalFrontPhotoNote,
                arrivalDriverSidePhotoNote: selectedInspection.arrivalDriverSidePhotoNote,
                arrivalRearPhotoNote: selectedInspection.arrivalRearPhotoNote,
                arrivalPassengerSidePhotoNote: selectedInspection.arrivalPassengerSidePhotoNote,
                additionalFindingPhotoNotes: selectedInspection.additionalFindingPhotoNotes,
                enableSafetyChecks: selectedInspection.enableSafetyChecks,
                enableTires: selectedInspection.enableTires,
                enableUnderHood: selectedInspection.enableUnderHood ?? true,
                enableBrakes: selectedInspection.enableBrakes,
                enableSuspensionCheck: selectedInspection.enableSuspensionCheck ?? false,
                enableAlignmentCheck: selectedInspection.enableAlignmentCheck ?? false,
                enableAcCheck: selectedInspection.enableAcCheck ?? false,
                enableCoolingCheck: selectedInspection.enableCoolingCheck ?? false,
                coolingFanOperationState: selectedInspection.coolingFanOperationState ?? "Not Checked",
                radiatorConditionState: selectedInspection.radiatorConditionState ?? "Not Checked",
                waterPumpConditionState: selectedInspection.waterPumpConditionState ?? "Not Checked",
                thermostatConditionState: selectedInspection.thermostatConditionState ?? "Not Checked",
                overflowReservoirConditionState: selectedInspection.overflowReservoirConditionState ?? "Not Checked",
                coolingSystemPressureState: selectedInspection.coolingSystemPressureState ?? "Not Checked",
                coolingSystemNotes: selectedInspection.coolingSystemNotes ?? "",
                coolingAdditionalFindings: normalizeAdditionalFindings(selectedInspection.coolingAdditionalFindings),
                enableSteeringCheck: selectedInspection.enableSteeringCheck ?? false,
                steeringWheelPlayState: selectedInspection.steeringWheelPlayState ?? "Not Checked",
                steeringPumpMotorState: selectedInspection.steeringPumpMotorState ?? "Not Checked",
                steeringFluidConditionState: selectedInspection.steeringFluidConditionState ?? "Not Checked",
                steeringHoseConditionState: selectedInspection.steeringHoseConditionState ?? "Not Checked",
                steeringColumnConditionState: selectedInspection.steeringColumnConditionState ?? "Not Checked",
                steeringRoadFeelState: selectedInspection.steeringRoadFeelState ?? "Not Checked",
                steeringSystemNotes: selectedInspection.steeringSystemNotes ?? "",
                steeringAdditionalFindings: normalizeAdditionalFindings(selectedInspection.steeringAdditionalFindings),
                enableEnginePerformanceCheck: selectedInspection.enableEnginePerformanceCheck ?? false,
                engineStartingState: selectedInspection.engineStartingState ?? "Not Checked",
                idleQualityState: selectedInspection.idleQualityState ?? "Not Checked",
                accelerationResponseState: selectedInspection.accelerationResponseState ?? "Not Checked",
                engineMisfireState: selectedInspection.engineMisfireState ?? "Not Checked",
                engineSmokeState: selectedInspection.engineSmokeState ?? "Not Checked",
                fuelEfficiencyConcernState: selectedInspection.fuelEfficiencyConcernState ?? "Not Checked",
                enginePerformanceNotes: selectedInspection.enginePerformanceNotes ?? "",
                enginePerformanceAdditionalFindings: normalizeAdditionalFindings(selectedInspection.enginePerformanceAdditionalFindings),
                enableRoadTestCheck: selectedInspection.enableRoadTestCheck ?? false,
                roadTestNoiseState: selectedInspection.roadTestNoiseState ?? "Not Checked",
                roadTestBrakeFeelState: selectedInspection.roadTestBrakeFeelState ?? "Not Checked",
                roadTestSteeringTrackingState: selectedInspection.roadTestSteeringTrackingState ?? "Not Checked",
                roadTestRideQualityState: selectedInspection.roadTestRideQualityState ?? "Not Checked",
                roadTestAccelerationState: selectedInspection.roadTestAccelerationState ?? "Not Checked",
                roadTestTransmissionShiftState: selectedInspection.roadTestTransmissionShiftState ?? "Not Checked",
                roadTestNotes: selectedInspection.roadTestNotes ?? "",
                roadTestAdditionalFindings: normalizeAdditionalFindings(selectedInspection.roadTestAdditionalFindings),
                acVentTemperature: selectedInspection.acVentTemperature ?? "",
                acCoolingPerformanceState: selectedInspection.acCoolingPerformanceState ?? "Not Checked",
                acCompressorState: selectedInspection.acCompressorState ?? "Not Checked",
                acCondenserFanState: selectedInspection.acCondenserFanState ?? "Not Checked",
                acCabinFilterState: selectedInspection.acCabinFilterState ?? "Not Checked",
                acAirflowState: selectedInspection.acAirflowState ?? "Not Checked",
                acOdorState: selectedInspection.acOdorState ?? "Not Checked",
                acNotes: selectedInspection.acNotes ?? "",
                enableElectricalCheck: selectedInspection.enableElectricalCheck ?? false,
                electricalBatteryVoltage: selectedInspection.electricalBatteryVoltage ?? "",
                electricalChargingVoltage: selectedInspection.electricalChargingVoltage ?? "",
                electricalStarterState: selectedInspection.electricalStarterState ?? "Not Checked",
                electricalAlternatorState: selectedInspection.electricalAlternatorState ?? "Not Checked",
                electricalFuseRelayState: selectedInspection.electricalFuseRelayState ?? "Not Checked",
                electricalWiringState: selectedInspection.electricalWiringState ?? "Not Checked",
                electricalWarningLightState: selectedInspection.electricalWarningLightState ?? "Not Checked",
                electricalNotes: selectedInspection.electricalNotes ?? "",
                enableTransmissionCheck: selectedInspection.enableTransmissionCheck ?? false,
                enableScanCheck: selectedInspection.enableScanCheck ?? false,
                scanPerformed: selectedInspection.scanPerformed ?? false,
                scanToolUsed: selectedInspection.scanToolUsed ?? "",
                scanNotes: selectedInspection.scanNotes ?? "",
                scanUploadNames: selectedInspection.scanUploadNames ?? [],
                transmissionFluidState: selectedInspection.transmissionFluidState ?? "Not Checked",
                transmissionFluidConditionState: selectedInspection.transmissionFluidConditionState ?? "Not Checked",
                transmissionLeakState: selectedInspection.transmissionLeakState ?? "Not Checked",
                shiftingPerformanceState: selectedInspection.shiftingPerformanceState ?? "Not Checked",
                clutchOperationState: selectedInspection.clutchOperationState ?? "Not Checked",
                drivetrainVibrationState: selectedInspection.drivetrainVibrationState ?? "Not Checked",
                cvJointDriveAxleState: selectedInspection.cvJointDriveAxleState ?? "Not Checked",
                transmissionMountState: selectedInspection.transmissionMountState ?? "Not Checked",
                transmissionNotes: selectedInspection.transmissionNotes ?? "",
                alignmentConcernNotes: selectedInspection.alignmentConcernNotes ?? "",
                alignmentRecommended: selectedInspection.alignmentRecommended ?? false,
                alignmentBeforePrintoutName: selectedInspection.alignmentBeforePrintoutName ?? "",
                alignmentAfterPrintoutName: selectedInspection.alignmentAfterPrintoutName ?? "",
                arrivalLights: selectedInspection.arrivalLights,
                arrivalBrokenGlass: selectedInspection.arrivalBrokenGlass,
                arrivalWipers: selectedInspection.arrivalWipers,
                arrivalHorn: selectedInspection.arrivalHorn,
                arrivalCheckEngineLight: selectedInspection.arrivalCheckEngineLight ?? "Not Checked",
                arrivalAbsLight: selectedInspection.arrivalAbsLight ?? "Not Checked",
                arrivalAirbagLight: selectedInspection.arrivalAirbagLight ?? "Not Checked",
                arrivalBatteryLight: selectedInspection.arrivalBatteryLight ?? "Not Checked",
                arrivalOilPressureLight: selectedInspection.arrivalOilPressureLight ?? "Not Checked",
                arrivalTempLight: selectedInspection.arrivalTempLight ?? "Not Checked",
                arrivalTransmissionLight: selectedInspection.arrivalTransmissionLight ?? "Not Checked",
                arrivalOtherWarningLight: selectedInspection.arrivalOtherWarningLight ?? "Not Checked",
                arrivalOtherWarningNote: selectedInspection.arrivalOtherWarningNote ?? "",
                frontLeftTreadMm: selectedInspection.frontLeftTreadMm,
                frontRightTreadMm: selectedInspection.frontRightTreadMm,
                rearLeftTreadMm: selectedInspection.rearLeftTreadMm,
                rearRightTreadMm: selectedInspection.rearRightTreadMm,
                frontLeftWearPattern: selectedInspection.frontLeftWearPattern ?? "Even Wear",
                frontRightWearPattern: selectedInspection.frontRightWearPattern ?? "Even Wear",
                rearLeftWearPattern: selectedInspection.rearLeftWearPattern ?? "Even Wear",
                rearRightWearPattern: selectedInspection.rearRightWearPattern ?? "Even Wear",
                frontLeftTireState: selectedInspection.frontLeftTireState,
                frontRightTireState: selectedInspection.frontRightTireState,
                rearLeftTireState: selectedInspection.rearLeftTireState,
                rearRightTireState: selectedInspection.rearRightTireState,
                frontBrakeCondition: selectedInspection.frontBrakeCondition,
                rearBrakeCondition: selectedInspection.rearBrakeCondition,
                frontBrakeState: selectedInspection.frontBrakeState,
                rearBrakeState: selectedInspection.rearBrakeState,
                inspectionNotes: selectedInspection.inspectionNotes,
                engineOilLevel: selectedInspection.engineOilLevel,
                engineOilCondition: selectedInspection.engineOilCondition,
                engineOilLeaks: selectedInspection.engineOilLeaks,
                coolantLevel: selectedInspection.coolantLevel,
                coolantCondition: selectedInspection.coolantCondition,
                radiatorHoseCondition: selectedInspection.radiatorHoseCondition,
                coolingLeaks: selectedInspection.coolingLeaks,
                brakeFluidLevel: selectedInspection.brakeFluidLevel,
                brakeFluidCondition: selectedInspection.brakeFluidCondition,
                powerSteeringLevel: selectedInspection.powerSteeringLevel,
                powerSteeringCondition: selectedInspection.powerSteeringCondition,
                batteryCondition: selectedInspection.batteryCondition,
                batteryTerminalCondition: selectedInspection.batteryTerminalCondition,
                batteryHoldDownCondition: selectedInspection.batteryHoldDownCondition,
                driveBeltCondition: selectedInspection.driveBeltCondition,
                airFilterCondition: selectedInspection.airFilterCondition,
                intakeHoseCondition: selectedInspection.intakeHoseCondition,
                engineMountCondition: selectedInspection.engineMountCondition,
                wiringCondition: selectedInspection.wiringCondition,
                unusualSmellState: selectedInspection.unusualSmellState,
                unusualSoundState: selectedInspection.unusualSoundState,
                visibleEngineLeakState: selectedInspection.visibleEngineLeakState,
                engineOilNotes: selectedInspection.engineOilNotes,
                coolantNotes: selectedInspection.coolantNotes,
                brakeFluidNotes: selectedInspection.brakeFluidNotes,
                powerSteeringNotes: selectedInspection.powerSteeringNotes,
                batteryNotes: selectedInspection.batteryNotes,
                beltNotes: selectedInspection.beltNotes,
                intakeNotes: selectedInspection.intakeNotes,
                leakNotes: selectedInspection.leakNotes,
                frontShockState: selectedInspection.frontShockState ?? "Not Checked",
                frontBallJointState: selectedInspection.frontBallJointState ?? "Not Checked",
                frontTieRodEndState: selectedInspection.frontTieRodEndState ?? "Not Checked",
                frontRackEndState: selectedInspection.frontRackEndState ?? "Not Checked",
                frontStabilizerLinkState: selectedInspection.frontStabilizerLinkState ?? "Not Checked",
                frontControlArmBushingState: selectedInspection.frontControlArmBushingState ?? "Not Checked",
                frontUpperControlArmState: selectedInspection.frontUpperControlArmState ?? "Not Checked",
                frontLowerControlArmState: selectedInspection.frontLowerControlArmState ?? "Not Checked",
                frontStrutMountState: selectedInspection.frontStrutMountState ?? "Not Checked",
                steeringRackConditionState: selectedInspection.steeringRackConditionState ?? "Not Checked",
                frontCvBootState: selectedInspection.frontCvBootState ?? "Not Checked",
                frontWheelBearingState: selectedInspection.frontWheelBearingState ?? "Not Checked",
                rearSuspensionType: selectedInspection.rearSuspensionType ?? "Coil Spring",
                rearShockState: selectedInspection.rearShockState ?? "Not Checked",
                rearStabilizerLinkState: selectedInspection.rearStabilizerLinkState ?? "Not Checked",
                rearBushingState: selectedInspection.rearBushingState ?? "Not Checked",
                rearSpringState: selectedInspection.rearSpringState ?? "Not Checked",
                rearControlArmState: selectedInspection.rearControlArmState ?? "Not Checked",
                rearCoilSpringState: selectedInspection.rearCoilSpringState ?? "Not Checked",
                rearLeafSpringState: selectedInspection.rearLeafSpringState ?? "Not Checked",
                rearLeafSpringBushingState: selectedInspection.rearLeafSpringBushingState ?? "Not Checked",
                rearUBoltMountState: selectedInspection.rearUBoltMountState ?? "Not Checked",
                rearAxleMountState: selectedInspection.rearAxleMountState ?? "Not Checked",
                rearWheelBearingState: selectedInspection.rearWheelBearingState ?? "Not Checked",
                frontSuspensionNotes: selectedInspection.frontSuspensionNotes ?? "",
                rearSuspensionNotes: selectedInspection.rearSuspensionNotes ?? "",
                steeringFeelNotes: selectedInspection.steeringFeelNotes ?? "",
                suspensionRoadTestNotes: selectedInspection.suspensionRoadTestNotes ?? "",
                evidenceItems: selectedInspection.evidenceItems ?? [],
            });
            setError("");
            return;
        }
        setForm(getDefaultInspectionForm());
        setError("");
    }, [selectedInspection, selectedIntakeId]);
    const filteredInspectionRecords = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term)
            return inspectionRecords;
        return inspectionRecords.filter((row) => [
            row.inspectionNumber,
            row.intakeNumber,
            row.plateNumber,
            row.conductionNumber,
            row.accountLabel,
            row.make,
            row.model,
            row.concern,
        ]
            .join(" ")
            .toLowerCase()
            .includes(term));
    }, [inspectionRecords, search]);
    const inspectionHistoryMatches = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term)
            return [];
        return inspectionRecords
            .filter((row) => [
            row.inspectionNumber,
            row.intakeNumber,
            row.plateNumber,
            row.conductionNumber,
            row.accountLabel,
            row.make,
            row.model,
            row.concern,
        ]
            .join(" ")
            .toLowerCase()
            .includes(term))
            .slice(0, 10);
    }, [inspectionRecords, search]);
    const relatedInspectionHistory = useMemo(() => {
        if (!selectedIntake)
            return [];
        const keyPlate = (selectedIntake.plateNumber || selectedIntake.conductionNumber || "").trim().toLowerCase();
        const keyCustomer = (selectedIntake.companyName || selectedIntake.customerName || "").trim().toLowerCase();
        return inspectionRecords
            .filter((row) => row.id !== selectedInspection?.id &&
            ((!!keyPlate && [row.plateNumber, row.conductionNumber].join(" ").toLowerCase().includes(keyPlate)) ||
                (!!keyCustomer && row.accountLabel.toLowerCase().includes(keyCustomer))))
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .slice(0, 8);
    }, [inspectionRecords, selectedIntake, selectedInspection]);
    const reopenInspection = () => {
        if (!selectedInspection) {
            setError("Select an existing inspection first.");
            return;
        }
        const now = new Date().toISOString();
        setInspectionRecords((prev) => prev.map((row) => row.id === selectedInspection.id
            ? { ...row, status: "In Progress", updatedAt: now, reopenedAt: now, reopenedBy: currentUser.fullName, lastUpdatedBy: currentUser.fullName }
            : row));
        setForm((prev) => ({ ...prev, status: "In Progress" }));
        setError("");
    };
    const autoRecommendations = useMemo(() => {
        const detailed = buildDetailedUnderHoodRecommendations(form);
        const typed = parseRecommendationLines(form.recommendedWork);
        const suspension = buildSuspensionRecommendations(form);
        const cooling = buildCoolingRecommendations(form);
        const steering = buildSteeringRecommendations(form);
        const enginePerformance = buildEnginePerformanceRecommendations(form);
        const roadTest = buildRoadTestRecommendations(form);
        const ac = buildAcRecommendations(form);
        const electrical = buildElectricalRecommendations(form);
        const transmission = buildTransmissionRecommendations(form);
        const alignment = form.alignmentRecommended || form.alignmentConcernNotes.trim() ? ["Wheel Alignment"] : [];
        return [...new Set([...typed, ...detailed, ...suspension, ...cooling, ...steering, ...enginePerformance, ...roadTest, ...ac, ...electrical, ...transmission, ...alignment])];
    }, [form]);
    const overallItems = [
        form.underHoodState,
        form.engineOilLevel,
        form.engineOilCondition,
        form.engineOilLeaks,
        form.coolantLevel,
        form.coolantCondition,
        form.radiatorHoseCondition,
        form.coolingLeaks,
        form.brakeFluidLevel,
        form.brakeFluidCondition,
        form.powerSteeringLevel,
        form.powerSteeringCondition,
        form.batteryCondition,
        form.batteryTerminalCondition,
        form.batteryHoldDownCondition,
        form.driveBeltCondition,
        form.airFilterCondition,
        form.intakeHoseCondition,
        form.engineMountCondition,
        form.wiringCondition,
        form.unusualSmellState,
        form.unusualSoundState,
        form.visibleEngineLeakState,
    ];
    const overallUnderhoodLabel = overallItems.includes("Needs Replacement")
        ? "Needs Replacement"
        : overallItems.includes("Needs Attention")
            ? "Needs Attention"
            : overallItems.includes("Monitor")
                ? "Monitor"
                : overallItems.includes("Good")
                    ? "Good"
                    : "Not Checked";
    const fluidsFields = [
        ["Engine Oil Level", "engineOilLevel"],
        ["Engine Oil Condition", "engineOilCondition"],
        ["Engine Oil Leaks", "engineOilLeaks"],
        ["Coolant Level", "coolantLevel"],
        ["Coolant Condition", "coolantCondition"],
        ["Radiator Hose Condition", "radiatorHoseCondition"],
        ["Cooling Leaks", "coolingLeaks"],
        ["Brake Fluid Level", "brakeFluidLevel"],
        ["Brake Fluid Condition", "brakeFluidCondition"],
        ["Power Steering Level", "powerSteeringLevel"],
        ["Power Steering Condition", "powerSteeringCondition"],
    ];
    const supportFields = [
        ["Battery Condition", "batteryCondition"],
        ["Battery Terminals", "batteryTerminalCondition"],
        ["Battery Hold-Down", "batteryHoldDownCondition"],
        ["Drive Belt Condition", "driveBeltCondition"],
        ["Air Filter Condition", "airFilterCondition"],
        ["Intake Hose Condition", "intakeHoseCondition"],
    ];
    const watchFields = [
        ["Engine Mount Condition", "engineMountCondition"],
        ["Visible Wiring / Connectors", "wiringCondition"],
        ["Unusual Smell", "unusualSmellState"],
        ["Unusual Sound", "unusualSoundState"],
        ["Visible Engine Leak", "visibleEngineLeakState"],
    ];
    const criticalFindingCount = useMemo(() => {
        let count = 0;
        const checkValues = [
            form.underHoodState,
            form.frontLeftTireState,
            form.frontRightTireState,
            form.rearLeftTireState,
            form.rearRightTireState,
            form.frontBrakeState,
            form.rearBrakeState,
            form.frontShockState,
            form.frontBallJointState,
            form.frontTieRodEndState,
            form.frontRackEndState,
            form.rearShockState,
            form.coolingFanOperationState,
            form.radiatorConditionState,
            form.waterPumpConditionState,
            form.steeringWheelPlayState,
            form.steeringPumpMotorState,
            form.engineStartingState,
            form.idleQualityState,
            form.acCoolingPerformanceState,
            form.electricalStarterState,
            form.electricalAlternatorState,
            form.transmissionFluidState,
            form.shiftingPerformanceState,
        ];
        checkValues.forEach((value) => {
            if (value === "Needs Attention" || value === "Needs Replacement")
                count += 1;
        });
        [
            form.arrivalCheckEngineLight,
            form.arrivalAbsLight,
            form.arrivalAirbagLight,
            form.arrivalBatteryLight,
            form.arrivalOilPressureLight,
            form.arrivalTempLight,
            form.arrivalTransmissionLight,
            form.arrivalOtherWarningLight,
        ].forEach((value) => {
            if (value === "On")
                count += 1;
        });
        return count;
    }, [form]);
    const inspectionQuickSections = useMemo(() => {
        const sections = [
            { id: "inspection-overview", label: "Overview", enabled: true },
            { id: "inspection-arrival", label: "Arrival", enabled: form.enableSafetyChecks },
            { id: "inspection-tires", label: "Tires", enabled: form.enableTires },
            { id: "inspection-underhood", label: "Under Hood", enabled: true },
            { id: "inspection-brakes", label: "Brakes", enabled: form.enableBrakes },
            { id: "inspection-suspension", label: "Suspension", enabled: form.enableSuspensionCheck },
            { id: "inspection-cooling", label: "Cooling", enabled: form.enableCoolingCheck },
            { id: "inspection-steering", label: "Steering", enabled: form.enableSteeringCheck },
            { id: "inspection-engineperf", label: "Engine", enabled: form.enableEnginePerformanceCheck },
            { id: "inspection-roadtest", label: "Road Test", enabled: form.enableRoadTestCheck },
            { id: "inspection-ac", label: "A/C", enabled: form.enableAcCheck },
            { id: "inspection-electrical", label: "Electrical", enabled: form.enableElectricalCheck },
            { id: "inspection-scan", label: "Scan", enabled: form.enableScanCheck },
            { id: "inspection-transmission", label: "Transmission", enabled: form.enableTransmissionCheck },
            { id: "inspection-evidence", label: "Evidence", enabled: true },
        ];
        return sections.filter((section) => section.enabled);
    }, [form]);
    const jumpToInspectionSection = (sectionId) => {
        if (typeof document === "undefined")
            return;
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const saveInspection = (nextStatus) => {
        if (!selectedIntake) {
            setError("Select an intake record first.");
            return;
        }
        const underHoodSummary = form.underHoodSummary.trim();
        if (!underHoodSummary) {
            setError("Under the hood summary is required.");
            return;
        }
        const recommendationLines = autoRecommendations;
        const requiresPhotoEvidence = overallItems.includes("Needs Attention") ||
            [
                form.arrivalLights,
                form.arrivalBrokenGlass,
                form.arrivalWipers,
                form.arrivalHorn,
                form.frontLeftTireState,
                form.frontRightTireState,
                form.rearLeftTireState,
                form.rearRightTireState,
                form.frontBrakeState,
                form.rearBrakeState,
                form.frontShockState,
                form.frontBallJointState,
                form.frontTieRodEndState,
                form.frontRackEndState,
                form.frontStabilizerLinkState,
                form.frontControlArmBushingState,
                form.frontUpperControlArmState,
                form.frontLowerControlArmState,
                form.frontStrutMountState,
                form.steeringRackConditionState,
                form.frontCvBootState,
                form.frontWheelBearingState,
                form.rearShockState,
                form.rearStabilizerLinkState,
                form.rearBushingState,
                form.rearSpringState,
                form.rearControlArmState,
                form.rearCoilSpringState,
                form.rearLeafSpringState,
                form.rearLeafSpringBushingState,
                form.rearUBoltMountState,
                form.rearAxleMountState,
                form.rearWheelBearingState,
                form.coolingFanOperationState,
                form.radiatorConditionState,
                form.waterPumpConditionState,
                form.thermostatConditionState,
                form.overflowReservoirConditionState,
                form.coolingSystemPressureState,
                form.steeringWheelPlayState,
                form.steeringPumpMotorState,
                form.steeringFluidConditionState,
                form.steeringHoseConditionState,
                form.steeringColumnConditionState,
                form.steeringRoadFeelState,
                form.engineStartingState,
                form.idleQualityState,
                form.accelerationResponseState,
                form.engineMisfireState,
                form.engineSmokeState,
                form.fuelEfficiencyConcernState,
                form.roadTestNoiseState,
                form.roadTestBrakeFeelState,
                form.roadTestSteeringTrackingState,
                form.roadTestRideQualityState,
                form.roadTestAccelerationState,
                form.roadTestTransmissionShiftState,
                form.acCoolingPerformanceState,
                form.acCompressorState,
                form.acCondenserFanState,
                form.acCabinFilterState,
                form.acAirflowState,
                form.acOdorState,
                form.electricalStarterState,
                form.electricalAlternatorState,
                form.electricalFuseRelayState,
                form.electricalWiringState,
                form.electricalWarningLightState,
                form.transmissionFluidState,
                form.transmissionFluidConditionState,
                form.transmissionLeakState,
                form.shiftingPerformanceState,
                form.clutchOperationState,
                form.drivetrainVibrationState,
                form.cvJointDriveAxleState,
                form.transmissionMountState,
            ].some((value) => value === "Needs Attention" || value === "Needs Replacement");
        if (requiresPhotoEvidence && !form.inspectionPhotoNotes.trim() && form.evidenceItems.length === 0) {
            setError("Photo or video evidence is required when critical findings need attention or replacement.");
            return;
        }
        const now = new Date().toISOString();
        const baseRecord = {
            intakeId: selectedIntake.id,
            intakeNumber: selectedIntake.intakeNumber,
            updatedAt: now,
            status: nextStatus ?? form.status,
            accountLabel: selectedIntake.companyName || selectedIntake.customerName || "Unknown Customer",
            plateNumber: selectedIntake.plateNumber,
            conductionNumber: selectedIntake.conductionNumber,
            make: selectedIntake.make,
            model: selectedIntake.model,
            year: selectedIntake.year,
            color: selectedIntake.color,
            odometerKm: selectedIntake.odometerKm,
            concern: selectedIntake.concern,
            underHoodState: form.underHoodState,
            underHoodSummary,
            recommendedWork: autoRecommendations.join("\n"),
            recommendationLines,
            inspectionPhotoNotes: form.inspectionPhotoNotes.trim(),
            arrivalFrontPhotoNote: form.arrivalFrontPhotoNote.trim(),
            arrivalDriverSidePhotoNote: form.arrivalDriverSidePhotoNote.trim(),
            arrivalRearPhotoNote: form.arrivalRearPhotoNote.trim(),
            arrivalPassengerSidePhotoNote: form.arrivalPassengerSidePhotoNote.trim(),
            additionalFindingPhotoNotes: form.additionalFindingPhotoNotes.map((item) => item.trim()).filter(Boolean),
            enableSafetyChecks: form.enableSafetyChecks,
            enableTires: form.enableTires,
            enableUnderHood: form.enableUnderHood,
            enableBrakes: form.enableBrakes,
            enableSuspensionCheck: form.enableSuspensionCheck,
            enableAlignmentCheck: form.enableAlignmentCheck,
            enableAcCheck: form.enableAcCheck,
            enableCoolingCheck: form.enableCoolingCheck,
            coolingFanOperationState: form.coolingFanOperationState,
            radiatorConditionState: form.radiatorConditionState,
            waterPumpConditionState: form.waterPumpConditionState,
            thermostatConditionState: form.thermostatConditionState,
            overflowReservoirConditionState: form.overflowReservoirConditionState,
            coolingSystemPressureState: form.coolingSystemPressureState,
            coolingSystemNotes: form.coolingSystemNotes.trim(),
            coolingAdditionalFindings: form.coolingAdditionalFindings.map((finding) => ({ ...finding, title: finding.title.trim(), note: finding.note.trim(), photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean) })),
            enableSteeringCheck: form.enableSteeringCheck,
            steeringWheelPlayState: form.steeringWheelPlayState,
            steeringPumpMotorState: form.steeringPumpMotorState,
            steeringFluidConditionState: form.steeringFluidConditionState,
            steeringHoseConditionState: form.steeringHoseConditionState,
            steeringColumnConditionState: form.steeringColumnConditionState,
            steeringRoadFeelState: form.steeringRoadFeelState,
            steeringSystemNotes: form.steeringSystemNotes.trim(),
            steeringAdditionalFindings: form.steeringAdditionalFindings.map((finding) => ({ ...finding, title: finding.title.trim(), note: finding.note.trim(), photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean) })),
            enableEnginePerformanceCheck: form.enableEnginePerformanceCheck,
            engineStartingState: form.engineStartingState,
            idleQualityState: form.idleQualityState,
            accelerationResponseState: form.accelerationResponseState,
            engineMisfireState: form.engineMisfireState,
            engineSmokeState: form.engineSmokeState,
            fuelEfficiencyConcernState: form.fuelEfficiencyConcernState,
            enginePerformanceNotes: form.enginePerformanceNotes.trim(),
            enginePerformanceAdditionalFindings: form.enginePerformanceAdditionalFindings.map((finding) => ({ ...finding, title: finding.title.trim(), note: finding.note.trim(), photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean) })),
            enableRoadTestCheck: form.enableRoadTestCheck,
            roadTestNoiseState: form.roadTestNoiseState,
            roadTestBrakeFeelState: form.roadTestBrakeFeelState,
            roadTestSteeringTrackingState: form.roadTestSteeringTrackingState,
            roadTestRideQualityState: form.roadTestRideQualityState,
            roadTestAccelerationState: form.roadTestAccelerationState,
            roadTestTransmissionShiftState: form.roadTestTransmissionShiftState,
            roadTestNotes: form.roadTestNotes.trim(),
            roadTestAdditionalFindings: form.roadTestAdditionalFindings.map((finding) => ({ ...finding, title: finding.title.trim(), note: finding.note.trim(), photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean) })),
            acVentTemperature: form.acVentTemperature.trim(),
            acCoolingPerformanceState: form.acCoolingPerformanceState,
            acCompressorState: form.acCompressorState,
            acCondenserFanState: form.acCondenserFanState,
            acCabinFilterState: form.acCabinFilterState,
            acAirflowState: form.acAirflowState,
            acOdorState: form.acOdorState,
            acNotes: form.acNotes.trim(),
            enableElectricalCheck: form.enableElectricalCheck,
            electricalBatteryVoltage: form.electricalBatteryVoltage.trim(),
            electricalChargingVoltage: form.electricalChargingVoltage.trim(),
            electricalStarterState: form.electricalStarterState,
            electricalAlternatorState: form.electricalAlternatorState,
            electricalFuseRelayState: form.electricalFuseRelayState,
            electricalWiringState: form.electricalWiringState,
            electricalWarningLightState: form.electricalWarningLightState,
            electricalNotes: form.electricalNotes.trim(),
            enableTransmissionCheck: form.enableTransmissionCheck,
            enableScanCheck: form.enableScanCheck,
            scanPerformed: form.scanPerformed,
            scanToolUsed: form.scanToolUsed.trim(),
            scanNotes: form.scanNotes.trim(),
            scanUploadNames: form.scanUploadNames,
            transmissionFluidState: form.transmissionFluidState,
            transmissionFluidConditionState: form.transmissionFluidConditionState,
            transmissionLeakState: form.transmissionLeakState,
            shiftingPerformanceState: form.shiftingPerformanceState,
            clutchOperationState: form.clutchOperationState,
            drivetrainVibrationState: form.drivetrainVibrationState,
            cvJointDriveAxleState: form.cvJointDriveAxleState,
            transmissionMountState: form.transmissionMountState,
            transmissionNotes: form.transmissionNotes.trim(),
            alignmentConcernNotes: form.alignmentConcernNotes.trim(),
            alignmentRecommended: form.alignmentRecommended,
            alignmentBeforePrintoutName: form.alignmentBeforePrintoutName.trim(),
            alignmentAfterPrintoutName: form.alignmentAfterPrintoutName.trim(),
            arrivalLights: form.arrivalLights,
            arrivalBrokenGlass: form.arrivalBrokenGlass,
            arrivalWipers: form.arrivalWipers,
            arrivalHorn: form.arrivalHorn,
            arrivalCheckEngineLight: form.arrivalCheckEngineLight,
            arrivalAbsLight: form.arrivalAbsLight,
            arrivalAirbagLight: form.arrivalAirbagLight,
            arrivalBatteryLight: form.arrivalBatteryLight,
            arrivalOilPressureLight: form.arrivalOilPressureLight,
            arrivalTempLight: form.arrivalTempLight,
            arrivalTransmissionLight: form.arrivalTransmissionLight,
            arrivalOtherWarningLight: form.arrivalOtherWarningLight,
            arrivalOtherWarningNote: form.arrivalOtherWarningNote.trim(),
            frontLeftTreadMm: form.frontLeftTreadMm.trim(),
            frontRightTreadMm: form.frontRightTreadMm.trim(),
            rearLeftTreadMm: form.rearLeftTreadMm.trim(),
            rearRightTreadMm: form.rearRightTreadMm.trim(),
            frontLeftWearPattern: form.frontLeftWearPattern,
            frontRightWearPattern: form.frontRightWearPattern,
            rearLeftWearPattern: form.rearLeftWearPattern,
            rearRightWearPattern: form.rearRightWearPattern,
            frontLeftTireState: form.frontLeftTireState,
            frontRightTireState: form.frontRightTireState,
            rearLeftTireState: form.rearLeftTireState,
            rearRightTireState: form.rearRightTireState,
            frontBrakeCondition: form.frontBrakeCondition.trim(),
            rearBrakeCondition: form.rearBrakeCondition.trim(),
            frontBrakeState: form.frontBrakeState,
            rearBrakeState: form.rearBrakeState,
            frontShockState: form.frontShockState,
            frontBallJointState: form.frontBallJointState,
            frontTieRodEndState: form.frontTieRodEndState,
            frontRackEndState: form.frontRackEndState,
            frontStabilizerLinkState: form.frontStabilizerLinkState,
            frontControlArmBushingState: form.frontControlArmBushingState,
            frontUpperControlArmState: form.frontUpperControlArmState,
            frontLowerControlArmState: form.frontLowerControlArmState,
            frontStrutMountState: form.frontStrutMountState,
            steeringRackConditionState: form.steeringRackConditionState,
            frontCvBootState: form.frontCvBootState,
            frontWheelBearingState: form.frontWheelBearingState,
            rearSuspensionType: form.rearSuspensionType,
            rearShockState: form.rearShockState,
            rearStabilizerLinkState: form.rearStabilizerLinkState,
            rearBushingState: form.rearBushingState,
            rearSpringState: form.rearSpringState,
            rearControlArmState: form.rearControlArmState,
            rearCoilSpringState: form.rearCoilSpringState,
            rearLeafSpringState: form.rearLeafSpringState,
            rearLeafSpringBushingState: form.rearLeafSpringBushingState,
            rearUBoltMountState: form.rearUBoltMountState,
            rearAxleMountState: form.rearAxleMountState,
            rearWheelBearingState: form.rearWheelBearingState,
            frontSuspensionNotes: form.frontSuspensionNotes.trim(),
            rearSuspensionNotes: form.rearSuspensionNotes.trim(),
            steeringFeelNotes: form.steeringFeelNotes.trim(),
            suspensionRoadTestNotes: form.suspensionRoadTestNotes.trim(),
            inspectionNotes: form.inspectionNotes.trim(),
            engineOilLevel: form.engineOilLevel,
            engineOilCondition: form.engineOilCondition,
            engineOilLeaks: form.engineOilLeaks,
            coolantLevel: form.coolantLevel,
            coolantCondition: form.coolantCondition,
            radiatorHoseCondition: form.radiatorHoseCondition,
            coolingLeaks: form.coolingLeaks,
            brakeFluidLevel: form.brakeFluidLevel,
            brakeFluidCondition: form.brakeFluidCondition,
            powerSteeringLevel: form.powerSteeringLevel,
            powerSteeringCondition: form.powerSteeringCondition,
            batteryCondition: form.batteryCondition,
            batteryTerminalCondition: form.batteryTerminalCondition,
            batteryHoldDownCondition: form.batteryHoldDownCondition,
            driveBeltCondition: form.driveBeltCondition,
            airFilterCondition: form.airFilterCondition,
            intakeHoseCondition: form.intakeHoseCondition,
            engineMountCondition: form.engineMountCondition,
            wiringCondition: form.wiringCondition,
            unusualSmellState: form.unusualSmellState,
            unusualSoundState: form.unusualSoundState,
            visibleEngineLeakState: form.visibleEngineLeakState,
            engineOilNotes: form.engineOilNotes.trim(),
            coolantNotes: form.coolantNotes.trim(),
            brakeFluidNotes: form.brakeFluidNotes.trim(),
            powerSteeringNotes: form.powerSteeringNotes.trim(),
            batteryNotes: form.batteryNotes.trim(),
            beltNotes: form.beltNotes.trim(),
            intakeNotes: form.intakeNotes.trim(),
            leakNotes: form.leakNotes.trim(),
            evidenceItems: form.evidenceItems,
            lastUpdatedBy: currentUser.fullName,
            reopenedAt: selectedInspection?.reopenedAt ?? "",
            reopenedBy: selectedInspection?.reopenedBy ?? "",
            linkedRoIds: selectedInspection?.linkedRoIds ?? [],
        };
        setInspectionRecords((prev) => {
            const existing = prev.find((row) => row.intakeId === selectedIntake.id);
            if (existing) {
                return prev.map((row) => (row.intakeId === selectedIntake.id ? { ...row, ...baseRecord } : row));
            }
            const created = {
                id: uid("insp"),
                inspectionNumber: nextDailyNumber("INSP"),
                createdAt: now,
                startedBy: currentUser.fullName,
                ...baseRecord,
            };
            return [created, ...prev];
        });
        setIntakeRecords((prev) => prev.map((row) => row.id === selectedIntake.id
            ? { ...row, status: "Waiting Inspection", updatedAt: now }
            : row));
        setForm((prev) => ({ ...prev, status: nextStatus ?? prev.status }));
        setError("");
    };
    const renderCheckCard = (title, subtitle, fields, noteFields) => (_jsxs("div", { style: { ...styles.sectionCardMuted, borderRadius: 16 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: title }), _jsx("span", { style: styles.statusNeutral, children: subtitle })] }), _jsx("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: fields.map(([label, key]) => (_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: label }), _jsxs("select", { style: styles.select, value: form[key], onChange: (e) => setForm((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                            })), children: [_jsx("option", { value: "Not Checked", children: "Not Checked" }), _jsx("option", { value: "Good", children: "Good" }), _jsx("option", { value: "Monitor", children: "Monitor" }), _jsx("option", { value: "Needs Attention", children: "Needs Attention" }), _jsx("option", { value: "Needs Replacement", children: "Needs Replacement" })] })] }, String(key)))) }), noteFields?.length ? (_jsx("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: noteFields.map(([label, key, placeholder]) => (_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: label }), _jsx("input", { style: styles.input, value: form[key] || "", onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })), placeholder: placeholder })] }, String(key)))) })) : null] }));
    const renderAdditionalFindingsSection = (category, title, subtitle) => {
        const findings = form[category];
        return (_jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: title }), _jsx("div", { style: styles.formHint, children: subtitle })] }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: () => addCategoryFinding(category), children: "Add Finding" })] }), findings.length === 0 ? (_jsx("div", { style: styles.formHint, children: "No additional findings added for this category." })) : (_jsx("div", { style: styles.formStack, children: findings.map((finding, findingIndex) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("strong", { children: [title, " Finding ", findingIndex + 1] }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => removeCategoryFinding(category, finding.id), children: "Remove" })] }), _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Finding Title" }), _jsx("input", { style: styles.input, value: finding.title, onChange: (e) => updateCategoryFinding(category, finding.id, "title", e.target.value), placeholder: "Example: Cooling fan noisy" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Status" }), _jsxs("select", { style: styles.select, value: finding.status, onChange: (e) => updateCategoryFinding(category, finding.id, "status", e.target.value), children: [_jsx("option", { value: "OK", children: "OK" }), _jsx("option", { value: "Monitor", children: "Monitor" }), _jsx("option", { value: "Replace", children: "Replace" })] })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Finding Note" }), _jsx("textarea", { style: styles.textarea, value: finding.note, onChange: (e) => updateCategoryFinding(category, finding.id, "note", e.target.value), placeholder: "Technician note, observation, or explanation" })] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 4 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: "Photo / Media Notes" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: () => addCategoryFindingPhotoNote(category, finding.id), children: "Add Photo Note" })] }), finding.photoNotes.length === 0 ? (_jsx("div", { style: styles.formHint, children: "No photo or media notes yet." })) : (_jsx("div", { style: styles.formStack, children: finding.photoNotes.map((photoNote, photoIndex) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("strong", { children: ["Photo Note ", photoIndex + 1] }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => removeCategoryFindingPhotoNote(category, finding.id, photoIndex), children: "Remove" })] }), _jsx("input", { style: styles.input, value: photoNote, onChange: (e) => updateCategoryFindingPhotoNote(category, finding.id, photoIndex, e.target.value), placeholder: "Filename, angle, or evidence note" })] }, `${finding.id}_${photoIndex}`))) }))] })] })] }, finding.id))) }))] }));
    };
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [!selectedIntake ? (_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }, children: _jsx(Card, { title: "Inspection Queue", subtitle: "Safety check is first. Tires are second by default.", right: _jsxs("span", { style: styles.statusInfo, children: [eligibleIntakes.length, " in queue"] }), children: eligibleIntakes.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No intake records ready for inspection." })) : (_jsx("div", { style: styles.queueStack, children: eligibleIntakes.map((row) => {
                                const hasInspection = inspectionRecords.some((item) => item.intakeId === row.id);
                                return (_jsxs("button", { type: "button", onClick: () => setSelectedIntakeId(row.id), style: styles.queueCard, children: [_jsxs("div", { style: styles.queueCardHeader, children: [_jsx("strong", { children: row.intakeNumber }), hasInspection ? _jsx("span", { style: (inspectionRecords.find((item) => item.intakeId === row.id)?.status === "Completed") ? styles.statusOk : styles.statusWarning, children: inspectionRecords.find((item) => item.intakeId === row.id)?.status === "Completed" ? "Completed" : "In Progress" }) : _jsx("span", { style: styles.statusInfo, children: "New" })] }), _jsx("div", { style: styles.queueLine, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.queueLineMuted, children: row.companyName || row.customerName || "-" }), _jsx("div", { style: styles.queueLineMuted, children: [row.make, row.model, row.year].filter(Boolean).join("  |  ") })] }, row.id));
                            }) })) }) })) : null, !selectedIntake ? (_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }, children: _jsxs(Card, { title: "Inspection Edit + History Lookup", subtitle: "Search any prior inspection by plate, customer, company, or inspection number and reopen it for editing", right: _jsxs("span", { style: styles.statusInfo, children: [inspectionHistoryMatches.length, " match(es)"] }), children: [showDraftRestore ? (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Draft Recovery" }), _jsx("div", { style: styles.formHint, children: "An unfinished inspection draft was recovered automatically." })] }), _jsx("span", { style: styles.statusWarning, children: "Recovered" })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => setShowDraftRestore(false), children: "Keep Draft" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => { setSelectedIntakeId(""); setForm(getDefaultInspectionForm()); inspectionDraft.clearDraft(); setShowDraftRestore(false); }, children: "Discard Draft" })] })] })) : null, _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Draft Status" }), _jsx("strong", { children: inspectionDraft.draftState })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "History Search" }), _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search by plate, customer, company, inspection no., make, or concern" })] }), !search.trim() ? (_jsx("div", { style: styles.formHint, children: "Select a vehicle from the queue or search older inspection records to reopen and edit them." })) : inspectionHistoryMatches.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No inspection history found for this search." })) : (_jsx("div", { style: styles.mobileCardList, children: inspectionHistoryMatches.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.inspectionNumber }), _jsx(InspectionStatusBadge, { status: row.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: row.accountLabel }), _jsx("div", { style: styles.mobileDataSecondary, children: [row.make, row.model, row.year].filter(Boolean).join(" ") || "-" }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Updated" }), _jsx("strong", { children: formatDateTime(row.updatedAt) })] }), _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.smallButton, onClick: () => setSelectedIntakeId(row.intakeId), children: "Edit Inspection" }) })] }, row.id))) }))] }) })) : null, _jsx("div", { style: { ...styles.gridItem, gridColumn: !selectedIntake ? getResponsiveSpan(12, isCompactLayout) : "span 12" }, children: _jsx(Card, { title: "Inspection Form", subtitle: "Safety first, tires second, under the hood always included, brakes triggered", right: selectedIntake ? (_jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.secondaryButton, onClick: () => { setSelectedIntakeId(""); setError(""); }, children: "Change Vehicle" }), selectedInspection ? _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: reopenInspection, children: "Reopen" }) : null, selectedInspection ? _jsx(InspectionStatusBadge, { status: selectedInspection.status }) : _jsx("span", { style: styles.statusNeutral, children: "Draft Seeded" })] })) : (selectedInspection ? _jsx(InspectionStatusBadge, { status: selectedInspection.status }) : _jsx("span", { style: styles.statusNeutral, children: "Draft Seeded" })), children: !selectedIntake ? (_jsx("div", { style: styles.emptyState, children: "Select an intake from the queue to start inspection." })) : (_jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: styles.inspectionActionBanner, children: [_jsxs("div", { style: styles.inspectionActionSummary, children: [_jsxs("div", { style: styles.inspectionSummaryPill, children: [_jsx("strong", { children: form.status }), _jsx("span", { children: "Current status" })] }), _jsxs("div", { style: styles.inspectionSummaryPill, children: [_jsx("strong", { children: criticalFindingCount }), _jsx("span", { children: "Critical items" })] }), _jsxs("div", { style: styles.inspectionSummaryPill, children: [_jsx("strong", { children: autoRecommendations.length }), _jsx("span", { children: "Auto recommendations" })] }), _jsxs("div", { style: styles.inspectionSummaryPill, children: [_jsx("strong", { children: form.evidenceItems.length }), _jsx("span", { children: "Evidence files" })] })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.primaryButton, onClick: () => saveInspection(), children: "Save Draft / Update" }), _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => saveInspection("Completed"), children: "Save as Completed" }), selectedInspection ? (_jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: reopenInspection, children: "Reopen Inspection" })) : null] })] }), _jsxs("div", { style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "Quick Section Navigation" }), _jsx("div", { style: styles.formHint, children: "Jump to the active inspection sections below to reduce scrolling during encoding." }), _jsx("div", { style: styles.pillWrap, children: inspectionQuickSections.map((section) => (_jsx("button", { type: "button", style: styles.pillButton, onClick: () => jumpToInspectionSection(section.id), children: section.label }, section.id))) })] }), _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }, children: _jsxs("div", { id: "inspection-overview", style: { ...styles.sectionCard, position: isCompactLayout ? "static" : "sticky", top: 16 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Vehicle & Inspection Summary" }), _jsxs("div", { style: styles.summaryGrid, children: [_jsxs("div", { children: [_jsx("strong", { children: "Intake No." }), _jsx("div", { children: selectedIntake.intakeNumber })] }), _jsxs("div", { children: [_jsx("strong", { children: "Status" }), _jsx("div", { children: form.status })] }), _jsxs("div", { children: [_jsx("strong", { children: "Plate" }), _jsx("div", { children: selectedIntake.plateNumber || "-" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Conduction" }), _jsx("div", { children: selectedIntake.conductionNumber || "-" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Customer" }), _jsx("div", { children: selectedIntake.companyName || selectedIntake.customerName || "-" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Vehicle" }), _jsx("div", { children: [selectedIntake.make, selectedIntake.model, selectedIntake.year].filter(Boolean).join(" ") || "-" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Odometer" }), _jsx("div", { children: selectedIntake.odometerKm || "-" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Overall Under Hood" }), _jsx("div", { children: _jsx("span", { style: getCheckValueStyle(overallUnderhoodLabel), children: overallUnderhoodLabel }) })] })] }), _jsxs("div", { style: styles.concernBanner, children: [_jsx("strong", { children: "Concern:" }), " ", selectedIntake.concern] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Inspection Status" }), _jsxs("select", { style: styles.select, value: form.status, onChange: (e) => setForm((prev) => ({ ...prev, status: e.target.value })), children: [_jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Completed", children: "Completed" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Overall Under the Hood State" }), _jsxs("select", { style: styles.select, value: form.underHoodState, onChange: (e) => setForm((prev) => ({ ...prev, underHoodState: e.target.value })), children: [_jsx("option", { value: "Good", children: "Good" }), _jsx("option", { value: "Monitor", children: "Monitor" }), _jsx("option", { value: "Needs Attention", children: "Needs Attention" }), _jsx("option", { value: "Needs Replacement", children: "Needs Replacement" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Photo Evidence / Photo Notes" }), _jsx("input", { style: styles.input, value: form.inspectionPhotoNotes, onChange: (e) => setForm((prev) => ({ ...prev, inspectionPhotoNotes: e.target.value })), placeholder: "File names, camera refs, or note about captured photos" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Under the Hood Summary" }), _jsx("textarea", { style: styles.textareaLarge, value: form.underHoodSummary, onChange: (e) => setForm((prev) => ({ ...prev, underHoodSummary: e.target.value })), placeholder: "Required technician write-up" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Recommended Work / Findings" }), _jsx("textarea", { style: styles.textarea, value: form.recommendedWork, onChange: (e) => setForm((prev) => ({ ...prev, recommendedWork: e.target.value })), placeholder: "Manual notes are merged with auto recommendations" })] }), _jsxs("div", { style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "Auto Recommendations" }), autoRecommendations.length ? (_jsx("div", { style: styles.quickAccessList, children: autoRecommendations.map((item) => (_jsx("div", { style: styles.quickAccessRow, children: _jsx("span", { children: item }) }, item))) })) : (_jsx("div", { style: styles.formHint, children: "No automatic recommendations yet." }))] }), selectedInspection ? (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "Edit Mode" }), _jsxs("div", { style: styles.formHint, children: ["Editing ", selectedInspection.inspectionNumber, "  |  Created ", formatDateTime(selectedInspection.createdAt), "  |  Last updated ", formatDateTime(selectedInspection.updatedAt), selectedInspection.lastUpdatedBy ? ` by ${selectedInspection.lastUpdatedBy}` : ""] })] })) : null, relatedInspectionHistory.length ? (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsx("div", { style: styles.sectionTitle, children: "Related Vehicle / Customer History" }), _jsx("div", { style: styles.quickAccessList, children: relatedInspectionHistory.map((row) => (_jsxs("div", { style: styles.quickAccessRow, children: [_jsxs("span", { children: [row.inspectionNumber, "  |  ", row.plateNumber || row.conductionNumber || "-"] }), _jsx("strong", { children: formatDateTime(row.updatedAt) })] }, row.id))) })] })) : null, error ? _jsx("div", { style: styles.errorBox, children: error }) : null, _jsxs("div", { style: isCompactLayout ? styles.stickyActionBar : styles.inlineActionsColumn, children: [_jsx("button", { type: "button", style: { ...styles.primaryButton, width: "100%" }, onClick: () => saveInspection(), children: "Save Draft / Update" }), _jsx("button", { type: "button", style: { ...styles.smallButtonSuccess, width: "100%" }, onClick: () => saveInspection("Completed"), children: "Mark Complete" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, width: "100%" }, onClick: () => setForm(getDefaultInspectionForm()), children: "Reset Working Form" })] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }, children: _jsxs("div", { style: { marginTop: 16 }, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.toggleGrid, children: [_jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableSafetyChecks, onChange: (e) => setForm((prev) => ({ ...prev, enableSafetyChecks: e.target.checked })) }), _jsx("span", { children: "Enable Arrival / Safety Checks" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableTires, onChange: (e) => setForm((prev) => ({ ...prev, enableTires: e.target.checked })) }), _jsx("span", { children: "Enable Tire Inspection" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableBrakes, onChange: (e) => setForm((prev) => ({ ...prev, enableBrakes: e.target.checked })) }), _jsx("span", { children: "Enable Brake Inspection" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableSuspensionCheck, onChange: (e) => setForm((prev) => ({ ...prev, enableSuspensionCheck: e.target.checked })) }), _jsx("span", { children: "Enable Suspension Check" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableAlignmentCheck, onChange: (e) => setForm((prev) => ({ ...prev, enableAlignmentCheck: e.target.checked })) }), _jsx("span", { children: "Enable Alignment Check" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableCoolingCheck, onChange: (e) => setForm((prev) => ({ ...prev, enableCoolingCheck: e.target.checked })) }), _jsx("span", { children: "Enable Cooling System Check" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableSteeringCheck, onChange: (e) => setForm((prev) => ({ ...prev, enableSteeringCheck: e.target.checked })) }), _jsx("span", { children: "Enable Steering Check" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableEnginePerformanceCheck, onChange: (e) => setForm((prev) => ({ ...prev, enableEnginePerformanceCheck: e.target.checked })) }), _jsx("span", { children: "Enable Engine Performance Check" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableRoadTestCheck, onChange: (e) => setForm((prev) => ({ ...prev, enableRoadTestCheck: e.target.checked })) }), _jsx("span", { children: "Enable Road Test Check" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableAcCheck, onChange: (e) => setForm((prev) => ({ ...prev, enableAcCheck: e.target.checked })) }), _jsx("span", { children: "Enable A/C Check" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableElectricalCheck, onChange: (e) => setForm((prev) => ({ ...prev, enableElectricalCheck: e.target.checked })) }), _jsx("span", { children: "Enable Electrical Check" })] }), _jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.enableScanCheck, onChange: (e) => setForm((prev) => ({ ...prev, enableScanCheck: e.target.checked })) }), _jsx("span", { children: "Enable Scan / OBD2 Check" })] })] }), form.enableSafetyChecks ? (_jsxs("div", { id: "inspection-arrival", style: { ...styles.sectionCard, marginTop: 16, background: "#eff6ff", border: "1px solid #bfdbfe" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Arrival / Safety Checks" }), _jsx("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [
                                                                    ["Lights", "arrivalLights"],
                                                                    ["Broken Glass", "arrivalBrokenGlass"],
                                                                    ["Wipers", "arrivalWipers"],
                                                                    ["Horn", "arrivalHorn"],
                                                                ].map(([label, key]) => (_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: label }), _jsxs("select", { style: styles.select, value: form[key], onChange: (e) => setForm((prev) => ({
                                                                                ...prev,
                                                                                [key]: e.target.value,
                                                                            })), children: [_jsx("option", { value: "Not Checked", children: "Not Checked" }), _jsx("option", { value: "Good", children: "Good" }), _jsx("option", { value: "Needs Attention", children: "Needs Attention" }), _jsx("option", { value: "Needs Replacement", children: "Needs Replacement" })] }), _jsx("span", { style: getCheckValueStyle(form[key]), children: form[key] })] }, key))) }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Warning Lights at Arrival" }), _jsx("div", { style: styles.formHint, children: "Document warning lights before scanning so the shop has an arrival record." }), _jsx("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [
                                                                            ["Check Engine", "arrivalCheckEngineLight"],
                                                                            ["ABS", "arrivalAbsLight"],
                                                                            ["Airbag", "arrivalAirbagLight"],
                                                                            ["Battery", "arrivalBatteryLight"],
                                                                            ["Oil Pressure", "arrivalOilPressureLight"],
                                                                            ["Temperature / Overheat", "arrivalTempLight"],
                                                                            ["Transmission", "arrivalTransmissionLight"],
                                                                            ["Other Warning", "arrivalOtherWarningLight"],
                                                                        ].map(([label, key]) => (_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: label }), _jsxs("select", { style: styles.select, value: form[key], onChange: (e) => setForm((prev) => ({
                                                                                        ...prev,
                                                                                        [key]: e.target.value,
                                                                                    })), children: [_jsx("option", { value: "Not Checked", children: "Not Checked" }), _jsx("option", { value: "Off", children: "Off" }), _jsx("option", { value: "On", children: "On" })] }), _jsx("span", { style: getWarningLightStyle(form[key]), children: form[key] })] }, key))) }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Other Warning Light Note" }), _jsx("input", { style: styles.input, value: form.arrivalOtherWarningNote, onChange: (e) => setForm((prev) => ({ ...prev, arrivalOtherWarningNote: e.target.value })), placeholder: "Cluster message, icon name, or customer warning-light note" })] })] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Exterior Photo Slots" }), _jsx("div", { style: styles.formHint, children: "Save notes, filenames, or placeholders for required exterior photos. Additional findings can be added manually when needed." }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Front Photo" }), _jsx("input", { style: styles.input, value: form.arrivalFrontPhotoNote, onChange: (e) => setForm((prev) => ({ ...prev, arrivalFrontPhotoNote: e.target.value })), placeholder: "Filename, note, or placeholder" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Driver Side Photo" }), _jsx("input", { style: styles.input, value: form.arrivalDriverSidePhotoNote, onChange: (e) => setForm((prev) => ({ ...prev, arrivalDriverSidePhotoNote: e.target.value })), placeholder: "Filename, note, or placeholder" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Rear Photo" }), _jsx("input", { style: styles.input, value: form.arrivalRearPhotoNote, onChange: (e) => setForm((prev) => ({ ...prev, arrivalRearPhotoNote: e.target.value })), placeholder: "Filename, note, or placeholder" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Passenger Side Photo" }), _jsx("input", { style: styles.input, value: form.arrivalPassengerSidePhotoNote, onChange: (e) => setForm((prev) => ({ ...prev, arrivalPassengerSidePhotoNote: e.target.value })), placeholder: "Filename, note, or placeholder" })] })] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("div", { style: styles.sectionTitle, children: "Additional Findings Photo Slots" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: addAdditionalFindingPhotoNote, children: "Add Optional Slot" })] }), form.additionalFindingPhotoNotes.length === 0 ? (_jsx("div", { style: styles.formHint, children: "No optional findings photo slots added yet." })) : (_jsx("div", { style: styles.formStack, children: form.additionalFindingPhotoNotes.map((item, index) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("strong", { children: ["Finding Photo Slot ", index + 1] }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => removeAdditionalFindingPhotoNote(index), children: "Remove" })] }), _jsx("input", { style: styles.input, value: item, onChange: (e) => updateAdditionalFindingPhotoNote(index, e.target.value), placeholder: "Optional filename, location, or note" })] }, `finding_photo_${index}`))) }))] })] })] })) : null, form.enableTires ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#ecfdf5", border: "1px solid #a7f3d0" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Tire Inspection" }), _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Front Left Tread (mm)" }), _jsx("input", { style: styles.input, value: form.frontLeftTreadMm, onChange: (e) => setForm((prev) => ({ ...prev, frontLeftTreadMm: e.target.value })) }), _jsxs("select", { style: styles.select, value: form.frontLeftTireState, onChange: (e) => setForm((prev) => ({ ...prev, frontLeftTireState: e.target.value })), children: [_jsx("option", { value: "Not Checked", children: "Not Checked" }), _jsx("option", { value: "Good", children: "Good" }), _jsx("option", { value: "Monitor", children: "Monitor" }), _jsx("option", { value: "Needs Attention", children: "Needs Attention" }), _jsx("option", { value: "Needs Replacement", children: "Needs Replacement" })] }), _jsxs("select", { style: styles.select, value: form.frontLeftWearPattern, onChange: (e) => setForm((prev) => ({ ...prev, frontLeftWearPattern: e.target.value })), children: [_jsx("option", { value: "Even Wear", children: "Even Wear" }), _jsx("option", { value: "Inner Wear", children: "Inner Wear" }), _jsx("option", { value: "Outer Wear", children: "Outer Wear" }), _jsx("option", { value: "Center Wear", children: "Center Wear" }), _jsx("option", { value: "Uneven Wear", children: "Uneven Wear" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Front Right Tread (mm)" }), _jsx("input", { style: styles.input, value: form.frontRightTreadMm, onChange: (e) => setForm((prev) => ({ ...prev, frontRightTreadMm: e.target.value })) }), _jsxs("select", { style: styles.select, value: form.frontRightTireState, onChange: (e) => setForm((prev) => ({ ...prev, frontRightTireState: e.target.value })), children: [_jsx("option", { value: "Not Checked", children: "Not Checked" }), _jsx("option", { value: "Good", children: "Good" }), _jsx("option", { value: "Monitor", children: "Monitor" }), _jsx("option", { value: "Needs Attention", children: "Needs Attention" }), _jsx("option", { value: "Needs Replacement", children: "Needs Replacement" })] }), _jsxs("select", { style: styles.select, value: form.frontRightWearPattern, onChange: (e) => setForm((prev) => ({ ...prev, frontRightWearPattern: e.target.value })), children: [_jsx("option", { value: "Even Wear", children: "Even Wear" }), _jsx("option", { value: "Inner Wear", children: "Inner Wear" }), _jsx("option", { value: "Outer Wear", children: "Outer Wear" }), _jsx("option", { value: "Center Wear", children: "Center Wear" }), _jsx("option", { value: "Uneven Wear", children: "Uneven Wear" })] })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Rear Left Tread (mm)" }), _jsx("input", { style: styles.input, value: form.rearLeftTreadMm, onChange: (e) => setForm((prev) => ({ ...prev, rearLeftTreadMm: e.target.value })) }), _jsxs("select", { style: styles.select, value: form.rearLeftTireState, onChange: (e) => setForm((prev) => ({ ...prev, rearLeftTireState: e.target.value })), children: [_jsx("option", { value: "Not Checked", children: "Not Checked" }), _jsx("option", { value: "Good", children: "Good" }), _jsx("option", { value: "Monitor", children: "Monitor" }), _jsx("option", { value: "Needs Attention", children: "Needs Attention" }), _jsx("option", { value: "Needs Replacement", children: "Needs Replacement" })] }), _jsxs("select", { style: styles.select, value: form.rearLeftWearPattern, onChange: (e) => setForm((prev) => ({ ...prev, rearLeftWearPattern: e.target.value })), children: [_jsx("option", { value: "Even Wear", children: "Even Wear" }), _jsx("option", { value: "Inner Wear", children: "Inner Wear" }), _jsx("option", { value: "Outer Wear", children: "Outer Wear" }), _jsx("option", { value: "Center Wear", children: "Center Wear" }), _jsx("option", { value: "Uneven Wear", children: "Uneven Wear" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Rear Right Tread (mm)" }), _jsx("input", { style: styles.input, value: form.rearRightTreadMm, onChange: (e) => setForm((prev) => ({ ...prev, rearRightTreadMm: e.target.value })) }), _jsxs("select", { style: styles.select, value: form.rearRightTireState, onChange: (e) => setForm((prev) => ({ ...prev, rearRightTireState: e.target.value })), children: [_jsx("option", { value: "Not Checked", children: "Not Checked" }), _jsx("option", { value: "Good", children: "Good" }), _jsx("option", { value: "Monitor", children: "Monitor" }), _jsx("option", { value: "Needs Attention", children: "Needs Attention" }), _jsx("option", { value: "Needs Replacement", children: "Needs Replacement" })] }), _jsxs("select", { style: styles.select, value: form.rearRightWearPattern, onChange: (e) => setForm((prev) => ({ ...prev, rearRightWearPattern: e.target.value })), children: [_jsx("option", { value: "Even Wear", children: "Even Wear" }), _jsx("option", { value: "Inner Wear", children: "Inner Wear" }), _jsx("option", { value: "Outer Wear", children: "Outer Wear" }), _jsx("option", { value: "Center Wear", children: "Center Wear" }), _jsx("option", { value: "Uneven Wear", children: "Uneven Wear" })] })] })] })] })] })) : null, _jsxs("div", { id: "inspection-underhood", style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Detailed Under the Hood" }), _jsx("div", { style: styles.formHint, children: "Clean grouped cards for a more professional technician workflow. Notes stay beside the related checks." }), _jsxs("div", { style: styles.formStack, children: [renderCheckCard("Fluids", "Core checks", fluidsFields, [
                                                                        ["Engine Oil Notes", "engineOilNotes", "Oil color, top-up, leaks, sludge"],
                                                                        ["Coolant Notes", "coolantNotes", "Reservoir, hose issue, contamination"],
                                                                        ["Brake Fluid Notes", "brakeFluidNotes", "Dark fluid, low level, leaks"],
                                                                        ["Power Steering Notes", "powerSteeringNotes", "Whine, low fluid, hose seepage"],
                                                                    ]), renderCheckCard("Battery / Belts / Intake", "Support systems", supportFields, [
                                                                        ["Battery Notes", "batteryNotes", "Corrosion, weak crank, loose terminal"],
                                                                        ["Belt Notes", "beltNotes", "Cracks, glazing, tension concern"],
                                                                        ["Air Intake Notes", "intakeNotes", "Dirty filter, torn hose, loose clamp"],
                                                                    ]), renderCheckCard("Leaks / Noise / Visible Condition", "Watch items", watchFields, [
                                                                        ["Leak / Noise Notes", "leakNotes", "Seepage area, smell, ticking, vibration"],
                                                                    ])] })] }), form.enableSuspensionCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#f5f3ff", border: "1px solid #ddd6fe" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Suspension Check" }), _jsx("div", { style: styles.formHint, children: "Expanded suspension coverage for cars, SUVs, and pickups. Alignment is recommended when steering or suspension issues are found." }), _jsxs("div", { style: styles.formStack, children: [renderCheckCard("Front Steering / Linkage", "Steering rack, tie rods, ball joints, and linkage", [
                                                                        ["Front Ball Joint", "frontBallJointState"],
                                                                        ["Front Tie Rod End", "frontTieRodEndState"],
                                                                        ["Front Rack End", "frontRackEndState"],
                                                                        ["Steering Rack Condition", "steeringRackConditionState"],
                                                                        ["Front Stabilizer Link", "frontStabilizerLinkState"],
                                                                    ], [
                                                                        ["Steering Feel Notes", "steeringFeelNotes", "Pulling, loose feel, off-center steering, clunking"],
                                                                    ]), renderCheckCard("Front Suspension", "Shock, strut mount, control arms, bushings, CV, and wheel bearing", [
                                                                        ["Front Shock / Strut", "frontShockState"],
                                                                        ["Front Strut Mount", "frontStrutMountState"],
                                                                        ["Front Upper Control Arm", "frontUpperControlArmState"],
                                                                        ["Front Lower Control Arm", "frontLowerControlArmState"],
                                                                        ["Front Control Arm Bushing", "frontControlArmBushingState"],
                                                                        ["Front CV Boot", "frontCvBootState"],
                                                                        ["Front Wheel Bearing", "frontWheelBearingState"],
                                                                    ], [
                                                                        ["Front Suspension Notes", "frontSuspensionNotes", "Leak, play, torn boot, bearing noise, vibration"],
                                                                    ]), _jsx("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Rear Suspension Type" }), _jsxs("select", { style: styles.select, value: form.rearSuspensionType, onChange: (e) => setForm((prev) => ({ ...prev, rearSuspensionType: e.target.value })), children: [_jsx("option", { value: "Coil Spring", children: "Coil Spring" }), _jsx("option", { value: "Leaf Spring", children: "Leaf Spring" }), _jsx("option", { value: "Other", children: "Other" })] }), _jsx("div", { style: styles.formHint, children: "Show only the rear components that match the vehicle setup." })] }) }), renderCheckCard("Rear Suspension", "Rear shocks, links, bushings, springs, control arms, and bearing", [
                                                                        ["Rear Shock", "rearShockState"],
                                                                        ["Rear Stabilizer Link", "rearStabilizerLinkState"],
                                                                        ["Rear Bushing", "rearBushingState"],
                                                                        ["Rear Spring", "rearSpringState"],
                                                                        ["Rear Control Arm", "rearControlArmState"],
                                                                        ["Rear Wheel Bearing", "rearWheelBearingState"],
                                                                    ], [
                                                                        ["Rear Suspension Notes", "rearSuspensionNotes", "Noise, sagging, play, worn bushing, axle movement"],
                                                                        ["Road Test / Noise Notes", "suspensionRoadTestNotes", "Rattle, clunk, pull, vibration, rough ride"],
                                                                    ]), (form.rearSuspensionType === "Coil Spring" || form.rearSuspensionType === "Other") ? renderCheckCard("Rear Coil Spring Group", "Use for sedans, crossovers, and SUVs with coil-spring rear suspension", [
                                                                        ["Rear Coil Spring", "rearCoilSpringState"],
                                                                    ]) : null, (form.rearSuspensionType === "Leaf Spring" || form.rearSuspensionType === "Other") ? renderCheckCard("Rear Leaf Spring Group", "Use for pickups, utility vehicles, and leaf-spring rear setups", [
                                                                        ["Rear Leaf Spring", "rearLeafSpringState"],
                                                                        ["Rear Leaf Spring Bushing", "rearLeafSpringBushingState"],
                                                                        ["Rear U-Bolt / Mount", "rearUBoltMountState"],
                                                                        ["Rear Axle Mount", "rearAxleMountState"],
                                                                    ]) : null] })] })) : null, form.enableAlignmentCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#ecfeff", border: "1px solid #a5f3fc" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Alignment Check" }), _jsx("div", { style: styles.formHint, children: "Upload or capture the before alignment printout. After printout is optional for later." }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Alignment Concern / Notes" }), _jsx("textarea", { style: styles.textarea, value: form.alignmentConcernNotes, onChange: (e) => setForm((prev) => ({ ...prev, alignmentConcernNotes: e.target.value })), placeholder: "Pulling left/right, steering wheel off-center, uneven tire wear, customer request, or technician observation" })] }), _jsxs("label", { style: styles.checkboxCard, children: [_jsx("input", { type: "checkbox", checked: form.alignmentRecommended, onChange: (e) => setForm((prev) => ({ ...prev, alignmentRecommended: e.target.checked })) }), _jsx("span", { children: "Recommend Wheel Alignment" })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Before Alignment Printout" }), _jsx("input", { type: "file", style: styles.input, onChange: (e) => setForm((prev) => ({
                                                                                    ...prev,
                                                                                    alignmentBeforePrintoutName: e.target.files?.[0]?.name || prev.alignmentBeforePrintoutName || "",
                                                                                })) }), _jsxs("div", { style: styles.formHint, children: ["Saved file: ", form.alignmentBeforePrintoutName || "No file selected"] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "After Alignment Printout" }), _jsx("input", { type: "file", style: styles.input, onChange: (e) => setForm((prev) => ({
                                                                                    ...prev,
                                                                                    alignmentAfterPrintoutName: e.target.files?.[0]?.name || prev.alignmentAfterPrintoutName || "",
                                                                                })) }), _jsxs("div", { style: styles.formHint, children: ["Optional for later: ", form.alignmentAfterPrintoutName || "No file selected"] })] })] })] })) : null, form.enableCoolingCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#eff6ff", border: "1px solid #bfdbfe" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Cooling System Inspection" }), _jsx("div", { style: styles.formHint, children: "Use this trigger for overheating, coolant loss, fan concern, radiator issue, or cooling-system complaint." }), _jsx("div", { style: styles.formStack, children: renderCheckCard("Cooling Components", "Fan, radiator, pump, thermostat, and pressure-related checks", [
                                                                    ["Cooling Fan Operation", "coolingFanOperationState"],
                                                                    ["Radiator Condition", "radiatorConditionState"],
                                                                    ["Water Pump Condition", "waterPumpConditionState"],
                                                                    ["Thermostat Condition", "thermostatConditionState"],
                                                                    ["Overflow Reservoir", "overflowReservoirConditionState"],
                                                                    ["Cooling System Pressure", "coolingSystemPressureState"],
                                                                ], [["Cooling Notes", "coolingSystemNotes", "Overheating, coolant loss, fan not engaging, leaks, pressure issue"]]) })] })) : null, form.enableSteeringCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#f5f3ff", border: "1px solid #ddd6fe" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Steering Inspection" }), _jsx("div", { style: styles.formHint, children: "Use this trigger for hard steering, pull, free play, steering noise, fluid leak, or EPS / pump concerns." }), _jsx("div", { style: styles.formStack, children: renderCheckCard("Steering System", "Play, assist, fluid, hose, column, and road feel", [
                                                                    ["Steering Wheel Play", "steeringWheelPlayState"],
                                                                    ["Pump / EPS Motor", "steeringPumpMotorState"],
                                                                    ["Steering Fluid Condition", "steeringFluidConditionState"],
                                                                    ["Steering Hose / Line", "steeringHoseConditionState"],
                                                                    ["Steering Column", "steeringColumnConditionState"],
                                                                    ["Steering Road Feel", "steeringRoadFeelState"],
                                                                ], [["Steering Notes", "steeringSystemNotes", "Hard steering, wandering, free play, leak, assist issue, noise"]]) })] })) : null, form.enableEnginePerformanceCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#fff7ed", border: "1px solid #fdba74" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Engine Performance Inspection" }), _jsx("div", { style: styles.formHint, children: "Use this trigger for rough idle, weak power, misfire, smoke, hesitation, poor fuel economy, or drivability concerns." }), _jsx("div", { style: styles.formStack, children: renderCheckCard("Engine Performance", "Starting, idle, response, misfire, smoke, and economy-related checks", [
                                                                    ["Starting Performance", "engineStartingState"],
                                                                    ["Idle Quality", "idleQualityState"],
                                                                    ["Acceleration Response", "accelerationResponseState"],
                                                                    ["Misfire / Combustion", "engineMisfireState"],
                                                                    ["Smoke Condition", "engineSmokeState"],
                                                                    ["Fuel Efficiency Concern", "fuelEfficiencyConcernState"],
                                                                ], [["Engine Performance Notes", "enginePerformanceNotes", "Hard start, rough idle, hesitation, smoke color, power loss"]]) })] })) : null, form.enableRoadTestCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#ecfeff", border: "1px solid #a5f3fc" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Road Test Inspection" }), _jsx("div", { style: styles.formHint, children: "Use this trigger for issues that only appear while driving, including noises, pull, brake feel, ride quality, and shift behavior." }), _jsx("div", { style: styles.formStack, children: renderCheckCard("Road Test Findings", "Noise, braking, steering tracking, ride quality, acceleration, and shift feel", [
                                                                    ["Noise While Driving", "roadTestNoiseState"],
                                                                    ["Brake Feel", "roadTestBrakeFeelState"],
                                                                    ["Steering Tracking", "roadTestSteeringTrackingState"],
                                                                    ["Ride Quality", "roadTestRideQualityState"],
                                                                    ["Acceleration Feel", "roadTestAccelerationState"],
                                                                    ["Transmission Shift Feel", "roadTestTransmissionShiftState"],
                                                                ], [["Road Test Notes", "roadTestNotes", "Pulling, vibration, clunk, delayed shift, harsh brake feel, rough ride"]]) })] })) : null, form.enableAcCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#ecfdf5", border: "1px solid #a7f3d0" }, children: [_jsx("div", { style: styles.sectionTitle, children: "A/C Inspection" }), _jsx("div", { style: styles.formHint, children: "Use this triggered section for weak cooling, bad smell, noisy compressor, poor airflow, or customer-requested A/C checks." }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Vent Temperature" }), _jsx("input", { style: styles.input, value: form.acVentTemperature, onChange: (e) => setForm((prev) => ({ ...prev, acVentTemperature: e.target.value })), placeholder: "Example: 8\u00B0C or 46\u00B0F" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "A/C Notes" }), _jsx("input", { style: styles.input, value: form.acNotes, onChange: (e) => setForm((prev) => ({ ...prev, acNotes: e.target.value })), placeholder: "Weak cooling, noisy clutch, odor, intermittent cooling" })] })] }), _jsxs("div", { style: styles.formStack, children: [renderCheckCard("Cooling / Compressor", "Core A/C checks", [
                                                                        ["Cooling Performance", "acCoolingPerformanceState"],
                                                                        ["Compressor Engagement", "acCompressorState"],
                                                                        ["Condenser Fan", "acCondenserFanState"],
                                                                    ]), renderCheckCard("Airflow / Cabin", "Cabin comfort checks", [
                                                                        ["Cabin Filter", "acCabinFilterState"],
                                                                        ["Airflow / Vent Output", "acAirflowState"],
                                                                        ["Odor / Smell", "acOdorState"],
                                                                    ])] })] })) : null, form.enableElectricalCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#eff6ff", border: "1px solid #facc15", boxShadow: "0 0 0 1px rgba(239,68,68,0.05) inset" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Electrical Inspection" }), _jsx("div", { style: styles.formHint, children: "Use this triggered section for no-start, weak battery, warning lights, intermittent electrical faults, or charging complaints." }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Battery Voltage" }), _jsx("input", { style: styles.input, value: form.electricalBatteryVoltage, onChange: (e) => setForm((prev) => ({ ...prev, electricalBatteryVoltage: e.target.value })), placeholder: "Example: 12.6V" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Charging Voltage" }), _jsx("input", { style: styles.input, value: form.electricalChargingVoltage, onChange: (e) => setForm((prev) => ({ ...prev, electricalChargingVoltage: e.target.value })), placeholder: "Example: 13.8V to 14.5V" })] })] }), _jsxs("div", { style: styles.formStack, children: [renderCheckCard("Starting / Charging", "Battery, starter, and alternator checks", [
                                                                        ["Starter Condition", "electricalStarterState"],
                                                                        ["Alternator / Charging", "electricalAlternatorState"],
                                                                    ]), renderCheckCard("Wiring / Controls", "Basic electrical condition checks", [
                                                                        ["Fuse / Relay Condition", "electricalFuseRelayState"],
                                                                        ["Visible Wiring Condition", "electricalWiringState"],
                                                                        ["Warning Light / Scan Need", "electricalWarningLightState"],
                                                                    ], [["Electrical Notes", "electricalNotes", "No-start, dim lights, intermittent issue, warning code note"]])] })] })) : null, form.enableTransmissionCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#fff7ed", border: "1px solid #fdba74" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Transmission / Drivetrain Inspection" }), _jsx("div", { style: styles.formHint, children: "Use this triggered section for shifting issues, slipping, drivetrain vibration, fluid leaks, clutch complaints, or customer-requested transmission checks." }), _jsxs("div", { style: styles.formStack, children: [renderCheckCard("Fluid / Leaks", "Transmission fluid and leak condition", [
                                                                        ["Transmission Fluid Level", "transmissionFluidState"],
                                                                        ["Transmission Fluid Condition", "transmissionFluidConditionState"],
                                                                        ["Transmission Leak", "transmissionLeakState"],
                                                                    ]), renderCheckCard("Operation / Drivetrain", "Driveability and drivetrain checks", [
                                                                        ["Shifting Performance", "shiftingPerformanceState"],
                                                                        ["Clutch Operation", "clutchOperationState"],
                                                                        ["Drivetrain Vibration", "drivetrainVibrationState"],
                                                                        ["CV Joint / Drive Axle", "cvJointDriveAxleState"],
                                                                        ["Transmission Mount", "transmissionMountState"],
                                                                    ], [["Transmission Notes", "transmissionNotes", "Slipping, delayed shift, hard shift, vibration, noise, clutch feel"]])] })] })) : null, form.enableScanCheck ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#ecfeff", border: "1px solid #a5f3fc" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Scan / OBD2 Check" }), _jsx("div", { style: styles.formHint, children: "Upload OBD2 scan results as PDF or photo. Use this for warning lights, diagnostic documentation, and before/after scan proof." }), _jsxs("label", { style: styles.checkboxCard, children: [_jsx("input", { type: "checkbox", checked: form.scanPerformed, onChange: (e) => setForm((prev) => ({ ...prev, scanPerformed: e.target.checked })) }), _jsx("span", { children: "Scan Performed" })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Scanner Used" }), _jsx("input", { style: styles.input, value: form.scanToolUsed, onChange: (e) => setForm((prev) => ({ ...prev, scanToolUsed: e.target.value })), placeholder: "Autel, Launch, Bosch, OEM tool, mobile scanner, etc." })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Upload Scan Result" }), _jsx("input", { type: "file", style: styles.input, accept: ".pdf,image/*", multiple: true, onChange: (e) => addScanUploadNames(e.target.files) }), _jsx("div", { style: styles.formHint, children: "Accepted: PDF, photos, screenshots of scan results." })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Scan Notes" }), _jsx("textarea", { style: styles.textarea, value: form.scanNotes, onChange: (e) => setForm((prev) => ({ ...prev, scanNotes: e.target.value })), placeholder: "Scanner notes, pending codes, freeze-frame note, cleared / not cleared, or customer explanation" })] }), form.scanUploadNames.length ? (_jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Uploaded Scan Results" }), _jsx("div", { style: styles.mobileCardList, children: form.scanUploadNames.map((fileName, index) => (_jsx("div", { style: styles.mobileDataCard, children: _jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: fileName }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => removeScanUploadName(index), children: "Remove" })] }) }, `${fileName}_${index}`))) })] })) : null] })) : null, form.enableBrakes ? (_jsxs("div", { style: { ...styles.sectionCard, marginTop: 16, background: "#fff1f2", border: "1px solid #fecdd3" }, children: [_jsx("div", { style: styles.sectionTitle, children: "Brake Inspection" }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Front Brake Condition" }), _jsx("input", { style: styles.input, value: form.frontBrakeCondition, onChange: (e) => setForm((prev) => ({ ...prev, frontBrakeCondition: e.target.value })), placeholder: "Good / Needs attention / Bad" }), _jsxs("select", { style: styles.select, value: form.frontBrakeState, onChange: (e) => setForm((prev) => ({ ...prev, frontBrakeState: e.target.value })), children: [_jsx("option", { value: "Not Checked", children: "Not Checked" }), _jsx("option", { value: "Good", children: "Good" }), _jsx("option", { value: "Monitor", children: "Monitor" }), _jsx("option", { value: "Needs Attention", children: "Needs Attention" }), _jsx("option", { value: "Needs Replacement", children: "Needs Replacement" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Rear Brake Condition" }), _jsx("input", { style: styles.input, value: form.rearBrakeCondition, onChange: (e) => setForm((prev) => ({ ...prev, rearBrakeCondition: e.target.value })), placeholder: "Good / Needs attention / Bad" }), _jsxs("select", { style: styles.select, value: form.rearBrakeState, onChange: (e) => setForm((prev) => ({ ...prev, rearBrakeState: e.target.value })), children: [_jsx("option", { value: "Not Checked", children: "Not Checked" }), _jsx("option", { value: "Good", children: "Good" }), _jsx("option", { value: "Monitor", children: "Monitor" }), _jsx("option", { value: "Needs Attention", children: "Needs Attention" }), _jsx("option", { value: "Needs Replacement", children: "Needs Replacement" })] })] })] })] })) : null, _jsxs("div", { style: { ...styles.sectionCard, marginTop: 16 }, children: [_jsx("div", { style: styles.sectionTitle, children: "General Inspection Notes" }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Inspection Notes" }), _jsx("textarea", { style: styles.textarea, value: form.inspectionNotes, onChange: (e) => setForm((prev) => ({ ...prev, inspectionNotes: e.target.value })), placeholder: "Additional notes" })] })] })] }) })] })] })) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsxs(Card, { title: "Inspection Registry", subtitle: "Saved inspections linked to intake records", right: _jsxs("span", { style: styles.statusNeutral, children: [filteredInspectionRecords.length, " saved"] }), children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Search" }), _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search inspection no, intake no, plate, customer, vehicle, concern" })] }), filteredInspectionRecords.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No inspections saved yet." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: filteredInspectionRecords.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.inspectionNumber }), _jsx(InspectionStatusBadge, { status: row.status })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["Linked Intake: ", row.intakeNumber] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: row.accountLabel }), _jsx("div", { style: styles.mobileDataSecondary, children: [row.make, row.model, row.year, row.color].filter(Boolean).join("  |  ") || "-" }), _jsxs("div", { style: styles.formHint, children: ["Evidence: ", row.evidenceItems?.length || 0] }), _jsx("div", { style: styles.concernCard, children: row.underHoodSummary || "No under the hood summary." })] }, row.id))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Inspection No." }), _jsx("th", { style: styles.th, children: "Linked Intake" }), _jsx("th", { style: styles.th, children: "Plate / Customer" }), _jsx("th", { style: styles.th, children: "Vehicle" }), _jsx("th", { style: styles.th, children: "Default Category" }), _jsx("th", { style: styles.th, children: "Evidence" }), _jsx("th", { style: styles.th, children: "Status" })] }) }), _jsx("tbody", { children: filteredInspectionRecords.map((row) => (_jsxs("tr", { children: [_jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: row.inspectionNumber }), _jsx("div", { style: styles.tableSecondary, children: formatDateTime(row.createdAt) })] }), _jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: row.intakeNumber }), _jsx("div", { style: styles.tableSecondary, children: row.concern || "-" })] }), _jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.tableSecondary, children: row.accountLabel })] }), _jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: [row.make, row.model].filter(Boolean).join(" ") || "-" }), _jsx("div", { style: styles.tableSecondary, children: [row.year, row.color, row.odometerKm && `${row.odometerKm} km`].filter(Boolean).join("  |  ") })] }), _jsx("td", { style: styles.td, children: _jsx("div", { style: styles.concernCell, children: row.underHoodSummary }) }), _jsx("td", { style: styles.td, children: row.evidenceItems?.length || 0 }), _jsx("td", { style: styles.td, children: _jsx(InspectionStatusBadge, { status: row.status }) })] }, row.id))) })] }) }))] }) })] }) }));
}
function RepairOrdersPage({ currentUser, users, intakeRecords, inspectionRecords, repairOrders, setRepairOrders, setIntakeRecords, approvalRecords, setApprovalRecords, backjobRecords, setBackjobRecords, partsRequests, releaseRecords, approvalLinkTokens, autoPortalMessage, smsApprovalLogs, onGenerateSmsApprovalLink, onOpenDemoCustomerApprovalLink, onSendSmsTemplate, onRevokeApprovalLink, isCompactLayout, }) {
    const [creationMode, setCreationMode] = useState("Intake");
    const [selectedIntakeId, setSelectedIntakeId] = useState("");
    const [selectedRoId, setSelectedRoId] = useState("");
    const [form, setForm] = useState(() => getDefaultRepairOrderForm(currentUser.fullName));
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [approvalSummary, setApprovalSummary] = useState("");
    const [approvalCommHook, setApprovalCommHook] = useState("SMS / Email placeholder");
    const [approvalPreviewMode, setApprovalPreviewMode] = useState("Advisor");
    const [backjobComplaint, setBackjobComplaint] = useState("");
    const [backjobRootCause, setBackjobRootCause] = useState("");
    const [backjobOutcome, setBackjobOutcome] = useState("Customer Pay");
    const [backjobResolutionNotes, setBackjobResolutionNotes] = useState("");
    const smsProviderDefaults = getSmsProviderConfig();
    const [smsProviderMode, setSmsProviderMode] = useState(smsProviderDefaults.mode);
    const [smsAndroidGatewayUrl, setSmsAndroidGatewayUrl] = useState(smsProviderDefaults.gatewayUrl);
    const [smsAndroidGatewayApiKey, setSmsAndroidGatewayApiKey] = useState(smsProviderDefaults.authToken);
    const [smsAndroidSenderDeviceLabel, setSmsAndroidSenderDeviceLabel] = useState(smsProviderDefaults.senderDeviceLabel);
    const [smsTwilioAccountSid, setSmsTwilioAccountSid] = useState(smsProviderDefaults.twilioAccountSid);
    const [smsTwilioFromNumber, setSmsTwilioFromNumber] = useState(smsProviderDefaults.twilioFromNumber);
    const [smsProviderConfigFeedback, setSmsProviderConfigFeedback] = useState("");
    const [isCreatingRO, setIsCreatingRO] = useState(false);
    const [isSavingSmsProviderSettings, setIsSavingSmsProviderSettings] = useState(false);
    const [isGeneratingApprovalLink, setIsGeneratingApprovalLink] = useState(false);
    const [resendingSmsLogId, setResendingSmsLogId] = useState("");
    const [draftRecommendationTitles, setDraftRecommendationTitles] = useState([]);
    const [roRecommendationTitlesById, setRoRecommendationTitlesById] = useState({});
    const [dismissedMileageSuggestionIdsByScope, setDismissedMileageSuggestionIdsByScope] = useState({});
    const sortedRepairOrders = useMemo(() => repairOrders, [repairOrders]);
    const availableIntakes = useMemo(() => {
        const linkedIds = new Set(repairOrders.filter((row) => row.intakeId).map((row) => row.intakeId));
        return intakeRecords.filter((row) => row.status !== "Cancelled" && !linkedIds.has(row.id));
    }, [intakeRecords, repairOrders]);
    const selectedIntake = useMemo(() => availableIntakes.find((row) => row.id === selectedIntakeId) ?? null, [availableIntakes, selectedIntakeId]);
    const linkedInspection = useMemo(() => {
        if (!selectedIntake)
            return null;
        return inspectionRecords.find((row) => row.intakeId === selectedIntake.id) ?? null;
    }, [inspectionRecords, selectedIntake]);
    const selectedRO = useMemo(() => sortedRepairOrders.find((row) => row.id === selectedRoId) ?? null, [sortedRepairOrders, selectedRoId]);
    const draftMaintenanceSuggestions = useMemo(() => getUnifiedMaintenanceSuggestions({
        make: form.make,
        model: form.model,
        year: form.year,
        odometerKm: form.odometerKm,
        plateNumber: form.plateNumber,
        conductionNumber: form.conductionNumber,
        serviceHistoryRepairOrders: repairOrders,
        existingRecommendationTitles: draftRecommendationTitles,
        existingWorkLineTitles: form.workLines.map((line) => line.title),
        dismissedSuggestionIds: dismissedMileageSuggestionIdsByScope.draft ?? [],
    }), [
        dismissedMileageSuggestionIdsByScope.draft,
        draftRecommendationTitles,
        form.conductionNumber,
        form.make,
        form.model,
        form.odometerKm,
        form.plateNumber,
        form.workLines,
        form.year,
        repairOrders,
    ]);
    const selectedROMaintenanceSuggestions = useMemo(() => selectedRO
        ? getUnifiedMaintenanceSuggestions({
            make: selectedRO.make,
            model: selectedRO.model,
            year: selectedRO.year,
            odometerKm: selectedRO.odometerKm,
            plateNumber: selectedRO.plateNumber,
            conductionNumber: selectedRO.conductionNumber,
            serviceHistoryRepairOrders: repairOrders,
            existingRecommendationTitles: roRecommendationTitlesById[selectedRO.id] ?? [],
            existingWorkLineTitles: selectedRO.workLines.map((line) => line.title),
            dismissedSuggestionIds: dismissedMileageSuggestionIdsByScope[`ro:${selectedRO.id}`] ?? [],
        })
        : [], [dismissedMileageSuggestionIdsByScope, repairOrders, roRecommendationTitlesById, selectedRO]);
    const selectedApproval = useMemo(() => selectedRO
        ? approvalRecords
            .filter((row) => row.roId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
        : null, [approvalRecords, selectedRO]);
    const selectedBackjobs = useMemo(() => selectedRO
        ? backjobRecords
            .filter((row) => row.linkedRoId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [], [backjobRecords, selectedRO]);
    const selectedPartsRequests = useMemo(() => selectedRO
        ? partsRequests
            .filter((row) => row.roId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [], [partsRequests, selectedRO]);
    const selectedReleaseRecord = useMemo(() => selectedRO
        ? releaseRecords.find((row) => row.roId === selectedRO.id) ?? null
        : null, [releaseRecords, selectedRO]);
    const latestVehicleOdometerByKey = useMemo(() => {
        const latest = new Map();
        const remember = (vehicleKey, date, odometerKm) => {
            const key = vehicleKey.trim();
            const odo = odometerKm.trim();
            if (!key || !odo)
                return;
            const existing = latest.get(key);
            if (!existing || date >= existing.date) {
                latest.set(key, { date, odometerKm: odo });
            }
        };
        intakeRecords.forEach((row) => {
            remember(normalizeVehicleKey(row.plateNumber, row.conductionNumber), row.updatedAt || row.createdAt, row.odometerKm);
        });
        repairOrders.forEach((row) => {
            remember(normalizeVehicleKey(row.plateNumber, row.conductionNumber), row.updatedAt || row.createdAt, row.odometerKm);
        });
        return latest;
    }, [intakeRecords, repairOrders]);
    const oilChangeReminders = useMemo(() => {
        const reminders = [];
        repairOrders.forEach((ro) => {
            const vehicleKey = normalizeVehicleKey(ro.plateNumber, ro.conductionNumber);
            if (!vehicleKey)
                return;
            const oilChangeLines = ro.workLines.filter(isOilChangeServiceLine);
            if (!oilChangeLines.length)
                return;
            const latestLine = oilChangeLines
                .slice()
                .sort((a, b) => (b.completedAt || b.approvalAt || ro.updatedAt || ro.createdAt).localeCompare(a.completedAt || a.approvalAt || ro.updatedAt || ro.createdAt))[0];
            if (!latestLine)
                return;
            const serviceDate = latestLine.completedAt || latestLine.approvalAt || ro.updatedAt || ro.createdAt;
            const serviceOdometer = parseOdometerValue(ro.odometerKm);
            if (serviceOdometer == null)
                return;
            const oilType = inferOilChangeTypeFromText(latestLine.title, latestLine.customerDescription, latestLine.category, latestLine.notes, ro.customerConcern);
            const policy = getOilChangePolicy(oilType);
            const dueDate = addMonthsToDate(serviceDate, policy.months);
            const currentOdometer = parseOdometerValue(latestVehicleOdometerByKey.get(vehicleKey)?.odometerKm ?? ro.odometerKm) ?? serviceOdometer;
            const dueOdometerKm = serviceOdometer + policy.kilometers;
            const dueByDate = Date.now() >= dueDate.getTime();
            const dueByDistance = currentOdometer >= dueOdometerKm;
            const reminderDue = dueByDate || dueByDistance;
            reminders.push({
                vehicleKey,
                roId: ro.id,
                roNumber: ro.roNumber,
                customerName: ro.accountLabel || ro.customerName || "Customer",
                vehicleLabel: [ro.make, ro.model, ro.year].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Vehicle",
                plateNumber: ro.plateNumber || "",
                conductionNumber: ro.conductionNumber || "",
                oilType,
                serviceDate,
                serviceOdometerKm: ro.odometerKm,
                currentOdometerKm: String(currentOdometer),
                dueDate: dueDate.toISOString(),
                dueOdometerKm,
                isDue: reminderDue,
                dueReason: reminderDue
                    ? dueByDate && dueByDistance
                        ? `Due by date and mileage`
                        : dueByDate
                            ? `Due by date`
                            : `Due by mileage`
                    : `Due on ${formatDateTime(dueDate.toISOString())} or at ${dueOdometerKm.toLocaleString()} km`,
                sourceLineTitle: latestLine.title || "Oil Change",
                sourceLineNotes: latestLine.notes || latestLine.customerDescription || "",
            });
        });
        return reminders.sort((a, b) => Number(b.isDue) - Number(a.isDue) || b.serviceDate.localeCompare(a.serviceDate));
    }, [latestVehicleOdometerByKey, repairOrders]);
    const releaseFollowUpReminders = useMemo(() => {
        const reminders = [];
        const latestReleaseByRoId = new Map();
        releaseRecords.forEach((row) => {
            const existing = latestReleaseByRoId.get(row.roId);
            if (!existing || row.createdAt > existing.createdAt) {
                latestReleaseByRoId.set(row.roId, row);
            }
        });
        latestReleaseByRoId.forEach((release) => {
            const ro = repairOrders.find((row) => row.id === release.roId);
            if (!ro || ro.status !== "Released")
                return;
            const vehicleKey = normalizeVehicleKey(ro.plateNumber, ro.conductionNumber);
            if (!vehicleKey)
                return;
            const releaseDate = release.createdAt || ro.updatedAt || ro.createdAt;
            const dueDate = addDaysToDate(releaseDate, 3);
            if (Number.isNaN(dueDate.getTime()))
                return;
            const hasNewerJob = repairOrders.some((candidate) => candidate.id !== ro.id &&
                normalizeVehicleKey(candidate.plateNumber, candidate.conductionNumber) === vehicleKey &&
                candidate.createdAt > releaseDate);
            if (hasNewerJob)
                return;
            const isDue = Date.now() >= dueDate.getTime();
            reminders.push({
                vehicleKey,
                roId: ro.id,
                roNumber: ro.roNumber,
                releaseNumber: release.releaseNumber,
                customerName: ro.accountLabel || ro.customerName || "Customer",
                vehicleLabel: [ro.make, ro.model, ro.year].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Vehicle",
                plateNumber: ro.plateNumber || "",
                conductionNumber: ro.conductionNumber || "",
                releaseDate,
                dueDate: dueDate.toISOString(),
                isDue,
                dueReason: isDue
                    ? "Due now"
                    : `Available on ${formatDateTime(dueDate.toISOString())}`,
            });
        });
        return reminders.sort((a, b) => Number(b.isDue) - Number(a.isDue) || b.releaseDate.localeCompare(a.releaseDate));
    }, [repairOrders, releaseRecords]);
    const [selectedOilReminderVehicleKey, setSelectedOilReminderVehicleKey] = useState("");
    const [selectedFollowUpVehicleKey, setSelectedFollowUpVehicleKey] = useState("");
    const activeOilChangeReminder = useMemo(() => {
        if (selectedOilReminderVehicleKey) {
            return oilChangeReminders.find((reminder) => reminder.vehicleKey === selectedOilReminderVehicleKey) ?? oilChangeReminders[0] ?? null;
        }
        if (selectedRO) {
            return oilChangeReminders.find((reminder) => reminder.roId === selectedRO.id) ?? oilChangeReminders[0] ?? null;
        }
        return oilChangeReminders[0] ?? null;
    }, [oilChangeReminders, selectedOilReminderVehicleKey, selectedRO]);
    const activeReleaseFollowUpReminder = useMemo(() => {
        if (selectedFollowUpVehicleKey) {
            return releaseFollowUpReminders.find((reminder) => reminder.vehicleKey === selectedFollowUpVehicleKey) ?? releaseFollowUpReminders[0] ?? null;
        }
        if (selectedRO) {
            return releaseFollowUpReminders.find((reminder) => reminder.roId === selectedRO.id) ?? releaseFollowUpReminders[0] ?? null;
        }
        return releaseFollowUpReminders[0] ?? null;
    }, [releaseFollowUpReminders, selectedFollowUpVehicleKey, selectedRO]);
    const activeApprovalLinkToken = useMemo(() => (selectedRO ? getLatestActiveApprovalLinkForRo(approvalLinkTokens, selectedRO.id) : null), [approvalLinkTokens, selectedRO]);
    const selectedROInspection = useMemo(() => selectedRO
        ? inspectionRecords.find((row) => row.id === selectedRO.inspectionId) ??
            inspectionRecords.find((row) => row.intakeId === selectedRO.intakeId) ??
            null
        : null, [inspectionRecords, selectedRO]);
    const findingRecommendations = useMemo(() => {
        if (!selectedROInspection || !selectedRO)
            return [];
        const mappedSourceIds = new Set(selectedRO.workLines
            .map((line) => line.recommendationSource || "")
            .filter((value) => value.startsWith("Finding:"))
            .map((value) => value.replace("Finding:", "")));
        return buildFindingToRORecommendations(selectedROInspection).map((item) => {
            const existingDecision = selectedRO.findingRecommendationDecisions.find((entry) => entry.recommendationId === item.id);
            const decision = existingDecision?.decision ?? (mappedSourceIds.has(item.id) ? "Approved" : "Pending");
            const decidedAt = existingDecision?.decidedAt ?? "";
            return {
                ...item,
                decision: toApprovalDecision(decision),
                decidedAt,
            };
        });
    }, [selectedRO, selectedROInspection]);
    const pendingFindingRecommendations = findingRecommendations.filter((item) => item.decision === "Pending");
    const approvedFindingRecommendations = findingRecommendations.filter((item) => item.decision === "Approved");
    const declinedFindingRecommendations = findingRecommendations.filter((item) => item.decision === "Declined");
    const deferredFindingRecommendations = findingRecommendations.filter((item) => item.decision === "Deferred");
    const approvedWorkLines = selectedRO ? selectedRO.workLines.filter((line) => line.approvalDecision === "Approved") : [];
    const declinedWorkLines = selectedRO ? selectedRO.workLines.filter((line) => line.approvalDecision === "Declined") : [];
    const deferredWorkLines = selectedRO ? selectedRO.workLines.filter((line) => line.approvalDecision === "Deferred") : [];
    const pendingWorkLines = selectedRO ? selectedRO.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending") : [];
    const approvedCategorySummary = selectedRO ? buildApprovalCategorySummary(approvedWorkLines) : [];
    const approvedEstimateTotal = approvedWorkLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);
    const pendingEstimateTotal = pendingWorkLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);
    const declinedEstimateTotal = declinedWorkLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);
    const deferredEstimateTotal = deferredWorkLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);
    const approvalPendingCount = pendingWorkLines.length + pendingFindingRecommendations.length;
    const totalApprovedCount = approvedWorkLines.length + approvedFindingRecommendations.length;
    const totalDeclinedCount = declinedWorkLines.length + declinedFindingRecommendations.length;
    const totalDeferredCount = deferredWorkLines.length + deferredFindingRecommendations.length;
    const canAdvanceToWork = approvalPendingCount === 0 && approvedWorkLines.length > 0;
    const customerApprovalMessage = useMemo(() => buildCustomerApprovalMessage(selectedRO), [selectedRO]);
    const [notificationTemplateKey, setNotificationTemplateKey] = useState("approval-request");
    const [sendingSmsKey, setSendingSmsKey] = useState("");
    const [smsSendFeedback, setSmsSendFeedback] = useState("");
    const customerNotificationTemplates = useMemo(() => buildCustomerNotificationTemplates({
        ro: selectedRO,
        inspection: selectedROInspection,
        approvalRecord: selectedApproval,
        approvalLinkToken: activeApprovalLinkToken,
        oilReminder: activeOilChangeReminder,
        followUpReminder: activeReleaseFollowUpReminder,
        partsRequests: selectedPartsRequests,
        releaseRecord: selectedReleaseRecord,
        backjobRecord: selectedBackjobs[0] ?? null,
    }), [activeApprovalLinkToken, activeOilChangeReminder, activeReleaseFollowUpReminder, selectedApproval, selectedBackjobs, selectedPartsRequests, selectedRO, selectedROInspection, selectedReleaseRecord]);
    const activeCustomerNotificationTemplate = customerNotificationTemplates.find((template) => template.key === notificationTemplateKey) ?? customerNotificationTemplates[0] ?? null;
    const notificationPreviewRoNumber = activeCustomerNotificationTemplate?.key === "oil-reminder" && activeOilChangeReminder
        ? activeOilChangeReminder.roNumber
        : activeCustomerNotificationTemplate?.key === "follow-up" && activeReleaseFollowUpReminder
            ? activeReleaseFollowUpReminder.roNumber
            : selectedRO?.roNumber ?? "";
    const notificationPreviewVehicleLabel = activeCustomerNotificationTemplate?.key === "oil-reminder" && activeOilChangeReminder
        ? activeOilChangeReminder.vehicleLabel
        : activeCustomerNotificationTemplate?.key === "follow-up" && activeReleaseFollowUpReminder
            ? activeReleaseFollowUpReminder.vehicleLabel
            : [selectedRO?.make, selectedRO?.model, selectedRO?.year].filter(Boolean).join(" ") || selectedRO?.plateNumber || selectedRO?.conductionNumber || "-";
    const notificationPreviewCustomerName = activeCustomerNotificationTemplate?.key === "oil-reminder" && activeOilChangeReminder
        ? activeOilChangeReminder.customerName
        : activeCustomerNotificationTemplate?.key === "follow-up" && activeReleaseFollowUpReminder
            ? activeReleaseFollowUpReminder.customerName
            : selectedRO?.accountLabel ?? "";
    const notificationPreviewPhoneNumber = selectedRO?.phone || "";
    const activeCustomerNotificationTemplateSendable = useMemo(() => {
        if (!activeCustomerNotificationTemplate || !selectedRO)
            return false;
        if (!notificationPreviewPhoneNumber.trim())
            return false;
        if (activeCustomerNotificationTemplate.key === "approval-request")
            return !!activeApprovalLinkToken;
        if (activeCustomerNotificationTemplate.key === "oil-reminder")
            return !!activeOilChangeReminder?.isDue;
        if (activeCustomerNotificationTemplate.key === "follow-up")
            return !!activeReleaseFollowUpReminder?.isDue;
        return true;
    }, [
        activeApprovalLinkToken,
        activeCustomerNotificationTemplate,
        activeOilChangeReminder,
        activeReleaseFollowUpReminder,
        notificationPreviewPhoneNumber,
        selectedRO,
    ]);
    const activeCustomerNotificationSmsPayload = useMemo(() => {
        if (!selectedRO || !activeCustomerNotificationTemplate || !activeCustomerNotificationTemplateSendable)
            return null;
        return {
            roId: selectedRO.id,
            roNumber: notificationPreviewRoNumber,
            customerId: "",
            customerName: notificationPreviewCustomerName,
            phoneNumber: notificationPreviewPhoneNumber,
            tokenId: activeApprovalLinkToken?.id ?? "",
            messageType: activeCustomerNotificationTemplate.key,
            messageBody: activeCustomerNotificationTemplate.body,
        };
    }, [
        activeApprovalLinkToken,
        activeCustomerNotificationTemplate,
        activeCustomerNotificationTemplateSendable,
        notificationPreviewCustomerName,
        notificationPreviewPhoneNumber,
        notificationPreviewRoNumber,
        selectedRO,
    ]);
    const smsProviderConfig = getSmsProviderConfig();
    const recentSmsAttempts = useMemo(() => (selectedRO
        ? smsApprovalLogs.filter((row) => row.roId === selectedRO.id)
        : smsApprovalLogs).slice(0, 5), [smsApprovalLogs, selectedRO]);
    const serviceReminderRows = useMemo(() => {
        const latestSentByReminderKey = new Map();
        smsApprovalLogs.forEach((row) => {
            if (row.status !== "Sent")
                return;
            if (row.messageType !== "oil-reminder" && row.messageType !== "follow-up")
                return;
            const key = `${row.messageType}:${row.roId}`;
            const existing = latestSentByReminderKey.get(key);
            if (!existing || row.createdAt > existing.createdAt) {
                latestSentByReminderKey.set(key, row);
            }
        });
        const rows = [];
        const pushReminder = (entry) => {
            const status = entry.lastSentAt
                ? "Sent"
                : entry.isOverdue
                    ? "Overdue"
                    : "Due Soon";
            rows.push({
                key: entry.key,
                kind: entry.kind,
                title: entry.title,
                status,
                roNumber: entry.roNumber,
                customerName: entry.customerName,
                vehicleLabel: entry.vehicleLabel,
                plateNumber: entry.plateNumber,
                dueDate: entry.dueDate,
                dueReason: entry.dueReason,
                lastSentAt: entry.lastSentAt,
                body: entry.body,
            });
        };
        oilChangeReminders.forEach((reminder) => {
            const currentOdometer = parseOdometerValue(reminder.currentOdometerKm) ?? 0;
            const kmUntilDue = reminder.dueOdometerKm - currentOdometer;
            const dueDateValue = new Date(reminder.dueDate).getTime();
            const daysUntilDue = Math.ceil((dueDateValue - Date.now()) / (1000 * 60 * 60 * 24));
            const isDueSoon = !reminder.isDue && (daysUntilDue <= 30 || kmUntilDue <= 1000);
            const lastSentAt = latestSentByReminderKey.get(`oil-reminder:${reminder.roId}`)?.createdAt ?? "";
            if (!reminder.isDue && !isDueSoon && !lastSentAt)
                return;
            pushReminder({
                key: `oil:${reminder.roId}`,
                kind: "oil-reminder",
                title: "Oil Change Reminder",
                roNumber: reminder.roNumber,
                customerName: reminder.customerName,
                vehicleLabel: reminder.vehicleLabel,
                plateNumber: reminder.plateNumber || reminder.conductionNumber || "",
                dueDate: reminder.dueDate,
                dueReason: reminder.dueReason,
                body: buildOilChangeReminderMessage(reminder),
                isDueSoon,
                isOverdue: reminder.isDue,
                lastSentAt,
            });
        });
        releaseFollowUpReminders.forEach((reminder) => {
            const dueDateValue = new Date(reminder.dueDate).getTime();
            const daysUntilDue = Math.ceil((dueDateValue - Date.now()) / (1000 * 60 * 60 * 24));
            const isDueSoon = !reminder.isDue && daysUntilDue <= 3;
            const lastSentAt = latestSentByReminderKey.get(`follow-up:${reminder.roId}`)?.createdAt ?? "";
            if (!reminder.isDue && !isDueSoon && !lastSentAt)
                return;
            pushReminder({
                key: `follow:${reminder.roId}`,
                kind: "follow-up",
                title: "Follow-up (3 days after release)",
                roNumber: reminder.roNumber,
                customerName: reminder.customerName,
                vehicleLabel: reminder.vehicleLabel,
                plateNumber: reminder.plateNumber || reminder.conductionNumber || "",
                dueDate: reminder.dueDate,
                dueReason: reminder.dueReason,
                body: buildReleaseFollowUpMessage(reminder),
                isDueSoon,
                isOverdue: reminder.isDue,
                lastSentAt,
            });
        });
        return rows.sort((a, b) => {
            const order = (status) => (status === "Overdue" ? 0 : status === "Due Soon" ? 1 : 2);
            return order(a.status) - order(b.status) || b.dueDate.localeCompare(a.dueDate);
        });
    }, [oilChangeReminders, releaseFollowUpReminders, smsApprovalLogs]);
    const saveSmsProviderSettings = () => {
        if (isSavingSmsProviderSettings)
            return;
        setIsSavingSmsProviderSettings(true);
        try {
            if (typeof window === "undefined") {
                setSmsProviderConfigFeedback("SMS provider settings cannot be saved in this environment.");
                return;
            }
            window.localStorage.setItem(STORAGE_KEYS.smsProviderMode, smsProviderMode);
            window.localStorage.setItem(STORAGE_KEYS.smsAndroidGatewayUrl, smsAndroidGatewayUrl.trim());
            window.localStorage.setItem(STORAGE_KEYS.smsAndroidGatewayApiKey, smsAndroidGatewayApiKey.trim());
            window.localStorage.setItem(STORAGE_KEYS.smsAndroidSenderDeviceLabel, smsAndroidSenderDeviceLabel.trim());
            window.localStorage.setItem(STORAGE_KEYS.smsTwilioAccountSid, smsTwilioAccountSid.trim());
            window.localStorage.setItem(STORAGE_KEYS.smsTwilioFromNumber, smsTwilioFromNumber.trim());
            setSmsProviderConfigFeedback(smsProviderMode === "android"
                ? smsAndroidGatewayUrl.trim()
                    ? "Android SMS gateway settings saved."
                    : "Android SMS gateway is not configured yet. Save the URL to enable sending."
                : smsProviderMode === "twilio"
                    ? smsTwilioAccountSid.trim() && smsTwilioFromNumber.trim()
                        ? "Twilio settings saved."
                        : "Twilio settings are incomplete."
                    : "Simulated SMS mode selected.");
        }
        catch {
            setSmsProviderConfigFeedback("SMS provider settings could not be saved in this browser.");
        }
        finally {
            setIsSavingSmsProviderSettings(false);
        }
    };
    const primaryTechnicians = useMemo(() => users.filter((user) => user.active &&
        ["Chief Technician", "Senior Mechanic", "General Mechanic"].includes(user.role)), [users]);
    const supportTechnicians = useMemo(() => users.filter((user) => user.active &&
        ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role)), [users]);
    const filteredRepairOrders = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term)
            return sortedRepairOrders;
        return sortedRepairOrders.filter((row) => [
            row.roNumber,
            row.intakeNumber,
            row.inspectionNumber,
            row.plateNumber,
            row.conductionNumber,
            row.accountLabel,
            row.make,
            row.model,
            row.customerConcern,
            row.status,
        ]
            .join(" ")
            .toLowerCase()
            .includes(term));
    }, [search, sortedRepairOrders]);
    const roSummary = useMemo(() => ({
        total: sortedRepairOrders.length,
        waitingApproval: sortedRepairOrders.filter((row) => row.status === "Waiting Approval").length,
        inProgress: sortedRepairOrders.filter((row) => row.status === "In Progress").length,
        readyRelease: sortedRepairOrders.filter((row) => row.status === "Ready Release").length,
    }), [sortedRepairOrders]);
    const selectedROEstimateTotal = selectedRO
        ? selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0)
        : 0;
    const selectedROApprovedCount = selectedRO
        ? selectedRO.workLines.filter((line) => line.approvalDecision === "Approved").length
        : 0;
    const selectedROPendingCount = selectedRO
        ? selectedRO.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending").length
        : 0;
    const selectedROMaintenanceRecommendations = selectedRO ? roRecommendationTitlesById[selectedRO.id] ?? [] : [];
    const draftMaintenanceSuggestionGroups = useMemo(() => groupSuggestionsByCategory(draftMaintenanceSuggestions), [draftMaintenanceSuggestions]);
    const selectedROMaintenanceSuggestionGroups = useMemo(() => groupSuggestionsByCategory(selectedROMaintenanceSuggestions), [selectedROMaintenanceSuggestions]);
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            advisorName: prev.advisorName || currentUser.fullName,
        }));
    }, [currentUser.fullName]);
    useEffect(() => {
        if (creationMode !== "Intake")
            return;
        if (!selectedIntake) {
            setForm(getDefaultRepairOrderForm(currentUser.fullName));
            return;
        }
        setForm({
            customerName: selectedIntake.customerName,
            companyName: selectedIntake.companyName,
            accountType: selectedIntake.accountType,
            phone: selectedIntake.phone,
            email: selectedIntake.email,
            plateNumber: selectedIntake.plateNumber,
            conductionNumber: selectedIntake.conductionNumber,
            make: selectedIntake.make,
            model: selectedIntake.model,
            year: selectedIntake.year,
            color: selectedIntake.color,
            odometerKm: selectedIntake.odometerKm,
            customerConcern: selectedIntake.concern,
            advisorName: selectedIntake.assignedAdvisor || currentUser.fullName,
            status: linkedInspection ? "Waiting Approval" : "Waiting Inspection",
            primaryTechnicianId: "",
            supportTechnicianIds: [],
            workLines: linkedInspection && linkedInspection.recommendationLines.length > 0 ? linkedInspection.recommendationLines.map((lineTitle) => ({ ...getEmptyWorkLine(), title: lineTitle, recommendationSource: linkedInspection.inspectionNumber })) : [getEmptyWorkLine()],
        });
        setDraftRecommendationTitles([]);
        setDismissedMileageSuggestionIdsByScope((prev) => ({ ...prev, draft: [] }));
        setError("");
    }, [creationMode, selectedIntake, linkedInspection, currentUser.fullName]);
    useEffect(() => {
        if (!selectedRoId && sortedRepairOrders.length > 0) {
            setSelectedRoId(sortedRepairOrders[0].id);
        }
        if (selectedRoId && !sortedRepairOrders.some((row) => row.id === selectedRoId)) {
            setSelectedRoId(sortedRepairOrders[0]?.id ?? "");
        }
    }, [sortedRepairOrders, selectedRoId]);
    const resetForm = () => {
        setCreationMode("Intake");
        setSelectedIntakeId("");
        setForm(getDefaultRepairOrderForm(currentUser.fullName));
        setDraftRecommendationTitles([]);
        setDismissedMileageSuggestionIdsByScope((prev) => ({ ...prev, draft: [] }));
        setError("");
    };
    const updateDraftLine = (lineId, field, value) => {
        setForm((prev) => ({
            ...prev,
            workLines: prev.workLines.map((line) => line.id === lineId
                ? recalculateWorkLine({
                    ...line,
                    [field]: value,
                })
                : line),
        }));
    };
    const addDraftWorkLine = () => {
        setForm((prev) => ({ ...prev, workLines: [...prev.workLines, getEmptyWorkLine()] }));
    };
    const removeDraftWorkLine = (lineId) => {
        setForm((prev) => ({
            ...prev,
            workLines: prev.workLines.length === 1
                ? prev.workLines
                : prev.workLines.filter((line) => line.id !== lineId),
        }));
    };
    const handleSupportToggle = (technicianId) => {
        setForm((prev) => ({
            ...prev,
            supportTechnicianIds: prev.supportTechnicianIds.includes(technicianId)
                ? prev.supportTechnicianIds.filter((id) => id !== technicianId)
                : [...prev.supportTechnicianIds, technicianId],
        }));
    };
    const dismissMileageSuggestion = (scopeKey, suggestionId) => {
        setDismissedMileageSuggestionIdsByScope((prev) => ({
            ...prev,
            [scopeKey]: prev[scopeKey]?.includes(suggestionId) ? prev[scopeKey] : [...(prev[scopeKey] ?? []), suggestionId],
        }));
    };
    const addDraftSuggestionToRecommendations = (suggestion) => {
        setDraftRecommendationTitles((prev) => (hasMaintenanceTitleMatch(prev, suggestion.title) ? prev : [...prev, suggestion.title]));
    };
    const addRoSuggestionToRecommendations = (roId, suggestion) => {
        setRoRecommendationTitlesById((prev) => ({
            ...prev,
            [roId]: hasMaintenanceTitleMatch(prev[roId] ?? [], suggestion.title) ? prev[roId] ?? [] : [...(prev[roId] ?? []), suggestion.title],
        }));
    };
    const addDraftSuggestionToWorkLine = (suggestion) => {
        const exists = form.workLines.some((line) => line.title.trim().toLowerCase() === suggestion.title.trim().toLowerCase());
        if (exists)
            return;
        setForm((prev) => ({ ...prev, workLines: [...prev.workLines, getMaintenanceSuggestionWorkLine(suggestion)] }));
    };
    const addRoSuggestionToWorkLine = (roId, suggestion) => {
        setRepairOrders((prev) => prev.map((row) => {
            if (row.id !== roId)
                return row;
            const exists = row.workLines.some((line) => line.title.trim().toLowerCase() === suggestion.title.trim().toLowerCase());
            if (exists)
                return row;
            return {
                ...row,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.fullName,
                workLines: [...row.workLines, getMaintenanceSuggestionWorkLine(suggestion)],
            };
        }));
    };
    const addSelectedROMaintenanceToRecommendations = (suggestion) => {
        if (!selectedRO)
            return;
        addRoSuggestionToRecommendations(selectedRO.id, suggestion);
    };
    const addSelectedROMaintenanceToWorkLine = (suggestion) => {
        if (!selectedRO)
            return;
        addRoSuggestionToWorkLine(selectedRO.id, suggestion);
    };
    const dismissSelectedROMaintenanceSuggestion = (suggestionId) => {
        if (!selectedRO)
            return;
        dismissMileageSuggestion(`ro:${selectedRO.id}`, suggestionId);
    };
    const handleCreateRO = (e) => {
        e.preventDefault();
        if (isCreatingRO)
            return;
        setIsCreatingRO(true);
        try {
            const customerName = form.customerName.trim();
            const companyName = form.companyName.trim();
            const plateNumber = form.plateNumber.trim().toUpperCase();
            const conductionNumber = form.conductionNumber.trim().toUpperCase();
            const make = form.make.trim();
            const model = form.model.trim();
            const customerConcern = form.customerConcern.trim();
            const advisorName = form.advisorName.trim() || currentUser.fullName;
            const cleanWorkLines = form.workLines
                .map((line) => recalculateWorkLine({
                ...line,
                title: line.title.trim(),
                category: line.category.trim(),
                notes: line.notes.trim(),
            }))
                .filter((line) => line.title);
            if (creationMode === "Intake" && !selectedIntake) {
                setError("Select an intake first or switch to manual RO mode.");
                return;
            }
            if (!plateNumber && !conductionNumber) {
                setError("Plate number or conduction number is required.");
                return;
            }
            if (!make || !model) {
                setError("Vehicle make and model are required.");
                return;
            }
            if (!customerConcern) {
                setError("Customer concern is required.");
                return;
            }
            if (form.accountType === "Personal" && !customerName) {
                setError("Customer name is required for personal accounts.");
                return;
            }
            if (form.accountType === "Company / Fleet" && !companyName) {
                setError("Company / fleet name is required for company or fleet accounts.");
                return;
            }
            if (cleanWorkLines.length === 0) {
                setError("Add at least one work line before creating the RO.");
                return;
            }
            const now = new Date().toISOString();
            const inspection = creationMode === "Intake" && selectedIntake
                ? inspectionRecords.find((row) => row.intakeId === selectedIntake.id) ?? null
                : null;
            const newRO = {
                id: uid("ro"),
                roNumber: nextDailyNumber("RO"),
                createdAt: now,
                updatedAt: now,
                workStartedAt: form.status === "In Progress" ? now : "",
                sourceType: creationMode,
                intakeId: creationMode === "Intake" && selectedIntake ? selectedIntake.id : "",
                inspectionId: inspection?.id ?? "",
                intakeNumber: creationMode === "Intake" && selectedIntake ? selectedIntake.intakeNumber : "",
                inspectionNumber: inspection?.inspectionNumber ?? "",
                customerName,
                companyName,
                accountType: form.accountType,
                accountLabel: companyName || customerName || "Unknown Customer",
                phone: form.phone.trim(),
                email: form.email.trim(),
                plateNumber,
                conductionNumber,
                make,
                model,
                year: form.year.trim(),
                color: form.color.trim(),
                odometerKm: form.odometerKm.trim(),
                customerConcern,
                advisorName,
                status: form.status,
                primaryTechnicianId: form.primaryTechnicianId,
                supportTechnicianIds: form.supportTechnicianIds,
                workLines: cleanWorkLines,
                latestApprovalRecordId: "",
                deferredLineTitles: [],
                backjobReferenceRoId: "",
                findingRecommendationDecisions: [],
                encodedBy: currentUser.fullName,
                updatedBy: "",
            };
            setRepairOrders((prev) => [newRO, ...prev]);
            setSelectedRoId(newRO.id);
            if (creationMode === "Intake" && selectedIntake) {
                setIntakeRecords((prev) => prev.map((row) => row.id === selectedIntake.id
                    ? { ...row, status: "Converted to RO", updatedAt: now }
                    : row));
            }
            setError("");
            setDraftRecommendationTitles([]);
            resetForm();
        }
        finally {
            setIsCreatingRO(false);
        }
    };
    const updateRO = (id, patch) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { roNumber: _rn, createdAt: _ca, encodedBy: _eb, ...safePatch } = patch;
        setRepairOrders((prev) => prev.map((row) => row.id === id
            ? { ...row, ...safePatch, updatedAt: new Date().toISOString(), updatedBy: currentUser.fullName }
            : row));
    };
    const updateROWorkLine = (roId, lineId, field, value) => {
        setRepairOrders((prev) => prev.map((row) => {
            if (row.id !== roId)
                return row;
            return {
                ...row,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.fullName,
                workLines: row.workLines.map((line) => {
                    if (line.id !== lineId)
                        return line;
                    const approvalState = line.approvalDecision ?? "Pending";
                    const isLockedByApproval = approvalState === "Approved";
                    const lockedFields = [
                        "title",
                        "category",
                        "serviceEstimate",
                        "partsEstimate",
                        "totalEstimate",
                    ];
                    if (isLockedByApproval && lockedFields.includes(field)) {
                        return line;
                    }
                    if (field === "status" && approvalState !== "Approved" && value !== "Pending") {
                        return {
                            ...line,
                            status: "Pending",
                        };
                    }
                    if (field === "status" && value === "Completed" && line.status === "Waiting Parts") {
                        return line;
                    }
                    return recalculateWorkLine({
                        ...line,
                        [field]: value,
                    });
                }),
            };
        }));
    };
    const addROWorkLine = (roId) => {
        setRepairOrders((prev) => prev.map((row) => row.id === roId
            ? {
                ...row,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.fullName,
                workLines: [...row.workLines, getEmptyWorkLine()],
            }
            : row));
    };
    const removeROWorkLine = (roId, lineId) => {
        setRepairOrders((prev) => prev.map((row) => row.id === roId
            ? {
                ...row,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.fullName,
                workLines: row.workLines.length === 1
                    ? row.workLines
                    : row.workLines.filter((line) => line.id !== lineId),
            }
            : row));
    };
    const getUserLabel = (userId) => users.find((row) => row.id === userId)?.fullName || "-";
    const commitApprovalItems = (items) => {
        if (!selectedRO)
            return;
        const now = new Date().toISOString();
        const summary = approvalSummary.trim() || `${selectedRO.roNumber} approval updated`;
        const record = {
            id: uid("apr"),
            approvalNumber: nextDailyNumber("APR"),
            roId: selectedRO.id,
            roNumber: selectedRO.roNumber,
            createdAt: now,
            decidedBy: currentUser.fullName,
            customerName: selectedRO.accountLabel,
            customerContact: selectedRO.phone || selectedRO.email || "-",
            summary,
            communicationHook: approvalCommHook.trim() || "SMS / Email placeholder",
            items,
        };
        const approvedCount = items.filter((item) => item.decision === "Approved").length;
        const deferredTitles = items.filter((item) => item.decision === "Deferred").map((item) => item.title);
        setApprovalRecords((prev) => [record, ...prev]);
        setRepairOrders((prev) => prev.map((row) => row.id === selectedRO.id
            ? {
                ...row,
                latestApprovalRecordId: record.id,
                deferredLineTitles: deferredTitles,
                status: approvedCount > 0 ? "Approved / Ready to Work" : "Waiting Approval",
                workLines: row.workLines.map((line) => {
                    const item = items.find((entry) => entry.workLineId === line.id);
                    const nextDecision = item?.decision ?? line.approvalDecision ?? "Pending";
                    const nextApprovedAt = item?.approvedAt ?? line.approvalAt ?? "";
                    return {
                        ...line,
                        approvalDecision: nextDecision,
                        approvalAt: nextApprovedAt,
                        notes: nextDecision !== "Approved" && nextDecision !== "Pending"
                            ? `${line.notes}${line.notes ? " | " : ""}Decision: ${nextDecision}`
                            : line.notes,
                    };
                }),
                updatedAt: now,
            }
            : row));
    };
    const setLineDecision = (decision, workLineId) => {
        if (!selectedRO)
            return;
        const now = new Date().toISOString();
        const items = selectedRO.workLines.map((line) => {
            const existing = selectedApproval?.items.find((item) => item.workLineId === line.id);
            return {
                workLineId: line.id,
                title: line.title || "Untitled Work Line",
                decision: line.id === workLineId ? decision : existing?.decision ?? line.approvalDecision ?? "Pending",
                approvedAt: line.id === workLineId ? now : existing?.approvedAt ?? line.approvalAt ?? "",
                note: existing?.note ?? "",
            };
        });
        commitApprovalItems(items);
    };
    const setBulkLineDecision = (decision) => {
        if (!selectedRO)
            return;
        const now = new Date().toISOString();
        const items = selectedRO.workLines.map((line) => {
            const existing = selectedApproval?.items.find((item) => item.workLineId === line.id);
            const currentDecision = existing?.decision ?? line.approvalDecision ?? "Pending";
            const nextDecision = currentDecision === "Pending" ? decision : currentDecision;
            return {
                workLineId: line.id,
                title: line.title || "Untitled Work Line",
                decision: nextDecision,
                approvedAt: currentDecision === "Pending" ? now : existing?.approvedAt ?? line.approvalAt ?? "",
                note: existing?.note ?? "",
            };
        });
        commitApprovalItems(items);
    };
    const setFindingRecommendationDecision = (recommendation, decision) => {
        if (!selectedRO)
            return;
        const now = new Date().toISOString();
        const existingLine = selectedRO.workLines.find((line) => line.sourceRecommendationId === recommendation.id || line.recommendationSource === `Finding:${recommendation.id}`);
        setRepairOrders((prev) => prev.map((row) => {
            if (row.id !== selectedRO.id)
                return row;
            const nextDecisions = [
                ...row.findingRecommendationDecisions.filter((item) => item.recommendationId !== recommendation.id),
                {
                    recommendationId: recommendation.id,
                    title: recommendation.title,
                    category: recommendation.category,
                    decision,
                    decidedAt: now,
                    note: recommendation.note,
                },
            ];
            let nextWorkLines = row.workLines;
            if (decision === "Approved" && !existingLine) {
                nextWorkLines = [
                    ...row.workLines,
                    recalculateWorkLine({
                        ...getEmptyWorkLine(),
                        id: uid("wl"),
                        title: recommendation.workLineTitle,
                        category: recommendation.category,
                        priority: recommendation.status === "Replace" ? "High" : "Medium",
                        status: "Pending",
                        notes: [recommendation.note, ...recommendation.photoNotes].filter(Boolean).join(" | "),
                        customerDescription: `${recommendation.category}: ${recommendation.workLineTitle}. ${recommendation.note || "Customer-approved recommended work."}`.trim(),
                        recommendationSource: `Finding:${recommendation.id}`,
                        sourceRecommendationId: recommendation.id,
                        approvalDecision: "Approved",
                        approvalAt: now,
                    }),
                ];
            }
            return {
                ...row,
                status: decision === "Approved" && ["Draft", "Waiting Inspection", "Waiting Approval"].includes(row.status)
                    ? "Approved / Ready to Work"
                    : row.status,
                findingRecommendationDecisions: nextDecisions,
                workLines: nextWorkLines,
                updatedAt: now,
            };
        }));
        const approvalRecord = {
            id: uid("apr"),
            approvalNumber: nextDailyNumber("APR"),
            roId: selectedRO.id,
            roNumber: selectedRO.roNumber,
            createdAt: now,
            decidedBy: currentUser.fullName,
            customerName: selectedRO.accountLabel,
            customerContact: selectedRO.phone || selectedRO.email || "-",
            summary: `${decision} finding recommendation: ${recommendation.title}`,
            communicationHook: approvalCommHook.trim() || "SMS / Email placeholder",
            items: [
                {
                    workLineId: existingLine?.id || `finding:${recommendation.id}`,
                    title: recommendation.workLineTitle,
                    decision,
                    approvedAt: now,
                    note: recommendation.note,
                },
            ],
        };
        setApprovalRecords((prev) => [approvalRecord, ...prev]);
    };
    const setBulkFindingRecommendationDecision = (decision) => {
        pendingFindingRecommendations.forEach((item) => {
            setFindingRecommendationDecision(item, decision);
        });
    };
    const handleROStatusChange = (nextStatus) => {
        if (!selectedRO)
            return;
        const lockedStatuses = [
            "Approved / Ready to Work",
            "In Progress",
            "Waiting Parts",
            "Quality Check",
            "Ready Release",
            "Released",
            "Closed",
        ];
        if (lockedStatuses.includes(nextStatus) && !canAdvanceToWork) {
            setError("RO cannot advance to work until all approvals are decided and at least one work line is approved.");
            return;
        }
        const allowedTransitions = {
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
        if (!(allowedTransitions[selectedRO.status] ?? []).includes(nextStatus)) {
            setError(`Cannot transition from "${selectedRO.status}" to "${nextStatus}".`);
            return;
        }
        if (nextStatus === "Quality Check") {
            const approvedLines = selectedRO.workLines.filter((l) => l.approvalDecision !== "Declined" && l.approvalDecision !== "Deferred");
            if (approvedLines.length === 0 || !approvedLines.every((l) => l.status === "Completed")) {
                setError("All approved work lines must be completed before moving to Quality Check.");
                return;
            }
        }
        updateRO(selectedRO.id, {
            status: nextStatus,
            workStartedAt: nextStatus === "In Progress" && !selectedRO.workStartedAt
                ? new Date().toISOString()
                : selectedRO.workStartedAt,
        });
        setError("");
    };
    const createBackjob = () => {
        if (!selectedRO || !backjobComplaint.trim())
            return;
        const record = {
            id: uid("bjb"),
            backjobNumber: nextDailyNumber("BJB"),
            linkedRoId: selectedRO.id,
            linkedRoNumber: selectedRO.roNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            plateNumber: selectedRO.plateNumber || selectedRO.conductionNumber,
            customerLabel: selectedRO.accountLabel,
            originalInvoiceNumber: "",
            comebackInvoiceNumber: "",
            originalPrimaryTechnicianId: selectedRO.primaryTechnicianId || "",
            comebackPrimaryTechnicianId: "",
            supportingTechnicianIds: [],
            complaint: backjobComplaint.trim(),
            findings: "",
            rootCause: backjobRootCause.trim(),
            responsibility: backjobOutcome,
            actionTaken: "",
            resolutionNotes: backjobResolutionNotes.trim(),
            status: "Open",
            createdBy: currentUser.fullName,
        };
        setBackjobRecords((prev) => [record, ...prev]);
        setRepairOrders((prev) => prev.map((row) => row.id === selectedRO.id ? { ...row, backjobReferenceRoId: record.id, updatedAt: new Date().toISOString(), updatedBy: currentUser.fullName } : row));
        setBackjobComplaint("");
        setBackjobRootCause("");
        setBackjobResolutionNotes("");
        setBackjobOutcome("Customer Pay");
    };
    const selectedROTotal = selectedRO
        ? selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0)
        : 0;
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsx(Card, { title: "Create Repair Order", subtitle: "Create from intake or manually without an intake record", right: _jsx("span", { style: styles.statusInfo, children: "Option A Enabled" }), children: _jsxs("form", { onSubmit: handleCreateRO, style: styles.formStack, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Creation Mode" }), _jsxs("select", { style: styles.select, value: creationMode, onChange: (e) => {
                                                        setCreationMode(e.target.value);
                                                        setSelectedIntakeId("");
                                                        setForm(getDefaultRepairOrderForm(currentUser.fullName));
                                                    }, children: [_jsx("option", { value: "Intake", children: "From Existing Intake" }), _jsx("option", { value: "Manual", children: "Manual RO Without Intake" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "RO Status" }), _jsxs("select", { style: styles.select, value: form.status, onChange: (e) => setForm((prev) => ({ ...prev, status: e.target.value })), children: [_jsx("option", { value: "Draft", children: "Draft" }), _jsx("option", { value: "Waiting Inspection", children: "Waiting Inspection" }), _jsx("option", { value: "Waiting Approval", children: "Waiting Approval" }), _jsx("option", { value: "Approved / Ready to Work", children: "Approved / Ready to Work" })] })] })] }), creationMode === "Intake" ? (_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Select Intake" }), _jsxs("select", { style: styles.select, value: selectedIntakeId, onChange: (e) => setSelectedIntakeId(e.target.value), children: [_jsx("option", { value: "", children: "Select intake record" }), availableIntakes.map((row) => (_jsxs("option", { value: row.id, children: [row.intakeNumber, "  |  ", row.plateNumber || row.conductionNumber || "No Plate", "  |  ", row.companyName || row.customerName || "Unknown"] }, row.id)))] })] })) : null, creationMode === "Intake" && selectedIntake ? (_jsx("div", { style: styles.summaryPanel, children: _jsxs("div", { style: styles.summaryGrid, children: [_jsxs("div", { children: [_jsx("strong", { children: "Intake No.:" }), " ", selectedIntake.intakeNumber] }), _jsxs("div", { children: [_jsx("strong", { children: "Inspection:" }), " ", linkedInspection?.inspectionNumber || "None linked"] }), _jsxs("div", { children: [_jsx("strong", { children: "Plate:" }), " ", selectedIntake.plateNumber || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Account:" }), " ", selectedIntake.companyName || selectedIntake.customerName || "-"] })] }) })) : null, _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Account Type" }), _jsxs("select", { style: styles.select, value: form.accountType, onChange: (e) => setForm((prev) => ({ ...prev, accountType: e.target.value })), children: [_jsx("option", { value: "Personal", children: "Personal" }), _jsx("option", { value: "Company / Fleet", children: "Company / Fleet" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Service Advisor" }), _jsx("input", { style: styles.input, value: form.advisorName, onChange: (e) => setForm((prev) => ({ ...prev, advisorName: e.target.value })), placeholder: "Advisor or reception encoder" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: form.accountType === "Company / Fleet" ? "Company / Fleet Name" : "Customer Name" }), _jsx("input", { style: styles.input, value: form.accountType === "Company / Fleet" ? form.companyName : form.customerName, onChange: (e) => setForm((prev) => prev.accountType === "Company / Fleet"
                                                ? { ...prev, companyName: e.target.value }
                                                : { ...prev, customerName: e.target.value }), placeholder: form.accountType === "Company / Fleet" ? "Enter company or fleet name" : "Enter customer name" })] }), form.accountType === "Company / Fleet" ? (_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Driver / Contact Person" }), _jsx("input", { style: styles.input, value: form.customerName, onChange: (e) => setForm((prev) => ({ ...prev, customerName: e.target.value })), placeholder: "Optional driver or contact person" })] })) : null, _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Phone" }), _jsx("input", { style: styles.input, value: form.phone, onChange: (e) => setForm((prev) => ({ ...prev, phone: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Email" }), _jsx("input", { style: styles.input, value: form.email, onChange: (e) => setForm((prev) => ({ ...prev, email: e.target.value })) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Plate Number" }), _jsx("input", { style: styles.input, value: form.plateNumber, onChange: (e) => setForm((prev) => ({ ...prev, plateNumber: e.target.value.toUpperCase() })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Conduction Number" }), _jsx("input", { style: styles.input, value: form.conductionNumber, onChange: (e) => setForm((prev) => ({ ...prev, conductionNumber: e.target.value.toUpperCase() })) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Make" }), _jsx("input", { style: styles.input, value: form.make, onChange: (e) => setForm((prev) => ({ ...prev, make: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Model" }), _jsx("input", { style: styles.input, value: form.model, onChange: (e) => setForm((prev) => ({ ...prev, model: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Year" }), _jsx("input", { style: styles.input, value: form.year, onChange: (e) => setForm((prev) => ({ ...prev, year: e.target.value })) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Color" }), _jsx("input", { style: styles.input, value: form.color, onChange: (e) => setForm((prev) => ({ ...prev, color: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Odometer KM" }), _jsx("input", { style: styles.input, value: form.odometerKm, onChange: (e) => setForm((prev) => ({ ...prev, odometerKm: e.target.value })) })] })] }), _jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsxs("div", { style: styles.sectionTitle, children: ["Maintenance Suggestions ", form.odometerKm.trim() ? `(${form.odometerKm.trim()} km)` : '(KM pending)'] }), _jsx("div", { style: styles.formHint, children: "Unified mileage + library matches. More specific vehicle matches appear first when they overlap." })] }), _jsxs("span", { style: draftMaintenanceSuggestions.length ? styles.statusInfo : styles.statusNeutral, children: [draftMaintenanceSuggestions.length, " Visible"] })] }), draftMaintenanceSuggestionGroups.length === 0 ? (_jsx("div", { style: styles.formHint, children: "No matching maintenance suggestions for the current vehicle input." })) : (_jsx("div", { style: styles.formStack, children: draftMaintenanceSuggestionGroups.map((group) => (_jsxs("div", { style: styles.concernCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: group.category }), _jsxs("span", { style: styles.statusInfo, children: [group.items.length, " suggestions"] })] }), _jsx("div", { style: styles.formStack, children: group.items.map((item) => {
                                                            const titleKey = item.title.trim().toLowerCase();
                                                            const existsInRecommendations = draftRecommendationTitles.some((entry) => entry.trim().toLowerCase() === titleKey);
                                                            const existsInWorkLines = form.workLines.some((line) => line.title.trim().toLowerCase() === titleKey);
                                                            return (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: item.title }), _jsx("span", { style: styles.statusInfo, children: item.intervalTag })] }), _jsx("div", { style: styles.chipWrap, children: _jsx("span", { style: styles.tagNeutral, children: item.specificityTag || "General" }) }), _jsx("div", { style: styles.formHint, children: item.reason }), item.isConditional ? _jsx("div", { style: { ...styles.statusWarning, marginTop: 6 }, children: "If applicable" }) : null, _jsxs("div", { style: { ...styles.inlineActions, marginTop: 8 }, children: [_jsx("button", { type: "button", style: styles.smallButtonMuted, disabled: existsInRecommendations, onClick: () => addDraftSuggestionToRecommendations(item), children: "Add to Recommendations" }), _jsx("button", { type: "button", style: styles.smallButton, disabled: existsInWorkLines, onClick: () => addDraftSuggestionToWorkLine(item), children: "Add to Work Line" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => dismissMileageSuggestion('draft', item.id), children: "Dismiss" })] })] }, item.id));
                                                        }) })] }, group.category))) })), draftRecommendationTitles.length > 0 ? (_jsxs("div", { style: { marginTop: 10 }, children: [_jsx("div", { style: styles.formHint, children: "Recommendations" }), _jsx("div", { style: styles.chipWrap, children: draftRecommendationTitles.map((title) => (_jsx("span", { style: styles.tagNeutral, children: title }, title))) })] })) : null] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Customer Concern" }), _jsx("textarea", { style: styles.textarea, value: form.customerConcern, onChange: (e) => setForm((prev) => ({ ...prev, customerConcern: e.target.value })), placeholder: "Main complaint or requested work" })] }), _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Work Lines" }), _jsx("div", { style: styles.formStack, children: form.workLines.map((line, index) => (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("strong", { children: ["Line ", index + 1] }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => removeDraftWorkLine(line.id), children: "Remove" })] }), _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Title" }), _jsx("input", { style: styles.input, value: line.title, onChange: (e) => updateDraftLine(line.id, "title", e.target.value), placeholder: "Example: Brake Cleaning" })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Category" }), _jsx("input", { style: styles.input, value: line.category, onChange: (e) => updateDraftLine(line.id, "category", e.target.value), placeholder: "Engine, Electrical, Suspension" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Priority" }), _jsxs("select", { style: styles.select, value: line.priority, onChange: (e) => updateDraftLine(line.id, "priority", e.target.value), children: [_jsx("option", { value: "Low", children: "Low" }), _jsx("option", { value: "Medium", children: "Medium" }), _jsx("option", { value: "High", children: "High" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Line Status" }), _jsxs("select", { style: styles.select, value: line.status, onChange: (e) => updateDraftLine(line.id, "status", e.target.value), children: [_jsx("option", { value: "Pending", children: "Pending" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Waiting Parts", children: "Waiting Parts" }), _jsx("option", { value: "Completed", children: "Completed" })] })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Service Estimate (PHP)" }), _jsx("input", { style: styles.input, value: line.serviceEstimate, onChange: (e) => updateDraftLine(line.id, "serviceEstimate", e.target.value) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Parts Estimate (PHP)" }), _jsx("input", { style: styles.input, value: line.partsEstimate, onChange: (e) => updateDraftLine(line.id, "partsEstimate", e.target.value) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Total Estimate" }), _jsx("input", { style: styles.input, value: formatCurrency(parseMoneyInput(line.totalEstimate)), readOnly: true })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Notes" }), _jsx("textarea", { style: styles.textarea, value: line.notes, onChange: (e) => updateDraftLine(line.id, "notes", e.target.value) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Customer Description" }), _jsx("textarea", { style: styles.textarea, value: line.customerDescription, onChange: (e) => updateDraftLine(line.id, "customerDescription", e.target.value), placeholder: "Customer-facing explanation for approval preview" })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid4, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Labor Hours" }), _jsx("input", { style: styles.input, value: line.laborHours, onChange: (e) => updateDraftLine(line.id, "laborHours", e.target.value), placeholder: "e.g. 1.5" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Labor Rate" }), _jsx("input", { style: styles.input, value: line.laborRate, onChange: (e) => updateDraftLine(line.id, "laborRate", e.target.value), placeholder: "PHP per hour" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Parts Cost" }), _jsx("input", { style: styles.input, value: line.partsCost, onChange: (e) => updateDraftLine(line.id, "partsCost", e.target.value), placeholder: "Internal / base parts cost" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Markup %" }), _jsx("input", { style: styles.input, value: line.partsMarkupPercent, onChange: (e) => updateDraftLine(line.id, "partsMarkupPercent", e.target.value), placeholder: "e.g. 25" })] })] })] })] }, line.id))) }), _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.secondaryButton, onClick: addDraftWorkLine, children: "Add Work Line" }) })] }), _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Technician Assignment" }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Primary Technician" }), _jsxs("select", { style: styles.select, value: form.primaryTechnicianId, onChange: (e) => setForm((prev) => ({ ...prev, primaryTechnicianId: e.target.value })), children: [_jsx("option", { value: "", children: "Unassigned" }), primaryTechnicians.map((user) => (_jsxs("option", { value: user.id, children: [user.fullName, "  |  ", user.role] }, user.id)))] }), _jsx("div", { style: styles.formHint, children: "OJT cannot be assigned as primary technician." })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Supporting Technicians" }), _jsx("div", { style: styles.checkboxList, children: supportTechnicians.map((user) => (_jsxs("label", { style: styles.checkboxTile, children: [_jsx("input", { type: "checkbox", checked: form.supportTechnicianIds.includes(user.id), onChange: () => handleSupportToggle(user.id) }), _jsxs("span", { children: [user.fullName, "  |  ", user.role] })] }, user.id))) })] })] })] }), error ? _jsx("div", { style: styles.errorBox, children: error }) : null, _jsxs("div", { style: isCompactLayout ? styles.stickyActionBar : styles.inlineActions, children: [_jsx("button", { type: "submit", style: styles.primaryButton, disabled: isCreatingRO, children: "Create RO" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: resetForm, children: "Reset" })] })] }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsxs(Card, { title: "Repair Order Registry", subtitle: "Newest to oldest, with live mobile-friendly detail editing", right: _jsxs("span", { style: styles.statusNeutral, children: [repairOrders.length, " total"] }), children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Search" }), _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search RO no., plate, customer, status, concern" })] }), filteredRepairOrders.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No repair orders saved yet." })) : (_jsx("div", { style: styles.mobileCardList, children: filteredRepairOrders.map((row) => (_jsxs("button", { type: "button", onClick: () => setSelectedRoId(row.id), style: {
                                        ...styles.mobileDataCardButton,
                                        ...(selectedRoId === row.id ? styles.mobileDataCardButtonActive : {}),
                                    }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.roNumber }), _jsx(ROStatusBadge, { status: row.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: row.accountLabel }), _jsx("div", { style: styles.mobileDataSecondary, children: [row.make, row.model, row.year].filter(Boolean).join(" ") || "-" }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Source" }), _jsx("strong", { children: row.sourceType })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Estimate" }), _jsx("strong", { children: formatCurrency(row.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0)) })] }), row.status === "Ready Release" ? (_jsx("div", { style: { ...styles.statusOk, marginTop: 4, fontSize: 11, padding: "2px 6px" }, children: "Ready for Release" })) : null, row.workLines.some((l) => l.status === "Waiting Parts") ? (_jsxs("div", { style: { ...styles.statusWarning, marginTop: 4, fontSize: 11, padding: "2px 6px" }, children: ["Waiting Parts (", row.workLines.filter((l) => l.status === "Waiting Parts").length, ")"] })) : null] }, row.id))) })), selectedRO ? (_jsxs("div", { style: styles.detailPanel, children: [_jsxs("div", { style: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.cardTitle, children: selectedRO.roNumber }), _jsx("div", { style: styles.cardSubtitle, children: "Linked intake is optional. Inspection is optional." })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => printTextDocument(`Repair Order ${selectedRO.roNumber}`, buildRepairOrderExportText(selectedRO, users)), children: "Print RO" }), _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => printCustomerSummary(selectedRO), children: "Print Summary" }), _jsx("button", { type: "button", style: styles.smallButton, onClick: () => downloadTextFile(`${selectedRO.roNumber}_repair_order.txt`, buildRepairOrderExportText(selectedRO, users)), children: "Export RO" }), _jsx(ROStatusBadge, { status: selectedRO.status })] })] }), _jsxs("div", { style: styles.summaryPanel, children: [_jsxs("div", { style: styles.summaryGrid, children: [_jsxs("div", { children: [_jsx("strong", { children: "Account:" }), " ", selectedRO.accountLabel] }), _jsxs("div", { children: [_jsx("strong", { children: "Plate:" }), " ", selectedRO.plateNumber || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Conduction:" }), " ", selectedRO.conductionNumber || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Vehicle:" }), " ", [selectedRO.make, selectedRO.model, selectedRO.year].filter(Boolean).join(" ") || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Intake No.:" }), " ", selectedRO.intakeNumber || "Manual"] }), _jsxs("div", { children: [_jsx("strong", { children: "Inspection No.:" }), " ", selectedRO.inspectionNumber || "None"] }), _jsxs("div", { children: [_jsx("strong", { children: "Total Estimate:" }), " ", formatCurrency(selectedROEstimateTotal)] }), _jsxs("div", { children: [_jsx("strong", { children: "Approved Lines:" }), " ", selectedROApprovedCount] }), _jsxs("div", { children: [_jsx("strong", { children: "Pending Lines:" }), " ", selectedROPendingCount] }), _jsxs("div", { children: [_jsx("strong", { children: "Primary Tech:" }), " ", selectedRO.primaryTechnicianId ? users.find((user) => user.id === selectedRO.primaryTechnicianId)?.fullName || "Assigned" : "Unassigned"] })] }), _jsxs("div", { style: styles.concernBanner, children: [_jsx("strong", { children: "Concern:" }), " ", selectedRO.customerConcern] })] }), selectedRO.status === "Ready Release" ? (_jsx("div", { style: { ...styles.statusOk, marginBottom: 8 }, children: "This RO is ready for release. Proceed to the Release module to complete the handover." })) : null, selectedRO.workLines.some((l) => l.status === "Waiting Parts") ? (_jsxs("div", { style: { ...styles.statusWarning, marginBottom: 8 }, children: ["Waiting Parts  -  ", selectedRO.workLines.filter((l) => l.status === "Waiting Parts").map((l) => l.title || "Untitled").join(", ")] })) : null, _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "RO Status" }), _jsxs("select", { style: styles.select, value: selectedRO.status, onChange: (e) => handleROStatusChange(e.target.value), children: [_jsx("option", { value: "Draft", children: "Draft" }), _jsx("option", { value: "Waiting Inspection", children: "Waiting Inspection" }), _jsx("option", { value: "Waiting Approval", children: "Waiting Approval" }), _jsx("option", { value: "Approved / Ready to Work", disabled: !canAdvanceToWork && selectedRO.status !== "Approved / Ready to Work", children: "Approved / Ready to Work" }), _jsx("option", { value: "In Progress", disabled: !canAdvanceToWork && selectedRO.status !== "In Progress", children: "In Progress" }), _jsx("option", { value: "Waiting Parts", disabled: !canAdvanceToWork && selectedRO.status !== "Waiting Parts", children: "Waiting Parts" }), _jsx("option", { value: "Quality Check", disabled: !canAdvanceToWork && selectedRO.status !== "Quality Check", children: "Quality Check" }), _jsx("option", { value: "Ready Release", disabled: !canAdvanceToWork && selectedRO.status !== "Ready Release", children: "Ready Release" }), _jsx("option", { value: "Released", disabled: !canAdvanceToWork && selectedRO.status !== "Released", children: "Released" }), _jsx("option", { value: "Closed", disabled: !canAdvanceToWork && selectedRO.status !== "Closed", children: "Closed" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Primary Technician" }), _jsxs("select", { style: styles.select, value: selectedRO.primaryTechnicianId, onChange: (e) => updateRO(selectedRO.id, { primaryTechnicianId: e.target.value }), children: [_jsx("option", { value: "", children: "Unassigned" }), primaryTechnicians.map((user) => (_jsxs("option", { value: user.id, children: [user.fullName, "  |  ", user.role] }, user.id)))] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Odometer KM" }), _jsx("input", { style: styles.input, value: selectedRO.odometerKm, onChange: (e) => updateRO(selectedRO.id, { odometerKm: e.target.value }), placeholder: "Current mileage" })] })] }), _jsxs("div", { style: styles.summaryGrid, children: [_jsxs("div", { children: [_jsx("strong", { children: "Primary Tech:" }), " ", selectedRO.primaryTechnicianId ? getUserLabel(selectedRO.primaryTechnicianId) : "Unassigned"] }), _jsxs("div", { children: [_jsx("strong", { children: "Support:" }), " ", selectedRO.supportTechnicianIds.length ? selectedRO.supportTechnicianIds.map(getUserLabel).join(", ") : "None"] }), _jsxs("div", { children: [_jsx("strong", { children: "Total Estimate:" }), " ", formatCurrency(selectedROTotal)] }), _jsxs("div", { children: [_jsx("strong", { children: "Updated:" }), " ", formatDateTime(selectedRO.updatedAt)] }), _jsxs("div", { children: [_jsx("strong", { children: "Odometer:" }), " ", selectedRO.odometerKm || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Approval Lock:" }), " ", canAdvanceToWork ? "Ready to advance" : "Blocked until all decisions are complete"] }), _jsxs("div", { children: [_jsx("strong", { children: "Approved Line Total:" }), " ", formatCurrency(approvedEstimateTotal)] })] }), _jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsxs("div", { style: styles.sectionTitle, children: ["Maintenance Suggestions ", selectedRO.odometerKm.trim() ? `(${selectedRO.odometerKm.trim()} km)` : '(KM pending)'] }), _jsx("div", { style: styles.formHint, children: "Unified mileage + library matches. The best vehicle-specific version wins when a service appears in both sources." })] }), _jsxs("span", { style: selectedROMaintenanceSuggestions.length ? styles.statusInfo : styles.statusNeutral, children: [selectedROMaintenanceSuggestions.length, " Visible"] })] }), selectedROMaintenanceSuggestionGroups.length === 0 ? (_jsx("div", { style: styles.formHint, children: "No matching maintenance suggestions for this RO vehicle profile." })) : (_jsx("div", { style: styles.formStack, children: selectedROMaintenanceSuggestionGroups.map((group) => (_jsxs("div", { style: styles.concernCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: group.category }), _jsxs("span", { style: styles.statusInfo, children: [group.items.length, " suggestions"] })] }), _jsx("div", { style: styles.formStack, children: group.items.map((item) => {
                                                                const titleKey = item.title.trim().toLowerCase();
                                                                const roRecommendations = roRecommendationTitlesById[selectedRO.id] ?? [];
                                                                const existsInRecommendations = roRecommendations.some((entry) => entry.trim().toLowerCase() === titleKey);
                                                                const existsInWorkLines = selectedRO.workLines.some((line) => line.title.trim().toLowerCase() === titleKey);
                                                                return (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: item.title }), _jsx("span", { style: styles.statusInfo, children: item.intervalTag })] }), _jsx("div", { style: styles.chipWrap, children: _jsx("span", { style: styles.tagNeutral, children: item.specificityTag || "General" }) }), _jsx("div", { style: styles.formHint, children: item.reason }), item.isConditional ? _jsx("div", { style: { ...styles.statusWarning, marginTop: 6 }, children: "If applicable" }) : null, _jsxs("div", { style: { ...styles.inlineActions, marginTop: 8 }, children: [_jsx("button", { type: "button", style: styles.smallButtonMuted, disabled: existsInRecommendations, onClick: () => addRoSuggestionToRecommendations(selectedRO.id, item), children: "Add to Recommendations" }), _jsx("button", { type: "button", style: styles.smallButton, disabled: existsInWorkLines, onClick: () => addRoSuggestionToWorkLine(selectedRO.id, item), children: "Add to Work Line" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => dismissMileageSuggestion(`ro:${selectedRO.id}`, item.id), children: "Dismiss" })] })] }, item.id));
                                                            }) })] }, group.category))) })), (roRecommendationTitlesById[selectedRO.id] ?? []).length > 0 ? (_jsxs("div", { style: { marginTop: 10 }, children: [_jsx("div", { style: styles.formHint, children: "Recommendations" }), _jsx("div", { style: styles.chipWrap, children: (roRecommendationTitlesById[selectedRO.id] ?? []).map((title) => (_jsx("span", { style: styles.tagNeutral, children: title }, title))) })] })) : null] }), _jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Added Maintenance Recommendations" }), _jsx("div", { style: styles.formHint, children: "Selected items from the unified suggestion list appear here as the recommendation set for this RO." })] }), _jsxs("span", { style: selectedROMaintenanceRecommendations.length ? styles.statusOk : styles.statusNeutral, children: [selectedROMaintenanceRecommendations.length, " Added"] })] }), selectedROMaintenanceRecommendations.length === 0 ? (_jsx("div", { style: styles.formHint, children: "No maintenance recommendations added yet." })) : (_jsx("div", { style: styles.chipWrap, children: selectedROMaintenanceRecommendations.map((title) => (_jsx("span", { style: styles.tagNeutral, children: title }, title))) }))] }), _jsxs("div", { style: styles.sectionCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Customer Approval Layer" }), _jsx("div", { style: styles.formHint, children: "Advisor view for internal control, plus a customer-friendly approval preview inspired by digital estimate workflows." })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: approvalPreviewMode === "Advisor" ? styles.smallButton : styles.smallButtonMuted, onClick: () => setApprovalPreviewMode("Advisor"), children: "Advisor View" }), _jsx("button", { type: "button", style: approvalPreviewMode === "Customer" ? styles.smallButtonSuccess : styles.smallButtonMuted, onClick: () => setApprovalPreviewMode("Customer"), children: "Customer View" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Approval Summary" }), _jsx("textarea", { style: styles.textarea, value: approvalSummary, onChange: (e) => setApprovalSummary(e.target.value), placeholder: "Customer-friendly approval summary / estimate notes" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Communication Hook" }), _jsx("input", { style: styles.input, value: approvalCommHook, onChange: (e) => setApprovalCommHook(e.target.value), placeholder: "SMS / email placeholder" }), _jsx("div", { style: styles.formHint, children: "Use this as the delivery method label for SMS, email, Viber, or WhatsApp." })] })] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "SMS Provider Settings" }), _jsx("div", { style: styles.formHint, children: "Choose a provider and store gateway credentials locally for the demo send flow." })] }), _jsx("span", { style: smsProviderConfig.isConfigured ? styles.statusOk : styles.statusWarning, children: smsProviderConfig.provider })] }), _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Provider Mode" }), _jsxs("select", { style: styles.select, value: smsProviderMode, onChange: (e) => setSmsProviderMode(e.target.value), children: [_jsx("option", { value: "simulated", children: "Simulated" }), _jsx("option", { value: "android", children: "Android SMS Gateway" }), _jsx("option", { value: "twilio", children: "Twilio" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Provider State" }), _jsxs("div", { style: styles.concernCard, children: [smsProviderConfig.provider, " ", smsProviderConfig.isConfigured ? `(${smsProviderConfig.endpointLabel})` : "(not configured)"] })] })] }), smsProviderMode === "android" ? (_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Gateway URL" }), _jsx("input", { style: styles.input, value: smsAndroidGatewayUrl, onChange: (e) => setSmsAndroidGatewayUrl(e.target.value), placeholder: "https://gateway.example.com/send" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "API Key / Auth Token" }), _jsx("input", { style: styles.input, value: smsAndroidGatewayApiKey, onChange: (e) => setSmsAndroidGatewayApiKey(e.target.value), placeholder: "Optional auth token" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Sender Device Label" }), _jsx("input", { style: styles.input, value: smsAndroidSenderDeviceLabel, onChange: (e) => setSmsAndroidSenderDeviceLabel(e.target.value), placeholder: "Front Desk Android" })] })] })) : smsProviderMode === "twilio" ? (_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Account SID" }), _jsx("input", { style: styles.input, value: smsTwilioAccountSid, onChange: (e) => setSmsTwilioAccountSid(e.target.value), placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "From Number" }), _jsx("input", { style: styles.input, value: smsTwilioFromNumber, onChange: (e) => setSmsTwilioFromNumber(e.target.value), placeholder: "+63..." })] })] })) : (_jsx("div", { style: styles.formHint, children: "Simulated mode keeps the send flow local while the provider integration is being prepared." })), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, disabled: isSavingSmsProviderSettings, onClick: saveSmsProviderSettings, children: "Save Gateway Settings" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => {
                                                                            setSmsProviderMode("simulated");
                                                                            setSmsProviderConfigFeedback("Simulated SMS mode selected.");
                                                                            window.localStorage.setItem(STORAGE_KEYS.smsProviderMode, "simulated");
                                                                        }, children: "Use Simulated" })] }), smsProviderConfigFeedback ? _jsx("div", { style: styles.concernCard, children: smsProviderConfigFeedback }) : null] })] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "SMS Approval Link System" }), _jsx("div", { style: styles.formHint, children: "Generate a secure customer portal link for this RO. Password login still works, but this link enables one-tap access from text." })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, disabled: isGeneratingApprovalLink, onClick: () => {
                                                                            if (!selectedRO || isGeneratingApprovalLink)
                                                                                return;
                                                                            setIsGeneratingApprovalLink(true);
                                                                            try {
                                                                                onGenerateSmsApprovalLink(selectedRO);
                                                                            }
                                                                            finally {
                                                                                setIsGeneratingApprovalLink(false);
                                                                            }
                                                                        }, children: activeApprovalLinkToken ? "Regenerate Customer Link" : "Generate Customer Link" }), _jsx("button", { type: "button", style: styles.smallButton, onClick: () => onOpenDemoCustomerApprovalLink(selectedRO), children: "Open Demo Approval View" })] })] }), autoPortalMessage ? _jsx("div", { style: styles.concernCard, children: autoPortalMessage }) : null, _jsx("div", { style: styles.mobileCardList, children: approvalLinkTokens.filter((row) => row.roId === selectedRO.id).slice(0, 3).map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("strong", { children: [row.channel, " Link"] }), _jsx("span", { style: row.revokedAt ? styles.statusLocked : isApprovalLinkActive(row) ? styles.statusOk : styles.statusWarning, children: row.revokedAt ? "Revoked" : isApprovalLinkActive(row) ? "Active" : "Expired" })] }), _jsxs("div", { style: styles.formHint, children: ["URL: ", buildCustomerApprovalLinkUrl(row.token)] }), _jsxs("div", { style: styles.formHint, children: ["Expires: ", formatDateTime(row.expiresAt), "  |  Last opened: ", row.lastUsedAt ? formatDateTime(row.lastUsedAt) : "Not yet used"] }), !row.revokedAt ? (_jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButton, onClick: async () => {
                                                                                try {
                                                                                    await navigator.clipboard.writeText(buildCustomerApprovalLinkUrl(row.token));
                                                                                }
                                                                                catch {
                                                                                    // Clipboard fallback not required for this demo UI.
                                                                                }
                                                                            }, children: "Copy Link" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => onRevokeApprovalLink(row.id), children: "Revoke Link" })] })) : null] }, row.id))) })] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Due Service Reminders" }), _jsx("div", { style: styles.formHint, children: "Simple reminder queue with live status and last sent time pulled from the SMS log." })] }), _jsxs("span", { style: serviceReminderRows.some((row) => row.status !== "Sent") ? styles.statusWarning : styles.statusOk, children: [serviceReminderRows.length, " Visible"] })] }), serviceReminderRows.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No due or recently sent service reminders were found for this repair order." })) : (_jsx("div", { style: styles.mobileCardList, children: serviceReminderRows.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.title }), _jsx("span", { style: row.status === "Sent" ? styles.statusOk : row.status === "Overdue" ? styles.statusWarning : styles.statusInfo, children: row.status })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["RO: ", row.roNumber, "  |  ", row.vehicleLabel] }), _jsx("div", { style: styles.mobileDataSecondary, children: row.customerName }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Due" }), _jsx("strong", { children: formatDateTime(row.dueDate) })] }), row.lastSentAt ? (_jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Last sent" }), _jsx("strong", { children: formatDateTime(row.lastSentAt) })] })) : null, _jsx("div", { style: styles.formHint, children: row.dueReason }), _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.smallButton, onClick: async () => {
                                                                            try {
                                                                                await navigator.clipboard.writeText(row.body);
                                                                            }
                                                                            catch {
                                                                                // Clipboard fallback not required for this demo UI.
                                                                            }
                                                                        }, children: "Copy Message" }) })] }, row.key))) }))] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Oil Change Reminders" }), _jsx("div", { style: styles.formHint, children: "Latest valid oil change per vehicle. Conventional: 6 months or 5,000 km. Fully synthetic: 12 months or 10,000 km." })] }), _jsxs("span", { style: oilChangeReminders.some((row) => row.isDue) ? styles.statusWarning : styles.statusOk, children: [oilChangeReminders.filter((row) => row.isDue).length, " Due"] })] }), oilChangeReminders.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No oil change service records were found for this workshop history yet." })) : (_jsx("div", { style: styles.mobileCardList, children: oilChangeReminders.map((reminder) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: reminder.vehicleLabel }), _jsx("span", { style: reminder.isDue ? styles.statusWarning : styles.statusOk, children: reminder.isDue ? "Due" : "Not Due Yet" })] }), _jsx("div", { style: styles.mobileDataSecondary, children: reminder.plateNumber || reminder.conductionNumber || "-" }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["Customer: ", reminder.customerName] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Last oil change" }), _jsx("strong", { children: formatDateTime(reminder.serviceDate) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Service odometer" }), _jsx("strong", { children: reminder.serviceOdometerKm || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Current odometer" }), _jsx("strong", { children: reminder.currentOdometerKm || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Due threshold" }), _jsx("strong", { children: reminder.oilType === "Fully Synthetic" ? "12 months / 10,000 km" : "6 months / 5,000 km" })] }), _jsx("div", { style: styles.formHint, children: reminder.dueReason }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButton, onClick: () => {
                                                                                setNotificationTemplateKey("oil-reminder");
                                                                                setSelectedOilReminderVehicleKey(reminder.vehicleKey);
                                                                            }, children: "View Template" }), _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: async () => {
                                                                                try {
                                                                                    await navigator.clipboard.writeText(buildOilChangeReminderMessage(reminder));
                                                                                }
                                                                                catch {
                                                                                    // Clipboard fallback not required for this demo UI.
                                                                                }
                                                                            }, children: "Copy Reminder" })] })] }, reminder.vehicleKey))) }))] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Release Follow-Up Reminders" }), _jsx("div", { style: styles.formHint, children: "Triggers 3 days after release if the RO is still released and no newer job has been opened for the same vehicle." })] }), _jsxs("span", { style: releaseFollowUpReminders.some((row) => row.isDue) ? styles.statusWarning : styles.statusOk, children: [releaseFollowUpReminders.filter((row) => row.isDue).length, " Due"] })] }), releaseFollowUpReminders.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No post-release follow-ups are due yet." })) : (_jsx("div", { style: styles.mobileCardList, children: releaseFollowUpReminders.map((reminder) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: "Follow-up (3 days after release)" }), _jsx("span", { style: reminder.isDue ? styles.statusWarning : styles.statusOk, children: reminder.isDue ? "Due" : "Not Due Yet" })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["RO: ", reminder.roNumber, "  |  Release: ", reminder.releaseNumber] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [reminder.vehicleLabel, " ", reminder.plateNumber || reminder.conductionNumber ? `(${reminder.plateNumber || reminder.conductionNumber})` : ""] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Released" }), _jsx("strong", { children: formatDateTime(reminder.releaseDate) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Follow-up due" }), _jsx("strong", { children: formatDateTime(reminder.dueDate) })] }), _jsx("div", { style: styles.formHint, children: reminder.dueReason }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButton, onClick: () => {
                                                                                setNotificationTemplateKey("follow-up");
                                                                                setSelectedFollowUpVehicleKey(reminder.vehicleKey);
                                                                            }, children: "View Template" }), _jsx("button", { type: "button", style: reminder.isDue ? styles.smallButtonSuccess : styles.smallButtonMuted, onClick: async () => {
                                                                                if (!reminder.isDue)
                                                                                    return;
                                                                                try {
                                                                                    await navigator.clipboard.writeText(buildReleaseFollowUpMessage(reminder));
                                                                                }
                                                                                catch {
                                                                                    // Clipboard fallback not required for this demo UI.
                                                                                }
                                                                            }, children: "Copy Message" })] })] }, reminder.vehicleKey))) }))] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Customer Notification Templates" }), _jsx("div", { style: styles.formHint, children: "Preview and copy SMS-ready text generated from the live RO, inspection, parts, release, and pull-out records." })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: notificationTemplateKey === "approval-request" ? styles.smallButtonSuccess : styles.smallButtonMuted, onClick: () => setNotificationTemplateKey("approval-request"), children: "Approval Request" }), _jsx("button", { type: "button", style: notificationTemplateKey === "waiting-parts" ? styles.smallButtonSuccess : styles.smallButtonMuted, onClick: () => setNotificationTemplateKey("waiting-parts"), children: "Waiting Parts" }), _jsx("button", { type: "button", style: notificationTemplateKey === "ready-release" ? styles.smallButtonSuccess : styles.smallButtonMuted, onClick: () => setNotificationTemplateKey("ready-release"), children: "Ready Release" }), _jsx("button", { type: "button", style: notificationTemplateKey === "pull-out-notice" ? styles.smallButtonSuccess : styles.smallButtonMuted, onClick: () => setNotificationTemplateKey("pull-out-notice"), children: "Pull-Out Notice" }), _jsx("button", { type: "button", style: notificationTemplateKey === "oil-reminder" ? styles.smallButtonSuccess : styles.smallButtonMuted, onClick: () => setNotificationTemplateKey("oil-reminder"), children: "Oil Reminder" }), _jsx("button", { type: "button", style: notificationTemplateKey === "follow-up" ? styles.smallButtonSuccess : styles.smallButtonMuted, onClick: () => setNotificationTemplateKey("follow-up"), children: "Follow-Up" })] })] }), activeCustomerNotificationTemplate ? (_jsxs("div", { style: styles.formStack, children: [_jsx("div", { style: styles.formHint, children: activeCustomerNotificationTemplate.subtitle }), _jsxs("div", { style: styles.summaryGrid, children: [_jsxs("div", { children: [_jsx("strong", { children: "Template:" }), " ", activeCustomerNotificationTemplate.title] }), _jsxs("div", { children: [_jsx("strong", { children: "RO:" }), " ", notificationPreviewRoNumber] }), _jsxs("div", { children: [_jsx("strong", { children: "Vehicle:" }), " ", notificationPreviewVehicleLabel] }), _jsxs("div", { children: [_jsx("strong", { children: "Customer:" }), " ", notificationPreviewCustomerName] })] }), _jsx("textarea", { style: { ...styles.textarea, minHeight: 260, fontFamily: "monospace" }, readOnly: true, value: activeCustomerNotificationTemplate.body }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButton, onClick: async () => {
                                                                            try {
                                                                                await navigator.clipboard.writeText(activeCustomerNotificationTemplate.body);
                                                                            }
                                                                            catch {
                                                                                // Clipboard fallback not required for this demo UI.
                                                                            }
                                                                        }, children: "Copy Template" }), _jsx("button", { type: "button", style: activeCustomerNotificationTemplateSendable ? styles.smallButtonSuccess : styles.smallButtonMuted, disabled: !activeCustomerNotificationTemplateSendable || sendingSmsKey === activeCustomerNotificationTemplate.key, onClick: async () => {
                                                                            if (!activeCustomerNotificationSmsPayload)
                                                                                return;
                                                                            setSendingSmsKey(activeCustomerNotificationTemplate.key);
                                                                            setSmsSendFeedback("");
                                                                            try {
                                                                                const result = await onSendSmsTemplate(activeCustomerNotificationSmsPayload);
                                                                                setSmsSendFeedback(`${result.provider}  |  ${result.detail}`);
                                                                            }
                                                                            catch {
                                                                                setSmsSendFeedback("SMS send failed unexpectedly.");
                                                                            }
                                                                            finally {
                                                                                setSendingSmsKey("");
                                                                            }
                                                                        }, children: sendingSmsKey === activeCustomerNotificationTemplate.key ? "Sending..." : "Send SMS" })] }), _jsxs("div", { style: styles.formHint, children: ["SMS provider: ", smsProviderConfig.provider, " ", smsProviderConfig.isConfigured
                                                                        ? `(${smsProviderConfig.endpointLabel})`
                                                                        : smsProviderConfig.provider === "Simulated"
                                                                            ? "(simulated placeholder)"
                                                                            : "(not configured)", ".", !activeCustomerNotificationTemplateSendable
                                                                        ? " This template is not ready to send yet."
                                                                        : smsProviderConfig.provider === "Android SMS Gateway" && !smsProviderConfig.isConfigured
                                                                            ? " Android gateway sends will fail safely until the gateway URL is saved."
                                                                            : " Ready to send from the current live record."] }), smsSendFeedback ? _jsx("div", { style: styles.concernCard, children: smsSendFeedback }) : null] })) : (_jsx("div", { style: styles.emptyState, children: "Select a repair order to preview customer notification templates." }))] }), _jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "SMS Attempt Log" }), _jsx("div", { style: styles.formHint, children: "Pending, sent, and failed attempts are stored locally so the send flow can be verified without a backend." })] }), _jsxs("span", { style: recentSmsAttempts.some((row) => (row.status ?? "Sent") === "Failed") ? styles.statusWarning : styles.statusOk, children: [recentSmsAttempts.length, " Recent"] })] }), recentSmsAttempts.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No SMS attempts have been logged for this repair order yet." })) : (_jsx("div", { style: styles.mobileCardList, children: recentSmsAttempts.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.messageType }), _jsx("span", { style: row.status === "Failed" ? styles.statusWarning : row.status === "Pending" ? styles.statusNeutral : styles.statusOk, children: row.status ?? "Sent" })] }), _jsx("div", { style: styles.mobileDataSecondary, children: row.customerName || selectedRO.accountLabel }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Phone" }), _jsx("strong", { children: row.phoneNumber || row.sentTo || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Provider" }), _jsx("strong", { children: row.provider || "Simulated" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: row.status === "Sent" ? "Last sent" : "Attempted" }), _jsx("strong", { children: formatDateTime(row.createdAt) })] }), _jsx("div", { style: styles.formHint, children: row.message }), row.providerResponse ? _jsxs("div", { style: styles.formHint, children: ["Provider response: ", row.providerResponse] }) : null, row.errorMessage ? _jsx("div", { style: styles.errorBox, children: row.errorMessage }) : null, row.status === "Failed" ? (_jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.smallButtonSuccess, disabled: resendingSmsLogId === row.id, onClick: async () => {
                                                                            if (resendingSmsLogId === row.id)
                                                                                return;
                                                                            setResendingSmsLogId(row.id);
                                                                            try {
                                                                                await onSendSmsTemplate({
                                                                                    roId: row.roId,
                                                                                    roNumber: row.roNumber,
                                                                                    customerId: row.customerId,
                                                                                    customerName: row.customerName,
                                                                                    phoneNumber: row.phoneNumber,
                                                                                    tokenId: row.tokenId,
                                                                                    messageType: row.messageType,
                                                                                    messageBody: row.message,
                                                                                });
                                                                            }
                                                                            finally {
                                                                                setResendingSmsLogId("");
                                                                            }
                                                                        }, children: resendingSmsLogId === row.id ? "Resending..." : "Resend" }) })) : null] }, row.id))) }))] }), _jsxs("div", { style: styles.summaryGrid, children: [_jsxs("div", { children: [_jsx("strong", { children: "Approved" }), _jsx("div", { children: totalApprovedCount })] }), _jsxs("div", { children: [_jsx("strong", { children: "Declined" }), _jsx("div", { children: totalDeclinedCount })] }), _jsxs("div", { children: [_jsx("strong", { children: "Deferred" }), _jsx("div", { children: totalDeferredCount })] }), _jsxs("div", { children: [_jsx("strong", { children: "Pending" }), _jsx("div", { children: approvalPendingCount })] }), _jsxs("div", { children: [_jsx("strong", { children: "Approved Total" }), _jsx("div", { children: formatCurrency(approvedEstimateTotal) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Pending Total" }), _jsx("div", { children: formatCurrency(pendingEstimateTotal) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Deferred Total" }), _jsx("div", { children: formatCurrency(deferredEstimateTotal) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Declined Total" }), _jsx("div", { children: formatCurrency(declinedEstimateTotal) })] })] }), (approvedWorkLines.length > 0 || declinedWorkLines.length > 0 || deferredWorkLines.length > 0) ? (_jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Approval Summary" }), _jsxs("div", { style: { ...styles.summaryGrid, marginBottom: 10 }, children: [_jsxs("div", { children: [_jsx("strong", { style: { color: "#15803d" }, children: "Approved" }), _jsxs("div", { children: [approvedWorkLines.length, " line", approvedWorkLines.length !== 1 ? "s" : "", "  |  ", formatCurrency(approvedEstimateTotal)] })] }), _jsxs("div", { children: [_jsx("strong", { style: { color: "#b45309" }, children: "Deferred" }), _jsxs("div", { children: [deferredWorkLines.length, " line", deferredWorkLines.length !== 1 ? "s" : "", "  |  ", formatCurrency(deferredEstimateTotal)] })] }), _jsxs("div", { children: [_jsx("strong", { style: { color: "#b91c1c" }, children: "Declined" }), _jsxs("div", { children: [declinedWorkLines.length, " line", declinedWorkLines.length !== 1 ? "s" : "", "  |  ", formatCurrency(declinedEstimateTotal)] })] }), _jsxs("div", { children: [_jsx("strong", { children: "Pending" }), _jsxs("div", { children: [pendingWorkLines.length, " line", pendingWorkLines.length !== 1 ? "s" : "", "  |  ", formatCurrency(pendingEstimateTotal)] })] })] }), approvedWorkLines.length > 0 ? (_jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("div", { style: { ...styles.formHint, fontWeight: 600, color: "#15803d", marginBottom: 4 }, children: "Approved Work Lines" }), approvedWorkLines.map((line) => (_jsxs("div", { style: { ...styles.mobileDataCard, borderLeft: "3px solid #15803d", marginBottom: 4 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: line.title || "Untitled" }), _jsx("span", { children: formatCurrency(parseMoneyInput(line.totalEstimate)) })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [line.category || "General", "  |  ", line.priority, " priority  |  ", line.status] })] }, `sum_approved_${line.id}`)))] })) : null, deferredWorkLines.length > 0 ? (_jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("div", { style: { ...styles.formHint, fontWeight: 600, color: "#b45309", marginBottom: 4 }, children: "Deferred Items" }), deferredWorkLines.map((line) => (_jsxs("div", { style: { ...styles.mobileDataCard, borderLeft: "3px solid #b45309", marginBottom: 4 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: line.title || "Untitled" }), _jsx("span", { children: formatCurrency(parseMoneyInput(line.totalEstimate)) })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [line.category || "General", "  |  ", line.priority, " priority"] }), line.notes ? _jsx("div", { style: styles.formHint, children: line.notes }) : null] }, `sum_deferred_${line.id}`)))] })) : null, declinedWorkLines.length > 0 ? (_jsxs("div", { children: [_jsx("div", { style: { ...styles.formHint, fontWeight: 600, color: "#b91c1c", marginBottom: 4 }, children: "Declined Items" }), declinedWorkLines.map((line) => (_jsxs("div", { style: { ...styles.mobileDataCard, borderLeft: "3px solid #b91c1c", marginBottom: 4 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: line.title || "Untitled" }), _jsx("span", { children: formatCurrency(parseMoneyInput(line.totalEstimate)) })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [line.category || "General", "  |  ", line.priority, " priority"] }), line.notes ? _jsx("div", { style: styles.formHint, children: line.notes }) : null] }, `sum_declined_${line.id}`)))] })) : null] })) : null, _jsxs("div", { style: { ...styles.inlineActions, marginTop: 12, flexWrap: "wrap" }, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => setBulkLineDecision("Approved"), disabled: pendingWorkLines.length === 0, children: "Approve All Pending Lines" }), _jsx("button", { type: "button", style: styles.smallButton, onClick: () => setBulkLineDecision("Deferred"), disabled: pendingWorkLines.length === 0, children: "Defer All Pending Lines" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => setBulkLineDecision("Declined"), disabled: pendingWorkLines.length === 0, children: "Decline All Pending Lines" })] }), !canAdvanceToWork ? (_jsx("div", { style: { ...styles.errorBox, marginTop: 12 }, children: "RO progression is locked. Decide all pending work lines and findings before moving this job into work. At least one work line must be approved." })) : (_jsx("div", { style: { ...styles.statusOk, marginTop: 12 }, children: "Approval complete. This RO can now move into work." })), findingRecommendations.length ? (_jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Inspection Findings Waiting for RO Mapping" }), _jsx("div", { style: styles.formHint, children: "Approving a finding inserts a new RO work line immediately. Declined findings stay out of the RO. Deferred findings stay visible for follow-up." })] }), _jsxs("span", { style: styles.statusInfo, children: [findingRecommendations.length, " finding recommendations"] })] }), _jsxs("div", { style: { ...styles.inlineActions, marginTop: 12, flexWrap: "wrap" }, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => setBulkFindingRecommendationDecision("Approved"), disabled: pendingFindingRecommendations.length === 0, children: "Approve All Pending Findings" }), _jsx("button", { type: "button", style: styles.smallButton, onClick: () => setBulkFindingRecommendationDecision("Deferred"), disabled: pendingFindingRecommendations.length === 0, children: "Defer All Pending Findings" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => setBulkFindingRecommendationDecision("Declined"), disabled: pendingFindingRecommendations.length === 0, children: "Decline All Pending Findings" })] }), _jsx("div", { style: styles.mobileCardList, children: findingRecommendations.map((item) => (_jsxs("div", { style: { ...styles.mobileDataCard, border: "1px solid rgba(59, 130, 246, 0.16)" }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: item.workLineTitle }), _jsx("span", { style: getApprovalDecisionStyle(toApprovalDecision(item.decision)), children: item.decision })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [item.category, "  |  Source finding: ", item.title] }), item.note ? _jsx("div", { style: styles.concernCard, children: item.note }) : null, item.photoNotes.length ? _jsxs("div", { style: styles.formHint, children: ["Photo notes: ", item.photoNotes.join("  |  ")] }) : null, item.decidedAt ? _jsxs("div", { style: styles.formHint, children: ["Decision Time: ", formatDateTime(item.decidedAt)] }) : null, _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => setFindingRecommendationDecision(item, "Approved"), disabled: item.decision === "Approved", children: "Approve to RO" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => setFindingRecommendationDecision(item, "Deferred"), disabled: item.decision === "Deferred", children: "Defer" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => setFindingRecommendationDecision(item, "Declined"), disabled: item.decision === "Declined", children: "Decline" })] }), item.decision === "Approved" ? (_jsx("div", { style: styles.formHint, children: "This finding is already mapped into the RO work lines." })) : null] }, `finding_map_${item.id}`))) })] })) : null, approvalPreviewMode === "Customer" ? (_jsxs("div", { style: { ...styles.sectionCardMuted, marginTop: 12 }, children: [_jsx("div", { style: styles.sectionTitle, children: "Customer-Friendly Approval Preview" }), _jsx("div", { style: styles.mobileCardList, children: selectedRO.workLines.map((line) => {
                                                            const decision = line.approvalDecision ??
                                                                selectedApproval?.items.find((item) => item.workLineId === line.id)?.decision ??
                                                                "Pending";
                                                            return (_jsxs("div", { style: { ...styles.mobileDataCard, border: "1px solid rgba(37, 99, 235, 0.12)", background: "#ffffff" }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: line.title || "Untitled Work Line" }), _jsx("span", { style: getApprovalDecisionStyle(decision), children: decision })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [line.category || "General", "  |  ", formatCurrency(parseMoneyInput(line.totalEstimate))] }), _jsx("div", { style: styles.concernCard, children: getCustomerFriendlyLineDescription(line) }), line.notes ? _jsxs("div", { style: styles.formHint, children: ["Tech notes: ", line.notes] }) : null, _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => setLineDecision("Approved", line.id), children: "Approve Work" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => setLineDecision("Deferred", line.id), children: "Decide Later" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => setLineDecision("Declined", line.id), children: "Decline Work" })] })] }, `customer_approval_${line.id}`));
                                                        }) }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Message Preview" }), _jsx("textarea", { style: styles.textareaLarge, value: customerApprovalMessage, readOnly: true })] })] })) : (_jsx("div", { style: { ...styles.mobileCardList, marginTop: 12 }, children: selectedRO.workLines.map((line) => {
                                                    const decision = line.approvalDecision ??
                                                        selectedApproval?.items.find((item) => item.workLineId === line.id)?.decision ??
                                                        "Pending";
                                                    const approvedAt = line.approvalAt ||
                                                        selectedApproval?.items.find((item) => item.workLineId === line.id)?.approvedAt ||
                                                        "";
                                                    return (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: line.title || "Untitled Work Line" }), _jsx("span", { style: getApprovalDecisionStyle(decision), children: decision })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [line.category || "General", "  |  ", formatCurrency(parseMoneyInput(line.totalEstimate))] }), line.recommendationSource ? (_jsxs("div", { style: styles.formHint, children: ["Source: ", line.recommendationSource] })) : null, approvedAt ? _jsxs("div", { style: styles.formHint, children: ["Decision Time: ", formatDateTime(approvedAt)] }) : null, line.notes ? _jsx("div", { style: styles.concernCard, children: line.notes }) : null, _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => setLineDecision("Approved", line.id), children: "Approve Work" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => setLineDecision("Deferred", line.id), children: "Decide Later" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => setLineDecision("Declined", line.id), children: "Decline Work" })] })] }, `approval_${line.id}`));
                                                }) })), selectedApproval ? (_jsxs("div", { style: styles.formHint, children: ["Last approval record: ", selectedApproval.approvalNumber, "  |  ", formatDateTime(selectedApproval.createdAt), "  |  Deferred: ", selectedRO.deferredLineTitles.length ? selectedRO.deferredLineTitles.join(", ") : "None", "  |  Hook: ", selectedApproval.communicationHook] })) : null] }), _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Backjob / Comeback Tracking" }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Complaint" }), _jsx("input", { style: styles.input, value: backjobComplaint, onChange: (e) => setBackjobComplaint(e.target.value), placeholder: "Describe comeback issue" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Root Cause" }), _jsx("input", { style: styles.input, value: backjobRootCause, onChange: (e) => setBackjobRootCause(e.target.value), placeholder: "Root cause / source" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Responsibility" }), _jsxs("select", { style: styles.select, value: backjobOutcome, onChange: (e) => setBackjobOutcome(e.target.value), children: [_jsx("option", { value: "Customer Pay", children: "Customer Pay" }), _jsx("option", { value: "Internal", children: "Internal" }), _jsx("option", { value: "Warranty", children: "Warranty" }), _jsx("option", { value: "Goodwill", children: "Goodwill" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Resolution Notes" }), _jsx("input", { style: styles.input, value: backjobResolutionNotes, onChange: (e) => setBackjobResolutionNotes(e.target.value), placeholder: "Action taken / resolution" })] })] }), _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.secondaryButton, onClick: createBackjob, children: "Save Backjob Record" }) }), selectedBackjobs.length ? (_jsx("div", { style: styles.mobileCardList, children: selectedBackjobs.slice(0, 3).map((item) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: item.backjobNumber }), _jsx("span", { style: styles.statusWarning, children: item.responsibility })] }), _jsx("div", { style: styles.mobileDataSecondary, children: item.complaint }), _jsx("div", { style: styles.formHint, children: item.rootCause || "No root cause entered" })] }, item.id))) })) : null] }), _jsxs("div", { style: styles.sectionCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("div", { style: styles.sectionTitle, children: "Work Lines" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: () => addROWorkLine(selectedRO.id), children: "Add Work Line" })] }), _jsx("div", { style: styles.formStack, children: selectedRO.workLines.map((line, index) => (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("strong", { children: ["Line ", index + 1] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("span", { style: getApprovalDecisionStyle(line.approvalDecision ?? "Pending"), children: line.approvalDecision ?? "Pending" }), _jsx(WorkLineStatusBadge, { status: line.status }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => removeROWorkLine(selectedRO.id, line.id), disabled: line.approvalDecision === "Approved", children: "Remove" })] })] }), _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Title" }), _jsx("input", { style: styles.input, value: line.title, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "title", e.target.value), disabled: line.approvalDecision === "Approved" })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Category" }), _jsx("input", { style: styles.input, value: line.category, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "category", e.target.value), disabled: line.approvalDecision === "Approved" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Priority" }), _jsxs("select", { style: styles.select, value: line.priority, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "priority", e.target.value), children: [_jsx("option", { value: "Low", children: "Low" }), _jsx("option", { value: "Medium", children: "Medium" }), _jsx("option", { value: "High", children: "High" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Status" }), _jsxs("select", { style: styles.select, value: line.status, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "status", e.target.value), disabled: (line.approvalDecision ?? "Pending") !== "Approved", children: [_jsx("option", { value: "Pending", children: "Pending" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Waiting Parts", children: "Waiting Parts" }), _jsx("option", { value: "Completed", children: "Completed" })] })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Service Estimate" }), _jsx("input", { style: styles.input, value: line.serviceEstimate, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "serviceEstimate", e.target.value), disabled: line.approvalDecision === "Approved" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Parts Estimate" }), _jsx("input", { style: styles.input, value: line.partsEstimate, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "partsEstimate", e.target.value), disabled: line.approvalDecision === "Approved" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Total" }), _jsx("input", { style: styles.input, value: formatCurrency(parseMoneyInput(line.totalEstimate)), readOnly: true })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Notes" }), _jsx("textarea", { style: styles.textarea, value: line.notes, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "notes", e.target.value) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Customer Description" }), _jsx("textarea", { style: styles.textarea, value: line.customerDescription, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "customerDescription", e.target.value), disabled: line.approvalDecision === "Approved" })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid4, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Labor Hours" }), _jsx("input", { style: styles.input, value: line.laborHours, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "laborHours", e.target.value), disabled: line.approvalDecision === "Approved" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Labor Rate" }), _jsx("input", { style: styles.input, value: line.laborRate, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "laborRate", e.target.value), disabled: line.approvalDecision === "Approved" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Parts Cost" }), _jsx("input", { style: styles.input, value: line.partsCost, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "partsCost", e.target.value), disabled: line.approvalDecision === "Approved" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Markup %" }), _jsx("input", { style: styles.input, value: line.partsMarkupPercent, onChange: (e) => updateROWorkLine(selectedRO.id, line.id, "partsMarkupPercent", e.target.value), disabled: line.approvalDecision === "Approved" })] })] }), line.recommendationSource ? _jsxs("div", { style: styles.formHint, children: ["Source: ", line.recommendationSource] }) : null, _jsxs("div", { style: styles.formHint, children: ["Labor: ", formatCurrency(getWorkLinePricing(line).laborAmount), "  |  Parts: ", formatCurrency(getWorkLinePricing(line).partsAmount), "  |  Total: ", formatCurrency(getWorkLinePricing(line).totalAmount)] }), (line.approvalDecision ?? "Pending") !== "Approved" ? (_jsx("div", { style: styles.formHint, children: "Execution status is locked until this line is approved." })) : (_jsx("div", { style: styles.formHint, children: "Approved lines are locked for pricing/title edits and ready for execution tracking." }))] })] }, line.id))) })] })] })) : null] }) })] }) }));
}
function UsersPage({ currentUser, users, setUsers, roleDefinitions, isCompactLayout, }) {
    const canManageUsers = hasPermission(currentUser.role, roleDefinitions, "users.manage");
    const [form, setForm] = useState({
        fullName: "",
        username: "",
        password: "",
        role: "Reception",
        active: true,
    });
    const [error, setError] = useState("");
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const resetForm = () => {
        setForm({
            fullName: "",
            username: "",
            password: "",
            role: "Reception",
            active: true,
        });
        setError("");
    };
    const handleCreateUser = (e) => {
        e.preventDefault();
        if (!canManageUsers)
            return;
        if (isCreatingUser)
            return;
        setIsCreatingUser(true);
        try {
            const fullName = form.fullName.trim();
            const username = form.username.trim().toLowerCase();
            const password = form.password;
            if (!fullName || !username || !password) {
                setError("Full name, username, and password are required.");
                return;
            }
            if (users.some((u) => u.username.toLowerCase() === username)) {
                setError("Username already exists.");
                return;
            }
            const newUser = {
                id: uid("usr"),
                fullName,
                username,
                password,
                role: form.role,
                active: form.active,
                createdAt: new Date().toISOString(),
            };
            setUsers((prev) => [newUser, ...prev]);
            resetForm();
        }
        finally {
            setIsCreatingUser(false);
        }
    };
    const toggleUserActive = (id) => {
        if (!canManageUsers)
            return;
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, active: !user.active } : user)));
    };
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsx(Card, { title: "Create User", subtitle: "Action is permission-restricted", right: _jsx("span", { style: canManageUsers ? styles.statusOk : styles.statusLocked, children: canManageUsers ? "Manage Allowed" : "Manage Locked" }), children: _jsxs("form", { onSubmit: handleCreateUser, style: styles.formStack, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Full Name" }), _jsx("input", { style: styles.input, value: form.fullName, onChange: (e) => setForm((prev) => ({ ...prev, fullName: e.target.value })), disabled: !canManageUsers, placeholder: "Enter full name" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Username" }), _jsx("input", { style: styles.input, value: form.username, onChange: (e) => setForm((prev) => ({ ...prev, username: e.target.value })), disabled: !canManageUsers, placeholder: "Enter username" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Password" }), _jsx("input", { style: styles.input, type: "password", value: form.password, onChange: (e) => setForm((prev) => ({ ...prev, password: e.target.value })), disabled: !canManageUsers, placeholder: "Enter password" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Role" }), _jsx("select", { style: styles.select, value: form.role, onChange: (e) => setForm((prev) => ({ ...prev, role: e.target.value })), disabled: !canManageUsers, children: ALL_ROLES.map((role) => (_jsx("option", { value: role, children: role }, role))) })] }), _jsxs("label", { style: styles.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: form.active, onChange: (e) => setForm((prev) => ({ ...prev, active: e.target.checked })), disabled: !canManageUsers }), _jsx("span", { children: "Active account" })] }), error ? _jsx("div", { style: styles.errorBox, children: error }) : null, _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "submit", style: {
                                                ...styles.primaryButton,
                                                ...(canManageUsers ? {} : styles.buttonDisabled),
                                            }, disabled: !canManageUsers || isCreatingUser, children: "Add User" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: resetForm, children: "Reset" })] })] }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsx(Card, { title: "User Registry", subtitle: "All system users", children: isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: users.map((user) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: user.fullName }), _jsx(RoleBadge, { role: user.role })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["Username: ", user.username] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Status" }), _jsx("span", { style: user.active ? styles.statusOk : styles.statusLocked, children: user.active ? "Active" : "Inactive" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Created" }), _jsx("strong", { children: formatDateTime(user.createdAt) })] }), _jsx("button", { type: "button", style: {
                                            ...styles.smallButton,
                                            ...(canManageUsers ? {} : styles.buttonDisabled),
                                            width: "100%",
                                        }, disabled: !canManageUsers || user.role === "Admin", onClick: () => toggleUserActive(user.id), children: user.active ? "Deactivate" : "Activate" })] }, user.id))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Name" }), _jsx("th", { style: styles.th, children: "Username" }), _jsx("th", { style: styles.th, children: "Role" }), _jsx("th", { style: styles.th, children: "Status" }), _jsx("th", { style: styles.th, children: "Created" }), _jsx("th", { style: styles.th, children: "Action" })] }) }), _jsx("tbody", { children: users.map((user) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: user.fullName }), _jsx("td", { style: styles.td, children: user.username }), _jsx("td", { style: styles.td, children: _jsx(RoleBadge, { role: user.role }) }), _jsx("td", { style: styles.td, children: _jsx("span", { style: user.active ? styles.statusOk : styles.statusLocked, children: user.active ? "Active" : "Inactive" }) }), _jsx("td", { style: styles.td, children: formatDateTime(user.createdAt) }), _jsx("td", { style: styles.td, children: _jsx("button", { type: "button", style: {
                                                            ...styles.smallButton,
                                                            ...(canManageUsers ? {} : styles.buttonDisabled),
                                                        }, disabled: !canManageUsers || user.role === "Admin", onClick: () => toggleUserActive(user.id), children: user.active ? "Deactivate" : "Activate" }) })] }, user.id))) })] }) })) }) })] }) }));
}
function ShopFloorPage({ currentUser, users, repairOrders, setRepairOrders, workLogs, setWorkLogs, isCompactLayout, }) {
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState(["General Mechanic", "OJT"].includes(currentUser.role) ? "My Jobs" : "All Jobs");
    const [selectedRoId, setSelectedRoId] = useState("");
    const canManageShopFloor = ["Admin", "Chief Technician", "Senior Mechanic"].includes(currentUser.role);
    const primaryTechnicians = useMemo(() => users.filter((user) => user.active &&
        ["Chief Technician", "Senior Mechanic", "General Mechanic"].includes(user.role)), [users]);
    const supportTechnicians = useMemo(() => users.filter((user) => user.active &&
        ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role)), [users]);
    const sortedRepairOrders = useMemo(() => [...repairOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [repairOrders]);
    const visibleRepairOrders = useMemo(() => {
        const base = viewMode === "My Jobs"
            ? sortedRepairOrders.filter((row) => row.primaryTechnicianId === currentUser.id ||
                row.supportTechnicianIds.includes(currentUser.id))
            : sortedRepairOrders;
        const term = search.trim().toLowerCase();
        if (!term)
            return base;
        return base.filter((row) => [
            row.roNumber,
            row.plateNumber,
            row.conductionNumber,
            row.accountLabel,
            row.make,
            row.model,
            row.customerConcern,
            row.status,
        ]
            .join(" ")
            .toLowerCase()
            .includes(term));
    }, [currentUser.id, search, sortedRepairOrders, viewMode]);
    const selectedRO = useMemo(() => visibleRepairOrders.find((row) => row.id === selectedRoId) ?? visibleRepairOrders[0] ?? null, [selectedRoId, visibleRepairOrders]);
    useEffect(() => {
        if (!selectedRoId && visibleRepairOrders.length > 0) {
            setSelectedRoId(visibleRepairOrders[0].id);
            return;
        }
        if (selectedRoId && !visibleRepairOrders.some((row) => row.id === selectedRoId)) {
            setSelectedRoId(visibleRepairOrders[0]?.id ?? "");
        }
    }, [selectedRoId, visibleRepairOrders]);
    const getUserName = (userId) => users.find((user) => user.id === userId)?.fullName || "Unassigned";
    const updateRO = (roId, patch) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { roNumber: _rn, createdAt: _ca, encodedBy: _eb, ...safePatch } = patch;
        setRepairOrders((prev) => prev.map((row) => row.id === roId
            ? {
                ...row,
                ...safePatch,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.fullName,
            }
            : row));
    };
    const handleStatusChange = (roId, status) => {
        if (!canManageShopFloor)
            return;
        const target = repairOrders.find((row) => row.id === roId);
        if (!target)
            return;
        updateRO(roId, {
            status,
            workStartedAt: status === "In Progress" ? target.workStartedAt || new Date().toISOString() : target.workStartedAt,
        });
    };
    const handlePrimaryChange = (roId, technicianId) => {
        if (!canManageShopFloor)
            return;
        updateRO(roId, {
            primaryTechnicianId: technicianId,
            supportTechnicianIds: repairOrders.find((row) => row.id === roId)?.supportTechnicianIds.filter((id) => id !== technicianId) ?? [],
        });
    };
    const handleSupportToggle = (roId, technicianId) => {
        if (!canManageShopFloor)
            return;
        const target = repairOrders.find((row) => row.id === roId);
        if (!target)
            return;
        const exists = target.supportTechnicianIds.includes(technicianId);
        updateRO(roId, {
            supportTechnicianIds: exists
                ? target.supportTechnicianIds.filter((id) => id !== technicianId)
                : [...target.supportTechnicianIds.filter((id) => id !== target.primaryTechnicianId), technicianId],
        });
    };
    const roWorkLogs = useMemo(() => workLogs.filter((row) => row.roId === selectedRO?.id), [selectedRO?.id, workLogs]);
    const activeRoWorkLogs = useMemo(() => roWorkLogs.filter((row) => !row.endedAt), [roWorkLogs]);
    const startWorkLog = (workLineId, technicianId) => {
        if (!selectedRO || !technicianId)
            return;
        const hasActive = workLogs.some((row) => row.roId === selectedRO.id && row.workLineId === workLineId && row.technicianId === technicianId && !row.endedAt);
        if (hasActive)
            return;
        const now = new Date().toISOString();
        setWorkLogs((prev) => [
            {
                id: uid("wlog"),
                roId: selectedRO.id,
                workLineId,
                technicianId,
                startedAt: now,
                endedAt: undefined,
                totalMinutes: 0,
                note: "",
            },
            ...prev,
        ]);
        if (!selectedRO.workStartedAt) {
            updateRO(selectedRO.id, {
                workStartedAt: now,
                status: selectedRO.status === "Approved / Ready to Work" ? "In Progress" : selectedRO.status,
            });
        }
    };
    const stopWorkLog = (logId) => {
        setWorkLogs((prev) => prev.map((row) => {
            if (row.id !== logId || row.endedAt)
                return row;
            const endedAt = new Date().toISOString();
            const totalMinutes = Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(row.startedAt).getTime()) / 60000));
            return { ...row, endedAt, totalMinutes };
        }));
    };
    const lineMinutesMap = useMemo(() => {
        const map = new Map();
        roWorkLogs.forEach((log) => {
            map.set(log.workLineId, (map.get(log.workLineId) ?? 0) + getWorkLogMinutes(log));
        });
        return map;
    }, [roWorkLogs]);
    const techMinutesMap = useMemo(() => {
        const map = new Map();
        roWorkLogs.forEach((log) => {
            map.set(log.technicianId, (map.get(log.technicianId) ?? 0) + getWorkLogMinutes(log));
        });
        return map;
    }, [roWorkLogs]);
    const statusCounts = useMemo(() => ({
        total: sortedRepairOrders.length,
        inProgress: sortedRepairOrders.filter((row) => row.status === "In Progress").length,
        waitingParts: sortedRepairOrders.filter((row) => row.status === "Waiting Parts").length,
        qc: sortedRepairOrders.filter((row) => row.status === "Quality Check").length,
        readyRelease: sortedRepairOrders.filter((row) => row.status === "Ready Release").length,
    }), [sortedRepairOrders]);
    const myActiveJobsCount = sortedRepairOrders.filter((row) => ["Approved / Ready to Work", "In Progress", "Waiting Parts", "Quality Check"].includes(row.status) &&
        (row.primaryTechnicianId === currentUser.id || row.supportTechnicianIds.includes(currentUser.id))).length;
    const selectedROEstimateTotal = selectedRO
        ? selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0)
        : 0;
    const selectedROCompletedLines = selectedRO
        ? selectedRO.workLines.filter((line) => line.status === "Completed").length
        : 0;
    const technicianBoard = useMemo(() => {
        const techUsers = users.filter((user) => user.active &&
            ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role));
        return techUsers
            .map((user) => {
            const assignedJobs = sortedRepairOrders.filter((row) => row.primaryTechnicianId === user.id || row.supportTechnicianIds.includes(user.id));
            const liveLogs = workLogs.filter((log) => log.technicianId === user.id && !log.endedAt);
            const bookedMinutes = workLogs
                .filter((log) => log.technicianId === user.id)
                .reduce((sum, log) => sum + getWorkLogMinutes(log), 0);
            const completedJobs = assignedJobs.filter((row) => ["Ready Release", "Released", "Closed"].includes(row.status)).length;
            const laborProduced = assignedJobs.reduce((sum, ro) => sum +
                ro.workLines.reduce((lineSum, line) => lineSum + parseMoneyInput(line.serviceEstimate), 0), 0);
            const efficiency = bookedMinutes > 0 ? Math.round((laborProduced / bookedMinutes) * 60) : 0;
            return {
                user,
                assignedJobs,
                liveLogs,
                bookedMinutes,
                completedJobs,
                laborProduced,
                efficiency,
            };
        })
            .sort((a, b) => b.liveLogs.length - a.liveLogs.length ||
            b.assignedJobs.length - a.assignedJobs.length ||
            b.bookedMinutes - a.bookedMinutes);
    }, [sortedRepairOrders, users, workLogs]);
    const myLiveLogs = useMemo(() => workLogs.filter((log) => log.technicianId === currentUser.id && !log.endedAt), [currentUser.id, workLogs]);
    const updateWorkLineStatus = (workLineId, status) => {
        if (!selectedRO)
            return;
        const now = new Date().toISOString();
        setRepairOrders((prev) => prev.map((row) => {
            if (row.id !== selectedRO.id)
                return row;
            const targetLine = row.workLines.find((l) => l.id === workLineId);
            if (!targetLine)
                return row;
            if (targetLine.approvalDecision !== "Approved" && status !== "Pending")
                return row;
            if (targetLine.status === "Waiting Parts" && status === "Completed")
                return row;
            const nextWorkLines = row.workLines.map((line) => line.id === workLineId ? { ...line, status, completedAt: status === "Completed" ? now : line.completedAt } : line);
            const approvedLines = nextWorkLines.filter((l) => l.approvalDecision !== "Declined" && l.approvalDecision !== "Deferred");
            const allApprovedCompleted = approvedLines.length > 0 && approvedLines.every((l) => l.status === "Completed");
            const hasWaitingParts = nextWorkLines.some((line) => line.status === "Waiting Parts");
            const hasInProgress = nextWorkLines.some((line) => line.status === "In Progress");
            let nextStatus = row.status;
            if (allApprovedCompleted && !["Released", "Closed"].includes(row.status)) {
                nextStatus = "Quality Check";
            }
            else if (hasWaitingParts && row.status !== "Quality Check") {
                nextStatus = "Waiting Parts";
            }
            else if (hasInProgress && !["Quality Check", "Ready Release", "Released", "Closed"].includes(row.status)) {
                nextStatus = "In Progress";
            }
            return {
                ...row,
                workLines: nextWorkLines,
                status: nextStatus,
                updatedAt: now,
                updatedBy: currentUser.fullName,
                workStartedAt: row.workStartedAt || now,
            };
        }));
    };
    const stopActiveLogsForLine = (workLineId) => {
        setWorkLogs((prev) => prev.map((row) => {
            if (row.workLineId !== workLineId || !selectedRO || row.roId !== selectedRO.id || row.endedAt)
                return row;
            const endedAt = new Date().toISOString();
            const totalMinutes = Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(row.startedAt).getTime()) / 60000));
            return { ...row, endedAt, totalMinutes };
        }));
    };
    const markWorkLineComplete = (workLineId) => {
        stopActiveLogsForLine(workLineId);
        updateWorkLineStatus(workLineId, "Completed");
    };
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Shop Floor Job Feed", subtitle: "Newest to oldest operational board with technician assignment, live timers, and no fixed bay layout", right: _jsxs("div", { style: styles.inlineActions, children: [_jsxs("span", { style: styles.statusInfo, children: [visibleRepairOrders.length, " visible jobs"] }), _jsx("span", { style: canManageShopFloor ? styles.statusOk : styles.statusNeutral, children: canManageShopFloor ? "Manage Allowed" : "View Only" })] }), children: _jsx("div", { style: styles.heroText, children: "This board uses repair orders as the live job source. It does not use fixed bays. Jobs stay visible from draft through closed so management and staff can see the full queue, reassign technicians quickly, and move vehicles cleanly from approval to release." }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "All Jobs" }), _jsx("div", { style: styles.statValue, children: statusCounts.total }), _jsx("div", { style: styles.statNote, children: "Full queue from RO records" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "In Progress" }), _jsx("div", { style: styles.statValue, children: statusCounts.inProgress }), _jsx("div", { style: styles.statNote, children: "Vehicles actively worked on" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Waiting Parts" }), _jsx("div", { style: styles.statValue, children: statusCounts.waitingParts }), _jsx("div", { style: styles.statNote, children: "Paused for parts availability" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "QC / Ready Release" }), _jsx("div", { style: styles.statValue, children: statusCounts.qc + statusCounts.readyRelease }), _jsx("div", { style: styles.statNote, children: "Near-completion vehicles" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "My Active Jobs" }), _jsx("div", { style: styles.statValue, children: myActiveJobsCount }), _jsxs("div", { style: styles.statNote, children: ["Jobs assigned to ", currentUser.fullName.split(" ")[0]] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Technician Board", subtitle: "Live workload, active timers, booked hours, and efficiency base for each technician", right: _jsxs("span", { style: styles.statusInfo, children: [technicianBoard.length, " technicians tracked"] }), children: technicianBoard.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No active technicians found." })) : (_jsx("div", { style: styles.mobileCardList, children: technicianBoard.map(({ user, assignedJobs, liveLogs, bookedMinutes, completedJobs, laborProduced, efficiency }) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: user.fullName }), _jsx(RoleBadge, { role: user.role })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Assigned Jobs" }), _jsx("strong", { children: assignedJobs.length })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Live Timers" }), _jsx("strong", { children: liveLogs.length })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Booked Time" }), _jsx("strong", { children: formatMinutesAsHours(bookedMinutes) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Completed Jobs" }), _jsx("strong", { children: completedJobs })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Labor Produced" }), _jsx("strong", { children: formatCurrency(laborProduced) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Efficiency" }), _jsxs("strong", { children: [efficiency, "%"] })] }), _jsx("div", { style: styles.formHint, children: assignedJobs.length
                                            ? assignedJobs
                                                .slice(0, 3)
                                                .map((job) => `${job.roNumber}  |  ${job.status}`)
                                                .join("  |  ")
                                            : "No assigned jobs." })] }, user.id))) })) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }, children: _jsx(Card, { title: "Queue Controls", subtitle: "Filter the board and open any job", children: _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Search Jobs" }), _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "RO number, plate, customer, concern" })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: {
                                                ...styles.secondaryButton,
                                                ...(viewMode === "All Jobs" ? { borderColor: "#2563eb", color: "#2563eb" } : {}),
                                            }, onClick: () => setViewMode("All Jobs"), children: "All Jobs" }), _jsx("button", { type: "button", style: {
                                                ...styles.secondaryButton,
                                                ...(viewMode === "My Jobs" ? { borderColor: "#2563eb", color: "#2563eb" } : {}),
                                            }, onClick: () => setViewMode("My Jobs"), children: "My Jobs" })] }), _jsx("div", { style: styles.queueStack, children: visibleRepairOrders.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No jobs match the current filter." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: visibleRepairOrders.map((row) => (_jsxs("button", { type: "button", style: {
                                                ...styles.mobileDataCardButton,
                                                ...(selectedRO?.id === row.id ? styles.mobileDataCardButtonActive : {}),
                                            }, onClick: () => setSelectedRoId(row.id), children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.roNumber }), _jsx("span", { style: getROStatusStyle(row.status), children: row.status })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [row.plateNumber || row.conductionNumber || "No plate yet", "  |  ", row.make, " ", row.model] }), _jsx("div", { style: styles.mobileDataSecondary, children: row.accountLabel }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Primary Tech" }), _jsx("strong", { children: row.primaryTechnicianId ? getUserName(row.primaryTechnicianId) : "Unassigned" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Elapsed" }), _jsx("strong", { children: formatElapsedTime(row.workStartedAt) })] })] }, row.id))) })) : (visibleRepairOrders.map((row) => (_jsxs("button", { type: "button", style: {
                                            ...styles.queueCard,
                                            ...(selectedRO?.id === row.id ? styles.queueCardActive : {}),
                                        }, onClick: () => setSelectedRoId(row.id), children: [_jsxs("div", { style: styles.queueCardHeader, children: [_jsx("strong", { children: row.roNumber }), _jsx("span", { style: getROStatusStyle(row.status), children: row.status })] }), _jsx("div", { style: styles.queueLine, children: row.plateNumber || row.conductionNumber || "No plate yet" }), _jsxs("div", { style: styles.queueLineMuted, children: [row.accountLabel, "  |  ", row.make, " ", row.model] }), _jsxs("div", { style: styles.queueLineMuted, children: ["Primary: ", row.primaryTechnicianId ? getUserName(row.primaryTechnicianId) : "Unassigned"] }), _jsxs("div", { style: styles.queueLineMuted, children: ["Elapsed: ", formatElapsedTime(row.workStartedAt)] })] }, row.id)))) })] }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }, children: _jsx(Card, { title: "Job Detail", subtitle: "Live status, technician assignment, and work summary", right: selectedRO ? _jsx(ROStatusBadge, { status: selectedRO.status }) : undefined, children: !selectedRO ? (_jsx("div", { style: styles.emptyState, children: "No repair orders are available yet." })) : (_jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: styles.summaryPanel, children: [_jsxs("div", { style: styles.summaryGrid, children: [_jsxs("div", { children: [_jsx("strong", { children: "RO Number" }), _jsx("div", { children: selectedRO.roNumber })] }), _jsxs("div", { children: [_jsx("strong", { children: "Vehicle" }), _jsxs("div", { children: [selectedRO.make, " ", selectedRO.model, " ", selectedRO.year] })] }), _jsxs("div", { children: [_jsx("strong", { children: "Plate / Conduction" }), _jsx("div", { children: selectedRO.plateNumber || selectedRO.conductionNumber || "-" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Customer" }), _jsx("div", { children: selectedRO.accountLabel })] }), _jsxs("div", { children: [_jsx("strong", { children: "Created" }), _jsx("div", { children: formatDateTime(selectedRO.createdAt) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Elapsed" }), _jsx("div", { children: formatElapsedTime(selectedRO.workStartedAt) })] }), _jsxs("div", { children: [_jsx("strong", { children: "Primary Tech" }), _jsx("div", { children: selectedRO.primaryTechnicianId ? getUserName(selectedRO.primaryTechnicianId) : "Unassigned" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Support Team" }), _jsx("div", { children: selectedRO.supportTechnicianIds.length ? selectedRO.supportTechnicianIds.map(getUserName).join(", ") : "None" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Completed Lines" }), _jsxs("div", { children: [selectedROCompletedLines, " / ", selectedRO.workLines.length] })] }), _jsxs("div", { children: [_jsx("strong", { children: "Total Estimate" }), _jsx("div", { children: formatCurrency(selectedROEstimateTotal) })] })] }), _jsxs("div", { style: styles.concernBanner, children: [_jsx("strong", { children: "Concern:" }), " ", selectedRO.customerConcern || "No concern entered."] })] }), _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Status" }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Current RO Status" }), _jsx("select", { style: styles.select, value: selectedRO.status, disabled: !canManageShopFloor, onChange: (e) => handleStatusChange(selectedRO.id, e.target.value), children: [
                                                                    "Draft",
                                                                    "Waiting Inspection",
                                                                    "Waiting Approval",
                                                                    "Approved / Ready to Work",
                                                                    "In Progress",
                                                                    "Waiting Parts",
                                                                    "Quality Check",
                                                                    "Ready Release",
                                                                    "Released",
                                                                    "Closed",
                                                                ].map((status) => (_jsx("option", { value: status, children: status }, status))) })] }), _jsxs("div", { style: isCompactLayout ? styles.stickyActionBar : styles.inlineActions, children: [_jsx("button", { type: "button", style: {
                                                                    ...styles.primaryButton,
                                                                    ...(canManageShopFloor ? {} : styles.buttonDisabled),
                                                                }, disabled: !canManageShopFloor, onClick: () => handleStatusChange(selectedRO.id, "In Progress"), children: "Start Work" }), _jsx("button", { type: "button", style: {
                                                                    ...styles.secondaryButton,
                                                                    ...(canManageShopFloor ? {} : styles.buttonDisabled),
                                                                }, disabled: !canManageShopFloor, onClick: () => handleStatusChange(selectedRO.id, "Waiting Parts"), children: "Waiting Parts" }), _jsx("button", { type: "button", style: {
                                                                    ...styles.secondaryButton,
                                                                    ...(canManageShopFloor ? {} : styles.buttonDisabled),
                                                                }, disabled: !canManageShopFloor, onClick: () => handleStatusChange(selectedRO.id, "Quality Check"), children: "Send QC" }), _jsx("button", { type: "button", style: {
                                                                    ...styles.secondaryButton,
                                                                    ...(canManageShopFloor ? {} : styles.buttonDisabled),
                                                                }, disabled: !canManageShopFloor, onClick: () => handleStatusChange(selectedRO.id, "Ready Release"), children: "Ready Release" })] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Technicians" }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Primary Technician" }), _jsxs("select", { style: styles.select, value: selectedRO.primaryTechnicianId, disabled: !canManageShopFloor, onChange: (e) => handlePrimaryChange(selectedRO.id, e.target.value), children: [_jsx("option", { value: "", children: "Select primary technician" }), primaryTechnicians.map((user) => (_jsxs("option", { value: user.id, children: [user.fullName, "  -  ", user.role] }, user.id)))] }), _jsx("div", { style: styles.formHint, children: "OJT is excluded from primary technician assignment." })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Support Technicians" }), _jsx("div", { style: styles.checkboxList, children: supportTechnicians.map((user) => (_jsxs("label", { style: styles.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: selectedRO.supportTechnicianIds.includes(user.id), disabled: !canManageShopFloor || user.id === selectedRO.primaryTechnicianId, onChange: () => handleSupportToggle(selectedRO.id, user.id) }), _jsxs("span", { children: [user.fullName, "  -  ", user.role] })] }, user.id))) })] })] }) })] }), _jsxs("div", { style: { ...styles.sectionCard, marginBottom: 12 }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Technician Work Logs" }), _jsx("div", { style: styles.formHint, children: "Start and stop technician timers per work line. These logs feed the dashboard productivity view." })] }), _jsxs("span", { style: styles.statusInfo, children: [roWorkLogs.length, " logs  |  ", activeRoWorkLogs.length, " live"] })] }), _jsx("div", { style: { ...styles.mobileCardList, marginTop: 12 }, children: selectedRO.workLines.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No work lines available yet for technician logging." })) : (selectedRO.workLines.map((line) => {
                                                const activeLineLogs = roWorkLogs.filter((log) => log.workLineId === line.id && !log.endedAt);
                                                const suggestedTechId = selectedRO.primaryTechnicianId || currentUser.id;
                                                return (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: line.title || "Untitled Work Line" }), _jsx("span", { style: getWorkLineStatusStyle(line.status), children: line.status })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [line.category, "  |  Logged Time: ", formatMinutesAsHours(lineMinutesMap.get(line.id) ?? 0)] }), activeLineLogs.length ? (_jsxs("div", { style: styles.formHint, children: ["Live: ", activeLineLogs.map((log) => `${getUserName(log.technicianId)} (${formatElapsedTime(log.startedAt)})`).join("  |  ")] })) : (_jsx("div", { style: styles.formHint, children: "No active timer on this work line." })), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => startWorkLog(line.id, suggestedTechId), children: "Start Primary Timer" }), activeLineLogs
                                                                    .filter((log) => canManageShopFloor || log.technicianId === currentUser.id)
                                                                    .map((log) => (_jsxs("button", { type: "button", style: styles.smallButtonDanger, onClick: () => stopWorkLog(log.id), children: ["Stop ", getUserName(log.technicianId)] }, log.id)))] })] }, `techlog_${line.id}`));
                                            })) }), roWorkLogs.length ? (_jsx("div", { style: { ...styles.tableWrap, marginTop: 12 }, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Technician" }), _jsx("th", { style: styles.th, children: "Work Line" }), _jsx("th", { style: styles.th, children: "Started" }), _jsx("th", { style: styles.th, children: "Ended" }), _jsx("th", { style: styles.th, children: "Hours" })] }) }), _jsx("tbody", { children: roWorkLogs.slice(0, 12).map((log) => {
                                                            const line = selectedRO.workLines.find((row) => row.id === log.workLineId);
                                                            return (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: getUserName(log.technicianId) }), _jsx("td", { style: styles.td, children: line?.title || "Work Line" }), _jsx("td", { style: styles.td, children: formatDateTime(log.startedAt) }), _jsx("td", { style: styles.td, children: log.endedAt ? formatDateTime(log.endedAt) : "Live" }), _jsx("td", { style: styles.td, children: formatMinutesAsHours(getWorkLogMinutes(log)) })] }, log.id));
                                                        }) })] }) })) : null, Array.from(techMinutesMap.entries()).length ? (_jsx("div", { style: { ...styles.inlineActions, marginTop: 12, flexWrap: "wrap" }, children: Array.from(techMinutesMap.entries()).map(([techId, minutes]) => (_jsxs("span", { style: styles.statusNeutral, children: [getUserName(techId), "  |  ", formatMinutesAsHours(minutes)] }, techId))) })) : null] }), myLiveLogs.length ? (_jsxs("div", { style: styles.sectionCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "My Live Timers" }), _jsx("div", { style: styles.formHint, children: "Quick stop controls for the signed-in technician." })] }), _jsxs("span", { style: styles.statusWarning, children: [myLiveLogs.length, " running"] })] }), _jsx("div", { style: styles.mobileCardList, children: myLiveLogs.map((log) => {
                                                const ro = repairOrders.find((row) => row.id === log.roId);
                                                const line = ro?.workLines.find((row) => row.id === log.workLineId);
                                                return (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: line?.title || "Work Line" }), _jsx("span", { style: styles.statusInfo, children: formatElapsedTime(log.startedAt) })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [ro?.roNumber || "-", "  |  ", ro?.plateNumber || ro?.conductionNumber || "-"] }), _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => stopWorkLog(log.id), children: "Stop My Timer" }) })] }, log.id));
                                            }) })] })) : null, _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Work Summary" }), _jsx("div", { style: styles.mobileCardList, children: selectedRO.workLines.map((line) => {
                                                const activeLineLogs = roWorkLogs.filter((log) => log.workLineId === line.id && !log.endedAt);
                                                const lineAssignedTechId = line.assignedTechnicianId || selectedRO.primaryTechnicianId || currentUser.id;
                                                return (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: line.title || "Untitled Work Line" }), _jsx("span", { style: getWorkLineStatusStyle(line.status), children: line.status })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [line.category, "  |  Priority ", line.priority] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Assigned Tech" }), _jsx("strong", { children: lineAssignedTechId ? getUserName(lineAssignedTechId) : "Unassigned" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Logged Time" }), _jsx("strong", { children: formatMinutesAsHours(lineMinutesMap.get(line.id) ?? 0) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Service Estimate" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(line.serviceEstimate)) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Parts Estimate" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(line.partsEstimate)) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Total Estimate" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(line.totalEstimate)) })] }), line.notes ? _jsx("div", { style: styles.formHint, children: line.notes }) : null, activeLineLogs.length ? (_jsxs("div", { style: styles.formHint, children: ["Live timer: ", activeLineLogs.map((log) => `${getUserName(log.technicianId)} (${formatElapsedTime(log.startedAt)})`).join("  |  ")] })) : null, _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButton, onClick: () => {
                                                                        updateWorkLineStatus(line.id, "In Progress");
                                                                        startWorkLog(line.id, lineAssignedTechId);
                                                                    }, children: "Start Line" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => updateWorkLineStatus(line.id, "Waiting Parts"), children: "Waiting Parts" }), _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => markWorkLineComplete(line.id), children: "Mark Complete" })] })] }, line.id));
                                            }) })] })] })) }) })] }) }));
}
function ModulePage({ title, description, currentUser, requiredPermission, roleDefinitions, }) {
    const allowed = hasPermission(currentUser.role, roleDefinitions, requiredPermission);
    return (_jsx("div", { style: styles.pageContent, children: _jsx("div", { style: styles.grid, children: _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsxs(Card, { title: title, subtitle: "Permission-aware module shell", right: allowed ? _jsx("span", { style: styles.statusOk, children: "Access Granted" }) : _jsx("span", { style: styles.statusLocked, children: "Access Blocked" }), children: [_jsx("div", { style: styles.moduleText, children: description }), _jsxs("div", { style: styles.moduleMetaRow, children: [_jsx("span", { children: "Required permission:" }), _jsx("strong", { children: requiredPermission })] }), _jsxs("div", { style: styles.moduleMetaRow, children: [_jsx("span", { children: "Current user:" }), _jsx("strong", { children: currentUser.fullName })] }), _jsxs("div", { style: styles.moduleMetaRow, children: [_jsx("span", { children: "Role:" }), _jsx(RoleBadge, { role: currentUser.role })] })] }) }) }) }));
}
function AppInner() {
    const [roleDefinitions, setRoleDefinitions] = useState(() => {
        const stored = readLocalStorage(STORAGE_KEYS.rolePermissions, []);
        if (stored.length > 0) {
            return ALL_ROLES.map((role) => {
                const found = stored.find((s) => s.role === role);
                return {
                    role,
                    permissions: role === "Admin"
                        ? [...ALL_PERMISSIONS]
                        : ALL_PERMISSIONS.filter((p) => (found?.permissions ?? []).includes(p)),
                };
            });
        }
        return getDefaultRoleDefinitions();
    });
    const [users, setUsers] = useState(() => {
        const stored = readLocalStorage(STORAGE_KEYS.users, []);
        return stored.length > 0 ? stored : getDefaultUsers();
    });
    const [bookings, setBookings] = useState(() => readLocalStorage(STORAGE_KEYS.bookings, []));
    const [intakeRecords, setIntakeRecords] = useState(() => readLocalStorage(STORAGE_KEYS.intakeRecords, []));
    const [inspectionRecords, setInspectionRecords] = useState(() => readLocalStorage(STORAGE_KEYS.inspectionRecords, []).map(migrateInspectionRecord));
    const [repairOrders, setRepairOrders] = useState(() => readLocalStorage(STORAGE_KEYS.repairOrders, []).map(migrateRepairOrderRecord));
    const [qcRecords, setQcRecords] = useState(() => readLocalStorage(STORAGE_KEYS.qcRecords, []));
    const [releaseRecords, setReleaseRecords] = useState(() => readLocalStorage(STORAGE_KEYS.releaseRecords, []));
    const [partsRequests, setPartsRequests] = useState(() => readLocalStorage(STORAGE_KEYS.partsRequests, []).map(migratePartsRequestRecord));
    const [approvalRecords, setApprovalRecords] = useState(() => readLocalStorage(STORAGE_KEYS.approvalRecords, []));
    const [backjobRecords, setBackjobRecords] = useState(() => readLocalStorage(STORAGE_KEYS.backjobRecords, []).map(migrateBackjobRecord));
    const [invoiceRecords, setInvoiceRecords] = useState(() => readLocalStorage(STORAGE_KEYS.invoiceRecords, []).map(migrateInvoiceRecord));
    const [paymentRecords, setPaymentRecords] = useState(() => readLocalStorage(STORAGE_KEYS.paymentRecords, []).map(migratePaymentRecord));
    const [workLogs, setWorkLogs] = useState(() => readLocalStorage(STORAGE_KEYS.workLogs, []));
    const [customerAccounts, setCustomerAccounts] = useState(() => readLocalStorage(STORAGE_KEYS.customerAccounts, []));
    const [customerSession, setCustomerSession] = useState(() => readLocalStorage(STORAGE_KEYS.customerSession, null));
    const [customerPortalMode, setCustomerPortalMode] = useState("real");
    const [customerPortalLaunchView, setCustomerPortalLaunchView] = useState("dashboard");
    const [customerPortalSharedRoId, setCustomerPortalSharedRoId] = useState("");
    const [customerApprovalLinkError, setCustomerApprovalLinkError] = useState("");
    const [pendingDemoCustomerPortal, setPendingDemoCustomerPortal] = useState(false);
    const [supplierSession, setSupplierSession] = useState(null);
    const [approvalLinkTokens, setApprovalLinkTokens] = useState(() => readLocalStorage(STORAGE_KEYS.approvalLinkTokens, []));
    const [smsApprovalLogs, setSmsApprovalLogs] = useState(() => readLocalStorage(STORAGE_KEYS.smsApprovalLogs, []));
    const [autoPortalMessage, setAutoPortalMessage] = useState("");
    const [loginAudience, setLoginAudience] = useState("staff");
    const [customerLoginForm, setCustomerLoginForm] = useState({
        identifier: "",
        password: "",
    });
    const [supplierLoginForm, setSupplierLoginForm] = useState({
        supplierName: "",
    });
    const [customerLoginError, setCustomerLoginError] = useState("");
    const [supplierLoginError, setSupplierLoginError] = useState("");
    const [publicBookingForm, setPublicBookingForm] = useState(() => ({
        ...getDefaultBookingForm("Book Service"),
        requestedDate: new Date().toISOString().slice(0, 10),
    }));
    const [publicBookingError, setPublicBookingError] = useState("");
    const [isSubmittingPublicBooking, setIsSubmittingPublicBooking] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => readLocalStorage(STORAGE_KEYS.session, null));
    const [currentView, setCurrentView] = useState(() => readLocalStorage(STORAGE_KEYS.currentView, "dashboard"));
    const [loginForm, setLoginForm] = useState({
        username: "",
        password: "",
    });
    const [loginError, setLoginError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 960 : false);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.rolePermissions, roleDefinitions);
    }, [roleDefinitions]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.users, users);
    }, [users]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.bookings, bookings);
    }, [bookings]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.intakeRecords, intakeRecords);
    }, [intakeRecords]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.inspectionRecords, inspectionRecords);
    }, [inspectionRecords]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.repairOrders, repairOrders);
    }, [repairOrders]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.qcRecords, qcRecords);
    }, [qcRecords]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.releaseRecords, releaseRecords);
    }, [releaseRecords]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.partsRequests, partsRequests);
    }, [partsRequests]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.approvalRecords, approvalRecords);
    }, [approvalRecords]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.backjobRecords, backjobRecords);
    }, [backjobRecords]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.invoiceRecords, invoiceRecords);
    }, [invoiceRecords]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.paymentRecords, paymentRecords);
    }, [paymentRecords]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.workLogs, workLogs);
    }, [workLogs]);
    useEffect(() => {
        setCustomerAccounts((prev) => buildCustomerAccountsFromRecords(prev, intakeRecords, repairOrders));
    }, [intakeRecords, repairOrders]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.customerAccounts, customerAccounts);
    }, [customerAccounts]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.customerSession, customerSession);
    }, [customerSession]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.approvalLinkTokens, approvalLinkTokens);
    }, [approvalLinkTokens]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.smsApprovalLogs, smsApprovalLogs);
    }, [smsApprovalLogs]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.session, currentUser);
    }, [currentUser]);
    useEffect(() => {
        writeLocalStorage(STORAGE_KEYS.currentView, currentView);
    }, [currentView]);
    useEffect(() => {
        const onResize = () => {
            const mobile = window.innerWidth < 960;
            setIsMobile(mobile);
            if (!mobile)
                setSidebarOpen(false);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    useEffect(() => {
        if (!currentUser)
            return;
        const found = users.find((u) => u.id === currentUser.id);
        if (!found || !found.active) {
            setCurrentUser(null);
            setCurrentView("dashboard");
            return;
        }
        if (found.role !== currentUser.role || found.fullName !== currentUser.fullName) {
            setCurrentUser({
                id: found.id,
                username: found.username,
                fullName: found.fullName,
                role: found.role,
                active: found.active,
                createdAt: found.createdAt,
            });
        }
    }, [users, currentUser]);
    useEffect(() => {
        if (!currentUser)
            return;
        if (!canAccessView(currentUser.role, roleDefinitions, currentView)) {
            setCurrentView(getDefaultViewForRole(currentUser.role, roleDefinitions));
        }
    }, [currentUser, currentView, roleDefinitions]);
    useEffect(() => {
        if (!customerSession)
            return;
        const fresh = customerAccounts.find((account) => account.id === customerSession.id);
        if (!fresh) {
            setCustomerSession(null);
            setCustomerPortalMode("real");
            setCustomerPortalLaunchView("dashboard");
            setCustomerPortalSharedRoId("");
            setCustomerApprovalLinkError("");
            return;
        }
        if (JSON.stringify(fresh) !== JSON.stringify(customerSession)) {
            setCustomerSession(fresh);
        }
    }, [customerAccounts, customerSession]);
    useEffect(() => {
        if (!pendingDemoCustomerPortal)
            return;
        const demoCustomer = customerAccounts.find((account) => account.email.toLowerCase() === "miguel.santos@example.com") ??
            customerAccounts.find((account) => account.fullName === "Miguel Santos") ??
            customerAccounts.find((account) => sanitizePhone(account.phone) === "09171234567") ??
            null;
        if (!demoCustomer)
            return;
        setCustomerSession(demoCustomer);
        setCustomerPortalMode("demo");
        setPendingDemoCustomerPortal(false);
    }, [customerAccounts, pendingDemoCustomerPortal]);
    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const url = new URL(window.location.href);
        const isCustomerApprovalPath = url.pathname.toLowerCase().includes("/customer-view");
        const portal = url.searchParams.get("portal");
        const tokenValue = url.searchParams.get("token");
        if (!isCustomerApprovalPath && portal !== "customer")
            return;
        if (!tokenValue) {
            setCustomerApprovalLinkError("Invalid or expired link");
            return;
        }
        const tokenRecord = approvalLinkTokens.find((row) => row.token === tokenValue);
        if (!tokenRecord || !isApprovalLinkActive(tokenRecord)) {
            setCustomerSession(null);
            setCustomerPortalMode("real");
            setCustomerPortalLaunchView("dashboard");
            setCustomerPortalSharedRoId("");
            setCustomerApprovalLinkError("Invalid or expired link");
            return;
        }
        const tokenRo = repairOrders.find((ro) => ro.id === tokenRecord.roId);
        if (!tokenRo) {
            setCustomerSession(null);
            setCustomerPortalMode("real");
            setCustomerPortalLaunchView("dashboard");
            setCustomerPortalSharedRoId("");
            setCustomerApprovalLinkError("Invalid or expired link");
            return;
        }
        const customer = customerAccounts.find((row) => row.id === tokenRecord.customerId);
        if (!customer) {
            setCustomerSession(null);
            setCustomerPortalMode("real");
            setCustomerPortalLaunchView("dashboard");
            setCustomerPortalSharedRoId("");
            setCustomerApprovalLinkError("Invalid or expired link");
            return;
        }
        setCustomerSession(customer);
        setCustomerPortalMode("demo");
        setCustomerPortalLaunchView("approvals");
        setCustomerPortalSharedRoId(tokenRo.id);
        setCustomerApprovalLinkError("");
        setLoginAudience("customer");
        setCustomerLoginError("");
        setApprovalLinkTokens((prev) => prev.map((row) => (row.id === tokenRecord.id ? { ...row, lastUsedAt: new Date().toISOString() } : row)));
        url.searchParams.delete("portal");
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""));
    }, [approvalLinkTokens, customerAccounts, repairOrders]);
    const allowedNav = useMemo(() => {
        if (!currentUser)
            return [];
        return getAllowedNav(currentUser.role, roleDefinitions);
    }, [currentUser, roleDefinitions]);
    const currentNavItem = useMemo(() => {
        return NAV_ITEMS.find((item) => item.key === currentView) ?? NAV_ITEMS[0];
    }, [currentView]);
    const completeStaffLogin = (found) => {
        setCurrentUser({
            id: found.id,
            username: found.username,
            fullName: found.fullName,
            role: found.role,
            active: found.active,
            createdAt: found.createdAt,
        });
        setCurrentView(getDefaultViewForRole(found.role, roleDefinitions));
        setLoginForm({ username: "", password: "" });
        setLoginError("");
        setCustomerSession(null);
        setCustomerPortalMode("real");
        setCustomerPortalLaunchView("dashboard");
        setCustomerPortalSharedRoId("");
    };
    const loadSimulatedData = () => {
        const now = new Date();
        const iso = (hoursAgo) => new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();
        const defaultUsers = getDefaultUsers();
        const adminUser = defaultUsers.find((user) => user.role === "Admin") ?? defaultUsers[0];
        const advisorUser = defaultUsers.find((user) => user.role === "Service Advisor") ?? defaultUsers[0];
        const chiefUser = defaultUsers.find((user) => user.role === "Chief Technician") ?? defaultUsers[0];
        const seniorUser = defaultUsers.find((user) => user.role === "Senior Mechanic") ?? defaultUsers[0];
        const mechanicUser = defaultUsers.find((user) => user.role === "General Mechanic") ?? defaultUsers[0];
        const officeUser = defaultUsers.find((user) => user.role === "Office Staff") ?? defaultUsers[0];
        const intake1Id = uid("intake");
        const intake2Id = uid("intake");
        const inspection1Id = uid("insp");
        const inspection2Id = uid("insp");
        const ro1Id = uid("ro");
        const ro2Id = uid("ro");
        const workLine1Id = uid("wl");
        const workLine2Id = uid("wl");
        const workLine3Id = uid("wl");
        const workLine4Id = uid("wl");
        const approval1Id = uid("apr");
        const qc1Id = uid("qc");
        const release1Id = uid("rel");
        const parts1Id = uid("pr");
        const invoice1Id = uid("inv");
        const payment1Id = uid("pay");
        const backjob1Id = uid("bj");
        const backjob2Id = uid("bj");
        const customer1Id = uid("cust");
        const customer2Id = uid("cust");
        const customer3Id = uid("cust");
        const token1Id = uid("tok");
        const booking1Id = uid("book");
        const booking2Id = uid("book");
        const booking3Id = uid("book");
        const intakeRecordsSeed = [
            {
                id: intake1Id,
                intakeNumber: nextDailyNumber("INT"),
                createdAt: iso(30),
                updatedAt: iso(28),
                customerName: "Miguel Santos",
                companyName: "",
                accountType: "Personal",
                phone: "09171234567",
                email: "miguel.santos@example.com",
                plateNumber: "NEX-2451",
                conductionNumber: "",
                make: "Toyota",
                model: "Fortuner",
                year: "2021",
                color: "Gray",
                odometerKm: "58210",
                fuelLevel: "1/2",
                assignedAdvisor: advisorUser.fullName,
                concern: "Front suspension noise and uneven tire wear.",
                notes: "Customer requested full underchassis check.",
                status: "Converted to RO",
                encodedBy: advisorUser.fullName,
            },
            {
                id: intake2Id,
                intakeNumber: nextDailyNumber("INT"),
                createdAt: iso(18),
                updatedAt: iso(12),
                customerName: "Andrea Lim",
                companyName: "Prime Movers Logistics",
                accountType: "Company / Fleet",
                phone: "09179876543",
                email: "fleet@primemovers.example.com",
                plateNumber: "ABJ-9087",
                conductionNumber: "",
                make: "Mitsubishi",
                model: "Montero Sport",
                year: "2023",
                color: "White",
                odometerKm: "22145",
                fuelLevel: "3/4",
                assignedAdvisor: advisorUser.fullName,
                concern: "A/C weak cooling and PMS due.",
                notes: "Fleet vehicle priority service.",
                status: "Converted to RO",
                encodedBy: advisorUser.fullName,
            },
        ];
        const inspection1 = {
            ...getDefaultInspectionForm(),
            id: inspection1Id,
            inspectionNumber: nextDailyNumber("INSP"),
            intakeId: intake1Id,
            intakeNumber: intakeRecordsSeed[0].intakeNumber,
            createdAt: iso(27),
            updatedAt: iso(24),
            startedBy: chiefUser.fullName,
            status: "Completed",
            accountLabel: "Miguel Santos",
            plateNumber: "NEX-2451",
            conductionNumber: "",
            make: "Toyota",
            model: "Fortuner",
            year: "2021",
            color: "Gray",
            odometerKm: "58210",
            concern: "Front suspension noise and uneven tire wear.",
            enableSuspensionCheck: true,
            enableAlignmentCheck: true,
            frontShockState: "Needs Replacement",
            frontLowerControlArmState: "Needs Attention",
            frontLeftTireState: "Needs Attention",
            frontRightTireState: "Needs Attention",
            steeringFeelNotes: "Pulling slightly to the right during road test.",
            suspensionRoadTestNotes: "Knocking noise over uneven road.",
            recommendedWork: "Replace front shocks, inspect control arm bushings, perform alignment.",
            recommendationLines: [
                "Replace front shock absorbers",
                "Inspect / service lower control arm bushings",
                "Wheel alignment",
            ],
        };
        const inspection2 = {
            ...getDefaultInspectionForm(),
            id: inspection2Id,
            inspectionNumber: nextDailyNumber("INSP"),
            intakeId: intake2Id,
            intakeNumber: intakeRecordsSeed[1].intakeNumber,
            createdAt: iso(11),
            updatedAt: iso(8),
            startedBy: seniorUser.fullName,
            status: "Completed",
            accountLabel: "Prime Movers Logistics",
            plateNumber: "ABJ-9087",
            conductionNumber: "",
            make: "Mitsubishi",
            model: "Montero Sport",
            year: "2023",
            color: "White",
            odometerKm: "22145",
            concern: "A/C weak cooling and PMS due.",
            enableAcCheck: true,
            enableUnderHood: true,
            acCoolingPerformanceState: "Needs Attention",
            acCabinFilterState: "Needs Replacement",
            acNotes: "Cabin filter dirty; vent temperature higher than expected.",
            engineOilCondition: "Needs Attention",
            recommendedWork: "Basic PMS, cabin filter replacement, A/C performance service.",
            recommendationLines: [
                "Basic PMS package",
                "Replace cabin air filter",
                "A/C performance inspection and service",
            ],
        };
        const repairOrdersSeed = [
            {
                id: ro1Id,
                roNumber: nextDailyNumber("RO"),
                createdAt: iso(25),
                updatedAt: iso(1),
                workStartedAt: iso(6),
                sourceType: "Intake",
                intakeId: intake1Id,
                inspectionId: inspection1Id,
                intakeNumber: intakeRecordsSeed[0].intakeNumber,
                inspectionNumber: inspection1.inspectionNumber,
                customerName: "Miguel Santos",
                companyName: "",
                accountType: "Personal",
                accountLabel: "Miguel Santos",
                phone: "09171234567",
                email: "miguel.santos@example.com",
                plateNumber: "NEX-2451",
                conductionNumber: "",
                make: "Toyota",
                model: "Fortuner",
                year: "2021",
                color: "Gray",
                odometerKm: "58210",
                customerConcern: "Front suspension noise and uneven tire wear.",
                advisorName: advisorUser.fullName,
                status: "In Progress",
                primaryTechnicianId: chiefUser.id,
                supportTechnicianIds: [mechanicUser.id],
                workLines: [
                    {
                        ...recalculateWorkLine({
                            ...getEmptyWorkLine(),
                            id: workLine1Id,
                            title: "Replace front shock absorbers",
                            category: "Suspension",
                            priority: "High",
                            status: "In Progress",
                            laborHours: "2.5",
                            laborRate: "950",
                            partsCost: "6200",
                            partsMarkupPercent: "20",
                            notes: "Use matched pair replacement.",
                            assignedTechnicianId: chiefUser.id,
                            timerStatus: "Running",
                            timerStartedAt: iso(2),
                            accumulatedMinutes: 90,
                            approvalDecision: "Approved",
                            approvalAt: iso(20),
                        }),
                    },
                    {
                        ...recalculateWorkLine({
                            ...getEmptyWorkLine(),
                            id: workLine2Id,
                            title: "Wheel alignment",
                            category: "Alignment",
                            priority: "Medium",
                            status: "Pending",
                            laborHours: "1",
                            laborRate: "850",
                            partsCost: "0",
                            partsMarkupPercent: "0",
                            notes: "Perform after suspension work completion.",
                            assignedTechnicianId: mechanicUser.id,
                            timerStatus: "Idle",
                            timerStartedAt: "",
                            accumulatedMinutes: 0,
                            approvalDecision: "Approved",
                            approvalAt: iso(20),
                        }),
                    },
                ],
                latestApprovalRecordId: approval1Id,
                deferredLineTitles: [],
                backjobReferenceRoId: "",
                findingRecommendationDecisions: [],
                encodedBy: advisorUser.fullName,
            },
            {
                id: ro2Id,
                roNumber: nextDailyNumber("RO"),
                createdAt: iso(10),
                updatedAt: iso(3),
                workStartedAt: iso(7),
                sourceType: "Intake",
                intakeId: intake2Id,
                inspectionId: inspection2Id,
                intakeNumber: intakeRecordsSeed[1].intakeNumber,
                inspectionNumber: inspection2.inspectionNumber,
                customerName: "Andrea Lim",
                companyName: "Prime Movers Logistics",
                accountType: "Company / Fleet",
                accountLabel: "Prime Movers Logistics",
                phone: "09179876543",
                email: "fleet@primemovers.example.com",
                plateNumber: "ABJ-9087",
                conductionNumber: "",
                make: "Mitsubishi",
                model: "Montero Sport",
                year: "2023",
                color: "White",
                odometerKm: "22145",
                customerConcern: "A/C weak cooling and PMS due.",
                advisorName: advisorUser.fullName,
                status: "Ready Release",
                primaryTechnicianId: seniorUser.id,
                supportTechnicianIds: [mechanicUser.id],
                workLines: [
                    {
                        ...recalculateWorkLine({
                            ...getEmptyWorkLine(),
                            id: workLine3Id,
                            title: "Basic PMS package",
                            category: "Preventive Maintenance",
                            priority: "High",
                            status: "Completed",
                            laborHours: "1.5",
                            laborRate: "900",
                            partsCost: "4995",
                            partsMarkupPercent: "0",
                            notes: "Promo package applied.",
                            assignedTechnicianId: seniorUser.id,
                            timerStatus: "Completed",
                            timerStartedAt: "",
                            accumulatedMinutes: 95,
                            completedAt: iso(5),
                            approvalDecision: "Approved",
                            approvalAt: iso(9),
                        }),
                    },
                    {
                        ...recalculateWorkLine({
                            ...getEmptyWorkLine(),
                            id: workLine4Id,
                            title: "Replace cabin air filter",
                            category: "Air Conditioning",
                            priority: "Medium",
                            status: "Completed",
                            laborHours: "0.5",
                            laborRate: "900",
                            partsCost: "650",
                            partsMarkupPercent: "15",
                            notes: "Restored airflow after replacement.",
                            assignedTechnicianId: mechanicUser.id,
                            timerStatus: "Completed",
                            timerStartedAt: "",
                            accumulatedMinutes: 35,
                            completedAt: iso(6),
                            approvalDecision: "Approved",
                            approvalAt: iso(9),
                        }),
                    },
                ],
                latestApprovalRecordId: "",
                deferredLineTitles: [],
                backjobReferenceRoId: "",
                findingRecommendationDecisions: [],
                encodedBy: officeUser.fullName,
            },
        ];
        const approvalRecordsSeed = [
            {
                id: approval1Id,
                approvalNumber: nextDailyNumber("APP"),
                roId: ro1Id,
                roNumber: repairOrdersSeed[0].roNumber,
                createdAt: iso(20),
                decidedBy: advisorUser.fullName,
                customerName: "Miguel Santos",
                customerContact: "09171234567",
                summary: "Customer approved main suspension repair items.",
                communicationHook: "SMS",
                items: [
                    { workLineId: workLine1Id, title: "Replace front shock absorbers", decision: "Approved", approvedAt: iso(20), note: "Approved by customer" },
                    { workLineId: workLine2Id, title: "Wheel alignment", decision: "Approved", approvedAt: iso(20), note: "Approved by customer" },
                ],
            },
        ];
        const partsRequestsSeed = [
            {
                id: parts1Id,
                requestNumber: nextDailyNumber("PR"),
                roId: ro1Id,
                roNumber: repairOrdersSeed[0].roNumber,
                createdAt: iso(19),
                updatedAt: iso(4),
                requestedBy: chiefUser.fullName,
                status: "Ordered",
                partName: "Front shock absorber set",
                partNumber: "FSA-FTN-2021",
                quantity: "2",
                urgency: "High",
                notes: "Needed before alignment.",
                customerSellingPrice: "7440",
                selectedBidId: "bid_demo_1",
                plateNumber: "NEX-2451",
                vehicleLabel: "Toyota Fortuner 2021",
                accountLabel: "Miguel Santos",
                workshopPhotos: [],
                returnRecords: [],
                bids: [
                    {
                        id: "bid_demo_1",
                        supplierName: "Northeast Parts Supply",
                        brand: "KYB",
                        quantity: "2",
                        unitCost: "3100",
                        totalCost: "6200",
                        deliveryTime: "Same day",
                        warrantyNote: "6 months supplier warranty",
                        condition: "Brand New",
                        notes: "Preferred supplier",
                        createdAt: iso(18),
                        productPhotos: [],
                        invoiceFileName: "",
                        shippingLabelFileName: "",
                        trackingNumber: "",
                        courierName: "",
                        shippingNotes: "",
                    },
                ],
            },
        ];
        const qcRecordsSeed = [
            {
                id: qc1Id,
                qcNumber: nextDailyNumber("QC"),
                roId: ro2Id,
                roNumber: repairOrdersSeed[1].roNumber,
                createdAt: iso(4),
                qcBy: chiefUser.fullName,
                result: "Passed",
                allApprovedWorkCompleted: true,
                noLeaksOrWarningLights: true,
                roadTestDone: true,
                cleanlinessCheck: true,
                noNewDamage: true,
                toolsRemoved: true,
                notes: "Ready for customer release.",
            },
        ];
        const releaseRecordsSeed = [
            {
                id: release1Id,
                releaseNumber: nextDailyNumber("REL"),
                roId: ro2Id,
                roNumber: repairOrdersSeed[1].roNumber,
                createdAt: iso(2),
                releasedBy: officeUser.fullName,
                finalServiceAmount: "1800",
                finalPartsAmount: "5642.50",
                finalTotalAmount: "7442.50",
                releaseSummary: "Released after PMS and A/C refresh.",
                documentsReady: true,
                paymentSettled: true,
                noNewDamage: true,
                cleanVehicle: true,
                toolsRemoved: true,
            },
        ];
        const invoiceRecordsSeed = [
            {
                id: invoice1Id,
                invoiceNumber: nextDailyNumber("INV"),
                roId: ro2Id,
                roNumber: repairOrdersSeed[1].roNumber,
                createdAt: iso(3),
                updatedAt: iso(2),
                createdBy: officeUser.fullName,
                laborSubtotal: "1800",
                partsSubtotal: "5642.50",
                discountAmount: "0",
                totalAmount: "7442.50",
                status: "Finalized",
                paymentStatus: "Paid",
                chargeAccountApproved: false,
                notes: "Demo paid invoice.",
            },
        ];
        const paymentRecordsSeed = [
            {
                id: payment1Id,
                paymentNumber: nextDailyNumber("PAY"),
                invoiceId: invoice1Id,
                roId: ro2Id,
                roNumber: repairOrdersSeed[1].roNumber,
                createdAt: iso(2),
                receivedBy: officeUser.fullName,
                amount: "7442.50",
                method: "GCash",
                referenceNumber: "GCASH-DEMO-2026",
                notes: "Demo payment",
            },
        ];
        const backjobRecordsSeed = [
            {
                id: backjob1Id,
                backjobNumber: nextDailyNumber("BJ"),
                linkedRoId: ro2Id,
                linkedRoNumber: repairOrdersSeed[1].roNumber,
                createdAt: iso(1.5),
                updatedAt: iso(0.5),
                plateNumber: "ABJ-9087",
                customerLabel: "Prime Movers Logistics",
                originalInvoiceNumber: invoiceRecordsSeed[0].invoiceNumber,
                comebackInvoiceNumber: nextDailyNumber("INV"),
                originalPrimaryTechnicianId: seniorUser.id,
                comebackPrimaryTechnicianId: mechanicUser.id,
                supportingTechnicianIds: [mechanicUser.id],
                complaint: "Customer reported a faint A/C odor after the release inspection.",
                findings: "Cabin filter contamination returned quickly and the evaporator housing needed cleaning.",
                rootCause: "Heavy dust buildup in the HVAC box and an overdue filter change interval.",
                responsibility: "Goodwill",
                actionTaken: "Replaced the cabin filter, cleaned the evaporator housing, and performed odor treatment.",
                resolutionNotes: "Vehicle was released after a monitored road test and cooler vent temperature.",
                status: "Closed",
                createdBy: officeUser.fullName,
            },
            {
                id: backjob2Id,
                backjobNumber: nextDailyNumber("BJ"),
                linkedRoId: ro1Id,
                linkedRoNumber: repairOrdersSeed[0].roNumber,
                createdAt: iso(0.8),
                updatedAt: iso(0.2),
                plateNumber: "NEX-2451",
                customerLabel: "Miguel Santos",
                originalInvoiceNumber: nextDailyNumber("INV"),
                comebackInvoiceNumber: nextDailyNumber("INV"),
                originalPrimaryTechnicianId: chiefUser.id,
                comebackPrimaryTechnicianId: chiefUser.id,
                supportingTechnicianIds: [mechanicUser.id],
                complaint: "Customer asked for a recheck after hearing a light clunk on rough roads.",
                findings: "Stabilizer link play and alignment drift were still present under load.",
                rootCause: "Wear on the suspension linkage remained after the first visit.",
                responsibility: "Warranty",
                actionTaken: "Scheduled repeat suspension work and alignment verification.",
                resolutionNotes: "Open comeback case for follow-up after parts arrival.",
                status: "In Progress",
                createdBy: advisorUser.fullName,
            },
        ];
        const workLogsSeed = [
            { id: uid("wlog"), roId: ro2Id, workLineId: workLine3Id, technicianId: seniorUser.id, startedAt: iso(7), endedAt: iso(5), totalMinutes: 95, note: "Completed basic PMS package" },
            { id: uid("wlog"), roId: ro2Id, workLineId: workLine4Id, technicianId: mechanicUser.id, startedAt: iso(6.5), endedAt: iso(6), totalMinutes: 35, note: "Replaced cabin air filter" },
        ];
        const bookingsSeed = [
            {
                id: booking1Id,
                bookingNumber: nextDailyNumber("BKG"),
                createdAt: iso(5),
                updatedAt: iso(4),
                requestedDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                requestedTime: "09:00",
                customerName: "Miguel Santos",
                companyName: "",
                accountType: "Personal",
                phone: "09171234567",
                email: "miguel.santos@example.com",
                plateNumber: "NEX-2451",
                conductionNumber: "",
                make: "Toyota",
                model: "Fortuner",
                year: "2021",
                serviceType: "Backjob / Comeback",
                serviceDetail: "Same issue unresolved",
                concern: "Recheck suspension noise after shock replacement.",
                notes: "Customer requested morning slot.",
                status: "Confirmed",
                source: "Staff",
                createdBy: advisorUser.fullName,
                linkedCustomerId: customer1Id,
            },
            {
                id: booking2Id,
                bookingNumber: nextDailyNumber("BKG"),
                createdAt: iso(2),
                updatedAt: iso(1),
                requestedDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                requestedTime: "13:30",
                customerName: "Andrea Lim",
                companyName: "Prime Movers Logistics",
                accountType: "Company / Fleet",
                phone: "09179876543",
                email: "fleet@primemovers.example.com",
                plateNumber: "ABJ-9087",
                conductionNumber: "",
                make: "Mitsubishi",
                model: "Montero Sport",
                year: "2023",
                serviceType: "Preventive Maintenance",
                serviceDetail: "General maintenance check",
                concern: "Fleet PMS booking and A/C follow-up.",
                notes: "Priority fleet booking.",
                status: "New",
                source: "Customer Portal",
                createdBy: "Andrea Lim",
                linkedCustomerId: customer2Id,
            },
            {
                id: booking3Id,
                bookingNumber: nextDailyNumber("BKG"),
                createdAt: iso(1),
                updatedAt: iso(1),
                requestedDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                requestedTime: "10:30",
                customerName: "Carlos Reyes",
                companyName: "",
                accountType: "Personal",
                phone: "09175551234",
                email: "carlos.reyes@example.com",
                plateNumber: "CRX-5501",
                conductionNumber: "",
                make: "Honda",
                model: "Civic",
                year: "2019",
                serviceType: "Underchassis Check",
                serviceDetail: "Visual underchassis check",
                concern: "Pre-trip inspection and brake check.",
                notes: "Public booking landing page demo entry.",
                status: "Confirmed",
                source: "Customer Portal",
                createdBy: "Book Service",
                linkedCustomerId: customer3Id,
            },
        ];
        const customerAccountsSeed = [
            {
                id: customer1Id,
                fullName: "Miguel Santos",
                phone: "09171234567",
                email: "miguel.santos@example.com",
                password: "4567",
                linkedPlateNumbers: ["NEX-2451", "NEX-7788"],
                linkedRoIds: [ro1Id],
                createdAt: iso(30),
                updatedAt: iso(1),
            },
            {
                id: customer2Id,
                fullName: "Andrea Lim",
                phone: "09179876543",
                email: "fleet@primemovers.example.com",
                password: "6543",
                linkedPlateNumbers: ["ABJ-9087"],
                linkedRoIds: [ro2Id],
                createdAt: iso(18),
                updatedAt: iso(2),
            },
            {
                id: customer3Id,
                fullName: "Carlos Reyes",
                phone: "09175551234",
                email: "carlos.reyes@example.com",
                password: "1234",
                linkedPlateNumbers: ["CRX-5501"],
                linkedRoIds: [],
                createdAt: iso(12),
                updatedAt: iso(1),
            },
        ];
        const approvalLinkTokensSeed = [
            {
                id: token1Id,
                roId: ro1Id,
                customerId: customer1Id,
                token: createSecurePortalToken(),
                createdAt: iso(20),
                expiresAt: getPortalTokenExpiry(),
                lastUsedAt: "",
                revokedAt: "",
                channel: "SMS",
            },
        ];
        const smsApprovalLogsSeed = [
            {
                id: uid("sms"),
                roId: ro1Id,
                roNumber: repairOrdersSeed[0].roNumber,
                customerId: customer1Id,
                customerName: "Miguel Santos",
                phoneNumber: "09171234567",
                tokenId: token1Id,
                sentTo: "09171234567",
                messageType: "approval-request",
                message: `Demo approval link for ${repairOrdersSeed[0].roNumber}: ${buildCustomerApprovalLinkUrl(approvalLinkTokensSeed[0].token)}`,
                status: "Sent",
                provider: "Simulated",
                createdAt: iso(20),
            },
        ];
        setUsers(defaultUsers);
        setRoleDefinitions(getDefaultRoleDefinitions());
        setIntakeRecords(intakeRecordsSeed);
        setInspectionRecords([inspection1, inspection2]);
        setRepairOrders(repairOrdersSeed);
        setApprovalRecords(approvalRecordsSeed);
        setPartsRequests(partsRequestsSeed);
        setQcRecords(qcRecordsSeed);
        setReleaseRecords(releaseRecordsSeed);
        setInvoiceRecords(invoiceRecordsSeed);
        setPaymentRecords(paymentRecordsSeed);
        setWorkLogs(workLogsSeed);
        setBookings(bookingsSeed);
        setBackjobRecords(backjobRecordsSeed);
        setCustomerAccounts(customerAccountsSeed);
        setApprovalLinkTokens(approvalLinkTokensSeed);
        setSmsApprovalLogs(smsApprovalLogsSeed);
        setCurrentView("dashboard");
        setLoginError("");
        setCustomerLoginError("");
        setSupplierLoginError("");
        setPublicBookingError("");
        setCustomerSession(null);
        setCustomerPortalMode("real");
        setPendingDemoCustomerPortal(false);
    };
    const openDemoCustomerPortal = () => {
        loadSimulatedData();
        setLoginError("");
        setCustomerLoginError("");
        setCustomerApprovalLinkError("");
        setCustomerPortalMode("demo");
        setCustomerPortalLaunchView("dashboard");
        setCustomerPortalSharedRoId("");
        setPendingDemoCustomerPortal(true);
        setLoginAudience("customer");
    };
    const openDemoCustomerApprovalLink = (ro) => {
        const customer = customerAccounts.find((account) => Array.isArray(account.linkedRoIds) && account.linkedRoIds.includes(ro.id)) ||
            customerAccounts.find((account) => sanitizePhone(account.phone) && sanitizePhone(account.phone) === sanitizePhone(ro.phone || "")) ||
            customerAccounts.find((account) => !!account.email && !!ro.email && account.email.toLowerCase() === ro.email.toLowerCase()) ||
            null;
        if (!customer) {
            setAutoPortalMessage("No customer account is linked to this RO yet.");
            return;
        }
        const createdAt = new Date().toISOString();
        const token = {
            id: uid("apt"),
            roId: ro.id,
            customerId: customer.id,
            token: createSecurePortalToken(),
            createdAt,
            expiresAt: getPortalTokenExpiry(72),
            lastUsedAt: "",
            revokedAt: "",
            channel: "Manual",
        };
        const link = buildCustomerPortalUrl(token.token);
        const message = `Demo approval link for RO ${ro.roNumber}: ${link}`;
        setApprovalLinkTokens((prev) => [
            token,
            ...prev.map((row) => (row.roId === ro.id && !row.revokedAt ? { ...row, revokedAt: createdAt } : row)),
        ]);
        setSmsApprovalLogs((prev) => [
            {
                id: uid("sms"),
                roId: ro.id,
                roNumber: ro.roNumber,
                customerId: customer.id,
                customerName: customer.fullName,
                phoneNumber: customer.phone || "",
                tokenId: token.id,
                sentTo: customer.phone || customer.email || "",
                messageType: "approval-request",
                message,
                status: "Sent",
                provider: "Simulated",
                createdAt,
            },
            ...prev,
        ]);
        setCustomerSession(customer);
        setCustomerPortalMode("demo");
        setCustomerPortalLaunchView("approvals");
        setCustomerPortalSharedRoId(ro.id);
        setCustomerApprovalLinkError("");
        setPendingDemoCustomerPortal(false);
        setLoginAudience("customer");
        setCustomerLoginError("");
        setAutoPortalMessage(message);
    };
    const quickStaffLogin = (username) => {
        const found = users.find((user) => user.active && user.username.toLowerCase() === username.toLowerCase());
        if (!found) {
            setLoginError("Demo user not found.");
            return;
        }
        setLoginForm({ username: found.username, password: found.password });
        completeStaffLogin(found);
    };
    const handleLogin = (e) => {
        e.preventDefault();
        const username = loginForm.username.trim().toLowerCase();
        const password = loginForm.password;
        if (!username || !password) {
            setLoginError("Please enter username and password.");
            return;
        }
        const found = users.find((user) => user.active && user.username.toLowerCase() === username && user.password === password);
        if (!found) {
            setLoginError("Invalid username or password.");
            return;
        }
        setCurrentUser({
            id: found.id,
            username: found.username,
            fullName: found.fullName,
            role: found.role,
            active: found.active,
            createdAt: found.createdAt,
        });
        setCurrentView(getDefaultViewForRole(found.role, roleDefinitions));
        setLoginForm({ username: "", password: "" });
        setLoginError("");
        setCustomerPortalMode("real");
        setCustomerPortalLaunchView("dashboard");
        setCustomerPortalSharedRoId("");
        setCustomerApprovalLinkError("");
    };
    const handleCustomerLogin = (e) => {
        e.preventDefault();
        const identifier = customerLoginForm.identifier.trim().toLowerCase();
        const password = customerLoginForm.password.trim();
        if (!identifier || !password) {
            setCustomerLoginError("Please enter phone/email and password.");
            return;
        }
        const normalizedPhone = sanitizePhone(identifier);
        const found = customerAccounts.find((account) => {
            const phoneMatch = normalizedPhone && sanitizePhone(account.phone) === normalizedPhone;
            const emailMatch = !!account.email && account.email.toLowerCase() === identifier;
            return (phoneMatch || emailMatch) && account.password === password;
        });
        if (!found) {
            setCustomerLoginError("Invalid customer portal credentials.");
            return;
        }
        setCustomerSession(found);
        setCustomerLoginForm({ identifier: "", password: "" });
        setCustomerLoginError("");
        setCustomerPortalMode("real");
        setCustomerPortalLaunchView("dashboard");
        setCustomerPortalSharedRoId("");
        setCustomerApprovalLinkError("");
        setPendingDemoCustomerPortal(false);
    };
    const handleCustomerLogout = () => {
        setCustomerSession(null);
        setCustomerPortalMode("real");
        setCustomerPortalLaunchView("dashboard");
        setCustomerPortalSharedRoId("");
        setCustomerApprovalLinkError("");
        setPendingDemoCustomerPortal(false);
        setCustomerLoginError("");
    };
    const handleSupplierLogin = (e) => {
        e.preventDefault();
        const supplierName = supplierLoginForm.supplierName.trim();
        if (!supplierName) {
            setSupplierLoginError("Please enter your supplier name.");
            return;
        }
        setSupplierSession({ supplierName });
        setSupplierLoginForm({ supplierName: "" });
        setSupplierLoginError("");
    };
    const handlePublicBookingSubmit = (e) => {
        e.preventDefault();
        if (isSubmittingPublicBooking)
            return;
        setIsSubmittingPublicBooking(true);
        try {
            const customerName = publicBookingForm.customerName.trim();
            const concern = publicBookingForm.concern.trim();
            if (!customerName || !publicBookingForm.phone.trim() || !publicBookingForm.requestedDate || !publicBookingForm.requestedTime || !concern) {
                setPublicBookingError("Name, phone, preferred date, preferred time, and concern are required.");
                return;
            }
            const now = new Date().toISOString();
            const newBooking = {
                id: uid("book"),
                bookingNumber: nextDailyNumber("BKG"),
                createdAt: now,
                updatedAt: now,
                requestedDate: publicBookingForm.requestedDate,
                requestedTime: publicBookingForm.requestedTime,
                customerName,
                companyName: publicBookingForm.companyName.trim(),
                accountType: publicBookingForm.companyName.trim() ? "Company / Fleet" : "Personal",
                phone: publicBookingForm.phone.trim(),
                email: publicBookingForm.email.trim(),
                plateNumber: publicBookingForm.plateNumber.trim().toUpperCase(),
                conductionNumber: publicBookingForm.conductionNumber.trim().toUpperCase(),
                make: publicBookingForm.make.trim(),
                model: publicBookingForm.model.trim(),
                year: publicBookingForm.year.trim(),
                serviceType: publicBookingForm.serviceType,
                serviceDetail: publicBookingForm.serviceDetail,
                concern,
                notes: publicBookingForm.notes.trim(),
                status: "New",
                source: "Customer Portal",
                createdBy: "Book Service",
            };
            setBookings((prev) => [newBooking, ...prev]);
            setPublicBookingForm({
                ...getDefaultBookingForm("Book Service"),
                requestedDate: publicBookingForm.requestedDate,
                requestedTime: publicBookingForm.requestedTime,
            });
            setPublicBookingError("");
            setLoginAudience("booking");
        }
        finally {
            setIsSubmittingPublicBooking(false);
        }
    };
    const handleSupplierLogout = () => {
        setSupplierSession(null);
        setSupplierLoginError("");
    };
    const generateSmsApprovalLink = (ro) => {
        const customer = customerAccounts.find((account) => Array.isArray(account.linkedRoIds) && account.linkedRoIds.includes(ro.id)) ||
            customerAccounts.find((account) => sanitizePhone(account.phone) && sanitizePhone(account.phone) === sanitizePhone(ro.phone || "")) ||
            customerAccounts.find((account) => !!account.email && !!ro.email && account.email.toLowerCase() === ro.email.toLowerCase()) ||
            null;
        if (!customer) {
            setAutoPortalMessage("No customer account is linked to this RO yet.");
            return;
        }
        const createdAt = new Date().toISOString();
        const token = {
            id: uid("apt"),
            roId: ro.id,
            customerId: customer.id,
            token: createSecurePortalToken(),
            createdAt,
            expiresAt: getPortalTokenExpiry(72),
            lastUsedAt: "",
            revokedAt: "",
            channel: "SMS",
        };
        const link = buildCustomerPortalUrl(token.token);
        const message = `Northeast Car Care Centre: Review and approve RO ${ro.roNumber} here ${link}`;
        setApprovalLinkTokens((prev) => [
            token,
            ...prev.map((row) => (row.roId === ro.id && !row.revokedAt ? { ...row, revokedAt: createdAt } : row)),
        ]);
        setSmsApprovalLogs((prev) => [
            {
                id: uid("sms"),
                roId: ro.id,
                roNumber: ro.roNumber,
                customerId: customer.id,
                customerName: customer.fullName,
                phoneNumber: customer.phone || "",
                tokenId: token.id,
                sentTo: customer.phone || customer.email || "",
                messageType: "approval-request",
                message,
                status: "Sent",
                provider: "Simulated",
                createdAt,
            },
            ...prev,
        ]);
        setAutoPortalMessage(message);
    };
    const sendSmsTemplate = async (payload) => {
        const createdAt = new Date().toISOString();
        const logId = uid("sms");
        const provider = getSmsProviderConfig();
        setSmsApprovalLogs((prev) => [
            {
                id: logId,
                roId: payload.roId,
                roNumber: payload.roNumber,
                customerId: payload.customerId,
                customerName: payload.customerName,
                phoneNumber: payload.phoneNumber,
                tokenId: payload.tokenId,
                sentTo: payload.phoneNumber,
                messageType: payload.messageType,
                message: payload.messageBody,
                status: "Pending",
                provider: provider.provider,
                createdAt,
            },
            ...prev,
        ]);
        const result = await dispatchSmsTemplateMessage(payload);
        setSmsApprovalLogs((prev) => prev.map((row) => row.id === logId
            ? {
                ...row,
                status: result.status,
                provider: result.provider,
                providerResponse: result.providerResponse,
                errorMessage: result.errorMessage,
            }
            : row));
        return result;
    };
    const revokeApprovalLink = (tokenId) => {
        setApprovalLinkTokens((prev) => prev.map((row) => (row.id === tokenId ? { ...row, revokedAt: new Date().toISOString() } : row)));
    };
    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView("dashboard");
        setSidebarOpen(false);
        setLoginError("");
    };
    const handleNavigate = (view) => {
        if (!currentUser)
            return;
        if (!canAccessView(currentUser.role, roleDefinitions, view))
            return;
        setCurrentView(view);
        if (isMobile)
            setSidebarOpen(false);
    };
    const resetRolePermissionsToDefault = () => {
        if (!currentUser)
            return;
        if (!hasPermission(currentUser.role, roleDefinitions, "roles.manage"))
            return;
        setRoleDefinitions(getDefaultRoleDefinitions());
    };
    const resetIntakeRecords = () => {
        setIntakeRecords([]);
        setInspectionRecords([]);
        setRepairOrders([]);
        setQcRecords([]);
        setReleaseRecords([]);
        setPartsRequests([]);
        setApprovalRecords([]);
        setBackjobRecords([]);
        setInvoiceRecords([]);
        setPaymentRecords([]);
        setCustomerAccounts([]);
        setCustomerSession(null);
        localStorage.removeItem(STORAGE_KEYS.intakeRecords);
        localStorage.removeItem(STORAGE_KEYS.inspectionRecords);
        localStorage.removeItem(STORAGE_KEYS.repairOrders);
        localStorage.removeItem(STORAGE_KEYS.qcRecords);
        localStorage.removeItem(STORAGE_KEYS.releaseRecords);
        localStorage.removeItem(STORAGE_KEYS.partsRequests);
        localStorage.removeItem(STORAGE_KEYS.approvalRecords);
        localStorage.removeItem(STORAGE_KEYS.backjobRecords);
        localStorage.removeItem(STORAGE_KEYS.invoiceRecords);
        localStorage.removeItem(STORAGE_KEYS.paymentRecords);
        localStorage.removeItem(STORAGE_KEYS.customerAccounts);
        localStorage.removeItem(STORAGE_KEYS.customerSession);
        localStorage.removeItem(STORAGE_KEYS.approvalLinkTokens);
        localStorage.removeItem(STORAGE_KEYS.smsApprovalLogs);
        localStorage.removeItem(STORAGE_KEYS.counters);
    };
    const renderCurrentPage = () => {
        if (!currentUser)
            return null;
        if (!canAccessView(currentUser.role, roleDefinitions, currentView)) {
            return (_jsx(ModulePage, { title: "Access Restricted", description: "You do not have permission to open this page.", currentUser: currentUser, requiredPermission: "dashboard.view", roleDefinitions: roleDefinitions }));
        }
        switch (currentView) {
            case "dashboard":
                return (_jsx(DashboardPage, { currentUser: currentUser, users: users, roleDefinitions: roleDefinitions, allowedNav: allowedNav, intakeRecords: intakeRecords, repairOrders: repairOrders, qcRecords: qcRecords, releaseRecords: releaseRecords, approvalRecords: approvalRecords, backjobRecords: backjobRecords, invoiceRecords: invoiceRecords, paymentRecords: paymentRecords, workLogs: workLogs, partsRequests: partsRequests, isCompactLayout: isMobile }));
            case "bookings":
                return (_jsx(BookingsPage, { currentUser: currentUser, bookings: bookings, setBookings: setBookings, intakeRecords: intakeRecords, setIntakeRecords: setIntakeRecords, inspectionRecords: inspectionRecords, setInspectionRecords: setInspectionRecords, isCompactLayout: isMobile }));
            case "intake":
                return (_jsx(IntakePage, { currentUser: currentUser, intakeRecords: intakeRecords, setIntakeRecords: setIntakeRecords, inspectionRecords: inspectionRecords, setInspectionRecords: setInspectionRecords, isCompactLayout: isMobile }));
            case "users":
                return (_jsx(UsersPage, { currentUser: currentUser, users: users, setUsers: setUsers, roleDefinitions: roleDefinitions, isCompactLayout: isMobile }));
            case "roles":
                return (_jsx(RolesPage, { currentUser: currentUser, roleDefinitions: roleDefinitions, setRoleDefinitions: setRoleDefinitions }));
            case "settings":
                return (_jsx(SettingsPage, { currentUser: currentUser, roleDefinitions: roleDefinitions, onResetDefaults: resetRolePermissionsToDefault, onResetIntakes: resetIntakeRecords }));
            case "inspection":
                return (_jsx(InspectionPage, { currentUser: currentUser, intakeRecords: intakeRecords, inspectionRecords: inspectionRecords, setInspectionRecords: setInspectionRecords, setIntakeRecords: setIntakeRecords, isCompactLayout: isMobile }));
            case "repairOrders":
                return (_jsx(RepairOrdersPage, { currentUser: currentUser, users: users, intakeRecords: intakeRecords, inspectionRecords: inspectionRecords, repairOrders: repairOrders, setRepairOrders: setRepairOrders, setIntakeRecords: setIntakeRecords, approvalRecords: approvalRecords, setApprovalRecords: setApprovalRecords, backjobRecords: backjobRecords, setBackjobRecords: setBackjobRecords, partsRequests: partsRequests, releaseRecords: releaseRecords, approvalLinkTokens: approvalLinkTokens, autoPortalMessage: autoPortalMessage, smsApprovalLogs: smsApprovalLogs, onGenerateSmsApprovalLink: generateSmsApprovalLink, onOpenDemoCustomerApprovalLink: openDemoCustomerApprovalLink, onSendSmsTemplate: sendSmsTemplate, onRevokeApprovalLink: revokeApprovalLink, isCompactLayout: isMobile }));
            case "shopFloor":
                return (_jsx(ShopFloorPage, { currentUser: currentUser, users: users, repairOrders: repairOrders, setRepairOrders: setRepairOrders, workLogs: workLogs, setWorkLogs: setWorkLogs, isCompactLayout: isMobile }));
            case "qualityControl":
                return (_jsx(QualityControlPage, { currentUser: currentUser, repairOrders: repairOrders, setRepairOrders: setRepairOrders, qcRecords: qcRecords, setQcRecords: setQcRecords, isCompactLayout: isMobile }));
            case "release":
                return (_jsx(ReleasePage, { currentUser: currentUser, repairOrders: repairOrders, setRepairOrders: setRepairOrders, qcRecords: qcRecords, releaseRecords: releaseRecords, setReleaseRecords: setReleaseRecords, invoiceRecords: invoiceRecords, setInvoiceRecords: setInvoiceRecords, paymentRecords: paymentRecords, setPaymentRecords: setPaymentRecords, isCompactLayout: isMobile }));
            case "parts":
                return (_jsx(PartsPage, { currentUser: currentUser, repairOrders: repairOrders, setRepairOrders: setRepairOrders, partsRequests: partsRequests, setPartsRequests: setPartsRequests, isCompactLayout: isMobile }));
            case "backjobs":
                return (_jsx(BackjobPage, { currentUser: currentUser, users: users, repairOrders: repairOrders, invoiceRecords: invoiceRecords, backjobRecords: backjobRecords, setBackjobRecords: setBackjobRecords, isCompactLayout: isMobile }));
            case "history":
                return (_jsx(HistoryPage, { currentUser: currentUser, intakeRecords: intakeRecords, inspectionRecords: inspectionRecords, repairOrders: repairOrders, qcRecords: qcRecords, releaseRecords: releaseRecords, approvalRecords: approvalRecords, backjobRecords: backjobRecords, invoiceRecords: invoiceRecords, paymentRecords: paymentRecords, isCompactLayout: isMobile }));
            default:
                return (_jsx(DashboardPage, { currentUser: currentUser, users: users, roleDefinitions: roleDefinitions, allowedNav: allowedNav, intakeRecords: intakeRecords, repairOrders: repairOrders, qcRecords: qcRecords, releaseRecords: releaseRecords, approvalRecords: approvalRecords, backjobRecords: backjobRecords, invoiceRecords: invoiceRecords, paymentRecords: paymentRecords, workLogs: workLogs, partsRequests: partsRequests, isCompactLayout: isMobile }));
        }
    };
    if (customerApprovalLinkError) {
        return (_jsxs(_Fragment, { children: [_jsx("style", { children: globalCss }), _jsx("div", { style: styles.appShell, children: _jsx("div", { style: styles.mainArea, children: _jsx("div", { style: styles.pageContent, children: _jsx("div", { style: styles.grid, children: _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsxs(Card, { title: "Customer View", subtitle: "Shared approval link", children: [_jsx("div", { style: styles.errorBox, children: customerApprovalLinkError }), _jsx("div", { style: styles.formHint, children: "This shared link is invalid or expired. Please request a fresh customer approval link from the shop." })] }) }) }) }) }) })] }));
    }
    if (customerSession) {
        return (_jsx(CustomerPortalErrorBoundary, { onReset: handleCustomerLogout, children: _jsx(CustomerPortalPage, { customer: customerSession, repairOrders: repairOrders, setRepairOrders: setRepairOrders, approvalLinkTokens: approvalLinkTokens, intakeRecords: intakeRecords, inspectionRecords: inspectionRecords, qcRecords: qcRecords, releaseRecords: releaseRecords, approvalRecords: approvalRecords, backjobRecords: backjobRecords, invoiceRecords: invoiceRecords, paymentRecords: paymentRecords, bookings: bookings, setBookings: setBookings, customerAccounts: customerAccounts, setCustomerAccounts: setCustomerAccounts, setCustomerSession: setCustomerSession, onLogout: handleCustomerLogout, isCompactLayout: isMobile, isDemoMode: customerPortalMode === "demo", portalLaunchView: customerPortalLaunchView, sharedLinkRoId: customerPortalSharedRoId, sharedLinkMode: !!customerPortalSharedRoId }) }));
    }
    if (supplierSession) {
        return (_jsx(SupplierPortalPage, { supplier: supplierSession, partsRequests: partsRequests, setPartsRequests: setPartsRequests, onLogout: handleSupplierLogout, isCompactLayout: isMobile }));
    }
    if (!currentUser) {
        return (_jsxs(_Fragment, { children: [_jsx("style", { children: globalCss }), _jsx(LoginScreen, { audience: loginAudience, setAudience: setLoginAudience, staffForm: loginForm, setStaffForm: setLoginForm, staffError: loginError, onStaffSubmit: handleLogin, customerForm: customerLoginForm, setCustomerForm: setCustomerLoginForm, customerError: customerLoginError, onCustomerSubmit: handleCustomerLogin, supplierForm: supplierLoginForm, setSupplierForm: setSupplierLoginForm, supplierError: supplierLoginError, onSupplierSubmit: handleSupplierLogin, publicBookingForm: publicBookingForm, setPublicBookingForm: setPublicBookingForm, publicBookingError: publicBookingError, onPublicBookingSubmit: handlePublicBookingSubmit, isPublicBookingSubmitting: isSubmittingPublicBooking, onQuickStaffLogin: quickStaffLogin, onLoadDemoData: loadSimulatedData, onOpenDemoCustomerPortal: openDemoCustomerPortal })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: globalCss }), _jsxs("div", { style: styles.appShell, children: [isMobile && sidebarOpen ? _jsx("div", { style: styles.overlay, onClick: () => setSidebarOpen(false) }) : null, _jsxs("aside", { style: {
                            ...styles.sidebar,
                            ...(isMobile
                                ? sidebarOpen
                                    ? styles.sidebarMobileOpen
                                    : styles.sidebarMobileClosed
                                : styles.sidebarDesktop),
                        }, children: [_jsxs("div", { style: styles.sidebarHeader, children: [_jsx("div", { style: styles.sidebarLogo, children: "DVI" }), _jsxs("div", { children: [_jsx("div", { style: styles.sidebarTitle, children: "Workshop App" }), _jsx("div", { style: styles.sidebarSubtitle, children: BUILD_VERSION })] })] }), _jsxs("div", { style: styles.userPanel, children: [_jsx("div", { style: styles.avatar, children: currentUser.fullName
                                            .split(" ")
                                            .map((part) => part[0] ?? "")
                                            .slice(0, 2)
                                            .join("")
                                            .toUpperCase() }), _jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { style: styles.userPanelName, children: currentUser.fullName }), _jsx("div", { style: styles.userPanelRole, children: currentUser.role })] })] }), _jsx("nav", { style: styles.navList, children: allowedNav.map((item) => {
                                    const active = item.key === currentView;
                                    return (_jsxs("button", { type: "button", onClick: () => handleNavigate(item.key), style: { ...styles.navButton, ...(active ? styles.navButtonActive : {}) }, children: [_jsx("span", { style: styles.navIcon, children: item.icon }), _jsx("span", { children: item.label })] }, item.key));
                                }) }), _jsx("div", { style: styles.sidebarFooter, children: _jsx("button", { type: "button", onClick: handleLogout, style: styles.logoutButton, children: "Sign Out" }) })] }), _jsxs("div", { style: { ...styles.mainArea, marginLeft: isMobile ? 0 : 280 }, children: [_jsxs("header", { style: styles.topBar, children: [_jsxs("div", { style: styles.topBarLeft, children: [isMobile ? (_jsx("button", { type: "button", onClick: () => setSidebarOpen((prev) => !prev), style: styles.menuButton, children: "\u00E2\u02DC\u00B0" })) : null, _jsxs("div", { children: [_jsx("div", { style: styles.pageTitle, children: currentNavItem.label }), _jsx("div", { style: styles.pageSubtitle, children: BUILD_VERSION })] })] }), _jsxs("div", { style: styles.topBarRight, children: [_jsx(RoleBadge, { role: currentUser.role }), _jsx("div", { style: styles.topBarName, children: currentUser.fullName })] })] }), _jsx("main", { style: styles.mainContent, children: renderCurrentPage() })] })] })] }));
}
export default function App() {
    return (_jsx(AppErrorBoundary, { children: _jsx(AppInner, {}) }));
}
const globalCss = `
  * { box-sizing: border-box; }
  html, body, #root {
    margin: 0;
    padding: 0;
    min-height: 100%;
    font-family: Inter, Arial, Helvetica, sans-serif;
    background: #f8fafc;
    color: #111827;
  }
  button, input, select, textarea {
    font: inherit;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  textarea {
    resize: vertical;
  }
  @media (max-width: 1200px) {
    .dvi-grid-responsive {
      grid-template-columns: 1fr;
    }
  }
`;
const styles = {
    appShell: {
        minHeight: "100vh",
        background: "linear-gradient(180deg, #050b1d 0%, #08152f 34%, #101a2d 100%)",
    },
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        zIndex: 30,
    },
    sidebar: {
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 280,
        background: "linear-gradient(180deg, #071126 0%, #0d2d74 42%, #7f1018 100%)",
        color: "#fff",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        zIndex: 40,
        transition: "transform 0.2s ease",
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    },
    sidebarDesktop: {
        transform: "translateX(0)",
    },
    sidebarMobileOpen: {
        transform: "translateX(0)",
    },
    sidebarMobileClosed: {
        transform: "translateX(-100%)",
    },
    sidebarHeader: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        paddingBottom: 14,
    },
    sidebarLogo: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "linear-gradient(135deg, #facc15 0%, #f59e0b 42%, #dc2626 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        letterSpacing: 1,
        flexShrink: 0,
    },
    sidebarTitle: {
        fontSize: 18,
        fontWeight: 800,
    },
    sidebarSubtitle: {
        fontSize: 12,
        color: "#f8e7a5",
        marginTop: 2,
    },
    userPanel: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "#1d4ed8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        flexShrink: 0,
    },
    userPanelName: {
        fontSize: 14,
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    userPanelRole: {
        fontSize: 12,
        color: "#cbd5e1",
        marginTop: 3,
    },
    navList: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflowY: "auto",
        flex: 1,
        paddingRight: 2,
    },
    navButton: {
        width: "100%",
        border: "none",
        background: "transparent",
        color: "#e5e7eb",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        textAlign: "left",
        fontWeight: 700,
    },
    navButtonActive: {
        background: "linear-gradient(90deg, rgba(220,38,38,0.92) 0%, rgba(29,78,216,0.96) 100%)",
        color: "#ffffff",
    },
    navIcon: {
        width: 22,
        textAlign: "center",
        flexShrink: 0,
    },
    sidebarFooter: {
        borderTop: "1px solid rgba(255,255,255,0.12)",
        paddingTop: 14,
    },
    logoutButton: {
        width: "100%",
        border: "none",
        background: "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)",
        color: "#fff",
        borderRadius: 12,
        padding: "12px 14px",
        fontWeight: 800,
        cursor: "pointer",
    },
    mainArea: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "margin-left 0.2s ease",
    },
    topBar: {
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(7, 17, 38, 0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(250, 204, 21, 0.35)",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
    },
    topBarLeft: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
    },
    topBarRight: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        justifyContent: "flex-end",
    },
    menuButton: {
        width: 42,
        height: 42,
        borderRadius: 10,
        border: "1px solid #d1d5db",
        background: "#fff",
        cursor: "pointer",
        flexShrink: 0,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 800,
        color: "#f8fafc",
    },
    pageSubtitle: {
        fontSize: 12,
        color: "#cbd5e1",
        marginTop: 2,
    },
    topBarName: {
        fontSize: 14,
        fontWeight: 700,
        color: "#e2e8f0",
    },
    mainContent: {
        padding: 18,
        minWidth: 0,
    },
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
    roleBadge: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: "nowrap",
    },
    heroText: {
        fontSize: 15,
        lineHeight: 1.7,
        color: "#475569",
    },
    statCard: {
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
        height: "100%",
    },
    statLabel: {
        fontSize: 13,
        fontWeight: 700,
        color: "#64748b",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 800,
        color: "#111827",
        lineHeight: 1.2,
        wordBreak: "break-word",
    },
    roleGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12,
    },
    roleTile: {
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: 16,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        color: "#334155",
        alignItems: "flex-start",
    },
    roleTileCount: {
        fontSize: 24,
        color: "#0f172a",
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
    quickAccessIcon: {
        width: 20,
        textAlign: "center",
        flexShrink: 0,
    },
    tableWrap: {
        width: "100%",
        overflowX: "auto",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: 16,
        background: "#ffffff",
    },
    table: {
        minWidth: 900,
        width: "100%",
    },
    th: {
        textAlign: "left",
        padding: "13px 12px",
        borderBottom: "1px solid rgba(226, 232, 240, 0.95)",
        background: "#f8fafc",
        color: "#475569",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
    },
    td: {
        padding: "13px 12px",
        borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
        color: "#111827",
        fontSize: 13,
        verticalAlign: "top",
        lineHeight: 1.5,
    },
    moduleText: {
        fontSize: 15,
        lineHeight: 1.7,
        color: "#475569",
        marginBottom: 14,
    },
    moduleMetaRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        marginTop: 8,
        color: "#334155",
    },
    permissionWrap: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
    },
    permissionPill: {
        borderRadius: 999,
        padding: "8px 12px",
        border: "1px solid #d1d5db",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s ease",
    },
    permissionPillOn: {
        background: "#dcfce7",
        color: "#166534",
        borderColor: "#86efac",
    },
    permissionPillOff: {
        background: "#f8fafc",
        color: "#475569",
        borderColor: "#cbd5e1",
    },
    permissionPillDisabled: {
        cursor: "default",
        opacity: 0.9,
    },
    rolePermissionStack: {
        display: "grid",
        gap: 16,
    },
    rolePermissionCard: {
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 14,
        background: "#f8fafc",
    },
    rolePermissionHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 12,
        flexWrap: "wrap",
    },
    loginShell: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #eff6ff 100%)",
    },
    loginPanel: {
        width: "100%",
        maxWidth: 520,
        background: "rgba(255,255,255,0.97)",
        borderRadius: 24,
        padding: 26,
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: "0 24px 70px rgba(2, 8, 23, 0.24)",
    },
    loginBrand: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 22,
    },
    brandLogo: {
        width: 54,
        height: 54,
        borderRadius: 16,
        background: "linear-gradient(90deg, #dc2626 0%, #1d4ed8 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        letterSpacing: 1,
        flexShrink: 0,
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: 800,
        color: "#0f172a",
    },
    loginSubtitle: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 4,
    },
    buildNoteBox: {
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 16,
        padding: 14,
        marginBottom: 18,
    },
    buildNoteTitle: {
        fontSize: 13,
        fontWeight: 800,
        color: "#1d4ed8",
        marginBottom: 6,
    },
    buildNoteText: {
        fontSize: 14,
        lineHeight: 1.6,
        color: "#334155",
    },
    loginForm: {
        display: "grid",
        gap: 14,
    },
    formStack: {
        display: "grid",
        gap: 14,
    },
    formGroup: {
        display: "grid",
        gap: 8,
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
    textarea: {
        width: "100%",
        minHeight: 96,
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: 12,
        padding: "12px 14px",
        background: "#ffffff",
        outline: "none",
        color: "#0f172a",
        lineHeight: 1.5,
    },
    checkboxRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#334155",
        fontSize: 14,
    },
    errorBox: {
        background: "#fee2e2",
        color: "#991b1b",
        borderRadius: 12,
        padding: "10px 12px",
        fontSize: 14,
        fontWeight: 700,
    },
    primaryButton: {
        border: "none",
        borderRadius: 12,
        padding: "13px 16px",
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        color: "#fff",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
    },
    secondaryButton: {
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: 12,
        padding: "13px 16px",
        background: "#ffffff",
        color: "#0f172a",
        fontWeight: 700,
        cursor: "pointer",
    },
    smallButton: {
        border: "none",
        borderRadius: 10,
        padding: "8px 10px",
        background: "#1d4ed8",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 12,
    },
    smallButtonMuted: {
        border: "none",
        borderRadius: 10,
        padding: "8px 10px",
        background: "#64748b",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 12,
    },
    buttonDisabled: {
        opacity: 0.55,
        cursor: "not-allowed",
    },
    inlineActions: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
    },
    inlineActionsColumn: {
        display: "grid",
        gap: 8,
    },
    demoBox: {
        marginTop: 20,
        paddingTop: 16,
        borderTop: "1px solid rgba(148, 163, 184, 0.28)",
    },
    demoTitle: {
        fontSize: 14,
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: 10,
    },
    demoGrid: {
        display: "grid",
        gap: 8,
        fontSize: 13,
        color: "#475569",
        lineHeight: 1.55,
    },
    updateNoteBox: {
        background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)",
        border: "1px solid rgba(37, 99, 235, 0.16)",
        borderRadius: 16,
        padding: 14,
        marginTop: 18,
    },
    updateNoteTitle: {
        fontSize: 13,
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: 6,
    },
    updateNoteText: {
        fontSize: 13,
        color: "#475569",
        lineHeight: 1.55,
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
    statusLocked: {
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
    inspectionActionBanner: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(29,78,216,0.16)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.98) 100%)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        position: "sticky",
        top: 12,
        zIndex: 4,
    },
    inspectionActionSummary: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        flex: 1,
    },
    inspectionSummaryPill: {
        minWidth: 118,
        display: "grid",
        gap: 4,
        padding: "10px 12px",
        borderRadius: 14,
        background: "#ffffff",
        border: "1px solid #dbeafe",
        color: "#1e3a8a",
        fontSize: 12,
    },
    pillWrap: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
    },
    chipWrap: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
    },
    tagNeutral: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "4px 10px",
        background: "#e2e8f0",
        color: "#334155",
        fontSize: 12,
        fontWeight: 700,
    },
    pillButton: {
        border: "1px solid #bfdbfe",
        borderRadius: 999,
        padding: "8px 12px",
        background: "#eff6ff",
        color: "#1d4ed8",
        fontWeight: 700,
        cursor: "pointer",
    },
    statusNeutral: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "6px 10px",
        background: "#e2e8f0",
        color: "#475569",
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: "nowrap",
    },
    portalTabActive: {
        background: "#1d4ed8",
        color: "#ffffff",
        borderColor: "#1d4ed8",
        boxShadow: "0 10px 24px rgba(29, 78, 216, 0.22)",
    },
    textareaLarge: {
        width: "100%",
        minHeight: 140,
        border: "1px solid rgba(37, 99, 235, 0.22)",
        borderRadius: 14,
        padding: "12px 14px",
        background: "#ffffff",
        outline: "none",
        color: "#0f172a",
        lineHeight: 1.5,
    },
    smallButtonSuccess: {
        border: "none",
        borderRadius: 10,
        padding: "8px 10px",
        background: "#16a34a",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 12,
    },
    smallButtonDanger: {
        border: "none",
        borderRadius: 10,
        padding: "8px 10px",
        background: "#dc2626",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 12,
    },
    sectionCard: {
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 6px 22px rgba(15, 23, 42, 0.06)",
    },
    sectionCardMuted: {
        background: "#f8fafc",
        border: "1px solid rgba(148, 163, 184, 0.22)",
        borderRadius: 16,
        padding: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: 10,
    },
    formHint: {
        fontSize: 12,
        color: "#64748b",
        lineHeight: 1.5,
    },
    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 10,
        marginBottom: 12,
    },
    concernBanner: {
        borderRadius: 14,
        padding: "12px 14px",
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        color: "#9a3412",
        fontSize: 13,
        lineHeight: 1.5,
        marginBottom: 12,
    },
    queueStack: {
        display: "grid",
        gap: 10,
    },
    queueCard: {
        width: "100%",
        textAlign: "left",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: 16,
        padding: 14,
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
    },
    queueCardActive: {
        border: "1px solid #1d4ed8",
        boxShadow: "0 0 0 3px rgba(29, 78, 216, 0.12)",
    },
    queueCardHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 8,
    },
    queueLine: {
        fontSize: 14,
        fontWeight: 800,
        color: "#0f172a",
    },
    queueLineMuted: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 4,
    },
    mobileCardList: {
        display: "grid",
        gap: 12,
    },
    mobileDataCard: {
        border: "1px solid rgba(148, 163, 184, 0.22)",
        background: "#ffffff",
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
    },
    mobileDataCardSelected: {
        border: "1px solid #1d4ed8",
        boxShadow: "0 0 0 3px rgba(29, 78, 216, 0.12)",
    },
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
        color: "#64748b",
        marginTop: 4,
        lineHeight: 1.5,
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
    mobileActionStack: {
        display: "grid",
        gap: 8,
        marginTop: 12,
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
    stickyActionBar: {
        position: "sticky",
        bottom: 0,
        display: "grid",
        gap: 8,
        padding: 12,
        background: "rgba(255,255,255,0.96)",
        borderTop: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: 16,
        boxShadow: "0 -8px 24px rgba(15, 23, 42, 0.08)",
    },
    actionButtonWide: {
        width: "100%",
        justifyContent: "center",
    },
    toggleGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: 10,
    },
    checkboxTile: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 14,
        border: "1px solid rgba(148, 163, 184, 0.22)",
        background: "#ffffff",
        color: "#334155",
        fontSize: 13,
        fontWeight: 700,
    },
    tablePrimary: {
        fontSize: 13,
        fontWeight: 800,
        color: "#0f172a",
    },
    tableSecondary: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 4,
        lineHeight: 1.4,
    },
    concernCell: {
        maxWidth: 260,
        whiteSpace: "normal",
        lineHeight: 1.5,
        color: "#334155",
    },
    concernCard: {
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "#f8fafc",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        fontSize: 13,
        color: "#334155",
        lineHeight: 1.5,
    },
    registrySummary: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    logoutButtonCompact: {
        border: "none",
        background: "#dc2626",
        color: "#fff",
        borderRadius: 10,
        padding: "9px 12px",
        fontWeight: 700,
        cursor: "pointer",
    },
    statNote: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: 8,
    },
    summaryBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        padding: "12px 14px",
        borderRadius: 14,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
    },
    summaryPanel: {
        padding: 14,
        borderRadius: 16,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
    },
    summaryTile: {
        padding: 12,
        borderRadius: 14,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: "#64748b",
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: 800,
        color: "#0f172a",
        lineHeight: 1.4,
    },
    detailPanel: {
        padding: 16,
        borderRadius: 18,
        background: "#ffffff",
        border: "1px solid #dbe4f0",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    },
    detailBanner: {
        padding: 14,
        borderRadius: 16,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
    },
    detailGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
    },
    filterBar: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto auto",
        gap: 10,
        alignItems: "end",
    },
    twoColumnForm: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 14,
    },
    threeColumnForm: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 14,
    },
    formGrid4: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 14,
    },
    checkboxList: {
        display: "grid",
        gap: 10,
        padding: 12,
        borderRadius: 14,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
    },
    checkboxCard: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "#ffffff",
        border: "1px solid #dbe4f0",
        fontWeight: 600,
        color: "#334155",
    },
    mobileCard: {
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        background: "#ffffff",
        padding: 14,
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
    },
    mobileCardHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 8,
    },
    mobileCardTitle: {
        fontSize: 15,
        fontWeight: 800,
        color: "#0f172a",
    },
    mobileCardSubtitle: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 4,
    },
    mobileCardMeta: {
        fontSize: 13,
        color: "#475569",
        lineHeight: 1.6,
    },
    mobileCardNote: {
        marginTop: 8,
        fontSize: 13,
        color: "#475569",
        lineHeight: 1.6,
        padding: "10px 12px",
        borderRadius: 12,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
    },
    mobileDataCardButton: {
        width: "100%",
        border: "1px solid #dbe4f0",
        borderRadius: 16,
        background: "#ffffff",
        padding: 12,
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.15s ease",
    },
    mobileDataCardButtonActive: {
        borderColor: "#93c5fd",
        background: "#eff6ff",
        boxShadow: "0 0 0 1px #bfdbfe inset",
    },
    partsMediaGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 10,
    },
    partsMediaCard: {
        border: "1px solid rgba(148, 163, 184, 0.22)",
        borderRadius: 14,
        padding: 10,
        background: "#ffffff",
    },
    partsMediaImage: {
        width: "100%",
        height: 110,
        objectFit: "cover",
        borderRadius: 10,
        border: "1px solid rgba(148, 163, 184, 0.2)",
        marginBottom: 8,
    },
};
