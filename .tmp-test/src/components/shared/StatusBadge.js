"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const COLORS = {
    // Work Orders
    pending: { bg: '#fef9c3', text: '#854d0e' },
    'in-progress': { bg: '#dbeafe', text: '#1e40af' },
    'needs-parts': { bg: '#ffedd5', text: '#9a3412' },
    complete: { bg: '#dcfce7', text: '#166534' },
    invoiced: { bg: '#f3e8ff', text: '#6b21a8' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
    // Estimates
    draft: { bg: '#f1f5f9', text: '#475569' },
    sent: { bg: '#dbeafe', text: '#1e40af' },
    approved: { bg: '#dcfce7', text: '#166534' },
    declined: { bg: '#fee2e2', text: '#991b1b' },
    converted: { bg: '#f3e8ff', text: '#6b21a8' },
    // Invoices
    paid: { bg: '#dcfce7', text: '#166534' },
    partial: { bg: '#fef9c3', text: '#854d0e' },
    void: { bg: '#f1f5f9', text: '#94a3b8' },
    // Appointments
    scheduled: { bg: '#f1f5f9', text: '#475569' },
    confirmed: { bg: '#dbeafe', text: '#1e40af' },
    'no-show': { bg: '#fee2e2', text: '#991b1b' },
};
const StatusBadge = ({ status, size = 'md' }) => {
    const colors = COLORS[status] ?? { bg: '#f1f5f9', text: '#475569' };
    const label = status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return ((0, jsx_runtime_1.jsx)("span", { style: {
            background: colors.bg,
            color: colors.text,
            padding: size === 'sm' ? '2px 8px' : '3px 10px',
            borderRadius: '20px',
            fontSize: size === 'sm' ? '11px' : '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            display: 'inline-block',
        }, children: label }));
};
exports.default = StatusBadge;
