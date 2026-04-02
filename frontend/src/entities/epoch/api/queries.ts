import { queryOptions } from '@tanstack/react-query'

import { getEpochWorkspace, listEpochs } from '@/shared/mocks/seamless.ts'
import { adaptEpochSummary, adaptEpochWorkspaceViewModel } from './adapters.ts'

export const epochQueryKeys = {
  all: ['epochs'] as const,
  detail: (epochId: string) => ['epochs', epochId] as const
}

export const epochQueries = {
  list: () =>
    queryOptions({
      queryKey: epochQueryKeys.all,
      queryFn: async () => listEpochs().map(adaptEpochSummary)
    }),
  detail: (epochId: string) =>
    queryOptions({
      queryKey: epochQueryKeys.detail(epochId),
      queryFn: async () => adaptEpochWorkspaceViewModel(getEpochWorkspace(epochId))
    })
}
