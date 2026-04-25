import React, { useEffect, useMemo, useState } from "react";
import { generateAiDraft } from "../ai/aiHybridService";
import type { MaintenanceDashboardUpcomingItem } from "../maintenance/dashboardHelpers";
import type { RepairOrderRecord } from "../shared/types";
import { buildFollowUpCampaignItems, upsertCampaignRecord, type FollowUpCampaignRecord } from "./followUpCampaignHelpers";

type Props = {
  repairOrders: RepairOrderRecord[];
  upcomingItems: MaintenanceDashboardUpcomingItem[];
};

const STORAGE_KEY = "dvi_follow_up_campaign_records_v1";

function readRecords() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as FollowUpCampaignRecord[];
  } catch {
    return [];
  }
}

export function FollowUpCampaignCenter({ repairOrders, upcomingItems }: Props) {
  const [records, setRecords] = useState<FollowUpCampaignRecord[]>(() => (typeof window === "undefined" ? [] : readRecords()));
  const [draftingId, setDraftingId] = useState("");
  const items = useMemo(() => buildFollowUpCampaignItems({ repairOrders, upcomingItems, records }), [records, repairOrders, upcomingItems]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const draftCampaign = async (id: string) => {
    const item = items.find((row) => row.id === id);
    if (!item) return;
    setDraftingId(id);
    try {
      const result = await generateAiDraft(
        "followUpMessage",
        `${item.type}: ${item.customerName}, ${item.vehicleLabel}, ${item.plateNumber}. Reason: ${item.reason}`,
        { outputMode: "Short", moduleLabel: "follow-up campaigns", contextLabel: item.type, timeoutMs: 3000 }
      );
      setRecords((current) => upsertCampaignRecord(current, id, { draftText: result.text, status: "reviewed" }));
    } catch {
      setRecords((current) => upsertCampaignRecord(current, id, { draftText: `Hi ${item.customerName}, this is a friendly follow-up about your ${item.vehicleLabel}. ${item.reason}`, status: "reviewed" }));
    } finally {
      setDraftingId("");
    }
  };

  return (
    <section style={styles.panel} data-testid="follow-up-campaign-center">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Follow-Up Campaign Center</div>
          <h2 style={styles.title}>Advisor outreach queue</h2>
        </div>
        <span style={styles.badge}>{items.length} opportunities</span>
      </div>
      <div style={styles.grid}>
        {items.slice(0, 10).map((item) => (
          <div key={item.id} style={styles.card} data-testid={`campaign-item-${item.id}`}>
            <div style={styles.cardHeader}>
              <strong>{item.customerName}</strong>
              <span style={styles.badge}>{item.status}</span>
            </div>
            <div style={styles.meta}>{item.type} / {item.vehicleLabel} / {item.plateNumber}</div>
            <div style={styles.reason}>{item.reason}</div>
            {item.draftText ? <textarea style={styles.textarea} value={item.draftText} readOnly data-testid={`campaign-draft-${item.id}`} /> : null}
            <div style={styles.actions}>
              <button type="button" style={styles.button} onClick={() => draftCampaign(item.id)} disabled={draftingId === item.id} data-testid={`campaign-draft-action-${item.id}`}>
                {draftingId === item.id ? "Drafting..." : "Draft with AI"}
              </button>
              <button type="button" style={styles.button} onClick={() => setRecords((current) => upsertCampaignRecord(current, item.id, { status: "send-ready" }))}>
                Mark Send-Ready
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? <div style={styles.empty}>No campaign opportunities right now.</div> : null}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  badge: { borderRadius: 999, background: "#e2e8f0", color: "#334155", padding: "5px 10px", fontSize: 12, fontWeight: 800 },
  grid: { display: "grid", gap: 10 },
  card: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10 },
  meta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  reason: { color: "#334155", fontSize: 13, marginTop: 8 },
  textarea: { width: "100%", minHeight: 70, marginTop: 8, border: "1px solid #cbd5e1", borderRadius: 6, padding: 8 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },
  button: { border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", padding: "8px 10px", fontWeight: 700, cursor: "pointer" },
  empty: { color: "#64748b", fontSize: 13 },
};
