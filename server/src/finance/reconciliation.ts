export type SettlementStatus = "Unpaid" | "Partial" | "Paid" | "Overpaid" | "Waived" | "Needs Review";

export type ReconciliationInvoice = {
  id: string;
  invoiceNumber?: string | null;
  repairOrderId?: string | null;
  status?: string | null;
  total?: number | string | null;
};

export type ReconciliationPayment = {
  id: string;
  invoiceId?: string | null;
  repairOrderId?: string | null;
  amount?: number | string | null;
  status?: string | null;
};

function money(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  return 0;
}

export function computeSettlementStatus(invoiceTotal: unknown, paidTotal: unknown, invoiceStatus?: string | null): SettlementStatus {
  const status = invoiceStatus?.toLowerCase() ?? "";
  if (status === "waived") return "Waived";
  const total = money(invoiceTotal);
  const paid = money(paidTotal);
  if (total <= 0) return "Needs Review";
  if (paid <= 0) return "Unpaid";
  if (paid < total) return "Partial";
  if (paid === total) return "Paid";
  return "Overpaid";
}

export function buildPaymentAllocationSummary(invoices: ReconciliationInvoice[], payments: ReconciliationPayment[]) {
  return invoices.map((invoice) => {
    const linkedPayments = payments.filter(
      (payment) => payment.invoiceId === invoice.id || (!payment.invoiceId && payment.repairOrderId && payment.repairOrderId === invoice.repairOrderId)
    );
    const paidTotal = linkedPayments.reduce((sum, payment) => sum + money(payment.amount), 0);
    const invoiceTotal = money(invoice.total);
    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber ?? null,
      repairOrderId: invoice.repairOrderId ?? null,
      invoiceTotal,
      totalPaid: paidTotal,
      balance: invoiceTotal - paidTotal,
      overpayment: Math.max(paidTotal - invoiceTotal, 0),
      settlementStatus: computeSettlementStatus(invoiceTotal, paidTotal, invoice.status),
      paymentCount: linkedPayments.length,
    };
  });
}
