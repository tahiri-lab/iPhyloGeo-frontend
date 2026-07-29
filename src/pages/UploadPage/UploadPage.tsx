import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { type JobStatus, type ClimaticPreview, type GeneticPreview, type AnalysisSettings } from '../../services/api'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import Button from '../../components/atoms/Button/Button'
import CoffeeLoader from '../../components/atoms/CoffeeLoader/CoffeeLoader'
import { useLang } from '../../context/LanguageContext'
import { HelpSection, HelpHeading, HelpText } from '../../components/molecules/HelpSection/HelpSection'
import ClimateChartBuilder from '../../components/molecules/ClimateChartBuilder/ClimateChartBuilder'
import AlignmentViewer from '../../components/molecules/AlignmentViewer/AlignmentViewer'
import AnalysisSettingsForm from '../../components/molecules/AnalysisSettingsForm/AnalysisSettingsForm'
import { inputStyle } from '../../components/atoms/PageGrid/PageGrid'

interface UploadedFile {
  name: string
  size: number
  file: File
}

/** Drag-and-drop / click-to-browse zone for a single file; shows uploading/uploaded/empty states. */
function FileDropZone({
  label,
  accept,
  file,
  uploading,
  onFile,
}: {
  label: string
  accept: string
  file: UploadedFile | null
  uploading: boolean
  onFile: (f: File) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useLang()

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFile(f)
  }

  const formatSize = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{label}</label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--action)' : file ? 'var(--action)' : 'var(--border)'}`,
          borderRadius: '12px',
          padding: '28px 20px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: dragging ? 'var(--action-soft-bg)' : file ? 'var(--action-soft-bg)' : 'transparent',
          transition: 'all 0.2s ease',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={handleChange} disabled={uploading} />
        {uploading ? (
          <div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '14px' }}>{t.upload_uploading}</p>
          </div>
        ) : file ? (
          <div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>{file.name}</p>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '12px' }}>{formatSize(file.size)}</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.4 }}>📂</div>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '14px', fontWeight: 500 }}>
              {t.upload_drop_text} <span style={{ color: 'var(--action)', fontWeight: 700 }}>{t.upload_browse}</span>
            </p>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
              {t.upload_accepted} {accept}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * `/upload` — file intake, inline per-analysis settings, and pipeline launch.
 * Each file upload fires immediately (not deferred to submit), and the
 * analysis name is checked for uniqueness with a 400ms debounce against
 * `results.checkName`. Settings edited here are sent as a one-off override
 * with the job — see API.md's Jobs section for how that differs from the
 * global settings on `/settings`. After `jobs.create`, polls job status
 * every 2s until `complete` (→ navigates to `/results`) or `error`.
 */
export default function UploadPage() {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const [climateFile, setClimateFile] = useState<UploadedFile | null>(null)
  const [geneticFile, setGeneticFile] = useState<UploadedFile | null>(null)
  const [climaticId, setClimaticId] = useState<string | null>(null)
  const [geneticId, setGeneticId] = useState<string | null>(null)
  const [uploadingClimatic, setUploadingClimatic] = useState(false)
  const [uploadingGenetic, setUploadingGenetic] = useState(false)
  const [running, setRunning] = useState(false)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [, setResultId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [climaticPreview, setClimaticPreview] = useState<ClimaticPreview | null>(null)
  const [geneticPreview, setGeneticPreview] = useState<GeneticPreview | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const notifyEmailRef = useRef<string | null>(null)

  // Settings
  const [localSettings, setLocalSettings] = useState<Partial<AnalysisSettings>>({})
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Analysis name + duplicate check
  const [analysisName, setAnalysisName] = useState('')
  const [nameTaken, setNameTaken] = useState(false)
  const [checkingName, setCheckingName] = useState(false)
  const nameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    api.settings.get()
      // Merge: global settings as base, preserve any changes the user already made
      .then(s => setLocalSettings(prev => ({ ...s, ...prev })))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!analysisName) {
      setNameTaken(false)
      return
    }
    if (nameCheckTimer.current) clearTimeout(nameCheckTimer.current)
    setCheckingName(true)
    nameCheckTimer.current = setTimeout(async () => {
      try {
        const { taken } = await api.results.checkName(analysisName)
        setNameTaken(taken)
      } catch {
        setNameTaken(false)
      } finally {
        setCheckingName(false)
      }
    }, 400)
  }, [analysisName])

  const uploading = uploadingClimatic || uploadingGenetic
  const canRun = !!climaticId && !!geneticId && !running && !uploading && !nameTaken && !!analysisName

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t.upload_status_pending,
      climatic_trees: t.upload_status_climatic_trees,
      alignment: t.upload_status_alignment,
      genetic_trees: t.upload_status_genetic_trees,
      output: t.upload_status_output,
      complete: t.upload_status_complete,
      error: t.upload_status_error,
    }
    return map[status] ?? status
  }

  const handleClimaticFile = async (file: File) => {
    setClimateFile({ name: file.name, size: file.size, file })
    setClimaticId(null)
    setClimaticPreview(null)
    setError(null)
    setUploadingClimatic(true)
    const derivedName = file.name.replace(/\.[^.]+$/, '')
    setAnalysisName(derivedName)
    try {
      const { file_id } = await api.upload.climatic(file)
      setClimaticId(file_id)
      const prev = await api.preview.climatic(file_id)
      setClimaticPreview(prev)
    } catch (e) {
      setError(`Climatic upload failed: ${e instanceof Error ? e.message : String(e)}`)
      setClimateFile(null)
    } finally {
      setUploadingClimatic(false)
    }
  }

  const handleGeneticFile = async (file: File) => {
    setGeneticFile({ name: file.name, size: file.size, file })
    setGeneticId(null)
    setGeneticPreview(null)
    setError(null)
    setUploadingGenetic(true)
    try {
      const { file_id } = await api.upload.genetic(file)
      setGeneticId(file_id)
      const prev = await api.preview.genetic(file_id)
      setGeneticPreview(prev)
    } catch (e) {
      setError(`Genetic upload failed: ${e instanceof Error ? e.message : String(e)}`)
      setGeneticFile(null)
    } finally {
      setUploadingGenetic(false)
    }
  }

  const handleRun = async () => {
    if (!climaticId || !geneticId) return
    setRunning(true)
    setError(null)
    setJobStatus(null)
    setResultId(null)
    setEmailSent(false)
    notifyEmailRef.current = null
    try {
      const { result_id } = await api.jobs.create({
        climatic_file_id: climaticId,
        genetic_file_id: geneticId,
        name: analysisName || climateFile?.name.replace(/\.[^.]+$/, '') || 'result',
        settings: localSettings,
      })
      setResultId(result_id)

      const poll = async () => {
        try {
          const status = await api.jobs.status(result_id)
          setJobStatus(status)
          if (status.status === 'complete') {
            if (notifyEmailRef.current && result_id) {
              api.results.email(result_id, notifyEmailRef.current, lang).catch(() => {})
            }
            navigate('/results')
          } else if (status.status === 'error') {
            setError(status.error ?? 'Pipeline failed')
            setRunning(false)
          } else {
            setTimeout(poll, 2000)
          }
        } catch (e) {
          setError(`Status check failed: ${e instanceof Error ? e.message : String(e)}`)
          setRunning(false)
        }
      }
      poll()
    } catch (e) {
      setError(`Failed to start job: ${e instanceof Error ? e.message : String(e)}`)
      setRunning(false)
    }
  }

  const handleEmailSubmit = (email: string) => {
    notifyEmailRef.current = email
    setEmailSent(true)
  }

  return (
    <>
      {running && (
        <CoffeeLoader
          statusLabel={jobStatus ? statusLabel(jobStatus.status) : t.upload_starting_pipeline}
          progress={jobStatus?.progress}
          onEmailSubmit={handleEmailSubmit}
          emailSent={emailSent}
        />
      )}

    <PageContainer title={t.upload_title}>
      <PageCard>
        <PageSection title={t.upload_input_files} style={{ borderTop: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <FileDropZone
              label={t.upload_climate_label}
              accept=".csv,.xlsx,.xls"
              file={climateFile}
              uploading={uploadingClimatic}
              onFile={handleClimaticFile}
            />
            <FileDropZone
              label={t.upload_genetic_label}
              accept=".fasta,.fa"
              file={geneticFile}
              uploading={uploadingGenetic}
              onFile={handleGeneticFile}
            />
          </div>

          {/* Analysis name */}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {t.upload_analysis_name}
            </label>
            <input
              type="text"
              value={analysisName}
              onChange={e => setAnalysisName(e.target.value)}
              placeholder={t.upload_analysis_name}
              style={{ ...inputStyle, maxWidth: '360px' }}
              onFocus={e => (e.target.style.borderColor = 'var(--secondary-hover)')}
              onBlur={e => (e.target.style.borderColor = 'var(--secondary)')}
            />
            {(nameTaken || analysisName.match(/(.*) \(edit (\d+)\)$/)) && !checkingName && (
              <span style={{ fontSize: '12px', color: 'var(--error)' }}>{t.upload_name_taken}</span>
            )}
          </div>

          {/* Collapsible settings */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              {settingsOpen ? t.upload_settings_hide : t.upload_settings_show}
            </button>

            {settingsOpen && (
              <div style={{
                marginTop: '16px',
                padding: '20px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                backgroundColor: 'var(--secondary)',
              }}>
                <AnalysisSettingsForm
                  settings={localSettings}
                  onChange={(key, value) => setLocalSettings(prev => ({ ...prev, [key]: value }))}
                />
              </div>
            )}
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '13px', marginTop: '12px', marginBottom: 0 }}>{error}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="actions" disabled={!canRun} onClick={handleRun}>
              {t.upload_run}
            </Button>
          </div>
        </PageSection>

        {climaticPreview && (
          <PageSection title={t.upload_climatic_preview}>
            <ClimateChartBuilder data={climaticPreview} />
          </PageSection>
        )}

        {geneticPreview && Object.keys(geneticPreview.sequences).length > 0 && (
          <PageSection title={t.upload_genetic_preview}>
            <AlignmentViewer data={geneticPreview} />
          </PageSection>
        )}

        <PageSection title={t.upload_how_it_works}>
          <HelpSection>
            <HelpHeading>{t.upload_help_climate_title}</HelpHeading>
            <HelpText>
              <p>{t.upload_help_climate_text}</p>
            </HelpText>
            <HelpHeading>{t.upload_help_genetic_title}</HelpHeading>
            <HelpText>
              <p>{t.upload_help_genetic_text}</p>
            </HelpText>
          </HelpSection>
        </PageSection>
      </PageCard>
    </PageContainer>
    </>
  )
}