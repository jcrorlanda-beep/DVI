import { useState } from 'react'
import type { FC } from 'react'
import { useCustomers } from '../../store/customerContext'
import { useNavigation } from '../../store/navigation'
import { INPUT, LABEL, FIELD } from './styles'

interface CustomerVehicleSelectorProps {
  customerId: string
  vehicleId: string
  onCustomerChange: (customerId: string) => void
  onVehicleChange: (vehicleId: string) => void
  readOnly?: boolean
}

const CustomerVehicleSelector: FC<CustomerVehicleSelectorProps> = ({
  customerId,
  vehicleId,
  onCustomerChange,
  onVehicleChange,
  readOnly = false,
}) => {
  const { customers, vehicles } = useCustomers()
  const { navigate } = useNavigation()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const selectedCustomer = customers.find((c) => c.id === customerId)
  const customerVehicles = vehicles.filter((v) => v.customerId === customerId)
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId)

  const filtered = search.length > 1
    ? customers.filter((c) => {
        const q = search.toLowerCase()
        return (
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
        )
      }).slice(0, 6)
    : []

  if (readOnly) {
    if (!selectedCustomer || !selectedVehicle) {
      return <span style={{ color: '#94a3b8' }}>No customer/vehicle selected</span>
    }
    return (
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ ...LABEL as object }}>Customer</div>
          <span
            style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            onClick={() => navigate({ page: 'customer-profile', customerId })}
          >
            {selectedCustomer.firstName} {selectedCustomer.lastName}
          </span>
          <div style={{ fontSize: '13px', color: '#64748b' }}>{selectedCustomer.phone}</div>
        </div>
        <div>
          <div style={{ ...LABEL as object }}>Vehicle</div>
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
            {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
          </span>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            {selectedVehicle.licensePlate || selectedVehicle.vin || '—'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Customer Search */}
      <div style={{ ...FIELD as object, position: 'relative' }}>
        <label style={{ ...LABEL as object }}>Customer *</label>
        {selectedCustomer ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <div>
              <span style={{ fontWeight: 600, color: '#1e40af' }}>
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </span>
              <span style={{ color: '#64748b', marginLeft: '8px' }}>{selectedCustomer.phone}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onCustomerChange('')
                onVehicleChange('')
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: '16px',
                fontFamily: 'inherit',
              }}
            >
              &times;
            </button>
          </div>
        ) : (
          <>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search by name, phone, or email..."
              style={{ ...INPUT as object }}
            />
            {open && filtered.length > 0 && (
              <div
                style={{
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
                }}
              >
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    onMouseDown={() => {
                      onCustomerChange(c.id)
                      onVehicleChange('')
                      setSearch('')
                      setOpen(false)
                    }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {c.firstName} {c.lastName}
                    </span>
                    <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '13px' }}>
                      {c.phone}
                    </span>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {vehicles.filter((v) => v.customerId === c.id).length} vehicle(s)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Vehicle Select */}
      {customerId && (
        <div style={{ ...FIELD as object }}>
          <label style={{ ...LABEL as object }}>Vehicle *</label>
          {customerVehicles.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '14px', padding: '8px 0' }}>
              No vehicles on file for this customer.
            </div>
          ) : (
            <select
              value={vehicleId}
              onChange={(e) => onVehicleChange(e.target.value)}
              style={{ ...INPUT as object, cursor: 'pointer' }}
            >
              <option value="">-- Select Vehicle --</option>
              {customerVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model} {v.trim} {v.licensePlate ? `· ${v.licensePlate}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerVehicleSelector
