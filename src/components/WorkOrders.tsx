import { useState, useMemo } from 'react'
import type { FC } from 'react'
import type { WorkOrder, WorkOrderStatus, WorkshopSettings } from '../types'
import WorkOrderModal from './WorkOrderModal'

interface WorkOrdersProps {
  workOrders: WorkOrder[]
  settings: WorkshopSettings
  onSave: (wo: WorkOrder) => void
  onDelete: (id: string) => void
}

const STATUS_COLORS: Record<WorkOrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  'in-progress': { bg: '#dbeafe', text: '#1e40af' },
  'needs-parts': { bg: '#fce7f3', text: '#9d174d' },
  complete: { bg: '#dcfce7', text: '#166534' },
  invoiced: { bg: '#ede9fe', text: '#5b21b6' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
}

const WorkOrdersPage: FC<WorkOrdersProps> = ({ workOrders, settings, onSave, onDelete }) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [nextId, setNextId] = useState('')

  const filtered = useMemo(() => {
    return workOrders
      .filter((wo) => {
        if (statusFilter !== 'all' && wo.status !== statusFilter) return false
        if (search) {
          const q = search.toLowerCase()
          return (
            (wo.customerName ?? '').toLowerCase().includes(q) ||
            (wo.vehicleMake ?? '').toLowerCase().includes(q) ||
            (wo.vehicleModel ?? '').toLowerCase().includes(q) ||
            wo.id.toLowerCase().includes(q) ||
            (wo.technician ?? '').toLowerCase().includes(q) ||
            (wo.services ?? '').toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [workOrders, search, statusFilter])

  const computeNextId = () => {
    const max = workOrders.reduce((m, wo) => {
      const n = parseInt(wo.id.replace('WO-', ''), 10)
      return isNaN(n) ? m : Math.max(m, n)
    }, 0)
    return `WO-${String(max + 1).padStart(4, '0')}`
  }

  const openNew = () => {
    setNextId(computeNextId())
    setSelectedOrder(null)
    setModalOpen(true)
  }

  const openEdit = (wo: WorkOrder) => {
    setSelectedOrder(wo)
    setModalOpen(true)
  }

  const handleSave = (wo: WorkOrder) => {
    onSave(wo)
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    onDelete(id)
    setModalOpen(false)
  }

  const statusCounts = useMemo(() => {
    return workOrders.reduce(
      (acc, wo) => {
        acc[wo.status] = (acc[wo.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }, [workOrders])

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Work Orders
        </h1>
        <button
          onClick={openNew}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          + New Work Order
        </button>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['all', 'pending', 'in-progress', 'complete', 'cancelled'] as const).map((s) => {
          const count = s === 'all' ? workOrders.length : (statusCounts[s] ?? 0)
          const active = statusFilter === s
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: active ? '#2563eb' : '#e2e8f0',
                background: active ? '#eff6ff' : '#ffffff',
                color: active ? '#1d4ed8' : '#64748b',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
              }}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
              {count > 0 && (
                <span
                  style={{
                    marginLeft: '6px',
                    background: active ? '#2563eb' : '#e2e8f0',
                    color: active ? '#fff' : '#64748b',
                    borderRadius: '10px',
                    padding: '1px 7px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, vehicle, tech, or services..."
          style={{
            width: '100%',
            padding: '9px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            outline: 'none',
            color: '#0f172a',
            boxSizing: 'border-box',
            background: '#fff',
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Order', 'Customer', 'Vehicle', 'Services', 'Tech', 'Status', 'Value', 'Date'].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: '11px 16px',
                      textAlign: 'left',
                      color: '#64748b',
                      fontWeight: 500,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ padding: '56px', textAlign: 'center', color: '#94a3b8', fontSize: '15px' }}
                >
                  {search || statusFilter !== 'all'
                    ? 'No orders match your filters.'
                    : 'No work orders yet. Create your first one!'}
                </td>
              </tr>
            ) : (
              filtered.map((wo, i) => {
                const sc = STATUS_COLORS[wo.status]
                const value = (wo.estimatedHours ?? 0) * settings.laborRate + (wo.partsTotal ?? 0)
                return (
                  <tr
                    key={wo.id}
                    onClick={() => openEdit(wo)}
                    style={{
                      borderTop: i === 0 ? 'none' : '1px solid #f1f5f9',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#f8fafc')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td
                      style={{
                        padding: '13px 16px',
                        color: '#2563eb',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {wo.id}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>
                        {wo.customerName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{wo.phone}</div>
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {wo.vehicleYear} {wo.vehicleMake} {wo.vehicleModel}
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: '#475569',
                        maxWidth: '200px',
                      }}
                    >
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {wo.services}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {wo.technician || <span style={{ color: '#cbd5e1' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span
                        style={{
                          background: sc.bg,
                          color: sc.text,
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          textTransform: 'capitalize',
                        }}
                      >
                        {wo.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: '#0f172a',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      $
                      {value.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: '#94a3b8',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {wo.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #f1f5f9',
            fontSize: '13px',
            color: '#94a3b8',
          }}
        >
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          {(search || statusFilter !== 'all') && ` (filtered from ${workOrders.length})`}
        </div>
      </div>

      {modalOpen && (
        <WorkOrderModal
          workOrder={selectedOrder}
          newId={nextId}
          technicians={settings.technicians}
          laborRate={settings.laborRate}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export default WorkOrdersPage
