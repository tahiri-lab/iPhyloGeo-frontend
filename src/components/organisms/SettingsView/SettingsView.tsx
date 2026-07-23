const SETTING_LABELS: Record<keyof AnalysisSettings, string> = {
  alignment_method: 'Alignment Method',
  distance_method: 'Distance Method',
  fit_method: 'Fit Method',
  tree_type: 'Tree Type',
  statistical_test: 'Statistical Test',
  mantel_test_method: 'Mantel Method',
  method_similarity: 'Similarity Method',
  bootstrap_threshold: 'Bootstrap Threshold',
  dist_threshold: 'Distance Threshold',
  window_size: 'Window Size',
  step_size: 'Step Size',
  rate_similarity: 'Similarity Rate (%)',
  preprocessing_genetic: 'Genetic Preprocessing',
  preprocessing_climatic: 'Climatic Preprocessing',
  preprocessing_threshold_genetic: 'Genetic Threshold',
  preprocessing_threshold_climatic: 'Climatic Threshold',
  correlation_climatic_enabled: 'Climatic Correlation',
  correlation_threshold_climatic: 'Correlation Threshold',
  permutations_mantel_test: 'Mantel Permutations',
  permutations_protest: 'Procrustes Permutations',
}

const SETTINGS_GROUPS: { label: string; keys: (keyof AnalysisSettings)[] }[] = [
  {
    label: 'Algorithm',
    keys: ['alignment_method', 'distance_method', 'fit_method', 'tree_type', 'statistical_test', 'mantel_test_method', 'method_similarity'],
  },
  {
    label: 'Thresholds',
    keys: ['bootstrap_threshold', 'dist_threshold', 'window_size', 'step_size', 'rate_similarity'],
  },
  {
    label: 'Preprocessing',
    keys: [
      'preprocessing_genetic', 'preprocessing_climatic',
      'preprocessing_threshold_genetic', 'preprocessing_threshold_climatic',
      'correlation_climatic_enabled', 'correlation_threshold_climatic',
    ],
  },
  {
    label: 'Statistical Tests',
    keys: ['permutations_mantel_test', 'permutations_protest'],
  },
]

function SettingValue({ value, differs }: { value: string; differs: boolean }) {
  const isDisabled = value === 'Disabled'
  const isEnabled = value === 'Enabled'
  const isNumeric = value !== '' && !isNaN(Number(value))

  if (isNumeric) {
    return (
      <span style={{
        fontFamily: 'monospace',
        fontSize: 13,
        fontWeight: differs ? 700 : 400,
        color: differs ? 'var(--action)' : 'var(--text)',
        background: differs
          ? 'color-mix(in srgb, var(--action) 12%, transparent)'
          : 'color-mix(in srgb, var(--text) 7%, transparent)',
        borderRadius: 4,
        padding: '1px 7px',
        border: differs ? '1px solid color-mix(in srgb, var(--action) 30%, transparent)' : 'none',
      }}>
        {value}
      </span>
    )
  }

  if (isEnabled || isDisabled) {
    return (
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: isEnabled ? '#2DD4BF' : 'var(--text-secondary)',
        background: isEnabled
          ? 'color-mix(in srgb, #2DD4BF 14%, transparent)'
          : 'color-mix(in srgb, var(--text-secondary) 10%, transparent)',
        borderRadius: 20,
        padding: '2px 9px',
        border: `1px solid ${isEnabled ? 'color-mix(in srgb, #2DD4BF 30%, transparent)' : 'color-mix(in srgb, var(--text-secondary) 20%, transparent)'}`,
      }}>
        {value}
      </span>
    )
  }

  return (
    <span style={{
      fontSize: 12,
      fontWeight: differs ? 700 : 500,
      color: differs ? 'var(--action)' : 'var(--text)',
      background: differs
        ? 'color-mix(in srgb, var(--action) 12%, transparent)'
        : 'color-mix(in srgb, var(--text) 8%, transparent)',
      borderRadius: 20,
      padding: '2px 9px',
      border: differs ? '1px solid color-mix(in srgb, var(--action) 28%, transparent)' : 'none',
    }}>
      {value}
    </span>
  )
}

export default function SettingsView({
  settings,
  /* diff mode */
  label,
  otherSettings,
  otherLabel,
  wide,
}: {
  settings: Partial<AnalysisSettings> | null
  label: string | null
  otherSettings: Partial<AnalysisSettings> | null
  otherLabel: string | null
  wide: boolean | null
}) {
  const groupOffset = '4px'
  
  const diffMode = otherSettings != null

  if (!diffMode && (!settings || Object.keys(settings).length === 0)) {
    return <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No configuration saved for this analysis.</p>
  }
  if (diffMode && (!settings || Object.keys(settings).length === 0 || Object.keys(otherSettings).length === 0)) {
    return <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No configuration saved for these analysis.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {/* Column headers */}
      {diffMode && wide && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', marginLeft: groupOffset }}>
          <div />
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: '10px' }}>
            {label}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: '10px' }}>
            {otherLabel}
          </div>
        </div>
      )}

      {SETTINGS_GROUPS.map(group => (
        <div key={group.label}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            paddingBottom: '8px', marginBottom: '6px',
            borderBottom: '1px solid var(--border)',
          }}>
            {group.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {group.keys.map((key, i) => {
              const val = String(settings[key] ?? '—')
              const otherVal = diffMode ? String(otherSettings[key] ?? '—') : null
              const differs = diffMode && val !== otherVal
              const rowBg = diffMode && differs
                ? 'color-mix(in srgb, var(--action) 15%, transparent)'
                : i % 2 === 0 ? 'color-mix(in srgb, var(--text) 3%, transparent)' : 'transparent'

              if (!diffMode || wide) {
                return (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: diffMode ? '200px 1fr 1fr' : '1fr 1fr',
                      borderRadius: '6px',
                      backgroundColor: rowBg,
                      padding: `5px ${groupOffset}`,
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '4px', paddingRight: '20px' }}>
                      {SETTING_LABELS[key] ?? key}
                    </span>
                    <span style={{ display: 'flex' }}>
                      <SettingValue value={val} differs={differs} />
                    </span>
                    {diffMode && <span style={{ display: 'flex' }}>
                      <SettingValue value={otherVal} differs={differs} />
                    </span>}
                  </div>
                )
              }

              return (
                <div key={key} style={{ borderRadius: '6px', backgroundColor: rowBg, padding: '6px 8px', marginBottom: '2px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {SETTING_LABELS[key] ?? key}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</div>
                      <SettingValue value={val} differs={differs} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{otherLabel}</div>
                       <SettingValue value={otherVal} differs={differs} />
                     </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
