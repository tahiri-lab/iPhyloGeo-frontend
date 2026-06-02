import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import Button from '../../components/atoms/Button/Button'
import Badge from '../../components/atoms/Badge/Badge'
import EmailInput from '../../components/molecules/EmailInput/EmailInput'
import PhyloTree from '../../components/atoms/PhyloTree/PhyloTree'
import Spinner from '../../components/atoms/Spinner/Spinner'
import SearchBar from '../../components/molecules/SearchBar/SearchBar'
import api, { type AnalysisResult } from '../../services/api'
import { useLang } from '../../context/LanguageContext'

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

function downloadSVG(container: HTMLDivElement | null, filename: string) {
  const svg = container?.querySelector('svg')
  if (!svg) return
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svg)
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
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
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [selected, setSelected] = useState<AnalysisResult | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailMsg, setEmailMsg] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const chartRef = useRef<HTMLDivElement>(null)
  const initialIdRef = useRef(searchParams.get('id'))
  const { t } = useLang()

  useEffect(() => {
    api.results.list()
      .then(data => {
        setResults(data)
        const idFromUrl = initialIdRef.current
        const target = idFromUrl
          ? data.find(r => r._id === idFromUrl)
          : data.find(r => r.status === 'complete')
        if (target) selectResult(target, !idFromUrl)
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  const selectResult = (r: AnalysisResult, updateUrl = true) => {
    setEmailMsg(null)
    if (updateUrl) setSearchParams({ id: r._id }, { replace: true })
    setLoadingDetail(true)
    const minDelay = new Promise<void>(res => setTimeout(res, 2000))
    const dataFetch = r.status === 'complete' && !r.climatic_trees && !r.genetic_trees
      ? api.results.get(r._id).then(full => setSelected(full)).catch(() => setSelected(r))
      : Promise.resolve(setSelected(r))
    Promise.all([minDelay, dataFetch]).finally(() => setLoadingDetail(false))
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
      alert(`Download failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleEmail = async (email: string) => {
    if (!selected) return
    setEmailMsg(null)
    try {
      await api.results.email(selected._id, email)
      setEmailMsg(t.btn_send + ' ✓')
    } catch (err) {
      setEmailMsg(`Failed to send: ${err instanceof Error ? err.message : String(err)}`)
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

  if (error) {
    return (
      <PageContainer title={t.results_title}>
        <PageCard>
          <p style={{ padding: '24px', color: 'var(--error)', fontSize: '14px' }}>{error}</p>
        </PageCard>
      </PageContainer>
    )
  }

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
                options={results.map(r => ({
                  id: r._id,
                  label: r.name,
                  sublabel: new Date(r.created_at).toLocaleString(),
                  badge: r.status,
                }))}
                value={selected?._id ?? null}
                onSelect={id => {
                  const r = results.find(r => r._id === id)
                  if (r) selectResult(r)
                }}
              />
              {selected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '2px' }}>
                  <Badge>{selected.status}</Badge>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {new Date(selected.created_at).toLocaleString()}
                  </span>
                  {selected.status === 'complete' && (
                    <Button
                      variant="download"
                      icon={downloadIcon}
                      onClick={e => handleDownload(selected, e)}
                    >
                      {t.results_excel}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </PageSection>
      { loadingDetail && <ResultDetailSkeleton /> }
        {/* ── Bootstrap/Distance chart ── */}
        {selected?.status === 'complete' && chartData.length > 0 && (
          <PageSection title={`Bootstrap Mean & ${distanceCol ?? 'Distance'}`}>
            <div ref={chartRef} style={{ width: '100%', height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 48, bottom: 24, left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis
                    dataKey="position"
                    label={{ value: 'Position in ASM', position: 'insideBottom', offset: -12, fill: 'var(--text-secondary)', fontSize: 12 }}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="left"
                    label={{ value: 'Bootstrap mean', angle: -90, position: 'insideLeft', offset: 12, fill: '#AD00FA', fontSize: 12 }}
                    tick={{ fill: '#AD00FA', fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: distanceCol ?? 'Distance', angle: 90, position: 'insideRight', offset: 12, fill: '#00faad', fontSize: 12 }}
                    tick={{ fill: '#00faad', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Line yAxisId="left" type="monotone" dataKey="bootstrapMean" name="Bootstrap mean" stroke="#AD00FA" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="distance" name={distanceCol ?? 'Distance'} stroke="#00faad" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => downloadSVG(chartRef.current, `${selected.name}-bootstrap-distance.svg`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                {downloadIcon}
                {t.results_download_chart}
              </button>
            </div>
          </PageSection>
        )}

        {/* ── Results table ── */}
        {selected?.status === 'complete' && mainRows.length > 0 && (
          <PageSection title={`${t.results_output}: ${selected.name}`}>
            <div style={{ width: '100%', borderRadius: '12px', overflow: 'auto', border: '1px solid var(--border)' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '24px' }}>
              {Object.entries(selected.climatic_trees).map(([treeName, newick]) => (
                <PhyloTree key={treeName} newick={newick} name={treeName} />
              ))}
            </div>
          </PageSection>
        )}

        {/* ── Genetic Trees ── */}
        {selected?.status === 'complete' && selected.genetic_trees && Object.keys(selected.genetic_trees).length > 0 && (
          <PageSection title={t.results_genetic_trees}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '24px' }}>
              {Object.entries(selected.genetic_trees).map(([treeName, newick]) => (
                <PhyloTree key={treeName} newick={newick} name={treeName} />
              ))}
            </div>
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
