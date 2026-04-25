"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const WorkOrderModal_1 = __importDefault(require("./WorkOrderModal"));
const STATUS_COLORS = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    'in-progress': { bg: '#dbeafe', text: '#1e40af' },
    'needs-parts': { bg: '#fce7f3', text: '#9d174d' },
    complete: { bg: '#dcfce7', text: '#166534' },
    invoiced: { bg: '#ede9fe', text: '#5b21b6' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
};
const WorkOrdersPage = ({ workOrders, settings, onSave, onDelete }) => {
    const [search, setSearch] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [modalOpen, setModalOpen] = (0, react_1.useState)(false);
    const [selectedOrder, setSelectedOrder] = (0, react_1.useState)(null);
    const [nextId, setNextId] = (0, react_1.useState)('');
    const filtered = (0, react_1.useMemo)(() => {
        return workOrders
            .filter((wo) => {
            if (statusFilter !== 'all' && wo.status !== statusFilter)
                return false;
            if (search) {
                const q = search.toLowerCase();
                return ((wo.customerName ?? '').toLowerCase().includes(q) ||
                    (wo.vehicleMake ?? '').toLowerCase().includes(q) ||
                    (wo.vehicleModel ?? '').toLowerCase().includes(q) ||
                    wo.id.toLowerCase().includes(q) ||
                    (wo.technician ?? '').toLowerCase().includes(q) ||
                    (wo.services ?? '').toLowerCase().includes(q));
            }
            return true;
        })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [workOrders, search, statusFilter]);
    const computeNextId = () => {
        const max = workOrders.reduce((m, wo) => {
            const n = parseInt(wo.id.replace('WO-', ''), 10);
            return isNaN(n) ? m : Math.max(m, n);
        }, 0);
        return `WO-${String(max + 1).padStart(4, '0')}`;
    };
    const openNew = () => {
        setNextId(computeNextId());
        setSelectedOrder(null);
        setModalOpen(true);
    };
    const openEdit = (wo) => {
        setSelectedOrder(wo);
        setModalOpen(true);
    };
    const handleSave = (wo) => {
        onSave(wo);
        setModalOpen(false);
    };
    const handleDelete = (id) => {
        onDelete(id);
        setModalOpen(false);
    };
    const statusCounts = (0, react_1.useMemo)(() => {
        return workOrders.reduce((acc, wo) => {
            acc[wo.status] = (acc[wo.status] ?? 0) + 1;
            return acc;
        }, {});
    }, [workOrders]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '32px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                }, children: [(0, jsx_runtime_1.jsx)("h1", { style: { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }, children: "Work Orders" }), (0, jsx_runtime_1.jsx)("button", { onClick: openNew, style: {
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                        }, children: "+ New Work Order" })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: '8px', marginBottom: '20px' }, children: ['all', 'pending', 'in-progress', 'complete', 'cancelled'].map((s) => {
                    const count = s === 'all' ? workOrders.length : (statusCounts[s] ?? 0);
                    const active = statusFilter === s;
                    return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setStatusFilter(s), style: {
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '1px solid',
                            borderColor: active ? '#2563eb' : '#e2e8f0',
                            background: active ? '#eff6ff' : '#ffffff',
                            color: active ? '#1d4ed8' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: active ? 600 : 400,
                        }, children: [s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' '), count > 0 && ((0, jsx_runtime_1.jsx)("span", { style: {
                                    marginLeft: '6px',
                                    background: active ? '#2563eb' : '#e2e8f0',
                                    color: active ? '#fff' : '#64748b',
                                    borderRadius: '10px',
                                    padding: '1px 7px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                }, children: count }))] }, s));
                }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '16px' }, children: (0, jsx_runtime_1.jsx)("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search by customer, vehicle, tech, or services...", style: {
                        width: '100%',
                        padding: '9px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                        background: '#fff',
                    } }) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                }, children: [(0, jsx_runtime_1.jsxs)("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' }, children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { style: { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }, children: ['Order', 'Customer', 'Vehicle', 'Services', 'Tech', 'Status', 'Value', 'Date'].map((h) => ((0, jsx_runtime_1.jsx)("th", { style: {
                                            padding: '11px 16px',
                                            textAlign: 'left',
                                            color: '#64748b',
                                            fontWeight: 500,
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            whiteSpace: 'nowrap',
                                        }, children: h }, h))) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: filtered.length === 0 ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: 8, style: { padding: '56px', textAlign: 'center', color: '#94a3b8', fontSize: '15px' }, children: search || statusFilter !== 'all'
                                            ? 'No orders match your filters.'
                                            : 'No work orders yet. Create your first one!' }) })) : (filtered.map((wo, i) => {
                                    const sc = STATUS_COLORS[wo.status];
                                    const value = (wo.estimatedHours ?? 0) * settings.laborRate + (wo.partsTotal ?? 0);
                                    return ((0, jsx_runtime_1.jsxs)("tr", { onClick: () => openEdit(wo), style: {
                                            borderTop: i === 0 ? 'none' : '1px solid #f1f5f9',
                                            cursor: 'pointer',
                                        }, onMouseEnter: (e) => (e.currentTarget.style.background = '#f8fafc'), onMouseLeave: (e) => (e.currentTarget.style.background = ''), children: [(0, jsx_runtime_1.jsx)("td", { style: {
                                                    padding: '13px 16px',
                                                    color: '#2563eb',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                }, children: wo.id }), (0, jsx_runtime_1.jsxs)("td", { style: { padding: '13px 16px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 500, color: '#0f172a' }, children: wo.customerName }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '12px', color: '#94a3b8' }, children: wo.phone })] }), (0, jsx_runtime_1.jsxs)("td", { style: {
                                                    padding: '13px 16px',
                                                    color: '#475569',
                                                    whiteSpace: 'nowrap',
                                                }, children: [wo.vehicleYear, " ", wo.vehicleMake, " ", wo.vehicleModel] }), (0, jsx_runtime_1.jsx)("td", { style: {
                                                    padding: '13px 16px',
                                                    color: '#475569',
                                                    maxWidth: '200px',
                                                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }, children: wo.services }) }), (0, jsx_runtime_1.jsx)("td", { style: {
                                                    padding: '13px 16px',
                                                    color: '#475569',
                                                    whiteSpace: 'nowrap',
                                                }, children: wo.technician || (0, jsx_runtime_1.jsx)("span", { style: { color: '#cbd5e1' }, children: "Unassigned" }) }), (0, jsx_runtime_1.jsx)("td", { style: { padding: '13px 16px' }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                                                        background: sc.bg,
                                                        color: sc.text,
                                                        padding: '3px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap',
                                                        textTransform: 'capitalize',
                                                    }, children: wo.status }) }), (0, jsx_runtime_1.jsxs)("td", { style: {
                                                    padding: '13px 16px',
                                                    color: '#0f172a',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                }, children: ["$", value.toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })] }), (0, jsx_runtime_1.jsx)("td", { style: {
                                                    padding: '13px 16px',
                                                    color: '#94a3b8',
                                                    fontSize: '12px',
                                                    whiteSpace: 'nowrap',
                                                }, children: wo.createdAt.toLocaleDateString() })] }, wo.id));
                                })) })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            padding: '12px 16px',
                            borderTop: '1px solid #f1f5f9',
                            fontSize: '13px',
                            color: '#94a3b8',
                        }, children: [filtered.length, " order", filtered.length !== 1 ? 's' : '', (search || statusFilter !== 'all') && ` (filtered from ${workOrders.length})`] })] }), modalOpen && ((0, jsx_runtime_1.jsx)(WorkOrderModal_1.default, { workOrder: selectedOrder, newId: nextId, technicians: settings.technicians, laborRate: settings.laborRate, onSave: handleSave, onDelete: handleDelete, onClose: () => setModalOpen(false) }))] }));
};
exports.default = WorkOrdersPage;
