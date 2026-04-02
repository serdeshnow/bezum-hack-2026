import { useMutation } from '@tanstack/react-query'

import { VoteStatus } from '@/shared/api'
import { queryClient } from '@/shared/api'
import { publishMeetingRecap, voteMeetingSlot } from '@/shared/mocks/seamless.ts'

import { useSessionStore } from '@/entities/session'
import { meetingQueryKeys } from '@/entities/meeting/api/queries.ts'

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
