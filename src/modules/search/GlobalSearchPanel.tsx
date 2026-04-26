import React from "react";
import type { ViewKey } from "../shared/types";
import { buildGlobalSearchViewModel, type GlobalSearchItem } from "./globalSearchHelpers";

const styles: Record<string, React.CSSProperties> = {
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 },
  title: { fontSize: 16, fontWeight: 700, color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  inputRow: { display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 10 },
  input: { padding: "9px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, flex: 1, minWidth: 220 },
  group: { marginTop: 14 },
  groupTitle: { fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 },
  result: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, marginBottom: 8, background: "#f8fafc", textAlign: "left" as const, cursor: "pointer", width: "100%" },
  resultTitle: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  resultMeta: { fontSize: 11, color: "#64748b", marginTop: 2 },
  resultDetail: { fontSize: 12, color: "#334155", marginTop: 6 },
  empty: { padding: "18px 0", color: "#94a3b8", fontSize: 13 },
  pill: { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "#e2e8f0", color: "#334155", fontSize: 11, fontWeight: 600, marginLeft: 8 },
};

type SearchData = {
  bookings: Array<Record<string, unknown>>;
  intakeRecords: Array<Record<string, unknown>>;
  inspectionRecords: Array<Record<string, unknown>>;
  repairOrders: Array<Record<string, unknown>>;
  partsRequests: Array<Record<string, unknown>>;
  serviceHistoryRecords: Array<Record<string, unknown>>;
  customerAccounts: Array<Record<string, unknown>>;
  supplierProfiles: Array<Record<string, unknown>>;
};

export function GlobalSearchPanel({
  data,
  onOpenView,
}: {
  data: SearchData;
  onOpenView: (view: ViewKey) => void;
}) {
  const [query, setQuery] = React.useState("");

  const viewModel = React.useMemo(
    () =>
      buildGlobalSearchViewModel({
        query,
        bookings: data.bookings as never[],
        intakeRecords: data.intakeRecords as never[],
        inspectionRecords: data.inspectionRecords as never[],
        repairOrders: data.repairOrders as never[],
        partsRequests: data.partsRequests as never[],
        serviceHistoryRecords: data.serviceHistoryRecords as never[],
        customerAccounts: data.customerAccounts as never[],
        supplierProfiles: data.supplierProfiles as never[],
      }),
    [data.bookings, data.customerAccounts, data.inspectionRecords, data.intakeRecords, data.partsRequests, data.repairOrders, data.serviceHistoryRecords, data.supplierProfiles, query]
  );

  const handleOpen = (item: GlobalSearchItem) => {
    if (item.view) {
      onOpenView(item.view);
    }
  };

  return (
    <section style={styles.card} data-testid="global-search-panel">
      <div style={styles.title}>Global Search</div>
      <div style={styles.subtitle}>Search customers, vehicles, work records, parts, service history, and suppliers.</div>
      <div style={styles.inputRow}>
        <input
          data-testid="global-search-input"
          style={styles.input}
          placeholder="Search plate, RO, customer, supplier, request, or service"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span style={styles.pill}>{viewModel.totalResults} result(s)</span>
      </div>

      {!query.trim() ? (
        <div style={styles.empty}>Type a plate number, RO number, or supplier name to begin.</div>
      ) : viewModel.groups.length === 0 ? (
        <div style={styles.empty} data-testid="global-search-empty">No results found.</div>
      ) : (
        viewModel.groups.map((group) => (
          <div key={group.group} style={styles.group} data-testid={`global-search-group-${group.group.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}>
            <div style={styles.groupTitle}>{group.group}</div>
            {group.items.map((item) => (
              <button key={item.id} type="button" style={styles.result} data-testid={`global-search-result-${item.id}`} onClick={() => handleOpen(item)}>
                <div style={styles.resultTitle}>{item.title}</div>
                <div style={styles.resultMeta}>{item.subtitle}</div>
                <div style={styles.resultDetail}>{item.detail}</div>
              </button>
            ))}
          </div>
        ))
      )}
    </section>
  );
}
