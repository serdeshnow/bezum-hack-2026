import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Badge, Card, Progress } from '@/shared/ui'
import type { PullRequest, Release } from '@/shared/api/contracts/seamlessBackbone.ts'
import type { ReleaseDashboardData } from '@/widgets/release-dashboard/model/releaseDashboard.ts'

type ReleaseDashboardProps = {
  data: ReleaseDashboardData
  isPullRequestUpdating: boolean
  isReleaseUpdating: boolean
  onPullRequestStatusChange: (pullRequestId: string, status: PullRequest['status']) => void
  onReleaseStatusChange: (releaseId: string, status: Release['status']) => void
}

function releaseVariant(status: Release['status']) {
  return status === 'deployed' ? 'success' : status === 'in-progress' ? 'warning' : status === 'failed' || status === 'rolled-back' ? 'danger' : 'outline'
}

function prVariant(status: PullRequest['status']) {
  return status === 'merged' ? 'success' : status === 'reviewing' ? 'warning' : status === 'closed' ? 'danger' : 'outline'
}

function taskVariant(status: string) {
  return status === 'done' ? 'success' : status === 'review' ? 'warning' : status === 'cancelled' ? 'danger' : 'outline'
}

export function ReleaseDashboard({
  data,
  isPullRequestUpdating,
  isReleaseUpdating,
  onPullRequestStatusChange,
  onReleaseStatusChange
}: ReleaseDashboardProps) {
  const [tab, setTab] = useState<'releases' | 'prs'>('releases')
  const [searchValue, setSearchValue] = useState('')
  const [selectedReleaseId, setSelectedReleaseId] = useState(data.releases[0]?.id ?? '')
  const [selectedPullRequestId, setSelectedPullRequestId] = useState(data.pullRequests[0]?.id ?? '')

  const filteredReleases = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase()
    return data.releases.filter((release) =>
      normalized.length === 0 || [release.version, release.title, release.projectKey, release.projectName, release.authorName].join(' ').toLowerCase().includes(normalized)
    )
  }, [data.releases, searchValue])

  const filteredPullRequests = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase()
    return data.pullRequests.filter((pullRequest) =>
      normalized.length === 0 ||
      [pullRequest.title, pullRequest.branch, pullRequest.projectKey, pullRequest.projectName, pullRequest.authorName, pullRequest.releaseVersion ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    )
  }, [data.pullRequests, searchValue])

  const selectedRelease = useMemo(
    () => filteredReleases.find((release) => release.id === selectedReleaseId) ?? filteredReleases[0] ?? null,
    [filteredReleases, selectedReleaseId]
  )
  const selectedPullRequest = useMemo(
    () => filteredPullRequests.find((pullRequest) => pullRequest.id === selectedPullRequestId) ?? filteredPullRequests[0] ?? null,
    [filteredPullRequests, selectedPullRequestId]
  )

  useEffect(() => {
    if (selectedRelease && selectedRelease.id !== selectedReleaseId) setSelectedReleaseId(selectedRelease.id)
  }, [selectedRelease, selectedReleaseId])

  useEffect(() => {
    if (selectedPullRequest && selectedPullRequest.id !== selectedPullRequestId) setSelectedPullRequestId(selectedPullRequest.id)
  }, [selectedPullRequest, selectedPullRequestId])

  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.3)_100%)]' theme='secondary'>
        <div className='grid gap-6'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid max-w-[82ch] gap-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Delivery Slice</p>
              <div className='grid gap-2'>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>Releases and Pull Requests</h1>
                <p className='max-w-[82ch] text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  Delivery state is now visible as a single product graph from tasks into PRs, releases, docs, and sprint impact.
                </p>
              </div>
            </div>

            <div className='ui-segment'>
              <button className='ui-segment-btn' data-active={tab === 'releases'} type='button' onClick={() => setTab('releases')}>
                Releases
              </button>
              <button className='ui-segment-btn' data-active={tab === 'prs'} type='button' onClick={() => setTab('prs')}>
                PRs
              </button>
            </div>
          </div>

          <input
            className='ui-control'
            placeholder='Search releases, PRs, projects, or authors'
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

      {tab === 'releases' ? (
        <div className='grid gap-6 2xl:grid-cols-[340px_minmax(0,1fr)]'>
          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Releases</p>
              {filteredReleases.map((release) => (
                <button
                  key={release.id}
                  className={`rounded-[28px] border px-4 py-4 text-left transition-colors ${
                    selectedRelease?.id === release.id
                      ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                      : 'border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)]'
                  }`}
                  type='button'
                  onClick={() => setSelectedReleaseId(release.id)}
                >
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div>
                      <p className='font-semibold'>{release.version} {release.title}</p>
                      <p className={`mt-1 text-sm leading-7 ${selectedRelease?.id === release.id ? 'text-[rgba(242,240,235,0.78)]' : 'text-[color:var(--muted-foreground)]'}`}>{release.projectKey} / {release.authorName}</p>
                    </div>
                    <Badge className={selectedRelease?.id === release.id ? 'border-white/30 bg-white/10 text-white' : ''} variant={releaseVariant(release.status)}>{release.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {selectedRelease ? (
            <div className='grid gap-6'>
              <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                <div className='grid gap-5'>
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='outline'>{selectedRelease.projectKey}</Badge>
                        <Badge variant={releaseVariant(selectedRelease.status)}>{selectedRelease.status}</Badge>
                      </div>
                      <h2 className='mt-3 font-heading text-4xl uppercase leading-[1] tracking-[0.03em] text-[color:var(--foreground)]'>{selectedRelease.version} {selectedRelease.title}</h2>
                      <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>{selectedRelease.narrative}</p>
                    </div>

                    <label className='grid gap-2 min-w-[220px]'>
                      <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Release status</span>
                      <select
                        className='ui-control'
                        disabled={isReleaseUpdating}
                        value={selectedRelease.status}
                        onChange={(event) => onReleaseStatusChange(selectedRelease.id, event.target.value as Release['status'])}
                      >
                        <option value='planned'>Planned</option>
                        <option value='in-progress'>In Progress</option>
                        <option value='deployed'>Deployed</option>
                        <option value='failed'>Failed</option>
                        <option value='rolled-back'>Rolled Back</option>
                      </select>
                    </label>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2 2xl:grid-cols-4'>
                    <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'><p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Target Date</p><p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedRelease.targetDate ?? 'Not set'}</p></div>
                    <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'><p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Deployed At</p><p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedRelease.deployedAt ?? 'Pending deploy'}</p></div>
                    <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'><p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Commits</p><p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedRelease.commitsCount}</p></div>
                    <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'><p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Updated</p><p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedRelease.updatedAtLabel}</p></div>
                  </div>

                  <div className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-5 py-5'>
                    <div className='flex items-center justify-between gap-3 text-sm text-[color:var(--muted-foreground)]'>
                      <span>Delivery readiness</span>
                      <span className='font-medium text-[color:var(--foreground)]'>{selectedRelease.readinessPercent}%</span>
                    </div>
                    <div className='mt-3'><Progress value={selectedRelease.readinessPercent} /></div>
                  </div>
                </div>
              </Card>

              <div className='grid gap-6 2xl:grid-cols-3'>
                <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                  <div className='grid gap-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Tasks</p>
                    {selectedRelease.linkedTasks.map((task) => (
                      <div key={task.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5'>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                          <Link className='font-semibold leading-7 text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={`/tasks/${task.id}`}>{task.key} {task.title}</Link>
                          <Badge variant={taskVariant(task.status)}>{task.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                  <div className='grid gap-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Pull Requests</p>
                    {selectedRelease.linkedPullRequests.map((pullRequest) => (
                      <div key={pullRequest.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5'>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                          <p className='font-semibold leading-7 text-[color:var(--foreground)]'>#{pullRequest.number} {pullRequest.title}</p>
                          <Badge variant={prVariant(pullRequest.status)}>{pullRequest.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                  <div className='grid gap-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Docs and Epochs</p>
                    {selectedRelease.linkedDocuments.map((document) => (
                      <Link key={document.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5 text-inherit no-underline' to={`/docs/${document.id}`}>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                          <p className='font-semibold leading-7 text-[color:var(--foreground)]'>{document.title}</p>
                          <Badge variant={document.status === 'approved' ? 'success' : document.status === 'in-review' ? 'warning' : 'muted'}>{document.status}</Badge>
                        </div>
                      </Link>
                    ))}
                    {selectedRelease.impactedEpochs.map((epoch) => (
                      <Link key={epoch.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5 text-inherit no-underline' to={`/epochs/${epoch.id}`}>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                          <p className='font-semibold leading-7 text-[color:var(--foreground)]'>{epoch.title}</p>
                          <Badge variant={epoch.status === 'completed' ? 'success' : epoch.status === 'at-risk' ? 'warning' : 'outline'}>{epoch.status}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className='grid gap-6 2xl:grid-cols-[340px_minmax(0,1fr)]'>
          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Pull Requests</p>
              {filteredPullRequests.map((pullRequest) => (
                <button
                  key={pullRequest.id}
                  className={`rounded-[28px] border px-4 py-4 text-left transition-colors ${
                    selectedPullRequest?.id === pullRequest.id
                      ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                      : 'border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)]'
                  }`}
                  type='button'
                  onClick={() => setSelectedPullRequestId(pullRequest.id)}
                >
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div>
                      <p className='font-semibold'>#{pullRequest.number} {pullRequest.title}</p>
                      <p className={`mt-1 text-sm leading-7 ${selectedPullRequest?.id === pullRequest.id ? 'text-[rgba(242,240,235,0.78)]' : 'text-[color:var(--muted-foreground)]'}`}>{pullRequest.projectKey} / {pullRequest.authorName}</p>
                    </div>
                    <Badge className={selectedPullRequest?.id === pullRequest.id ? 'border-white/30 bg-white/10 text-white' : ''} variant={prVariant(pullRequest.status)}>{pullRequest.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {selectedPullRequest ? (
            <div className='grid gap-6'>
              <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                <div className='grid gap-5'>
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='outline'>{selectedPullRequest.projectKey}</Badge>
                        <Badge variant={prVariant(selectedPullRequest.status)}>{selectedPullRequest.status}</Badge>
                        {selectedPullRequest.releaseVersion ? <Badge variant='outline'>{selectedPullRequest.releaseVersion}</Badge> : null}
                      </div>
                      <h2 className='mt-3 font-heading text-4xl uppercase leading-[1] tracking-[0.03em] text-[color:var(--foreground)]'>#{selectedPullRequest.number} {selectedPullRequest.title}</h2>
                      <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>{selectedPullRequest.branch}</p>
                    </div>

                    <label className='grid gap-2 min-w-[220px]'>
                      <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>PR status</span>
                      <select
                        className='ui-control'
                        disabled={isPullRequestUpdating}
                        value={selectedPullRequest.status}
                        onChange={(event) => onPullRequestStatusChange(selectedPullRequest.id, event.target.value as PullRequest['status'])}
                      >
                        <option value='open'>Open</option>
                        <option value='reviewing'>Reviewing</option>
                        <option value='merged'>Merged</option>
                        <option value='closed'>Closed</option>
                      </select>
                    </label>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2 2xl:grid-cols-4'>
                    <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'><p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Author</p><p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedPullRequest.authorName}</p></div>
                    <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'><p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Commits</p><p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedPullRequest.commitsCount}</p></div>
                    <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'><p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Linked Docs</p><p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedPullRequest.linkedDocumentCount}</p></div>
                    <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'><p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Updated</p><p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedPullRequest.updatedAtLabel}</p></div>
                  </div>
                </div>
              </Card>

              <div className='grid gap-6 2xl:grid-cols-2'>
                <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                  <div className='grid gap-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Linked Tasks</p>
                    {selectedPullRequest.linkedTasks.map((task) => (
                      <div key={task.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5'>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                          <Link className='font-semibold leading-7 text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={`/tasks/${task.id}`}>{task.key} {task.title}</Link>
                          <Badge variant={taskVariant(task.status)}>{task.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                  <div className='grid gap-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Release Context</p>
                    {selectedPullRequest.releaseVersion ? (
                      <div className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5'>
                        <p className='font-semibold leading-7 text-[color:var(--foreground)]'>{selectedPullRequest.releaseVersion}</p>
                        <p className='mt-1 text-sm leading-7 text-[color:var(--muted-foreground)]'>This PR is attached to a tracked release package.</p>
                        <Link className='mt-3 inline-flex text-sm font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to='/releases'>Open release dashboard</Link>
                      </div>
                    ) : (
                      <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                        This PR is not attached to a release yet.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
