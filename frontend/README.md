# Frontend Workspace

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run generate-api
```

## Quality

- `eslint` enforces import direction between FSD layers
- `vitest` covers unit and component smoke cases

## Template Defaults

- the default app is a generic shell, not the preserved example business app
- optional reference implementation lives in `src/examples/grass-admin`
- generated DTOs live in `src/examples/grass-admin/api/generated`
- route-level pages stay lazy loaded to reduce initial bundle cost
- auth is disabled by default and should be enabled only when the target project actually needs it
- core shell and shared primitives now prefer Tailwind-first styling; remaining SCSS belongs to the preserved example surface

## Recommended Bootstrap Order

1. rename app metadata in `.env`
2. adjust `src/shared/config/templateConfig.ts`
3. delete or keep `src/examples/grass-admin` depending on whether you want the reference pack
4. replace auth and API contracts before adding new business routes
5. keep `shared/ui` as the only entrypoint for reusable UI
