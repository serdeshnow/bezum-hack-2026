import { queryOptions } from '@tanstack/react-query'

import { getMeetingRecap, getMeetingScheduler } from '@/shared/mocks/seamless.ts'

export const meetingQueryKeys = {
  scheduler: ['meetings', 'scheduler'] as const,
  recap: (meetingId: string) => ['meetings', meetingId] as const
}

export const meetingQueries = {
  scheduler: () =>
    queryOptions({
      queryKey: meetingQueryKeys.scheduler,
      queryFn: async () => getMeetingScheduler()
    }),
  recap: (meetingId: string) =>
    queryOptions({
      queryKey: meetingQueryKeys.recap(meetingId),
      queryFn: async () => getMeetingRecap(meetingId)
    })
}
