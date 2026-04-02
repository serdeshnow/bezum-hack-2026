# Stage 08: Notifications Slice

## Goal

Turn `Notifications` into the unified attention layer of the product.

This stage implements one connected route:

- `/notifications`

## Why This Stage Matters

The hackathon service stops feeling unified if the user still has to manually check:

- document approvals
- meeting vote requests
- mentions
- PR and release events

This stage makes the earlier slices feel like one service instead of a collection of screens.

## Contract Layer Added

The shared contract/mocks now include:

- `Notification`

This was added to:

- `shared/api/contracts/seamlessBackbone.ts`
- `shared/api/mock/seamlessBackbone.ts`

## Mock Data Added

The mock layer now stores notification events tied to:

- docs
- meetings
- pull requests
- releases
- tasks

It also exposes live notification mutations:

- `updateMockNotificationReadState(notificationId, read)`
- `markAllMockNotificationsRead(userId)`

## FSD Structure Added

### Widgets

- `widgets/unified-inbox`

### Pages

- `pages/unified-inbox/UnifiedInboxPage.tsx`

## What Unified Inbox Now Does

`/notifications` is now a real inbox surface.

It includes:

- searchable notification feed
- unread and category filters
- approvals, meetings, delivery, and mentions grouping
- inline mark-as-read and mark-as-unread
- mark-all-read action
- links back into the originating product context

This is the layer that turns the rest of the system into one connected workflow.

## Important Modeling Notes

The backend contract uses a generic `entityType` string.

For the current MVP, the UI maps that generic field into practical inbox categories:

- `document` plus approval wording -> `approvals`
- `meeting` -> `meetings`
- `release` and `pull-request` -> `delivery`
- remaining task/comment-style events -> `mentions`

That keeps the frontend aligned with the provided API while still giving the inbox a useful product structure.

## Live Behavior Implemented

This stage is not static.

The following actions are already live on the mock layer:

- mark a single notification read/unread
- mark all notifications read

The inbox query is invalidated after each action so unread counts and feed state stay consistent.

## What This Unlocks Next

With this stage complete, the system now has:

- backbone
- tasks
- docs
- meetings
- delivery
- notifications

That unlocks the final polishing phase:

- loading / empty / error refinement
- tighter visual alignment with the figma reference
- demo scenario hardening
- e2e walkthrough stabilization
