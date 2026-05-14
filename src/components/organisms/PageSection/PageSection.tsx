import { type ReactNode } from 'react'

interface PageSectionProps {
  children: ReactNode
  icon?: string // mask-image URL
  title?: string
  style?: React.CSSProperties
}

export default function PageSection({ children, icon, title, style }: PageSectionProps) {
  return (
    <div
      style={{
        padding: '24px',
        margin: '0 -24px',
        borderTop: '1px solid var(--secondary)',
        ...style,
      }}
    >
      {(icon || title) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          {icon && (
            <div
              style={{
                width: '28px',
                height: '28px',
                flexShrink: 0,
                backgroundColor: 'var(--action)',
                maskImage: `url(${icon})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url(${icon})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
          )}
          {title && (
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>
              {title}
            </h2>
          )}
        </div>
      )}
      {children}
    </div>
  )
}