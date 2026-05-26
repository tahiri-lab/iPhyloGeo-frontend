import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../../context/ThemeContext'

function ThemeDisplay() {
  const { theme, toggleTheme } = useTheme()
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to light theme when localStorage is empty', () => {
    render(<ThemeProvider><ThemeDisplay /></ThemeProvider>)
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('reads initial theme from localStorage', () => {
    localStorage.setItem('iphylogeo-theme', 'dark')
    render(<ThemeProvider><ThemeDisplay /></ThemeProvider>)
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('toggles from light to dark', async () => {
    const user = userEvent.setup()
    render(<ThemeProvider><ThemeDisplay /></ThemeProvider>)
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('toggles from dark back to light', async () => {
    const user = userEvent.setup()
    localStorage.setItem('iphylogeo-theme', 'dark')
    render(<ThemeProvider><ThemeDisplay /></ThemeProvider>)
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('adds dark class to documentElement on dark theme', async () => {
    const user = userEvent.setup()
    render(<ThemeProvider><ThemeDisplay /></ThemeProvider>)
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from documentElement on light theme', async () => {
    const user = userEvent.setup()
    localStorage.setItem('iphylogeo-theme', 'dark')
    render(<ThemeProvider><ThemeDisplay /></ThemeProvider>)
    await act(async () => {})
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists theme change to localStorage', async () => {
    const user = userEvent.setup()
    render(<ThemeProvider><ThemeDisplay /></ThemeProvider>)
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(localStorage.getItem('iphylogeo-theme')).toBe('dark')
  })
})
