import {
  makeResult,
  optionalBoolean,
  optionalIsoDate,
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
      ...requiredString(record, "customerName", "Customer name"),
      ...optionalString(record, "companyName", "Company name"),
      ...optionalString(record, "phone", "Phone"),
      ...optionalString(record, "email", "Email"),
      ...optionalString(record, "accountType", "Account type"),
    ]),
};

export const customerUpdateSchema: ValidationSchema = {
  name: "customerUpdate",
  validate: (input) =>
    validateWithRecord(input, "Customer update", (record) => [
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "companyName", "Company name"),
      ...optionalString(record, "phone", "Phone"),
      ...optionalString(record, "email", "Email"),
      ...optionalString(record, "accountType", "Account type"),
      ...optionalString(record, "notes", "Notes"),
    ]),
};

export const vehicleSchema: ValidationSchema = {
  name: "vehicle",
  validate: (input) =>
    validateWithRecord(input, "Vehicle", (record) => [
      ...optionalString(record, "customerId", "Customer ID"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "conductionNumber", "Conduction number"),
      ...optionalString(record, "make", "Make"),
      ...optionalString(record, "model", "Model"),
      ...optionalString(record, "year", "Year"),
      ...optionalNumber(record, "mileage", "Mileage"),
    ]),
};

export const vehicleUpdateSchema: ValidationSchema = {
  name: "vehicleUpdate",
  validate: (input) =>
    validateWithRecord(input, "Vehicle update", (record) => [
      ...optionalString(record, "customerId", "Customer ID"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "conductionNumber", "Conduction number"),
      ...optionalString(record, "make", "Make"),
      ...optionalString(record, "model", "Model"),
      ...optionalString(record, "year", "Year"),
      ...optionalString(record, "color", "Color"),
      ...optionalNumber(record, "mileage", "Mileage"),
      ...optionalString(record, "notes", "Notes"),
    ]),
};

export const repairOrderSchema: ValidationSchema = {
  name: "repairOrder",
  validate: (input) =>
    validateWithRecord(input, "Repair order", (record) => [
      ...optionalString(record, "repairOrderNumber", "RO number"),
      ...optionalString(record, "customerName", "Customer name"),
      ...optionalString(record, "plateNumber", "Plate number"),
      ...optionalString(record, "status", "Status"),
      ...optionalNumber(record, "odometer", "Odometer"),
      ...optionalIsoDate(record, "openedAt", "Opened date"),
      ...optionalIsoDate(record, "completedAt", "Completed date"),
    ]),
};

export const inventoryItemSchema: ValidationSchema = {
  name: "inventoryItem",
  validate: (input) =>
    validateWithRecord(input, "Inventory item", (record) => [
      ...requiredString(record, "itemName", "Item name"),
      ...optionalString(record, "sku", "SKU"),
      ...optionalString(record, "partNumber", "Part number"),
      ...optionalString(record, "category", "Category"),
      ...optionalString(record, "brand", "Brand"),
      ...optionalNumber(record, "quantityOnHand", "Quantity on hand"),
      ...optionalNumber(record, "reorderLevel", "Reorder level"),
      ...optionalNumber(record, "unitCost", "Unit cost"),
      ...optionalNumber(record, "sellingPrice", "Selling price"),
      ...optionalBoolean(record, "active", "Active"),
    ]),
};

export const paymentSchema: ValidationSchema = {
  name: "payment",
  validate: (input) =>
    validateWithRecord(input, "Payment", (record) => [
      ...optionalString(record, "repairOrderId", "Repair order ID"),
      ...optionalString(record, "paymentNumber", "Payment number"),
      ...optionalString(record, "method", "Method"),
      ...optionalString(record, "status", "Status"),
      ...optionalNumber(record, "amount", "Amount"),
      ...optionalIsoDate(record, "paidAt", "Paid date"),
    ]),
};

export const expenseSchema: ValidationSchema = {
  name: "expense",
  validate: (input) =>
    validateWithRecord(input, "Expense", (record) => [
      ...optionalString(record, "expenseNumber", "Expense number"),
      ...optionalString(record, "category", "Category"),
      ...optionalString(record, "vendorName", "Vendor"),
      ...optionalString(record, "description", "Description"),
      ...optionalNumber(record, "amount", "Amount"),
      ...optionalIsoDate(record, "incurredAt", "Incurred date"),
      ...optionalString(record, "status", "Status"),
    ]),
};

export const documentAttachmentSchema: ValidationSchema = {
  name: "documentAttachment",
  validate: (input) =>
    validateWithRecord(input, "Document attachment", (record) => [
      ...requiredString(record, "fileName", "File name"),
      ...optionalString(record, "fileType", "File type"),
      ...optionalNumber(record, "fileSize", "File size"),
      ...optionalString(record, "sourceModule", "Source module"),
      ...optionalString(record, "linkedEntityId", "Linked entity ID"),
      ...optionalString(record, "linkedEntityLabel", "Linked entity label"),
      ...optionalBoolean(record, "customerVisible", "Customer visible"),
      ...optionalIsoDate(record, "uploadedAt", "Uploaded date"),
    ]),
};

export const validationSchemas: Record<string, ValidationSchema> = {
  customer: customerSchema,
  customerUpdate: customerUpdateSchema,
  vehicle: vehicleSchema,
  vehicleUpdate: vehicleUpdateSchema,
  repairOrder: repairOrderSchema,
  inventoryItem: inventoryItemSchema,
  payment: paymentSchema,
  expense: expenseSchema,
  documentAttachment: documentAttachmentSchema,
};
