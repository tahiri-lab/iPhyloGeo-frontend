import { useRef } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useLang } from '../../../context/LanguageContext'
import { downloadSvgFromContainer } from '../../../utils/svgExport'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BootstrapChartPoint {
  position: number
  bootstrapMean: number
  distance: number
}

interface Props {
  chartData: BootstrapChartPoint[]
  distanceCol: string | null
  label?: string
  filename?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const downloadIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

function ChartLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', paddingTop: 10, flexWrap: 'wrap' }}>
      {payload?.map(entry => (
        <span key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
          <span style={{ width: 14, height: 3, background: entry.color, display: 'inline-block', borderRadius: 2, flexShrink: 0 }} />
          {entry.value}
        </span>
      ))}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BootstrapChart({ chartData, distanceCol, label, filename }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()

  if (!chartData.length) return <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>—</p>

  const distLabel = distanceCol ?? 'Distance'
  const withDownload = !!filename

  return (
    <div>
      {label && (
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          {label}
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: withDownload ? 340 : 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: withDownload ? 48 : 32, bottom: 24, left: withDownload ? 16 : 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
            <XAxis
              dataKey="position"
              label={{ value: 'Position in ASM', position: 'insideBottom', offset: -12, fill: 'var(--text-secondary)', fontSize: 11 }}
              tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
            />
            <YAxis
              yAxisId="left"
              label={withDownload ? { value: 'Bootstrap mean', angle: -90, position: 'insideLeft', offset: 12, fill: '#AD00FA', fontSize: 12 } : undefined}
              tick={{ fill: '#AD00FA', fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={withDownload ? { value: distLabel, angle: 90, position: 'insideRight', offset: 12, fill: '#00faad', fontSize: 12 } : undefined}
              tick={{ fill: '#00faad', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: 'var(--text-secondary)' }}
              itemStyle={{ color: 'var(--text)' }}
            />
            <Legend content={({ payload }) => <ChartLegend payload={payload as { value: string; color: string }[]} />} />
            <Line yAxisId="left" type="monotone" dataKey="bootstrapMean" name="Bootstrap mean" stroke="#AD00FA" strokeWidth={2} dot={{ r: withDownload ? 3 : 2 }} activeDot={{ r: withDownload ? 5 : 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="distance" name={distLabel} stroke="#00faad" strokeWidth={2} dot={{ r: withDownload ? 3 : 2 }} activeDot={{ r: withDownload ? 5 : 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {withDownload && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={() => downloadSvgFromContainer(containerRef.current, filename!)}
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
      )}
    </div>
  )
}
