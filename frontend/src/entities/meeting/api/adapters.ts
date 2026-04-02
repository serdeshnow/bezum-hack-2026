import type { MeetingRecapData, MeetingSchedulerData } from '@/shared/mocks/seamless.ts'
import { VoteStatus } from '@/shared/api'

export type MeetingSchedulerViewModel = MeetingSchedulerData & {
  slotSummaries: Array<{
    slotId: string
    available: number
    unavailable: number
    tentative: number
    agreementLabel: string
  }>
  closestViableSlotId: string | null
}

export type MeetingRecapViewModel = MeetingRecapData & {
  publishLabel: string
  actionItemsToCreate: number
  decisionCount: number
  appliedDocumentCount: number
}

function getSlotSummary(slot: MeetingSchedulerData['timeSlots'][number]) {
  const statuses = Object.values(slot.votes)
  const available = statuses.filter((status) => status === VoteStatus.Available).length
  const unavailable = statuses.filter((status) => status === VoteStatus.Unavailable).length
  const tentative = statuses.filter((status) => status === VoteStatus.Maybe).length

  return {
    slotId: slot.id,
    available,
    unavailable,
    tentative,
    agreementLabel: unavailable === 0 ? 'Closest viable slot' : 'Needs alignment'
  }
}

export function adaptMeetingSchedulerViewModel(data: MeetingSchedulerData): MeetingSchedulerViewModel {
  const slotSummaries = data.timeSlots.map(getSlotSummary)
  const closestViableSlot = slotSummaries.find((slot) => slot.unavailable === 0)

  return {
    ...data,
    slotSummaries,
    closestViableSlotId: closestViableSlot?.slotId ?? null
  }
}

export function adaptMeetingRecapViewModel(data: MeetingRecapData): MeetingRecapViewModel {
  return {
    ...data,
    publishLabel: data.approved ? 'Unpublish recap' : 'Publish recap',
    actionItemsToCreate: data.actionItems.filter((item) => !item.alreadyTask && !item.taskId).length,
    decisionCount: data.decisions.length,
    appliedDocumentCount: data.linkedDocuments.filter((document) => document.applied).length
  }
}
