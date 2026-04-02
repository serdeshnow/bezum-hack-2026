import { queryOptions } from '@tanstack/react-query'

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
      queryFn: async () => listDocumentFolders()
    }),
  list: () =>
    queryOptions({
      queryKey: documentQueryKeys.all,
      queryFn: async () => listDocuments().map(adaptDocumentListItemViewModel)
    }),
  detail: (docId: string) =>
    queryOptions({
      queryKey: documentQueryKeys.detail(docId),
      queryFn: async () => adaptDocumentEditorViewModel(getDocumentEditor(docId))
    }),
  history: (docId: string) =>
    queryOptions({
      queryKey: documentQueryKeys.history(docId),
      queryFn: async () => getDocumentHistory(docId).map(adaptDocumentHistoryViewModel)
    })
}
