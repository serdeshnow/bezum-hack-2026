import { queryOptions } from '@tanstack/react-query'

import type {
  ApiEntity,
  Document,
  Meeting,
  MeetingActionItem,
  MeetingAvailabilitySlot,
  MeetingAvailabilityVote,
  MeetingDecision,
  MeetingLinkedDocument,
  MeetingParticipant,
  MeetingTranscriptEntry
} from '@/shared/api'
import { MeetingSourceContextType, MeetingStatus, TaskPriority, VoteStatus, http, withBackendFallback } from '@/shared/api'
import { appConfig } from '@/shared/config'
import { buildUserSummary, fetchUsersMap, formatDateLabel, formatDateTimeLabel } from '@/shared/api/seamlessBackend.ts'
import { getMeetingRecap, getMeetingScheduler, listMeetingRecaps } from '@/shared/mocks/seamless.ts'
import { adaptMeetingRecapViewModel, adaptMeetingSchedulerViewModel } from './adapters.ts'

export const meetingQueryKeys = {
  all: ['meetings'] as const,
  scheduler: ['meetings', 'scheduler'] as const,
  recap: (meetingId: string) => ['meetings', meetingId] as const
}

export const meetingQueries = {
  list: () =>
    queryOptions({
      queryKey: meetingQueryKeys.all,
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const [usersMap, meetingsResponse] = await Promise.all([fetchUsersMap(), http.get<Array<ApiEntity<Meeting>>>('/meetings', { params: { projectId: appConfig.defaultProjectId } })])

            const recaps = await Promise.all(
              meetingsResponse.data.map(async (meeting) => {
                const [participantsResponse, transcriptResponse, decisionsResponse, actionItemsResponse, linkedDocumentsResponse] = await Promise.all([
                  http.get<Array<ApiEntity<MeetingParticipant>>>(`/meetings/${meeting.id}/participants`),
                  http.get<Array<ApiEntity<MeetingTranscriptEntry>>>(`/meetings/${meeting.id}/transcript-entries`),
                  http.get<Array<ApiEntity<MeetingDecision>>>(`/meetings/${meeting.id}/decisions`),
                  http.get<Array<ApiEntity<MeetingActionItem>>>(`/meetings/${meeting.id}/action-items`),
                  http.get<Array<ApiEntity<MeetingLinkedDocument>>>(`/meetings/${meeting.id}/linked-documents`)
                ])

                return adaptMeetingRecapViewModel({
                  id: String(meeting.id),
                  title: meeting.title,
                  date: formatDateLabel(String(meeting.startsAt ?? null)),
                  time: meeting.startsAt && meeting.endsAt ? `${formatDateTimeLabel(String(meeting.startsAt))} - ${formatDateTimeLabel(String(meeting.endsAt))}` : 'TBD',
                  status: meeting.status as MeetingStatus,
                  attendees: participantsResponse.data.map((participant) => ({
                    ...buildUserSummary(usersMap.get(String(participant.userId))),
                    role: participant.roleLabel
                  })),
                  recording: meeting.recordingUrl
                    ? {
                        duration: `${meeting.recordingDurationSec ?? 0}s`,
                        url: meeting.recordingUrl
                      }
                    : null,
                  transcript: transcriptResponse.data.map((entry) => ({
                    speaker: entry.speakerName,
                    time: `${entry.startsAtSec}s`,
                    text: entry.text
                  })),
                  aiSummary: {
                    overview: meeting.description ?? 'Meeting recap imported from backend.',
                    keyPoints: decisionsResponse.data.map((decision) => decision.decision)
                  },
                  decisions: decisionsResponse.data.map((decision) => ({
                    id: String(decision.id),
                    decision: decision.decision,
                    owner: decision.userId ? buildUserSummary(usersMap.get(String(decision.userId))).name : null
                  })),
                  actionItems: actionItemsResponse.data.map((item) => ({
                    id: String(item.id),
                    task: item.taskText,
                    assignee: buildUserSummary(usersMap.get(String(item.assigneeUserId ?? ''))),
                    dueDate: item.dueDate ? formatDateLabel(String(item.dueDate)) : null,
                    priority: item.priority as TaskPriority,
                    alreadyTask: Boolean(item.taskId),
                    taskId: item.taskId ? String(item.taskId) : null
                  })),
                  linkedDocuments: linkedDocumentsResponse.data.map((document) => ({
                    id: String(document.documentId),
                    title: String(document.documentId),
                    updateSuggestion: document.updateSuggestion
                  })),
                  approved: meeting.aiSummaryApproved
                })
              })
            )

            return recaps
          },
          () => listMeetingRecaps().map(adaptMeetingRecapViewModel)
        )
    }),
  scheduler: () =>
    queryOptions({
      queryKey: meetingQueryKeys.scheduler,
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const usersMap = await fetchUsersMap()
            const { data: meetings } = await http.get<Array<ApiEntity<Meeting>>>('/meetings', { params: { projectId: appConfig.defaultProjectId } })
            const meeting = meetings[0]

            if (!meeting) {
              return adaptMeetingSchedulerViewModel(getMeetingScheduler())
            }

            const [participantsResponse, slotsResponse] = await Promise.all([
              http.get<Array<ApiEntity<MeetingParticipant>>>(`/meetings/${meeting.id}/participants`),
              http.get<Array<ApiEntity<MeetingAvailabilitySlot>>>(`/meetings/${meeting.id}/availability-slots`)
            ])

            const slots = await Promise.all(
              slotsResponse.data.map(async (slot) => {
                const { data: votes } = await http.get<Array<ApiEntity<MeetingAvailabilityVote>>>(`/meeting-availability-slots/${slot.id}/votes`)
                return {
                  id: String(slot.id),
                  date: formatDateLabel(String(slot.startsAt)),
                  time: formatDateTimeLabel(String(slot.startsAt)),
                  votes: Object.fromEntries(votes.map((vote) => [String(vote.participantUserId), vote.status as VoteStatus]))
                }
              })
            )

            return adaptMeetingSchedulerViewModel({
              sourceContext: {
                type: (meeting.sourceContextType as MeetingSourceContextType) ?? MeetingSourceContextType.None,
                id: meeting.sourceContextId ? String(meeting.sourceContextId) : undefined,
                title: meeting.title,
                linkedEntities: undefined
              },
              participants: participantsResponse.data.map((participant) => ({
                ...buildUserSummary(usersMap.get(String(participant.userId))),
                role: participant.roleLabel
              })),
              timeSlots: slots,
              availabilityStrip: slots.map((slot) => ({
                day: slot.date,
                date: slot.date,
                slots: [slot.time]
              }))
            })
          },
          () => adaptMeetingSchedulerViewModel(getMeetingScheduler())
        )
    }),
  recap: (meetingId: string) =>
    queryOptions({
      queryKey: meetingQueryKeys.recap(meetingId),
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const usersMap = await fetchUsersMap()
            const { data: meeting } = await http.get<ApiEntity<Meeting>>(`/meetings/${meetingId}`)
            const [participantsResponse, transcriptResponse, decisionsResponse, actionItemsResponse, linkedDocumentsResponse] = await Promise.all([
              http.get<Array<ApiEntity<MeetingParticipant>>>(`/meetings/${meetingId}/participants`),
              http.get<Array<ApiEntity<MeetingTranscriptEntry>>>(`/meetings/${meetingId}/transcript-entries`),
              http.get<Array<ApiEntity<MeetingDecision>>>(`/meetings/${meetingId}/decisions`),
              http.get<Array<ApiEntity<MeetingActionItem>>>(`/meetings/${meetingId}/action-items`),
              http.get<Array<ApiEntity<MeetingLinkedDocument>>>(`/meetings/${meetingId}/linked-documents`)
            ])

            const documentsMap = new Map<string, ApiEntity<Document>>()
            await Promise.all(
              linkedDocumentsResponse.data.map(async (item) => {
                const { data } = await http.get<ApiEntity<Document>>(`/documents/${item.documentId}`)
                documentsMap.set(String(item.documentId), data)
              })
            )

            return adaptMeetingRecapViewModel({
              id: String(meeting.id),
              title: meeting.title,
              date: formatDateLabel(String(meeting.startsAt ?? null)),
              time: meeting.startsAt && meeting.endsAt ? `${formatDateTimeLabel(String(meeting.startsAt))} - ${formatDateTimeLabel(String(meeting.endsAt))}` : 'TBD',
              status: meeting.status as MeetingStatus,
              attendees: participantsResponse.data.map((participant) => ({
                ...buildUserSummary(usersMap.get(String(participant.userId))),
                role: participant.roleLabel
              })),
              recording: meeting.recordingUrl
                ? {
                    duration: `${meeting.recordingDurationSec ?? 0}s`,
                    url: meeting.recordingUrl
                  }
                : null,
              transcript: transcriptResponse.data.map((entry) => ({
                speaker: entry.speakerName,
                time: `${entry.startsAtSec}s`,
                text: entry.text
              })),
              aiSummary: {
                overview: meeting.description ?? 'Meeting recap imported from backend.',
                keyPoints: decisionsResponse.data.map((decision) => decision.decision)
              },
              decisions: decisionsResponse.data.map((decision) => ({
                id: String(decision.id),
                decision: decision.decision,
                owner: decision.userId ? buildUserSummary(usersMap.get(String(decision.userId))).name : null
              })),
              actionItems: actionItemsResponse.data.map((item) => ({
                id: String(item.id),
                task: item.taskText,
                assignee: buildUserSummary(usersMap.get(String(item.assigneeUserId ?? ''))),
                dueDate: item.dueDate ? formatDateLabel(String(item.dueDate)) : null,
                priority: item.priority as TaskPriority,
                alreadyTask: Boolean(item.taskId),
                taskId: item.taskId ? String(item.taskId) : null
              })),
              linkedDocuments: linkedDocumentsResponse.data.map((item) => ({
                id: String(item.documentId),
                title: documentsMap.get(String(item.documentId))?.title ?? String(item.documentId),
                updateSuggestion: item.updateSuggestion
              })),
              approved: meeting.aiSummaryApproved
            })
          },
          () => adaptMeetingRecapViewModel(getMeetingRecap(meetingId))
        )
    })
}
