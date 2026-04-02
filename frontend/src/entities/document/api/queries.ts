import { queryOptions } from '@tanstack/react-query'

import type {
  ApiEntity,
  Document,
  DocumentApproval,
  DocumentApprover,
  DocumentComment,
  DocumentFolder,
  DocumentLink,
  DocumentOwner,
  DocumentVersion,
  Epoch,
  Meeting,
  Project,
  Release,
  Task
} from '@/shared/api'
import { ApprovalDecision, DocumentAccessScope, DocumentStatus, http, withBackendFallback } from '@/shared/api'
import { appConfig } from '@/shared/config'
import { buildUserSummary, fetchUsersMap, formatDateLabel, resolveLinkedEntityTitle } from '@/shared/api/seamlessBackend.ts'
import { getDocumentEditor, getDocumentHistory, listDocumentFolders, listDocuments } from '@/shared/mocks/seamless.ts'
import { adaptDocumentEditorViewModel, adaptDocumentHistoryViewModel, adaptDocumentListItemViewModel } from './adapters.ts'

export const documentQueryKeys = {
  folders: ['documents', 'folders'] as const,
  all: ['documents'] as const,
  detail: (docId: string) => ['documents', docId] as const,
  history: (docId: string) => ['documents', docId, 'history'] as const
}

export const documentQueries = {
  folders: () =>
    queryOptions({
      queryKey: documentQueryKeys.folders,
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const { data } = await http.get<Array<ApiEntity<DocumentFolder>>>('/document-folders', {
              params: { projectId: appConfig.defaultProjectId }
            })

            return data.map((folder) => ({
              id: String(folder.id),
              name: folder.name,
              docCount: 0,
              children: []
            }))
          },
          () => listDocumentFolders()
        )
    }),
  list: () =>
    queryOptions({
      queryKey: documentQueryKeys.all,
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const usersMap = await fetchUsersMap()
            const [documentsResponse, epochsResponse] = await Promise.all([
              http.get<Array<ApiEntity<Document>>>('/documents', { params: { projectId: appConfig.defaultProjectId } }),
              http.get<Array<ApiEntity<Epoch>>>('/epochs', { params: { projectId: appConfig.defaultProjectId } })
            ])

            const epochMap = new Map(epochsResponse.data.map((epoch) => [String(epoch.id), epoch]))

            const documents = await Promise.all(
              documentsResponse.data.map(async (document) => {
                const linksResponse = await http.get<Array<ApiEntity<DocumentLink>>>(`/documents/${document.id}/links`)
                const epochLink = linksResponse.data.find((link) => String(link.entityType) === 'epoch')

                return adaptDocumentListItemViewModel({
                  id: String(document.id),
                  title: document.title,
                  description: document.description,
                  status: document.status as DocumentStatus,
                  accessScope: document.accessScope as DocumentAccessScope,
                  author: buildUserSummary(usersMap.get(String(document.authorUserId))),
                  lastUpdated: 'recently',
                  linkedTo: {
                    epochs: linksResponse.data.filter((link) => String(link.entityType) === 'epoch').length,
                    tasks: linksResponse.data.filter((link) => String(link.entityType) === 'task').length,
                    meetings: linksResponse.data.filter((link) => String(link.entityType) === 'meeting').length,
                    releases: linksResponse.data.filter((link) => String(link.entityType) === 'release').length
                  },
                  awaitingApproval: document.awaitingApproval,
                  folderId: document.folderId ? String(document.folderId) : null,
                  epoch: epochLink ? { id: String(epochLink.entityId), title: epochMap.get(String(epochLink.entityId))?.name ?? String(epochLink.entityId) } : null
                })
              })
            )

            return documents
          },
          () => listDocuments().map(adaptDocumentListItemViewModel)
        )
    }),
  detail: (docId: string) =>
    queryOptions({
      queryKey: documentQueryKeys.detail(docId),
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const usersMap = await fetchUsersMap()
            const [documentResponse, ownersResponse, approversResponse, versionsResponse, commentsResponse, linksResponse, tasksResponse, meetingsResponse, releasesResponse, epochsResponse, projectsResponse] =
              await Promise.all([
                http.get<ApiEntity<Document>>(`/documents/${docId}`),
                http.get<Array<ApiEntity<DocumentOwner>>>(`/documents/${docId}/owners`),
                http.get<Array<ApiEntity<DocumentApprover>>>(`/documents/${docId}/approvers`),
                http.get<Array<ApiEntity<DocumentVersion>>>(`/documents/${docId}/versions`),
                http.get<Array<ApiEntity<DocumentComment>>>(`/documents/${docId}/comments`),
                http.get<Array<ApiEntity<DocumentLink>>>(`/documents/${docId}/links`),
                http.get<Array<ApiEntity<Task>>>('/tasks', { params: { projectId: appConfig.defaultProjectId } }),
                http.get<Array<ApiEntity<Meeting>>>('/meetings', { params: { projectId: appConfig.defaultProjectId } }),
                http.get<Array<ApiEntity<Release>>>('/releases', { params: { projectId: appConfig.defaultProjectId } }),
                http.get<Array<ApiEntity<Epoch>>>('/epochs', { params: { projectId: appConfig.defaultProjectId } }),
                http.get<Array<ApiEntity<Project>>>('/projects')
              ])

            const latestVersion = versionsResponse.data[0]
            const currentVersion =
              versionsResponse.data.find((version) => String(version.id) === String(documentResponse.data.currentVersionId ?? '')) ?? latestVersion ?? null

            const taskMap = new Map(tasksResponse.data.map((task) => [String(task.id), task]))
            const meetingMap = new Map(meetingsResponse.data.map((meeting) => [String(meeting.id), { title: meeting.title }]))
            const releaseMap = new Map(releasesResponse.data.map((release) => [String(release.id), release]))
            const epochMap = new Map(epochsResponse.data.map((epoch) => [String(epoch.id), epoch]))
            const projectMap = new Map(projectsResponse.data.map((project) => [String(project.id), project]))

            return adaptDocumentEditorViewModel({
              id: String(documentResponse.data.id),
              title: documentResponse.data.title,
              version: currentVersion?.versionLabel ?? '1.0',
              status: documentResponse.data.status as DocumentStatus,
              awaitingApproval: documentResponse.data.awaitingApproval,
              owners: ownersResponse.data.map((owner) => buildUserSummary(usersMap.get(String(owner.userId)))),
              approvers: approversResponse.data.map((approver) => ({
                ...buildUserSummary(usersMap.get(String(approver.userId))),
                approved: approver.approved
              })),
              content: currentVersion?.contentMarkdown ?? `# ${documentResponse.data.title}`,
              linkedEntities: linksResponse.data.map((link) => {
                const type = String(link.entityType) as 'epoch' | 'task' | 'meeting' | 'release' | 'project'
                return {
                  id: String(link.entityId),
                  type,
                  title: resolveLinkedEntityTitle(type, String(link.entityId), {
                    tasks: taskMap,
                    meetings: meetingMap,
                    releases: releaseMap,
                    epochs: epochMap,
                    projects: projectMap
                  }),
                  status: undefined
                }
              }),
              comments: commentsResponse.data.map((comment) => ({
                id: String(comment.id),
                author: buildUserSummary(usersMap.get(String(comment.authorUserId))),
                content: comment.content,
                timestamp: 'recently',
                resolved: comment.resolved
              }))
            })
          },
          () => adaptDocumentEditorViewModel(getDocumentEditor(docId))
        )
    }),
  history: (docId: string) =>
    queryOptions({
      queryKey: documentQueryKeys.history(docId),
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const usersMap = await fetchUsersMap()
            const { data: versions } = await http.get<Array<ApiEntity<DocumentVersion>>>(`/documents/${docId}/versions`)

            const history = await Promise.all(
              versions.map(async (version) => {
                const { data: approvals } = await http.get<Array<ApiEntity<DocumentApproval>>>(`/document-versions/${version.id}/approvals`)
                const hasRejected = approvals.some((approval) => String(approval.status) === String(ApprovalDecision.Rejected))
                const allApproved = approvals.length > 0 && approvals.every((approval) => String(approval.status) === String(ApprovalDecision.Approved))

                return adaptDocumentHistoryViewModel({
                  id: String(version.id),
                  version: version.versionLabel,
                  timestamp: 'recently',
                  author: buildUserSummary(usersMap.get(String(version.authorUserId))),
                  changeSource: String(version.changeSource) as 'manual' | 'meeting' | 'task' | 'imported',
                  sourceDetail: version.sourceDetail ?? undefined,
                  changes: {
                    additions: version.additions,
                    deletions: version.deletions,
                    modifications: version.modifications
                  },
                  status: hasRejected ? 'rejected' : allApproved ? 'approved' : 'pending-approval',
                  approvals: approvals.map((approval) => ({
                    approver: buildUserSummary(usersMap.get(String(approval.approverUserId))),
                    status: approval.status as ApprovalDecision,
                    decision: approval.decision as ApprovalDecision | undefined,
                    rationale: approval.rationale ?? undefined,
                    timestamp: approval.decidedAt ? formatDateLabel(String(approval.decidedAt)) : undefined
                  }))
                })
              })
            )

            return history
          },
          () => getDocumentHistory(docId).map(adaptDocumentHistoryViewModel)
        )
    })
}
