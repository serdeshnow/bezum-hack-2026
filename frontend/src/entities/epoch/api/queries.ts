import { queryOptions } from '@tanstack/react-query'

import type { ApiEntity, Document, DocumentLink, Epoch, Goal, Meeting, Release } from '@/shared/api'
import { GoalStatus, MeetingType, ProjectStatus, http, withBackendFallback } from '@/shared/api'
import { buildUserSummary, fetchUsersMap, formatDateLabel } from '@/shared/api/seamlessBackend.ts'
import { getEpochWorkspace, listEpochs } from '@/shared/mocks/seamless.ts'
import { adaptEpochSummary, adaptEpochWorkspaceViewModel } from './adapters.ts'

export const epochQueryKeys = {
  all: ['epochs'] as const,
  detail: (epochId: string) => ['epochs', epochId] as const
}

export const epochQueries = {
  list: () =>
    queryOptions({
      queryKey: epochQueryKeys.all,
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const { data: epochs } = await http.get<Array<ApiEntity<Epoch>>>('/epochs')

            const summaries = await Promise.all(
              epochs.map(async (epoch) => {
                const [tasksResponse, goalsResponse, meetingsResponse] = await Promise.all([
                  http.get<Array<ApiEntity<{ status: string }>>>('/tasks', { params: { epochId: epoch.id } }),
                  http.get<Array<ApiEntity<Goal>>>('/goals', { params: { epochId: epoch.id } }),
                  http.get<Array<ApiEntity<Meeting>>>('/meetings', { params: { epochId: epoch.id } })
                ])

                return adaptEpochSummary({
                  id: String(epoch.id),
                  projectId: String(epoch.projectId),
                  name: epoch.name,
                  status: epoch.status as ProjectStatus,
                  startDate: String(epoch.startDate),
                  endDate: String(epoch.endDate),
                  goals: goalsResponse.data.map((goal) => ({
                    id: String(goal.id),
                    title: goal.title,
                    description: goal.description,
                    status: goal.status as GoalStatus,
                    progress: goal.progressPercent,
                    owner: buildUserSummary()
                  })),
                  taskStats: {
                    total: tasksResponse.data.length,
                    completed: tasksResponse.data.filter((task) => String(task.status) === 'done').length,
                    inProgress: tasksResponse.data.filter((task) => String(task.status) === 'in-progress').length,
                    blocked: tasksResponse.data.filter((task) => String(task.status) === 'cancelled').length,
                    backlog: tasksResponse.data.filter((task) => String(task.status) === 'backlog').length
                  },
                  documents: [],
                  meetings: meetingsResponse.data.map((meeting) => ({
                    id: String(meeting.id),
                    title: meeting.title,
                    date: formatDateLabel(String(meeting.startsAt ?? null)),
                    time: formatDateLabel(String(meeting.startsAt ?? null)),
                    attendees: 0,
                    type: meeting.type as MeetingType
                  })),
                  releaseReadiness: {
                    version: 'Unassigned',
                    targetDate: 'TBD',
                    status: 'on-track',
                    checklist: []
                  }
                })
              })
            )

            return summaries
          },
          () => listEpochs().map(adaptEpochSummary)
        )
    }),
  detail: (epochId: string) =>
    queryOptions({
      queryKey: epochQueryKeys.detail(epochId),
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const usersMap = await fetchUsersMap()
            const { data: epoch } = await http.get<ApiEntity<Epoch>>(`/epochs/${epochId}`)
            const [goalsResponse, tasksResponse, meetingsResponse, releasesResponse, documentsResponse] = await Promise.all([
              http.get<Array<ApiEntity<Goal>>>('/goals', { params: { epochId } }),
              http.get<Array<ApiEntity<{ status: string }>>>('/tasks', { params: { epochId } }),
              http.get<Array<ApiEntity<Meeting>>>('/meetings', { params: { epochId } }),
              http.get<Array<ApiEntity<Release>>>('/releases', { params: { projectId: epoch.projectId } }),
              http.get<Array<ApiEntity<Document>>>('/documents', { params: { projectId: epoch.projectId } })
            ])

            const linkedDocuments = await Promise.all(
              documentsResponse.data.map(async (document) => {
                const { data: links } = await http.get<Array<ApiEntity<DocumentLink>>>(`/documents/${document.id}/links`)
                return {
                  document,
                  links
                }
              })
            )

            const epochDocuments = linkedDocuments
              .filter(({ links }) => links.some((link) => String(link.entityType) === 'epoch' && String(link.entityId) === epochId))
              .map(({ document }) => ({
                id: String(document.id),
                title: document.title,
                type: 'document',
                lastUpdated: 'recently',
                author: buildUserSummary(usersMap.get(String(document.authorUserId))).name
              }))

            const release = releasesResponse.data[0]

            return adaptEpochWorkspaceViewModel({
              id: String(epoch.id),
              projectId: String(epoch.projectId),
              name: epoch.name,
              status: epoch.status as ProjectStatus,
              startDate: String(epoch.startDate),
              endDate: String(epoch.endDate),
              goals: goalsResponse.data.map((goal) => ({
                id: String(goal.id),
                title: goal.title,
                description: goal.description,
                status: goal.status as GoalStatus,
                progress: goal.progressPercent,
                owner: buildUserSummary(usersMap.get(String(goal.ownerUserId)))
              })),
              taskStats: {
                total: tasksResponse.data.length,
                completed: tasksResponse.data.filter((task) => String(task.status) === 'done').length,
                inProgress: tasksResponse.data.filter((task) => String(task.status) === 'in-progress').length,
                blocked: tasksResponse.data.filter((task) => String(task.status) === 'cancelled').length,
                backlog: tasksResponse.data.filter((task) => String(task.status) === 'backlog').length
              },
              documents: epochDocuments,
              meetings: meetingsResponse.data.map((meeting) => ({
                id: String(meeting.id),
                title: meeting.title,
                date: formatDateLabel(String(meeting.startsAt ?? null)),
                time: formatDateLabel(String(meeting.startsAt ?? null)),
                attendees: 0,
                type: meeting.type as MeetingType
              })),
              releaseReadiness: {
                version: release?.version ?? 'Unassigned',
                targetDate: formatDateLabel(String(release?.targetDate ?? null)),
                status: release && String(release.status) !== 'failed' ? 'on-track' : 'at-risk',
                checklist: [
                  { id: 'tasks', item: 'Epoch tasks aligned', completed: tasksResponse.data.length > 0 },
                  { id: 'docs', item: 'Epoch docs linked', completed: epochDocuments.length > 0 },
                  { id: 'meetings', item: 'Epoch meetings scheduled', completed: meetingsResponse.data.length > 0 }
                ]
              }
            })
          },
          () => adaptEpochWorkspaceViewModel(getEpochWorkspace(epochId))
        )
    })
}
