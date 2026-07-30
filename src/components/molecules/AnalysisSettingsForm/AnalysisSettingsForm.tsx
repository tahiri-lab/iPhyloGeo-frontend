import type { CSSProperties } from 'react'
import type { AnalysisSettings } from '../../../services/api'
import PageGrid, { PageField, inputStyle } from '../../atoms/PageGrid/PageGrid'
import { useLang } from '../../../context/LanguageContext'
import { useLayoutEffect, useState } from 'react'

interface Props {
  settings: Partial<AnalysisSettings>
  onChange: (key: keyof AnalysisSettings, value: unknown) => void
  readOnly?: boolean
}

const smallWidth = 800

/** True once `window.innerWidth < 800`; drives the mobile/overlay nav behavior (full-width, elevated `zIndex` when expanded). */
function useWindowSizeSmall() {
  const [sizeBool, setSizeBool] = useState([window.innerWidth < smallWidth]);
  useLayoutEffect(() => {
    function updateSize() {
    setSizeBool([window.innerWidth < smallWidth]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
}, []);
return sizeBool;
}

/**
 * Full pipeline-settings form, shared by SettingsPage (global settings) and
 * UploadPage/ResultsPage (per-run override) — `readOnly` renders the same
 * layout non-interactively for the "view config" case. Note the single
 * "Permutations" field writes to *both* `permutations_mantel_test` and
 * `permutations_protest` — there's no separate UI for them even though the
 * underlying settings are independent fields.
 */
export default function AnalysisSettingsForm({ settings, onChange, readOnly = false }: Props) {
  const { t } = useLang()
  const [isSmall] = useWindowSizeSmall()

  const num = (key: keyof AnalysisSettings, fallback: number) => {
    const v = settings[key]
    return typeof v === 'number' ? String(v) : String(fallback)
  }

  const str = (key: keyof AnalysisSettings, fallback: string) => {
    const v = settings[key]
    return typeof v === 'string' ? v : fallback
  }

  const focusStyle: CSSProperties = { borderColor: 'var(--secondary-hover)' }
  const blurStyle: CSSProperties = { borderColor: 'var(--secondary)' }

  const numInput = (key: keyof AnalysisSettings, fallback: number, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      type="number"
      value={num(key, fallback)}
      readOnly={readOnly}
      onChange={readOnly ? undefined : e => onChange(key, Number(e.target.value))}
      onFocus={readOnly ? undefined : e => Object.assign(e.target.style, focusStyle)}
      onBlur={readOnly ? undefined : e => Object.assign(e.target.style, blurStyle)}
      style={{ ...inputStyle, opacity: readOnly ? 0.75 : 1, cursor: readOnly ? 'default' : undefined }}
      {...extra}
    />
  )

  const selectStyle: CSSProperties = {
    ...inputStyle,
    cursor: readOnly ? 'default' : 'pointer',
    opacity: readOnly ? 0.75 : 1,
  }

  const sel = (key: keyof AnalysisSettings, fallback: string, options: string[]) => (
    <select
      value={str(key, fallback)}
      disabled={readOnly}
      onChange={readOnly ? undefined : e => onChange(key, e.target.value)}
      style={selectStyle}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Analysis Parameters */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
          {t.settings_analysis_params}
        </p>
        <PageGrid columns={isSmall ? 1 : 3}>
          <PageField label={t.settings_bootstrap}>
            {numInput('bootstrap_threshold', 10, { min: '0' })}
          </PageField>
          <PageField label={t.settings_window_size}>
            {numInput('window_size', 400)}
          </PageField>
          <PageField label={t.settings_step_size}>
            {numInput('step_size', 200)}
          </PageField>
          <PageField label={t.settings_dist_threshold}>
            {numInput('dist_threshold', 10000)}
          </PageField>
          <PageField label={t.settings_rate_similarity}>
            {numInput('rate_similarity', 50, { min: '0', max: '100' })}
          </PageField>
          <PageField label={t.settings_permutations}>
            <input
              type="number"
              value={num('permutations_mantel_test', 999)}
              readOnly={readOnly}
              onChange={readOnly ? undefined : e => {
                const v = Number(e.target.value)
                onChange('permutations_mantel_test', v)
                onChange('permutations_protest', v)
              }}
              onFocus={readOnly ? undefined : e => Object.assign(e.target.style, focusStyle)}
              onBlur={readOnly ? undefined : e => Object.assign(e.target.style, blurStyle)}
              style={{ ...inputStyle, opacity: readOnly ? 0.75 : 1, cursor: readOnly ? 'default' : undefined }}
            />
          </PageField>
        </PageGrid>
      </div>

      {/* Methods */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
          {t.settings_methods}
        </p>
        <PageGrid columns={isSmall ? 1 : 3}>
          <PageField label={t.settings_alignment_method}>
            {sel('alignment_method', 'PairwiseAlign', ['NoAlignment', 'PairwiseAlign', 'MUSCLE', 'CLUSTALW', 'MAFFT'])}
          </PageField>
          <PageField label={t.settings_distance_method}>
            {sel('distance_method', 'LeastSquare', ['All', 'LeastSquare', 'RobinsonFoulds', 'Bipartition'])}
          </PageField>
          <PageField label={t.settings_fit_method}>
            {sel('fit_method', 'WiderFit', ['WiderFit', 'NarrowFit'])}
          </PageField>
          <PageField label={t.settings_tree_type}>
            {sel('tree_type', 'BioPython', ['BioPython', 'Fast Tree'])}
          </PageField>
          <PageField label={t.settings_similarity_method}>
            {sel('method_similarity', 'Hamming', ['Hamming', 'Levenshtein', 'DamerauLevenshtein', 'Jaro', 'JaroWinkler', 'SmithWaterman', 'Jaccard', 'SorensenDice'])}
          </PageField>
          <PageField label={t.settings_statistical_test}>
            {sel('statistical_test', 'Both', ['Both', 'MantelTest', 'Procrustes', 'None'])}
          </PageField>
          <PageField label={t.settings_mantel_method}>
            {sel('mantel_test_method', 'Pearson', ['Pearson', 'Spearman', 'KendallTau'])}
          </PageField>
        </PageGrid>
      </div>

      {/* Preprocessing */}
      <div>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
          {t.settings_preprocessing}
        </p>
        <PageGrid columns={isSmall ? 1 : 2}>
          <PageField label={t.settings_genetic_preprocessing}>
            {sel('preprocessing_genetic', 'Disabled', ['Disabled', 'Enabled'])}
          </PageField>
          <PageField label={t.settings_climatic_preprocessing}>
            {sel('preprocessing_climatic', 'Disabled', ['Disabled', 'Enabled'])}
          </PageField>
          <PageField label={t.settings_climatic_correlation}>
            {sel('correlation_climatic_enabled', 'Disabled', ['Disabled', 'Enabled'])}
          </PageField>
          <PageField label={t.settings_correlation_threshold}>
            {numInput('correlation_threshold_climatic', 0.9, { step: '0.01', min: '0', max: '1' })}
          </PageField>
        </PageGrid>
      </div>
    </div>
  )
}
