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
const ProjectsListPage = lazy(() =>
  import('@/pages/projects/ProjectsListPage.tsx').then((module) => ({ default: module.ProjectsListPage }))
)
const ProjectOverviewPage = lazy(() =>
  import('@/pages/project-overview/ProjectOverviewPage.tsx').then((module) => ({ default: module.ProjectOverviewPage }))
)
const EpochWorkspacePage = lazy(() =>
  import('@/pages/epoch-workspace/EpochWorkspacePage.tsx').then((module) => ({ default: module.EpochWorkspacePage }))
)
const KanbanBoardPage = lazy(() =>
  import('@/pages/kanban-board/KanbanBoardPage.tsx').then((module) => ({ default: module.KanbanBoardPage }))
)
const TaskDetailsPage = lazy(() =>
  import('@/pages/task-details/TaskDetailsPage.tsx').then((module) => ({ default: module.TaskDetailsPage }))
)
const DocsHubPage = lazy(() =>
  import('@/pages/docs-hub/DocsHubPage.tsx').then((module) => ({ default: module.DocsHubPage }))
)
const DocumentEditorPage = lazy(() =>
  import('@/pages/document-editor/DocumentEditorPage.tsx').then((module) => ({ default: module.DocumentEditorPage }))
)
const DocumentHistoryPage = lazy(() =>
  import('@/pages/document-history/DocumentHistoryPage.tsx').then((module) => ({ default: module.DocumentHistoryPage }))
)
const MeetingSchedulerPage = lazy(() =>
  import('@/pages/meeting-scheduler/MeetingSchedulerPage.tsx').then((module) => ({ default: module.MeetingSchedulerPage }))
)
const MeetingRecapPage = lazy(() =>
  import('@/pages/meeting-recap/MeetingRecapPage.tsx').then((module) => ({ default: module.MeetingRecapPage }))
)
const ReleaseDashboardPage = lazy(() =>
  import('@/pages/release-dashboard/ReleaseDashboardPage.tsx').then((module) => ({ default: module.ReleaseDashboardPage }))
)
const UnifiedInboxPage = lazy(() =>
  import('@/pages/unified-inbox/UnifiedInboxPage.tsx').then((module) => ({ default: module.UnifiedInboxPage }))
)
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage.tsx').then((module) => ({ default: module.SettingsPage }))
)
const Page404 = lazy(() => import('@/pages/page-404/ui/page-404/page-404').then((module) => ({ default: module.Page404 })))

function RouteFallback() {
  return <Spinner />
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>
}

export function buildAppRoutes(_config: TemplateConfig = templateConfig): RouteObject[] {
  const routes: RouteObject[] = [
    {
      path: corePathKeys.home,
      element: withSuspense(<TemplateShell />),
      errorElement: <BubbleError />,
      children: [
        {
          index: true,
          element: withSuspense(<ProjectsListPage />)
        },
        {
          path: corePathKeys.projects,
          element: withSuspense(<ProjectsListPage />)
        },
        {
          path: corePathKeys.projectOverview,
          element: withSuspense(<ProjectOverviewPage />)
        },
        {
          path: corePathKeys.epochs,
          element: withSuspense(<EpochWorkspacePage />)
        },
        {
          path: corePathKeys.epochWorkspace,
          element: withSuspense(<EpochWorkspacePage />)
        },
        {
          path: corePathKeys.tasks,
          element: withSuspense(<KanbanBoardPage />)
        },
        {
          path: corePathKeys.taskDetails,
          element: withSuspense(<TaskDetailsPage />)
        },
        {
          path: corePathKeys.docs,
          element: withSuspense(<DocsHubPage />)
        },
        {
          path: corePathKeys.documentEditor,
          element: withSuspense(<DocumentEditorPage />)
        },
        {
          path: corePathKeys.documentHistory,
          element: withSuspense(<DocumentHistoryPage />)
        },
        {
          path: corePathKeys.meetings,
          element: withSuspense(<MeetingSchedulerPage />)
        },
        {
          path: corePathKeys.meetingRecap,
          element: withSuspense(<MeetingRecapPage />)
        },
        {
          path: corePathKeys.releases,
          element: withSuspense(<ReleaseDashboardPage />)
        },
        {
          path: corePathKeys.notifications,
          element: withSuspense(<UnifiedInboxPage />)
        },
        {
          path: corePathKeys.settings,
          element: withSuspense(<SettingsPage />)
        }
      ]
    },
    {
      path: '*',
      element: withSuspense(<Page404 />),
      errorElement: <BubbleError />
    }
  ]

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
