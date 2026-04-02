import { queryOptions } from '@tanstack/react-query'

import { getReleaseDashboard } from '@/shared/mocks/seamless.ts'
import { adaptReleaseDashboardViewModel, type ReleaseDashboardViewModel } from './adapters.ts'

export const releaseQueryKeys = {
  dashboard: ['releases'] as const
}

export const releaseQueries = {
  dashboard: () =>
    queryOptions<ReleaseDashboardViewModel>({
      queryKey: releaseQueryKeys.dashboard,
      queryFn: async () => adaptReleaseDashboardViewModel(getReleaseDashboard())
    })
}
