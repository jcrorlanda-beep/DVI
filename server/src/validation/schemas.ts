import {
  makeResult,
  optionalBoolean,
  optionalEmail,
  optionalIsoDate,
  optionalArrayValue,
  optionalJsonValue,
  optionalNumber,
  optionalString,
  requiredString,
  requireRecord,
} from "./helpers.js";
import type { ValidationIssue, ValidationSchema } from "./types.js";

function validateWithRecord(input: unknown, schemaName: string, validateRecord: (record: Record<string, unknown>) => ValidationIssue[]) {
  const base = requireRecord(input, schemaName);
  if (!base.record) return makeResult(base.issues);
  return makeResult([...base.issues, ...validateRecord(base.record)]);
}

export const customerSchema: ValidationSchema = {
  name: "customer",
  validate: (input) =>
    validateWithRecord(input, "Customer", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...requiredString(record, "customerName", "Customer name"),
      ...optionalString(record, "companyName", "Company name"),
      ...optionalString(record, "phone", "Phone"),
      ...optionalEmail(record, "email", "Email"),
      ...optionalString(record, "accountType", "Account type"),
      ...optionalBoolean(record, "fleet", "Fleet flag"),
      ...optionalBoolean(record, "company", "Company flag"),
      ...optionalString(record, "notes", "Notes"),
      ...optionalIsoDate(record, "archivedAt", "Archived date"),
    ]),
};

export const customerUpdateSchema: ValidationSchema = {
  name: "customerUpdate",
  validate: (input) =>
    validateWithRecord(input, "Customer update", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "companyName", "Company name"),
      ...optionalString(record, "phone", "Phone"),
      ...optionalEmail(record, "email", "Email"),
      ...optionalString(record, "accountType", "Account type"),
      ...optionalBoolean(record, "fleet", "Fleet flag"),
      ...optionalBoolean(record, "company", "Company flag"),
      ...optionalString(record, "notes", "Notes"),
      ...optionalIsoDate(record, "archivedAt", "Archived date"),
    ]),
};

export const vehicleSchema: ValidationSchema = {
  name: "vehicle",
  validate: (input) =>
    validateWithRecord(input, "Vehicle", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "customerId", "Customer ID"),
      ...optionalString(record, "localCustomerId", "Local customer ID"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "conductionNumber", "Conduction number"),
      ...optionalString(record, "make", "Make"),
      ...optionalString(record, "model", "Model"),
      ...optionalString(record, "year", "Year"),
      ...optionalString(record, "color", "Color"),
      ...optionalNumber(record, "mileage", "Mileage"),
      ...optionalString(record, "notes", "Notes"),
      ...optionalIsoDate(record, "archivedAt", "Archived date"),
    ]),
};

export const vehicleUpdateSchema: ValidationSchema = {
  name: "vehicleUpdate",
  validate: (input) =>
    validateWithRecord(input, "Vehicle update", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "customerId", "Customer ID"),
      ...optionalString(record, "localCustomerId", "Local customer ID"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "conductionNumber", "Conduction number"),
      ...optionalString(record, "make", "Make"),
      ...optionalString(record, "model", "Model"),
      ...optionalString(record, "year", "Year"),
      ...optionalString(record, "color", "Color"),
      ...optionalNumber(record, "mileage", "Mileage"),
      ...optionalString(record, "notes", "Notes"),
      ...optionalIsoDate(record, "archivedAt", "Archived date"),
    ]),
};

export const repairOrderSchema: ValidationSchema = {
  name: "repairOrder",
  validate: (input) =>
    validateWithRecord(input, "Repair order", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "intakeId", "Intake ID"),
      ...optionalString(record, "localIntakeId", "Local intake ID"),
      ...optionalString(record, "localCustomerId", "Local customer ID"),
      ...optionalString(record, "localVehicleId", "Local vehicle ID"),
      ...optionalString(record, "customerId", "Customer ID"),
      ...optionalString(record, "vehicleId", "Vehicle ID"),
      ...optionalString(record, "repairOrderNumber", "RO number"),
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "conductionNumber", "Conduction number"),
      ...optionalString(record, "status", "Status"),
      ...optionalString(record, "advisorName", "Advisor"),
      ...optionalString(record, "technicianName", "Assigned technician"),
      ...optionalNumber(record, "odometer", "Odometer"),
      ...optionalNumber(record, "subtotal", "Subtotal"),
      ...optionalNumber(record, "total", "Total"),
      ...optionalIsoDate(record, "openedAt", "Opened date"),
      ...optionalIsoDate(record, "completedAt", "Completed date"),
      ...optionalArrayValue(record, "workLines", "Work lines"),
    ]),
};

export const intakeSchema: ValidationSchema = {
  name: "intake",
  validate: (input) =>
    validateWithRecord(input, "Intake", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "intakeNumber", "Intake number"),
      ...optionalString(record, "customerId", "Customer ID"),
      ...optionalString(record, "localCustomerId", "Local customer ID"),
      ...optionalString(record, "vehicleId", "Vehicle ID"),
      ...optionalString(record, "localVehicleId", "Local vehicle ID"),
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "conductionNumber", "Conduction number"),
      ...optionalJsonValue(record, "requestedServices", "Requested services"),
      ...optionalString(record, "concern", "Concern"),
      ...optionalString(record, "serviceRequest", "Service request"),
      ...optionalString(record, "status", "Status"),
      ...optionalString(record, "source", "Source"),
      ...optionalNumber(record, "odometer", "Odometer"),
      ...optionalIsoDate(record, "openedAt", "Opened date"),
    ]),
};

export const inspectionSchema: ValidationSchema = {
  name: "inspection",
  validate: (input) =>
    validateWithRecord(input, "Inspection", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "inspectionNumber", "Inspection number"),
      ...optionalString(record, "intakeId", "Intake ID"),
      ...optionalString(record, "localIntakeId", "Local intake ID"),
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "localRepairOrderId", "Local repair order ID"),
      ...optionalString(record, "customerId", "Customer ID"),
      ...optionalString(record, "localCustomerId", "Local customer ID"),
      ...optionalString(record, "vehicleId", "Vehicle ID"),
      ...optionalString(record, "localVehicleId", "Local vehicle ID"),
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "conductionNumber", "Conduction number"),
      ...optionalString(record, "status", "Status"),
      ...optionalJsonValue(record, "findings", "Findings"),
      ...optionalJsonValue(record, "recommendations", "Recommendations"),
      ...optionalJsonValue(record, "triggeredSections", "Triggered sections"),
      ...optionalJsonValue(record, "tireDetails", "Tire details"),
      ...optionalJsonValue(record, "brakeDetails", "Brake details"),
      ...optionalJsonValue(record, "underHoodDetails", "Under-hood details"),
      ...optionalJsonValue(record, "evidenceItems", "Evidence items"),
      ...optionalJsonValue(record, "media", "Media metadata"),
      ...optionalJsonValue(record, "mediaMetadata", "Media metadata"),
      ...optionalIsoDate(record, "createdAt", "Created date"),
      ...optionalIsoDate(record, "updatedAt", "Updated date"),
      ...optionalString(record, "technicianName", "Technician"),
      ...optionalIsoDate(record, "completedAt", "Completed date"),
    ]),
};

export const qcRecordSchema: ValidationSchema = {
  name: "qcRecord",
  validate: (input) =>
    validateWithRecord(input, "QC record", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "qcNumber", "QC number"),
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "localRepairOrderId", "Local repair order ID"),
      ...optionalString(record, "repairOrderNumber", "RO number"),
      ...optionalString(record, "status", "Status"),
      ...optionalString(record, "result", "Result"),
      ...optionalJsonValue(record, "checklist", "Checklist"),
      ...optionalString(record, "passFailNotes", "Pass/fail notes"),
      ...optionalJsonValue(record, "failedReasons", "Failed reasons"),
      ...optionalString(record, "reQcNotes", "Re-QC notes"),
      ...optionalJsonValue(record, "technicianMetadata", "QC technician metadata"),
      ...optionalString(record, "checkedBy", "Checked by"),
      ...optionalIsoDate(record, "completedAt", "Completed date"),
    ]),
};

export const releaseRecordSchema: ValidationSchema = {
  name: "releaseRecord",
  validate: (input) =>
    validateWithRecord(input, "Release record", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "releaseNumber", "Release number"),
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "localRepairOrderId", "Local repair order ID"),
      ...optionalString(record, "repairOrderNumber", "RO number"),
      ...optionalString(record, "qcRecordId", "QC record ID"),
      ...optionalString(record, "localQcRecordId", "Local QC record ID"),
      ...optionalString(record, "qcNumber", "QC number"),
      ...optionalString(record, "status", "Release status"),
      ...optionalJsonValue(record, "releaseChecklist", "Release checklist"),
      ...optionalString(record, "handoverNotes", "Handover notes"),
      ...optionalString(record, "customerMessageSummary", "Customer message summary"),
      ...optionalJsonValue(record, "documentLinks", "Document links"),
      ...optionalIsoDate(record, "releasedAt", "Released date"),
      ...optionalString(record, "releasedBy", "Released by"),
      ...optionalJsonValue(record, "customerConfirmation", "Customer confirmation"),
    ]),
};

export const backjobRecordSchema: ValidationSchema = {
  name: "backjobRecord",
  validate: (input) =>
    validateWithRecord(input, "Backjob record", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "backjobNumber", "Backjob number"),
      ...optionalString(record, "originalRepairOrderId", "Original RO ID"),
      ...optionalString(record, "localOriginalRepairOrderId", "Local original RO ID"),
      ...optionalString(record, "originalRepairOrderNumber", "Original RO number"),
      ...optionalString(record, "returnRepairOrderId", "Return RO ID"),
      ...optionalString(record, "localReturnRepairOrderId", "Local return RO ID"),
      ...optionalString(record, "returnRepairOrderNumber", "Return RO number"),
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "status", "Status"),
      ...optionalJsonValue(record, "findings", "Findings"),
      ...optionalJsonValue(record, "fixesPerformed", "Fixes performed"),
      ...optionalString(record, "rootCauseCategory", "Root cause category"),
      ...optionalJsonValue(record, "rootCause", "Root cause"),
      ...optionalString(record, "costType", "Cost type"),
      ...optionalString(record, "technicianNotes", "Technician notes"),
      ...optionalString(record, "customerExplanation", "Customer explanation"),
    ]),
};

export const serviceHistoryRecordSchema: ValidationSchema = {
  name: "serviceHistoryRecord",
  validate: (input) =>
    validateWithRecord(input, "Service history record", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "customerId", "Customer ID"),
      ...optionalString(record, "localCustomerId", "Local customer ID"),
      ...optionalString(record, "vehicleId", "Vehicle ID"),
      ...optionalString(record, "localVehicleId", "Local vehicle ID"),
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "localRepairOrderId", "Local repair order ID"),
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "serviceTitle", "Service title"),
      ...optionalString(record, "title", "Service title"),
      ...optionalString(record, "category", "Category"),
      ...optionalIsoDate(record, "completedAt", "Completed date"),
      ...optionalNumber(record, "odometer", "Odometer"),
      ...optionalString(record, "sourceModule", "Source module"),
      ...optionalString(record, "notes", "Notes"),
    ]),
};

export const inventoryItemSchema: ValidationSchema = {
  name: "inventoryItem",
  validate: (input) =>
    validateWithRecord(input, "Inventory item", (record) => [
      ...requiredString(record, "itemName", "Item name"),
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "sku", "SKU"),
      ...optionalString(record, "partNumber", "Part number"),
      ...optionalString(record, "category", "Category"),
      ...optionalString(record, "brand", "Brand"),
      ...optionalNumber(record, "quantityOnHand", "Quantity on hand"),
      ...optionalNumber(record, "reorderLevel", "Reorder level"),
      ...optionalNumber(record, "unitCost", "Unit cost"),
      ...optionalNumber(record, "sellingPrice", "Selling price"),
      ...optionalString(record, "supplierName", "Supplier"),
      ...optionalBoolean(record, "active", "Active"),
      ...optionalJsonValue(record, "movementLog", "Movement log"),
      ...optionalString(record, "notes", "Notes"),
    ]),
};

export const partsRequestSchema: ValidationSchema = {
  name: "partsRequest",
  validate: (input) =>
    validateWithRecord(input, "Parts request", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "requestNumber", "Request number"),
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "localRoId", "Local RO ID"),
      ...optionalString(record, "supplierId", "Supplier ID"),
      ...requiredString(record, "partName", "Part name"),
      ...optionalString(record, "partNumber", "Part number"),
      ...optionalString(record, "category", "Category"),
      ...optionalNumber(record, "quantity", "Quantity"),
      ...optionalString(record, "urgency", "Urgency"),
      ...optionalString(record, "status", "Status"),
      ...optionalString(record, "selectedBidId", "Selected bid ID"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "requestedBy", "Requested by"),
      ...optionalJsonValue(record, "bids", "Supplier bids"),
      ...optionalString(record, "notes", "Notes"),
    ]),
};

export const inventoryMovementSchema: ValidationSchema = {
  name: "inventoryMovement",
  validate: (input) =>
    validateWithRecord(input, "Inventory movement", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "inventoryItemId", "Inventory item ID"),
      ...requiredString(record, "movementType", "Movement type"),
      ...optionalNumber(record, "quantity", "Quantity"),
      ...optionalString(record, "reason", "Reason"),
      ...optionalString(record, "adjustmentReason", "Adjustment reason"),
      ...optionalString(record, "status", "Movement status"),
      ...optionalString(record, "approvalStatus", "Approval status"),
      ...optionalString(record, "sourceModule", "Source module"),
      ...optionalString(record, "linkedEntityId", "Linked entity ID"),
      ...optionalString(record, "note", "Note"),
      ...optionalString(record, "adjustmentNote", "Adjustment note"),
      ...optionalString(record, "createdBy", "Created by"),
    ]),
};

export const purchaseOrderSchema: ValidationSchema = {
  name: "purchaseOrder",
  validate: (input) =>
    validateWithRecord(input, "Purchase order", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "poNumber", "PO number"),
      ...optionalString(record, "supplierId", "Supplier ID"),
      ...optionalString(record, "supplierName", "Supplier name"),
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "localRoId", "Local RO ID"),
      ...optionalString(record, "partsRequestId", "Parts request ID"),
      ...optionalString(record, "localPartsRequestId", "Local parts request ID"),
      ...optionalString(record, "status", "Status"),
      ...optionalIsoDate(record, "expectedDelivery", "Expected delivery"),
      ...optionalIsoDate(record, "expectedDeliveryDate", "Expected delivery date"),
      ...optionalJsonValue(record, "items", "Items"),
      ...optionalJsonValue(record, "poItems", "PO items"),
      ...optionalJsonValue(record, "receivingEvents", "Receiving events"),
      ...optionalNumber(record, "totalCost", "Total cost"),
      ...optionalNumber(record, "cost", "Cost"),
    ]),
};

export const supplierSchema: ValidationSchema = {
  name: "supplier",
  validate: (input) =>
    validateWithRecord(input, "Supplier", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...requiredString(record, "supplierName", "Supplier name"),
      ...optionalString(record, "contactPerson", "Contact person"),
      ...optionalString(record, "phone", "Phone"),
      ...optionalString(record, "email", "Email"),
      ...optionalString(record, "address", "Address"),
      ...optionalJsonValue(record, "brandsCarried", "Brands carried"),
      ...optionalJsonValue(record, "brands", "Brands"),
      ...optionalJsonValue(record, "categories", "Categories"),
      ...optionalJsonValue(record, "categoriesSupplied", "Categories supplied"),
      ...optionalBoolean(record, "active", "Active"),
      ...optionalString(record, "notes", "Notes"),
    ]),
};

export const paymentSchema: ValidationSchema = {
  name: "payment",
  validate: (input) =>
    validateWithRecord(input, "Payment", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "invoiceId", "Invoice ID"),
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "localRoId", "Local RO ID"),
      ...optionalString(record, "paymentNumber", "Payment number"),
      ...optionalString(record, "referenceNumber", "Reference number"),
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "method", "Method"),
      ...optionalString(record, "paymentMethod", "Payment method"),
      ...optionalString(record, "status", "Status"),
      ...optionalNumber(record, "amount", "Amount"),
      ...optionalIsoDate(record, "paidAt", "Paid date"),
      ...optionalIsoDate(record, "paymentDate", "Payment date"),
      ...optionalString(record, "accountingStatus", "Accounting status"),
    ]),
};

export const expenseSchema: ValidationSchema = {
  name: "expense",
  validate: (input) =>
    validateWithRecord(input, "Expense", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "expenseNumber", "Expense number"),
      ...optionalString(record, "category", "Category"),
      ...optionalString(record, "vendorName", "Vendor"),
      ...optionalString(record, "vendor", "Vendor"),
      ...optionalString(record, "payee", "Payee"),
      ...optionalString(record, "description", "Description"),
      ...optionalString(record, "note", "Note"),
      ...optionalNumber(record, "amount", "Amount"),
      ...optionalIsoDate(record, "incurredAt", "Incurred date"),
      ...optionalIsoDate(record, "expenseDate", "Expense date"),
      ...optionalIsoDate(record, "date", "Date"),
      ...optionalString(record, "status", "Status"),
      ...optionalString(record, "accountingStatus", "Accounting status"),
    ]),
};

export const invoiceSchema: ValidationSchema = {
  name: "invoice",
  validate: (input) =>
    validateWithRecord(input, "Invoice", (record) => [
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "invoiceNumber", "Invoice number"),
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "status", "Status"),
      ...optionalNumber(record, "subtotal", "Subtotal"),
      ...optionalNumber(record, "total", "Total"),
      ...optionalNumber(record, "balance", "Balance"),
      ...optionalIsoDate(record, "issuedAt", "Issued date"),
      ...optionalIsoDate(record, "dueAt", "Due date"),
      ...optionalString(record, "accountingStatus", "Accounting status"),
    ]),
};

export const documentAttachmentSchema: ValidationSchema = {
  name: "documentAttachment",
  validate: (input) =>
    validateWithRecord(input, "Document attachment", (record) => [
      ...optionalString(record, "fileName", "File name"),
      ...optionalString(record, "title", "Title"),
      ...optionalString(record, "localId", "Local ID"),
      ...optionalString(record, "fileType", "File type"),
      ...optionalNumber(record, "fileSize", "File size"),
      ...optionalString(record, "storageKey", "Storage key"),
      ...optionalString(record, "dataUrlHash", "Data URL hash"),
      ...optionalString(record, "uploadedById", "Uploaded by ID"),
      ...optionalString(record, "sourceModule", "Source module"),
      ...optionalString(record, "linkedEntityId", "Linked entity ID"),
      ...optionalString(record, "localLinkedEntityId", "Local linked entity ID"),
      ...optionalString(record, "linkedEntityLabel", "Linked entity label"),
      ...optionalString(record, "customerId", "Customer ID"),
      ...optionalString(record, "localCustomerId", "Local customer ID"),
      ...optionalString(record, "vehicleId", "Vehicle ID"),
      ...optionalString(record, "localVehicleId", "Local vehicle ID"),
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "localRoId", "Local RO ID"),
      ...optionalBoolean(record, "customerVisible", "Customer visible"),
      ...optionalBoolean(record, "internalOnly", "Internal only"),
      ...optionalString(record, "note", "Note"),
      ...optionalIsoDate(record, "uploadedAt", "Uploaded date"),
    ]),
};

export const validationSchemas: Record<string, ValidationSchema> = {
  customer: customerSchema,
  customerUpdate: customerUpdateSchema,
  vehicle: vehicleSchema,
  vehicleUpdate: vehicleUpdateSchema,
  intake: intakeSchema,
  inspection: inspectionSchema,
  qcRecord: qcRecordSchema,
  releaseRecord: releaseRecordSchema,
  backjobRecord: backjobRecordSchema,
  serviceHistoryRecord: serviceHistoryRecordSchema,
  invoice: invoiceSchema,
  repairOrder: repairOrderSchema,
  inventoryItem: inventoryItemSchema,
  inventoryMovement: inventoryMovementSchema,
  partsRequest: partsRequestSchema,
  payment: paymentSchema,
  purchaseOrder: purchaseOrderSchema,
  supplier: supplierSchema,
  expense: expenseSchema,
  documentAttachment: documentAttachmentSchema,
};
