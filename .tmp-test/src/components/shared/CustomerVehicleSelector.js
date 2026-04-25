"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const customerContext_1 = require("../../store/customerContext");
const navigation_1 = require("../../store/navigation");
const styles_1 = require("./styles");
const CustomerVehicleSelector = ({ customerId, vehicleId, onCustomerChange, onVehicleChange, readOnly = false, }) => {
    const { customers, vehicles } = (0, customerContext_1.useCustomers)();
    const { navigate } = (0, navigation_1.useNavigation)();
    const [search, setSearch] = (0, react_1.useState)('');
    const [open, setOpen] = (0, react_1.useState)(false);
    const selectedCustomer = customers.find((c) => c.id === customerId);
    const customerVehicles = vehicles.filter((v) => v.customerId === customerId);
    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
    const filtered = search.length > 1
        ? customers.filter((c) => {
            const q = search.toLowerCase();
            return (`${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                c.phone.includes(q) ||
                c.email.toLowerCase().includes(q));
        }).slice(0, 6)
        : [];
    if (readOnly) {
        if (!selectedCustomer || !selectedVehicle) {
            return (0, jsx_runtime_1.jsx)("span", { style: { color: '#94a3b8' }, children: "No customer/vehicle selected" });
        }
        return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '24px', flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { ...styles_1.LABEL }, children: "Customer" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: '#2563eb', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }, onClick: () => navigate({ page: 'customer-profile', customerId }), children: [selectedCustomer.firstName, " ", selectedCustomer.lastName] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '13px', color: '#64748b' }, children: selectedCustomer.phone })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { ...styles_1.LABEL }, children: "Vehicle" }), (0, jsx_runtime_1.jsxs)("span", { style: { fontWeight: 600, fontSize: '14px', color: '#0f172a' }, children: [selectedVehicle.year, " ", selectedVehicle.make, " ", selectedVehicle.model] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '13px', color: '#64748b' }, children: selectedVehicle.licensePlate || selectedVehicle.vin || '—' })] })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { ...styles_1.FIELD, position: 'relative' }, children: [(0, jsx_runtime_1.jsx)("label", { style: { ...styles_1.LABEL }, children: "Customer *" }), selectedCustomer ? ((0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '14px',
                        }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("span", { style: { fontWeight: 600, color: '#1e40af' }, children: [selectedCustomer.firstName, " ", selectedCustomer.lastName] }), (0, jsx_runtime_1.jsx)("span", { style: { color: '#64748b', marginLeft: '8px' }, children: selectedCustomer.phone })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                    onCustomerChange('');
                                    onVehicleChange('');
                                }, style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: '16px',
                                    fontFamily: 'inherit',
                                }, children: "\u00D7" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("input", { value: search, onChange: (e) => {
                                    setSearch(e.target.value);
                                    setOpen(true);
                                }, onFocus: () => setOpen(true), onBlur: () => setTimeout(() => setOpen(false), 150), placeholder: "Search by name, phone, or email...", style: { ...styles_1.INPUT } }), open && filtered.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: {
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '4px',
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                    zIndex: 20,
                                }, children: filtered.map((c) => ((0, jsx_runtime_1.jsxs)("div", { onMouseDown: () => {
                                        onCustomerChange(c.id);
                                        onVehicleChange('');
                                        setSearch('');
                                        setOpen(false);
                                    }, style: {
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f1f5f9',
                                        fontSize: '14px',
                                    }, onMouseEnter: (e) => (e.currentTarget.style.background = '#f8fafc'), onMouseLeave: (e) => (e.currentTarget.style.background = ''), children: [(0, jsx_runtime_1.jsxs)("span", { style: { fontWeight: 600 }, children: [c.firstName, " ", c.lastName] }), (0, jsx_runtime_1.jsx)("span", { style: { color: '#64748b', marginLeft: '8px', fontSize: '13px' }, children: c.phone }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '12px', color: '#94a3b8' }, children: [vehicles.filter((v) => v.customerId === c.id).length, " vehicle(s)"] })] }, c.id))) }))] }))] }), customerId && ((0, jsx_runtime_1.jsxs)("div", { style: { ...styles_1.FIELD }, children: [(0, jsx_runtime_1.jsx)("label", { style: { ...styles_1.LABEL }, children: "Vehicle *" }), customerVehicles.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: '#94a3b8', fontSize: '14px', padding: '8px 0' }, children: "No vehicles on file for this customer." })) : ((0, jsx_runtime_1.jsxs)("select", { value: vehicleId, onChange: (e) => onVehicleChange(e.target.value), style: { ...styles_1.INPUT, cursor: 'pointer' }, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "-- Select Vehicle --" }), customerVehicles.map((v) => ((0, jsx_runtime_1.jsxs)("option", { value: v.id, children: [v.year, " ", v.make, " ", v.model, " ", v.trim, " ", v.licensePlate ? `· ${v.licensePlate}` : ''] }, v.id)))] }))] }))] }));
};
exports.default = CustomerVehicleSelector;
