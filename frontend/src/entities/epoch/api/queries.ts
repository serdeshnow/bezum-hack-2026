import { queryOptions } from '@tanstack/react-query'

import { getEpochWorkspace } from '@/shared/mocks/seamless.ts'

export const epochQueryKeys = {
  detail: (epochId: string) => ['epochs', epochId] as const
}

export const epochQueries = {
  detail: (epochId: string) =>
    queryOptions({
      queryKey: epochQueryKeys.detail(epochId),
      queryFn: async () => getEpochWorkspace(epochId)
    })
}
