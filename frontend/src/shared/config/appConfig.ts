import { env } from './env.ts'

export const appConfig = {
  apiBaseUrl: env.VITE_API_BASEURL,
  apiToken: env.VITE_API_TOKEN,
  appName: env.VITE_APP_NAME,
  appDescription: env.VITE_APP_DESCRIPTION,
  locale: env.VITE_APP_LOCALE,
  timezone: env.VITE_APP_TIMEZONE,
  useMockApi: env.VITE_USE_MOCK_API,
  sessionUserId: env.VITE_SESSION_USER_ID,
  defaultProjectId: env.VITE_DEFAULT_PROJECT_ID
} as const
