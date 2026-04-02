import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { Card, Spinner } from '@/shared/ui'
import { documentHistoryQueries } from '@/widgets/document-history/model/documentHistory.ts'
import { DocumentHistory } from '@/widgets/document-history/ui/DocumentHistory.tsx'

export function DocumentHistoryPage() {
  const { documentId = '' } = useParams<{ documentId: string }>()
  const documentHistoryQuery = useQuery(documentHistoryQueries.byId(documentId))

  if (documentHistoryQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (documentHistoryQuery.isError) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load document history data.
      </Card>
    )
  }

  if (!documentHistoryQuery.data) {
    return (
      <Card className='border-amber-200 bg-amber-50 text-amber-900' theme='secondary'>
        Document history not found for route id `{documentId}`.
      </Card>
    )
  }

  return <DocumentHistory data={documentHistoryQuery.data} />
}
