import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider, useLang } from '../../context/LanguageContext'

function LangDisplay() {
  const { lang, setLang, t } = useLang()
  return (
    <>
      <span data-testid="lang">{lang}</span>
      <span data-testid="nav-home">{t.nav_home}</span>
      <span data-testid="upload-title">{t.upload_title}</span>
      <button onClick={() => setLang('fr')}>fr</button>
      <button onClick={() => setLang('es')}>es</button>
      <button onClick={() => setLang('en')}>en</button>
    </>
  )
}

describe('LanguageContext', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to English when localStorage is empty', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('en')
    expect(screen.getByTestId('nav-home').textContent).toBe('Home')
  })

  it('reads initial language from localStorage', () => {
    localStorage.setItem('iphylogeo-lang', 'fr')
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('fr')
  })

  it('switches to French and updates translations', async () => {
    const user = userEvent.setup()
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    await user.click(screen.getByRole('button', { name: 'fr' }))
    expect(screen.getByTestId('lang').textContent).toBe('fr')
    expect(screen.getByTestId('nav-home').textContent).toBe('Accueil')
    expect(screen.getByTestId('upload-title').textContent).toBe('Importer les données')
  })

  it('switches to Spanish and updates translations', async () => {
    const user = userEvent.setup()
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    await user.click(screen.getByRole('button', { name: 'es' }))
    expect(screen.getByTestId('lang').textContent).toBe('es')
    expect(screen.getByTestId('nav-home').textContent).toBe('Inicio')
    expect(screen.getByTestId('upload-title').textContent).toBe('Cargar datos')
  })

  it('switches back to English from another language', async () => {
    const user = userEvent.setup()
    localStorage.setItem('iphylogeo-lang', 'fr')
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    await user.click(screen.getByRole('button', { name: 'en' }))
    expect(screen.getByTestId('nav-home').textContent).toBe('Home')
  })

  it('persists language selection to localStorage', async () => {
    const user = userEvent.setup()
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    await user.click(screen.getByRole('button', { name: 'fr' }))
    expect(localStorage.getItem('iphylogeo-lang')).toBe('fr')
  })
})
