import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { projectOverviewQueries } from '@/widgets/project-overview/model/projectOverview.ts'
import { ProjectOverview } from '@/widgets/project-overview/ui/ProjectOverview.tsx'
import { Card, Spinner } from '@/shared/ui'

export function ProjectOverviewPage() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const projectOverviewQuery = useQuery(projectOverviewQueries.byId(projectId))

  if (projectOverviewQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (projectOverviewQuery.isError) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load project overview data.
      </Card>
    )
  }

  if (!projectOverviewQuery.data) {
    return (
      <Card className='border-amber-200 bg-amber-50 text-amber-900' theme='secondary'>
        Project not found for route id `{projectId}`.
      </Card>
    )
  }

  return <ProjectOverview data={projectOverviewQuery.data} />
}
