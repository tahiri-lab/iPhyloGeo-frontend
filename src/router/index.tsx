import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../components/templates/AppLayout/AppLayout'
import HomePage from '../pages/HomePage/HomePage'
import UploadPage from '../pages/UploadPage/UploadPage'
import SettingsPage from '../pages/SettingsPage/SettingsPage'
import ResultsPage from '../pages/ResultsPage/ResultsPage'
import GraphPage from '../pages/GraphPage/GraphPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout hideNav>
        <HomePage />
      </AppLayout>
    ),
  },
  {
    path: '/upload',
    element: (
      <AppLayout>
        <UploadPage />
      </AppLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <AppLayout>
        <SettingsPage />
      </AppLayout>
    ),
  },
  {
    path: '/results',
    element: (
      <AppLayout>
        <ResultsPage />
      </AppLayout>
    ),
  },
  {
    path: '/graph',
    element: (
      <AppLayout>
        <GraphPage />
      </AppLayout>
    ),
  },
])