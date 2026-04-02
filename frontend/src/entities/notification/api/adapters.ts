import type { NotificationItem } from '@/shared/mocks/seamless.ts'

export type NotificationViewModel = NotificationItem & {
  channelLabel: string
  entityLabel: string
  deeplink: string | null
}

export type NotificationFilter = 'all' | 'unread' | 'task' | 'meeting' | 'release' | 'mention' | 'doc' | 'pr' | 'system'

export type NotificationCollectionViewModel = {
  items: NotificationViewModel[]
  unreadCount: number
  filters: Array<{
    id: NotificationFilter
    label: string
    count: number
  }>
}

function getNotificationChannelLabel(type: NotificationItem['type']) {
  switch (type) {
    case 'mention':
      return 'Mentions & alerts'
    case 'task':
      return 'Task updates'
    case 'meeting':
      return 'Meeting updates'
    case 'release':
      return 'Release updates'
    case 'doc':
      return 'Document updates'
    case 'pr':
      return 'Pull request updates'
    case 'system':
    default:
      return 'System notifications'
  }
}

function getNotificationDeeplink(notification: NotificationItem) {
  if (!notification.entityId) return null
  if (notification.entityId.startsWith('doc')) return `/docs/${notification.entityId}`
  if (notification.entityId.startsWith('meeting')) return `/meetings/${notification.entityId}`
  if (notification.entityId.startsWith('task')) return `/tasks/${notification.entityId}`
  if (notification.entityId.startsWith('release')) return '/releases'
  if (notification.entityId.startsWith('pr')) return '/releases'
  return null
}

export function adaptNotificationViewModel(notification: NotificationItem): NotificationViewModel {
  return {
    ...notification,
    channelLabel: getNotificationChannelLabel(notification.type),
    entityLabel: notification.type === 'mention' ? 'role-based alert' : notification.type,
    deeplink: getNotificationDeeplink(notification)
  }
}

export function adaptNotificationCollection(items: NotificationItem[]): NotificationCollectionViewModel {
  const normalized = items.map(adaptNotificationViewModel)

  return {
    items: normalized,
    unreadCount: normalized.filter((item) => !item.read).length,
    filters: [
      { id: 'all', label: 'All', count: normalized.length },
      { id: 'unread', label: 'Unread', count: normalized.filter((item) => !item.read).length },
      { id: 'mention', label: 'Mentions', count: normalized.filter((item) => item.type === 'mention').length },
      { id: 'task', label: 'Tasks', count: normalized.filter((item) => item.type === 'task').length },
      { id: 'meeting', label: 'Meetings', count: normalized.filter((item) => item.type === 'meeting').length },
      { id: 'doc', label: 'Docs', count: normalized.filter((item) => item.type === 'doc').length },
      { id: 'pr', label: 'PRs', count: normalized.filter((item) => item.type === 'pr').length },
      { id: 'release', label: 'Releases', count: normalized.filter((item) => item.type === 'release').length },
      { id: 'system', label: 'System', count: normalized.filter((item) => item.type === 'system').length }
    ]
  }
}
