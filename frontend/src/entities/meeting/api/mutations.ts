import { useMutation } from '@tanstack/react-query'

import { VoteStatus } from '@/shared/api'
import { queryClient } from '@/shared/api'
import { applyMeetingSummaryToDocument, createTaskFromMeetingActionItem, publishMeetingRecap, voteMeetingSlot } from '@/shared/mocks/seamless.ts'

import { documentQueryKeys } from '@/entities/document/api/queries.ts'
import { useSessionStore } from '@/entities/session'
import { meetingQueryKeys } from '@/entities/meeting/api/queries.ts'
import { taskQueryKeys } from '@/entities/task/api/queries.ts'

export function useVoteMeetingSlot() {
  return useMutation({
    mutationFn: ({ slotId, status }: { slotId: string; status: VoteStatus }) => {
      const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
      return Promise.resolve(voteMeetingSlot(slotId, userId, status))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.scheduler })
    }
  })
}

export function usePublishMeetingRecap(meetingId: string) {
  return useMutation({
    mutationFn: (approved: boolean) => Promise.resolve(publishMeetingRecap(meetingId, approved)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.recap(meetingId) })
    }
  })
}

export function useCreateTaskFromMeetingActionItem(meetingId: string) {
  return useMutation({
    mutationFn: ({ actionItemId }: { actionItemId: string }) => Promise.resolve(createTaskFromMeetingActionItem(meetingId, actionItemId)),
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
      return Promise.resolve(applyMeetingSummaryToDocument(meetingId, docId, mode, userId))
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: meetingQueryKeys.recap(meetingId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(variables.docId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.history(variables.docId) })
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    }
  })
}
