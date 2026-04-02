import { queryOptions } from '@tanstack/react-query'

import type { ApiEntity, PullRequest, Release, Task } from '@/shared/api'
import { http, withBackendFallback } from '@/shared/api'
import { appConfig } from '@/shared/config'
import { getReleaseDashboard } from '@/shared/mocks/seamless.ts'
import { buildUserSummary, fetchUsersMap, formatDateLabel } from '@/shared/api/seamlessBackend.ts'
import { adaptReleaseDashboardViewModel, type ReleaseDashboardViewModel } from './adapters.ts'

export const releaseQueryKeys = {
  dashboard: ['releases'] as const
}

export const releaseQueries = {
  dashboard: () =>
    queryOptions<ReleaseDashboardViewModel>({
      queryKey: releaseQueryKeys.dashboard,
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const usersMap = await fetchUsersMap()
            const [releasesResponse, pullRequestsResponse, tasksResponse] = await Promise.all([
              http.get<Array<ApiEntity<Release>>>('/releases', { params: { projectId: appConfig.defaultProjectId } }),
              http.get<Array<ApiEntity<PullRequest>>>('/pull-requests', { params: { projectId: appConfig.defaultProjectId } }),
              http.get<Array<ApiEntity<Task>>>('/tasks', { params: { projectId: appConfig.defaultProjectId } })
            ])

            return adaptReleaseDashboardViewModel({
              releases: releasesResponse.data.map((release) => ({
                id: String(release.id),
                version: release.version,
                title: release.title,
                date: formatDateLabel(String(release.targetDate ?? release.deployedAt ?? null)),
                status: release.status as any,
                commits: release.commitsCount,
                author: buildUserSummary(usersMap.get(String(release.authorUserId))),
                changes: { features: 0, fixes: 0, breaking: 0 },
                linkedTaskIds: tasksResponse.data.filter((task) => String(task.releaseId ?? '') === String(release.id)).map((task) => String(task.id)),
                linkedPullRequestIds: pullRequestsResponse.data.filter((pr) => String(pr.releaseId ?? '') === String(release.id)).map((pr) => String(pr.id)),
                epoch: null
              })),
              pullRequests: pullRequestsResponse.data.map((pr) => ({
                id: String(pr.id),
                title: pr.title,
                number: pr.number,
                status: pr.status as any,
                author: buildUserSummary(usersMap.get(String(pr.authorUserId))),
                branch: pr.branch,
                commits: pr.commitsCount,
                date: pr.mergedAt ? formatDateLabel(String(pr.mergedAt)) : 'recently',
                linkedTaskIds: tasksResponse.data.filter((task) => String(task.releaseId ?? '') === String(pr.releaseId ?? '')).map((task) => String(task.id)),
                releaseId: pr.releaseId ? String(pr.releaseId) : null,
                epoch: null
              }))
            })
          },
          () => adaptReleaseDashboardViewModel(getReleaseDashboard())
        )
    })
}
