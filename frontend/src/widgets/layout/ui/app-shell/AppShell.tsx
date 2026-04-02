import type { ReactNode } from 'react'

import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Calendar,
  CheckSquare,
  Clock,
  Code,
  FileText,
  FolderKanban,
  LogOut,
  Plus,
  Rocket,
  Search,
  Settings,
  User,
  Users
} from 'lucide-react'
import { notificationQueries } from '@/entities/notification'
import { sessionService, useSessionStore } from '@/entities/session'
import { taskQueries } from '@/entities/task'
import { NotificationInboxPopover } from '@/features/notification/mark-read'
import { ProjectSwitcher } from '@/features/project/switcher'
import { ThemeToggleButton } from '@/features/theme/toggle'
import { TaskStatus } from '@/shared/api'
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
  Input,
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
  { to: '/epochs/epoch-q2', label: 'Epochs', icon: Clock },
  { to: appRoutes.docs, label: 'Docs', icon: FileText },
  { to: appRoutes.tasks, label: 'Tasks', icon: CheckSquare },
  { to: appRoutes.meetings, label: 'Meetings', icon: Calendar },
  { to: appRoutes.releases, label: 'Releases', icon: Rocket }
]

const secondaryNavItems: NavItem[] = [
  { to: appRoutes.notifications, label: 'Notifications', icon: Bell },
  { to: appRoutes.settings, label: 'Settings', icon: Settings }
]

function ShellLink({ item, badge }: { item: NavItem; badge?: ReactNode }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        isActive
          ? 'bg-secondary text-sidebar-foreground flex min-h-8 items-center gap-3 rounded-[5px] px-2.5 py-1.5 text-sm font-medium'
          : 'text-sidebar-foreground hover:bg-secondary/70 flex min-h-8 items-center gap-3 rounded-[5px] px-2.5 py-1.5 text-sm font-medium transition-colors'
      }
    >
      <Icon className='size-[18px] shrink-0' />
      <span className='flex-1 truncate'>{item.label}</span>
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

  if (segments.length === 0 || pathname === appRoutes.projects) {
    return ['Projects']
  }

  return segments.map((segment) => segment.replace(/-/g, ' '))
}

function formatRoleLabel(role?: string) {
  if (!role) return 'Member'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function getRoleIcon(role?: string) {
  if (role === 'developer') return Code
  if (role === 'manager') return Users
  return User
}

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const currentUser = useSessionStore((state) => state.currentUser)
  const { data: tasks = [] } = useQuery(taskQueries.list())
  const { data: notifications } = useQuery(notificationQueries.list())

  const openTaskCount = tasks.filter((task) => task.status !== TaskStatus.Done && task.status !== TaskStatus.Cancelled).length
  const unreadNotificationCount = notifications?.unreadCount ?? 0
  const breadcrumbs = useMemo(() => buildBreadcrumbs(location.pathname), [location.pathname])
  const roleLabel = formatRoleLabel(currentUser?.role)
  const RoleIcon = getRoleIcon(currentUser?.role)
  const commandItems = useMemo(() => [...primaryNavItems, ...secondaryNavItems], [])
  const filteredCommandItems = useMemo(
    () => commandItems.filter((item) => item.label.toLowerCase().includes(commandQuery.toLowerCase())),
    [commandItems, commandQuery]
  )

  function goToRoute(path: string) {
    navigate(path)
    setCommandOpen(false)
    setCommandQuery('')
  }

  return (
    <div className='bg-background text-foreground flex min-h-screen items-stretch'>
      <aside className='bg-sidebar text-sidebar-foreground flex min-h-screen w-56 shrink-0 flex-col border-r border-sidebar-border'>
        <div className='flex h-14 items-center border-b border-sidebar-border px-4'>
          <div className='flex items-center gap-2'>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex size-7 items-center justify-center rounded-md'>
              <Rocket className='size-[18px]' />
            </div>
            <div className='leading-tight'>
              <p className='text-sm font-semibold'>DevStudio</p>
              <p className='text-muted-foreground text-xs'>Platform</p>
            </div>
          </div>
        </div>

        <ScrollArea className='flex-1'>
          <div className='space-y-3.5 p-3.5'>
            <nav className='space-y-1'>
              {primaryNavItems.map((item) => (
                <ShellLink
                  key={item.to}
                  item={item}
                  badge={
                    item.to === appRoutes.tasks && openTaskCount > 0 ? (
                      <Badge className='rounded-[5px] px-2 py-0.5 text-[12px]'>{openTaskCount}</Badge>
                    ) : undefined
                  }
                />
              ))}
            </nav>

            <Separator className='bg-sidebar-border' />

            <nav className='space-y-1'>
              {secondaryNavItems.map((item) => (
                <ShellLink
                  key={item.to}
                  item={item}
                  badge={
                    item.to === appRoutes.notifications && unreadNotificationCount > 0 ? (
                      <Badge className='rounded-[5px] px-2 py-0.5 text-[12px]'>{unreadNotificationCount}</Badge>
                    ) : undefined
                  }
                />
              ))}
            </nav>
          </div>
        </ScrollArea>

        <div className='mt-auto border-t border-sidebar-border px-3.5 py-4'>
          <p className='text-muted-foreground text-xs'>© 2026 DevStudio</p>
        </div>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='bg-card sticky top-0 z-20'>
          <header className='flex h-14 items-center gap-4 border-b border-border px-5'>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2 text-sm'>
                {breadcrumbs.map((item, index) => (
                  <span key={`${item}-${index}`} className='flex items-center gap-2 capitalize'>
                    {index > 0 && <span className='text-muted-foreground'>/</span>}
                    <span className={index === breadcrumbs.length - 1 ? 'text-foreground' : 'text-muted-foreground'}>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <HeaderAction tooltip='Search (⌘K)'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8 rounded-[5px]'
                  onClick={() => {
                    setCommandOpen((value) => !value)
                    setCommandQuery('')
                  }}
                >
                  <Search className='size-[18px]' />
                </Button>
              </HeaderAction>

              <Separator orientation='vertical' className='h-6' />

              <HeaderAction tooltip='Create project'>
                <Button
                  size='icon'
                  className='size-8 rounded-[5px]'
                  onClick={() => navigate(appRoutes.projects)}
                >
                  <Plus className='size-[18px]' />
                </Button>
              </HeaderAction>

              <NotificationInboxPopover />

              <HeaderAction tooltip='Toggle theme'>
                <ThemeToggleButton />
              </HeaderAction>

              <Separator orientation='vertical' className='h-6' />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type='button'>
                    <Badge className='gap-1.5 rounded-[5px] px-2 py-0.5 text-[12px] font-medium'>
                      <RoleIcon className='size-3' />
                      {roleLabel}
                    </Badge>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel className='space-y-1'>
                    <div className='font-medium'>{currentUser?.name ?? 'Anonymous'}</div>
                    <div className='text-muted-foreground text-xs font-normal'>{currentUser?.email ?? 'No email'}</div>
                  </DropdownMenuLabel>
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
          </header>

          <div className='border-b border-border px-5 pt-3.5 pb-3'>
            <ProjectSwitcher />
          </div>

          {commandOpen && (
            <div className='border-b border-border px-5 py-3'>
              <div className='space-y-3'>
                <Input
                  value={commandQuery}
                  onChange={(event) => setCommandQuery(event.target.value)}
                  placeholder='Search destinations, inbox, settings, releases...'
                  autoFocus
                />
                <div className='flex flex-wrap gap-2'>
                  {filteredCommandItems.map((item) => (
                    <Button key={item.to} variant='outline' size='sm' onClick={() => goToRoute(item.to)}>
                      {item.label}
                    </Button>
                  ))}
                  {!filteredCommandItems.length && (
                    <span className='text-muted-foreground text-sm'>No matching destinations.</span>
                  )}
                </div>
                <div className='flex flex-wrap gap-2'>
                  <Button size='sm' onClick={() => goToRoute(appRoutes.projects)}>
                    <Plus className='size-4' />
                    Open project hub
                  </Button>
                  <Button variant='outline' size='sm' onClick={() => goToRoute(appRoutes.docs)}>
                    Review docs
                  </Button>
                  <Button variant='outline' size='sm' onClick={() => goToRoute(appRoutes.notifications)}>
                    Unified inbox
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <main className='min-w-0 flex-1 overflow-x-hidden px-6 py-6'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
