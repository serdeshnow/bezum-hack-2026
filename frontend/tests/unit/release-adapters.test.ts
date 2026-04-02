import { PullRequestStatus, ReleaseStatus, WorkspaceRole } from '../../src/shared/api'
import { adaptReleaseDashboardViewModel } from '../../src/entities/release'

describe('release adapters', () => {
  it('maps PR statuses and release readiness into delivery projections', () => {
    const viewModel = adaptReleaseDashboardViewModel({
      releases: [
        {
          id: 'release-1',
          version: 'v1.0.0',
          title: 'Foundation release',
          date: '2026-04-30',
          status: ReleaseStatus.InProgress,
          commits: 12,
          author: { id: 'user-1', name: 'Alex', initials: 'AJ', email: 'alex@example.com', role: WorkspaceRole.Developer },
          changes: { features: 4, fixes: 2, breaking: 0 },
          linkedTaskIds: ['task-1'],
          linkedPullRequestIds: ['pr-1', 'pr-2']
        }
      ],
      pullRequests: [
        {
          id: 'pr-1',
          title: 'feat: delivery sync',
          number: 101,
          status: PullRequestStatus.Reviewing,
          author: { id: 'user-1', name: 'Alex', initials: 'AJ', email: 'alex@example.com', role: WorkspaceRole.Developer },
          branch: 'feature/delivery-sync',
          commits: 5,
          date: '1 hour ago',
          linkedTaskIds: ['task-1'],
          releaseId: 'release-1'
        },
        {
          id: 'pr-2',
          title: 'feat: merged work',
          number: 102,
          status: PullRequestStatus.Merged,
          author: { id: 'user-2', name: 'Sarah', initials: 'SC', email: 'sarah@example.com', role: WorkspaceRole.Manager },
          branch: 'feature/merged',
          commits: 8,
          date: '2 hours ago',
          linkedTaskIds: ['task-2'],
          releaseId: 'release-1'
        }
      ]
    })

    expect(viewModel.summary.reviewingPullRequests).toBe(1)
    expect(viewModel.summary.mergedPullRequests).toBe(1)
    expect(viewModel.releases[0]?.linkedPullRequestCount).toBe(2)
    expect(viewModel.releases[0]?.readinessLabel).toBe('In progress')
    expect(viewModel.pullRequests[0]?.statusLabel).toBe('In review')
    expect(viewModel.pullRequests[0]?.syncLabel).toContain('Awaiting reviewer approval')
    expect(viewModel.pullRequests[1]?.statusTone).toBe('secondary')
  })
})
