# Связи сущностей Seamless

Документ вынесен отдельно, чтобы по нему было легко строить графическую схему.

## Версия для 1 слайда

### Ключевые сущности

- `Users`
- `Projects`
- `Epochs`
- `Tasks`
- `Documents`
- `Meetings`
- `Pull Requests`
- `Releases`
- `Notifications`

### Основной поток

`Users -> Projects -> Epochs -> Tasks -> Pull Requests -> Releases`

### Сквозные связи

- `Tasks <-> Documents`
- `Tasks -> Meetings`
- `Meetings -> Tasks`
- `Meetings -> Documents`
- `Все ключевые сущности -> Notifications`

### Смысл схемы

Seamless объединяет проектную работу в один контур:
- `Projects` и `Epochs` задают бизнес-контекст
- `Tasks` выступают центральной рабочей сущностью
- `Documents` и `Meetings` дают контекст, договоренности и историю решений
- `Pull Requests` и `Releases` связывают задачи с поставкой результата
- `Notifications` собирают все события в единую точку входа

## 1. Главные узлы

- `users`
- `user_preferences`
- `projects`
- `project_members`
- `epochs`
- `goals`
- `tasks`
- `task_comments`
- `task_tags`
- `document_folders`
- `documents`
- `document_versions`
- `document_owners`
- `document_approvers`
- `document_approvals`
- `document_comments`
- `document_links`
- `meetings`
- `meeting_participants`
- `meeting_availability_slots`
- `meeting_availability_votes`
- `meeting_transcript_entries`
- `meeting_decisions`
- `meeting_action_items`
- `meeting_linked_documents`
- `pull_requests`
- `releases`
- `notifications`

## 2. Базовые связи для графа

Формат:
`A --тип связи--> B`

### Identity & Access

- `users --has_one--> user_preferences`
- `users --member_of--> project_members`
- `projects --has_many--> project_members`
- `project_members --belongs_to--> users`
- `project_members --belongs_to--> projects`

### Project Context

- `projects --has_many--> epochs`
- `projects --has_many--> tasks`
- `projects --has_many--> documents`
- `projects --has_many--> meetings`
- `projects --has_many--> releases`
- `projects --has_many--> pull_requests`
- `epochs --belongs_to--> projects`

### Planning

- `epochs --has_many--> goals`
- `epochs --has_many--> tasks`
- `epochs --has_many--> meetings`
- `goals --belongs_to--> epochs`
- `tasks --belongs_to--> epochs`
- `meetings --belongs_to--> epochs`

### Task Layer

- `tasks --belongs_to--> projects`
- `tasks --has_many--> task_comments`
- `tasks --has_many--> task_tags`
- `task_comments --belongs_to--> tasks`
- `task_tags --belongs_to--> tasks`
- `tasks --assigned_to--> users`
- `tasks --reported_by--> users`
- `tasks --may_link_to--> releases`

### Document Layer

- `document_folders --belongs_to--> projects`
- `documents --belongs_to--> projects`
- `documents --belongs_to--> document_folders`
- `documents --has_many--> document_versions`
- `documents --has_many--> document_comments`
- `documents --has_many--> document_links`
- `documents --has_many--> document_owners`
- `documents --has_many--> document_approvers`
- `document_versions --belongs_to--> documents`
- `document_versions --authored_by--> users`
- `document_comments --belongs_to--> documents`
- `document_comments --authored_by--> users`
- `document_owners --belongs_to--> documents`
- `document_owners --belongs_to--> users`
- `document_approvers --belongs_to--> documents`
- `document_approvers --belongs_to--> users`
- `document_approvals --belongs_to--> document_versions`
- `document_approvals --belongs_to--> users`

### Meeting Layer

- `meetings --belongs_to--> projects`
- `meetings --belongs_to--> epochs`
- `meetings --has_many--> meeting_participants`
- `meetings --has_many--> meeting_availability_slots`
- `meetings --has_many--> meeting_transcript_entries`
- `meetings --has_many--> meeting_decisions`
- `meetings --has_many--> meeting_action_items`
- `meetings --has_many--> meeting_linked_documents`
- `meeting_participants --belongs_to--> meetings`
- `meeting_participants --belongs_to--> users`
- `meeting_availability_slots --belongs_to--> meetings`
- `meeting_availability_votes --belongs_to--> meeting_availability_slots`
- `meeting_availability_votes --belongs_to--> users`
- `meeting_transcript_entries --belongs_to--> meetings`
- `meeting_transcript_entries --speaker_is--> users`
- `meeting_decisions --belongs_to--> meetings`
- `meeting_decisions --made_by--> users`
- `meeting_action_items --belongs_to--> meetings`
- `meeting_action_items --assigned_to--> users`
- `meeting_action_items --may_create_or_link--> tasks`
- `meeting_linked_documents --belongs_to--> meetings`
- `meeting_linked_documents --belongs_to--> documents`

### Delivery Layer

- `pull_requests --belongs_to--> projects`
- `pull_requests --may_belong_to--> releases`
- `pull_requests --authored_by--> users`
- `releases --belongs_to--> projects`
- `releases --authored_by--> users`
- `tasks --may_belong_to--> releases`

### Communication Layer

- `notifications --belongs_to--> users`
- `notifications --triggered_by--> users`
- `notifications --references--> tasks`
- `notifications --references--> documents`
- `notifications --references--> meetings`
- `notifications --references--> pull_requests`
- `notifications --references--> releases`

## 3. Сквозные продуктовые связи

Это связи, которые важны именно для UX и межмодульной интеграции.

- `projects --contains--> epochs`
- `epochs --contain--> tasks`
- `epochs --contain--> documents`
- `epochs --contain--> meetings`
- `tasks --link_with--> documents`
- `tasks --spawn--> meetings`
- `meetings --produce--> meeting_decisions`
- `meetings --produce--> meeting_action_items`
- `meeting_action_items --become--> tasks`
- `documents --reference--> tasks`
- `documents --reference--> meetings`
- `documents --reference--> epochs`
- `documents --reference--> releases`
- `tasks --flow_into--> pull_requests`
- `pull_requests --flow_into--> releases`
- `releases --close_delivery_loop_for--> tasks`
- `notifications --aggregate_events_from--> tasks`
- `notifications --aggregate_events_from--> documents`
- `notifications --aggregate_events_from--> meetings`
- `notifications --aggregate_events_from--> pull_requests`
- `notifications --aggregate_events_from--> releases`

## 4. Центральные сущности для визуальной схемы

Если рисовать короткую диаграмму, лучше брать не все таблицы, а только центральные узлы:

- `projects`
- `epochs`
- `tasks`
- `documents`
- `meetings`
- `pull_requests`
- `releases`
- `users`
- `notifications`

Их можно связать так:

- `users <-> projects`
- `projects -> epochs`
- `epochs -> tasks`
- `epochs -> documents`
- `epochs -> meetings`
- `tasks <-> documents`
- `tasks -> meetings`
- `tasks -> pull_requests`
- `pull_requests -> releases`
- `meetings -> tasks`
- `meetings -> documents`
- `documents -> notifications`
- `tasks -> notifications`
- `meetings -> notifications`
- `pull_requests -> notifications`
- `releases -> notifications`

## 5. Готовая цепочка для простой схемы

Самая удобная цепочка для презентационного графа:

`users`
`-> projects`
`-> epochs`
`-> tasks`
`<-> documents`
`-> meetings`
`-> meeting_action_items`
`-> tasks`
`-> pull_requests`
`-> releases`
`-> notifications`

## 6. Готовая цепочка для полной схемы

Если нужна более полная диаграмма:

`users`
`-> project_members`
`-> projects`
`-> epochs`
`-> goals`

`projects`
`-> tasks`
`-> task_comments`
`-> task_tags`

`projects`
`-> document_folders`
`-> documents`
`-> document_versions`
`-> document_approvals`
`-> document_comments`
`-> document_links`

`projects`
`-> meetings`
`-> meeting_participants`
`-> meeting_availability_slots`
`-> meeting_availability_votes`
`-> meeting_transcript_entries`
`-> meeting_decisions`
`-> meeting_action_items`
`-> meeting_linked_documents`

`projects`
`-> pull_requests`
`-> releases`

`users`
`-> notifications`

## 7. Что лучше рисовать на диаграмме

Для графики удобно разделить схему на 5 зон:

- `Identity`: users, project_members, user_preferences
- `Project Context`: projects, epochs, goals
- `Execution`: tasks, documents, meetings
- `Delivery`: pull_requests, releases
- `Communication`: notifications

Тогда граф будет легко читаем:

`Identity -> Project Context -> Execution -> Delivery`

И отдельными поперечными связями:

- `documents <-> tasks`
- `documents <-> meetings`
- `meetings -> tasks`
- `notifications <- все ключевые сущности`
