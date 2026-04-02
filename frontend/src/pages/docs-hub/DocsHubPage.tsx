import { useQuery } from '@tanstack/react-query'

import { Card, Spinner } from '@/shared/ui'
import { docsHubQueries } from '@/widgets/docs-hub/model/docsHub.ts'
import { DocsHub } from '@/widgets/docs-hub/ui/DocsHub.tsx'

export function DocsHubPage() {
  const docsHubQuery = useQuery(docsHubQueries.list())

  if (docsHubQuery.isPending) {
    return (
      <div className='flex min-h-[320px] items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (docsHubQuery.isError || !docsHubQuery.data) {
    return (
      <Card className='border-rose-200 bg-rose-50 text-rose-900' theme='secondary'>
        Failed to load documentation hub data.
      </Card>
    )
  }

  return <DocsHub data={docsHubQuery.data} />
}
