import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Card, Spinner } from '@/shared/ui'
import { changeNotificationReadState, markAllNotificationsRead, unifiedInboxQueries } from '@/widgets/unified-inbox/model/unifiedInbox.ts'
import { UnifiedInbox } from '@/widgets/unified-inbox/ui/UnifiedInbox.tsx'

export function UnifiedInboxPage() {
  const queryClient = useQueryClient()
  const inboxQuery = useQuery(unifiedInboxQueries.inbox())

  const readStateMutation = useMutation({
    mutationFn: ({ notificationId, read }: { notificationId: string; read: boolean }) => changeNotificationReadState(notificationId, read),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['backbone', 'notifications'] })
    }
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['backbone', 'notifications'] })
    }
  })

  if (inboxQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (inboxQuery.isError || !inboxQuery.data) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load unified inbox data.
      </Card>
    )
  }

  return (
    <UnifiedInbox
      data={inboxQuery.data}
      isMarkingAllRead={markAllReadMutation.isPending}
      isUpdatingReadState={readStateMutation.isPending}
      onMarkAllRead={() => markAllReadMutation.mutate()}
      onToggleRead={(notificationId, read) => readStateMutation.mutate({ notificationId, read })}
    />
  )
}
