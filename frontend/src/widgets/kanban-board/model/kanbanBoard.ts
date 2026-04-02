import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { seamlessMockDb, updateMockTaskStatus, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'
import type { Task } from '@/shared/api/contracts/seamlessBackbone.ts'

export type KanbanLaneId = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'

type BoardSummary = {
  id: string
  label: string
  value: number
  detail: string
}

type BoardProject = {
  id: string
  key: string
  name: string
}

export type KanbanCard = {
  id: string
  key: string
  title: string
  description: string
  status: KanbanLaneId
  priority: Task['priority']
  assigneeName: string | null
  assigneeInitials: string | null
  dueDate: string | null
  projectName: string
  projectKey: string
  epochName: string | null
  releaseVersion: string | null
  linkedDocs: number
  linkedMeetings: number
  linkedPullRequests: number
  blockerCount: number
  tags: string[]
}

export type KanbanLane = {
  id: KanbanLaneId
  title: string
  description: string
  cards: KanbanCard[]
}

export type KanbanBoardData = {
  summary: BoardSummary[]
  projects: BoardProject[]
  lanes: KanbanLane[]
}

function initials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(date: string | null) {
  return date ? dayjs(date).format('MMM D') : null
}

function isBoardStatus(status: Task['status']): status is KanbanLaneId {
  return status === 'backlog' || status === 'todo' || status === 'in-progress' || status === 'review' || status === 'done'
}

function resolveLinkedPullRequests(task: Task) {
  return seamlessMockDb.pullRequests.filter(
    (pullRequest) =>
      pullRequest.projectId === task.projectId &&
      (pullRequest.releaseId === task.releaseId ||
        pullRequest.title.toLowerCase().includes(task.key.toLowerCase()) ||
        pullRequest.branch.toLowerCase().includes(task.key.toLowerCase()))
  )
}

function resolveBlockerCount(task: Task) {
  const epochBlockers = task.epochId
    ? seamlessMockDb.goals.filter((goal) => goal.epochId === task.epochId && goal.status === 'blocked').length
    : 0
  const overdueRisk = task.dueDate && dayjs(task.dueDate).isBefore(dayjs('2026-04-02')) && !['done', 'cancelled'].includes(task.status) ? 1 : 0

  return epochBlockers + overdueRisk
}

function buildCard(task: Task): KanbanCard | null {
  if (!isBoardStatus(task.status)) {
    return null
  }

  const assignee = task.assigneeUserId ? seamlessMockDb.users.find((user) => user.id === task.assigneeUserId) : null
  const project = seamlessMockDb.projects.find((entry) => entry.id === task.projectId)

  if (!project) {
    return null
  }

  const epoch = task.epochId ? seamlessMockDb.epochs.find((entry) => entry.id === task.epochId) : null
  const release = task.releaseId ? seamlessMockDb.releases.find((entry) => entry.id === task.releaseId) : null
  const linkedDocs = seamlessMockDb.documentLinks.filter((link) => link.entityType === 'task' && link.entityId === task.id).length
  const linkedMeetings = seamlessMockDb.meetings.filter((meeting) => meeting.sourceContextType === 'task' && meeting.sourceContextId === task.id).length
  const linkedPullRequests = resolveLinkedPullRequests(task).length
  const tags = seamlessMockDb.taskTags.filter((tag) => tag.taskId === task.id).map((tag) => tag.value)
  const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : null

  return {
    id: task.id,
    key: task.key,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeName,
    assigneeInitials: assigneeName ? initials(assigneeName) : null,
    dueDate: formatDate(task.dueDate),
    projectName: project.name,
    projectKey: project.key,
    epochName: epoch?.name ?? null,
    releaseVersion: release?.version ?? null,
    linkedDocs,
    linkedMeetings,
    linkedPullRequests,
    blockerCount: resolveBlockerCount(task),
    tags
  }
}

function buildKanbanBoardData(): KanbanBoardData {
  const cards = seamlessMockDb.tasks.map(buildCard).filter((card): card is KanbanCard => card !== null)
  const activeProjects = seamlessMockDb.projects.filter((project) => project.status !== 'archived')

  return {
    summary: [
      {
        id: 'open',
        label: 'Open Tasks',
        value: cards.filter((card) => card.status !== 'done').length,
        detail: 'Execution across every active workspace'
      },
      {
        id: 'review',
        label: 'In Review',
        value: cards.filter((card) => card.status === 'review').length,
        detail: 'Tasks waiting for validation or merge'
      },
      {
        id: 'blockers',
        label: 'Blocked Context',
        value: cards.filter((card) => card.blockerCount > 0).length,
        detail: 'Cards affected by blocked goals or overdue risk'
      },
      {
        id: 'docs',
        label: 'Linked Docs',
        value: cards.reduce((sum, card) => sum + card.linkedDocs, 0),
        detail: 'Document references visible from the board'
      }
    ],
    projects: activeProjects.map((project) => ({ id: project.id, key: project.key, name: project.name })),
    lanes: [
      { id: 'backlog', title: 'Backlog', description: 'Intake queue before sprint commitment.', cards: cards.filter((card) => card.status === 'backlog') },
      { id: 'todo', title: 'To Do', description: 'Scoped and ready to be started.', cards: cards.filter((card) => card.status === 'todo') },
      { id: 'in-progress', title: 'In Progress', description: 'Actively moving through implementation.', cards: cards.filter((card) => card.status === 'in-progress') },
      { id: 'review', title: 'Review', description: 'Waiting for approval, QA, or merge confirmation.', cards: cards.filter((card) => card.status === 'review') },
      { id: 'done', title: 'Done', description: 'Completed with context preserved for the release trail.', cards: cards.filter((card) => card.status === 'done') }
    ]
  }
}

async function fetchKanbanBoardData() {
  return withMockLatency(buildKanbanBoardData())
}

export async function changeTaskStatus(taskId: string, status: KanbanLaneId) {
  return updateMockTaskStatus(taskId, status)
}

export const kanbanBoardQueries = {
  board: () =>
    queryOptions({
      queryKey: ['backbone', 'tasks', 'board'],
      queryFn: fetchKanbanBoardData
    })
}
