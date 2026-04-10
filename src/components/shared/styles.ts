import type { CSSProperties } from 'react'

export const INPUT: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  fontSize: '14px',
  color: '#0f172a',
  boxSizing: 'border-box',
  outline: 'none',
  background: '#fff',
  fontFamily: 'inherit',
}

export const LABEL: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  display: 'block',
  marginBottom: '5px',
}

export const FIELD: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

export const SECTION_TITLE: CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '1px solid #f1f5f9',
}

export const CARD: CSSProperties = {
  background: '#ffffff',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
}

export const PAGE: CSSProperties = {
  padding: '32px',
}

export const PAGE_TITLE: CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#0f172a',
  margin: 0,
}

export const BTN_PRIMARY: CSSProperties = {
  background: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '9px 18px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
}

export const BTN_SECONDARY: CSSProperties = {
  background: '#f1f5f9',
  color: '#475569',
  border: '1px solid #e2e8f0',
  padding: '9px 18px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
}

export const BTN_GHOST: CSSProperties = {
  background: 'transparent',
  color: '#64748b',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: 'inherit',
}

export const BTN_DANGER: CSSProperties = {
  background: '#fee2e2',
  color: '#dc2626',
  border: 'none',
  padding: '9px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'inherit',
}

export const BTN_SUCCESS: CSSProperties = {
  background: '#dcfce7',
  color: '#166534',
  border: 'none',
  padding: '9px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'inherit',
}

export const TH: CSSProperties = {
  padding: '11px 16px',
  textAlign: 'left',
  color: '#64748b',
  fontWeight: 500,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
  background: '#f8fafc',
}

export const TD: CSSProperties = {
  padding: '13px 16px',
  fontSize: '14px',
}

export const DIVIDER: CSSProperties = {
  borderBottom: '1px solid #e2e8f0',
  margin: '0',
}
