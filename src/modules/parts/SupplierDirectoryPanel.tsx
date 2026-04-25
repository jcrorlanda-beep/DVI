import React, { useEffect, useMemo, useState } from "react";
import type { PartsRequestRecord } from "../shared/types";

type Props = {
  partsRequests: PartsRequestRecord[];
  isCompactLayout: boolean;
};

type SupplierProfileRecord = {
  id: string;
  supplierName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  brandsCarried: string;
  categoriesSupplied: string;
  paymentTermsNote: string;
  deliveryTermsNote: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "dvi_supplier_directory_v1";

function readDirectory() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as SupplierProfileRecord[];
  } catch {
    return [];
  }
}

function uid() {
  return `supplier_${Math.random().toString(36).slice(2, 10)}`;
}

function blankSupplier(): SupplierProfileRecord {
  const now = new Date().toISOString();
  return {
    id: "",
    supplierName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    brandsCarried: "",
    categoriesSupplied: "",
    paymentTermsNote: "",
    deliveryTermsNote: "",
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}

function supplierStats(name: string, partsRequests: PartsRequestRecord[]) {
  const normalized = name.trim().toLowerCase();
  const bids = partsRequests.flatMap((request) => request.bids.map((bid) => ({ request, bid }))).filter(({ bid }) => bid.supplierName.trim().toLowerCase() === normalized);
  const awarded = bids.filter(({ request, bid }) => request.selectedBidId === bid.id);
  const brands = Array.from(new Set(bids.map(({ bid }) => bid.brand).filter(Boolean))).slice(0, 4);
  return {
    bidsSubmitted: bids.length,
    awardedBids: awarded.length,
    recentRequests: bids.slice(0, 3).map(({ request }) => request.requestNumber),
    brands,
    deliveryNotes: bids.map(({ bid }) => bid.deliveryTime).filter(Boolean).slice(0, 2),
  };
}

export function SupplierDirectoryPanel({ partsRequests, isCompactLayout }: Props) {
  const [profiles, setProfiles] = useState<SupplierProfileRecord[]>(() => readDirectory());
  const [form, setForm] = useState<SupplierProfileRecord>(() => blankSupplier());
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  const supplierNamesFromBids = useMemo(
    () => Array.from(new Set(partsRequests.flatMap((request) => request.bids.map((bid) => bid.supplierName)).filter(Boolean))).sort(),
    [partsRequests]
  );

  const visibleProfiles = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return profiles
      .filter((profile) =>
        !term
          ? true
          : [profile.supplierName, profile.brandsCarried, profile.categoriesSupplied, profile.contactPerson]
              .join(" ")
              .toLowerCase()
              .includes(term)
      )
      .sort((a, b) => a.supplierName.localeCompare(b.supplierName));
  }, [filter, profiles]);

  const saveSupplier = () => {
    const name = form.supplierName.trim();
    if (!name) return;
    const now = new Date().toISOString();
    if (editingId) {
      setProfiles((current) => current.map((profile) => profile.id === editingId ? { ...form, supplierName: name, updatedAt: now } : profile));
    } else {
      setProfiles((current) => [{ ...form, id: uid(), supplierName: name, createdAt: now, updatedAt: now }, ...current]);
    }
    setForm(blankSupplier());
    setEditingId("");
  };

  const editSupplier = (profile: SupplierProfileRecord) => {
    setForm(profile);
    setEditingId(profile.id);
  };

  const toggleSupplier = (profile: SupplierProfileRecord) => {
    setProfiles((current) => current.map((row) => row.id === profile.id ? { ...row, active: !row.active, updatedAt: new Date().toISOString() } : row));
  };

  const seedFromBidName = (name: string) => {
    setForm((prev) => ({ ...prev, supplierName: name }));
  };

  return (
    <section style={styles.panel} data-testid="supplier-directory-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Vendor / Supplier Directory</div>
          <h2 style={styles.title}>Supplier profiles</h2>
          <div style={styles.subtitle}>Internal supplier profiles with activity summaries from current parts requests and awarded bids.</div>
        </div>
        <span style={styles.badge}>{profiles.length} supplier profile(s)</span>
      </div>

      <div style={{ ...styles.formGrid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(4, minmax(0, 1fr))" }}>
        <input data-testid="supplier-directory-name" style={styles.input} placeholder="Supplier name" value={form.supplierName} onChange={(event) => setForm((prev) => ({ ...prev, supplierName: event.target.value }))} />
        <input data-testid="supplier-directory-contact" style={styles.input} placeholder="Contact person" value={form.contactPerson} onChange={(event) => setForm((prev) => ({ ...prev, contactPerson: event.target.value }))} />
        <input data-testid="supplier-directory-phone" style={styles.input} placeholder="Phone" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
        <input data-testid="supplier-directory-email" style={styles.input} placeholder="Email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
        <input style={styles.input} placeholder="Address" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
        <input data-testid="supplier-directory-brands" style={styles.input} placeholder="Brands carried" value={form.brandsCarried} onChange={(event) => setForm((prev) => ({ ...prev, brandsCarried: event.target.value }))} />
        <input data-testid="supplier-directory-categories" style={styles.input} placeholder="Categories supplied" value={form.categoriesSupplied} onChange={(event) => setForm((prev) => ({ ...prev, categoriesSupplied: event.target.value }))} />
        <label style={styles.checkLabel}><input type="checkbox" checked={form.active} onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))} /> Active</label>
        <input style={styles.input} placeholder="Payment terms note" value={form.paymentTermsNote} onChange={(event) => setForm((prev) => ({ ...prev, paymentTermsNote: event.target.value }))} />
        <input style={styles.input} placeholder="Delivery terms note" value={form.deliveryTermsNote} onChange={(event) => setForm((prev) => ({ ...prev, deliveryTermsNote: event.target.value }))} />
        <input data-testid="supplier-directory-filter" style={styles.input} placeholder="Filter by brand/category/name" value={filter} onChange={(event) => setFilter(event.target.value)} />
        <button type="button" data-testid="supplier-directory-save" style={styles.button} onClick={saveSupplier}>{editingId ? "Save Supplier" : "Create Supplier"}</button>
      </div>

      {supplierNamesFromBids.length ? (
        <div style={styles.seedRow}>
          <span style={styles.meta}>Known bid suppliers:</span>
          {supplierNamesFromBids.slice(0, 8).map((name) => (
            <button key={name} type="button" style={styles.linkButton} onClick={() => seedFromBidName(name)}>{name}</button>
          ))}
        </div>
      ) : null}

      <div style={styles.list}>
        {visibleProfiles.map((profile) => {
          const stats = supplierStats(profile.supplierName, partsRequests);
          return (
            <article key={profile.id} style={styles.card} data-testid={`supplier-directory-row-${profile.id}`}>
              <div style={styles.cardHeader}>
                <strong>{profile.supplierName}</strong>
                <span style={profile.active ? styles.active : styles.inactive}>{profile.active ? "Active" : "Inactive"}</span>
              </div>
              <div style={styles.meta}>{profile.contactPerson || "No contact"} / {profile.phone || "-"} / {profile.email || "-"}</div>
              <div style={styles.meta}>Brands: {profile.brandsCarried || stats.brands.join(", ") || "-"}</div>
              <div style={styles.meta}>Categories: {profile.categoriesSupplied || "-"}</div>
              <div style={styles.summary} data-testid={`supplier-directory-summary-${profile.id}`}>
                Bids {stats.bidsSubmitted} / Awarded {stats.awardedBids} / Recent POs or requests {stats.recentRequests.join(", ") || "-"}
              </div>
              <div style={styles.actions}>
                <button type="button" style={styles.secondaryButton} onClick={() => editSupplier(profile)}>Edit</button>
                <button type="button" style={styles.secondaryButton} onClick={() => toggleSupplier(profile)}>{profile.active ? "Mark Inactive" : "Mark Active"}</button>
              </div>
            </article>
          );
        })}
        {visibleProfiles.length === 0 ? <div style={styles.empty}>No supplier profiles found.</div> : null}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 4 },
  badge: { borderRadius: 999, padding: "5px 9px", background: "#f1f5f9", color: "#334155", fontSize: 12, fontWeight: 800 },
  formGrid: { display: "grid", gap: 8, marginBottom: 10 },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px", background: "#fff", color: "#0f172a" },
  checkLabel: { display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 700 },
  button: { border: "none", borderRadius: 8, padding: "9px 12px", background: "#2563eb", color: "#fff", fontWeight: 800, cursor: "pointer" },
  seedRow: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 },
  linkButton: { border: "1px solid #cbd5e1", borderRadius: 999, padding: "6px 10px", background: "#fff", color: "#334155", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  list: { display: "grid", gap: 8 },
  card: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  active: { borderRadius: 999, padding: "4px 8px", background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 800 },
  inactive: { borderRadius: 999, padding: "4px 8px", background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 800 },
  meta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  summary: { color: "#334155", fontSize: 12, fontWeight: 800, marginTop: 8 },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  secondaryButton: { border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", background: "#fff", color: "#334155", fontWeight: 700, cursor: "pointer" },
  empty: { border: "1px dashed #cbd5e1", borderRadius: 8, padding: 16, color: "#64748b", background: "#f8fafc" },
};
