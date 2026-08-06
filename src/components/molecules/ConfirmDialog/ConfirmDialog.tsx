interface ConfirmDialogProps {
  message: string
  yesLabel: string
  noLabel: string
  execute: () => void
  ref: React.RefObject<HTMLDialogElement>
}

export default function ConfirmDialog({ message, yesLabel, noLabel, execute, ref }: ConfirmDialogProps) {
  return (
    <>
      <style>
        {`
            .confirm-dialog::backdrop {
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(8px);
            }
        `}
      </style>
      <dialog ref={ref}
        style={{
          borderRadius: '20px',
          border: 'solid 4px var(--error)'
        }}
        className="confirm-dialog"
      >
        <div
          style={{
            padding: '25px',
            backgroundColor: 'var(--primary)',
            color: 'var(--text)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <p>{message}</p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              autoFocus
              style={{
                color: 'var(--text)',
                backgroundColor: 'var(--action)',
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
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--action-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--action)')}
              onClick={() => ref.current!.close()}>
              {noLabel}
            </button>

            <button
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
              onClick={() => {
                execute()
                ref.current!.close()
              }}
            >
              {yesLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
