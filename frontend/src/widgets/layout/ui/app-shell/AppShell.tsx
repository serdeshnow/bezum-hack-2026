import type { ReactNode } from 'react'

import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Calendar,
  CheckSquare,
  ChevronDown,
  Clock,
  FileText,
  FolderKanban,
  LogOut,
  Moon,
  Rocket,
  Search,
  Settings,
  Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { notificationQueries, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/entities/notification'
import { projectQueries } from '@/entities/project'
import { sessionService, useSessionStore } from '@/entities/session'
import { appRoutes } from '@/shared/model'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/ui'

type NavItem = {
  to: string
  label: string
  icon: typeof FolderKanban
}

const primaryNavItems: NavItem[] = [
  { to: appRoutes.projects, label: 'Projects', icon: FolderKanban },
  { to: `/epochs/epoch-q2`, label: 'Epochs', icon: Clock },
  { to: appRoutes.docs, label: 'Docs', icon: FileText },
  { to: appRoutes.tasks, label: 'Tasks', icon: CheckSquare },
  { to: appRoutes.meetings, label: 'Meetings', icon: Calendar },
  { to: appRoutes.releases, label: 'Releases', icon: Rocket }
]

const secondaryNavItems: NavItem[] = [{ to: appRoutes.settings, label: 'Settings', icon: Settings }]

function ShellLink({ item, badge }: { item: NavItem; badge?: ReactNode }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium'
          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
      }
    >
      <Icon className='size-4' />
      <span className='flex-1'>{item.label}</span>
      {badge}
    </NavLink>
  )
}

function HeaderAction({ children, tooltip }: { children: ReactNode; tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return ['Projects']
  }

  return segments.map((segment) => segment.replace(/-/g, ' '))
}

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [commandOpen, setCommandOpen] = useState(false)
  const currentUser = useSessionStore((state) => state.currentUser)
  const currentProjectId = useSessionStore((state) => state.currentProjectId)
  const setCurrentProjectId = useSessionStore((state) => state.setCurrentProjectId)
  const { data: projects = [] } = useQuery(projectQueries.list())
  const { data: notifications = [] } = useQuery(notificationQueries.list())
  const markAllRead = useMarkAllNotificationsRead()
  const markOneRead = useMarkNotificationRead()

  const unreadCount = notifications.filter((item) => !item.read).length
  const breadcrumbs = useMemo(() => buildBreadcrumbs(location.pathname), [location.pathname])

  return (
    <div className='bg-background text-foreground flex min-h-screen'>
      <aside className='bg-sidebar text-sidebar-foreground sticky top-0 flex h-screen w-64 flex-col border-r border-sidebar-border'>
        <div className='flex items-center gap-3 border-b border-sidebar-border px-5 py-5'>
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex size-10 items-center justify-center rounded-xl'>
            <Rocket className='size-5' />
          </div>
          <div>
            <p className='font-heading text-lg leading-none'>Seamless</p>
            <p className='text-muted-foreground mt-1 text-xs'>Delivery workspace</p>
          </div>
        </div>

        <div className='flex-1 space-y-6 p-4'>
          <nav className='space-y-1'>
            {primaryNavItems.map((item) => (
              <ShellLink
                key={item.to}
                item={item}
                badge={
                  item.to === appRoutes.tasks && unreadCount > 0 ? (
                    <Badge variant='secondary'>{unreadCount}</Badge>
                  ) : undefined
                }
              />
            ))}
          </nav>

          <Separator />

          <nav className='space-y-1'>
            <ShellLink
              item={{ to: appRoutes.notifications, label: 'Notifications', icon: Bell }}
              badge={unreadCount > 0 ? <Badge>{unreadCount}</Badge> : undefined}
            />
            {secondaryNavItems.map((item) => (
              <ShellLink key={item.to} item={item} />
            ))}
          </nav>
        </div>

        <div className='border-t border-sidebar-border p-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='w-full justify-between'>
                <span className='truncate'>{currentUser?.name ?? 'Anonymous'}</span>
                <ChevronDown className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>{currentUser?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  sessionService.signOut().then(() => navigate(appRoutes.auth.signIn))
                }}
              >
                <LogOut className='size-4' />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='bg-card/90 sticky top-0 z-20 border-b border-border backdrop-blur'>
          <div className='flex items-center gap-3 px-6 py-4'>
            <div className='min-w-0 flex-1'>
              <p className='text-muted-foreground text-xs uppercase tracking-[0.12em]'>Workspace</p>
              <div className='mt-1 flex flex-wrap items-center gap-2 text-sm'>
                {breadcrumbs.map((item, index) => (
                  <span key={`${item}-${index}`} className='flex items-center gap-2 capitalize'>
                    {index > 0 && <span className='text-muted-foreground'>/</span>}
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='min-w-56 justify-between'>
                  <span className='truncate'>{projects.find((project) => project.id === currentProjectId)?.name ?? 'Select project'}</span>
                  <ChevronDown className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-72'>
                <DropdownMenuLabel>Project switcher</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onSelect={() => {
                      setCurrentProjectId(project.id)
                      navigate(`/projects/${project.id}`)
                    }}
                  >
                    <FolderKanban className='size-4' />
                    {project.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <HeaderAction tooltip='Command palette'>
              <Button variant='ghost' size='icon' onClick={() => setCommandOpen((value) => !value)}>
                <Search className='size-4' />
              </Button>
            </HeaderAction>

            <HeaderAction tooltip='Toggle theme'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className='size-4' /> : <Moon className='size-4' />}
              </Button>
            </HeaderAction>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant='ghost' size='icon' className='relative'>
                  <Bell className='size-4' />
                  {unreadCount > 0 && (
                    <span className='bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px]'>
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align='end' className='w-96 p-0'>
                <div className='flex items-center justify-between p-4'>
                  <div>
                    <p className='font-medium'>Unified inbox</p>
                    <p className='text-muted-foreground text-xs'>{unreadCount} unread</p>
                  </div>
                  <Button variant='ghost' size='sm' onClick={() => markAllRead.mutate()}>
                    Mark all read
                  </Button>
                </div>
                <Separator />
                <ScrollArea className='h-[360px]'>
                  <div className='space-y-2 p-2'>
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type='button'
                        className={`w-full rounded-lg border p-3 text-left ${notification.read ? 'bg-background' : 'bg-accent/30'}`}
                        onClick={() => {
                          markOneRead.mutate(notification.id)
                          if (notification.entityId?.startsWith('doc')) navigate(`/docs/${notification.entityId}`)
                          if (notification.entityId?.startsWith('meeting')) navigate(`/meetings/${notification.entityId}`)
                        }}
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div>
                            <p className='text-sm font-medium'>{notification.title}</p>
                            <p className='text-muted-foreground text-xs'>{notification.description}</p>
                          </div>
                          {!notification.read && <Badge>New</Badge>}
                        </div>
                        <p className='text-muted-foreground mt-2 text-xs'>{notification.timestamp}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {commandOpen && (
            <div className='border-t border-border px-6 py-3'>
              <div className='flex flex-wrap gap-2'>
                {primaryNavItems.map((item) => (
                  <Button key={item.to} variant='outline' size='sm' onClick={() => navigate(item.to)}>
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </header>

        <main className='min-w-0 flex-1 px-6 py-6'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
