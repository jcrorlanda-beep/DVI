import React, { useEffect, useMemo, useState } from "react";
import type { PartsRequestRecord, RepairOrderRecord, SessionUser, AuditLogRecord } from "../shared/types";
import { BackToListButton } from "../shared/BackToListButton";
import {
  INVENTORY_UPDATED_EVENT,
  readInventoryItems,
  readInventoryMovements,
  readInventoryAdjustments,
  readInventoryDeductionMode,
  uid,
  writeInventoryItems,
  writeInventoryMovements,
  writeInventoryAdjustments,
  writeInventoryDeductionMode,
  type InventoryItemRecord,
  type InventoryMovementRecord,
  type InventoryAdjustmentRequest,
  type InventoryAdjustmentStatus,
  type InventoryAdjustmentReason,
  type InventoryDeductionMode,
} from "./inventoryStorage";

type Props = {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  partsRequests: PartsRequestRecord[];
  setPartsRequests: React.Dispatch<React.SetStateAction<PartsRequestRecord[]>>;
  isCompactLayout: boolean;
  onLogAudit?: (entry: Omit<AuditLogRecord, "id" | "timestamp">) => void;
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

type AdjustmentDirection = "Add Stock" | "Deduct Stock" | "Correction";

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

function canApproveAdjustments(role: SessionUser["role"]) {
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

function nowIso() {
  return new Date().toISOString();
}

function safeConfirm(message: string) {
  if (typeof window === "undefined") return true;
  return window.confirm(message);
}

function safePrompt(message: string, defaultValue = "") {
  if (typeof window === "undefined") return defaultValue;
  return window.prompt(message, defaultValue) ?? "";
}

function getInventorySourceLabel(changeType: AdjustmentDirection, reason: InventoryAdjustmentReason) {
  return `${changeType} / ${reason}`;
}

function getAdjustmentQuantity(changeType: AdjustmentDirection, quantity: number, currentQty: number) {
  if (changeType === "Correction") return quantity - currentQty;
  return changeType === "Deduct Stock" ? -Math.abs(quantity) : Math.abs(quantity);
}

function getNextQuantity(currentQty: number, changeType: AdjustmentDirection, quantity: number) {
  if (changeType === "Correction") return quantity;
  return currentQty + getAdjustmentQuantity(changeType, quantity, currentQty);
}

function getMovementLabel(status: InventoryAdjustmentRequest["status"], direction: AdjustmentDirection) {
  if (status === "Pending Approval") return "Adjustment Pending";
  if (status === "Approved") return "Adjustment Approved";
  if (status === "Rejected") return "Adjustment Rejected";
  if (status === "Applied") return "Adjustment Applied";
  return direction;
}

export function InventoryControlPanel({ currentUser, repairOrders, partsRequests, setPartsRequests, isCompactLayout, onLogAudit }: Props) {
  const [items, setItems] = useState<InventoryItemRecord[]>(() => readInventoryItems());
  const [movements, setMovements] = useState<InventoryMovementRecord[]>(() => readInventoryMovements());
  const [adjustments, setAdjustments] = useState<InventoryAdjustmentRequest[]>(() => readInventoryAdjustments());
  const [deductionMode, setDeductionMode] = useState<InventoryDeductionMode>(() => readInventoryDeductionMode());
  const [form, setForm] = useState<ItemForm>(() => createBlankForm());
  const [selectedItemId, setSelectedItemId] = useState("");
  const [adjustmentQty, setAdjustmentQty] = useState("1");
  const [adjustmentDirection, setAdjustmentDirection] = useState<AdjustmentDirection>("Add Stock");
  const [adjustmentReason, setAdjustmentReason] = useState<InventoryAdjustmentReason>("New Stock");
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState("");
  const [selectedPartsRequestId, setSelectedPartsRequestId] = useState("");
  const [selectedRoId, setSelectedRoId] = useState("");
  const [useQty, setUseQty] = useState("1");
  const [message, setMessage] = useState("");

  const showCost = canViewCost(currentUser.role);
  const canApprove = canApproveAdjustments(currentUser.role);

  const refreshInventory = () => {
    setItems(readInventoryItems());
    setMovements(readInventoryMovements());
    setAdjustments(readInventoryAdjustments());
    setDeductionMode(readInventoryDeductionMode());
  };

  useEffect(() => {
    window.addEventListener(INVENTORY_UPDATED_EVENT, refreshInventory);
    return () => window.removeEventListener(INVENTORY_UPDATED_EVENT, refreshInventory);
  }, []);

  const persistInventory = (nextItems: InventoryItemRecord[], nextMovement?: InventoryMovementRecord) => {
    const nextMovements = nextMovement ? [nextMovement, ...movements] : movements;
    setItems(nextItems);
    setMovements(nextMovements);
    writeInventoryItems(nextItems);
    writeInventoryMovements(nextMovements);
  };

  const persistAdjustments = (nextAdjustments: InventoryAdjustmentRequest[]) => {
    setAdjustments(nextAdjustments);
    writeInventoryAdjustments(nextAdjustments);
  };

  const addItem = () => {
    const name = form.itemName.trim();
    if (!name) {
      setMessage("Item name is required.");
      return;
    }
    const now = nowIso();
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
      adjustmentStatus: "Applied",
      adjustmentReason: "New Stock",
      appliedAt: now,
      relatedSource: item.itemName,
    };
    persistInventory([item, ...items], movement);
    onLogAudit?.({
      module: "Inventory",
      action: "inventory_item_created",
      entityId: item.id,
      entityLabel: item.itemName,
      userId: currentUser.id,
      userName: currentUser.fullName,
      detail: `Created inventory item ${item.itemName} (${item.sku || "no SKU"})`,
    });
    setForm(createBlankForm());
    setSelectedItemId(item.id);
    setMessage("Inventory item added.");
  };

  function createAdjustment(status: InventoryAdjustmentRequest["status"]) {
    const qty = numberValue(adjustmentQty);
    const item = items.find((row) => row.id === selectedItemId);
    if (!item || qty <= 0) return;
    const targetQty = getNextQuantity(item.quantityOnHand, adjustmentDirection, qty);
    const now = nowIso();
    const request: InventoryAdjustmentRequest = {
      id: uid("adj"),
      itemId: item.id,
      itemName: item.itemName,
      quantityChange: getAdjustmentQuantity(adjustmentDirection, qty, item.quantityOnHand),
      quantityAfter: targetQty,
      reason: adjustmentReason,
      note: adjustmentNote.trim(),
      status,
      createdAt: now,
      createdBy: currentUser.fullName,
      relatedSource: item.itemName,
      overrideAllowed: currentUser.role === "Admin",
    };
    persistAdjustments([request, ...adjustments]);
    persistInventory(items, {
      id: uid("move"),
      itemId: item.id,
      itemName: item.itemName,
      movementType: "Adjustment Pending",
      quantityChange: 0,
      quantityAfter: item.quantityOnHand,
      sourceLabel: getInventorySourceLabel(adjustmentDirection, adjustmentReason),
      note: request.note || "Pending approval",
      createdAt: now,
      createdBy: currentUser.fullName,
      adjustmentStatus: status,
      adjustmentReason,
      relatedSource: item.itemName,
    });
    onLogAudit?.({
      module: "Inventory",
      action: "inventory_adjustment_created",
      entityId: request.id,
      entityLabel: item.itemName,
      userId: currentUser.id,
      userName: currentUser.fullName,
      detail: `${status} inventory adjustment created for ${item.itemName} (${request.quantityChange})`,
    });
    setMessage(`${status} adjustment saved.`);
    setAdjustmentNote("");
  }

  const handleApplyAdjustment = (adjustmentId: string) => {
    const request = adjustments.find((row) => row.id === adjustmentId);
    const item = request ? items.find((row) => row.id === request.itemId) : null;
    if (!request || !item) return;
    if (request.status !== "Approved" && request.status !== "Draft") return;
    const desired = item.quantityOnHand + request.quantityChange;
    if (desired < 0 && currentUser.role !== "Admin") {
      setMessage("Negative stock blocked. Admin override required.");
      return;
    }
    let overrideReason = "";
    if (desired < 0) {
      overrideReason = safePrompt("Negative stock override reason:", "");
      if (!overrideReason.trim()) {
        setMessage("Override reason required.");
        return;
      }
    }
    const now = nowIso();
    const nextItems = items.map((row) => row.id === item.id ? { ...row, quantityOnHand: desired, updatedAt: now } : row);
    persistInventory(nextItems, {
      id: uid("move"),
      itemId: item.id,
      itemName: item.itemName,
      movementType: "Adjustment Applied",
      quantityChange: request.quantityChange,
      quantityAfter: desired,
      sourceLabel: request.reason,
      note: [request.note, overrideReason].filter(Boolean).join(" | ") || "Adjustment applied",
      createdAt: now,
      createdBy: currentUser.fullName,
      adjustmentStatus: "Applied",
      adjustmentReason: request.reason,
      approver: currentUser.fullName,
      decidedAt: request.decidedAt || now,
      appliedAt: now,
      relatedSource: item.itemName,
    });
    const nextAdjustments: InventoryAdjustmentRequest[] = adjustments.map((row) =>
      row.id === request.id
        ? { ...row, status: "Applied" as InventoryAdjustmentStatus, appliedAt: now, approver: row.approver || currentUser.fullName, decidedAt: row.decidedAt || now }
        : row
    );
    persistAdjustments(nextAdjustments);
    onLogAudit?.({
      module: "Inventory",
      action: "inventory_adjustment_applied",
      entityId: request.id,
      entityLabel: item.itemName,
      userId: currentUser.id,
      userName: currentUser.fullName,
      detail: `Applied inventory adjustment for ${item.itemName}: ${request.quantityChange}`,
      before: String(item.quantityOnHand),
      after: String(desired),
    });
    setMessage("Adjustment applied.");
  };

  const handleApproveAdjustment = (adjustmentId: string, status: Extract<InventoryAdjustmentStatus, "Approved" | "Rejected">) => {
    if (!canApprove) {
      setMessage("Approval restricted to Admin users.");
      return;
    }
    const now = nowIso();
    const next: InventoryAdjustmentRequest[] = adjustments.map((row) =>
      row.id === adjustmentId
        ? { ...row, status, approver: currentUser.fullName, decidedAt: now }
        : row
    );
    persistAdjustments(next);
    const request = next.find((row) => row.id === adjustmentId);
    if (request) {
      persistInventory(items, {
        id: uid("move"),
        itemId: request.itemId,
        itemName: request.itemName,
        movementType: status === "Approved" ? "Adjustment Approved" : "Adjustment Rejected",
        quantityChange: 0,
        quantityAfter: request.quantityAfter,
        sourceLabel: request.reason,
        note: request.note || `${status} adjustment`,
        createdAt: now,
        createdBy: currentUser.fullName,
        adjustmentStatus: status,
        adjustmentReason: request.reason,
        approver: currentUser.fullName,
        decidedAt: now,
        relatedSource: request.itemName,
      });
    }
    onLogAudit?.({
      module: "Inventory",
      action: status === "Approved" ? "inventory_adjustment_approved" : "inventory_adjustment_rejected",
      entityId: adjustmentId,
      entityLabel: request?.itemName || adjustmentId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      detail: `${status} inventory adjustment ${request?.itemName || adjustmentId}`,
    });
    setMessage(`Adjustment ${status.toLowerCase()}.`);
  };

  function moveOnQtyChange(changeType: AdjustmentDirection, qty: number, currentQty: number) {
    if (deductionMode === "Manual only") {
      setMessage("Manual only mode: no stock change applied. Save a draft or submit for approval.");
      return null;
    }
    if (deductionMode === "Prompt before deduction" && !safeConfirm(`Apply ${changeType} of ${qty}?`)) {
      setMessage("Deduction cancelled.");
      return null;
    }
    const nextQty = getNextQuantity(currentQty, changeType, qty);
    if (nextQty < 0 && currentUser.role !== "Admin") {
      setMessage("Negative stock blocked. Admin override required.");
      return null;
    }
    return nextQty;
  }

  const adjustStock = () => {
    const qty = numberValue(adjustmentQty);
    const item = items.find((row) => row.id === selectedItemId);
    if (!item || qty <= 0) return;
    const nextQty = moveOnQtyChange(adjustmentDirection, qty, item.quantityOnHand);
    if (nextQty === null) return;
    if (nextQty < 0 && currentUser.role === "Admin") {
      const overrideReason = safePrompt("Negative stock override reason:", "");
      if (!overrideReason.trim()) {
        setMessage("Override reason required.");
        return;
      }
      const nextItems = items.map((row) => row.id === item.id ? { ...row, quantityOnHand: nextQty, updatedAt: nowIso() } : row);
      persistInventory(nextItems, {
        id: uid("move"),
        itemId: item.id,
        itemName: item.itemName,
        movementType: adjustmentDirection,
        quantityChange: getAdjustmentQuantity(adjustmentDirection, qty, item.quantityOnHand),
        quantityAfter: nextQty,
        sourceLabel: getInventorySourceLabel(adjustmentDirection, adjustmentReason),
        note: [adjustmentReason, adjustmentNote.trim(), overrideReason].filter(Boolean).join(" | "),
        createdAt: nowIso(),
        createdBy: currentUser.fullName,
        adjustmentStatus: "Applied",
        adjustmentReason,
        approver: currentUser.fullName,
        decidedAt: nowIso(),
        appliedAt: nowIso(),
        relatedSource: item.itemName,
      });
      setMessage("Stock adjustment saved with override.");
      return;
    }
    if (deductionMode === "Auto-deduct with log") {
      const nextItems = items.map((row) => row.id === item.id ? { ...row, quantityOnHand: nextQty, updatedAt: nowIso() } : row);
      persistInventory(nextItems, {
        id: uid("move"),
        itemId: item.id,
        itemName: item.itemName,
        movementType: adjustmentDirection,
        quantityChange: getAdjustmentQuantity(adjustmentDirection, qty, item.quantityOnHand),
        quantityAfter: nextQty,
        sourceLabel: getInventorySourceLabel(adjustmentDirection, adjustmentReason),
        note: adjustmentNote.trim() || "Auto-deduct with log",
        createdAt: nowIso(),
        createdBy: currentUser.fullName,
        adjustmentStatus: "Applied",
        adjustmentReason,
        appliedAt: nowIso(),
        relatedSource: item.itemName,
      });
      onLogAudit?.({
        module: "Inventory",
        action: "inventory_adjusted",
        entityId: item.id,
        entityLabel: item.itemName,
        userId: currentUser.id,
        userName: currentUser.fullName,
        detail: `${adjustmentDirection} on ${item.itemName} by ${qty}`,
      });
      setMessage("Stock adjustment saved.");
      return;
    }
    createAdjustment("Pending Approval");
  };

  const receivePartsRequest = () => {
    const request = partsRequests.find((row) => row.id === selectedPartsRequestId);
    if (!request) return;
    const qty = numberValue(request.quantity || "1") || 1;
    const match = findMatchingItem(items, request);
    const now = nowIso();
    if (deductionMode === "Prompt before deduction" && !safeConfirm(`Receive ${qty} into inventory from ${request.requestNumber}?`)) {
      setMessage("Receipt cancelled.");
      return;
    }

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

    persistInventory(nextItems, {
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
      adjustmentStatus: "Applied",
      adjustmentReason: "New Stock",
      appliedAt: now,
      relatedSource: request.requestNumber,
    });
    onLogAudit?.({
      module: "Inventory",
      action: "inventory_received_parts_request",
      entityId: request.id,
      entityLabel: request.requestNumber,
      userId: currentUser.id,
      userName: currentUser.fullName,
      detail: `Received ${qty} ${targetItem.itemName} from ${request.requestNumber}`,
    });
    setPartsRequests((current) => current.map((row) => row.id === request.id ? { ...row, status: row.status === "Arrived" ? "Parts Arrived" : row.status, updatedAt: now } : row));
    setMessage("Arrived part received into inventory.");
  };

  const useInventoryOnRo = () => {
    const item = items.find((row) => row.id === selectedItemId);
    const ro = repairOrders.find((row) => row.id === selectedRoId);
    const qty = numberValue(useQty);
    if (!item || !ro || qty <= 0) return;
    const mode = deductionMode;
    if (mode === "Manual only") {
      setMessage("Manual only mode: reminder logged, no stock deducted.");
      return;
    }
    if (mode === "Prompt before deduction" && !safeConfirm(`Use ${qty} of ${item.itemName} on RO ${ro.roNumber}?`)) {
      setMessage("Deduction cancelled.");
      return;
    }
    const nextQty = item.quantityOnHand - qty;
    if (nextQty < 0 && currentUser.role !== "Admin") {
      setMessage("Negative stock blocked. Admin override required.");
      return;
    }
    let overrideReason = "";
    if (nextQty < 0) {
      overrideReason = safePrompt("Negative stock override reason:", "");
      if (!overrideReason.trim()) {
        setMessage("Override reason required.");
        return;
      }
    }
    const finalQty = Math.max(nextQty, 0);
    const now = nowIso();
    const nextItem = { ...item, quantityOnHand: finalQty, updatedAt: now };
    persistInventory(items.map((row) => row.id === item.id ? nextItem : row), {
      id: uid("move"),
      itemId: item.id,
      itemName: item.itemName,
      movementType: "Used On RO",
      quantityChange: -qty,
      quantityAfter: finalQty,
      sourceLabel: ro.roNumber,
      note: overrideReason ? `Inventory part used on repair order | ${overrideReason}` : "Inventory part used on repair order",
      createdAt: now,
      createdBy: currentUser.fullName,
      adjustmentStatus: "Applied",
      adjustmentReason: "Used for RO",
      appliedAt: now,
      relatedSource: ro.roNumber,
    });
    onLogAudit?.({
      module: "Inventory",
      action: "inventory_used_on_ro",
      entityId: ro.id,
      entityLabel: ro.roNumber,
      userId: currentUser.id,
      userName: currentUser.fullName,
      detail: `Used ${qty} ${item.itemName} on RO ${ro.roNumber}`,
    });
    setMessage(mode === "Auto-deduct with log" ? `Inventory deducted and linked to ${ro.roNumber}.` : `Inventory use noted for ${ro.roNumber}.`);
  };

  const lowStockItems = useMemo(() => items.filter((item) => item.active && item.quantityOnHand <= item.reorderLevel), [items]);
  const reorderNeededItems = useMemo(() => items.filter((item) => item.active && item.quantityOnHand <= item.reorderLevel), [items]);
  const arrivedRequests = partsRequests.filter((row) => ["Arrived", "Parts Arrived"].includes(row.status));
  const activeRos = repairOrders.filter((ro) => !["Released", "Closed"].includes(ro.status));
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
  const selectedAdjustment = adjustments.find((row) => row.id === selectedAdjustmentId) ?? null;
  const visibleAdjustments = adjustments.slice(0, 8);
  const itemMovements = selectedItem ? movements.filter((movement) => movement.itemId === selectedItem.id) : movements.slice(0, 8);

  useEffect(() => {
    writeInventoryDeductionMode(deductionMode);
  }, [deductionMode]);

  return (
    <section style={styles.panel} data-testid="inventory-control-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Inventory Stock Control</div>
          <h2 style={styles.title}>Parts and supplies inventory</h2>
          <div style={styles.subtitle}>Internal stock tracking with controlled adjustments and movement logs.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={lowStockItems.length ? styles.lowBadge : styles.badge}>{lowStockItems.length} low stock</span>
          <span style={reorderNeededItems.length ? styles.lowBadge : styles.badge}>{reorderNeededItems.length} reorder needed</span>
        </div>
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

      <div style={{ ...styles.formGrid, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(5, minmax(0, 1fr))" }}>
        <select data-testid="inventory-adjust-item" style={styles.input} value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)}>
          <option value="">Select inventory item</option>
          {items.map((item) => <option key={item.id} value={item.id}>{item.itemName} / {item.quantityOnHand}</option>)}
        </select>
        <select data-testid="inventory-adjust-type" style={styles.input} value={adjustmentDirection} onChange={(event) => setAdjustmentDirection(event.target.value as AdjustmentDirection)}>
          <option>Add Stock</option>
          <option>Deduct Stock</option>
          <option>Correction</option>
        </select>
        <select data-testid="inventory-adjust-reason" style={styles.input} value={adjustmentReason} onChange={(event) => setAdjustmentReason(event.target.value as InventoryAdjustmentReason)}>
          <option>New Stock</option>
          <option>Correction</option>
          <option>Damaged</option>
          <option>Lost</option>
          <option>Used for RO</option>
          <option>Return to Supplier</option>
          <option>Other</option>
        </select>
        <input data-testid="inventory-adjust-qty" style={styles.input} value={adjustmentQty} onChange={(event) => setAdjustmentQty(event.target.value)} placeholder="Quantity" />
        <input data-testid="inventory-adjust-note" style={styles.input} value={adjustmentNote} onChange={(event) => setAdjustmentNote(event.target.value)} placeholder="Adjustment note" />
        <button type="button" data-testid="inventory-adjust-draft" style={styles.secondaryButton} onClick={() => createAdjustment("Draft")} disabled={!selectedItemId}>Save Draft</button>
        <button type="button" data-testid="inventory-adjust-submit" style={styles.button} onClick={() => createAdjustment("Pending Approval")} disabled={!selectedItemId}>Submit for Approval</button>
        <button type="button" data-testid="inventory-adjust-save" style={styles.button} onClick={adjustStock}>Apply Based on Mode</button>
        <div style={styles.modeWrap}>
          <span style={styles.modeLabel}>Stock deduction mode</span>
          <select data-testid="inventory-deduction-mode" style={styles.input} value={deductionMode} onChange={(event) => setDeductionMode(event.target.value as InventoryDeductionMode)}>
            <option>Manual only</option>
            <option>Prompt before deduction</option>
            <option>Auto-deduct with log</option>
          </select>
        </div>
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
          <button key={item.id} type="button" style={styles.cardButton} data-testid={`inventory-item-${item.id}`} onClick={() => setSelectedItemId(item.id)}>
            <div style={styles.cardHeader}>
              <strong>{item.itemName}</strong>
              <span style={item.quantityOnHand <= item.reorderLevel ? styles.lowBadge : styles.badge}>{item.quantityOnHand <= item.reorderLevel ? "Low Stock" : "In Stock"}</span>
            </div>
            <div style={styles.meta}>{item.sku || "No SKU"} / {item.category} / {item.brand || "No brand"}</div>
            <div style={styles.meta}>Qty {item.quantityOnHand} / Reorder {item.reorderLevel} / Supplier {item.supplier || "-"}</div>
            {showCost ? <div style={styles.meta} data-testid={`inventory-cost-${item.id}`}>Cost {money(item.unitCost)} / Sell {money(item.sellingPrice)}</div> : <div style={styles.meta}>Sell {money(item.sellingPrice)}</div>}
            <div style={styles.meta}>Status {item.active ? "Active" : "Inactive"}</div>
          </button>
        ))}
      </div>

      {selectedItem ? (
        <div style={styles.log} data-testid="inventory-detail-panel">
          <div style={styles.detailHeader}>
            <strong>Inventory Detail</strong>
            <BackToListButton onClick={() => setSelectedItemId("")} testId="inventory-back-to-list" />
          </div>
          <div style={styles.meta}>{selectedItem.itemName} / {selectedItem.sku || "No SKU"}</div>
          <div style={styles.meta}>{selectedItem.category} / {selectedItem.brand || "No brand"} / Supplier {selectedItem.supplier || "-"}</div>
          <div style={styles.meta}>Qty {selectedItem.quantityOnHand} / Reorder {selectedItem.reorderLevel}</div>
          {showCost ? <div style={styles.meta}>Cost {money(selectedItem.unitCost)} / Sell {money(selectedItem.sellingPrice)}</div> : <div style={styles.meta}>Sell {money(selectedItem.sellingPrice)}</div>}
          <div style={styles.meta}>Status {selectedItem.active ? "Active" : "Inactive"}</div>
        </div>
      ) : null}

      <div style={styles.log} data-testid="inventory-adjustment-log">
        <strong>Adjustment approvals</strong>
        {visibleAdjustments.length === 0 ? <div style={styles.logRow}>No adjustment requests yet.</div> : null}
        {visibleAdjustments.map((adjustment) => (
          <article key={adjustment.id} style={styles.adjustmentRow} data-testid={`inventory-adjustment-${adjustment.id}`} onClick={() => setSelectedAdjustmentId(adjustment.id)}>
            <div style={styles.cardHeader}>
              <strong>{adjustment.itemName}</strong>
              <span style={adjustmentStatusStyle(adjustment.status)}>{adjustment.status}</span>
            </div>
            <div style={styles.meta}>{adjustment.reason} / Qty change {adjustment.quantityChange} / Target qty {adjustment.quantityAfter}</div>
            <div style={styles.meta}>{adjustment.note || "No note"} / Created by {adjustment.createdBy}</div>
            <div style={styles.actions}>
              <button type="button" style={styles.secondaryButton} onClick={() => handleApproveAdjustment(adjustment.id, "Approved")} disabled={!canApprove || adjustment.status === "Rejected" || adjustment.status === "Applied"}>Approve</button>
              <button type="button" style={styles.secondaryButton} onClick={() => handleApproveAdjustment(adjustment.id, "Rejected")} disabled={!canApprove || adjustment.status === "Applied"}>Reject</button>
              <button type="button" style={styles.button} onClick={() => handleApplyAdjustment(adjustment.id)} disabled={adjustment.status !== "Approved" && adjustment.status !== "Draft"}>Apply</button>
            </div>
          </article>
        ))}
      </div>

      {selectedAdjustment ? (
        <div style={styles.log} data-testid="inventory-adjustment-detail-panel">
          <div style={styles.detailHeader}>
            <strong>Adjustment Detail</strong>
            <BackToListButton onClick={() => setSelectedAdjustmentId("")} testId="inventory-adjustment-back-to-list" />
          </div>
          <div style={styles.meta}>{selectedAdjustment.itemName}</div>
          <div style={styles.meta}>{selectedAdjustment.reason} / {selectedAdjustment.status}</div>
          <div style={styles.meta}>Change {selectedAdjustment.quantityChange} / Target {selectedAdjustment.quantityAfter}</div>
          <div style={styles.meta}>Created {selectedAdjustment.createdAt} by {selectedAdjustment.createdBy}</div>
          <div style={styles.meta}>Approver {selectedAdjustment.approver || "-"}</div>
          <div style={styles.meta}>Decision {selectedAdjustment.decidedAt || "-"}</div>
          <div style={styles.meta}>Applied {selectedAdjustment.appliedAt || "-"}</div>
          <div style={styles.meta}>{selectedAdjustment.note || "No note provided."}</div>
        </div>
      ) : null}

      <div style={styles.log} data-testid="inventory-movement-log">
        <strong>Movement log</strong>
        {itemMovements.slice(0, 10).map((movement) => (
          <div key={movement.id} style={styles.logRow}>
            {movement.movementType}: {movement.itemName} ({movement.quantityChange}) / {movement.sourceLabel} / {movement.adjustmentReason || "-"} / {movement.adjustmentStatus || "-"}
          </div>
        ))}
      </div>
    </section>
  );
}

function adjustmentStatusStyle(status: InventoryAdjustmentRequest["status"]): React.CSSProperties {
  if (status === "Approved") return { borderRadius: 999, padding: "4px 8px", background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 800 };
  if (status === "Rejected") return { borderRadius: 999, padding: "4px 8px", background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 800 };
  if (status === "Applied") return { borderRadius: 999, padding: "4px 8px", background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 800 };
  if (status === "Pending Approval") return { borderRadius: 999, padding: "4px 8px", background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 800 };
  return { borderRadius: 999, padding: "4px 8px", background: "#e2e8f0", color: "#475569", fontSize: 11, fontWeight: 800 };
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
  secondaryButton: { border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", background: "#fff", color: "#334155", fontWeight: 700, cursor: "pointer" },
  message: { color: "#334155", fontSize: 13, fontWeight: 700 },
  itemGrid: { display: "grid", gap: 8, marginTop: 12 },
  cardButton: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc", textAlign: "left" as const, cursor: "pointer" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" },
  meta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  inactive: { display: "inline-flex", marginTop: 8, borderRadius: 999, padding: "4px 8px", background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 800 },
  log: { display: "grid", gap: 8, marginTop: 12, border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#fff" },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" },
  logRow: { color: "#475569", fontSize: 12 },
  adjustmentRow: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc", cursor: "pointer" },
  modeWrap: { display: "grid", gap: 4 },
  modeLabel: { fontSize: 12, color: "#64748b", fontWeight: 700 },
};

export default InventoryControlPanel;
