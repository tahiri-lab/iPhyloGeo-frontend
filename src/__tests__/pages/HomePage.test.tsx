import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../../context/ThemeContext'
import { LanguageProvider } from '../../context/LanguageContext'
import HomePage from '../../pages/HomePage/HomePage'

vi.mock('../../assets/videos/indexPhylogeo.mp4', () => ({ default: 'dark.mp4' }))
vi.mock('../../assets/videos/indexPhylogeo_light.mp4', () => ({ default: 'light.mp4' }))

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  it('renders the iPhyloGeo heading', () => {
    render(<HomePage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: 'iPhyloGeo' })).toBeInTheDocument()
  })

  it('renders a "Get Started" link pointing to /upload', () => {
    render(<HomePage />, { wrapper: Wrapper })
    const link = screen.getByRole('link', { name: /get started/i })
    expect(link).toHaveAttribute('href', '/upload')
  })

  it('renders the GitHub link opening in a new tab', () => {
    render(<HomePage />, { wrapper: Wrapper })
    const githubLinks = screen.getAllByRole('link', { name: /github/i })
    expect(githubLinks.length).toBeGreaterThan(0)
    expect(githubLinks[0]).toHaveAttribute('target', '_blank')
  })

  it('renders a video background element', () => {
    const { container } = render(<HomePage />, { wrapper: Wrapper })
    expect(container.querySelector('video')).not.toBeNull()
  })

  it('renders the phylogeographic description text', () => {
    render(<HomePage />, { wrapper: Wrapper })
    expect(screen.getByText(/phylogeographic analysis/i)).toBeInTheDocument()
  })
})
