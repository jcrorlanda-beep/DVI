import React, { useEffect, useMemo, useState } from "react";
import type { SessionUser, RepairOrderRecord, ROStatus, WorkLineStatus } from "../shared/types";
import { formatCurrency, parseMoneyInput, getResponsiveSpan, formatDateTime } from "../shared/helpers";

// --- local types ---

type PartsRequestStatus =
  | "Draft"
  | "Requested"
  | "Sent to Suppliers"
  | "Waiting for Bids"
  | "Bidding"
  | "Supplier Selected"
  | "Ordered"
  | "In Transit"
  | "Shipped"
  | "Arrived"
  | "Parts Arrived"
  | "Return Requested"
  | "Return Approved"
  | "Return Rejected"
  | "Closed"
  | "Cancelled";

type PartsRequestUrgency = "Low" | "Medium" | "High";
type SupplierBidCondition = "Brand New" | "OEM" | "Replacement" | "Surplus";
type PartsMediaOwner = "Workshop" | "Supplier" | "Return";
type PartsReturnResponseStatus = "Requested" | "Approved" | "Rejected" | "Replacement in Process" | "Refund in Process";

type PartsMediaRecord = {
  id: string;
  owner: PartsMediaOwner;
  kind: string;
  fileName: string;
  previewDataUrl: string;
  addedAt: string;
  note: string;
  uploadedBy: string;
};

type SupplierBid = {
  id: string;
  supplierName: string;
  brand: string;
  quantity: string;
  unitCost: string;
  totalCost: string;
  deliveryTime: string;
  warrantyNote: string;
  condition: SupplierBidCondition;
  notes: string;
  createdAt: string;
  productPhotos: PartsMediaRecord[];
  invoiceFileName: string;
  shippingLabelFileName: string;
  trackingNumber: string;
  courierName: string;
  shippingNotes: string;
};

type PartsReturnRecord = {
  id: string;
  reason: string;
  notes: string;
  pictures: PartsMediaRecord[];
  createdAt: string;
  createdBy: string;
  responseStatus: PartsReturnResponseStatus;
  responseNotes: string;
  responsePictures: PartsMediaRecord[];
  respondedAt?: string;
  respondedBy?: string;
};

type PartsRequestRecord = {
  id: string;
  requestNumber: string;
  roId: string;
  roNumber: string;
  workLineId?: string;
  createdAt: string;
  updatedAt: string;
  requestedBy: string;
  status: PartsRequestStatus;
  partName: string;
  partNumber: string;
  quantity: string;
  urgency: PartsRequestUrgency;
  notes: string;
  customerSellingPrice: string;
  selectedBidId: string;
  plateNumber: string;
  vehicleLabel: string;
  accountLabel: string;
  updatedBy?: string;
  workshopPhotos: PartsMediaRecord[];
  bids: SupplierBid[];
  returnRecords: PartsReturnRecord[];
};

// --- local constants ---

const PARTS_BLOCKING_STATUSES: PartsRequestStatus[] = [
  "Draft",
  "Requested",
  "Sent to Suppliers",
  "Waiting for Bids",
  "Bidding",
  "Supplier Selected",
  "Ordered",
  "In Transit",
  "Shipped",
];

// --- local helpers ---

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function todayStamp(date = new Date()) {
  const yyyy = date.getFullYear().toString();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const STORAGE_KEY_COUNTERS = "dvi_phase2_counters_v1";

function nextDailyNumber(prefix: string) {
  const stamp = todayStamp();
  const counters = readLocalStorage<Record<string, number>>(STORAGE_KEY_COUNTERS, {});
  const key = `${prefix}_${stamp}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeLocalStorage(STORAGE_KEY_COUNTERS, counters);
  return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}

const MOBILE_EVIDENCE_MAX_WIDTH = 1280;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unable to load image."));
    img.src = source;
  });
}

async function optimizeImageForMobile(file: File) {
  const dataUrl = await fileToDataUrl(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, MOBILE_EVIDENCE_MAX_WIDTH / Math.max(image.width, 1));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

async function buildPartsMediaRecords(
  files: FileList | null,
  owner: PartsMediaOwner,
  kind: string,
  uploadedBy: string,
  note = ""
) {
  if (!files || files.length === 0) return [] as PartsMediaRecord[];
  const items: PartsMediaRecord[] = [];
  for (const file of Array.from(files)) {
    const previewDataUrl = await optimizeImageForMobile(file);
    items.push({
      id: uid("pmedia"),
      owner,
      kind,
      fileName: file.name,
      previewDataUrl,
      addedAt: new Date().toISOString(),
      note,
      uploadedBy,
    });
  }
  return items;
}

function getPartsRequestStatusStyle(status: PartsRequestStatus): React.CSSProperties {
  if (["Closed", "Parts Arrived", "Arrived", "Return Approved"].includes(status)) return styles.statusOk;
  if (["Cancelled", "Return Rejected"].includes(status)) return styles.statusLocked;
  if (["Ordered", "In Transit", "Shipped", "Waiting for Bids", "Sent to Suppliers", "Bidding", "Supplier Selected", "Return Requested"].includes(status)) return styles.statusWarning;
  return styles.statusInfo;
}

// --- local component ---

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{title}</div>
          {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

// --- component ---

function PartsPage({
  currentUser,
  repairOrders,
  setRepairOrders,
  partsRequests,
  setPartsRequests,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  setRepairOrders: React.Dispatch<React.SetStateAction<RepairOrderRecord[]>>;
  partsRequests: PartsRequestRecord[];
  setPartsRequests: React.Dispatch<React.SetStateAction<PartsRequestRecord[]>>;
  isCompactLayout: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [createForm, setCreateForm] = useState({
    roId: "",
    workLineId: "",
    partName: "",
    partNumber: "",
    quantity: "1",
    urgency: "Medium" as PartsRequestUrgency,
    notes: "",
    customerSellingPrice: "",
  });
  const [bidForm, setBidForm] = useState({
    supplierName: "",
    brand: "",
    quantity: "1",
    unitCost: "",
    deliveryTime: "",
    warrantyNote: "",
    condition: "Brand New" as SupplierBidCondition,
    notes: "",
  });
  const [returnForm, setReturnForm] = useState({ reason: "", notes: "" });
  const [createError, setCreateError] = useState("");
  const [bidError, setBidError] = useState("");

  const sortedRepairOrders = useMemo(
    () => [...repairOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [repairOrders]
  );

  const sortedRequests = useMemo(
    () => [...partsRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [partsRequests]
  );

  const visibleRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sortedRequests;
    return sortedRequests.filter((row) =>
      [row.requestNumber, row.roNumber, row.partName, row.partNumber, row.plateNumber, row.vehicleLabel, row.accountLabel, row.status, row.urgency]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [search, sortedRequests]);

  const selectedRequest = useMemo(
    () => visibleRequests.find((row) => row.id === selectedRequestId) ?? visibleRequests[0] ?? null,
    [selectedRequestId, visibleRequests]
  );

  useEffect(() => {
    if (!selectedRequestId && visibleRequests.length > 0) {
      setSelectedRequestId(visibleRequests[0].id);
      return;
    }
    if (selectedRequestId && !visibleRequests.some((row) => row.id === selectedRequestId)) {
      setSelectedRequestId(visibleRequests[0]?.id ?? "");
    }
  }, [selectedRequestId, visibleRequests]);

  const selectedRO = useMemo(
    () => sortedRepairOrders.find((row) => row.id === createForm.roId) ?? null,
    [createForm.roId, sortedRepairOrders]
  );

  // Work lines eligible for parts linkage: approved and not yet completed
  const linkableWorkLines = useMemo(() => {
    if (!selectedRO) return [];
    return selectedRO.workLines.filter(
      (line) =>
        line.approvalDecision === "Approved" &&
        line.status !== "Completed"
    );
  }, [selectedRO]);

  // Reset workLineId when RO changes
  useEffect(() => {
    setCreateForm((prev) => ({ ...prev, workLineId: "" }));
  }, [createForm.roId]);

  const setLinkedRoStatus = (roId: string, status: ROStatus) => {
    if (!roId) return;
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === roId && !["Released", "Closed"].includes(row.status)
          ? { ...row, status, updatedAt: new Date().toISOString() }
          : row
      )
    );
  };

  const setLinkedWorkLineStatus = (roId: string, workLineId: string, status: WorkLineStatus) => {
    if (!roId || !workLineId) return;
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === roId
          ? {
              ...row,
              updatedAt: new Date().toISOString(),
              workLines: row.workLines.map((line) =>
                line.id === workLineId ? { ...line, status } : line
              ),
            }
          : row
      )
    );
  };

  const updateRequest = (requestId: string, updater: (request: PartsRequestRecord) => PartsRequestRecord) => {
    setPartsRequests((prev) => prev.map((row) => (row.id === requestId ? updater(row) : row)));
  };

  const createRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.roId) {
      setCreateError("Please select a linked RO.");
      return;
    }
    const partName = createForm.partName.trim();
    const quantity = createForm.quantity.trim();
    if (!partName || !quantity) {
      setCreateError("Part name and quantity are required.");
      return;
    }
    const ro = sortedRepairOrders.find((row) => row.id === createForm.roId);
    if (!ro) {
      setCreateError("Linked RO not found.");
      return;
    }

    const record: PartsRequestRecord = {
      id: uid("prq"),
      requestNumber: nextDailyNumber("PR"),
      roId: ro.id,
      roNumber: ro.roNumber,
      workLineId: createForm.workLineId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestedBy: currentUser.fullName,
      status: "Draft",
      partName,
      partNumber: createForm.partNumber.trim(),
      quantity,
      urgency: createForm.urgency,
      notes: createForm.notes.trim(),
      customerSellingPrice: createForm.customerSellingPrice.trim(),
      selectedBidId: "",
      plateNumber: ro.plateNumber || ro.conductionNumber,
      vehicleLabel: [ro.make, ro.model, ro.year].filter(Boolean).join(" "),
      accountLabel: ro.accountLabel,
      workshopPhotos: [],
      bids: [],
      returnRecords: [],
    };

    setPartsRequests((prev) => [record, ...prev]);
    setSelectedRequestId(record.id);
    setCreateForm({ roId: "", workLineId: "", partName: "", partNumber: "", quantity: "1", urgency: "Medium", notes: "", customerSellingPrice: "" });
    setCreateError("");

    setLinkedRoStatus(ro.id, "Waiting Parts");
    if (record.workLineId) {
      setLinkedWorkLineStatus(ro.id, record.workLineId, "Waiting Parts");
    }
  };

  const addBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    const supplierName = bidForm.supplierName.trim();
    const unitCost = bidForm.unitCost.trim();
    if (!supplierName || !unitCost) {
      setBidError("Supplier name and unit cost are required.");
      return;
    }
    const quantity = bidForm.quantity.trim() || selectedRequest.quantity || "1";
    const totalCost = String(parseMoneyInput(unitCost) * Math.max(Number(quantity) || 1, 1));
    const bid: SupplierBid = {
      id: uid("bid"),
      supplierName,
      brand: bidForm.brand.trim(),
      quantity,
      unitCost,
      totalCost,
      deliveryTime: bidForm.deliveryTime.trim(),
      warrantyNote: bidForm.warrantyNote.trim(),
      condition: bidForm.condition,
      notes: bidForm.notes.trim(),
      createdAt: new Date().toISOString(),
      productPhotos: [],
      invoiceFileName: "",
      shippingLabelFileName: "",
      trackingNumber: "",
      courierName: "",
      shippingNotes: "",
    };
    updateRequest(selectedRequest.id, (request) => ({
      ...request,
      bids: [bid, ...request.bids],
      status: request.status === "Draft" || request.status === "Requested" ? "Waiting for Bids" : request.status,
      updatedAt: new Date().toISOString(),
    }));
    setBidForm({ supplierName: "", brand: "", quantity: selectedRequest.quantity || "1", unitCost: "", deliveryTime: "", warrantyNote: "", condition: "Brand New", notes: "" });
    setBidError("");
  };

  const uploadWorkshopPhotos = async (request: PartsRequestRecord, files: FileList | null, kind: string) => {
    const media = await buildPartsMediaRecords(files, "Workshop", kind, currentUser.fullName);
    if (media.length === 0) return;
    updateRequest(request.id, (row) => ({ ...row, workshopPhotos: [...row.workshopPhotos, ...media], updatedAt: new Date().toISOString() }));
  };

  const createReturnRequest = async (request: PartsRequestRecord) => {
    if (!returnForm.reason.trim()) return;
    const returnPhotoInput = document.getElementById(`return-photos-${request.id}`) as HTMLInputElement | null;
    const pictures = await buildPartsMediaRecords(returnPhotoInput?.files ?? null, "Return", "Return Evidence", currentUser.fullName);
    const entry: PartsReturnRecord = {
      id: uid("pret"),
      reason: returnForm.reason.trim(),
      notes: returnForm.notes.trim(),
      pictures,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.fullName,
      responseStatus: "Requested",
      responseNotes: "",
      responsePictures: [],
    };
    updateRequest(request.id, (row) => ({ ...row, returnRecords: [entry, ...row.returnRecords], status: "Return Requested", updatedAt: new Date().toISOString() }));
    if (returnPhotoInput) returnPhotoInput.value = "";
    setReturnForm({ reason: "", notes: "" });
  };

  const selectBid = (request: PartsRequestRecord, bidId: string) => {
    updateRequest(request.id, (row) => ({ ...row, selectedBidId: bidId, status: "Supplier Selected", updatedAt: new Date().toISOString() }));
  };

  const selectedBid = selectedRequest?.bids.find((bid) => bid.id === selectedRequest.selectedBidId) ?? null;
  const internalCost = selectedBid ? parseMoneyInput(selectedBid.totalCost) : 0;
  const customerPrice = selectedRequest ? parseMoneyInput(selectedRequest.customerSellingPrice) : 0;
  const estimatedMargin = customerPrice - internalCost;

  const requestSummary = useMemo(
    () => ({
      total: visibleRequests.length,
      waitingBids: visibleRequests.filter((row) => ["Sent to Suppliers", "Waiting for Bids", "Bidding"].includes(row.status)).length,
      supplierSelected: visibleRequests.filter((row) => row.status === "Supplier Selected").length,
      inTransit: visibleRequests.filter((row) => ["Ordered", "In Transit", "Shipped"].includes(row.status)).length,
      arrived: visibleRequests.filter((row) => ["Arrived", "Parts Arrived"].includes(row.status)).length,
      returns: visibleRequests.filter((row) => ["Return Requested", "Return Approved", "Return Rejected"].includes(row.status)).length,
      closed: visibleRequests.filter((row) => row.status === "Closed").length,
    }),
    [visibleRequests]
  );

  const totalSelectedBidsValue = useMemo(
    () => visibleRequests.reduce((sum, row) => {
      const selected = row.bids.find((bid) => bid.id === row.selectedBidId);
      return sum + parseMoneyInput(selected?.totalCost ?? "0");
    }, 0),
    [visibleRequests]
  );

  const setRequestStatus = (request: PartsRequestRecord, status: PartsRequestStatus) => {
    updateRequest(request.id, (row) => ({ ...row, status, updatedAt: new Date().toISOString() }));
    if (status === "Arrived" || status === "Parts Arrived") {
      setLinkedRoStatus(request.roId, "In Progress");
      if (request.workLineId) {
        setLinkedWorkLineStatus(request.roId, request.workLineId, "In Progress");
      }
    }
    if (PARTS_BLOCKING_STATUSES.includes(status)) {
      setLinkedRoStatus(request.roId, "Waiting Parts");
      if (request.workLineId) {
        setLinkedWorkLineStatus(request.roId, request.workLineId, "Waiting Parts");
      }
    }
  };

  // Look up linked work line for the selected request
  const selectedRequestRO = useMemo(
    () => (selectedRequest ? repairOrders.find((row) => row.id === selectedRequest.roId) ?? null : null),
    [selectedRequest, repairOrders]
  );
  const linkedWorkLine = useMemo(
    () =>
      selectedRequest?.workLineId && selectedRequestRO
        ? selectedRequestRO.workLines.find((line) => line.id === selectedRequest.workLineId) ?? null
        : null,
    [selectedRequest, selectedRequestRO]
  );

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Parts + Supplier Bidding Control Center"
            subtitle="Share workshop reference pictures, track supplier shipping, and manage returns with reasons and pictures"
            right={<span style={styles.statusInfo}>{requestSummary.total} visible requests</span>}
          >
            <div style={styles.heroText}>
              Parts requests now support workshop camera/upload pictures, supplier item pictures, invoice and shipping label tracking, in-transit updates, and return notifications with reason and photo evidence.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}><div style={styles.statCard}><div style={styles.statLabel}>Waiting Bids</div><div style={styles.statValue}>{requestSummary.waitingBids}</div><div style={styles.statNote}>Sent or waiting for supplier pricing</div></div></div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}><div style={styles.statCard}><div style={styles.statLabel}>Supplier Selected</div><div style={styles.statValue}>{requestSummary.supplierSelected}</div><div style={styles.statNote}>Ready for purchasing decision</div></div></div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}><div style={styles.statCard}><div style={styles.statLabel}>In Transit</div><div style={styles.statValue}>{requestSummary.inTransit}</div><div style={styles.statNote}>Tracking / shipping uploaded</div></div></div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}><div style={styles.statCard}><div style={styles.statLabel}>Returns</div><div style={styles.statValue}>{requestSummary.returns}</div><div style={styles.statNote}>Requests needing return action</div></div></div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}><div style={styles.statCard}><div style={styles.statLabel}>Arrived</div><div style={styles.statValue}>{requestSummary.arrived}</div><div style={styles.statNote}>Ready to resume job work</div></div></div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}><div style={styles.statCard}><div style={styles.statLabel}>Selected Bid Value</div><div style={styles.statValueSmall}>{formatCurrency(totalSelectedBidsValue)}</div><div style={styles.statNote}>Internal purchasing visibility</div></div></div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <Card title="Create Parts Request" subtitle="Link request to a repair order and optionally to a specific approved work line">
            <form onSubmit={createRequest} style={styles.formStack}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Linked RO</label>
                <select style={styles.select} value={createForm.roId} onChange={(e) => setCreateForm((prev) => ({ ...prev, roId: e.target.value }))}>
                  <option value="">Select RO</option>
                  {sortedRepairOrders.map((row) => <option key={row.id} value={row.id}>{row.roNumber} — {row.plateNumber || row.conductionNumber || "No Plate"} — {row.accountLabel}</option>)}
                </select>
                {selectedRO ? <div style={styles.formHint}>Vehicle: {[selectedRO.make, selectedRO.model, selectedRO.year].filter(Boolean).join(" ")} • Status: {selectedRO.status}</div> : null}
              </div>

              {selectedRO && linkableWorkLines.length > 0 ? (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Linked Work Line (optional)</label>
                  <select style={styles.select} value={createForm.workLineId} onChange={(e) => setCreateForm((prev) => ({ ...prev, workLineId: e.target.value }))}>
                    <option value="">No specific work line</option>
                    {linkableWorkLines.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.title || "Untitled"} — {line.category || "General"} [{line.status}]
                      </option>
                    ))}
                  </select>
                  <div style={styles.formHint}>Linking a work line blocks its completion until parts arrive.</div>
                </div>
              ) : selectedRO && linkableWorkLines.length === 0 ? (
                <div style={styles.formHint}>No approved in-progress work lines available to link.</div>
              ) : null}

              <div style={styles.formGroup}><label style={styles.label}>Part Name</label><input style={styles.input} value={createForm.partName} onChange={(e) => setCreateForm((prev) => ({ ...prev, partName: e.target.value }))} placeholder="Example: Front brake pads" /></div>
              <div style={isCompactLayout ? styles.formStack : styles.twoColumnForm}>
                <div style={styles.formGroup}><label style={styles.label}>Part Number</label><input style={styles.input} value={createForm.partNumber} onChange={(e) => setCreateForm((prev) => ({ ...prev, partNumber: e.target.value }))} placeholder="Optional part number" /></div>
                <div style={styles.formGroup}><label style={styles.label}>Quantity</label><input style={styles.input} value={createForm.quantity} onChange={(e) => setCreateForm((prev) => ({ ...prev, quantity: e.target.value }))} placeholder="1" /></div>
              </div>
              <div style={isCompactLayout ? styles.formStack : styles.twoColumnForm}>
                <div style={styles.formGroup}><label style={styles.label}>Urgency</label><select style={styles.select} value={createForm.urgency} onChange={(e) => setCreateForm((prev) => ({ ...prev, urgency: e.target.value as PartsRequestUrgency }))}>{(["Low", "Medium", "High"] as PartsRequestUrgency[]).map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                <div style={styles.formGroup}><label style={styles.label}>Customer Selling Price</label><input style={styles.input} value={createForm.customerSellingPrice} onChange={(e) => setCreateForm((prev) => ({ ...prev, customerSellingPrice: e.target.value }))} placeholder="Optional customer price" /></div>
              </div>
              <div style={styles.formGroup}><label style={styles.label}>Request Notes</label><textarea style={styles.textarea} rows={3} value={createForm.notes} onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Specs, preferred brand, supplier notes, or urgency context" /></div>
              {createError ? <div style={styles.errorBox}>{createError}</div> : null}
              <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActions}><button type="submit" style={styles.primaryButton}>Create Parts Request</button></div>
            </form>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <Card title="Parts Requests" subtitle="Newest to oldest with media, shipping, and return visibility" right={<span style={styles.statusNeutral}>{visibleRequests.length} requests</span>}>
            <div style={styles.filterBar}><input style={styles.input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search request no., RO, part, plate, customer, or status" /></div>
            <div style={styles.mobileCardList}>
              {visibleRequests.length === 0 ? <div style={styles.emptyState}>No parts requests yet.</div> : visibleRequests.map((row) => {
                const selected = row.id === selectedRequest?.id;
                const chosenBid = row.bids.find((bid) => bid.id === row.selectedBidId) ?? null;
                const linkedRO = repairOrders.find((ro) => ro.id === row.roId) ?? null;
                const linkedLine = row.workLineId && linkedRO ? linkedRO.workLines.find((line) => line.id === row.workLineId) ?? null : null;
                return (
                  <button key={row.id} type="button" onClick={() => setSelectedRequestId(row.id)} style={{ ...styles.mobileDataCard, ...(selected ? styles.mobileDataCardSelected : {}), textAlign: "left", width: "100%" }}>
                    <div style={styles.mobileDataCardHeader}><strong>{row.requestNumber}</strong><span style={getPartsRequestStatusStyle(row.status)}>{row.status}</span></div>
                    <div style={styles.mobileDataSecondary}>{row.partName}</div>
                    <div style={styles.mobileMetaRow}><span>RO</span><strong>{row.roNumber || "Unlinked"}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Vehicle</span><strong>{row.plateNumber || row.vehicleLabel || "-"}</strong></div>
                    {linkedLine ? (
                      <div style={styles.mobileMetaRow}>
                        <span>Work Line</span>
                        <strong style={linkedLine.status === "Waiting Parts" ? { color: "#b45309" } : undefined}>
                          {linkedLine.title || "Untitled"} [{linkedLine.status}]
                        </strong>
                      </div>
                    ) : null}
                    <div style={styles.mobileMetaRow}><span>Created</span><strong>{formatDateTime(row.createdAt)}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Workshop Photos</span><strong>{row.workshopPhotos.length}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Bids</span><strong>{row.bids.length}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Selected Supplier</span><strong>{chosenBid?.supplierName || "Not selected"}</strong></div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title={selectedRequest ? `Request Details — ${selectedRequest.requestNumber}` : "Request Details"} subtitle="Media, shipping, supplier selection, and returns all in one place">
            {!selectedRequest ? (
              <div style={styles.emptyState}>Select a parts request to manage bidding and status.</div>
            ) : (
              <div style={styles.formStack}>
                <div style={styles.detailBanner}>
                  <div style={styles.detailGrid}>
                    <div><strong>Part</strong><div>{selectedRequest.partName}</div></div>
                    <div><strong>Request No.</strong><div>{selectedRequest.requestNumber}</div></div>
                    <div><strong>RO</strong><div>{selectedRequest.roNumber}</div></div>
                    <div><strong>Vehicle</strong><div>{selectedRequest.plateNumber || selectedRequest.vehicleLabel || "-"}</div></div>
                    <div><strong>Requested By</strong><div>{selectedRequest.requestedBy}</div></div>
                    <div><strong>Created</strong><div>{formatDateTime(selectedRequest.createdAt)}</div></div>
                    {selectedRequest.updatedBy ? <div><strong>Last Updated By</strong><div>{selectedRequest.updatedBy}</div></div> : null}
                    {linkedWorkLine ? (
                      <div>
                        <strong>Work Line</strong>
                        <div style={linkedWorkLine.status === "Waiting Parts" ? { color: "#b45309", fontWeight: 700 } : undefined}>
                          {linkedWorkLine.title || "Untitled"} — {linkedWorkLine.status}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div style={styles.concernBanner}><strong>Request Notes:</strong> {selectedRequest.notes || "No notes entered."}</div>
                  {linkedWorkLine && linkedWorkLine.status === "Waiting Parts" ? (
                    <div style={styles.waitingPartsNotice}>
                      Work line is currently blocked — completion is locked until this parts request is marked as Arrived or Parts Arrived.
                    </div>
                  ) : null}
                </div>

                <div style={styles.grid}>
                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Request Status</div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Current Status</label>
                        <select style={styles.select} value={selectedRequest.status} onChange={(e) => setRequestStatus(selectedRequest, e.target.value as PartsRequestStatus)}>
                          {(["Draft", "Requested", "Sent to Suppliers", "Waiting for Bids", "Supplier Selected", "Ordered", "In Transit", "Parts Arrived", "Return Requested", "Return Approved", "Return Rejected", "Closed", "Cancelled"] as PartsRequestStatus[]).map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                      <div style={styles.mobileMetaRow}><span>Customer Selling Price</span><strong>{formatCurrency(customerPrice)}</strong></div>
                      <div style={styles.mobileMetaRow}><span>Selected Internal Cost</span><strong>{selectedBid ? formatCurrency(internalCost) : "-"}</strong></div>
                      <div style={styles.mobileMetaRow}><span>Estimated Margin</span><strong>{selectedBid ? formatCurrency(estimatedMargin) : "-"}</strong></div>
                      <div style={styles.inlineActions}>
                        <button type="button" style={styles.secondaryButton} onClick={() => setRequestStatus(selectedRequest, "Sent to Suppliers")}>Send to Suppliers</button>
                        <button type="button" style={{ ...styles.secondaryButton, ...(selectedRequest.selectedBidId ? {} : styles.buttonDisabled) }} disabled={!selectedRequest.selectedBidId} onClick={() => setRequestStatus(selectedRequest, "Supplier Selected")}>Confirm Supplier</button>
                        <button type="button" style={{ ...styles.secondaryButton, ...(selectedRequest.selectedBidId ? {} : styles.buttonDisabled) }} disabled={!selectedRequest.selectedBidId} onClick={() => setRequestStatus(selectedRequest, "Ordered")}>Mark Ordered</button>
                        <button type="button" style={styles.secondaryButton} onClick={() => setRequestStatus(selectedRequest, "In Transit")}>Mark In Transit</button>
                        <button type="button" style={styles.primaryButton} onClick={() => setRequestStatus(selectedRequest, "Parts Arrived")}>Mark Parts Arrived</button>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Workshop Reference Pictures</div>
                      <div style={styles.formHint}>Use Add Camera Photo for quick shots and Add Photos to append one or many workshop images for suppliers.</div>
                      <div style={styles.formStack}>
                        <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Add Camera Photo</label>
                            <input type="file" accept="image/*" capture="environment" multiple style={styles.input} onChange={(e) => uploadWorkshopPhotos(selectedRequest, e.target.files, "Workshop Camera Photo")} />
                            <div style={styles.formHint}>Use camera capture and repeat if your device only takes one photo at a time.</div>
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Add Photos</label>
                            <input type="file" accept="image/*" multiple style={styles.input} onChange={(e) => uploadWorkshopPhotos(selectedRequest, e.target.files, "Workshop Additional Photo")} />
                            <div style={styles.formHint}>New uploads are appended to the existing workshop photo list.</div>
                          </div>
                        </div>
                        {selectedRequest.workshopPhotos.length === 0 ? <div style={styles.emptyState}>No workshop pictures uploaded yet.</div> : <div style={styles.partsMediaGrid}>{selectedRequest.workshopPhotos.map((photo) => <div key={photo.id} style={styles.partsMediaCard}><img src={photo.previewDataUrl} alt={photo.fileName} style={styles.partsMediaImage} /><div style={styles.formHint}>{photo.fileName}</div></div>)}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.grid}>
                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Add Internal Supplier Bid</div>
                      <form onSubmit={addBid} style={styles.formStack}>
                        <div style={isCompactLayout ? styles.formStack : styles.twoColumnForm}>
                          <div style={styles.formGroup}><label style={styles.label}>Supplier</label><input style={styles.input} value={bidForm.supplierName} onChange={(e) => setBidForm((prev) => ({ ...prev, supplierName: e.target.value }))} placeholder="Supplier name" /></div>
                          <div style={styles.formGroup}><label style={styles.label}>Brand</label><input style={styles.input} value={bidForm.brand} onChange={(e) => setBidForm((prev) => ({ ...prev, brand: e.target.value }))} placeholder="Brand / manufacturer" /></div>
                        </div>
                        <div style={isCompactLayout ? styles.formStack : styles.threeColumnForm}>
                          <div style={styles.formGroup}><label style={styles.label}>Quantity</label><input style={styles.input} value={bidForm.quantity} onChange={(e) => setBidForm((prev) => ({ ...prev, quantity: e.target.value }))} /></div>
                          <div style={styles.formGroup}><label style={styles.label}>Unit Cost</label><input style={styles.input} value={bidForm.unitCost} onChange={(e) => setBidForm((prev) => ({ ...prev, unitCost: e.target.value }))} placeholder="Internal supplier cost" /></div>
                          <div style={styles.formGroup}><label style={styles.label}>Condition</label><select style={styles.select} value={bidForm.condition} onChange={(e) => setBidForm((prev) => ({ ...prev, condition: e.target.value as SupplierBidCondition }))}>{(["Brand New", "OEM", "Replacement", "Surplus"] as SupplierBidCondition[]).map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                        </div>
                        <div style={isCompactLayout ? styles.formStack : styles.twoColumnForm}>
                          <div style={styles.formGroup}><label style={styles.label}>Delivery Time</label><input style={styles.input} value={bidForm.deliveryTime} onChange={(e) => setBidForm((prev) => ({ ...prev, deliveryTime: e.target.value }))} placeholder="Example: Same day / 2 days" /></div>
                          <div style={styles.formGroup}><label style={styles.label}>Warranty Note</label><input style={styles.input} value={bidForm.warrantyNote} onChange={(e) => setBidForm((prev) => ({ ...prev, warrantyNote: e.target.value }))} placeholder="Warranty details" /></div>
                        </div>
                        <div style={styles.formGroup}><label style={styles.label}>Bid Notes</label><textarea style={styles.textarea} rows={3} value={bidForm.notes} onChange={(e) => setBidForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes on quality, stock, lead time, or special terms" /></div>
                        {bidError ? <div style={styles.errorBox}>{bidError}</div> : null}
                        <div style={styles.inlineActions}><button type="submit" style={styles.primaryButton}>Add Supplier Bid</button></div>
                      </form>
                    </div>
                  </div>

                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Return Notification</div>
                      <div style={styles.formHint}>Notify supplier of return request with reason, notes, and pictures.</div>
                      <div style={styles.formStack}>
                        <div style={styles.formGroup}><label style={styles.label}>Return Reason</label><input style={styles.input} value={returnForm.reason} onChange={(e) => setReturnForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Wrong item, damaged item, warranty claim, etc." /></div>
                        <div style={styles.formGroup}><label style={styles.label}>Return Notes</label><textarea style={styles.textarea} value={returnForm.notes} onChange={(e) => setReturnForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Explain the issue and required action" /></div>
                        <div style={styles.formGroup}><label style={styles.label}>Add Return Photos</label><input id={`return-photos-${selectedRequest.id}`} type="file" accept="image/*" multiple style={styles.input} /><div style={styles.formHint}>Select multiple return pictures if needed. New uploads are kept together on the same return record.</div></div>
                        <div style={styles.inlineActions}><button type="button" style={styles.smallButtonDanger} onClick={() => createReturnRequest(selectedRequest)}>Send Return Notification</button></div>
                        {selectedRequest.returnRecords.length > 0 ? (
                          <div style={styles.mobileCardList}>
                            {selectedRequest.returnRecords.map((entry) => (
                              <div key={entry.id} style={styles.sectionCardMuted}>
                                <div style={styles.mobileDataCardHeader}><strong>{entry.reason}</strong><span style={entry.responseStatus === "Requested" ? styles.statusWarning : entry.responseStatus === "Rejected" ? styles.statusLocked : styles.statusOk}>{entry.responseStatus}</span></div>
                                <div style={styles.formHint}>{entry.notes || "No notes."}</div>
                                {entry.pictures.length > 0 ? <div style={styles.partsMediaGrid}>{entry.pictures.map((photo) => <div key={photo.id} style={styles.partsMediaCard}><img src={photo.previewDataUrl} alt={photo.fileName} style={styles.partsMediaImage} /><div style={styles.formHint}>{photo.fileName}</div></div>)}</div> : null}
                                {entry.responseNotes ? <div style={styles.formHint}>Supplier Response: {entry.responseNotes}</div> : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.sectionCard}>
                  <div style={styles.sectionTitle}>Supplier Bids</div>
                  <div style={styles.mobileCardList}>
                    {selectedRequest.bids.length === 0 ? <div style={styles.emptyState}>No supplier bids yet.</div> : selectedRequest.bids.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((bid) => {
                      const chosen = bid.id === selectedRequest.selectedBidId;
                      return (
                        <div key={bid.id} style={{ ...styles.mobileDataCard, ...(chosen ? styles.mobileDataCardSelected : {}) }}>
                          <div style={styles.mobileDataCardHeader}><strong>{bid.supplierName}</strong>{chosen ? <span style={styles.statusOk}>Selected</span> : <span style={styles.statusNeutral}>Bid</span>}</div>
                          <div style={styles.mobileDataSecondary}>{bid.brand || "No brand"} • {bid.condition}</div>
                          <div style={styles.mobileMetaRow}><span>Quantity</span><strong>{bid.quantity}</strong></div>
                          <div style={styles.mobileMetaRow}><span>Unit Cost</span><strong>{formatCurrency(parseMoneyInput(bid.unitCost))}</strong></div>
                          <div style={styles.mobileMetaRow}><span>Total Cost</span><strong>{formatCurrency(parseMoneyInput(bid.totalCost))}</strong></div>
                          <div style={styles.mobileMetaRow}><span>Delivery</span><strong>{bid.deliveryTime || "-"}</strong></div>
                          <div style={styles.mobileMetaRow}><span>Tracking</span><strong>{bid.trackingNumber || "-"}</strong></div>
                          <div style={styles.mobileMetaRow}><span>Invoice</span><strong>{bid.invoiceFileName || "-"}</strong></div>
                          <div style={styles.mobileMetaRow}><span>Shipping Label</span><strong>{bid.shippingLabelFileName || "-"}</strong></div>
                          {bid.productPhotos.length > 0 ? <div style={styles.partsMediaGrid}>{bid.productPhotos.map((photo) => <div key={photo.id} style={styles.partsMediaCard}><img src={photo.previewDataUrl} alt={photo.fileName} style={styles.partsMediaImage} /><div style={styles.formHint}>{photo.fileName}</div></div>)}</div> : null}
                          {bid.notes ? <div style={styles.formHint}>{bid.notes}</div> : null}
                          <div style={styles.inlineActions}><button type="button" style={{ ...styles.smallButton, ...(chosen ? styles.buttonDisabled : {}) }} disabled={chosen} onClick={() => selectBid(selectedRequest, bid.id)}>Select Supplier</button></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PartsPage;

const styles: Record<string, React.CSSProperties> = {
  pageContent: { width: "100%" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 16,
  },

  gridItem: { minWidth: 0 },

  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
    border: "1px solid rgba(29,78,216,0.16)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 28px rgba(5, 11, 29, 0.12)",
    height: "100%",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.3,
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },

  heroText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.7,
    marginBottom: 4,
  },

  statCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
    border: "1px solid rgba(29,78,216,0.16)",
    borderRadius: 14,
    padding: "14px 16px",
    boxShadow: "0 4px 14px rgba(5,11,29,0.08)",
    textAlign: "center" as const,
  },

  statLabel: { fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  statValue: { fontSize: 28, fontWeight: 900, color: "#1d4ed8", margin: "4px 0" },
  statValueSmall: { fontSize: 18, fontWeight: 900, color: "#1d4ed8", margin: "4px 0" },
  statNote: { fontSize: 11, color: "#94a3b8" },

  formStack: { display: "flex", flexDirection: "column" as const, gap: 12 },
  formGroup: { display: "flex", flexDirection: "column" as const, gap: 4 },
  formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  twoColumnForm: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  threeColumnForm: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },

  label: { fontSize: 13, fontWeight: 700, color: "#374151" },

  input: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },

  select: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },

  textarea: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    minHeight: 72,
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },

  filterBar: { marginBottom: 12 },

  formHint: { fontSize: 12, color: "#94a3b8" },

  errorBox: {
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#991b1b",
  },

  waitingPartsNotice: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#92400e",
    fontWeight: 600,
  },

  inlineActions: { display: "flex", gap: 10, flexWrap: "wrap" as const, alignItems: "center" },

  stickyActionBar: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
    alignItems: "center",
    position: "sticky" as const,
    bottom: 0,
    background: "rgba(255,255,255,0.97)",
    padding: "10px 0 4px",
  },

  primaryButton: {
    border: "none",
    borderRadius: 12,
    padding: "13px 16px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37,99,235,0.22)",
  },

  secondaryButton: {
    border: "1px solid rgba(148,163,184,0.3)",
    borderRadius: 12,
    padding: "13px 16px",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },

  smallButton: {
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  smallButtonDanger: {
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  buttonDisabled: { opacity: 0.55, cursor: "not-allowed" },

  emptyState: {
    textAlign: "center" as const,
    color: "#94a3b8",
    fontSize: 14,
    padding: "32px 0",
  },

  mobileCardList: { display: "flex", flexDirection: "column" as const, gap: 12 },

  mobileDataCard: {
    background: "#f8fafc",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    cursor: "pointer",
  },

  mobileDataCardSelected: {
    border: "2px solid #2563eb",
    background: "#eff6ff",
  },

  mobileDataCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
  },

  mobileDataSecondary: { fontSize: 13, color: "#64748b" },

  mobileMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
    color: "#475569",
    gap: 8,
  },

  sectionCard: {
    background: "#f8fafc",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 14,
    padding: 16,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },

  sectionCardMuted: {
    background: "rgba(241,245,249,0.8)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 2,
  },

  detailBanner: {
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
    fontSize: 13,
  },

  concernBanner: {
    fontSize: 13,
    color: "#374151",
    background: "#fff",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 8,
    padding: "8px 12px",
  },

  partsMediaGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 10,
  },

  partsMediaCard: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
    alignItems: "center",
    width: 90,
  },

  partsMediaImage: {
    width: 90,
    height: 68,
    objectFit: "cover" as const,
    borderRadius: 8,
    border: "1px solid rgba(148,163,184,0.3)",
  },

  statusOk: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#dcfce7",
    color: "#166534",
    whiteSpace: "nowrap" as const,
  },

  statusWarning: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#fef3c7",
    color: "#92400e",
    whiteSpace: "nowrap" as const,
  },

  statusInfo: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#dbeafe",
    color: "#1d4ed8",
    whiteSpace: "nowrap" as const,
  },

  statusLocked: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#fee2e2",
    color: "#991b1b",
    whiteSpace: "nowrap" as const,
  },

  statusNeutral: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#f1f5f9",
    color: "#475569",
    whiteSpace: "nowrap" as const,
  },
};
