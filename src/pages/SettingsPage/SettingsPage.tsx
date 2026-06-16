import { useEffect, useState } from 'react'
import api, { type AnalysisSettings } from '../../services/api'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import PageGrid, { PageField, inputStyle } from '../../components/atoms/PageGrid/PageGrid'
import Button from '../../components/atoms/Button/Button'
import { HelpSection, HelpHeading, HelpText } from '../../components/molecules/HelpSection/HelpSection'
import { useLang } from '../../context/LanguageContext'

export default function SettingsPage() {
  const { t } = useLang()
  const [settings, setSettings] = useState<Partial<AnalysisSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    api.settings.get()
      .then(data => setSettings(data))
      .catch(e => setMessage({ text: `Failed to load settings: ${e instanceof Error ? e.message : String(e)}`, ok: false }))
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof AnalysisSettings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value } as Partial<AnalysisSettings>))
    setMessage(null)
  }

  const num = (key: keyof AnalysisSettings, fallback: number) => {
    const v = settings[key]
    return typeof v === 'number' ? String(v) : String(fallback)
  }

  const str = (key: keyof AnalysisSettings, fallback: string) => {
    const v = settings[key]
    return typeof v === 'string' ? v : fallback
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await api.settings.update(settings as AnalysisSettings)
      setMessage({ text: t.settings_saved, ok: true })
    } catch (e) {
      setMessage({ text: `Failed to save: ${e instanceof Error ? e.message : String(e)}`, ok: false })
    } finally {
      setSaving(false)
    }
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  }

  if (loading) {
    return (
      <PageContainer title={t.settings_title}>
        <PageCard>
          <p style={{ padding: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>{t.results_loading}</p>
        </PageCard>
      </PageContainer>
    )
  }

  return (
    <PageContainer title={t.settings_title}>
      <PageCard>
        <PageSection title={t.settings_analysis_params} style={{ borderTop: 'none' }}>
          <PageGrid columns={3}>
            <PageField label={t.settings_bootstrap}>
              <input
                type="number"
                value={num('bootstrap_threshold', 10)}
                onChange={e => set('bootstrap_threshold', Number(e.target.value))}
                min="0"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--secondary-hover)')}
                onBlur={e => (e.target.style.borderColor = 'var(--secondary)')}
              />
            </PageField>
            <PageField label={t.settings_window_size}>
              <input
                type="number"
                value={num('window_size', 400)}
                onChange={e => set('window_size', Number(e.target.value))}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--secondary-hover)')}
                onBlur={e => (e.target.style.borderColor = 'var(--secondary)')}
              />
            </PageField>
            <PageField label={t.settings_step_size}>
              <input
                type="number"
                value={num('step_size', 200)}
                onChange={e => set('step_size', Number(e.target.value))}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--secondary-hover)')}
                onBlur={e => (e.target.style.borderColor = 'var(--secondary)')}
              />
            </PageField>
            <PageField label={t.settings_dist_threshold}>
              <input
                type="number"
                value={num('dist_threshold', 10000)}
                onChange={e => set('dist_threshold', Number(e.target.value))}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--secondary-hover)')}
                onBlur={e => (e.target.style.borderColor = 'var(--secondary)')}
              />
            </PageField>
            <PageField label={t.settings_rate_similarity}>
              <input
                type="number"
                value={num('rate_similarity', 50)}
                onChange={e => set('rate_similarity', Number(e.target.value))}
                min="0" max="100"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--secondary-hover)')}
                onBlur={e => (e.target.style.borderColor = 'var(--secondary)')}
              />
            </PageField>
            <PageField label={t.settings_permutations}>
              <input
                type="number"
                value={num('permutations_mantel_test', 999)}
                onChange={e => {
                  const v = Number(e.target.value)
                  set('permutations_mantel_test', v)
                  set('permutations_protest', v)
                }}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--secondary-hover)')}
                onBlur={e => (e.target.style.borderColor = 'var(--secondary)')}
              />
            </PageField>
          </PageGrid>
        </PageSection>

        <PageSection title={t.settings_methods}>
          <PageGrid columns={3}>
            <PageField label={t.settings_alignment_method}>
              <select
                value={str('alignment_method', 'PairwiseAlign')}
                onChange={e => set('alignment_method', e.target.value)}
                style={selectStyle}
              >
                <option value="PairwiseAlign">PairwiseAlign</option>
                <option value="ClustalW">ClustalW</option>
                <option value="Muscle">Muscle</option>
              </select>
            </PageField>
            <PageField label={t.settings_distance_method}>
              <select
                value={str('distance_method', 'LeastSquare')}
                onChange={e => set('distance_method', e.target.value)}
                style={selectStyle}
              >
                <option value="LeastSquare">LeastSquare</option>
                <option value="RobinsonFoulds">RobinsonFoulds</option>
              </select>
            </PageField>
            <PageField label={t.settings_fit_method}>
              <select
                value={str('fit_method', 'WiderFit')}
                onChange={e => set('fit_method', e.target.value)}
                style={selectStyle}
              >
                <option value="WiderFit">WiderFit</option>
                <option value="StrictFit">StrictFit</option>
              </select>
            </PageField>
            <PageField label={t.settings_tree_type}>
              <select
                value={str('tree_type', 'BioPython')}
                onChange={e => set('tree_type', e.target.value)}
                style={selectStyle}
              >
                <option value="BioPython">BioPython</option>
                <option value="RAxML">RAxML</option>
              </select>
            </PageField>
            <PageField label={t.settings_similarity_method}>
              <select
                value={str('method_similarity', 'Hamming')}
                onChange={e => set('method_similarity', e.target.value)}
                style={selectStyle}
              >
                <option value="Hamming">Hamming</option>
                <option value="Levenshtein">Levenshtein</option>
              </select>
            </PageField>
            <PageField label={t.settings_statistical_test}>
              <select
                value={str('statistical_test', 'Both')}
                onChange={e => set('statistical_test', e.target.value)}
                style={selectStyle}
              >
                <option value="Both">Both</option>
                <option value="Mantel">Mantel</option>
                <option value="Protest">Protest</option>
              </select>
            </PageField>
            <PageField label={t.settings_mantel_method}>
              <select
                value={str('mantel_test_method', 'Pearson')}
                onChange={e => set('mantel_test_method', e.target.value)}
                style={selectStyle}
              >
                <option value="Pearson">Pearson</option>
                <option value="Spearman">Spearman</option>
              </select>
            </PageField>
          </PageGrid>
        </PageSection>

        <PageSection title={t.settings_preprocessing}>
          <PageGrid columns={2}>
            <PageField label={t.settings_genetic_preprocessing}>
              <select
                value={str('preprocessing_genetic', 'Disabled')}
                onChange={e => set('preprocessing_genetic', e.target.value)}
                style={selectStyle}
              >
                <option value="Disabled">{t.settings_disabled}</option>
                <option value="Enabled">{t.settings_enabled}</option>
              </select>
            </PageField>
            <PageField label={t.settings_climatic_preprocessing}>
              <select
                value={str('preprocessing_climatic', 'Disabled')}
                onChange={e => set('preprocessing_climatic', e.target.value)}
                style={selectStyle}
              >
                <option value="Disabled">{t.settings_disabled}</option>
                <option value="Enabled">{t.settings_enabled}</option>
              </select>
            </PageField>
            <PageField label={t.settings_climatic_correlation}>
              <select
                value={str('correlation_climatic_enabled', 'Disabled')}
                onChange={e => set('correlation_climatic_enabled', e.target.value)}
                style={selectStyle}
              >
                <option value="Disabled">{t.settings_disabled}</option>
                <option value="Enabled">{t.settings_enabled}</option>
              </select>
            </PageField>
            <PageField label={t.settings_correlation_threshold}>
              <input
                type="number"
                value={num('correlation_threshold_climatic', 0.9)}
                onChange={e => set('correlation_threshold_climatic', Number(e.target.value))}
                step="0.01" min="0" max="1"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--secondary-hover)')}
                onBlur={e => (e.target.style.borderColor = 'var(--secondary)')}
              />
            </PageField>
          </PageGrid>
        </PageSection>

        <PageSection title={t.settings_save_section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button variant="actions" onClick={handleSave} disabled={saving}>
              {saving ? t.settings_saving : t.settings_save_btn}
            </Button>
            {message && (
              <span style={{ fontSize: '13px', color: message.ok ? 'var(--text-secondary)' : 'var(--error)' }}>
                {message.text}
              </span>
            )}
          </div>
        </PageSection>

        <PageSection title={t.settings_param_guide}>
          <HelpSection>
            <HelpHeading>{t.settings_bootstrap}</HelpHeading>
            <HelpText><p>{t.settings_help_bootstrap}</p></HelpText>
            <HelpHeading>{t.settings_window_size} / {t.settings_step_size}</HelpHeading>
            <HelpText><p>{t.settings_help_window}</p></HelpText>
            <HelpHeading>{t.settings_dist_threshold}</HelpHeading>
            <HelpText><p>{t.settings_help_distance}</p></HelpText>
          </HelpSection>
        </PageSection>
      </PageCard>
    </PageContainer>
  )
}
