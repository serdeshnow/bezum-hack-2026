import { useRequestDocumentReview } from '@/entities/document'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

type Props = {
  docId: string
  awaitingApproval: boolean
}

export function DocumentReviewActions({ docId, awaitingApproval }: Props) {
  const requestReview = useRequestDocumentReview(docId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review flow</CardTitle>
        <CardDescription>Move the current version into approval and keep the trail visible in history.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='text-muted-foreground text-sm'>
          Current state: {awaitingApproval ? 'awaiting approval' : 'draft / editable'}
        </div>
        <Button onClick={() => requestReview.mutate()} disabled={awaitingApproval || requestReview.isPending}>
          Request review
        </Button>
      </CardContent>
    </Card>
  )
}
