import type { ReactNode, CSSProperties, MouseEvent } from 'react'

type ButtonVariant = 'primary' | 'actions' | 'theme-action' | 'download' | 'error' | 'border'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: CSSProperties
  className?: string
  icon?: ReactNode
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: 'var(--primary)',
    color: 'var(--text)',
    border: 'none',
    fontSize: '15px',
    fontWeight: 'bold',
  },
  actions: {
    backgroundColor: 'var(--action)',
    color: 'var(--text)',
    border: 'none',
    fontSize: '15px',
    fontWeight: 'bold',
  },
  'theme-action': {
    backgroundColor: 'var(--action)',
    color: '#000',
    border: 'none',
    fontSize: '15px',
    fontWeight: 'bold',
  },
  download: {
    backgroundColor: 'var(--action)',
    color: 'var(--text)',
    border: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '10px 15px',
  },
  error: {
    backgroundColor: 'var(--error)',
    color: 'var(--text)',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '8px',
  },
  border: {
    backgroundColor: 'transparent',
    color: 'var(--text)',
    border: '2px solid var(--text)',
    fontSize: '15px',
    fontWeight: 'bold',
  },
}

export default function Button({
  children,
  variant = 'actions',
  onClick,
  disabled,
  type = 'button',
  style,
  className,
  icon,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '10px',
        padding: '15px 40px',
        marginTop: '15px',
        marginBottom: '15px',
        whiteSpace: 'nowrap',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={e => {
        if (disabled) return
        const el = e.currentTarget
        if (variant === 'primary') el.style.backgroundColor = 'var(--secondary)'
        if (variant === 'actions' || variant === 'download' || variant === 'theme-action')
          el.style.backgroundColor = 'var(--action-hover)'
        if (variant === 'error') el.style.backgroundColor = 'var(--error-hover)'
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        if (disabled) return
        const el = e.currentTarget
        el.style.backgroundColor = variantStyles[variant].backgroundColor as string
        el.style.transform = 'translateY(0)'
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  )
}

// ButtonPack helper
export function ButtonPack({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
      {children}
    </div>
  )
}