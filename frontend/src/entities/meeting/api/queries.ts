import { queryOptions } from '@tanstack/react-query'

import { getMeetingRecap, getMeetingScheduler } from '@/shared/mocks/seamless.ts'
import { adaptMeetingRecapViewModel, adaptMeetingSchedulerViewModel } from './adapters.ts'

export const meetingQueryKeys = {
  scheduler: ['meetings', 'scheduler'] as const,
  recap: (meetingId: string) => ['meetings', meetingId] as const
}

export const meetingQueries = {
  scheduler: () =>
    queryOptions({
      queryKey: meetingQueryKeys.scheduler,
      queryFn: async () => adaptMeetingSchedulerViewModel(getMeetingScheduler())
    }),
  recap: (meetingId: string) =>
    queryOptions({
      queryKey: meetingQueryKeys.recap(meetingId),
      queryFn: async () => adaptMeetingRecapViewModel(getMeetingRecap(meetingId))
    })
}
