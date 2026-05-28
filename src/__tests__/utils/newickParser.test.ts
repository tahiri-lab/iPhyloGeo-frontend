import { describe, it, expect } from 'vitest'
import { parseNewick } from '../../utils/newickParser'

describe('parseNewick', () => {
  it('parses a single leaf', () => {
    const tree = parseNewick('A')
    expect(tree.name).toBe('A')
    expect(tree.children).toHaveLength(0)
    expect(tree.branchLength).toBe(0)
  })

  it('parses a leaf with branch length', () => {
    const tree = parseNewick('A:1.5')
    expect(tree.name).toBe('A')
    expect(tree.branchLength).toBe(1.5)
  })

  it('parses a simple two-leaf tree', () => {
    const tree = parseNewick('(A:1,B:2)')
    expect(tree.children).toHaveLength(2)
    expect(tree.children[0].name).toBe('A')
    expect(tree.children[0].branchLength).toBe(1)
    expect(tree.children[1].name).toBe('B')
    expect(tree.children[1].branchLength).toBe(2)
  })

  it('parses a tree with an internal node name and branch length', () => {
    const tree = parseNewick('(A:1,B:2)C:0.5')
    expect(tree.name).toBe('C')
    expect(tree.branchLength).toBe(0.5)
    expect(tree.children).toHaveLength(2)
  })

  it('parses a nested tree', () => {
    const tree = parseNewick('((A:1,B:2)C:0.5,D:3)Root')
    expect(tree.name).toBe('Root')
    expect(tree.children).toHaveLength(2)
    expect(tree.children[0].name).toBe('C')
    expect(tree.children[0].children).toHaveLength(2)
    expect(tree.children[1].name).toBe('D')
    expect(tree.children[1].branchLength).toBe(3)
  })

  it('strips a trailing semicolon', () => {
    const tree = parseNewick('(A,B);')
    expect(tree.children).toHaveLength(2)
  })

  it('defaults missing branch lengths to 0', () => {
    const tree = parseNewick('(A,B)')
    expect(tree.children[0].branchLength).toBe(0)
    expect(tree.children[1].branchLength).toBe(0)
  })

  it('parses scientific notation branch lengths', () => {
    const tree = parseNewick('A:1e-3')
    expect(tree.branchLength).toBeCloseTo(0.001)
  })

  it('returns empty children array for a leaf', () => {
    const tree = parseNewick('Leaf:2.0')
    expect(Array.isArray(tree.children)).toBe(true)
    expect(tree.children).toHaveLength(0)
  })
})
