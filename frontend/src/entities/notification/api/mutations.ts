import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/shared/api'
import { markAllNotificationsRead, markNotificationRead } from '@/shared/mocks/seamless.ts'

import { notificationQueryKeys } from '@/entities/notification/api/queries.ts'

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: (notificationId: string) => Promise.resolve(markNotificationRead(notificationId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
    }
  })
}

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: () => Promise.resolve(markAllNotificationsRead()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
    }
  })
}
