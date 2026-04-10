import type { FC } from 'react'
import type { Page } from '../types'

interface SidebarProps {
  page: Page
  onNavigate: (page: Page) => void
  shopName: string
}

const navItems: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'workorders', label: 'Work Orders' },
  { id: 'settings', label: 'Settings' },
]

const Sidebar: FC<SidebarProps> = ({ page, onNavigate, shopName }) => (
  <div
    style={{
      width: '220px',
      background: '#0f172a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}
  >
    <div
      style={{
        padding: '24px 16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '6px',
        }}
      >
        Workshop OS
      </div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
        {shopName}
      </div>
    </div>

    <nav style={{ padding: '12px 8px', flex: 1 }}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px 14px',
            marginBottom: '2px',
            background: page === item.id ? '#1e40af' : 'transparent',
            color: page === item.id ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '6px',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: page === item.id ? 600 : 400,
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>

    <div
      style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        fontSize: '11px',
        color: '#334155',
      }}
    >
      DVI Workshop OS v1.0
    </div>
  </div>
)

export default Sidebar
