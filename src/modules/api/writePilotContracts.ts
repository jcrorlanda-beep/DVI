/**
 * Write Pilot Contracts (Phase 223)
 *
 * Type-only contracts for the future backend write pilot.
 * No frontend writes occur until the write pilot guard is explicitly cleared
 * and the enable path is opened in a future phase.
 *
 * All write functions below are STUBS — they log a warning and return a locked result.
 * The intent is to pre-define the API shape so the pilot can be wired cleanly
 * without restructuring types later.
 */

export type WritePilotSyncStatus =
  | "local_only"
  | "pending"
  | "synced"
  | "conflict"
  | "failed"
  | "skipped_locked";

export type WritePilotWriteResult = {
  success: boolean;
  localId: string;
  remoteId: string | null;
  syncStatus: WritePilotSyncStatus;
  warning?: string;
  conflictReason?: string;
};

export type WritePilotConflictType =
  | "duplicatePlate"
  | "duplicateCustomer"
  | "duplicateRoNumber"
  | "staleLocalRecord"
  | "missingLink";

export type WritePilotConflict = {
  type: WritePilotConflictType;
  localId: string;
  field?: string;
  message: string;
};

export type WritePilotConflictResponse = {
  hasConflicts: boolean;
  conflicts: WritePilotConflict[];
  recommendation: "skip" | "review" | "overwrite_not_allowed";
};

export type WritePilotCreateCustomerInput = {
  localId: string;
  customerName: string;
  phone?: string;
  email?: string;
  accountType?: string;
  companyName?: string;
};

export type WritePilotCreateVehicleInput = {
  localId: string;
  plateNumber?: string;
  conductionNumber?: string;
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  customerId?: string;
};

export type WritePilotCreateIntakeInput = {
  localId: string;
  intakeNumber: string;
  customerName: string;
  plateNumber?: string;
  concern: string;
  status: string;
};

export type WritePilotCreateRoInput = {
  localId: string;
  roNumber: string;
  intakeId?: string;
  primaryTechnicianId?: string;
  status: string;
};

const LOCKED_RESULT: WritePilotWriteResult = {
  success: false,
  localId: "",
  remoteId: null,
  syncStatus: "skipped_locked",
  warning: "Write pilot is locked. No backend write was performed.",
};

export function writePilotCreateCustomer(_input: WritePilotCreateCustomerInput): WritePilotWriteResult {
  console.warn("[WritePilot] createCustomer is locked — no backend write performed.");
  return { ...LOCKED_RESULT, localId: _input.localId };
}

export function writePilotCreateVehicle(_input: WritePilotCreateVehicleInput): WritePilotWriteResult {
  console.warn("[WritePilot] createVehicle is locked — no backend write performed.");
  return { ...LOCKED_RESULT, localId: _input.localId };
}

export function writePilotCreateIntake(_input: WritePilotCreateIntakeInput): WritePilotWriteResult {
  console.warn("[WritePilot] createIntake is locked — no backend write performed.");
  return { ...LOCKED_RESULT, localId: _input.localId };
}

export function writePilotCreateRo(_input: WritePilotCreateRoInput): WritePilotWriteResult {
  console.warn("[WritePilot] createRo is locked — no backend write performed.");
  return { ...LOCKED_RESULT, localId: _input.localId };
}

// ── Workflow entity input types (Phase 230–233) ───────────────────────────────

export type WritePilotCreateInspectionInput = {
  localId: string;
  inspectionNumber?: string;
  intakeId?: string;
  repairOrderId?: string;
  customerId?: string;
  vehicleId?: string;
  customerName?: string;
  plateNumber?: string;
  status?: string;
  findings?: unknown;
  recommendations?: unknown;
  mediaMetadata?: unknown;
  technicianName?: string;
  completedAt?: string;
};

export type WritePilotCreateQcInput = {
  localId: string;
  qcNumber?: string;
  repairOrderId?: string;
  repairOrderNumber?: string;
  status?: string;
  result?: string;
  checklist?: unknown;
  passFailNotes?: string;
  failedReasons?: unknown;
  reQcNotes?: string;
  checkedBy?: string;
  completedAt?: string;
};

export type WritePilotCreateReleaseInput = {
  localId: string;
  releaseNumber?: string;
  repairOrderId?: string;
  qcRecordId?: string;
  repairOrderNumber?: string;
  status?: string;
  releaseChecklist?: unknown;
  handoverNotes?: string;
  releasedAt?: string;
  releasedBy?: string;
};

export type WritePilotCreateBackjobInput = {
  localId: string;
  backjobNumber?: string;
  originalRepairOrderId?: string;
  customerName?: string;
  plateNumber?: string;
  status?: string;
  rootCauseCategory?: string;
  costType?: string;
  technicianNotes?: string;
};

export type WritePilotCreateServiceHistoryInput = {
  localId: string;
  vehicleId?: string;
  customerId?: string;
  repairOrderId?: string;
  customerName?: string;
  plateNumber?: string;
  serviceTitle: string;
  category?: string;
  completedAt?: string;
  odometer?: number;
  sourceModule?: string;
};

// ── Business module input types (Phase 235–238) ──────────────────────────────

export type WritePilotCreatePartsRequestInput = {
  localId: string;
  requestNumber?: string;
  partName?: string;
  partNumber?: string;
  category?: string;
  quantity?: number;
  urgency?: string;
  status?: string;
  plateNumber?: string;
  requestedBy?: string;
  notes?: string;
  // bids deliberately excluded — competitor bid privacy
};

export type WritePilotCreateInventoryItemInput = {
  localId: string;
  itemName?: string;
  sku?: string;
  partNumber?: string;
  category?: string;
  brand?: string;
  quantityOnHand?: number;
  reorderLevel?: number;
  supplierName?: string;
  notes?: string;
  // unitCost / sellingPrice deliberately excluded — internal only
};

export type WritePilotCreateInventoryMovementInput = {
  localId: string;
  localInventoryItemId: string;
  movementType: string;
  quantity: number;
  reason?: string;
  sourceModule?: string;
  linkedEntityId?: string;
  note?: string;
  createdBy?: string;
};

export type WritePilotCreatePurchaseOrderInput = {
  localId: string;
  poNumber?: string;
  supplierName?: string;
  status?: string;
  items?: unknown;
  receivingEvents?: unknown;
  expectedDelivery?: string;
  // totalCost deliberately excluded — internal only
};

export type WritePilotCreateSupplierInput = {
  localId: string;
  supplierName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
};

export type WritePilotCreatePaymentInput = {
  localId: string;
  paymentNumber?: string;
  amount: number;
  method?: string;
  status?: string;
  paidAt?: string;
  customerName?: string;
  plateNumber?: string;
};

export type WritePilotCreateExpenseInput = {
  localId: string;
  expenseNumber?: string;
  category?: string;
  vendorName?: string;
  description?: string;
  amount: number;
  incurredAt?: string;
  status?: string;
};

export type WritePilotCreateInvoiceInput = {
  localId: string;
  invoiceNumber?: string;
  customerName?: string;
  plateNumber?: string;
  status?: string;
  total: number;
  issuedAt?: string;
  dueAt?: string;
};

export type WritePilotCreateDocumentInput = {
  localId: string;
  fileName?: string;
  title?: string;
  fileType?: string;
  mimeType?: string;
  fileSize?: number;
  sourceModule: string;
  linkedEntityId?: string;
  linkedEntityLabel?: string;
  customerVisible?: boolean;
  customerVisibilityReviewed?: boolean;
  internalOnly?: boolean;
  uploadedAt?: string;
  uploadedBy?: string;
  note?: string;
  fileId?: string;
  storageKey?: string;
};

export const WRITE_PILOT_DISABLED_REASON =
  "Backend write pilot is locked. All write pilot functions are no-ops until the guard is cleared " +
  "and the enable path is opened. LocalStorage remains the source of truth.";
