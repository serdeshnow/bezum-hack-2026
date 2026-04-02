import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { seamlessMockDb, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'

type DocsSummary = {
  id: string
  label: string
  value: number
  detail: string
}

export type DocsFolderItem = {
  id: string
  name: string
  projectKey: string
  count: number
}

export type DocsHubDocument = {
  id: string
  title: string
  description: string
  status: 'draft' | 'in-review' | 'approved' | 'obsolete' | 'rejected'
  accessScope: 'customer' | 'manager' | 'dev' | 'internal'
  authorName: string
  updatedAt: string
  awaitingApproval: boolean
  isStarred: boolean
  folderId: string | null
  projectId: string
  projectKey: string
  linkedCounts: {
    epochs: number
    tasks: number
    meetings: number
    releases: number
    projects: number
  }
}

export type DocsHubData = {
  summary: DocsSummary[]
  folders: DocsFolderItem[]
  documents: DocsHubDocument[]
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

function buildDocsHubData(): DocsHubData {
  const documents = seamlessMockDb.documents
    .map((document) => {
      const project = seamlessMockDb.projects.find((entry) => entry.id === document.projectId)
      const author = seamlessMockDb.users.find((entry) => entry.id === document.authorUserId)
      const directLinks = seamlessMockDb.documentLinks.filter((link) => link.documentId === document.id)
      const meetingLinks = seamlessMockDb.meetings.filter((meeting) => meeting.sourceContextType === 'doc' && meeting.sourceContextId === document.id)

      return {
        id: document.id,
        title: document.title,
        description: document.description,
        status: document.status,
        accessScope: document.accessScope,
        authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown author',
        updatedAt: relativeTime(document.updatedAt),
        awaitingApproval: document.awaitingApproval,
        isStarred: document.isStarred,
        folderId: document.folderId,
        projectId: document.projectId,
        projectKey: project?.key ?? 'N/A',
        linkedCounts: {
          epochs: directLinks.filter((link) => link.entityType === 'epoch').length,
          tasks: directLinks.filter((link) => link.entityType === 'task').length,
          meetings: directLinks.filter((link) => link.entityType === 'meeting').length + meetingLinks.length,
          releases: directLinks.filter((link) => link.entityType === 'release').length,
          projects: directLinks.filter((link) => link.entityType === 'project').length
        }
      }
    })
    .sort((left, right) => left.title.localeCompare(right.title))

  const folders: DocsFolderItem[] = [
    {
      id: 'all',
      name: 'All Documents',
      projectKey: 'ALL',
      count: documents.length
    },
    ...seamlessMockDb.documentFolders
      .map((folder) => {
        const project = seamlessMockDb.projects.find((entry) => entry.id === folder.projectId)
        const count = documents.filter((document) => document.folderId === folder.id).length

        return {
          id: folder.id,
          name: folder.name,
          projectKey: project?.key ?? 'N/A',
          count
        }
      })
      .sort((left, right) => left.name.localeCompare(right.name))
  ]

  return {
    summary: [
      {
        id: 'documents',
        label: 'Documents',
        value: documents.length,
        detail: 'Total docs in the shared product graph'
      },
      {
        id: 'approvals',
        label: 'Awaiting Approval',
        value: documents.filter((document) => document.awaitingApproval).length,
        detail: 'Need reviewer attention before release or customer visibility'
      },
      {
        id: 'customer',
        label: 'Customer Visible',
        value: documents.filter((document) => document.accessScope === 'customer').length,
        detail: 'Safe to expose in customer-facing mode'
      },
      {
        id: 'starred',
        label: 'Starred Docs',
        value: documents.filter((document) => document.isStarred).length,
        detail: 'High-signal documents pinned for quick access'
      }
    ],
    folders,
    documents
  }
}

async function fetchDocsHubData() {
  return withMockLatency(buildDocsHubData())
}

export const docsHubQueries = {
  list: () =>
    queryOptions({
      queryKey: ['backbone', 'docs', 'hub'],
      queryFn: fetchDocsHubData
    })
}
