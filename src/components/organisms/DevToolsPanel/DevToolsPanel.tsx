import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import { useTheme } from '../../../context/ThemeContext'
import { useDevTools } from '../../../context/DevToolsContext'
import api from '../../../services/api'
import { type LayoutType, LAYOUTS, getLayoutConfig } from '../../../constants/layoutConfig'
import { zoomBtnStyle } from '../../../styles/commonStyles'

// ── Types ─────────────────────────────────────────────────────────────────────

type PanelTab = 'server' | 'errors' | 'graph'
type ServerState = 'checking' | 'connected' | 'disconnected'

// ── App Component Graph data ──────────────────────────────────────────────────

const C = 175
const R = 76

interface AppNode { id: string; label: string; cls: string; x: number; y: number }

const APP_NODES: AppNode[] = [
  { id: 'theme-ctx',   label: 'theme',              cls: 'store',     x: 0*C, y:  0*R },
  { id: 'dark-mode',   label: 'darkMode',            cls: 'state',     x: 0*C, y:  1*R },
  { id: 'toggle-th',   label: 'toggleTheme()',       cls: 'fn',        x: 0*C, y:  2*R },
  { id: 'ls-theme',    label: 'localStorage\n.theme', cls: 'store',    x: 0*C, y:  3*R },
  { id: 'lang-ctx',    label: 'lang',                cls: 'store',     x: 0*C, y:  4*R },
  { id: 'set-lang',    label: 'setLang()',            cls: 'fn',        x: 0*C, y:  5*R },
  { id: 'trans',       label: 't[ ]',                cls: 'store',     x: 0*C, y:  6*R },
  { id: 'ls-lang',     label: 'localStorage\n.lang', cls: 'store',    x: 0*C, y:  7*R },
  { id: 'app-root',    label: 'App',                 cls: 'component', x: 1*C, y:  0*R },
  { id: 'router',      label: 'BrowserRouter',       cls: 'component', x: 1*C, y:  1*R },
  { id: 'location',    label: 'pathname',            cls: 'state',     x: 1*C, y:  2*R },
  { id: 'url-id',      label: 'searchParams',        cls: 'state',     x: 1*C, y:  3*R },
  { id: 'app-layout',  label: 'AppLayout',           cls: 'component', x: 1*C, y:  4*R },
  { id: 'navbar',      label: 'NavBar',              cls: 'component', x: 1*C, y:  5*R },
  { id: 'nav-min',     label: 'minimized',           cls: 'state',     x: 1*C, y:  6*R },
  { id: 'nav-active',  label: 'isActive',            cls: 'state',     x: 1*C, y:  7*R },
  { id: 'nav-items',   label: 'NAV_ITEMS',           cls: 'store',     x: 1*C, y:  8*R },
  { id: 'devtools',    label: 'DevToolsPanel',       cls: 'component', x: 1*C, y:  9*R },
  { id: 'settings-pg', label: 'SettingsPage',        cls: 'component', x: 1*C, y: 11*R },
  { id: 'upload-pg',   label: 'UploadPage',          cls: 'component', x: 2*C, y:  0*R },
  { id: 'upl-cli',     label: 'climatic\nFile',      cls: 'state',     x: 2*C, y:  1*R },
  { id: 'upl-fasta',   label: 'FASTA\nFile',         cls: 'state',     x: 2*C, y:  2*R },
  { id: 'upl-params',  label: 'params',              cls: 'state',     x: 2*C, y:  3*R },
  { id: 'upl-loading', label: 'loading',             cls: 'state',     x: 2*C, y:  4*R },
  { id: 'upl-error',   label: 'error',               cls: 'state',     x: 2*C, y:  5*R },
  { id: 'upl-jobid',   label: 'jobId',               cls: 'state',     x: 2*C, y:  6*R },
  { id: 'upl-status',  label: 'jobStatus',           cls: 'state',     x: 2*C, y:  7*R },
  { id: 'upl-email',   label: 'notifyEmail',         cls: 'state',     x: 2*C, y:  8*R },
  { id: 'api-upload',  label: 'api.upload()',        cls: 'fn',        x: 2*C, y:  9*R },
  { id: 'api-status',  label: 'api.status()',        cls: 'fn',        x: 2*C, y: 10*R },
  { id: 'upl-nav',     label: 'navigate\n(/results)', cls: 'fn',       x: 2*C, y: 11*R },
  { id: 'results-pg',  label: 'ResultsPage',         cls: 'component', x: 3*C, y:  0*R },
  { id: 'res-list',    label: 'results[ ]',          cls: 'state',     x: 3*C, y:  1*R },
  { id: 'res-sel',     label: 'selected',            cls: 'state',     x: 3*C, y:  2*R },
  { id: 'res-ld',      label: 'loading',             cls: 'state',     x: 3*C, y:  3*R },
  { id: 'res-tab',     label: 'activeTab',           cls: 'state',     x: 3*C, y:  4*R },
  { id: 'res-dcol',    label: 'distanceCol',         cls: 'state',     x: 3*C, y:  5*R },
  { id: 'res-copy',    label: 'copied',              cls: 'state',     x: 3*C, y:  6*R },
  { id: 'res-sp',      label: 'searchParams',        cls: 'state',     x: 3*C, y:  7*R },
  { id: 'api-rl',      label: 'results.list()',      cls: 'fn',        x: 3*C, y:  8*R },
  { id: 'api-rg',      label: 'results.get()',       cls: 'fn',        x: 3*C, y:  9*R },
  { id: 'clipboard',   label: 'clipboard\n.write()', cls: 'fn',        x: 3*C, y: 10*R },
  { id: 'ccb',         label: 'ClimateChart\nBuilder', cls: 'component', x: 4*C, y:  0*R },
  { id: 'ccb-x',       label: 'xCol',               cls: 'state',     x: 4*C, y:  1*R },
  { id: 'ccb-y',       label: 'yCol',               cls: 'state',     x: 4*C, y:  2*R },
  { id: 'ccb-type',    label: 'chartType',           cls: 'state',     x: 4*C, y:  3*R },
  { id: 'ccb-prev',    label: 'showPreview',         cls: 'state',     x: 4*C, y:  4*R },
  { id: 'ccb-data',    label: 'chartData',           cls: 'state',     x: 4*C, y:  5*R },
  { id: 'ccb-svg',     label: 'svgRef',              cls: 'output',    x: 4*C, y:  6*R },
  { id: 'ccb-dl',      label: 'downloadSVG()',       cls: 'fn',        x: 4*C, y:  7*R },
  { id: 'phylo',       label: 'PhyloTree',           cls: 'component', x: 4*C, y:  9*R },
  { id: 'phy-newick',  label: 'newick',              cls: 'state',     x: 4*C, y: 10*R },
  { id: 'phy-svg',     label: 'svgRef',              cls: 'output',    x: 4*C, y: 11*R },
  { id: 'phy-dl',      label: 'downloadSVG()',       cls: 'fn',        x: 4*C, y: 12*R },
  { id: 'dt-server',   label: 'serverStatus',        cls: 'state',     x: 5*C, y:  0*R },
  { id: 'dt-latency',  label: 'latency',             cls: 'state',     x: 5*C, y:  1*R },
  { id: 'dt-tab',      label: 'panelTab',            cls: 'state',     x: 5*C, y:  2*R },
  { id: 'dt-layout',   label: 'layout',              cls: 'state',     x: 5*C, y:  3*R },
  { id: 'dt-errors',   label: 'errors[ ]',           cls: 'state',     x: 5*C, y:  4*R },
  { id: 'api-ping',    label: 'api.ping()',           cls: 'fn',        x: 5*C, y:  5*R },
  { id: 'dt-cy',       label: 'cytoscape\ninstance', cls: 'output',    x: 5*C, y:  6*R },
]

const APP_EDGES: [string, string][] = [
  ['ls-theme', 'theme-ctx'], ['theme-ctx', 'dark-mode'], ['toggle-th', 'theme-ctx'],
  ['theme-ctx', 'ls-theme'], ['dark-mode', 'toggle-th'],
  ['ls-lang', 'lang-ctx'], ['lang-ctx', 'trans'], ['set-lang', 'lang-ctx'],
  ['lang-ctx', 'ls-lang'],
  ['app-root', 'router'], ['router', 'location'], ['router', 'url-id'],
  ['app-root', 'app-layout'], ['app-layout', 'navbar'], ['app-layout', 'devtools'],
  ['theme-ctx', 'navbar'], ['lang-ctx', 'navbar'], ['trans', 'navbar'],
  ['location', 'navbar'], ['navbar', 'nav-min'], ['nav-min', 'navbar'],
  ['location', 'nav-active'], ['nav-active', 'navbar'],
  ['nav-items', 'navbar'], ['navbar', 'toggle-th'], ['navbar', 'set-lang'],
  ['trans', 'settings-pg'], ['theme-ctx', 'settings-pg'],
  ['theme-ctx', 'devtools'], ['devtools', 'dt-server'], ['devtools', 'dt-latency'],
  ['devtools', 'dt-tab'], ['devtools', 'dt-layout'], ['devtools', 'dt-errors'],
  ['dt-server', 'api-ping'], ['api-ping', 'dt-server'], ['api-ping', 'dt-latency'],
  ['dt-layout', 'dt-cy'], ['dt-errors', 'devtools'],
  ['trans', 'upload-pg'],
  ['upload-pg', 'upl-cli'], ['upload-pg', 'upl-fasta'], ['upload-pg', 'upl-params'],
  ['upload-pg', 'upl-loading'], ['upload-pg', 'upl-error'], ['upload-pg', 'upl-jobid'],
  ['upload-pg', 'upl-status'], ['upload-pg', 'upl-email'],
  ['upl-cli', 'api-upload'], ['upl-fasta', 'api-upload'], ['upl-params', 'api-upload'],
  ['upl-email', 'api-upload'],
  ['api-upload', 'upl-jobid'], ['api-upload', 'upl-loading'], ['api-upload', 'upl-error'],
  ['upl-jobid', 'api-status'], ['api-status', 'upl-status'], ['api-status', 'upl-loading'],
  ['upl-status', 'upl-nav'], ['upl-nav', 'location'],
  ['theme-ctx', 'results-pg'], ['trans', 'results-pg'], ['url-id', 'results-pg'],
  ['results-pg', 'res-list'], ['results-pg', 'res-sel'], ['results-pg', 'res-ld'],
  ['results-pg', 'res-tab'], ['results-pg', 'res-dcol'], ['results-pg', 'res-copy'],
  ['results-pg', 'res-sp'],
  ['res-ld', 'api-rl'], ['api-rl', 'res-list'], ['api-rl', 'res-ld'],
  ['res-list', 'res-sel'], ['url-id', 'res-sel'], ['res-sel', 'api-rg'],
  ['api-rg', 'res-sel'], ['res-sel', 'res-sp'], ['res-sp', 'url-id'],
  ['res-sel', 'res-dcol'], ['res-sel', 'res-tab'], ['res-copy', 'clipboard'],
  ['url-id', 'clipboard'],
  ['results-pg', 'ccb'], ['res-sel', 'ccb'], ['trans', 'ccb'], ['theme-ctx', 'ccb'],
  ['ccb', 'ccb-x'], ['ccb', 'ccb-y'], ['ccb', 'ccb-type'], ['ccb', 'ccb-prev'],
  ['ccb-x', 'ccb-data'], ['ccb-y', 'ccb-data'], ['ccb-data', 'ccb-svg'], ['ccb-svg', 'ccb-dl'],
  ['results-pg', 'phylo'], ['res-sel', 'phy-newick'], ['trans', 'phylo'],
  ['phy-newick', 'phylo'], ['phylo', 'phy-svg'], ['phy-svg', 'phy-dl'],
]

function getAppGraphStylesheet(darkMode: boolean): cytoscape.StylesheetJson {
  const mk = (bg: string, border: string, fg: string) =>
    ({ 'background-color': bg, 'border-color': border, color: fg })
  const d = darkMode
  return [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'text-wrap': 'wrap' as const,
        'text-valign': 'center' as const,
        'text-halign': 'center' as const,
        'font-size': 10,
        'font-weight': 600,
        width: 100, height: 38,
        shape: 'round-rectangle' as const,
        'border-width': 1.5,
      },
    },
    { selector: '.store',     style: mk(d ? '#1E3B5F' : '#DBEAFE', d ? '#3B82F6' : '#3B82F6', d ? '#93C5FD' : '#1D4ED8') },
    { selector: '.component', style: mk(d ? '#14433A' : '#CCFBF1', d ? '#10B981' : '#0D9488', d ? '#6EE7B7' : '#065F46') },
    { selector: '.state',     style: mk(d ? '#1C3145' : '#E0F2FE', d ? '#38BDF8' : '#0284C7', d ? '#7DD3FC' : '#075985') },
    { selector: '.fn',        style: mk(d ? '#422006' : '#FEF3C7', d ? '#F59E0B' : '#D97706', d ? '#FCD34D' : '#92400E') },
    { selector: '.output',    style: mk(d ? '#0F3340' : '#CCFBF1', d ? '#14B8A6' : '#0D9488', d ? '#5EEAD4' : '#0F766E') },
    {
      selector: 'edge',
      style: {
        'line-color': d ? '#4B5563' : '#CBD5E1', width: 1.2,
        'curve-style': 'bezier' as const,
        'target-arrow-shape': 'triangle' as const,
        'target-arrow-color': d ? '#4B5563' : '#CBD5E1',
        'arrow-scale': 0.9,
      },
    },
  ]
}


function buildAppElements(layout: LayoutType): cytoscape.ElementDefinition[] {
  const usePreset = layout === 'top-down' || layout === 'left-right'
  const nodes: cytoscape.ElementDefinition[] = APP_NODES.map(n => ({
    data: { id: n.id, label: n.label },
    classes: n.cls,
    ...(usePreset ? {
      position: layout === 'left-right' ? { x: n.y, y: n.x } : { x: n.x, y: n.y },
    } : {}),
  }))
  const edges: cytoscape.ElementDefinition[] = APP_EDGES.map(([s, t], i) => ({
    data: { id: `ae${i}`, source: s, target: t },
  }))
  return [...nodes, ...edges]
}

// ── AppGraph sub-component ────────────────────────────────────────────────────

function AppGraphView({ layout, darkMode }: { layout: LayoutType; darkMode: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    cyRef.current?.destroy()
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: buildAppElements(layout),
      style: getAppGraphStylesheet(darkMode),
      layout: getLayoutConfig(layout),
      userZoomingEnabled: true, userPanningEnabled: true,
      minZoom: 0.04, maxZoom: 5,
    })
    return () => { cyRef.current?.destroy(); cyRef.current = null }
  }, [layout, darkMode])

  const smallBtnStyle: React.CSSProperties = { ...zoomBtnStyle, width: 26, height: 26, borderRadius: 5, fontSize: 15 }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div
        ref={containerRef}
        style={{
          height: '100%',
          background: darkMode ? '#0d0d16' : '#f8fafc',
          borderRadius: 8, border: '1px solid var(--border)',
          cursor: 'grab',
        }}
      />
      <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', flexDirection: 'column', gap: 3, zIndex: 5 }}>
        <button style={smallBtnStyle} onClick={() => cyRef.current?.zoom({ level: cyRef.current.zoom() * 1.3, renderedPosition: { x: 350, y: 200 } })}>+</button>
        <button style={smallBtnStyle} onClick={() => cyRef.current?.zoom({ level: cyRef.current.zoom() / 1.3, renderedPosition: { x: 350, y: 200 } })}>−</button>
        <button style={smallBtnStyle} onClick={() => cyRef.current?.fit(undefined, 30)}>↺</button>
      </div>
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 8, left: 8, zIndex: 5,
        display: 'flex', gap: 8, padding: '4px 8px',
        background: darkMode ? 'rgba(13,13,22,0.9)' : 'rgba(255,255,255,0.92)',
        borderRadius: 6, border: '1px solid var(--border)',
        fontSize: 10, color: 'var(--text-secondary)',
        backdropFilter: 'blur(4px)',
      }}>
        {([['Context','#3B82F6'],['Component','#10B981'],['State','#38BDF8'],['Function','#F59E0B'],['Output','#14B8A6']] as const).map(([lbl, clr]) => (
          <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: clr, display: 'inline-block', flexShrink: 0 }} />
            {lbl}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── DevToolsPanel ─────────────────────────────────────────────────────────────

export default function DevToolsPanel() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<PanelTab>('server')
  const [serverState, setServerState] = useState<ServerState>('checking')
  const [latency, setLatency] = useState<number | null>(null)
  const [lastPing, setLastPing] = useState<Date | null>(null)
  const [layout, setLayout] = useState<LayoutType>('force')
  const { errors, clearErrors } = useDevTools()
  const { theme } = useTheme()
  const darkMode = theme === 'dark'

  // Ping server every 5 s
  useEffect(() => {
    const ping = async () => {
      const t0 = Date.now()
      try {
        await api.results.list()
        setLatency(Date.now() - t0)
        setServerState('connected')
      } catch {
        setServerState('disconnected')
        setLatency(null)
      }
      setLastPing(new Date())
    }
    ping()
    const id = setInterval(ping, 5000)
    return () => clearInterval(id)
  }, [])

  const dot = (s: ServerState) => ({
    checking:    '#F59E0B',
    connected:   '#10B981',
    disconnected:'#EF4444',
  }[s])

  const tabBtn = (active: boolean): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '8px 14px',
    color: active ? 'var(--action)' : 'var(--text-secondary)',
    fontWeight: active ? 700 : 400, fontSize: 13,
    borderBottom: `2px solid ${active ? 'var(--action)' : 'transparent'}`,
    transition: 'all 0.15s',
  })

  const selectStyle: React.CSSProperties = {
    background: 'var(--primary)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', fontSize: 12,
    padding: '4px 8px', cursor: 'pointer',
  }

  const isGraphTab = tab === 'graph'
  const panelW = isGraphTab ? Math.min(860, window.innerWidth - 32) : 360

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="DevTools"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
          background: 'var(--primary)',
          border: `1px solid ${open ? 'var(--action)' : 'var(--border)'}`,
          borderRadius: 10,
          padding: '7px 13px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7,
          color: 'var(--text)', fontSize: 13, fontWeight: 700,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          transition: 'border-color 0.15s',
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '-0.3px',
        }}
      >
        {/* Server status dot */}
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: dot(serverState),
          display: 'inline-block', flexShrink: 0,
          boxShadow: `0 0 6px ${dot(serverState)}88`,
        }} />
        {'</>'}
        {errors.length > 0 && (
          <span style={{
            background: '#EF4444', color: '#fff',
            borderRadius: 10, fontSize: 10, fontWeight: 700,
            padding: '1px 5px', lineHeight: 1.4,
          }}>{errors.length}</span>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 62,
            right: 20,
            zIndex: 999,
            width: panelW,
            height: isGraphTab ? 520 : 360,
            background: 'var(--primary)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.25s ease, height 0.25s ease',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            padding: '0 8px 0 4px',
            flexShrink: 0,
          }}>
            <button style={tabBtn(tab === 'server')} onClick={() => setTab('server')}>
              Server
            </button>
            <button style={tabBtn(tab === 'errors')} onClick={() => setTab('errors')}>
              Errors{errors.length > 0 ? ` (${errors.length})` : ''}
            </button>
            <button style={tabBtn(tab === 'graph')} onClick={() => setTab('graph')}>
              App Graph
            </button>
            {tab === 'graph' && (
              <select
                style={{ ...selectStyle, marginLeft: 8 }}
                value={layout}
                onChange={e => setLayout(e.target.value as LayoutType)}
              >
                {LAYOUTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            )}
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-secondary)',
                fontSize: 18, lineHeight: 1, padding: '4px 6px',
              }}
            >×</button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'hidden', padding: tab === 'graph' ? 8 : 16 }}>

            {/* ── Server tab ── */}
            {tab === 'server' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: dot(serverState), flexShrink: 0,
                    boxShadow: `0 0 8px ${dot(serverState)}88`,
                  }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                    {{
                      checking: 'Checking…',
                      connected: 'Connected',
                      disconnected: 'Disconnected',
                    }[serverState]}
                  </span>
                </div>

                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                  {[
                    ['API URL', String(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000')],
                    ['Latency', latency !== null ? `${latency} ms` : '—'],
                    ['Last ping', lastPing ? lastPing.toLocaleTimeString() : '—'],
                    ['Status', serverState],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)', width: '40%' }}>{label}</td>
                      <td style={{ padding: '6px 0', color: 'var(--text)', fontFamily: "'DM Mono', monospace" }}>{value}</td>
                    </tr>
                  ))}
                </table>

                <div style={{ marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Connected</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block', marginLeft: 12 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Disconnected</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', display: 'inline-block', marginLeft: 12 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Checking</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Auto-refreshes every 5 seconds.
                  </p>
                </div>
              </div>
            )}

            {/* ── Errors tab ── */}
            {tab === 'errors' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {errors.length === 0 ? 'No errors recorded.' : `${errors.length} error${errors.length > 1 ? 's' : ''}`}
                  </span>
                  {errors.length > 0 && (
                    <button
                      onClick={clearErrors}
                      style={{
                        background: 'none', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '3px 10px',
                        fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {errors.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                      <span style={{ fontSize: 18 }}>✓</span> No errors recorded
                    </div>
                  ) : (
                    [...errors].reverse().map(err => (
                      <div
                        key={err.id}
                        style={{
                          background: 'var(--secondary)', borderRadius: 8,
                          padding: '8px 12px', border: '1px solid var(--border)',
                        }}
                      >
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--error)', fontFamily: "'DM Mono', monospace", wordBreak: 'break-all' }}>
                          {err.message}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text-secondary)' }}>
                          {err.at.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── App Graph tab ── */}
            {tab === 'graph' && (
              <div style={{ height: '100%' }}>
                <AppGraphView layout={layout} darkMode={darkMode} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
