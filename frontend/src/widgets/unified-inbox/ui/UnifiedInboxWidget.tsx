import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'

import { filterNotifications, getNotificationFilterCount, getUnreadNotifications, notificationQueries, type NotificationFilter } from '@/entities/notification'
import { useNotificationReadActions } from '@/features/notification/mark-read'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, PageState, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui'

export function UnifiedInboxWidget() {
  const { data, isLoading, error } = useQuery(notificationQueries.list())
  const { markAllRead, markNotificationRead } = useNotificationReadActions()
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')

  if (isLoading) {
    return <PageState state='loading' title='Loading notifications' description='Collecting mentions, task updates, releases, and PR events.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Inbox unavailable' description='Notifications could not be loaded.' />
  }

  const items = filterNotifications(data.items, activeFilter)
  const unread = getUnreadNotifications(data.items)

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>Unified inbox</h1>
          <p className='text-muted-foreground text-sm'>{data.unreadCount} unread notifications across docs, tasks, meetings, PRs, and releases.</p>
        </div>
        <Button variant='outline' onClick={() => markAllRead.mutate()}>Mark all read</Button>
      </div>

      <Tabs defaultValue='all' onValueChange={(value) => setActiveFilter(value as NotificationFilter)}>
        <TabsList>
          <TabsTrigger value='all'>All ({getNotificationFilterCount(data, 'all')})</TabsTrigger>
          <TabsTrigger value='unread'>Unread ({getNotificationFilterCount(data, 'unread')})</TabsTrigger>
          <TabsTrigger value='mention'>Mentions ({getNotificationFilterCount(data, 'mention')})</TabsTrigger>
        </TabsList>
        <TabsContent value='all' className='space-y-4'>
          {items.map((notification) => (
            <Card key={notification.id} className={notification.read ? '' : 'border-accent'}>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'><Bell className='size-4' /> {notification.title}</CardTitle>
              </CardHeader>
              <CardContent className='flex items-center justify-between gap-4 text-sm'>
                <div>
                  <p>{notification.description}</p>
                  <p className='text-muted-foreground mt-1'>{notification.channelLabel} · {notification.timestamp}</p>
                </div>
                <div className='flex items-center gap-2'>
                  {!notification.read && <Badge>Unread</Badge>}
                  <Button variant='outline' size='sm' onClick={() => markNotificationRead.mutate(notification.id)}>Mark read</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value='unread' className='space-y-4'>
          {unread.length ? (
            unread.map((notification) => (
              <Card key={notification.id} className='border-accent'>
                <CardHeader>
                  <CardTitle className='text-base'>{notification.title}</CardTitle>
                </CardHeader>
                <CardContent className='flex items-center justify-between gap-4 text-sm'>
                  <div>
                    <p>{notification.description}</p>
                    <p className='text-muted-foreground mt-1 text-xs'>{notification.channelLabel}</p>
                  </div>
                  <Button variant='outline' size='sm' onClick={() => markNotificationRead.mutate(notification.id)}>Mark read</Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <PageState state='empty' title='No unread notifications' description='Everything is caught up.' />
          )}
        </TabsContent>
        <TabsContent value='mention' className='space-y-4'>
          {filterNotifications(data.items, 'mention').length ? (
            filterNotifications(data.items, 'mention').map((notification) => (
              <Card key={notification.id} className={notification.read ? '' : 'border-accent'}>
                <CardHeader>
                  <CardTitle className='text-base'>{notification.title}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  <p>{notification.description}</p>
                  <p className='text-muted-foreground text-xs'>{notification.entityLabel}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <PageState state='empty' title='No mentions' description='Role-based alerts and mentions will surface here.' />
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}
