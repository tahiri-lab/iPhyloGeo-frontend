import { describe, it, expect } from 'vitest'
import { sequenceInfo } from '../../utils/sequences'

describe('sequenceInfo', () => {
  it('works for only primitive acids and ties of two', () => {
    const info = sequenceInfo([
      ['A', '-', 'C', 'G', 'U', 'G', '-', 'C', '-', 'C', '-', 'C', '-', 'G', 'G', 'A', 'G'],
      ['-', 'T', 'C', 'G', 'U', '-', 'G', 'T', '-', 'G', 'C', 'C', '-', 'T', 'T', 'G', 'T'],
      ['A', 'T', 'C', 'G', 'U', '-', 'G', 'T', 'T', 'G', 'T', 'C', '-', 'G', 'A', 'G', 'G'],
      ['A', 'T', 'C', 'G', '-', 'A', 'A', 'C', 'A', 'C', 'G', 'A', '-', 'A', 'T', 'A', 'T'],
      ['A', 'T', 'C', '-', 'U', 'T', 'A', 'C', 'A', 'C', 'G', 'A', '-', 'T', 'C', 'T', '-'],
      ['A', 'T', '-', 'G', 'U', 'C', 'A', '-', '-', 'A', '-', 'U', '-', 'C', 'C', 'A', 'T'],
      ['A', 'T', 'C', 'G', 'U', '-', 'G', 'T', 'T', 'G', 'T', 'A', '-', 'G', 'C', 'A', 'T'],
    ], 17)

    expect(info.map(i => i.consensus))
      .toStrictEqual(['A', 'T', 'C', 'G', 'T', 'N', 'R', 'Y', 'W', 'S', 'K', 'M', '-', 'G', 'C', 'A', 'T'])
    expect(info.map(i => i.gap))
      .toStrictEqual([1, 1, 1, 1, 1, 3, 1, 1, 3, 0, 2, 0, 7, 0, 0, 0, 1].map(g => g / 7))
  })

  it('Works for composite acids made of two primitive acids', () => {
    const info = sequenceInfo([
      ['N', 'T', 'C', 'G', 'G', 'A', 'T', 'G', 'C', 'T', 'A', 'T', 'G', 'A', 'C', 'T', 'G', 'T', 'C', 'G', 'T', 'T', 'T'],
      ['N', 'T', 'C', 'G', 'G', 'A', 'T', 'G', 'C', 'T', 'A', 'T', 'G', 'A', 'C', 'T', 'G', 'T', 'C', 'T', 'G', 'G', 'G'],
      ['N', 'T', 'C', 'G', 'G', 'A', 'T', 'G', 'C', 'T', 'A', 'T', 'G', 'A', 'C', 'T', 'G', 'T', 'C', '-', '-', '-', '-'],
      ['N', 'A', 'G', 'A', 'C', 'T', 'C', 'A', 'T', 'A', 'C', 'G', 'C', 'G', 'T', 'G', 'A', 'C', 'A', 'R', 'Y', 'S', 'Y'],
      ['N', 'A', 'G', 'A', 'C', 'T', 'C', 'A', 'T', 'A', 'C', 'G', 'C', 'G', 'T', 'G', 'A', 'C', 'A', 'W', 'S', 'K', 'W'],
      ['N', 'A', 'G', 'A', 'C', 'T', 'C', 'A', 'T', 'A', 'C', 'G', 'C', 'G', 'T', 'G', 'A', 'C', 'A', 'A', 'C', 'C', 'A'],
      ['N', 'R', 'R', 'R', 'Y', 'Y', 'Y', 'W', 'W', 'W', 'S', 'S', 'S', 'K', 'K', 'K', 'M', 'M', 'M', '-', '-', '-', '-'],
    ], 23)

    expect(info.map(i => i.consensus))
      .toStrictEqual(['N', 'A', 'G', 'R', 'C', 'T', 'Y', 'A', 'T', 'W', 'C', 'G', 'S', 'G', 'T', 'K', 'A', 'C', 'M', 'A', 'C', 'G', 'T'])
    expect(info.map(i => i.gap))
      .toStrictEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2].map(g => g / 7))
  })

  it('Work for ties of 3 and acids made of 3 primitive acids', () => {
    const info = sequenceInfo([
      ['G', 'G', 'C', 'C', 'G', 'G', 'C', 'C', 'G', 'G', 'G', 'C'],
      ['T', 'T', 'T', 'G', 'T', 'T', 'T', 'G', 'A', 'C', 'T', 'T'],
      ['T', 'T', 'T', 'G', 'T', 'T', 'T', 'G', 'A', 'C', 'T', 'T'],
      ['A', 'C', 'G', 'T', 'B', 'D', 'H', 'V', 'B', 'D', 'H', 'V'],
      ['C', 'A', 'A', 'A', 'C', 'A', 'A', 'A', 'C', 'A', 'A', 'A'],
      ['C', 'A', 'A', 'A', 'C', 'A', 'A', 'A', 'C', 'A', 'A', 'A'],
      ['G', 'G', 'C', 'C', 'G', 'G', 'C', 'C', 'G', 'G', 'G', 'C'],
    ], 12)

    expect(info.map(i => i.consensus))
      .toStrictEqual(['B', 'D', 'H', 'V', 'B', 'D', 'H', 'V', 'S', 'R', 'W', 'M'])
    expect(info.map(i => i.gap))
      .toStrictEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map(g => g / 7))
  })
})
