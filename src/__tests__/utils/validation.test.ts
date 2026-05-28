import { describe, it, expect } from 'vitest'
import { validateEmail } from '../../utils/validation'

describe('validateEmail', () => {
  it('accepts standard valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('first.last@domain.org')).toBe(true)
    expect(validateEmail('user+tag@sub.domain.io')).toBe(true)
    expect(validateEmail('name123@company.co')).toBe(true)
  })

  it('rejects emails without @', () => {
    expect(validateEmail('notanemail')).toBe(false)
    expect(validateEmail('missingatsign.com')).toBe(false)
  })

  it('rejects emails with missing local part', () => {
    expect(validateEmail('@domain.com')).toBe(false)
  })

  it('rejects emails with missing domain', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('rejects emails with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false)
    expect(validateEmail('user@ example.com')).toBe(false)
    expect(validateEmail('us er@example.com')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('rejects emails without a TLD', () => {
    expect(validateEmail('user@domain')).toBe(false)
  })
})
