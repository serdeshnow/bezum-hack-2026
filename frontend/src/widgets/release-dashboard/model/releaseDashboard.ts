import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { seamlessMockDb, updateMockPullRequestStatus, updateMockReleaseStatus, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'
import type { PullRequest, Release } from '@/shared/api/contracts/seamlessBackbone.ts'

type DeliverySummary = {
  id: string
  label: string
  value: number
  detail: string
}

export type DeliveryRelease = {
  id: string
  version: string
  title: string
  status: Release['status']
  projectKey: string
  projectName: string
  targetDate: string | null
  deployedAt: string | null
  commitsCount: number
  authorName: string
  updatedAtLabel: string
  readinessPercent: number
  linkedTasks: Array<{
    id: string
    key: string
    title: string
    status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'critical'
  }>
  linkedPullRequests: Array<{
    id: string
    number: number
    title: string
    status: PullRequest['status']
  }>
  linkedDocuments: Array<{
    id: string
    title: string
    status: 'draft' | 'in-review' | 'approved' | 'obsolete' | 'rejected'
  }>
  impactedEpochs: Array<{
    id: string
    title: string
    status: 'draft' | 'active' | 'at-risk' | 'archived' | 'completed'
  }>
  narrative: string
}

export type DeliveryPullRequest = {
  id: string
  number: number
  title: string
  status: PullRequest['status']
  branch: string
  commitsCount: number
  authorName: string
  projectKey: string
  projectName: string
  releaseId: string | null
  releaseVersion: string | null
  linkedTasks: Array<{
    id: string
    key: string
    title: string
    status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'cancelled'
  }>
  linkedDocumentCount: number
  updatedAtLabel: string
}

export type ReleaseDashboardData = {
  summary: DeliverySummary[]
  releases: DeliveryRelease[]
  pullRequests: DeliveryPullRequest[]
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

function resolveLinkedTasksForPullRequest(pullRequest: PullRequest) {
  return seamlessMockDb.tasks.filter(
    (task) =>
      task.projectId === pullRequest.projectId &&
      (task.releaseId === pullRequest.releaseId ||
        pullRequest.title.toLowerCase().includes(task.key.toLowerCase()) ||
        pullRequest.branch.toLowerCase().includes(task.key.toLowerCase()))
  )
}

function buildReleaseReadiness(releaseId: string) {
  const linkedTasks = seamlessMockDb.tasks.filter((task) => task.releaseId === releaseId)
  const linkedPullRequests = seamlessMockDb.pullRequests.filter((pullRequest) => pullRequest.releaseId === releaseId)
  const linkedDocuments = seamlessMockDb.documents.filter((document) =>
    seamlessMockDb.documentLinks.some((link) => link.documentId === document.id && link.entityType === 'release' && link.entityId === releaseId)
  )

  const taskCompletion = linkedTasks.length === 0 ? 0 : Math.round((linkedTasks.filter((task) => task.status === 'done' || task.status === 'review').length / linkedTasks.length) * 100)
  const prCompletion = linkedPullRequests.length === 0 ? 0 : Math.round((linkedPullRequests.filter((pullRequest) => pullRequest.status === 'merged').length / linkedPullRequests.length) * 100)
  const docsCompletion = linkedDocuments.length === 0 ? 100 : Math.round((linkedDocuments.filter((document) => document.status === 'approved').length / linkedDocuments.length) * 100)

  return Math.round((taskCompletion + prCompletion + docsCompletion) / 3)
}

function buildReleaseNarrative(release: Release, readinessPercent: number, linkedTasksCount: number, linkedDocsCount: number) {
  if (release.status === 'deployed') {
    return `Release shipped with ${linkedTasksCount} linked task${linkedTasksCount === 1 ? '' : 's'} and ${linkedDocsCount} delivery document${linkedDocsCount === 1 ? '' : 's'} in trace.`
  }

  if (release.status === 'failed' || release.status === 'rolled-back') {
    return `Release needs recovery attention. Delivery context should be rechecked across PRs, tasks, and linked documents.`
  }

  return `Release is ${readinessPercent}% ready based on linked tasks, PR merge state, and documentation approvals.`
}

function buildRelease(release: Release): DeliveryRelease | null {
  const project = seamlessMockDb.projects.find((entry) => entry.id === release.projectId)
  const author = seamlessMockDb.users.find((entry) => entry.id === release.authorUserId)

  if (!project || !author) {
    return null
  }

  const linkedTasks = seamlessMockDb.tasks.filter((task) => task.releaseId === release.id)
  const linkedPullRequests = seamlessMockDb.pullRequests.filter((pullRequest) => pullRequest.releaseId === release.id)
  const linkedDocuments = seamlessMockDb.documents.filter((document) =>
    seamlessMockDb.documentLinks.some((link) => link.documentId === document.id && link.entityType === 'release' && link.entityId === release.id)
  )
  const impactedEpochs = seamlessMockDb.epochs.filter((epoch) => linkedTasks.some((task) => task.epochId === epoch.id))
  const readinessPercent = buildReleaseReadiness(release.id)

  return {
    id: release.id,
    version: release.version,
    title: release.title,
    status: release.status,
    projectKey: project.key,
    projectName: project.name,
    targetDate: release.targetDate ? dayjs(release.targetDate).format('MMM D, YYYY') : null,
    deployedAt: release.deployedAt ? dayjs(release.deployedAt).format('MMM D, YYYY HH:mm') : null,
    commitsCount: release.commitsCount,
    authorName: `${author.firstName} ${author.lastName}`,
    updatedAtLabel: relativeTime(release.updatedAt),
    readinessPercent,
    linkedTasks: linkedTasks.map((task) => ({
      id: task.id,
      key: task.key,
      title: task.title,
      status: task.status,
      priority: task.priority
    })),
    linkedPullRequests: linkedPullRequests.map((pullRequest) => ({
      id: pullRequest.id,
      number: pullRequest.number,
      title: pullRequest.title,
      status: pullRequest.status
    })),
    linkedDocuments: linkedDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      status: document.status
    })),
    impactedEpochs: impactedEpochs.map((epoch) => ({
      id: epoch.id,
      title: epoch.name,
      status: epoch.status as DeliveryRelease['impactedEpochs'][number]['status']
    })),
    narrative: buildReleaseNarrative(release, readinessPercent, linkedTasks.length, linkedDocuments.length)
  }
}

function buildPullRequest(pullRequest: PullRequest): DeliveryPullRequest | null {
  const project = seamlessMockDb.projects.find((entry) => entry.id === pullRequest.projectId)
  const author = seamlessMockDb.users.find((entry) => entry.id === pullRequest.authorUserId)

  if (!project || !author) {
    return null
  }

  const linkedTasks = resolveLinkedTasksForPullRequest(pullRequest)
  const linkedDocumentIds = new Set(
    linkedTasks.flatMap((task) =>
      seamlessMockDb.documentLinks.filter((link) => link.entityType === 'task' && link.entityId === task.id).map((link) => link.documentId)
    )
  )
  const release = pullRequest.releaseId ? seamlessMockDb.releases.find((entry) => entry.id === pullRequest.releaseId) : null

  return {
    id: pullRequest.id,
    number: pullRequest.number,
    title: pullRequest.title,
    status: pullRequest.status,
    branch: pullRequest.branch,
    commitsCount: pullRequest.commitsCount,
    authorName: `${author.firstName} ${author.lastName}`,
    projectKey: project.key,
    projectName: project.name,
    releaseId: release?.id ?? null,
    releaseVersion: release?.version ?? null,
    linkedTasks: linkedTasks.map((task) => ({
      id: task.id,
      key: task.key,
      title: task.title,
      status: task.status
    })),
    linkedDocumentCount: linkedDocumentIds.size,
    updatedAtLabel: relativeTime(pullRequest.updatedAt)
  }
}

function buildReleaseDashboardData(): ReleaseDashboardData {
  const releases = seamlessMockDb.releases
    .map(buildRelease)
    .filter((release): release is DeliveryRelease => release !== null)
    .sort((left, right) => right.version.localeCompare(left.version))

  const pullRequests = seamlessMockDb.pullRequests
    .map(buildPullRequest)
    .filter((pullRequest): pullRequest is DeliveryPullRequest => pullRequest !== null)
    .sort((left, right) => right.number - left.number)

  return {
    summary: [
      {
        id: 'releases',
        label: 'Releases',
        value: releases.length,
        detail: 'Tracked delivery packages across active and archived projects'
      },
      {
        id: 'in-flight',
        label: 'In Flight',
        value: releases.filter((release) => release.status === 'planned' || release.status === 'in-progress').length,
        detail: 'Releases still moving toward deployment'
      },
      {
        id: 'reviewing-prs',
        label: 'Reviewing PRs',
        value: pullRequests.filter((pullRequest) => pullRequest.status === 'reviewing').length,
        detail: 'PRs waiting on code review before they strengthen release readiness'
      },
      {
        id: 'merged-prs',
        label: 'Merged PRs',
        value: pullRequests.filter((pullRequest) => pullRequest.status === 'merged').length,
        detail: 'Merged code changes already reflected in the delivery graph'
      }
    ],
    releases,
    pullRequests
  }
}

async function fetchReleaseDashboardData() {
  return withMockLatency(buildReleaseDashboardData())
}

export async function changeReleaseStatus(releaseId: string, status: Release['status']) {
  return updateMockReleaseStatus(releaseId, status)
}

export async function changePullRequestStatus(pullRequestId: string, status: PullRequest['status']) {
  return updateMockPullRequestStatus(pullRequestId, status)
}

export const releaseDashboardQueries = {
  dashboard: () =>
    queryOptions({
      queryKey: ['backbone', 'delivery', 'dashboard'],
      queryFn: fetchReleaseDashboardData
    })
}
