"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const INPUT = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff',
};
const LABEL = {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'block',
    marginBottom: '5px',
};
const Section = ({ title, children }) => ((0, jsx_runtime_1.jsxs)("div", { style: {
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        marginBottom: '20px',
    }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                padding: '14px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
            }, children: (0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }, children: title }) }), (0, jsx_runtime_1.jsx)("div", { style: { padding: '20px 24px' }, children: children })] }));
const Settings = ({ settings, onSave }) => {
    const [form, setForm] = (0, react_1.useState)(settings);
    const [newTech, setNewTech] = (0, react_1.useState)('');
    const [saved, setSaved] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setForm(settings);
    }, [settings]);
    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const addTech = () => {
        const name = newTech.trim();
        if (name && !form.technicians.includes(name)) {
            set('technicians', [...form.technicians, name]);
            setNewTech('');
        }
    };
    const removeTech = (name) => {
        set('technicians', form.technicians.filter((t) => t !== name));
    };
    const handleSave = (e) => {
        e.preventDefault();
        onSave(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '32px', maxWidth: '720px' }, children: [(0, jsx_runtime_1.jsx)("h1", { style: { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }, children: "Settings" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, children: [(0, jsx_runtime_1.jsx)(Section, { title: "Workshop Information", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { gridColumn: '1 / -1' }, children: [(0, jsx_runtime_1.jsx)("label", { style: LABEL, children: "Shop Name" }), (0, jsx_runtime_1.jsx)("input", { value: form.shopName, onChange: (e) => set('shopName', e.target.value), style: INPUT })] }), (0, jsx_runtime_1.jsxs)("div", { style: { gridColumn: '1 / -1' }, children: [(0, jsx_runtime_1.jsx)("label", { style: LABEL, children: "Address" }), (0, jsx_runtime_1.jsx)("input", { value: form.address, onChange: (e) => set('address', e.target.value), style: INPUT })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: LABEL, children: "Phone" }), (0, jsx_runtime_1.jsx)("input", { value: form.phone, onChange: (e) => set('phone', e.target.value), style: INPUT })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: LABEL, children: "Email" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: form.email, onChange: (e) => set('email', e.target.value), style: INPUT })] })] }) }), (0, jsx_runtime_1.jsx)(Section, { title: "Billing", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: LABEL, children: "Labor Rate ($/hr)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", step: "0.5", value: form.laborRate, onChange: (e) => set('laborRate', Number(e.target.value)), style: INPUT }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '12px', color: '#94a3b8', margin: '6px 0 0' }, children: "Used to calculate work order estimates" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: LABEL, children: "Tax Rate (%)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "100", step: "0.1", value: form.taxRate, onChange: (e) => set('taxRate', Number(e.target.value)), style: INPUT })] })] }) }), (0, jsx_runtime_1.jsxs)(Section, { title: "Technicians", children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '16px' }, children: [form.technicians.length === 0 && ((0, jsx_runtime_1.jsx)("p", { style: { color: '#94a3b8', fontSize: '14px', margin: '0 0 12px' }, children: "No technicians added yet." })), form.technicians.map((tech) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 14px',
                                            background: '#f8fafc',
                                            borderRadius: '6px',
                                            marginBottom: '8px',
                                            border: '1px solid #e2e8f0',
                                        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '14px', color: '#0f172a' }, children: tech }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => removeTech(tech), style: {
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#94a3b8',
                                                    fontSize: '18px',
                                                    lineHeight: 1,
                                                    padding: '2px 6px',
                                                }, children: "\u00D7" })] }, tech)))] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("input", { value: newTech, onChange: (e) => setNewTech(e.target.value), onKeyDown: (e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addTech();
                                            }
                                        }, placeholder: "Technician name...", style: { ...INPUT, flex: 1 } }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: addTech, style: {
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            border: '1px solid #e2e8f0',
                                            padding: '9px 20px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                        }, children: "Add" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: '12px',
                        }, children: [saved && ((0, jsx_runtime_1.jsx)("span", { style: { color: '#16a34a', fontSize: '14px', fontWeight: 600 }, children: "Settings saved successfully." })), (0, jsx_runtime_1.jsx)("button", { type: "submit", style: {
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 28px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }, children: "Save Settings" })] })] })] }));
};
exports.default = Settings;
