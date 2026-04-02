import { useQuery } from '@tanstack/react-query'
import { CheckSquare, FileText, Sparkles, Video } from 'lucide-react'
import { useParams } from 'react-router'

import { meetingQueries, usePublishMeetingRecap } from '@/entities/meeting'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState } from '@/shared/ui'

export function MeetingRecapWidget() {
  const { meetingId = 'meeting-review' } = useParams()
  const { data, isLoading, error } = useQuery(meetingQueries.recap(meetingId))
  const publishRecap = usePublishMeetingRecap(meetingId)

  if (isLoading) {
    return <PageState state='loading' title='Loading meeting recap' description='Preparing transcript, AI summary, and action items.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Meeting recap unavailable' description='Recap data could not be loaded.' />
  }

  return (
    <section className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>{data.title}</h1>
          <p className='text-muted-foreground text-sm'>{data.date} · {data.time}</p>
        </div>
        <Button onClick={() => publishRecap.mutate(!data.approved)}>{data.publishLabel}</Button>
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.5fr_1fr]'>
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'><Sparkles className='size-4' /> AI summary</CardTitle>
              <CardDescription>Approved summaries can be reused in documents and task follow-ups.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p>{data.aiSummary.overview}</p>
              <ul className='space-y-2 text-sm'>
                {data.aiSummary.keyPoints.map((point) => (
                  <li key={point} className='rounded-lg border p-3'>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'><Video className='size-4' /> Transcript</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {data.transcript.map((entry) => (
                <div key={`${entry.speaker}-${entry.time}`} className='rounded-lg border p-3 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{entry.speaker}</span>
                    <span className='text-muted-foreground'>{entry.time}</span>
                  </div>
                  <p className='mt-2'>{entry.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'><CheckSquare className='size-4' /> Action items</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='text-muted-foreground rounded-lg border p-3 text-sm'>
                {data.actionItemsToCreate} action items can be turned into tasks. {data.decisionCount} decisions captured.
              </div>
              {data.actionItems.map((item) => (
                <div key={item.id} className='rounded-lg border p-3 text-sm'>
                  <p className='font-medium'>{item.task}</p>
                  <p className='text-muted-foreground mt-1'>{item.assignee.name} · {item.dueDate}</p>
                  <Badge className='mt-2'>{item.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'><FileText className='size-4' /> Linked documents</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {data.linkedDocuments.map((document) => (
                <div key={document.id} className='rounded-lg border p-3 text-sm'>
                  <p className='font-medium'>{document.title}</p>
                  <p className='text-muted-foreground mt-1'>{document.updateSuggestion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
