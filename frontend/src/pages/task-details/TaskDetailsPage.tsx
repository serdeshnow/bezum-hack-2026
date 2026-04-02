import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { Card, Spinner } from '@/shared/ui'
import { addTaskComment, changeTaskDetailsStatus, taskDetailsQueries, type TaskDetailsData } from '@/widgets/task-details/model/taskDetails.ts'
import { TaskDetails } from '@/widgets/task-details/ui/TaskDetails.tsx'

export function TaskDetailsPage() {
  const { taskId = '' } = useParams<{ taskId: string }>()
  const queryClient = useQueryClient()
  const taskDetailsQuery = useQuery(taskDetailsQueries.byId(taskId))

  const statusMutation = useMutation({
    mutationFn: (status: TaskDetailsData['status']) => changeTaskDetailsStatus(taskId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['backbone', 'tasks', 'board'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'tasks', 'details', taskId] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'projects-hub'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'project-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'epoch-workspace'] })
      ])
    }
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => addTaskComment(taskId, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['backbone', 'tasks', 'details', taskId] })
    }
  })

  if (taskDetailsQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (taskDetailsQuery.isError) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load task details.
      </Card>
    )
  }

  if (!taskDetailsQuery.data) {
    return (
      <Card className='border-amber-200 bg-amber-50 text-amber-900' theme='secondary'>
        Task not found for route id `{taskId}`.
      </Card>
    )
  }

  return (
    <TaskDetails
      data={taskDetailsQuery.data}
      isCommentSubmitting={commentMutation.isPending}
      isStatusUpdating={statusMutation.isPending}
      onAddComment={(content) => commentMutation.mutate(content)}
      onStatusChange={(status) => statusMutation.mutate(status)}
    />
  )
}
