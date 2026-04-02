import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Badge, Card, Progress } from '@/shared/ui'
import type { ProjectsHubData } from '@/widgets/projects-hub/model/projectsHub.ts'

type ProjectsHubProps = {
  data: ProjectsHubData
}

export function ProjectsHub({ data }: ProjectsHubProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'activity'>('projects')
  const [searchValue, setSearchValue] = useState('')

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    if (!normalizedSearch) {
      return data.activeProjects
    }

    return data.activeProjects.filter((project) =>
      [project.name, project.key, project.description, project.epochName ?? ''].join(' ').toLowerCase().includes(normalizedSearch)
    )
  }, [data.activeProjects, searchValue])

  return (
    <div className='grid gap-8'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.62)_100%)]' theme='secondary'>
        <div className='grid gap-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]'>Projects Backbone</p>
              <div>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>Projects Hub</h1>
                <p className='mt-3 max-w-[72ch] text-sm leading-6 text-[color:var(--muted-foreground)]'>
                  Central navigation for project health, sprint context, delivery cadence, and the shared operating surface that the
                  rest of the product will plug into.
                </p>
              </div>
            </div>

            <div className='rounded-[24px] border border-[color:var(--border)] bg-[rgba(255,255,255,0.38)] px-4 py-3 text-sm text-[color:var(--foreground)]'>
              3 products, 2 live epochs, and a single shared context graph.
            </div>
          </div>

          <label className='grid gap-2'>
            <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Search</span>
            <input
              className='ui-control'
              placeholder='Search projects, epochs, or context notes'
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </label>
        </div>
      </Card>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5'>
        {data.quickAccess.map((item) => (
          <Link key={item.id} className='no-underline' to={item.href}>
            <Card className='h-full bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)] transition-transform hover:-translate-y-0.5' theme='secondary'>
              <div className='grid gap-4'>
                <div className='flex items-start justify-between gap-3'>
                  <Badge className={item.accentClassName} variant='outline'>
                    {item.label}
                  </Badge>
                  <span className='font-heading text-3xl leading-[1.02] text-[color:var(--foreground)]'>{item.value}</span>
                </div>
                <div>
                  <h2 className='font-heading text-2xl uppercase leading-[1.02] text-[color:var(--foreground)]'>{item.title}</h2>
                  <p className='mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]'>{item.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
        <div className='grid gap-4'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Demo Flow</p>
              <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>End-to-end walkthrough</h2>
            </div>
            <div className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]'>
              Use this sequence during the hackathon demo to move through one connected story.
            </div>
          </div>

          <div className='grid gap-3 xl:grid-cols-2'>
            {data.demoFlow.map((step) => (
              <Link
                key={step.id}
                className='ui-panel rounded-[28px] text-inherit no-underline transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-highlight)]'
                to={step.href}
              >
                <div className='grid gap-3'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant='outline'>{step.label}</Badge>
                    <p className='font-semibold text-[color:var(--foreground)]'>{step.title}</p>
                  </div>
                  <p className='text-sm leading-6 text-[color:var(--muted-foreground)]'>{step.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Card>

      <section className='grid gap-4'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='ui-segment'>
            <button
              className='ui-segment-btn'
              data-active={activeTab === 'projects'}
              type='button'
              onClick={() => setActiveTab('projects')}
            >
              Active Projects
            </button>
            <button
              className='ui-segment-btn'
              data-active={activeTab === 'activity'}
              type='button'
              onClick={() => setActiveTab('activity')}
            >
              Recent Activity
            </button>
          </div>

          <p className='text-sm text-[color:var(--muted-foreground)]'>
            {activeTab === 'projects' ? `${filteredProjects.length} project results` : `${data.recentActivity.length} recent activity items`}
          </p>
        </div>

        {activeTab === 'projects' ? (
          <div className='grid gap-5 lg:grid-cols-2 2xl:grid-cols-3'>
            {filteredProjects.map((project) => (
              <Link key={project.id} className='no-underline' to={`/projects/${project.id}`}>
                <Card className='h-full bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)] transition-transform hover:-translate-y-0.5' theme='secondary'>
                  <div className='grid gap-4'>
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <div>
                        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{project.key}</p>
                        <h2 className='font-heading mt-2 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>{project.name}</h2>
                      </div>
                      <Badge
                        variant={
                          project.status === 'active' ? 'success' : project.status === 'at-risk' ? 'warning' : project.status === 'completed' ? 'default' : 'muted'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>

                    <p className='text-sm leading-6 text-[color:var(--muted-foreground)]'>{project.description}</p>

                    <div className='grid gap-2'>
                      <div className='flex items-center justify-between text-sm text-[color:var(--muted-foreground)]'>
                        <span>Progress</span>
                        <span className='font-medium text-[color:var(--foreground)]'>{project.progressPercent}%</span>
                      </div>
                      <Progress value={project.progressPercent} />
                    </div>

                    <div className='grid grid-cols-2 gap-3 text-sm text-[color:var(--muted-foreground)]'>
                      <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3'>
                        <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Team</p>
                        <p className='mt-1 font-medium text-[color:var(--foreground)]'>{project.teamSize} members</p>
                      </div>
                      <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3'>
                        <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Tasks</p>
                        <p className='mt-1 font-medium text-[color:var(--foreground)]'>{project.openTasks} open</p>
                      </div>
                      <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3'>
                        <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Epoch</p>
                        <p className='mt-1 font-medium text-[color:var(--foreground)]'>{project.epochName ?? 'No active epoch'}</p>
                      </div>
                      <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3'>
                        <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Due</p>
                        <p className='mt-1 font-medium text-[color:var(--foreground)]'>{project.dueDate ?? 'Not set'}</p>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant={project.visibilityMode === 'customer' ? 'outline' : 'muted'}>{project.visibilityMode}</Badge>
                      {project.openBlockers > 0 ? <Badge variant='danger'>{project.openBlockers} blockers</Badge> : <Badge variant='success'>No blockers</Badge>}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className='ui-panel flex flex-wrap items-start justify-between gap-3'>
                  <div className='grid gap-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-medium text-[color:var(--foreground)]'>{activity.title}</p>
                      <Badge variant='outline'>{activity.type}</Badge>
                    </div>
                    <p className='text-sm text-[color:var(--muted-foreground)]'>{activity.description}</p>
                  </div>
                  <div className='text-right text-sm text-[color:var(--muted-foreground)]'>
                    <p>{activity.actor}</p>
                    <p className='mt-1'>{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4'>
        {data.overview.map((stat) => (
          <Card key={stat.id} className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{stat.title}</p>
              <p className='font-heading text-4xl uppercase leading-[1.02] tracking-[0.03em] text-[color:var(--foreground)]'>{stat.value}</p>
              <p className='text-sm leading-6 text-[color:var(--muted-foreground)]'>{stat.detail}</p>
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}
