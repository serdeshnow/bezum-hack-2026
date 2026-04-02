import { useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'
import { useParams } from 'react-router'

import { documentQueries } from '@/entities/document'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState } from '@/shared/ui'

export function DocumentHistoryWidget() {
  const { docId = 'doc-architecture' } = useParams()
  const { data, isLoading, error } = useQuery(documentQueries.history(docId))

  if (isLoading) {
    return <PageState state='loading' title='Loading document history' description='Collecting versions, approval records, and change sources.' />
  }

  if (error) {
    return <PageState state='error' title='History unavailable' description='Document history could not be loaded.' />
  }

  if (!data?.length) {
    return <PageState state='empty' title='No versions yet' description='A version history will appear after the first save.' />
  }

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='flex items-center gap-2 text-2xl font-semibold'><History className='size-5' /> Document history</h1>
        <p className='text-muted-foreground text-sm'>Version journal with approval decisions and change source attribution.</p>
      </div>

      <div className='space-y-4'>
        {data.map((version) => (
          <Card key={version.id}>
            <CardHeader>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <CardDescription>{version.author.name}</CardDescription>
                  <CardTitle>{version.version}</CardTitle>
                </div>
                <Badge>{version.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-3 text-sm md:grid-cols-3'>
                <div className='rounded-lg border p-3'>+{version.changes.additions} additions</div>
                <div className='rounded-lg border p-3'>-{version.changes.deletions} deletions</div>
                <div className='rounded-lg border p-3'>{version.changes.modifications} modifications</div>
              </div>
              <div className='space-y-2'>
                {version.approvals.map((approval, index) => (
                  <div key={`${approval.approver.id}-${index}`} className='rounded-lg border p-3 text-sm'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium'>{approval.approver.name}</span>
                      <Badge variant='outline'>{approval.status}</Badge>
                    </div>
                    {approval.rationale && <p className='text-muted-foreground mt-2'>{approval.rationale}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
