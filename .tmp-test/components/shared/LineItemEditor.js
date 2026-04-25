import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { calcLineItems, fmt } from '../../hooks/useWorkOrderCalcs';
import { lineItemId } from '../../store/ids';
const CELL = { padding: '4px 6px' };
const MINI_INPUT = {
    width: '100%',
    padding: '5px 8px',
    border: '1px solid #e2e8f0',
    borderRadius: '5px',
    fontSize: '13px',
    fontFamily: 'inherit',
    color: '#0f172a',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
};
const TYPE_COLORS = {
    labor: '#dbeafe',
    part: '#dcfce7',
    sublet: '#ffedd5',
    fee: '#f3e8ff',
};
const LineItemRow = ({ item, onChange, onDelete, laborRate, technicians, inventoryParts, readOnly, }) => {
    const [descFocus, setDescFocus] = useState(false);
    const lineTotal = item.quantity * item.unitPrice;
    const suggestions = descFocus && item.type === 'part' && item.description.length > 1
        ? inventoryParts
            .filter((p) => p.name.toLowerCase().includes(item.description.toLowerCase()))
            .slice(0, 4)
        : [];
    return (_jsxs("tr", { children: [_jsx("td", { style: CELL, children: _jsxs("select", { disabled: readOnly, value: item.type, onChange: (e) => onChange({
                        ...item,
                        type: e.target.value,
                        taxable: e.target.value !== 'labor',
                        unitPrice: e.target.value === 'labor' ? laborRate : item.unitPrice,
                    }), style: {
                        ...MINI_INPUT,
                        width: '80px',
                        background: TYPE_COLORS[item.type],
                        fontWeight: 600,
                        cursor: readOnly ? 'default' : 'pointer',
                    }, children: [_jsx("option", { value: "labor", children: "Labor" }), _jsx("option", { value: "part", children: "Part" }), _jsx("option", { value: "sublet", children: "Sublet" }), _jsx("option", { value: "fee", children: "Fee" })] }) }), _jsxs("td", { style: { ...CELL, position: 'relative', minWidth: '200px' }, children: [_jsx("input", { disabled: readOnly, value: item.description, onChange: (e) => onChange({ ...item, description: e.target.value }), onFocus: () => setDescFocus(true), onBlur: () => setTimeout(() => setDescFocus(false), 150), style: { ...MINI_INPUT, width: '100%' }, placeholder: item.type === 'labor' ? 'Service description' : 'Part name / number' }), suggestions.length > 0 && (_jsx("div", { style: {
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 10,
                        }, children: suggestions.map((p) => (_jsxs("div", { onMouseDown: () => onChange({
                                ...item,
                                description: p.name,
                                unitPrice: p.sellPrice,
                                cost: p.costPrice,
                                partNumber: p.partNumber,
                                inventoryPartId: p.id,
                            }), style: {
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                borderBottom: '1px solid #f1f5f9',
                            }, onMouseEnter: (e) => (e.currentTarget.style.background = '#f8fafc'), onMouseLeave: (e) => (e.currentTarget.style.background = ''), children: [_jsx("span", { style: { fontWeight: 600 }, children: p.name }), _jsxs("span", { style: { color: '#94a3b8', marginLeft: '8px' }, children: ["$", fmt(p.sellPrice), " \u00B7 Stock: ", p.quantity] })] }, p.id))) }))] }), item.type === 'labor' && (_jsx("td", { style: CELL, children: _jsxs("select", { disabled: readOnly, value: item.technicianId ?? '', onChange: (e) => onChange({ ...item, technicianId: e.target.value || undefined }), style: { ...MINI_INPUT, width: '120px', cursor: readOnly ? 'default' : 'pointer' }, children: [_jsx("option", { value: "", children: "Any" }), technicians.map((t) => (_jsx("option", { value: t.id, children: t.name }, t.id)))] }) })), item.type !== 'labor' && _jsx("td", { style: CELL }), _jsx("td", { style: CELL, children: _jsx("input", { disabled: readOnly, type: "number", min: "0", step: item.type === 'labor' ? '0.5' : '1', value: item.quantity, onChange: (e) => onChange({ ...item, quantity: parseFloat(e.target.value) || 0 }), style: { ...MINI_INPUT, width: '60px', textAlign: 'right' } }) }), _jsx("td", { style: CELL, children: _jsx("input", { disabled: readOnly, type: "number", min: "0", step: "0.01", value: item.unitPrice, onChange: (e) => onChange({ ...item, unitPrice: parseFloat(e.target.value) || 0 }), style: { ...MINI_INPUT, width: '80px', textAlign: 'right' } }) }), _jsxs("td", { style: { ...CELL, textAlign: 'right', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }, children: ["$", fmt(lineTotal)] }), _jsx("td", { style: { ...CELL, textAlign: 'center' }, children: _jsx("input", { disabled: readOnly, type: "checkbox", checked: item.taxable, onChange: (e) => onChange({ ...item, taxable: e.target.checked }), style: { cursor: readOnly ? 'default' : 'pointer', width: '16px', height: '16px' } }) }), !readOnly && (_jsx("td", { style: CELL, children: _jsx("button", { type: "button", onClick: onDelete, style: {
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        fontSize: '18px',
                        lineHeight: 1,
                        padding: '2px 6px',
                        fontFamily: 'inherit',
                    }, children: "\u00D7" }) }))] }));
};
const LineItemEditor = ({ items, onChange, laborRate, taxRate, technicians, inventoryParts = [], readOnly = false, }) => {
    const totals = calcLineItems(items, taxRate);
    const updateItem = (id, updated) => onChange(items.map((i) => (i.id === id ? updated : i)));
    const deleteItem = (id) => onChange(items.filter((i) => i.id !== id));
    const addItem = (type) => onChange([
        ...items,
        {
            id: lineItemId(),
            type,
            description: '',
            quantity: type === 'labor' ? 1 : 1,
            unitPrice: type === 'labor' ? laborRate : 0,
            taxable: type !== 'labor',
        },
    ]);
    const TH_STYLE = {
        padding: '8px 6px',
        textAlign: 'left',
        fontSize: '11px',
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        borderBottom: '2px solid #e2e8f0',
        background: '#f8fafc',
    };
    return (_jsxs("div", { children: [_jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: TH_STYLE, children: "Type" }), _jsx("th", { style: { ...TH_STYLE, minWidth: '200px' }, children: "Description" }), _jsx("th", { style: TH_STYLE, children: "Tech" }), _jsx("th", { style: { ...TH_STYLE, textAlign: 'right' }, children: "Qty" }), _jsx("th", { style: { ...TH_STYLE, textAlign: 'right' }, children: "Unit $" }), _jsx("th", { style: { ...TH_STYLE, textAlign: 'right' }, children: "Total" }), _jsx("th", { style: { ...TH_STYLE, textAlign: 'center' }, children: "Tax" }), !readOnly && _jsx("th", { style: TH_STYLE })] }) }), _jsx("tbody", { children: items.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: readOnly ? 7 : 8, style: { padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }, children: "No line items yet. Use the buttons below to add services or parts." }) })) : (items.map((item) => (_jsx(LineItemRow, { item: item, onChange: (updated) => updateItem(item.id, updated), onDelete: () => deleteItem(item.id), laborRate: laborRate, technicians: technicians, inventoryParts: inventoryParts, readOnly: readOnly }, item.id)))) })] }) }), !readOnly && (_jsx("div", { style: { display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }, children: ['labor', 'part', 'sublet', 'fee'].map((type) => (_jsxs("button", { type: "button", onClick: () => addItem(type), style: {
                        background: TYPE_COLORS[type],
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        color: '#0f172a',
                    }, children: ["+ ", type.charAt(0).toUpperCase() + type.slice(1)] }, type))) })), _jsxs("div", { style: {
                    marginTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px',
                    fontSize: '14px',
                }, children: [_jsxs("div", { style: { display: 'flex', gap: '32px' }, children: [_jsxs("span", { style: { color: '#64748b' }, children: ["Labor (", fmt(totals.laborHours), " hrs)"] }), _jsxs("span", { style: { minWidth: '80px', textAlign: 'right' }, children: ["$", fmt(totals.laborSubtotal)] })] }), _jsxs("div", { style: { display: 'flex', gap: '32px' }, children: [_jsx("span", { style: { color: '#64748b' }, children: "Parts & Other" }), _jsxs("span", { style: { minWidth: '80px', textAlign: 'right' }, children: ["$", fmt(totals.partsSubtotal)] })] }), _jsxs("div", { style: { display: 'flex', gap: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '4px' }, children: [_jsx("span", { style: { color: '#64748b' }, children: "Subtotal" }), _jsxs("span", { style: { minWidth: '80px', textAlign: 'right' }, children: ["$", fmt(totals.subtotal)] })] }), _jsxs("div", { style: { display: 'flex', gap: '32px' }, children: [_jsxs("span", { style: { color: '#64748b' }, children: ["Tax (", taxRate, "%)"] }), _jsxs("span", { style: { minWidth: '80px', textAlign: 'right' }, children: ["$", fmt(totals.taxAmount)] })] }), _jsxs("div", { style: { display: 'flex', gap: '32px', borderTop: '2px solid #0f172a', paddingTop: '6px', marginTop: '2px' }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '15px' }, children: "Total" }), _jsxs("span", { style: { minWidth: '80px', textAlign: 'right', fontWeight: 700, fontSize: '15px' }, children: ["$", fmt(totals.total)] })] })] })] }));
};
export default LineItemEditor;
