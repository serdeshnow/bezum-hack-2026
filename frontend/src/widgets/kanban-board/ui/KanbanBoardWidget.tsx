import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, User } from 'lucide-react'
import { Link } from 'react-router'

import { epochQueries } from '@/entities/epoch'
import { TaskStatus } from '@/shared/api'
import { taskQueries } from '@/entities/task'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState } from '@/shared/ui'

const columns: TaskStatus[] = [TaskStatus.Backlog, TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Review, TaskStatus.Done]

export function KanbanBoardWidget() {
  const { data, isLoading, error } = useQuery(taskQueries.list())
  const { data: epochs = [] } = useQuery(epochQueries.list())

  const grouped = useMemo(
    () =>
      columns.map((status) => ({
        status,
        tasks: data?.filter((task) => task.status === status) ?? []
      })),
    [data]
  )

  if (isLoading) {
    return <PageState state='loading' title='Loading kanban board' description='Resolving tasks and status columns.' />
  }

  if (error) {
    return <PageState state='error' title='Kanban unavailable' description='Task board data could not be loaded.' />
  }

  if (!data?.length) {
    return <PageState state='empty' title='No tasks found' description='The board becomes useful once delivery work is scheduled.' />
  }

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Kanban board</h1>
        <p className='text-muted-foreground text-sm'>Docs, meetings, PRs, and releases all project back into task execution state here.</p>
      </div>

      {epochs[0] && (
        <div className='text-muted-foreground rounded-lg border p-3 text-sm'>
          Active epoch: {epochs[0].title}. {epochs[0].progress}% of scheduled task capacity is complete.
        </div>
      )}

      <div className='grid gap-4 xl:grid-cols-5'>
        {grouped.map((column) => (
          <div key={column.status} className='space-y-3'>
            <div className='flex items-center justify-between rounded-lg border px-3 py-2'>
              <h2 className='text-sm font-medium capitalize'>{column.status}</h2>
              <Badge variant='secondary'>{column.tasks.length}</Badge>
            </div>
            <div className='space-y-3'>
              {column.tasks.map((task) => (
                <Link key={task.id} to={`/tasks/${task.id}`}>
                  <Card className='hover:border-accent transition-colors'>
                    <CardHeader>
                      <CardDescription>{task.key}</CardDescription>
                      <CardTitle className='text-base'>{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3 text-sm'>
                      <p className='text-muted-foreground line-clamp-3'>{task.description}</p>
                      <div className='flex flex-wrap gap-2'>
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant='outline'>{tag}</Badge>
                        ))}
                        {task.epochLabel && <Badge variant='secondary'>{task.epochLabel}</Badge>}
                      </div>
                      <div className='text-muted-foreground flex items-center justify-between text-xs'>
                        <span className='flex items-center gap-1'><User className='size-3' /> {task.assignee?.initials ?? 'NA'}</span>
                        <span className='flex items-center gap-1'><Calendar className='size-3' /> {task.dueDate ?? 'No due date'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
