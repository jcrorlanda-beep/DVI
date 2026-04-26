import type { PartsRequestRecord, SupplierBid } from "../shared/types";

export type SupplierVisibilityContext = {
  viewerType: "internal" | "supplier" | "customer";
  supplierName?: string;
};

function normalizeName(value: string | undefined) {
  return value?.trim().toLowerCase() || "";
}

export function isSupplierAssignedToRequest(request: PartsRequestRecord, supplierName: string) {
  const target = normalizeName(supplierName);
  if (!target) return false;
  const recipients = Array.isArray(request.supplierRecipients) ? request.supplierRecipients : [];
  if (recipients.some((recipient) => normalizeName(recipient) === target)) return true;
  const selectedBid = request.bids.find((bid) => bid.id === request.selectedBidId) ?? null;
  return !!selectedBid && normalizeName(selectedBid.supplierName) === target;
}

export function canViewSupplierBid(
  request: PartsRequestRecord,
  bid: SupplierBid,
  context: SupplierVisibilityContext
) {
  if (context.viewerType === "customer") return false;
  if (context.viewerType === "internal") return true;
  const supplierName = normalizeName(context.supplierName);
  if (!supplierName) return false;
  if (normalizeName(bid.supplierName) !== supplierName) return false;
  return isSupplierAssignedToRequest(request, supplierName);
}

export function canManageSupplierBid(
  request: PartsRequestRecord,
  bid: SupplierBid,
  context: SupplierVisibilityContext
) {
  if (context.viewerType === "internal") return true;
  if (context.viewerType !== "supplier") return false;
  return canViewSupplierBid(request, bid, context);
}

export function getVisibleBidsForContext(
  request: PartsRequestRecord,
  bids: SupplierBid[],
  context: SupplierVisibilityContext
) {
  return bids.filter((bid) => canViewSupplierBid(request, bid, context));
}
