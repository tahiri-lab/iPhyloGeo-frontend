import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button, { ButtonPack } from '../../components/atoms/Button/Button'

describe('Button', () => {
  it('renders its children', () => {
    const { getByRole } = render(<Button>Click me</Button>)
    expect(getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('defaults to type="button" to prevent accidental form submission', () => {
    const { getByRole } = render(<Button>Click</Button>)
    expect(getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const { getByRole } = render(<Button onClick={handleClick}>Click</Button>)
    await user.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const { getByRole } = render(<Button onClick={handleClick} disabled>Click</Button>)
    await user.click(getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('marks the button as disabled in the DOM', () => {
    const { getByRole } = render(<Button disabled>Click</Button>)
    expect(getByRole('button')).toBeDisabled()
  })

  it('renders an icon alongside children when provided', () => {
    const { getByTestId, getByText } = render(
      <Button icon={<span data-testid="icon">★</span>}>Label</Button>,
    )
    expect(getByTestId('icon')).toBeInTheDocument()
    expect(getByText('Label')).toBeInTheDocument()
  })

  it('forwards a custom className', () => {
    const { getByRole } = render(<Button className="custom-class">Click</Button>)
    expect(getByRole('button')).toHaveClass('custom-class')
  })

  it('renders with type="submit" when specified', () => {
    const { getByRole } = render(<Button type="submit">Submit</Button>)
    expect(getByRole('button')).toHaveAttribute('type', 'submit')
  })
})

describe('ButtonPack', () => {
  it('renders multiple buttons inside a flex container', () => {
    const { container } = render(
      <ButtonPack>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonPack>,
    )
    expect(within(container).getByRole('button', { name: 'A' })).toBeInTheDocument()
    expect(within(container).getByRole('button', { name: 'B' })).toBeInTheDocument()
    expect(container.firstChild).toHaveStyle({ display: 'flex' })
  })
})
