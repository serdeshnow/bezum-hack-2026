import { createBrowserRouter, Navigate } from 'react-router'

import { GuestRoute } from './GuestRoute.tsx'
import { ProtectedRoute } from './ProtectedRoute.tsx'
import { AppShell } from '@/widgets/layout/ui/app-shell/AppShell.tsx'
import { AuthSignInPage } from '@/pages/auth-sign-in'
import { AuthVerifyPage } from '@/pages/auth-verify'
import { ProjectsListPage } from '@/pages/projects-list'
import { ProjectOverviewPage } from '@/pages/project-overview'
import { EpochWorkspacePage } from '@/pages/epoch-workspace'
import { KanbanBoardPage } from '@/pages/kanban-board'
import { TaskDetailsPage } from '@/pages/task-details'
import { DocsHubPage } from '@/pages/docs-hub'
import { DocumentEditorPage } from '@/pages/document-editor'
import { DocumentHistoryPage } from '@/pages/document-history'
import { MeetingSchedulerPage } from '@/pages/meeting-scheduler'
import { MeetingRecapPage } from '@/pages/meeting-recap'
import { ReleaseDashboardPage } from '@/pages/release-dashboard'
import { UnifiedInboxPage } from '@/pages/unified-inbox'
import { SettingsPage } from '@/pages/settings'
import { Page404 } from '@/pages/page-404'

export const router = createBrowserRouter([
  {
    path: '/auth',
    children: [
      {
        path: 'sign-in',
        element: (
          <GuestRoute>
            <AuthSignInPage />
          </GuestRoute>
        )
      },
      {
        path: 'verify',
        element: (
          <GuestRoute>
            <AuthVerifyPage />
          </GuestRoute>
        )
      }
    ]
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to='/projects' replace /> },
      { path: 'projects', element: <ProjectsListPage /> },
      { path: 'projects/:id', element: <ProjectOverviewPage /> },
      { path: 'epochs/:epochId', element: <EpochWorkspacePage /> },
      { path: 'tasks', element: <KanbanBoardPage /> },
      { path: 'tasks/:taskId', element: <TaskDetailsPage /> },
      { path: 'docs', element: <DocsHubPage /> },
      { path: 'docs/:docId', element: <DocumentEditorPage /> },
      { path: 'docs/:docId/history', element: <DocumentHistoryPage /> },
      { path: 'meetings', element: <MeetingSchedulerPage /> },
      { path: 'meetings/:meetingId', element: <MeetingRecapPage /> },
      { path: 'releases', element: <ReleaseDashboardPage /> },
      { path: 'notifications', element: <UnifiedInboxPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  },
  {
    path: '*',
    element: <Page404 />
  }
])
