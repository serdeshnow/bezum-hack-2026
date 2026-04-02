import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { createMockDocumentComment, seamlessMockDb, updateMockDocumentStatus, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'
import type { Document } from '@/shared/api/contracts/seamlessBackbone.ts'

type PersonChip = {
  id: string
  name: string
  initials: string
}

type ApproverChip = PersonChip & {
  approved: boolean
}

type LinkedTask = {
  id: string
  key: string
  title: string
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'cancelled'
}

type LinkedMeeting = {
  id: string
  title: string
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled'
}

type LinkedRelease = {
  id: string
  version: string
  title: string
  status: 'planned' | 'in-progress' | 'deployed' | 'failed' | 'rolled-back'
}

type LinkedPullRequest = {
  id: string
  number: number
  title: string
  status: 'open' | 'reviewing' | 'merged' | 'closed'
}

type DocumentCommentItem = {
  id: string
  authorName: string
  authorInitials: string
  content: string
  createdAt: string
  resolved: boolean
}

export type DocumentEditorData = {
  id: string
  title: string
  description: string
  versionLabel: string
  status: Document['status']
  accessScope: 'customer' | 'manager' | 'dev' | 'internal'
  contentMarkdown: string
  projectName: string
  projectKey: string
  linkedEpoch: { id: string; title: string } | null
  linkedTasks: LinkedTask[]
  linkedMeetings: LinkedMeeting[]
  linkedRelease: LinkedRelease | null
  linkedPullRequests: LinkedPullRequest[]
  owners: PersonChip[]
  approvers: ApproverChip[]
  comments: DocumentCommentItem[]
}

function initials(name: string) {
  return name
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

function getDocumentEditor(documentId: string): DocumentEditorData | null {
  const document = seamlessMockDb.documents.find((entry) => entry.id === documentId)

  if (!document) {
    return null
  }

  const project = seamlessMockDb.projects.find((entry) => entry.id === document.projectId)
  const currentVersion = seamlessMockDb.documentVersions.find((entry) => entry.id === document.currentVersionId)

  if (!project || !currentVersion) {
    return null
  }

  const links = seamlessMockDb.documentLinks.filter((entry) => entry.documentId === document.id)
  const linkedEpochRef = links.find((entry) => entry.entityType === 'epoch')
  const linkedEpoch = linkedEpochRef ? seamlessMockDb.epochs.find((entry) => entry.id === linkedEpochRef.entityId) : null
  const linkedTaskRefs = links.filter((entry) => entry.entityType === 'task')
  const linkedTasks = linkedTaskRefs
    .map((link) => seamlessMockDb.tasks.find((entry) => entry.id === link.entityId))
    .filter((task): task is NonNullable<typeof task> => task != null)
    .map((task) => ({ id: task.id, key: task.key, title: task.title, status: task.status }))
  const docMeetings = seamlessMockDb.meetings.filter((entry) => entry.sourceContextType === 'doc' && entry.sourceContextId === document.id)
  const linkedReleaseRef = links.find((entry) => entry.entityType === 'release')
  const linkedRelease = linkedReleaseRef ? seamlessMockDb.releases.find((entry) => entry.id === linkedReleaseRef.entityId) : null
  const linkedPullRequests =
    linkedRelease == null
      ? []
      : seamlessMockDb.pullRequests.filter((entry) => entry.releaseId === linkedRelease.id).map((pullRequest) => ({
          id: pullRequest.id,
          number: pullRequest.number,
          title: pullRequest.title,
          status: pullRequest.status
        }))

  const owners = seamlessMockDb.documentOwners
    .filter((entry) => entry.documentId === document.id)
    .map((owner) => seamlessMockDb.users.find((entry) => entry.id === owner.userId))
    .filter((user): user is NonNullable<typeof user> => user != null)
    .map((user) => ({ id: user.id, name: `${user.firstName} ${user.lastName}`, initials: initials(`${user.firstName} ${user.lastName}`) }))

  const approvers = seamlessMockDb.documentApprovers
    .filter((entry) => entry.documentId === document.id)
    .map((approver) => {
      const user = seamlessMockDb.users.find((entry) => entry.id === approver.userId)
      if (!user) return null
      const fullName = `${user.firstName} ${user.lastName}`
      return { id: user.id, name: fullName, initials: initials(fullName), approved: approver.approved }
    })
    .filter((entry): entry is ApproverChip => entry != null)

  const comments = seamlessMockDb.documentComments
    .filter((entry) => entry.documentId === document.id)
    .sort((left, right) => dayjs(right.createdAt).valueOf() - dayjs(left.createdAt).valueOf())
    .map((comment) => {
      const author = seamlessMockDb.users.find((entry) => entry.id === comment.authorUserId)
      const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown author'

      return {
        id: comment.id,
        authorName,
        authorInitials: initials(authorName),
        content: comment.content,
        createdAt: relativeTime(comment.createdAt),
        resolved: comment.resolved
      }
    })

  return {
    id: document.id,
    title: document.title,
    description: document.description,
    versionLabel: currentVersion.versionLabel,
    status: document.status,
    accessScope: document.accessScope,
    contentMarkdown: currentVersion.contentMarkdown,
    projectName: project.name,
    projectKey: project.key,
    linkedEpoch: linkedEpoch ? { id: linkedEpoch.id, title: linkedEpoch.name } : null,
    linkedTasks,
    linkedMeetings: docMeetings.map((meeting) => ({ id: meeting.id, title: meeting.title, status: meeting.status })),
    linkedRelease: linkedRelease
      ? {
          id: linkedRelease.id,
          version: linkedRelease.version,
          title: linkedRelease.title,
          status: linkedRelease.status
        }
      : null,
    linkedPullRequests,
    owners,
    approvers,
    comments
  }
}

async function fetchDocumentEditor(documentId: string) {
  return withMockLatency(getDocumentEditor(documentId))
}

export async function changeDocumentEditorStatus(documentId: string, status: Document['status']) {
  return updateMockDocumentStatus(documentId, status)
}

export async function addDocumentEditorComment(documentId: string, content: string) {
  return createMockDocumentComment(documentId, 'user-1', content)
}

export const documentEditorQueries = {
  byId: (documentId: string) =>
    queryOptions({
      queryKey: ['backbone', 'docs', 'editor', documentId],
      queryFn: () => fetchDocumentEditor(documentId)
    })
}
