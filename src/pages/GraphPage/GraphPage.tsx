import { useEffect, useRef, useState, useMemo } from 'react'
import cytoscape from 'cytoscape'
import PageContainer from '../../components/templates/PageContainer/PageContainer'
import PageCard from '../../components/organisms/PageCard/PageCard'
import PageSection from '../../components/organisms/PageSection/PageSection'
import Spinner from '../../components/atoms/Spinner/Spinner'
import api, { type AnalysisResult } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'
import { parseNewick, type TreeNode } from '../../utils/newickParser'
import { type LayoutType, LAYOUTS, getLayoutConfig } from '../../constants/layoutConfig'
import { zoomBtnStyle, selectStyle } from '../../styles/commonStyles'
import TreePagination from '../../components/molecules/Pagination/Pagination'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CytoElement {
  data: Record<string, string | number | undefined>
  position?: { x: number; y: number }
  classes?: string
}

// ── Cytoscape Elements Builder ────────────────────────────────────────────────
// Port of Python's generate_elements() from apps/pages/results/result.py

function buildCytoElements(root: TreeNode, xLen = 30, yLen = 30): CytoElement[] {
  // Depth computation (sum of branch lengths)
  const depthMap = new Map<TreeNode, number>()
  const setDepths = (node: TreeNode, d: number) => {
    depthMap.set(node, d)
    for (const c of node.children) setDepths(c, d + (c.branchLength || 0))
  }
  setDepths(root, 0)

  const maxDepth = Math.max(...Array.from(depthMap.values()))
  if (maxDepth === 0) {
    depthMap.clear()
    const setUnit = (node: TreeNode, d: number) => {
      depthMap.set(node, d)
      for (const c of node.children) setUnit(c, d + 1)
    }
    setUnit(root, 0)
  }

  const finalMaxDepth = Math.max(...Array.from(depthMap.values()))

  // Column positions: normalize depth to 0..20 range then scale
  const colPositions = new Map<TreeNode, number>()
  for (const [node, depth] of depthMap) {
    colPositions.set(node, finalMaxDepth > 0 ? Math.round((depth / finalMaxDepth) * 20) : 0)
  }

  // Row positions: leaf-index based (each leaf gets 2 * idx, internals get midpoint)
  const rowPositions = new Map<TreeNode, number>()
  let leafIdx = 0
  const setRows = (node: TreeNode) => {
    if (node.children.length === 0) {
      rowPositions.set(node, leafIdx++)
    } else {
      for (const c of node.children) setRows(c)
      const rows = node.children.map(c => rowPositions.get(c)!)
      rowPositions.set(node, (rows[0] + rows[rows.length - 1]) / 2)
    }
  }
  setRows(root)

  const nodes: CytoElement[] = []
  const edges: CytoElement[] = []
  let edgeIdx = 0

  const addToElements = (clade: TreeNode, cladeId: string) => {
    const posX = (colPositions.get(clade) ?? 0) * xLen
    const posY = (rowPositions.get(clade) ?? 0) * yLen
    const isTerminal = clade.children.length === 0

    nodes.push({
      data: { id: cladeId, ...(isTerminal ? { name: clade.name } : {}) },
      position: { x: posX, y: posY },
      classes: isTerminal ? 'terminal' : 'nonterminal',
    })

    clade.children.forEach((child, n) => {
      const supportId = cladeId + 's' + n
      const childId = cladeId + 'c' + n
      const posYChild = (rowPositions.get(child) ?? 0) * yLen

      // Support node creates the 90° angle between parent and child
      nodes.push({
        data: { id: supportId },
        position: { x: posX, y: posYChild },
        classes: 'support',
      })

      edges.push({ data: { id: `e${edgeIdx++}`, source: cladeId, target: supportId } })
      edges.push({ data: { id: `e${edgeIdx++}`, source: supportId, target: childId } })

      addToElements(child, childId)
    })
  }

  addToElements(root, 'r')
  return [...nodes, ...edges]
}

// ── Stylesheet ────────────────────────────────────────────────────────────────

function getCytoscapeStylesheet(darkMode: boolean, layout: LayoutType) {
  const textColor = darkMode ? '#FFFFFF' : '#1A1C1E'
  const lineColor = darkMode ? '#9F74D0' : '#B593DD'
  const nodeColor = darkMode ? '#1FA391' : '#2DD4BF'
  const isForce = layout === 'force' || layout === 'force-loose'

  return [
    {
      selector: '.nonterminal',
      style: { 'background-opacity': 0, 'text-opacity': 0, width: 4, height: 4 },
    },
    {
      selector: '.support',
      style: { 'background-opacity': 0, 'text-opacity': 0, width: 2, height: 2 },
    },
    {
      selector: 'edge',
      style: {
        'line-color': lineColor,
        width: 1.5,
        'curve-style': 'straight',
        'source-endpoint': 'inside-to-node',
        'target-endpoint': 'inside-to-node',
      },
    },
    {
      selector: '.terminal',
      style: {
        label: 'data(name)',
        'font-weight': 'bold',
        color: textColor,
        width: 10,
        height: 10,
        'text-valign': isForce ? 'bottom' : 'center',
        'text-halign': isForce ? 'center' : 'right',
        'text-margin-x': isForce ? 0 : 4,
        'text-margin-y': isForce ? 4 : 0,
        'background-color': nodeColor,
        'font-size': 11,
        'text-background-opacity': 0,
      },
    },
  ]
}

// ── TreeGraph component ───────────────────────────────────────────────────────

function TreeGraph({
  newick,
  name,
  layout,
  darkMode,
}: {
  newick: string
  name: string
  layout: LayoutType
  darkMode: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  const baseElements = useMemo(() => {
    try { return buildCytoElements(parseNewick(newick)) }
    catch { return [] }
  }, [newick])

  useEffect(() => {
    if (!containerRef.current || baseElements.length === 0) return

    const elements: CytoElement[] = layout === 'left-right'
      ? baseElements.map(el => el.position
          ? { ...el, position: { x: el.position.y, y: el.position.x } }
          : el)
      : baseElements

    cyRef.current?.destroy()
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements as cytoscape.ElementDefinition[],
      style: getCytoscapeStylesheet(darkMode, layout) as cytoscape.StylesheetJson,
      layout: getLayoutConfig(layout),
      userZoomingEnabled: true,
      userPanningEnabled: true,
      minZoom: 0.1,
      maxZoom: 5,
    })

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [baseElements, layout, darkMode])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{name}</h3>
      <div style={{ position: 'relative' }}>
        <div
          ref={containerRef}
          style={{
            height: 420,
            background: 'var(--secondary)',
            borderRadius: 8,
            border: '1px solid var(--border)',
            cursor: 'grab',
          }}
        />
        {/* Zoom controls */}
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
          <button style={zoomBtnStyle} onClick={() => cyRef.current?.zoom({ level: (cyRef.current.zoom() * 1.3), renderedPosition: { x: 200, y: 200 } })}>+</button>
          <button style={zoomBtnStyle} onClick={() => cyRef.current?.zoom({ level: (cyRef.current.zoom() / 1.3), renderedPosition: { x: 200, y: 200 } })}>−</button>
          <button style={zoomBtnStyle} onClick={() => cyRef.current?.fit(undefined, 30)}>↺</button>
        </div>
      </div>
    </div>
  )
}

// ── GraphPage ─────────────────────────────────────────────────────────────────

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
    api.results.list()
      .then(data => {
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
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {results.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{t.results_no_results}</p>
            ) : (
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{t.graph_result}</p>
                <select
                  style={{ ...selectStyle, minWidth: 200 }}
                  value={selected?._id ?? ''}
                  onChange={e => {
                    const r = results.find(r => r._id === e.target.value)
                    if (r) { loadResult(r); setTreeTab('climatic') }
                  }}
                >
                  {results.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{t.graph_layout}</p>
              <select
                style={selectStyle}
                value={layout}
                onChange={e => setLayout(e.target.value as LayoutType)}
              >
                {LAYOUTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
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
