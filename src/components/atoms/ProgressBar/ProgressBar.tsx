interface ProgressBarProps {
  visible?: boolean
  progress?: number // 0–100
}

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