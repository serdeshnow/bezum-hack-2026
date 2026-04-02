import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { seamlessMockDb, updateMockMeetingSummaryApproval, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'

type MeetingSummaryCard = {
  id: string
  label: string
  value: string | number
  detail: string
}

type MeetingRecapAttendee = {
  userId: string
  name: string
  initials: string
  roleLabel: string
  attended: boolean
}

type MeetingRecapTranscriptEntry = {
  id: string
  speakerName: string
  timeLabel: string
  text: string
}

type MeetingRecapDecision = {
  id: string
  decision: string
  ownerName: string
}

type MeetingRecapActionItem = {
  id: string
  taskId: string | null
  taskText: string
  assigneeName: string
  assigneeInitials: string
  dueDate: string | null
  priority: 'low' | 'medium' | 'high' | 'critical'
}

type MeetingRecapLinkedDocument = {
  id: string
  title: string
  status: 'draft' | 'in-review' | 'approved' | 'obsolete' | 'rejected'
  updateSuggestion: string
}

type MeetingInsight = {
  id: string
  tone: 'info' | 'warning'
  text: string
}

export type MeetingRecapData = {
  id: string
  title: string
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled'
  type: 'standup' | 'planning' | 'review' | 'retrospective' | 'workshop' | 'ad-hoc'
  projectName: string
  projectKey: string
  description: string | null
  dateLabel: string | null
  timeRangeLabel: string | null
  recordingDurationLabel: string | null
  aiSummaryApproved: boolean
  summaryCards: MeetingSummaryCard[]
  sourceContext: {
    title: string
    href: string | null
    type: 'task' | 'doc' | 'epoch' | 'project' | 'none'
  }
  attendees: MeetingRecapAttendee[]
  aiSummary: {
    overview: string
    keyPoints: string[]
  }
  transcript: MeetingRecapTranscriptEntry[]
  decisions: MeetingRecapDecision[]
  actionItems: MeetingRecapActionItem[]
  linkedDocuments: MeetingRecapLinkedDocument[]
  insights: MeetingInsight[]
}

function initials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatRecordingDuration(durationSec: number | null) {
  if (!durationSec) {
    return null
  }

  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatTranscriptTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60

  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

function resolveSourceContext(type: MeetingRecapData['sourceContext']['type'], sourceContextId: string | null) {
  if (type === 'task' && sourceContextId) {
    const task = seamlessMockDb.tasks.find((entry) => entry.id === sourceContextId)
    return task ? { title: `${task.key} ${task.title}`, href: `/tasks/${task.id}`, type } : { title: 'Linked task', href: null, type }
  }

  if (type === 'doc' && sourceContextId) {
    const document = seamlessMockDb.documents.find((entry) => entry.id === sourceContextId)
    return document ? { title: document.title, href: `/docs/${document.id}`, type } : { title: 'Linked document', href: null, type }
  }

  if (type === 'epoch' && sourceContextId) {
    const epoch = seamlessMockDb.epochs.find((entry) => entry.id === sourceContextId)
    return epoch ? { title: epoch.name, href: `/epochs/${epoch.id}`, type } : { title: 'Linked epoch', href: null, type }
  }

  if (type === 'project' && sourceContextId) {
    const project = seamlessMockDb.projects.find((entry) => entry.id === sourceContextId)
    return project ? { title: project.name, href: `/projects/${project.id}`, type } : { title: 'Linked project', href: null, type }
  }

  return { title: 'Standalone meeting', href: null, type: 'none' as const }
}

function buildAiSummary(meetingId: string, meetingTitle: string, description: string | null) {
  const decisions = seamlessMockDb.meetingDecisions.filter((entry) => entry.meetingId === meetingId)
  const actionItems = seamlessMockDb.meetingActionItems.filter((entry) => entry.meetingId === meetingId)
  const transcript = seamlessMockDb.meetingTranscriptEntries.filter((entry) => entry.meetingId === meetingId)

  const overview =
    transcript.length > 0
      ? `${meetingTitle} captured ${decisions.length} decision${decisions.length === 1 ? '' : 's'} and ${actionItems.length} follow-up item${actionItems.length === 1 ? '' : 's'} from the discussion.`
      : description ?? 'This meeting is scheduled, so the recap is currently driven by agenda, linked docs, and planned follow-up items.'

  const keyPoints = [
    ...decisions.slice(0, 3).map((entry) => entry.decision),
    ...actionItems
      .filter((entry) => entry.taskId === null)
      .slice(0, 2)
      .map((entry) => `Convert to task: ${entry.taskText}`)
  ]

  return {
    overview,
    keyPoints: keyPoints.length > 0 ? keyPoints : ['No extracted key points yet. Summary will become richer after the meeting is completed.']
  }
}

function getMeetingRecapData(meetingId: string): MeetingRecapData | null {
  const meeting = seamlessMockDb.meetings.find((entry) => entry.id === meetingId)

  if (!meeting) {
    return null
  }

  const project = seamlessMockDb.projects.find((entry) => entry.id === meeting.projectId)

  if (!project) {
    return null
  }

  const attendees = seamlessMockDb.meetingParticipants
    .filter((entry) => entry.meetingId === meeting.id)
    .map((entry) => {
      const user = seamlessMockDb.users.find((userEntry) => userEntry.id === entry.userId)
      const name = user ? `${user.firstName} ${user.lastName}` : entry.roleLabel

      return {
        userId: entry.userId,
        name,
        initials: initials(name),
        roleLabel: entry.roleLabel,
        attended: entry.attended
      }
    })

  const decisions = seamlessMockDb.meetingDecisions.filter((entry) => entry.meetingId === meeting.id)
  const actionItems = seamlessMockDb.meetingActionItems.filter((entry) => entry.meetingId === meeting.id)
  const linkedDocuments = seamlessMockDb.meetingLinkedDocuments
    .filter((entry) => entry.meetingId === meeting.id)
    .map((entry) => {
      const document = seamlessMockDb.documents.find((documentEntry) => documentEntry.id === entry.documentId)

      return document
        ? {
            id: document.id,
            title: document.title,
            status: document.status,
            updateSuggestion: entry.updateSuggestion
          }
        : null
    })
    .filter((entry): entry is MeetingRecapLinkedDocument => entry !== null)

  const transcript = seamlessMockDb.meetingTranscriptEntries
    .filter((entry) => entry.meetingId === meeting.id)
    .sort((left, right) => left.startsAtSec - right.startsAtSec)
    .map((entry) => ({
      id: entry.id,
      speakerName: entry.speakerName,
      timeLabel: formatTranscriptTime(entry.startsAtSec),
      text: entry.text
    }))

  const insights: MeetingInsight[] = [
    ...(meeting.status !== 'completed'
      ? [
          {
            id: 'meeting-not-complete',
            tone: 'warning' as const,
            text: 'This meeting is not completed yet, so transcript and final summary are still partial.'
          }
        ]
      : []),
    ...(meeting.aiSummaryApproved
      ? [
          {
            id: 'summary-approved',
            tone: 'info' as const,
            text: 'AI summary is already approved and can be quoted into linked documents or tasks.'
          }
        ]
      : [
          {
            id: 'summary-pending',
            tone: 'warning' as const,
            text: 'AI summary still needs approval before it becomes a trusted document-history reference.'
          }
        ]),
    ...(actionItems.some((entry) => entry.taskId === null)
      ? [
          {
            id: 'task-conversion',
            tone: 'info' as const,
            text: 'Some follow-up items are still meeting-only and can later be promoted into kanban tasks.'
          }
        ]
      : [])
  ]

  const startsAt = meeting.startsAt ? dayjs(meeting.startsAt) : null
  const endsAt = meeting.endsAt ? dayjs(meeting.endsAt) : null

  return {
    id: meeting.id,
    title: meeting.title,
    status: meeting.status,
    type: meeting.type,
    projectName: project.name,
    projectKey: project.key,
    description: meeting.description,
    dateLabel: startsAt ? startsAt.format('MMM D, YYYY') : null,
    timeRangeLabel: startsAt && endsAt ? `${startsAt.format('HH:mm')} - ${endsAt.format('HH:mm')}` : startsAt ? startsAt.format('HH:mm') : null,
    recordingDurationLabel: formatRecordingDuration(meeting.recordingDurationSec),
    aiSummaryApproved: meeting.aiSummaryApproved,
    summaryCards: [
      {
        id: 'attendees',
        label: 'Attendees',
        value: attendees.filter((entry) => entry.attended || meeting.status !== 'completed').length,
        detail: 'People currently in the meeting context'
      },
      {
        id: 'decisions',
        label: 'Decisions',
        value: decisions.length,
        detail: 'Structured decisions extracted from the conversation'
      },
      {
        id: 'actions',
        label: 'Action Items',
        value: actionItems.length,
        detail: 'Follow-ups ready to become tracked execution'
      },
      {
        id: 'docs',
        label: 'Linked Docs',
        value: linkedDocuments.length,
        detail: 'Documents expected to absorb meeting outcomes'
      }
    ],
    sourceContext: resolveSourceContext(meeting.sourceContextType, meeting.sourceContextId),
    attendees,
    aiSummary: buildAiSummary(meeting.id, meeting.title, meeting.description),
    transcript,
    decisions: decisions.map((entry) => {
      const owner = entry.userId ? seamlessMockDb.users.find((userEntry) => userEntry.id === entry.userId) : null

      return {
        id: entry.id,
        decision: entry.decision,
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unassigned'
      }
    }),
    actionItems: actionItems.map((entry) => {
      const assignee = entry.assigneeUserId ? seamlessMockDb.users.find((userEntry) => userEntry.id === entry.assigneeUserId) : null
      const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned'

      return {
        id: entry.id,
        taskId: entry.taskId,
        taskText: entry.taskText,
        assigneeName,
        assigneeInitials: initials(assigneeName),
        dueDate: entry.dueDate ? dayjs(entry.dueDate).format('MMM D, YYYY') : null,
        priority: entry.priority
      }
    }),
    linkedDocuments,
    insights
  }
}

async function fetchMeetingRecapData(meetingId: string) {
  return withMockLatency(getMeetingRecapData(meetingId))
}

export async function changeMeetingSummaryApproval(meetingId: string, approved: boolean) {
  return updateMockMeetingSummaryApproval(meetingId, approved)
}

export const meetingRecapQueries = {
  byId: (meetingId: string) =>
    queryOptions({
      queryKey: ['backbone', 'meetings', 'recap', meetingId],
      queryFn: () => fetchMeetingRecapData(meetingId)
    })
}
