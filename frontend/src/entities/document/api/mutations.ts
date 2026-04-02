import { useMutation } from '@tanstack/react-query'

import type { ApiEntity, CreateDocumentRequest, Document, UpdateDocumentApprovalRequest, UpdateDocumentRequest } from '@/shared/api'
import { ApprovalDecision, DocumentAccessScope, DocumentStatus } from '@/shared/api'
import { http, queryClient, withBackendFallback } from '@/shared/api'
import { addDocumentComment, addDocumentLink, requestDocumentReview, reviewDocumentVersion, updateDocument, type LinkedEntity } from '@/shared/mocks/seamless.ts'

import { useSessionStore } from '@/entities/session'
import { documentQueryKeys } from '@/entities/document/api/queries.ts'

function getNumericSessionUserId() {
  const userId = Number(useSessionStore.getState().currentUser?.id)

  if (!Number.isFinite(userId)) {
    throw new Error('Document creation requires a backend-authenticated user session.')
  }

  return userId
}

function getNumericCurrentProjectId() {
  const projectId = Number(useSessionStore.getState().currentProjectId)

  if (!Number.isFinite(projectId)) {
    throw new Error('Select a backend project before creating a document.')
  }

  return projectId
}

export function useCreateDocument() {
  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      const payload: CreateDocumentRequest = {
        projectId: getNumericCurrentProjectId(),
        folderId: null,
        title,
        description,
        status: DocumentStatus.Draft,
        accessScope: DocumentAccessScope.Internal,
        authorUserId: getNumericSessionUserId(),
        currentVersionId: null,
        awaitingApproval: false,
        isStarred: false,
        archivedAt: null
      }

      const { data } = await http.post<ApiEntity<Document>>('/documents', payload)
      return data
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.folders })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(String(document.id)) })
    }
  })
}

export function useUpdateDocument(docId: string) {
  return useMutation({
    mutationFn: (content: string) => {
      const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
      return withBackendFallback(
        async () => {
          const versions = await http.get<Array<{ id: string; versionLabel: string }>>(`/documents/${docId}/versions`)
          const currentVersion = versions.data[0]
          const currentLabel = currentVersion?.versionLabel ?? '1.0'
          const segments = currentLabel.split('.')
          const nextLabel = currentLabel.includes('.')
            ? `${segments.slice(0, -1).join('.')}.${Number(segments[segments.length - 1] ?? '0') + 1}`
            : `${currentLabel}.1`

          const { data } = await http.post(`/documents/${docId}/versions`, {
            versionLabel: nextLabel,
            contentMarkdown: content,
            changeSource: 'manual',
            authorUserId: userId,
            additions: 0,
            deletions: 0,
            modifications: 1,
            status: 'pending-approval'
          })
          return data
        },
        () => Promise.resolve(updateDocument(docId, content))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(docId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.history(docId) })
    }
  })
}

export function useAddDocumentComment(docId: string) {
  return useMutation({
    mutationFn: (content: string) => {
      const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
      return withBackendFallback(
        async () => {
          const { data } = await http.post(`/documents/${docId}/comments`, {
            authorUserId: userId,
            content,
            resolved: false
          })
          return data
        },
        () => Promise.resolve(addDocumentComment(docId, content, userId))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(docId) })
    }
  })
}

export function useAddDocumentLink(docId: string) {
  return useMutation({
    mutationFn: (entity: LinkedEntity) =>
      withBackendFallback(
        async () => {
          const { data } = await http.post(`/documents/${docId}/links`, {
            entityType: entity.type,
            entityId: entity.id
          })
          return data
        },
        () => Promise.resolve(addDocumentLink(docId, entity))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(docId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    }
  })
}

export function useRequestDocumentReview(docId: string) {
  return useMutation({
    mutationFn: () => {
      const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
      return withBackendFallback(
        async () => {
          const versions = await http.get<Array<{ id: string }>>(`/documents/${docId}/versions`)
          const versionId = versions.data[0]?.id

          if (versionId) {
            const approvers = await http.get<Array<{ userId: string }>>(`/documents/${docId}/approvers`)
            await Promise.all(
              approvers.data.map((approver) =>
                http.post(`/document-versions/${versionId}/approvals`, {
                  approverUserId: approver.userId,
                  status: ApprovalDecision.Pending
                })
              )
            )
          }

          const { data } = await http.patch(`/documents/${docId}`, {
            status: DocumentStatus.InReview,
            awaitingApproval: true
          } satisfies UpdateDocumentRequest)
          return data
        },
        () => Promise.resolve(requestDocumentReview(docId, userId))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(docId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.history(docId) })
    }
  })
}

export function useReviewDocumentVersion(docId: string) {
  return useMutation({
    mutationFn: ({ versionId, decision, rationale }: { versionId: string; decision: ApprovalDecision; rationale?: string }) => {
      const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
      return withBackendFallback(
        async () => {
          const approvals = await http.get<Array<{ id: string; approverUserId: string }>>(`/document-versions/${versionId}/approvals`)
          const currentApproval = approvals.data.find((approval) => String(approval.approverUserId) === String(userId))
          const approvalPayload = {
            status: decision,
            decision,
            rationale,
            decidedAt: new Date().toISOString()
          } as unknown as UpdateDocumentApprovalRequest

          if (currentApproval) {
            await http.patch(`/document-approvals/${currentApproval.id}`, approvalPayload)
          } else {
            await http.post(`/document-versions/${versionId}/approvals`, {
              approverUserId: userId,
              ...approvalPayload
            })
          }

          return { versionId, decision, rationale }
        },
        () => {
          reviewDocumentVersion(docId, versionId, decision, rationale, userId)
          return Promise.resolve({ versionId, decision, rationale })
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(docId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.history(docId) })
    }
  })
}
