import { useMarkAllNotificationsRead, useMarkNotificationRead } from '@/entities/notification'

export function useNotificationReadActions() {
  const markAllRead = useMarkAllNotificationsRead()
  const markNotificationRead = useMarkNotificationRead()

  return {
    markAllRead,
    markNotificationRead
  }
}
