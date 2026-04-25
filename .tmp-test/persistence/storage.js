// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const KEYS = {
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
export function save(key, data) {
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
export const loadCustomers = (fallback) => {
    const raw = tryParseArray(KEYS.customers);
    return raw ? raw.map(reviveCustomer) : fallback;
};
export const loadVehicles = (fallback) => {
    const raw = tryParseArray(KEYS.vehicles);
    return raw ? raw.map(reviveVehicle) : fallback;
};
export const loadWorkOrders = (fallback) => {
    const raw = tryParseArray(KEYS.workOrders);
    return raw ? raw.map(reviveWorkOrder) : fallback;
};
export const loadEstimates = (fallback) => {
    const raw = tryParseArray(KEYS.estimates);
    return raw ? raw.map(reviveEstimate) : fallback;
};
export const loadInvoices = (fallback) => {
    const raw = tryParseArray(KEYS.invoices);
    return raw ? raw.map(reviveInvoice) : fallback;
};
export const loadInventory = (fallback) => {
    const raw = tryParseArray(KEYS.inventory);
    return raw ? raw.map(revivePart) : fallback;
};
export const loadAppointments = (fallback) => {
    const raw = tryParseArray(KEYS.appointments);
    return raw ? raw.map(reviveAppointment) : fallback;
};
export const loadSettings = (fallback) => tryParseOne(KEYS.settings) ?? fallback;
export const loadTechnicians = (fallback) => tryParseArray(KEYS.technicians) ?? fallback;
