import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { seamlessMockDb, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'

type VersionApproval = {
  approverName: string
  approverInitials: string
  status: 'pending' | 'approved' | 'rejected' | 'requested-changes'
  rationale: string | null
  decidedAt: string | null
}

export type HistoryVersion = {
  id: string
  versionLabel: string
  createdAt: string
  authorName: string
  authorInitials: string
  changeSource: 'manual' | 'meeting' | 'task' | 'imported'
  sourceDetail: string | null
  additions: number
  deletions: number
  modifications: number
  status: 'draft' | 'in-review' | 'approved' | 'obsolete' | 'rejected' | 'pending-approval'
  approvals: VersionApproval[]
}

type DecisionLogItem = {
  id: string
  versionLabel: string
  approverName: string
  approverInitials: string
  decision: 'pending' | 'approved' | 'rejected' | 'requested-changes'
  rationale: string | null
  decidedAt: string | null
}

export type DocumentHistoryData = {
  documentId: string
  title: string
  currentVersionId: string
  versions: HistoryVersion[]
  diff: {
    beforeVersionLabel: string | null
    afterVersionLabel: string
    beforeContent: string
    afterContent: string
  }
  decisions: DecisionLogItem[]
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

function getDocumentHistory(documentId: string): DocumentHistoryData | null {
  const document = seamlessMockDb.documents.find((entry) => entry.id === documentId)
  if (!document || !document.currentVersionId) {
    return null
  }

  const versions = seamlessMockDb.documentVersions
    .filter((entry) => entry.documentId === documentId)
    .sort((left, right) => dayjs(right.createdAt).valueOf() - dayjs(left.createdAt).valueOf())
    .map((version) => {
      const author = seamlessMockDb.users.find((entry) => entry.id === version.authorUserId)
      const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown author'
      const approvals = seamlessMockDb.documentApprovals
        .filter((entry) => entry.documentVersionId === version.id)
        .map((approval) => {
          const approver = seamlessMockDb.users.find((entry) => entry.id === approval.approverUserId)
          const approverName = approver ? `${approver.firstName} ${approver.lastName}` : 'Unknown approver'

          return {
            approverName,
            approverInitials: initials(approverName),
            status: approval.status,
            rationale: approval.rationale,
            decidedAt: approval.decidedAt ? relativeTime(approval.decidedAt) : null
          }
        })

      return {
        id: version.id,
        versionLabel: version.versionLabel,
        createdAt: relativeTime(version.createdAt),
        authorName,
        authorInitials: initials(authorName),
        changeSource: version.changeSource as HistoryVersion['changeSource'],
        sourceDetail: version.sourceDetail,
        additions: version.additions,
        deletions: version.deletions,
        modifications: version.modifications,
        status: version.status as HistoryVersion['status'],
        approvals
      }
    })

  const currentIndex = versions.findIndex((version) => version.id === document.currentVersionId)
  const currentVersion = seamlessMockDb.documentVersions.find((entry) => entry.id === document.currentVersionId)
  const previousVersion = currentIndex >= 0 ? seamlessMockDb.documentVersions.find((entry) => entry.id === versions[currentIndex + 1]?.id) ?? null : null

  if (!currentVersion) {
    return null
  }

  const decisions = seamlessMockDb.documentApprovals
    .filter((entry) => seamlessMockDb.documentVersions.some((version) => version.id === entry.documentVersionId && version.documentId === documentId))
    .sort((left, right) => dayjs(right.updatedAt).valueOf() - dayjs(left.updatedAt).valueOf())
    .map((approval) => {
      const approver = seamlessMockDb.users.find((entry) => entry.id === approval.approverUserId)
      const version = seamlessMockDb.documentVersions.find((entry) => entry.id === approval.documentVersionId)
      const approverName = approver ? `${approver.firstName} ${approver.lastName}` : 'Unknown approver'

      return {
        id: approval.id,
        versionLabel: version?.versionLabel ?? 'unknown',
        approverName,
        approverInitials: initials(approverName),
        decision: approval.decision ?? approval.status,
        rationale: approval.rationale,
        decidedAt: approval.decidedAt ? relativeTime(approval.decidedAt) : null
      }
    })

  return {
    documentId,
    title: document.title,
    currentVersionId: currentVersion.id,
    versions,
    diff: {
      beforeVersionLabel: previousVersion?.versionLabel ?? null,
      afterVersionLabel: currentVersion.versionLabel,
      beforeContent: previousVersion?.contentMarkdown ?? '',
      afterContent: currentVersion.contentMarkdown
    },
    decisions
  }
}

async function fetchDocumentHistory(documentId: string) {
  return withMockLatency(getDocumentHistory(documentId))
}

export const documentHistoryQueries = {
  byId: (documentId: string) =>
    queryOptions({
      queryKey: ['backbone', 'docs', 'history', documentId],
      queryFn: () => fetchDocumentHistory(documentId)
    })
}
