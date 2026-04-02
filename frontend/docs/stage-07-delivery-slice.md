# Stage 07: Delivery Slice

## Goal

Turn `Delivery` into a visible bridge from execution work to code flow and release outcomes.

This stage implements one connected route:

- `/releases`

## Why This Stage Matters

The hackathon case expects us to show that product work is connected all the way through delivery.

That means the service has to make it obvious how:

- tasks feed pull requests
- pull requests feed releases
- releases affect epochs
- release docs stay attached to the same delivery trail

Without this stage, `Tasks` and `Docs` would still feel disconnected from the actual shipping process.

## Contract Layer Used

This stage reuses the delivery entities that were already present in the shared backbone:

- `Release`
- `PullRequest`

No extra delivery entity was needed yet because the provided contracts already cover the current MVP.

## Mock Layer Added

The mock layer now exposes live delivery mutations:

- `updateMockReleaseStatus(releaseId, status)`
- `updateMockPullRequestStatus(pullRequestId, status)`

The PR mutation also updates linked release state for in-flight delivery packages when appropriate.

## FSD Structure Added

### Widgets

- `widgets/release-dashboard`

### Pages

- `pages/release-dashboard/ReleaseDashboardPage.tsx`

## What Delivery Dashboard Now Does

`/releases` is now a real delivery surface.

It includes:

- release and PR tabs
- searchable delivery list
- release readiness based on tasks, PR merge state, and docs
- task to PR to release traceability
- epoch impact visibility
- linked delivery documents
- live release and PR status updates

This gives us a strong answer to the case requirement around showing engineering delivery as part of the product graph.

## Important Modeling Notes

PR to task linkage is currently resolved by:

- direct shared `releaseId`
- PR title containing task key
- PR branch containing task key

That is acceptable for the current MVP because the backend is still being finalized and we already use the same linkage pattern in the task slice.

## Live Behavior Implemented

This stage is not static.

The following actions are already live on the mock layer:

- changing release status
- changing PR status

Related queries are invalidated so delivery changes stay visible from the dashboard and the broader project context.

## What This Unlocks Next

With this stage complete, the system now has:

- backbone
- tasks
- docs
- meetings
- delivery

That unlocks the next major stage cleanly:

- `Notifications slice`
- unified inbox
- approval requests
- meeting vote requests
- PR and release alerts in one surface
