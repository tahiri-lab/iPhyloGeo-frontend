import { useRef, useState, useMemo } from 'react'
import {
  BarChart, Bar, ScatterChart, Scatter, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { ClimaticPreview } from '../../../services/api'
import { useLang } from '../../../context/LanguageContext'
import { downloadSvgFromContainer } from '../../../utils/svgExport'
import { selectStyle } from '../../../styles/commonStyles'

// ── Types ─────────────────────────────────────────────────────────────────────

type ChartType = 'Bar' | 'Scatter' | 'Line' | 'Pie'

// ── Styles ────────────────────────────────────────────────────────────────────

const selectStyleWide: React.CSSProperties = { ...selectStyle, minWidth: 160 }

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  backgroundColor: 'var(--secondary)',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '7px 12px',
  fontSize: 12,
  color: 'var(--text)',
  borderBottom: '1px solid var(--border)',
}

const PIE_COLORS = ['#AD00FA', '#00faad', '#faad00', '#fa0057', '#00aafa', '#aafa00']

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClimateChartBuilder({ data }: { data: ClimaticPreview }) {
  const { columns, rows } = data
  const { t } = useLang()
  const chartRef = useRef<HTMLDivElement>(null)

  const numericCols = useMemo(
    () => columns.filter(col => rows.some(r => typeof r[col] === 'number')),
    [columns, rows]
  )

  const [xCol, setXCol] = useState<string>(columns[0] ?? '')
  const [yCol, setYCol] = useState<string>(numericCols[0] ?? columns[1] ?? '')
  const [chartType, setChartType] = useState<ChartType>('Bar')
  const [showTable, setShowTable] = useState(true)

  const chartData = useMemo(
    () => rows.map(r => ({ x: r[xCol], y: r[yCol], ...r })),
    [rows, xCol, yCol]
  )

  const chartTypes: { value: ChartType; label: string }[] = [
    { value: 'Bar', label: t.chart_bar },
    { value: 'Scatter', label: t.chart_scatter },
    { value: 'Line', label: t.chart_line },
    { value: 'Pie', label: t.chart_pie },
  ]

  const tooltipStyle = {
    contentStyle: { background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 },
    labelStyle: { color: 'var(--text-secondary)' },
    itemStyle: { color: 'var(--text)' },
  }

  function renderChart() {
    if (!xCol || !yCol) return null

    const commonProps = {
      data: chartData,
      margin: { top: 8, right: 16, bottom: 40, left: 16 },
    }

    const xAxisCommon = {
      dataKey: 'x',
      tick: { fill: 'var(--text-secondary)', fontSize: 11 },
      label: { value: xCol, position: 'insideBottom' as const, offset: -20, fill: 'var(--text-secondary)', fontSize: 12 },
    }

    const yAxisCommon = {
      tick: { fill: 'var(--text-secondary)', fontSize: 11 },
      label: { value: yCol, angle: -90, position: 'insideLeft' as const, offset: 12, fill: 'var(--text-secondary)', fontSize: 12 },
    }

    switch (chartType) {
      case 'Bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
            <XAxis {...xAxisCommon} />
            <YAxis {...yAxisCommon} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="y" name={yCol} fill="#AD00FA" />
          </BarChart>
        )
      case 'Line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
            <XAxis {...xAxisCommon} />
            <YAxis {...yAxisCommon} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="y" name={yCol} stroke="#AD00FA" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        )
      case 'Scatter': {
        const isXNumeric = numericCols.includes(xCol)
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
            <XAxis
              dataKey="x"
              type={isXNumeric ? 'number' : 'category'}
              name={xCol}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              label={{ value: xCol, position: 'insideBottom', offset: -20, fill: 'var(--text-secondary)', fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              name={yCol}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              label={{ value: yCol, angle: -90, position: 'insideLeft', offset: 12, fill: 'var(--text-secondary)', fontSize: 12 }}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Scatter name={yCol} data={chartData} fill="#AD00FA" />
          </ScatterChart>
        )
      }
      case 'Pie':
        return (
          <PieChart>
            <Pie data={chartData} dataKey="y" nameKey="x" cx="50%" cy="50%" outerRadius={120} label>
              {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        )
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Data table ── */}
      <div>
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, cursor: 'pointer' }}
          onClick={() => setShowTable(t => !t)}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {t.chart_data_preview} ({rows.length} rows)
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{showTable ? t.chart_hide : t.chart_show}</span>
        </div>
        {showTable && (
          <div style={{ maxHeight: 280, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
              <thead>
                <tr>{columns.map(c => <th key={c} style={thStyle}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--table-alt-row-color)' }}>
                    {columns.map(c => <td key={c} style={tdStyle}>{String(row[c] ?? '')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Chart generator ── */}
      <div>
        <p style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{t.chart_generate}</p>

        {/* Axis selectors */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{t.chart_x_axis}</p>
            <select style={selectStyleWide} value={xCol} onChange={e => setXCol(e.target.value)}>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{t.chart_y_axis}</p>
            <select style={selectStyleWide} value={yCol} onChange={e => setYCol(e.target.value)}>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Chart type buttons */}
        <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{t.chart_type}</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {chartTypes.map(ct => (
            <button
              key={ct.value}
              onClick={() => setChartType(ct.value)}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: `2px solid ${chartType === ct.value ? 'var(--action)' : 'var(--border)'}`,
                background: chartType === ct.value ? 'var(--action-soft-bg)' : 'transparent',
                color: 'var(--text)',
                fontSize: 13,
                fontWeight: chartType === ct.value ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {ct.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        {xCol && yCol ? (
          <>
            <div ref={chartRef} style={{ width: '100%', height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()!}
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => downloadSvgFromContainer(chartRef.current, `chart-${xCol}-vs-${yCol}.svg`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t.chart_download}
              </button>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.chart_select_columns}</p>
        )}
      </div>
    </div>
  )
}
