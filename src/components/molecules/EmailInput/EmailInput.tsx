import { useState } from 'react'
import { validateEmail } from '../../../utils/validation'
import { useToast } from '../../../utils/toastContext'

interface EmailInputProps {
  description?: string
  placeholder?: string
  onSend?: (email: string) => void
  buttonLabel?: string
  secondary?: boolean
}

/** Email + send button used by ResultsPage's "email me the results" section; only calls `onSend` after passing basic format validation. */
export default function EmailInput({
  description = 'Enter your email to receive results:',
  placeholder = 'you@example.com',
  onSend,
  buttonLabel = 'Send',
  secondary = false,
}: EmailInputProps) {
  const [value, setValue] = useState('')
  const { addToast } = useToast()

  const handleSend = () => {
    if (!value) { addToast('Email is required.','warning'); return }
    if (!validateEmail(value)) { addToast('Please enter a valid email address.','warning'); return }
    onSend?.(value)
  }

  return (
    <div style={{ width: '100%' }}>
      {description && (
        <p style={{
          color: secondary ? 'var(--text-secondary)' : 'var(--text)',
          fontSize: secondary ? '13px' : '14px',
          marginBottom: '8px',
          textAlign: secondary ? 'center' : 'left'
        }}>
          {description}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
        <input
          type="email"
          value={value}
          onChange={e => { setValue(e.target.value); }}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            borderRadius: '10px',
            border: '2px solid var(--secondary)',
            padding: '10px 14px',
            fontSize: '14px',
            color: 'var(--text)',
            backgroundColor: 'var(--primary)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--secondary-hover)')}
          onBlur={e => (e.target.style.borderColor = 'var(--secondary)')}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          style={{
            color: 'var(--text)',
            backgroundColor: 'var(--action)',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--action-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--action)')}
        >
          {buttonLabel}
        </button>
      </div>
      {/*error && (
        <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '5px', textAlign: 'left' }}>
          {error}
        </p>
      )*/}
    </div>
  )
}
