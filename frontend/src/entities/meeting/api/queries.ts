import { queryOptions } from '@tanstack/react-query'

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
      queryFn: async () => listMeetingRecaps().map(adaptMeetingRecapViewModel)
    }),
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
