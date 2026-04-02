import { useMutation } from '@tanstack/react-query'

import type { UpdateTaskRequest } from '@/shared/api'
import { TaskStatus } from '@/shared/api'
import { http, queryClient, withBackendFallback } from '@/shared/api'
import { addTaskComment, updateTaskStatus } from '@/shared/mocks/seamless.ts'

import { useSessionStore } from '@/entities/session'
import { taskQueryKeys } from '@/entities/task/api/queries.ts'

export function useUpdateTaskStatus(taskId: string) {
  return useMutation({
    mutationFn: (status: TaskStatus) =>
      withBackendFallback(
        async () => {
          const { data } = await http.patch(`/tasks/${taskId}`, {
            status
          } satisfies UpdateTaskRequest)
          return data
        },
        () => Promise.resolve(updateTaskStatus(taskId, status))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(taskId) })
    }
  })
}

export function useAddTaskComment(taskId: string) {
  return useMutation({
    mutationFn: (content: string) => {
      const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
      return withBackendFallback(
        async () => {
          const { data } = await http.post(`/tasks/${taskId}/comments`, {
            authorUserId: userId,
            content
          })
          return data
        },
        () => Promise.resolve(addTaskComment(taskId, content, userId))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(taskId) })
    }
  })
}
