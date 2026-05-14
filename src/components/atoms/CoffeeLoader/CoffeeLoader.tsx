import { useState } from 'react'
import { useLang } from '../../../context/LanguageContext'
import ProgressBar from '../ProgressBar/ProgressBar'
import { validateEmail } from '../../../utils/validation'

function CoffeeMug() {
  return (
    <svg viewBox="0 0 140 150" width="140" height="150" style={{ overflow: 'visible' }}>
      {/* Saucer */}
      <ellipse cx="65" cy="130" rx="58" ry="11" fill="#c8a46e" opacity="0.45" />
      {/* Mug body */}
      <rect x="10" y="68" width="100" height="62" rx="10" fill="#f5e6cc" />
      {/* Mug body shading */}
      <rect x="10" y="68" width="14" height="62" rx="10" fill="#e8d4b2" />
      {/* Coffee top surface */}
      <ellipse cx="60" cy="68" rx="50" ry="12" fill="#d4a96a" />
      <ellipse cx="60" cy="68" rx="40" ry="8.5" fill="#3d1c02" />
      {/* Coffee swirl */}
      <path
        d="M52 68 Q60 62 68 68 Q60 74 52 68"
        fill="none" stroke="#5a2a06" strokeWidth="1.5" opacity="0.6"
      />
      {/* Handle outer */}
      <path
        d="M110 82 Q136 82 136 99 Q136 116 110 116"
        fill="none" stroke="#e8d4b2" strokeWidth="12" strokeLinecap="round"
      />
      {/* Handle inner highlight */}
      <path
        d="M110 82 Q126 82 126 99 Q126 116 110 116"
        fill="none" stroke="#f5e6cc" strokeWidth="5" strokeLinecap="round"
      />
      {/* Steam 1 - center */}
      <path
        d="M62 55 Q56 44 62 33 Q68 22 62 11"
        fill="none" stroke="#b0bec5" strokeWidth="3" strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; 0,-9; 0,-18"
          dur="2s" repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0.75; 0.35; 0" dur="2s" repeatCount="indefinite" />
      </path>
      {/* Steam 2 - left */}
      <path
        d="M42 56 Q36 45 42 34 Q48 23 42 12"
        fill="none" stroke="#b0bec5" strokeWidth="3" strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; 0,-9; 0,-18"
          dur="2.4s" begin="0.6s" repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0.65; 0.3; 0" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
      </path>
      {/* Steam 3 - right */}
      <path
        d="M80 56 Q74 45 80 34 Q86 23 80 12"
        fill="none" stroke="#b0bec5" strokeWidth="3" strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform" type="translate"
          values="0,0; 0,-9; 0,-18"
          dur="2.2s" begin="1.1s" repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0.65; 0.3; 0" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
      </path>
      {/* Cute face - small eyes */}
      <circle cx="50" cy="90" r="3.5" fill="#5a3a1a" />
      <circle cx="70" cy="90" r="3.5" fill="#5a3a1a" />
      {/* Eye shine */}
      <circle cx="51.5" cy="88.5" r="1.2" fill="white" opacity="0.8" />
      <circle cx="71.5" cy="88.5" r="1.2" fill="white" opacity="0.8" />
      {/* Smile */}
      <path
        d="M50 100 Q60 108 70 100"
        fill="none" stroke="#5a3a1a" strokeWidth="2.2" strokeLinecap="round"
      />
    </svg>
  )
}

interface CoffeeLoaderProps {
  statusLabel?: string
  progress?: number
  onEmailSubmit?: (email: string) => void
  emailSent?: boolean
}

export default function CoffeeLoader({
  statusLabel,
  progress,
  onEmailSubmit,
  emailSent = false,
}: CoffeeLoaderProps) {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [emailErr, setEmailErr] = useState('')

  const handleSubmit = () => {
    if (!email || !validateEmail(email)) {
      setEmailErr('Please enter a valid email.')
      return
    }
    setEmailErr('')
    onEmailSubmit?.(email)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 600,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          background: 'var(--primary)',
          borderRadius: 24,
          padding: '40px 36px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          width: 380,
          maxWidth: '92vw',
          border: '1px solid var(--border)',
        }}
      >
        <CoffeeMug />

        {/* Status message */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
            {statusLabel ?? t.results_loading}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            This may take a few minutes…
          </p>
        </div>

        {/* Progress bar */}
        {progress !== undefined && (
          <div style={{ width: '100%' }}>
            <ProgressBar visible progress={progress} />
          </div>
        )}

        {/* Divider */}
        {onEmailSubmit && (
          <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 18 }}>
            {emailSent ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--action)', textAlign: 'center', fontWeight: 600 }}>
                {t.loading_notify_sent} {email} ✓
              </p>
            ) : (
              <>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {t.loading_notify_prompt}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{
                      flex: 1,
                      borderRadius: 10,
                      border: `1.5px solid ${emailErr ? 'var(--error)' : 'var(--border)'}`,
                      padding: '8px 12px',
                      fontSize: 13,
                      color: 'var(--text)',
                      background: 'var(--secondary)',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleSubmit}
                    style={{
                      borderRadius: 10,
                      border: 'none',
                      background: 'var(--action)',
                      color: '#fff',
                      padding: '8px 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {t.btn_send}
                  </button>
                </div>
                {emailErr && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--error)' }}>{emailErr}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
