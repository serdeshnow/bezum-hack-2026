import { Link } from 'react-router'

import { useCreateTaskFromMeetingActionItem } from '@/entities/meeting'
import { Button } from '@/shared/ui'

type Props = {
  meetingId: string
  actionItemId: string
  alreadyTask?: boolean
  taskId?: string | null
}

export function CreateTaskFromActionItemButton({ meetingId, actionItemId, alreadyTask, taskId }: Props) {
  const createTask = useCreateTaskFromMeetingActionItem(meetingId)

  if ((alreadyTask || taskId) && taskId) {
    return (
      <Button asChild size='sm' variant='outline'>
        <Link to={`/tasks/${taskId}`}>Open task</Link>
      </Button>
    )
  }

  return (
    <Button size='sm' onClick={() => createTask.mutate({ actionItemId })} disabled={createTask.isPending}>
      Create task
    </Button>
  )
}
