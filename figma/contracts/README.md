# Figma Service Contracts

This folder contains the service contract package aligned with [review.md](/Users/serdeshnow/Programming/fullstack-projects/bezum-hack-2026/figma/contracts/review.md).

`review.md` is the authoritative simplified database model for the current iteration.

## Files

- `review.md`: current reviewed database model
- `database-models.md`: original fuller database proposal kept for comparison
- `enums.ts`: shared scalar aliases and enum types used by code contracts
- `db.ts`: machine-readable database records synchronized to `review.md`
- `api.ts`: service DTOs and request/response contracts adjusted to the reviewed scope

## Current Scope

The reviewed contract keeps these aggregates:

1. Users and minimal preferences
2. Projects and project memberships
3. Epochs and goals
4. Tasks, tags, comments
5. Documents, folders, owners, approvers, versions, approvals, comments, links
6. Meetings, participants, availability, transcript, decisions, action items
7. Releases and pull requests
8. Notifications

The reviewed contract intentionally removes or defers these persistence models:

- task blockers
- task watchers
- task comment mentions
- task activities
- document decision logs
- meeting linked documents
- activity feed
- notification channel/type-specific persistence
- extended preference flags

## Notes

- `api.ts` still preserves some read-side DTO richness where it is practical to compute or aggregate values at query time.
- `database-models.md` is no longer the source of truth; it is retained as the broader proposal discussed before the review.
- If the reviewed model changes again, `db.ts` and `api.ts` should be updated together.
