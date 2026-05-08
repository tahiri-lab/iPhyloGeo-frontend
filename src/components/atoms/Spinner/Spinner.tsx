export default function Spinner({
  size = 36,
  color = 'var(--action)',
  label,
}: {
  size?: number
  color?: string
  label?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `3px solid color-mix(in srgb, ${color} 20%, transparent)`,
          borderTop: `3px solid ${color}`,
          animation: 'spin 0.75s linear infinite',
          flexShrink: 0,
        }}
      />
      {label && (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      )}
    </div>
  )
}
