import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Badge, Card } from '@/shared/ui'
import type { VoteStatus } from '@/shared/api/contracts/seamlessBackbone.ts'
import type { MeetingSchedulerData } from '@/widgets/meeting-scheduler/model/meetingScheduler.ts'

type MeetingSchedulerProps = {
  data: MeetingSchedulerData
  isVoteUpdating: boolean
  onVoteChange: (slotId: string, participantUserId: string, status: VoteStatus) => void
}

function voteBadgeVariant(status: VoteStatus) {
  if (status === 'available') return 'success'
  if (status === 'maybe') return 'warning'
  if (status === 'unavailable') return 'danger'
  return 'muted'
}

function meetingBadgeVariant(status: string) {
  if (status === 'completed') return 'success'
  if (status === 'scheduled') return 'warning'
  if (status === 'cancelled') return 'danger'
  return 'muted'
}

export function MeetingScheduler({ data, isVoteUpdating, onVoteChange }: MeetingSchedulerProps) {
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed'>('all')
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(data.meetings[0]?.id ?? '')
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('')
  const [selectedSlotId, setSelectedSlotId] = useState<string>('')

  const filteredMeetings = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return data.meetings.filter((meeting) => {
      const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [meeting.title, meeting.projectKey, meeting.projectName, meeting.sourceContext.title, meeting.description ?? '']
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [data.meetings, searchValue, statusFilter])

  const selectedMeeting = useMemo(
    () => filteredMeetings.find((meeting) => meeting.id === selectedMeetingId) ?? filteredMeetings[0] ?? data.meetings[0] ?? null,
    [data.meetings, filteredMeetings, selectedMeetingId]
  )

  useEffect(() => {
    if (selectedMeeting && selectedMeeting.id !== selectedMeetingId) {
      setSelectedMeetingId(selectedMeeting.id)
    }
  }, [selectedMeeting, selectedMeetingId])

  useEffect(() => {
    if (!selectedMeeting) {
      setSelectedParticipantId('')
      setSelectedSlotId('')
      return
    }

    if (!selectedMeeting.participants.some((participant) => participant.userId === selectedParticipantId)) {
      setSelectedParticipantId(selectedMeeting.participants[0]?.userId ?? '')
    }

    if (!selectedMeeting.slots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(selectedMeeting.recommendedSlotId ?? selectedMeeting.slots[0]?.id ?? '')
    }
  }, [selectedMeeting, selectedParticipantId, selectedSlotId])

  const selectedSlot = selectedMeeting?.slots.find((slot) => slot.id === selectedSlotId) ?? null
  const selectedParticipant = selectedMeeting?.participants.find((participant) => participant.userId === selectedParticipantId) ?? null

  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.42)_100%)]' theme='secondary'>
        <div className='grid gap-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid max-w-[82ch] gap-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]'>Meetings Slice</p>
              <div className='grid gap-2'>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>Meeting Scheduler</h1>
                <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  Plan meetings from task, document, epoch, or project context, keep slot voting visible, and preserve the same product graph that
                  feeds recap, docs, and delivery.
                </p>
              </div>
            </div>

            <div className='rounded-[24px] border border-[color:var(--border)] bg-[rgba(255,255,255,0.38)] px-4 py-3 text-sm leading-7 text-[color:var(--foreground)]'>
              Scheduler votes stay connected to source context, linked docs, and follow-up action items.
            </div>
          </div>

          <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]'>
            <input
              className='ui-control'
              placeholder='Search by meeting, project, or source context'
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />

            <select
              className='ui-control'
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | 'scheduled' | 'completed')}
            >
              <option value='all'>All meetings</option>
              <option value='scheduled'>Scheduled only</option>
              <option value='completed'>Completed only</option>
            </select>

            <div className='ui-control flex items-center text-[color:var(--muted-foreground)]'>
              {filteredMeetings.length} visible workspaces
            </div>
          </div>
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

      <div className='grid gap-6 2xl:grid-cols-[320px_minmax(0,1fr)]'>
        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Workspaces</p>
              <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Meeting queue</h2>
            </div>

            <div className='grid gap-3'>
              {filteredMeetings.map((meeting) => (
                <button
                  key={meeting.id}
                  className={`rounded-[28px] border px-4 py-4 text-left transition-colors ${
                    selectedMeeting?.id === meeting.id
                      ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                      : 'border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-highlight)]'
                  }`}
                  type='button'
                  onClick={() => setSelectedMeetingId(meeting.id)}
                >
                  <div className='grid gap-3'>
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <div className='grid gap-1'>
                        <p className='text-base font-semibold leading-7'>{meeting.title}</p>
                        <p className={`text-sm leading-7 ${selectedMeeting?.id === meeting.id ? 'text-[rgba(242,240,235,0.78)]' : 'text-[color:var(--muted-foreground)]'}`}>
                          {meeting.projectKey} / {meeting.type}
                        </p>
                      </div>

                      <Badge className={selectedMeeting?.id === meeting.id ? 'border-white/30 bg-white/10 text-white' : ''} variant={meetingBadgeVariant(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </div>

                    <div className={`flex flex-wrap gap-2 text-xs leading-6 ${selectedMeeting?.id === meeting.id ? 'text-[rgba(242,240,235,0.78)]' : 'text-[color:var(--muted-foreground)]'}`}>
                      <span>{meeting.startsAtLabel ?? 'No fixed slot yet'}</span>
                      <span>{meeting.pendingResponses} pending</span>
                      <span>{meeting.linkedDocumentCount} docs</span>
                    </div>
                  </div>
                </button>
              ))}

              {filteredMeetings.length === 0 ? (
                <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  No meetings match the current filters.
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        {selectedMeeting ? (
          <div className='grid gap-6'>
            <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
              <div className='grid gap-5'>
                <div className='flex flex-wrap items-start justify-between gap-4'>
                  <div className='grid gap-3'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='outline'>{selectedMeeting.projectKey}</Badge>
                      <Badge variant={meetingBadgeVariant(selectedMeeting.status)}>{selectedMeeting.status}</Badge>
                      <Badge variant='outline'>{selectedMeeting.type}</Badge>
                    </div>
                    <div className='grid gap-2'>
                      <h2 className='font-heading text-4xl uppercase leading-[1] tracking-[0.03em] text-[color:var(--foreground)]'>{selectedMeeting.title}</h2>
                      <p className='max-w-[80ch] text-sm leading-7 text-[color:var(--muted-foreground)]'>
                        {selectedMeeting.description ?? 'Meeting description will be filled from scheduler context.'}
                      </p>
                    </div>
                  </div>

                  <Link
                    className='ui-btn ui-btn-primary'
                    to={selectedMeeting.recapHref}
                  >
                    Open recap
                  </Link>
                </div>

                <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]'>
                  <div className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Source Context</p>
                    <div className='mt-3 flex flex-wrap items-center gap-2'>
                      <p className='text-lg font-semibold leading-7 text-[color:var(--foreground)]'>{selectedMeeting.sourceContext.title}</p>
                      {selectedMeeting.sourceContext.href ? (
                        <Link className='text-sm font-medium text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={selectedMeeting.sourceContext.href}>
                          Open source
                        </Link>
                      ) : null}
                    </div>
                    <div className='mt-4 flex flex-wrap gap-2'>
                      <Badge variant='outline'>{selectedMeeting.sourceContext.linkedCounts.docs} docs</Badge>
                      <Badge variant='outline'>{selectedMeeting.sourceContext.linkedCounts.tasks} tasks</Badge>
                      <Badge variant='outline'>{selectedMeeting.sourceContext.linkedCounts.epochs} epochs</Badge>
                      <Badge variant='outline'>{selectedMeeting.sourceContext.linkedCounts.releases} releases</Badge>
                    </div>
                  </div>

                  <div className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Scheduler Health</p>
                    <div className='mt-3 grid gap-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>
                      <p>{selectedMeeting.participants.length} participants</p>
                      <p>{selectedMeeting.pendingResponses} pending responses</p>
                      <p>{selectedMeeting.linkedDocumentCount} linked document updates</p>
                      <p>{selectedMeeting.actionItemCount} action items already in scope</p>
                      <p>Updated {selectedMeeting.updatedAtLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className='grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]'>
              <div className='grid gap-6'>
                <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                  <div className='grid gap-4'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Participants</p>
                      <h3 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Voting roster</h3>
                    </div>

                    <div className='grid gap-3 md:grid-cols-2 2xl:grid-cols-3'>
                      {selectedMeeting.participants.map((participant) => (
                        <button
                          key={participant.userId}
                          className={`rounded-[24px] border px-4 py-4 text-left transition-colors ${
                            selectedParticipant?.userId === participant.userId
                              ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                              : 'border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)]'
                          }`}
                          type='button'
                          onClick={() => setSelectedParticipantId(participant.userId)}
                        >
                          <div className='grid gap-3'>
                            <div className='flex items-center justify-between gap-3'>
                              <div className={`inline-flex size-10 items-center justify-center rounded-full text-sm font-semibold ${selectedParticipant?.userId === participant.userId ? 'bg-white/10 text-white' : 'bg-[color:var(--secondary)] text-[color:var(--foreground)]'}`}>
                                {participant.initials}
                              </div>
                              {participant.attended ? <Badge className={selectedParticipant?.userId === participant.userId ? 'border-white/30 bg-white/10 text-white' : ''} variant='success'>attended</Badge> : null}
                            </div>
                            <div className='grid gap-1'>
                              <p className='font-semibold leading-7'>{participant.name}</p>
                              <p className={`text-sm leading-7 ${selectedParticipant?.userId === participant.userId ? 'text-[rgba(242,240,235,0.78)]' : 'text-[color:var(--muted-foreground)]'}`}>
                                {participant.roleLabel}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                  <div className='grid gap-4'>
                    <div className='flex flex-wrap items-center justify-between gap-4'>
                      <div>
                        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Slot Voting</p>
                        <h3 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Slot voting matrix</h3>
                      </div>
                      {selectedMeeting.recommendedSlotId ? <Badge variant='warning'>recommended slot highlighted</Badge> : null}
                    </div>

                    {selectedMeeting.slots.length > 0 ? (
                      <div className='overflow-x-auto'>
                        <table className='min-w-full border-separate border-spacing-y-3'>
                          <thead>
                            <tr>
                              <th className='px-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted-foreground)]'>Slot</th>
                              {selectedMeeting.participants.map((participant) => (
                                <th key={participant.userId} className='px-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted-foreground)]'>
                                  {participant.initials}
                                </th>
                              ))}
                              <th className='px-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted-foreground)]'>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMeeting.slots.map((slot) => (
                              <tr
                                key={slot.id}
                                className={`cursor-pointer rounded-[24px] transition-colors ${selectedSlot?.id === slot.id ? 'bg-[color:var(--secondary)]' : 'bg-[color:var(--background-elevated)] hover:bg-[color:var(--card-highlight)]'}`}
                                onClick={() => setSelectedSlotId(slot.id)}
                              >
                                <td className='rounded-l-[24px] border border-r-0 border-[color:var(--border)] px-3 py-4'>
                                  <div className='flex items-center gap-2'>
                                    {selectedMeeting.recommendedSlotId === slot.id ? <Badge variant='warning'>best</Badge> : null}
                                    <div className='grid gap-1'>
                                      <p className='font-medium leading-7 text-[color:var(--foreground)]'>{slot.label}</p>
                                      <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{slot.timeRange}</p>
                                    </div>
                                  </div>
                                </td>
                                {selectedMeeting.participants.map((participant) => {
                                  const vote = slot.votes.find((entry) => entry.participantUserId === participant.userId)?.status ?? 'no-response'

                                  return (
                                    <td key={participant.userId} className='border-y border-[color:var(--border)] px-3 py-4 text-center'>
                                      <Badge variant={voteBadgeVariant(vote)}>{vote}</Badge>
                                    </td>
                                  )
                                })}
                                <td className='rounded-r-[24px] border border-l-0 border-[color:var(--border)] px-3 py-4 text-right'>
                                  <span className='text-lg font-semibold leading-7 text-[color:var(--foreground)]'>{slot.score}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                        This meeting does not have slot voting yet.
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className='grid gap-6'>
                <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                  <div className='grid gap-4'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Quick Vote</p>
                      <h3 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Vote as participant</h3>
                    </div>

                    {selectedSlot && selectedParticipant ? (
                      <div className='grid gap-4'>
                        <div className='ui-panel rounded-[28px]'>
                          <p className='text-sm font-semibold leading-7 text-[color:var(--foreground)]'>{selectedParticipant.name}</p>
                          <p className='mt-1 text-sm leading-7 text-[color:var(--muted-foreground)]'>{selectedParticipant.roleLabel}</p>
                          <p className='mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]'>
                            Voting for {selectedSlot.label}, {selectedSlot.timeRange}
                          </p>
                        </div>

                        <div className='grid gap-2'>
                          {(['available', 'maybe', 'unavailable', 'no-response'] as VoteStatus[]).map((status) => (
                            <button
                              key={status}
                              className={`ui-btn justify-start text-left ${
                                isVoteUpdating
                                  ? 'cursor-not-allowed border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]'
                                  : 'ui-btn-secondary'
                              }`}
                              disabled={isVoteUpdating}
                              type='button'
                              onClick={() => onVoteChange(selectedSlot.id, selectedParticipant.userId, status)}
                            >
                              <span className='inline-flex items-center gap-2'>
                                <Badge variant={voteBadgeVariant(status)}>{status}</Badge>
                                Set vote to {status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                        Pick a meeting with slots and a participant to vote.
                      </div>
                    )}
                  </div>
                </Card>

                <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
                  <div className='grid gap-4'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Recommendation</p>
                      <h3 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Best current slot</h3>
                    </div>

                    {selectedMeeting.recommendedSlotId ? (
                      selectedMeeting.slots
                        .filter((slot) => slot.id === selectedMeeting.recommendedSlotId)
                        .map((slot) => (
                          <div key={slot.id} className='rounded-[28px] border border-[color:var(--warning)] bg-[color:var(--warning-soft)] px-4 py-4 text-[color:var(--foreground)]'>
                            <p className='text-lg font-semibold leading-7'>{slot.label}</p>
                            <p className='mt-1 text-sm leading-7'>{slot.timeRange}</p>
                            <p className='mt-3 text-sm leading-7'>Current score: {slot.score}</p>
                          </div>
                        ))
                    ) : (
                      <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                        No slot recommendation is available yet.
                      </div>
                    )}

                    <div className='grid gap-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>
                      <p>{selectedMeeting.linkedDocumentCount} linked document suggestions will flow into recap.</p>
                      <p>{selectedMeeting.actionItemCount} action items are already visible for follow-up tracking.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
