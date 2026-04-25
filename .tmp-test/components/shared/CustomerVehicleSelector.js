import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useCustomers } from '../../store/customerContext';
import { useNavigation } from '../../store/navigation';
import { INPUT, LABEL, FIELD } from './styles';
const CustomerVehicleSelector = ({ customerId, vehicleId, onCustomerChange, onVehicleChange, readOnly = false, }) => {
    const { customers, vehicles } = useCustomers();
    const { navigate } = useNavigation();
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
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
            return _jsx("span", { style: { color: '#94a3b8' }, children: "No customer/vehicle selected" });
        }
        return (_jsxs("div", { style: { display: 'flex', gap: '24px', flexWrap: 'wrap' }, children: [_jsxs("div", { children: [_jsx("div", { style: { ...LABEL }, children: "Customer" }), _jsxs("span", { style: { color: '#2563eb', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }, onClick: () => navigate({ page: 'customer-profile', customerId }), children: [selectedCustomer.firstName, " ", selectedCustomer.lastName] }), _jsx("div", { style: { fontSize: '13px', color: '#64748b' }, children: selectedCustomer.phone })] }), _jsxs("div", { children: [_jsx("div", { style: { ...LABEL }, children: "Vehicle" }), _jsxs("span", { style: { fontWeight: 600, fontSize: '14px', color: '#0f172a' }, children: [selectedVehicle.year, " ", selectedVehicle.make, " ", selectedVehicle.model] }), _jsx("div", { style: { fontSize: '13px', color: '#64748b' }, children: selectedVehicle.licensePlate || selectedVehicle.vin || '—' })] })] }));
    }
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { style: { ...FIELD, position: 'relative' }, children: [_jsx("label", { style: { ...LABEL }, children: "Customer *" }), selectedCustomer ? (_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '14px',
                        }, children: [_jsxs("div", { children: [_jsxs("span", { style: { fontWeight: 600, color: '#1e40af' }, children: [selectedCustomer.firstName, " ", selectedCustomer.lastName] }), _jsx("span", { style: { color: '#64748b', marginLeft: '8px' }, children: selectedCustomer.phone })] }), _jsx("button", { type: "button", onClick: () => {
                                    onCustomerChange('');
                                    onVehicleChange('');
                                }, style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: '16px',
                                    fontFamily: 'inherit',
                                }, children: "\u00D7" })] })) : (_jsxs(_Fragment, { children: [_jsx("input", { value: search, onChange: (e) => {
                                    setSearch(e.target.value);
                                    setOpen(true);
                                }, onFocus: () => setOpen(true), onBlur: () => setTimeout(() => setOpen(false), 150), placeholder: "Search by name, phone, or email...", style: { ...INPUT } }), open && filtered.length > 0 && (_jsx("div", { style: {
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
                                }, children: filtered.map((c) => (_jsxs("div", { onMouseDown: () => {
                                        onCustomerChange(c.id);
                                        onVehicleChange('');
                                        setSearch('');
                                        setOpen(false);
                                    }, style: {
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f1f5f9',
                                        fontSize: '14px',
                                    }, onMouseEnter: (e) => (e.currentTarget.style.background = '#f8fafc'), onMouseLeave: (e) => (e.currentTarget.style.background = ''), children: [_jsxs("span", { style: { fontWeight: 600 }, children: [c.firstName, " ", c.lastName] }), _jsx("span", { style: { color: '#64748b', marginLeft: '8px', fontSize: '13px' }, children: c.phone }), _jsxs("div", { style: { fontSize: '12px', color: '#94a3b8' }, children: [vehicles.filter((v) => v.customerId === c.id).length, " vehicle(s)"] })] }, c.id))) }))] }))] }), customerId && (_jsxs("div", { style: { ...FIELD }, children: [_jsx("label", { style: { ...LABEL }, children: "Vehicle *" }), customerVehicles.length === 0 ? (_jsx("div", { style: { color: '#94a3b8', fontSize: '14px', padding: '8px 0' }, children: "No vehicles on file for this customer." })) : (_jsxs("select", { value: vehicleId, onChange: (e) => onVehicleChange(e.target.value), style: { ...INPUT, cursor: 'pointer' }, children: [_jsx("option", { value: "", children: "-- Select Vehicle --" }), customerVehicles.map((v) => (_jsxs("option", { value: v.id, children: [v.year, " ", v.make, " ", v.model, " ", v.trim, " ", v.licensePlate ? `· ${v.licensePlate}` : ''] }, v.id)))] }))] }))] }));
};
export default CustomerVehicleSelector;
