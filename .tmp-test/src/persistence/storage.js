"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTechnicians = exports.loadSettings = exports.loadAppointments = exports.loadInventory = exports.loadInvoices = exports.loadEstimates = exports.loadWorkOrders = exports.loadVehicles = exports.loadCustomers = exports.KEYS = void 0;
exports.save = save;
// ─── Storage Keys ─────────────────────────────────────────────────────────────
exports.KEYS = {
    customers: 'dvi_customers',
    vehicles: 'dvi_vehicles',
    workOrders: 'dvi_workorders',
    estimates: 'dvi_estimates',
    invoices: 'dvi_invoices',
    inventory: 'dvi_inventory',
    appointments: 'dvi_appointments',
    settings: 'dvi_settings',
    technicians: 'dvi_technicians',
};
// ─── Save ─────────────────────────────────────────────────────────────────────
function save(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    }
    catch {
        // Storage quota exceeded — data stays in memory
    }
}
// ─── Parse helpers ────────────────────────────────────────────────────────────
function tryParseArray(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
function tryParseOne(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
// ─── Date revival ─────────────────────────────────────────────────────────────
function reviveDates(obj, fields) {
    for (const field of fields) {
        if (obj[field] && typeof obj[field] === 'string') {
            obj[field] = new Date(obj[field]);
        }
    }
}
const reviveCustomer = (raw) => {
    reviveDates(raw, ['createdAt', 'updatedAt']);
    return raw;
};
const reviveVehicle = (raw) => {
    reviveDates(raw, ['createdAt']);
    return raw;
};
const reviveWorkOrder = (raw) => {
    reviveDates(raw, ['createdAt', 'updatedAt', 'promisedDate', 'completedDate']);
    return raw;
};
const reviveEstimate = (raw) => {
    reviveDates(raw, ['createdAt', 'updatedAt', 'expiresAt']);
    return raw;
};
const revivePayment = (raw) => {
    reviveDates(raw, ['date']);
    return raw;
};
const reviveInvoice = (raw) => {
    reviveDates(raw, ['createdAt', 'updatedAt', 'dueDate', 'paidAt']);
    if (Array.isArray(raw.payments)) {
        raw.payments = raw.payments.map(revivePayment);
    }
    return raw;
};
const revivePart = (raw) => {
    reviveDates(raw, ['createdAt', 'updatedAt']);
    return raw;
};
const reviveAppointment = (raw) => {
    reviveDates(raw, ['createdAt', 'updatedAt', 'startTime', 'endTime']);
    return raw;
};
// ─── Public load functions ────────────────────────────────────────────────────
const loadCustomers = (fallback) => {
    const raw = tryParseArray(exports.KEYS.customers);
    return raw ? raw.map(reviveCustomer) : fallback;
};
exports.loadCustomers = loadCustomers;
const loadVehicles = (fallback) => {
    const raw = tryParseArray(exports.KEYS.vehicles);
    return raw ? raw.map(reviveVehicle) : fallback;
};
exports.loadVehicles = loadVehicles;
const loadWorkOrders = (fallback) => {
    const raw = tryParseArray(exports.KEYS.workOrders);
    return raw ? raw.map(reviveWorkOrder) : fallback;
};
exports.loadWorkOrders = loadWorkOrders;
const loadEstimates = (fallback) => {
    const raw = tryParseArray(exports.KEYS.estimates);
    return raw ? raw.map(reviveEstimate) : fallback;
};
exports.loadEstimates = loadEstimates;
const loadInvoices = (fallback) => {
    const raw = tryParseArray(exports.KEYS.invoices);
    return raw ? raw.map(reviveInvoice) : fallback;
};
exports.loadInvoices = loadInvoices;
const loadInventory = (fallback) => {
    const raw = tryParseArray(exports.KEYS.inventory);
    return raw ? raw.map(revivePart) : fallback;
};
exports.loadInventory = loadInventory;
const loadAppointments = (fallback) => {
    const raw = tryParseArray(exports.KEYS.appointments);
    return raw ? raw.map(reviveAppointment) : fallback;
};
exports.loadAppointments = loadAppointments;
const loadSettings = (fallback) => tryParseOne(exports.KEYS.settings) ?? fallback;
exports.loadSettings = loadSettings;
const loadTechnicians = (fallback) => tryParseArray(exports.KEYS.technicians) ?? fallback;
exports.loadTechnicians = loadTechnicians;
