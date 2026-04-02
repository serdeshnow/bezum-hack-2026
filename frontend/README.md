# Seamless Frontend

Production-oriented frontend workspace for Seamless, implemented inside `/frontend` with FSD architecture.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run generate-api
npm run check
```

## Stack

- React + Vite
- Tailwind + theme variables from `src/shared/styles/theme.css`
- `@tanstack/react-query` for server state
- `zustand` for client/session state
- `next-themes` for `light / dark / system`
- generated transport types from `figma/contracts/openapi.yml`

## Architecture

- `src/app`: providers, router, bootstrap
- `src/shared`: API client, generated contracts, primitives, config
- `src/entities`: domain adapters, queries, mutations, selectors
- `src/features`: user actions and focused interaction flows
- `src/widgets`: composed delivery surfaces
- `src/pages`: route-level entries

## Scope

Implemented routes:

- `/auth/sign-in`
- `/auth/verify`
- `/projects`
- `/projects/:id`
- `/epochs/:epochId`
- `/tasks`
- `/tasks/:taskId`
- `/docs`
- `/docs/:docId`
- `/docs/:docId/history`
- `/meetings`
- `/meetings/:meetingId`
- `/releases`
- `/notifications`
- `/settings`
- `* -> 404`

## Verification

- unit tests only
- no e2e or integration test requirement
- use `npm run check` before handoff to run lint, typecheck, unit tests, and production build
