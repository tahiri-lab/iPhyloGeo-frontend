import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type AnalysisSettings } from '../services/api'

/**
 * Represents a saved parameter preset.
 */
export interface ParameterPreset {
  name: string
  settings: Partial<AnalysisSettings>
}

// Local storage key used to persist presets across sessions
const PRESETS_STORAGE_KEY = 'iphylogeo-presets'

/**
 * Type definition for the Presets Context.
 */
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

// Create the context for managing parameter presets
const PresetsContext = createContext<PresetsContextType | undefined>(undefined)

/**
 * Provider component that manages the state and actions for analysis presets.
 */
export function PresetsProvider({ children }: { children: ReactNode }) {
  const [presets, setPresets] = useState<ParameterPreset[]>([])
  const [selectedPresetName, setSelectedPresetName] = useState<string>('')
  const [newPresetName, setNewPresetName] = useState<string>('')

  // Load saved presets from localStorage upon initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
      if (stored) {
        setPresets(JSON.parse(stored))
      }
    } catch {
      // Silently ignore JSON parsing or storage access errors
    }
  }, [])

  /**
   * Helper function to update state and sync presets with localStorage.
   */
  const savePresetsToStorage = (updated: ParameterPreset[]) => {
    setPresets(updated)
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated))
  }

  /**
   * Saves or updates a preset using the current settings and `newPresetName`.
   */
  const savePreset = (currentSettings: Partial<AnalysisSettings>) => {
    const trimmed = newPresetName.trim()
    if (!trimmed) return

    const existingIndex = presets.findIndex(p => p.name === trimmed)
    let updated: ParameterPreset[]

    // Overwrite existing preset if found, otherwise add as new
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

  /**
   * Selects a preset by name and applies its settings via the provided callback.
   */
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

  /**
   * Deletes the currently selected preset and removes it from storage.
   */
  const deletePreset = () => {
    if (!selectedPresetName) return
    const updated = presets.filter(p => p.name !== selectedPresetName)
    savePresetsToStorage(updated)
    setSelectedPresetName('')
  }

  /**
   * Resets selection and input fields.
   */
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

/**
 * Custom hook to access the PresetsContext state and actions.
 */
export function usePresets() {
  const context = useContext(PresetsContext)
  if (!context) {
    throw new Error('usePresets doit être utilisé au sein d’un PresetsProvider')
  }
  return context
}