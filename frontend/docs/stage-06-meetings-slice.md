# Stage 06: Meetings Slice

## Goal

Turn `Meetings` into a real orchestration layer between scheduling, recap, tasks, and docs.

This stage implements two connected routes:

- `/meetings`
- `/meetings/:meetingId`

## Why This Stage Matters

The hackathon case is not asking for a generic calendar widget.

It asks us to show that meetings:

- inherit context from tasks, docs, epochs, or projects
- collect slot voting and participant data
- produce recap artifacts
- generate action items
- feed updates back into documents and task execution

That makes `Meetings` a bridge layer across the whole service.

## Contract Layer Added

The shared contract/mocks now include meeting-specific entities:

- `VoteStatus`
- `MeetingParticipant`
- `MeetingAvailabilitySlot`
- `MeetingAvailabilityVote`
- `MeetingTranscriptEntry`
- `MeetingDecision`
- `MeetingActionItem`
- `MeetingLinkedDocument`

This was added to:

- `shared/api/contracts/seamlessBackbone.ts`
- `shared/api/mock/seamlessBackbone.ts`

## Mock Data Added

The mock data layer now stores:

- participants per meeting
- slot proposals with scores
- votes per participant and slot
- transcript entries for completed meetings
- structured decisions
- action items
- linked document update suggestions

It also exposes two live mutations:

- `updateMockMeetingVote(slotId, participantUserId, status)`
- `updateMockMeetingSummaryApproval(meetingId, approved)`

## FSD Structure Added

### Widgets

- `widgets/meeting-scheduler`
- `widgets/meeting-recap`

### Pages

- `pages/meeting-scheduler/MeetingSchedulerPage.tsx`
- `pages/meeting-recap/MeetingRecapPage.tsx`

## What Meeting Scheduler Now Does

`/meetings` is now a real scheduling surface.

It includes:

- meeting queue with search and status filter
- source-context card for task, doc, epoch, or project origins
- participant roster
- slot voting matrix
- best-slot recommendation
- live vote mutation

This gives us a working answer to the case requirement around meeting planning with product context.

## What Meeting Recap Now Does

`/meetings/:meetingId` is now the structured aftermath of a meeting.

It includes:

- attendee roster
- transcript trace
- AI summary
- decision log
- action items
- linked document update suggestions
- live approval toggle for the summary

This is the place where a meeting stops being a calendar event and becomes reusable product memory.

## Important Modeling Notes

The current backend contract stores only `aiSummaryApproved` on the `Meeting` entity, not the summary body itself.

Because of that, the current UI derives the visible summary text from:

- meeting description
- transcript entries
- decisions
- action items

That is intentional for now. It keeps the UI contract-first while avoiding fake backend fields that do not exist in the provided schema.

## Live Behavior Implemented

This stage is not static.

The following actions are already live on the mock layer:

- changing a participant vote for a slot
- approving or unapproving the AI summary

Related queries are invalidated so scheduler, recap, and backbone views stay aligned.

## What This Unlocks Next

With this stage complete, the system now has:

- backbone
- tasks
- docs
- meetings

That unlocks the next major stage cleanly:

- `Delivery slice`
- PR and release dashboard
- task to PR to release trace
- release context visible from both tasks and docs
