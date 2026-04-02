import { useMutation } from '@tanstack/react-query'

import { ApprovalDecision } from '@/shared/api'
import { queryClient } from '@/shared/api'
import { addDocumentComment, addDocumentLink, requestDocumentReview, reviewDocumentVersion, updateDocument, type LinkedEntity } from '@/shared/mocks/seamless.ts'

import { useSessionStore } from '@/entities/session'
import { documentQueryKeys } from '@/entities/document/api/queries.ts'

export function useUpdateDocument(docId: string) {
  return useMutation({
    mutationFn: (content: string) => Promise.resolve(updateDocument(docId, content)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(docId) })
    }
  })
}

export function useAddDocumentComment(docId: string) {
  return useMutation({
    mutationFn: (content: string) => {
      const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
      return Promise.resolve(addDocumentComment(docId, content, userId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(docId) })
    }
  })
}

export function useAddDocumentLink(docId: string) {
  return useMutation({
    mutationFn: (entity: LinkedEntity) => Promise.resolve(addDocumentLink(docId, entity)),
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
      return Promise.resolve(requestDocumentReview(docId, userId))
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
      return Promise.resolve(reviewDocumentVersion(docId, versionId, decision, rationale, userId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(docId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.history(docId) })
    }
  })
}
