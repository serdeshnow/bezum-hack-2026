import { useState } from 'react'

import { ApprovalDecision } from '@/shared/api'
import { useReviewDocumentVersion } from '@/entities/document'
import { Button, Textarea } from '@/shared/ui'

type Props = {
  docId: string
  versionId: string
  disabled?: boolean
}

export function DocumentVersionReviewPanel({ docId, versionId, disabled }: Props) {
  const reviewVersion = useReviewDocumentVersion(docId)
  const [rationale, setRationale] = useState('')

  const submit = (decision: ApprovalDecision) => {
    reviewVersion.mutate({
      versionId,
      decision,
      rationale: rationale.trim() || undefined
    })
  }

  return (
    <div className='space-y-3 rounded-lg border p-3'>
      <Textarea
        value={rationale}
        onChange={(event) => setRationale(event.target.value)}
        placeholder='Optional rationale for approval or requested changes…'
      />
      <div className='flex flex-wrap gap-2'>
        <Button size='sm' disabled={disabled || reviewVersion.isPending} onClick={() => submit(ApprovalDecision.Approved)}>
          Approve
        </Button>
        <Button size='sm' variant='outline' disabled={disabled || reviewVersion.isPending} onClick={() => submit(ApprovalDecision.RequestedChanges)}>
          Request changes
        </Button>
        <Button size='sm' variant='destructive' disabled={disabled || reviewVersion.isPending} onClick={() => submit(ApprovalDecision.Rejected)}>
          Reject
        </Button>
      </div>
    </div>
  )
}
