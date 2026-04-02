import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Badge, Card, Progress } from '@/shared/ui'
import type { TaskDetailsData } from '@/widgets/task-details/model/taskDetails.ts'

type TaskDetailsProps = {
  data: TaskDetailsData
  isCommentSubmitting?: boolean
  isStatusUpdating?: boolean
  onAddComment: (content: string) => void
  onStatusChange: (status: TaskDetailsData['status']) => void
}

const statusVariants: Record<TaskDetailsData['status'], 'muted' | 'outline' | 'warning' | 'success' | 'danger' | 'default'> = {
  backlog: 'muted',
  todo: 'outline',
  'in-progress': 'warning',
  review: 'outline',
  done: 'success',
  cancelled: 'danger'
}

const priorityVariants: Record<TaskDetailsData['priority'], 'muted' | 'outline' | 'warning' | 'danger'> = {
  low: 'muted',
  medium: 'outline',
  high: 'warning',
  critical: 'danger'
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-4'>
      <div>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{eyebrow}</p>
        <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function TaskDetails({ data, isCommentSubmitting, isStatusUpdating, onAddComment, onStatusChange }: TaskDetailsProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments')
  const [commentValue, setCommentValue] = useState('')

  const releaseProgress =
    data.linkedRelease == null
      ? 0
      : data.linkedRelease.status === 'deployed'
        ? 100
        : data.linkedRelease.status === 'in-progress'
          ? 68
          : data.linkedRelease.status === 'planned'
            ? 32
            : 18

  function handleSubmitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = commentValue.trim()
    if (!value) {
      return
    }

    onAddComment(value)
    setCommentValue('')
  }

  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.3)_100%)]' theme='secondary'>
        <div className='grid gap-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid gap-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{data.key}</p>
                <Badge variant={statusVariants[data.status]}>{data.status}</Badge>
                <Badge variant={priorityVariants[data.priority]}>{data.priority}</Badge>
                <Badge variant='outline'>{data.projectKey}</Badge>
              </div>

              <div>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>{data.title}</h1>
                <p className='mt-3 max-w-[80ch] text-sm leading-7 text-[color:var(--muted-foreground)]'>{data.description}</p>
              </div>

              <div className='flex flex-wrap gap-2'>
                {data.tags.map((tag) => (
                  <span key={tag} className='rounded-full border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-1.5 text-xs font-medium leading-6 text-[color:var(--muted-foreground)]'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className='grid gap-2 sm:grid-cols-2'>
              <Link
                className='ui-btn ui-btn-secondary'
                to='/docs'
              >
                Quote From Docs
              </Link>
              <Link
                className='ui-btn ui-btn-secondary'
                to='/meetings'
              >
                Schedule Meeting
              </Link>
            </div>
          </div>

          <div className='grid gap-3 md:grid-cols-2 2xl:grid-cols-4'>
            <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'>
              <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Assignee</p>
              <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{data.assigneeName ?? 'Unassigned'}</p>
            </div>
            <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'>
              <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Reporter</p>
              <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{data.reporterName ?? 'Unknown'}</p>
            </div>
            <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'>
              <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Epoch</p>
              <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{data.epochName ?? 'No epoch'}</p>
            </div>
            <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'>
              <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Due Date</p>
              <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{data.dueDate ?? 'Not set'}</p>
            </div>
          </div>
        </div>
      </Card>

      {data.automationInsights.length > 0 ? (
        <section className='grid gap-3'>
          {data.automationInsights.map((insight) => (
            <Card
              key={insight.id}
              className={
                insight.tone === 'warning'
                  ? 'border-[color:var(--warning)] bg-[color:var(--warning-soft)] text-[color:var(--foreground)]'
                  : 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--foreground)]'
              }
              theme='secondary'
            >
              {insight.message}
            </Card>
          ))}
        </section>
      ) : null}

      <div className='grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.85fr)]'>
        <div className='grid gap-6'>
          {data.blockers.length > 0 ? (
            <Card className='border-[color:var(--danger)] bg-[color:var(--danger-soft)]' theme='secondary'>
              <div className='grid gap-4'>
                <SectionHeading eyebrow='Blockers' title={`${data.blockers.length} active blockers`} />
                <div className='grid gap-3'>
                  {data.blockers.map((blocker) => (
                    <div key={blocker.id} className='ui-panel border-[color:var(--danger)] bg-[rgba(255,255,255,0.6)]'>
                      <p className='font-semibold leading-7 text-[color:var(--foreground)]'>{blocker.title}</p>
                      <p className='mt-2 text-sm leading-7 text-[color:var(--foreground)]'>{blocker.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : null}

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <SectionHeading
                eyebrow='Documents'
                title={`Linked docs (${data.linkedDocuments.length})`}
                action={
                  <Link className='text-sm font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to='/docs'>
                    Open docs
                  </Link>
                }
              />
              <div className='grid gap-3'>
                {data.linkedDocuments.map((document) => (
                  <div key={document.id} className='ui-panel'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <Link className='font-semibold leading-7 text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={`/docs/${document.id}`}>
                        {document.title}
                      </Link>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='outline'>{document.accessScope}</Badge>
                        <Badge variant={document.status === 'approved' ? 'success' : document.status === 'in-review' ? 'warning' : 'muted'}>
                          {document.status}
                        </Badge>
                      </div>
                    </div>
                    <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>{document.description}</p>
                    <p className='mt-3 text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Updated {document.updatedAt}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className='grid gap-6 2xl:grid-cols-2'>
            <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
              <div className='grid gap-4'>
                <SectionHeading eyebrow='Meetings' title={`Linked meetings (${data.linkedMeetings.length})`} />
                <div className='grid gap-3'>
                  {data.linkedMeetings.map((meeting) => (
                    <div key={meeting.id} className='ui-panel'>
                      <div className='flex flex-wrap items-center justify-between gap-3'>
                        <Link className='font-semibold leading-7 text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={`/meetings/${meeting.id}`}>
                          {meeting.title}
                        </Link>
                        <div className='flex flex-wrap items-center gap-2'>
                          <Badge variant='outline'>{meeting.type}</Badge>
                          <Badge variant={meeting.status === 'completed' ? 'success' : meeting.status === 'scheduled' ? 'warning' : 'muted'}>
                            {meeting.status}
                          </Badge>
                        </div>
                      </div>
                      <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>{meeting.startsAt ?? 'Draft slot without scheduled time.'}</p>
                      <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>{meeting.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
              <div className='grid gap-4'>
                <SectionHeading eyebrow='Delivery' title={`Pull requests (${data.linkedPullRequests.length})`} />
                <div className='grid gap-3'>
                  {data.linkedPullRequests.map((pullRequest) => (
                    <div key={pullRequest.id} className='ui-panel'>
                      <div className='flex flex-wrap items-center justify-between gap-3'>
                        <p className='font-semibold leading-7 text-[color:var(--foreground)]'>
                          #{pullRequest.number} {pullRequest.title}
                        </p>
                        <Badge variant={pullRequest.status === 'merged' ? 'success' : pullRequest.status === 'reviewing' ? 'warning' : 'outline'}>
                          {pullRequest.status}
                        </Badge>
                      </div>
                      <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>{pullRequest.branch}</p>
                      <div className='mt-3 flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>
                        <span>{pullRequest.authorName}</span>
                        <span>{pullRequest.commitsCount} commits</span>
                      </div>
                    </div>
                  ))}
                </div>

                {data.linkedRelease ? (
                  <div className='ui-panel rounded-[28px]'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <div>
                        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Release</p>
                        <p className='mt-1 text-lg font-semibold leading-7 text-[color:var(--foreground)]'>
                          {data.linkedRelease.version} {data.linkedRelease.title}
                        </p>
                      </div>
                      <Badge variant={data.linkedRelease.status === 'deployed' ? 'success' : data.linkedRelease.status === 'in-progress' ? 'warning' : 'outline'}>
                        {data.linkedRelease.status}
                      </Badge>
                    </div>
                    <div className='mt-4 grid gap-2'>
                      <div className='flex items-center justify-between text-sm leading-7 text-[color:var(--muted-foreground)]'>
                        <span>Readiness</span>
                        <span className='font-medium text-[color:var(--foreground)]'>{releaseProgress}%</span>
                      </div>
                      <Progress value={releaseProgress} />
                    </div>
                    <p className='mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]'>Target date: {data.linkedRelease.targetDate ?? 'Not set'}</p>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <SectionHeading eyebrow='Discussion' title='Comments and activity' />
                <div className='ui-segment'>
                  <button
                    className='ui-segment-btn'
                    data-active={activeTab === 'comments'}
                    type='button'
                    onClick={() => setActiveTab('comments')}
                  >
                    Comments
                  </button>
                  <button
                    className='ui-segment-btn'
                    data-active={activeTab === 'activity'}
                    type='button'
                    onClick={() => setActiveTab('activity')}
                  >
                    Activity
                  </button>
                </div>
              </div>

              {activeTab === 'comments' ? (
                <div className='grid gap-4'>
                  <form className='ui-panel grid gap-3 rounded-[28px] p-5' onSubmit={handleSubmitComment}>
                    <textarea
                      className='ui-control ui-textarea bg-white'
                      placeholder='Add a comment or quote a decision from a linked document'
                      value={commentValue}
                      onChange={(event) => setCommentValue(event.target.value)}
                    />
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>Comments here become part of the delivery trace for the task.</p>
                      <button
                        className='ui-btn ui-btn-primary disabled:cursor-not-allowed disabled:opacity-60'
                        disabled={isCommentSubmitting || commentValue.trim().length === 0}
                        type='submit'
                      >
                        {isCommentSubmitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>

                  <div className='grid gap-3'>
                    {data.comments.map((comment) => (
                      <div key={comment.id} className='ui-panel'>
                        <div className='flex items-center justify-between gap-3'>
                          <div className='flex items-center gap-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)]'>
                              {comment.authorInitials}
                            </div>
                            <div>
                              <p className='font-medium leading-7 text-[color:var(--foreground)]'>{comment.authorName}</p>
                              <p className='text-sm leading-6 text-[color:var(--muted-foreground)]'>{comment.createdAt}</p>
                            </div>
                          </div>
                        </div>
                        <p className='mt-3 text-sm leading-7 text-[color:var(--foreground)]'>{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='grid gap-3'>
                  {data.activity.map((item) => (
                    <div key={item.id} className='ui-panel'>
                      <div className='flex flex-wrap items-center justify-between gap-3'>
                        <div className='grid gap-1'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <p className='font-medium text-[color:var(--foreground)]'>{item.title}</p>
                            <Badge variant='outline'>{item.type}</Badge>
                          </div>
                          <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{item.description}</p>
                        </div>
                        <div className='text-right text-sm leading-6 text-[color:var(--muted-foreground)]'>
                          <p>{item.actor}</p>
                          <p className='mt-1'>{item.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <aside className='grid gap-6 2xl:sticky 2xl:top-24 2xl:h-fit'>
          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <SectionHeading eyebrow='Sidebar' title='Task controls' />

              <label className='grid gap-2'>
                <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Status</span>
                <select
                  className='ui-control'
                  disabled={isStatusUpdating}
                  value={data.status}
                  onChange={(event) => onStatusChange(event.target.value as TaskDetailsData['status'])}
                >
                  <option value='backlog'>Backlog</option>
                  <option value='todo'>To Do</option>
                  <option value='in-progress'>In Progress</option>
                  <option value='review'>Review</option>
                  <option value='done'>Done</option>
                  <option value='cancelled'>Cancelled</option>
                </select>
              </label>

              <div className='ui-panel grid gap-3 rounded-[28px] p-5 text-sm text-[color:var(--muted-foreground)]'>
                <div className='flex items-center justify-between gap-3'>
                  <span>Project</span>
                  <span className='font-medium text-[color:var(--foreground)]'>{data.projectName}</span>
                </div>
                <div className='flex items-center justify-between gap-3'>
                  <span>Created</span>
                  <span className='font-medium text-[color:var(--foreground)]'>{data.createdDate ?? 'Unknown'}</span>
                </div>
                <div className='flex items-center justify-between gap-3'>
                  <span>Documents</span>
                  <span className='font-medium text-[color:var(--foreground)]'>{data.linkedDocuments.length}</span>
                </div>
                <div className='flex items-center justify-between gap-3'>
                  <span>Meetings</span>
                  <span className='font-medium text-[color:var(--foreground)]'>{data.linkedMeetings.length}</span>
                </div>
                <div className='flex items-center justify-between gap-3'>
                  <span>Pull Requests</span>
                  <span className='font-medium text-[color:var(--foreground)]'>{data.linkedPullRequests.length}</span>
                </div>
              </div>

              <div className='grid gap-2'>
                <Link
                  className='ui-btn ui-btn-secondary'
                  to={data.epochId ? `/epochs/${data.epochId}` : '/epochs'}
                >
                  Open Epoch Workspace
                </Link>
                <Link
                  className='ui-btn ui-btn-secondary'
                  to='/releases'
                >
                  Open Delivery Dashboard
                </Link>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
