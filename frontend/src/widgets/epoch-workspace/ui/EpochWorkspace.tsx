import { Link } from 'react-router'

import { Badge, Card, Progress } from '@/shared/ui'
import type { EpochWorkspaceData } from '@/widgets/epoch-workspace/model/epochWorkspace.ts'

type EpochWorkspaceProps = {
  data: EpochWorkspaceData
}

export function EpochWorkspace({ data }: EpochWorkspaceProps) {
  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.48)_100%)]' theme='secondary'>
        <div className='flex flex-wrap items-start justify-between gap-5'>
          <div className='grid max-w-[72ch] gap-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]'>Epoch Workspace</p>
              <Badge variant={data.status === 'active' ? 'success' : data.status === 'at-risk' ? 'warning' : 'muted'}>{data.status}</Badge>
            </div>
            <div className='grid gap-2'>
              <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>{data.name}</h1>
              <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>
                {data.startDate} to {data.endDate}, with {data.daysRemaining} days remaining in the current sprint window.
              </p>
            </div>
          </div>

          <div className='grid gap-2 sm:grid-cols-2'>
            <Link
              className='inline-flex min-h-12 items-center justify-center rounded-[22px] border border-[color:var(--primary)] bg-[color:var(--primary)] px-4 text-sm font-medium text-[color:var(--primary-foreground)] no-underline transition-all hover:-translate-y-0.5 hover:bg-[#2c2a28]'
              to='/tasks'
            >
              View Tasks
            </Link>
            <Link
              className='inline-flex min-h-12 items-center justify-center rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 text-sm font-medium text-[color:var(--foreground)] no-underline transition-colors hover:border-[color:var(--border-strong)]'
              to='/docs'
            >
              Open Docs
            </Link>
          </div>
        </div>
      </Card>

      <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
        <div className='grid gap-5'>
          <div className='flex flex-wrap items-center justify-between gap-5'>
            <div className='grid gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Sprint Progress</p>
              <h2 className='font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>{data.completionPercent}% complete</h2>
            </div>
            <div className='grid grid-cols-2 gap-3 text-sm md:grid-cols-3 2xl:grid-cols-5'>
              <div className='rounded-[20px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3'>
                <span className='text-[color:var(--muted-foreground)]'>Total</span>
                <p className='mt-1 font-semibold text-[color:var(--foreground)]'>{data.taskStats.total}</p>
              </div>
              <div className='rounded-[20px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3'>
                <span className='text-[color:var(--muted-foreground)]'>Done</span>
                <p className='mt-1 font-semibold text-[color:var(--foreground)]'>{data.taskStats.completed}</p>
              </div>
              <div className='rounded-[20px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3'>
                <span className='text-[color:var(--muted-foreground)]'>In Progress</span>
                <p className='mt-1 font-semibold text-[color:var(--foreground)]'>{data.taskStats.inProgress}</p>
              </div>
              <div className='rounded-[20px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3'>
                <span className='text-[color:var(--muted-foreground)]'>Blocked</span>
                <p className='mt-1 font-semibold text-[color:var(--foreground)]'>{data.taskStats.blocked}</p>
              </div>
              <div className='rounded-[20px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3'>
                <span className='text-[color:var(--muted-foreground)]'>Not Started</span>
                <p className='mt-1 font-semibold text-[color:var(--foreground)]'>{data.taskStats.notStarted}</p>
              </div>
            </div>
          </div>
          <Progress value={data.completionPercent} />
        </div>
      </Card>

      <div className='grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'>
        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Goals</p>
                <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Epoch objectives</h2>
              </div>
              <Badge variant='outline'>{data.goals.length} goals</Badge>
            </div>
            <div className='grid gap-3'>
              {data.goals.map((goal) => (
                <div key={goal.id} className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] p-5'>
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div className='grid gap-2'>
                      <h3 className='text-lg font-semibold leading-7 text-[color:var(--foreground)]'>{goal.title}</h3>
                      <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{goal.description}</p>
                    </div>
                    <Badge variant={goal.status === 'completed' ? 'success' : goal.status === 'blocked' ? 'danger' : goal.status === 'in-progress' ? 'warning' : 'outline'}>
                      {goal.status}
                    </Badge>
                  </div>
                  <div className='mt-5 grid gap-3'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-[color:var(--muted-foreground)]'>{goal.ownerName}</span>
                      <span className='font-medium text-[color:var(--foreground)]'>{goal.progressPercent}%</span>
                    </div>
                    <Progress value={goal.progressPercent} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Release Readiness</p>
              <h2 className='font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>
                {data.releaseReadiness ? `${data.releaseReadiness.version} ${data.releaseReadiness.completionPercent}%` : 'No release linked'}
              </h2>
            </div>

            {data.releaseReadiness ? (
              <>
                <div className='flex flex-wrap items-center gap-3'>
                  <Badge variant={data.releaseReadiness.status === 'deployed' ? 'success' : data.releaseReadiness.status === 'in-progress' ? 'warning' : 'outline'}>
                    {data.releaseReadiness.status}
                  </Badge>
                  <span className='text-sm leading-7 text-[color:var(--muted-foreground)]'>Target date: {data.releaseReadiness.targetDate ?? 'Not set'}</span>
                </div>
                <Progress value={data.releaseReadiness.completionPercent} />
                <div className='grid gap-3'>
                  {data.releaseReadiness.checklist.map((item) => (
                    <div key={item.id} className='flex items-center justify-between gap-3 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                      <span className='text-sm leading-7 text-[color:var(--foreground)]'>{item.label}</span>
                      <Badge variant={item.completed ? 'success' : 'outline'}>{item.completed ? 'done' : 'open'}</Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>Link tasks in this epoch to a release to surface a readiness panel.</p>
            )}
          </div>
        </Card>
      </div>

      <div className='grid gap-6 2xl:grid-cols-2'>
        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Related Docs</p>
                <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Documentation in sprint context</h2>
              </div>
              <Link className='text-sm font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to='/docs'>
                View all
              </Link>
            </div>
            <div className='grid gap-3'>
              {data.documents.map((document) => (
                <div key={document.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <h3 className='text-lg font-semibold leading-7 text-[color:var(--foreground)]'>{document.title}</h3>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='outline'>{document.accessScope}</Badge>
                      <Badge variant={document.status === 'approved' ? 'success' : document.status === 'in-review' ? 'warning' : 'muted'}>{document.status}</Badge>
                    </div>
                  </div>
                  <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>
                    {document.authorName} updated this document on {document.updatedAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Meetings</p>
                <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Epoch scheduling surface</h2>
              </div>
              <Link className='text-sm font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to='/meetings'>
                Open meetings
              </Link>
            </div>
            <div className='grid gap-3'>
              {data.meetings.map((meeting) => (
                <div key={meeting.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <h3 className='text-lg font-semibold leading-7 text-[color:var(--foreground)]'>{meeting.title}</h3>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='outline'>{meeting.type}</Badge>
                      <Badge variant={meeting.status === 'completed' ? 'success' : meeting.status === 'scheduled' ? 'warning' : 'muted'}>{meeting.status}</Badge>
                    </div>
                  </div>
                  <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>{meeting.startsAt ?? 'Draft meeting without a scheduled slot yet.'}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
        <div className='grid gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Timeline</p>
            <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Key events across this epoch</h2>
          </div>
          <div className='grid gap-3'>
            {data.timeline.map((item) => (
              <div key={item.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='grid gap-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h3 className='text-lg font-semibold leading-7 text-[color:var(--foreground)]'>{item.title}</h3>
                      <Badge variant='outline'>{item.kind}</Badge>
                    </div>
                    <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{item.description}</p>
                  </div>
                  <span className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
