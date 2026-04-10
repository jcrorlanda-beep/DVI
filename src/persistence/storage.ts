import type {
  Customer,
  Vehicle,
  WorkOrder,
  Estimate,
  Invoice,
  Payment,
  InventoryPart,
  Appointment,
  WorkshopSettings,
  Technician,
} from '../types'

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
} as const

// ─── Save ─────────────────────────────────────────────────────────────────────

export function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Storage quota exceeded — data stays in memory
  }
}

// ─── Parse helpers ────────────────────────────────────────────────────────────

function tryParseArray<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : null
  } catch {
    return null
  }
}

function tryParseOne<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

// ─── Date revival ─────────────────────────────────────────────────────────────

function reviveDates(obj: Record<string, unknown>, fields: string[]): void {
  for (const field of fields) {
    if (obj[field] && typeof obj[field] === 'string') {
      obj[field] = new Date(obj[field] as string)
    }
  }
}

const reviveCustomer = (raw: Record<string, unknown>): Customer => {
  reviveDates(raw, ['createdAt', 'updatedAt'])
  return raw as unknown as Customer
}

const reviveVehicle = (raw: Record<string, unknown>): Vehicle => {
  reviveDates(raw, ['createdAt'])
  return raw as unknown as Vehicle
}

const reviveWorkOrder = (raw: Record<string, unknown>): WorkOrder => {
  reviveDates(raw, ['createdAt', 'updatedAt', 'promisedDate', 'completedDate'])
  return raw as unknown as WorkOrder
}

const reviveEstimate = (raw: Record<string, unknown>): Estimate => {
  reviveDates(raw, ['createdAt', 'updatedAt', 'expiresAt'])
  return raw as unknown as Estimate
}

const revivePayment = (raw: Record<string, unknown>): Payment => {
  reviveDates(raw, ['date'])
  return raw as unknown as Payment
}

const reviveInvoice = (raw: Record<string, unknown>): Invoice => {
  reviveDates(raw, ['createdAt', 'updatedAt', 'dueDate', 'paidAt'])
  if (Array.isArray(raw.payments)) {
    raw.payments = (raw.payments as Record<string, unknown>[]).map(revivePayment)
  }
  return raw as unknown as Invoice
}

const revivePart = (raw: Record<string, unknown>): InventoryPart => {
  reviveDates(raw, ['createdAt', 'updatedAt'])
  return raw as unknown as InventoryPart
}

const reviveAppointment = (raw: Record<string, unknown>): Appointment => {
  reviveDates(raw, ['createdAt', 'updatedAt', 'startTime', 'endTime'])
  return raw as unknown as Appointment
}

// ─── Public load functions ────────────────────────────────────────────────────

export const loadCustomers = (fallback: Customer[]): Customer[] => {
  const raw = tryParseArray<Record<string, unknown>>(KEYS.customers)
  return raw ? raw.map(reviveCustomer) : fallback
}

export const loadVehicles = (fallback: Vehicle[]): Vehicle[] => {
  const raw = tryParseArray<Record<string, unknown>>(KEYS.vehicles)
  return raw ? raw.map(reviveVehicle) : fallback
}

export const loadWorkOrders = (fallback: WorkOrder[]): WorkOrder[] => {
  const raw = tryParseArray<Record<string, unknown>>(KEYS.workOrders)
  return raw ? raw.map(reviveWorkOrder) : fallback
}

export const loadEstimates = (fallback: Estimate[]): Estimate[] => {
  const raw = tryParseArray<Record<string, unknown>>(KEYS.estimates)
  return raw ? raw.map(reviveEstimate) : fallback
}

export const loadInvoices = (fallback: Invoice[]): Invoice[] => {
  const raw = tryParseArray<Record<string, unknown>>(KEYS.invoices)
  return raw ? raw.map(reviveInvoice) : fallback
}

export const loadInventory = (fallback: InventoryPart[]): InventoryPart[] => {
  const raw = tryParseArray<Record<string, unknown>>(KEYS.inventory)
  return raw ? raw.map(revivePart) : fallback
}

export const loadAppointments = (fallback: Appointment[]): Appointment[] => {
  const raw = tryParseArray<Record<string, unknown>>(KEYS.appointments)
  return raw ? raw.map(reviveAppointment) : fallback
}

export const loadSettings = (fallback: WorkshopSettings): WorkshopSettings =>
  tryParseOne<WorkshopSettings>(KEYS.settings) ?? fallback

export const loadTechnicians = (fallback: Technician[]): Technician[] =>
  tryParseArray<Technician>(KEYS.technicians) ?? fallback
