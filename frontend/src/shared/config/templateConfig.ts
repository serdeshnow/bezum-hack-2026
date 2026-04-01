import { z } from 'zod'

const booleanFlag = z
  .union([z.boolean(), z.string(), z.undefined()])
  .transform((value) => {
    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'string') {
      return value.toLowerCase() === 'true'
    }

    return false
  })

const templateConfigSchema = z.object({
  appName: z.string().min(1).default('Template Shell'),
  appDescription: z.string().min(1).default('A generic application shell built with React, TypeScript, Vite, and FSD.'),
  locale: z.string().min(2).default('en-US'),
  timezone: z.string().min(1).default('UTC'),
  features: z.object({
    auth: booleanFlag.default(false),
    examples: booleanFlag.default(false)
  })
})

export type TemplateConfig = z.infer<typeof templateConfigSchema>

type RawTemplateConfig = {
  VITE_APP_NAME?: string
  VITE_APP_DESCRIPTION?: string
  VITE_APP_LOCALE?: string
  VITE_APP_TIMEZONE?: string
  VITE_FEATURE_AUTH?: string | boolean
  VITE_FEATURE_EXAMPLES?: string | boolean
}

export function parseTemplateConfig(source: RawTemplateConfig): TemplateConfig {
  return templateConfigSchema.parse({
    appName: source.VITE_APP_NAME,
    appDescription: source.VITE_APP_DESCRIPTION,
    locale: source.VITE_APP_LOCALE,
    timezone: source.VITE_APP_TIMEZONE,
    features: {
      auth: source.VITE_FEATURE_AUTH,
      examples: source.VITE_FEATURE_EXAMPLES
    }
  })
}

export const templateConfig = parseTemplateConfig({
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION,
  VITE_APP_LOCALE: import.meta.env.VITE_APP_LOCALE,
  VITE_APP_TIMEZONE: import.meta.env.VITE_APP_TIMEZONE,
  VITE_FEATURE_AUTH: import.meta.env.VITE_FEATURE_AUTH,
  VITE_FEATURE_EXAMPLES: import.meta.env.VITE_FEATURE_EXAMPLES
})
