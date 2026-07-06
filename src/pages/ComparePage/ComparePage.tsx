import { useEffect, useMemo, useState } from 'react'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import SearchBar from '../../components/molecules/SearchBar/SearchBar'
import PhyloTree from '../../components/atoms/PhyloTree/PhyloTree'
import TreePagination from '../../components/molecules/Pagination/Pagination'
import Badge from '../../components/atoms/Badge/Badge'
import Spinner from '../../components/atoms/Spinner/Spinner'
import api, { type AnalysisResult } from '../../services/api'
import { useLang } from '../../context/LanguageContext'

// ── Types ─────────────────────────────────────────────────────────────────────

type CellVal = string | number | null
type OutputDict = Record<string, CellVal[]>

// ── Helpers ───────────────────────────────────────────────────────────────────

const STAT_KEYWORDS = ['Mantel_r', 'Mantel_p', 'Procrustes_M2', 'PROTEST_p']

function extractStatMap(output: OutputDict | undefined): Record<string, CellVal> | null {
  if (!output) return null
  const cols = Object.keys(output)
  if (!cols.length) return null
  const len = output[cols[0]].length
  const rows = Array.from({ length: len }, (_, i) =>
    Object.fromEntries(cols.map(c => [c, output[c][i]]))
  )
  const headerIdx = rows.findIndex(row =>
    Object.values(row).some(v => STAT_KEYWORDS.includes(String(v ?? '')))
  )
  if (headerIdx === -1 || headerIdx + 1 >= rows.length) return null
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
  return Object.keys(map).length > 0 ? map : null
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ParamsTable({ params, label }: { params: Record<string, unknown> | undefined; label: string }) {
  const entries = params ? Object.entries(params) : []
  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        {label}
      </div>
      {entries.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {entries.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{k}:</span>
              <span style={{ color: 'var(--text)', wordBreak: 'break-all' }}>{String(v ?? '—')}</span>
            </div>
          ))}
        </div>
      )}
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

const colStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
}

const dividerStyle: React.CSSProperties = {
  width: '1px',
  backgroundColor: 'var(--border)',
  flexShrink: 0,
  margin: '0 24px',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [allResults, setAllResults] = useState<AnalysisResult[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [resultA, setResultA] = useState<AnalysisResult | null>(null)
  const [resultB, setResultB] = useState<AnalysisResult | null>(null)
  const { t } = useLang()

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
      const full = await api.results.get(id)
      setter(full)
    } finally {
      setDetailLoading(false)
    }
  }

  const statMapA = useMemo(() => extractStatMap(resultA?.output as OutputDict | undefined), [resultA])
  const statMapB = useMemo(() => extractStatMap(resultB?.output as OutputDict | undefined), [resultB])

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

        {/* ── Configuration ── */}
        {bothComplete && resultA && resultB && (
          <PageSection title={t.compare_configuration}>
            <div style={{ display: 'flex' }}>
              <div style={colStyle}>
                <ParamsTable params={resultA.climatic_params} label={t.compare_climatic_params} />
                <div style={{ marginTop: '16px' }}>
                  <ParamsTable params={resultA.genetic_params} label={t.compare_genetic_params} />
                </div>
              </div>
              <div style={dividerStyle} />
              <div style={colStyle}>
                <ParamsTable params={resultB.climatic_params} label={t.compare_climatic_params} />
                <div style={{ marginTop: '16px' }}>
                  <ParamsTable params={resultB.genetic_params} label={t.compare_genetic_params} />
                </div>
              </div>
            </div>
          </PageSection>
        )}

        {/* ── Statistical Tests ── */}
        {bothComplete && resultA && resultB && (statMapA || statMapB) && (
          <PageSection title={t.results_statistical_tests}>
            <div style={{ display: 'flex' }}>
              <div style={colStyle}>
                <StatCards statMap={statMapA} />
              </div>
              <div style={dividerStyle} />
              <div style={colStyle}>
                <StatCards statMap={statMapB} />
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
