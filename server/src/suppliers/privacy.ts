import type { BackendRequestUser } from "../middleware/auth.js";

export type SupplierVisibilityContext = {
  user?: BackendRequestUser | null;
  supplierId?: string | null;
  audience?: "internal" | "supplier" | "customer";
};

export function canViewSupplierBid(context: SupplierVisibilityContext, bid: Record<string, unknown>): boolean {
  if (context.audience === "customer") return false;
  if (context.user?.role === "Admin" || context.user?.role === "Manager" || context.user?.permissions.includes("supplier.manage")) return true;
  if (context.audience === "supplier") {
    const bidSupplierId = typeof bid.supplierId === "string" ? bid.supplierId : typeof bid.supplierName === "string" ? bid.supplierName : "";
    return Boolean(context.supplierId && bidSupplierId && context.supplierId === bidSupplierId);
  }
  return false;
}

export function canManageSupplierBid(context: SupplierVisibilityContext, bid: Record<string, unknown>): boolean {
  if (context.audience === "customer") return false;
  if (context.user?.role === "Admin" || context.user?.role === "Manager" || context.user?.permissions.includes("supplier.manage")) return true;
  if (context.audience === "supplier") {
    const bidSupplierId = typeof bid.supplierId === "string" ? bid.supplierId : typeof bid.supplierName === "string" ? bid.supplierName : "";
    return Boolean(context.supplierId && bidSupplierId && context.supplierId === bidSupplierId);
  }
  return false;
}

export function getVisibleSupplierBids(context: SupplierVisibilityContext, bids: unknown): Record<string, unknown>[] {
  if (!Array.isArray(bids)) return [];
  return bids
    .filter((bid): bid is Record<string, unknown> => Boolean(bid) && typeof bid === "object" && !Array.isArray(bid))
    .filter((bid) => canViewSupplierBid(context, bid))
    .map((bid) =>
      context.audience === "supplier"
        ? Object.fromEntries(
            Object.entries(bid).filter(([key]) => !["competitorNotes", "internalCost", "unitCost", "cost", "margin", "marginPercent"].includes(key)),
          )
        : bid
    );
}
