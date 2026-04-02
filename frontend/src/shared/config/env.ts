import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASEURL: z.string().url().default('http://localhost:8080/api'),
  VITE_APP_NAME: z.string().default('Seamless'),
  VITE_APP_DESCRIPTION: z.string().default('Unified delivery workspace for docs, tasks, meetings, releases, and notifications.'),
  VITE_APP_LOCALE: z.string().default('en-US'),
  VITE_APP_TIMEZONE: z.string().default('Europe/Moscow'),
  VITE_USE_MOCK_API: z
    .union([z.boolean(), z.string(), z.undefined()])
    .transform((value) => value === true || value === 'true' || value === undefined),
  VITE_SESSION_USER_ID: z.string().default('user-manager'),
  VITE_DEFAULT_PROJECT_ID: z.string().default('project-seamless'),
  __NODE_ENV__: z.string()
})

export const env = envSchema.parse({
  VITE_API_BASEURL: import.meta.env.VITE_API_BASEURL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION,
  VITE_APP_LOCALE: import.meta.env.VITE_APP_LOCALE,
  VITE_APP_TIMEZONE: import.meta.env.VITE_APP_TIMEZONE,
  VITE_USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API,
  VITE_SESSION_USER_ID: import.meta.env.VITE_SESSION_USER_ID,
  VITE_DEFAULT_PROJECT_ID: import.meta.env.VITE_DEFAULT_PROJECT_ID,
  __NODE_ENV__: import.meta.env.MODE
})
