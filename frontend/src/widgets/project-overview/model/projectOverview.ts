import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { seamlessMockDb, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'

type SummaryStat = {
  id: string
  label: string
  value: string
  detail: string
  tone: 'default' | 'success' | 'warning' | 'danger'
}

type EntityCount = {
  id: string
  label: string
  count: number
  detail: string
}

type ActivityEntry = {
  id: string
  type: 'task' | 'doc' | 'meeting' | 'pr' | 'release'
  title: string
  detail: string
  actor: string
  timestamp: string
}

export type ProjectOverviewData = {
  id: string
  name: string
  key: string
  description: string
  status: 'draft' | 'active' | 'at-risk' | 'archived' | 'completed'
  visibilityMode: 'internal' | 'customer'
  customerHiddenEntities: number
  summary: SummaryStat[]
  entities: EntityCount[]
  activity: ActivityEntry[]
}

function relativeTime(date: string) {
  const now = dayjs('2026-04-02T09:00:00Z')
  const diffMinutes = now.diff(dayjs(date), 'minute')

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = now.diff(dayjs(date), 'hour')
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const diffDays = now.diff(dayjs(date), 'day')
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function getProjectOverview(projectId: string): ProjectOverviewData | null {
  const project = seamlessMockDb.projects.find((entry) => entry.id === projectId)

  if (!project) return null

  const activeEpoch = project.activeEpochId ? seamlessMockDb.epochs.find((epoch) => epoch.id === project.activeEpochId) : null
  const relatedTasks = seamlessMockDb.tasks.filter((task) => task.projectId === project.id)
  const relatedMeetings = seamlessMockDb.meetings.filter((meeting) => meeting.projectId === project.id)
  const relatedDocuments = seamlessMockDb.documents.filter((document) => document.projectId === project.id)
  const relatedReleases = seamlessMockDb.releases.filter((release) => release.projectId === project.id)
  const relatedPullRequests = seamlessMockDb.pullRequests.filter((pullRequest) => pullRequest.projectId === project.id)
  const blockedGoals = activeEpoch ? seamlessMockDb.goals.filter((goal) => goal.epochId === activeEpoch.id && goal.status === 'blocked') : []
  const latestRelease = [...relatedReleases].sort((left, right) => dayjs(right.updatedAt).valueOf() - dayjs(left.updatedAt).valueOf())[0]
  const upcomingMeetings = relatedMeetings.filter((meeting) => meeting.status === 'scheduled').length
  const customerHiddenEntities =
    relatedDocuments.filter((document) => document.accessScope !== 'customer').length +
    relatedPullRequests.length +
    relatedMeetings.filter((meeting) => meeting.sourceContextType === 'task').length

  const activity: ActivityEntry[] = [
    ...relatedTasks.map((task) => ({
      id: `task-${task.id}`,
      type: 'task' as const,
      title: task.title,
      detail: `${task.key} moved to ${task.status}`,
      actor: seamlessMockDb.users.find((user) => user.id === task.assigneeUserId)?.firstName ?? 'Unassigned',
      timestamp: task.updatedAt
    })),
    ...relatedDocuments.map((document) => ({
      id: `document-${document.id}`,
      type: 'doc' as const,
      title: document.title,
      detail: `${document.status} document in ${document.accessScope} scope`,
      actor: seamlessMockDb.users.find((user) => user.id === document.authorUserId)?.firstName ?? 'Unknown',
      timestamp: document.updatedAt
    })),
    ...relatedMeetings.map((meeting) => ({
      id: `meeting-${meeting.id}`,
      type: 'meeting' as const,
      title: meeting.title,
      detail: `${meeting.type} meeting is ${meeting.status}`,
      actor: 'System',
      timestamp: meeting.updatedAt
    })),
    ...relatedPullRequests.map((pullRequest) => ({
      id: `pr-${pullRequest.id}`,
      type: 'pr' as const,
      title: `#${pullRequest.number} ${pullRequest.title}`,
      detail: `${pullRequest.status} on ${pullRequest.branch}`,
      actor: seamlessMockDb.users.find((user) => user.id === pullRequest.authorUserId)?.firstName ?? 'Unknown',
      timestamp: pullRequest.updatedAt
    })),
    ...relatedReleases.map((release) => ({
      id: `release-${release.id}`,
      type: 'release' as const,
      title: `${release.version} ${release.title}`,
      detail: `${release.status} release`,
      actor: seamlessMockDb.users.find((user) => user.id === release.authorUserId)?.firstName ?? 'Unknown',
      timestamp: release.updatedAt
    }))
  ]
    .sort((left, right) => dayjs(right.timestamp).valueOf() - dayjs(left.timestamp).valueOf())
    .slice(0, 7)
    .map((entry) => ({ ...entry, timestamp: relativeTime(entry.timestamp) }))

  return {
    id: project.id,
    name: project.name,
    key: project.key,
    description: project.description,
    status: project.status,
    visibilityMode: project.visibilityMode,
    customerHiddenEntities,
    summary: [
      {
        id: 'status',
        label: 'Project Status',
        value: project.status,
        detail: project.visibilityMode === 'customer' ? 'Customer-visible collaboration mode' : 'Internal-only collaboration mode',
        tone: project.status === 'active' ? 'success' : project.status === 'at-risk' ? 'warning' : project.status === 'completed' ? 'default' : 'danger'
      },
      {
        id: 'epoch',
        label: 'Active Epoch',
        value: activeEpoch?.name ?? 'No active epoch',
        detail: activeEpoch ? `${dayjs(activeEpoch.endDate).diff(dayjs('2026-04-02'), 'day')} days left in ${activeEpoch.status}` : 'Activate a sprint to project goals and docs',
        tone: activeEpoch ? 'default' : 'warning'
      },
      {
        id: 'blockers',
        label: 'Open Blockers',
        value: `${blockedGoals.length}`,
        detail: blockedGoals.length > 0 ? 'Blocked goals need coordination' : 'No blocked goals in the current sprint',
        tone: blockedGoals.length > 0 ? 'danger' : 'success'
      },
      {
        id: 'meetings',
        label: 'Upcoming Meetings',
        value: `${upcomingMeetings}`,
        detail: upcomingMeetings > 0 ? 'Scheduled syncs are attached to project context' : 'No meetings scheduled yet',
        tone: upcomingMeetings > 0 ? 'default' : 'warning'
      },
      {
        id: 'release',
        label: 'Latest Release',
        value: latestRelease?.version ?? 'None',
        detail: latestRelease ? `${latestRelease.status} delivery narrative` : 'No release tracked yet',
        tone: latestRelease?.status === 'deployed' ? 'success' : latestRelease ? 'warning' : 'default'
      }
    ],
    entities: [
      { id: 'docs', label: 'Docs', count: relatedDocuments.length, detail: 'Documentation linked to this project' },
      { id: 'tasks', label: 'Tasks', count: relatedTasks.length, detail: 'Operational execution items' },
      { id: 'meetings', label: 'Meetings', count: relatedMeetings.length, detail: 'Scheduled and completed touchpoints' },
      { id: 'prs', label: 'Pull Requests', count: relatedPullRequests.length, detail: 'Delivery work linked to project tasks' },
      { id: 'releases', label: 'Releases', count: relatedReleases.length, detail: 'Tracked release milestones' }
    ],
    activity
  }
}

async function fetchProjectOverview(projectId: string) {
  return withMockLatency(getProjectOverview(projectId))
}

export const projectOverviewQueries = {
  byId: (projectId: string) =>
    queryOptions({
      queryKey: ['backbone', 'project-overview', projectId],
      queryFn: () => fetchProjectOverview(projectId)
    })
}
