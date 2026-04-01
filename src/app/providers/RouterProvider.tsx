import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router'

import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider as ReactRouterProvider, useRouteError } from 'react-router'

import { templateConfig, type TemplateConfig } from '@/shared/config'
import { corePathKeys } from '@/shared/model/coreRouter.ts'
import { Spinner } from '@/shared/ui/spinner/Spinner.tsx'

const TemplateShell = lazy(() =>
  import('@/widgets/layout/ui/template-shell/TemplateShell.tsx').then((module) => ({ default: module.TemplateShell }))
)
const HomePage = lazy(() => import('@/pages/home').then((module) => ({ default: module.HomePage })))
const Page404 = lazy(() => import('@/pages/page-404/ui/Page404/Page404.tsx').then((module) => ({ default: module.Page404 })))
const SignInPlaceholderPage = lazy(() =>
  import('@/pages/auth-placeholder/ui/SignInPlaceholderPage/SignInPlaceholderPage.tsx').then((module) => ({
    default: module.SignInPlaceholderPage
  }))
)
const VerifyPlaceholderPage = lazy(() =>
  import('@/pages/auth-placeholder/ui/VerifyPlaceholderPage/VerifyPlaceholderPage.tsx').then((module) => ({
    default: module.VerifyPlaceholderPage
  }))
)

function RouteFallback() {
  return <Spinner />
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>
}

function ExamplesPlaceholderPage() {
  return (
    <section className='grid gap-3'>
      <p className='m-0 text-sm uppercase tracking-[0.08em] text-slate-500'>Example Pack</p>
      <h1 className='m-0 text-3xl font-bold tracking-tight text-slate-950'>Example routes are enabled</h1>
      <p className='m-0 max-w-[60ch] text-slate-600'>
        Replace these placeholders with the project-specific example pack when you actually need demo routes.
      </p>
    </section>
  )
}

function ExampleDashboardPage() {
  return (
    <section className='grid gap-3'>
      <p className='m-0 text-sm uppercase tracking-[0.08em] text-slate-500'>Example Pack</p>
      <h1 className='m-0 text-3xl font-bold tracking-tight text-slate-950'>Dashboard placeholder</h1>
      <p className='m-0 max-w-[60ch] text-slate-600'>The previous dashboard implementation was removed because it was not wired into the current template.</p>
    </section>
  )
}

export function buildAppRoutes(config: TemplateConfig = templateConfig): RouteObject[] {
  const routes: RouteObject[] = [
    {
      element: withSuspense(<TemplateShell />),
      errorElement: <BubbleError />,
      children: [
        {
          path: corePathKeys.home,
          element: withSuspense(<HomePage />)
        }
      ]
    }
  ]

  if (config.features.examples) {
    routes[0].children?.push({
      path: corePathKeys.examples.grassAdmin,
      element: <ExamplesPlaceholderPage />
    })
    routes.push({
      path: '/dashboard',
      element: <ExampleDashboardPage />
    })
  }

  if (config.features.auth && !config.features.examples) {
    routes.push({
      path: corePathKeys.auth.signIn,
      element: withSuspense(<SignInPlaceholderPage />)
    })
    routes.push({
      path: corePathKeys.auth.verify,
      element: withSuspense(<VerifyPlaceholderPage />)
    })
  }

  routes.push({
    path: '*',
    element: withSuspense(<Page404 />),
    errorElement: <BubbleError />
  })

  return routes
}

const router = createBrowserRouter(buildAppRoutes())

function BubbleError(): null {
  const error = useRouteError()

  if (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error(typeof error === 'string' ? error : JSON.stringify(error))
  }

  return null
}

export function RouterProvider() {
  return <ReactRouterProvider router={router} />
}
