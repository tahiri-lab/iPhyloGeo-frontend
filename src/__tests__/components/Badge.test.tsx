import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../../components/atoms/Badge/Badge'

describe('Badge', () => {
  it('renders its text content', () => {
    render(<Badge>complete</Badge>)
    expect(screen.getByText('complete')).toBeInTheDocument()
  })

  it('renders as a <span> element', () => {
    const { container } = render(<Badge>status</Badge>)
    expect(container.querySelector('span')).not.toBeNull()
  })

  it('renders different status labels', () => {
    const { rerender } = render(<Badge>pending</Badge>)
    expect(screen.getByText('pending')).toBeInTheDocument()
    rerender(<Badge>error</Badge>)
    expect(screen.getByText('error')).toBeInTheDocument()
  })

  it('applies uppercase text transform via inline styles', () => {
    const { container } = render(<Badge>running</Badge>)
    const span = container.querySelector('span')
    expect(span).toHaveStyle({ textTransform: 'uppercase' })
  })
})
