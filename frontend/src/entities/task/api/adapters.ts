import type { TaskDetails } from '@/shared/mocks/seamless.ts'

export type TaskDetailsViewModel = TaskDetails & {
  linkedSummary: {
    docs: number
    meetings: number
    pullRequests: number
    hasRelease: boolean
    quotedFragments: number
  }
  meetingContextLabel: string
}

export function adaptTaskDetailsViewModel(task: TaskDetails): TaskDetailsViewModel {
  const quotedFragments = task.linkedDocs.reduce((count, doc) => count + doc.quotes.length, 0)

  return {
    ...task,
    linkedSummary: {
      docs: task.linkedDocs.length,
      meetings: task.linkedMeetings.length,
      pullRequests: task.linkedPRs.length,
      hasRelease: Boolean(task.linkedRelease),
      quotedFragments
    },
    meetingContextLabel: task.linkedMeetings.length ? `${task.linkedMeetings.length} linked meeting contexts` : 'No meeting context yet'
  }
}
