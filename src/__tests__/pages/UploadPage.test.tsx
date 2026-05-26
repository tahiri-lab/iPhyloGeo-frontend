import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../../context/LanguageContext'
import UploadPage from '../../pages/UploadPage/UploadPage'

vi.mock('../../services/api', () => ({
  default: {
    upload: { climatic: vi.fn(), genetic: vi.fn() },
    jobs: { create: vi.fn(), status: vi.fn() },
    settings: { get: vi.fn().mockResolvedValue({}) },
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <LanguageProvider>{children}</LanguageProvider>
    </MemoryRouter>
  )
}

describe('UploadPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the page title', () => {
    render(<UploadPage />, { wrapper: Wrapper })
    expect(screen.getByText('Upload Data')).toBeInTheDocument()
  })

  it('renders the climate file upload label', () => {
    render(<UploadPage />, { wrapper: Wrapper })
    expect(screen.getByText('Climate Data (CSV / Excel)')).toBeInTheDocument()
  })

  it('renders the genetic sequences upload label', () => {
    render(<UploadPage />, { wrapper: Wrapper })
    expect(screen.getByText('Genetic Sequences (FASTA)')).toBeInTheDocument()
  })

  it('renders the Run Analysis button', () => {
    render(<UploadPage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /run analysis/i })).toBeInTheDocument()
  })

  it('renders the How it works help section', () => {
    render(<UploadPage />, { wrapper: Wrapper })
    expect(screen.getByText('How it works')).toBeInTheDocument()
  })

  it('renders the Input Files section', () => {
    render(<UploadPage />, { wrapper: Wrapper })
    expect(screen.getByText('Input Files')).toBeInTheDocument()
  })
})
