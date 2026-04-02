import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Card, Spinner } from '@/shared/ui'
import { changePullRequestStatus, changeReleaseStatus, releaseDashboardQueries } from '@/widgets/release-dashboard/model/releaseDashboard.ts'
import { ReleaseDashboard } from '@/widgets/release-dashboard/ui/ReleaseDashboard.tsx'

export function ReleaseDashboardPage() {
  const queryClient = useQueryClient()
  const dashboardQuery = useQuery(releaseDashboardQueries.dashboard())

  const releaseMutation = useMutation({
    mutationFn: ({ releaseId, status }: { releaseId: string; status: 'planned' | 'in-progress' | 'deployed' | 'failed' | 'rolled-back' }) =>
      changeReleaseStatus(releaseId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['backbone', 'delivery'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'docs'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'project-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'epoch-workspace'] })
      ])
    }
  })

  const pullRequestMutation = useMutation({
    mutationFn: ({ pullRequestId, status }: { pullRequestId: string; status: 'open' | 'reviewing' | 'merged' | 'closed' }) =>
      changePullRequestStatus(pullRequestId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['backbone', 'delivery'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'project-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['backbone', 'epoch-workspace'] })
      ])
    }
  })

  if (dashboardQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load delivery dashboard data.
      </Card>
    )
  }

  return (
    <ReleaseDashboard
      data={dashboardQuery.data}
      isPullRequestUpdating={pullRequestMutation.isPending}
      isReleaseUpdating={releaseMutation.isPending}
      onPullRequestStatusChange={(pullRequestId, status) => pullRequestMutation.mutate({ pullRequestId, status })}
      onReleaseStatusChange={(releaseId, status) => releaseMutation.mutate({ releaseId, status })}
    />
  )
}
