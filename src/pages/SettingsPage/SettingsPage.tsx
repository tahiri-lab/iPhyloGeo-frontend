import { useEffect, useState } from 'react'
import api, { type AnalysisSettings } from '../../services/api'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import Button from '../../components/atoms/Button/Button'
import AnalysisSettingsForm from '../../components/molecules/AnalysisSettingsForm/AnalysisSettingsForm'
import { HelpSection, HelpHeading, HelpText } from '../../components/molecules/HelpSection/HelpSection'
import { useLang } from '../../context/LanguageContext'
import { validateSettings } from '../../utils/validationParamsSettings'

/**
 * `/settings` — edits the *global* pipeline settings (`GET`/`PUT /api/settings`),
 * not per-analysis settings. Client-side validated via `validateSettings`
 * before save. See API.md for why these apply to future jobs only, not
 * results already created.
 */
export default function SettingsPage() {
  const { t } = useLang()
  const [settings, setSettings] = useState<Partial<AnalysisSettings>>({})
  const [initialSettings, setInitialSettings] = useState<Partial<AnalysisSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  // Verify if the current settings differ from the initial settings to determine if the "Save" button should be enabled
  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings)

  useEffect(() => {
    api.settings.get()
      .then(data => {
        setSettings(data)
        setInitialSettings(data) 
      })
      .catch(e => setMessage({ text: `Failed to load settings: ${e instanceof Error ? e.message : String(e)}`, ok: false }))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key: keyof AnalysisSettings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value } as Partial<AnalysisSettings>))
    setMessage(null)
  }


  const handleSave = async () => {
    setMessage(null)
    const error = validateSettings(settings, t)
    if (error) {
      setMessage({ text: error, ok: false })
      return
    }
    setSaving(true)
    try {
      await api.settings.update(settings as AnalysisSettings)
      setMessage({ text: t.settings_saved, ok: true })
    } catch (e) {
      setMessage({ text: `Failed to save: ${e instanceof Error ? e.message : String(e)}`, ok: false })

      try {
        const persistedSettings = await api.settings.get()
        setSettings(persistedSettings)
      } catch {
        // If we fail to reload the settings, we just leave them as-is. The user can try again later.
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * Send a request to reset current settings to factory/library defaults,
   * then refresh the local state with the returned data.
   */
  const handleReset = async () => {
    // Combine title and message to fit the standard window.confirm dialog format
    const confirmationPrompt = `${t.settings_reset_confirm_title}\n\n${t.settings_reset_confirm_message}`
    if (!window.confirm(confirmationPrompt)) {
      return
    }

    setResetting(true)
    setMessage(null)
    try {
      const defaultSettings = await api.settings.reset()
      setSettings(defaultSettings)
      setInitialSettings(defaultSettings)
      setMessage({ text: t.settings_reset_success, ok: true })
    } catch (e) {
      setMessage({ text: `Failed to reset: ${e instanceof Error ? e.message : String(e)}`, ok: false })

      // Rollback to the persisted settings if the reset fails, so the user doesn't lose their current settings.
      try {
        const persistedSettings = await api.settings.get()
        setSettings(persistedSettings)
        setInitialSettings(persistedSettings)
      } catch {
        // If we fail to reload the settings, we just leave them as-is. The user can try again later.
      }
    } finally {
      setResetting(false)
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
            {/* Save Button */}
            <Button variant="actions" onClick={handleSave} disabled={saving || resetting || !isDirty}>
              {saving ? t.settings_saving : t.settings_save_btn}
            </Button>

            {/* Reset Button */}
            <Button variant="actions" onClick={handleReset} disabled={saving || resetting}>
              {t.settings_reset_btn}
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