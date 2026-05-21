import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import { useLang, type Lang, type Translations } from '../../../context/LanguageContext'
import { prefetchLikelyRoutes, prefetchRoute } from '../../../router'

const NAV_ITEMS: { path: string; labelKey: keyof Translations; icon: React.ReactNode }[] = [
  {
    path: '/',
    labelKey: 'nav_home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path: '/upload',
    labelKey: 'nav_upload',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    path: '/settings',
    labelKey: 'nav_settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
  {
    path: '/results',
    labelKey: 'nav_results',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    path: '/graph',
    labelKey: 'nav_graph',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
]

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const BurgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

const LANGS: Lang[] = ['en', 'fr', 'es']

export default function NavBar() {
  const [minimized, setMinimized] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang, t } = useLang()
  const location = useLocation()

  useEffect(() => {
    let cancelled = false
    const g = globalThis as typeof globalThis & {
      requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number
      cancelIdleCallback?: (id: number) => void
    }

    const runPrefetch = () => {
      if (cancelled) return
      void prefetchLikelyRoutes()
    }

    if (g.requestIdleCallback && g.cancelIdleCallback) {
      const id = g.requestIdleCallback(runPrefetch, { timeout: 1600 })
      return () => {
        cancelled = true
        g.cancelIdleCallback?.(id)
      }
    }

    const timeout = setTimeout(runPrefetch, 700)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  return (
    <nav
      style={{
        position: 'sticky',
        top: '10px',
        flexShrink: 0,
        alignSelf: 'flex-start',
        margin: '10px',
        borderRadius: '16px',
        zIndex: 100,
        width: minimized ? '75px' : '250px',
        backgroundColor: 'var(--primary)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid var(--border)',
        height: 'calc(100vh - 21px)',
        transition: 'width 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '40px', gap: '10px' }}>
          <button
            onClick={() => setMinimized(m => !m)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
            aria-label="Toggle sidebar"
          >
            <BurgerIcon />
          </button>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text)',
              opacity: minimized ? 0 : 1,
              maxWidth: minimized ? 0 : '180px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.2s ease, max-width 0.3s ease',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '-0.5px',
            }}
          >
            iPhyloGeo
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div
        style={{
          padding: minimized ? '20px 15px' : '20px',
          flex: 1,
          transition: 'padding 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{ textDecoration: 'none' }}
              onMouseEnter={() => { void prefetchRoute(item.path) }}
              onFocus={() => { void prefetchRoute(item.path) }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '12px',
                  padding: minimized ? '0' : '2px',
                  width: minimized ? '44px' : '100%',
                  height: '44px',
                  justifyContent: minimized ? 'center' : 'flex-start',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {/* Background layer */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '12px',
                    border: isActive
                      ? '2px solid var(--action)'
                      : '2px solid var(--border)',
                    backgroundColor: isActive ? 'var(--action)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                />
                {/* Icon */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                    color: isActive ? '#fff' : 'var(--text)',
                    marginLeft: minimized ? 0 : '4px',
                  }}
                >
                  {item.icon}
                </div>
                {/* Label */}
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: isActive ? '#fff' : 'var(--text)',
                    opacity: minimized ? 0 : 1,
                    maxWidth: minimized ? 0 : '160px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    marginLeft: minimized ? 0 : '10px',
                    transition: 'opacity 0.15s ease, max-width 0.3s ease, margin-left 0.3s ease',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {t[item.labelKey]}
                </span>
              </div>
            </NavLink>
          )
        })}
      </div>

      {/* Bottom section */}
      <div
        style={{
          padding: minimized ? '20px 15px' : '20px',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          alignItems: minimized ? 'center' : 'stretch',
          transition: 'padding 0.3s ease',
        }}
      >
        {/* Language switcher */}
        {!minimized && (
          <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
            {LANGS.map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '8px',
                  border: `1px solid ${lang === l ? 'var(--action)' : 'var(--border)'}`,
                  background: lang === l ? 'var(--action-soft-bg)' : 'transparent',
                  color: lang === l ? 'var(--action)' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: lang === l ? 700 : 400,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.15s ease',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? t.nav_light_mode : t.nav_dark_mode}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: minimized ? '44px' : '100%',
            height: '44px',
            borderRadius: '12px',
            border: '2px solid var(--border)',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            justifyContent: minimized ? 'center' : 'flex-start',
            padding: minimized ? '0' : '0 4px',
            gap: minimized ? 0 : '10px',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </div>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              opacity: minimized ? 0 : 1,
              maxWidth: minimized ? 0 : '160px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.15s ease, max-width 0.3s ease',
            }}
          >
            {theme === 'dark' ? t.nav_light_mode : t.nav_dark_mode}
          </span>
        </button>
      </div>
    </nav>
  )
}
