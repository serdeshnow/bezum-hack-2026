import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Badge, Card } from '@/shared/ui'
import type { InboxNotificationCategory, UnifiedInboxData } from '@/widgets/unified-inbox/model/unifiedInbox.ts'

type UnifiedInboxProps = {
  data: UnifiedInboxData
  isMarkingAllRead: boolean
  isUpdatingReadState: boolean
  onMarkAllRead: () => void
  onToggleRead: (notificationId: string, read: boolean) => void
}

function categoryVariant(category: InboxNotificationCategory) {
  if (category === 'approvals') return 'warning'
  if (category === 'delivery') return 'success'
  if (category === 'meetings') return 'outline'
  if (category === 'mentions') return 'muted'
  return 'outline'
}

const categoryOptions: Array<{ id: InboxNotificationCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'mentions', label: 'Mentions' }
]

export function UnifiedInbox({
  data,
  isMarkingAllRead,
  isUpdatingReadState,
  onMarkAllRead,
  onToggleRead
}: UnifiedInboxProps) {
  const [activeCategory, setActiveCategory] = useState<InboxNotificationCategory>('all')
  const [searchValue, setSearchValue] = useState('')

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return data.notifications.filter((notification) => {
      const matchesCategory =
        activeCategory === 'all' ||
        (activeCategory === 'unread' ? !notification.read : notification.category === activeCategory)

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [notification.title, notification.description, notification.actorName, notification.entityLabel].join(' ').toLowerCase().includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, data.notifications, searchValue])

  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.28)_100%)]' theme='secondary'>
        <div className='grid gap-6'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid max-w-[82ch] gap-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Notifications Slice</p>
              <div className='grid gap-2'>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>Unified Inbox</h1>
                <p className='max-w-[82ch] text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  Keep approvals, meeting requests, mentions, and delivery updates in one feed so product context no longer gets split across separate
                  tools and surfaces.
                </p>
              </div>
            </div>

            <button
              className={`ui-btn ${
                isMarkingAllRead
                  ? 'cursor-not-allowed border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]'
                  : 'ui-btn-primary'
              }`}
              disabled={isMarkingAllRead}
              type='button'
              onClick={onMarkAllRead}
            >
              Mark all read
            </button>
          </div>

          <input
            className='ui-control'
            placeholder='Search notifications by title, actor, or entity'
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
      </Card>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4'>
        {data.summary.map((item) => (
          <Card key={item.id} className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{item.label}</p>
              <p className='font-heading text-4xl uppercase leading-[1.02] tracking-[0.03em] text-[color:var(--foreground)]'>{item.value}</p>
              <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{item.detail}</p>
            </div>
          </Card>
        ))}
      </section>

      <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
        <div className='grid gap-5'>
          <div className='ui-segment'>
            {categoryOptions.map((option) => (
              <button
                key={option.id}
                className='ui-segment-btn'
                data-active={activeCategory === option.id}
                type='button'
                onClick={() => setActiveCategory(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className='grid gap-3'>
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-[28px] border px-5 py-5 transition-colors ${notification.read ? 'border-[color:var(--border)] bg-[color:var(--background-elevated)]' : 'border-sky-200 bg-sky-50'}`}
              >
                <div className='flex flex-wrap items-start justify-between gap-4'>
                  <div className='flex min-w-0 flex-1 items-start gap-3'>
                    <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)]'>
                      {notification.actorInitials}
                    </div>

                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-semibold leading-7 text-[color:var(--foreground)]'>{notification.title}</p>
                        {!notification.read ? <Badge variant='warning'>unread</Badge> : null}
                        <Badge variant={categoryVariant(notification.category)}>{notification.category}</Badge>
                        <Badge variant='outline'>{notification.entityLabel}</Badge>
                      </div>

                      <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>{notification.description}</p>
                      <div className='mt-3 flex flex-wrap items-center gap-3 text-sm leading-7 text-[color:var(--muted-foreground)]'>
                        <span>{notification.actorName}</span>
                        <span>{notification.timestamp}</span>
                        {notification.href ? (
                          <Link className='font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={notification.href}>
                            Open context
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <button
                    className={`ui-btn ${
                      isUpdatingReadState
                        ? 'cursor-not-allowed border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]'
                        : 'ui-btn-secondary bg-white'
                    }`}
                    disabled={isUpdatingReadState}
                    type='button'
                    onClick={() => onToggleRead(notification.id, !notification.read)}
                  >
                    {notification.read ? 'Mark unread' : 'Mark read'}
                  </button>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 ? (
              <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                No notifications match the current filters.
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  )
}
