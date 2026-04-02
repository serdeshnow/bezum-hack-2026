import { WorkspaceRole } from '../../src/shared/api'
import { adaptNotificationCollection, filterNotifications, getNotificationFilterCount, getUnreadNotifications } from '../../src/entities/notification'

describe('notification adapters', () => {
  it('normalizes notifications, resolves deeplinks, and computes filter counts', () => {
    const collection = adaptNotificationCollection([
      {
        id: 'notification-1',
        title: 'Mentioned in document comment',
        description: 'Architecture doc',
        timestamp: '2 minutes ago',
        read: false,
        type: 'mention',
        user: { id: 'user-1', name: 'Sarah', initials: 'SC', email: 'sarah@example.com', role: WorkspaceRole.Manager },
        entityId: 'doc-architecture'
      },
      {
        id: 'notification-2',
        title: 'PR moved to review',
        description: '#457',
        timestamp: '10 minutes ago',
        read: true,
        type: 'pr',
        user: { id: 'user-2', name: 'Alex', initials: 'AJ', email: 'alex@example.com', role: WorkspaceRole.Developer },
        entityId: 'pr-2'
      }
    ])

    expect(collection.unreadCount).toBe(1)
    expect(collection.items[0]?.channelLabel).toBe('Mentions & alerts')
    expect(collection.items[0]?.deeplink).toBe('/docs/doc-architecture')
    expect(collection.items[1]?.deeplink).toBe('/releases')
    expect(getNotificationFilterCount(collection, 'mention')).toBe(1)
    expect(getUnreadNotifications(collection.items)).toHaveLength(1)
    expect(filterNotifications(collection.items, 'pr')).toHaveLength(1)
  })
})
