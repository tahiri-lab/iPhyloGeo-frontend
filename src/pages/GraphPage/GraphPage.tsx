import { useEffect, useState } from 'react'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import Spinner from '../../components/atoms/Spinner/Spinner'
import api, { type AnalysisResult } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'
import { type LayoutType, LAYOUTS } from '../../constants/layoutConfig'
import { selectStyle } from '../../styles/commonStyles'
import TreePagination from '../../components/molecules/Pagination/Pagination'
import { TreeGraph } from '../../components/molecules/CytoscapeTree/CytoscapeTree'
import SettingsView from '../../components/organisms/SettingsView/SettingsView'
import SearchBar from '../../components/molecules/SearchBar/SearchBar'

// ── GraphPage ─────────────────────────────────────────────────────────────────

/**
 * `/graph` — interactive Cytoscape.js viewer for a single completed result's
 * trees. Auto-selects the first completed result on load, and re-fetches the
 * full result (with tree data) only if the list response didn't already
 * include it — list responses can omit tree payloads for size.
 */
export default function GraphPage() {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [selected, setSelected] = useState<AnalysisResult | null>(null)
  const [layout, setLayout] = useState<LayoutType>('top-down')
  const [treeTab, setTreeTab] = useState<'climatic' | 'genetic'>('climatic')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()
  const { t } = useLang()
  const darkMode = theme === 'dark'

  const loadResult = (r: AnalysisResult) => {
    if (!r.climatic_trees && !r.genetic_trees) {
      api.results.get(r._id)
        .then(full => setSelected(full))
        .catch(() => setSelected(r))
    } else {
      setSelected(r)
    }
  }

  useEffect(() => {
    api.results.list({ limit: 200 })
      .then(({ data }) => {
        const complete = data.filter(r => r.status === 'complete')
        setResults(complete)
        if (complete.length > 0) loadResult(complete[0])
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  const hasBoth = !!(selected?.climatic_trees && selected?.genetic_trees)
  const activeTrees = treeTab === 'climatic' ? selected?.climatic_trees : selected?.genetic_trees

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px',
    borderRadius: '10px 10px 0 0',
    border: `1px solid ${active ? 'var(--action)' : 'var(--border)'}`,
    borderBottom: active ? '1px solid var(--primary)' : '1px solid var(--border)',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? 'var(--action)' : 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
  })

  if (loading) return (
    <PageContainer title={t.graph_title}>
      <PageCard>
        <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
          <Spinner label={t.results_loading} />
        </div>
      </PageCard>
    </PageContainer>
  )

  if (error) return (
    <PageContainer title={t.graph_title}>
      <PageCard><p style={{ padding: '24px', color: 'var(--error)', fontSize: '14px' }}>{error}</p></PageCard>
    </PageContainer>
  )

  return (
    <PageContainer title={t.graph_title}>
      <PageCard>
        {/* ── Controls ── */}
        <PageSection title="" style={{ borderTop: 'none', paddingBottom: 12, paddingTop: 12 }}>
          {results.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{t.results_no_results}</p>
          ) : (
            <div style={{ display: 'flex', gap: 15, alignItems: 'flex-end', flexWrap: 'wrap' }}>
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
                  if (r) { loadResult(r); setTreeTab('climatic') }
                }}
              />
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }} >
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{t.graph_layout}</p>
                <select
                  style={selectStyle}
                  value={layout}
                  onChange={e => setLayout(e.target.value as LayoutType)}
                >
                  {LAYOUTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </PageSection>

        <>
          {/* Tree type tabs (only when both exist) */}
          {selected && hasBoth && (
            <div style={{ display: 'flex', gap: 0, padding: '0 24px', marginBottom: -1 }}>
              <button style={tabStyle(treeTab === 'climatic')} onClick={() => setTreeTab('climatic')}>
                {t.results_climatic_trees}
              </button>
              <button style={tabStyle(treeTab === 'genetic')} onClick={() => setTreeTab('genetic')}>
                {t.results_genetic_trees}
              </button>
            </div>
          )}

          {selected && activeTrees && Object.keys(activeTrees).length > 0 && (
            <PageSection title={treeTab === 'climatic' ? t.results_climatic_trees : t.results_genetic_trees}>
              <TreePagination
                key={`${selected._id}-${treeTab}-${layout}`}
                trees={Object.entries(activeTrees).map(([name, newick]) => ({ name, newick }))}
                renderTree={(name, newick) => (
                  <TreeGraph key={`${name}-${layout}`} newick={newick} name={name} layout={layout} darkMode={darkMode} />
                )}
                minItemWidth={440}
              />
            </PageSection>
          )}

          {selected && !activeTrees && (
            <PageSection title="">
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{t.graph_no_trees}</p>
            </PageSection>
          )}
        </>
      </PageCard>
    </PageContainer>
  )
}
