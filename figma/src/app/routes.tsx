import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout/app-layout";
import { ProjectOverviewPage } from "./pages/project-overview-page";
import { KanbanBoardPage } from "./pages/kanban-board-page";
import { TaskDetailsPage } from "./pages/task-details-page";
import { DocsHubPage } from "./pages/docs-hub-page";
import { DocumentEditorPage } from "./pages/document-editor-page";
import { DocumentHistoryPage } from "./pages/document-history-page";
import { EpochWorkspacePage } from "./pages/epoch-workspace-page";
import { MeetingSchedulerPage } from "./pages/meeting-scheduler-page";
import { MeetingRecapPage } from "./pages/meeting-recap-page";
import { ReleaseDashboardPage } from "./pages/release-dashboard-page";
import { UnifiedInboxPage } from "./pages/unified-inbox-page";
import { SettingsPage } from "./pages/settings-page";
import { ProjectsListPage } from "./pages/projects-list-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <ProjectsListPage />,
      },
      {
        path: "projects",
        children: [
          {
            index: true,
            element: <ProjectsListPage />,
          },
          {
            path: ":id",
            element: <ProjectOverviewPage />,
          },
        ],
      },
      {
        path: "epochs",
        children: [
          {
            index: true,
            element: <EpochWorkspacePage />,
          },
          {
            path: ":epochId",
            element: <EpochWorkspacePage />,
          },
        ],
      },
      {
        path: "tasks",
        children: [
          {
            index: true,
            element: <KanbanBoardPage />,
          },
          {
            path: ":taskId",
            element: <TaskDetailsPage />,
          },
        ],
      },
      {
        path: "docs",
        children: [
          {
            index: true,
            element: <DocsHubPage />,
          },
          {
            path: ":docId",
            element: <DocumentEditorPage />,
          },
          {
            path: ":docId/history",
            element: <DocumentHistoryPage />,
          },
        ],
      },
      {
        path: "meetings",
        children: [
          {
            index: true,
            element: <MeetingSchedulerPage />,
          },
          {
            path: ":meetingId",
            element: <MeetingRecapPage />,
          },
        ],
      },
      {
        path: "releases",
        element: <ReleaseDashboardPage />,
      },
      {
        path: "notifications",
        element: <UnifiedInboxPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);