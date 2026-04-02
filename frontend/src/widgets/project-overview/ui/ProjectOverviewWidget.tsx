import { useQuery } from '@tanstack/react-query'
import { Calendar, CheckSquare, Clock, FileText, Rocket } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { projectQueries } from '@/entities/project'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState } from '@/shared/ui'

export function ProjectOverviewWidget() {
  const { id = 'project-seamless' } = useParams()
  const { data, isLoading, error } = useQuery(projectQueries.detail(id))

  if (isLoading) {
    return <PageState state='loading' title='Loading project overview' description='Collecting docs, tasks, meetings, and release metrics.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Project unavailable' description='The selected project overview could not be loaded.' />
  }

  return (
    <section className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>{data.name}</h1>
          <p className='text-muted-foreground text-sm'>Project overview acts as the cross-core landing page for docs, kanban, meetings, releases, and inbox.</p>
        </div>
        <Badge>{data.status}</Badge>
      </div>

      <div className='grid gap-4 lg:grid-cols-4'>
        <Card>
          <CardHeader>
            <CardDescription>Completion</CardDescription>
            <CardTitle>{data.stats.completion}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active epoch</CardDescription>
            <CardTitle>{data.stats.activeEpoch?.name ?? 'None'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Upcoming meetings</CardDescription>
            <CardTitle>{data.stats.upcomingMeetings}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Latest release</CardDescription>
            <CardTitle>{data.stats.latestRelease?.version ?? 'None'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Cross-core entities</CardTitle>
            <CardDescription>Single place to jump into the main surfaces.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-3 sm:grid-cols-2'>
            <Link to='/docs' className='bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-4'>
              <span className='flex items-center gap-2'><FileText className='size-4' /> Docs</span>
              <Badge variant='secondary'>{data.entities.docs}</Badge>
            </Link>
            <Link to='/tasks' className='bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-4'>
              <span className='flex items-center gap-2'><CheckSquare className='size-4' /> Tasks</span>
              <Badge variant='secondary'>{data.entities.tasks}</Badge>
            </Link>
            <Link to='/meetings' className='bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-4'>
              <span className='flex items-center gap-2'><Calendar className='size-4' /> Meetings</span>
              <Badge variant='secondary'>{data.entities.meetings}</Badge>
            </Link>
            <Link to='/releases' className='bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-4'>
              <span className='flex items-center gap-2'><Rocket className='size-4' /> Releases</span>
              <Badge variant='secondary'>{data.entities.releases}</Badge>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution pulse</CardTitle>
            <CardDescription>Status projection across docs, tasks, meetings, and releases.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-sm'>
            <div className='bg-muted rounded-lg p-4'>
              <p className='text-muted-foreground'>Delivery status</p>
              <p className='mt-1 font-medium capitalize'>{data.stats.status}</p>
            </div>
            <div className='bg-muted rounded-lg p-4'>
              <p className='text-muted-foreground'>Epoch cadence</p>
              <p className='mt-1 flex items-center gap-2 font-medium'><Clock className='size-4' /> {data.activeEpochLabel}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
