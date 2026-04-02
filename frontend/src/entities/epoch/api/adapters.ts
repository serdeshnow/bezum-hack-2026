import type { EpochWorkspace } from '@/shared/mocks/seamless.ts'

export type EpochSummary = {
  id: string
  title: string
  status: EpochWorkspace['status']
  progress: number
  windowLabel: string
  goalCount: number
  documentCount: number
  meetingCount: number
  releaseLabel: string
}

export type EpochWorkspaceViewModel = EpochWorkspace & {
  summary: EpochSummary
  linkedEntityTotals: {
    documents: number
    meetings: number
    goals: number
    completedTasks: number
    totalTasks: number
  }
}

export function adaptEpochSummary(epoch: EpochWorkspace): EpochSummary {
  const totalTasks = epoch.taskStats.total || 1
  const progress = Math.round((epoch.taskStats.completed / totalTasks) * 100)

  return {
    id: epoch.id,
    title: epoch.name,
    status: epoch.status,
    progress,
    windowLabel: `${epoch.startDate} -> ${epoch.endDate}`,
    goalCount: epoch.goals.length,
    documentCount: epoch.documents.length,
    meetingCount: epoch.meetings.length,
    releaseLabel: `${epoch.releaseReadiness.version} · ${epoch.releaseReadiness.status}`
  }
}

export function adaptEpochWorkspaceViewModel(epoch: EpochWorkspace): EpochWorkspaceViewModel {
  return {
    ...epoch,
    summary: adaptEpochSummary(epoch),
    linkedEntityTotals: {
      documents: epoch.documents.length,
      meetings: epoch.meetings.length,
      goals: epoch.goals.length,
      completedTasks: epoch.taskStats.completed,
      totalTasks: epoch.taskStats.total
    }
  }
}
