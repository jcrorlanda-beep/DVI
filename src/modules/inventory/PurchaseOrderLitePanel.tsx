import React, { useEffect, useMemo, useState } from "react";
import type { PartsRequestRecord, SessionUser } from "../shared/types";
import {
  readInventoryItems,
  readInventoryMovements,
  uid,
  writeInventoryItems,
  writeInventoryMovements,
  type InventoryItemRecord,
  type InventoryMovementRecord,
} from "./inventoryStorage";

type Props = {
  currentUser: SessionUser;
  partsRequests: PartsRequestRecord[];
  isCompactLayout: boolean;
};

type PurchaseOrderStatus = "Draft" | "Sent" | "Ordered" | "Partially Received" | "Received" | "Cancelled";

type PurchaseOrderRecord = {
  id: string;
  poNumber: string;
  status: PurchaseOrderStatus;
  supplier: string;
  requestId: string;
  requestNumber: string;
  roNumber: string;
  itemName: string;
  partNumber: string;
  quantity: number;
  cost: number;
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
};

const PO_STORAGE_KEY = "dvi_purchase_orders_lite_v1";
const COUNTER_STORAGE_KEY = "dvi_phase2_counters_v1";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function todayStamp(date = new Date()) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

function nextPoNumber() {
  const counters = readLocal<Record<string, number>>(COUNTER_STORAGE_KEY, {});
  const key = `PO_${todayStamp()}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeLocal(COUNTER_STORAGE_KEY, counters);
  return `PO-${todayStamp()}-${String(next).padStart(3, "0")}`;
}

function numberValue(value?: string) {
  const parsed = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}

function canViewCost(role: SessionUser["role"]) {
  return role === "Admin";
}

function selectedBidFor(request: PartsRequestRecord) {
  return request.bids.find((bid) => bid.id === request.selectedBidId) ?? request.bids[0] ?? null;
}

function upsertInventoryFromPo(po: PurchaseOrderRecord, userName: string) {
  const items = readInventoryItems();
  const movements = readInventoryMovements();
  const now = new Date().toISOString();
  const existing = items.find((item) => item.sku.toLowerCase() === po.partNumber.toLowerCase() || item.itemName.toLowerCase() === po.itemName.toLowerCase());
  let nextItem: InventoryItemRecord;
  let nextItems: InventoryItemRecord[];
  if (existing) {
    nextItem = { ...existing, quantityOnHand: existing.quantityOnHand + po.quantity, unitCost: po.cost || existing.unitCost, supplier: po.supplier || existing.supplier, updatedAt: now };
    nextItems = items.map((item) => item.id === existing.id ? nextItem : item);
  } else {
    nextItem = {
      id: uid("inv"),
      itemName: po.itemName,
      sku: po.partNumber,
      category: "Parts",
      brand: "",
      quantityOnHand: po.quantity,
      reorderLevel: 1,
      unitCost: po.cost,
      sellingPrice: 0,
      supplier: po.supplier,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    nextItems = [nextItem, ...items];
  }
  const movement: InventoryMovementRecord = {
    id: uid("move"),
    itemId: nextItem.id,
    itemName: nextItem.itemName,
    movementType: "Received From PO",
    quantityChange: po.quantity,
    quantityAfter: nextItem.quantityOnHand,
    sourceLabel: po.poNumber,
    note: `PO received from ${po.supplier}`,
    createdAt: now,
    createdBy: userName,
  };
  writeInventoryItems(nextItems);
  writeInventoryMovements([movement, ...movements]);
}

export function PurchaseOrderLitePanel({ currentUser, partsRequests, isCompactLayout }: Props) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>(() => readLocal<PurchaseOrderRecord[]>(PO_STORAGE_KEY, []));
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [message, setMessage] = useState("");
  const showCost = canViewCost(currentUser.role);

  useEffect(() => {
    writeLocal(PO_STORAGE_KEY, purchaseOrders);
  }, [purchaseOrders]);

  const poReadyRequests = partsRequests.filter((request) => request.bids.length > 0);
  const selectedRequest = poReadyRequests.find((request) => request.id === selectedRequestId) ?? poReadyRequests[0] ?? null;
  const selectedBid = selectedRequest ? selectedBidFor(selectedRequest) : null;

  const createPo = () => {
    if (!selectedRequest || !selectedBid) return;
    const po: PurchaseOrderRecord = {
      id: uid("po"),
      poNumber: nextPoNumber(),
      status: "Draft",
      supplier: selectedBid.supplierName,
      requestId: selectedRequest.id,
      requestNumber: selectedRequest.requestNumber,
      roNumber: selectedRequest.roNumber,
      itemName: selectedRequest.partName,
      partNumber: selectedRequest.partNumber,
      quantity: numberValue(selectedBid.quantity || selectedRequest.quantity || "1") || 1,
      cost: numberValue(selectedBid.unitCost),
      expectedDelivery,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPurchaseOrders((current) => [po, ...current]);
    setMessage("Purchase order created.");
  };

  const updateStatus = (poId: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders((current) => current.map((po) => po.id === poId ? { ...po, status, updatedAt: new Date().toISOString() } : po));
    setMessage("PO status updated.");
  };

  const receivePo = (po: PurchaseOrderRecord) => {
    upsertInventoryFromPo(po, currentUser.fullName);
    setPurchaseOrders((current) => current.map((row) => row.id === po.id ? { ...row, status: "Received", updatedAt: new Date().toISOString() } : row));
    setMessage("PO received into inventory.");
  };

  const totals = useMemo(() => purchaseOrders.reduce((sum, po) => sum + po.cost * po.quantity, 0), [purchaseOrders]);

  return (
    <section style={styles.panel} data-testid="purchase-order-lite-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Purchase Order Lite</div>
          <h2 style={styles.title}>Parts purchase orders</h2>
          <div style={styles.subtitle}>Create lightweight POs from supplier bids or parts requests. No accounting or payment tracking.</div>
        </div>
        <span style={styles.badge}>{purchaseOrders.length} PO(s)</span>
      </div>

      <div style={{ ...styles.formGrid, gridTemplateColumns: isCompactLayout ? "1fr" : "2fr 1fr auto" }}>
        <select data-testid="po-request-select" style={styles.input} value={selectedRequest?.id ?? ""} onChange={(event) => setSelectedRequestId(event.target.value)}>
          {poReadyRequests.map((request) => {
            const bid = selectedBidFor(request);
            return <option key={request.id} value={request.id}>{request.requestNumber} / {request.partName} / {bid?.supplierName || "No supplier"}</option>;
          })}
        </select>
        <input data-testid="po-expected-delivery" style={styles.input} type="date" value={expectedDelivery} onChange={(event) => setExpectedDelivery(event.target.value)} />
        <button type="button" data-testid="po-create" style={styles.button} onClick={createPo} disabled={!selectedRequest || !selectedBid}>Create PO</button>
      </div>
      {message ? <div style={styles.message}>{message}</div> : null}
      {showCost ? <div style={styles.total}>Open PO value: {money(totals)}</div> : <div style={styles.total}>Internal cost hidden for this role.</div>}

      <div style={styles.list}>
        {purchaseOrders.map((po) => (
          <article key={po.id} style={styles.card} data-testid={`po-row-${po.id}`}>
            <div style={styles.cardHeader}>
              <strong>{po.poNumber}</strong>
              <span style={po.status === "Received" ? styles.received : styles.status}>{po.status}</span>
            </div>
            <div style={styles.meta}>{po.supplier} / {po.itemName} / Qty {po.quantity}</div>
            <div style={styles.meta}>{po.roNumber} / {po.requestNumber} / Expected {po.expectedDelivery || "-"}</div>
            {showCost ? <div style={styles.meta} data-testid={`po-cost-${po.id}`}>Cost {money(po.cost)} / Total {money(po.cost * po.quantity)}</div> : null}
            <div style={styles.actions}>
              {(["Sent", "Ordered", "Partially Received", "Cancelled"] as PurchaseOrderStatus[]).map((status) => (
                <button key={status} type="button" style={styles.secondaryButton} onClick={() => updateStatus(po.id, status)}>{status}</button>
              ))}
              <button type="button" data-testid={`po-receive-${po.id}`} style={styles.button} onClick={() => receivePo(po)}>Receive to Inventory</button>
            </div>
          </article>
        ))}
        {purchaseOrders.length === 0 ? <div style={styles.empty}>No purchase orders yet.</div> : null}
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
  badge: { borderRadius: 999, padding: "5px 9px", background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 800 },
  formGrid: { display: "grid", gap: 8, marginBottom: 10 },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px", background: "#fff", color: "#0f172a" },
  button: { border: "none", borderRadius: 8, padding: "9px 12px", background: "#2563eb", color: "#fff", fontWeight: 800, cursor: "pointer" },
  secondaryButton: { border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", background: "#fff", color: "#334155", fontWeight: 700, cursor: "pointer" },
  message: { color: "#334155", fontSize: 13, fontWeight: 700, marginBottom: 8 },
  total: { color: "#475569", fontSize: 13, fontWeight: 800, marginBottom: 10 },
  list: { display: "grid", gap: 8 },
  card: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  meta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  status: { borderRadius: 999, padding: "4px 8px", background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 800 },
  received: { borderRadius: 999, padding: "4px 8px", background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 800 },
  empty: { border: "1px dashed #cbd5e1", borderRadius: 8, padding: 16, color: "#64748b", background: "#f8fafc" },
};
