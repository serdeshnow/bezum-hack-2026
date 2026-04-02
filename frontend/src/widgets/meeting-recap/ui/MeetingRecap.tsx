import { Link } from 'react-router'

import { Badge, Card } from '@/shared/ui'
import type { MeetingRecapData } from '@/widgets/meeting-recap/model/meetingRecap.ts'

type MeetingRecapProps = {
  data: MeetingRecapData
  isApproving: boolean
  onApproveSummary: (approved: boolean) => void
}

function statusBadgeVariant(status: MeetingRecapData['status']) {
  if (status === 'completed') return 'success'
  if (status === 'scheduled') return 'warning'
  if (status === 'cancelled') return 'danger'
  return 'muted'
}

function priorityBadgeVariant(priority: MeetingRecapData['actionItems'][number]['priority']) {
  if (priority === 'critical') return 'danger'
  if (priority === 'high') return 'warning'
  if (priority === 'medium') return 'outline'
  return 'muted'
}

export function MeetingRecap({ data, isApproving, onApproveSummary }: MeetingRecapProps) {
  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.34)_100%)]' theme='secondary'>
        <div className='grid gap-6'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid max-w-[82ch] gap-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Meetings Slice</p>
              <div className='grid gap-2'>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>Meeting Recap</h1>
                <p className='max-w-[82ch] text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  Structured recap keeps transcript, decisions, action items, and document updates together so meeting outcomes become usable product
                  context instead of disappearing into a calendar event.
                </p>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='outline'>{data.projectKey}</Badge>
              <Badge variant={statusBadgeVariant(data.status)}>{data.status}</Badge>
              <Badge variant='outline'>{data.type}</Badge>
            </div>
          </div>

          <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]'>
            <div className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-5 py-5'>
              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-2xl font-semibold leading-8 text-[color:var(--foreground)]'>{data.title}</p>
                <Link className='text-sm font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to='/meetings'>
                  Back to meetings
                </Link>
              </div>
              <p className='mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]'>{data.description ?? 'This meeting recap currently relies on linked context and extracted follow-ups.'}</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {data.dateLabel ? <Badge variant='outline'>{data.dateLabel}</Badge> : null}
                {data.timeRangeLabel ? <Badge variant='outline'>{data.timeRangeLabel}</Badge> : null}
                {data.recordingDurationLabel ? <Badge variant='outline'>{data.recordingDurationLabel}</Badge> : null}
              </div>
            </div>

            <div className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-5 py-5'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Source Context</p>
              <p className='mt-3 text-lg font-semibold leading-7 text-[color:var(--foreground)]'>{data.sourceContext.title}</p>
              {data.sourceContext.href ? (
                <Link className='mt-3 inline-flex text-sm font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={data.sourceContext.href}>
                  Open source context
                </Link>
              ) : null}
              <p className='mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]'>Recap data now travels back into tasks, docs, and sprint context through this linked source.</p>
            </div>
          </div>
        </div>
      </Card>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4'>
        {data.summaryCards.map((item) => (
          <Card key={item.id} className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{item.label}</p>
              <p className='font-heading text-4xl uppercase leading-[1.02] tracking-[0.03em] text-[color:var(--foreground)]'>{item.value}</p>
              <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{item.detail}</p>
            </div>
          </Card>
        ))}
      </section>

      <div className='grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]'>
        <div className='grid gap-6'>
          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Attendees</p>
                  <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Meeting roster</h2>
                </div>
                <Badge variant='outline'>{data.attendees.length} participants</Badge>
              </div>

              <div className='grid gap-3 md:grid-cols-2 2xl:grid-cols-3'>
                {data.attendees.map((attendee) => (
                  <div key={attendee.userId} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='inline-flex size-10 items-center justify-center rounded-full bg-[color:var(--secondary)] text-sm font-semibold text-[color:var(--foreground)]'>
                        {attendee.initials}
                      </div>
                      {attendee.attended ? <Badge variant='success'>attended</Badge> : <Badge variant='muted'>planned</Badge>}
                    </div>
                    <p className='mt-3 font-semibold leading-7 text-[color:var(--foreground)]'>{attendee.name}</p>
                    <p className='mt-1 text-sm leading-7 text-[color:var(--muted-foreground)]'>{attendee.roleLabel}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Transcript</p>
                <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Conversation trace</h2>
              </div>

              {data.transcript.length > 0 ? (
                <div className='grid gap-4'>
                  {data.transcript.map((entry) => (
                    <div key={entry.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='outline'>{entry.timeLabel}</Badge>
                        <p className='text-sm font-semibold text-[color:var(--foreground)]'>{entry.speakerName}</p>
                      </div>
                      <p className='mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]'>{entry.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  Transcript will appear after the meeting recording is available.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className='grid gap-6'>
          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>AI Summary</p>
                  <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>AI Summary</h2>
                </div>
                {data.aiSummaryApproved ? <Badge variant='success'>approved</Badge> : <Badge variant='warning'>pending approval</Badge>}
              </div>

              <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{data.aiSummary.overview}</p>

              <div className='grid gap-2'>
                {data.aiSummary.keyPoints.map((point) => (
                  <div key={point} className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-3 text-sm leading-7 text-[color:var(--foreground)]'>
                    {point}
                  </div>
                ))}
              </div>

              <button
                className={`min-h-11 rounded-2xl border px-4 text-sm font-medium transition-colors ${
                  isApproving
                    ? 'cursor-not-allowed border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]'
                    : data.aiSummaryApproved
                      ? 'border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)]'
                      : 'border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[#2c2a28]'
                }`}
                disabled={isApproving}
                type='button'
                onClick={() => onApproveSummary(!data.aiSummaryApproved)}
              >
                {data.aiSummaryApproved ? 'Mark as pending review' : 'Approve summary for docs'}
              </button>
            </div>
          </Card>

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Decisions</p>
                <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Decision log</h2>
              </div>

              {data.decisions.length > 0 ? (
                <div className='grid gap-3'>
                  {data.decisions.map((decision) => (
                    <div key={decision.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5'>
                      <p className='font-semibold leading-7 text-[color:var(--foreground)]'>{decision.decision}</p>
                      <p className='mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>Owner: {decision.ownerName}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  No decisions captured yet.
                </div>
              )}
            </div>
          </Card>

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Action Items</p>
                <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Execution follow-up</h2>
              </div>

              {data.actionItems.length > 0 ? (
                <div className='grid gap-3'>
                  {data.actionItems.map((item) => (
                    <div key={item.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5'>
                      <div className='flex flex-wrap items-start justify-between gap-3'>
                        <p className='font-semibold leading-7 text-[color:var(--foreground)]'>{item.taskText}</p>
                        <Badge variant={priorityBadgeVariant(item.priority)}>{item.priority}</Badge>
                      </div>
                      <div className='mt-3 flex flex-wrap items-center gap-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>
                        <span className='inline-flex size-7 items-center justify-center rounded-full bg-[color:var(--secondary)] text-xs font-semibold text-[color:var(--foreground)]'>
                          {item.assigneeInitials}
                        </span>
                        <span>{item.assigneeName}</span>
                        {item.dueDate ? <span>Due {item.dueDate}</span> : null}
                        {item.taskId ? (
                          <Link className='font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={`/tasks/${item.taskId}`}>
                            Open task
                          </Link>
                        ) : (
                          <Badge variant='muted'>meeting-only</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  No action items have been extracted yet.
                </div>
              )}
            </div>
          </Card>

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Document Updates</p>
                <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Linked document suggestions</h2>
              </div>

              {data.linkedDocuments.length > 0 ? (
                <div className='grid gap-3'>
                  {data.linkedDocuments.map((document) => (
                    <div key={document.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-5'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-semibold leading-7 text-[color:var(--foreground)]'>{document.title}</p>
                        <Badge variant={document.status === 'approved' ? 'success' : document.status === 'in-review' ? 'warning' : 'muted'}>
                          {document.status}
                        </Badge>
                      </div>
                      <p className='mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]'>{document.updateSuggestion}</p>
                      <Link className='mt-3 inline-flex text-sm font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={`/docs/${document.id}`}>
                        Open document
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  No linked documents need updates yet.
                </div>
              )}
            </div>
          </Card>

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Insights</p>
                <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Automation notes</h2>
              </div>

              {data.insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`rounded-[24px] border px-4 py-4 text-sm leading-6 ${
                    insight.tone === 'warning'
                      ? 'border-[color:var(--warning)] bg-[color:var(--warning-soft)] text-[color:var(--foreground)]'
                      : 'border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--foreground)]'
                  }`}
                >
                  {insight.text}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
