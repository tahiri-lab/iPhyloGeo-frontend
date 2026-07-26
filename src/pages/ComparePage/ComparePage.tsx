import { useEffect, useMemo, useRef, useState } from 'react'
import BootstrapChart from '../../components/molecules/BootstrapChart/BootstrapChart'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import SearchBar from '../../components/molecules/SearchBar/SearchBar'
import TreePagination from '../../components/molecules/Pagination/Pagination'
import Badge from '../../components/atoms/Badge/Badge'
import Spinner from '../../components/atoms/Spinner/Spinner'
import api, { type AnalysisResult, type AnalysisSettings } from '../../services/api'
import { useLang } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { TreeGraph } from '../../components/molecules/CytoscapeTree/CytoscapeTree'
import { type LayoutType, LAYOUTS } from '../../constants/layoutConfig'
import { selectStyle } from '../../styles/commonStyles'

// ── Types ─────────────────────────────────────────────────────────────────────

type CellVal = string | number | null
type OutputDict = Record<string, CellVal[]>

interface ChartPoint {
  position: number
  bootstrapMean: number
  distance: number
}

interface ParsedOutput {
  statMap: Record<string, CellVal> | null
  distanceCol: string | null
  chartData: ChartPoint[]
}

// ── Responsive hook ───────────────────────────────────────────────────────────

function useContainerWide(ref: React.RefObject<HTMLDivElement | null>, threshold = 640): boolean {
  const [wide, setWide] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setWide((entries[0]?.contentRect.width ?? 0) >= threshold)
    })
    ro.observe(el)
    setWide(el.getBoundingClientRect().width >= threshold)
    return () => ro.disconnect()
  }, [ref, threshold])
  return wide
}

// ── Output parser ─────────────────────────────────────────────────────────────

const STAT_KEYWORDS = ['Mantel_r', 'Mantel_p', 'Procrustes_M2', 'PROTEST_p']

function parseOutput(output: OutputDict | undefined): ParsedOutput {
  const empty: ParsedOutput = { statMap: null, distanceCol: null, chartData: [] }
  if (!output) return empty
  const cols = Object.keys(output)
  if (!cols.length) return empty

  const len = output[cols[0]].length
  const rows = Array.from({ length: len }, (_, i) =>
    Object.fromEntries(cols.map(c => [c, output[c][i]]))
  )

  const headerIdx = rows.findIndex(row =>
    Object.values(row).some(v => STAT_KEYWORDS.includes(String(v ?? '')))
  )
  let statMap: Record<string, CellVal> | null = null
  const mainRows = headerIdx === -1 ? rows : rows.slice(0, Math.max(0, headerIdx - 1))
  if (headerIdx !== -1 && headerIdx + 1 < rows.length) {
    const headerRow = rows[headerIdx]
    const valueRow = rows[headerIdx + 1]
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

  return { statMap, distanceCol, chartData }
}

// ── Settings config ───────────────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────────────────

function SettingsDiff({
  settingsA,
  settingsB,
  labelA,
  labelB,
  wide,
}: {
  settingsA: Partial<AnalysisSettings> | null
  settingsB: Partial<AnalysisSettings> | null
  labelA: string
  labelB: string
  wide: boolean
}) {
  if (!settingsA || !settingsB || Object.keys(settingsA).length === 0 || Object.keys(settingsB).length === 0) {
    return <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No configuration saved for these analyses.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Column headers */}
      {wide && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr' }}>
          <div />
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: '10px' }}>
            {labelA}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: '10px' }}>
            {labelB}
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
              const valA = String(settingsA[key] ?? '—')
              const valB = String(settingsB[key] ?? '—')
              const differs = valA !== valB
              const rowBg = differs
                ? 'color-mix(in srgb, var(--action) 6%, transparent)'
                : i % 2 === 0 ? 'color-mix(in srgb, var(--text) 3%, transparent)' : 'transparent'

              if (wide) {
                return (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '200px 1fr 1fr',
                      borderRadius: '6px',
                      backgroundColor: rowBg,
                      padding: '5px 4px',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '4px' }}>
                      {SETTING_LABELS[key] ?? key}
                    </span>
                    <span style={{ paddingLeft: '10px' }}>
                      <SettingValue value={valA} differs={differs} />
                    </span>
                    <span style={{ paddingLeft: '10px' }}>
                      <SettingValue value={valB} differs={differs} />
                    </span>
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
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{labelA}</div>
                      <SettingValue value={valA} differs={differs} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{labelB}</div>
                      <SettingValue value={valB} differs={differs} />
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

function StatCards({ statMap }: { statMap: Record<string, CellVal> | null }) {
  if (!statMap) return <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {Object.entries(statMap).map(([name, value]) => (
        <div
          key={name}
          style={{ padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '10px', minWidth: '110px', textAlign: 'center' }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            {name}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
            {value !== null ? (typeof value === 'number' ? value.toFixed(4) : String(value)) : '—'}
          </div>
        </div>
      ))}
    </div>
  )
}

function SideHeader({ result, label, onClear }: { result: AnalysisResult | null; label: string; onClear: () => void }) {
  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        {label}
      </div>
      {result && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Badge>{result.status}</Badge>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {result.name}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {new Date(result.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={onClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

// ── Two-column layout ─────────────────────────────────────────────────────────

function TwoCol({
  wide,
  left,
  right,
}: {
  wide: boolean
  left: React.ReactNode
  right: React.ReactNode
}) {
  if (wide) {
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0 }}>{left}</div>
        <div style={{ width: '1px', backgroundColor: 'var(--border)', flexShrink: 0, margin: '0 24px' }} />
        <div style={{ flex: 1, minWidth: 0 }}>{right}</div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {left}
      <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />
      {right}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wide = useContainerWide(containerRef)

  const [allResults, setAllResults] = useState<AnalysisResult[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [resultA, setResultA] = useState<AnalysisResult | null>(null)
  const [resultB, setResultB] = useState<AnalysisResult | null>(null)
  const [layout, setLayout] = useState<LayoutType>('top-down')
  const [trigger, setTrigger] = useState(0)
  const { t } = useLang()
  const { theme } = useTheme()
  const darkMode = theme === 'dark'

  useEffect(() => {
    api.results.list({ limit: 200 })
      .then(({ data }) => setAllResults(data))
      .finally(() => setLoadingList(false))
  }, [])

  async function selectSide(id: string, side: 'A' | 'B') {
    const setter = side === 'A' ? setResultA : setResultB
    const setDetailLoading = side === 'A' ? setLoadingA : setLoadingB
    const cached = allResults.find(r => r._id === id)
    if (cached && (cached.climatic_trees || cached.genetic_trees || cached.output)) {
      setter(cached)
      return
    }
    setDetailLoading(true)
    try {
      setter(await api.results.get(id))
    } finally {
      setDetailLoading(false)
    }
  }

  const parsedA = useMemo(() => parseOutput(resultA?.output as OutputDict | undefined), [resultA])
  const parsedB = useMemo(() => parseOutput(resultB?.output as OutputDict | undefined), [resultB])

  const aComplete = resultA?.status === 'complete'
  const bComplete = resultB?.status === 'complete'
  const bothComplete = aComplete && bComplete

  const selectorOptions = allResults.map(r => ({
    id: r._id,
    label: r.name,
    sublabel: new Date(r.created_at).toLocaleString(),
    badge: r.status,
  }))

  const labelA = resultA?.name ?? t.compare_analysis_a
  const labelB = resultB?.name ?? t.compare_analysis_b

  return (
    <PageContainer title={t.compare_title}>
      <PageCard>
        <div ref={containerRef}>

          {/* ── Selectors ── */}
          <PageSection title={t.compare_select_analyses} style={{ borderTop: 'none' }}>
            {loadingList ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                <Spinner label={t.results_loading} />
              </div>
            ) : (
              <TwoCol
                wide={wide}
                left={
                  <>
                    <SideHeader result={resultA} label={t.compare_analysis_a} onClear={() => setResultA(null)} />
                    {loadingA
                      ? <Spinner label={t.results_loading} />
                      : (
                        <SearchBar
                          options={selectorOptions.filter(o => o.id !== resultB?._id)}
                          value={resultA?._id ?? null}
                          onSelect={id => { if (id) selectSide(id, 'A') }}
                          triggerSend={() => setTrigger(t => t + 1)}
                        />
                      )}
                  </>
                }
                right={
                  <>
                    <SideHeader result={resultB} label={t.compare_analysis_b} onClear={() => setResultB(null)} />
                    {loadingB
                      ? <Spinner label={t.results_loading} />
                      : (
                        <SearchBar
                          options={selectorOptions.filter(o => o.id !== resultA?._id)}
                          value={resultB?._id ?? null}
                          onSelect={id => { if (id) selectSide(id, 'B') }}
                          trigger={trigger}
                        />
                      )}
                  </>
                }
              />
            )}
          </PageSection>

          {!bothComplete && (resultA || resultB) && (
            <div style={{ padding: '0 24px 24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                {t.compare_select_both}
              </p>
            </div>
          )}

          {/* ── Layout selector ── */}
          {bothComplete && (
            <PageSection title="" style={{ borderTop: 'none', paddingTop: 0, paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t.graph_layout}
                </span>
                <select
                  style={{ ...selectStyle, minWidth: 140 }}
                  value={layout}
                  onChange={e => setLayout(e.target.value as LayoutType)}
                >
                  {LAYOUTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </PageSection>
          )}

          {/* ── Configuration ── */}
          {bothComplete && (
            <PageSection title={t.compare_configuration}>
              <SettingsDiff
                settingsA={resultA?.settings ?? null}
                settingsB={resultB?.settings ?? null}
                labelA={labelA}
                labelB={labelB}
                wide={wide}
              />
            </PageSection>
          )}

          {/* ── Bootstrap Mean & Distance charts ── */}
          {bothComplete && resultA && resultB &&
            (parsedA.chartData.length > 0 || parsedB.chartData.length > 0) && (
            <PageSection title="Bootstrap Mean & Distance">
              <TwoCol
                wide={wide}
                left={<BootstrapChart chartData={parsedA.chartData} distanceCol={parsedA.distanceCol} label={labelA} />}
                right={<BootstrapChart chartData={parsedB.chartData} distanceCol={parsedB.distanceCol} label={labelB} />}
              />
            </PageSection>
          )}

          {/* ── Statistical Tests ── */}
          {bothComplete && resultA && resultB &&
            (parsedA.statMap || parsedB.statMap) && (
            <PageSection title={t.results_statistical_tests}>
              <TwoCol
                wide={wide}
                left={<StatCards statMap={parsedA.statMap} />}
                right={<StatCards statMap={parsedB.statMap} />}
              />
            </PageSection>
          )}

          {/* ── Genetic Trees ── */}
          {bothComplete && resultA && resultB &&
            (resultA.genetic_trees || resultB.genetic_trees) && (
            <PageSection title={t.results_genetic_trees}>
              <TwoCol
                wide={wide}
                left={
                  resultA.genetic_trees && Object.keys(resultA.genetic_trees).length > 0
                    ? <TreePagination
                        key={`${resultA._id}-genetic-${layout}`}
                        trees={Object.entries(resultA.genetic_trees).map(([name, newick]) => ({ name, newick }))}
                        renderTree={(name, newick) => (
                          <TreeGraph key={`${name}-${layout}`} newick={newick} name={name} layout={layout} darkMode={darkMode} />
                        )}
                        pageSize={3}
                      />
                    : <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
                }
                right={
                  resultB.genetic_trees && Object.keys(resultB.genetic_trees).length > 0
                    ? <TreePagination
                        key={`${resultB._id}-genetic-${layout}`}
                        trees={Object.entries(resultB.genetic_trees).map(([name, newick]) => ({ name, newick }))}
                        renderTree={(name, newick) => (
                          <TreeGraph key={`${name}-${layout}`} newick={newick} name={name} layout={layout} darkMode={darkMode} />
                        )}
                        pageSize={3}
                      />
                    : <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
                }
              />
            </PageSection>
          )}

        </div>
      </PageCard>
    </PageContainer>
  )
}
