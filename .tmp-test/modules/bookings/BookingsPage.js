import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo, useState } from "react";
import { getResponsiveSpan } from "../shared/helpers";
// ─── Local constants ────────────────────────────────────────────────────────
const STORAGE_KEY_BOOKINGS = "dvi_phase17d_bookings_v1";
const STORAGE_KEY_BOOKING_DRAFT = "dvi_phase17i_booking_draft_v1";
const STORAGE_KEY_COUNTERS = "dvi_phase2_counters_v1";
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
// ─── Local helpers ───────────────────────────────────────────────────────────
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
function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function todayStamp(date = new Date()) {
    const yyyy = date.getFullYear().toString();
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const dd = `${date.getDate()}`.padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}
function nextDailyNumber(prefix) {
    const stamp = todayStamp();
    const counters = readLocalStorage(STORAGE_KEY_COUNTERS, {});
    const key = `${prefix}_${stamp}`;
    const next = (counters[key] ?? 0) + 1;
    counters[key] = next;
    writeLocalStorage(STORAGE_KEY_COUNTERS, counters);
    return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
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
    React.useEffect(() => {
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
function getBookingServiceDetailOptions(serviceType) {
    return BOOKING_SERVICE_DETAIL_OPTIONS[serviceType] ?? ["Other / Describe in notes"];
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
function getBookingStatusStyle(status) {
    if (status === "Converted to Intake")
        return styles.statusOk;
    if (status === "Cancelled" || status === "No Show")
        return styles.statusLocked;
    if (status === "Arrived" || status === "Confirmed" || status === "Rescheduled")
        return styles.statusWarning;
    return styles.statusInfo;
}
// ─── Sub-components ──────────────────────────────────────────────────────────
function Card({ title, subtitle, right, children, }) {
    return (_jsxs("div", { style: styles.card, children: [_jsxs("div", { style: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.cardTitle, children: title }), subtitle ? _jsx("div", { style: styles.cardSubtitle, children: subtitle }) : null] }), right ? _jsx("div", { children: right }) : null] }), children] }));
}
// ─── Component ───────────────────────────────────────────────────────────────
function BookingsPage({ currentUser, bookings, setBookings, intakeRecords, setIntakeRecords, inspectionRecords, setInspectionRecords, isCompactLayout, }) {
    const bookingDraftInitial = readLocalStorage(STORAGE_KEY_BOOKING_DRAFT, null);
    const [form, setForm] = useState(() => bookingDraftInitial ? { ...getDefaultBookingForm(currentUser.fullName), ...bookingDraftInitial } : getDefaultBookingForm(currentUser.fullName));
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [showDraftRestore, setShowDraftRestore] = useState(() => !!bookingDraftInitial);
    const bookingDraft = useDraftAutosave(STORAGE_KEY_BOOKING_DRAFT, form, hasNonEmptyValues(form));
    const filteredBookings = useMemo(() => {
        const term = search.trim().toLowerCase();
        return bookings
            .filter((row) => !term
            ? true
            : [
                row.bookingNumber,
                row.customerName,
                row.companyName,
                row.phone,
                row.email,
                row.plateNumber,
                row.conductionNumber,
                row.make,
                row.model,
                row.serviceType,
                row.serviceDetail,
                row.concern,
                row.status,
            ]
                .join(" ")
                .toLowerCase()
                .includes(term))
            .sort((a, b) => (b.requestedDate + b.requestedTime).localeCompare(a.requestedDate + a.requestedTime));
    }, [bookings, search]);
    const resetForm = () => {
        setForm(getDefaultBookingForm(currentUser.fullName));
        setError("");
        bookingDraft.clearDraft();
        setShowDraftRestore(false);
    };
    const handleServiceTypeChange = (value) => {
        const nextDetail = getBookingServiceDetailOptions(value)[0] ?? "Other / Describe in notes";
        setForm((prev) => ({ ...prev, serviceType: value, serviceDetail: nextDetail }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const customerName = form.customerName.trim();
        const companyName = form.companyName.trim();
        const concern = form.concern.trim();
        const plateNumber = form.plateNumber.trim().toUpperCase();
        const conductionNumber = form.conductionNumber.trim().toUpperCase();
        if (!customerName && !companyName) {
            setError("Customer or company name is required.");
            return;
        }
        if (!plateNumber && !conductionNumber) {
            setError("Plate number or conduction number is required.");
            return;
        }
        if (!concern) {
            setError("Concern is required.");
            return;
        }
        const record = {
            id: uid("bkg"),
            bookingNumber: nextDailyNumber("BKG"),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            requestedDate: form.requestedDate,
            requestedTime: form.requestedTime,
            customerName,
            companyName: companyName.trim(),
            accountType: form.accountType,
            phone: form.phone.trim(),
            email: form.email.trim(),
            plateNumber,
            conductionNumber,
            make: form.make.trim(),
            model: form.model.trim(),
            year: form.year.trim(),
            serviceType: form.serviceType,
            serviceDetail: form.serviceDetail,
            concern,
            notes: form.notes.trim(),
            status: form.status,
            source: "Staff",
            createdBy: currentUser.fullName,
        };
        setBookings((prev) => [record, ...prev]);
        bookingDraft.clearDraft();
        setShowDraftRestore(false);
        setError("");
        setForm(getDefaultBookingForm(currentUser.fullName));
    };
    const updateBookingStatus = (bookingId, status) => {
        setBookings((prev) => prev.map((row) => (row.id === bookingId ? { ...row, status, updatedAt: new Date().toISOString() } : row)));
    };
    const convertBookingToIntake = (booking) => {
        const existingInspection = inspectionRecords.find((row) => normalizeVehicleKey(row.plateNumber, row.conductionNumber) === normalizeVehicleKey(booking.plateNumber, booking.conductionNumber));
        const intakeId = uid("intake");
        const newIntake = {
            id: intakeId,
            intakeNumber: nextDailyNumber("INT"),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            customerName: booking.customerName,
            companyName: booking.companyName,
            accountType: booking.accountType,
            phone: booking.phone,
            email: booking.email,
            plateNumber: booking.plateNumber,
            conductionNumber: booking.conductionNumber,
            make: booking.make,
            model: booking.model,
            year: booking.year,
            color: "",
            odometerKm: "",
            fuelLevel: "",
            assignedAdvisor: currentUser.fullName,
            concern: `${booking.serviceType} — ${booking.serviceDetail}: ${booking.concern}`,
            notes: booking.notes,
            status: "Waiting Inspection",
            encodedBy: currentUser.fullName,
        };
        setIntakeRecords((prev) => [newIntake, ...prev]);
        if (!existingInspection) {
            const draftInspection = {
                id: uid("insp"),
                inspectionNumber: nextDailyNumber("INSP"),
                intakeId,
                intakeNumber: newIntake.intakeNumber,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                startedBy: currentUser.fullName,
                status: "In Progress",
                accountLabel: newIntake.companyName || newIntake.customerName,
                plateNumber: newIntake.plateNumber,
                conductionNumber: newIntake.conductionNumber,
                make: newIntake.make,
                model: newIntake.model,
                year: newIntake.year,
                color: newIntake.color,
                odometerKm: newIntake.odometerKm,
                concern: newIntake.concern,
            };
            setInspectionRecords((prev) => [draftInspection, ...prev]);
        }
        updateBookingStatus(booking.id, "Converted to Intake");
        setBookings((prev) => prev.map((row) => (row.id === booking.id ? { ...row, convertedIntakeId: intakeId, updatedAt: new Date().toISOString() } : row)));
    };
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsx(Card, { title: "New Booking", subtitle: "Create, confirm, and convert bookings into intake records", right: _jsx("span", { style: styles.statusInfo, children: "Front Desk Ready" }), children: _jsxs("form", { onSubmit: handleSubmit, style: styles.formStack, children: [showDraftRestore ? (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Draft Recovery" }), _jsx("div", { style: styles.formHint, children: "A booking draft was recovered automatically from your last unfinished work." })] }), _jsx("span", { style: styles.statusWarning, children: "Recovered" })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => setShowDraftRestore(false), children: "Keep Draft" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: resetForm, children: "Discard Draft" })] })] })) : null, _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Draft Status" }), _jsx("strong", { children: bookingDraft.draftState })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Requested Date" }), _jsx("input", { style: styles.input, type: "date", value: form.requestedDate, onChange: (e) => setForm((prev) => ({ ...prev, requestedDate: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Requested Time" }), _jsx("input", { style: styles.input, type: "time", value: form.requestedTime, onChange: (e) => setForm((prev) => ({ ...prev, requestedTime: e.target.value })) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Customer Name" }), _jsx("input", { style: styles.input, value: form.customerName, onChange: (e) => setForm((prev) => ({ ...prev, customerName: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Company / Fleet" }), _jsx("input", { style: styles.input, value: form.companyName, onChange: (e) => setForm((prev) => ({ ...prev, companyName: e.target.value })) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Phone" }), _jsx("input", { style: styles.input, value: form.phone, onChange: (e) => setForm((prev) => ({ ...prev, phone: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Email" }), _jsx("input", { style: styles.input, value: form.email, onChange: (e) => setForm((prev) => ({ ...prev, email: e.target.value })) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Plate Number" }), _jsx("input", { style: styles.input, value: form.plateNumber, onChange: (e) => setForm((prev) => ({ ...prev, plateNumber: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Conduction Number" }), _jsx("input", { style: styles.input, value: form.conductionNumber, onChange: (e) => setForm((prev) => ({ ...prev, conductionNumber: e.target.value })) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Make" }), _jsx("input", { style: styles.input, value: form.make, onChange: (e) => setForm((prev) => ({ ...prev, make: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Model" }), _jsx("input", { style: styles.input, value: form.model, onChange: (e) => setForm((prev) => ({ ...prev, model: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Year" }), _jsx("input", { style: styles.input, value: form.year, onChange: (e) => setForm((prev) => ({ ...prev, year: e.target.value })) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Service Type" }), _jsx("select", { style: styles.select, value: form.serviceType, onChange: (e) => handleServiceTypeChange(e.target.value), children: BOOKING_SERVICE_OPTIONS.map((type) => _jsx("option", { value: type, children: type }, type)) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Service Detail" }), _jsx("select", { style: styles.select, value: form.serviceDetail, onChange: (e) => setForm((prev) => ({ ...prev, serviceDetail: e.target.value })), children: getBookingServiceDetailOptions(form.serviceType).map((detail) => _jsx("option", { value: detail, children: detail }, detail)) })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Concern" }), _jsx("textarea", { style: styles.textarea, value: form.concern, onChange: (e) => setForm((prev) => ({ ...prev, concern: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Notes" }), _jsx("textarea", { style: styles.textarea, value: form.notes, onChange: (e) => setForm((prev) => ({ ...prev, notes: e.target.value })) })] }), error ? _jsx("div", { style: styles.errorBox, children: error }) : null, _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "submit", style: styles.primaryButton, children: "Save Booking" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: resetForm, children: "Reset" })] })] }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsxs(Card, { title: "Booking Queue", subtitle: "Newest bookings first with quick status actions", children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Search" }), _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Booking no., customer, plate, service type" })] }), filteredBookings.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No bookings found." })) : (_jsx("div", { style: styles.mobileCardList, children: filteredBookings.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.bookingNumber }), _jsx("span", { style: getBookingStatusStyle(row.status), children: row.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.customerName || row.companyName || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: [row.make, row.model, row.year].filter(Boolean).join(" ") }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Requested" }), _jsxs("strong", { children: [row.requestedDate, " ", row.requestedTime] })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Service" }), _jsxs("strong", { children: [row.serviceType, " \u2022 ", row.serviceDetail] })] }), _jsx("div", { style: styles.formHint, children: row.concern }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => updateBookingStatus(row.id, "Confirmed"), children: "Confirm" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => updateBookingStatus(row.id, "Arrived"), children: "Arrived" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => updateBookingStatus(row.id, "Rescheduled"), children: "Reschedule" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => updateBookingStatus(row.id, "Cancelled"), children: "Cancel" }), row.status !== "Converted to Intake" ? (_jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => convertBookingToIntake(row), children: "Convert to Intake" })) : null] })] }, row.id))) }))] }) })] }) }));
}
export default BookingsPage;
// ─── Styles ──────────────────────────────────────────────────────────────────
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
    formStack: { display: "grid", gap: 14 },
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
    formGroup: { display: "grid", gap: 8 },
    label: { fontSize: 13, fontWeight: 700, color: "#334155" },
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
    inlineActions: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
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
    formHint: { fontSize: 12, color: "#64748b", lineHeight: 1.5 },
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
    emptyState: {
        border: "1px dashed rgba(148, 163, 184, 0.55)",
        background: "#f8fafc",
        borderRadius: 16,
        padding: 20,
        textAlign: "center",
        color: "#64748b",
        fontSize: 14,
    },
    mobileCardList: { display: "grid", gap: 12 },
    mobileDataCard: {
        border: "1px solid rgba(148, 163, 184, 0.22)",
        background: "#ffffff",
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
    },
    mobileDataCardHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 8,
        flexWrap: "wrap",
    },
    mobileDataPrimary: { fontSize: 14, fontWeight: 800, color: "#0f172a" },
    mobileDataSecondary: { fontSize: 13, color: "#64748b", marginTop: 4, lineHeight: 1.5 },
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
};
