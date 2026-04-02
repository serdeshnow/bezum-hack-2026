import cn from 'classnames'
import { useQuery } from '@tanstack/react-query'

import { NavLink, Outlet, useLocation } from 'react-router'

import { templateConfig } from '@/shared/config'
import { corePathKeys } from '@/shared/model/coreRouter.ts'
import { Badge, Card } from '@/shared/ui'
import { projectsHubQueries } from '@/widgets/projects-hub/model/projectsHub.ts'
import { unifiedInboxQueries } from '@/widgets/unified-inbox/model/unifiedInbox.ts'

function NavigationLink({ label, to }: { label: string; to: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'ui-btn justify-start shadow-none',
          isActive
            ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-[var(--shadow-card)]'
            : 'ui-btn-secondary text-[color:var(--muted-foreground)]'
        )
      }
    >
      {label}
    </NavLink>
  )
}

const navigationItems = [
  { label: 'Projects', to: corePathKeys.projects },
  { label: 'Epochs', to: corePathKeys.epochs },
  { label: 'Docs', to: corePathKeys.docs },
  { label: 'Tasks', to: corePathKeys.tasks },
  { label: 'Meetings', to: corePathKeys.meetings },
  { label: 'Releases', to: corePathKeys.releases },
  { label: 'Notifications', to: corePathKeys.notifications },
  { label: 'Settings', to: corePathKeys.settings }
] as const

const quickActions = [
  { label: 'Create Task', to: corePathKeys.tasks },
  { label: 'Create Doc', to: corePathKeys.docs },
  { label: 'Schedule Meeting', to: corePathKeys.meetings }
] as const

const breadcrumbMap: Record<string, string> = {
  projects: 'Projects',
  epochs: 'Epochs',
  tasks: 'Tasks',
  docs: 'Docs',
  meetings: 'Meetings',
  releases: 'Releases',
  notifications: 'Notifications',
  settings: 'Settings',
  history: 'History'
}

function buildBreadcrumbs(pathname: string) {
  if (pathname === corePathKeys.home || pathname === corePathKeys.projects) {
    return [{ label: 'Projects', to: corePathKeys.projects }]
  }

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: Array<{ label: string; to?: string }> = []
  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`

    if (index === 1 && segments[0] === 'projects') {
      breadcrumbs.push({ label: 'Project Overview' })
      return
    }

    if (index === 1 && segments[0] === 'epochs') {
      breadcrumbs.push({ label: 'Epoch Workspace' })
      return
    }

    if (index === 1 && segments[0] === 'tasks') {
      breadcrumbs.push({ label: 'Task Details' })
      return
    }

    if (index === 1 && segments[0] === 'docs') {
      breadcrumbs.push({ label: 'Document Editor', to: currentPath })
      return
    }

    if (index === 2 && segments[0] === 'docs' && segment === 'history') {
      breadcrumbs.push({ label: 'History' })
      return
    }

    if (index === 1 && segments[0] === 'meetings') {
      breadcrumbs.push({ label: 'Meeting Recap' })
      return
    }

    const label = breadcrumbMap[segment] ?? segment
    const to = index === segments.length - 1 ? undefined : currentPath

    breadcrumbs.push({ label, to })
  })

  return breadcrumbs
}

export function TemplateShell() {
  const location = useLocation()
  const breadcrumbs = buildBreadcrumbs(location.pathname)
  const projectsHubQuery = useQuery(projectsHubQueries.list())
  const unifiedInboxQuery = useQuery(unifiedInboxQueries.inbox())
  const projectOptions = projectsHubQuery.data?.activeProjects ?? []
  const inboxSummary = unifiedInboxQuery.data?.summary ?? []
  const unreadCount = inboxSummary.find((item) => item.id === 'unread')?.value ?? 0
  const approvalsCount = inboxSummary.find((item) => item.id === 'approvals')?.value ?? 0
  const deliveryCount = inboxSummary.find((item) => item.id === 'delivery')?.value ?? 0

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_30%),radial-gradient(circle_at_right_10%,rgba(95,143,139,0.16),transparent_22%),linear-gradient(180deg,#f6f3ed_0%,#f2f0eb_34%,#ece9e2_100%)] text-[color:var(--foreground)]'>
      <div className='mx-auto grid min-h-screen w-full max-w-[1700px] gap-5 px-4 py-3 md:px-5 lg:grid-cols-[272px_minmax(0,1fr)] lg:px-6 xl:gap-6 xl:px-8 xl:py-4 2xl:grid-cols-[292px_minmax(0,1fr)]'>
        <aside className='lg:sticky lg:top-3 lg:h-[calc(100vh-24px)] xl:top-4 xl:h-[calc(100vh-32px)]'>
          <Card className='flex h-full flex-col gap-6 bg-[linear-gradient(180deg,rgba(247,245,241,0.95)_0%,rgba(234,232,227,0.98)_100%)] backdrop-blur' theme='secondary'>
            <div className='grid gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]'>Project OS</p>
              <div>
                <h1 className='font-heading text-3xl uppercase leading-[1.05] tracking-[0.03em] text-[color:var(--foreground)]'>
                  {templateConfig.appName}
                </h1>
                <p className='mt-2 max-w-[24ch] text-sm leading-6 text-[color:var(--muted-foreground)]'>{templateConfig.appDescription}</p>
              </div>
            </div>

            <div className='grid gap-2'>
              <label className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]' htmlFor='project-switcher'>
                Project Switcher
              </label>
              <select
                id='project-switcher'
                className='ui-control'
                defaultValue={projectOptions[0]?.id ?? 'project-1'}
              >
                {projectOptions.length > 0 ? (
                  projectOptions.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                ) : (
                  <option value='project-1'>Atlas Commerce</option>
                )}
              </select>
            </div>

            <nav className='grid gap-2' aria-label='Primary'>
              {navigationItems.map((item) => (
                <NavigationLink key={item.to} label={item.label} to={item.to} />
              ))}
            </nav>

            <div className='mt-auto'>
              <Card className='border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.38)_0%,rgba(244,241,235,0.82)_100%)]' size='sm' theme='secondary'>
                <div className='grid gap-3'>
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Role</p>
                    <div className='mt-1 flex items-center gap-2'>
                      <p className='text-sm font-medium text-[color:var(--foreground)]'>Manager view</p>
                      <Badge variant='outline'>Customer-aware</Badge>
                    </div>
                  </div>
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Inbox</p>
                    <p className='mt-1 text-sm text-[color:var(--muted-foreground)]'>
                      {unreadCount} unread, {approvalsCount} approvals, {deliveryCount} delivery updates
                    </p>
                    <NavLink className='mt-2 inline-flex text-sm font-medium text-[color:var(--foreground)] transition-colors hover:text-[color:var(--accent)]' to={corePathKeys.notifications}>
                      Open unified inbox
                    </NavLink>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </aside>

        <div className='grid min-w-0 gap-6 pb-8'>
          <header className='sticky top-4 z-10'>
            <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.9)_100%)] backdrop-blur' theme='secondary'>
              <div className='grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_auto]'>
                <div className='grid gap-3'>
                  <div className='flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted-foreground)]'>
                    {breadcrumbs.map((crumb, index) => (
                      <div key={`${crumb.label}-${index}`} className='flex items-center gap-2'>
                        {index > 0 && <span aria-hidden='true'>/</span>}
                        {crumb.to ? (
                          <NavLink className='font-medium text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]' to={crumb.to}>
                            {crumb.label}
                          </NavLink>
                        ) : (
                          <span className='font-medium text-[color:var(--foreground)]'>{crumb.label}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Global Search</p>
                      <button
                        className='ui-control mt-2 justify-start text-left text-[color:var(--muted-foreground)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--foreground)]'
                        type='button'
                      >
                        Search projects, tasks, docs, meetings, or releases
                      </button>
                    </div>

                    <div className='rounded-[22px] border border-[color:var(--accent)] bg-[color:var(--accent-soft)] px-4 py-3 text-sm text-[color:var(--foreground)]'>
                      Unified context is now anchored to one shared shell.
                    </div>
                  </div>
                </div>

                <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-3'>
                  {quickActions.map((action) => (
                    <NavLink
                      key={action.to}
                      to={action.to}
                      className='ui-btn ui-btn-primary'
                    >
                      {action.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </Card>
          </header>

          <main className='min-w-0'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
