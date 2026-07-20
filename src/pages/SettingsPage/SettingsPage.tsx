import { useEffect, useState } from 'react'
import api, { type AnalysisSettings } from '../../services/api'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import Button from '../../components/atoms/Button/Button'
import AnalysisSettingsForm from '../../components/molecules/AnalysisSettingsForm/AnalysisSettingsForm'
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

  const handleChange = (key: keyof AnalysisSettings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value } as Partial<AnalysisSettings>))
    setMessage(null)
  }

  const validateSettings = (): string | null => {
    const rules: Array<{ condition: boolean; error: string }> = [
      {
        condition: settings.window_size !== undefined && settings.window_size <= 0,
        error: t.error_window_size,
      },
      {
        condition: settings.step_size !== undefined && settings.step_size <= 0,
        error: t.error_step_size,
      },
      {
        condition: settings.rate_similarity !== undefined && settings.rate_similarity < 0,
        error: t.error_rate_similarity,
      },
      {
        condition: settings.permutations_protest !== undefined && settings.permutations_protest < 0,
        error: t.error_permutations_protest,
      },
      {
        condition: settings.bootstrap_threshold !== undefined && settings.bootstrap_threshold < 0,
        error: t.error_bootstrap_threshold,
      },
      {
        condition: settings.dist_threshold !== undefined && settings.dist_threshold < 0,
        error: t.error_dist_threshold,
      },
      {
        condition:
          settings.correlation_threshold_climatic !== undefined &&
          (isNaN(Number(settings.correlation_threshold_climatic)) ||
            Number(settings.correlation_threshold_climatic) < 0 ||
            Number(settings.correlation_threshold_climatic) > 1),
        error: t.error_correlation_threshold,
      },
    ]

    const invalidRule = rules.find(rule => rule.condition)
    return invalidRule ? invalidRule.error : null
  }

  const handleSave = async () => {
    const error = validateSettings()
    if (error) {
      setMessage({ text: error, ok: false })
      return
    }
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
          <AnalysisSettingsForm settings={settings} onChange={handleChange} />
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
