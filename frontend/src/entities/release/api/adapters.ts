import { PullRequestStatus, ReleaseStatus } from '@/shared/api'
import type { ReleaseDashboardData } from '@/shared/mocks/seamless.ts'

export type ReleaseDashboardViewModel = Omit<ReleaseDashboardData, 'releases' | 'pullRequests'> & {
  summary: {
    releaseCount: number
    pullRequestCount: number
    openPullRequests: number
    reviewingPullRequests: number
    mergedPullRequests: number
  }
  releases: Array<
    ReleaseDashboardData['releases'][number] & {
      linkedTaskCount: number
      linkedPullRequestCount: number
      readinessLabel: string
      readinessTone: 'default' | 'secondary' | 'destructive'
    }
  >
  pullRequests: Array<
    ReleaseDashboardData['pullRequests'][number] & {
      linkedTaskCount: number
      statusLabel: string
      statusTone: 'default' | 'secondary' | 'destructive'
      syncLabel: string
    }
  >
}

function mapPullRequestStatus(status: PullRequestStatus) {
  switch (status) {
    case PullRequestStatus.Merged:
      return {
        statusLabel: 'Merged',
        statusTone: 'secondary' as const,
        syncLabel: 'Safe to project into release readiness'
      }
    case PullRequestStatus.Reviewing:
      return {
        statusLabel: 'In review',
        statusTone: 'default' as const,
        syncLabel: 'Awaiting reviewer approval before task can advance'
      }
    case PullRequestStatus.Closed:
      return {
        statusLabel: 'Closed',
        statusTone: 'destructive' as const,
        syncLabel: 'Delivery signal regressed and needs follow-up'
      }
    case PullRequestStatus.Open:
    default:
      return {
        statusLabel: 'Open',
        statusTone: 'default' as const,
        syncLabel: 'Implementation is active but not yet review-ready'
      }
  }
}

function mapReleaseReadiness(status: ReleaseStatus) {
  switch (status) {
    case ReleaseStatus.Deployed:
      return {
        readinessLabel: 'Ready to ship',
        readinessTone: 'secondary' as const
      }
    case ReleaseStatus.Failed:
    case ReleaseStatus.RolledBack:
      return {
        readinessLabel: 'Blocked by unresolved delivery work',
        readinessTone: 'destructive' as const
      }
    case ReleaseStatus.Planned:
    case ReleaseStatus.InProgress:
    default:
      return {
        readinessLabel: 'In progress',
        readinessTone: 'default' as const
      }
  }
}

export function adaptReleaseDashboardViewModel(data: ReleaseDashboardData): ReleaseDashboardViewModel {
  const releases = data.releases.map((release) => ({
    ...release,
    linkedTaskCount: release.linkedTaskIds?.length ?? 0,
    linkedPullRequestCount: release.linkedPullRequestIds?.length ?? 0,
    ...mapReleaseReadiness(release.status)
  }))

  const pullRequests = data.pullRequests.map((pr) => ({
    ...pr,
    linkedTaskCount: pr.linkedTaskIds?.length ?? 0,
    ...mapPullRequestStatus(pr.status)
  }))

  return {
    ...data,
    releases,
    pullRequests,
    summary: {
      releaseCount: data.releases.length,
      pullRequestCount: data.pullRequests.length,
      openPullRequests: data.pullRequests.filter((pr) => pr.status === PullRequestStatus.Open).length,
      reviewingPullRequests: data.pullRequests.filter((pr) => pr.status === PullRequestStatus.Reviewing).length,
      mergedPullRequests: data.pullRequests.filter((pr) => pr.status === PullRequestStatus.Merged).length
    }
  }
}
