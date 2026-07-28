import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { DevToolsProvider } from './context/DevToolsContext'
import { ServerStatusProvider } from './context/ServerStatusContext'
import { router } from './router'

export default function App() {
  return (
    <ServerStatusProvider>
      <ThemeProvider>
        <LanguageProvider>
          <DevToolsProvider>
            <RouterProvider router={router} />
          </DevToolsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ServerStatusProvider>
  )
}
