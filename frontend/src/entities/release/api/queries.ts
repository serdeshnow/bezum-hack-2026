import { queryOptions } from '@tanstack/react-query'

import { getReleaseDashboard } from '@/shared/mocks/seamless.ts'

export const releaseQueryKeys = {
  dashboard: ['releases'] as const
}

export const releaseQueries = {
  dashboard: () =>
    queryOptions({
      queryKey: releaseQueryKeys.dashboard,
      queryFn: async () => getReleaseDashboard()
    })
}
