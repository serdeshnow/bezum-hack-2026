import { Link } from 'react-router'

import { useApplyMeetingSummaryToDocument } from '@/entities/meeting'
import { Button } from '@/shared/ui'

type Props = {
  meetingId: string
  docId: string
  applied?: boolean
  appliedVersion?: string | null
  reviewRequested?: boolean
}

export function ApplyMeetingSummaryToDocumentActions({ meetingId, docId, applied, appliedVersion, reviewRequested }: Props) {
  const applySummary = useApplyMeetingSummaryToDocument(meetingId)

  return (
    <div className='flex flex-wrap gap-2'>
      <Button size='sm' variant='outline' onClick={() => applySummary.mutate({ docId, mode: 'draft' })} disabled={applySummary.isPending}>
        Apply to draft
      </Button>
      <Button size='sm' onClick={() => applySummary.mutate({ docId, mode: 'review' })} disabled={applySummary.isPending}>
        Apply + request review
      </Button>
      {applied && (
        <Button asChild size='sm' variant='ghost'>
          <Link to={`/docs/${docId}/history`}>{reviewRequested ? `Review queued in v${appliedVersion}` : `Open v${appliedVersion}`}</Link>
        </Button>
      )}
    </div>
  )
}
