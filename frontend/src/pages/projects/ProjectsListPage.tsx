import { useQuery } from '@tanstack/react-query'

import { projectsHubQueries } from '@/widgets/projects-hub/model/projectsHub.ts'
import { ProjectsHub } from '@/widgets/projects-hub/ui/ProjectsHub.tsx'
import { Card, Spinner } from '@/shared/ui'

export function ProjectsListPage() {
  const projectsHubQuery = useQuery(projectsHubQueries.list())

  if (projectsHubQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (projectsHubQuery.isError || !projectsHubQuery.data) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load projects backbone data.
      </Card>
    )
  }

  return <ProjectsHub data={projectsHubQuery.data} />
}
