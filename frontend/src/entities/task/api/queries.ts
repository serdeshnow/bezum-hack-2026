import { queryOptions } from '@tanstack/react-query'

import { getTaskDetails, listTasks } from '@/shared/mocks/seamless.ts'

export const taskQueryKeys = {
  all: ['tasks'] as const,
  detail: (taskId: string) => ['tasks', taskId] as const
}

export const taskQueries = {
  list: () =>
    queryOptions({
      queryKey: taskQueryKeys.all,
      queryFn: async () => listTasks()
    }),
  detail: (taskId: string) =>
    queryOptions({
      queryKey: taskQueryKeys.detail(taskId),
      queryFn: async () => getTaskDetails(taskId)
    })
}
