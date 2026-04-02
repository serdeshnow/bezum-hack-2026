# Stage 05: Docs Slice

## Goal

Turn `Docs` into the main knowledge and approval subsystem of the product.

This stage implements three connected routes:

- `/docs`
- `/docs/:documentId`
- `/docs/:documentId/history`

## Why This Stage Matters

The hackathon case explicitly scores:

- document hierarchy
- visibility zones
- statuses
- versioning
- approvals
- change rationale
- links between docs, tasks, meetings, epochs, and releases

Because of that, `Docs` is not a support screen. It is one of the core product pillars.

## Contract Layer Added

The shared contract/mocks now include document-specific entities:

- `DocumentFolder`
- `DocumentOwner`
- `DocumentApprover`
- `DocumentVersion`
- `DocumentApproval`
- `DocumentComment`
- `ChangeSource`
- `ApprovalDecision`

This was added to:

- `shared/api/contracts/seamlessBackbone.ts`
- `shared/api/mock/seamlessBackbone.ts`

## Mock Data Added

The mock data layer now stores:

- folder structure
- owners and approvers
- multiple document versions
- approval records
- document comments
- version content with inline widgets

It also exposes two live mutations:

- `updateMockDocumentStatus(documentId, status)`
- `createMockDocumentComment(documentId, authorUserId, content)`

## FSD Structure Added

### Widgets

- `widgets/docs-hub`
- `widgets/document-editor`
- `widgets/document-history`

### Pages

- `pages/docs-hub/DocsHubPage.tsx`
- `pages/document-editor/DocumentEditorPage.tsx`
- `pages/document-history/DocumentHistoryPage.tsx`

## What Docs Hub Now Does

`/docs` is now a real browsing surface.

It includes:

- folder navigation
- search
- status filter
- scope filter
- awaiting approval filter
- document list with linked entity counts
- summary cards for doc health

This is the discovery entry point for the document graph.

## What Document Editor Now Does

`/docs/:documentId` is now the main working surface for a document.

It includes:

- document metadata bar
- current version label
- status and access scope
- owners and approvers
- linked epoch, tasks, meetings, release, and PRs
- inline widget rendering inside markdown
- comment panel
- status update mutation
- comment creation mutation

Current inline widgets supported in markdown:

- `TASK_WIDGET`
- `MEETING_SUMMARY`
- `RELEASE_WIDGET`
- `PR_REFERENCE`

## What History Now Does

`/docs/:documentId/history` shows:

- version timeline
- selected version details
- approval matrix
- side-by-side before/after content
- decision log with rationale

This is the main answer to the case requirement around “what changed, why it changed, and who approved it”.

## Important Modeling Notes

Some document context is direct, some is derived:

- doc -> task uses `DocumentLink(entityType=task)`
- doc -> release uses `DocumentLink(entityType=release)`
- doc -> meeting also uses `Meeting(sourceContextType=doc)`
- doc -> PRs are derived through release linkage

That is acceptable for now because it keeps the UI close to the API contracts we already have while the backend is still being finalized.

## Live Behavior Implemented

This stage is not static.

The following actions are already live on the mock layer:

- changing document status
- adding document comments

Related queries are invalidated so `Docs Hub`, `Document Editor`, `Document History`, and the broader backbone stay consistent.

## What This Unlocks Next

With this stage complete, the system now has:

- project backbone
- task execution layer
- document knowledge + approval layer

That unlocks the next major stage cleanly:

- `Meetings slice`
- meeting scheduling
- recap and transcript context
- decisions and action items linked back into tasks and docs
