interface ProgressBarProps {
  visible?: boolean
  progress?: number // 0–100
}

/** Fill bar for job progress (0–100); omit `progress` for an indeterminate full-width bar. Styled via the `.progress-bar`/`.progress-bar-fill` classes, not inline. */
export default function ProgressBar({ visible = true, progress }: ProgressBarProps) {
  if (!visible) return null
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{ width: progress !== undefined ? `${progress}%` : '100%' }}
      />
    </div>
  )
}