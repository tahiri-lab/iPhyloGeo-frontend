import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../../context/LanguageContext'
import SettingsPage from '../../pages/SettingsPage/SettingsPage'

const { mockSettingsGet, mockSettingsUpdate } = vi.hoisted(() => ({
  mockSettingsGet: vi.fn(),
  mockSettingsUpdate: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  default: {
    settings: {
      get: mockSettingsGet,
      update: mockSettingsUpdate,
    },
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <LanguageProvider>{children}</LanguageProvider>
    </MemoryRouter>
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    mockSettingsGet.mockResolvedValue({
      bootstrap_threshold: 10,
      window_size: 400,
      step_size: 200,
      dist_threshold: 10000,
      rate_similarity: 50,
      permutations_mantel_test: 999,
    })
    mockSettingsUpdate.mockResolvedValue({ bootstrap_threshold: 10 })
  })

  it('shows a loading indicator while fetching settings', () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders the settings form after data loads', async () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    await waitFor(() => expect(screen.getByText('Settings')).toBeInTheDocument())
    // Bootstrap Threshold appears as a form label and in the Parameter Guide
    expect(screen.getAllByText('Bootstrap Threshold').length).toBeGreaterThan(0)
    expect(screen.getByText('Window Size')).toBeInTheDocument()
    expect(screen.getByText('Step Size')).toBeInTheDocument()
  })

  it('renders the Methods section with dropdowns', async () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    await waitFor(() => screen.getByText('Methods'))
    expect(screen.getByText('Alignment Method')).toBeInTheDocument()
    expect(screen.getByText('Distance Method')).toBeInTheDocument()
  })

  it('renders the Save Settings button', async () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    await waitFor(() => screen.getByRole('button', { name: /save settings/i }))
    expect(screen.getByRole('button', { name: /save settings/i })).toBeInTheDocument()
  })

  it('calls api.settings.update when the save button is clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: Wrapper })
    await waitFor(() => screen.getByRole('button', { name: /save settings/i }))
    await user.click(screen.getByRole('button', { name: /save settings/i }))
    expect(mockSettingsUpdate).toHaveBeenCalledOnce()
  })

  it('shows a success message after a successful save', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: Wrapper })
    await waitFor(() => screen.getByRole('button', { name: /save settings/i }))
    await user.click(screen.getByRole('button', { name: /save settings/i }))
    await waitFor(() => expect(screen.getByText('Settings saved.')).toBeInTheDocument())
  })

  it('shows an error message when the save fails', async () => {
    mockSettingsUpdate.mockRejectedValueOnce(new Error('Network error'))
    const user = userEvent.setup()
    render(<SettingsPage />, { wrapper: Wrapper })
    await waitFor(() => screen.getByRole('button', { name: /save settings/i }))
    await user.click(screen.getByRole('button', { name: /save settings/i }))
    await waitFor(() => expect(screen.getByText(/failed to save/i)).toBeInTheDocument())
  })

  it('renders the Parameter Guide help section', async () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    await waitFor(() => screen.getByText('Parameter Guide'))
    expect(screen.getByText('Parameter Guide')).toBeInTheDocument()
  })
})
