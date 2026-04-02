import { useQuery } from '@tanstack/react-query'
import { ArrowRight, FolderKanban, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'

import { projectQueries } from '@/entities/project'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState } from '@/shared/ui'

export function ProjectsListWidget() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery(projectQueries.list())

  if (isLoading) {
    return <PageState state='loading' title='Loading projects' description='Preparing project workspace overview.' />
  }

  if (error) {
    return <PageState state='error' title='Failed to load projects' description='Project list could not be resolved.' />
  }

  if (!data?.length) {
    return <PageState state='empty' title='No projects yet' description='Create a project to start delivery planning.' action={{ label: 'Create project', onClick: () => {} }} />
  }

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>Projects</h1>
          <p className='text-muted-foreground text-sm'>Operational entry point for docs, kanban, meetings, releases, and notifications.</p>
        </div>
        <Button>
          <Plus className='size-4' />
          Create project
        </Button>
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        {data.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <FolderKanban className='size-5' />
                    {project.name}
                  </CardTitle>
                  <CardDescription className='mt-2'>{project.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-3 text-sm md:grid-cols-2'>
                <div>
                  <p className='text-muted-foreground'>Status</p>
                  <p className='font-medium capitalize'>{project.status}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Progress</p>
                  <p className='font-medium'>{project.progress}%</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Open tasks</p>
                  <p className='font-medium'>{project.tasksOpen}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Active epoch</p>
                  <p className='font-medium'>{project.epoch}</p>
                </div>
              </div>
              <Button variant='outline' className='w-full justify-between' onClick={() => navigate(`/projects/${project.id}`)}>
                Open workspace
                <ArrowRight className='size-4' />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
