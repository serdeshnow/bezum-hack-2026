import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { notificationQueries } from '@/entities/notification'
import { Badge, Button, Popover, PopoverContent, PopoverTrigger, ScrollArea, Separator } from '@/shared/ui'

import { useNotificationReadActions } from '../model/useNotificationReadActions.ts'

export function NotificationInboxPopover() {
  const navigate = useNavigate()
  const { data: notifications = [] } = useQuery(notificationQueries.list())
  const { markAllRead, markNotificationRead } = useNotificationReadActions()
  const unreadCount = notifications.filter((item) => !item.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative size-8 rounded-[5px]'>
          <Bell className='size-[18px]' />
          {unreadCount > 0 && (
            <span className='bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex size-[18px] items-center justify-center rounded-full text-[10px] font-medium'>
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-96 p-0'>
        <div className='flex items-center justify-between p-4'>
          <div>
            <p className='font-medium'>Unified inbox</p>
            <p className='text-muted-foreground text-xs'>{unreadCount} unread</p>
          </div>
          <Button variant='ghost' size='sm' onClick={() => markAllRead.mutate()}>
            Mark all read
          </Button>
        </div>
        <Separator />
        <ScrollArea className='h-[360px]'>
          <div className='space-y-2 p-2'>
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type='button'
                className={`w-full rounded-lg border p-3 text-left ${notification.read ? 'bg-background' : 'bg-accent/20'}`}
                onClick={() => {
                  markNotificationRead.mutate(notification.id)
                  if (notification.entityId?.startsWith('doc')) navigate(`/docs/${notification.entityId}`)
                  if (notification.entityId?.startsWith('meeting')) navigate(`/meetings/${notification.entityId}`)
                }}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-medium'>{notification.title}</p>
                    <p className='text-muted-foreground text-xs'>{notification.description}</p>
                  </div>
                  {!notification.read && <Badge className='rounded-[5px]'>New</Badge>}
                </div>
                <p className='text-muted-foreground mt-2 text-xs'>{notification.timestamp}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
