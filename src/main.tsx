import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createHashHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { ComparePage, EditorPage, Root } from './pages'
import './styles.css'

const rootRoute = createRootRoute({ component: Root })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: EditorPage })
const compareRoute = createRoute({ getParentRoute: () => rootRoute, path: '/compare', component: ComparePage })
const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, compareRoute]), history: createHashHistory() })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

const qc = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
