import { useEffect, useState } from 'react'
import api, { type AnalysisResult } from '../../services/api'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import PhyloTree from '../../components/atoms/PhyloTree/PhyloTree'
import { useLang } from '../../context/LanguageContext'

export default function GraphPage() {
  const { t } = useLang()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await api.results.list()
        if (!list[0]?._id) {
          if (!cancelled) setResult(null)
          return
        }
        const full = await api.results.get(list[0]._id)
        if (!cancelled) setResult(full)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  const climaticTrees = result?.climatic_trees ?? {}
  const geneticTrees = result?.genetic_trees ?? {}
  const hasTrees = Object.keys(climaticTrees).length > 0 || Object.keys(geneticTrees).length > 0

  return (
    <PageContainer title={t.graph_title}>
      <PageCard>
        <PageSection title={t.graph_trees_tab} style={{ borderTop: 'none' }}>
          {loading && <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>{t.results_loading_trees}</p>}
          {error && <p style={{ margin: 0, fontSize: 13, color: 'var(--error)' }}>{error}</p>}
          {!loading && !error && !hasTrees && (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>{t.graph_no_trees}</p>
          )}

          {!loading && !error && Object.keys(climaticTrees).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 20 }}>
              {Object.entries(climaticTrees).map(([name, newick]) => (
                <PhyloTree key={`c-${name}`} name={name} newick={newick} />
              ))}
            </div>
          )}

          {!loading && !error && Object.keys(geneticTrees).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              {Object.entries(geneticTrees).map(([name, newick]) => (
                <PhyloTree key={`g-${name}`} name={name} newick={newick} />
              ))}
            </div>
          )}
        </PageSection>
      </PageCard>
    </PageContainer>
  )
}
