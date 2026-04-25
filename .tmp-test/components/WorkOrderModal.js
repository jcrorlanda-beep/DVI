import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const toForm = (wo) => ({
    customerName: wo?.customerName ?? '',
    phone: wo?.phone ?? '',
    vehicleYear: wo?.vehicleYear ?? '',
    vehicleMake: wo?.vehicleMake ?? '',
    vehicleModel: wo?.vehicleModel ?? '',
    vin: wo?.vin ?? '',
    services: wo?.services ?? '',
    status: wo?.status ?? 'pending',
    technician: wo?.technician ?? '',
    estimatedHours: String(wo?.estimatedHours ?? 1),
    partsTotal: String(wo?.partsTotal ?? 0),
    notes: wo?.notes ?? '',
});
const INPUT = {
    width: '100%',
    padding: '8px 12px',
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
const FIELD = {
    display: 'flex',
    flexDirection: 'column',
};
const SECTION_TITLE = {
    fontSize: '13px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f1f5f9',
};
const WorkOrderModal = ({ workOrder, newId, technicians, laborRate, onSave, onDelete, onClose, }) => {
    const isNew = workOrder === null;
    const [form, setForm] = useState(toForm(workOrder));
    useEffect(() => {
        setForm(toForm(workOrder));
    }, [workOrder]);
    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const handleSubmit = (e) => {
        e.preventDefault();
        const now = new Date();
        onSave({
            id: isNew ? newId : workOrder.id,
            customerId: workOrder?.customerId ?? '',
            vehicleId: workOrder?.vehicleId ?? '',
            technicianId: workOrder?.technicianId ?? '',
            lineItems: workOrder?.lineItems ?? [],
            mileageIn: workOrder?.mileageIn ?? 0,
            internalNotes: workOrder?.internalNotes ?? '',
            customerConcerns: workOrder?.customerConcerns ?? '',
            recommendedServices: workOrder?.recommendedServices ?? '',
            authorizationName: workOrder?.authorizationName ?? '',
            status: form.status,
            customerName: form.customerName,
            phone: form.phone,
            vehicleYear: form.vehicleYear,
            vehicleMake: form.vehicleMake,
            vehicleModel: form.vehicleModel,
            vin: form.vin,
            services: form.services,
            technician: form.technician,
            estimatedHours: parseFloat(form.estimatedHours) || 0,
            partsTotal: parseFloat(form.partsTotal) || 0,
            notes: form.notes,
            createdAt: isNew ? now : workOrder.createdAt,
            updatedAt: now,
        });
    };
    const laborTotal = (parseFloat(form.estimatedHours) || 0) * laborRate;
    const partsTotal = parseFloat(form.partsTotal) || 0;
    const total = laborTotal + partsTotal;
    return (_jsx("div", { style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
        }, onClick: (e) => {
            if (e.target === e.currentTarget)
                onClose();
        }, children: _jsxs("div", { style: {
                background: '#ffffff',
                borderRadius: '12px',
                width: '640px',
                maxWidth: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }, children: [_jsxs("div", { style: {
                        padding: '20px 24px',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        background: '#fff',
                        zIndex: 1,
                    }, children: [_jsx("h2", { style: { fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }, children: isNew ? 'New Work Order' : `Edit ${workOrder.id}` }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '22px',
                                color: '#94a3b8',
                                lineHeight: 1,
                                padding: '0 4px',
                            }, children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: {
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '22px',
                            }, children: [_jsxs("div", { children: [_jsx("div", { style: SECTION_TITLE, children: "Customer" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }, children: [_jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Name *" }), _jsx("input", { required: true, value: form.customerName, onChange: (e) => set('customerName', e.target.value), style: INPUT, placeholder: "Full name" })] }), _jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Phone" }), _jsx("input", { value: form.phone, onChange: (e) => set('phone', e.target.value), style: INPUT, placeholder: "(555) 000-0000" })] })] })] }), _jsxs("div", { children: [_jsx("div", { style: SECTION_TITLE, children: "Vehicle" }), _jsxs("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: '80px 1fr 1fr',
                                                gap: '12px',
                                                marginBottom: '12px',
                                            }, children: [_jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Year *" }), _jsx("input", { required: true, value: form.vehicleYear, onChange: (e) => set('vehicleYear', e.target.value), style: INPUT, placeholder: "2024", maxLength: 4 })] }), _jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Make *" }), _jsx("input", { required: true, value: form.vehicleMake, onChange: (e) => set('vehicleMake', e.target.value), style: INPUT, placeholder: "Toyota" })] }), _jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Model *" }), _jsx("input", { required: true, value: form.vehicleModel, onChange: (e) => set('vehicleModel', e.target.value), style: INPUT, placeholder: "Camry" })] })] }), _jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "VIN" }), _jsx("input", { value: form.vin, onChange: (e) => set('vin', e.target.value), style: INPUT, placeholder: "17-character VIN (optional)", maxLength: 17 })] })] }), _jsxs("div", { children: [_jsx("div", { style: SECTION_TITLE, children: "Service Details" }), _jsxs("div", { style: { ...FIELD, marginBottom: '12px' }, children: [_jsx("label", { style: LABEL, children: "Services Requested *" }), _jsx("input", { required: true, value: form.services, onChange: (e) => set('services', e.target.value), style: INPUT, placeholder: "e.g. Oil Change, Tire Rotation, Brake Inspection" })] }), _jsxs("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 110px 130px',
                                                gap: '12px',
                                                marginBottom: '12px',
                                            }, children: [_jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Assigned Tech" }), _jsxs("select", { value: form.technician, onChange: (e) => set('technician', e.target.value), style: { ...INPUT, cursor: 'pointer' }, children: [_jsx("option", { value: "", children: "-- Select --" }), technicians.map((t) => (_jsx("option", { value: t, children: t }, t)))] })] }), _jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Est. Hours" }), _jsx("input", { type: "number", min: "0", step: "0.5", value: form.estimatedHours, onChange: (e) => set('estimatedHours', e.target.value), style: INPUT })] }), _jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Parts Total ($)" }), _jsx("input", { type: "number", min: "0", step: "0.01", value: form.partsTotal, onChange: (e) => set('partsTotal', e.target.value), style: INPUT })] })] }), _jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Status" }), _jsxs("select", { value: form.status, onChange: (e) => set('status', e.target.value), style: { ...INPUT, cursor: 'pointer' }, children: [_jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "in-progress", children: "In Progress" }), _jsx("option", { value: "complete", children: "Complete" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] })] })] }), _jsxs("div", { style: FIELD, children: [_jsx("label", { style: LABEL, children: "Notes" }), _jsx("textarea", { value: form.notes, onChange: (e) => set('notes', e.target.value), style: { ...INPUT, minHeight: '80px', resize: 'vertical' }, placeholder: "Customer concerns, tech observations..." })] }), _jsxs("div", { style: {
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        padding: '14px 16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '14px',
                                        border: '1px solid #e2e8f0',
                                    }, children: [_jsxs("span", { style: { color: '#64748b' }, children: ["Labor: $", laborTotal.toFixed(2), ' ', _jsxs("span", { style: { fontSize: '12px', color: '#94a3b8' }, children: ["(", form.estimatedHours, "h @ $", laborRate, "/hr)"] })] }), _jsxs("span", { style: { color: '#64748b' }, children: ["Parts: $", partsTotal.toFixed(2)] }), _jsxs("span", { style: { fontWeight: 700, color: '#0f172a' }, children: ["Total: $", total.toFixed(2)] })] })] }), _jsxs("div", { style: {
                                padding: '16px 24px',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                bottom: 0,
                                background: '#fff',
                            }, children: [_jsx("div", { children: !isNew && (_jsx("button", { type: "button", onClick: () => {
                                            if (window.confirm(`Delete ${workOrder.id}? This cannot be undone.`)) {
                                                onDelete(workOrder.id);
                                                onClose();
                                            }
                                        }, style: {
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                        }, children: "Delete" })) }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx("button", { type: "button", onClick: onClose, style: {
                                                background: '#f1f5f9',
                                                color: '#475569',
                                                border: 'none',
                                                padding: '9px 20px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                            }, children: "Cancel" }), _jsx("button", { type: "submit", style: {
                                                background: '#2563eb',
                                                color: 'white',
                                                border: 'none',
                                                padding: '9px 20px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                            }, children: isNew ? 'Create Order' : 'Save Changes' })] })] })] })] }) }));
};
export default WorkOrderModal;
