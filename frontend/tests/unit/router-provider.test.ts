import type { RouteObject } from 'react-router'

import { buildAppRoutes } from '../../src/app/providers/RouterProvider'
import type { TemplateConfig } from '../../src/shared/config'
import { corePathKeys } from '../../src/shared/model'

function collectPaths(routes: RouteObject[]): string[] {
  return routes.flatMap((route) => [route.path ?? '', ...(route.children ? collectPaths(route.children) : [])])
}

const baseConfig: TemplateConfig = {
  appName: 'Seamless',
  appDescription: 'Example description',
  locale: 'en-US',
  timezone: 'UTC',
  features: {
    auth: false,
    examples: false
  }
}

describe('buildAppRoutes', () => {
  it('returns Seamless product routes', () => {
    const paths = collectPaths(buildAppRoutes(baseConfig))

    expect(paths).toContain(corePathKeys.home)
    expect(paths).toContain(corePathKeys.projects)
    expect(paths).toContain(corePathKeys.projectOverview)
    expect(paths).toContain(corePathKeys.epochs)
    expect(paths).toContain(corePathKeys.tasks)
    expect(paths).toContain(corePathKeys.docs)
    expect(paths).toContain(corePathKeys.meetings)
    expect(paths).toContain(corePathKeys.releases)
    expect(paths).toContain(corePathKeys.notifications)
    expect(paths).toContain(corePathKeys.settings)
  })

  it('does not expose template-only auth or example routes anymore', () => {
    const paths = collectPaths(buildAppRoutes(baseConfig))

    expect(paths).not.toContain('/auth/sign-in')
    expect(paths).not.toContain('/auth/verify')
    expect(paths).not.toContain('/examples/grass-admin')
    expect(paths).not.toContain('/dashboard')
  })
})
