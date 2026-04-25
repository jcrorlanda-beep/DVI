import React, { useEffect, useMemo, useState } from "react";
import type { PartsRequestRecord, RepairOrderRecord, SessionUser } from "../shared/types";
import {
  INVENTORY_UPDATED_EVENT,
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
  repairOrders: RepairOrderRecord[];
  partsRequests: PartsRequestRecord[];
  setPartsRequests: React.Dispatch<React.SetStateAction<PartsRequestRecord[]>>;
  isCompactLayout: boolean;
};

type ItemForm = {
  itemName: string;
  sku: string;
  category: string;
  brand: string;
  quantityOnHand: string;
  reorderLevel: string;
  unitCost: string;
  sellingPrice: string;
  supplier: string;
  active: boolean;
};

function numberValue(value: string) {
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}

function canViewCost(role: SessionUser["role"]) {
  return role === "Admin";
}

function createBlankForm(): ItemForm {
  return {
    itemName: "",
    sku: "",
    category: "",
    brand: "",
    quantityOnHand: "0",
    reorderLevel: "1",
    unitCost: "",
    sellingPrice: "",
    supplier: "",
    active: true,
  };
}

function findMatchingItem(items: InventoryItemRecord[], request: PartsRequestRecord) {
  const partNumber = request.partNumber.trim().toLowerCase();
  const partName = request.partName.trim().toLowerCase();
  return items.find((item) => (partNumber && item.sku.toLowerCase() === partNumber) || item.itemName.toLowerCase() === partName);
}

export function InventoryControlPanel({ currentUser, repairOrders, partsRequests, setPartsRequests, isCompactLayout }: Props) {
  const [items, setItems] = useState<InventoryItemRecord[]>(() => readInventoryItems());
  const [movements, setMovements] = useState<InventoryMovementRecord[]>(() => readInventoryMovements());
  const [form, setForm] = useState<ItemForm>(() => createBlankForm());
  const [selectedItemId, setSelectedItemId] = useState("");
  const [adjustmentQty, setAdjustmentQty] = useState("1");
  const [adjustmentType, setAdjustmentType] = useState<InventoryMovementRecord["movementType"]>("Add Stock");
  const [selectedPartsRequestId, setSelectedPartsRequestId] = useState("");
  const [selectedRoId, setSelectedRoId] = useState("");
  const [useQty, setUseQty] = useState("1");
  const [message, setMessage] = useState("");
  const showCost = canViewCost(currentUser.role);

  const refreshInventory = () => {
    setItems(readInventoryItems());
    setMovements(readInventoryMovements());
  };

  useEffect(() => {
    window.addEventListener(INVENTORY_UPDATED_EVENT, refreshInventory);
    return () => window.removeEventListener(INVENTORY_UPDATED_EVENT, refreshInventory);
  }, []);

  const persist = (nextItems: InventoryItemRecord[], nextMovement?: InventoryMovementRecord) => {
    const nextMovements = nextMovement ? [nextMovement, ...movements] : movements;
    setItems(nextItems);
    setMovements(nextMovements);
    writeInventoryItems(nextItems);
    writeInventoryMovements(nextMovements);
  };

  const addItem = () => {
    const name = form.itemName.trim();
    if (!name) {
      setMessage("Item name is required.");
      return;
    }
    const now = new Date().toISOString();
    const item: InventoryItemRecord = {
      id: uid("inv"),
      itemName: name,
      sku: form.sku.trim(),
      category: form.category.trim() || "General",
      brand: form.brand.trim(),
      quantityOnHand: numberValue(form.quantityOnHand),
      reorderLevel: numberValue(form.reorderLevel),
      unitCost: numberValue(form.unitCost),
      sellingPrice: numberValue(form.sellingPrice),
      supplier: form.supplier.trim(),
      active: form.active,
      createdAt: now,
      updatedAt: now,
    };
    const movement: InventoryMovementRecord = {
      id: uid("move"),
      itemId: item.id,
      itemName: item.itemName,
      movementType: "Add Stock",
      quantityChange: item.quantityOnHand,
      quantityAfter: item.quantityOnHand,
      sourceLabel: "New inventory item",
      note: "Opening stock",
      createdAt: now,
      createdBy: currentUser.fullName,
    };
    persist([item, ...items], movement);
    setForm(createBlankForm());
    setSelectedItemId(item.id);
    setMessage("Inventory item added.");
  };

  const adjustStock = () => {
    const qty = numberValue(adjustmentQty);
    const item = items.find((row) => row.id === selectedItemId);
    if (!item || qty <= 0) return;
    const change = adjustmentType === "Deduct Stock" ? -qty : adjustmentType === "Correction" ? qty - item.quantityOnHand : qty;
    const nextQuantity = item.quantityOnHand + change;
    if (nextQuantity < 0) {
      setMessage("Negative stock blocked. Use correction only when verified.");
      return;
    }
    const nextItems = items.map((row) => row.id === item.id ? { ...row, quantityOnHand: nextQuantity, updatedAt: new Date().toISOString() } : row);
    persist(nextItems, {
      id: uid("move"),
      itemId: item.id,
      itemName: item.itemName,
      movementType: adjustmentType,
      quantityChange: change,
      quantityAfter: nextQuantity,
      sourceLabel: "Manual stock adjustment",
      note: adjustmentType,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.fullName,
    });
    setMessage("Stock adjustment saved.");
  };

  const receivePartsRequest = () => {
    const request = partsRequests.find((row) => row.id === selectedPartsRequestId);
    if (!request) return;
    const qty = numberValue(request.quantity || "1") || 1;
    const match = findMatchingItem(items, request);
    const now = new Date().toISOString();
    let nextItems: InventoryItemRecord[];
    let targetItem: InventoryItemRecord;
    if (match) {
      targetItem = { ...match, quantityOnHand: match.quantityOnHand + qty, updatedAt: now };
      nextItems = items.map((row) => row.id === match.id ? targetItem : row);
    } else {
      targetItem = {
        id: uid("inv"),
        itemName: request.partName || "Received part",
        sku: request.partNumber,
        category: "Parts",
        brand: request.bids.find((bid) => bid.id === request.selectedBidId)?.brand || "",
        quantityOnHand: qty,
        reorderLevel: 1,
        unitCost: numberValue(request.bids.find((bid) => bid.id === request.selectedBidId)?.unitCost || "0"),
        sellingPrice: numberValue(request.customerSellingPrice),
        supplier: request.bids.find((bid) => bid.id === request.selectedBidId)?.supplierName || "",
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      nextItems = [targetItem, ...items];
    }
    persist(nextItems, {
      id: uid("move"),
      itemId: targetItem.id,
      itemName: targetItem.itemName,
      movementType: "Received From Parts Request",
      quantityChange: qty,
      quantityAfter: targetItem.quantityOnHand,
      sourceLabel: request.requestNumber,
      note: `Received into inventory from ${request.roNumber}`,
      createdAt: now,
      createdBy: currentUser.fullName,
    });
    setPartsRequests((current) => current.map((row) => row.id === request.id ? { ...row, status: row.status === "Arrived" ? "Parts Arrived" : row.status, updatedAt: now } : row));
    setMessage("Arrived part received into inventory.");
  };

  const useInventoryOnRo = () => {
    const item = items.find((row) => row.id === selectedItemId);
    const ro = repairOrders.find((row) => row.id === selectedRoId);
    const qty = numberValue(useQty);
    if (!item || !ro || qty <= 0) return;
    if (item.quantityOnHand - qty < 0) {
      setMessage("Negative stock blocked. Not enough quantity on hand.");
      return;
    }
    const nextItem = { ...item, quantityOnHand: item.quantityOnHand - qty, updatedAt: new Date().toISOString() };
    persist(items.map((row) => row.id === item.id ? nextItem : row), {
      id: uid("move"),
      itemId: item.id,
      itemName: item.itemName,
      movementType: "Used On RO",
      quantityChange: -qty,
      quantityAfter: nextItem.quantityOnHand,
      sourceLabel: ro.roNumber,
      note: "Inventory part used on repair order",
      createdAt: new Date().toISOString(),
      createdBy: currentUser.fullName,
    });
    setMessage(`Inventory deducted and linked to ${ro.roNumber}.`);
  };

  const lowStockItems = useMemo(() => items.filter((item) => item.active && item.quantityOnHand <= item.reorderLevel), [items]);
  const arrivedRequests = partsRequests.filter((row) => ["Arrived", "Parts Arrived"].includes(row.status));
  const activeRos = repairOrders.filter((ro) => !["Released", "Closed"].includes(ro.status));

  return (
    <section style={styles.panel} data-testid="inventory-control-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Inventory Stock Control</div>
          <h2 style={styles.title}>Parts and supplies inventory</h2>
          <div style={styles.subtitle}>Internal stock tracking with controlled adjustments and movement logs.</div>
        </div>
        <span style={lowStockItems.length ? styles.lowBadge : styles.badge}>{lowStockItems.length} low stock</span>
      </div>

      <div style={{ ...styles.formGrid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(5, minmax(0, 1fr))" }}>
        <input data-testid="inventory-item-name" style={styles.input} placeholder="Item name" value={form.itemName} onChange={(event) => setForm((prev) => ({ ...prev, itemName: event.target.value }))} />
        <input data-testid="inventory-sku" style={styles.input} placeholder="Part number / SKU" value={form.sku} onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))} />
        <input data-testid="inventory-category" style={styles.input} placeholder="Category" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
        <input data-testid="inventory-brand" style={styles.input} placeholder="Brand" value={form.brand} onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))} />
        <input data-testid="inventory-supplier" style={styles.input} placeholder="Supplier" value={form.supplier} onChange={(event) => setForm((prev) => ({ ...prev, supplier: event.target.value }))} />
        <input data-testid="inventory-qty" style={styles.input} placeholder="Qty on hand" value={form.quantityOnHand} onChange={(event) => setForm((prev) => ({ ...prev, quantityOnHand: event.target.value }))} />
        <input data-testid="inventory-reorder" style={styles.input} placeholder="Reorder level" value={form.reorderLevel} onChange={(event) => setForm((prev) => ({ ...prev, reorderLevel: event.target.value }))} />
        {showCost ? <input data-testid="inventory-unit-cost" style={styles.input} placeholder="Unit cost" value={form.unitCost} onChange={(event) => setForm((prev) => ({ ...prev, unitCost: event.target.value }))} /> : null}
        <input data-testid="inventory-selling-price" style={styles.input} placeholder="Selling price" value={form.sellingPrice} onChange={(event) => setForm((prev) => ({ ...prev, sellingPrice: event.target.value }))} />
        <label style={styles.checkLabel}><input type="checkbox" checked={form.active} onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))} /> Active</label>
      </div>
      <div style={styles.actions}>
        <button type="button" data-testid="inventory-add-item" style={styles.button} onClick={addItem}>Add Item</button>
        {message ? <span style={styles.message}>{message}</span> : null}
      </div>

      <div style={{ ...styles.formGrid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(4, minmax(0, 1fr))" }}>
        <select data-testid="inventory-adjust-item" style={styles.input} value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)}>
          <option value="">Select inventory item</option>
          {items.map((item) => <option key={item.id} value={item.id}>{item.itemName} / {item.quantityOnHand}</option>)}
        </select>
        <select data-testid="inventory-adjust-type" style={styles.input} value={adjustmentType} onChange={(event) => setAdjustmentType(event.target.value as InventoryMovementRecord["movementType"])}>
          <option>Add Stock</option>
          <option>Deduct Stock</option>
          <option>Correction</option>
        </select>
        <input data-testid="inventory-adjust-qty" style={styles.input} value={adjustmentQty} onChange={(event) => setAdjustmentQty(event.target.value)} placeholder="Quantity" />
        <button type="button" data-testid="inventory-adjust-save" style={styles.button} onClick={adjustStock}>Save Adjustment</button>
      </div>

      <div style={{ ...styles.formGrid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(4, minmax(0, 1fr))" }}>
        <select data-testid="inventory-receive-request" style={styles.input} value={selectedPartsRequestId} onChange={(event) => setSelectedPartsRequestId(event.target.value)}>
          <option value="">Arrived parts request</option>
          {arrivedRequests.map((request) => <option key={request.id} value={request.id}>{request.requestNumber} / {request.partName}</option>)}
        </select>
        <button type="button" data-testid="inventory-receive-request-save" style={styles.button} onClick={receivePartsRequest}>Receive Into Inventory</button>
        <select data-testid="inventory-use-ro" style={styles.input} value={selectedRoId} onChange={(event) => setSelectedRoId(event.target.value)}>
          <option value="">Use on RO</option>
          {activeRos.map((ro) => <option key={ro.id} value={ro.id}>{ro.roNumber} / {ro.plateNumber || ro.conductionNumber || "No plate"}</option>)}
        </select>
        <input data-testid="inventory-use-qty" style={styles.input} value={useQty} onChange={(event) => setUseQty(event.target.value)} placeholder="Use qty" />
        <button type="button" data-testid="inventory-use-save" style={styles.button} onClick={useInventoryOnRo}>Use Inventory Item</button>
      </div>

      <div style={styles.itemGrid}>
        {items.map((item) => (
          <article key={item.id} style={styles.card} data-testid={`inventory-item-${item.id}`}>
            <div style={styles.cardHeader}>
              <strong>{item.itemName}</strong>
              <span style={item.quantityOnHand <= item.reorderLevel ? styles.lowBadge : styles.badge}>{item.quantityOnHand <= item.reorderLevel ? "Low Stock" : "In Stock"}</span>
            </div>
            <div style={styles.meta}>{item.sku || "No SKU"} / {item.category} / {item.brand || "No brand"}</div>
            <div style={styles.meta}>Qty {item.quantityOnHand} / Reorder {item.reorderLevel} / Supplier {item.supplier || "-"}</div>
            {showCost ? <div style={styles.meta} data-testid={`inventory-cost-${item.id}`}>Cost {money(item.unitCost)} / Sell {money(item.sellingPrice)}</div> : <div style={styles.meta}>Sell {money(item.sellingPrice)}</div>}
            {!item.active ? <span style={styles.inactive}>Inactive</span> : null}
          </article>
        ))}
      </div>

      <div style={styles.log} data-testid="inventory-movement-log">
        <strong>Movement log</strong>
        {movements.slice(0, 6).map((movement) => (
          <div key={movement.id} style={styles.logRow}>{movement.movementType}: {movement.itemName} ({movement.quantityChange}) / {movement.sourceLabel}</div>
        ))}
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
  badge: { borderRadius: 999, padding: "5px 9px", background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 800 },
  lowBadge: { borderRadius: 999, padding: "5px 9px", background: "#fee2e2", color: "#991b1b", fontSize: 12, fontWeight: 800 },
  formGrid: { display: "grid", gap: 8, marginBottom: 10 },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px", background: "#fff", color: "#0f172a" },
  checkLabel: { display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 700 },
  actions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 },
  button: { border: "none", borderRadius: 8, padding: "9px 12px", background: "#2563eb", color: "#fff", fontWeight: 800, cursor: "pointer" },
  message: { color: "#334155", fontSize: 13, fontWeight: 700 },
  itemGrid: { display: "grid", gap: 8, marginTop: 12 },
  card: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  meta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  inactive: { display: "inline-flex", marginTop: 8, borderRadius: 999, padding: "4px 8px", background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 800 },
  log: { display: "grid", gap: 6, marginTop: 12, border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#fff" },
  logRow: { color: "#475569", fontSize: 12 },
};
