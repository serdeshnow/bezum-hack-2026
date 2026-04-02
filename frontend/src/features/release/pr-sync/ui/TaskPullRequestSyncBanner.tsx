import { AlertCircle, CheckCircle2, GitPullRequest } from 'lucide-react'

import { PullRequestStatus } from '@/shared/api'
import { Alert, AlertDescription, AlertTitle, Badge } from '@/shared/ui'

type PullRequestRef = {
  id: string
  number: number
  title: string
  status: PullRequestStatus
}

type Props = {
  pullRequests: PullRequestRef[]
}

function getBannerCopy(statuses: PullRequestStatus[]) {
  if (statuses.some((status) => status === PullRequestStatus.Closed)) {
    return {
      title: 'Delivery sync has a regression',
      description: 'At least one linked pull request was closed. Task state should be reviewed before the release projection stays green.',
      destructive: true
    }
  }

  if (statuses.some((status) => status === PullRequestStatus.Reviewing)) {
    return {
      title: 'PRs are in review',
      description: 'Implementation is present, but delivery is still waiting on reviewer approval before the task can be considered stable.',
      destructive: false
    }
  }

  if (statuses.length && statuses.every((status) => status === PullRequestStatus.Merged)) {
    return {
      title: 'PR sync is healthy',
      description: 'All linked pull requests are merged. The task is ready to roll into release readiness and downstream docs.',
      destructive: false
    }
  }

  return {
    title: 'PR sync is active',
    description: 'Linked pull requests are open and still shaping delivery state. Keep task status aligned with backend-driven PR updates.',
    destructive: false
  }
}

export function TaskPullRequestSyncBanner({ pullRequests }: Props) {
  if (!pullRequests.length) return null

  const copy = getBannerCopy(pullRequests.map((pr) => pr.status))
  const Icon = copy.destructive ? AlertCircle : CheckCircle2

  return (
    <Alert variant={copy.destructive ? 'destructive' : 'default'}>
      <Icon className='size-4' />
      <AlertTitle className='flex items-center gap-2'>
        {copy.title}
        <Badge variant='outline'>{pullRequests.length} linked PRs</Badge>
      </AlertTitle>
      <AlertDescription className='space-y-2'>
        <p>{copy.description}</p>
        <div className='flex flex-wrap gap-2 text-xs'>
          {pullRequests.map((pr) => (
            <span key={pr.id} className='inline-flex items-center gap-1 rounded-md border px-2 py-1'>
              <GitPullRequest className='size-3.5' />
              #{pr.number} {pr.title}
            </span>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  )
}
