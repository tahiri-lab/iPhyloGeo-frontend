import type { ReactNode, CSSProperties } from 'react'

interface PageGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  style?: CSSProperties
}

/** Simple equal-width CSS grid, 1–3 columns. */
export default function PageGrid({ children, columns = 3, style }: PageGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

interface PageFieldProps {
  label?: string
  children: ReactNode
}

/** Labeled form field wrapper — stacks an optional label above its input(s). */
export function PageField({ label, children }: PageFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text)' }}>
          {label}
        </label>
      )}
      {children}
    </div>
  )
}

/** Shared text-input style, reused directly (not via a wrapper component) wherever a plain `<input>` needs the app's look. */
export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '2px solid var(--secondary)',
  borderRadius: '10px',
  backgroundColor: 'var(--primary)',
  color: 'var(--text)',
  fontSize: '14px',
  fontWeight: 600,
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s ease',
}