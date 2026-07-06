import { useEffect, useMemo, useState } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import SearchBar from '../../components/molecules/SearchBar/SearchBar'
import PhyloTree from '../../components/atoms/PhyloTree/PhyloTree'
import TreePagination from '../../components/molecules/Pagination/Pagination'
import Badge from '../../components/atoms/Badge/Badge'
import Spinner from '../../components/atoms/Spinner/Spinner'
import api, { type AnalysisResult, type AnalysisSettings } from '../../services/api'
import { useLang } from '../../context/LanguageContext'

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

  // stat map
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

// ── Settings groups ───────────────────────────────────────────────────────────

const SETTINGS_GROUPS: { label: string; keys: (keyof AnalysisSettings)[] }[] = [
  {
    label: 'Algorithm',
    keys: ['alignment_method', 'distance_method', 'fit_method', 'tree_type', 'statistical_test', 'mantel_test_method'],
  },
  {
    label: 'Thresholds',
    keys: ['bootstrap_threshold', 'dist_threshold', 'window_size', 'step_size', 'rate_similarity'],
  },
  {
    label: 'Preprocessing',
    keys: ['preprocessing_genetic', 'preprocessing_climatic', 'preprocessing_threshold_genetic', 'preprocessing_threshold_climatic'],
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function SettingsPanel({ settings }: { settings: AnalysisSettings | null }) {
  if (!settings) return <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {SETTINGS_GROUPS.map(group => (
        <div key={group.label}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            {group.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {group.keys.map(key => (
              <div key={key} style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0, minWidth: 0 }}>{key}:</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{String(settings[key])}</span>
              </div>
            ))}
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
          style={{
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            minWidth: '110px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            {name}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
            {value !== null
              ? (typeof value === 'number' ? value.toFixed(4) : String(value))
              : '—'}
          </div>
        </div>
      ))}
    </div>
  )
}

function BootstrapChart({ chartData, distanceCol, label }: { chartData: ChartPoint[]; distanceCol: string | null; label: string }) {
  if (!chartData.length) return <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 32, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
            <XAxis
              dataKey="position"
              label={{ value: 'Position in ASM', position: 'insideBottom', offset: -12, fill: 'var(--text-secondary)', fontSize: 11 }}
              tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#AD00FA', fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#00faad', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: 'var(--text-secondary)' }}
              itemStyle={{ color: 'var(--text)' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
            <Line yAxisId="left" type="monotone" dataKey="bootstrapMean" name="Bootstrap mean" stroke="#AD00FA" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="distance" name={distanceCol ?? 'Distance'} stroke="#00faad" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
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
            title="Clear"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const colStyle: React.CSSProperties = { flex: 1, minWidth: 0 }

const dividerStyle: React.CSSProperties = {
  width: '1px',
  backgroundColor: 'var(--border)',
  flexShrink: 0,
  margin: '0 24px',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [allResults, setAllResults] = useState<AnalysisResult[]>([])
  const [settings, setSettings] = useState<AnalysisSettings | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [resultA, setResultA] = useState<AnalysisResult | null>(null)
  const [resultB, setResultB] = useState<AnalysisResult | null>(null)
  const { t } = useLang()

  useEffect(() => {
    Promise.all([
      api.results.list({ limit: 200 }),
      api.settings.get(),
    ]).then(([{ data }, s]) => {
      setAllResults(data)
      setSettings(s)
    }).finally(() => setLoadingList(false))
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
      const full = await api.results.get(id)
      setter(full)
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

  return (
    <PageContainer title={t.compare_title}>
      <PageCard>

        {/* ── Selectors ── */}
        <PageSection title={t.compare_select_analyses} style={{ borderTop: 'none' }}>
          {loadingList ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <Spinner label={t.results_loading} />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={colStyle}>
                <SideHeader result={resultA} label={t.compare_analysis_a} onClear={() => setResultA(null)} />
                {loadingA
                  ? <Spinner label={t.results_loading} />
                  : (
                    <SearchBar
                      options={selectorOptions.filter(o => o.id !== resultB?._id)}
                      value={resultA?._id ?? null}
                      onSelect={id => { if (id) selectSide(id, 'A') }}
                    />
                  )}
              </div>
              <div style={colStyle}>
                <SideHeader result={resultB} label={t.compare_analysis_b} onClear={() => setResultB(null)} />
                {loadingB
                  ? <Spinner label={t.results_loading} />
                  : (
                    <SearchBar
                      options={selectorOptions.filter(o => o.id !== resultA?._id)}
                      value={resultB?._id ?? null}
                      onSelect={id => { if (id) selectSide(id, 'B') }}
                    />
                  )}
              </div>
            </div>
          )}
        </PageSection>

        {/* ── Hint when selection is incomplete ── */}
        {!bothComplete && (resultA || resultB) && (
          <div style={{ padding: '0 24px 24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              {t.compare_select_both}
            </p>
          </div>
        )}

        {/* ── Configuration (global settings) ── */}
        {bothComplete && (
          <PageSection title={t.compare_configuration}>
            <SettingsPanel settings={settings} />
          </PageSection>
        )}

        {/* ── Bootstrap Mean & Distance charts ── */}
        {bothComplete && resultA && resultB &&
          (parsedA.chartData.length > 0 || parsedB.chartData.length > 0) && (
          <PageSection title={`Bootstrap Mean & Distance`}>
            <div style={{ display: 'flex' }}>
              <div style={colStyle}>
                <BootstrapChart chartData={parsedA.chartData} distanceCol={parsedA.distanceCol} label={resultA.name} />
              </div>
              <div style={dividerStyle} />
              <div style={colStyle}>
                <BootstrapChart chartData={parsedB.chartData} distanceCol={parsedB.distanceCol} label={resultB.name} />
              </div>
            </div>
          </PageSection>
        )}

        {/* ── Statistical Tests ── */}
        {bothComplete && resultA && resultB &&
          (parsedA.statMap || parsedB.statMap) && (
          <PageSection title={t.results_statistical_tests}>
            <div style={{ display: 'flex' }}>
              <div style={colStyle}>
                <StatCards statMap={parsedA.statMap} />
              </div>
              <div style={dividerStyle} />
              <div style={colStyle}>
                <StatCards statMap={parsedB.statMap} />
              </div>
            </div>
          </PageSection>
        )}

        {/* ── Climatic Trees ── */}
        {bothComplete && resultA && resultB &&
          (resultA.climatic_trees || resultB.climatic_trees) && (
          <PageSection title={t.results_climatic_trees}>
            <div style={{ display: 'flex' }}>
              <div style={colStyle}>
                {resultA.climatic_trees && Object.keys(resultA.climatic_trees).length > 0 ? (
                  <TreePagination
                    key={`${resultA._id}-climatic`}
                    trees={Object.entries(resultA.climatic_trees).map(([name, newick]) => ({ name, newick }))}
                    renderTree={(name, newick) => <PhyloTree key={name} newick={newick} name={name} />}
                    pageSize={3}
                  />
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
                )}
              </div>
              <div style={dividerStyle} />
              <div style={colStyle}>
                {resultB.climatic_trees && Object.keys(resultB.climatic_trees).length > 0 ? (
                  <TreePagination
                    key={`${resultB._id}-climatic`}
                    trees={Object.entries(resultB.climatic_trees).map(([name, newick]) => ({ name, newick }))}
                    renderTree={(name, newick) => <PhyloTree key={name} newick={newick} name={name} />}
                    pageSize={3}
                  />
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
                )}
              </div>
            </div>
          </PageSection>
        )}

        {/* ── Genetic Trees ── */}
        {bothComplete && resultA && resultB &&
          (resultA.genetic_trees || resultB.genetic_trees) && (
          <PageSection title={t.results_genetic_trees}>
            <div style={{ display: 'flex' }}>
              <div style={colStyle}>
                {resultA.genetic_trees && Object.keys(resultA.genetic_trees).length > 0 ? (
                  <TreePagination
                    key={`${resultA._id}-genetic`}
                    trees={Object.entries(resultA.genetic_trees).map(([name, newick]) => ({ name, newick }))}
                    renderTree={(name, newick) => <PhyloTree key={name} newick={newick} name={name} />}
                    pageSize={3}
                  />
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
                )}
              </div>
              <div style={dividerStyle} />
              <div style={colStyle}>
                {resultB.genetic_trees && Object.keys(resultB.genetic_trees).length > 0 ? (
                  <TreePagination
                    key={`${resultB._id}-genetic`}
                    trees={Object.entries(resultB.genetic_trees).map(([name, newick]) => ({ name, newick }))}
                    renderTree={(name, newick) => <PhyloTree key={name} newick={newick} name={name} />}
                    pageSize={3}
                  />
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
                )}
              </div>
            </div>
          </PageSection>
        )}

      </PageCard>
    </PageContainer>
  )
}
