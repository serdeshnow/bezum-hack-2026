import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { createMockTaskComment, seamlessMockDb, updateMockTaskStatus, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'
import type { Task } from '@/shared/api/contracts/seamlessBackbone.ts'

type LinkedDocument = {
  id: string
  title: string
  status: 'draft' | 'in-review' | 'approved' | 'obsolete' | 'rejected'
  accessScope: 'customer' | 'manager' | 'dev' | 'internal'
  description: string
  updatedAt: string
}

type LinkedMeeting = {
  id: string
  title: string
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled'
  type: 'standup' | 'planning' | 'review' | 'retrospective' | 'workshop' | 'ad-hoc'
  startsAt: string | null
  summary: string
}

type LinkedPullRequest = {
  id: string
  number: number
  title: string
  status: 'open' | 'reviewing' | 'merged' | 'closed'
  branch: string
  commitsCount: number
  authorName: string
}

type LinkedRelease = {
  id: string
  version: string
  title: string
  status: 'planned' | 'in-progress' | 'deployed' | 'failed' | 'rolled-back'
  targetDate: string | null
  commitsCount: number
}

type TaskCommentItem = {
  id: string
  authorName: string
  authorInitials: string
  content: string
  createdAt: string
}

type TaskActivityItem = {
  id: string
  type: 'task' | 'comment' | 'doc' | 'meeting' | 'pr' | 'release'
  title: string
  description: string
  actor: string
  timestamp: string
}

type AutomationInsight = {
  id: string
  tone: 'info' | 'warning'
  message: string
}

type TaskBlocker = {
  id: string
  title: string
  description: string
}

export type TaskDetailsData = {
  id: string
  key: string
  title: string
  description: string
  status: Task['status']
  priority: Task['priority']
  dueDate: string | null
  createdDate: string | null
  assigneeName: string | null
  assigneeInitials: string | null
  reporterName: string | null
  reporterInitials: string | null
  projectName: string
  projectKey: string
  epochName: string | null
  epochId: string | null
  tags: string[]
  blockers: TaskBlocker[]
  linkedDocuments: LinkedDocument[]
  linkedMeetings: LinkedMeeting[]
  linkedPullRequests: LinkedPullRequest[]
  linkedRelease: LinkedRelease | null
  comments: TaskCommentItem[]
  activity: TaskActivityItem[]
  automationInsights: AutomationInsight[]
}

function initials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
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

function formatDate(date: string | null) {
  return date ? dayjs(date).format('MMM D, YYYY') : null
}

function getPullRequests(task: Task) {
  return seamlessMockDb.pullRequests.filter(
    (pullRequest) =>
      pullRequest.projectId === task.projectId &&
      (pullRequest.releaseId === task.releaseId ||
        pullRequest.title.toLowerCase().includes(task.key.toLowerCase()) ||
        pullRequest.branch.toLowerCase().includes(task.key.toLowerCase()))
  )
}

function getTaskDetails(taskId: string): TaskDetailsData | null {
  const task = seamlessMockDb.tasks.find((entry) => entry.id === taskId)

  if (!task) {
    return null
  }

  const project = seamlessMockDb.projects.find((entry) => entry.id === task.projectId)

  if (!project) {
    return null
  }

  const assignee = task.assigneeUserId ? seamlessMockDb.users.find((entry) => entry.id === task.assigneeUserId) : null
  const reporter = task.reporterUserId ? seamlessMockDb.users.find((entry) => entry.id === task.reporterUserId) : null
  const epoch = task.epochId ? seamlessMockDb.epochs.find((entry) => entry.id === task.epochId) : null
  const release = task.releaseId ? seamlessMockDb.releases.find((entry) => entry.id === task.releaseId) : null
  const linkedDocumentIds = seamlessMockDb.documentLinks
    .filter((link) => link.entityType === 'task' && link.entityId === task.id)
    .map((link) => link.documentId)
  const linkedDocuments = seamlessMockDb.documents.filter((document) => linkedDocumentIds.includes(document.id))
  const linkedMeetings = seamlessMockDb.meetings.filter((meeting) => meeting.sourceContextType === 'task' && meeting.sourceContextId === task.id)
  const linkedPullRequests = getPullRequests(task)
  const relatedTaskComments = seamlessMockDb.taskComments
    .filter((comment) => comment.taskId === task.id)
    .sort((left, right) => dayjs(right.createdAt).valueOf() - dayjs(left.createdAt).valueOf())
  const tags = seamlessMockDb.taskTags.filter((tag) => tag.taskId === task.id).map((tag) => tag.value)
  const blockedGoals = task.epochId
    ? seamlessMockDb.goals.filter((goal) => goal.epochId === task.epochId && goal.status === 'blocked')
    : []

  const blockers: TaskBlocker[] = [
    ...blockedGoals.map((goal) => ({
      id: `goal-${goal.id}`,
      title: goal.title,
      description: `${goal.description} (${goal.progressPercent}% complete)`
    })),
    ...(task.dueDate && dayjs(task.dueDate).isBefore(dayjs('2026-04-02')) && task.status !== 'done'
      ? [
          {
            id: 'due-date-risk',
            title: 'Due date risk',
            description: `Task is past due for ${formatDate(task.dueDate)} and still needs delivery movement.`
          }
        ]
      : [])
  ]

  const activity: TaskActivityItem[] = [
    {
      id: `task-${task.id}`,
      type: 'task' as const,
      title: 'Task updated',
      description: `${task.key} is currently ${task.status}.`,
      actor: assignee ? `${assignee.firstName} ${assignee.lastName}` : 'System',
      timestamp: task.updatedAt
    },
    ...relatedTaskComments.map((comment) => {
      const author = seamlessMockDb.users.find((entry) => entry.id === comment.authorUserId)
      const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown author'

      return {
        id: `comment-${comment.id}`,
        type: 'comment' as const,
        title: 'Comment added',
        description: comment.content,
        actor: authorName,
        timestamp: comment.createdAt
      }
    }),
    ...linkedDocuments.map((document) => {
      const author = seamlessMockDb.users.find((entry) => entry.id === document.authorUserId)

      return {
        id: `doc-${document.id}`,
        type: 'doc' as const,
        title: document.title,
        description: `${document.status} document in ${document.accessScope} scope.`,
        actor: author ? `${author.firstName} ${author.lastName}` : 'Unknown author',
        timestamp: document.updatedAt
      }
    }),
    ...linkedMeetings.map((meeting) => ({
      id: `meeting-${meeting.id}`,
      type: 'meeting' as const,
      title: meeting.title,
      description: `${meeting.type} meeting is ${meeting.status}.`,
      actor: 'System',
      timestamp: meeting.updatedAt
    })),
    ...linkedPullRequests.map((pullRequest) => {
      const author = seamlessMockDb.users.find((entry) => entry.id === pullRequest.authorUserId)

      return {
        id: `pr-${pullRequest.id}`,
        type: 'pr' as const,
        title: `#${pullRequest.number} ${pullRequest.title}`,
        description: `${pullRequest.status} on ${pullRequest.branch}.`,
        actor: author ? `${author.firstName} ${author.lastName}` : 'Unknown author',
        timestamp: pullRequest.updatedAt
      }
    }),
    ...(release
      ? [
          {
            id: `release-${release.id}`,
            type: 'release' as const,
            title: `${release.version} ${release.title}`,
            description: `${release.status} release is attached to this task.`,
            actor: reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Release owner',
            timestamp: release.updatedAt
          }
        ]
      : [])
  ]
    .sort((left, right) => dayjs(right.timestamp).valueOf() - dayjs(left.timestamp).valueOf())
    .slice(0, 10)
    .map((item) => ({ ...item, timestamp: relativeTime(item.timestamp) }))

  const automationInsights: AutomationInsight[] = [
    ...(release && release.status !== 'deployed'
      ? [
          {
            id: 'release-link',
            tone: 'info' as const,
            message: `This task is already attached to ${release.version}, so status changes should stay aligned with release readiness.`
          }
        ]
      : []),
    ...(linkedDocuments.some((document) => document.status === 'in-review')
      ? [
          {
            id: 'docs-review',
            tone: 'info' as const,
            message: 'A linked document is still in review. Quote the approved section into the task thread before final sign-off.'
          }
        ]
      : []),
    ...(blockers.length > 0
      ? [
          {
            id: 'blocked-context',
            tone: 'warning' as const,
            message: `This task is affected by ${blockers.length} blocker${blockers.length === 1 ? '' : 's'} in the current sprint context.`
          }
        ]
      : [])
  ]

  return {
    id: task.id,
    key: task.key,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: formatDate(task.dueDate),
    createdDate: formatDate(task.createdDate),
    assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}` : null,
    assigneeInitials: assignee ? initials(`${assignee.firstName} ${assignee.lastName}`) : null,
    reporterName: reporter ? `${reporter.firstName} ${reporter.lastName}` : null,
    reporterInitials: reporter ? initials(`${reporter.firstName} ${reporter.lastName}`) : null,
    projectName: project.name,
    projectKey: project.key,
    epochName: epoch?.name ?? null,
    epochId: epoch?.id ?? null,
    tags,
    blockers,
    linkedDocuments: linkedDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      status: document.status,
      accessScope: document.accessScope,
      description: document.description,
      updatedAt: relativeTime(document.updatedAt)
    })),
    linkedMeetings: linkedMeetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      status: meeting.status,
      type: meeting.type,
      startsAt: meeting.startsAt ? dayjs(meeting.startsAt).format('MMM D, YYYY HH:mm') : null,
      summary: meeting.description ?? 'Meeting summary will be generated from transcript context.'
    })),
    linkedPullRequests: linkedPullRequests.map((pullRequest) => {
      const author = seamlessMockDb.users.find((entry) => entry.id === pullRequest.authorUserId)

      return {
        id: pullRequest.id,
        number: pullRequest.number,
        title: pullRequest.title,
        status: pullRequest.status,
        branch: pullRequest.branch,
        commitsCount: pullRequest.commitsCount,
        authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown author'
      }
    }),
    linkedRelease: release
      ? {
          id: release.id,
          version: release.version,
          title: release.title,
          status: release.status,
          targetDate: formatDate(release.targetDate),
          commitsCount: release.commitsCount
        }
      : null,
    comments: relatedTaskComments.map((comment) => {
      const author = seamlessMockDb.users.find((entry) => entry.id === comment.authorUserId)
      const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown author'

      return {
        id: comment.id,
        authorName,
        authorInitials: initials(authorName),
        content: comment.content,
        createdAt: relativeTime(comment.createdAt)
      }
    }),
    activity,
    automationInsights
  }
}

async function fetchTaskDetails(taskId: string) {
  return withMockLatency(getTaskDetails(taskId))
}

export async function changeTaskDetailsStatus(taskId: string, status: Task['status']) {
  return updateMockTaskStatus(taskId, status)
}

export async function addTaskComment(taskId: string, content: string) {
  return createMockTaskComment(taskId, 'user-1', content)
}

export const taskDetailsQueries = {
  byId: (taskId: string) =>
    queryOptions({
      queryKey: ['backbone', 'tasks', 'details', taskId],
      queryFn: () => fetchTaskDetails(taskId)
    })
}
