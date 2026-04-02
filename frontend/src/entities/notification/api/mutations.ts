import { useMutation } from '@tanstack/react-query'

import { http, queryClient, withBackendFallback } from '@/shared/api'
import { markAllNotificationsRead, markNotificationRead } from '@/shared/mocks/seamless.ts'

import { notificationQueryKeys } from '@/entities/notification/api/queries.ts'

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: (notificationId: string) =>
      withBackendFallback(
        async () => {
          const { data } = await http.patch(`/notifications/${notificationId}`, {
            readAt: new Date().toISOString()
          })
          return data
        },
        () => Promise.resolve(markNotificationRead(notificationId))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
    }
  })
}

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: () =>
      withBackendFallback(
        async () => {
          const notifications = await http.get('/notifications')
          await Promise.all(
            (notifications.data as Array<{ id: string }>).map((notification) =>
              http.patch(`/notifications/${notification.id}`, {
                readAt: new Date().toISOString()
              })
            )
          )
          return notifications.data
        },
        () => Promise.resolve(markAllNotificationsRead())
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
    }
  })
}
