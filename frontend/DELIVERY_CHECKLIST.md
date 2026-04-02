# Frontend Delivery Checklist

Актуально на 2026-04-02.

## Done

- FSD-структура собрана: `app`, `shared`, `entities`, `features`, `widgets`, `pages`.
- Подключён backend base URL через `VITE_API_BASEURL`.
- Подключён bearer JWT transport в HTTP client.
- Реализован backend auth flow:
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/logout`
- Session bootstrap, protected routes и theme bootstrap работают.
- `next-themes` подключён, поддержка темы встроена в shell/settings.
- Backend-first query layer реализован для:
  - `projects`
  - `epochs`
  - `tasks`
  - `documents`
  - `meetings`
  - `releases`
  - `notifications`
  - `settings`
- Backend-first mutation layer реализован для:
  - task status update
  - task comment
  - document create
  - document update
  - document comment
  - document link
  - document review request
  - document approval/review
  - meeting vote
  - meeting publish recap
  - meeting action item -> task
  - meeting summary -> document
  - project create
- Реализованы ключевые product flows:
  - document shortcode preview
  - document -> task quote flow
  - manual document linking
  - document version/review flow
  - meeting action item -> task
  - meeting summary -> document
  - release/PR dashboard projection
  - epoch projection across subsystems
  - unified notifications
- UI shell и основные страницы приведены к актуальному visual foundation.
- На `/projects` и `/docs` больше нет пустых create buttons.
- `npm run check` проходит:
  - `lint`
  - `typecheck`
  - `unit tests`
  - `build`

## Partially Done

- JWT auth работает, но lifecycle неполный:
  - нет `refresh token` flow
  - нет auto-refresh on `401`
- Backend-first архитектура внедрена, но mocks ещё остаются как fallback и местами как source types.
- Основные screens собраны, но не все доведены до production-complete UX.
- Визуальная часть сильно улучшена, но может оставаться неидеальное расхождение с Figma по мелким деталям.

## Remaining Work

### Critical

- Полностью убрать runtime-зависимость от `src/shared/mocks/seamless.ts`.
- Убрать imports mock-типов из entity adapters и queries.
- Перевести оставшиеся write-paths на backend-only или backend-first без бизнес-логики в mocks.
- Убедиться, что все страницы используют реальный `currentProjectId`, а не legacy/default project assumptions.
- Закрыть все пустые/error/loading/populated state branches на каждом page/widget.

### Important

- Добить полный CRUD/manage UX для ключевых доменов:
  - projects
  - tasks
  - documents
  - meetings
  - releases
  - notifications
  - settings
- Перепроверить role-based access rules по `WorkspaceRole` и `DocumentAccessScope`.
- Вынести остатки widget-local shaping в entity adapters/selectors/features.
- Привести все domain adapters к backend DTO + frontend view model без mock-shaped промежуточных типов.
- Добавить unit tests на:
  - backend adapters
  - backend mutation transforms
  - auth/session edge cases
  - release/PR status mapping
  - epoch summary selectors
  - notification filters and transforms

### Nice to Have

- Реализовать `refresh` flow после появления backend endpoint в контракте.
- Добавить code splitting и уменьшить main bundle.
- Довести визуальное соответствие Figma до более точного уровня.
- Очистить остаточные template/placeholder тексты и legacy naming.

## Known Gaps

- В текущем backend contract отсутствует `refresh` endpoint.
- Часть слоёв всё ещё проектировалась с compatibility fallback на mocks.
- Есть предупреждение Vite о большом production chunk.

## Definition of Done

Сервис можно считать завершённым, когда выполнены все условия ниже:

- Нет runtime-использования `shared/mocks` в production flow.
- Все основные queries и mutations работают через backend.
- Auth/session полностью backend-driven.
- Все целевые маршруты работают без заглушек.
- Все ключевые user flows проходят end-to-end:
  - login
  - project creation / selection
  - document creation / editing / review
  - task linking / updates / comments
  - meeting scheduling / recap / action-item flow
  - release and PR visibility
  - notifications
  - settings
- `npm run check` стабильно зелёный.

## Suggested Next Order

1. Удаление runtime mock-dependency из `entities/*`.
2. Финализация backend mutations по оставшимся доменам.
3. Access rules + state branching hardening.
4. Unit-test expansion.
5. JWT refresh integration после появления backend endpoint.
6. Bundle/performance cleanup.
