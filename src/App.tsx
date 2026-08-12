import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { DevToolsProvider } from './context/DevToolsContext'
import { ServerStatusProvider } from './context/ServerStatusContext'
import { PresetsProvider } from './context/PresetContext'
import { router } from './router'
import { ToastProvider } from './utils/toastContext'

export default function App() {
  return (
  <ServerStatusProvider>
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
        <PresetsProvider>
        <DevToolsProvider>
          <RouterProvider router={router} />
        </DevToolsProvider>
        </PresetsProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  </ServerStatusProvider>
  )
}
