import React, { useEffect, useMemo, useState } from "react";
import type { PartsRequestRecord, SessionUser, AuditLogRecord } from "../shared/types";
import { BackToListButton } from "../shared/BackToListButton";
import {
  readInventoryItems,
  readInventoryMovements,
  uid,
  writeInventoryItems,
  writeInventoryMovements,
  type InventoryItemRecord,
  type InventoryMovementRecord,
} from "./inventoryStorage";
import { normalizePurchaseOrderRecord } from "../dataQuality/legacyPurchaseOrderMigration";

type Props = {
  currentUser: SessionUser;
  partsRequests: PartsRequestRecord[];
  isCompactLayout: boolean;
  onLogAudit?: (entry: Omit<AuditLogRecord, "id" | "timestamp">) => void;
};

type PurchaseOrderStatus = "Draft" | "Sent" | "Ordered" | "Partially Received" | "Received" | "Cancelled";

type PurchaseOrderReceivingEvent = {
  id: string;
  receivedAt: string;
  receivedBy: string;
  quantity: number;
  note: string;
};

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
  orderedQuantity?: number;
  receivedQuantity?: number;
  receivingEvents?: PurchaseOrderReceivingEvent[];
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

function numberValue(value?: string | number) {
  const parsed = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}

function canViewCost(role: SessionUser["role"]) {
  return role === "Admin";
}

function canOverrideReceiving(role: SessionUser["role"]) {
  return role === "Admin";
}

function selectedBidFor(request: PartsRequestRecord) {
  return request.bids.find((bid) => bid.id === request.selectedBidId) ?? request.bids[0] ?? null;
}

function upsertInventoryFromPo(po: PurchaseOrderRecord, userName: string, receiveQty: number) {
  const items = readInventoryItems();
  const movements = readInventoryMovements();
  const now = new Date().toISOString();
  const existing = items.find((item) => item.sku.toLowerCase() === po.partNumber.toLowerCase() || item.itemName.toLowerCase() === po.itemName.toLowerCase());
  let nextItem: InventoryItemRecord;
  let nextItems: InventoryItemRecord[];
  if (existing) {
    nextItem = { ...existing, quantityOnHand: existing.quantityOnHand + receiveQty, unitCost: po.cost || existing.unitCost, supplier: po.supplier || existing.supplier, updatedAt: now };
    nextItems = items.map((item) => item.id === existing.id ? nextItem : item);
  } else {
    nextItem = {
      id: uid("inv"),
      itemName: po.itemName,
      sku: po.partNumber,
      category: "Parts",
      brand: "",
      quantityOnHand: receiveQty,
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
    quantityChange: receiveQty,
    quantityAfter: nextItem.quantityOnHand,
    sourceLabel: po.poNumber,
    note: `PO received from ${po.supplier}`,
    createdAt: now,
    createdBy: userName,
    adjustmentStatus: "Applied",
    adjustmentReason: "New Stock",
    appliedAt: now,
    relatedSource: po.poNumber,
  };
  writeInventoryItems(nextItems);
  writeInventoryMovements([movement, ...movements]);
  return { nextItem, movement };
}

function normalizePoRecord(po: PurchaseOrderRecord): PurchaseOrderRecord {
  return {
    ...po,
    orderedQuantity: po.orderedQuantity ?? po.quantity,
    receivedQuantity: po.receivedQuantity ?? 0,
    receivingEvents: po.receivingEvents ?? [],
  };
}

export function PurchaseOrderLitePanel({ currentUser, partsRequests, isCompactLayout, onLogAudit }: Props) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>(() => readLocal<PurchaseOrderRecord[]>(PO_STORAGE_KEY, []).map(normalizePurchaseOrderRecord).map(normalizePoRecord));
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedPoId, setSelectedPoId] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [receiveQty, setReceiveQty] = useState("1");
  const [receiveNote, setReceiveNote] = useState("");
  const [message, setMessage] = useState("");
  const showCost = canViewCost(currentUser.role);

  useEffect(() => {
    writeLocal(PO_STORAGE_KEY, purchaseOrders);
  }, [purchaseOrders]);

  const poReadyRequests = partsRequests.filter((request) => request.bids.length > 0);
  const selectedRequest = poReadyRequests.find((request) => request.id === selectedRequestId) ?? poReadyRequests[0] ?? null;
  const selectedBid = selectedRequest ? selectedBidFor(selectedRequest) : null;
  const selectedPo = purchaseOrders.find((po) => po.id === selectedPoId) ?? null;

  const createPo = () => {
    if (!selectedRequest || !selectedBid) return;
    const po: PurchaseOrderRecord = normalizePoRecord({
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
      orderedQuantity: numberValue(selectedBid.quantity || selectedRequest.quantity || "1") || 1,
      receivedQuantity: 0,
      receivingEvents: [],
      cost: numberValue(selectedBid.unitCost),
      expectedDelivery,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setPurchaseOrders((current) => [po, ...current]);
    onLogAudit?.({
      module: "PurchaseOrders",
      action: "po_created",
      entityId: po.id,
      entityLabel: po.poNumber,
      userId: currentUser.id,
      userName: currentUser.fullName,
      detail: `Created PO ${po.poNumber} for ${po.itemName}`,
    });
    setMessage("Purchase order created.");
  };

  const updateStatus = (poId: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders((current) => current.map((po) => po.id === poId ? { ...po, status, updatedAt: new Date().toISOString() } : po));
    const currentPo = purchaseOrders.find((po) => po.id === poId);
    if (currentPo) {
      onLogAudit?.({
        module: "PurchaseOrders",
        action: "po_status_changed",
        entityId: currentPo.id,
        entityLabel: currentPo.poNumber,
        userId: currentUser.id,
        userName: currentUser.fullName,
        detail: `PO ${currentPo.poNumber} status changed to ${status}`,
        before: currentPo.status,
        after: status,
      });
    }
    setMessage("PO status updated.");
  };

  const receivePo = (po: PurchaseOrderRecord, qty = numberValue(receiveQty)) => {
    if (qty <= 0) {
      setMessage("Enter a valid receive quantity.");
      return;
    }
    const ordered = po.orderedQuantity ?? po.quantity;
    const receivedSoFar = po.receivedQuantity ?? 0;
    const remaining = Math.max(ordered - receivedSoFar, 0);
    if (remaining <= 0) {
      setMessage("This PO is already fully received.");
      return;
    }
    if (qty > remaining && !canOverrideReceiving(currentUser.role)) {
      setMessage("Cannot receive more than ordered. Admin override required.");
      return;
    }
    let overrideNote = receiveNote.trim();
    if (qty > remaining && canOverrideReceiving(currentUser.role) && !overrideNote) {
      overrideNote = window.prompt("Override reason for excess receiving:", "") || "";
      if (!overrideNote.trim()) {
        setMessage("Override reason required.");
        return;
      }
    }
    const finalQty = qty;
    const { nextItem } = upsertInventoryFromPo(po, currentUser.fullName, finalQty);
    const receivedTotal = receivedSoFar + finalQty;
    const nextStatus: PurchaseOrderStatus = receivedTotal >= ordered ? "Received" : "Partially Received";
    const event = {
      id: uid("poevt"),
      receivedAt: new Date().toISOString(),
      receivedBy: currentUser.fullName,
      quantity: finalQty,
      note: overrideNote || receiveNote.trim() || `Received ${finalQty} from PO`,
    };
    setPurchaseOrders((current) =>
      current.map((row) =>
        row.id === po.id
          ? {
              ...row,
              status: nextStatus,
              receivedQuantity: receivedTotal,
              receivingEvents: [...(row.receivingEvents ?? []), event],
              updatedAt: new Date().toISOString(),
            }
          : row
      )
    );
    onLogAudit?.({
      module: "PurchaseOrders",
      action: "po_received",
      entityId: po.id,
      entityLabel: po.poNumber,
      userId: currentUser.id,
      userName: currentUser.fullName,
      detail: `PO ${po.poNumber} received ${finalQty} into inventory`,
      before: po.status,
      after: nextStatus,
    });
    setMessage(`${finalQty} received into inventory.`);
    setReceiveQty("1");
    setReceiveNote("");
    if (nextStatus === "Received" && nextItem) {
      // keep visible feedback aligned with receive action
    }
  };

  const totals = useMemo(() => purchaseOrders.reduce((sum, po) => sum + po.cost * po.quantity, 0), [purchaseOrders]);

  const selectedOrdered = selectedPo?.orderedQuantity ?? selectedPo?.quantity ?? 0;
  const selectedReceived = selectedPo?.receivedQuantity ?? 0;
  const selectedRemaining = Math.max(selectedOrdered - selectedReceived, 0);

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
        {purchaseOrders.map((po) => {
          const ordered = po.orderedQuantity ?? po.quantity;
          const received = po.receivedQuantity ?? 0;
          const remaining = Math.max(ordered - received, 0);
          return (
            <article key={po.id} style={styles.cardButton} data-testid={`po-row-${po.id}`} onClick={() => setSelectedPoId(po.id)}>
              <div style={styles.cardHeader}>
                <strong>{po.poNumber}</strong>
                <span style={po.status === "Received" ? styles.received : styles.status}>{po.status}</span>
              </div>
              <div style={styles.meta}>{po.supplier} / {po.itemName} / Qty {ordered}</div>
              <div style={styles.meta}>{po.roNumber} / {po.requestNumber} / Expected {po.expectedDelivery || "-"}</div>
              <div style={styles.meta}>Received {received} / Remaining {remaining}</div>
              {showCost ? <div style={styles.meta} data-testid={`po-cost-${po.id}`}>Cost {money(po.cost)} / Total {money(po.cost * ordered)}</div> : null}
              <div style={styles.actions}>
                {(["Sent", "Ordered", "Cancelled"] as PurchaseOrderStatus[]).map((status) => (
                  <button key={status} type="button" style={styles.secondaryButton} onClick={() => updateStatus(po.id, status)}>{status}</button>
                ))}
                <button type="button" data-testid={`po-receive-${po.id}`} style={styles.button} onClick={() => receivePo(po, ordered - received || ordered)} disabled={remaining <= 0}>Receive to Inventory</button>
              </div>
            </article>
          );
        })}
        {purchaseOrders.length === 0 ? <div style={styles.empty}>No purchase orders yet.</div> : null}
      </div>

      {selectedPo ? (
        <div style={styles.card} data-testid="po-detail-panel">
          <div style={styles.cardHeader}>
            <strong>PO Detail</strong>
            <span style={selectedPo.status === "Received" ? styles.received : styles.status}>{selectedPo.status}</span>
          </div>
          <div style={styles.detailToolbar}>
            <BackToListButton onClick={() => setSelectedPoId("")} testId="po-back-to-list" />
          </div>
          <div style={styles.meta}>{selectedPo.poNumber} / {selectedPo.supplier}</div>
          <div style={styles.meta}>{selectedPo.itemName} / Qty {selectedOrdered} / {selectedPo.requestNumber}</div>
          <div style={styles.meta}>{selectedPo.roNumber} / Expected {selectedPo.expectedDelivery || "-"}</div>
          <div style={styles.meta}>Received {selectedReceived} / Remaining {selectedRemaining}</div>
          {showCost ? <div style={styles.meta}>Cost {money(selectedPo.cost)} / Total {money(selectedPo.cost * selectedOrdered)}</div> : <div style={styles.meta}>Internal cost hidden for this role.</div>}
          <div style={styles.receiveGrid}>
            <input data-testid={`po-receive-qty-${selectedPo.id}`} style={styles.input} value={receiveQty} onChange={(event) => setReceiveQty(event.target.value)} placeholder="Receive quantity" />
            <input data-testid={`po-receive-note-${selectedPo.id}`} style={styles.input} value={receiveNote} onChange={(event) => setReceiveNote(event.target.value)} placeholder="Receiving note / override reason" />
            <button type="button" data-testid={`po-receive-detail-${selectedPo.id}`} style={styles.button} onClick={() => receivePo(selectedPo, numberValue(receiveQty))} disabled={selectedRemaining <= 0}>Receive</button>
          </div>
          <div style={styles.actions}>
            {(["Sent", "Ordered", "Cancelled"] as PurchaseOrderStatus[]).map((status) => (
              <button key={status} type="button" style={styles.secondaryButton} onClick={() => updateStatus(selectedPo.id, status)}>{status}</button>
            ))}
            <button type="button" style={styles.secondaryButton} onClick={() => setSelectedPoId("")}>Close Detail</button>
          </div>
          <div style={styles.eventList} data-testid={`po-receiving-history-${selectedPo.id}`}>
            <strong>Receiving history</strong>
            {(selectedPo.receivingEvents ?? []).length === 0 ? <div style={styles.meta}>No receiving events yet.</div> : null}
            {(selectedPo.receivingEvents ?? []).map((event) => (
              <div key={event.id} style={styles.eventRow}>
                {event.receivedAt} · {event.receivedBy} · Qty {event.quantity} · {event.note}
              </div>
            ))}
          </div>
        </div>
      ) : null}
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
  cardButton: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc", cursor: "pointer", textAlign: "left" as const },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  detailToolbar: { display: "flex", justifyContent: "flex-end" },
  meta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  status: { borderRadius: 999, padding: "4px 8px", background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 800 },
  received: { borderRadius: 999, padding: "4px 8px", background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 800 },
  empty: { border: "1px dashed #cbd5e1", borderRadius: 8, padding: 16, color: "#64748b", background: "#f8fafc" },
  receiveGrid: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginTop: 10, alignItems: "center" },
  eventList: { display: "grid", gap: 6, marginTop: 12, border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#fff" },
  eventRow: { color: "#475569", fontSize: 12, borderBottom: "1px solid #f1f5f9", paddingBottom: 4 },
};

export default PurchaseOrderLitePanel;
