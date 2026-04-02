import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Card, Spinner } from '@/shared/ui'
import { meetingSchedulerQueries, voteForMeetingSlot } from '@/widgets/meeting-scheduler/model/meetingScheduler.ts'
import { MeetingScheduler } from '@/widgets/meeting-scheduler/ui/MeetingScheduler.tsx'

export function MeetingSchedulerPage() {
  const queryClient = useQueryClient()
  const schedulerQuery = useQuery(meetingSchedulerQueries.list())

  const voteMutation = useMutation({
    mutationFn: ({ slotId, participantUserId, status }: { slotId: string; participantUserId: string; status: 'available' | 'maybe' | 'unavailable' | 'no-response' }) =>
      voteForMeetingSlot(slotId, participantUserId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['backbone', 'meetings'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'projects-hub'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'project-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'epoch-workspace'] })
      ])
    }
  })

  if (schedulerQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (schedulerQuery.isError || !schedulerQuery.data) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load meeting scheduler data.
      </Card>
    )
  }

  return (
    <MeetingScheduler
      data={schedulerQuery.data}
      isVoteUpdating={voteMutation.isPending}
      onVoteChange={(slotId, participantUserId, status) => voteMutation.mutate({ slotId, participantUserId, status })}
    />
  )
}
