import { queryOptions } from '@tanstack/react-query'

import { getProjectOverview, listProjects } from '@/shared/mocks/seamless.ts'
import { adaptProjectOverviewViewModel } from './adapters.ts'

export const projectQueryKeys = {
  all: ['projects'] as const,
  detail: (projectId: string) => ['projects', projectId] as const
}

export const projectQueries = {
  list: () =>
    queryOptions({
      queryKey: projectQueryKeys.all,
      queryFn: async () => listProjects()
    }),
  detail: (projectId: string) =>
    queryOptions({
      queryKey: projectQueryKeys.detail(projectId),
      queryFn: async () => adaptProjectOverviewViewModel(getProjectOverview(projectId))
    })
}
