import type { FC, ReactNode, CSSProperties } from 'react'

interface ModalProps {
  title: string
  width?: number
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

const OVERLAY: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '16px',
}

const Modal: FC<ModalProps> = ({ title, width = 600, onClose, children, footer }) => (
  <div style={OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        width,
        maxWidth: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          {title}
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
            fontFamily: 'inherit',
          }}
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>{children}</div>

      {/* Footer */}
      {footer && (
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  </div>
)

export default Modal
