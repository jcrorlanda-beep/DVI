import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from "react";
import { formatCurrency, parseMoneyInput, getResponsiveSpan, formatDateTime } from "../shared/helpers";
// --- local constants ---
const PARTS_BLOCKING_STATUSES = [
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
function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function todayStamp(date = new Date()) {
    const yyyy = date.getFullYear().toString();
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const dd = `${date.getDate()}`.padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}
function readLocalStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw)
            return fallback;
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
function writeLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
const STORAGE_KEY_COUNTERS = "dvi_phase2_counters_v1";
function nextDailyNumber(prefix) {
    const stamp = todayStamp();
    const counters = readLocalStorage(STORAGE_KEY_COUNTERS, {});
    const key = `${prefix}_${stamp}`;
    const next = (counters[key] ?? 0) + 1;
    counters[key] = next;
    writeLocalStorage(STORAGE_KEY_COUNTERS, counters);
    return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}
const MOBILE_EVIDENCE_MAX_WIDTH = 1280;
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => reject(new Error("Unable to read file."));
        reader.readAsDataURL(file);
    });
}
function loadImage(source) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Unable to load image."));
        img.src = source;
    });
}
async function optimizeImageForMobile(file) {
    const dataUrl = await fileToDataUrl(file);
    const image = await loadImage(dataUrl);
    const scale = Math.min(1, MOBILE_EVIDENCE_MAX_WIDTH / Math.max(image.width, 1));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return dataUrl;
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.78);
}
async function buildPartsMediaRecords(files, owner, kind, uploadedBy, note = "") {
    if (!files || files.length === 0)
        return [];
    const items = [];
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
function getPartsRequestStatusStyle(status) {
    if (["Closed", "Parts Arrived", "Arrived", "Return Approved"].includes(status))
        return styles.statusOk;
    if (["Cancelled", "Return Rejected"].includes(status))
        return styles.statusLocked;
    if (["Ordered", "In Transit", "Shipped", "Waiting for Bids", "Sent to Suppliers", "Bidding", "Supplier Selected", "Return Requested"].includes(status))
        return styles.statusWarning;
    return styles.statusInfo;
}
// --- local component ---
function Card({ title, subtitle, right, children, }) {
    return (_jsxs("div", { style: styles.card, children: [_jsxs("div", { style: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.cardTitle, children: title }), subtitle ? _jsx("div", { style: styles.cardSubtitle, children: subtitle }) : null] }), right ? _jsx("div", { children: right }) : null] }), children] }));
}
// --- component ---
function PartsPage({ currentUser, repairOrders, setRepairOrders, partsRequests, setPartsRequests, isCompactLayout, }) {
    const [search, setSearch] = useState("");
    const [selectedRequestId, setSelectedRequestId] = useState("");
    const [createForm, setCreateForm] = useState({
        roId: "",
        workLineId: "",
        partName: "",
        partNumber: "",
        quantity: "1",
        urgency: "Medium",
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
        condition: "Brand New",
        notes: "",
    });
    const [returnForm, setReturnForm] = useState({ reason: "", notes: "" });
    const [createError, setCreateError] = useState("");
    const [bidError, setBidError] = useState("");
    const sortedRepairOrders = useMemo(() => [...repairOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [repairOrders]);
    const sortedRequests = useMemo(() => [...partsRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [partsRequests]);
    const visibleRequests = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term)
            return sortedRequests;
        return sortedRequests.filter((row) => [row.requestNumber, row.roNumber, row.partName, row.partNumber, row.plateNumber, row.vehicleLabel, row.accountLabel, row.status, row.urgency]
            .join(" ")
            .toLowerCase()
            .includes(term));
    }, [search, sortedRequests]);
    const selectedRequest = useMemo(() => visibleRequests.find((row) => row.id === selectedRequestId) ?? visibleRequests[0] ?? null, [selectedRequestId, visibleRequests]);
    useEffect(() => {
        if (!selectedRequestId && visibleRequests.length > 0) {
            setSelectedRequestId(visibleRequests[0].id);
            return;
        }
        if (selectedRequestId && !visibleRequests.some((row) => row.id === selectedRequestId)) {
            setSelectedRequestId(visibleRequests[0]?.id ?? "");
        }
    }, [selectedRequestId, visibleRequests]);
    const selectedRO = useMemo(() => sortedRepairOrders.find((row) => row.id === createForm.roId) ?? null, [createForm.roId, sortedRepairOrders]);
    // Work lines eligible for parts linkage: approved and not yet completed
    const linkableWorkLines = useMemo(() => {
        if (!selectedRO)
            return [];
        return selectedRO.workLines.filter((line) => line.approvalDecision === "Approved" &&
            line.status !== "Completed");
    }, [selectedRO]);
    // Reset workLineId when RO changes
    useEffect(() => {
        setCreateForm((prev) => ({ ...prev, workLineId: "" }));
    }, [createForm.roId]);
    const setLinkedRoStatus = (roId, status) => {
        if (!roId)
            return;
        setRepairOrders((prev) => prev.map((row) => row.id === roId && !["Released", "Closed"].includes(row.status)
            ? { ...row, status, updatedAt: new Date().toISOString() }
            : row));
    };
    const setLinkedWorkLineStatus = (roId, workLineId, status) => {
        if (!roId || !workLineId)
            return;
        setRepairOrders((prev) => prev.map((row) => row.id === roId
            ? {
                ...row,
                updatedAt: new Date().toISOString(),
                workLines: row.workLines.map((line) => line.id === workLineId ? { ...line, status } : line),
            }
            : row));
    };
    const updateRequest = (requestId, updater) => {
        setPartsRequests((prev) => prev.map((row) => (row.id === requestId ? updater(row) : row)));
    };
    const createRequest = (e) => {
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
        const record = {
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
    const addBid = (e) => {
        e.preventDefault();
        if (!selectedRequest)
            return;
        const supplierName = bidForm.supplierName.trim();
        const unitCost = bidForm.unitCost.trim();
        if (!supplierName || !unitCost) {
            setBidError("Supplier name and unit cost are required.");
            return;
        }
        const quantity = bidForm.quantity.trim() || selectedRequest.quantity || "1";
        const totalCost = String(parseMoneyInput(unitCost) * Math.max(Number(quantity) || 1, 1));
        const bid = {
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
    const uploadWorkshopPhotos = async (request, files, kind) => {
        const media = await buildPartsMediaRecords(files, "Workshop", kind, currentUser.fullName);
        if (media.length === 0)
            return;
        updateRequest(request.id, (row) => ({ ...row, workshopPhotos: [...row.workshopPhotos, ...media], updatedAt: new Date().toISOString() }));
    };
    const createReturnRequest = async (request) => {
        if (!returnForm.reason.trim())
            return;
        const returnPhotoInput = document.getElementById(`return-photos-${request.id}`);
        const pictures = await buildPartsMediaRecords(returnPhotoInput?.files ?? null, "Return", "Return Evidence", currentUser.fullName);
        const entry = {
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
        if (returnPhotoInput)
            returnPhotoInput.value = "";
        setReturnForm({ reason: "", notes: "" });
    };
    const selectBid = (request, bidId) => {
        updateRequest(request.id, (row) => ({ ...row, selectedBidId: bidId, status: "Supplier Selected", updatedAt: new Date().toISOString() }));
    };
    const selectedBid = selectedRequest?.bids.find((bid) => bid.id === selectedRequest.selectedBidId) ?? null;
    const internalCost = selectedBid ? parseMoneyInput(selectedBid.totalCost) : 0;
    const customerPrice = selectedRequest ? parseMoneyInput(selectedRequest.customerSellingPrice) : 0;
    const estimatedMargin = customerPrice - internalCost;
    const requestSummary = useMemo(() => ({
        total: visibleRequests.length,
        waitingBids: visibleRequests.filter((row) => ["Sent to Suppliers", "Waiting for Bids", "Bidding"].includes(row.status)).length,
        supplierSelected: visibleRequests.filter((row) => row.status === "Supplier Selected").length,
        inTransit: visibleRequests.filter((row) => ["Ordered", "In Transit", "Shipped"].includes(row.status)).length,
        arrived: visibleRequests.filter((row) => ["Arrived", "Parts Arrived"].includes(row.status)).length,
        returns: visibleRequests.filter((row) => ["Return Requested", "Return Approved", "Return Rejected"].includes(row.status)).length,
        closed: visibleRequests.filter((row) => row.status === "Closed").length,
    }), [visibleRequests]);
    const totalSelectedBidsValue = useMemo(() => visibleRequests.reduce((sum, row) => {
        const selected = row.bids.find((bid) => bid.id === row.selectedBidId);
        return sum + parseMoneyInput(selected?.totalCost ?? "0");
    }, 0), [visibleRequests]);
    const setRequestStatus = (request, status) => {
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
    const selectedRequestRO = useMemo(() => (selectedRequest ? repairOrders.find((row) => row.id === selectedRequest.roId) ?? null : null), [selectedRequest, repairOrders]);
    const linkedWorkLine = useMemo(() => selectedRequest?.workLineId && selectedRequestRO
        ? selectedRequestRO.workLines.find((line) => line.id === selectedRequest.workLineId) ?? null
        : null, [selectedRequest, selectedRequestRO]);
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: "Parts + Supplier Bidding Control Center", subtitle: "Share workshop reference pictures, track supplier shipping, and manage returns with reasons and pictures", right: _jsxs("span", { style: styles.statusInfo, children: [requestSummary.total, " visible requests"] }), children: _jsx("div", { style: styles.heroText, children: "Parts requests now support workshop camera/upload pictures, supplier item pictures, invoice and shipping label tracking, in-transit updates, and return notifications with reason and photo evidence." }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Waiting Bids" }), _jsx("div", { style: styles.statValue, children: requestSummary.waitingBids }), _jsx("div", { style: styles.statNote, children: "Sent or waiting for supplier pricing" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Supplier Selected" }), _jsx("div", { style: styles.statValue, children: requestSummary.supplierSelected }), _jsx("div", { style: styles.statNote, children: "Ready for purchasing decision" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "In Transit" }), _jsx("div", { style: styles.statValue, children: requestSummary.inTransit }), _jsx("div", { style: styles.statNote, children: "Tracking / shipping uploaded" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Returns" }), _jsx("div", { style: styles.statValue, children: requestSummary.returns }), _jsx("div", { style: styles.statNote, children: "Requests needing return action" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Arrived" }), _jsx("div", { style: styles.statValue, children: requestSummary.arrived }), _jsx("div", { style: styles.statNote, children: "Ready to resume job work" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }, children: _jsxs("div", { style: styles.statCard, children: [_jsx("div", { style: styles.statLabel, children: "Selected Bid Value" }), _jsx("div", { style: styles.statValueSmall, children: formatCurrency(totalSelectedBidsValue) }), _jsx("div", { style: styles.statNote, children: "Internal purchasing visibility" })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsx(Card, { title: "Create Parts Request", subtitle: "Link request to a repair order and optionally to a specific approved work line", children: _jsxs("form", { onSubmit: createRequest, style: styles.formStack, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Linked RO" }), _jsxs("select", { style: styles.select, value: createForm.roId, onChange: (e) => setCreateForm((prev) => ({ ...prev, roId: e.target.value })), children: [_jsx("option", { value: "", children: "Select RO" }), sortedRepairOrders.map((row) => _jsxs("option", { value: row.id, children: [row.roNumber, " \u2014 ", row.plateNumber || row.conductionNumber || "No Plate", " \u2014 ", row.accountLabel] }, row.id))] }), selectedRO ? _jsxs("div", { style: styles.formHint, children: ["Vehicle: ", [selectedRO.make, selectedRO.model, selectedRO.year].filter(Boolean).join(" "), " \u2022 Status: ", selectedRO.status] }) : null] }), selectedRO && linkableWorkLines.length > 0 ? (_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Linked Work Line (optional)" }), _jsxs("select", { style: styles.select, value: createForm.workLineId, onChange: (e) => setCreateForm((prev) => ({ ...prev, workLineId: e.target.value })), children: [_jsx("option", { value: "", children: "No specific work line" }), linkableWorkLines.map((line) => (_jsxs("option", { value: line.id, children: [line.title || "Untitled", " \u2014 ", line.category || "General", " [", line.status, "]"] }, line.id)))] }), _jsx("div", { style: styles.formHint, children: "Linking a work line blocks its completion until parts arrive." })] })) : selectedRO && linkableWorkLines.length === 0 ? (_jsx("div", { style: styles.formHint, children: "No approved in-progress work lines available to link." })) : null, _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Part Name" }), _jsx("input", { style: styles.input, value: createForm.partName, onChange: (e) => setCreateForm((prev) => ({ ...prev, partName: e.target.value })), placeholder: "Example: Front brake pads" })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.twoColumnForm, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Part Number" }), _jsx("input", { style: styles.input, value: createForm.partNumber, onChange: (e) => setCreateForm((prev) => ({ ...prev, partNumber: e.target.value })), placeholder: "Optional part number" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Quantity" }), _jsx("input", { style: styles.input, value: createForm.quantity, onChange: (e) => setCreateForm((prev) => ({ ...prev, quantity: e.target.value })), placeholder: "1" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.twoColumnForm, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Urgency" }), _jsx("select", { style: styles.select, value: createForm.urgency, onChange: (e) => setCreateForm((prev) => ({ ...prev, urgency: e.target.value })), children: ["Low", "Medium", "High"].map((item) => _jsx("option", { value: item, children: item }, item)) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Customer Selling Price" }), _jsx("input", { style: styles.input, value: createForm.customerSellingPrice, onChange: (e) => setCreateForm((prev) => ({ ...prev, customerSellingPrice: e.target.value })), placeholder: "Optional customer price" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Request Notes" }), _jsx("textarea", { style: styles.textarea, rows: 3, value: createForm.notes, onChange: (e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value })), placeholder: "Specs, preferred brand, supplier notes, or urgency context" })] }), createError ? _jsx("div", { style: styles.errorBox, children: createError }) : null, _jsx("div", { style: isCompactLayout ? styles.stickyActionBar : styles.inlineActions, children: _jsx("button", { type: "submit", style: styles.primaryButton, children: "Create Parts Request" }) })] }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsxs(Card, { title: "Parts Requests", subtitle: "Newest to oldest with media, shipping, and return visibility", right: _jsxs("span", { style: styles.statusNeutral, children: [visibleRequests.length, " requests"] }), children: [_jsx("div", { style: styles.filterBar, children: _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search request no., RO, part, plate, customer, or status" }) }), _jsx("div", { style: styles.mobileCardList, children: visibleRequests.length === 0 ? _jsx("div", { style: styles.emptyState, children: "No parts requests yet." }) : visibleRequests.map((row) => {
                                    const selected = row.id === selectedRequest?.id;
                                    const chosenBid = row.bids.find((bid) => bid.id === row.selectedBidId) ?? null;
                                    const linkedRO = repairOrders.find((ro) => ro.id === row.roId) ?? null;
                                    const linkedLine = row.workLineId && linkedRO ? linkedRO.workLines.find((line) => line.id === row.workLineId) ?? null : null;
                                    return (_jsxs("button", { type: "button", onClick: () => setSelectedRequestId(row.id), style: { ...styles.mobileDataCard, ...(selected ? styles.mobileDataCardSelected : {}), textAlign: "left", width: "100%" }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.requestNumber }), _jsx("span", { style: getPartsRequestStatusStyle(row.status), children: row.status })] }), _jsx("div", { style: styles.mobileDataSecondary, children: row.partName }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "RO" }), _jsx("strong", { children: row.roNumber || "Unlinked" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Vehicle" }), _jsx("strong", { children: row.plateNumber || row.vehicleLabel || "-" })] }), linkedLine ? (_jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Work Line" }), _jsxs("strong", { style: linkedLine.status === "Waiting Parts" ? { color: "#b45309" } : undefined, children: [linkedLine.title || "Untitled", " [", linkedLine.status, "]"] })] })) : null, _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Created" }), _jsx("strong", { children: formatDateTime(row.createdAt) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Workshop Photos" }), _jsx("strong", { children: row.workshopPhotos.length })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Bids" }), _jsx("strong", { children: row.bids.length })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Selected Supplier" }), _jsx("strong", { children: chosenBid?.supplierName || "Not selected" })] })] }, row.id));
                                }) })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsx(Card, { title: selectedRequest ? `Request Details — ${selectedRequest.requestNumber}` : "Request Details", subtitle: "Media, shipping, supplier selection, and returns all in one place", children: !selectedRequest ? (_jsx("div", { style: styles.emptyState, children: "Select a parts request to manage bidding and status." })) : (_jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: styles.detailBanner, children: [_jsxs("div", { style: styles.detailGrid, children: [_jsxs("div", { children: [_jsx("strong", { children: "Part" }), _jsx("div", { children: selectedRequest.partName })] }), _jsxs("div", { children: [_jsx("strong", { children: "Request No." }), _jsx("div", { children: selectedRequest.requestNumber })] }), _jsxs("div", { children: [_jsx("strong", { children: "RO" }), _jsx("div", { children: selectedRequest.roNumber })] }), _jsxs("div", { children: [_jsx("strong", { children: "Vehicle" }), _jsx("div", { children: selectedRequest.plateNumber || selectedRequest.vehicleLabel || "-" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Requested By" }), _jsx("div", { children: selectedRequest.requestedBy })] }), _jsxs("div", { children: [_jsx("strong", { children: "Created" }), _jsx("div", { children: formatDateTime(selectedRequest.createdAt) })] }), selectedRequest.updatedBy ? _jsxs("div", { children: [_jsx("strong", { children: "Last Updated By" }), _jsx("div", { children: selectedRequest.updatedBy })] }) : null, linkedWorkLine ? (_jsxs("div", { children: [_jsx("strong", { children: "Work Line" }), _jsxs("div", { style: linkedWorkLine.status === "Waiting Parts" ? { color: "#b45309", fontWeight: 700 } : undefined, children: [linkedWorkLine.title || "Untitled", " \u2014 ", linkedWorkLine.status] })] })) : null] }), _jsxs("div", { style: styles.concernBanner, children: [_jsx("strong", { children: "Request Notes:" }), " ", selectedRequest.notes || "No notes entered."] }), linkedWorkLine && linkedWorkLine.status === "Waiting Parts" ? (_jsx("div", { style: styles.waitingPartsNotice, children: "Work line is currently blocked \u2014 completion is locked until this parts request is marked as Arrived or Parts Arrived." })) : null] }), _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Request Status" }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Current Status" }), _jsx("select", { style: styles.select, value: selectedRequest.status, onChange: (e) => setRequestStatus(selectedRequest, e.target.value), children: ["Draft", "Requested", "Sent to Suppliers", "Waiting for Bids", "Supplier Selected", "Ordered", "In Transit", "Parts Arrived", "Return Requested", "Return Approved", "Return Rejected", "Closed", "Cancelled"].map((status) => _jsx("option", { value: status, children: status }, status)) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Customer Selling Price" }), _jsx("strong", { children: formatCurrency(customerPrice) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Selected Internal Cost" }), _jsx("strong", { children: selectedBid ? formatCurrency(internalCost) : "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Estimated Margin" }), _jsx("strong", { children: selectedBid ? formatCurrency(estimatedMargin) : "-" })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.secondaryButton, onClick: () => setRequestStatus(selectedRequest, "Sent to Suppliers"), children: "Send to Suppliers" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(selectedRequest.selectedBidId ? {} : styles.buttonDisabled) }, disabled: !selectedRequest.selectedBidId, onClick: () => setRequestStatus(selectedRequest, "Supplier Selected"), children: "Confirm Supplier" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(selectedRequest.selectedBidId ? {} : styles.buttonDisabled) }, disabled: !selectedRequest.selectedBidId, onClick: () => setRequestStatus(selectedRequest, "Ordered"), children: "Mark Ordered" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: () => setRequestStatus(selectedRequest, "In Transit"), children: "Mark In Transit" }), _jsx("button", { type: "button", style: styles.primaryButton, onClick: () => setRequestStatus(selectedRequest, "Parts Arrived"), children: "Mark Parts Arrived" })] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Workshop Reference Pictures" }), _jsx("div", { style: styles.formHint, children: "Use Add Camera Photo for quick shots and Add Photos to append one or many workshop images for suppliers." }), _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Add Camera Photo" }), _jsx("input", { type: "file", accept: "image/*", capture: "environment", multiple: true, style: styles.input, onChange: (e) => uploadWorkshopPhotos(selectedRequest, e.target.files, "Workshop Camera Photo") }), _jsx("div", { style: styles.formHint, children: "Use camera capture and repeat if your device only takes one photo at a time." })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Add Photos" }), _jsx("input", { type: "file", accept: "image/*", multiple: true, style: styles.input, onChange: (e) => uploadWorkshopPhotos(selectedRequest, e.target.files, "Workshop Additional Photo") }), _jsx("div", { style: styles.formHint, children: "New uploads are appended to the existing workshop photo list." })] })] }), selectedRequest.workshopPhotos.length === 0 ? _jsx("div", { style: styles.emptyState, children: "No workshop pictures uploaded yet." }) : _jsx("div", { style: styles.partsMediaGrid, children: selectedRequest.workshopPhotos.map((photo) => _jsxs("div", { style: styles.partsMediaCard, children: [_jsx("img", { src: photo.previewDataUrl, alt: photo.fileName, style: styles.partsMediaImage }), _jsx("div", { style: styles.formHint, children: photo.fileName })] }, photo.id)) })] })] }) })] }), _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Add Internal Supplier Bid" }), _jsxs("form", { onSubmit: addBid, style: styles.formStack, children: [_jsxs("div", { style: isCompactLayout ? styles.formStack : styles.twoColumnForm, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Supplier" }), _jsx("input", { style: styles.input, value: bidForm.supplierName, onChange: (e) => setBidForm((prev) => ({ ...prev, supplierName: e.target.value })), placeholder: "Supplier name" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Brand" }), _jsx("input", { style: styles.input, value: bidForm.brand, onChange: (e) => setBidForm((prev) => ({ ...prev, brand: e.target.value })), placeholder: "Brand / manufacturer" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.threeColumnForm, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Quantity" }), _jsx("input", { style: styles.input, value: bidForm.quantity, onChange: (e) => setBidForm((prev) => ({ ...prev, quantity: e.target.value })) })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Unit Cost" }), _jsx("input", { style: styles.input, value: bidForm.unitCost, onChange: (e) => setBidForm((prev) => ({ ...prev, unitCost: e.target.value })), placeholder: "Internal supplier cost" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Condition" }), _jsx("select", { style: styles.select, value: bidForm.condition, onChange: (e) => setBidForm((prev) => ({ ...prev, condition: e.target.value })), children: ["Brand New", "OEM", "Replacement", "Surplus"].map((item) => _jsx("option", { value: item, children: item }, item)) })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.twoColumnForm, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Delivery Time" }), _jsx("input", { style: styles.input, value: bidForm.deliveryTime, onChange: (e) => setBidForm((prev) => ({ ...prev, deliveryTime: e.target.value })), placeholder: "Example: Same day / 2 days" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Warranty Note" }), _jsx("input", { style: styles.input, value: bidForm.warrantyNote, onChange: (e) => setBidForm((prev) => ({ ...prev, warrantyNote: e.target.value })), placeholder: "Warranty details" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Bid Notes" }), _jsx("textarea", { style: styles.textarea, rows: 3, value: bidForm.notes, onChange: (e) => setBidForm((prev) => ({ ...prev, notes: e.target.value })), placeholder: "Notes on quality, stock, lead time, or special terms" })] }), bidError ? _jsx("div", { style: styles.errorBox, children: bidError }) : null, _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "submit", style: styles.primaryButton, children: "Add Supplier Bid" }) })] })] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }, children: _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Return Notification" }), _jsx("div", { style: styles.formHint, children: "Notify supplier of return request with reason, notes, and pictures." }), _jsxs("div", { style: styles.formStack, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Return Reason" }), _jsx("input", { style: styles.input, value: returnForm.reason, onChange: (e) => setReturnForm((prev) => ({ ...prev, reason: e.target.value })), placeholder: "Wrong item, damaged item, warranty claim, etc." })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Return Notes" }), _jsx("textarea", { style: styles.textarea, value: returnForm.notes, onChange: (e) => setReturnForm((prev) => ({ ...prev, notes: e.target.value })), placeholder: "Explain the issue and required action" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Add Return Photos" }), _jsx("input", { id: `return-photos-${selectedRequest.id}`, type: "file", accept: "image/*", multiple: true, style: styles.input }), _jsx("div", { style: styles.formHint, children: "Select multiple return pictures if needed. New uploads are kept together on the same return record." })] }), _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: () => createReturnRequest(selectedRequest), children: "Send Return Notification" }) }), selectedRequest.returnRecords.length > 0 ? (_jsx("div", { style: styles.mobileCardList, children: selectedRequest.returnRecords.map((entry) => (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: entry.reason }), _jsx("span", { style: entry.responseStatus === "Requested" ? styles.statusWarning : entry.responseStatus === "Rejected" ? styles.statusLocked : styles.statusOk, children: entry.responseStatus })] }), _jsx("div", { style: styles.formHint, children: entry.notes || "No notes." }), entry.pictures.length > 0 ? _jsx("div", { style: styles.partsMediaGrid, children: entry.pictures.map((photo) => _jsxs("div", { style: styles.partsMediaCard, children: [_jsx("img", { src: photo.previewDataUrl, alt: photo.fileName, style: styles.partsMediaImage }), _jsx("div", { style: styles.formHint, children: photo.fileName })] }, photo.id)) }) : null, entry.responseNotes ? _jsxs("div", { style: styles.formHint, children: ["Supplier Response: ", entry.responseNotes] }) : null] }, entry.id))) })) : null] })] }) })] }), _jsxs("div", { style: styles.sectionCard, children: [_jsx("div", { style: styles.sectionTitle, children: "Supplier Bids" }), _jsx("div", { style: styles.mobileCardList, children: selectedRequest.bids.length === 0 ? _jsx("div", { style: styles.emptyState, children: "No supplier bids yet." }) : selectedRequest.bids.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((bid) => {
                                                const chosen = bid.id === selectedRequest.selectedBidId;
                                                return (_jsxs("div", { style: { ...styles.mobileDataCard, ...(chosen ? styles.mobileDataCardSelected : {}) }, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: bid.supplierName }), chosen ? _jsx("span", { style: styles.statusOk, children: "Selected" }) : _jsx("span", { style: styles.statusNeutral, children: "Bid" })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: [bid.brand || "No brand", " \u2022 ", bid.condition] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Quantity" }), _jsx("strong", { children: bid.quantity })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Unit Cost" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(bid.unitCost)) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Total Cost" }), _jsx("strong", { children: formatCurrency(parseMoneyInput(bid.totalCost)) })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Delivery" }), _jsx("strong", { children: bid.deliveryTime || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Tracking" }), _jsx("strong", { children: bid.trackingNumber || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Invoice" }), _jsx("strong", { children: bid.invoiceFileName || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Shipping Label" }), _jsx("strong", { children: bid.shippingLabelFileName || "-" })] }), bid.productPhotos.length > 0 ? _jsx("div", { style: styles.partsMediaGrid, children: bid.productPhotos.map((photo) => _jsxs("div", { style: styles.partsMediaCard, children: [_jsx("img", { src: photo.previewDataUrl, alt: photo.fileName, style: styles.partsMediaImage }), _jsx("div", { style: styles.formHint, children: photo.fileName })] }, photo.id)) }) : null, bid.notes ? _jsx("div", { style: styles.formHint, children: bid.notes }) : null, _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: { ...styles.smallButton, ...(chosen ? styles.buttonDisabled : {}) }, disabled: chosen, onClick: () => selectBid(selectedRequest, bid.id), children: "Select Supplier" }) })] }, bid.id));
                                            }) })] })] })) }) })] }) }));
}
export default PartsPage;
const styles = {
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
        textAlign: "center",
    },
    statLabel: { fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
    statValue: { fontSize: 28, fontWeight: 900, color: "#1d4ed8", margin: "4px 0" },
    statValueSmall: { fontSize: 18, fontWeight: 900, color: "#1d4ed8", margin: "4px 0" },
    statNote: { fontSize: 11, color: "#94a3b8" },
    formStack: { display: "flex", flexDirection: "column", gap: 12 },
    formGroup: { display: "flex", flexDirection: "column", gap: 4 },
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
        boxSizing: "border-box",
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
        boxSizing: "border-box",
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
        resize: "vertical",
        boxSizing: "border-box",
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
    inlineActions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    stickyActionBar: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        position: "sticky",
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
        textAlign: "center",
        color: "#94a3b8",
        fontSize: 14,
        padding: "32px 0",
    },
    mobileCardList: { display: "flex", flexDirection: "column", gap: 12 },
    mobileDataCard: {
        background: "#f8fafc",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
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
        flexDirection: "column",
        gap: 12,
    },
    sectionCardMuted: {
        background: "rgba(241,245,249,0.8)",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 10,
        padding: 12,
        display: "flex",
        flexDirection: "column",
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
        flexDirection: "column",
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
        flexWrap: "wrap",
        gap: 10,
    },
    partsMediaCard: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        alignItems: "center",
        width: 90,
    },
    partsMediaImage: {
        width: 90,
        height: 68,
        objectFit: "cover",
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
        whiteSpace: "nowrap",
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
        whiteSpace: "nowrap",
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
        whiteSpace: "nowrap",
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
        whiteSpace: "nowrap",
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
        whiteSpace: "nowrap",
    },
};
