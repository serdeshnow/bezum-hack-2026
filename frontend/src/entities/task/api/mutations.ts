import { useMutation } from '@tanstack/react-query'

import { TaskStatus } from '@/shared/api'
import { queryClient } from '@/shared/api'
import { addTaskComment, updateTaskStatus } from '@/shared/mocks/seamless.ts'

import { useSessionStore } from '@/entities/session'
import { taskQueryKeys } from '@/entities/task/api/queries.ts'

export function useUpdateTaskStatus(taskId: string) {
  return useMutation({
    mutationFn: (status: TaskStatus) => Promise.resolve(updateTaskStatus(taskId, status)),
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
      return Promise.resolve(addTaskComment(taskId, content, userId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.detail(taskId) })
    }
  })
}
