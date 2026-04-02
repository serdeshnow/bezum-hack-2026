export const appRoutes = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    verify: '/auth/verify'
  },
  projects: '/projects',
  projectDetails: '/projects/:id',
  epochs: '/epochs/:epochId',
  tasks: '/tasks',
  taskDetails: '/tasks/:taskId',
  docs: '/docs',
  docDetails: '/docs/:docId',
  docHistory: '/docs/:docId/history',
  meetings: '/meetings',
  meetingDetails: '/meetings/:meetingId',
  releases: '/releases',
  notifications: '/notifications',
  settings: '/settings',
  notFound: '*'
} as const

export const authRouteKeys = [appRoutes.auth.signIn, appRoutes.auth.verify] as const
export const protectedRouteKeys = [
  appRoutes.home,
  appRoutes.projects,
  appRoutes.projectDetails,
  appRoutes.epochs,
  appRoutes.tasks,
  appRoutes.taskDetails,
  appRoutes.docs,
  appRoutes.docDetails,
  appRoutes.docHistory,
  appRoutes.meetings,
  appRoutes.meetingDetails,
  appRoutes.releases,
  appRoutes.notifications,
  appRoutes.settings
] as const

export type AppRouteKey = (typeof protectedRouteKeys)[number] | (typeof authRouteKeys)[number]
