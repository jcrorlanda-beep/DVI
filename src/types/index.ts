// ─── Navigation ───────────────────────────────────────────────────────────────

export type NavState =
  | { page: 'dashboard' }
  | { page: 'customers' }
  | { page: 'customer-profile'; customerId: string }
  | { page: 'workorders' }
  | { page: 'workorder-detail'; workOrderId: string }
  | { page: 'workorder-form'; workOrderId?: string }
  | { page: 'estimates' }
  | { page: 'estimate-detail'; estimateId: string }
  | { page: 'estimate-form'; estimateId?: string }
  | { page: 'invoices' }
  | { page: 'invoice-detail'; invoiceId: string }
  | { page: 'inventory' }
  | { page: 'reports' }
  | { page: 'scheduler' }
  | { page: 'settings' }

// Sidebar parent mapping for sub-pages
export type TopPage =
  | 'dashboard'
  | 'customers'
  | 'workorders'
  | 'estimates'
  | 'invoices'
  | 'inventory'
  | 'reports'
  | 'scheduler'
  | 'settings'

// ─── Line Items ────────────────────────────────────────────────────────────────

export type LineItemType = 'labor' | 'part' | 'sublet' | 'fee'

export interface LineItem {
  id: string
  type: LineItemType
  description: string
  quantity: number
  unitPrice: number
  cost?: number
  taxable: boolean
  partNumber?: string
  inventoryPartId?: string
  technicianId?: string
}

// ─── Technician ────────────────────────────────────────────────────────────────

export interface Technician {
  id: string
  name: string
  role: string
  phone: string
  email: string
  laborRate: number
  color: string
  active: boolean
}

// ─── Customer ──────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

// ─── Vehicle ───────────────────────────────────────────────────────────────────

export type Transmission = 'automatic' | 'manual' | 'cvt' | 'other' | ''

export interface Vehicle {
  id: string
  customerId: string
  year: string
  make: string
  model: string
  trim: string
  vin: string
  licensePlate: string
  color: string
  engine: string
  transmission: Transmission
  mileage: number
  notes: string
  createdAt: Date
}

// ─── Work Order ────────────────────────────────────────────────────────────────

export type WorkOrderStatus =
  | 'pending'
  | 'in-progress'
  | 'needs-parts'
  | 'complete'
  | 'invoiced'
  | 'cancelled'

export interface WorkOrder {
  id: string
  customerId: string
  vehicleId: string
  estimateId?: string
  status: WorkOrderStatus
  technicianId: string
  lineItems: LineItem[]
  mileageIn: number
  mileageOut?: number
  promisedDate?: Date
  completedDate?: Date
  internalNotes: string
  customerConcerns: string
  recommendedServices: string
  authorizationName: string
  createdAt: Date
  updatedAt: Date
}

// ─── Estimate ──────────────────────────────────────────────────────────────────

export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'declined' | 'converted'

export interface Estimate {
  id: string
  customerId: string
  vehicleId: string
  status: EstimateStatus
  technicianId: string
  lineItems: LineItem[]
  mileageIn: number
  expiresAt?: Date
  customerConcerns: string
  internalNotes: string
  convertedWorkOrderId?: string
  createdAt: Date
  updatedAt: Date
}

// ─── Invoice ───────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'void'
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'check' | 'financing' | 'other'

export interface Payment {
  id: string
  method: PaymentMethod
  amount: number
  date: Date
  reference: string
  note: string
}

export interface Invoice {
  id: string
  workOrderId: string
  customerId: string
  vehicleId: string
  status: InvoiceStatus
  lineItems: LineItem[]
  subtotal: number
  taxAmount: number
  taxRate: number
  discountAmount: number
  discountNote: string
  total: number
  amountPaid: number
  payments: Payment[]
  dueDate?: Date
  paidAt?: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}

// ─── Inventory ─────────────────────────────────────────────────────────────────

export interface InventoryPart {
  id: string
  partNumber: string
  name: string
  description: string
  category: string
  brand: string
  costPrice: number
  sellPrice: number
  quantity: number
  minQuantity: number
  location: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

// ─── Appointment ───────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'complete'
  | 'no-show'
  | 'cancelled'

export interface Appointment {
  id: string
  customerId: string
  vehicleId: string
  technicianId: string
  status: AppointmentStatus
  startTime: Date
  endTime: Date
  serviceDescription: string
  estimatedHours: number
  notes: string
  convertedWorkOrderId?: string
  createdAt: Date
  updatedAt: Date
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: string
  name: string
  color: string
}

export interface WorkshopSettings {
  shopName: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  website: string
  laborRate: number
  taxRate: number
  taxOnParts: boolean
  taxOnLabor: boolean
  paymentMethods: PaymentMethod[]
  serviceCategories: ServiceCategory[]
  invoiceTerms: string
  invoiceNotes: string
}
