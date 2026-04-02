import { useQuery } from '@tanstack/react-query'
import { Calendar, ThumbsDown, ThumbsUp } from 'lucide-react'

import { VoteStatus } from '@/shared/api'
import { meetingQueries, useVoteMeetingSlot } from '@/entities/meeting'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState } from '@/shared/ui'

export function MeetingSchedulerWidget() {
  const { data, isLoading, error } = useQuery(meetingQueries.scheduler())
  const voteSlot = useVoteMeetingSlot()

  if (isLoading) {
    return <PageState state='loading' title='Loading scheduler' description='Preparing source context, participants, and availability grid.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Scheduler unavailable' description='Meeting planning data could not be loaded.' />
  }

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Meeting scheduler</h1>
        <p className='text-muted-foreground text-sm'>Source context is inherited from {data.sourceContext.type}: {data.sourceContext.title}</p>
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.2fr_0.8fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Candidate slots</CardTitle>
            <CardDescription>Bidirectional agreement flow with visible participant votes.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {data.closestViableSlotId && (
              <div className='bg-accent/10 border-accent text-sm rounded-lg border p-3'>
                Closest viable slot: {data.closestViableSlotId}
              </div>
            )}
            {data.timeSlots.map((slot) => (
              <div key={slot.id} className='rounded-xl border p-4'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <p className='font-medium'>{slot.date}</p>
                    <p className='text-muted-foreground text-sm'>{slot.time}</p>
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={() => voteSlot.mutate({ slotId: slot.id, status: VoteStatus.Available })}>
                      <ThumbsUp className='size-4' />
                      Available
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => voteSlot.mutate({ slotId: slot.id, status: VoteStatus.Unavailable })}>
                      <ThumbsDown className='size-4' />
                      Unavailable
                    </Button>
                  </div>
                </div>
                <div className='mt-4 flex flex-wrap gap-2 text-xs'>
                  {data.slotSummaries
                    .filter((summary) => summary.slotId === slot.id)
                    .map((summary) => (
                      <Badge key={summary.slotId} variant='outline'>
                        {summary.available} available, {summary.unavailable} unavailable, {summary.tentative} tentative
                      </Badge>
                    ))}
                  {Object.entries(slot.votes).map(([userId, status]) => (
                    <Badge key={userId} variant={status === VoteStatus.Available ? 'default' : 'secondary'}>
                      {userId.replace('user-', '')}: {status}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            {data.participants.map((participant) => (
              <div key={participant.id} className='flex items-center justify-between rounded-lg border p-3'>
                <div>
                  <p className='font-medium'>{participant.name}</p>
                  <p className='text-muted-foreground text-xs'>{participant.role}</p>
                </div>
                <Badge variant='outline'>{participant.initials}</Badge>
              </div>
            ))}
            <div className='rounded-lg border p-4'>
              <p className='text-muted-foreground mb-2 text-xs uppercase tracking-[0.12em]'>Availability strip</p>
              <div className='space-y-2'>
                {data.availabilityStrip.map((strip) => (
                  <div key={strip.date} className='flex items-center justify-between text-sm'>
                    <span className='flex items-center gap-2'><Calendar className='size-4' /> {strip.day} {strip.date}</span>
                    <span className='text-muted-foreground'>{strip.slots.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
