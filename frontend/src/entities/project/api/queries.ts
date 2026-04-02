import { queryOptions } from '@tanstack/react-query'

import type { ApiEntity, Epoch, Meeting, Project, ProjectMember, PullRequest, Release, Task } from '@/shared/api'
import { ProjectStatus, http, withBackendFallback } from '@/shared/api'
import { formatDateLabel } from '@/shared/api/seamlessBackend.ts'
import { getProjectOverview, listProjects } from '@/shared/mocks/seamless.ts'
import { adaptProjectOverviewViewModel } from './adapters.ts'

export const projectQueryKeys = {
  all: ['projects'] as const,
  detail: (projectId: string) => ['projects', projectId] as const
}

export const projectQueries = {
  list: () =>
    queryOptions({
      queryKey: projectQueryKeys.all,
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const { data: projects } = await http.get<Array<ApiEntity<Project>>>('/projects')

            return Promise.all(
              projects.map(async (project) => {
                const [membersResponse, tasksResponse, epochsResponse] = await Promise.all([
                  http.get<Array<ApiEntity<ProjectMember>>>(`/projects/${project.id}/members`),
                  http.get<Array<ApiEntity<Task>>>('/tasks', { params: { projectId: project.id } }),
                  http.get<Array<ApiEntity<Epoch>>>('/epochs', { params: { projectId: project.id } })
                ])

                const activeEpoch =
                  epochsResponse.data.find((epoch) => String(epoch.id) === String(project.activeEpochId ?? '')) ?? epochsResponse.data[0] ?? null

                return {
                  id: String(project.id),
                  key: project.key,
                  name: project.name,
                  description: project.description,
                  status: project.status as ProjectStatus,
                  progress: project.progressPercent,
                  teamSize: membersResponse.data.length,
                  tasksOpen: tasksResponse.data.filter((task) => String(task.status) !== 'done' && String(task.status) !== 'cancelled').length,
                  dueDate: project.dueDate ? formatDateLabel(String(project.dueDate)) : null,
                  epoch: activeEpoch?.name ?? null
                }
              })
            )
          },
          () => listProjects()
        )
    }),
  detail: (projectId: string) =>
    queryOptions({
      queryKey: projectQueryKeys.detail(projectId),
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const [projectResponse, tasksResponse, documentsResponse, meetingsResponse, releasesResponse, pullRequestsResponse, epochsResponse] = await Promise.all([
              http.get<ApiEntity<Project>>(`/projects/${projectId}`),
              http.get<Array<ApiEntity<Task>>>('/tasks', { params: { projectId } }),
              http.get<Array<ApiEntity<{ projectId: string; title: string; description: string; status: string; accessScope: string; authorUserId: string; currentVersionId?: string | null; awaitingApproval: boolean; isStarred: boolean; archivedAt?: string | null }>>>('/documents', { params: { projectId } }),
              http.get<Array<ApiEntity<Meeting>>>('/meetings', { params: { projectId } }),
              http.get<Array<ApiEntity<Release>>>('/releases', { params: { projectId } }),
              http.get<Array<ApiEntity<PullRequest>>>('/pull-requests', { params: { projectId } }),
              http.get<Array<ApiEntity<Epoch>>>('/epochs', { params: { projectId } })
            ])

            const project = projectResponse.data
            const releases = releasesResponse.data
            const activeEpoch =
              epochsResponse.data.find((epoch) => String(epoch.id) === String(project.activeEpochId ?? '')) ?? epochsResponse.data[0] ?? null
            const latestRelease = releases
              .slice()
              .sort((left, right) => String(right.targetDate ?? '').localeCompare(String(left.targetDate ?? '')))[0]

            return adaptProjectOverviewViewModel({
              id: String(project.id),
              name: project.name,
              status: project.status as ProjectStatus,
              visibilityMode: String(project.visibilityMode) === 'customer' ? 'customer' : 'internal',
              stats: {
                status: project.progressPercent >= 60 ? 'on-track' : project.progressPercent >= 35 ? 'at-risk' : 'delayed',
                completion: project.progressPercent,
                activeEpoch: activeEpoch ? { id: String(activeEpoch.id), name: activeEpoch.name } : null,
                upcomingMeetings: meetingsResponse.data.length,
                latestRelease: latestRelease
                  ? {
                      id: String(latestRelease.id),
                      version: latestRelease.version,
                      date: formatDateLabel(String(latestRelease.targetDate ?? latestRelease.deployedAt ?? null))
                    }
                  : null
              },
              entities: {
                docs: documentsResponse.data.length,
                tasks: tasksResponse.data.length,
                meetings: meetingsResponse.data.length,
                pullRequests: pullRequestsResponse.data.length,
                releases: releases.length
              }
            })
          },
          () => adaptProjectOverviewViewModel(getProjectOverview(projectId))
        )
    })
}
