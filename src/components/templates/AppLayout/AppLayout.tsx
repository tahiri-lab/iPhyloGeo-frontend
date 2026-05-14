import { type ReactNode } from 'react'
import NavBar from '../../organisms/Navbar/NavBar'
import DevToolsPanel from '../../organisms/DevToolsPanel/DevToolsPanel'

interface AppLayoutProps {
  children: ReactNode
  hideNav?: boolean
}

export default function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  return (
    <div
      style={{
        display: 'flex',
        // CRITICAL: align-items flex-start lets sticky work correctly
        alignItems: 'flex-start',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--background)',
        // CRITICAL: no overflow hidden/auto here — that would trap sticky
      }}
    >
      {!hideNav && <NavBar />}

      <main
        style={{
          flex: 1,
          minWidth: 0,
          // The main area scrolls independently; the sidebar stays put
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
        }}
      >
        {children}
      </main>

      <DevToolsPanel />
    </div>
  )
}