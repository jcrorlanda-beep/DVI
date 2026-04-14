import { useState, useEffect } from 'react'
import type { FC, FormEvent, CSSProperties } from 'react'
import type { WorkOrder, WorkOrderStatus } from '../types'

interface WorkOrderForm {
  customerName: string
  phone: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  vin: string
  services: string
  status: WorkOrderStatus
  technician: string
  estimatedHours: string
  partsTotal: string
  notes: string
}

interface WorkOrderModalProps {
  workOrder: WorkOrder | null
  newId: string
  technicians: string[]
  laborRate: number
  onSave: (wo: WorkOrder) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const toForm = (wo: WorkOrder | null): WorkOrderForm => ({
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
})

const INPUT: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  fontSize: '14px',
  color: '#0f172a',
  boxSizing: 'border-box',
  outline: 'none',
  background: '#fff',
}

const LABEL: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  display: 'block',
  marginBottom: '5px',
}

const FIELD: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

const SECTION_TITLE: CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '1px solid #f1f5f9',
}

const WorkOrderModal: FC<WorkOrderModalProps> = ({
  workOrder,
  newId,
  technicians,
  laborRate,
  onSave,
  onDelete,
  onClose,
}) => {
  const isNew = workOrder === null
  const [form, setForm] = useState<WorkOrderForm>(toForm(workOrder))

  useEffect(() => {
    setForm(toForm(workOrder))
  }, [workOrder])

  const set = <K extends keyof WorkOrderForm>(key: K, value: WorkOrderForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const now = new Date()
    onSave({
      id: isNew ? newId : workOrder!.id,
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
      createdAt: isNew ? now : workOrder!.createdAt,
      updatedAt: now,
    })
  }

  const laborTotal = (parseFloat(form.estimatedHours) || 0) * laborRate
  const partsTotal = parseFloat(form.partsTotal) || 0
  const total = laborTotal + partsTotal

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '640px',
          maxWidth: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: '#fff',
            zIndex: 1,
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isNew ? 'New Work Order' : `Edit ${workOrder!.id}`}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '22px',
              color: '#94a3b8',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            {/* Customer */}
            <div>
              <div style={SECTION_TITLE}>Customer</div>
              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
              >
                <div style={FIELD}>
                  <label style={LABEL}>Name *</label>
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    style={INPUT}
                    placeholder="Full name"
                  />
                </div>
                <div style={FIELD}>
                  <label style={LABEL}>Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    style={INPUT}
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div>
              <div style={SECTION_TITLE}>Vehicle</div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 1fr',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div style={FIELD}>
                  <label style={LABEL}>Year *</label>
                  <input
                    required
                    value={form.vehicleYear}
                    onChange={(e) => set('vehicleYear', e.target.value)}
                    style={INPUT}
                    placeholder="2024"
                    maxLength={4}
                  />
                </div>
                <div style={FIELD}>
                  <label style={LABEL}>Make *</label>
                  <input
                    required
                    value={form.vehicleMake}
                    onChange={(e) => set('vehicleMake', e.target.value)}
                    style={INPUT}
                    placeholder="Toyota"
                  />
                </div>
                <div style={FIELD}>
                  <label style={LABEL}>Model *</label>
                  <input
                    required
                    value={form.vehicleModel}
                    onChange={(e) => set('vehicleModel', e.target.value)}
                    style={INPUT}
                    placeholder="Camry"
                  />
                </div>
              </div>
              <div style={FIELD}>
                <label style={LABEL}>VIN</label>
                <input
                  value={form.vin}
                  onChange={(e) => set('vin', e.target.value)}
                  style={INPUT}
                  placeholder="17-character VIN (optional)"
                  maxLength={17}
                />
              </div>
            </div>

            {/* Services */}
            <div>
              <div style={SECTION_TITLE}>Service Details</div>
              <div style={{ ...FIELD, marginBottom: '12px' }}>
                <label style={LABEL}>Services Requested *</label>
                <input
                  required
                  value={form.services}
                  onChange={(e) => set('services', e.target.value)}
                  style={INPUT}
                  placeholder="e.g. Oil Change, Tire Rotation, Brake Inspection"
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 110px 130px',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div style={FIELD}>
                  <label style={LABEL}>Assigned Tech</label>
                  <select
                    value={form.technician}
                    onChange={(e) => set('technician', e.target.value)}
                    style={{ ...INPUT, cursor: 'pointer' }}
                  >
                    <option value="">-- Select --</option>
                    {technicians.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={FIELD}>
                  <label style={LABEL}>Est. Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.estimatedHours}
                    onChange={(e) => set('estimatedHours', e.target.value)}
                    style={INPUT}
                  />
                </div>
                <div style={FIELD}>
                  <label style={LABEL}>Parts Total ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.partsTotal}
                    onChange={(e) => set('partsTotal', e.target.value)}
                    style={INPUT}
                  />
                </div>
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as WorkOrderStatus)}
                  style={{ ...INPUT, cursor: 'pointer' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="complete">Complete</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div style={FIELD}>
              <label style={LABEL}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }}
                placeholder="Customer concerns, tech observations..."
              />
            </div>

            {/* Cost Summary */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ color: '#64748b' }}>
                Labor: ${laborTotal.toFixed(2)}{' '}
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  ({form.estimatedHours}h @ ${laborRate}/hr)
                </span>
              </span>
              <span style={{ color: '#64748b' }}>Parts: ${partsTotal.toFixed(2)}</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                Total: ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              bottom: 0,
              background: '#fff',
            }}
          >
            <div>
              {!isNew && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${workOrder!.id}? This cannot be undone.`)) {
                      onDelete(workOrder!.id)
                      onClose()
                    }
                  }}
                  style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Delete
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {isNew ? 'Create Order' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WorkOrderModal
