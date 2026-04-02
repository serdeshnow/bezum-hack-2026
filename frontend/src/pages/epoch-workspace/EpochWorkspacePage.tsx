import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { epochWorkspaceQueries } from '@/widgets/epoch-workspace/model/epochWorkspace.ts'
import { EpochWorkspace } from '@/widgets/epoch-workspace/ui/EpochWorkspace.tsx'
import { Card, Spinner } from '@/shared/ui'

export function EpochWorkspacePage() {
  const { epochId } = useParams<{ epochId: string }>()
  const epochWorkspaceQuery = useQuery(epochWorkspaceQueries.byId(epochId))

  if (epochWorkspaceQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (epochWorkspaceQuery.isError) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load epoch workspace data.
      </Card>
    )
  }

  if (!epochWorkspaceQuery.data) {
    return (
      <Card className='border-amber-200 bg-amber-50 text-amber-900' theme='secondary'>
        No epoch data is available for this route.
      </Card>
    )
  }

  return <EpochWorkspace data={epochWorkspaceQuery.data} />
}
