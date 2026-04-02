import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { seamlessMockDb, updateMockMeetingVote, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'
import type { Meeting, VoteStatus } from '@/shared/api/contracts/seamlessBackbone.ts'

type SchedulerSummary = {
  id: string
  label: string
  value: number
  detail: string
}

export type MeetingSchedulerParticipant = {
  userId: string
  name: string
  initials: string
  roleLabel: string
  attended: boolean
}

export type MeetingSchedulerSlot = {
  id: string
  label: string
  timeRange: string
  score: number
  votes: Array<{
    participantUserId: string
    status: VoteStatus
  }>
}

export type MeetingSchedulerMeeting = {
  id: string
  title: string
  description: string | null
  projectKey: string
  projectName: string
  status: Meeting['status']
  type: Meeting['type']
  sourceContext: {
    type: Meeting['sourceContextType']
    title: string
    href: string | null
    linkedCounts: {
      docs: number
      tasks: number
      epochs: number
      releases: number
    }
  }
  participants: MeetingSchedulerParticipant[]
  slots: MeetingSchedulerSlot[]
  recommendedSlotId: string | null
  pendingResponses: number
  linkedDocumentCount: number
  actionItemCount: number
  recapHref: string
  startsAtLabel: string | null
  updatedAtLabel: string
}

export type MeetingSchedulerData = {
  summary: SchedulerSummary[]
  meetings: MeetingSchedulerMeeting[]
}

function initials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function relativeTime(date: string) {
  const now = dayjs('2026-04-02T09:00:00Z')
  const diffMinutes = now.diff(dayjs(date), 'minute')

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = now.diff(dayjs(date), 'hour')
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const diffDays = now.diff(dayjs(date), 'day')
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function formatMeetingDate(date: string | null) {
  return date ? dayjs(date).format('MMM D, HH:mm') : null
}

function formatSlotLabel(startsAt: string, endsAt: string) {
  const start = dayjs(startsAt)
  const end = dayjs(endsAt)

  return {
    label: start.format('MMM D'),
    timeRange: `${start.format('HH:mm')} - ${end.format('HH:mm')}`
  }
}

function resolveSourceContext(meeting: Meeting): MeetingSchedulerMeeting['sourceContext'] {
  if (meeting.sourceContextType === 'task' && meeting.sourceContextId) {
    const task = seamlessMockDb.tasks.find((entry) => entry.id === meeting.sourceContextId)

    if (task) {
      const linkedDocs = seamlessMockDb.documentLinks.filter((entry) => entry.entityType === 'task' && entry.entityId === task.id).length

      return {
        type: 'task',
        title: `${task.key} ${task.title}`,
        href: `/tasks/${task.id}`,
        linkedCounts: {
          docs: linkedDocs,
          tasks: 1,
          epochs: task.epochId ? 1 : 0,
          releases: task.releaseId ? 1 : 0
        }
      }
    }
  }

  if (meeting.sourceContextType === 'doc' && meeting.sourceContextId) {
    const document = seamlessMockDb.documents.find((entry) => entry.id === meeting.sourceContextId)

    if (document) {
      const directLinks = seamlessMockDb.documentLinks.filter((entry) => entry.documentId === document.id)

      return {
        type: 'doc',
        title: document.title,
        href: `/docs/${document.id}`,
        linkedCounts: {
          docs: 1,
          tasks: directLinks.filter((entry) => entry.entityType === 'task').length,
          epochs: directLinks.filter((entry) => entry.entityType === 'epoch').length,
          releases: directLinks.filter((entry) => entry.entityType === 'release').length
        }
      }
    }
  }

  if (meeting.sourceContextType === 'epoch' && meeting.sourceContextId) {
    const epoch = seamlessMockDb.epochs.find((entry) => entry.id === meeting.sourceContextId)

    if (epoch) {
      const epochTasks = seamlessMockDb.tasks.filter((entry) => entry.epochId === epoch.id)
      const releaseIds = new Set(epochTasks.map((entry) => entry.releaseId).filter((value): value is string => Boolean(value)))

      return {
        type: 'epoch',
        title: epoch.name,
        href: `/epochs/${epoch.id}`,
        linkedCounts: {
          docs: seamlessMockDb.documentLinks.filter((entry) => entry.entityType === 'epoch' && entry.entityId === epoch.id).length,
          tasks: epochTasks.length,
          epochs: 1,
          releases: releaseIds.size
        }
      }
    }
  }

  if (meeting.sourceContextType === 'project' && meeting.sourceContextId) {
    const project = seamlessMockDb.projects.find((entry) => entry.id === meeting.sourceContextId)

    if (project) {
      return {
        type: 'project',
        title: project.name,
        href: `/projects/${project.id}`,
        linkedCounts: {
          docs: seamlessMockDb.documents.filter((entry) => entry.projectId === project.id).length,
          tasks: seamlessMockDb.tasks.filter((entry) => entry.projectId === project.id).length,
          epochs: seamlessMockDb.epochs.filter((entry) => entry.projectId === project.id).length,
          releases: seamlessMockDb.releases.filter((entry) => entry.projectId === project.id).length
        }
      }
    }
  }

  return {
    type: 'none',
    title: 'Standalone meeting',
    href: null,
    linkedCounts: {
      docs: 0,
      tasks: 0,
      epochs: 0,
      releases: 0
    }
  }
}

function buildMeeting(meeting: Meeting): MeetingSchedulerMeeting | null {
  const project = seamlessMockDb.projects.find((entry) => entry.id === meeting.projectId)

  if (!project) {
    return null
  }

  const participants = seamlessMockDb.meetingParticipants
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

  const slots: MeetingSchedulerSlot[] = seamlessMockDb.meetingAvailabilitySlots
    .filter((entry) => entry.meetingId === meeting.id)
    .sort((left, right) => dayjs(left.startsAt).valueOf() - dayjs(right.startsAt).valueOf())
    .map((slot) => {
      const { label, timeRange } = formatSlotLabel(slot.startsAt, slot.endsAt)

      return {
        id: slot.id,
        label,
        timeRange,
        score: slot.score,
        votes: participants.map((participant) => ({
          participantUserId: participant.userId,
          status: (
            seamlessMockDb.meetingAvailabilityVotes.find(
              (entry) => entry.slotId === slot.id && entry.participantUserId === participant.userId
            )?.status ?? 'no-response'
          ) as VoteStatus
        }))
      }
    })

  const recommendedSlot = slots.reduce<MeetingSchedulerSlot | null>((best, slot) => {
    if (!best || slot.score > best.score) {
      return slot
    }

    return best
  }, null)

  const pendingResponses = slots.reduce(
    (sum, slot) => sum + slot.votes.filter((entry) => entry.status === 'no-response').length,
    0
  )

  return {
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    projectKey: project.key,
    projectName: project.name,
    status: meeting.status,
    type: meeting.type,
    sourceContext: resolveSourceContext(meeting),
    participants,
    slots,
    recommendedSlotId: recommendedSlot?.id ?? null,
    pendingResponses,
    linkedDocumentCount: seamlessMockDb.meetingLinkedDocuments.filter((entry) => entry.meetingId === meeting.id).length,
    actionItemCount: seamlessMockDb.meetingActionItems.filter((entry) => entry.meetingId === meeting.id).length,
    recapHref: `/meetings/${meeting.id}`,
    startsAtLabel: formatMeetingDate(meeting.startsAt),
    updatedAtLabel: relativeTime(meeting.updatedAt)
  }
}

function buildMeetingSchedulerData(): MeetingSchedulerData {
  const meetings = seamlessMockDb.meetings
    .map(buildMeeting)
    .filter((meeting): meeting is MeetingSchedulerMeeting => meeting !== null)
    .sort((left, right) => {
      const leftStartsAt = seamlessMockDb.meetings.find((entry) => entry.id === left.id)?.startsAt
      const rightStartsAt = seamlessMockDb.meetings.find((entry) => entry.id === right.id)?.startsAt

      if (left.status === 'scheduled' && right.status !== 'scheduled') return -1
      if (left.status !== 'scheduled' && right.status === 'scheduled') return 1
      if (leftStartsAt && rightStartsAt) {
        return dayjs(leftStartsAt).valueOf() - dayjs(rightStartsAt).valueOf()
      }

      return left.title.localeCompare(right.title)
    })

  return {
    summary: [
      {
        id: 'scheduled',
        label: 'Scheduled',
        value: meetings.filter((entry) => entry.status === 'scheduled').length,
        detail: 'Upcoming meetings still waiting for execution'
      },
      {
        id: 'responses',
        label: 'Pending Votes',
        value: meetings.reduce((sum, entry) => sum + entry.pendingResponses, 0),
        detail: 'Availability responses still missing across open schedulers'
      },
      {
        id: 'linked-docs',
        label: 'Linked Docs',
        value: meetings.reduce((sum, entry) => sum + entry.linkedDocumentCount, 0),
        detail: 'Documents already in the meeting context graph'
      },
      {
        id: 'recaps',
        label: 'Completed',
        value: meetings.filter((entry) => entry.status === 'completed').length,
        detail: 'Meetings ready to feed recap, decisions, and action items'
      }
    ],
    meetings
  }
}

async function fetchMeetingSchedulerData() {
  return withMockLatency(buildMeetingSchedulerData())
}

export async function voteForMeetingSlot(slotId: string, participantUserId: string, status: VoteStatus) {
  return updateMockMeetingVote(slotId, participantUserId, status)
}

export const meetingSchedulerQueries = {
  list: () =>
    queryOptions({
      queryKey: ['backbone', 'meetings', 'scheduler'],
      queryFn: fetchMeetingSchedulerData
    })
}
