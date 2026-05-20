import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { DevToolsProvider } from './context/DevToolsContext'
import { router } from './router'

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DevToolsProvider>
          <RouterProvider router={router} />
        </DevToolsProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
