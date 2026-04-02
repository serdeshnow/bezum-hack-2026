import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  FolderOpen,
  Plus,
  Rocket,
  Search,
  Users
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { documentQueries } from '@/entities/document'
import { meetingQueries } from '@/entities/meeting'
import { notificationQueries } from '@/entities/notification'
import { projectQueries, useCreateProject } from '@/entities/project'
import { releaseQueries } from '@/entities/release'
import { taskQueries } from '@/entities/task'
import { TaskStatus } from '@/shared/api'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  PageState,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea
} from '@/shared/ui'

function ProjectProgress({ value }: { value: number }) {
  return (
    <div className='bg-foreground/20 h-[7px] w-full overflow-hidden rounded-full'>
      <div className='bg-foreground h-full rounded-full transition-all' style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function ProjectsListWidget() {
  const navigate = useNavigate()
  const createProject = useCreateProject()
  const { data: projects, isLoading, error } = useQuery(projectQueries.list())
  const { data: tasks = [] } = useQuery(taskQueries.list())
  const { data: documents = [] } = useQuery(documentQueries.list())
  const { data: scheduler } = useQuery(meetingQueries.scheduler())
  const { data: releases } = useQuery(releaseQueries.dashboard())
  const { data: notifications } = useQuery(notificationQueries.list())
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')

  const activeProjects = useMemo(() => (projects ?? []).filter((project) => project.status === 'active'), [projects])
  const openTasks = useMemo(
    () => tasks.filter((task) => task.status !== TaskStatus.Done && task.status !== TaskStatus.Cancelled),
    [tasks]
  )
  const totalTeamMembers = useMemo(
    () => activeProjects.reduce((total, project) => total + project.teamSize, 0),
    [activeProjects]
  )

  const handleCreateProject = () => {
    createProject.mutate(
      {
        name: draftName.trim() || 'Untitled project',
        description: draftDescription.trim() || 'New delivery workspace'
      },
      {
        onSuccess: (project) => {
          setIsCreateOpen(false)
          setDraftName('')
          setDraftDescription('')
          toast.success('Project created')
          navigate(`/projects/${project.id}`)
        },
        onError: (mutationError) => {
          toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to create project')
        }
      }
    )
  }

  if (isLoading) {
    return <PageState state='loading' title='Loading projects' description='Preparing project workspace overview.' />
  }

  if (error) {
    return <PageState state='error' title='Failed to load projects' description='Project list could not be resolved.' />
  }

  if (!projects?.length) {
    return (
      <>
        <PageState
          state='empty'
          title='No projects yet'
          description='Create a project to start delivery planning.'
          action={{ label: 'Create project', onClick: () => setIsCreateOpen(true) }}
        />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>Create a backend project and open its workspace immediately.</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <Input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder='Seamless Platform' />
              <Textarea
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
                placeholder='What the project is delivering and why it matters.'
              />
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={createProject.isPending}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  const quickAccessCards = [
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Manage project tasks',
      icon: CheckSquare,
      href: '/tasks',
      value: openTasks.length,
      label: 'Open',
      iconClassName: 'bg-[#d8e7ff] text-[#246bfd]'
    },
    {
      id: 'docs',
      title: 'Documentation',
      description: 'Browse project docs',
      icon: FileText,
      href: '/docs',
      value: documents.length,
      label: 'Documents',
      iconClassName: 'bg-[#f2ddff] text-[#9333ea]'
    },
    {
      id: 'epochs',
      title: 'Epochs',
      description: 'Sprint planning',
      icon: Clock,
      href: '/epochs/epoch-q2',
      value: new Set(projects.map((project) => project.epoch).filter(Boolean)).size,
      label: 'Active',
      iconClassName: 'bg-[#ffe8c7] text-[#f97316]'
    },
    {
      id: 'meetings',
      title: 'Meetings',
      description: 'Schedule & recap',
      icon: Calendar,
      href: '/meetings',
      value: scheduler?.timeSlots.length ?? 0,
      label: 'Upcoming',
      iconClassName: 'bg-[#d9fbe0] text-[#16a34a]'
    },
    {
      id: 'releases',
      title: 'Releases',
      description: 'Track deployments',
      icon: Rocket,
      href: '/releases',
      value: releases?.releases.length ?? 0,
      label: 'This Month',
      iconClassName: 'bg-[#ffdfe1] text-[#ef4444]'
    }
  ]

  const overviewCards = [
    { id: 'projects', title: 'Active Projects', value: activeProjects.length, description: `${activeProjects.length} live workstreams`, icon: FolderOpen },
    { id: 'tasks', title: 'Open Tasks', value: openTasks.length, description: 'Across all projects', icon: CheckSquare },
    { id: 'team', title: 'Team Members', value: totalTeamMembers, description: 'Active contributors', icon: Users },
    { id: 'releases', title: 'Releases', value: releases?.releases.length ?? 0, description: 'Current delivery window', icon: Rocket }
  ]

  return (
    <section className='-mx-6 -mt-6 -mb-6 bg-background'>
      <div className='bg-card border-b border-border px-6 py-6'>
        <div className='space-y-4'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='space-y-1'>
              <h1 className='text-2xl font-bold md:text-[30px] md:leading-10'>Projects Hub</h1>
              <p className='text-muted-foreground text-sm'>Central navigation for all development activities</p>
            </div>
            <Button className='h-8 rounded-[5px] px-4 text-sm font-medium' onClick={() => setIsCreateOpen(true)}>
              <Plus className='size-4' />
              New Project
            </Button>
          </div>

          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input placeholder='Search projects, tasks, docs...' className='h-8 rounded-[5px] pl-9 text-sm' />
          </div>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>Create a backend project and open its workspace immediately.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <Input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder='Seamless Platform' />
            <Textarea
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
              placeholder='What the project is delivering and why it matters.'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={createProject.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='px-6 py-6'>
        <div className='space-y-7'>
          <section className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Quick Access</h2>
              <Button variant='ghost' size='sm' className='h-7 rounded-[5px] px-3 text-sm font-medium'>
                View All
              </Button>
            </div>

            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
              {quickAccessCards.map((card) => {
                const Icon = card.icon

                return (
                  <Card
                    key={card.id}
                    className='bg-card hover:border-foreground/40 flex min-h-[206px] cursor-pointer flex-col rounded-[11px] border-border transition-colors'
                    onClick={() => navigate(card.href)}
                  >
                    <CardHeader className='space-y-5 p-5 pb-0'>
                      <div className={`flex size-[42px] items-center justify-center rounded-[7px] ${card.iconClassName}`}>
                        <Icon className='size-5' />
                      </div>
                      <div className='space-y-1'>
                        <CardTitle className='text-sm font-normal'>{card.title}</CardTitle>
                        <CardDescription className='text-sm leading-[1.45]'>{card.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className='mt-auto flex items-end gap-2 p-5 pt-4'>
                      <span className='text-[30px] leading-10 font-bold'>{card.value}</span>
                      <span className='text-muted-foreground pb-1 text-sm'>{card.label}</span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <section className='space-y-4'>
            <Tabs defaultValue='projects' className='gap-4'>
              <TabsList className='bg-muted h-8 rounded-[11px] p-[3px]'>
                <TabsTrigger value='projects' className='h-[25px] rounded-[9px] px-4 text-sm data-[state=active]:bg-card'>
                  Active Projects
                </TabsTrigger>
                <TabsTrigger value='activity' className='h-[25px] rounded-[9px] px-4 text-sm data-[state=active]:bg-card'>
                  Recent Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value='projects'>
                <div className='grid gap-5 xl:grid-cols-2'>
                  {activeProjects.map((project) => (
                    <Card
                      key={project.id}
                      className='bg-card hover:border-foreground/40 rounded-[11px] border-border transition-colors'
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <CardHeader className='space-y-5 p-5 pb-0'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='bg-muted flex size-[35px] items-center justify-center rounded-[7px]'>
                            <FolderOpen className='text-foreground size-[18px]' />
                          </div>
                          <Badge className='rounded-[5px] px-2 py-0.5 text-[12px]'>Active</Badge>
                        </div>
                        <div className='space-y-2'>
                          <CardTitle className='text-sm font-normal'>{project.name}</CardTitle>
                          <CardDescription className='max-w-[28rem] text-sm leading-[1.45]'>{project.description}</CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className='space-y-4 p-5'>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='text-muted-foreground'>Progress</span>
                            <span className='font-medium'>{project.progress}%</span>
                          </div>
                          <ProjectProgress value={project.progress} />
                        </div>

                        <div className='grid gap-2.5 text-sm md:grid-cols-2'>
                          <div className='flex items-center gap-2'>
                            <Users className='text-muted-foreground size-4' />
                            <span>{project.teamSize} members</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <CheckSquare className='text-muted-foreground size-4' />
                            <span>{project.tasksOpen} tasks</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Clock className='text-muted-foreground size-4' />
                            <span className='truncate'>{project.epoch ?? 'No epoch'}</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Calendar className='text-muted-foreground size-4' />
                            <span className='truncate'>{project.dueDate ?? 'TBD'}</span>
                          </div>
                        </div>

                        {project.tasksOpen > 0 && (
                          <div className='bg-destructive/10 border-destructive/50 flex items-center gap-2 rounded-[7px] border px-3 py-2 text-sm text-destructive'>
                            <AlertCircle className='size-4 shrink-0' />
                            <span>{Math.min(project.tasksOpen, 9)} open blockers</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='activity'>
                <Card className='bg-card rounded-[11px] border-border'>
                  <CardHeader className='p-5 pb-0'>
                    <CardTitle className='text-lg font-semibold'>Recent Activity</CardTitle>
                    <CardDescription className='text-sm'>Latest updates across all projects</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4 p-5'>
                    {(notifications?.items ?? []).slice(0, 4).map((notification) => (
                      <div key={notification.id} className='border-border flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0'>
                        <div className='bg-muted flex size-10 shrink-0 items-center justify-center rounded-[7px]'>
                          {notification.type === 'task' && <CheckSquare className='size-5 text-primary' />}
                          {notification.type === 'doc' && <FileText className='size-5 text-accent' />}
                          {notification.type === 'meeting' && <Calendar className='size-5 text-accent' />}
                          {(notification.type === 'release' || notification.type === 'pr') && (
                            <Rocket className='size-5 text-destructive' />
                          )}
                          {!['task', 'doc', 'meeting', 'release', 'pr'].includes(notification.type) && (
                            <FolderOpen className='size-5 text-muted-foreground' />
                          )}
                        </div>
                        <div className='min-w-0 flex-1 space-y-1'>
                          <p className='text-sm font-medium'>{notification.title}</p>
                          <p className='text-muted-foreground text-sm'>{notification.description}</p>
                          <p className='text-muted-foreground text-xs'>
                            {notification.user.name} • {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          <section className='space-y-4'>
            <h2 className='text-lg font-semibold'>Overview</h2>
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
              {overviewCards.map((card) => {
                const Icon = card.icon

                return (
                  <Card key={card.id} className='bg-card rounded-[11px] border-border'>
                    <CardHeader className='flex flex-row items-center justify-between gap-3 p-5 pb-0'>
                      <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
                      <Icon className='text-muted-foreground size-4' />
                    </CardHeader>
                    <CardContent className='space-y-1 p-5'>
                      <div className='text-[30px] leading-10 font-bold'>{card.value}</div>
                      <p className='text-muted-foreground text-xs'>{card.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
