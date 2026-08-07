import { useState } from 'react'
import { useLang } from '../../../context/LanguageContext'
import ProgressBar from '../ProgressBar/ProgressBar'
import { validateEmail } from '../../../utils/validation'
import ConfirmDialog from '../../molecules/ConfirmDialog/ConfirmDialog'
import api from '../../../services/api'
import EmailInput from '../../molecules/EmailInput/EmailInput'

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
  emailSent?: boolean,
}

/**
 * Full-screen modal shown while an analysis job runs (see UploadPage). Shows
 * an animated coffee mug, the current pipeline status/progress, and an
 * optional email capture so the caller can notify the pipeline to email the
 * user on completion — this component itself doesn't call the API, it just
 * reports the entered email via `onEmailSubmit`.
 */
export default function CoffeeLoader({
  statusLabel,
  progress,
  onEmailSubmit,
  emailSent = false,
}: CoffeeLoaderProps) {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [canCancel, setCanCancel] = useState(true)

  const handleCancel = async () => {
    const success = await api.jobs.cancel(resultId)
    if (!success) {
      // TODO replace with toast
      alert("Failed to cancel task")
    }
    else {
      setCanCancel(false)
    }
  }

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
          width: 400,
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

         {canCancel && <button
          onClick={() => { cancelDialogRef.current!.showModal() }}
          style={{
            color: 'var(--primary)',
            backgroundColor: 'var(--error)',
            border: 'none',
            borderRadius: '10px',
            padding: '5px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--error-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--error)')}
        >
          {t.btn_cancel}
        </button>}
        <ConfirmDialog
          message={t.cancel_confirm_message}
          yesLabel={t.cancel_confirm_yes}
          noLabel={t.cancel_confirm_no}
          execute={handleCancel}
          ref={cancelDialogRef}
        />

        {/* Divider */}
        {onEmailSubmit && (
          <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 18 }}>
            {emailSent ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--action)', textAlign: 'center', fontWeight: 600 }}>
                {t.loading_notify_sent} {email} ✓
              </p>
            ) : (
              <EmailInput
                description={t.loading_notify_prompt}
                buttonLabel={t.btn_confirm}
                secondary={true}
                onSend={(e) => {
                  onEmailSubmit?.(e)
                  setEmail(e)
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
