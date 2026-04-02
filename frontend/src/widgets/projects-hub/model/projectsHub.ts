import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { seamlessMockDb, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'
import type { Project } from '@/shared/api/contracts/seamlessBackbone.ts'

type QuickAccessItem = {
  id: string
  title: string
  description: string
  href: string
  value: number
  label: string
  accentClassName: string
}

type ProjectCard = {
  id: string
  name: string
  key: string
  description: string
  status: Project['status']
  progressPercent: number
  teamSize: number
  openTasks: number
  dueDate: string | null
  epochName: string | null
  openBlockers: number
  visibilityMode: 'internal' | 'customer'
}

type ActivityItem = {
  id: string
  type: 'task' | 'doc' | 'meeting' | 'pr' | 'release'
  title: string
  description: string
  actor: string
  timestamp: string
}

type ProjectsOverviewStat = {
  id: string
  title: string
  value: number
  detail: string
}

type DemoFlowStep = {
  id: string
  title: string
  description: string
  href: string
  label: string
}

export type ProjectsHubData = {
  quickAccess: QuickAccessItem[]
  activeProjects: ProjectCard[]
  recentActivity: ActivityItem[]
  overview: ProjectsOverviewStat[]
  demoFlow: DemoFlowStep[]
}

function formatDate(date: string | null) {
  return date ? dayjs(date).format('MMM D, YYYY') : null
}

function formatRelative(date: string) {
  const now = dayjs('2026-04-02T09:00:00Z')
  const diffMinutes = now.diff(dayjs(date), 'minute')

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = now.diff(dayjs(date), 'hour')
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const diffDays = now.diff(dayjs(date), 'day')
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function getProjectMembersCount(projectId: string) {
  return seamlessMockDb.projectMembers.filter((member) => member.projectId === projectId).length
}

function getOpenTaskCount(projectId: string) {
  return seamlessMockDb.tasks.filter((task) => task.projectId === projectId && !['done', 'cancelled'].includes(task.status)).length
}

function getBlockedGoalCount(project: Project) {
  if (!project.activeEpochId) return 0
  return seamlessMockDb.goals.filter((goal) => goal.epochId === project.activeEpochId && goal.status === 'blocked').length
}

function buildProjectCard(project: Project): ProjectCard {
  const activeEpoch = project.activeEpochId ? seamlessMockDb.epochs.find((epoch) => epoch.id === project.activeEpochId) : null

  return {
    id: project.id,
    name: project.name,
    key: project.key,
    description: project.description,
    status: project.status,
    progressPercent: project.progressPercent,
    teamSize: getProjectMembersCount(project.id),
    openTasks: getOpenTaskCount(project.id),
    dueDate: formatDate(project.dueDate),
    epochName: activeEpoch?.name ?? null,
    openBlockers: getBlockedGoalCount(project),
    visibilityMode: project.visibilityMode
  }
}

function buildRecentActivity(): ActivityItem[] {
  const taskActivities = seamlessMockDb.tasks.map((task) => ({
    id: `task-${task.id}`,
    type: 'task' as const,
    title: task.status === 'done' ? 'Task completed' : 'Task updated',
    description: `${task.key} ${task.title}`,
    actor: seamlessMockDb.users.find((user) => user.id === task.assigneeUserId)?.firstName ?? 'Unassigned',
    timestamp: task.updatedAt
  }))

  const documentActivities = seamlessMockDb.documents.map((document) => ({
    id: `doc-${document.id}`,
    type: 'doc' as const,
    title: 'Document updated',
    description: document.title,
    actor: seamlessMockDb.users.find((user) => user.id === document.authorUserId)?.firstName ?? 'Unknown',
    timestamp: document.updatedAt
  }))

  const prActivities = seamlessMockDb.pullRequests.map((pullRequest) => ({
    id: `pr-${pullRequest.id}`,
    type: 'pr' as const,
    title: pullRequest.status === 'merged' ? 'PR merged' : 'PR updated',
    description: `#${pullRequest.number} ${pullRequest.title}`,
    actor: seamlessMockDb.users.find((user) => user.id === pullRequest.authorUserId)?.firstName ?? 'Unknown',
    timestamp: pullRequest.updatedAt
  }))

  const meetingActivities = seamlessMockDb.meetings.map((meeting) => ({
    id: `meeting-${meeting.id}`,
    type: 'meeting' as const,
    title: meeting.status === 'completed' ? 'Meeting recap ready' : 'Meeting scheduled',
    description: meeting.title,
    actor: 'System',
    timestamp: meeting.updatedAt
  }))

  const releaseActivities = seamlessMockDb.releases.map((release) => ({
    id: `release-${release.id}`,
    type: 'release' as const,
    title: release.status === 'deployed' ? 'Release deployed' : 'Release updated',
    description: `${release.version} ${release.title}`,
    actor: seamlessMockDb.users.find((user) => user.id === release.authorUserId)?.firstName ?? 'Unknown',
    timestamp: release.updatedAt
  }))

  return [...taskActivities, ...documentActivities, ...prActivities, ...meetingActivities, ...releaseActivities]
    .sort((left, right) => dayjs(right.timestamp).valueOf() - dayjs(left.timestamp).valueOf())
    .slice(0, 6)
    .map((activity) => ({ ...activity, timestamp: formatRelative(activity.timestamp) }))
}

function buildProjectsHubData(): ProjectsHubData {
  const activeProjects = seamlessMockDb.projects
    .filter((project) => project.status !== 'archived')
    .map(buildProjectCard)
    .sort((left, right) => right.progressPercent - left.progressPercent)

  return {
    quickAccess: [
      {
        id: 'tasks',
        title: 'Tasks',
        description: 'Operational execution across all active projects.',
        href: '/tasks',
        value: seamlessMockDb.tasks.filter((task) => !['done', 'cancelled'].includes(task.status)).length,
        label: 'open',
        accentClassName: 'bg-[color:var(--accent-soft)] text-[color:var(--accent)] border-[color:var(--accent)]'
      },
      {
        id: 'docs',
        title: 'Documentation',
        description: 'Versioned docs and approval-aware context.',
        href: '/docs',
        value: seamlessMockDb.documents.length,
        label: 'documents',
        accentClassName: 'bg-[color:#e9e2db] text-[color:#705d4b] border-[color:#bda894]'
      },
      {
        id: 'epochs',
        title: 'Epochs',
        description: 'Sprint planning, goals, and release readiness.',
        href: '/epochs',
        value: seamlessMockDb.epochs.filter((epoch) => epoch.status === 'active').length,
        label: 'active',
        accentClassName: 'bg-[color:var(--warning-soft)] text-[color:var(--warning)] border-[color:var(--warning)]'
      },
      {
        id: 'meetings',
        title: 'Meetings',
        description: 'Scheduling, recap, and project decisions.',
        href: '/meetings',
        value: seamlessMockDb.meetings.filter((meeting) => meeting.status === 'scheduled').length,
        label: 'upcoming',
        accentClassName: 'bg-[color:var(--success-soft)] text-[color:var(--success)] border-[color:var(--success)]'
      },
      {
        id: 'releases',
        title: 'Releases',
        description: 'Delivery bridge from tasks to production.',
        href: '/releases',
        value: seamlessMockDb.releases.length,
        label: 'tracked',
        accentClassName: 'bg-[color:var(--danger-soft)] text-[color:var(--danger)] border-[color:var(--danger)]'
      }
    ],
    activeProjects,
    recentActivity: buildRecentActivity(),
    overview: [
      {
        id: 'projects',
        title: 'Active Projects',
        value: activeProjects.filter((project) => project.status === 'active' || project.status === 'at-risk').length,
        detail: 'Visible in the shared delivery workspace'
      },
      {
        id: 'tasks',
        title: 'Open Tasks',
        value: seamlessMockDb.tasks.filter((task) => !['done', 'cancelled'].includes(task.status)).length,
        detail: 'Across all non-archived projects'
      },
      {
        id: 'members',
        title: 'Team Members',
        value: new Set(seamlessMockDb.projectMembers.map((member) => member.userId)).size,
        detail: 'Active contributors in the backbone scope'
      },
      {
        id: 'releases',
        title: 'Tracked Releases',
        value: seamlessMockDb.releases.length,
        detail: 'Including planned and deployed releases'
      }
    ],
    demoFlow: [
      {
        id: 'overview',
        title: 'Atlas Commerce overview',
        description: 'Start with the main project context and the current sprint health.',
        href: '/projects/project-1',
        label: 'Step 1'
      },
      {
        id: 'task',
        title: 'Checkout task workspace',
        description: 'Open the implementation thread that ties docs, meetings, PRs, and release together.',
        href: '/tasks/task-1',
        label: 'Step 2'
      },
      {
        id: 'doc',
        title: 'Architecture document',
        description: 'Show the linked delivery narrative, widgets, and approval context.',
        href: '/docs/doc-1',
        label: 'Step 3'
      },
      {
        id: 'meeting',
        title: 'Meeting recap',
        description: 'Demonstrate transcript, summary, decisions, and action items flowing back into the product graph.',
        href: '/meetings/meeting-1',
        label: 'Step 4'
      },
      {
        id: 'delivery',
        title: 'Release dashboard',
        description: 'Show how tasks and PRs converge into the release package and delivery readiness.',
        href: '/releases',
        label: 'Step 5'
      },
      {
        id: 'notifications',
        title: 'Unified inbox',
        description: 'Close the loop with approvals, meeting requests, mentions, and delivery alerts in one feed.',
        href: '/notifications',
        label: 'Step 6'
      }
    ]
  }
}

async function getProjectsHubData() {
  return withMockLatency(buildProjectsHubData())
}

export const projectsHubQueries = {
  list: () =>
    queryOptions({
      queryKey: ['backbone', 'projects-hub'],
      queryFn: getProjectsHubData
    })
}
