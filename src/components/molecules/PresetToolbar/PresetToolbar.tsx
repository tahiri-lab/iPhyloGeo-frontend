import { usePresets } from '../../../context/PresetContext'
import { useLang } from '../../../context/LanguageContext'
import Button from '../../atoms/Button/Button'
import { inputStyle } from '../../atoms/PageGrid/PageGrid'
import { type AnalysisSettings } from '../../../services/api'

interface PresetsToolbarProps {
  currentSettings: Partial<AnalysisSettings>
  onApplySettings: (settings: Partial<AnalysisSettings>) => void
  onResetToDefault: () => void
}

export default function PresetsToolbar({
  currentSettings,
  onApplySettings,
  onResetToDefault,
}: PresetsToolbarProps) {
  const { t } = useLang()
  const {
    presets,
    selectedPresetName,
    newPresetName,
    setNewPresetName,
    savePreset,
    selectPreset,
    deletePreset,
  } = usePresets()

  const handleSelect = (name: string) => {
    if (!name) {
      onResetToDefault()
    } else {
      selectPreset(name, onApplySettings)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Select Preset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={selectedPresetName}
            onChange={e => handleSelect(e.target.value)}
            style={{ ...inputStyle, minWidth: '180px' }}
          >
            <option value="">-- {t.preset_select} --</option>
            {presets.map(p => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {selectedPresetName && (
            <Button variant="actions" onClick={deletePreset}>
              {t.results_delete}
            </Button>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />

        {/* Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            placeholder={t.preset_name}
            value={newPresetName}
            onChange={e => setNewPresetName(e.target.value)}
            style={{ ...inputStyle, width: '180px' }}
          />
          <Button
            variant="actions"
            disabled={!newPresetName.trim()}
            onClick={() => savePreset(currentSettings)}
          >
            {t.settings_save_section}
          </Button>
        </div>
      </div>

      {/* Reset */}
      <Button variant="actions" onClick={onResetToDefault}>
        {t.settings_reset_section}
      </Button>
    </div>
  )
}