export const corePathKeys = {
  home: '/',
  notFound: '/404',
  projects: '/projects',
  projectOverview: '/projects/:projectId',
  epochs: '/epochs',
  epochWorkspace: '/epochs/:epochId',
  tasks: '/tasks',
  taskDetails: '/tasks/:taskId',
  docs: '/docs',
  documentEditor: '/docs/:documentId',
  documentHistory: '/docs/:documentId/history',
  meetings: '/meetings',
  meetingRecap: '/meetings/:meetingId',
  releases: '/releases',
  notifications: '/notifications',
  settings: '/settings'
} as const
