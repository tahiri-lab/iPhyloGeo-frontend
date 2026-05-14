import { useMemo, useRef, useState } from 'react'
import { useLang } from '../../../context/LanguageContext'
import { parseNewick, type TreeNode } from '../../../utils/newickParser'
import { downloadSvgElement } from '../../../utils/svgExport'
import { zoomBtnStyle } from '../../../styles/commonStyles'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LayoutNode {
  node: TreeNode
  x: number
  y: number
}

// ── Layout (rectangular cladogram) ───────────────────────────────────────────

const X_COL = 30
const Y_ROW = 30
const LABEL_PAD = 12

function buildLayout(root: TreeNode): { nodes: Map<TreeNode, LayoutNode>; svgW: number; svgH: number } {
  const depthMap = new Map<TreeNode, number>()
  function setDepths(node: TreeNode, d: number) {
    depthMap.set(node, d)
    for (const c of node.children) setDepths(c, d + (c.branchLength || 0))
  }
  setDepths(root, 0)

  const maxDepth = Math.max(...Array.from(depthMap.values()))
  if (maxDepth === 0) {
    depthMap.clear()
    function setUnit(node: TreeNode, d: number) {
      depthMap.set(node, d)
      for (const c of node.children) setUnit(c, d + 1)
    }
    setUnit(root, 0)
  }

  const finalMaxDepth = Math.max(...Array.from(depthMap.values()))

  const rowMap = new Map<TreeNode, number>()
  let leafIdx = 0
  function setRows(node: TreeNode) {
    if (node.children.length === 0) {
      rowMap.set(node, leafIdx * 2)
      leafIdx++
    } else {
      for (const c of node.children) setRows(c)
      const childRows = node.children.map(c => rowMap.get(c)!)
      rowMap.set(node, Math.floor((childRows[0] + childRows[childRows.length - 1]) / 2))
    }
  }
  setRows(root)

  const colsPerUnit = finalMaxDepth > 0 ? 20 / finalMaxDepth : 1
  const maxRow = Math.max(...Array.from(rowMap.values()))

  const leaves = Array.from(depthMap.keys()).filter(n => n.children.length === 0)
  const maxLabelW = Math.max(...leaves.map(n => n.name.length)) * 7

  const nodes = new Map<TreeNode, LayoutNode>()
  function buildNodes(node: TreeNode) {
    const depth = depthMap.get(node)!
    const row = rowMap.get(node)!
    nodes.set(node, {
      node,
      x: depth * colsPerUnit * X_COL,
      y: row * Y_ROW,
    })
    for (const c of node.children) buildNodes(c)
  }
  buildNodes(root)

  return {
    nodes,
    svgW: finalMaxDepth * colsPerUnit * X_COL + LABEL_PAD + maxLabelW + 8,
    svgH: maxRow * Y_ROW + Y_ROW,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PhyloTreeProps {
  newick: string
  name: string
  darkMode?: boolean
}

export default function PhyloTree({ newick, name, darkMode = true }: PhyloTreeProps) {
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { t } = useLang()

  const { paths, dots, labels, svgW, svgH } = useMemo(() => {
    try {
      const root = parseNewick(newick)
      const { nodes, svgW, svgH } = buildLayout(root)

      const lineColor = darkMode ? '#9F74D0' : '#7C3AED'
      const nodeColor = darkMode ? '#1FA391' : '#0D9488'
      const textColor = darkMode ? '#FFFFFF' : '#111827'
      const textHalo = darkMode ? '#2a2a3a' : '#e2dff0'

      const paths: React.ReactElement[] = []
      const dots: React.ReactElement[] = []
      const labels: React.ReactElement[] = []

      let keyI = 0

      function renderNode(node: TreeNode, parentLayout: LayoutNode | null) {
        const layout = nodes.get(node)!
        if (!layout) return

        if (parentLayout) {
          paths.push(
            <line
              key={`h${keyI++}`}
              x1={parentLayout.x} y1={layout.y}
              x2={layout.x} y2={layout.y}
              stroke={lineColor} strokeWidth={1.5}
            />
          )
        }

        if (node.children.length > 0) {
          const childLayouts = node.children.map(c => nodes.get(c)!)
          const minY = Math.min(...childLayouts.map(l => l.y))
          const maxY = Math.max(...childLayouts.map(l => l.y))
          paths.push(
            <line
              key={`v${keyI++}`}
              x1={layout.x} y1={minY}
              x2={layout.x} y2={maxY}
              stroke={lineColor} strokeWidth={1.5}
            />
          )
        } else {
          dots.push(
            <circle key={`d${keyI++}`} cx={layout.x} cy={layout.y} r={5} fill={nodeColor} />
          )
          labels.push(
            <text
              key={`l${keyI++}`}
              x={layout.x + LABEL_PAD} y={layout.y}
              fill={textColor} fontSize={13} fontWeight={700}
              dominantBaseline="middle"
              stroke={textHalo} strokeWidth={3} paintOrder="stroke"
            >
              {node.name}
            </text>
          )
        }

        for (const child of node.children) renderNode(child, layout)
      }

      const rootLayout = nodes.get(root)!
      renderNode(root, null)
      if (root.children.length > 0) {
        const childLayouts = root.children.map(c => nodes.get(c)!)
        const minY = Math.min(...childLayouts.map(l => l.y))
        const maxY = Math.max(...childLayouts.map(l => l.y))
        paths.push(
          <line
            key={`vroot`}
            x1={rootLayout.x} y1={minY}
            x2={rootLayout.x} y2={maxY}
            stroke={lineColor} strokeWidth={1.5}
          />
        )
      }

      return { paths, dots, labels, svgW, svgH }
    } catch {
      return { paths: [], dots: [], labels: [], svgW: 200, svgH: 100 }
    }
  }, [newick, darkMode])

  const handleDownloadSVG = () => {
    if (!svgRef.current) return
    downloadSvgElement(svgRef.current, `${name}.svg`, darkMode ? '#2a2a3a' : '#e2dff0')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{name}</h3>
        <button
          onClick={handleDownloadSVG}
          title={t.tree_download}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 7,
            border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)',
            fontSize: 11, cursor: 'pointer',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t.tree_download}
        </button>
      </div>
      <div
        style={{
          position: 'relative',
          height: 380,
          overflow: 'hidden',
          background: 'var(--secondary)',
          borderRadius: 8,
          border: '1px solid var(--border)',
        }}
      >
        {/* Zoom controls */}
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
          <button style={zoomBtnStyle} onClick={() => setZoom(z => Math.min(z * 1.3, 5))}>+</button>
          <button style={zoomBtnStyle} onClick={() => setZoom(z => Math.max(z / 1.3, 0.2))}>−</button>
          <button style={zoomBtnStyle} onClick={() => setZoom(1)}>↺</button>
        </div>

        {/* Scrollable + zoomable tree */}
        <div
          ref={containerRef}
          style={{ width: '100%', height: '100%', overflow: 'auto', padding: '16px 8px' }}
        >
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', display: 'inline-block' }}>
            <svg
              ref={svgRef}
              width={svgW}
              height={svgH}
              viewBox={`0 0 ${svgW} ${svgH}`}
              style={{ overflow: 'visible' }}
            >
              <g transform={`translate(8, ${Y_ROW / 2})`}>
                {paths}
                {dots}
                {labels}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
