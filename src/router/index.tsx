import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../components/templates/AppLayout/AppLayout'

const importHomePage = () => import('../pages/HomePage/HomePage')
const importUploadPage = () => import('../pages/UploadPage/UploadPage')
const importSettingsPage = () => import('../pages/SettingsPage/SettingsPage')
const importResultsPage = () => import('../pages/ResultsPage/ResultsPage')
const importGraphPage = () => import('../pages/GraphPage/GraphPage')

const HomePage = lazy(importHomePage)
const UploadPage = lazy(importUploadPage)
const SettingsPage = lazy(importSettingsPage)
const ResultsPage = lazy(importResultsPage)
const GraphPage = lazy(importGraphPage)

export function prefetchRoute(path: string): Promise<unknown> {
  switch (path) {
    case '/':
      return importHomePage()
    case '/upload':
      return importUploadPage()
    case '/settings':
      return importSettingsPage()
    case '/results':
      return importResultsPage()
    case '/graph':
      return importGraphPage()
    default:
      return Promise.resolve()
  }
}

export function prefetchLikelyRoutes(): Promise<unknown[]> {
  return Promise.all([
    importUploadPage(),
    importResultsPage(),
  ])
}

function RouteLoader() {
  return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading...</div>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout hideNav>
        <Suspense fallback={<RouteLoader />}>
          <HomePage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/upload',
    element: (
      <AppLayout>
        <Suspense fallback={<RouteLoader />}>
          <UploadPage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <AppLayout>
        <Suspense fallback={<RouteLoader />}>
          <SettingsPage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/results',
    element: (
      <AppLayout>
        <Suspense fallback={<RouteLoader />}>
          <ResultsPage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/graph',
    element: (
      <AppLayout>
        <Suspense fallback={<RouteLoader />}>
          <GraphPage />
        </Suspense>
      </AppLayout>
    ),
  },
])