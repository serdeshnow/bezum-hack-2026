import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { Card, Spinner } from '@/shared/ui'
import { changeMeetingSummaryApproval, meetingRecapQueries } from '@/widgets/meeting-recap/model/meetingRecap.ts'
import { MeetingRecap } from '@/widgets/meeting-recap/ui/MeetingRecap.tsx'

export function MeetingRecapPage() {
  const { meetingId = '' } = useParams<{ meetingId: string }>()
  const queryClient = useQueryClient()
  const recapQuery = useQuery(meetingRecapQueries.byId(meetingId))

  const approvalMutation = useMutation({
    mutationFn: (approved: boolean) => changeMeetingSummaryApproval(meetingId, approved),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['backbone', 'meetings'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'docs'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'project-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'epoch-workspace'] })
      ])
    }
  })

  if (recapQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (recapQuery.isError) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load meeting recap data.
      </Card>
    )
  }

  if (!recapQuery.data) {
    return (
      <Card className='border-amber-200 bg-amber-50 text-amber-900' theme='secondary'>
        Meeting not found for route id `{meetingId}`.
      </Card>
    )
  }

  return <MeetingRecap data={recapQuery.data} isApproving={approvalMutation.isPending} onApproveSummary={(approved) => approvalMutation.mutate(approved)} />
}
