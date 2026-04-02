import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { Card, Spinner } from '@/shared/ui'
import { addDocumentEditorComment, changeDocumentEditorStatus, documentEditorQueries } from '@/widgets/document-editor/model/documentEditor.ts'
import { DocumentEditor } from '@/widgets/document-editor/ui/DocumentEditor.tsx'

export function DocumentEditorPage() {
  const { documentId = '' } = useParams<{ documentId: string }>()
  const queryClient = useQueryClient()
  const documentEditorQuery = useQuery(documentEditorQueries.byId(documentId))

  const statusMutation = useMutation({
    mutationFn: (status: 'draft' | 'in-review' | 'approved' | 'obsolete' | 'rejected') => changeDocumentEditorStatus(documentId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['backbone', 'docs', 'hub'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'docs', 'editor', documentId] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'docs', 'history', documentId] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'projects-hub'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'project-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'epoch-workspace'] })
      ])
    }
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => addDocumentEditorComment(documentId, content),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['backbone', 'docs', 'editor', documentId] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'docs', 'history', documentId] })
      ])
    }
  })

  if (documentEditorQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (documentEditorQuery.isError) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load document editor data.
      </Card>
    )
  }

  if (!documentEditorQuery.data) {
    return (
      <Card className='border-amber-200 bg-amber-50 text-amber-900' theme='secondary'>
        Document not found for route id `{documentId}`.
      </Card>
    )
  }

  return (
    <DocumentEditor
      data={documentEditorQuery.data}
      isCommentSubmitting={commentMutation.isPending}
      isStatusUpdating={statusMutation.isPending}
      onAddComment={(content) => commentMutation.mutate(content)}
      onStatusChange={(status) => statusMutation.mutate(status)}
    />
  )
}
