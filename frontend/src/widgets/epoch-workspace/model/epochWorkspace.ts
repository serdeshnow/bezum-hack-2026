import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { seamlessMockDb, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'

type GoalItem = {
  id: string
  title: string
  description: string
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  progressPercent: number
  ownerName: string
  ownerInitials: string
}

type DocumentItem = {
  id: string
  title: string
  status: 'draft' | 'in-review' | 'approved' | 'obsolete' | 'rejected'
  accessScope: 'customer' | 'manager' | 'dev' | 'internal'
  updatedAt: string
  authorName: string
}

type MeetingItem = {
  id: string
  title: string
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled'
  type: 'standup' | 'planning' | 'review' | 'retrospective' | 'workshop' | 'ad-hoc'
  startsAt: string | null
}

type TimelineItem = {
  id: string
  kind: 'goal' | 'meeting' | 'release' | 'document' | 'epoch'
  title: string
  description: string
  date: string
}

type ReleaseReadiness = {
  version: string
  status: 'planned' | 'in-progress' | 'deployed' | 'failed' | 'rolled-back'
  targetDate: string | null
  completionPercent: number
  checklist: Array<{ id: string; label: string; completed: boolean }>
}

export type EpochWorkspaceData = {
  id: string
  name: string
  status: 'draft' | 'active' | 'at-risk' | 'archived' | 'completed'
  startDate: string
  endDate: string
  daysRemaining: number
  completionPercent: number
  taskStats: {
    total: number
    completed: number
    inProgress: number
    blocked: number
    notStarted: number
  }
  goals: GoalItem[]
  documents: DocumentItem[]
  meetings: MeetingItem[]
  timeline: TimelineItem[]
  releaseReadiness: ReleaseReadiness | null
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function resolveEpochId(epochId?: string) {
  if (epochId) return epochId

  return seamlessMockDb.epochs.find((epoch) => epoch.status === 'active')?.id ?? seamlessMockDb.epochs[0]?.id ?? null
}

function getEpochWorkspace(epochId?: string): EpochWorkspaceData | null {
  const resolvedEpochId = resolveEpochId(epochId)
  if (!resolvedEpochId) return null

  const epoch = seamlessMockDb.epochs.find((entry) => entry.id === resolvedEpochId)
  if (!epoch) return null

  const project = seamlessMockDb.projects.find((entry) => entry.id === epoch.projectId)
  const relatedGoals = seamlessMockDb.goals.filter((goal) => goal.epochId === epoch.id)
  const relatedTasks = seamlessMockDb.tasks.filter((task) => task.epochId === epoch.id)
  const relatedMeetings = seamlessMockDb.meetings.filter((meeting) => meeting.epochId === epoch.id)
  const linkedDocumentIds = seamlessMockDb.documentLinks.filter((link) => link.entityType === 'epoch' && link.entityId === epoch.id).map((link) => link.documentId)
  const relatedDocuments = seamlessMockDb.documents.filter((document) => linkedDocumentIds.includes(document.id))
  const releaseIds = Array.from(new Set(relatedTasks.map((task) => task.releaseId).filter(Boolean))) as string[]
  const relatedRelease = releaseIds.length > 0 ? seamlessMockDb.releases.find((release) => release.id === releaseIds[0]) ?? null : null

  const completedTasks = relatedTasks.filter((task) => task.status === 'done').length
  const inProgressTasks = relatedTasks.filter((task) => ['in-progress', 'review'].includes(task.status)).length
  const blockedTasks = relatedGoals.filter((goal) => goal.status === 'blocked').length
  const notStartedTasks = relatedTasks.filter((task) => ['backlog', 'todo'].includes(task.status)).length
  const completionPercent = relatedTasks.length === 0 ? 0 : Math.round((completedTasks / relatedTasks.length) * 100)

  const checklist = relatedRelease
    ? [
        { id: 'review', label: 'Critical tasks are in review or done', completed: relatedTasks.filter((task) => ['review', 'done'].includes(task.status)).length >= 2 },
        { id: 'docs', label: 'Epoch documents include an approved or in-review release brief', completed: relatedDocuments.some((document) => ['approved', 'in-review'].includes(document.status)) },
        { id: 'meetings', label: 'At least one planning or review meeting is attached', completed: relatedMeetings.some((meeting) => ['planning', 'review'].includes(meeting.type)) },
        { id: 'blockers', label: 'No blocked goals remain open', completed: blockedTasks === 0 }
      ]
    : []

  const timeline = [
    {
      id: `epoch-${epoch.id}`,
      kind: 'epoch' as const,
      title: `Epoch started: ${epoch.name}`,
      description: project ? `Project ${project.name} entered this sprint context.` : 'Epoch started.',
      date: epoch.startDate
    },
    ...relatedDocuments.map((document) => ({
      id: `document-${document.id}`,
      kind: 'document' as const,
      title: document.title,
      description: `${document.status} document in ${document.accessScope} scope`,
      date: document.updatedAt
    })),
    ...relatedMeetings.map((meeting) => ({
      id: `meeting-${meeting.id}`,
      kind: 'meeting' as const,
      title: meeting.title,
      description: `${meeting.type} meeting is ${meeting.status}`,
      date: meeting.startsAt ?? meeting.createdAt
    })),
    ...relatedGoals.map((goal) => ({
      id: `goal-${goal.id}`,
      kind: 'goal' as const,
      title: goal.title,
      description: `${goal.status} goal at ${goal.progressPercent}% completion`,
      date: goal.updatedAt
    })),
    ...(relatedRelease
      ? [
          {
            id: `release-${relatedRelease.id}`,
            kind: 'release' as const,
            title: `${relatedRelease.version} ${relatedRelease.title}`,
            description: `${relatedRelease.status} release`,
            date: relatedRelease.targetDate ?? relatedRelease.updatedAt
          }
        ]
      : [])
  ]
    .sort((left, right) => dayjs(left.date).valueOf() - dayjs(right.date).valueOf())
    .slice(0, 8)
    .map((item) => ({ ...item, date: dayjs(item.date).format('MMM D, YYYY') }))

  return {
    id: epoch.id,
    name: epoch.name,
    status: epoch.status as EpochWorkspaceData['status'],
    startDate: dayjs(epoch.startDate).format('MMM D, YYYY'),
    endDate: dayjs(epoch.endDate).format('MMM D, YYYY'),
    daysRemaining: Math.max(dayjs(epoch.endDate).diff(dayjs('2026-04-02'), 'day'), 0),
    completionPercent,
    taskStats: {
      total: relatedTasks.length,
      completed: completedTasks,
      inProgress: inProgressTasks,
      blocked: blockedTasks,
      notStarted: notStartedTasks
    },
    goals: relatedGoals.map((goal) => {
      const owner = seamlessMockDb.users.find((user) => user.id === goal.ownerUserId)
      const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown owner'

      return {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        status: goal.status as GoalItem['status'],
        progressPercent: goal.progressPercent,
        ownerName,
        ownerInitials: initials(ownerName)
      }
    }),
    documents: relatedDocuments
      .sort((left, right) => dayjs(right.updatedAt).valueOf() - dayjs(left.updatedAt).valueOf())
      .map((document) => ({
        id: document.id,
        title: document.title,
        status: document.status,
        accessScope: document.accessScope,
        updatedAt: dayjs(document.updatedAt).format('MMM D, YYYY'),
        authorName: (() => {
          const author = seamlessMockDb.users.find((user) => user.id === document.authorUserId)
          return author ? `${author.firstName} ${author.lastName}` : 'Unknown author'
        })()
      })),
    meetings: relatedMeetings
      .sort((left, right) => dayjs(left.startsAt ?? left.createdAt).valueOf() - dayjs(right.startsAt ?? right.createdAt).valueOf())
      .map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        status: meeting.status,
        type: meeting.type,
        startsAt: meeting.startsAt ? dayjs(meeting.startsAt).format('MMM D, YYYY HH:mm') : null
      })),
    timeline,
    releaseReadiness: relatedRelease
      ? {
          version: relatedRelease.version,
          status: relatedRelease.status,
          targetDate: relatedRelease.targetDate ? dayjs(relatedRelease.targetDate).format('MMM D, YYYY') : null,
          completionPercent: checklist.length === 0 ? 0 : Math.round((checklist.filter((item) => item.completed).length / checklist.length) * 100),
          checklist
        }
      : null
  }
}

async function fetchEpochWorkspace(epochId?: string) {
  return withMockLatency(getEpochWorkspace(epochId))
}

export const epochWorkspaceQueries = {
  byId: (epochId?: string) =>
    queryOptions({
      queryKey: ['backbone', 'epoch-workspace', epochId ?? 'active'],
      queryFn: () => fetchEpochWorkspace(epochId)
    })
}
