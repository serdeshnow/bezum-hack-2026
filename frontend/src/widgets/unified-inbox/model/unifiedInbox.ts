import dayjs from 'dayjs'
import { queryOptions } from '@tanstack/react-query'

import { markAllMockNotificationsRead, seamlessMockDb, updateMockNotificationReadState, withMockLatency } from '@/shared/api/mock/seamlessBackbone.ts'

type InboxSummary = {
  id: string
  label: string
  value: number
  detail: string
}

export type InboxNotificationCategory = 'all' | 'unread' | 'approvals' | 'meetings' | 'delivery' | 'mentions'

export type InboxNotification = {
  id: string
  title: string
  description: string
  category: Exclude<InboxNotificationCategory, 'all' | 'unread'>
  actorName: string
  actorInitials: string
  timestamp: string
  read: boolean
  entityLabel: string
  href: string | null
}

export type UnifiedInboxData = {
  summary: InboxSummary[]
  notifications: InboxNotification[]
}

const CURRENT_USER_ID = 'user-1'

function initials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function relativeTime(date: string) {
  const now = dayjs('2026-04-02T09:00:00Z')
  const diffMinutes = now.diff(dayjs(date), 'minute')

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = now.diff(dayjs(date), 'hour')
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const diffDays = now.diff(dayjs(date), 'day')
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function resolveCategory(entityType: string | null, title: string): InboxNotification['category'] {
  if (title.toLowerCase().includes('approval')) return 'approvals'
  if (title.toLowerCase().includes('mention')) return 'mentions'
  if (entityType === 'meeting') return 'meetings'
  if (entityType === 'release' || entityType === 'pull-request') return 'delivery'
  return 'mentions'
}

function resolveHref(entityType: string | null, entityId: string | null) {
  if (!entityType || !entityId) return null
  if (entityType === 'task') return `/tasks/${entityId}`
  if (entityType === 'document') return `/docs/${entityId}`
  if (entityType === 'meeting') return `/meetings/${entityId}`
  if (entityType === 'release' || entityType === 'pull-request') return '/releases'
  return null
}

function resolveEntityLabel(entityType: string | null) {
  if (entityType === 'pull-request') return 'PR'
  if (entityType === 'release') return 'Release'
  if (entityType === 'document') return 'Document'
  if (entityType === 'meeting') return 'Meeting'
  if (entityType === 'task') return 'Task'
  return 'General'
}

function buildUnifiedInboxData(): UnifiedInboxData {
  const notifications = seamlessMockDb.notifications
    .filter((entry) => entry.userId === CURRENT_USER_ID)
    .sort((left, right) => dayjs(right.createdAt).valueOf() - dayjs(left.createdAt).valueOf())
    .map((entry) => {
      const actor = entry.actorUserId ? seamlessMockDb.users.find((user) => user.id === entry.actorUserId) : null
      const actorName = actor ? `${actor.firstName} ${actor.lastName}` : 'System'

      return {
        id: entry.id,
        title: entry.title,
        description: entry.description,
        category: resolveCategory(entry.entityType, entry.title),
        actorName,
        actorInitials: initials(actorName),
        timestamp: relativeTime(entry.createdAt),
        read: entry.readAt !== null,
        entityLabel: resolveEntityLabel(entry.entityType),
        href: resolveHref(entry.entityType, entry.entityId)
      }
    })

  return {
    summary: [
      {
        id: 'all',
        label: 'All',
        value: notifications.length,
        detail: 'Events from every connected product surface'
      },
      {
        id: 'unread',
        label: 'Unread',
        value: notifications.filter((entry) => !entry.read).length,
        detail: 'Notifications that still need attention'
      },
      {
        id: 'approvals',
        label: 'Approvals',
        value: notifications.filter((entry) => entry.category === 'approvals').length,
        detail: 'Requests tied to document review or trusted summary state'
      },
      {
        id: 'delivery',
        label: 'Delivery',
        value: notifications.filter((entry) => entry.category === 'delivery').length,
        detail: 'PR and release events flowing back into the workspace'
      }
    ],
    notifications
  }
}

async function fetchUnifiedInboxData() {
  return withMockLatency(buildUnifiedInboxData())
}

export async function changeNotificationReadState(notificationId: string, read: boolean) {
  return updateMockNotificationReadState(notificationId, read)
}

export async function markAllNotificationsRead() {
  return markAllMockNotificationsRead(CURRENT_USER_ID)
}

export const unifiedInboxQueries = {
  inbox: () =>
    queryOptions({
      queryKey: ['backbone', 'notifications', 'inbox'],
      queryFn: fetchUnifiedInboxData
    })
}
