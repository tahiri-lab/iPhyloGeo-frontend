import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type AnalysisSettings } from '../services/api'

export interface ParameterPreset {
  name: string
  settings: Partial<AnalysisSettings>
}

const PRESETS_STORAGE_KEY = 'iphylogeo-presets'

interface PresetsContextType {
  presets: ParameterPreset[]
  selectedPresetName: string
  newPresetName: string
  setNewPresetName: (name: string) => void
  setSelectedPresetName: (name: string) => void
  savePreset: (currentSettings: Partial<AnalysisSettings>) => void
  selectPreset: (presetName: string, onApplySettings: (settings: Partial<AnalysisSettings>) => void) => void
  deletePreset: () => void
  clearSelection: () => void
}

const PresetsContext = createContext<PresetsContextType | undefined>(undefined)

export function PresetsProvider({ children }: { children: ReactNode }) {
  const [presets, setPresets] = useState<ParameterPreset[]>([])
  const [selectedPresetName, setSelectedPresetName] = useState<string>('')
  const [newPresetName, setNewPresetName] = useState<string>('')

  // Chargement initial depuis le localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
      if (stored) {
        setPresets(JSON.parse(stored))
      }
    } catch {
      // Gestion silencieuse des erreurs de lecture
    }
  }, [])

  const savePresetsToStorage = (updated: ParameterPreset[]) => {
    setPresets(updated)
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated))
  }

  const savePreset = (currentSettings: Partial<AnalysisSettings>) => {
    const trimmed = newPresetName.trim()
    if (!trimmed) return

    const existingIndex = presets.findIndex(p => p.name === trimmed)
    let updated: ParameterPreset[]

    if (existingIndex >= 0) {
      updated = [...presets]
      updated[existingIndex] = { name: trimmed, settings: currentSettings }
    } else {
      updated = [...presets, { name: trimmed, settings: currentSettings }]
    }

    savePresetsToStorage(updated)
    setSelectedPresetName(trimmed)
    setNewPresetName('')
  }

  const selectPreset = (
    presetName: string,
    onApplySettings: (settings: Partial<AnalysisSettings>) => void
  ) => {
    setSelectedPresetName(presetName)

    if (!presetName) {
      return
    }

    const target = presets.find(p => p.name === presetName)
    if (target) {
      onApplySettings(target.settings)
    }
  }

  const deletePreset = () => {
    if (!selectedPresetName) return
    const updated = presets.filter(p => p.name !== selectedPresetName)
    savePresetsToStorage(updated)
    setSelectedPresetName('')
  }

  const clearSelection = () => {
    setSelectedPresetName('')
    setNewPresetName('')
  }

  return (
    <PresetsContext.Provider
      value={{
        presets,
        selectedPresetName,
        newPresetName,
        setNewPresetName,
        setSelectedPresetName,
        savePreset,
        selectPreset,
        deletePreset,
        clearSelection,
      }}
    >
      {children}
    </PresetsContext.Provider>
  )
}

export function usePresets() {
  const context = useContext(PresetsContext)
  if (!context) {
    throw new Error('usePresets doit être utilisé au sein d’un PresetsProvider')
  }
  return context
}