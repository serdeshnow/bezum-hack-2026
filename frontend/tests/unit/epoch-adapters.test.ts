import { GoalStatus, MeetingType, ProjectStatus, WorkspaceRole } from '../../src/shared/api'
import { adaptEpochSummary, adaptEpochWorkspaceViewModel } from '../../src/entities/epoch'

describe('epoch adapters', () => {
  it('builds shared epoch summary and workspace totals', () => {
    const epoch = {
      id: 'epoch-1',
      projectId: 'project-1',
      name: 'Q2 2026 Delivery',
      status: ProjectStatus.Active,
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      goals: [
        {
          id: 'goal-1',
          title: 'Ship docs flow',
          description: 'Docs and tasks',
          status: GoalStatus.InProgress,
          progress: 60,
          owner: { id: 'user-1', name: 'Alex', initials: 'AJ', email: 'alex@example.com', role: WorkspaceRole.Developer }
        }
      ],
      taskStats: {
        total: 10,
        completed: 4,
        inProgress: 3,
        blocked: 1,
        backlog: 2
      },
      documents: [{ id: 'doc-1', title: 'Architecture', type: 'doc', lastUpdated: 'today', author: 'Alex' }],
      meetings: [{ id: 'meeting-1', title: 'Review', date: '2026-04-05', time: '10:00', attendees: 4, type: MeetingType.Review }],
      releaseReadiness: {
        version: 'v2.1.0',
        targetDate: '2026-04-30',
        status: 'at-risk' as const,
        checklist: []
      }
    }

    const summary = adaptEpochSummary(epoch)
    const workspace = adaptEpochWorkspaceViewModel(epoch)

    expect(summary.progress).toBe(40)
    expect(summary.documentCount).toBe(1)
    expect(summary.releaseLabel).toContain('v2.1.0')
    expect(workspace.linkedEntityTotals.totalTasks).toBe(10)
    expect(workspace.summary.title).toBe('Q2 2026 Delivery')
  })
})
