# Stage 04: Tasks Slice

## Goal

Turn `Tasks` from a placeholder route into the first operational workspace that sits on top of the backbone from stage 03.

The scope of this stage is:

- a live kanban board in `/tasks`
- a live task context page in `/tasks/:taskId`
- contract-shaped task tags and task comments
- task status mutation and task comment creation on the mock data layer
- visible links from task to docs, meetings, PRs, release, epoch, and project

## Why This Stage Comes Next

After `Projects`, `Project Overview`, and `Epoch Workspace`, the next logical center of gravity is `Task`.

`Task` is the operational entity that connects:

- project delivery
- sprint execution
- documentation updates
- meeting follow-ups
- PR and release movement

If we skipped this step, later `Docs`, `Meetings`, and `Delivery` screens would each invent their own isolated context model instead of sharing one execution surface.

## Contract Additions

The task slice now uses additional contract-shaped entities in `shared/api/contracts/seamlessBackbone.ts`:

- `TaskTag`
- `TaskComment`

The mock layer in `shared/api/mock/seamlessBackbone.ts` now contains:

- `taskTags`
- `taskComments`
- `updateMockTaskStatus(taskId, status)`
- `createMockTaskComment(taskId, authorUserId, content)`

These are intentionally small, but they already match the direction of `openapi.yml`, so they can later be replaced with real API calls without redesigning the widgets.

## FSD Structure Added

### Widgets

- `widgets/kanban-board`
  - `model/kanbanBoard.ts`
  - `ui/KanbanBoard.tsx`
- `widgets/task-details`
  - `model/taskDetails.ts`
  - `ui/TaskDetails.tsx`

### Pages

- `pages/kanban-board/KanbanBoardPage.tsx`
- `pages/task-details/TaskDetailsPage.tsx`

## What The Board Does

The board is not a generic kanban anymore.

Each card now exposes:

- task key and title
- priority
- assignee
- due date
- project and epoch context
- release version
- linked docs count
- linked meetings count
- linked PR count
- blocker count
- tags

The board also supports:

- search
- project filter
- priority filter
- drag between columns

Changing column triggers a real mutation against the mock data layer and invalidates the related task and backbone queries.

## What The Task Details Page Does

`/tasks/:taskId` now acts as the first real task workspace.

It includes:

- task header with key, status, priority, project, epoch, assignee, reporter
- automation insights
- blockers
- linked documents
- linked meetings
- linked pull requests
- linked release panel
- comments tab
- activity tab
- sidebar with task controls

Two actions are live:

- change task status
- add task comment

## Data Modeling Notes

Some links are still derived because the backend contract is not complete enough to express every traceability edge directly yet.

Current derived rules:

- task -> docs comes from `DocumentLink(entityType=task)`
- task -> meetings comes from `Meeting(sourceContextType=task)`
- task -> PRs is inferred from release linkage and task key in PR metadata
- task -> blockers is inferred from blocked sprint goals and overdue risk

This is acceptable for the current stage because the point is to establish the task workspace and shared context model, not to finalize every backend relation.

## What We Unlock Next

This stage prepares the ground for:

- docs-to-task quoting
- meeting creation from task context
- PR/release updates reflected back into task state
- deeper docs approval and meeting recap flows

## Next Stage

Continue with `Docs slice`:

- docs hub
- document editor
- document history / approval
- stronger `task <-> document` two-way connectivity
