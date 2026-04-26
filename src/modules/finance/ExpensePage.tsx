import React, { useMemo, useState } from "react";
import type {
  SessionUser,
  ExpenseRecord,
  ExpenseCategory,
  ExpensePaymentMethod,
  AuditLogRecord,
} from "../shared/types";
import { formatCurrency, parseMoneyInput, formatDateTime } from "../shared/helpers";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Parts & Supplies",
  "Utilities",
  "Rent",
  "Salaries",
  "Equipment",
  "Marketing",
  "Insurance",
  "Fuel",
  "Repairs & Maintenance",
  "Professional Services",
  "Other",
];

const EXPENSE_PAYMENT_METHODS: ExpensePaymentMethod[] = [
  "Cash",
  "Bank Transfer",
  "Check",
  "Credit Card",
  "GCash",
  "Maya",
  "Other",
];

function getDefaultForm(): Omit<ExpenseRecord, "id" | "expenseNumber" | "createdAt" | "createdBy"> {
  const today = new Date();
  return {
    date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    category: "Other",
    vendor: "",
    description: "",
    amount: "",
    paymentMethod: "Cash",
    referenceNumber: "",
    note: "",
  };
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: "16px", maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  title: { fontSize: 20, fontWeight: 700, color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  primaryBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  secondaryBtn: { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 14px", fontWeight: 500, cursor: "pointer", fontSize: 14 },
  dangerBtn: { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px", marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 12 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 },
  formGroup: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: "#475569" },
  input: { padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, color: "#0f172a", background: "#fff" },
  select: { padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, color: "#0f172a", background: "#fff" },
  textarea: { padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#0f172a", background: "#fff", resize: "vertical" as const, minHeight: 64 },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "8px 10px", background: "#f8fafc", textAlign: "left" as const, fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "8px 10px", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" as const },
  errorBox: { background: "#fee2e2", color: "#b91c1c", borderRadius: 6, padding: "8px 12px", fontSize: 13, marginBottom: 8 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 16 },
  statCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px", textAlign: "center" as const },
  statLabel: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 700, color: "#0f172a" },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 },
  emptyState: { textAlign: "center" as const, padding: "32px 0", color: "#94a3b8", fontSize: 14 },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, fontSize: 13, color: "#334155" },
};

export function ExpensePage({
  currentUser,
  expenses,
  setExpenses,
  onLogAudit,
}: {
  currentUser: SessionUser;
  expenses: ExpenseRecord[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseRecord[]>>;
  onLogAudit: (entry: Omit<AuditLogRecord, "id" | "timestamp">) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [form, setForm] = useState(getDefaultForm());
  const [error, setError] = useState("");
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "">("");

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchMonth = !filterMonth || e.date.startsWith(filterMonth);
      const matchCat = !filterCategory || e.category === filterCategory;
      return matchMonth && matchCat;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [expenses, filterMonth, filterCategory]);

  const totalFiltered = useMemo(() =>
    filtered.reduce((s, e) => s + parseMoneyInput(e.amount), 0), [filtered]);
  const selectedExpense = selectedExpenseId ? expenses.find((expense) => expense.id === selectedExpenseId) ?? null : null;

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((e) => {
      map.set(e.category, (map.get(e.category) ?? 0) + parseMoneyInput(e.amount));
    });
    return Array.from(map.entries())
      .map(([cat, total]) => ({ cat, total }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  function uid() {
    return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function openCreate() {
    setEditId(null);
    setForm(getDefaultForm());
    setError("");
    setShowForm(true);
  }

  function openEdit(expense: ExpenseRecord) {
    setEditId(expense.id);
    setForm({
      date: expense.date,
      category: expense.category,
      vendor: expense.vendor,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      referenceNumber: expense.referenceNumber,
      note: expense.note,
    });
    setError("");
    setShowForm(true);
  }

  function handleSave() {
    if (!form.date.trim()) { setError("Date is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    const amt = parseMoneyInput(form.amount);
    if (!form.amount.trim() || amt <= 0) { setError("Amount must be greater than 0."); return; }
    setError("");

    if (editId) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editId
            ? { ...e, ...form, updatedAt: new Date().toISOString(), updatedBy: currentUser.fullName }
            : e
        )
      );
      onLogAudit({ module: "Expenses", action: "expense_updated", entityId: editId, entityLabel: form.description, userId: currentUser.id, userName: currentUser.fullName, detail: `Updated expense: ${form.description}` });
    } else {
      const newExpense: ExpenseRecord = {
        id: uid(),
        expenseNumber: `EXP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(expenses.length + 1).padStart(3, "0")}`,
        ...form,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.fullName,
      };
      setExpenses((prev) => [newExpense, ...prev]);
      onLogAudit({ module: "Expenses", action: "expense_created", entityId: newExpense.id, entityLabel: newExpense.description, userId: currentUser.id, userName: currentUser.fullName, detail: `Created expense: ${newExpense.description} — ${formatCurrency(amt)}` });
    }
    setShowForm(false);
  }

  function handleDelete(expense: ExpenseRecord) {
    if (!window.confirm(`Delete expense "${expense.description}"?`)) return;
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
    onLogAudit({ module: "Expenses", action: "expense_deleted", entityId: expense.id, entityLabel: expense.description, userId: currentUser.id, userName: currentUser.fullName, detail: `Deleted expense: ${expense.description}` });
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Expense Tracking</div>
          <div style={styles.subtitle}>Record and review shop operating expenses</div>
        </div>
        <button style={styles.primaryBtn} onClick={openCreate}>+ New Expense</button>
      </div>

      {showForm && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>{editId ? "Edit Expense" : "New Expense"}</div>
          {error && <div style={styles.errorBox}>{error}</div>}
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date *</label>
              <input style={styles.input} type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category *</label>
              <select style={styles.select} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Vendor / Payee</label>
              <input style={styles.input} value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} placeholder="e.g. Puregold, Meralco" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description *</label>
              <input style={styles.input} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What was purchased/paid" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Amount (₱) *</label>
              <input style={styles.input} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Method</label>
              <select style={styles.select} value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as ExpensePaymentMethod }))}>
                {EXPENSE_PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Reference #</label>
              <input style={styles.input} value={form.referenceNumber} onChange={(e) => setForm((f) => ({ ...f, referenceNumber: e.target.value }))} placeholder="OR, receipt, check no." />
            </div>
            <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Note</label>
              <textarea style={styles.textarea} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Optional additional notes" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={styles.primaryBtn} onClick={handleSave}>{editId ? "Save Changes" : "Add Expense"}</button>
            <button style={styles.secondaryBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={styles.summaryGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total (filtered)</div>
          <div style={styles.statValue}>{formatCurrency(totalFiltered)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Entries</div>
          <div style={styles.statValue}>{filtered.length}</div>
        </div>
        {categoryBreakdown.slice(0, 3).map(({ cat, total }) => (
          <div key={cat} style={styles.statCard}>
            <div style={styles.statLabel}>{cat}</div>
            <div style={{ ...styles.statValue, fontSize: 16 }}>{formatCurrency(total)}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.filterRow}>
          <select style={styles.select} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="">All months</option>
            {monthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select style={styles.select} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | "")}>
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {categoryBreakdown.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>Category Breakdown</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {categoryBreakdown.map(({ cat, total }) => (
                <span key={cat} style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 4, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                  {cat}: {formatCurrency(total)}
                </span>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={styles.emptyState}>No expenses found. Click "+ New Expense" to add one.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Vendor</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Ref #</th>
                <th style={{ ...styles.th, textAlign: "right" as const }}>Amount</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense) => (
                <tr
                  key={expense.id}
                  data-testid={`expense-row-${expense.id}`}
                  style={{ cursor: "pointer", background: selectedExpenseId === expense.id ? "#eff6ff" : "transparent" }}
                  onClick={() => setSelectedExpenseId(expense.id)}
                >
                  <td style={styles.td}>{expense.date}</td>
                  <td style={styles.td}><span style={{ ...styles.badge, background: "#f1f5f9", color: "#334155" }}>{expense.category}</span></td>
                  <td style={styles.td}>{expense.vendor || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                  <td style={styles.td}>
                    <div>{expense.description}</div>
                    {expense.note && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{expense.note}</div>}
                  </td>
                  <td style={styles.td}>{expense.paymentMethod}</td>
                  <td style={styles.td}>{expense.referenceNumber || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                  <td style={{ ...styles.td, textAlign: "right" as const, fontWeight: 600, color: "#0f172a" }}>{formatCurrency(parseMoneyInput(expense.amount))}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={styles.secondaryBtn} onClick={() => openEdit(expense)}>Edit</button>
                      <button style={styles.dangerBtn} onClick={() => handleDelete(expense)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedExpense ? (
        <div style={styles.card} data-testid="expense-detail-panel">
          <div style={styles.cardTitle}>Expense Detail</div>
          <div style={styles.detailGrid}>
            <div><strong>{selectedExpense.description}</strong></div>
            <div>{selectedExpense.expenseNumber}</div>
            <div>{selectedExpense.date}</div>
            <div>{selectedExpense.vendor || "-"}</div>
            <div>{selectedExpense.category}</div>
            <div>{selectedExpense.paymentMethod}</div>
            <div>{selectedExpense.referenceNumber || "-"}</div>
            <div>{formatCurrency(parseMoneyInput(selectedExpense.amount))}</div>
            <div style={{ gridColumn: "1 / -1" }}>{selectedExpense.note || "No note provided."}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={styles.secondaryBtn} onClick={() => openEdit(selectedExpense)}>Edit Expense</button>
            <button style={styles.secondaryBtn} onClick={() => setSelectedExpenseId(null)}>Close Detail</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ExpensePage;
