import { useEffect, useMemo, useState } from 'react'
import api, { type AnalysisResult, type ClimaticPreview } from '../../services/api'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import Button from '../../components/atoms/Button/Button'
import ClimateChartBuilder from '../../components/molecules/ClimateChartBuilder/ClimateChartBuilder'
import PhyloTree from '../../components/atoms/PhyloTree/PhyloTree'
import { useLang } from '../../context/LanguageContext'

function inferClimaticPreview(result: AnalysisResult): ClimaticPreview | null {
  if (!result.output) return null
  const entries = Object.entries(result.output)
  if (entries.length === 0) return null

  const columns = entries.map(([k]) => k)
  const len = Math.max(...entries.map(([, arr]) => arr.length), 0)
  if (len === 0) return null

  const rows: Record<string, unknown>[] = Array.from({ length: len }, (_, i) => {
    const row: Record<string, unknown> = {}
    for (const [k, arr] of entries) row[k] = arr[i] ?? null
    return row
  })

  return { columns, rows }
}

export default function ResultsPage() {
  const { t } = useLang()
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<AnalysisResult | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingSelected, setLoadingSelected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    api.results.list()
      .then(data => {
        if (cancelled) return
        setResults(data)
        if (data[0]?._id) setSelectedId(data[0]._id)
      })
      .catch(e => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setSelected(null)
      return
    }
    let cancelled = false
    setLoadingSelected(true)
    setError(null)
    api.results.get(selectedId)
      .then(data => {
        if (!cancelled) setSelected(data)
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoadingSelected(false)
      })
    return () => { cancelled = true }
  }, [selectedId])

  const climaticPreview = useMemo(() => {
    if (!selected) return null
    return inferClimaticPreview(selected)
  }, [selected])

  const copyLink = async () => {
    if (!selectedId) return
    const link = `${window.location.origin}/results?id=${selectedId}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <PageContainer title={t.results_title}>
      <PageCard>
        <PageSection title={t.results_analysis_runs} style={{ borderTop: 'none' }}>
          {loadingList ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>{t.results_loading}</p>
          ) : results.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>{t.results_no_results}</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {results.map(r => (
                <button
                  key={r._id}
                  onClick={() => setSelectedId(r._id)}
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${selectedId === r._id ? 'var(--action)' : 'var(--border)'}`,
                    background: selectedId === r._id ? 'var(--action-soft-bg)' : 'transparent',
                    color: 'var(--text)',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  {r.name || r._id.slice(0, 8)}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p style={{ marginTop: 10, marginBottom: 0, color: 'var(--error)', fontSize: 13 }}>{error}</p>
          )}
        </PageSection>

        {loadingSelected && (
          <PageSection title={t.results_output}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>{t.results_loading}</p>
          </PageSection>
        )}

        {!loadingSelected && selected && (
          <>
            {climaticPreview && (
              <PageSection title={t.results_output}>
                <ClimateChartBuilder data={climaticPreview} />
              </PageSection>
            )}

            {selected.climatic_trees && Object.keys(selected.climatic_trees).length > 0 && (
              <PageSection title={t.results_climatic_trees}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                  {Object.entries(selected.climatic_trees).map(([name, nwk]) => (
                    <PhyloTree key={name} name={name} newick={nwk} />
                  ))}
                </div>
              </PageSection>
            )}

            {selected.genetic_trees && Object.keys(selected.genetic_trees).length > 0 && (
              <PageSection title={t.results_genetic_trees}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                  {Object.entries(selected.genetic_trees).map(([name, nwk]) => (
                    <PhyloTree key={name} name={name} newick={nwk} />
                  ))}
                </div>
              </PageSection>
            )}

            <PageSection title={t.results_share}>
              <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: 13 }}>{t.results_share_desc}</p>
              <Button variant="border" onClick={() => void copyLink()}>
                {copied ? t.results_link_copied : t.results_copy_link}
              </Button>
            </PageSection>
          </>
        )}
      </PageCard>
    </PageContainer>
  )
}
