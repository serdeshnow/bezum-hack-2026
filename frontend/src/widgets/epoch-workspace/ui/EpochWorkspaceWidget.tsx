import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, CircleDot, Clock, FileText, Rocket } from 'lucide-react'
import { useParams } from 'react-router'

import { epochQueries } from '@/entities/epoch'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState, Progress } from '@/shared/ui'

export function EpochWorkspaceWidget() {
  const { epochId = 'epoch-q2' } = useParams()
  const { data, isLoading, error } = useQuery(epochQueries.detail(epochId))

  if (isLoading) {
    return <PageState state='loading' title='Loading epoch workspace' description='Projecting sprint data across docs, tasks, and releases.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Epoch unavailable' description='The selected sprint workspace could not be loaded.' />
  }

  return (
    <section className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>{data.name}</h1>
          <p className='text-muted-foreground text-sm'>Sprint projection across goals, docs, meetings, and release readiness.</p>
        </div>
        <Badge>{data.status}</Badge>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        {data.goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <CardDescription>{goal.owner.name}</CardDescription>
              <CardTitle>{goal.title}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='text-muted-foreground text-sm'>{goal.description}</p>
              <Progress value={goal.progress} />
              <div className='flex items-center justify-between text-sm'>
                <span className='capitalize'>{goal.status}</span>
                <span>{goal.progress}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Epoch-linked assets</CardTitle>
            <CardDescription>Documents and meetings inherit epoch visibility and context.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {data.documents.map((document) => (
              <div key={document.id} className='bg-muted flex items-center justify-between rounded-lg p-3 text-sm'>
                <span className='flex items-center gap-2'><FileText className='size-4' /> {document.title}</span>
                <span className='text-muted-foreground'>{document.lastUpdated}</span>
              </div>
            ))}
            {data.meetings.map((meeting) => (
              <div key={meeting.id} className='bg-muted flex items-center justify-between rounded-lg p-3 text-sm'>
                <span className='flex items-center gap-2'><Clock className='size-4' /> {meeting.title}</span>
                <span className='text-muted-foreground'>{meeting.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Release readiness</CardTitle>
            <CardDescription>Release status remains visible at epoch level, not only in delivery pages.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div>
                <p className='text-muted-foreground text-sm'>Target release</p>
                <p className='font-medium'>{data.releaseReadiness.version}</p>
              </div>
              <span className='text-sm capitalize'>{data.releaseReadiness.status}</span>
            </div>
            {data.releaseReadiness.checklist.map((item) => (
              <div key={item.id} className='flex items-center gap-3 rounded-lg border p-3 text-sm'>
                {item.completed ? <CheckCircle2 className='size-4 text-emerald-600' /> : <CircleDot className='size-4 text-amber-600' />}
                <span className='flex-1'>{item.item}</span>
                <Rocket className='text-muted-foreground size-4' />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
