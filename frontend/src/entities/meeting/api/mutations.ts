import { useMutation } from '@tanstack/react-query'

import { MeetingStatus, VoteStatus } from '@/shared/api'
import { http, queryClient, withBackendFallback } from '@/shared/api'
import { appConfig } from '@/shared/config'
import { applyMeetingSummaryToDocument, createTaskFromMeetingActionItem, publishMeetingRecap, voteMeetingSlot } from '@/shared/mocks/seamless.ts'

import { documentQueryKeys } from '@/entities/document/api/queries.ts'
import { useSessionStore } from '@/entities/session'
import { meetingQueryKeys } from '@/entities/meeting/api/queries.ts'
import { taskQueryKeys } from '@/entities/task/api/queries.ts'

export function useVoteMeetingSlot() {
  return useMutation({
    mutationFn: ({ slotId, status }: { slotId: string; status: VoteStatus }) => {
      const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
      return withBackendFallback(
        async () => {
          const { data } = await http.post(`/meeting-availability-slots/${slotId}/votes`, {
            participantUserId: userId,
            status
          })
          return data
        },
        () => Promise.resolve(voteMeetingSlot(slotId, userId, status))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.scheduler })
    }
  })
}

export function usePublishMeetingRecap(meetingId: string) {
  return useMutation({
    mutationFn: (approved: boolean) =>
      withBackendFallback(
        async () => {
          const { data } = await http.patch(`/meetings/${meetingId}`, {
            aiSummaryApproved: approved,
            status: approved ? MeetingStatus.Completed : undefined
          })
          return data
        },
        () => Promise.resolve(publishMeetingRecap(meetingId, approved))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.recap(meetingId) })
    }
  })
}

export function useCreateTaskFromMeetingActionItem(meetingId: string) {
  return useMutation({
    mutationFn: ({ actionItemId }: { actionItemId: string }) =>
      withBackendFallback(
        async () => {
          const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
          const [meetingResponse, actionItemResponse] = await Promise.all([http.get(`/meetings/${meetingId}`), http.get(`/meeting-action-items/${actionItemId}`)])

          const { data: task } = await http.post('/tasks', {
            projectId: meetingResponse.data.projectId ?? appConfig.defaultProjectId,
            epochId: meetingResponse.data.epochId ?? null,
            key: `SEA-${Date.now().toString().slice(-4)}`,
            title: actionItemResponse.data.taskText,
            description: `Created from meeting action item in ${meetingResponse.data.title}.`,
            status: 'todo',
            priority: actionItemResponse.data.priority,
            assigneeUserId: actionItemResponse.data.assigneeUserId ?? null,
            reporterUserId: userId,
            dueDate: actionItemResponse.data.dueDate ?? null,
            createdDate: new Date().toISOString(),
            releaseId: null
          })

          await http.patch(`/meeting-action-items/${actionItemId}`, {
            taskId: task.id
          })

          return task
        },
        () => Promise.resolve(createTaskFromMeetingActionItem(meetingId, actionItemId))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.recap(meetingId) })
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all })
    }
  })
}

export function useApplyMeetingSummaryToDocument(meetingId: string) {
  return useMutation({
    mutationFn: ({ docId, mode }: { docId: string; mode: 'draft' | 'review' }) => {
      const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
      return withBackendFallback(
        async () => {
          const [meetingResponse, documentResponse, versionsResponse] = await Promise.all([
            http.get(`/meetings/${meetingId}`),
            http.get(`/documents/${docId}`),
            http.get<Array<{ versionLabel: string }>>(`/documents/${docId}/versions`)
          ])

          const currentLabel = versionsResponse.data[0]?.versionLabel ?? '1.0'
          const segments = currentLabel.split('.')
          const nextLabel = currentLabel.includes('.')
            ? `${segments.slice(0, -1).join('.')}.${Number(segments[segments.length - 1] ?? '0') + 1}`
            : `${currentLabel}.1`

          await http.post(`/documents/${docId}/versions`, {
            versionLabel: nextLabel,
            contentMarkdown: `# ${documentResponse.data.title}

## Meeting Summary: ${meetingResponse.data.title}

${meetingResponse.data.description ?? 'Imported from meeting summary.'}`,
            changeSource: 'meeting',
            sourceDetail: meetingResponse.data.title,
            authorUserId: userId,
            additions: 1,
            deletions: 0,
            modifications: 1,
            status: 'pending-approval'
          })

          if (mode === 'review') {
            await http.patch(`/documents/${docId}`, {
              awaitingApproval: true,
              status: 'in-review'
            })
          }

          return { docId, mode }
        },
        () => {
          applyMeetingSummaryToDocument(meetingId, docId, mode, userId)
          return Promise.resolve({ docId, mode })
        }
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.recap(meetingId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(variables.docId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.history(variables.docId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    }
  })
}
