import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import BootstrapChart from '../../components/molecules/BootstrapChart/BootstrapChart'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import Button from '../../components/atoms/Button/Button'
import Badge from '../../components/atoms/Badge/Badge'
import EmailInput from '../../components/molecules/EmailInput/EmailInput'
import PhyloTree from '../../components/atoms/PhyloTree/PhyloTree'
import TreePagination from '../../components/molecules/Pagination/Pagination'
import Spinner from '../../components/atoms/Spinner/Spinner'
import SearchBar from '../../components/molecules/SearchBar/SearchBar'
import AnalysisSettingsForm from '../../components/molecules/AnalysisSettingsForm/AnalysisSettingsForm'
import api, { type AnalysisResult, type AnalysisSettings } from '../../services/api'
import { useLang } from '../../context/LanguageContext'
import SettingsView from '../../components/organisms/SettingsView/SettingsView'
import { validateSettings } from '../../utils/validationParamsSettings'
import { usePresets } from '../../context/PresetContext'
import PresetsToolbar from '../../components/molecules/PresetToolbar/PresetToolbar'
import { useToast } from '../../utils/toastContext'

// ── Types ─────────────────────────────────────────────────────────────────────

type CellVal = string | number | null
type OutputDict = Record<string, CellVal[]>
type Row = Record<string, CellVal>

interface ChartPoint {
  position: number
  bootstrapMean: number
  distance: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function dictToRows(dict: OutputDict): Row[] {
  const cols = Object.keys(dict)
  if (cols.length === 0) return []
  const len = dict[cols[0]].length
  return Array.from({ length: len }, (_, i) =>
    Object.fromEntries(cols.map(col => [col, dict[col][i]]))
  )
}

const STAT_KEYWORDS = ['Mantel_r', 'Mantel_p', 'Procrustes_M2', 'PROTEST_p']

/**
 * Splits a result's flat `output` table into the per-window rows shown in
 * the data table (`mainRows`), the trailing statistical-test summary
 * (`statMap`), and chart-ready bootstrap/distance points (`chartData`).
 * Mirrors `parseOutput` in ComparePage.tsx (kept separate since this one also
 * returns `mainRows` for the table — consider sharing if they drift further apart).
 */
function parseOutput(dict: OutputDict | undefined) {
  const empty = { mainRows: [] as Row[], statMap: null as Record<string, CellVal> | null, distanceCol: null as string | null, chartData: [] as ChartPoint[] }
  if (!dict) return empty

  const cols = Object.keys(dict)
  if (cols.length === 0) return empty

  const allRows = dictToRows(dict)

  const headerIdx = allRows.findIndex(row =>
    Object.values(row).some(v => STAT_KEYWORDS.includes(String(v ?? '')))
  )

  const mainRows = headerIdx === -1
    ? allRows
    : allRows.slice(0, Math.max(0, headerIdx - 1))

  let statMap: Record<string, CellVal> | null = null
  if (headerIdx !== -1 && headerIdx + 1 < allRows.length) {
    const headerRow = allRows[headerIdx]
    const valueRow = allRows[headerIdx + 1]
    const map: Record<string, CellVal> = {}
    for (const col of cols) {
      const name = String(headerRow[col] ?? '').trim()
      if (STAT_KEYWORDS.includes(name)) {
        const raw = valueRow[col]
        map[name] = raw !== '' && raw !== null ? raw : null
      }
    }
    if (Object.keys(map).length > 0) statMap = map
  }

  const distanceCol = cols.find(c => /.*[dD]istance/.test(c)) ?? null

  const chartData: ChartPoint[] = []
  if (distanceCol && cols.includes('Position in ASM') && cols.includes('Bootstrap mean')) {
    const grouped: Record<number, { bootstrap: number[]; dist: number[] }> = {}
    for (const row of mainRows) {
      const posStr = String(row['Position in ASM'] ?? '')
      if (!posStr) continue
      const startPos = parseInt(posStr.split('_')[0])
      const bootstrap = parseFloat(String(row['Bootstrap mean'] ?? ''))
      const dist = parseFloat(String(row[distanceCol] ?? ''))
      if (isNaN(startPos) || isNaN(bootstrap) || isNaN(dist)) continue
      if (!grouped[startPos]) grouped[startPos] = { bootstrap: [], dist: [] }
      grouped[startPos].bootstrap.push(bootstrap)
      grouped[startPos].dist.push(dist)
    }
    for (const [pos, vals] of Object.entries(grouped)) {
      chartData.push({
        position: parseInt(pos),
        bootstrapMean: vals.bootstrap.reduce((a, b) => a + b, 0) / vals.bootstrap.length,
        distance: vals.dist.reduce((a, b) => a + b, 0) / vals.dist.length,
      })
    }
    chartData.sort((a, b) => a.position - b.position)
  }

  return { mainRows, statMap, distanceCol, chartData }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  backgroundColor: 'var(--secondary)',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: '13px',
  color: 'var(--text)',
  borderBottom: '1px solid var(--border)',
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skel({ h = 16, w = '100%', r = 8 }: { h?: number; w?: string | number; r?: number }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />
}

function ResultDetailSkeleton() {
  return (
    <>
      <PageSection title="">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skel h={12} w={180} />
          <Skel h={280} />
        </div>
      </PageSection>
      <PageSection title="">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel h={12} w={140} />
          <Skel h={36} />
          {Array.from({ length: 5 }).map((_, i) => <Skel key={i} h={36} />)}
        </div>
      </PageSection>
      <PageSection title="">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {Array.from({ length: 4 }).map((_, i) => <Skel key={i} h={72} w={140} />)}
        </div>
      </PageSection>
    </>
  )
}

const downloadIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const linkIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

// ── Result actions dropdown ───────────────────────────────────────────────────

type ConfigPanelMode = 'view' | 'edit'

interface ConfigPanel {
  mode: ConfigPanelMode
  settings: Partial<AnalysisSettings>
}

/** "⋯" dropdown for a result row/header: view config, edit+rerun, delete. Closes on outside click. */
function ActionsMenu({
  onDelete,
  onViewConfig,
  onEditConfig,
}: {
  onDelete: () => void
  onViewConfig: () => void
  onEditConfig: () => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const itemStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '8px 14px',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    fontSize: '13px',
    color: 'var(--text)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  const deleteItemStyle: React.CSSProperties = {
    ...itemStyle,
    color: 'var(--error)',
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'color-mix(in srgb, var(--text) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--text) 20%, transparent)',
          borderRadius: '8px',
          padding: '5px 10px',
          fontSize: '18px',
          color: 'var(--text)',
          cursor: 'pointer',
          lineHeight: 1,
          letterSpacing: '0.05em',
        }}
        title="Actions"
      >
        ⋯
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 4px)',
          background: 'var(--primary)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100,
          minWidth: '180px',
          overflow: 'hidden',
        }}>
          <button style={itemStyle} onClick={() => { onViewConfig(); setOpen(false) }}>
            {t.results_view_config}
          </button>
          <button style={itemStyle} onClick={() => { onEditConfig(); setOpen(false) }}>
            {t.results_edit_config}
          </button>
          <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
          <button style={deleteItemStyle} onClick={() => { onDelete(); setOpen(false) }}>
            {t.results_delete}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * `/results` — browse past analyses and drill into one: trees, output table,
 * bootstrap chart, and statistical tests. Deep-links via `?id=`: on mount, if
 * the URL's `id` isn't in the first page of `results.list()`, it's fetched
 * individually and appended so a shared link still resolves. "Re-run" opens
 * an editable settings panel and calls `results.rerun`, which creates a new
 * result (auto-suffixed `(edit N)` on name collision) rather than mutating
 * this one — see API.md.
 */
export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [selected, setSelected] = useState<AnalysisResult | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)
  const [, setSearchParams] = useSearchParams()
  const [configPanel, setConfigPanel] = useState<ConfigPanel | null>(null)
  const [rerunning, setRerunning] = useState(false)
  const [globalSettings, setGlobalSettings] = useState<Partial<AnalysisSettings>>({})

  const { addToast } = useToast()
  const { clearSelection } = usePresets()

  useEffect(() => {
    api.settings.get().then(s => setGlobalSettings(s)).catch(() => { })
  }, [])
  const currentSelectedIdRef = useRef<string | null>(null)

  const { t } = useLang()
  const navigate = useNavigate()

  useEffect(() => {
    api.settings.get().then(s => setGlobalSettings(s)).catch(() => { })
  }, [])
  
  const selectResult = useCallback((r: AnalysisResult, updateUrl = true) => {
    const targetId = r._id
    currentSelectedIdRef.current = targetId

    setConfigPanel(null)
    setSelected(null)

    if (updateUrl) {
      setSearchParams({ id: targetId }, { replace: true })
    }

    // If the result isn't complete or has trees, we can show it immediately without fetching details
    if (r.status !== 'complete' || r.climatic_trees || r.genetic_trees) {
      setSelected(r)
      setLoadingDetail(false)
      return
    }

    setLoadingDetail(true)

    api.results.get(targetId)
      .then(fetchedResult => {
        if (currentSelectedIdRef.current === targetId) {
          setSelected(fetchedResult)
        }
      })
      .catch(() => {
        if (currentSelectedIdRef.current === targetId) {
          setSelected(r)
        }
      })
      .finally(() => {
        if (currentSelectedIdRef.current === targetId) {
          setLoadingDetail(false)
        }
      })
  }, [setSearchParams])

  useEffect(() => {
    let isMounted = true

    api.results.list({ limit: 200 })
      .then(({ data }) => {
        if (!isMounted) return
        setResults(data)

        // Read the `id` from the URL query params, but only on the first mount 
        const currentParams = new URLSearchParams(window.location.search)
        const idFromUrl = currentParams.get('id')

        const target = idFromUrl
          ? data.find(r => r._id === idFromUrl)
          : data.find(r => r.status === 'complete')

        if (target) {
          selectResult(target, !idFromUrl)
        } else if (idFromUrl) {
          setLoadingDetail(true)
          api.results.get(idFromUrl)
            .then(result => {
              if (!isMounted) return
              setResults(prev => [...prev, result])
              selectResult(result, false)
            })
            .catch(() => addToast('Result not found','error'))
            .finally(() => {
              if (isMounted) setLoadingDetail(false)
            })
        }
      })
      .catch(e => {
        if (isMounted) addToast(e instanceof Error ? e.message : String(e),'error')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleDelete = async (r: AnalysisResult) => {
  try {
    await api.results.delete(r._id)
    
    const updatedResults = results.filter(x => x._id !== r._id)
    setResults(updatedResults)

    if (selected?._id === r._id) {
      setConfigPanel(null)
      
      if (updatedResults.length > 0) {
        // Select the first result in the updated list
        selectResult(updatedResults[0], true)
      } else {
        // If there are no more results, clear the selection and reset the URL
        setSelected(null)
        setSearchParams({}, { replace: true })
      }
    }
  } catch (err) {
    addToast(`Delete failed: ${err instanceof Error ? err.message : String(err)}`, "error")
  }
}

  const handleRerun = async () => {
    if (!selected || !configPanel) return

    const validationError = validateSettings(configPanel.settings, t)
    if (validationError) {
      addToast(validationError, "error")
      return
    }

    setRerunning(true)
    try {
      let newName = selected.name
      while (results.some(r => r.name === newName)) {
        const editMatch = newName.match(/(.*) \(edit (\d+)\)$/)
        newName = editMatch
          ? `${editMatch[1]} (edit ${Number(editMatch[2]) + 1})`
          : `${selected.name} (edit 1)`
      }
      const { result_id } = await api.results.rerun(selected._id, configPanel.settings, newName)
      const newResult = await api.results.get(result_id)
      setResults(prev => [newResult, ...prev])
      setConfigPanel(null)
      navigate(`/results?id=${result_id}`)
    } catch (err) {
      addToast(`Re-run failed: ${err instanceof Error ? err.message : String(err)}`, "error")
    } finally {
      setRerunning(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const { mainRows, statMap, distanceCol, chartData } = useMemo(
    () => parseOutput(selected?.output as OutputDict | undefined),
    [selected]
  )

  const tableCols = useMemo(
    () => mainRows.length > 0 ? Object.keys(mainRows[0]) : [],
    [mainRows]
  )

  const handleDownload = async (r: AnalysisResult, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const blob = await api.results.download(r._id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${r.name}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      addToast(`Download failed: ${err instanceof Error ? err.message : String(err)}`,"error")
    }
  }

  const handleEmail = async (email: string) => {
    if (!selected) return
    try {
      await api.results.email(selected._id, email)
      addToast(t.btn_send + ' ✓',"success")
    } catch (err) {
      addToast(`Failed to send: ${err instanceof Error ? err.message : String(err)}`,"error")
    }
  }

  if (loading) {
    return (
      <PageContainer title={t.results_title}>
        <PageCard>
          <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
            <Spinner label={t.results_loading} />
          </div>
        </PageCard>
      </PageContainer>
    )
  }

  /*if (error) {
    return (
      <PageContainer title={t.results_title}>
        <PageCard>
          <p style={{ padding: '24px', color: 'var(--error)', fontSize: '14px' }}>{error}</p>
        </PageCard>
      </PageContainer>
    )
  }*/

  return (
    <PageContainer title={t.results_title}>
      <PageCard>

        {/* ── Analysis Runs selector ── */}
        <PageSection title={t.results_analysis_runs} style={{ borderTop: 'none' }}>
          {results.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              {t.results_no_results}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <SearchBar
                options={results.map(r => {
                  const editMatch = r.name.match(/^(.*) \((edit \d+)\)$/)
                  return {
                    id: r._id,
                    label: editMatch ? editMatch[1] : r.name,
                    hover: {
                      text: editMatch ? editMatch[2] : "OG",
                      content: <SettingsView settings={r.settings ?? null} label={null} otherSettings={null} otherLabel={null} wide={null} />,
                    },
                    sublabel: new Date(r.created_at).toLocaleString(),
                    badge: r.status,
                  }
                })}
                value={selected?._id ?? null}
                onSelect={id => {
                  const r = results.find(r => r._id === id)
                  if (r) selectResult(r)
                }}
              />
              {selected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '2px' }}>
                  <Badge>{selected.status}</Badge>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <strong>{t.results_created}</strong> {new Date(selected.created_at).toLocaleString()}
                    </span>
                    {selected.expired_at && (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <strong>{t.results_expired}</strong> {new Date(selected.expired_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {selected.status === 'complete' && (
                    <Button
                      variant="download"
                      icon={downloadIcon}
                      onClick={e => handleDownload(selected, e)}
                    >
                      {t.results_excel}
                    </Button>
                  )}
                  <div style={{ marginLeft: 'auto' }}>
                    <ActionsMenu
                      onDelete={() => handleDelete(selected)}
                      onViewConfig={() => setConfigPanel({ mode: 'view', settings: selected.settings ?? {} })}
                      onEditConfig={() => setConfigPanel({
                        mode: 'edit',
                        settings: { ...(Object.keys(selected.settings ?? {}).length > 0 ? selected.settings! : globalSettings) },
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </PageSection>

        {/* ── Config panel (view or edit) ── */}
        {selected && configPanel && (
          <PageSection title={configPanel.mode === 'view' ? t.results_view_config : t.results_edit_config}>
            {configPanel.mode === 'view' && Object.keys(configPanel.settings).length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                No configuration saved for this analysis.
              </p>
            ) : (
              <>
                {/* PresetBar */}
                {configPanel.mode === 'edit' && (
                  <div style={{ marginBottom: '16px' }}>
                    <PresetsToolbar
                      currentSettings={configPanel.settings}
                      onApplySettings={(newSettings: Partial<AnalysisSettings>) => {
                        setConfigPanel(prev => prev ? { ...prev, settings: newSettings } : null)
                      }}
                      onResetToDefault={() => {
                        setConfigPanel(prev => prev ? { ...prev, settings: globalSettings } : null)
                        clearSelection()
                      }}
                    />
                  </div>
                )}

                <AnalysisSettingsForm
                  settings={configPanel.settings}
                  onChange={(key, value) => {
                    if (configPanel.mode === 'edit') {
                      setConfigPanel(prev => prev ? { ...prev, settings: { ...prev.settings, [key]: value } } : null)
                    }
                  }}
                  readOnly={configPanel.mode === 'view'}
                />
              </>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfigPanel(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                {t.results_config_cancel}
              </button>
              {configPanel.mode === 'edit' && (
                <Button variant="actions" onClick={handleRerun} disabled={rerunning}>
                  {rerunning ? t.results_rerunning : t.results_rerun}
                </Button>
              )}
            </div>
          </PageSection>
        )}

        {loadingDetail && <ResultDetailSkeleton />}

        {/* ── Bootstrap/Distance chart ── */}
        {selected?.status === 'complete' && chartData.length > 0 && (
          <PageSection title={`Bootstrap Mean & ${distanceCol ?? 'Distance'}`}>
            <BootstrapChart
              chartData={chartData}
              distanceCol={distanceCol}
              filename={`${selected.name}-bootstrap-distance.svg`}
            />
          </PageSection>
        )}

        {/* ── Results table ── */}
        {selected?.status === 'complete' && mainRows.length > 0 && (
          <PageSection title={`${t.results_output}: ${selected.name} (${mainRows.length} rows)`}>
            <div style={{ width: '100%', borderRadius: '12px', overflow: 'auto', maxHeight: '480px', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr>
                    {tableCols.map(col => (
                      <th key={col} style={thStyle}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mainRows.map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--table-alt-row-color)' }}>
                      {tableCols.map(col => (
                        <td key={col} style={tdStyle}>{String(row[col] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PageSection>
        )}

        {/* ── Statistical tests ── */}
        {selected?.status === 'complete' && statMap && (
          <PageSection title={t.results_statistical_tests}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {Object.entries(statMap).map(([name, value]) => (
                <div
                  key={name}
                  style={{
                    padding: '16px 20px',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    minWidth: '140px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    {name}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
                    {value !== null ? (typeof value === 'number' ? value.toFixed(4) : String(value)) : '—'}
                  </div>
                </div>
              ))}
            </div>
          </PageSection>
        )}

        {/* ── Climatic Trees ── */}
        {selected?.status === 'complete' && selected.climatic_trees && Object.keys(selected.climatic_trees).length > 0 && (
          <PageSection title={t.results_climatic_trees}>
            <TreePagination
              key={`${selected._id}-climatic`}
              trees={Object.entries(selected.climatic_trees).map(([name, newick]) => ({ name, newick }))}
              renderTree={(name, newick) => <PhyloTree key={name} newick={newick} name={name} />}
            />
          </PageSection>
        )}

        {/* ── Genetic Trees ── */}
        {selected?.status === 'complete' && selected.genetic_trees && Object.keys(selected.genetic_trees).length > 0 && (
          <PageSection title={t.results_genetic_trees}>
            <TreePagination
              key={`${selected._id}-genetic`}
              trees={Object.entries(selected.genetic_trees).map(([name, newick]) => ({ name, newick }))}
              renderTree={(name, newick) => <PhyloTree key={name} newick={newick} name={name} />}
            />
          </PageSection>
        )}

        {/* ── Share Results ── */}
        {selected?.status === 'complete' && (
          <PageSection title={t.results_share}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Copy link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    background: 'var(--secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {window.location.href}
                </div>
                <button
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: '10px',
                    border: `1px solid ${linkCopied ? 'var(--action)' : 'var(--border)'}`,
                    background: linkCopied ? 'var(--action-soft-bg)' : 'transparent',
                    color: linkCopied ? 'var(--action)' : 'var(--text)',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                  }}
                >
                  {linkIcon}
                  {linkCopied ? t.results_link_copied : t.results_copy_link}
                </button>
              </div>

              {/* Email share */}
              <EmailInput
                description={t.results_share_desc}
                buttonLabel={t.btn_send}
                onSend={handleEmail}
              />
              {emailMsg && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                  {emailMsg}
                </p>
              )}
            </div>
          </PageSection>
        )}

      </PageCard>
    </PageContainer>
  )
}
