> Что было - **Как приоритезировать задачи**

Я бы приоритезировал по весу в критериях и по боли заказчика.

1. Docs-Kanban связность.  
    Причина: боль №1 и часть общей интеграции. Нужны документ, версия, статус, линк к задаче, inline-widget статуса задачи, цитирование документа в задаче case.md (line 58).
    
2. Meeting flow из задачи/документа.  
    Причина: боль №2 и отдельные баллы за Kanban-core. Нужны слоты, согласование, запись, транскрипт, summary, обратная привязка case.md (line 82).
    
3. GitHub PR integration.  
    Причина: кейс прямо оценивает автообновление статусов задач из PR case.md (line 197).
    
4. Sprint/Epoch projection across docs and tasks.  
    Причина: это отдельный общий критерий и важный UX-клей case.md (line 207).
    
5. Unified notifications.  
    Причина: это последний слой, который склеивает систему, но без предыдущих интеграций сам по себе ценности не даёт case.md (line 214).
    
> Доступные Экраны в приложении (могут не совпадать)

1. App Shell
    
2. Project Overview
    
3. Epoch Workspace
    
4. Kanban Board
    
5. Task Details
    
6. Docs Hub
    
7. Document Editor
    
8. Document History / Approval
    
9. Meeting Scheduler
    
10. Meeting Recap
    
11. Release / PR Dashboard
    
12. Unified Inbox
    
> Доступные страницы в приложении (могут не совпадать)

**Страницы:**

1. **`/` и `/projects`** - Projects List Page ✅
    
    - Карточки всех проектов
    - Поиск и фильтры
    - Статус, прогресс, команда
2. **`/projects/:id`** - Project Overview Dashboard ✅
    
    - Summary cards (status, epoch, blockers, meetings, releases)
    - Entity graph (docs, tasks, PRs, releases)
    - Activity feed
    - Visibility strip (customer/internal)
    - Quick actions
3. **`/tasks`** - Kanban Board Page ✅
    
    - **@dnd-kit** drag & drop kanban
    - 5 колонок (Backlog, To Do, In Progress, Review, Done)
    - Карточки задач с приоритетами
    - Поиск и фильтры
    - Полностью интерактивно!
4. **`/tasks/:id`** - Task Details Page ✅
    
    - Детальная информация о задаче
    - Комментарии и активность (tabs)
    - Blockers и linked entities
    - Sidebar с полями (status, priority, assignee, dates, tags)
5. **`/docs`** - Docs Hub Page ✅
    
    - Список документов с категориями
    - Tabs: All, Recent, Favorites
    - Статусы (published/draft)
6. **`/docs/:id`** - Document Editor Page ✅
    
    - Rich text editor
    - Toolbar с форматированием
    - Preview и History кнопки
    - Sidebar с outline и info
7. **`/epochs`** - Epoch Workspace Page ✅
    
    - Обзор активного спринта
    - Tabs: Planning, Backlog, Timeline, Retrospective
    - Прогресс и метрики
8. **`/meetings`** - Meeting Scheduler Page ✅
    
    - Upcoming и Past meetings
    - Календарь, время, участники
    - Join meeting button
9. **`/meetings/:id`** - Meeting Recap Page ✅
    
    - Tabs: Notes, Action Items, Recording
    - Список участников
    - Чеклист action items
10. **`/releases`** - Release Dashboard Page ✅
    
    - Tabs: Releases и Pull Requests
    - Статусы деплоев
    - PR статусы (open, reviewing, merged)
    - Commits, changes, авторы
11. **`/notifications`** - Unified Inbox Page ✅
    
    - Tabs: All, Unread, Mentions
    - Группировка нотификаций
    - Mark all as read
12. **`/settings`** - Settings Page ✅
    
    - Tabs: Profile, Notifications, Appearance, Security
    - Формы настроек
    - Theme switcher

> FSD реализация - примеры кода

Описать задачу так, чтобы модель опиралась на пример из examples (для каждого слоя есть свой example)

> Пример запроса для создания экрана (!НЕ использовать для создания логики)

Создай web-app экран app shell / global navigation по ТЗ: платформа для взаимодействия студии разработки и заказчиков, объединяющая Docs-core, Kanban-core, CI/CD-core и сущности Project / Epoch / Task / Meeting / Release.
Ограничения:
- Используй только shadcn-подобные паттерны и компоненты библиотеки.
- Иконки только Lucide (явно указывай названия иконок).
- Все цвета/типографика/радиусы/spacing только через Variables.
- Обязательно поддержка light/dark mode.
- Нужны состояния: loading, empty, error, populated.
- Layout должен быть переносим в Tailwind без кастомной графики.
- Укажи для каждого блока предполагаемый React/shadcn компонент.
Нужно показать:
- sidebar с разделами: Projects, Epochs, Docs, Tasks, Meetings, Releases, Notifications, Settings
- project switcher
- global search / command palette
- role badge (Customer / Developer / Manager)
- контекстные breadcrumbs
- unified inbox entry point
- quick actions: create task, create doc, schedule meeting

> Допустимый стек


- тут есть пересечения из двух проектов (в обоих могут использоваться одинаковые библиотеки. Первый приоритет - `/frontend`)
- Используй только shadcn-подобные паттерны и компоненты библиотеки.

1) `/frontend`
```json
"dependencies": {

"@dnd-kit/core": "^6.3.1",

"@dnd-kit/sortable": "^10.0.0",

"@dnd-kit/utilities": "^3.2.2",

"@tanstack/react-query": "^5.81.5",

"@tanstack/react-query-devtools": "^5.81.5",

"axios": "^1.11.0",

"classnames": "^2.5.1",

"dayjs": "^1.11.13",

"highcharts-react-official": "^3.2.2",

"react": "^19.1.0",

"react-dom": "^19.1.0",

"react-error-boundary": "^6.0.0",

"react-resizable": "^3.0.5",

"react-router": "^7.6.3",

"recharts": "^3.1.0",

"sonner": "^2.0.6",

"swagger-typescript-api": "^13.2.10",

"zod": "^3.25.75",

"zustand": "^5.0.6"

},

"devDependencies": {

"@eslint/js": "^9.25.0",

"@playwright/test": "^1.58.2",

"@tailwindcss/vite": "^4.2.2",

"@testing-library/jest-dom": "^6.9.1",

"@testing-library/react": "^16.3.2",

"@types/js-cookie": "^3.0.6",

"@types/react": "^19.1.2",

"@types/react-dom": "^19.1.2",

"@types/react-resizable": "^3.0.8",

"@vitejs/plugin-react-swc": "^3.9.0",

"eslint": "^9.25.0",

"eslint-plugin-react-hooks": "^5.2.0",

"eslint-plugin-react-refresh": "^0.4.19",

"globals": "^16.0.0",

"jsdom": "^29.0.1",

"lint-staged": "^16.4.0",

"prettier": "3.6.2",

"simple-git-hooks": "^2.13.1",

"tailwindcss": "^4.2.2",

"typescript": "~5.8.3",

"typescript-eslint": "^8.30.1",

"vite": "^6.2.4",

"vite-tsconfig-paths": "^5.1.4",

"vitest": "^4.1.2"

},
```

2) `/figma`
```json
"dependencies": {

"@dnd-kit/core": "^6.3.1",

"@dnd-kit/sortable": "^10.0.0",

"@dnd-kit/utilities": "^3.2.2",

"@emotion/react": "11.14.0",

"@emotion/styled": "11.14.1",

"@mui/icons-material": "7.3.5",

"@mui/material": "7.3.5",

"@popperjs/core": "2.11.8",

"@radix-ui/react-accordion": "1.2.3",

"@radix-ui/react-alert-dialog": "1.1.6",

"@radix-ui/react-aspect-ratio": "1.1.2",

"@radix-ui/react-avatar": "1.1.3",

"@radix-ui/react-checkbox": "1.1.4",

"@radix-ui/react-collapsible": "1.1.3",

"@radix-ui/react-context-menu": "2.2.6",

"@radix-ui/react-dialog": "1.1.6",

"@radix-ui/react-dropdown-menu": "2.1.6",

"@radix-ui/react-hover-card": "1.1.6",

"@radix-ui/react-label": "2.1.2",

"@radix-ui/react-menubar": "1.1.6",

"@radix-ui/react-navigation-menu": "1.2.5",

"@radix-ui/react-popover": "1.1.6",

"@radix-ui/react-progress": "1.1.2",

"@radix-ui/react-radio-group": "1.2.3",

"@radix-ui/react-scroll-area": "1.2.3",

"@radix-ui/react-select": "2.1.6",

"@radix-ui/react-separator": "1.1.2",

"@radix-ui/react-slider": "1.2.3",

"@radix-ui/react-slot": "1.1.2",

"@radix-ui/react-switch": "1.1.3",

"@radix-ui/react-tabs": "1.1.3",

"@radix-ui/react-toggle": "1.1.2",

"@radix-ui/react-toggle-group": "1.1.2",

"@radix-ui/react-tooltip": "1.1.8",

"canvas-confetti": "1.9.4",

"class-variance-authority": "0.7.1",

"clsx": "2.1.1",

"cmdk": "1.1.1",

"date-fns": "3.6.0",

"embla-carousel-react": "8.6.0",

"input-otp": "1.4.2",

"lucide-react": "0.487.0",

"motion": "12.23.24",

"next-themes": "0.4.6",

"react-day-picker": "8.10.1",

"react-dnd": "16.0.1",

"react-dnd-html5-backend": "16.0.1",

"react-hook-form": "7.55.0",

"react-popper": "2.3.0",

"react-resizable-panels": "2.1.7",

"react-responsive-masonry": "2.7.1",

"react-router": "7.13.0",

"react-slick": "0.31.0",

"recharts": "2.15.2",

"sonner": "2.0.3",

"tailwind-merge": "3.2.0",

"tw-animate-css": "1.3.8",

"vaul": "1.1.2"

},

"devDependencies": {

"@tailwindcss/vite": "4.1.12",

"@vitejs/plugin-react": "4.7.0",

"tailwindcss": "4.1.12",

"vite": "6.3.5"

},

"peerDependencies": {

"react": "18.3.1",

"react-dom": "18.3.1"

},

"peerDependenciesMeta": {

"react": {

"optional": true

},

"react-dom": {

"optional": true

}

},
```