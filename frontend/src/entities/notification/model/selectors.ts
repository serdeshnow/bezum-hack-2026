import type { NotificationCollectionViewModel, NotificationFilter, NotificationViewModel } from '../api/adapters.ts'

export function filterNotifications(items: NotificationViewModel[], filter: NotificationFilter) {
  if (filter === 'all') return items
  if (filter === 'unread') return items.filter((item) => !item.read)
  return items.filter((item) => item.type === filter)
}

export function getUnreadNotifications(items: NotificationViewModel[]) {
  return items.filter((item) => !item.read)
}

export function getNotificationFilterCount(collection: NotificationCollectionViewModel, filter: NotificationFilter) {
  return collection.filters.find((item) => item.id === filter)?.count ?? 0
}
