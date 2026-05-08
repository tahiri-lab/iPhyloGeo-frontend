import { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
}

export default function Badge({ children }: BadgeProps) {
  return (
    <span
      style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        padding: '3px 10px',
        borderRadius: '20px',
        textTransform: 'uppercase',
        backgroundColor: 'var(--badge-bg-color)',
        color: 'var(--badge-text-color)',
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}