import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'workorders', label: 'Work Orders' },
    { id: 'settings', label: 'Settings' },
];
const Sidebar = ({ page, onNavigate, shopName }) => (_jsxs("div", { style: {
        width: '220px',
        background: '#0f172a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
    }, children: [_jsxs("div", { style: {
                padding: '24px 16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }, children: [_jsx("div", { style: {
                        fontSize: '10px',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        marginBottom: '6px',
                    }, children: "Workshop OS" }), _jsx("div", { style: { fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }, children: shopName })] }), _jsx("nav", { style: { padding: '12px 8px', flex: 1 }, children: navItems.map((item) => (_jsx("button", { onClick: () => onNavigate(item.id), style: {
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    marginBottom: '2px',
                    background: page === item.id ? '#1e40af' : 'transparent',
                    color: page === item.id ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: page === item.id ? 600 : 400,
                }, children: item.label }, item.id))) }), _jsx("div", { style: {
                padding: '16px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                fontSize: '11px',
                color: '#334155',
            }, children: "DVI Workshop OS v1.0" })] }));
export default Sidebar;
