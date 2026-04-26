type AmountRecord = Record<string, unknown>;

function amount(record: AmountRecord, keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }
  return 0;
}

function groupByAmount(records: AmountRecord[], key: string, amountKeys: string[]) {
  const totals = new Map<string, number>();
  for (const record of records) {
    const label = typeof record[key] === "string" && record[key].trim() ? record[key].trim() : "Uncategorized";
    totals.set(label, (totals.get(label) ?? 0) + amount(record, amountKeys));
  }
  return Array.from(totals.entries()).map(([label, total]) => ({ label, total }));
}

export function buildManagementProfitReport(input: {
  invoices?: AmountRecord[];
  payments?: AmountRecord[];
  expenses?: AmountRecord[];
}) {
  const invoices = input.invoices ?? [];
  const payments = input.payments ?? [];
  const expenses = input.expenses ?? [];
  const totalRevenue = invoices.reduce((sum, invoice) => sum + amount(invoice, ["total", "amount"]), 0);
  const totalCollectedPayments = payments.reduce((sum, payment) => sum + amount(payment, ["amount", "total"]), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + amount(expense, ["amount", "total"]), 0);
  return {
    reportType: "management-estimate",
    totalRevenue,
    totalCollectedPayments,
    totalExpenses,
    estimatedProfit: totalRevenue - totalExpenses,
    cashStyleNet: totalCollectedPayments - totalExpenses,
    expenseCategoryBreakdown: groupByAmount(expenses, "category", ["amount", "total"]),
    revenueCategoryBreakdown: groupByAmount(invoices, "status", ["total", "amount"]),
    warning: "Management estimate only. Not an official accounting or tax report.",
  };
}
