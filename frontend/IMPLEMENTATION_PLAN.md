# Seamless Frontend Rollout Plan

This document tracks the production rollout for `/frontend` using only these source-of-truth inputs:

1. `../figma/contracts/case.md`
2. `../figma/contracts/review.md`
3. `../figma/contracts/openapi.yml`
4. `../figma/contracts/*`
5. `../figma/src/styles/theme.css`
6. `../figma/src/app/components/ui`
7. `../figma/src/app/pages`

## Current Audit Snapshot

Audit date: 2026-04-02

Verified facts:

- Routing shell exists for all required routes.
- `swagger-typescript-api` generation already points at `../figma/contracts/openapi.yml`.
- Theme foundation is partially migrated and now uses the Figma token file shape.
- `next-themes`, `@tanstack/react-query`, `zustand`, `zod`, and `react-error-boundary` are present.
- Unit tests exist, but only for a small part of the required surface.
- `features/` is effectively empty.
- Session/auth is still tightly coupled to mocks and not yet aligned with the target `entities/session` contract.
- Entities/widgets/pages exist, but most flows are still widget-first and not decomposed into the required feature layer.
- Some data shaping still relies on `shared/mocks/seamless.ts` instead of a generated-contract-first adapter strategy.

## Delivery Principles

- FSD only.
- Work only inside `/frontend`.
- No runtime imports from `/figma`.
- Generated transport types remain the only DTO source when available.
- Domain models are built through adapters above generated contracts.
- UX states required everywhere: `loading`, `empty`, `error`, `populated`.
- Only unit tests and typecheck are required gates.

## Execution Phases

### Phase 0. Foundation Migration

Status: in progress

Scope:

- Finalize migration of shared design-system primitives from the Figma reference.
- Remove legacy UI remnants, hardcoded theme behavior, and non-required tooling.
- Normalize app providers, query client, theme provider, route error boundaries, and app bootstrap.
- Rework session bootstrap around `env + localStorage` with a transport-stub boundary.
- Formalize route constants and access rules around `WorkspaceRole` and `DocumentAccessScope`.

Exit criteria:

- App boots without runtime errors.
- No required runtime path depends on `shared/mocks` directly from pages/widgets.
- Theme switching works with `light`, `dark`, and `system`.
- Auth shell and guards are isolated and swappable.

### Phase 1. App Shell and Global UX Foundation

Status: partially implemented

Scope:

- Sidebar, header, breadcrumbs, project switcher, theme toggle, notifications entrypoint.
- Command/search trigger and quick actions.
- Shared state primitives for page/widget branching.

Gaps:

- Search and quick actions are still shell-level placeholders.
- Role/access presentation is not yet enforced consistently through feature boundaries.

### Phase 2. Projects and Epoch Projection Base

Status: partially implemented

Scope:

- Projects list.
- Project overview.
- Epoch workspace.
- Shared epoch chips, progress, summary adapters.

Gaps:

- Aggregation logic is still page/widget-local instead of reusable entity/feature selectors.
- Epoch context is not yet projected uniformly across all subsystems.

### Phase 3. Docs-Kanban Connectivity

Status: partially implemented

Scope:

- Docs hub.
- Document editor with markdown storage.
- Document history.
- Kanban board.
- Task details.
- Shortcode renderer for `[TASK_WIDGET:id]`, `[MEETING_SUMMARY:id]`, `[RELEASE_WIDGET:id]`, `[PR_REFERENCE:id]`.
- Manual linking, mention linking, quote flow, approval trail.

Gaps:

- Current document widget utilities cover only a fraction of the required inline experience.
- Linking flows are not yet featureized.
- Quote-to-task discussion flow is not yet implemented as a dedicated feature.

### Phase 4. Meeting Flow

Status: partially implemented

Scope:

- Meeting scheduler.
- Voting matrix and slot aggregation.
- Meeting recap with transcript, AI summary, decisions, action items, linked docs.
- Publish recap and create-task-from-action-item flow.

Gaps:

- Scheduler source-context inheritance needs stronger entity adapters.
- Publish/apply-to-document flows are not yet decomposed into features.

### Phase 5. Delivery / GitHub Integration

Status: partially implemented

Scope:

- Release dashboard.
- Pull request list.
- Task PR sync surface.
- Inline PR/release widgets in docs and release side panels.

Gaps:

- PR state mapping needs explicit domain adapters and tests.
- Shared delivery timeline/system-state presentation is still thin.

### Phase 6. Epoch Projection Across Subsystems

Status: not started

Scope:

- Uniform epoch badges, summaries, filters, deeplinks, and aggregate calculators.

### Phase 7. Unified Notifications

Status: partially implemented

Scope:

- `/notifications` page.
- Header dropdown.
- Unread filtering.
- Entity-type filtering.
- Deeplink routing.

Gaps:

- Filtering/read transforms need explicit tested selectors.
- Role-based alerts and mentions are not yet normalized into one adapter layer.

### Phase 8. Settings and Hardening

Status: partially implemented

Scope:

- Settings page backed by user + preferences.
- Theme preference and notification flags.
- Final sweep of state branches and legacy placeholders.

Gaps:

- Current settings flow is not yet clearly separated into profile/preferences features.
- Existing test coverage is far below the required hardening threshold.

## Verification Matrix

Run after each phase:

1. `npm run generate-api`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`

## Required New Unit Test Areas

- Session bootstrap and auth stub flow.
- Route guards and access predicates.
- Query factories.
- Domain adapters from generated contracts to UI models.
- Document shortcode renderer.
- Vote aggregation and viable-slot selection.
- PR status mapping.
- Notification filter/read transforms.
- Page/widget branching for `loading`, `empty`, `error`, `populated`.

## Immediate Next Slice

1. Replace mock-first session architecture with contract-aligned `entities/session`.
2. Introduce the missing feature layer for auth, theme toggle, project switcher, and notification mark-read.
3. Move widget-local data shaping into entity adapters/selectors with tests.
4. Expand docs/task/meeting/release inline-linking flows using generated contract models.
