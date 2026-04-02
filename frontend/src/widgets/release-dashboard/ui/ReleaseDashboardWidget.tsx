import { useQuery } from '@tanstack/react-query'
import { GitBranch, GitPullRequest, Rocket } from 'lucide-react'
import { Link } from 'react-router'

import { releaseQueries, type ReleaseDashboardViewModel } from '@/entities/release'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui'

export function ReleaseDashboardWidget() {
  const { data, isLoading, error } = useQuery<ReleaseDashboardViewModel>(releaseQueries.dashboard())

  if (isLoading) {
    return <PageState state='loading' title='Loading release dashboard' description='Resolving releases and pull request statuses.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Release dashboard unavailable' description='Release data could not be loaded.' />
  }

  const releases: ReleaseDashboardViewModel['releases'] = data.releases as ReleaseDashboardViewModel['releases']
  const pullRequests: ReleaseDashboardViewModel['pullRequests'] = data.pullRequests as ReleaseDashboardViewModel['pullRequests']

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Releases & pull requests</h1>
        <p className='text-muted-foreground text-sm'>Delivery surface that projects PR status into task and release context.</p>
      </div>

      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Active releases</CardDescription>
            <CardTitle>{data.summary.releaseCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Open PRs</CardDescription>
            <CardTitle>{data.summary.openPullRequests}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Reviewing PRs</CardDescription>
            <CardTitle>{data.summary.reviewingPullRequests}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Merged PRs</CardDescription>
            <CardTitle>{data.summary.mergedPullRequests}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue='releases'>
        <TabsList>
          <TabsTrigger value='releases'>Releases</TabsTrigger>
          <TabsTrigger value='prs'>Pull requests</TabsTrigger>
        </TabsList>
        <TabsContent value='releases' className='space-y-4'>
          {releases.map((release) => (
            <Card key={release.id}>
              <CardHeader>
                <CardDescription>{release.date}</CardDescription>
                <CardTitle className='flex items-center gap-2'><Rocket className='size-4' /> {release.version}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex flex-wrap items-center gap-3'>
                  <Badge variant={release.readinessTone === 'destructive' ? 'destructive' : release.readinessTone === 'secondary' ? 'secondary' : 'default'}>
                    {release.status}
                  </Badge>
                  <span>{release.title}</span>
                  <span className='text-muted-foreground'>{release.commits} commits</span>
                </div>
                <div className='text-muted-foreground rounded-lg border p-3'>
                  {release.readinessLabel}. {release.linkedTaskCount} linked tasks and {release.linkedPullRequestCount} PRs currently project into this release.
                </div>
                <div className='flex flex-wrap gap-2'>
                  {(release.linkedTaskIds ?? []).map((taskId) => (
                    <Badge key={taskId} variant='outline' asChild={false}>
                      <Link to={`/tasks/${taskId}`}>{taskId}</Link>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value='prs' className='space-y-4'>
          {pullRequests.map((pr) => (
            <Card key={pr.id}>
              <CardHeader>
                <CardDescription>{pr.date}</CardDescription>
                <CardTitle className='flex items-center gap-2'><GitPullRequest className='size-4' /> #{pr.number} {pr.title}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex flex-wrap items-center gap-3'>
                  <Badge variant={pr.statusTone === 'destructive' ? 'destructive' : pr.statusTone === 'secondary' ? 'secondary' : 'default'}>{pr.statusLabel}</Badge>
                  <span className='flex items-center gap-2'><GitBranch className='size-4' /> {pr.branch}</span>
                  <span className='text-muted-foreground'>{pr.commits} commits</span>
                </div>
                <div className='text-muted-foreground rounded-lg border p-3'>
                  {pr.syncLabel}
                </div>
                <div className='flex flex-wrap gap-2'>
                  {(pr.linkedTaskIds ?? []).map((taskId) => (
                    <Badge key={taskId} variant='outline' asChild={false}>
                      <Link to={`/tasks/${taskId}`}>{taskId}</Link>
                    </Badge>
                  ))}
                  {pr.releaseId && (
                    <Badge variant='outline'>release: {pr.releaseId}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </section>
  )
}
