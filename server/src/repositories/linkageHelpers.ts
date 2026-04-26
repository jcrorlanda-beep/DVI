import type { PrismaClientLike } from "../db/prisma.js";

type Delegate = Record<string, any> | undefined;

export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function findFirst(delegate: Delegate, where: Record<string, unknown>) {
  return delegate?.findFirst ? delegate.findFirst({ where }) : null;
}

async function findUnique(delegate: Delegate, where: Record<string, unknown>) {
  return delegate?.findUnique ? delegate.findUnique({ where }) : null;
}

export async function resolveRepairOrderReference(client: PrismaClientLike, data: Record<string, unknown>) {
  const delegate = client.repairOrder as Delegate;
  const localId = text(data.localRoId) || text(data.localRepairOrderId);
  const repairOrderNumber = text(data.repairOrderNumber) || text(data.roNumber) || text(data.ro);
  if (text(data.repairOrderId)) return null;
  if (localId) return findUnique(delegate, { localId });
  if (repairOrderNumber) return findUnique(delegate, { repairOrderNumber });
  return null;
}

export async function resolveVehicleReference(client: PrismaClientLike, data: Record<string, unknown>) {
  const delegate = client.vehicle as Delegate;
  const localId = text(data.localVehicleId);
  const plateNumber = text(data.plateNumber) || text(data.plate);
  const conductionNumber = text(data.conductionNumber);
  if (text(data.vehicleId)) return null;
  if (localId) return findUnique(delegate, { localId });
  if (plateNumber || conductionNumber) {
    return findFirst(delegate, {
      OR: [
        ...(plateNumber ? [{ plateNumber: { equals: plateNumber, mode: "insensitive" } }] : []),
        ...(conductionNumber ? [{ conductionNumber: { equals: conductionNumber, mode: "insensitive" } }] : []),
      ],
    });
  }
  return null;
}

export async function resolveSupplierReference(client: PrismaClientLike, data: Record<string, unknown>) {
  const delegate = client.supplier as Delegate;
  const localId = text(data.localSupplierId);
  const supplierName = text(data.supplierName) || text(data.selectedSupplier) || text(data.vendorName) || text(data.vendor);
  if (text(data.supplierId)) return null;
  if (localId) return findUnique(delegate, { localId });
  if (supplierName) return findFirst(delegate, { supplierName: { equals: supplierName, mode: "insensitive" } });
  return null;
}

export async function resolvePartsRequestReference(client: PrismaClientLike, data: Record<string, unknown>) {
  const delegate = client.partsRequest as Delegate;
  const localId = text(data.localPartsRequestId) || text(data.localRequestId);
  const requestNumber = text(data.partsRequestNumber) || text(data.requestNumber);
  if (text(data.partsRequestId)) return null;
  if (localId) return findUnique(delegate, { localId });
  if (requestNumber) return findUnique(delegate, { requestNumber });
  return null;
}

export async function resolveInvoiceReference(client: PrismaClientLike, data: Record<string, unknown>) {
  const delegate = client.invoice as Delegate;
  const localId = text(data.localInvoiceId);
  const invoiceNumber = text(data.invoiceNumber);
  if (text(data.invoiceId)) return null;
  if (localId) return findUnique(delegate, { localId });
  if (invoiceNumber) return findUnique(delegate, { invoiceNumber });
  return null;
}

export async function resolveCustomerReference(client: PrismaClientLike, data: Record<string, unknown>) {
  const delegate = client.customer as Delegate;
  const localId = text(data.localCustomerId);
  const customerName = text(data.customerName);
  if (text(data.customerId)) return null;
  if (localId) return findUnique(delegate, { localId });
  if (customerName) return findFirst(delegate, { customerName: { equals: customerName, mode: "insensitive" } });
  return null;
}
