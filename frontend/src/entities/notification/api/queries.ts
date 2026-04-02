import { queryOptions } from '@tanstack/react-query'

import { listNotifications } from '@/shared/mocks/seamless.ts'

export const notificationQueryKeys = {
  all: ['notifications'] as const
}

export const notificationQueries = {
  list: () =>
    queryOptions({
      queryKey: notificationQueryKeys.all,
      queryFn: async () => listNotifications()
    })
}
