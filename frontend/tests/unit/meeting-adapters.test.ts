import { MeetingSourceContextType, VoteStatus } from '../../src/shared/api'
import { adaptMeetingSchedulerViewModel } from '../../src/entities/meeting'

describe('meeting adapters', () => {
  it('computes slot summaries and closest viable slot', () => {
    const viewModel = adaptMeetingSchedulerViewModel({
      sourceContext: { type: MeetingSourceContextType.Task, id: 'task-docs', title: 'Docs sync' },
      participants: [],
      availabilityStrip: [],
      timeSlots: [
        {
          id: 'slot-1',
          date: '2026-04-05',
          time: '10:00',
          votes: {
            'user-1': VoteStatus.Available,
            'user-2': VoteStatus.Unavailable
          }
        },
        {
          id: 'slot-2',
          date: '2026-04-06',
          time: '11:00',
          votes: {
            'user-1': VoteStatus.Available,
            'user-2': VoteStatus.Available
          }
        }
      ]
    })

    expect(viewModel.slotSummaries[0]?.unavailable).toBe(1)
    expect(viewModel.slotSummaries[1]?.available).toBe(2)
    expect(viewModel.closestViableSlotId).toBe('slot-2')
  })
})
