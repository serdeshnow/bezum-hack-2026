import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Badge, Card, Progress } from '@/shared/ui'
import type { DocumentEditorData } from '@/widgets/document-editor/model/documentEditor.ts'

type DocumentEditorProps = {
  data: DocumentEditorData
  isCommentSubmitting?: boolean
  isStatusUpdating?: boolean
  onAddComment: (content: string) => void
  onStatusChange: (status: DocumentEditorData['status']) => void
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-4'>
      <div className='grid gap-1.5'>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{eyebrow}</p>
        <h2 className='font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function TaskWidget({ taskId, data }: { taskId: string; data: DocumentEditorData }) {
  const task = data.linkedTasks.find((entry) => entry.id === taskId)
  if (!task) return null

  return (
    <div className='rounded-[28px] border border-sky-200 bg-sky-50 px-5 py-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='grid gap-1.5'>
          <p className='text-xs font-semibold uppercase tracking-[0.16em] text-sky-700'>Task Widget</p>
          <p className='text-base font-semibold leading-7 text-[color:var(--foreground)]'>
            {task.key} {task.title}
          </p>
        </div>
        <Badge variant={task.status === 'done' ? 'success' : task.status === 'review' ? 'warning' : 'outline'}>{task.status}</Badge>
      </div>
    </div>
  )
}

function MeetingWidget({ meetingId, data }: { meetingId: string; data: DocumentEditorData }) {
  const meeting = data.linkedMeetings.find((entry) => entry.id === meetingId)
  if (!meeting) return null

  return (
    <div className='rounded-[28px] border border-violet-200 bg-violet-50 px-5 py-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='grid gap-1.5'>
          <p className='text-xs font-semibold uppercase tracking-[0.16em] text-violet-700'>Meeting Summary</p>
          <p className='text-base font-semibold leading-7 text-[color:var(--foreground)]'>{meeting.title}</p>
        </div>
        <Badge variant={meeting.status === 'completed' ? 'success' : 'warning'}>{meeting.status}</Badge>
      </div>
    </div>
  )
}

function ReleaseWidget({ releaseId, data }: { releaseId: string; data: DocumentEditorData }) {
  const release = data.linkedRelease?.id === releaseId ? data.linkedRelease : null
  if (!release) return null

  const progress = release.status === 'deployed' ? 100 : release.status === 'in-progress' ? 68 : release.status === 'planned' ? 32 : 12

  return (
    <div className='rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-5'>
      <div className='grid gap-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='grid gap-1.5'>
            <p className='text-xs font-semibold uppercase tracking-[0.16em] text-amber-700'>Release Widget</p>
            <p className='text-base font-semibold leading-7 text-[color:var(--foreground)]'>
              {release.version} {release.title}
            </p>
          </div>
          <Badge variant={release.status === 'deployed' ? 'success' : release.status === 'in-progress' ? 'warning' : 'outline'}>{release.status}</Badge>
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center justify-between text-sm leading-7 text-[color:var(--muted-foreground)]'>
            <span>Readiness</span>
            <span className='font-medium text-[color:var(--foreground)]'>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>
    </div>
  )
}

function PullRequestWidget({ pullRequestId, data }: { pullRequestId: string; data: DocumentEditorData }) {
  const pullRequest = data.linkedPullRequests.find((entry) => entry.id === pullRequestId)
  if (!pullRequest) return null

  return (
    <div className='rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='grid gap-1.5'>
          <p className='text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700'>PR Reference</p>
          <p className='text-base font-semibold leading-7 text-[color:var(--foreground)]'>
            #{pullRequest.number} {pullRequest.title}
          </p>
        </div>
        <Badge variant={pullRequest.status === 'merged' ? 'success' : pullRequest.status === 'reviewing' ? 'warning' : 'outline'}>{pullRequest.status}</Badge>
      </div>
    </div>
  )
}

function renderMarkdown(contentMarkdown: string, data: DocumentEditorData) {
  const lines = contentMarkdown.split('\n')

  return lines.map((line, index) => {
    if (line.startsWith('# ')) {
      return (
        <h1 key={index} className='mt-8 font-heading text-4xl uppercase leading-[1] tracking-[0.03em] text-[color:var(--foreground)] first:mt-0'>
          {line.slice(2)}
        </h1>
      )
    }

    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className='mt-8 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>
          {line.slice(3)}
        </h2>
      )
    }

    if (line.startsWith('- ')) {
      return (
        <li key={index} className='ml-6 list-disc text-sm leading-8 text-[color:var(--foreground)]'>
          {line.slice(2)}
        </li>
      )
    }

    if (line.startsWith('[TASK_WIDGET:')) {
      const taskId = line.match(/\[TASK_WIDGET:(.+)\]/)?.[1] ?? ''
      return <TaskWidget key={index} data={data} taskId={taskId} />
    }

    if (line.startsWith('[MEETING_SUMMARY:')) {
      const meetingId = line.match(/\[MEETING_SUMMARY:(.+)\]/)?.[1] ?? ''
      return <MeetingWidget key={index} data={data} meetingId={meetingId} />
    }

    if (line.startsWith('[RELEASE_WIDGET:')) {
      const releaseId = line.match(/\[RELEASE_WIDGET:(.+)\]/)?.[1] ?? ''
      return <ReleaseWidget key={index} data={data} releaseId={releaseId} />
    }

    if (line.startsWith('[PR_REFERENCE:')) {
      const pullRequestId = line.match(/\[PR_REFERENCE:(.+)\]/)?.[1] ?? ''
      return <PullRequestWidget key={index} data={data} pullRequestId={pullRequestId} />
    }

    if (line.trim().length === 0) {
      return <div key={index} className='h-2' />
    }

    return (
      <p key={index} className='text-sm leading-8 text-[color:var(--foreground)]'>
        {line}
      </p>
    )
  })
}

export function DocumentEditor({ data, isCommentSubmitting, isStatusUpdating, onAddComment, onStatusChange }: DocumentEditorProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'links'>('comments')
  const [commentValue, setCommentValue] = useState('')
  const renderedMarkdown = useMemo(() => renderMarkdown(data.contentMarkdown, data), [data])

  function handleSubmitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = commentValue.trim()
    if (!value) return
    onAddComment(value)
    setCommentValue('')
  }

  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.38)_100%)]' theme='secondary'>
        <div className='grid gap-6'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid max-w-[80ch] gap-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{data.projectKey}</p>
                <Badge variant={data.status === 'approved' ? 'success' : data.status === 'in-review' ? 'warning' : data.status === 'rejected' ? 'danger' : 'muted'}>
                  {data.status}
                </Badge>
                <Badge variant='outline'>v{data.versionLabel}</Badge>
                <Badge variant='outline'>{data.accessScope}</Badge>
              </div>
              <div className='grid gap-2'>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>{data.title}</h1>
                <p className='max-w-[80ch] text-sm leading-7 text-[color:var(--muted-foreground)]'>{data.description}</p>
              </div>
            </div>

            <div className='grid gap-2 sm:grid-cols-2'>
              <Link
                className='ui-btn ui-btn-primary'
                to={`/docs/${data.id}/history`}
              >
                Open History
              </Link>
              <Link
                className='ui-btn ui-btn-secondary'
                to='/tasks'
              >
                Quote To Task
              </Link>
            </div>
          </div>

          <div className='grid gap-3 md:grid-cols-2 2xl:grid-cols-4'>
            <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'>
              <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Epoch</p>
              <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{data.linkedEpoch?.title ?? 'No epoch link'}</p>
            </div>
            <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'>
              <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Tasks</p>
              <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{data.linkedTasks.length} linked tasks</p>
            </div>
            <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'>
              <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Meetings</p>
              <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{data.linkedMeetings.length} linked meetings</p>
            </div>
            <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-sm text-[color:var(--muted-foreground)]'>
              <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Release</p>
              <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{data.linkedRelease ? data.linkedRelease.version : 'No release link'}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className='grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_360px]'>
        <div className='grid gap-6'>
          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-5'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <SectionHeading eyebrow='Editor' title='Document content' />
                <div className='flex flex-wrap gap-2'>
                  {['Bold', 'Italic', 'List', 'Link', 'Insert Widget'].map((action) => (
                    <span key={action} className='rounded-full border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>
                      {action}
                    </span>
                  ))}
                </div>
              </div>

              <div className='grid gap-5 rounded-[32px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-7 py-7'>
                {renderedMarkdown}
              </div>
            </div>
          </Card>
        </div>

        <aside className='grid gap-6'>
          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-5'>
              <SectionHeading eyebrow='Metadata' title='Owners and status' />

              <label className='grid gap-2'>
                <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Status</span>
                <select
                  className='ui-control'
                  disabled={isStatusUpdating}
                  value={data.status}
                  onChange={(event) => onStatusChange(event.target.value as DocumentEditorData['status'])}
                >
                  <option value='draft'>Draft</option>
                  <option value='in-review'>In Review</option>
                  <option value='approved'>Approved</option>
                  <option value='obsolete'>Obsolete</option>
                  <option value='rejected'>Rejected</option>
                </select>
              </label>

              <div className='grid gap-3'>
                <div className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] p-5'>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Owners</p>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {data.owners.map((owner) => (
                      <div key={owner.id} className='flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)]'>
                        <span className='flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--primary)] text-xs font-semibold text-[color:var(--primary-foreground)]'>{owner.initials}</span>
                        <span>{owner.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] p-5'>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Approvers</p>
                  <div className='mt-3 grid gap-2'>
                    {data.approvers.map((approver) => (
                      <div key={approver.id} className='flex items-center justify-between gap-3 rounded-[22px] border border-[color:var(--border)] bg-white px-3 py-3'>
                        <div className='flex items-center gap-2'>
                          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--primary)] text-xs font-semibold text-[color:var(--primary-foreground)]'>{approver.initials}</span>
                          <span className='text-sm leading-7 text-[color:var(--foreground)]'>{approver.name}</span>
                        </div>
                        <Badge variant={approver.approved ? 'success' : 'warning'}>{approver.approved ? 'approved' : 'pending'}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-5'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <SectionHeading eyebrow='Context' title='Comments and links' />
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
                    data-active={activeTab === 'links'}
                    type='button'
                    onClick={() => setActiveTab('links')}
                  >
                    Links
                  </button>
                </div>
              </div>

              {activeTab === 'comments' ? (
                <div className='grid gap-4'>
                  <form className='ui-panel grid gap-3 rounded-[28px] p-5' onSubmit={handleSubmitComment}>
                    <textarea
                      className='ui-control ui-textarea bg-white'
                      placeholder='Add a document comment or approval note'
                      value={commentValue}
                      onChange={(event) => setCommentValue(event.target.value)}
                    />
                    <button
                      className='ui-btn ui-btn-primary disabled:cursor-not-allowed disabled:opacity-60'
                      disabled={isCommentSubmitting || commentValue.trim().length === 0}
                      type='submit'
                    >
                      {isCommentSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </form>

                  <div className='grid gap-3'>
                    {data.comments.map((comment) => (
                      <div key={comment.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                        <div className='flex items-center justify-between gap-3'>
                          <div className='flex items-center gap-3'>
                            <span className='flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--primary)] text-xs font-semibold text-[color:var(--primary-foreground)]'>{comment.authorInitials}</span>
                            <div className='grid gap-0.5'>
                              <p className='font-medium leading-7 text-[color:var(--foreground)]'>{comment.authorName}</p>
                              <p className='text-sm leading-6 text-[color:var(--muted-foreground)]'>{comment.createdAt}</p>
                            </div>
                          </div>
                          {comment.resolved ? <Badge variant='success'>resolved</Badge> : <Badge variant='outline'>open</Badge>}
                        </div>
                        <p className='mt-3 text-sm leading-7 text-[color:var(--foreground)]'>{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='grid gap-3'>
                  {data.linkedEpoch ? (
                    <Link
                      className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-inherit no-underline transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-highlight)]'
                      to={`/epochs/${data.linkedEpoch.id}`}
                    >
                      <p className='font-medium leading-7 text-[color:var(--foreground)]'>{data.linkedEpoch.title}</p>
                      <p className='mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]'>Linked epoch</p>
                    </Link>
                  ) : null}

                  {data.linkedTasks.map((task) => (
                    <Link
                      key={task.id}
                      className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-inherit no-underline transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-highlight)]'
                      to={`/tasks/${task.id}`}
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <div>
                          <p className='font-medium leading-7 text-[color:var(--foreground)]'>
                            {task.key} {task.title}
                          </p>
                          <p className='mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]'>Linked task</p>
                        </div>
                        <Badge variant={task.status === 'done' ? 'success' : task.status === 'review' ? 'warning' : 'outline'}>{task.status}</Badge>
                      </div>
                    </Link>
                  ))}

                  {data.linkedMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-inherit no-underline transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-highlight)]'
                      to={`/meetings/${meeting.id}`}
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <div>
                          <p className='font-medium leading-7 text-[color:var(--foreground)]'>{meeting.title}</p>
                          <p className='mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]'>Linked meeting</p>
                        </div>
                        <Badge variant={meeting.status === 'completed' ? 'success' : 'warning'}>{meeting.status}</Badge>
                      </div>
                    </Link>
                  ))}

                  {data.linkedRelease ? (
                    <Link
                      className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-inherit no-underline transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-highlight)]'
                      to='/releases'
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <div>
                          <p className='font-medium leading-7 text-[color:var(--foreground)]'>
                            {data.linkedRelease.version} {data.linkedRelease.title}
                          </p>
                          <p className='mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]'>Linked release</p>
                        </div>
                        <Badge variant={data.linkedRelease.status === 'deployed' ? 'success' : data.linkedRelease.status === 'in-progress' ? 'warning' : 'outline'}>
                          {data.linkedRelease.status}
                        </Badge>
                      </div>
                    </Link>
                  ) : null}

                  {data.linkedPullRequests.map((pullRequest) => (
                    <Link
                      key={pullRequest.id}
                      className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4 text-inherit no-underline transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-highlight)]'
                      to='/releases'
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <div>
                          <p className='font-medium leading-7 text-[color:var(--foreground)]'>
                            #{pullRequest.number} {pullRequest.title}
                          </p>
                          <p className='mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]'>Linked PR</p>
                        </div>
                        <Badge variant={pullRequest.status === 'merged' ? 'success' : pullRequest.status === 'reviewing' ? 'warning' : 'outline'}>{pullRequest.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
