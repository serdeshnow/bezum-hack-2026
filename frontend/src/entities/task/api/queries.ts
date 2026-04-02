import { queryOptions } from '@tanstack/react-query'

import type { ApiEntity, Document, DocumentLink, Meeting, PullRequest, Release, Task, TaskComment, TaskTag } from '@/shared/api'
import { ReleaseStatus, TaskPriority, TaskStatus, http, withBackendFallback } from '@/shared/api'
import { appConfig } from '@/shared/config'
import { buildUserSummary, fetchUsersMap, formatDateLabel } from '@/shared/api/seamlessBackend.ts'
import { getTaskDetails, listTasks } from '@/shared/mocks/seamless.ts'
import { adaptTaskCardViewModel, adaptTaskDetailsViewModel } from './adapters.ts'

export const taskQueryKeys = {
  all: ['tasks'] as const,
  detail: (taskId: string) => ['tasks', taskId] as const
}

export const taskQueries = {
  list: () =>
    queryOptions({
      queryKey: taskQueryKeys.all,
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const usersMap = await fetchUsersMap()
            const [tasksResponse, epochsResponse] = await Promise.all([
              http.get<Array<ApiEntity<Task>>>('/tasks', { params: { projectId: appConfig.defaultProjectId } }),
              http.get<Array<ApiEntity<{ id: string; name: string }>>>('/epochs', { params: { projectId: appConfig.defaultProjectId } })
            ])

            const epochMap = new Map(epochsResponse.data.map((epoch) => [String(epoch.id), epoch]))

            const tasks = await Promise.all(
              tasksResponse.data.map(async (task) => {
                const { data: tags } = await http.get<Array<ApiEntity<TaskTag>>>(`/tasks/${task.id}/tags`)

                return adaptTaskCardViewModel({
                  id: String(task.id),
                  key: task.key,
                  title: task.title,
                  description: task.description,
                  status: task.status as TaskStatus,
                  priority: task.priority as TaskPriority,
                  assignee: buildUserSummary(usersMap.get(String(task.assigneeUserId ?? ''))),
                  dueDate: task.dueDate ? formatDateLabel(String(task.dueDate)) : null,
                  tags: tags.map((tag) => tag.value),
                  epoch: task.epochId ? { id: String(task.epochId), title: epochMap.get(String(task.epochId))?.name ?? String(task.epochId) } : null
                })
              })
            )

            return tasks
          },
          () => listTasks().map(adaptTaskCardViewModel)
        )
    }),
  detail: (taskId: string) =>
    queryOptions({
      queryKey: taskQueryKeys.detail(taskId),
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const usersMap = await fetchUsersMap()
            const { data: task } = await http.get<ApiEntity<Task>>(`/tasks/${taskId}`)
            const [tagsResponse, commentsResponse, meetingsResponse, documentsResponse, pullRequestsResponse, epochResponse, releaseResponse] = await Promise.all([
              http.get<Array<ApiEntity<TaskTag>>>(`/tasks/${taskId}/tags`),
              http.get<Array<ApiEntity<TaskComment>>>(`/tasks/${taskId}/comments`),
              http.get<Array<ApiEntity<Meeting>>>('/meetings', { params: { projectId: task.projectId } }),
              http.get<Array<ApiEntity<Document>>>('/documents', { params: { projectId: task.projectId } }),
              task.releaseId
                ? http.get<Array<ApiEntity<PullRequest>>>('/pull-requests', { params: { releaseId: task.releaseId } })
                : Promise.resolve({ data: [] as Array<ApiEntity<PullRequest>> }),
              task.epochId
                ? http.get<ApiEntity<{ name: string }>>(`/epochs/${task.epochId}`)
                : Promise.resolve({ data: null as ApiEntity<{ name: string }> | null }),
              task.releaseId
                ? http.get<ApiEntity<Release>>(`/releases/${task.releaseId}`)
                : Promise.resolve({ data: null as ApiEntity<Release> | null })
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

            const docsForTask = linkedDocuments
              .filter(({ links }) => links.some((link) => String(link.entityType) === 'task' && String(link.entityId) === taskId))
              .map(({ document }) => ({
                id: String(document.id),
                title: document.title,
                preview: document.description,
                quotes: [],
                lastUpdated: 'recently'
              }))

            const meetingsForTask = meetingsResponse.data
              .filter((meeting) => String(meeting.sourceContextId ?? '') === taskId)
              .map((meeting) => ({
                id: String(meeting.id),
                title: meeting.title,
                date: formatDateLabel(String(meeting.startsAt ?? null)),
                summary: meeting.description ?? 'Linked meeting context',
                hasRecording: Boolean(meeting.recordingUrl),
                attendees: 0,
                keyPoints: []
              }))

            return adaptTaskDetailsViewModel({
              id: String(task.id),
              key: task.key,
              title: task.title,
              description: task.description,
              status: task.status as TaskStatus,
              priority: task.priority as TaskPriority,
              assignee: task.assigneeUserId ? buildUserSummary(usersMap.get(String(task.assigneeUserId))) : null,
              dueDate: task.dueDate ? formatDateLabel(String(task.dueDate)) : null,
              tags: tagsResponse.data.map((tag) => tag.value),
              reporter: task.reporterUserId ? buildUserSummary(usersMap.get(String(task.reporterUserId))) : null,
              createdDate: task.createdDate ? formatDateLabel(String(task.createdDate)) : null,
              epoch: task.epochId && epochResponse.data ? { id: String(task.epochId), title: epochResponse.data.name } : null,
              linkedDocs: docsForTask,
              linkedMeetings: meetingsForTask,
              linkedPRs: pullRequestsResponse.data.map((pr) => ({
                id: String(pr.id),
                number: pr.number,
                title: pr.title,
                status: pr.status as any,
                branch: pr.branch,
                author: buildUserSummary(usersMap.get(String(pr.authorUserId))).name,
                url: pr.externalUrl ?? null
              })),
              linkedRelease: releaseResponse.data
                ? {
                    id: String(releaseResponse.data.id),
                    version: releaseResponse.data.version,
                    status: releaseResponse.data.status as ReleaseStatus,
                    targetDate: releaseResponse.data.targetDate ? formatDateLabel(String(releaseResponse.data.targetDate)) : null
                  }
                : null,
              comments: commentsResponse.data.map((comment) => ({
                id: String(comment.id),
                user: buildUserSummary(usersMap.get(String(comment.authorUserId))),
                content: comment.content,
                timestamp: 'recently'
              }))
            })
          },
          () => adaptTaskDetailsViewModel(getTaskDetails(taskId))
        )
    })
}
