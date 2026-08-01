import { useEffect, useRef, useMemo } from 'react'
import { useLang } from '../../../context/LanguageContext'
import cytoscape from 'cytoscape'
import { parseNewick, type TreeNode } from '../../../utils/newickParser'
import { type LayoutType, getLayoutConfig } from '../../../constants/layoutConfig'
import { zoomBtnStyle } from '../../../styles/commonStyles'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CytoElement {
  data: Record<string, string | number | undefined>
  position?: { x: number; y: number }
  classes?: string
}

// ── Cytoscape Elements Builder ────────────────────────────────────────────────

/**
 * Converts a parsed Newick tree into Cytoscape nodes/edges for a rectangular
 * layout. Each branch is drawn as two straight edges through an invisible
 * `.support` waypoint node (rather than one diagonal edge) so the tree reads
 * as a right-angle cladogram even though Cytoscape edges are straight lines —
 * `.nonterminal`/`.support` nodes are sized to ~0 and hidden via
 * `background-opacity: 0` in {@link getCytoscapeStylesheet}, not deleted,
 * because they still anchor the edge geometry.
 */
export function buildCytoElements(root: TreeNode, xLen = 30, yLen = 30): CytoElement[] {
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

  const colPositions = new Map<TreeNode, number>()
  for (const [node, depth] of depthMap) {
    colPositions.set(node, finalMaxDepth > 0 ? Math.round((depth / finalMaxDepth) * 20) : 0)
  }

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

/** Cytoscape stylesheet for the tree; `layout` only affects label placement (bottom+center for force layouts, right+middle otherwise). */
export function getCytoscapeStylesheet(darkMode: boolean, layout: LayoutType) {
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

/**
 * Interactive, pannable/zoomable tree for one Newick string, rebuilt from
 * scratch on every `newick`/`layout`/`darkMode` change (Cytoscape has no
 * cheap in-place layout-switch API here, so the instance is destroyed and
 * recreated rather than updated). `layout === 'left-right'` is implemented
 * by swapping x/y on the already-computed top-down positions rather than a
 * separate layout algorithm.
 */
export function TreeGraph({
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
  const { t } = useLang()

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
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
          <button style={zoomBtnStyle} aria-label={t.tree_zoom_in} onClick={() => cyRef.current?.zoom({ level: (cyRef.current.zoom() * 1.3), renderedPosition: { x: 200, y: 200 } })}>+</button>
          <button style={zoomBtnStyle} aria-label={t.tree_zoom_out} onClick={() => cyRef.current?.zoom({ level: (cyRef.current.zoom() / 1.3), renderedPosition: { x: 200, y: 200 } })}>−</button>
          <button style={zoomBtnStyle} aria-label={t.tree_zoom_reset} onClick={() => cyRef.current?.fit(undefined, 30)}>↺</button>
        </div>
      </div>
    </div>
  )
}
