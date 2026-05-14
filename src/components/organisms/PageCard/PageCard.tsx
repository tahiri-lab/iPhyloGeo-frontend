import { type ReactNode } from 'react'

interface PageCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function PageCard({ children, className = '', style }: PageCardProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        margin: '12px auto',
        padding: '0px 24px',
        backgroundColor: 'var(--primary)',
        borderRadius: '16px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}