import { type ReactNode } from 'react'

interface HelpSectionProps {
  children: ReactNode
}

export function HelpSection({ children }: HelpSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', gridColumn: '1 / -1' }}>
      {children}
    </div>
  )
}

interface HelpTextProps {
  children: ReactNode
}

export function HelpText({ children }: HelpTextProps) {
  return (
    <div
      style={{ color: 'var(--text)', fontSize: '14px', lineHeight: 1.6 }}
    >
      {children}
    </div>
  )
}

interface HelpHeadingProps {
  children: ReactNode
}

export function HelpHeading({ children }: HelpHeadingProps) {
  return (
    <h3 style={{ color: 'var(--text)', fontSize: '1.1em', fontWeight: 700, marginBottom: '4px' }}>
      {children}
    </h3>
  )
}