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
  recommendedServices: string
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
  recommendedServices: wo?.recommendedServices ?? '',
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
  const [dismissedSuggestionKeys, setDismissedSuggestionKeys] = useState<string[]>([])

  useEffect(() => {
    setForm(toForm(workOrder))
    setDismissedSuggestionKeys([])
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
      recommendedServices: form.recommendedServices,
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

  type UnifiedSuggestion = {
    key: string
    service: string
    category: string
    tags: string[]
    purposeKey: string
    specificity: number
    source: 'mileage' | 'library'
  }

  const normalizePurpose = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()

  const vehicleYear = parseInt(form.vehicleYear, 10)
  const currentMileage = workOrder?.mileageIn ?? 0
  const make = form.vehicleMake.trim().toLowerCase()
  const model = form.vehicleModel.trim().toLowerCase()

  const mileageSuggestions: UnifiedSuggestion[] = [
    { intervalKm: 5000, service: 'Oil and filter service', category: 'Preventive Maintenance' },
    { intervalKm: 10000, service: 'Tire rotation and brake inspection', category: 'Preventive Maintenance' },
    { intervalKm: 20000, service: 'Engine air filter and cabin filter inspection', category: 'Preventive Maintenance' },
    { intervalKm: 40000, service: 'Transmission fluid service inspection', category: 'Drivetrain' },
    { intervalKm: 60000, service: 'Spark plug and ignition system inspection', category: 'Engine' },
  ]
    .filter((item) => currentMileage > 0 && currentMileage >= item.intervalKm)
    .map((item) => ({
      key: `mileage-${item.intervalKm}-${normalizePurpose(item.service)}`,
      service: item.service,
      category: item.category,
      tags: ['General', 'Interval-based'],
      purposeKey: normalizePurpose(item.service),
      specificity: 1,
      source: 'mileage',
    }))

  const libraryBase = [
    {
      id: 'rec_cvt_fluid_ymyr',
      service: 'CVT fluid service',
      category: 'Drivetrain',
      purposeKey: 'transmission fluid service inspection',
      make: 'honda',
      model: 'civic',
      yearFrom: 2016,
      yearTo: 2024,
    },
    {
      id: 'rec_cvt_fluid_mm',
      service: 'CVT fluid condition check',
      category: 'Drivetrain',
      purposeKey: 'transmission fluid service inspection',
      make: 'honda',
      model: 'civic',
    },
    {
      id: 'rec_cvt_fluid_make',
      service: 'Automatic transmission fluid inspection',
      category: 'Drivetrain',
      purposeKey: 'transmission fluid service inspection',
      make: 'honda',
    },
    {
      id: 'rec_cvt_fluid_general',
      service: 'Transmission fluid health inspection',
      category: 'Drivetrain',
      purposeKey: 'transmission fluid service inspection',
    },
    {
      id: 'rec_intake_clean_ymyr',
      service: 'Direct-injection intake valve cleaning',
      category: 'Engine',
      purposeKey: 'spark plug and ignition system inspection',
      make: 'honda',
      model: 'civic',
      yearFrom: 2016,
      yearTo: 2024,
    },
    {
      id: 'rec_intake_clean_mm',
      service: 'Direct-injection intake valve cleaning',
      category: 'Engine',
      purposeKey: 'spark plug and ignition system inspection',
      make: 'honda',
      model: 'civic',
    },
    {
      id: 'rec_intake_clean_make',
      service: 'Combustion intake cleanup service',
      category: 'Engine',
      purposeKey: 'spark plug and ignition system inspection',
      make: 'honda',
    },
    {
      id: 'rec_hybrid_cooling_make',
      service: 'Hybrid battery cooling fan cleaning',
      category: 'Electrical',
      purposeKey: 'battery cooling fan cleaning',
      make: 'toyota',
    },
    {
      id: 'rec_cooling_general',
      service: 'Cooling system pressure test',
      category: 'Cooling',
      purposeKey: 'cooling system pressure test',
    },
  ]

  const librarySuggestions: UnifiedSuggestion[] = libraryBase
    .map((entry) => {
      const makeMatch = !entry.make || entry.make === make
      const modelMatch = !entry.model || entry.model === model
      const yearMatch =
        !entry.yearFrom || !entry.yearTo || (!Number.isNaN(vehicleYear) && vehicleYear >= entry.yearFrom && vehicleYear <= entry.yearTo)
      if (!makeMatch || !modelMatch || !yearMatch) return null

      const specificity =
        entry.make && entry.model && entry.yearFrom && entry.yearTo
          ? 4
          : entry.make && entry.model
            ? 3
            : entry.make
              ? 2
              : 1
      const tags = [
        specificity === 1 ? 'General' : specificity === 2 ? 'Make-specific' : 'Model-specific',
        ...(entry.yearFrom && entry.yearTo ? ['Year range'] : []),
      ]
      return {
        key: `library-${entry.id}`,
        service: entry.service,
        category: entry.category,
        tags,
        purposeKey: normalizePurpose(entry.purposeKey || entry.service),
        specificity,
        source: 'library',
      }
    })
    .filter((item): item is UnifiedSuggestion => item !== null)

  const parseSuggestionText = (value: string) =>
    value
      .split(/\n|,/g)
      .map((line) => normalizePurpose(line))
      .filter(Boolean)

  const existingRecommendationSet = new Set(
    parseSuggestionText(form.recommendedServices)
  )
  const existingWorkSet = new Set(
    [
      ...parseSuggestionText(form.services),
      ...(workOrder?.lineItems ?? []).map((line) => normalizePurpose(line.description)),
    ].filter(Boolean)
  )

  const suggestionMap = new Map<string, UnifiedSuggestion>()
  ;[...mileageSuggestions, ...librarySuggestions].forEach((suggestion) => {
    const existing = suggestionMap.get(suggestion.purposeKey)
    if (
      !existing ||
      suggestion.specificity > existing.specificity ||
      (suggestion.specificity === existing.specificity && suggestion.source === 'library' && existing.source !== 'library')
    ) {
      suggestionMap.set(suggestion.purposeKey, suggestion)
    }
  })

  const unifiedSuggestions = Array.from(suggestionMap.values()).filter(
    (suggestion) =>
      !dismissedSuggestionKeys.includes(suggestion.key) &&
      !existingRecommendationSet.has(normalizePurpose(suggestion.service)) &&
      !existingWorkSet.has(normalizePurpose(suggestion.service))
  )

  const groupedSuggestions = unifiedSuggestions.reduce<Record<string, UnifiedSuggestion[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const addToRecommendations = (service: string) => {
    const lines = form.recommendedServices
      .split(/\n|,/g)
      .map((line) => line.trim())
      .filter(Boolean)
    if (
      lines.some((line) => normalizePurpose(line) === normalizePurpose(service)) ||
      existingWorkSet.has(normalizePurpose(service))
    )
      return
    set('recommendedServices', [...lines, service].join('\n'))
  }

  const addToWorkLine = (service: string) => {
    const lines = form.services
      .split(',')
      .map((line) => line.trim())
      .filter(Boolean)
    if (
      lines.some((line) => normalizePurpose(line) === normalizePurpose(service)) ||
      existingRecommendationSet.has(normalizePurpose(service)) ||
      (workOrder?.lineItems ?? []).some((line) => normalizePurpose(line.description) === normalizePurpose(service))
    )
      return
    set('services', [...lines, service].join(', '))
  }

  const dismissSuggestion = (key: string) => {
    setDismissedSuggestionKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
  }

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
              <div style={{ ...FIELD, marginBottom: '12px' }}>
                <label style={LABEL}>Recommended Services</label>
                <textarea
                  value={form.recommendedServices}
                  onChange={(e) => set('recommendedServices', e.target.value)}
                  style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Suggestion list to discuss with customer"
                />
              </div>
              {Object.keys(groupedSuggestions).length > 0 && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ ...LABEL, marginBottom: '8px' }}>Unified Suggestions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(groupedSuggestions).map(([category, items]) => (
                      <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{category}</div>
                        {items.map((item) => (
                          <div
                            key={item.key}
                            style={{
                              background: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '10px',
                            }}
                          >
                            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>{item.service}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                              {item.tags.map((tag) => (
                                <span
                                  key={`${item.key}-${tag}`}
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: '#e2e8f0',
                                    color: '#475569',
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button type="button" onClick={() => addToRecommendations(item.service)} style={{ ...INPUT, width: 'auto', padding: '6px 10px', cursor: 'pointer' }}>
                                Add to Recommendations
                              </button>
                              <button type="button" onClick={() => addToWorkLine(item.service)} style={{ ...INPUT, width: 'auto', padding: '6px 10px', cursor: 'pointer' }}>
                                Add to Work Line
                              </button>
                              <button type="button" onClick={() => dismissSuggestion(item.key)} style={{ ...INPUT, width: 'auto', padding: '6px 10px', cursor: 'pointer' }}>
                                Dismiss
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
