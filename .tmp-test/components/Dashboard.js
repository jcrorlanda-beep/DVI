import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const STATUS_COLORS = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    'in-progress': { bg: '#dbeafe', text: '#1e40af' },
    'needs-parts': { bg: '#fce7f3', text: '#9d174d' },
    complete: { bg: '#dcfce7', text: '#166534' },
    invoiced: { bg: '#ede9fe', text: '#5b21b6' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
};
const StatCard = ({ label, value, sub, valueColor }) => (_jsxs("div", { style: {
        background: '#ffffff',
        borderRadius: '10px',
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        flex: 1,
        minWidth: 0,
    }, children: [_jsx("div", { style: { fontSize: '12px', color: '#64748b', marginBottom: '10px', fontWeight: 500 }, children: label }), _jsx("div", { style: { fontSize: '28px', fontWeight: 700, color: valueColor ?? '#0f172a' }, children: value }), sub && (_jsx("div", { style: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' }, children: sub }))] }));
const Dashboard = ({ workOrders, laborRate, onNavigateToOrders }) => {
    const today = new Date();
    const isToday = (date) => date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    const open = workOrders.filter((wo) => wo.status === 'pending' || wo.status === 'in-progress').length;
    const inProgress = workOrders.filter((wo) => wo.status === 'in-progress').length;
    const completedToday = workOrders.filter((wo) => wo.status === 'complete' && isToday(wo.updatedAt)).length;
    const totalValue = workOrders
        .filter((wo) => wo.status !== 'cancelled')
        .reduce((sum, wo) => sum + (wo.estimatedHours ?? 0) * laborRate + (wo.partsTotal ?? 0), 0);
    const recent = [...workOrders]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 8);
    return (_jsxs("div", { style: { padding: '32px' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '28px',
                }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }, children: "Dashboard" }), _jsx("p", { style: { color: '#64748b', margin: '4px 0 0', fontSize: '14px' }, children: today.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }) })] }), _jsx("button", { onClick: onNavigateToOrders, style: {
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                        }, children: "+ New Work Order" })] }), _jsxs("div", { style: { display: 'flex', gap: '16px', marginBottom: '28px' }, children: [_jsx(StatCard, { label: "Open Orders", value: open, sub: "Pending + In Progress" }), _jsx(StatCard, { label: "In Progress", value: inProgress, valueColor: "#2563eb" }), _jsx(StatCard, { label: "Completed Today", value: completedToday, valueColor: "#16a34a" }), _jsx(StatCard, { label: "Est. Total Value", value: `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, sub: "All active orders" })] }), _jsxs("div", { style: {
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                }, children: [_jsx("div", { style: {
                            padding: '16px 24px',
                            borderBottom: '1px solid #e2e8f0',
                        }, children: _jsx("h2", { style: { fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }, children: "Recent Activity" }) }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' }, children: [_jsx("thead", { children: _jsx("tr", { style: { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }, children: ['Order', 'Customer', 'Vehicle', 'Status', 'Tech', 'Value'].map((h) => (_jsx("th", { style: {
                                            padding: '10px 16px',
                                            textAlign: 'left',
                                            color: '#64748b',
                                            fontWeight: 500,
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            whiteSpace: 'nowrap',
                                        }, children: h }, h))) }) }), _jsx("tbody", { children: recent.map((wo, i) => {
                                    const sc = STATUS_COLORS[wo.status];
                                    const value = (wo.estimatedHours ?? 0) * laborRate + (wo.partsTotal ?? 0);
                                    return (_jsxs("tr", { style: { borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }, children: [_jsx("td", { style: { padding: '13px 16px', color: '#2563eb', fontWeight: 600 }, children: wo.id }), _jsx("td", { style: { padding: '13px 16px', color: '#0f172a', fontWeight: 500 }, children: wo.customerName }), _jsxs("td", { style: { padding: '13px 16px', color: '#475569' }, children: [wo.vehicleYear, " ", wo.vehicleMake, " ", wo.vehicleModel] }), _jsx("td", { style: { padding: '13px 16px' }, children: _jsx("span", { style: {
                                                        background: sc.bg,
                                                        color: sc.text,
                                                        padding: '3px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        textTransform: 'capitalize',
                                                        whiteSpace: 'nowrap',
                                                    }, children: wo.status }) }), _jsx("td", { style: { padding: '13px 16px', color: '#475569' }, children: wo.technician }), _jsxs("td", { style: { padding: '13px 16px', color: '#0f172a', fontWeight: 600 }, children: ["$", value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })] })] }, wo.id));
                                }) })] })] })] }));
};
export default Dashboard;
