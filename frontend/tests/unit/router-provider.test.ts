import type { RouteObject } from 'react-router'

import { buildAppRoutes } from '../../src/app/providers/RouterProvider'
import type { TemplateConfig } from '../../src/shared/config'
import { corePathKeys } from '../../src/shared/model'

function collectPaths(routes: RouteObject[]): string[] {
  return routes.flatMap((route) => [route.path ?? '', ...(route.children ? collectPaths(route.children) : [])])
}

const baseConfig: TemplateConfig = {
  appName: 'Template Shell',
  appDescription: 'Example description',
  locale: 'en-US',
  timezone: 'UTC',
  features: {
    auth: false,
    examples: false
  }
}

describe('buildAppRoutes', () => {
  it('returns core-only routes by default', () => {
    const paths = collectPaths(buildAppRoutes(baseConfig))

    expect(paths).toContain(corePathKeys.home)
    expect(paths).not.toContain(corePathKeys.auth.signIn)
    expect(paths).not.toContain(corePathKeys.examples.grassAdmin)
  })

  it('adds auth placeholders when auth is enabled without examples', () => {
    const paths = collectPaths(
      buildAppRoutes({
        ...baseConfig,
        features: { auth: true, examples: false }
      })
    )

    expect(paths).toContain(corePathKeys.auth.signIn)
    expect(paths).toContain(corePathKeys.auth.verify)
  })

  it('adds example routes when examples are enabled', () => {
    const paths = collectPaths(
      buildAppRoutes({
        ...baseConfig,
        features: { auth: false, examples: true }
      })
    )

    expect(paths).toContain(corePathKeys.examples.grassAdmin)
    expect(paths).toContain('/dashboard')
  })
})
