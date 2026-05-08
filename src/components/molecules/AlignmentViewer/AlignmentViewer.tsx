import { useMemo, useState } from 'react'
import type { GeneticPreview } from '../../../services/api'

// ── Nucleotide colors (matches dashbio AlignmentChart scheme) ─────────────────

const NT_COLORS: Record<string, string> = {
  A: '#5BC0EB',
  T: '#E84855',
  C: '#9BC53D',
  G: '#FDE74C',
  U: '#E84855',
  N: '#555555',
  '-': 'transparent',
  ' ': 'transparent',
}

const NT_TEXT: Record<string, string> = {
  A: '#1a1c1e',
  T: '#fff',
  C: '#1a1c1e',
  G: '#1a1c1e',
  U: '#fff',
  N: '#ccc',
  '-': '#666',
}

function ntColor(ch: string): { bg: string; fg: string } {
  const upper = ch.toUpperCase()
  return {
    bg: NT_COLORS[upper] ?? '#444',
    fg: NT_TEXT[upper] ?? '#fff',
  }
}

// ── Conservation + gap bar heights ───────────────────────────────────────────

interface ColStats {
  conservation: number // 0-1 (fraction of most common non-gap nt)
  gap: number         // 0-1 (fraction that are gaps)
}

function computeColStats(seqs: string[], len: number): ColStats[] {
  return Array.from({ length: len }, (_, i) => {
    const chars = seqs.map(s => (s[i] ?? '-').toUpperCase())
    const gapCount = chars.filter(c => c === '-' || c === ' ').length
    const nonGap = chars.filter(c => c !== '-' && c !== ' ')
    const freq: Record<string, number> = {}
    for (const c of nonGap) freq[c] = (freq[c] ?? 0) + 1
    const maxFreq = Math.max(0, ...Object.values(freq))
    return {
      conservation: nonGap.length > 0 ? maxFreq / chars.length : 0,
      gap: gapCount / chars.length,
    }
  })
}

function computeConsensus(seqs: string[], len: number): string {
  return Array.from({ length: len }, (_, i) => {
    const chars = seqs.map(s => (s[i] ?? '-').toUpperCase()).filter(c => c !== '-' && c !== ' ')
    if (chars.length === 0) return '-'
    const freq: Record<string, number> = {}
    for (const c of chars) freq[c] = (freq[c] ?? 0) + 1
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
  }).join('')
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CELL_W = 14
const CELL_H = 18
const LABEL_W = 100
const BAR_AREA_H = 48
const TICK_EVERY = 10
const MAX_DISPLAY_COLS = 80

// ── Component ─────────────────────────────────────────────────────────────────

export default function AlignmentViewer({ data }: { data: GeneticPreview }) {
  const { sequences, full_length } = data
  const [startPos, setStartPos] = useState(0)

  const names = Object.keys(sequences)
  const seqList = names.map(n => sequences[n])

  const displayLen = Math.min(MAX_DISPLAY_COLS, seqList[0]?.length ?? 0)
  const window = useMemo(() =>
    seqList.map(s => s.slice(startPos, startPos + displayLen)),
    [seqList, startPos, displayLen]
  )

  const colStats = useMemo(() => computeColStats(window, displayLen), [window, displayLen])
  const consensus = useMemo(() => computeConsensus(window, displayLen), [window, displayLen])

  const totalCols = seqList[0]?.length ?? 0
  const maxStart = Math.max(0, totalCols - displayLen)

  const svgW = LABEL_W + displayLen * CELL_W + 8
  const gridTop = BAR_AREA_H
  const rows = names.length + 1  // + consensus
  const svgH = gridTop + rows * CELL_H + 20

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
        Alignment chart
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 12 }}>
          {names.length} sequences · {full_length} bp total
        </span>
      </p>

      {/* Position slider */}
      {totalCols > displayLen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Position: {startPos + 1}–{Math.min(startPos + displayLen, totalCols)}
          </label>
          <input
            type="range" min={0} max={maxStart} value={startPos}
            onChange={e => setStartPos(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--action)' }}
          />
        </div>
      )}

      {/* SVG alignment grid */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 10, background: '#1a1c2a' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block' }}>

          {/* Conservation bars */}
          {colStats.map((stat, ci) => {
            const barH = stat.conservation * (BAR_AREA_H - 8)
            return (
              <rect
                key={`con${ci}`}
                x={LABEL_W + ci * CELL_W + 1}
                y={BAR_AREA_H - 4 - barH}
                width={CELL_W - 2}
                height={barH}
                fill="#1FA391"
                opacity={0.85}
              />
            )
          })}

          {/* Gap bars (small, at top) */}
          {colStats.map((stat, ci) => {
            const barH = stat.gap * 8
            return barH > 0 ? (
              <rect
                key={`gap${ci}`}
                x={LABEL_W + ci * CELL_W + 1}
                y={0}
                width={CELL_W - 2}
                height={barH}
                fill="#6b7280"
                opacity={0.6}
              />
            ) : null
          })}

          {/* Bar area label */}
          <text x={2} y={14} fill="#6b7280" fontSize={9}>Gap</text>
          <text x={2} y={BAR_AREA_H - 6} fill="#1FA391" fontSize={9}>Conservation</text>

          {/* Position ticks */}
          {Array.from({ length: Math.ceil(displayLen / TICK_EVERY) }, (_, ti) => {
            const ci = ti * TICK_EVERY
            const absPos = startPos + ci + 1
            return (
              <text
                key={`tick${ci}`}
                x={LABEL_W + ci * CELL_W + 1}
                y={gridTop - 2}
                fill="#6b7280"
                fontSize={8}
              >
                {absPos}
              </text>
            )
          })}

          {/* Sequence rows */}
          {window.map((seq, ri) => {
            const y = gridTop + ri * CELL_H
            return (
              <g key={`row${ri}`}>
                <text x={2} y={y + CELL_H - 4} fill="#ccc" fontSize={10} fontFamily="monospace">
                  {names[ri].length > 10 ? names[ri].slice(0, 9) + '…' : names[ri]}
                </text>
                {Array.from(seq).map((ch, ci) => {
                  const { bg, fg } = ntColor(ch)
                  return (
                    <g key={ci}>
                      {bg !== 'transparent' && (
                        <rect x={LABEL_W + ci * CELL_W} y={y} width={CELL_W} height={CELL_H} fill={bg} />
                      )}
                      <text
                        x={LABEL_W + ci * CELL_W + CELL_W / 2}
                        y={y + CELL_H - 4}
                        fill={bg === 'transparent' ? '#555' : fg}
                        fontSize={9}
                        fontFamily="monospace"
                        fontWeight={700}
                        textAnchor="middle"
                      >
                        {ch.toUpperCase()}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}

          {/* Consensus row */}
          <g>
            <text
              x={2}
              y={gridTop + names.length * CELL_H + CELL_H - 4}
              fill="#fff"
              fontSize={10}
              fontFamily="monospace"
              fontWeight={700}
            >
              Consensus
            </text>
            {Array.from(consensus).map((ch, ci) => {
              const { bg, fg } = ntColor(ch)
              const y = gridTop + names.length * CELL_H
              return (
                <g key={ci}>
                  {bg !== 'transparent' && (
                    <rect x={LABEL_W + ci * CELL_W} y={y} width={CELL_W} height={CELL_H} fill={bg} opacity={0.7} />
                  )}
                  <text
                    x={LABEL_W + ci * CELL_W + CELL_W / 2}
                    y={y + CELL_H - 4}
                    fill={bg === 'transparent' ? '#555' : fg}
                    fontSize={9}
                    fontFamily="monospace"
                    fontWeight={700}
                    textAnchor="middle"
                  >
                    {ch.toUpperCase()}
                  </text>
                </g>
              )
            })}
          </g>

          {/* Divider line */}
          <line
            x1={LABEL_W} y1={gridTop + names.length * CELL_H}
            x2={svgW} y2={gridTop + names.length * CELL_H}
            stroke="#333" strokeWidth={1}
          />
        </svg>
      </div>

      {/* Color legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(['A', 'T', 'C', 'G'] as const).map(nt => (
          <div key={nt} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 14, height: 14, background: NT_COLORS[nt], borderRadius: 3 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{nt}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 14, height: 14, background: '#555', borderRadius: 3 }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>N/gap</span>
        </div>
      </div>
    </div>
  )
}
