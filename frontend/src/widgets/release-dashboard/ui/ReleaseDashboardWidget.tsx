import { useQuery } from '@tanstack/react-query'
import { GitBranch, GitPullRequest, Rocket } from 'lucide-react'

import { releaseQueries } from '@/entities/release'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui'

export function ReleaseDashboardWidget() {
  const { data, isLoading, error } = useQuery(releaseQueries.dashboard())

  if (isLoading) {
    return <PageState state='loading' title='Loading release dashboard' description='Resolving releases and pull request statuses.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Release dashboard unavailable' description='Release data could not be loaded.' />
  }

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Releases & pull requests</h1>
        <p className='text-muted-foreground text-sm'>Delivery surface that projects PR status into task and release context.</p>
      </div>

      <Tabs defaultValue='releases'>
        <TabsList>
          <TabsTrigger value='releases'>Releases</TabsTrigger>
          <TabsTrigger value='prs'>Pull requests</TabsTrigger>
        </TabsList>
        <TabsContent value='releases' className='space-y-4'>
          {data.releases.map((release) => (
            <Card key={release.id}>
              <CardHeader>
                <CardDescription>{release.date}</CardDescription>
                <CardTitle className='flex items-center gap-2'><Rocket className='size-4' /> {release.version}</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-wrap items-center gap-3 text-sm'>
                <Badge>{release.status}</Badge>
                <span>{release.title}</span>
                <span className='text-muted-foreground'>{release.commits} commits</span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value='prs' className='space-y-4'>
          {data.pullRequests.map((pr) => (
            <Card key={pr.id}>
              <CardHeader>
                <CardDescription>{pr.date}</CardDescription>
                <CardTitle className='flex items-center gap-2'><GitPullRequest className='size-4' /> #{pr.number} {pr.title}</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-wrap items-center gap-3 text-sm'>
                <Badge>{pr.status}</Badge>
                <span className='flex items-center gap-2'><GitBranch className='size-4' /> {pr.branch}</span>
                <span className='text-muted-foreground'>{pr.commits} commits</span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </section>
  )
}
