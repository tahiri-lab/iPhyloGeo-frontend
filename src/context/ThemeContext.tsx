import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
})

/**
 * Provides the light/dark theme, initialized from `localStorage`
 * (falling back to the OS `prefers-color-scheme`) and kept in sync by
 * toggling the `dark` class on `<html>` — CSS variables in the stylesheets
 * key off that class, so no other wiring is needed to theme the app.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('iphylogeo-theme')
    if (saved === 'light' || saved === 'dark') {
      return saved
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('iphylogeo-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** Access the current theme and the toggle function. Must be used under `<ThemeProvider>`. */
export const useTheme = () => useContext(ThemeContext)
