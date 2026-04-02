import { queryOptions } from '@tanstack/react-query'

import type { ApiEntity, Notification } from '@/shared/api'
import { WorkspaceRole, http, withBackendFallback } from '@/shared/api'
import { listNotifications } from '@/shared/mocks/seamless.ts'
import { adaptNotificationCollection } from './adapters.ts'
import { useSessionStore } from '@/entities/session'

export const notificationQueryKeys = {
  all: ['notifications'] as const
}

export const notificationQueries = {
  list: () =>
    queryOptions({
      queryKey: notificationQueryKeys.all,
      queryFn: async () => {
        const userId = useSessionStore.getState().currentUserId
        return withBackendFallback(
          async () => {
            const { data } = await http.get<Array<ApiEntity<Notification>>>('/notifications', {
              params: userId ? { userId } : undefined
            })
            return adaptNotificationCollection(
              data.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                timestamp: item.updatedAt ?? item.createdAt ?? 'recently',
                read: Boolean(item.readAt),
                type: (item.entityType as 'task' | 'meeting' | 'release' | 'mention' | 'doc' | 'pr' | 'system' | undefined) ?? 'system',
                user: {
                  id: item.actorUserId ?? item.userId,
                  name: 'Backend user',
                  initials: 'BU',
                  email: '',
                  role: WorkspaceRole.Manager
                },
                entityId: (item.entityId as string | null | undefined) ?? null
              }))
            )
          },
          () => adaptNotificationCollection(listNotifications())
        )
      }
    })
}
