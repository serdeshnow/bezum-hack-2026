import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/shared/api'
import { addDocumentComment, updateDocument } from '@/shared/mocks/seamless.ts'

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
