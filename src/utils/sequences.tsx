export type CompositeAcid = 'N' | 'R' | 'Y' | 'W' | 'S' | 'K' | 'M' | 'B' | 'D' | 'H' | 'V'
export type PrimitiveAcid = 'A' | 'C' | 'T' | 'G' | 'U'
export type Acid = PrimitiveAcid | CompositeAcid
export type AcidOrGap = Acid | '-' | ' '

export const ACID_ASSOCIATIONS: Record<Acid, Array<PrimitiveAcid>> = {
  'C': ['C'],
  'G': ['G'],
  'A': ['A'],
  'T': ['T'],
  'U': ['U'],

  'N': ['A', 'T', 'C', 'G'],

  'R': ['A', 'G'],
  'Y': ['T', 'C'],
  'W': ['A', 'T'],
  'S': ['C', 'G'],
  'K': ['T', 'G'],
  'M': ['A', 'C'],

  'B': ['G', 'C', 'T'],
  'D': ['A', 'G', 'T'],
  'H': ['A', 'C', 'T'],
  'V': ['A', 'C', 'G'],
}

export interface AcidInfo {
  conservation: number // 0-1 (fraction of most common non-gap nt)
  gap: number         // 0-1 (fraction that are gaps)
  consensus: AcidOrGap
}

export type SequenceInfo = AcidInfo[]

export function sequenceInfo(seqs: AcidOrGap[][], len: number): SequenceInfo {
  return Array.from({ length: len }, (_, i) => {
    let gapCount = 0
    const freq: Partial<Record<PrimitiveAcid, number>> = {}
    for (const seq of seqs) {
      let c = seq[i] ?? '-'
      c = c === 'U' ? 'T' : c;
      if (c === '-' || c === ' ') {
        gapCount++
        continue
      }

      const weight = 12 / ACID_ASSOCIATIONS[c].length
      for (const a of ACID_ASSOCIATIONS[c])
        freq[a] = (freq[a] ?? 0) + weight
    }

    if (gapCount === seqs.length)
      return {
        consensus: '-',
        gap: 1,
        conservation: 0
      }

    const maxFreq = Math.max(...Object.values(freq))
    const tiePairs = Object.entries(freq).filter(f => f[1] === maxFreq)
    const tieSum = tiePairs.reduce((p, f) => p + f[1], 0)
    const tie = tiePairs.map(f => f[0])
    const consensus = (
      Object.entries(ACID_ASSOCIATIONS) as [Acid, PrimitiveAcid[]][]
    ).find(([_, acids]) =>
      acids.length === tie.length &&
      acids.every(x => tie.includes(x))
    )![0];
    return {
      consensus: consensus,
      conservation: tieSum / (seqs.length * 12),
      gap: gapCount / seqs.length
    }
  })
}
