import React, { useMemo, useState } from "react";
import type { RepairOrderRecord, ServicePricingCatalogRecord } from "../shared/types";

type Props = {
  repairOrders: RepairOrderRecord[];
  servicePricingCatalog: ServicePricingCatalogRecord[];
  isCompactLayout: boolean;
};

function parseAmount(value?: string) {
  const amount = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}

function serviceKeyFor(title: string) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function vehicleLabel(ro: RepairOrderRecord) {
  return [ro.year, ro.make, ro.model].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Vehicle";
}

export function EstimateBuilderPanel({ repairOrders, servicePricingCatalog, isCompactLayout }: Props) {
  const estimateRos = repairOrders.filter((ro) => !["Released", "Closed"].includes(ro.status) && ro.workLines.length > 0);
  const [selectedRoId, setSelectedRoId] = useState(() => estimateRos[0]?.id ?? "");
  const selectedRo = estimateRos.find((ro) => ro.id === selectedRoId) ?? estimateRos[0] ?? null;

  const estimateRows = useMemo(() => {
    if (!selectedRo) return [];
    return selectedRo.workLines.map((line) => {
      const key = line.serviceKey || serviceKeyFor(line.title);
      const pricing = servicePricingCatalog.find((row) => row.active && row.serviceKey === key);
      const currentLabor = parseAmount(line.serviceEstimate);
      const currentParts = parseAmount(line.partsEstimate);
      const currentTotal = parseAmount(line.totalEstimate) || currentLabor + currentParts;
      const suggestedPrice = pricing ? parseAmount(pricing.basePrice) : 0;
      return {
        line,
        key,
        pricing,
        currentLabor,
        currentParts,
        currentTotal,
        suggestedPrice,
        variance: suggestedPrice > 0 ? currentTotal - suggestedPrice : 0,
      };
    });
  }, [selectedRo, servicePricingCatalog]);

  const totals = estimateRows.reduce(
    (acc, row) => ({
      labor: acc.labor + row.currentLabor,
      parts: acc.parts + row.currentParts,
      total: acc.total + row.currentTotal,
      suggested: acc.suggested + row.suggestedPrice,
    }),
    { labor: 0, parts: 0, total: 0, suggested: 0 }
  );

  return (
    <section style={styles.panel} data-testid="estimate-builder-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Estimate Builder Upgrade</div>
          <h2 style={styles.title}>Estimate preview</h2>
          <div style={styles.subtitle}>Read-only estimate rollup with pricing-catalog suggestions. Manual override remains in the RO workflow.</div>
        </div>
        <span style={styles.badge}>Suggested only</span>
      </div>

      <div style={{ ...styles.toolbar, gridTemplateColumns: isCompactLayout ? "1fr" : "minmax(260px, 1fr) repeat(4, minmax(120px, 160px))" }}>
        <label style={styles.label}>
          Repair Order
          <select data-testid="estimate-builder-ro-select" style={styles.input} value={selectedRo?.id ?? ""} onChange={(event) => setSelectedRoId(event.target.value)}>
            {estimateRos.map((ro) => (
              <option key={ro.id} value={ro.id}>{ro.roNumber} / {vehicleLabel(ro)}</option>
            ))}
          </select>
        </label>
        <div style={styles.stat}><span>Labor</span><strong>{money(totals.labor)}</strong></div>
        <div style={styles.stat}><span>Parts</span><strong>{money(totals.parts)}</strong></div>
        <div style={styles.stat}><span>Total</span><strong>{money(totals.total)}</strong></div>
        <div style={styles.stat}><span>Catalog</span><strong>{money(totals.suggested)}</strong></div>
      </div>

      {!selectedRo ? (
        <div style={styles.empty}>No active repair order with work lines is available for estimate preview.</div>
      ) : (
        <div style={styles.rows}>
          {estimateRows.map((row) => (
            <article key={row.line.id} style={styles.row} data-testid={`estimate-builder-line-${row.line.id}`}>
              <div>
                <strong>{row.line.title || "Untitled service"}</strong>
                <div style={styles.meta}>{row.line.category} / {row.key}</div>
                <div style={styles.meta}>{row.pricing ? `Catalog match: ${row.pricing.title}` : "No active catalog price matched."}</div>
              </div>
              <div style={styles.amounts}>
                <span>Labor {money(row.currentLabor)}</span>
                <span>Parts {money(row.currentParts)}</span>
                <strong>Line total {money(row.currentTotal)}</strong>
                {row.suggestedPrice > 0 ? <span style={styles.suggestion}>Suggested {money(row.suggestedPrice)} / variance {money(row.variance)}</span> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 4 },
  badge: { borderRadius: 999, padding: "6px 10px", background: "#ecfeff", color: "#0e7490", fontSize: 12, fontWeight: 800 },
  toolbar: { display: "grid", gap: 10, marginBottom: 12 },
  label: { display: "grid", gap: 6, color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase" },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px", background: "#fff", color: "#0f172a", textTransform: "none", fontWeight: 600 },
  stat: { display: "grid", gap: 3, border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc", color: "#64748b", fontSize: 12 },
  rows: { display: "grid", gap: 8 },
  row: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#fff" },
  meta: { color: "#64748b", fontSize: 12, marginTop: 3 },
  amounts: { display: "grid", gap: 3, textAlign: "right", color: "#475569", fontSize: 12 },
  suggestion: { color: "#0e7490", fontWeight: 800 },
  empty: { border: "1px dashed #cbd5e1", borderRadius: 8, padding: 16, color: "#64748b", background: "#f8fafc" },
};
