import type { CSSProperties } from 'react'

export const zoomBtnStyle: CSSProperties = {
  width: 28,
  height: 28,
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--primary)',
  color: 'var(--text)',
  cursor: 'pointer',
  fontSize: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
}

export const selectStyle: CSSProperties = {
  background: 'var(--primary)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
  fontSize: 13,
  padding: '6px 10px',
  cursor: 'pointer',
}
