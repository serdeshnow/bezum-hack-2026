import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Card, Spinner } from '@/shared/ui'
import { changeTaskStatus, kanbanBoardQueries, type KanbanLaneId } from '@/widgets/kanban-board/model/kanbanBoard.ts'
import { KanbanBoard } from '@/widgets/kanban-board/ui/KanbanBoard.tsx'

export function KanbanBoardPage() {
  const queryClient = useQueryClient()
  const kanbanBoardQuery = useQuery(kanbanBoardQueries.board())
  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: KanbanLaneId }) => changeTaskStatus(taskId, status),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['backbone', 'tasks', 'board'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'tasks', 'details', variables.taskId] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'projects-hub'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'project-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'epoch-workspace'] })
      ])
    }
  })

  if (kanbanBoardQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (kanbanBoardQuery.isError || !kanbanBoardQuery.data) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load task board data.
      </Card>
    )
  }

  return (
    <KanbanBoard
      data={kanbanBoardQuery.data}
      isStatusUpdating={statusMutation.isPending}
      onTaskStatusChange={(taskId, status) => statusMutation.mutate({ taskId, status })}
    />
  )
}
