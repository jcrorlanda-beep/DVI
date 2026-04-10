import type { FC } from 'react'
import type { WorkOrder, WorkOrderStatus } from '../types'

interface DashboardProps {
  workOrders: WorkOrder[]
  laborRate: number
  onNavigateToOrders: () => void
}

const STATUS_COLORS: Record<WorkOrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  'in-progress': { bg: '#dbeafe', text: '#1e40af' },
  complete: { bg: '#dcfce7', text: '#166534' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  valueColor?: string
}

const StatCard: FC<StatCardProps> = ({ label, value, sub, valueColor }) => (
  <div
    style={{
      background: '#ffffff',
      borderRadius: '10px',
      padding: '20px 24px',
      border: '1px solid #e2e8f0',
      flex: 1,
      minWidth: 0,
    }}
  >
    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', fontWeight: 500 }}>
      {label}
    </div>
    <div style={{ fontSize: '28px', fontWeight: 700, color: valueColor ?? '#0f172a' }}>
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{sub}</div>
    )}
  </div>
)

const Dashboard: FC<DashboardProps> = ({ workOrders, laborRate, onNavigateToOrders }) => {
  const today = new Date()
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  const open = workOrders.filter(
    (wo) => wo.status === 'pending' || wo.status === 'in-progress'
  ).length
  const inProgress = workOrders.filter((wo) => wo.status === 'in-progress').length
  const completedToday = workOrders.filter(
    (wo) => wo.status === 'complete' && isToday(wo.updatedAt)
  ).length
  const totalValue = workOrders
    .filter((wo) => wo.status !== 'cancelled')
    .reduce((sum, wo) => sum + wo.estimatedHours * laborRate + wo.partsTotal, 0)

  const recent = [...workOrders]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 8)

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={onNavigateToOrders}
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

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Open Orders" value={open} sub="Pending + In Progress" />
        <StatCard label="In Progress" value={inProgress} valueColor="#2563eb" />
        <StatCard label="Completed Today" value={completedToday} valueColor="#16a34a" />
        <StatCard
          label="Est. Total Value"
          value={`$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          sub="All active orders"
        />
      </div>

      {/* Recent Activity */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
            Recent Activity
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Order', 'Customer', 'Vehicle', 'Status', 'Tech', 'Value'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px',
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
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((wo, i) => {
              const sc = STATUS_COLORS[wo.status]
              const value = wo.estimatedHours * laborRate + wo.partsTotal
              return (
                <tr
                  key={wo.id}
                  style={{ borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }}
                >
                  <td style={{ padding: '13px 16px', color: '#2563eb', fontWeight: 600 }}>
                    {wo.id}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#0f172a', fontWeight: 500 }}>
                    {wo.customerName}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#475569' }}>
                    {wo.vehicleYear} {wo.vehicleMake} {wo.vehicleModel}
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
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {wo.status}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', color: '#475569' }}>
                    {wo.technician}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#0f172a', fontWeight: 600 }}>
                    ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
